import { Router } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../index";
import { tripPlannerGraph } from "../lib/agent/tripPlannerGraph";

const router = Router();
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "travora-super-secret-key-change-in-production";

// Middleware to verify JWT
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return next(); // Some routes allow guest
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    next();
  }
};

const requireAuth = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ error: "Invalid token" });
  }
};

router.get("/", requireAuth, async (req: any, res: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.user.email },
      include: {
        trips: {
          where: { status: "FINALIZED" },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ trips: user.trips });
  } catch (error) {
    console.error("Dashboard trips error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/plan", async (req: any, res: any) => {
  try {
    const { origin, destination, startDate, endDate, budget, currency, preferences } = req.body;

    if (!destination || !startDate || !endDate || !budget) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const sendEvent = (data: Record<string, unknown>) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

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
    res.end();
  } catch (error) {
    console.error("Plan trip error:", error);
    res.write(`data: ${JSON.stringify({ type: "error", message: "Pipeline failed" })}\n\n`);
    res.end();
  }
});

router.post("/resume", authenticate, async (req: any, res: any) => {
  try {
    const { action, feedback, itinerary, tripData } = req.body;

    if (action === "approve" && itinerary && tripData) {
      if (!req.user?.id) {
        return res.json({
          success: true,
          message: "Trip approved (not saved - not logged in)",
          itinerary,
        });
      }

      const days = JSON.parse(itinerary);
      const totalCost = days.reduce((sum: number, day: any) => sum + (day.totalDayCost || 0), 0);

      const trip = await prisma.trip.create({
        data: {
          userId: req.user.id,
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

      return res.json({ success: true, message: "Trip finalized and saved!", tripId: trip.id });
    }

    if (action === "revise" && feedback && tripData) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      const sendEvent = (data: Record<string, unknown>) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      };

      sendEvent({ type: "log", message: "🔄 Incorporating your feedback..." });
      sendEvent({ type: "log", message: `💭 Feedback: "${feedback}"` });

      const revisedState = {
        ...tripData,
        draftItinerary: "",
        humanFeedback: feedback,
        logs: [],
        workersCompleted: ["hotelAgent", "flightAgent", "restaurantAgent", "attractionAgent"],
        status: "drafting",
      };

      const eventStream = tripPlannerGraph.streamEvents(revisedState, { version: "v2" });

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
      return res.end();
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (error) {
    console.error("Resume error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
