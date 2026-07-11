import type { Metadata } from "next";
import "./globals.css";
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper";

export const metadata: Metadata = {
  title: "Travora — AI-Powered Travel Planner",
  description:
    "Plan your perfect trip with the power of AI. Travora uses multi-agent intelligence to craft personalized travel itineraries in seconds.",
  keywords: ["travel planner", "AI", "itinerary", "trip planning", "LangGraph"],
  openGraph: {
    title: "Travora",
    description: "AI-Powered Travel Planning",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}
