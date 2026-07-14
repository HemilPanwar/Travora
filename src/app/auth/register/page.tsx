"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { User, Mail, Lock, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      // Auto-sign in
      await signIn("credentials", { email, password, redirect: false });
      router.push("/plan-trip");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
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
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "500px",
          background: "radial-gradient(ellipse, rgba(16, 185, 129, 0.1) 0%, transparent 70%)",
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
          <h1 style={{ fontSize: "1.6rem", marginBottom: "8px" }}>Create your account</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Free forever. Start planning in minutes.
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
            <label className="form-label" htmlFor="reg-name">
              <User size={13} style={{ display: "inline", marginRight: 4 }} />
              Full Name
            </label>
            <input
              id="reg-name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              required
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">
              <Mail size={13} style={{ display: "inline", marginRight: 4 }} />
              Email Address
            </label>
            <input
              id="reg-email"
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
            <label className="form-label" htmlFor="reg-password">
              <Lock size={13} style={{ display: "inline", marginRight: 4 }} />
              Password
            </label>
            <input
              id="reg-password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <button
            id="register-submit"
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
            style={{ marginTop: "8px" }}
          >
            {loading ? (
              <><div className="spinner" />Creating account...</>
            ) : (
              <><UserPlus size={17} />Create Account</>
            )}
          </button>
        </form>

        <div className="divider" />

        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Already have an account?{" "}
          <Link href="/auth/signin" style={{ fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
