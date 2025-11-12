/* eslint-disable no-console */
"use client";

import { useEffect, useMemo, useState } from "react";
import type { ParkingSpace } from "@/data/spaces";
import type { TrafficIncident, TransportLivePayload } from "@/types/transport";

type TrafficState = {
  incidents: TrafficIncident[];
  sourceTimestamps: {
    incidents?: string;
  };
};

const defaultTrafficState: TrafficState = {
  incidents: [],
  sourceTimestamps: {},
};

export type TransportFeedStatus = "loading" | "ready" | "error";

const availabilityFromRatio = (space: ParkingSpace): ParkingSpace["availability"] => {
  const ratio = space.totalSlots ? space.openSlots / space.totalSlots : 0;
  if (ratio <= 0) return "full";
  if (ratio >= 0.6) return "high";
  if (ratio >= 0.35) return "medium";
  return "low";
};

export const useParkingFeed = (fallbackSpaces: ParkingSpace[]) => {
  const [spaces, setSpaces] = useState<ParkingSpace[]>(fallbackSpaces);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [traffic, setTraffic] = useState<TrafficState>(defaultTrafficState);
  const [status, setStatus] = useState<TransportFeedStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const updateFromPayload = (payload: TransportLivePayload) => {
      const nextSpaces = payload.parking?.length ? payload.parking : fallbackSpaces;
      setSpaces(
        nextSpaces.map((space) => ({
          ...space,
          availability: availabilityFromRatio(space),
        }))
      );
      setTraffic(payload.traffic ?? defaultTrafficState);
      setLastUpdated(new Date(payload.generatedAt ?? Date.now()));
    };

    const fetchLiveFeed = async () => {
      try {
        const response = await fetch("/api/transport/live", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Transport feed responded with ${response.status}`);
        }
        const payload: TransportLivePayload = await response.json();
        if (!isMounted) return;
        updateFromPayload(payload);
        setStatus("ready");
        setError(null);
      } catch (err) {
        console.error("Unable to refresh HKTD live feed", err);
        if (!isMounted) return;
        setStatus("error");
        setError(err instanceof Error ? err.message : "Unable to refresh feed");
        // keep showing the last successful payload but bump the timestamp
        setLastUpdated(new Date());
      }
    };

    fetchLiveFeed();
    const interval = setInterval(fetchLiveFeed, 30_000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fallbackSpaces]);

  const stats = useMemo(() => {
    if (!spaces.length) {
      return { totalSlots: 0, openSlots: 0, utilization: 0, avgRate: 0 };
    }
    const totalSlots = spaces.reduce((acc, space) => acc + space.totalSlots, 0);
    const openSlots = spaces.reduce((acc, space) => acc + space.openSlots, 0);
    const avgRate = spaces.reduce((acc, space) => acc + space.hourlyRate, 0) / spaces.length;

    return {
      totalSlots,
      openSlots,
      utilization: Math.round(((totalSlots - openSlots) / (totalSlots || 1)) * 100),
      avgRate,
    };
  }, [spaces]);

  return {
    spaces,
    lastUpdated,
    stats,
    traffic,
    status,
    error,
  };
};
