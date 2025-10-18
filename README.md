# AirTicket — Thiết kế web quản lý vé máy bay (định hướng CSDL phân tán)

Ứng dụng Next.js với backend PostgreSQL, mô phỏng:
- Tìm kiếm chuyến bay
- Tạo và xem đặt chỗ (khóa giao dịch chống oversell)
- Mô tả kiến trúc cơ sở dữ liệu phân tán

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

## Chạy dự án

```bash
npm install
npm run dev
# hoặc: yarn/pnpm/bun
```

Mở http://localhost:3000.

## Tính năng

- Trang chủ: tổng quan hệ thống
- Tìm chuyến bay: /search — gọi API `/api/flights` (truy vấn Postgres)
- Đặt chỗ: /bookings — gọi API `/api/bookings` để tạo/xem đặt chỗ (Postgres)
  - Khi đặt chỗ, hệ thống dùng `pg_advisory_xact_lock(flight_id)` để tuần tự hóa giao dịch theo chuyến bay, tránh oversell.
  - Số ghế được tính từ `airplane.capacity` và số vé đã phát hành (`ticket`).

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
  - `page.tsx` — trang chủ
  - `search/page.tsx` — tìm chuyến bay
  - `bookings/page.tsx` — danh sách đặt chỗ
  - `architecture/page.tsx` — mô tả kiến trúc
  - `api/flights/route.ts` — API tìm kiếm (Postgres)
  - `api/bookings/route.ts` — API đặt chỗ (Postgres, khóa giao dịch)
- `src/lib/db.ts` — kết nối Postgres (Pool, `tx` helper)
- `db/schema.sql` — lược đồ public
- `db/sample_data_public.sql` — dữ liệu mẫu public
- `db/fragmentation.sql` — phân mảnh (hn/dn/hcm + sec) và view hợp nhất

## Ghi chú

- Nếu bạn áp dụng phân mảnh (db/fragmentation.sql), cần điều chỉnh API để ghi vào schema site tương ứng (hn/dn/hcm) dựa trên `from_airport`. Phiên bản hiện tại thao tác ở public để dễ chạy demo.
- Tích hợp thanh toán thật, quản trị CRUD và phân quyền sẽ được bổ sung theo yêu cầu.
