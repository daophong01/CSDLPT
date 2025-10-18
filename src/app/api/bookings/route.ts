import { NextResponse } from "next/server";
import { tx } from "@/lib/db";

/**
 * GET: list bookings (basic)
 */
export async function GET() {
  const data = await tx(async (client) => {
    const res = await client.query(`
      SELECT
        b.booking_id   AS "bookingId",
        f.code         AS "flightCode",
        a1.code        AS origin,
        a2.code        AS destination,
        f.departure_time AS "departureTime",
        b.status       AS status
      FROM booking b
      JOIN flight f ON f.flight_id = b.flight_id
      JOIN airport a1 ON a1.airport_id = f.from_airport
      JOIN airport a2 ON a2.airport_id = f.to_airport
      ORDER BY b.created_at DESC
      LIMIT 200
    `);
    return res.rows;
  });

  return NextResponse.json({ bookings: data });
}

/**
 * POST: create booking with advisory lock per flight to avoid oversell under concurrency.
 * Body: { flightCode: string, customerId?: number, class?: 'ECONOMY'|'BUSINESS', price?: number }
 */
export async function POST(req: Request) {
  const body = await req.json();
  const flightCode: string = body.flightCode;
  const customerId: number = body.customerId || 1;
  const seatClass: string = body.class || "ECONOMY";
  const price: number = body.price || 1500000;

  if (!flightCode) {
    return NextResponse.json({ error: "Thiếu flightCode" }, { status: 400 });
  }

  try {
    const result = await tx(async (client) => {
      // Resolve flight_id and capacity, and lock the flight via advisory lock
      const flightRes = await client.query(`
        SELECT f.flight_id, ap.capacity
        FROM flight f
        JOIN airplane ap ON ap.airplane_id = f.airplane_id
        WHERE f.code = $1
      `, [flightCode]);

      if (flightRes.rowCount === 0) {
        throw new Error("Không tìm thấy chuyến bay");
      }
      const { flight_id, capacity } = flightRes.rows[0];

      // Advisory lock per flight to serialize bookings
      await client.query(`SELECT pg_advisory_xact_lock($1)`, [flight_id]);

      // Count sold seats (tickets linked to bookings of this flight)
      const countRes = await client.query(`
        SELECT COUNT(*)::int AS sold
        FROM ticket t
        JOIN booking b ON b.booking_id = t.booking_id
        WHERE b.flight_id = $1
      `, [flight_id]);
      const sold = countRes.rows[0].sold;

      if (sold >= capacity) {
        throw new Error("Hết ghế khả dụng");
      }

      // Create booking
      const bookingRes = await client.query(`
        INSERT INTO booking (flight_id, customer_id, status)
        VALUES ($1, $2, 'CONFIRMED')
        RETURNING booking_id
      `, [flight_id, customerId]);
      const bookingId = bookingRes.rows[0].booking_id;

      // Assign seat number as simple sequence sold+1 (for demo)
      const seatNo = `${sold + 1}`;
      await client.query(`
        INSERT INTO ticket (booking_id, seat_no, class, price)
        VALUES ($1, $2, $3, $4)
      `, [bookingId, seatNo, seatClass, price]);

      // Create payment record (mock success)
      await client.query(`
        INSERT INTO payment (booking_id, amount, currency, status, method, paid_at)
        VALUES ($1, $2, 'VND', 'SUCCESS', 'CARD', now())
      `, [bookingId, price]);

      return { bookingId };
    });

    return NextResponse.json({ message: "Tạo đặt chỗ thành công", booking: result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Lỗi tạo đặt chỗ" }, { status: 400 });
  }
}