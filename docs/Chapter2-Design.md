# Chương 2: Phân tích & Thiết kế hệ thống bán vé máy bay phân tán ứng dụng Blockchain

Chương này thiết kế hệ thống theo Hybrid Architecture kết hợp CSDL phân tán (off-chain) và Blockchain (on-chain).

## 2.1. Mục tiêu và phạm vi
- Phân tán dữ liệu theo site (HN/DN/HCM) và mirror on-chain (vé/chuyến bay).
- Xác thực vé bằng smart contracts, mirror dữ liệu phục vụ truy vấn nhanh.
- Đảm bảo chống oversell ở kênh off-chain và bất biến on-chain.

## 2.2. Kiến trúc tổng quan

- Client/Web (Next.js) — giao diện đặt/chứng thực vé.
- API/Middleware (Node.js) — truy vấn Postgres, gọi Web3.
- Blockchain contracts (Solidity) — Registry, Flight, Ticketing.
- Off-chain DB (PostgreSQL) — schema public + fragmentation + mirrors.
- Listener (ethers) — đồng bộ sự kiện on-chain vào mirrors.

Luồng dữ liệu:
- FlightCreated (on-chain) → listener → flight_mirror (off-chain).
- TicketIssued/Purchased/Transferred/Canceled (on-chain) → listener → ticket_mirror.
- Booking off-chain: đặt chỗ, phát hành vé nội bộ (nếu không on-chain), chống oversell bằng giao dịch và khoá.

## 2.3. Mô hình logic (ERD tóm tắt off-chain)

Thực thể chính:
- Airport(airport_id, code, name, city, country)
- Airplane(airplane_id, model, capacity)
- Flight(flight_id, code, from_airport, to_airport, departure_time, arrival_time, airplane_id)
- Customer_Public(customer_id, full_name, phone)
- Customer_Private(customer_id, email, address, national_id)
- Booking(booking_id, flight_id, customer_id, status, created_at)
- Ticket(ticket_id, booking_id, seat_no, class, price)
- Payment(payment_id, booking_id, amount, currency, status, method, paid_at)
- Branch(branch_id, name, airport_id, address)
- Employee(employee_id, full_name, role, airport_id, branch_id)

Mirrors on-chain:
- flight_mirror(flight_id, flight_code, origin, destination, departure, arrival, airplane_hash, last_event_tx)
- ticket_mirror(ticket_id, flight_id, owner, class, status, price, last_event_tx)

## 2.4. Phân mảnh & phân bố

- Phân mảnh ngang:
  - hn.flight, dn.flight, hcm.flight; hn.booking, dn.booking, hcm.booking; hn.ticket, dn.ticket, hcm.ticket; hn.payment, dn.payment, hcm.payment.
- Phân mảnh dọc:
  - customer_public ở các site (hn/dn/hcm); customer_private ở schema sec (trung tâm).
- Lược đồ toàn cục:
  - public.flight = UNION ALL (hn.flight, dn.flight, hcm.flight)
  - public.booking/ticket/payment tương tự.
  - public.customer = JOIN(customer_public UNION ALL, sec.customer_private).

## 2.5. Smart Contracts (on-chain)

- AirlineRegistry: quản trị danh sách hãng (add/remove); isAirline(addr).
- Flight: createFlight(flightCode, origin, destination, departure, arrival, airplaneHash) → FlightCreated event.
- Ticketing: issueTicket(flightId, price, classCode); buy(id) payable; transferTicket(id, to); cancel(id).
- Quy tắc:
  - Chỉ airline hợp lệ được gọi createFlight/issueTicket/cancel.
  - Mua vé yêu cầu chuyển đúng số tiền, thay đổi chủ sở hữu.

## 2.6. Đồng bộ và nhất quán

- Listener: subscribe events và upsert mirrors; idempotency theo tx_hash/ticket_id.
- Off-chain booking: dùng giao dịch SQL + pg_advisory_xact_lock(flight_id) để tuần tự hoá theo chuyến bay, tránh oversell.
- Cross-site: nếu triển khai đa schema site, routing ghi/đọc theo site; global views cho báo cáo.

## 2.7. Bảo mật

- PII trong customer_private (schema sec); mã hóa ở tầng ứng dụng.
- Quyền on-chain: Registry xác thực airline; có thể bổ sung multi-sig cho cancel.
- Env secrets: WALLET_PRIVATE_KEY chỉ dùng demo; sản xuất dùng client-side wallets (MetaMask) hoặc MPC.

## 2.8. Triển khai & kiểm thử

- Postgres: db/schema.sql, db/fragmentation.sql, db/offchain.sql.
- Contracts: AirlineRegistry.sol, Flight.sol, Ticketing.sol.
- Hardhat deploy: scripts/deploy.js, lưu .deployed.json; set env cho listener.
- Listener: scripts/web3-listener.ts.
- UI: /onchain, /onchain/tickets, /verify, /search, /bookings.
- Kiểm thử:
  - Demo: addAirline → createFlight (VN231 HAN→SGN) → issueTicket → buy (MetaMask hoặc server wallet) → verify mirror.

## 2.9. Kết luận thiết kế

Mô hình Hybrid kết hợp CSDL phân tán và Blockchain:
- On-chain đảm bảo bất biến/minh bạch giao dịch vé.
- Off-chain tối ưu truy vấn, báo cáo, PII và các nghiệp vụ nhanh (đặt chỗ, chống oversell).
- Listener làm cầu nối, đảm bảo nhất quán giữa hai miền dữ liệu.