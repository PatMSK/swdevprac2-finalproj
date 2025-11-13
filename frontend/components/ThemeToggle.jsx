"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const current = theme === "system" ? systemTheme : theme;
  const isDark = current === "dark";

  return (
    <button
      className="theme-toggle btn"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      // style={{ marginLeft: 12 }}
    >
      {isDark ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}
