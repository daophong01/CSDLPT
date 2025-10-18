# AirTicket — Thiết kế web quản lý vé máy bay (CSDL phân tán + Blockchain Hybrid)

Ứng dụng Next.js với backend PostgreSQL, kèm mô hình Blockchain Hybrid:
- Tìm kiếm chuyến bay (Postgres)
- Tạo và xem đặt chỗ (Postgres, khóa giao dịch chống oversell)
- Thiết kế blockchain cho vé (NFT e-ticket), listener đồng bộ on-chain → off-chain

## Thiết lập cơ sở dữ liệu

1) Tạo database Postgres (ví dụ: `airticket`) và cấu hình biến môi trường:
   - Sao chép `.env.example` thành `.env`
   - Cập nhật `DATABASE_URL=postgres://user:password@localhost:5432/airticket`

2) Khởi tạo lược đồ và dữ liệu mẫu (public schema):
   - psql -d airticket -f db/schema.sql
   - psql -d airticket -f db/sample_data_public.sql

3) (Tuỳ chọn) Mô phỏng phân tán theo site (HN/DN/HCM):
   - psql -d airticket -f db/fragmentation.sql
   - Lưu ý: tệp phân mảnh tạo các schema hn/dn/hcm và view hợp nhất; nếu dùng phân mảnh, không nên đồng thời tạo bảng trùng tên ở public.

4) (Tuỳ chọn) Off-chain DB cho Blockchain Hybrid:
   - psql -d airticket -f db/offchain.sql
   - Xem docs/Blockchain.md để hiểu mô hình hybrid.

## Chạy dự án

```bash
npm install
npm run dev
# hoặc: yarn/pnpm/bun
```

Mở http://localhost:3000.

## Blockchain Listener (đồng bộ on-chain → off-chain)

1) Cấu hình `.env`:
   - RPC_URL=http://localhost:8545
   - CONTRACT_ADDRESS=0xYourContractAddressHere
   - WALLET_PRIVATE_KEY= (tuỳ chọn)

2) Chạy listener:
```bash
npm run listen
```
Listener sẽ subscribe sự kiện TicketIssued/Purchased/Transferred/Canceled và upsert vào `ticket_mirror`.

## Tính năng

- Trang chủ: tổng quan hệ thống
- Tìm chuyến bay: /search — gọi API `/api/flights` (truy vấn Postgres)
- Đặt chỗ: /bookings — gọi API `/api/bookings` để tạo/xem đặt chỗ (Postgres)
  - Transaction + `pg_advisory_xact_lock(flight_id)` để tuần tự hóa theo chuyến bay, tránh oversell.
  - Ghế dựa `airplane.capacity` và số vé đã phát hành (`ticket`).
- Blockchain Hybrid:
  - contracts/Ticketing.sol (Solidity, demo)
  - scripts/web3-listener.ts (ethers, đồng bộ sự kiện)
  - db/offchain.sql (mirror on-chain vào Postgres)
  - docs/Blockchain.md (thiết kế chi tiết)

## Kiến trúc CSDL phân tán (định hướng)

- Flight Catalog: dữ liệu tuyến/lịch bay, có thể sao chép rộng (read replicas).
- Inventory/Booking: giao dịch ghi nhất quán mạnh; ưu tiên DB phân tán (CockroachDB/Yugabyte) hoặc Postgres sharding.
- Payments: xử lý thanh toán, idempotency, ledger.
- Customer: phân mảnh dọc (public/private), bảo mật PII.

Chiến lược:
- Phân vùng theo tuyến/khu vực; sao chép đa vùng.
- Event Sourcing + CQRS cho tách luồng ghi/đọc.
- Chỉ mục tìm kiếm (Elasticsearch).
- Hàng đợi sự kiện (Kafka/Pulsar).

Nhất quán & chống oversell:
- Transaction + khóa (advisory lock theo `flight_id`), kiểm số vé < sức chứa.
- Có thể mở rộng bằng “reservation hold” với TTL.

Khả năng mở rộng:
- Sharding/partition theo region hoặc tuyến.
- Observability đầy đủ (logs, metrics, tracing).

## Cấu trúc thư mục đáng chú ý

- `src/app/` — App Router
  - `page.tsx`, `search/page.tsx`, `bookings/page.tsx`, `architecture/page.tsx`
  - `api/flights/route.ts` — API tìm kiếm (Postgres)
  - `api/bookings/route.ts` — API đặt chỗ (Postgres, khóa giao dịch)
- `src/lib/db.ts` — kết nối Postgres (Pool, `tx` helper)
- `contracts/Ticketing.sol` — hợp đồng vé mẫu (Solidity)
- `scripts/web3-listener.ts` — đồng bộ on-chain → off-chain
- `docs/Blockchain.md` — tài liệu thiết kế hybrid
- `db/schema.sql`, `db/sample_data_public.sql`, `db/fragmentation.sql`, `db/offchain.sql`

## Ghi chú

- Nếu áp dụng phân mảnh (db/fragmentation.sql), cần điều chỉnh API ghi vào schema site tương ứng (hn/dn/hcm) theo `from_airport`.
- Hợp đồng Solidity là ví dụ tối giản để demo luồng sự kiện; cần audit/bảo mật trước khi dùng sản xuất.
