import { NextRequest, NextResponse } from "next/server";
import { tripPlannerGraph } from "@/lib/agent/tripPlannerGraph";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    console.log("Raw body received:", rawBody);
    const body = rawBody ? JSON.parse(rawBody) : {};
    const { origin, destination, startDate, endDate, budget, currency, preferences } = body;

    if (!origin || !destination || !startDate || !endDate || !budget) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Set up SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (type: string, data: unknown) => {
          const payload = `data: ${JSON.stringify({ type, ...( typeof data === 'object' ? data : { message: data }) })}\n\n`;
          controller.enqueue(encoder.encode(payload));
        };

        try {
          sendEvent("log", { message: "🚀 Travora AI is starting your trip planning..." });
          sendEvent("log", { message: `📍 Planning trip from ${origin} to ${destination}` });
          sendEvent("log", { message: `📅 Dates: ${startDate} → ${endDate} | Budget: ${budget} ${currency}` });
          sendEvent("log", { message: "🔍 Dispatching research agents in parallel..." });

          // Run the graph
          const result = await tripPlannerGraph.invoke({
            origin,
            destination,
            startDate,
            endDate,
            budget: Number(budget),
            currency: currency || "USD",
            preferences: preferences || [],
            completedWorkers: [],
            logs: [],
            hotelData: "",
            flightData: "",
            restaurantData: "",
            attractionData: "",
            draftItinerary: "",
            humanFeedback: "",
          });

          // Stream logs from the graph result
          if (result.logs && Array.isArray(result.logs)) {
            for (const log of result.logs) {
              sendEvent("log", { message: log });
              // Small delay for visual effect
              await new Promise(r => setTimeout(r, 100));
            }
          }

          sendEvent("log", { message: "✨ All agents complete. Draft ready for your review!" });

          // Parse the draft itinerary
          let parsedItinerary = [];
          try {
            parsedItinerary = JSON.parse(result.draftItinerary || "[]");
          } catch {
            sendEvent("log", { message: "⚠️ Draft parsing issue — sending raw data" });
          }

          // Calculate total cost
          const totalCost = Array.isArray(parsedItinerary)
            ? parsedItinerary.reduce((sum: number, day: { totalDayCost?: number }) => sum + (day.totalDayCost || 0), 0)
            : 0;

          // Send the draft for human review
          sendEvent("draft", {
            itinerary: parsedItinerary,
            rawDraft: result.draftItinerary,
            totalEstimatedCost: totalCost,
            tripDetails: { origin, destination, startDate, endDate, budget, currency, preferences },
          });

          sendEvent("complete", { message: "Planning complete" });
        } catch (error) {
          console.error("[plan-trip] Graph error:", error);
          sendEvent("error", {
            message: error instanceof Error ? error.message : "Planning failed",
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
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("[plan-trip] Request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
