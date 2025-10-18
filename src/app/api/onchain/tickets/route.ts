import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const res = await query(`
    SELECT ticket_id AS "ticketId", flight_id AS "flightId", owner, class, status, price, last_event_tx AS "lastEventTx"
    FROM ticket_mirror
    ORDER BY ticket_id::numeric ASC
    LIMIT 500
  `);
  return NextResponse.json({ tickets: res.rows });
}