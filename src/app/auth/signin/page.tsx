"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, LogIn } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        background: "var(--bg-base)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "500px",
          background: "radial-gradient(ellipse, rgba(16, 185, 129, 0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="card animate-fadeInUp"
        style={{ width: "100%", maxWidth: "460px", position: "relative" }}
      >
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div className="nav-logo" style={{ fontSize: "1.8rem", marginBottom: "8px" }}>
            ✈ Travora
          </div>
          <h1 style={{ fontSize: "1.6rem", marginBottom: "8px" }}>Welcome back</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Sign in to access your trips
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: "var(--radius-md)",
              padding: "12px 16px",
              marginBottom: "20px",
              color: "#f87171",
              fontSize: "0.9rem",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="form-group">
            <label className="form-label" htmlFor="signin-email">
              <Mail size={13} style={{ display: "inline", marginRight: 4 }} />
              Email Address
            </label>
            <input
              id="signin-email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signin-password">
              <Lock size={13} style={{ display: "inline", marginRight: 4 }} />
              Password
            </label>
            <input
              id="signin-password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            id="signin-submit"
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
            style={{ marginTop: "8px" }}
          >
            {loading ? (
              <><div className="spinner" />Signing in...</>
            ) : (
              <><LogIn size={17} />Sign In</>
            )}
          </button>
        </form>

        <div className="divider" />

        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" style={{ fontWeight: 600 }}>
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
