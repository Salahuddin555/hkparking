import type { ParkingSpace } from "@/data/spaces";
import { parkingSpaces } from "@/data/spaces";
import { findTransportSpace, TransportFeedUnavailableError } from "@/lib/transport-feed";

const staticSpaceMap = new Map(parkingSpaces.map((space) => [space.id, space]));

export async function getParkingSpaceById(id: string): Promise<ParkingSpace | undefined> {
  if (!id) return undefined;
  const normalized = id.trim();
  if (!normalized) return undefined;

  const staticMatch = staticSpaceMap.get(normalized);
  if (staticMatch) {
    return staticMatch;
  }

  try {
    return await findTransportSpace(normalized);
  } catch (error) {
    if (error instanceof TransportFeedUnavailableError) {
      throw error;
    }
    console.error(`Unable to resolve parking space ${normalized}`, error);
    return undefined;
  }
}
