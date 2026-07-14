"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, LogIn, UserPlus, Sparkles } from "lucide-react";

export default function NavBar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const isActive = (path: string) =>
    pathname === path
      ? { color: "var(--color-primary-light)" }
      : {};

  return (
    <nav className="navbar">
      <Link href="/" className="nav-logo">
        ✈ Travora
      </Link>

      <ul className="nav-links">
        {session ? (
          <>
            <li>
              <Link
                href="/plan-trip"
                className="btn btn-ghost btn-sm"
                style={isActive("/plan-trip")}
              >
                <Sparkles size={15} />
                Plan Trip
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard"
                className="btn btn-ghost btn-sm"
                style={isActive("/dashboard")}
              >
                <LayoutDashboard size={15} />
                Dashboard
              </Link>
            </li>
            <li>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="btn btn-ghost btn-sm"
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </li>
          </>
        ) : status !== "loading" ? (
          <>
            <li>
              <Link href="/auth/signin" className="btn btn-ghost btn-sm">
                <LogIn size={15} />
                Sign In
              </Link>
            </li>
            <li>
              <Link href="/auth/register" className="btn btn-primary btn-sm">
                <UserPlus size={15} />
                Get Started
              </Link>
            </li>
          </>
        ) : null}
      </ul>
    </nav>
  );
}
