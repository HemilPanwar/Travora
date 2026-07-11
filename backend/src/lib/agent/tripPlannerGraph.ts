import { StateGraph, Annotation, END, START } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { searchWithTavily } from "./tools";

// ─── State Definition ────────────────────────────────────────────────────────

export const TripStateAnnotation = Annotation.Root({
  origin: Annotation<string>({ reducer: (_, next) => next }),
  destination: Annotation<string>({ reducer: (_, next) => next }),
  startDate: Annotation<string>({ reducer: (_, next) => next }),
  endDate: Annotation<string>({ reducer: (_, next) => next }),
  budget: Annotation<number>({ reducer: (_, next) => next }),
  currency: Annotation<string>({ reducer: (_, next) => next }),
  preferences: Annotation<string>({ reducer: (_, next) => next }),

  // Worker outputs
  hotelData: Annotation<string>({ reducer: (_, next) => next }),
  flightData: Annotation<string>({ reducer: (_, next) => next }),
  restaurantData: Annotation<string>({ reducer: (_, next) => next }),
  attractionData: Annotation<string>({ reducer: (_, next) => next }),

  // Draft + human feedback
  draftItinerary: Annotation<string>({ reducer: (_, next) => next }),
  humanFeedback: Annotation<string>({ reducer: (_, next) => next }),

  // Tracking
  logs: Annotation<string[]>({
    reducer: (current, next) => [...(current || []), ...next],
    default: () => [],
  }),
  workersCompleted: Annotation<string[]>({
    reducer: (current, next) => [...new Set([...(current || []), ...next])],
    default: () => [],
  }),
  status: Annotation<string>({ reducer: (_, next) => next }),
});

export type TripState = typeof TripStateAnnotation.State;

// ─── LLM (used only by draftAgent) ───────────────────────────────────────────

function getLLM() {
  return new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GOOGLE_API_KEY,
    temperature: 0.7,
  });
}

// ─── Supervisor (deterministic, NO LLM) ──────────────────────────────────────

async function supervisorAgent(state: TripState) {
  const completed = state.workersCompleted || [];
  const allWorkers = ["hotelAgent", "flightAgent", "restaurantAgent", "attractionAgent"];
  const allDone = allWorkers.every((w) => completed.includes(w));

  return {
    logs: [`[Supervisor] Workers completed: ${completed.length}/4. All done: ${allDone}`],
    status: allDone ? "drafting" : "working",
  };
}

// ─── Hotel Agent ─────────────────────────────────────────────────────────────

async function hotelAgent(state: TripState) {
  const query = `Best hotels in ${state.destination} for ${state.budget} ${state.currency} budget ${state.startDate} to ${state.endDate} ${state.preferences}`;
  let data = "";
  try {
    data = await searchWithTavily(query, 4);
  } catch {
    const llm = getLLM();
    const res = await llm.invoke(`Suggest hotels in ${state.destination} with a ${state.budget} ${state.currency} budget. Be concise.`);
    data = res.content as string;
  }
  return {
    hotelData: data,
    workersCompleted: ["hotelAgent"],
    logs: ["[HotelAgent] ✓ Hotel research complete"],
  };
}

// ─── Flight Agent ─────────────────────────────────────────────────────────────

async function flightAgent(state: TripState) {
  const query = `Flights from ${state.origin} to ${state.destination} ${state.startDate} to ${state.endDate} cheapest options ${state.currency}`;
  let data = "";
  try {
    data = await searchWithTavily(query, 4);
  } catch {
    const llm = getLLM();
    const res = await llm.invoke(`Suggest flight options from ${state.origin} to ${state.destination} for travel ${state.startDate} to ${state.endDate}. Be concise.`);
    data = res.content as string;
  }
  return {
    flightData: data,
    workersCompleted: ["flightAgent"],
    logs: ["[FlightAgent] ✓ Flight research complete"],
  };
}

// ─── Restaurant Agent ─────────────────────────────────────────────────────────

async function restaurantAgent(state: TripState) {
  const query = `Best restaurants in ${state.destination} ${state.preferences} local cuisine must try food`;
  let data = "";
  try {
    data = await searchWithTavily(query, 4);
  } catch {
    const llm = getLLM();
    const res = await llm.invoke(`Suggest top restaurants in ${state.destination} for a traveler. Be concise.`);
    data = res.content as string;
  }
  return {
    restaurantData: data,
    workersCompleted: ["restaurantAgent"],
    logs: ["[RestaurantAgent] ✓ Restaurant research complete"],
  };
}

