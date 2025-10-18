# Triển khai & Định vị

Hướng dẫn triển khai các thành phần và định vị dữ liệu/sự kiện.

## 1. Môi trường
- Node.js v18+
- PostgreSQL 14+
- RPC Ethereum (testnet/local devnet)
- Env:
  - RPC_URL
  - CONTRACT_ADDRESS (Ticketing)
  - FLIGHT_CONTRACT_ADDRESS (Flight, tuỳ chọn)
  - WALLET_PRIVATE_KEY (tuỳ chọn, nếu cần ký)

## 2. CSDL off-chain
- Khởi tạo lược đồ logic:
  - db/schema.sql
- Khởi tạo phân mảnh và view:
  - db/fragmentation.sql
- Khởi tạo mirror on-chain:
  - db/offchain.sql
- Nạp dữ liệu mẫu:
  - db/sample_data.sql

## 3. Định vị dữ liệu
- hn: dữ liệu Hà Nội (customer_public, flight, booking, ticket, payment).
- dn: dữ liệu Đà Nẵng.
- hcm: dữ liệu TP.HCM.
- sec: dữ liệu nhạy cảm (customer_private).
- public: view hợp nhất để analytics.

## 4. Listener sự kiện on-chain
- File: scripts/web3-listener.ts
- Cấu hình env như mục 1.
- Chạy:
  - npx ts-node scripts/web3-listener.ts
- Kết quả:
  - Upsert flight_mirror, ticket_mirror trong DB mỗi khi có event on-chain.

## 5. Kiến trúc và RPC endpoints
- API đọc mirror để hiển thị nhanh.
- ethers.js kết nối RPC_URL để subscribe events và gọi read-only.

## 6. Linked Server/FDW (tuỳ chọn)
- Với MSSQL: cấu hình Linked Server để thử liên kết liên chi nhánh.
- Với Postgres: dùng FDW để liên kết các cluster nếu phân mảnh vật lý.