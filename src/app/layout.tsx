import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";
import NavBar from "@/components/NavBar";

export const viewport: Viewport = {
  themeColor: "#111827",
};

export const metadata: Metadata = {
  title: "Travora — AI-Powered Travel Planner",
  description:
    "Plan your dream trip with AI. Travora uses multi-agent AI to research hotels, flights, restaurants, and attractions — then drafts a personalized itinerary in seconds.",
  keywords: ["AI travel planner", "trip planning", "AI itinerary", "travel agent", "Travora"],
  openGraph: {
    title: "Travora — AI Travel Planner",
    description: "Plan your dream trip with AI-powered research and personalized itineraries.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <Providers>
          <NavBar />
          <main style={{ paddingTop: "64px" }}>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
