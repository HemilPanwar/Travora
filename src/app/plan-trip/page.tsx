"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Calendar,
  DollarSign,
  Heart,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Plane,
} from "lucide-react";
import ThinkingAgentUI from "@/components/ThinkingAgentUI";

import { TripDetails } from "@/types";

const PREFERENCES = [
  "🏖️ Beach & Relaxation",
  "🏔️ Adventure & Hiking",
  "🎭 Culture & Museums",
  "🍽️ Food & Culinary",
  "🛍️ Shopping",
  "🌿 Nature & Wildlife",
  "🏛️ History & Architecture",
  "🎵 Music & Nightlife",
  "👨‍👩‍👧 Family-friendly",
  "💆 Wellness & Spa",
  "📸 Photography",
  "🎨 Art & Design",
];

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD", "CHF", "SGD", "AED"];

const steps = [
  { id: 1, title: "Locations", icon: <Plane size={18} />, desc: "Where are you going?" },
  { id: 2, title: "Budget & Dates", icon: <DollarSign size={18} />, desc: "When and how much?" },
  { id: 3, title: "Preferences", icon: <Heart size={18} />, desc: "What do you love?" },
];

export default function PlanTripPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [details, setDetails] = useState<TripDetails>({
    origin: "",
    destination: "",
    startDate: "",
    endDate: "",
    budget: "",
    currency: "USD",
    preferences: [],
  });
  const [isPlanning, setIsPlanning] = useState(false);
  const [submittedDetails, setSubmittedDetails] = useState<TripDetails | null>(null);

  // Redirect if not logged in
  if (status === "loading") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 64px)" }}>
        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  function togglePreference(pref: string) {
    setDetails((prev) => ({
      ...prev,
      preferences: prev.preferences.includes(pref)
        ? prev.preferences.filter((p) => p !== pref)
        : [...prev.preferences, pref],
    }));
  }

  function canProceed() {
    if (step === 1) return details.origin.trim() && details.destination.trim();
    if (step === 2) return details.startDate && details.endDate && details.budget && Number(details.budget) > 0;
    if (step === 3) return true;
    return false;
  }

  function handleStartPlanning() {
    setSubmittedDetails({ ...details });
    setIsPlanning(true);
  }

  function handleReset() {
    setIsPlanning(false);
    setSubmittedDetails(null);
    setStep(1);
    setDetails({ origin: "", destination: "", startDate: "", endDate: "", budget: "", currency: "USD", preferences: [] });
  }

  const today = new Date().toISOString().split("T")[0];

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
      {/* Background gradient */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16, 185, 129, 0.15) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <div className="container-sm" style={{ position: "relative" }}>
        {/* Page title */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <span className="badge badge-primary" style={{ marginBottom: "16px", display: "inline-flex" }}>
            <Sparkles size={12} />
            AI Trip Planner
          </span>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", marginBottom: "12px" }}>
            Plan Your <span className="text-gradient">Perfect Trip</span>
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Hello, {session?.user?.name?.split(" ")[0]}! Answer 3 simple questions and our AI handles the rest.
          </p>
        </div>

        {!isPlanning ? (
          <>
            {/* Step indicator */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0,
                marginBottom: "40px",
              }}
            >
              {steps.map((s, i) => (
                <div key={s.id} style={{ display: "flex", alignItems: "center" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 18px",
                      borderRadius: "var(--radius-full)",
                      background: step === s.id
                        ? "#10b981"
                        : step > s.id
                        ? "rgba(16,185,129,0.2)"
                        : "var(--bg-card)",
                      border: step === s.id
                        ? "none"
                        : `1px solid ${step > s.id ? "rgba(16, 185, 129, 0.3)" : "var(--border-default)"}`,
                      color: step === s.id ? "#fff" : step > s.id ? "var(--color-primary-light)" : "var(--text-muted)",
                      transition: "all var(--transition-normal)",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    {s.icon}
                    <span>{s.title}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      style={{
                        width: 32,
                        height: 2,
                        background: step > s.id ? "var(--color-primary)" : "var(--border-default)",
                        transition: "background var(--transition-normal)",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="card" style={{ padding: "36px" }}>
                  {/* Step 1: Locations */}
                  {step === 1 && (
                    <div>
                      <h2 style={{ fontSize: "1.4rem", marginBottom: "8px" }}>
                        <Plane size={22} style={{ display: "inline", marginRight: 10, color: "var(--color-primary-light)" }} />
                        Where are you going?
                      </h2>
                      <p style={{ marginBottom: "28px", fontSize: "0.9rem" }}>
                        Tell us your departure city and dream destination.
                      </p>

                      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <div className="form-group">
                          <label className="form-label" htmlFor="origin-input">
                            <MapPin size={13} style={{ display: "inline", marginRight: 4 }} />
                            Departing From
                          </label>
                          <input
                            id="origin-input"
                            type="text"
                            className="form-input"
                            value={details.origin}
                            onChange={(e) => setDetails((d) => ({ ...d, origin: e.target.value }))}
                            placeholder="New York, USA"
                            autoFocus
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" htmlFor="destination-input">
                            <MapPin size={13} style={{ display: "inline", marginRight: 4 }} />
                            Destination
                          </label>
                          <input
                            id="destination-input"
                            type="text"
                            className="form-input"
                            value={details.destination}
                            onChange={(e) => setDetails((d) => ({ ...d, destination: e.target.value }))}
                            placeholder="Tokyo, Japan"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Budget & Dates */}
                  {step === 2 && (
                    <div>
                      <h2 style={{ fontSize: "1.4rem", marginBottom: "8px" }}>
                        <Calendar size={22} style={{ display: "inline", marginRight: 10, color: "var(--color-accent)" }} />
                        Budget & Travel Dates
                      </h2>
                      <p style={{ marginBottom: "28px", fontSize: "0.9rem" }}>
                        Set your dates and total trip budget so the AI plans accordingly.
                      </p>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div className="form-group">
                          <label className="form-label" htmlFor="start-date">Departure Date</label>
                          <input
                            id="start-date"
                            type="date"
                            className="form-input"
                            value={details.startDate}
                            min={today}
                            onChange={(e) => setDetails((d) => ({ ...d, startDate: e.target.value }))}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" htmlFor="end-date">Return Date</label>
                          <input
                            id="end-date"
                            type="date"
                            className="form-input"
                            value={details.endDate}
                            min={details.startDate || today}
                            onChange={(e) => setDetails((d) => ({ ...d, endDate: e.target.value }))}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" htmlFor="budget-input">Total Budget</label>
                          <input
                            id="budget-input"
                            type="number"
                            className="form-input"
                            value={details.budget}
                            onChange={(e) => setDetails((d) => ({ ...d, budget: e.target.value }))}
                            placeholder="3000"
                            min="1"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" htmlFor="currency-select">Currency</label>
                          <select
                            id="currency-select"
                            className="form-select form-input"
                            value={details.currency}
                            onChange={(e) => setDetails((d) => ({ ...d, currency: e.target.value }))}
                          >
                            {CURRENCIES.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Preferences */}
                  {step === 3 && (
                    <div>
                      <h2 style={{ fontSize: "1.4rem", marginBottom: "8px" }}>
                        <Heart size={22} style={{ display: "inline", marginRight: 10, color: "#f472b6" }} />
                        Your Travel Style
                      </h2>
                      <p style={{ marginBottom: "28px", fontSize: "0.9rem" }}>
                        Select all that apply — the AI will tailor your itinerary accordingly.
                        <span style={{ color: "var(--text-muted)" }}> (Optional)</span>
                      </p>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                          gap: "12px",
                        }}
                      >
                        {PREFERENCES.map((pref) => {
                          const selected = details.preferences.includes(pref);
                          return (
                            <button
                              key={pref}
                              id={`pref-${pref.replace(/[^a-zA-Z0-9]/g, "-")}`}
                              onClick={() => togglePreference(pref)}
                              style={{
                                padding: "12px 14px",
                                borderRadius: "var(--radius-md)",
                                border: `1px solid ${selected ? "rgba(16, 185, 129, 0.6)" : "var(--border-default)"}`,
                                background: selected ? "rgba(16, 185, 129, 0.1)" : "var(--bg-card-2)",
                                color: selected ? "var(--color-primary-light)" : "var(--text-secondary)",
                                cursor: "pointer",
                                textAlign: "left",
                                fontSize: "0.88rem",
                                fontWeight: selected ? 600 : 400,
                                transition: "all var(--transition-fast)",
                                transform: selected ? "scale(1.02)" : "scale(1)",
                              }}
                            >
                              {pref}
                            </button>
                          );
                        })}
                      </div>

                      {details.preferences.length > 0 && (
                        <p style={{ marginTop: 16, fontSize: "0.82rem", color: "var(--color-primary-light)" }}>
                          ✓ {details.preferences.length} preference{details.preferences.length > 1 ? "s" : ""} selected
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "24px",
                gap: 16,
              }}
            >
              <button
                id="back-btn"
                onClick={() => setStep((s) => s - 1)}
                className="btn btn-secondary"
                disabled={step === 1}
              >
                <ArrowLeft size={16} />
                Back
              </button>

              {step < 3 ? (
                <button
                  id="next-btn"
                  onClick={() => setStep((s) => s + 1)}
                  className="btn btn-primary"
                  disabled={!canProceed()}
                >
                  Next
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  id="start-planning-btn"
                  onClick={handleStartPlanning}
                  className="btn btn-primary btn-lg animate-pulse-glow"
                >
                  <Sparkles size={18} />
                  Start AI Planning
                </button>
              )}
            </div>
          </>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Trip summary header */}
              <div
                className="card"
                style={{
                  marginBottom: "24px",
                  background: "rgba(16, 185, 129, 0.07)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 12,
                  padding: "18px 24px",
                }}
              >
                <div>
                  <h3 style={{ fontSize: "1.1rem", marginBottom: 4 }}>
                    ✈ {submittedDetails?.origin} → {submittedDetails?.destination}
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
                    {submittedDetails?.startDate} → {submittedDetails?.endDate} · {submittedDetails?.budget} {submittedDetails?.currency}
                  </p>
                </div>
                <button onClick={handleReset} className="btn btn-ghost btn-sm">
                  ✕ Cancel
                </button>
              </div>

              {submittedDetails && (
                <ThinkingAgentUI
                  tripDetails={{
                    origin: submittedDetails.origin,
                    destination: submittedDetails.destination,
                    startDate: submittedDetails.startDate,
                    endDate: submittedDetails.endDate,
                    budget: Number(submittedDetails.budget),
                    currency: submittedDetails.currency,
                    preferences: submittedDetails.preferences,
                  }}
                  onReset={handleReset}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
