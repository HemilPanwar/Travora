import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";
import Link from "next/link";
import { Compass } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign In — Travora",
  description: "Sign in to your Travora account to access your personalized travel itineraries.",
};

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--gradient-hero)",
        padding: "2rem 1.5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background orbs */}
      <div
        className="hero-bg-orb hero-orb-1"
        style={{ opacity: 0.25, width: 400, height: 400 }}
      />
      <div
        className="hero-bg-orb hero-orb-2"
        style={{ opacity: 0.2, width: 300, height: 300 }}
      />

      <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontFamily: "var(--font-display)",
              fontSize: "1.5rem",
              fontWeight: 800,
              background: "var(--gradient-text)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "0.5rem",
            }}
          >
            <Compass size={24} style={{ color: "var(--emerald-400)" }} />
            Travora
          </Link>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.6rem",
              fontWeight: 800,
              marginBottom: "0.4rem",
            }}
          >
            Welcome back
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Sign in to your account to continue planning
          </p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: "2rem" }}>
          <AuthForm mode="login" />

          <div className="divider" />

          <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              style={{ color: "var(--emerald-400)", fontWeight: 600 }}
            >
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
