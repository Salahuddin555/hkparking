import { NextResponse } from "next/server";

import { getSupabaseClient } from "@/lib/supabase";

const requiredFields = [
  "spaceId",
  "fullName",
  "email",
  "phone",
  "vehiclePlate",
  "arrival",
  "departure",
];

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const missing = requiredFields.filter((field) => {
      const value = payload[field];
      return typeof value !== "string" || value.trim().length === 0;
    });

    if (missing.length > 0) {
      return NextResponse.json(
        {
          status: "error",
          message: `Missing required fields: ${missing.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    const record = {
      space_id: payload.spaceId,
      full_name: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      vehicle_plate: payload.vehiclePlate,
      arrival_at: payload.arrival,
      departure_at: payload.departure,
      notes: typeof payload.notes === "string" ? payload.notes : "",
      requires_ev: Boolean(payload.requiresEv),
      submitted_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("booking_requests").insert(record);

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        {
          status: "error",
          message: error.message || "Unable to record booking request.",
        },
        { status: 500 }
      );
    }

    console.info("Booking request stored", record);

    return NextResponse.json({
      status: "ok",
      message: "Request received. Hosts typically reply within 15 minutes.",
    });
  } catch (error) {
    console.error("Booking endpoint failed:", error);
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json(
      {
        status: "error",
        message,
      },
      { status: 500 }
    );
  }
}
