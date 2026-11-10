"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    try {
      if (localStorage.getItem("token")) {
        router.replace("/dashboard");
      }
    } catch {}
  }, [router]);

  return null;
}
