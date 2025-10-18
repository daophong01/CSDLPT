import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.searchParams.get("origin");
  const destination = url.searchParams.get("destination");
  const date = url.searchParams.get("date"); // YYYY-MM-DD

  const params: any[] = [];
  const where: string[] = [];
  if (origin) {
    params.push(origin);
    where.push(`a1.code = ${params.length}`);
  }
  if (destination) {
    params.push(destination);
    where.push(`a2.code = ${params.length}`);
  }
  if (date) {
    params.push(date);
    where.push(`DATE(f.departure_time AT TIME ZONE 'UTC') = ${params.length}`);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const sql = `
    SELECT
      f.code,
      a1.code AS origin,
      a2.code AS destination,
      f.departure_time AS "departureTime",
      f.arrival_time   AS "arrivalTime",
      ap.model         AS airline,   -- use model as placeholder
      ap.capacity      AS "capacity"
    FROM flight f
    JOIN airport a1 ON a1.airport_id = f.from_airport
    JOIN airport a2 ON a2.airport_id = f.to_airport
    JOIN airplane ap ON ap.airplane_id = f.airplane_id
    ${whereSql}
    ORDER BY f.departure_time ASC
    LIMIT 200
  `;

  const res = await query(sql, params);
  const flights = res.rows.map((r) => ({
    ...r,
    seatsAvailable: r.capacity, // placeholder; real availability computed at booking
  }));

  return NextResponse.json({ flights });
}