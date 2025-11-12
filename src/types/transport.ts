import type { ParkingSpace } from "@/data/spaces";

export type TrafficIncident = {
  id: string;
  title: string;
  category: string;
  region: ParkingSpace["district"];
  location?: string;
  description?: string;
  startTime?: string;
  severity: "critical" | "major" | "moderate";
};

export type TransportLivePayload = {
  generatedAt: string;
  parking: ParkingSpace[];
  traffic: {
    incidents: TrafficIncident[];
    sourceTimestamps: {
      incidents?: string;
    };
  };
};
