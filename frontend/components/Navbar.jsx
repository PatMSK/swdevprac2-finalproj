"use client";
import Link from "next/link";
import { useAuth } from "../lib/AuthContext";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { user, role, logout } = useAuth();
  return (
    <nav>
      <div className="navwrap">
        <Link href="/" className="row" style={{ gap: 8 }}>
          <strong>BookYourBooth</strong>
        </Link>
        <Link href="/exhibitions">Exhibitions</Link>
        <div className="spacer" />
        {!user && (
          <>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </>
        )}
        {user && (
          <>
            {role === "member" && <Link href="/bookings">My Bookings</Link>}
            {role === "admin" && (
              <>
                <Link href="/admin/exhibitions">Admin Exhibitions</Link>
                <Link href="/admin/bookings">Admin Bookings</Link>
              </>
            )}
            <span className="muted" style={{ marginLeft: 8 }}>
              Hi, {user?.name} ({role})
            </span>
            <button className="btn" style={{ marginLeft: 8 }} onClick={logout}>
              Logout
            </button>
          </>
        )}
        {/* Theme toggle sits at the far right */}
        <ThemeToggle />
      </div>
    </nav>
  );
}

