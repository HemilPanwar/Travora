import Link from "next/link";
import { Sparkles, MapPin, Bot, Clock, Shield, Zap, ArrowRight, Star } from "lucide-react";

const features = [
  {
    icon: <Bot size={24} />,
    title: "Multi-Agent AI",
    description:
      "Four specialized AI agents research hotels, flights, restaurants, and attractions simultaneously — in parallel.",
    color: "var(--color-primary)",
  },
  {
    icon: <Zap size={24} />,
    title: "Instant Itineraries",
    description:
      "Gemini AI synthesizes all research into a detailed day-by-day itinerary in seconds.",
    color: "var(--color-accent)",
  },
  {
    icon: <Shield size={24} />,
    title: "Human-in-the-Loop",
    description:
      "Review and refine your AI-drafted itinerary before finalizing. You're always in control.",
    color: "var(--color-gold)",
  },
  {
    icon: <Clock size={24} />,
    title: "Real-Time Research",
    description:
      "Live web search via Tavily API ensures up-to-date recommendations, not stale data.",
    color: "#a78bfa",
  },
  {
    icon: <MapPin size={24} />,
    title: "Any Destination",
    description:
      "From Tokyo to Patagonia — Travora plans trips to any corner of the world.",
    color: "#34d399",
  },
  {
    icon: <Star size={24} />,
    title: "Budget-Aware",
    description:
      "Set your budget and currency. The AI optimizes recommendations to stay within your range.",
    color: "#f472b6",
  },
];

const steps = [
  { num: "01", title: "Enter Destinations", desc: "Tell us where you're departing from and where you want to go." },
  { num: "02", title: "Set Budget & Dates", desc: "Specify your travel dates and total budget so the AI plans accordingly." },
  { num: "03", title: "Choose Preferences", desc: "Select your travel style — adventure, culture, food, relaxation, and more." },
  { num: "04", title: "Review Your Itinerary", desc: "AI agents do the research. You review the draft and approve or request changes." },
];

export default function HomePage() {
  return (
    <div style={{ background: "var(--bg-base)", minHeight: "100vh" }}>
      {/* Hero */}
      <section
        style={{
          position: "relative",
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          overflow: "hidden",
          padding: "80px 24px",
        }}
      >
        {/* Background glow */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(16, 185, 129, 0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "800px",
            height: "600px",
            background: "radial-gradient(ellipse, rgba(16, 185, 129, 0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", maxWidth: "900px", margin: "0 auto" }}>
          <div
            className="badge badge-primary animate-fadeIn"
            style={{ marginBottom: "28px", display: "inline-flex" }}
          >
            <Sparkles size={12} />
            Powered by Gemini + LangGraph
          </div>

          <h1
            className="animate-fadeInUp"
            style={{ animationDelay: "0.1s", marginBottom: "24px" }}
          >
            Plan Your Dream Trip
            <br />
            <span className="text-gradient">with AI Agents</span>
          </h1>

          <p
            className="animate-fadeInUp"
            style={{
              animationDelay: "0.2s",
              fontSize: "1.2rem",
              maxWidth: "600px",
              margin: "0 auto 44px",
              color: "var(--text-secondary)",
            }}
          >
            Travora&apos;s multi-agent AI simultaneously researches hotels, flights,
            restaurants, and attractions — then generates a personalized itinerary
            tailored to your budget.
          </p>

          <div
            className="animate-fadeInUp"
            style={{
              animationDelay: "0.3s",
              display: "flex",
              gap: "16px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/plan-trip"
              id="cta-plan-trip"
              className="btn btn-primary btn-lg animate-pulse-glow"
            >
              <Sparkles size={18} />
              Start Planning Free
              <ArrowRight size={18} />
            </Link>
            <Link href="/auth/register" className="btn btn-secondary btn-lg">
              Create Account
            </Link>
          </div>

          {/* Stats row */}
          <div
            className="animate-fadeInUp"
            style={{
              animationDelay: "0.4s",
              display: "flex",
              gap: "48px",
              justifyContent: "center",
              marginTop: "64px",
              flexWrap: "wrap",
            }}
          >
            {[
              { value: "4", label: "AI Agents" },
              { value: "1", label: "Gemini Call" },
              { value: "∞", label: "Destinations" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "2.5rem",
                    fontWeight: 800,
                    background: "var(--color-primary)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {s.value}
                </div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" style={{ background: "var(--bg-surface)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <span className="badge badge-cyan" style={{ marginBottom: "16px" }}>Features</span>
            <h2>
              Everything you need to{" "}
              <span className="text-gradient-cyan">travel smarter</span>
            </h2>
          </div>
          <div className="grid-3">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="card animate-fadeInUp"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "var(--radius-md)",
                    background: `${f.color}1a`,
                    border: `1px solid ${f.color}33`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: f.color,
                    marginBottom: "20px",
                  }}
                >
                  {f.icon}
                </div>
                <h3 style={{ fontSize: "1.1rem", marginBottom: "10px" }}>{f.title}</h3>
                <p style={{ fontSize: "0.9rem" }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <span className="badge badge-primary" style={{ marginBottom: "16px" }}>How It Works</span>
            <h2>Four steps to your <span className="text-gradient">perfect trip</span></h2>
          </div>
          <div className="grid-4">
            {steps.map((s, i) => (
              <div key={s.num} className="card" style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "3rem",
                    fontWeight: 900,
                    background: "var(--color-primary)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    marginBottom: "16px",
                    opacity: 0.6 + i * 0.1,
                  }}
                >
                  {s.num}
                </div>
                <h4 style={{ marginBottom: "12px" }}>{s.title}</h4>
                <p style={{ fontSize: "0.88rem" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="section"
        style={{ background: "var(--bg-surface)", textAlign: "center" }}
      >
        <div className="container-sm">
          <h2 style={{ marginBottom: "20px" }}>
            Ready to explore the world?
          </h2>
          <p style={{ marginBottom: "40px", fontSize: "1.1rem" }}>
            Join Travora and let AI handle the research while you focus on the excitement.
          </p>
          <Link href="/auth/register" className="btn btn-primary btn-lg">
            <Sparkles size={18} />
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border-default)",
          padding: "32px 24px",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "0.85rem",
        }}
      >
        <div className="nav-logo" style={{ display: "inline-block", marginBottom: "8px" }}>
          ✈ Travora
        </div>
        <p>
          Powered by Google Gemini · LangGraph · Tavily Search · Next.js · Prisma
        </p>
        <p style={{ marginTop: "4px" }}>© {new Date().getFullYear()} Travora. All rights reserved.</p>
      </footer>
    </div>
  );
}
