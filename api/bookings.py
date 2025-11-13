from __future__ import annotations

import os
from datetime import datetime
from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr, Field, validator
from supabase import Client, create_client


def get_supabase_client() -> Client:
  url = os.environ.get("SUPABASE_URL")
  key = os.environ.get("SUPABASE_ANON_KEY")
  if not url or not key:
    raise RuntimeError("SUPABASE_URL and SUPABASE_ANON_KEY must be set.")
  return create_client(url, key)


supabase = get_supabase_client()


class BookingPayload(BaseModel):
  spaceId: str = Field(..., min_length=2)
  fullName: str = Field(..., min_length=2)
  email: EmailStr
  phone: str = Field(..., min_length=4)
  vehiclePlate: str = Field(..., min_length=3, max_length=20)
  arrival: datetime
  departure: datetime
  notes: str | None = ""
  requiresEv: bool = False

  @validator("departure")
  def validate_departure(cls, departure: datetime, values: dict[str, Any]):  # noqa: D417
    arrival: datetime | None = values.get("arrival")
    if arrival and departure <= arrival:
      raise ValueError("Departure must be later than arrival")
    return departure


app = FastAPI(title="HarborPark Booking API")


@app.post("/")
def create_booking(payload: BookingPayload):
  record = {
    "space_id": payload.spaceId,
    "full_name": payload.fullName,
    "email": payload.email,
    "phone": payload.phone,
    "vehicle_plate": payload.vehiclePlate.upper(),
    "arrival_at": payload.arrival.isoformat(),
    "departure_at": payload.departure.isoformat(),
    "notes": (payload.notes or "").strip(),
    "requires_ev": bool(payload.requiresEv),
    "submitted_at": datetime.utcnow().isoformat(),
  }

  try:
    response = supabase.table("booking_requests").insert(record).execute()
  except Exception as exc:  # pylint: disable=broad-except
    raise HTTPException(status_code=500, detail="Unable to record booking request.") from exc

  if getattr(response, "error", None):
    raise HTTPException(status_code=500, detail=response.error.get("message", "Supabase error."))

  return {
    "status": "ok",
    "message": "Request received. Hosts typically reply within 15 minutes.",
  }
