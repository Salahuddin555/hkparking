"use client";

import { useEffect, useMemo, useState } from "react";
import type { ParkingSpace } from "@/data/spaces";

const randomBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const useParkingFeed = (spaces: ParkingSpace[]) => {
  const [adaptiveSpaces, setAdaptiveSpaces] = useState(spaces);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setAdaptiveSpaces((prev) =>
        prev.map((space) => {
          const delta = randomBetween(-2, 2);
          const nextOpen = Math.min(space.totalSlots, Math.max(0, space.openSlots + delta));
          const availability =
            nextOpen === 0
              ? "full"
              : nextOpen / space.totalSlots > 0.6
              ? "high"
              : nextOpen / space.totalSlots > 0.35
              ? "medium"
              : "low";

          return {
            ...space,
            openSlots: nextOpen,
            availability,
          };
        })
      );
      setLastUpdated(new Date());
    }, 5500);

    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    const totalSlots = adaptiveSpaces.reduce((acc, space) => acc + space.totalSlots, 0);
    const openSlots = adaptiveSpaces.reduce((acc, space) => acc + space.openSlots, 0);
    const avgRate = adaptiveSpaces.reduce((acc, space) => acc + space.hourlyRate, 0) / adaptiveSpaces.length;

    return {
      totalSlots,
      openSlots,
      utilization: Math.round(((totalSlots - openSlots) / totalSlots) * 100),
      avgRate,
    };
  }, [adaptiveSpaces]);

  return { spaces: adaptiveSpaces, lastUpdated, stats };
};
