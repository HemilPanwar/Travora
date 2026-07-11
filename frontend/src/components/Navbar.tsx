"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { Compass, Map, LogOut, User, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <motion.nav
      className="navbar"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo">
          <Compass size={22} />
          Travora
        </Link>

        <div className="navbar-links">
          {session ? (
            <>
              <Link href="/plan-trip" className="navbar-link">
                <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Map size={15} />
                  Plan Trip
                </span>
              </Link>
              <Link href="/dashboard" className="navbar-link">
                <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <LayoutDashboard size={15} />
                  Dashboard
                </span>
              </Link>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "0.5rem" }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "var(--gradient-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                  }}
                >
                  {session.user?.name?.charAt(0).toUpperCase() || <User size={14} />}
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="btn btn-ghost"
                  style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="navbar-link">
                Sign In
              </Link>
              <Link href="/register" className="btn btn-primary" style={{ padding: "0.5rem 1.2rem", fontSize: "0.875rem" }}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
