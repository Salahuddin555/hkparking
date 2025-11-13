import { NextResponse } from "next/server";

import { fetchTransportLivePayload, TransportFeedUnavailableError } from "@/lib/transport-feed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = await fetchTransportLivePayload();
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof TransportFeedUnavailableError) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 502 }
      );
    }
    console.error("Transport live route failed", error);
    return NextResponse.json(
      {
        error: "Unable to fetch transport feed.",
      },
      { status: 500 }
    );
  }
}
