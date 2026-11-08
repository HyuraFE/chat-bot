"use client";

import { useEffect } from "react";
import { App } from "@capacitor/app";

export function CapacitorListener() {
  useEffect(() => {
    const initApp = async () => {
      if (typeof window !== "undefined" && (window as any).Capacitor) {
        App.addListener("appUrlOpen", (data) => {
          console.log("App opened with URL:", data.url);
          const url = new URL(data.url);

          if (url.protocol === "com.anda.astrachat:") {
            const clerkToken = url.searchParams.get("__clerk_db_jwt");
            if (clerkToken) {
              window.location.href = `/?__clerk_db_jwt=${clerkToken}`;
            }
          }
        });
      }
    };

    initApp();
  }, []);

  return null;
}
