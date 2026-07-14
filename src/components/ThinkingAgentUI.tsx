"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  CheckCircle,
  XCircle,
  RefreshCcw,
  Loader2,
  ThumbsUp,
  Calendar,
  MapPin,
  DollarSign,
} from "lucide-react";
import Timeline from "./Timeline";

import { TripDetails } from "@/types";

interface DayItinerary {
  day: number;
  date: string;
  title: string;
  morning: { activity: string; location: string; cost: number; notes: string };
  afternoon: { activity: string; location: string; cost: number; notes: string };
  evening: { activity: string; location: string; cost: number; notes: string };
  accommodation: { name: string; cost: number };
  meals: { breakfast: string; lunch: string; dinner: string };
  totalDayCost: number;
  tips: string;
}

interface ThinkingAgentUIProps {
  tripDetails: TripDetails;
  onReset: () => void;
}

type Phase = "planning" | "review" | "approved" | "error";

export default function ThinkingAgentUI({ tripDetails, onReset }: ThinkingAgentUIProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>("planning");
  const [itinerary, setItinerary] = useState<DayItinerary[]>([]);
  const [rawDraft, setRawDraft] = useState("");
  const [totalCost, setTotalCost] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submittingAction, setSubmittingAction] = useState<"approve" | "reject" | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const logsEndRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Start SSE stream on mount
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const controller = new AbortController();

    async function startPlanning() {
      try {
        console.log("Sending tripDetails:", tripDetails);
        const requestBody = JSON.stringify(tripDetails);
        console.log("Stringified body:", requestBody);
        
        const response = await fetch("/api/plan-trip", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: requestBody,
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          const err = await response.json().catch(() => ({}));
          setErrorMsg((err as { error?: string }).error || "Failed to start planning");
          setPhase("error");
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "log") {
                setLogs((prev) => [...prev, data.message]);
              } else if (data.type === "draft") {
                setItinerary(data.itinerary || []);
                setRawDraft(data.rawDraft || "");
                setTotalCost(data.totalEstimatedCost || 0);
                setPhase("review");
              } else if (data.type === "error") {
                setErrorMsg(data.message || "An error occurred");
                setPhase("error");
              }
            } catch {
              // skip malformed events
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setErrorMsg("Connection failed");
          setPhase("error");
        }
      }
    }

    startPlanning();
    return () => controller.abort();
  }, [tripDetails]);

  async function handleApprove() {
    setSubmittingAction("approve");
    try {
      const res = await fetch("/api/plan-trip/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          itinerary,
          rawDraft,
          totalEstimatedCost: totalCost,
          tripDetails,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPhase("approved");
      } else {
        setErrorMsg((data as { error?: string }).error || "Failed to save trip");
        setPhase("error");
      }
    } catch {
      setErrorMsg("Network error while saving");
      setPhase("error");
    } finally {
      setSubmittingAction(null);
    }
  }

  async function handleReject() {
    if (!feedback.trim()) return;
    setSubmittingAction("reject");
    setPhase("planning");
    setLogs([]);
    setItinerary([]);

    try {
      const response = await fetch("/api/plan-trip/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          itinerary,
          rawDraft,
          humanFeedback: feedback,
          totalEstimatedCost: totalCost,
          tripDetails,
        }),
      });

      if (!response.body) throw new Error("No body");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n\n");
        buf = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "log") setLogs((prev) => [...prev, data.message]);
            else if (data.type === "draft") {
              setItinerary(data.itinerary || []);
              setRawDraft(data.rawDraft || "");
              setTotalCost(data.totalEstimatedCost || 0);
              setPhase("review");
              setFeedback("");
            } else if (data.type === "error") {
              setErrorMsg(data.message);
              setPhase("error");
            }
          } catch { /* skip */ }
        }
      }
    } catch {
      setErrorMsg("Revision failed");
      setPhase("error");
    } finally {
      setSubmittingAction(null);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Terminal Log Panel */}
      <AnimatePresence>
        {(phase === "planning" || logs.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "#0d0d14",
              border: "1px solid rgba(124,58,237,0.25)",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
            }}
          >
            {/* Terminal header */}
            <div
              style={{
                background: "#161622",
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                borderBottom: "1px solid rgba(124,58,237,0.15)",
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
              <div style={{ marginLeft: 12, display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: "0.8rem" }}>
                <Terminal size={13} />
                travora-agent — live research
              </div>
              {phase === "planning" && (
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, color: "var(--color-primary-light)", fontSize: "0.78rem" }}>
                  <Loader2 size={13} className="spinner" style={{ animation: "spin 0.7s linear infinite" }} />
                  running
                </div>
              )}
              {phase !== "planning" && (
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, color: "#28c840", fontSize: "0.78rem" }}>
                  <CheckCircle size={13} />
                  complete
                </div>
              )}
            </div>

            {/* Log output */}
            <div
              style={{
                padding: "16px",
                fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
                fontSize: "0.82rem",
                lineHeight: 1.8,
                minHeight: "180px",
                maxHeight: "320px",
                overflowY: "auto",
                color: "#c4c4e0",
              }}
            >
              <AnimatePresence>
                {logs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      display: "flex",
                      gap: "10px",
                      padding: "2px 0",
                    }}
                  >
                    <span style={{ color: "var(--color-primary-light)", opacity: 0.5, flexShrink: 0 }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{log}</span>
                  </motion.div>
                ))}
              </AnimatePresence>

              {phase === "planning" && (
                <motion.div
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  style={{ display: "inline-block", width: 8, height: 16, background: "var(--color-primary-light)", marginTop: 2, borderRadius: 1 }}
                />
              )}

              <div ref={logsEndRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Draft Review Section */}
      <AnimatePresence>
        {phase === "review" && itinerary.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            {/* Summary card */}
            <div className="card" style={{ background: "rgba(16, 185, 129, 0.08)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
                <div>
                  <h3 style={{ marginBottom: 8 }}>
                    ✨ Draft Itinerary Ready
                  </h3>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <span className="badge badge-primary">
                      <MapPin size={11} />
                      {tripDetails.destination}
                    </span>
                    <span className="badge badge-cyan">
                      <Calendar size={11} />
                      {tripDetails.startDate} → {tripDetails.endDate}
                    </span>
                    <span className="badge badge-gold">
                      <DollarSign size={11} />
                      ~{totalCost.toLocaleString()} {tripDetails.currency} est.
                    </span>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: "0.9rem", marginBottom: 0 }}>
                Review your AI-drafted itinerary below. Approve it to save to your dashboard, or provide feedback to refine it.
              </p>
            </div>

            {/* Timeline */}
            <Timeline days={itinerary} />

            {/* Human-in-the-Loop feedback */}
            <div className="card" style={{ borderColor: "var(--border-glow)" }}>
              <h4 style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                🧑‍✈️ Your Review
              </h4>

              <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                <button
                  id="approve-trip"
                  onClick={handleApprove}
                  className="btn btn-primary"
                  disabled={submittingAction !== null}
                  style={{ flex: "1 1 auto" }}
                >
                  {submittingAction === "approve" ? (
                    <><div className="spinner" />Saving trip...</>
                  ) : (
                    <><ThumbsUp size={16} />Approve & Save Trip</>
                  )}
                </button>
              </div>

              <div className="divider" />

              <p style={{ fontSize: "0.85rem", marginBottom: 12, color: "var(--text-secondary)" }}>
                Not satisfied? Tell the AI what to change:
              </p>

              <textarea
                id="trip-feedback"
                className="form-textarea"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="e.g., Add more cultural activities, replace the last hotel with a budget option, include vegetarian dining suggestions..."
                rows={3}
              />

              <button
                id="reject-trip"
                onClick={handleReject}
                className="btn btn-secondary"
                disabled={submittingAction !== null || !feedback.trim()}
                style={{ marginTop: 12, width: "100%" }}
              >
                {submittingAction === "reject" ? (
                  <><div className="spinner" />Revising...</>
                ) : (
                  <><RefreshCcw size={16} />Request Revision</>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success state */}
      <AnimatePresence>
        {phase === "approved" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card"
            style={{
              textAlign: "center",
              background: "rgba(16, 185, 129, 0.08)",
              borderColor: "rgba(34,197,94,0.3)",
              padding: "48px 32px",
            }}
          >
            <div style={{ fontSize: "4rem", marginBottom: "16px" }}>🎉</div>
            <h2 style={{ marginBottom: "12px" }}>Trip Saved!</h2>
            <p style={{ marginBottom: "28px" }}>
              Your trip to <strong>{tripDetails.destination}</strong> has been finalized and saved to your dashboard.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/dashboard" className="btn btn-primary" id="go-to-dashboard">
                View in Dashboard
              </a>
              <button onClick={onReset} className="btn btn-secondary" id="plan-another">
                Plan Another Trip
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state */}
      <AnimatePresence>
        {phase === "error" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card"
            style={{ borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)" }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <XCircle size={20} color="#f87171" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <h4 style={{ color: "#f87171", marginBottom: 8 }}>Something went wrong</h4>
                <p style={{ fontSize: "0.9rem" }}>{errorMsg || "An unexpected error occurred during planning."}</p>
                <button
                  onClick={onReset}
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: 16 }}
                  id="retry-planning"
                >
                  <RefreshCcw size={14} />
                  Try Again
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
