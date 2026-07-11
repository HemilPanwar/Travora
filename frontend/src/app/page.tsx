import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Compass,
  Plane,
  Hotel,
  UtensilsCrossed,
  Camera,
  Zap,
  Shield,
  Globe,
  Star,
  ArrowRight,
  Bot,
  BrainCircuit,
  MapPinned,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Travora — AI-Powered Travel Planner",
  description:
    "Plan your perfect trip with multi-agent AI. Travora researches hotels, flights, restaurants, and attractions simultaneously to craft your ideal itinerary.",
};

const FEATURES = [
  {
    icon: BrainCircuit,
    title: "Multi-Agent Intelligence",
    description:
      "4 specialized AI agents research hotels, flights, restaurants, and attractions simultaneously — cutting planning time from hours to seconds.",
    color: "var(--emerald-400)",
    bg: "rgba(147, 51, 234, 0.1)",
  },
  {
    icon: Bot,
    title: "Human-in-the-Loop",
    description:
      "Review your draft itinerary, provide feedback, and let the AI revise it until it's perfect. You stay in control at every step.",
    color: "var(--emerald-400)",
    bg: "rgba(45, 212, 191, 0.1)",
  },
  {
    icon: Zap,
    title: "Real-Time Research",
    description:
      "Powered by Tavily search AI, your agents browse live web data — not outdated training data — to find the best options right now.",
    color: "var(--emerald-400)",
    bg: "rgba(244, 114, 182, 0.1)",
  },
  {
    icon: Shield,
    title: "Personalized to You",
    description:
      "Tell the AI your interests, budget, and travel style. Get itineraries tailored exactly to your preferences — never generic tourist traps.",
    color: "var(--emerald-400)",
    bg: "rgba(147, 51, 234, 0.1)",
  },
  {
    icon: Globe,
    title: "Any Destination",
    description:
      "From Tokyo to Tuscany, Bali to Buenos Aires — Travora plans trips to any destination in the world.",
    color: "var(--emerald-400)",
    bg: "rgba(45, 212, 191, 0.1)",
  },
  {
    icon: MapPinned,
    title: "Day-by-Day Itineraries",
    description:
      "Get a detailed morning, afternoon, and evening plan for every single day — with time estimates, costs, and insider tips included.",
    color: "var(--emerald-400)",
    bg: "rgba(244, 114, 182, 0.1)",
  },
];

