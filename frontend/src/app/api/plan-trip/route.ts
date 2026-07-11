import { tripPlannerGraph } from "@/lib/agent/tripPlannerGraph";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { origin, destination, startDate, endDate, budget, currency, preferences } = body;

    if (!destination || !startDate || !endDate || !budget) {
      return NextResponse.json(
        { error: "Missing required fields: destination, startDate, endDate, budget" },
        { status: 400 }
      );
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (data: Record<string, unknown>) => {
          const msg = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(msg));
        };

        try {
          sendEvent({ type: "log", message: "🚀 Starting Travora agents..." });
          sendEvent({ type: "log", message: `📍 Planning trip to ${destination}` });
          sendEvent({ type: "log", message: "🔍 Dispatching 4 research agents in parallel..." });

          const initialState = {
            origin: origin || "",
            destination,
            startDate,
            endDate,
            budget: parseFloat(budget),
            currency: currency || "USD",
            preferences: preferences || "",
            hotelData: "",
            flightData: "",
            restaurantData: "",
            attractionData: "",
            draftItinerary: "",
            humanFeedback: "",
            logs: [],
            workersCompleted: [],
            status: "working",
          };

          // Stream events from the graph
          const eventStream = tripPlannerGraph.streamEvents(initialState, {
            version: "v2",
          });

          for await (const event of eventStream) {
            if (event.event === "on_chain_start" && event.name !== "LangGraph") {
              sendEvent({ type: "log", message: `⚡ Starting: ${event.name}` });
            }

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
                sendEvent({ type: "log", message: "✅ Draft itinerary ready for review!" });
              }
            }
          }

          sendEvent({ type: "done" });
        } catch (error) {
          console.error("Graph streaming error:", error);
          sendEvent({
            type: "error",
            message: error instanceof Error ? error.message : "Agent pipeline failed",
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
    console.error("Plan trip error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
