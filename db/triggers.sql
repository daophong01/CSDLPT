-- Triggers for Distributed AirTicket (PostgreSQL)

-- 1) Check seat availability per flight across site-local tables
-- Uses TG_TABLE_SCHEMA to determine which site schema (hn/dn/hcm) the insert/update occurs in.

CREATE OR REPLACE FUNCTION public.fn_check_seat_availability() RETURNS trigger AS $$
DECLARE
  site_schema TEXT := TG_TABLE_SCHEMA;
  v_booking_id INT;
  v_flight_id INT;
  v_airplane_id INT;
  v_capacity INT;
  v_current_tickets INT;
BEGIN
  -- Determine booking_id from NEW row (assumes table ticket has booking_id)
  v_booking_id := NEW.booking_id;

  -- Fetch flight_id for this booking from site-local booking table
  EXECUTE format('SELECT flight_id FROM %I.booking WHERE booking_id = $1', site_schema)
    INTO v_flight_id USING v_booking_id;

  IF v_flight_id IS NULL THEN
    RAISE EXCEPTION 'Booking % not found in schema %', v_booking_id, site_schema;
  END IF;

  -- Fetch airplane_id from site-local flight table
  EXECUTE format('SELECT airplane_id FROM %I.flight WHERE flight_id = $1', site_schema)
    INTO v_airplane_id USING v_flight_id;

  -- Capacity from global public.airplane
  SELECT capacity INTO v_capacity FROM public.airplane WHERE airplane_id = v_airplane_id;

  IF v_capacity IS NULL THEN
    RAISE EXCEPTION 'Airplane % capacity not found', v_airplane_id;
  END IF;

  -- Count current tickets for the same flight across bookings in this site
  EXECUTE format($f$
    SELECT COUNT(t.ticket_id)
    FROM %I.ticket t
    JOIN %I.booking b ON b.booking_id = t.booking_id
    WHERE b.flight_id = $1
  $f$, site_schema, site_schema) INTO v_current_tickets USING v_flight_id;

  -- Include NEW row if this is INSERT
  IF TG_OP = 'INSERT' THEN
    v_current_tickets := v_current_tickets + 1;
  END IF;

  IF v_current_tickets > v_capacity THEN
    RAISE EXCEPTION 'Capacity exceeded for flight % in %: % > %', v_flight_id, site_schema, v_current_tickets, v_capacity;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to site-local ticket tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_check_seat_hn') THEN
    CREATE TRIGGER trg_check_seat_hn
    BEFORE INSERT OR UPDATE ON hn.ticket
    FOR EACH ROW EXECUTE FUNCTION public.fn_check_seat_availability();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_check_seat_dn') THEN
    CREATE TRIGGER trg_check_seat_dn
    BEFORE INSERT OR UPDATE ON dn.ticket
    FOR EACH ROW EXECUTE FUNCTION public.fn_check_seat_availability();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_check_seat_hcm') THEN
    CREATE TRIGGER trg_check_seat_hcm
    BEFORE INSERT OR UPDATE ON hcm.ticket
    FOR EACH ROW EXECUTE FUNCTION public.fn_check_seat_availability();
  END IF;
END$$;

-- 2) Sync booking status based on payment success
CREATE OR REPLACE FUNCTION public.fn_sync_booking_status_on_payment() RETURNS trigger AS $$
DECLARE
  site_schema TEXT := TG_TABLE_SCHEMA;
  v_booking_id INT := NEW.booking_id;
BEGIN
  -- When payment becomes SUCCESS, mark booking CONFIRMED
  IF NEW.status = 'SUCCESS' THEN
    EXECUTE format('UPDATE %I.booking SET status = $2 WHERE booking_id = $1', site_schema)
    USING v_booking_id, 'CONFIRMED';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_sync_booking_hn') THEN
    CREATE TRIGGER trg_sync_booking_hn
    AFTER INSERT OR UPDATE OF status ON hn.payment
    FOR EACH ROW EXECUTE FUNCTION public.fn_sync_booking_status_on_payment();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_sync_booking_dn') THEN
    CREATE TRIGGER trg_sync_booking_dn
    AFTER INSERT OR UPDATE OF status ON dn.payment
    FOR EACH ROW EXECUTE FUNCTION public.fn_sync_booking_status_on_payment();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_sync_booking_hcm') THEN
    CREATE TRIGGER trg_sync_booking_hcm
    AFTER INSERT OR UPDATE OF status ON hcm.payment
    FOR EACH ROW EXECUTE FUNCTION public.fn_sync_booking_status_on_payment();
  END IF;
END$$;