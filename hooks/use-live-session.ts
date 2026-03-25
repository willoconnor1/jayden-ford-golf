"use client";

import { useState, useCallback, useEffect } from "react";

interface SessionData {
  playerId: string | null;
  isOrganizer: boolean;
  organizerSecret: string | null;
}

function getSessionKey(eventId: string) {
  return `live-session-${eventId}`;
}

function getOrganizerKey(eventId: string) {
  return `live-organizer-${eventId}`;
}

export function useLiveSession(eventId: string | null) {
  const [session, setSessionState] = useState<SessionData>({
    playerId: null,
    isOrganizer: false,
    organizerSecret: null,
  });

  // Load from localStorage on mount
  useEffect(() => {
    if (!eventId) return;
    try {
      const playerData = localStorage.getItem(getSessionKey(eventId));
      const organizerData = localStorage.getItem(getOrganizerKey(eventId));
      setSessionState({
        playerId: playerData ? JSON.parse(playerData).playerId : null,
        isOrganizer: !!organizerData,
        organizerSecret: organizerData
          ? JSON.parse(organizerData).organizerSecret
          : null,
      });
    } catch {
      // Invalid localStorage data — ignore
    }
  }, [eventId]);

  const setPlayer = useCallback(
    (playerId: string) => {
      if (!eventId) return;
      localStorage.setItem(
        getSessionKey(eventId),
        JSON.stringify({ playerId })
      );
      setSessionState((prev) => ({ ...prev, playerId }));
    },
    [eventId]
  );

  const setOrganizer = useCallback(
    (organizerSecret: string) => {
      if (!eventId) return;
      localStorage.setItem(
        getOrganizerKey(eventId),
        JSON.stringify({ organizerSecret })
      );
      setSessionState((prev) => ({
        ...prev,
        isOrganizer: true,
        organizerSecret,
      }));
    },
    [eventId]
  );

  return { ...session, setPlayer, setOrganizer };
}
