import { randomUUID } from "crypto";
import { XMLParser } from "fast-xml-parser";

import type { ParkingSpace } from "@/data/spaces";
import type { TrafficIncident, TransportLivePayload } from "@/types/transport";

export class TransportFeedUnavailableError extends Error {
  constructor(message = "Unable to reach Transport Department parking feeds.") {
    super(message);
    this.name = "TransportFeedUnavailableError";
  }
}

type CachedPayload = {
  fetchedAt: number;
  payload: TransportLivePayload;
};

type FetchTransportOptions = {
  bypassCache?: boolean;
};

const CACHE_TTL_MS = 30_000;
let cached: CachedPayload | null = null;

const CARPARK_INFO_URL = "https://api.data.gov.hk/v1/carpark-info-vacancy?data=info";
const CARPARK_VACANCY_URL = "https://api.data.gov.hk/v1/carpark-info-vacancy?data=vacancy";
const TRAFFIC_NEWS_URL = "https://resource.data.one.gov.hk/td/en/specialtrafficnews.xml";

const trafficParser = new XMLParser({
  ignoreAttributes: false,
  trimValues: true,
});

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80",
];

const REGION_MAP: Record<string, ParkingSpace["district"]> = {
  HK: "Hong Kong Island",
  HKI: "Hong Kong Island",
  "HONG KONG": "Hong Kong Island",
  "HONG KONG ISLAND": "Hong Kong Island",
  ISLAND: "Hong Kong Island",
  KLN: "Kowloon",
  KOWLOON: "Kowloon",
  NT: "New Territories",
  "NEW TERRITORIES": "New Territories",
  "NEW TERRITORY": "New Territories",
};

const REGION_HINTS: Array<{ district: ParkingSpace["district"]; keywords: string[] }> = [
  {
    district: "Hong Kong Island",
    keywords: ["central", "sheung wan", "sai ying pun", "wan chai", "causeway bay", "north point", "belcher", "pok fu lam", "happy valley"],
  },
  {
    district: "Kowloon",
    keywords: ["kowloon", "yau tong", "tsim sha tsui", "mong kok", "sham shui po", "kwun tong", "kowloon bay", "hung hom", "yau ma tei", "cheung sha wan"],
  },
  {
    district: "New Territories",
    keywords: ["yuen long", "tuen mun", "tin shui wai", "sha tin", "tai po", "fanling", "sheung shui", "sai kung", "tsuen wan", "ma on shan"],
  },
];

const availabilityFromRatio = (ratio: number): ParkingSpace["availability"] => {
  if (ratio <= 0) return "full";
  if (ratio >= 0.6) return "high";
  if (ratio >= 0.35) return "medium";
  if (ratio > 0) return "low";
  return "full";
};

const toDistrict = (region?: string, districtName?: string): ParkingSpace["district"] => {
  const regionKey = region?.trim().toUpperCase();
  if (regionKey && REGION_MAP[regionKey]) {
    return REGION_MAP[regionKey];
  }
  const districtKey = districtName?.trim().toUpperCase();
  if (districtKey?.includes("KOWLOON")) return "Kowloon";
  if (districtKey?.includes("ISLAND")) return "Hong Kong Island";
  if (districtKey?.includes("NEW")) return "New Territories";
  return "Hong Kong Island";
};

const pseudoRandom = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) & 0xffffffff;
  }
  return (hash >>> 0) / 0xffffffff;
};

const pickImage = (seed: string) => {
  const idx = Math.floor(pseudoRandom(seed) * FALLBACK_IMAGES.length);
  return FALLBACK_IMAGES[idx] ?? FALLBACK_IMAGES[0];
};

const deriveHost = (nature?: string, name?: string) => {
  if (nature) {
    const label = nature.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
    return `${label} operator`;
  }
  if (name) {
    return `${name.split(" ")[0]} management`;
  }
  return "Transport Department";
};

const deriveHourlyRate = (info: any) => {
  const price = info?.privateCar?.hourlyCharges?.[0]?.price ?? info?.privateCar?.hourlyCharges?.[0]?.usageThresholds?.[0]?.price;
  if (typeof price === "number" && price > 0) return Math.round(price);
  const fallback = 20 + Math.round(pseudoRandom(info?.park_Id ?? info?.name ?? "rate") * 25);
  return fallback;
};

