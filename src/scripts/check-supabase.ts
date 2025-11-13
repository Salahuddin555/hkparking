const payload = {
  spaceId: "health-check",
  fullName: "CLI Health Check",
  email: "healthcheck@example.com",
  phone: "+85200000000",
  vehiclePlate: "CHK-000",
  arrival: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  departure: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  notes: "Automated connectivity check. Safe to delete.",
  requiresEv: false,
};

const endpoint =
  process.env.BOOKINGS_ENDPOINT ?? process.env.NEXT_PUBLIC_BOOKINGS_ENDPOINT ?? "http://localhost:8000";

async function main() {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(`Supabase check failed (${response.status}): ${body?.message ?? "Unknown error"}`);
  }

  console.log("HTTP status:", response.status);
  console.log("Response body:", body);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