// ─── Attraction Agent ─────────────────────────────────────────────────────────

async function attractionAgent(state: TripState) {
  const query = `Top attractions things to do in ${state.destination} ${state.preferences} tourist spots hidden gems`;
  let data = "";
  try {
    data = await searchWithTavily(query, 4);
  } catch {
    const llm = getLLM();
    const res = await llm.invoke(`List top attractions and things to do in ${state.destination}. Be concise.`);
    data = res.content as string;
  }
  return {
    attractionData: data,
    workersCompleted: ["attractionAgent"],
    logs: ["[AttractionAgent] ✓ Attraction research complete"],
  };
}

// ─── Draft Agent (uses Gemini) ────────────────────────────────────────────────

async function draftAgent(state: TripState) {
  const llm = getLLM();

  const feedbackSection = state.humanFeedback
    ? `\n\nIMPORTANT - The user reviewed the previous draft and gave this feedback: "${state.humanFeedback}". Please incorporate this feedback into the revised itinerary.`
    : "";

  const prompt = `You are an expert travel planner. Based on the research data below, create a detailed day-by-day itinerary for a trip to ${state.destination} from ${state.startDate} to ${state.endDate}.

RESEARCH DATA:
Hotels: ${state.hotelData || "No hotel data available"}
Flights: ${state.flightData || "No flight data available"}
Restaurants: ${state.restaurantData || "No restaurant data available"}
Attractions: ${state.attractionData || "No attraction data available"}

Trip Details:
- Origin: ${state.origin}
- Destination: ${state.destination}
- Budget: ${state.budget} ${state.currency}
- Preferences: ${state.preferences || "None specified"}
${feedbackSection}

You MUST respond with ONLY a valid JSON array (no markdown, no explanation). Each element represents one day:
[
  {
    "day": 1,
    "date": "YYYY-MM-DD",
    "title": "Day title",
    "morning": { "activity": "Activity name", "description": "Details", "estimatedCost": 50, "duration": "2 hours" },
    "afternoon": { "activity": "Activity name", "description": "Details", "estimatedCost": 30, "duration": "3 hours" },
    "evening": { "activity": "Restaurant/activity", "description": "Details", "estimatedCost": 40, "duration": "2 hours" },
    "hotel": "Hotel name and details",
    "totalDayCost": 120,
    "tips": "Local tips for the day"
  }
]

Calculate the total estimated cost and spread activities realistically across the days. Return ONLY the JSON array.`;

  const response = await llm.invoke(prompt);
  let itinerary = response.content as string;

  // Strip markdown code fences if present
  itinerary = itinerary.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  // Validate JSON
  try {
    JSON.parse(itinerary);
  } catch {
    itinerary = "[]";
  }

  return {
    draftItinerary: itinerary,
    logs: ["[DraftAgent] ✓ Itinerary draft generated with Gemini"],
    status: "humanReview",
  };
}

// ─── Routing Logic ────────────────────────────────────────────────────────────

function routeAfterSupervisor(state: TripState): string {
  return state.status === "drafting" ? "draftAgent" : "supervisorAgent";
}

// ─── Build Graph ──────────────────────────────────────────────────────────────

const workflow = new StateGraph(TripStateAnnotation)
  .addNode("supervisorAgent", supervisorAgent)
  .addNode("hotelAgent", hotelAgent)
  .addNode("flightAgent", flightAgent)
  .addNode("restaurantAgent", restaurantAgent)
  .addNode("attractionAgent", attractionAgent)
  .addNode("draftAgent", draftAgent)

  // START → all 4 workers in parallel
  .addEdge(START, "hotelAgent")
  .addEdge(START, "flightAgent")
  .addEdge(START, "restaurantAgent")
  .addEdge(START, "attractionAgent")

  // All workers → supervisor
  .addEdge("hotelAgent", "supervisorAgent")
  .addEdge("flightAgent", "supervisorAgent")
  .addEdge("restaurantAgent", "supervisorAgent")
  .addEdge("attractionAgent", "supervisorAgent")

  // Supervisor routes: if all workers done → draftAgent, else loop back (shouldn't happen with parallel)
  .addConditionalEdges("supervisorAgent", routeAfterSupervisor, {
    draftAgent: "draftAgent",
    supervisorAgent: "supervisorAgent",
  })

  // Draft → END (humanReview checkpoint)
  .addEdge("draftAgent", END);

export const tripPlannerGraph = workflow.compile();
