"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, RotateCcw, Send, ChevronDown, MapPin, Calendar, DollarSign, Loader } from "lucide-react";

interface IActivity {
  activity: string;
  description: string;
  estimatedCost: number;
  duration: string;
}

interface IDay {
  day: number;
  date: string;
  title: string;
  morning: IActivity;
  afternoon: IActivity;
  evening: IActivity;
  hotel: string;
  totalDayCost: number;
  tips: string;
}

interface TripData {
  origin?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  budget?: string | number;
  currency?: string;
  preferences?: string;
}

interface ThinkingAgentUIProps {
  tripData: TripData;
  onReset: () => void;
}

type LogLine = { id: string; text: string; type: "info" | "error" | "agent" | "warn" };
type Phase = "streaming" | "review" | "revising" | "done" | "error";

export default function ThinkingAgentUI({ tripData, onReset }: ThinkingAgentUIProps) {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [phase, setPhase] = useState<Phase>("streaming");
  const [draftItinerary, setDraftItinerary] = useState<IDay[]>([]);
  const [draftMeta, setDraftMeta] = useState<Record<string, string | number>>({});
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedTripId, setSavedTripId] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const terminalRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const addLog = (text: string, type: LogLine["type"] = "info") => {
    setLogs((prev) => [
      ...prev,
      { id: Math.random().toString(36), text, type },
    ]);
    setTimeout(() => {
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    }, 50);
  };

  const startStreaming = (url: string, body: object) => {
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(async (res) => {
      if (!res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              handleSSEEvent(data);
            } catch {
              // ignore parse errors
            }
          }
        }
      }
    }).catch((err) => {
      addLog(`Connection error: ${err.message}`, "error");
      setPhase("error");
    });
  };

  const handleSSEEvent = (data: Record<string, unknown>) => {
    switch (data.type) {
      case "log":
        addLog(data.message as string, detectLogType(data.message as string));
        break;
      case "draft": {
        try {
          const days = JSON.parse(data.itinerary as string) as IDay[];
          setDraftItinerary(days);
          setDraftMeta({
            destination: data.destination as string,
            startDate: data.startDate as string,
            endDate: data.endDate as string,
            budget: data.budget as number,
            currency: data.currency as string,
          });
          setPhase("review");
        } catch {
          addLog("Failed to parse itinerary", "error");
        }
        break;
      }
      case "done":
        if (phase !== "review") setPhase("done");
        break;
      case "error":
        addLog(`Error: ${data.message}`, "error");
        setPhase("error");
        break;
    }
  };

  const detectLogType = (msg: string): LogLine["type"] => {
    if (msg.includes("Error") || msg.includes("error")) return "error";
    if (msg.includes("Agent") || msg.includes("[")) return "agent";
    return "info";
  };

  useEffect(() => {
    startStreaming("/api/plan-trip", tripData);
    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApprove = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/plan-trip/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          itinerary: JSON.stringify(draftItinerary),
          tripData,
        }),
      });
      const result = await res.json();
      setSavedTripId(result.tripId || "guest");
      setPhase("done");
      addLog("✅ Trip approved and saved to your dashboard!", "info");
    } catch (err) {
      addLog(`Save error: ${err}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleRevise = () => {
    if (!feedback.trim()) return;
    setPhase("revising");
    addLog(`📝 Sending revision request: "${feedback}"`, "warn");
    setDraftItinerary([]);

    startStreaming("/api/plan-trip/resume", {
      action: "revise",
      feedback,
      tripData: { ...tripData, ...draftMeta },
    });

    setFeedback("");
  };

  const totalCost = draftItinerary.reduce((s, d) => s + (d.totalDayCost || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Terminal */}
      <div className="terminal">
        <div className="terminal-header">
          <div className="terminal-dot terminal-dot-red" />
          <div className="terminal-dot terminal-dot-yellow" />
          <div className="terminal-dot terminal-dot-green" />
          <span className="terminal-title">travora — agent pipeline</span>
        </div>
        <div className="terminal-body" ref={terminalRef}>
          {logs.map((log) => (
            <div key={log.id} className={`terminal-line ${log.type}`}>
              <span style={{ color: "rgba(255,255,255,0.3)", marginRight: "0.5rem" }}>❯</span>
              {log.text}
            </div>
          ))}
          {(phase === "streaming" || phase === "revising") && (
            <div className="terminal-line">
              <span style={{ color: "rgba(255,255,255,0.3)", marginRight: "0.5rem" }}>❯</span>
              <span className="terminal-cursor" />
            </div>
          )}
        </div>
      </div>

      {/* Draft Review */}
      <AnimatePresence>
        {(phase === "review" || phase === "revising") && draftItinerary.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {/* Summary bar */}
            <div
              className="glass-card"
              style={{ padding: "1.25rem", marginBottom: "1rem" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      marginBottom: "0.25rem",
                    }}
                  >
                    ✨ Draft Itinerary — {draftMeta.destination}
                  </h3>
                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <Calendar size={13} />
                      {draftMeta.startDate} → {draftMeta.endDate}
                    </span>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <MapPin size={13} />
                      {draftItinerary.length} days
                    </span>
                    <span style={{ fontSize: "0.85rem", color: "var(--emerald-400)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <DollarSign size={13} />
                      Est. {draftMeta.currency} {totalCost.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="badge badge-emerald">Human Review</div>
              </div>
            </div>

            {/* Days */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
              {draftItinerary.map((day, i) => (
                <motion.div
                  key={i}
                  className="glass-card"
                  style={{ overflow: "hidden", cursor: "pointer" }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div
                    onClick={() => setExpandedDay(expandedDay === i ? null : i)}
                    style={{
                      padding: "1rem 1.25rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: "var(--gradient-primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "var(--font-display)",
                          fontWeight: 800,
                          fontSize: "0.85rem",
                          flexShrink: 0,
                        }}
                      >
                        {day.day}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{day.title}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{day.date}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <span style={{ fontSize: "0.85rem", color: "var(--emerald-400)" }}>
                        {draftMeta.currency} {day.totalDayCost?.toLocaleString() || 0}
                      </span>
                      <ChevronDown
                        size={16}
                        style={{
                          color: "var(--text-muted)",
                          transform: expandedDay === i ? "rotate(180deg)" : "none",
                          transition: "transform 0.3s ease",
                        }}
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedDay === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: "hidden" }}
                      >
                        <div
                          style={{
                            padding: "0 1.25rem 1.25rem",
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                            gap: "0.75rem",
                          }}
                        >
                          {[
                            { label: "🌅 Morning", data: day.morning },
                            { label: "☀️ Afternoon", data: day.afternoon },
                            { label: "🌙 Evening", data: day.evening },
                          ].map(({ label, data: act }) => act && (
                            <div
                              key={label}
                              style={{
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid var(--border-subtle)",
                                borderRadius: "var(--radius-md)",
                                padding: "0.75rem",
                              }}
                            >
                              <div style={{ fontSize: "0.75rem", color: "var(--emerald-400)", fontWeight: 600, marginBottom: "0.25rem" }}>{label}</div>
                              <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.25rem" }}>{act.activity}</div>
                              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>{act.description}</div>
                              <div style={{ fontSize: "0.75rem", color: "var(--emerald-400)" }}>
                                {draftMeta.currency} {act.estimatedCost} · {act.duration}
                              </div>
                            </div>
                          ))}
                          {day.tips && (
                            <div
                              style={{
                                gridColumn: "1/-1",
                                background: "rgba(45, 212, 191, 0.05)",
                                border: "1px solid var(--border-emerald)",
                                borderRadius: "var(--radius-md)",
                                padding: "0.75rem",
                                fontSize: "0.82rem",
                                color: "var(--text-secondary)",
                              }}
                            >
                              💡 <strong>Tip:</strong> {day.tips}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* Feedback + Actions */}
            <div className="glass-card" style={{ padding: "1.25rem" }}>
              <h4
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  marginBottom: "0.75rem",
                  fontSize: "1rem",
                }}
              >
                🤝 Human Review
              </h4>
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label htmlFor="feedback-input">
                  Feedback (optional — leave blank to approve as-is)
                </label>
                <textarea
                  id="feedback-input"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="E.g. Add more beach activities, reduce hotel budget, include a cooking class..."
                  rows={3}
                />
              </div>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <button
                  className="btn btn-primary"
                  onClick={handleApprove}
                  disabled={saving}
                  id="approve-btn"
                >
                  {saving ? <Loader size={16} className="spinner" /> : <CheckCircle size={16} />}
                  {saving ? "Saving..." : "Approve & Save Trip"}
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={handleRevise}
                  disabled={!feedback.trim() || phase === "revising"}
                  id="revise-btn"
                >
                  <RotateCcw size={16} />
                  Revise with Feedback
                </button>
                <button
                  className="btn btn-danger"
                  onClick={onReset}
                  id="discard-btn"
                >
                  <XCircle size={16} />
                  Discard
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Done state */}
      <AnimatePresence>
        {phase === "done" && (
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ padding: "2rem", textAlign: "center" }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.4rem",
                fontWeight: 800,
                marginBottom: "0.5rem",
              }}
            >
              Trip Saved!
            </h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              Your itinerary has been finalized and saved to your dashboard.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <a href="/dashboard" className="btn btn-primary">
                View Dashboard
              </a>
              <button className="btn btn-secondary" onClick={onReset}>
                Plan Another Trip
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
