import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  if (!id) return NextResponse.json({ error: "Missing ticket id" }, { status: 400 });

  const res = await query(
    `SELECT
      t.ticket_id     AS "ticketId",
      t.flight_id     AS "flightId",
      t.owner         AS "owner",
      t.class         AS "class",
      t.status        AS "status",
      t.price         AS "price",
      t.last_event_tx AS "lastEventTx"
    FROM ticket_mirror t
    WHERE t.ticket_id = $1
    LIMIT 1
    `,
    [id]
  );

  if (res.rowCount === 0) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  const ticket = res.rows[0];

  // Optionally join flight info
  const f = await query(
    `SELECT flight_code AS "flightCode", origin, destination, departure, arrival
     FROM flight_mirror WHERE flight_id = $1`,
    [ticket.flightId]
  );
  const flight = f.rowCount ? f.rows[0] : null;

  return NextResponse.json({ ticket, flight });
}