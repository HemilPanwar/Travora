"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import ThinkingAgentUI from "@/components/ThinkingAgentUI";
import {
  MapPin,
  Plane,
  Calendar,
  DollarSign,
  Heart,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from "lucide-react";

interface TripData {
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  currency: string;
  preferences: string;
}

const STEPS = ["Locations", "Budget & Dates", "Preferences"];

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
];

const PREFERENCE_TAGS = [
  "Beach & Ocean", "Mountains & Hiking", "History & Culture",
  "Food & Cuisine", "Adventure Sports", "Luxury", "Budget Travel",
  "Nightlife", "Family-Friendly", "Romantic", "Art & Museums",
  "Nature & Wildlife", "Shopping", "Photography", "Local Experiences",
];

export default function PlanTripPage() {
  const [step, setStep] = useState(0);
  const [tripData, setTripData] = useState<TripData>({
    origin: "",
    destination: "",
    startDate: "",
    endDate: "",
    budget: "",
    currency: "USD",
    preferences: "",
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const update = (field: keyof TripData, value: string) => {
    setTripData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const canProceed = () => {
    if (step === 0) return tripData.origin && tripData.destination;
    if (step === 1) return tripData.startDate && tripData.endDate && tripData.budget;
    return true;
  };

  const handleSubmit = () => {
    const finalTripData = {
      ...tripData,
      preferences: selectedTags.join(", "),
    };
    setTripData(finalTripData);
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setStep(0);
    setTripData({
      origin: "",
      destination: "",
      startDate: "",
      endDate: "",
      budget: "",
      currency: "USD",
      preferences: "",
    });
    setSelectedTags([]);
  };

  if (submitted) {
    return (
      <>
        <Navbar />
        <div
          style={{
            minHeight: "100vh",
            paddingTop: "5rem",
            paddingBottom: "3rem",
            background: "var(--bg-primary)",
          }}
        >
          <div className="container" style={{ maxWidth: 820 }}>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.8rem",
                  fontWeight: 800,
                  marginBottom: "0.5rem",
                }}
              >
                Planning your trip to{" "}
                <span className="gradient-text">{tripData.destination}</span>
              </h1>
              <p style={{ color: "var(--text-secondary)" }}>
                AI agents are researching hotels, flights, restaurants, and attractions…
              </p>
            </div>
            <ThinkingAgentUI tripData={tripData} onReset={handleReset} />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div
        style={{
          minHeight: "100vh",
          background: "var(--gradient-hero)",
          paddingTop: "5rem",
          paddingBottom: "3rem",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className="wizard-container" style={{ width: "100%" }}>
          {/* Step indicators */}
          <div className="wizard-steps">
            {STEPS.map((s, i) => (
              <div
                key={i}
                className={`wizard-step ${i === step ? "active" : i < step ? "completed" : ""}`}
              >
                <div className="wizard-step-circle">
                  {i < step ? "✓" : i + 1}
                </div>
                <span className="wizard-step-label">{s}</span>
              </div>
            ))}
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              {/* ── Step 0: Locations ── */}
              {step === 0 && (
                <div className="glass-card" style={{ padding: "2rem" }}>
                  <div style={{ marginBottom: "1.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <Plane size={20} style={{ color: "var(--emerald-400)" }} />
                      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 800 }}>
                        Where are you going?
                      </h2>
                    </div>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                      Tell us your departure and destination cities.
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <div className="form-group">
                      <label htmlFor="origin-input">
                        <MapPin size={13} style={{ display: "inline", marginRight: "0.35rem" }} />
                        Departing From
                      </label>
                      <input
                        id="origin-input"
                        type="text"
                        placeholder="e.g. New York, USA"
                        value={tripData.origin}
                        onChange={(e) => update("origin", e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="destination-input">
                        <MapPin size={13} style={{ display: "inline", marginRight: "0.35rem" }} />
                        Destination
                      </label>
                      <input
                        id="destination-input"
                        type="text"
                        placeholder="e.g. Tokyo, Japan"
                        value={tripData.destination}
                        onChange={(e) => update("destination", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 1: Budget & Dates ── */}
              {step === 1 && (
                <div className="glass-card" style={{ padding: "2rem" }}>
                  <div style={{ marginBottom: "1.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <Calendar size={20} style={{ color: "var(--emerald-400)" }} />
                      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 800 }}>
                        When & Budget?
                      </h2>
                    </div>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                      Set your travel dates and total budget.
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <div className="grid-2">
                      <div className="form-group">
                        <label htmlFor="start-date">Departure Date</label>
                        <input
                          id="start-date"
                          type="date"
                          value={tripData.startDate}
                          onChange={(e) => update("startDate", e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="end-date">Return Date</label>
                        <input
                          id="end-date"
                          type="date"
                          value={tripData.endDate}
                          onChange={(e) => update("endDate", e.target.value)}
                          min={tripData.startDate || new Date().toISOString().split("T")[0]}
                        />
                      </div>
                    </div>
                    <div className="grid-2">
                      <div className="form-group">
                        <label htmlFor="currency-select">
                          <DollarSign size={13} style={{ display: "inline", marginRight: "0.35rem" }} />
                          Currency
                        </label>
                        <select
                          id="currency-select"
                          value={tripData.currency}
                          onChange={(e) => update("currency", e.target.value)}
                        >
                          {CURRENCIES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.code} — {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="budget-input">Total Budget</label>
                        <input
                          id="budget-input"
                          type="number"
                          placeholder="e.g. 3000"
                          value={tripData.budget}
                          onChange={(e) => update("budget", e.target.value)}
                          min={0}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 2: Preferences ── */}
              {step === 2 && (
                <div className="glass-card" style={{ padding: "2rem" }}>
                  <div style={{ marginBottom: "1.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <Heart size={20} style={{ color: "var(--emerald-400)" }} />
                      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 800 }}>
                        Your Interests
                      </h2>
                    </div>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                      Select what you love — AI will tailor your itinerary.
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.6rem",
                      marginBottom: "1.25rem",
                    }}
                  >
                    {PREFERENCE_TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        style={{
                          padding: "0.45rem 1rem",
                          borderRadius: "var(--radius-full)",
                          border: selectedTags.includes(tag)
                            ? "1px solid var(--emerald-400)"
                            : "1px solid var(--border-subtle)",
                          background: selectedTags.includes(tag)
                            ? "rgba(147, 51, 234, 0.2)"
                            : "rgba(255,255,255,0.03)",
                          color: selectedTags.includes(tag)
                            ? "var(--emerald-400)"
                            : "var(--text-secondary)",
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          cursor: "pointer",
                          transition: "all var(--transition-fast)",
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <div className="form-group">
                    <label htmlFor="extra-preferences">Additional Notes (optional)</label>
                    <textarea
                      id="extra-preferences"
                      placeholder="Any specific requests? Dietary restrictions, accessibility needs, must-see places..."
                      value={tripData.preferences}
                      onChange={(e) => update("preferences", e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "1.5rem",
              gap: "1rem",
            }}
          >
            <button
              className="btn btn-secondary"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
            >
              <ChevronLeft size={16} />
              Back
            </button>

            {step < STEPS.length - 1 ? (
              <button
                className="btn btn-primary"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
                id="next-step-btn"
              >
                Continue
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                id="generate-trip-btn"
                style={{ background: "var(--gradient-primary)", minWidth: 180 }}
              >
                <Sparkles size={16} />
                Generate My Itinerary
              </button>
            )}
          </div>

          {/* Trip summary pill */}
          {(tripData.origin || tripData.destination) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                marginTop: "1.25rem",
                padding: "0.6rem 1rem",
                background: "rgba(147, 51, 234, 0.08)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-full)",
                fontSize: "0.82rem",
                color: "var(--text-secondary)",
                textAlign: "center",
              }}
            >
              {tripData.origin && <span>✈️ {tripData.origin}</span>}
              {tripData.origin && tripData.destination && <span> → </span>}
              {tripData.destination && <span>📍 {tripData.destination}</span>}
              {tripData.startDate && <span> · 📅 {tripData.startDate}</span>}
              {tripData.endDate && <span> – {tripData.endDate}</span>}
              {tripData.budget && <span> · 💰 {tripData.currency} {tripData.budget}</span>}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
