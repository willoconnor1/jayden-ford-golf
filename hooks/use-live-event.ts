"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { LiveEventData } from "@/lib/types";

const POLL_INTERVAL = 5000;

export function useLiveEvent(eventId: string | null) {
  const [data, setData] = useState<LiveEventData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchEvent = useCallback(async () => {
    if (!eventId) return;
    try {
      const res = await fetch(`/api/live/events/${eventId}`);
      if (!res.ok) {
        setError("Failed to load event");
        return;
      }
      const json = await res.json();
      setData(json);
      setError(null);
    } catch {
      setError("Connection error");
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (!eventId) {
      setIsLoading(false);
      return;
    }

    fetchEvent();

    intervalRef.current = setInterval(fetchEvent, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [eventId, fetchEvent]);

  // Stop polling when event is completed
  useEffect(() => {
    if (data?.event.status === "completed" && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [data?.event.status]);

  return { data, isLoading, error, refresh: fetchEvent };
}
