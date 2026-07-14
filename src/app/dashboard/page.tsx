"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Calendar,
  DollarSign,
  Sparkles,
  Trash2,
  ExternalLink,
  LayoutDashboard,
  Plus,
  Globe,
} from "lucide-react";
import Timeline from "@/components/Timeline";

import { TripRecord } from "@/types";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/trips");
        const data = await res.json();
        setTrips(data.trips || []);
      } catch {
        // handle silently
      } finally {
        setLoading(false);
      }
    };

    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
    if (status === "authenticated") {
      fetchTrips();
    }
  }, [status, router]);

  async function deleteTrip(tripId: string) {
    setDeletingId(tripId);
    try {
      await fetch(`/api/trips?id=${tripId}`, { method: "DELETE" });
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
      if (expandedTripId === tripId) setExpandedTripId(null);
    } catch {
      // handle silently
    } finally {
      setDeletingId(null);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-base)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3, margin: "0 auto 16px" }} />
          <p>Loading your trips...</p>
        </div>
      </div>
    );
  }

  const expandedTrip = trips.find((t) => t.id === expandedTripId);
  let expandedItinerary = [];
  if (expandedTrip) {
    try {
      expandedItinerary = JSON.parse(expandedTrip.itinerary || "[]");
    } catch {
      expandedItinerary = [];
    }
  }

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        background: "var(--bg-base)",
        padding: "48px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* BG glow */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "600px",
          height: "500px",
          background: "radial-gradient(ellipse, rgba(16, 185, 129, 0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="container" style={{ position: "relative" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "40px",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "8px" }}>
              <LayoutDashboard size={22} color="var(--color-primary-light)" />
              <h1 style={{ fontSize: "2rem", marginBottom: 0 }}>My Trips</h1>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              {trips.length > 0
                ? `${trips.length} finalized trip${trips.length > 1 ? "s" : ""} · Welcome back, ${session?.user?.name?.split(" ")[0]}!`
                : `Welcome, ${session?.user?.name?.split(" ")[0]}! Start planning your first adventure.`}
            </p>
          </div>
          <Link
            href="/plan-trip"
            id="new-trip-btn"
            className="btn btn-primary"
          >
            <Plus size={16} />
            Plan New Trip
          </Link>
        </div>

        {/* Empty state */}
        {trips.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: "center", padding: "80px 24px" }}
          >
            <div style={{ fontSize: "5rem", marginBottom: "24px" }}>🌍</div>
            <h2 style={{ marginBottom: "16px" }}>No trips yet</h2>
            <p style={{ maxWidth: "400px", margin: "0 auto 32px", color: "var(--text-secondary)" }}>
              Plan your first AI-powered adventure! Our multi-agent AI will research and craft a personalized itinerary just for you.
            </p>
            <Link href="/plan-trip" className="btn btn-primary btn-lg animate-pulse-glow">
              <Sparkles size={18} />
              Plan My First Trip
            </Link>
          </motion.div>
        )}

        {/* Trip grid */}
        {trips.length > 0 && (
          <div style={{ display: "grid", gap: "20px" }}>
            {trips.map((trip, i) => {
              const isExpanded = expandedTripId === trip.id;
              let preferences: string[] = [];
              try { preferences = JSON.parse(trip.preferences || "[]"); } catch { /* */ }
              const nights = Math.max(1, Math.ceil(
                (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)
              ));

              return (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="card"
                  style={{ padding: 0, overflow: "hidden" }}
                >
                  {/* Trip summary header */}
                  <div
                    style={{
                      padding: "24px",
                      background: "rgba(16, 185, 129, 0.05)",
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      gap: 16,
                      alignItems: "start",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <Globe size={16} color="var(--color-accent)" />
                        <h3 style={{ fontSize: "1.15rem", marginBottom: 0 }}>
                          {trip.origin && trip.origin !== "" ? `${trip.origin} → ` : ""}
                          {trip.destination}
                        </h3>
                        <span className="badge badge-green" style={{ fontSize: "0.65rem", padding: "2px 8px" }}>
                          Finalized
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                          <Calendar size={13} />
                          {trip.startDate} → {trip.endDate} ({nights} night{nights !== 1 ? "s" : ""})
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                          <DollarSign size={13} />
                          Budget: {trip.budget?.toLocaleString()} {trip.currency}
                        </div>
                        {trip.totalEstimatedCost > 0 && (
                          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.85rem", color: "#fcd34d" }}>
                            <DollarSign size={13} />
                            Est. Cost: {trip.totalEstimatedCost.toLocaleString()} {trip.currency}
                          </div>
                        )}
                      </div>

                      {preferences.length > 0 && (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {preferences.slice(0, 4).map((p) => (
                            <span key={p} className="badge badge-primary" style={{ fontSize: "0.7rem", padding: "2px 8px" }}>
                              {p}
                            </span>
                          ))}
                          {preferences.length > 4 && (
                            <span className="badge badge-primary" style={{ fontSize: "0.7rem", padding: "2px 8px" }}>
                              +{preferences.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                      <button
                        id={`expand-trip-${trip.id}`}
                        onClick={() => setExpandedTripId(isExpanded ? null : trip.id)}
                        className="btn btn-secondary btn-sm"
                      >
                        <ExternalLink size={14} />
                        {isExpanded ? "Hide Itinerary" : "View Itinerary"}
                      </button>
                      <button
                        id={`delete-trip-${trip.id}`}
                        onClick={() => deleteTrip(trip.id)}
                        className="btn btn-danger btn-sm"
                        disabled={deletingId === trip.id}
                      >
                        {deletingId === trip.id ? (
                          <><div className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />Deleting...</>
                        ) : (
                          <><Trash2 size={14} />Delete</>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expandable itinerary */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: "hidden" }}
                      >
                        <div
                          style={{
                            padding: "24px",
                            borderTop: "1px solid var(--border-default)",
                          }}
                        >
                          {expandedItinerary.length > 0 ? (
                            <Timeline days={expandedItinerary} />
                          ) : (
                            <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "24px" }}>
                              No itinerary details available.
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