const AGENTS = [
  { icon: Hotel, label: "Hotel Agent", color: "var(--emerald-400)", desc: "Finds best stays in your budget" },
  { icon: Plane, label: "Flight Agent", color: "var(--emerald-400)", desc: "Searches optimal routes & fares" },
  { icon: UtensilsCrossed, label: "Restaurant Agent", color: "var(--emerald-400)", desc: "Discovers local food gems" },
  { icon: Camera, label: "Attraction Agent", color: "var(--emerald-400)", desc: "Uncovers must-see experiences" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Tell us your trip",
    desc: "Enter your origin, destination, dates, budget, and travel preferences in our 3-step wizard.",
  },
  {
    step: "02",
    title: "Agents get to work",
    desc: "4 AI agents research in parallel — hotel, flights, restaurants, and attractions — all at once.",
  },
  {
    step: "03",
    title: "Review & refine",
    desc: "See your draft itinerary. Approve it or give feedback and the AI instantly revises it.",
  },
  {
    step: "04",
    title: "Your trip is ready",
    desc: "Finalized itinerary saved to your dashboard — a complete day-by-day plan with costs and tips.",
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-bg-orb hero-orb-1" />
        <div className="hero-bg-orb hero-orb-2" />
        <div className="hero-bg-orb hero-orb-3" />

        <div className="container">
          <div className="hero-badge">
            <Star size={12} />
            Powered by Gemini 2.5 Flash + Tavily
          </div>

          <h1 className="hero-title">
            Your AI Travel Planner
            <br />
            <span className="gradient-text">That Actually Thinks</span>
          </h1>

          <p className="hero-subtitle">
            Stop spending hours on travel research. Travora deploys a team
            of intelligent agents that research your entire trip simultaneously —
            delivering a personalized, day-by-day itinerary in under a minute.
          </p>

          <div className="hero-cta">
            <Link href="/register" className="btn btn-primary" id="hero-cta-btn" style={{ fontSize: "1rem", padding: "0.875rem 2rem" }}>
              <Compass size={18} />
              Plan My Trip Free
              <ArrowRight size={16} />
            </Link>
            <Link href="/login" className="btn btn-secondary" style={{ fontSize: "1rem" }}>
              Sign In
            </Link>
          </div>

          <div className="hero-features">
            {["No credit card required", "Any destination worldwide", "1 min itinerary generation"].map((f) => (
              <div key={f} className="hero-feature">
                <div className="hero-feature-dot" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Agent showcase ── */}
      <section
        style={{
          padding: "5rem 0",
          background: "var(--bg-secondary)",
          borderTop: "1px solid var(--border-subtle)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div className="badge badge-emerald" style={{ marginBottom: "1rem" }}>
              Multi-Agent Architecture
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.6rem, 4vw, 2.5rem)",
                fontWeight: 800,
                marginBottom: "1rem",
              }}
            >
              4 Agents. One{" "}
              <span className="gradient-text">Perfect Trip.</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", maxWidth: 520, margin: "0 auto" }}>
              A deterministic supervisor orchestrates four specialist agents running
              in parallel — eliminating wait times while maximizing accuracy.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {AGENTS.map((agent) => (
              <div
                key={agent.label}
                className="glass-card"
                style={{
                  padding: "1.75rem 1.5rem",
                  textAlign: "center",
                  background: `linear-gradient(145deg, ${agent.color}08, transparent)`,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "var(--radius-md)",
                    background: `${agent.color}18`,
                    border: `1px solid ${agent.color}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1rem",
                  }}
                >
                  <agent.icon size={22} style={{ color: agent.color }} />
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    marginBottom: "0.4rem",
                  }}
                >
                  {agent.label}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                  {agent.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: "5rem 0", background: "var(--bg-primary)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div className="badge badge-emerald" style={{ marginBottom: "1rem" }}>
              How It Works
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.6rem, 4vw, 2.5rem)",
                fontWeight: 800,
              }}
            >
              From idea to itinerary in{" "}
              <span className="gradient-text">4 simple steps</span>
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {HOW_IT_WORKS.map((item, i) => (
              <div
                key={i}
                className="card"
                style={{ position: "relative", overflow: "hidden" }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-10px",
                    right: "-10px",
                    fontFamily: "var(--font-display)",
                    fontSize: "4rem",
                    fontWeight: 900,
                    color: "rgba(147, 51, 234, 0.06)",
                    lineHeight: 1,
                    pointerEvents: "none",
                  }}
                >
                  {item.step}
                </div>
                <div
                  className="badge badge-emerald"
                  style={{ marginBottom: "1rem", fontSize: "0.7rem" }}
                >
                  Step {item.step}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section
        style={{
          padding: "5rem 0",
          background: "var(--bg-secondary)",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.6rem, 4vw, 2.5rem)",
                fontWeight: 800,
                marginBottom: "1rem",
              }}
            >
              Everything you need to{" "}
              <span className="gradient-text">travel smarter</span>
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="glass-card"
                style={{ padding: "1.75rem" }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "var(--radius-md)",
                    background: f.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <f.icon size={20} style={{ color: f.color }} />
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                  }}
                >
                  {f.title}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section
        style={{
          padding: "5rem 0",
          background: "var(--bg-primary)",
          textAlign: "center",
        }}
      >
        <div className="container" style={{ maxWidth: 680 }}>
          <div
            style={{
              background: "var(--gradient-card)",
              border: "1px solid var(--border-medium)",
              borderRadius: "var(--radius-xl)",
              padding: "3rem 2rem",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "var(--gradient-glow-emerald)",
                opacity: 0.5,
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🌍</div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
                  fontWeight: 900,
                  marginBottom: "1rem",
                }}
              >
                Ready to explore the world{" "}
                <span className="gradient-text">with AI?</span>
              </h2>
              <p
                style={{
                  color: "var(--text-secondary)",
                  marginBottom: "2rem",
                  lineHeight: 1.7,
                }}
              >
                Join thousands of travelers who let Travora do the heavy
                lifting. Free forever. No credit card required.
              </p>
              <Link href="/register" className="btn btn-primary" id="cta-banner-btn" style={{ fontSize: "1rem", padding: "0.875rem 2rem" }}>
                <Compass size={18} />
                Get Started for Free
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: "1px solid var(--border-subtle)",
          padding: "2rem 0",
          background: "var(--bg-secondary)",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              background: "var(--gradient-text)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            <Compass size={16} />
            Travora
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Built with LangGraph + Gemini 2.5 Flash + Tavily
          </p>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <Link href="/login" style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Sign In
            </Link>
            <Link href="/register" style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Register
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
