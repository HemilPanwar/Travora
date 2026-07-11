"use client";
import { motion } from "framer-motion";
import { MapPin, Clock, DollarSign, Star, Lightbulb } from "lucide-react";

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

interface TimelineProps {
  days: IDay[];
  currency?: string;
}

const periodColors: Record<string, string> = {
  morning: "var(--emerald-400)",
  afternoon: "var(--emerald-400)",
  evening: "var(--emerald-400)",
};

const periodBg: Record<string, string> = {
  morning: "rgba(147, 51, 234, 0.08)",
  afternoon: "rgba(45, 212, 191, 0.08)",
  evening: "rgba(244, 114, 182, 0.08)",
};

const periodBorder: Record<string, string> = {
  morning: "rgba(147, 51, 234, 0.2)",
  afternoon: "rgba(45, 212, 191, 0.2)",
  evening: "rgba(244, 114, 182, 0.2)",
};

const periodEmoji: Record<string, string> = {
  morning: "🌅",
  afternoon: "☀️",
  evening: "🌙",
};

function ActivityCard({
  period,
  activity,
  currency,
}: {
  period: string;
  activity: IActivity;
  currency: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        background: periodBg[period],
        border: `1px solid ${periodBorder[period]}`,
        borderRadius: "var(--radius-md)",
        padding: "1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "0.5rem",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              color: periodColors[period],
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {periodEmoji[period]} {period}
          </span>
          <h4
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.95rem",
              fontWeight: 700,
              marginTop: "0.15rem",
            }}
          >
            {activity.activity}
          </h4>
        </div>
        <div
          style={{
            flexShrink: 0,
            fontSize: "0.8rem",
            color: "var(--emerald-400)",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "0.2rem",
          }}
        >
          <DollarSign size={12} />
          {currency} {activity.estimatedCost}
        </div>
      </div>
      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
        {activity.description}
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.3rem",
          marginTop: "0.5rem",
          fontSize: "0.78rem",
          color: "var(--text-muted)",
        }}
      >
        <Clock size={12} />
        {activity.duration}
      </div>
    </motion.div>
  );
}

export default function Timeline({ days, currency = "USD" }: TimelineProps) {
  if (!days || days.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
        No itinerary data available.
      </div>
    );
  }

  const totalCost = days.reduce((sum, day) => sum + (day.totalDayCost || 0), 0);

  return (
    <div>
      {/* Cost summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          flexWrap: "wrap",
        }}
      >
        <div className="stat-card" style={{ flex: 1, minWidth: 120 }}>
          <div className="stat-value">{days.length}</div>
          <div className="stat-label">Days</div>
        </div>
        <div className="stat-card" style={{ flex: 1, minWidth: 120 }}>
          <div className="stat-value">{days.length * 3}</div>
          <div className="stat-label">Activities</div>
        </div>
        <div className="stat-card" style={{ flex: 1, minWidth: 120 }}>
          <div className="stat-value" style={{ fontSize: "1.4rem" }}>
            {currency} {totalCost.toLocaleString()}
          </div>
          <div className="stat-label">Total Est. Cost</div>
        </div>
      </motion.div>

      {/* Timeline */}
      <div className="timeline">
        {days.map((day, index) => (
          <motion.div
            key={index}
            className="timeline-item"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.12, duration: 0.5 }}
          >
            <div className="timeline-dot" />
            <div className="timeline-card">
              {/* Day header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      background: "var(--gradient-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-display)",
                      fontWeight: 900,
                      fontSize: "1rem",
                      flexShrink: 0,
                    }}
                  >
                    {day.day}
                  </div>
                  <div>
                    <h3
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: "1.1rem",
                      }}
                    >
                      {day.title}
                    </h3>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        marginTop: "0.1rem",
                      }}
                    >
                      <MapPin size={11} />
                      {day.date}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: "var(--emerald-400)",
                      background: "rgba(45, 212, 191, 0.1)",
                      padding: "0.25rem 0.6rem",
                      borderRadius: "var(--radius-full)",
                      border: "1px solid rgba(45, 212, 191, 0.3)",
                    }}
                  >
                    {currency} {day.totalDayCost?.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Activities */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {day.morning && (
                  <ActivityCard period="morning" activity={day.morning} currency={currency} />
                )}
                {day.afternoon && (
                  <ActivityCard period="afternoon" activity={day.afternoon} currency={currency} />
                )}
                {day.evening && (
                  <ActivityCard period="evening" activity={day.evening} currency={currency} />
                )}
              </div>

              {/* Hotel */}
              {day.hotel && (
                <div
                  style={{
                    marginTop: "0.75rem",
                    padding: "0.75rem",
                    background: "rgba(147, 51, 234, 0.05)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.5rem",
                  }}
                >
                  <Star size={14} style={{ color: "var(--emerald-400)", flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Stay: </span>
                    {day.hotel}
                  </div>
                </div>
              )}

              {/* Tips */}
              {day.tips && (
                <div
                  style={{
                    marginTop: "0.75rem",
                    padding: "0.75rem",
                    background: "rgba(45, 212, 191, 0.05)",
                    border: "1px solid var(--border-emerald)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "0.82rem",
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.5rem",
                  }}
                >
                  <Lightbulb size={14} style={{ color: "var(--emerald-400)", flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <span style={{ fontWeight: 600, color: "var(--emerald-400)" }}>Local Tip: </span>
                    {day.tips}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
