-- Sample data for AirTicket (PostgreSQL)

BEGIN;

-- Airports
INSERT INTO airport (code, name, city, country) VALUES
('HAN', 'Noi Bai International Airport', 'Hanoi', 'Vietnam'),
('DAD', 'Da Nang International Airport', 'Da Nang', 'Vietnam'),
('SGN', 'Tan Son Nhat International Airport', 'Ho Chi Minh City', 'Vietnam');

-- Branches
INSERT INTO branch (name, airport_id, address)
SELECT 'Chi nhánh Hà Nội', airport_id, 'Hà Nội'
FROM airport WHERE code = 'HAN';

INSERT INTO branch (name, airport_id, address)
SELECT 'Chi nhánh Đà Nẵng', airport_id, 'Đà Nẵng'
FROM airport WHERE code = 'DAD';

INSERT INTO branch (name, airport_id, address)
SELECT 'Chi nhánh TP.HCM', airport_id, 'TP.HCM'
FROM airport WHERE code = 'SGN';

-- Airplanes
INSERT INTO airplane (model, capacity) VALUES
('A321', 190),
('B787', 240),
('A320', 180);

-- Customers (public + private)
-- HN site
INSERT INTO hn.customer_public (full_name, phone) VALUES
('Nguyen Van A', '0901234567'),
('Tran Thi B', '0912345678');

-- Link private info (assumes lastval-like retrieval; in sample we join by names)
INSERT INTO sec.customer_private (customer_id, email, address, national_id)
SELECT p.customer_id, 'a@example.com', 'Hà Nội', '0123456789'
FROM hn.customer_public p WHERE p.full_name = 'Nguyen Van A';

INSERT INTO sec.customer_private (customer_id, email, address, national_id)
SELECT p.customer_id, 'b@example.com', 'Hà Nội', '9876543210'
FROM hn.customer_public p WHERE p.full_name = 'Tran Thi B';

-- Flights per site
-- HN flights
INSERT INTO hn.flight (code, from_airport, to_airport, departure_time, arrival_time, airplane_id)
SELECT 'VN231', a1.airport_id, a2.airport_id, now() + interval '1 day', now() + interval '1 day 2 hours', ap.airplane_id
FROM airport a1, airport a2, airplane ap
WHERE a1.code='HAN' AND a2.code='SGN' AND ap.model='A321'
LIMIT 1;

-- DN flights
INSERT INTO dn.flight (code, from_airport, to_airport, departure_time, arrival_time, airplane_id)
SELECT 'VJ101', a1.airport_id, a2.airport_id, now() + interval '30 hours', now() + interval '31.5 hours', ap.airplane_id
FROM airport a1, airport a2, airplane ap
WHERE a1.code='DAD' AND a2.code='HAN' AND ap.model='A320'
LIMIT 1;

-- HCM flights
INSERT INTO hcm.flight (code, from_airport, to_airport, departure_time, arrival_time, airplane_id)
SELECT 'QH801', a1.airport_id, a2.airport_id, now() + interval '10 hours', now() + interval '11.2 hours', ap.airplane_id
FROM airport a1, airport a2, airplane ap
WHERE a1.code='SGN' AND a2.code='CXR' AND ap.model='B787'
LIMIT 1;

-- Bookings in HN
INSERT INTO hn.booking (flight_id, customer_id, status)
SELECT f.flight_id, c.customer_id, 'HELD'
FROM hn.flight f, hn.customer_public c
WHERE f.code='VN231' AND c.full_name='Nguyen Van A'
LIMIT 1;

-- Ticket for booking
INSERT INTO hn.ticket (booking_id, seat_no, class, price)
SELECT b.booking_id, '12A', 'ECONOMY', 1500000
FROM hn.booking b
JOIN hn.flight f ON f.flight_id = b.flight_id
WHERE f.code='VN231'
LIMIT 1;

-- Payment for booking
INSERT INTO hn.payment (booking_id, amount, currency, status, method, paid_at)
SELECT b.booking_id, 1500000, 'VND', 'SUCCESS', 'CARD', now()
FROM hn.booking b
JOIN hn.flight f ON f.flight_id = b.flight_id
WHERE f.code='VN231'
LIMIT 1;

COMMIT;

-- Verify global views (example queries):
-- SELECT * FROM public.flight;
-- SELECT * FROM public.booking;
-- SELECT * FROM public.customer;