"use client";
import { motion } from "framer-motion";
import { Sun, Coffee, Moon, Hotel, Utensils, Lightbulb, DollarSign } from "lucide-react";

interface TimeSlot {
  activity: string;
  location: string;
  cost: number;
  notes: string;
}

interface Day {
  day: number;
  date: string;
  title: string;
  morning: TimeSlot;
  afternoon: TimeSlot;
  evening: TimeSlot;
  accommodation: { name: string; cost: number };
  meals: { breakfast: string; lunch: string; dinner: string };
  totalDayCost: number;
  tips: string;
}

interface TimelineProps {
  days: Day[];
}

const timeSlots = [
  { key: "morning" as const, label: "Morning", icon: <Sun size={16} />, color: "#f59e0b" },
  { key: "afternoon" as const, label: "Afternoon", icon: <Coffee size={16} />, color: "#06b6d4" },
  { key: "evening" as const, label: "Evening", icon: <Moon size={16} />, color: "#7c3aed" },
];

export default function Timeline({ days }: TimelineProps) {
  if (!days || days.length === 0) return null;

  return (
    <div style={{ position: "relative" }}>
      {/* Vertical line */}
      <div
        style={{
          position: "absolute",
          left: "24px",
          top: 0,
          bottom: 0,
          width: "2px",
          background: "var(--color-primary)",
          opacity: 0.3,
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        {days.map((day, dayIdx) => (
          <motion.div
            key={day.day}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: dayIdx * 0.08, duration: 0.4 }}
            style={{ display: "flex", gap: "24px", paddingLeft: "0" }}
          >
            {/* Day badge */}
            <div style={{ position: "relative", flexShrink: 0, zIndex: 1 }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  boxShadow: "0 0 20px rgba(16, 185, 129, 0.35)",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  color: "#fff",
                  letterSpacing: "0.03em",
                  textTransform: "uppercase",
                }}
              >
                <span style={{ fontSize: "0.9rem", fontWeight: 800 }}>{day.day}</span>
              </div>
            </div>

            {/* Day content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Header */}
              <div
                className="card"
                style={{
                  marginBottom: "16px",
                  background: "var(--bg-card-2)",
                  padding: "16px 20px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div style={{ fontSize: "0.78rem", color: "var(--color-accent)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "4px" }}>
                      Day {day.day} · {day.date}
                    </div>
                    <h4 style={{ fontSize: "1.05rem", marginBottom: 0 }}>{day.title}</h4>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: "rgba(245,158,11,0.12)",
                      border: "1px solid rgba(245,158,11,0.2)",
                      borderRadius: "var(--radius-full)",
                      padding: "4px 12px",
                      fontSize: "0.82rem",
                      color: "#fcd34d",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <DollarSign size={13} />
                    {day.totalDayCost?.toLocaleString() || 0}
                  </div>
                </div>
              </div>

              {/* Time slots */}
              <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
                {timeSlots.map((slot) => {
                  const slotData = day[slot.key];
                  if (!slotData) return null;
                  return (
                    <div
                      key={slot.key}
                      style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-default)",
                        borderRadius: "var(--radius-md)",
                        padding: "16px",
                        borderLeft: `3px solid ${slot.color}`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: "10px",
                          color: slot.color,
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {slot.icon}
                        {slot.label}
                      </div>
                      <p
                        style={{
                          fontSize: "0.9rem",
                          color: "var(--text-primary)",
                          fontWeight: 500,
                          marginBottom: "6px",
                        }}
                      >
                        {slotData.activity}
                      </p>
                      {slotData.location && (
                        <p style={{ fontSize: "0.78rem", color: "var(--color-accent)", marginBottom: "6px" }}>
                          📍 {slotData.location}
                        </p>
                      )}
                      {slotData.notes && (
                        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "6px" }}>
                          {slotData.notes}
                        </p>
                      )}
                      {slotData.cost > 0 && (
                        <p style={{ fontSize: "0.75rem", color: "#fcd34d" }}>
                          ~${slotData.cost}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Meals & Accommodation row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
                {/* Meals */}
                <div
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-md)",
                    padding: "14px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, color: "var(--color-primary-light)", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    <Utensils size={14} />
                    Meals
                  </div>
                  {day.meals && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.82rem" }}>
                      {day.meals.breakfast && <div><span style={{ color: "var(--text-muted)" }}>☀️ </span>{day.meals.breakfast}</div>}
                      {day.meals.lunch && <div><span style={{ color: "var(--text-muted)" }}>🌤️ </span>{day.meals.lunch}</div>}
                      {day.meals.dinner && <div><span style={{ color: "var(--text-muted)" }}>🌙 </span>{day.meals.dinner}</div>}
                    </div>
                  )}
                </div>

                {/* Accommodation */}
                <div
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-md)",
                    padding: "14px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, color: "#34d399", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    <Hotel size={14} />
                    Stay
                  </div>
                  {day.accommodation && (
                    <div style={{ fontSize: "0.82rem" }}>
                      <div style={{ fontWeight: 500, marginBottom: 4 }}>{day.accommodation.name}</div>
                      {day.accommodation.cost > 0 && (
                        <div style={{ color: "#fcd34d", fontSize: "0.78rem" }}>~${day.accommodation.cost}/night</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Tips */}
              {day.tips && (
                <div
                  style={{
                    marginTop: "12px",
                    background: "rgba(16, 185, 129, 0.06)",
                    border: "1px solid rgba(16, 185, 129, 0.15)",
                    borderRadius: "var(--radius-md)",
                    padding: "12px 16px",
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                  }}
                >
                  <Lightbulb size={15} color="var(--color-gold)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: "0.83rem", color: "var(--text-secondary)", margin: 0 }}>
                    <span style={{ fontWeight: 600, color: "var(--color-gold)" }}>Pro tip: </span>
                    {day.tips}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
