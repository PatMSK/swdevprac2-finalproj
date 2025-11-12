"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../lib/AuthContext";

export default function Protected({ children, role }) {
  const { user, role: myRole, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/login");
      else if (role && myRole !== role) router.replace("/");
    }
  }, [user, myRole, loading, role, router]);
  if (!user && !loading) return null;
  if (role && myRole !== role) return null;
  return children;
}

