-- Schema: AirTicket Distributed Database (PostgreSQL)
-- Logical entities: Airport, Airplane, Flight, Customer, Booking, Ticket, Payment, Branch, Employee
-- Notes:
-- - This is the global logical schema (not the fragmented physical layout).
-- - Foreign keys reference global identifiers; fragmentation will be defined in db/fragmentation.sql.

BEGIN;

-- 1) Core reference tables
CREATE TABLE airport (
  airport_id   SERIAL PRIMARY KEY,
  code         VARCHAR(8)  NOT NULL UNIQUE,     -- IATA code (e.g., HAN, DAD, SGN)
  name         VARCHAR(120) NOT NULL,
  city         VARCHAR(120) NOT NULL,
  country      VARCHAR(120) NOT NULL
);

CREATE TABLE branch (
  branch_id    SERIAL PRIMARY KEY,
  name         VARCHAR(120) NOT NULL,
  airport_id   INT NOT NULL REFERENCES airport(airport_id),
  address      VARCHAR(240)
);

CREATE TABLE airplane (
  airplane_id  SERIAL PRIMARY KEY,
  model        VARCHAR(120) NOT NULL,           -- e.g., A321, B787
  capacity     INT NOT NULL CHECK (capacity > 0)
);

-- 2) Customer vertical fragmentation will be defined physically in fragmentation.sql
--    Here we keep the logical view of Customer as a join of public+private parts.
--    Creating logical tables for clarity; in practice they will be views.
CREATE TABLE customer_public (
  customer_id  SERIAL PRIMARY KEY,
  full_name    VARCHAR(160) NOT NULL,
  phone        VARCHAR(32)
);

CREATE TABLE customer_private (
  customer_id  INT PRIMARY KEY REFERENCES customer_public(customer_id) ON DELETE CASCADE,
  email        VARCHAR(160) NOT NULL,
  address      VARCHAR(240),
  national_id  VARCHAR(48)  -- CCCD/Passport
);

-- 3) Flight, Booking, Ticket, Payment
CREATE TABLE flight (
  flight_id      SERIAL PRIMARY KEY,
  code           VARCHAR(16) NOT NULL UNIQUE,    -- e.g., VN231
  from_airport   INT NOT NULL REFERENCES airport(airport_id),
  to_airport     INT NOT NULL REFERENCES airport(airport_id),
  departure_time TIMESTAMPTZ NOT NULL,
  arrival_time   TIMESTAMPTZ NOT NULL,
  airplane_id    INT NOT NULL REFERENCES airplane(airplane_id),
  CHECK (arrival_time > departure_time)
);

CREATE INDEX idx_flight_route_time ON flight (from_airport, to_airport, departure_time);

CREATE TABLE booking (
  booking_id     SERIAL PRIMARY KEY,
  flight_id      INT NOT NULL REFERENCES flight(flight_id),
  customer_id    INT NOT NULL REFERENCES customer_public(customer_id),
  status         VARCHAR(24) NOT NULL DEFAULT 'HELD', -- HELD, CONFIRMED, CANCELED
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_booking_customer ON booking (customer_id);
CREATE INDEX idx_booking_flight   ON booking (flight_id);

CREATE TABLE ticket (
  ticket_id      SERIAL PRIMARY KEY,
  booking_id     INT NOT NULL REFERENCES booking(booking_id) ON DELETE CASCADE,
  seat_no        VARCHAR(8),                       -- optional until seat assignment
  class          VARCHAR(16) NOT NULL DEFAULT 'ECONOMY',  -- ECONOMY, BUSINESS
  price          NUMERIC(12,2) NOT NULL CHECK (price >= 0)
);

CREATE INDEX idx_ticket_booking ON ticket (booking_id);

CREATE TABLE payment (
  payment_id     SERIAL PRIMARY KEY,
  booking_id     INT NOT NULL REFERENCES booking(booking_id) ON DELETE CASCADE,
  amount         NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  currency       VARCHAR(8) NOT NULL DEFAULT 'VND',
  status         VARCHAR(24) NOT NULL DEFAULT 'PENDING', -- PENDING, SUCCESS, FAILED
  method         VARCHAR(24) NOT NULL DEFAULT 'CARD',    -- CARD, WALLET, CASH
  paid_at        TIMESTAMPTZ
);

CREATE INDEX idx_payment_booking ON payment (booking_id);

-- 4) Employee
CREATE TABLE employee (
  employee_id    SERIAL PRIMARY KEY,
  full_name      VARCHAR(160) NOT NULL,
  role           VARCHAR(24)  NOT NULL DEFAULT 'STAFF', -- STAFF, ADMIN
  airport_id     INT NOT NULL REFERENCES airport(airport_id),
  branch_id      INT REFERENCES branch(branch_id)
);

COMMIT;

-- Logical Customer view (helper):
-- In fragmentation.sql we will replace these base tables by site-local physical tables
-- and expose a global view: customer AS SELECT ... JOIN ...