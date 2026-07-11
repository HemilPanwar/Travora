"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Timeline from "@/components/Timeline";
import {
  MapPin,
  Calendar,
  DollarSign,
  Plane,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  Plus,
  Globe,
} from "lucide-react";
import Link from "next/link";

interface Trip {
  id: string;
  destination: string;
  origin: string;
  startDate: string;
  endDate: string;
  budget: number;
  currency: string;
  preferences: string;
  itinerary: string;
  status: string;
  totalEstimatedCost: number;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/trips")
        .then((r) => r.json())
        .then((data) => {
          setTrips(data.trips || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <>
        <Navbar />
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--bg-primary)",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 48,
                height: 48,
                border: "3px solid rgba(147, 51, 234, 0.2)",
                borderTopColor: "var(--emerald-500)",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 1rem",
              }}
            />
            <p style={{ color: "var(--text-secondary)" }}>Loading your trips…</p>
          </div>
        </div>
      </>
    );
  }

  const totalSpent = trips.reduce((sum, t) => sum + (t.totalEstimatedCost || 0), 0);

  return (
    <>
      <Navbar />
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg-primary)",
          paddingTop: "5.5rem",
          paddingBottom: "4rem",
        }}
      >
        <div className="container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: "2.5rem" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.4rem",
                  }}
                >
                  <LayoutDashboard size={20} style={{ color: "var(--emerald-400)" }} />
                  <span
                    style={{
                      fontSize: "0.8rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "var(--emerald-400)",
                      fontWeight: 600,
                    }}
                  >
                    Dashboard
                  </span>
                </div>
                <h1
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                    fontWeight: 900,
                  }}
                >
                  Welcome back,{" "}
                  <span className="gradient-text">
                    {session?.user?.name?.split(" ")[0]}
                  </span>{" "}
                  ✈️
                </h1>
                <p style={{ color: "var(--text-secondary)", marginTop: "0.4rem" }}>
                  {trips.length === 0
                    ? "You haven't planned any trips yet."
                    : `You have ${trips.length} finalized trip${trips.length !== 1 ? "s" : ""}.`}
                </p>
              </div>
              <Link href="/plan-trip" className="btn btn-primary" id="new-trip-btn">
                <Plus size={16} />
                Plan New Trip
              </Link>
            </div>

            {/* Stats */}
            {trips.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: "1rem",
                  marginBottom: "0.5rem",
                }}
              >
                <div className="stat-card">
                  <div className="stat-value">{trips.length}</div>
                  <div className="stat-label">Trips Planned</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {new Set(trips.map((t) => t.destination)).size}
                  </div>
                  <div className="stat-label">Destinations</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value" style={{ fontSize: "1.3rem" }}>
                    ${totalSpent.toLocaleString()}
                  </div>
                  <div className="stat-label">Est. Total Value</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {trips.reduce((sum, t) => {
                      try {
                        return sum + (JSON.parse(t.itinerary) as unknown[]).length;
                      } catch { return sum; }
                    }, 0)}
                  </div>
                  <div className="stat-label">Days Planned</div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Empty state */}
          {trips.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card"
              style={{ padding: "4rem", textAlign: "center" }}
            >
              <Globe size={56} style={{ color: "var(--emerald-400)", margin: "0 auto 1.5rem" }} />
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  marginBottom: "0.75rem",
                }}
              >
                No trips yet
              </h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", maxWidth: 400, margin: "0 auto 2rem" }}>
                Plan your first AI-powered trip and see your itinerary come alive here.
              </p>
              <Link href="/plan-trip" className="btn btn-primary">
                <Plane size={16} />
                Plan My First Trip
              </Link>
            </motion.div>
          )}

          {/* Trip Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {trips.map((trip, i) => {
              const itinerary = (() => {
                try {
                  return JSON.parse(trip.itinerary);
                } catch {
                  return [];
                }
              })();
              const isExpanded = expandedTrip === trip.id;

              return (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card"
                  style={{ overflow: "hidden" }}
                >
                  {/* Trip header */}
                  <div
                    style={{
                      padding: "1.5rem",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      setExpandedTrip(isExpanded ? null : trip.id)
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: "1rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: "var(--radius-md)",
                            background: "var(--gradient-primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.4rem",
                            flexShrink: 0,
                          }}
                        >
                          ✈️
                        </div>
                        <div>
                          <h3
                            style={{
                              fontFamily: "var(--font-display)",
                              fontSize: "1.2rem",
                              fontWeight: 800,
                              marginBottom: "0.25rem",
                            }}
                          >
                            {trip.destination}
                          </h3>
                          <div
                            style={{
                              display: "flex",
                              gap: "1rem",
                              flexWrap: "wrap",
                              fontSize: "0.82rem",
                              color: "var(--text-muted)",
                            }}
                          >
                            {trip.origin && (
                              <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                <Plane size={11} /> From {trip.origin}
                              </span>
                            )}
                            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                              <Calendar size={11} />
                              {trip.startDate} – {trip.endDate}
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                              <DollarSign size={11} />
                              {trip.currency} {trip.budget?.toLocaleString()} budget
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{
                              fontSize: "1.1rem",
                              fontWeight: 800,
                              fontFamily: "var(--font-display)",
                              background: "var(--gradient-text)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              backgroundClip: "text",
                            }}
                          >
                            {trip.currency} {trip.totalEstimatedCost?.toLocaleString()}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            {itinerary.length} days · Est. cost
                          </div>
                        </div>
                        <div>
                          <span className="badge badge-emerald" style={{ marginBottom: "0.4rem", display: "block" }}>
                            {trip.status}
                          </span>
                          {isExpanded ? (
                            <ChevronUp size={16} style={{ color: "var(--text-muted)" }} />
                          ) : (
                            <ChevronDown size={16} style={{ color: "var(--text-muted)" }} />
                          )}
                        </div>
                      </div>
                    </div>

                    {trip.preferences && (
                      <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                        {trip.preferences.split(", ").slice(0, 5).map((p) => (
                          <span key={p} className="badge badge-emerald" style={{ fontSize: "0.7rem" }}>
                            {p}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Expanded itinerary */}
                  {isExpanded && itinerary.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{
                        borderTop: "1px solid var(--border-subtle)",
                        padding: "1.5rem",
                      }}
                    >
                      <Timeline days={itinerary} currency={trip.currency} />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
