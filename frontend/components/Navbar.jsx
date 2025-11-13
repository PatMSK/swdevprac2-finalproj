"use client";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../lib/AuthContext";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);
  const handleLogout = () => {
    closeMenu();
    logout();
  };

  return (
    <nav>
      <div className="navwrap">
        <div className="nav-head">
          <Link href="/" className="row" style={{ gap: 8 }} onClick={closeMenu}>
            <strong>BookYourBooth</strong>
          </Link>
          <button
            type="button"
            className="nav-toggle btn"
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={toggleMenu}
          >
            {menuOpen ? "Close Menu" : "Menu"}
          </button>
        </div>
        <div className={`nav-links ${menuOpen ? "open" : ""}`} id="primary-navigation">
          <Link href="/exhibitions" onClick={closeMenu}>Exhibitions</Link>
          {!user && (
            <>
              <Link href="/login" onClick={closeMenu}>Login</Link>
              <Link href="/register" onClick={closeMenu}>Register</Link>
            </>
          )}
          {user && (
            <>
              {role === "member" && <Link href="/bookings" onClick={closeMenu}>My Bookings</Link>}
              {role === "admin" && (
                <>
                  <Link href="/admin/exhibitions" onClick={closeMenu}>Admin Exhibitions</Link>
                  <Link href="/admin/bookings" onClick={closeMenu}>Admin Bookings</Link>
                </>
              )}
              <span className="muted">Hi, {user?.name}</span>
              <button className="btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

