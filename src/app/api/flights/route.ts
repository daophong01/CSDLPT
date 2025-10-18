import { NextResponse } from "next/server";
import { searchFlights } from "@/lib/data";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.searchParams.get("origin") || undefined;
  const destination = url.searchParams.get("destination") || undefined;
  const date = url.searchParams.get("date") || undefined;

  const flights = searchFlights({ origin, destination, date });
  return NextResponse.json({ flights });
}