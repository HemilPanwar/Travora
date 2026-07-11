import { prisma } from "@/lib/prisma";
import { tripPlannerGraph } from "@/lib/agent/tripPlannerGraph";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const body = await request.json();
    const {
      action,
      feedback,
      itinerary,
      tripData,
    } = body;

    if (action === "approve" && itinerary && tripData) {
      // Save finalized trip to database
      let userId: string | null = null;

      if (session?.user?.email) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
        });
        userId = user?.id || null;
      }

      if (!userId) {
        // Create a guest save record or return the itinerary without saving
        return NextResponse.json({
          success: true,
          message: "Trip approved (not saved - not logged in)",
          itinerary,
        });
      }

      const days = JSON.parse(itinerary);
      const totalCost = days.reduce(
        (sum: number, day: { totalDayCost?: number }) => sum + (day.totalDayCost || 0),
        0
      );

      const trip = await prisma.trip.create({
        data: {
          userId,
          destination: tripData.destination || "",
          origin: tripData.origin || "",
          budget: parseFloat(tripData.budget) || 0,
          currency: tripData.currency || "USD",
          startDate: tripData.startDate || "",
          endDate: tripData.endDate || "",
          preferences: tripData.preferences || "",
          itinerary,
          status: "FINALIZED",
          totalEstimatedCost: totalCost,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Trip finalized and saved!",
        tripId: trip.id,
      });
    }

    if (action === "revise" && feedback && tripData) {
      // Re-run draft agent with human feedback
      const encoder = new TextEncoder();

      const stream = new ReadableStream({
        async start(controller) {
          const sendEvent = (data: Record<string, unknown>) => {
            const msg = `data: ${JSON.stringify(data)}\n\n`;
            controller.enqueue(encoder.encode(msg));
          };

          try {
            sendEvent({ type: "log", message: "🔄 Incorporating your feedback..." });
            sendEvent({ type: "log", message: `💭 Feedback: "${feedback}"` });

            const revisedState = {
              origin: tripData.origin || "",
              destination: tripData.destination || "",
              startDate: tripData.startDate || "",
              endDate: tripData.endDate || "",
              budget: parseFloat(tripData.budget) || 0,
              currency: tripData.currency || "USD",
              preferences: tripData.preferences || "",
              hotelData: tripData.hotelData || "",
              flightData: tripData.flightData || "",
              restaurantData: tripData.restaurantData || "",
              attractionData: tripData.attractionData || "",
              draftItinerary: "",
              humanFeedback: feedback,
              logs: [],
              workersCompleted: ["hotelAgent", "flightAgent", "restaurantAgent", "attractionAgent"],
              status: "drafting",
            };

            const eventStream = tripPlannerGraph.streamEvents(revisedState, {
              version: "v2",
            });

            for await (const event of eventStream) {
              if (event.event === "on_chain_end") {
                const output = event.data?.output;
                if (output?.logs) {
                  for (const log of output.logs) {
                    sendEvent({ type: "log", message: log });
                  }
                }
              }

              if (event.event === "on_chain_end" && event.name === "LangGraph") {
                const finalState = event.data?.output;
                if (finalState?.draftItinerary) {
                  sendEvent({
                    type: "draft",
                    itinerary: finalState.draftItinerary,
                    destination: finalState.destination,
                    startDate: finalState.startDate,
                    endDate: finalState.endDate,
                    budget: finalState.budget,
                    currency: finalState.currency,
                  });
                }
              }
            }

            sendEvent({ type: "done" });
          } catch (error) {
            sendEvent({
              type: "error",
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
    console.error("Resume route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
