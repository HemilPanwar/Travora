# Vibe Coding Student Guide: Travora Clone

> [!TIP]
> **Vibe Coding** is the process of generating applications by feeding highly descriptive, explicit prompts to an Agentic AI IDE (like Cursor, Devin, or Antigravity).

This guide is designed to let you completely rebuild this AI Travel Planner from scratch using an Agentic AI IDE, without running into "Quota Exhausted" errors. 

To avoid quota limits, we **batch instructions into 4 large prompts**. Do not trickle instructions line-by-line; give the AI everything it needs in one shot!

---

### Prerequisites
Before you start, make sure you have:
1. `GOOGLE_API_KEY` (Get from Google AI Studio)
2. `TAVILY_API_KEY` (Get from Tavily)
3. A blank directory open in your AI IDE.

> [!NOTE]
> Feel free to change the **Project Name** and **Color Scheme** (e.g., from "Travora" to "TripGuru", and from Blue/Orange gradients to Purple/Pink) before running these prompts.

---

### Prompt 1: Initial Setup & Database
*Copy and paste this exact prompt into your AI IDE to set up the foundation.*

```text
Create a new Next.js 16 app with the App Router using `npx create-next-app@latest . --typescript --eslint --app --src-dir --no-tailwind --import-alias "@/*"`. Wait for it to finish.
Then, install these exact dependencies: 
`npm i @prisma/client next-auth bcryptjs lucide-react framer-motion @langchain/langgraph @langchain/google-genai @langchain/tavily @langchain/core uuid zod`
`npm i -D prisma typescript @types/node @types/react @types/bcryptjs @types/uuid`

After installing, initialize Prisma with SQLite.
Create a `schema.prisma` that contains:
- `User` model (id, name, email, password, createdAt)
- `Trip` model (id, userId, destination, budget, currency, startDate, endDate, preferences, itinerary, status ('DRAFT' | 'FINALIZED'), totalEstimatedCost)
- Link `User` and `Trip` with a one-to-many relationship.
Run `npx prisma db push` to generate the SQLite database locally.

Next, replace the global CSS (`src/app/globals.css`) with a bespoke premium dark-mode theme. Use a custom color scheme (e.g., purple and teal gradients instead of standard blue). Avoid Tailwind.
Set up a `src/lib/prisma.ts` singleton and basic NextAuth setup using Credentials in `src/app/api/auth/[...nextauth]/route.ts`.
Do NOT run the dev server yet.
```

---

### Prompt 2: Core LangGraph Agent Architecture
*This prompt establishes the intelligent backend. It specifically tells the AI to optimize routing so it doesn't burn through your free API limits.*

```text
Create a multi-agent system using LangGraph in `src/lib/agent/tripPlannerGraph.ts`.
Create 4 worker agents (hotelAgent, flightAgent, restaurantAgent, attractionAgent) and 1 draftAgent.
To prevent Gemini API rate limits (429 Too Many Requests), follow this EXACT optimization:
1. The `supervisorAgent` MUST NOT USE AN LLM. It must be a simple deterministic function that checks the graph state.
2. The `supervisorAgent` must route to the 4 worker agents IN PARALLEL by returning an array of their node names.
3. The 4 worker agents must use the Tavily Search API. ONLY fall back to Gemini if the Tavily search fails.
4. Once all 4 workers return to the supervisor, route to `draftAgent`. 
5. `draftAgent` takes all the gathered text and uses Gemini (`@langchain/google-genai` gemini-2.5-flash) to output a strict JSON array representing a multi-day itinerary.
6. The graph should pause at an END node named `humanReview` so the user can see the draft and provide feedback.
Export the compiled graph and create a helper file `src/lib/agent/tools.ts` for the Tavily integration.
```

---

### Prompt 3: The API Routes & State Management
*This connects the frontend to the intelligent backend.*

```text
Create two API endpoints for the trip planner:
1. `src/app/api/plan-trip/route.ts` (POST): Accepts origin, destination, dates, budget, and preferences. It initializes the LangGraph state and streams the server-sent events (SSE) back to the client as the agents work. When the graph pauses for `humanReview`, send the draft itinerary to the client.
2. `src/app/api/plan-trip/resume/route.ts` (POST): Accepts the thread ID, the draft, and user feedback. If the user approves, save the trip to the Prisma SQLite database and mark it 'FINALIZED'. If the user rejects, update the graph state with `humanFeedback` and resume the graph so the draftAgent rewrites the itinerary.

Ensure all API routes strictly follow Next.js App Router conventions and handle errors gracefully.
```

---

### Prompt 4: The Frontend UI
*This prompt tells the AI to build out the stunning, responsive UI components.*

```text
Finally, build the frontend UI components:
1. `src/components/ThinkingAgentUI.tsx`: An animated terminal-like UI that reads the SSE stream from `/api/plan-trip` and displays live logs of what the AI agents are researching. It must also contain a "Draft Summary" section and a feedback input box for the Human-In-The-Loop review step.
2. `src/app/plan-trip/page.tsx`: A premium 3-step wizard (Locations -> Budget/Dates -> Preferences) that gathers data from the user and triggers the `ThinkingAgentUI`.
3. `src/app/dashboard/page.tsx`: A sleek dashboard fetching the user's finalized trips from Prisma.
4. `src/components/Timeline.tsx`: A beautiful vertical timeline component that renders the saved `IDay[]` JSON itinerary with Framer Motion animations.

Once this is complete, start the dev server using `npm run dev`. DO NOT USE ANY PLACEHOLDER TEXT. Ensure the design feels highly premium, responsive, and matches the custom CSS colors initialized earlier.
```

> [!CAUTION]
> **API Rate Limits:** If you use the free tier of Gemini, you are strictly limited to **5 requests per minute**. Because Prompt 2 forces the supervisor to route deterministically and workers to use Tavily, the entire flow should only cost **1 request per trip**. If you test too quickly, or if your Tavily key is broken, you will hit the rate limit!
