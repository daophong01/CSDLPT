-- Sample data for public (non-fragmented) schema

BEGIN;

-- Airports
INSERT INTO airport (code, name, city, country) VALUES
('HAN', 'Noi Bai International Airport', 'Hanoi', 'Vietnam'),
('DAD', 'Da Nang International Airport', 'Da Nang', 'Vietnam'),
('SGN', 'Tan Son Nhat International Airport', 'Ho Chi Minh City', 'Vietnam')
ON CONFLICT (code) DO NOTHING;

-- Branches
INSERT INTO branch (name, airport_id, address)
SELECT 'Chi nhánh Hà Nội', airport_id, 'Hà Nội'
FROM airport WHERE code = 'HAN'
ON CONFLICT DO NOTHING;

INSERT INTO branch (name, airport_id, address)
SELECT 'Chi nhánh Đà Nẵng', airport_id, 'Đà Nẵng'
FROM airport WHERE code = 'DAD'
ON CONFLICT DO NOTHING;

INSERT INTO branch (name, airport_id, address)
SELECT 'Chi nhánh TP.HCM', airport_id, 'TP.HCM'
FROM airport WHERE code = 'SGN'
ON CONFLICT DO NOTHING;

-- Airplanes
INSERT INTO airplane (model, capacity) VALUES
('A321', 190),
('B787', 240),
('A320', 180)
ON CONFLICT DO NOTHING;

-- Customers (public + private)
INSERT INTO customer_public (full_name, phone) VALUES
('Nguyen Van A', '0901234567'),
('Tran Thi B', '0912345678');

INSERT INTO customer_private (customer_id, email, address, national_id)
SELECT p.customer_id, 'a@example.com', 'Hà Nội', '0123456789'
FROM customer_public p WHERE p.full_name = 'Nguyen Van A'
ON CONFLICT DO NOTHING;

INSERT INTO customer_private (customer_id, email, address, national_id)
SELECT p.customer_id, 'b@example.com', 'Hà Nội', '9876543210'
FROM customer_public p WHERE p.full_name = 'Tran Thi B'
ON CONFLICT DO NOTHING;

-- Flights
INSERT INTO flight (code, from_airport, to_airport, departure_time, arrival_time, airplane_id)
SELECT 'VN231', a1.airport_id, a2.airport_id, now() + interval '1 day', now() + interval '1 day 2 hours', ap.airplane_id
FROM airport a1, airport a2, airplane ap
WHERE a1.code='HAN' AND a2.code='SGN' AND ap.model='A321'
ON CONFLICT (code) DO NOTHING;

INSERT INTO flight (code, from_airport, to_airport, departure_time, arrival_time, airplane_id)
SELECT 'VJ101', a1.airport_id, a2.airport_id, now() + interval '30 hours', now() + interval '31.5 hours', ap.airplane_id
FROM airport a1, airport a2, airplane ap
WHERE a1.code='HAN' AND a2.code='DAD' AND ap.model='A320'
ON CONFLICT (code) DO NOTHING;

INSERT INTO flight (code, from_airport, to_airport, departure_time, arrival_time, airplane_id)
SELECT 'QH801', a1.airport_id, a2.airport_id, now() + interval '10 hours', now() + interval '11.2 hours', ap.airplane_id
FROM airport a1, airport a2, airplane ap
WHERE a1.code='SGN' AND a2.code='CXR' AND ap.model='B787'
ON CONFLICT (code) DO NOTHING;

COMMIT;