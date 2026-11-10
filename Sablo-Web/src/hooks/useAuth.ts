"use client";
import { useEffect, useState } from "react";

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null = هنوز چک نشده

  useEffect(() => {
    try {
      setIsLoggedIn(!!localStorage.getItem("token"));
    } catch {
      setIsLoggedIn(false);
    }
  }, []);

  return { isLoggedIn, loading: isLoggedIn === null };
}
