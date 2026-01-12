'use client';

import { useEffect } from "react";
import { track } from "@vercel/analytics";

export default function AnalyticsEvents() {
  useEffect(() => {
    // Track page load
    track('page_load');

    // Example: You could add more global events here
    // track('user_opened_app');
  }, []);

  return null; // no UI
}
