import { StateGraph, Annotation, END, START } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { searchWeb } from "./tools";

// ─────────────────────────────────────────────
// Graph State Definition
// ─────────────────────────────────────────────
const TripPlannerState = Annotation.Root({
  origin: Annotation<string>({ reducer: (_, b) => b }),
  destination: Annotation<string>({ reducer: (_, b) => b }),
  startDate: Annotation<string>({ reducer: (_, b) => b }),
  endDate: Annotation<string>({ reducer: (_, b) => b }),
  budget: Annotation<number>({ reducer: (_, b) => b }),
  currency: Annotation<string>({ reducer: (_, b) => b }),
  preferences: Annotation<string[]>({
    reducer: (_, b) => b,
    default: () => [],
  }),
  // Research results from each worker
  hotelData: Annotation<string>({ reducer: (_, b) => b, default: () => "" }),
  flightData: Annotation<string>({ reducer: (_, b) => b, default: () => "" }),
  restaurantData: Annotation<string>({
    reducer: (_, b) => b,
    default: () => "",
  }),
  attractionData: Annotation<string>({
    reducer: (_, b) => b,
    default: () => "",
  }),
  // Tracking which workers have returned
  completedWorkers: Annotation<string[]>({
    reducer: (a, b) => [...new Set([...a, ...b])],
    default: () => [],
  }),
  // Draft itinerary (JSON string)
  draftItinerary: Annotation<string>({
    reducer: (_, b) => b,
    default: () => "",
  }),
  // Human feedback
  humanFeedback: Annotation<string>({
    reducer: (_, b) => b,
    default: () => "",
  }),
  // Status logs for streaming
  logs: Annotation<string[]>({
    reducer: (a, b) => [...a, ...b],
    default: () => [],
  }),
});

export type TripPlannerStateType = typeof TripPlannerState.State;

// ─────────────────────────────────────────────
// LLM (only used in draftAgent as fallback)
// ─────────────────────────────────────────────
function getLLM() {
  return new ChatGoogleGenerativeAI({
    model: "gemini-pro",
    apiKey: process.env.GOOGLE_API_KEY,
    temperature: 0.7,
  });
}

// ─────────────────────────────────────────────
// SUPERVISOR — Pure deterministic, NO LLM call
// Routes workers in parallel, then to draftAgent
// ─────────────────────────────────────────────
function supervisorAgent(
  state: TripPlannerStateType
): { next: string | string[] } {
  const WORKERS = ["hotelAgent", "flightAgent", "restaurantAgent", "attractionAgent"];
  const completed = state.completedWorkers;

  // If no workers have run yet → dispatch all in parallel
  if (completed.length === 0) {
    return { next: WORKERS };
  }

  // If all 4 workers done → move to draftAgent
  if (WORKERS.every((w) => completed.includes(w))) {
    return { next: "draftAgent" };
  }

  // Still waiting for some workers (shouldn't reach here normally)
  return { next: "draftAgent" };
}

// ─────────────────────────────────────────────
// HOTEL AGENT — Tavily-first, Gemini fallback
// ─────────────────────────────────────────────
async function hotelAgent(state: TripPlannerStateType): Promise<Partial<TripPlannerStateType>> {
  const query = `Best hotels in ${state.destination} for ${state.budget} ${state.currency} budget from ${state.startDate} to ${state.endDate}`;
  let data = "";
  try {
    data = await searchWeb(query);
  } catch {
    const llm = getLLM();
    const res = await llm.invoke([
      { role: "user", content: `Suggest 3 hotels in ${state.destination} for a ${state.budget} ${state.currency} budget. Be brief and factual.` },
    ]);
    data = typeof res.content === "string" ? res.content : JSON.stringify(res.content);
  }
  return {
    hotelData: data,
    completedWorkers: ["hotelAgent"],
    logs: [`[Hotel Agent] ✅ Research complete for ${state.destination}`],
  };
}

// ─────────────────────────────────────────────
// FLIGHT AGENT — Tavily-first, Gemini fallback
// ─────────────────────────────────────────────
async function flightAgent(state: TripPlannerStateType): Promise<Partial<TripPlannerStateType>> {
  const query = `Flights from ${state.origin} to ${state.destination} around ${state.startDate} budget ${state.budget} ${state.currency}`;
  let data = "";
  try {
    data = await searchWeb(query);
  } catch {
    const llm = getLLM();
    const res = await llm.invoke([
      { role: "user", content: `Describe typical flight options from ${state.origin} to ${state.destination} around ${state.startDate}. Be brief.` },
    ]);
    data = typeof res.content === "string" ? res.content : JSON.stringify(res.content);
  }
  return {
    flightData: data,
    completedWorkers: ["flightAgent"],
    logs: [`[Flight Agent] ✅ Research complete: ${state.origin} → ${state.destination}`],
  };
}

