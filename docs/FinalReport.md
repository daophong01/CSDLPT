# Báo cáo tổng hợp dự án: Hệ thống Quản lý Bán Vé Máy Bay Phân Tán

Tài liệu này tổng hợp kết quả của 6 thành viên: phân tích, thiết kế, cài đặt vật lý, đồng bộ hóa, giao tác, nâng cao và tài liệu hoá.

## 1. Tổng quan & Đặt vấn đề
- Nhu cầu, mục tiêu, phạm vi (xem docs/Analysis.md).
- Kiến trúc tổng quan (xem docs/Architecture.mmd, docs/Deployment.md).
- Công nghệ: Next.js, PostgreSQL, ethers.js, Solidity (layer on-chain).

## 2. Thiết kế CSDL
- Lược đồ logic: db/schema.sql.
- Phân mảnh: db/fragmentation.sql; mô tả docs/Fragmentation.md.
- Mirror on-chain: db/offchain.sql.
- ERD: docs/ERD.mmd.

## 3. Cài đặt vật lý & Kết nối
- Hướng dẫn triển khai: docs/Deployment.md.
- VPN/IP/LAN (tuỳ môi trường).
- Liên kết liên chi nhánh: Linked Server (MSSQL) hoặc FDW (Postgres).

## 4. Đồng bộ hóa & Replication
- Listener on-chain: scripts/web3-listener.ts (cấu hình RPC_URL, CONTRACT_ADDRESS, ...).
- Replication: docs/Replication.md (Postgres logical hoặc MSSQL publication/subscription).

## 5. Giao tác & Ứng dụng minh hoạ
- API:
  - /api/flights: tìm kiếm chuyến bay.
  - /api/bookings: tạo/lấy đặt chỗ, advisory lock chống over-sell.
  - /api/onchain/flights: đọc flight_mirror.
  - /api/onchain/buy: gửi giao dịch mua vé on-chain bằng ví server (demo).
  - /api/tickets/[id]: xác thực vé từ ticket_mirror.
- Front-end:
  - /search, /bookings, /onchain, /verify, /architecture.
- Dữ liệu mẫu: db/sample_data.sql.

## 6. Bảo mật & Phân quyền
- Vai trò: db/roles.sql; GRANT theo site và public views.
- Trigger:
  - trg_check_seat_*: kiểm tra sức chứa máy bay.
  - trg_sync_booking_*: đổi trạng thái booking khi thanh toán thành công.
- PII: sec.customer_private, join qua customer_id.

## 7. Kiểm thử & Nghiệm thu
- Chạy tuần tự: schema.sql → fragmentation.sql → offchain.sql → roles.sql → triggers.sql → sample_data.sql.
- Kiểm tra API và trang UI hoạt động.
- Listener on-chain hoạt động: flight_mirror/ticket_mirror được cập nhật khi có event.

## 8. Kết luận & Hướng phát triển
- Hoàn thiện core chức năng demo: tìm kiếm, đặt vé, xác thực on-chain.
- Đề xuất nâng cấp:
  - Thêm smart contracts đầy đủ (Ticketing, Flight, Registry) và scripts triển khai.
  - Tối ưu phân mảnh theo đường bay/chi nhánh thực tế.
  - Tích hợp hệ thống thanh toán ngoài (VNPay/Momo) và đối soát on-chain.