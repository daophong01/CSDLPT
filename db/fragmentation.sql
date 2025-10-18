-- Fragmentation design for AirTicket (PostgreSQL)
-- Strategy:
-- - Horizontal fragmentation by region (HN, DN, HCM) for Flight/Booking/Ticket/Payment/Customer parts.
-- - Vertical fragmentation for Customer (public vs private).
-- - Global views to unify fragmented tables for application-level queries.

BEGIN;

-- 0) Create site schemas
CREATE SCHEMA IF NOT EXISTS hn;   -- Hà Nội
CREATE SCHEMA IF NOT EXISTS dn;   -- Đà Nẵng
CREATE SCHEMA IF NOT EXISTS hcm;  -- TP.HCM
CREATE SCHEMA IF NOT EXISTS sec;  -- Secure schema for private data

-- 1) Vertical fragmentation for Customer
-- Public part per site (for locality, e.g., local signup/search)
CREATE TABLE IF NOT EXISTS hn.customer_public (
  customer_id  SERIAL PRIMARY KEY,
  full_name    VARCHAR(160) NOT NULL,
  phone        VARCHAR(32)
);

CREATE TABLE IF NOT EXISTS dn.customer_public (
  customer_id  SERIAL PRIMARY KEY,
  full_name    VARCHAR(160) NOT NULL,
  phone        VARCHAR(32)
);

CREATE TABLE IF NOT EXISTS hcm.customer_public (
  customer_id  SERIAL PRIMARY KEY,
  full_name    VARCHAR(160) NOT NULL,
  phone        VARCHAR(32)
);

-- Private sensitive part (centralized secure schema)
CREATE TABLE IF NOT EXISTS sec.customer_private (
  customer_id  INT PRIMARY KEY,
  email        VARCHAR(160) NOT NULL,
  address      VARCHAR(240),
  national_id  VARCHAR(48)
);

-- Global unified Customer views
CREATE OR REPLACE VIEW public.customer_public AS
SELECT * FROM hn.customer_public
UNION ALL
SELECT * FROM dn.customer_public
UNION ALL
SELECT * FROM hcm.customer_public;

CREATE OR REPLACE VIEW public.customer AS
SELECT p.customer_id, p.full_name, p.phone, s.email, s.address, s.national_id
FROM public.customer_public p
LEFT JOIN sec.customer_private s ON s.customer_id = p.customer_id;

-- 2) Horizontal fragmentation for Flight (by origin airport region)
-- NOTE: We keep airplane/airport in public schema as reference tables.
CREATE TABLE IF NOT EXISTS hn.flight (
  flight_id      SERIAL PRIMARY KEY,
  code           VARCHAR(16) NOT NULL UNIQUE,
  from_airport   INT NOT NULL REFERENCES public.airport(airport_id),
  to_airport     INT NOT NULL REFERENCES public.airport(airport_id),
  departure_time TIMESTAMPTZ NOT NULL,
  arrival_time   TIMESTAMPTZ NOT NULL,
  airplane_id    INT NOT NULL REFERENCES public.airplane(airplane_id),
  CHECK (arrival_time > departure_time)
);

CREATE TABLE IF NOT EXISTS dn.flight (LIKE hn.flight INCLUDING ALL);
CREATE TABLE IF NOT EXISTS hcm.flight (LIKE hn.flight INCLUDING ALL);

-- Global flight view
CREATE OR REPLACE VIEW public.flight AS
SELECT * FROM hn.flight
UNION ALL
SELECT * FROM dn.flight
UNION ALL
SELECT * FROM hcm.flight;

-- 3) Horizontal fragmentation for Booking/Ticket/Payment (co-located with flight region)
CREATE TABLE IF NOT EXISTS hn.booking (
  booking_id     SERIAL PRIMARY KEY,
  flight_id      INT NOT NULL, -- references hn/dn/hcm.flight depending on region
  customer_id    INT NOT NULL, -- references hn/dn/hcm.customer_public depending on region
  status         VARCHAR(24) NOT NULL DEFAULT 'HELD',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dn.booking (LIKE hn.booking INCLUDING ALL);
CREATE TABLE IF NOT EXISTS hcm.booking (LIKE hn.booking INCLUDING ALL);

CREATE TABLE IF NOT EXISTS hn.ticket (
  ticket_id      SERIAL PRIMARY KEY,
  booking_id     INT NOT NULL REFERENCES hn.booking(booking_id) ON DELETE CASCADE,
  seat_no        VARCHAR(8),
  class          VARCHAR(16) NOT NULL DEFAULT 'ECONOMY',
  price          NUMERIC(12,2) NOT NULL CHECK (price >= 0)
);

CREATE TABLE IF NOT EXISTS dn.ticket (
  ticket_id      SERIAL PRIMARY KEY,
  booking_id     INT NOT NULL REFERENCES dn.booking(booking_id) ON DELETE CASCADE,
  seat_no        VARCHAR(8),
  class          VARCHAR(16) NOT NULL DEFAULT 'ECONOMY',
  price          NUMERIC(12,2) NOT NULL CHECK (price >= 0)
);

CREATE TABLE IF NOT EXISTS hcm.ticket (
  ticket_id      SERIAL PRIMARY KEY,
  booking_id     INT NOT NULL REFERENCES hcm.booking(booking_id) ON DELETE CASCADE,
  seat_no        VARCHAR(8),
  class          VARCHAR(16) NOT NULL DEFAULT 'ECONOMY',
  price          NUMERIC(12,2) NOT NULL CHECK (price >= 0)
);

CREATE TABLE IF NOT EXISTS hn.payment (
  payment_id     SERIAL PRIMARY KEY,
  booking_id     INT NOT NULL REFERENCES hn.booking(booking_id) ON DELETE CASCADE,
  amount         NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  currency       VARCHAR(8) NOT NULL DEFAULT 'VND',
  status         VARCHAR(24) NOT NULL DEFAULT 'PENDING',
  method         VARCHAR(24) NOT NULL DEFAULT 'CARD',
  paid_at        TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS dn.payment (LIKE hn.payment INCLUDING ALL);
CREATE TABLE IF NOT EXISTS hcm.payment (LIKE hn.payment INCLUDING ALL);

-- Global views for booking/ticket/payment
CREATE OR REPLACE VIEW public.booking AS
SELECT * FROM hn.booking
UNION ALL
SELECT * FROM dn.booking
UNION ALL
SELECT * FROM hcm.booking;

CREATE OR REPLACE VIEW public.ticket AS
SELECT * FROM hn.ticket
UNION ALL
SELECT * FROM dn.ticket
UNION ALL
SELECT * FROM hcm.ticket;

CREATE OR REPLACE VIEW public.payment AS
SELECT * FROM hn.payment
UNION ALL
SELECT * FROM dn.payment
UNION ALL
SELECT * FROM hcm.payment;

-- 4) Optional: Constraints across sites via application logic or triggers
-- Because booking.flight_id references region-local flight tables, we manage referential integrity at application/service level
-- or via cross-schema checks/triggers in a single physical cluster.

COMMIT;

-- With this fragmentation:
-- - Read queries can be routed to local site schemas (hn, dn, hcm).
-- - Global analytics/reporting can query public.* views which UNION ALL across sites.
-- - Sensitive customer info resides in sec.customer_private, joined when necessary.