// ─────────────────────────────────────────────
// RESTAURANT AGENT — Tavily-first, Gemini fallback
// ─────────────────────────────────────────────
async function restaurantAgent(state: TripPlannerStateType): Promise<Partial<TripPlannerStateType>> {
  const prefs = state.preferences.join(", ") || "local cuisine";
  const query = `Best restaurants in ${state.destination} for ${prefs} food`;
  let data = "";
  try {
    data = await searchWeb(query);
  } catch {
    const llm = getLLM();
    const res = await llm.invoke([
      { role: "user", content: `Recommend 5 restaurants in ${state.destination} matching these preferences: ${prefs}. Be brief.` },
    ]);
    data = typeof res.content === "string" ? res.content : JSON.stringify(res.content);
  }
  return {
    restaurantData: data,
    completedWorkers: ["restaurantAgent"],
    logs: [`[Restaurant Agent] ✅ Found dining options in ${state.destination}`],
  };
}

// ─────────────────────────────────────────────
// ATTRACTION AGENT — Tavily-first, Gemini fallback
// ─────────────────────────────────────────────
async function attractionAgent(state: TripPlannerStateType): Promise<Partial<TripPlannerStateType>> {
  const prefs = state.preferences.join(", ") || "sightseeing";
  const query = `Top tourist attractions and activities in ${state.destination} for ${prefs}`;
  let data = "";
  try {
    data = await searchWeb(query);
  } catch {
    const llm = getLLM();
    const res = await llm.invoke([
      { role: "user", content: `List top 5 attractions in ${state.destination} for someone interested in ${prefs}. Be brief.` },
    ]);
    data = typeof res.content === "string" ? res.content : JSON.stringify(res.content);
  }
  return {
    attractionData: data,
    completedWorkers: ["attractionAgent"],
    logs: [`[Attraction Agent] ✅ Found activities in ${state.destination}`],
  };
}

// ─────────────────────────────────────────────
// DRAFT AGENT — Uses Gemini to synthesize JSON
// This is the ONLY node that calls Gemini
// ─────────────────────────────────────────────
async function draftAgent(state: TripPlannerStateType): Promise<Partial<TripPlannerStateType>> {
  const llm = getLLM();

  // Calculate trip duration
  const start = new Date(state.startDate);
  const end = new Date(state.endDate);
  const days = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  );

  const feedbackSection = state.humanFeedback
    ? `\n\nUser Feedback on previous draft (incorporate this):\n${state.humanFeedback}`
    : "";

  const prompt = `You are an expert travel planner. Create a detailed ${days}-day itinerary for a trip to ${state.destination}.

Trip details:
- Origin: ${state.origin}
- Destination: ${state.destination}
- Dates: ${state.startDate} to ${state.endDate} (${days} days)
- Budget: ${state.budget} ${state.currency}
- Preferences: ${state.preferences.join(", ") || "general sightseeing"}

Research data gathered:
FLIGHTS: ${state.flightData.slice(0, 800)}
HOTELS: ${state.hotelData.slice(0, 800)}
RESTAURANTS: ${state.restaurantData.slice(0, 800)}
ATTRACTIONS: ${state.attractionData.slice(0, 800)}
${feedbackSection}

Output ONLY a valid JSON array (no markdown, no extra text) in this exact format:
[
  {
    "day": 1,
    "date": "YYYY-MM-DD",
    "title": "Day title",
    "morning": { "activity": "string", "location": "string", "cost": number, "notes": "string" },
    "afternoon": { "activity": "string", "location": "string", "cost": number, "notes": "string" },
    "evening": { "activity": "string", "location": "string", "cost": number, "notes": "string" },
    "accommodation": { "name": "string", "cost": number },
    "meals": { "breakfast": "string", "lunch": "string", "dinner": "string" },
    "totalDayCost": number,
    "tips": "string"
  }
]`;

  const response = await llm.invoke([{ role: "user", content: prompt }]);
  let raw = typeof response.content === "string" ? response.content : JSON.stringify(response.content);

  // Strip markdown code fences if present
  raw = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  return {
    draftItinerary: raw,
    logs: [
      "[Draft Agent] 🤖 Gemini synthesizing itinerary...",
      "[Draft Agent] ✅ Draft itinerary ready for review",
    ],
  };
}

// ─────────────────────────────────────────────
// Build and compile the graph
// ─────────────────────────────────────────────
const workflow = new StateGraph(TripPlannerState)
  .addNode("supervisorAgent", supervisorAgent)
  .addNode("hotelAgent", hotelAgent)
  .addNode("flightAgent", flightAgent)
  .addNode("restaurantAgent", restaurantAgent)
  .addNode("attractionAgent", attractionAgent)
  .addNode("draftAgent", draftAgent)
  // Edges from START
  .addEdge(START, "supervisorAgent")
  // Supervisor routes workers in parallel
  .addConditionalEdges("supervisorAgent", (state) => {
    const completed = state.completedWorkers;
    const WORKERS = ["hotelAgent", "flightAgent", "restaurantAgent", "attractionAgent"];
    if (completed.length === 0) {
      return WORKERS;
    }
    return "draftAgent";
  })
  // All workers return to supervisor
  .addEdge("hotelAgent", "supervisorAgent")
  .addEdge("flightAgent", "supervisorAgent")
  .addEdge("restaurantAgent", "supervisorAgent")
  .addEdge("attractionAgent", "supervisorAgent")
  // Draft agent goes to human review (END)
  .addEdge("draftAgent", END);

export const tripPlannerGraph = workflow.compile();

export type { TripPlannerStateType as GraphState };
