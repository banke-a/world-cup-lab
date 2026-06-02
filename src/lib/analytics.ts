import posthog from "posthog-js";

type AnalyticsProperties = Record<string, string | number | boolean | string[] | null>;

export function isAnalyticsEnabled() {
  return Boolean(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN);
}

export function trackEvent(eventName: string, properties?: AnalyticsProperties) {
  if (typeof window === "undefined" || !isAnalyticsEnabled()) {
    return;
  }

  posthog.capture(eventName, properties);
}
