# Travora — AI-Powered Travel Planner

Travora is a full-stack, multi-agent AI travel planner built with Next.js. It leverages LangGraph and Google Gemini to automatically research hotels, flights, restaurants, and attractions, generating a personalized itinerary for your next trip.

## Features

- **Multi-Agent Intelligence**: Utilizes LangGraph to dispatch specialized AI agents (Hotel, Flight, Restaurant, Attraction workers) to research your trip.
- **Premium Minimalist UI**: A clean, elegant dark-mode UI with an emerald accent, built using custom CSS and Framer Motion for smooth animations.
- **Server-Sent Events (SSE)**: Real-time streaming of the AI's thought process and trip drafting directly to the frontend.
- **Authentication**: Secure user authentication using NextAuth.
- **Database**: Prisma ORM with SQLite for storing user sessions, trips, and itineraries.

## Tech Stack

- **Framework**: Next.js (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Vanilla CSS (CSS Variables, Flexbox/Grid)
- **Database**: Prisma ORM & SQLite
- **Auth**: NextAuth.js
- **AI / Agents**: `@langchain/google-genai`, `@langchain/langgraph`, `@langchain/tavily`
- **Animations**: Framer Motion

## Prerequisites

Before starting, make sure you have your API keys ready. Create a `.env.local` file in the root directory (`travora-app/`) with the following variables:

```env
# ---- Database (Prisma SQLite) ----
DATABASE_URL="file:./dev.db"

# ---- Google Gemini API (get from https://aistudio.google.com) ----
GOOGLE_API_KEY="your_google_api_key_here"

# ---- Tavily Search API (get from https://tavily.com) ----
TAVILY_API_KEY="your_tavily_api_key_here"

# ---- NextAuth ----
# Generate a secret: openssl rand -base64 32
NEXTAUTH_SECRET="your-super-secret-nextauth-key-change-this"
NEXTAUTH_URL="http://localhost:3000"
```

## Running the Application Locally

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Initialize the Database**
   Generate the Prisma client and push the schema to your SQLite database.
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Start the Development Server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000` (or `3001` if port 3000 is occupied).

## Project Structure

- **`src/app/`**: Next.js App Router pages, layouts, and API routes (`/api/plan-trip`).
- **`src/components/`**: Reusable React components (`NavBar`, `Timeline`, `ThinkingAgentUI`, etc.).
- **`src/lib/`**: Core application logic, including the LangGraph AI agents (`lib/agent/tripPlannerGraph.ts`).
- **`src/types/`**: TypeScript interfaces and type definitions.
- **`prisma/`**: Prisma schema and SQLite database file.
- **`public/`**: Static assets.