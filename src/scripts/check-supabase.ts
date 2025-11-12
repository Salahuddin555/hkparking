import { POST } from "@/app/api/bookings/route";

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

async function main() {
  const request = new Request("http://localhost/api/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const response = await POST(request);
  const body = await response.json();

  console.log("HTTP status:", response.status);
  console.log("Response body:", body);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
