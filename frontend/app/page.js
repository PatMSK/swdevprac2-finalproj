"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => { router.replace("/exhibitions"); }, [router]);
  return <div className="panel">Redirecting to exhibitions...</div>;
}

