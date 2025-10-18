import { NextResponse } from "next/server";

let bookings: any[] = [];

export async function GET() {
  return NextResponse.json({ bookings });
}

export async function POST(req: Request) {
  const body = await req.json();
  const booking = {
    bookingId: Math.random().toString(36).slice(2, 8).toUpperCase(),
    ...body,
  };
  bookings.push(booking);
  return NextResponse.json({ message: "Tạo đặt chỗ thành công", booking });
}