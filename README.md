# Travora

Travora is a full-stack, multi-agent AI travel planner.

This project is separated into a `frontend` and `backend` architecture.

## Architecture

- **frontend/**: A Next.js application that handles all the UI (Tailwind-like custom CSS, Framer Motion animations) and user interactions.
- **backend/**: A Node.js Express server that manages the Prisma database (SQLite), handles authentication, and runs the LangGraph multi-agent pipeline using Google Gemini and Tavily.

## Prerequisites

Create a `.env` file inside the `backend/` directory with the following variables:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-super-secret-key-change-in-production"
GOOGLE_API_KEY="your_google_api_key_here"
TAVILY_API_KEY="your_tavily_api_key_here"
```

## Running the Application Locally

Open two terminal windows.

### 1. Start the Backend

```bash
cd backend
npm install
npx prisma db push
npm run dev
```

The backend runs on:

```
http://localhost:5000
```

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on:

```
http://localhost:3000
```

## Features

- Multi-Agent Intelligence (Supervisor, Hotel, Flight, Restaurant, Attraction workers)
- Human-in-the-Loop review process for trip generation
- Animated Framer Motion UI
- JWT-based Authentication