const deriveClearance = (info: any) => {
  const height = info?.heightLimits?.[0]?.height;
  if (typeof height === "number" && height > 0) {
    return `${height.toFixed(1)}m`;
  }
  return "2.2m";
};

const hasEvCharger = (info: any) => {
  const facilities: string[] | undefined = info?.facilities;
  if (!facilities) return false;
  return facilities.some((facility) => facility.toLowerCase().includes("ev"));
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const toArray = <T>(value: T | T[] | undefined) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const inferRegionFromText = (text?: string): ParkingSpace["district"] => {
  if (!text) return "Hong Kong Island";
  const normalized = text.toLowerCase();
  for (const hint of REGION_HINTS) {
    if (hint.keywords.some((keyword) => normalized.includes(keyword))) {
      return hint.district;
    }
  }
  if (normalized.includes("kowloon")) return "Kowloon";
  if (normalized.includes("new territories") || normalized.includes("nt")) return "New Territories";
  return "Hong Kong Island";
};

const parseReferenceDate = (value?: string) => {
  if (!value) return null;
  const trimmed = value.trim().replace(/\s+/g, " ");
  const parts = trimmed.split(" ");
  if (parts.length < 3) return null;
  const [datePart, periodPart, timePart] = parts;
  const [rawHours, rawMinutes, rawSeconds] = timePart.split(":").map((segment) => parseInt(segment, 10));
  if (Number.isNaN(rawHours) || Number.isNaN(rawMinutes) || Number.isNaN(rawSeconds)) return null;

  const period = periodPart.toLowerCase();
  let hours = rawHours;
  if ((period.includes("下午") || period.includes("晚上")) && hours < 12) hours += 12;
  if (period.includes("上午") && hours === 12) hours = 0;
  const iso = `${datePart.replace(/\//g, "-")}T${String(hours).padStart(2, "0")}:${String(rawMinutes).padStart(2, "0")}:${String(rawSeconds).padStart(2, "0")}+08:00`;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
};

const severityFromStatus = (status?: number): TrafficIncident["severity"] => {
  if (status === 1) return "critical";
  if (status === 2) return "major";
  return "moderate";
};

const cleanText = (value?: string) => value?.replace(/\s+/g, " ").trim();

const deriveLocation = (text?: string) => {
  if (!text) return undefined;
  const cleaned = cleanText(text);
  if (!cleaned) return undefined;
  const [firstSentence] = cleaned.split(".").map((segment) => segment.trim()).filter(Boolean);
  return firstSentence;
};

const normalizeParkingSpaces = (infoData: any, vacancyData: any): ParkingSpace[] => {
  const infoMap = new Map<string, any>();
  (infoData?.results ?? []).forEach((record: any) => {
    if (record?.park_Id) {
      infoMap.set(record.park_Id, record);
    }
  });

  const spaces: ParkingSpace[] = [];

  (vacancyData?.results ?? []).forEach((vacancyRecord: any) => {
    const info = infoMap.get(vacancyRecord?.park_Id);
    if (!info) return;
    if (typeof info.latitude !== "number" || typeof info.longitude !== "number") return;

    const privateCarVacancy = Array.isArray(vacancyRecord?.privateCar) ? vacancyRecord.privateCar[0] : null;
    const openSlotsRaw = typeof privateCarVacancy?.vacancy === "number" ? privateCarVacancy.vacancy : -1;
    const openSlots = openSlotsRaw >= 0 ? openSlotsRaw : Math.max(0, info?.privateCar?.space ?? 0);
    const totalSlotsCandidate = info?.privateCar?.space ?? info?.privateCar?.spaceUNL ?? info?.privateCar?.spaceEV ?? info?.privateCar?.spaceDIS ?? 0;
    const totalSlots = totalSlotsCandidate > 0 ? totalSlotsCandidate : clamp(Math.round(openSlots * 1.4) || 12, 8, 500);
    const availability = availabilityFromRatio(totalSlots ? openSlots / totalSlots : 0);

    spaces.push({
      id: vacancyRecord.park_Id,
      title: info.name ?? "Transport Department Carpark",
      host: deriveHost(info.nature, info.name),
      district: toDistrict(info?.address?.region, info?.district),
      address: info.displayAddress ?? info?.address?.streetName ?? "Hong Kong",
      hourlyRate: deriveHourlyRate(info),
      evFriendly: hasEvCharger(info),
      clearance: deriveClearance(info),
      availability,
      totalSlots,
      openSlots: clamp(openSlots, 0, totalSlots),
      rating: Math.round((4 + pseudoRandom(vacancyRecord.park_Id) * 0.9) * 10) / 10,
      reviews: 40 + Math.round(pseudoRandom(`${vacancyRecord.park_Id}-reviews`) * 350),
      lat: info.latitude,
      lng: info.longitude,
      image: pickImage(vacancyRecord.park_Id),
    });
  });

  return spaces.slice(0, 80);
};

const normalizeTrafficIncidents = (xmlPayload: string | null): { incidents: TrafficIncident[]; timestamp?: string } => {
  if (!xmlPayload) return { incidents: [], timestamp: undefined };
  let parsed: any;
  try {
    parsed = trafficParser.parse(xmlPayload);
  } catch (error) {
    console.error("Unable to parse special traffic news XML", error);
    return { incidents: [], timestamp: undefined };
  }
  const messages = toArray(parsed?.body?.message);
  if (!messages.length) return { incidents: [], timestamp: undefined };

  const incidents: TrafficIncident[] = messages.map((message: any) => {
    const english = cleanText(message?.EngText) ?? cleanText(message?.EngShort) ?? "";
    const title = cleanText(message?.EngShort) ?? cleanText(message?.EngText) ?? `Special traffic news ${message?.msgID ?? ""}`;
    const severity = severityFromStatus(typeof message?.CurrentStatus === "number" ? message.CurrentStatus : Number(message?.CurrentStatus));
    const region = inferRegionFromText(english);
    const startTime = parseReferenceDate(message?.ReferenceDate ?? message?.referenceDate);
    const category = cleanText(message?.IncidentRefNo) || (severity === "critical" ? "Critical incident" : severity === "major" ? "Major delay" : "Advisory");

    return {
      id: String(message?.msgID ?? randomUUID()),
      title: title ?? "Special traffic news",
      category,
      region,
      location: deriveLocation(english),
      description: english,
      startTime: startTime ?? undefined,
      severity,
    };
  });

  const timestamp = incidents[0]?.startTime;
  return { incidents, timestamp };
};

const fetchJson = async <T>(url: string): Promise<T | null> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch(url, { cache: "no-store", signal: controller.signal });
    if (!response.ok) {
      console.error(`Transport API error ${response.status} for ${url}`);
      return null;
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error(`Transport API request failed for ${url}`, error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

const fetchTrafficNews = async (): Promise<string | null> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch(`${TRAFFIC_NEWS_URL}?_=${Date.now()}`, { cache: "no-store", signal: controller.signal });
    if (!response.ok) {
      console.error(`Transport traffic news error ${response.status}`);
      return null;
    }
    return await response.text();
  } catch (error) {
    console.error("Transport traffic news request failed", error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

const buildTransportLivePayload = async (): Promise<TransportLivePayload> => {
  const [infoData, vacancyData, trafficNewsXml] = await Promise.all([
    fetchJson(CARPARK_INFO_URL),
    fetchJson(CARPARK_VACANCY_URL),
    fetchTrafficNews(),
  ]);

  if (!infoData || !vacancyData) {
    throw new TransportFeedUnavailableError();
  }

  const parking = normalizeParkingSpaces(infoData, vacancyData);
  const { incidents, timestamp: incidentsTimestamp } = normalizeTrafficIncidents(trafficNewsXml);

  return {
    generatedAt: new Date().toISOString(),
    parking,
    traffic: {
      incidents,
      sourceTimestamps: {
        incidents: incidentsTimestamp,
      },
    },
  };
};

export async function fetchTransportLivePayload(options: FetchTransportOptions = {}): Promise<TransportLivePayload> {
  const bypassCache = options.bypassCache ?? false;
  if (!bypassCache && cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.payload;
  }

  const payload = await buildTransportLivePayload();
  cached = { payload, fetchedAt: Date.now() };
  return payload;
}

export async function findTransportSpace(id: string): Promise<ParkingSpace | undefined> {
  if (!id) return undefined;
  const payload = await fetchTransportLivePayload();
  return payload.parking.find((space) => space.id === id);
}
