import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const res = await query(`
    SELECT flight_id AS "flightId", flight_code AS "flightCode", origin, destination, departure, arrival, airplane_hash AS "airplaneHash", last_event_tx AS "lastEventTx"
    FROM flight_mirror
    ORDER BY departure ASC
    LIMIT 500
  `);
  return NextResponse.json({ flights: res.rows });
}