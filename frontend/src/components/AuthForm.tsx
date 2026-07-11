"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, User, Loader, Eye, EyeOff } from "lucide-react";

interface AuthFormProps {
  mode: "login" | "register";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Registration failed");
          setLoading(false);
          return;
        }
        // Auto sign in after registration
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        if (result?.error) {
          setError("Registration succeeded but login failed. Please log in.");
          setLoading(false);
          return;
        }
        router.push("/dashboard");
      } else {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        if (result?.error) {
          setError("Invalid email or password");
          setLoading(false);
          return;
        }
        router.push("/dashboard");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {mode === "register" && (
        <div className="form-group">
          <label htmlFor="auth-name">
            <User size={13} style={{ display: "inline", marginRight: "0.35rem" }} />
            Full Name
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="auth-name"
              type="text"
              placeholder="Jane Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ paddingLeft: "2.75rem" }}
            />
            <User
              size={15}
              style={{
                position: "absolute",
                left: "0.9rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
          </div>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="auth-email">
          <Mail size={13} style={{ display: "inline", marginRight: "0.35rem" }} />
          Email Address
        </label>
        <div style={{ position: "relative" }}>
          <input
            id="auth-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ paddingLeft: "2.75rem" }}
          />
          <Mail
            size={15}
            style={{
              position: "absolute",
              left: "0.9rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="auth-password">
          <Lock size={13} style={{ display: "inline", marginRight: "0.35rem" }} />
          Password
        </label>
        <div style={{ position: "relative" }}>
          <input
            id="auth-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
          />
          <Lock
            size={15}
            style={{
              position: "absolute",
              left: "0.9rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "0.9rem",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
            }}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: "0.75rem 1rem",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "var(--radius-md)",
            color: "#f87171",
            fontSize: "0.875rem",
          }}
        >
          {error}
        </motion.div>
      )}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading}
        id="auth-submit-btn"
        style={{ width: "100%", justifyContent: "center", marginTop: "0.25rem" }}
      >
        {loading ? (
          <>
            <div className="spinner" />
            {mode === "login" ? "Signing in..." : "Creating account..."}
          </>
        ) : mode === "login" ? (
          "Sign In"
        ) : (
          "Create Account"
        )}
      </button>
    </form>
  );
}
