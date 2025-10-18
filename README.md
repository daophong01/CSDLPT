# AirTicket — Thiết kế web quản lý vé máy bay (định hướng CSDL phân tán)

Ứng dụng mẫu bằng Next.js mô phỏng các chức năng:
- Tìm kiếm chuyến bay
- Tạo và xem đặt chỗ
- Mô tả kiến trúc cơ sở dữ liệu phân tán

## Chạy dự án

```bash
npm run dev
# hoặc
yarn dev
# hoặc
pnpm dev
# hoặc
bun dev
```

Mở http://localhost:3000 để truy cập ứng dụng.

## Tính năng

- Trang chủ: tổng quan hệ thống
- Tìm chuyến bay: /search — gọi API `/api/flights` với tiêu chí tìm kiếm
- Đặt chỗ: /bookings — gọi API `/api/bookings` để tạo/xem đặt chỗ (dữ liệu lưu trong bộ nhớ tạm)
- Kiến trúc: /architecture — mô tả các thành phần và chiến lược phân tán

## Kiến trúc CSDL phân tán (định hướng)

Hệ thống thực tế nên tách thành các microservice với ranh giới dữ liệu rõ ràng:

- Flight Catalog (danh mục chuyến bay): lưu trữ tuyến bay, lịch bay, hãng. Dữ liệu ít biến động, có thể sao chép rộng (multi-region read replicas).
- Inventory/Booking (tồn kho ghế và đặt chỗ): giao dịch ghi mạnh mẽ, kiểm soát cạnh tranh cao. Ưu tiên cơ sở dữ liệu phân tán có nhất quán mạnh hoặc đồng bộ hoá phân vùng (ví dụ: CockroachDB, Yugabyte, hoặc Postgres + sharding).
- Payments: xử lý thanh toán, idempotency và ledger riêng.
- Customer: hồ sơ khách hàng, tuân thủ bảo mật (PII).

Các chiến lược:
- Phân vùng theo tuyến/khu vực: ví dụ partition theo (origin, destination) hoặc theo region.
- Sao chép đa vùng và điều phối failover tự động cho đọc/ghi.
- Event Sourcing + CQRS: luồng ghi (đặt chỗ) phát sự kiện; luồng đọc (tìm kiếm) tiêu thụ và tạo các materialized views.
- Chỉ mục tìm kiếm: Elasticsearch/OpenSearch cho truy vấn tốc độ cao; đồng bộ bằng sự kiện.
- Hàng đợi sự kiện: Kafka/Pulsar làm backbone tích hợp, đảm bảo thứ tự và bền vững.

Tính nhất quán:
- Đặt chỗ cần đảm bảo không oversell ghế → sử dụng giao dịch, khoá theo chuyến bay và thời điểm; chiến lược “reservation hold” với TTL.
- Chấp nhận tính nhất quán cuối cùng trên kênh tìm kiếm; nguồn sự thật là Inventory/Booking.

Khả năng mở rộng:
- Scale theo chiều ngang bằng cách thêm shard/partition.
- Rate limiting, circuit breaker giữa dịch vụ.
- Observability: tracing, metrics, log tập trung.

## Cấu trúc thư mục đáng chú ý

- `src/app/` — App Router
  - `page.tsx` — trang chủ
  - `search/page.tsx` — tìm chuyến bay
  - `bookings/page.tsx` — danh sách đặt chỗ
  - `architecture/page.tsx` — mô tả kiến trúc
  - `api/flights/route.ts` — API tìm kiếm
  - `api/bookings/route.ts` — API đặt chỗ (in-memory)
- `src/lib/data.ts` — dữ liệu mẫu và hàm `searchFlights`
- `src/app/components/` — `SearchForm`, `FlightCard`

Ghi chú: API booking hiện lưu dữ liệu trong bộ nhớ tiến trình để minh hoạ. Khi triển khai thật, cần thay bằng cơ sở dữ liệu phù hợp như đã mô tả ở phần kiến trúc.

## Tài liệu Next.js

- https://nextjs.org/docs
- https://nextjs.org/learn
