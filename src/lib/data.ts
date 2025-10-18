export type Flight = {
  code: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: string; // ISO
  arrivalTime: string; // ISO
  seatsAvailable: number;
};

export type Booking = {
  bookingId: string;
  flightCode: string;
  origin: string;
  destination: string;
  departureTime: string;
};

const now = new Date();
function isoAdd(hours: number) {
  const d = new Date(now.getTime() + hours * 3600 * 1000);
  return d.toISOString();
}

export const flights: Flight[] = [
  {
    code: "VN231",
    airline: "Vietnam Airlines",
    origin: "HAN",
    destination: "SGN",
    departureTime: isoAdd(24),
    arrivalTime: isoAdd(26),
    seatsAvailable: 12,
  },
  {
    code: "VJ101",
    airline: "VietJet Air",
    origin: "HAN",
    destination: "DAD",
    departureTime: isoAdd(30),
    arrivalTime: isoAdd(31.5),
    seatsAvailable: 50,
  },
  {
    code: "QH801",
    airline: "Bamboo Airways",
    origin: "SGN",
    destination: "CXR",
    departureTime: isoAdd(10),
    arrivalTime: isoAdd(11.2),
    seatsAvailable: 5,
  },
];

export function searchFlights(params: { origin?: string; destination?: string; date?: string }) {
  const { origin, destination, date } = params;
  return flights.filter((f) => {
    if (origin && f.origin !== origin) return false;
    if (destination && f.destination !== destination) return false;
    if (date) {
      const d = new Date(f.departureTime);
      const wanted = new Date(date);
      if (
        d.getFullYear() !== wanted.getFullYear() ||
        d.getMonth() !== wanted.getMonth() ||
        d.getDate() !== wanted.getDate()
      ) {
        return false;
      }
    }
    return true;
  });
}