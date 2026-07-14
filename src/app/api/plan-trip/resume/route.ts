import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { tripPlannerGraph } from "@/lib/agent/tripPlannerGraph";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

interface ResumeBody {
  action: "approve" | "reject";
  itinerary: unknown[];
  rawDraft: string;
  humanFeedback?: string;
  totalEstimatedCost: number;
  tripDetails: {
    origin: string;
    destination: string;
    startDate: string;
    endDate: string;
    budget: number;
    currency: string;
    preferences: string[];
  };
  // For re-run
  hotelData?: string;
  flightData?: string;
  restaurantData?: string;
  attractionData?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: ResumeBody = await request.json();
    const { action, itinerary, rawDraft, humanFeedback, totalEstimatedCost, tripDetails } = body;

    if (action === "approve") {
      // Save the finalized trip to the database
      const userId = (session.user as { id?: string }).id;
      if (!userId) {
        return NextResponse.json({ error: "User ID not found" }, { status: 400 });
      }

      const trip = await prisma.trip.create({
        data: {
          userId,
          origin: tripDetails.origin,
          destination: tripDetails.destination,
          budget: tripDetails.budget,
          currency: tripDetails.currency,
          startDate: tripDetails.startDate,
          endDate: tripDetails.endDate,
          preferences: JSON.stringify(tripDetails.preferences),
          itinerary: rawDraft || JSON.stringify(itinerary),
          status: "FINALIZED",
          totalEstimatedCost,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Trip saved successfully!",
        tripId: trip.id,
      });
    }

    if (action === "reject") {
      // Re-run the draftAgent with the user's feedback
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const sendEvent = (type: string, data: unknown) => {
            const payload = `data: ${JSON.stringify({ type, ...(typeof data === 'object' ? data : { message: data }) })}\n\n`;
            controller.enqueue(encoder.encode(payload));
          };

          try {
            sendEvent("log", { message: "🔄 Revising itinerary based on your feedback..." });

            const result = await tripPlannerGraph.invoke({
              origin: tripDetails.origin,
              destination: tripDetails.destination,
              startDate: tripDetails.startDate,
              endDate: tripDetails.endDate,
              budget: tripDetails.budget,
              currency: tripDetails.currency,
              preferences: tripDetails.preferences,
              completedWorkers: ["hotelAgent", "flightAgent", "restaurantAgent", "attractionAgent"],
              logs: [],
              hotelData: body.hotelData || "",
              flightData: body.flightData || "",
              restaurantData: body.restaurantData || "",
              attractionData: body.attractionData || "",
              draftItinerary: "",
              humanFeedback: humanFeedback || "",
            });

            if (result.logs && Array.isArray(result.logs)) {
              for (const log of result.logs) {
                sendEvent("log", { message: log });
                await new Promise(r => setTimeout(r, 80));
              }
            }

            let parsedItinerary = [];
            try {
              parsedItinerary = JSON.parse(result.draftItinerary || "[]");
            } catch {
              // use empty
            }

            const totalCost = Array.isArray(parsedItinerary)
              ? parsedItinerary.reduce((sum: number, day: { totalDayCost?: number }) => sum + (day.totalDayCost || 0), 0)
              : 0;

            sendEvent("draft", {
              itinerary: parsedItinerary,
              rawDraft: result.draftItinerary,
              totalEstimatedCost: totalCost,
              tripDetails,
            });

            sendEvent("complete", { message: "Revision complete" });
          } catch (error) {
            console.error("[resume] Revision error:", error);
            sendEvent("error", {
              message: error instanceof Error ? error.message : "Revision failed",
            });
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[resume] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
