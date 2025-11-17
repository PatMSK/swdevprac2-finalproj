"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../lib/AuthContext";
import ThemeToggle from "./ThemeToggle";

const NAV_LINKS = [
  { href: "/exhibitions", label: "Exhibitions", shouldShow: () => true },
  { href: "/login", label: "Login", shouldShow: ({ user }) => !user },
  { href: "/register", label: "Register", shouldShow: ({ user }) => !user },
  { href: "/bookings", label: "My Bookings", shouldShow: ({ role }) => role === "member" || role === "admin" },
  { href: "/admin/exhibitions", label: "Admin Exhibitions", shouldShow: ({ role }) => role === "admin" },
  { href: "/admin/bookings", label: "Admin Bookings", shouldShow: ({ role }) => role === "admin" },
];

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    // Close mobile menu when navigating to a new route
    closeMenu();
  }, [pathname]);

  const handleLogout = () => {
    closeMenu();
    logout();
  };

  const visibleLinks = NAV_LINKS.filter((link) => link.shouldShow({ user, role }));

  return (
    <nav className={`navbar ${menuOpen ? "menu-open" : ""}`} aria-label="Primary navigation">
      <div className="navwrap">
        <Link href="/exhibitions" className="nav-brand" onClick={closeMenu}>
          {/* <span className="brand-marker" aria-hidden /> */}
          <span className="brand-name">BookYourBooth</span>
        </Link>

        <div className="nav-links nav-links-desktop" id="primary-navigation">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${isActive(link.href) ? "active" : ""}`}
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="nav-actions">
          {user && (
            <div className="nav-user desktop-only">
              <span className="muted">Hello,</span>
              <strong>{user?.name}</strong>
              <button className="btn btn-ghost" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
          <ThemeToggle />
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span aria-hidden>{menuOpen ? "✕" : "☰"}</span>
            <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </div>

      <div className={`mobile-menu ${menuOpen ? "open" : ""}`} id="mobile-navigation">
        <div className="nav-links nav-links-mobile">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${isActive(link.href) ? "active" : ""}`}
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <div className="nav-mobile-actions">
              <div className="muted">Hello, {user?.name}</div>
              <button className="btn btn-ghost" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

