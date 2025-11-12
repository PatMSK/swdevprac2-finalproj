"use client";
import "./globals.css";
import Navbar from "../components/Navbar";
import { AuthProvider } from "../lib/AuthContext";
import ThemeProvider from "../components/ThemeProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <div className="container">{children}</div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

