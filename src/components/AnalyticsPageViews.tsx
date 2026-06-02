"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

export function AnalyticsPageViews() {
  const pathname = usePathname();

  useEffect(() => {
    trackEvent("$pageview", {
      path: pathname,
      url: window.location.href,
    });
  }, [pathname]);

  return null;
}
