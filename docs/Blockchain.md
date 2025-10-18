# Hệ thống quản lý bán vé máy bay ứng dụng Blockchain (Thiết kế CSDL phân tán hiện đại)

Tài liệu này mô tả kiến trúc Hybrid (on-chain + off-chain), lược đồ dữ liệu, smart contracts và quy trình đồng bộ sự kiện cho hệ thống vé máy bay trên blockchain.

1) Lý do và mục tiêu
- Lý do: Hệ thống tập trung dễ gian lận/chỉnh sửa; blockchain là sổ cái phân tán, bất biến, minh bạch.
- Mục tiêu:
  - Lưu trữ và xác thực vé (NFT e-ticket) on-chain.
  - Liên minh nhiều bên: hãng, đại lý, sân bay, thanh toán.
  - Truy vết giao dịch; dữ liệu nhạy cảm giữ off-chain.

2) Kiến trúc tổng quan
- Thành phần:
  - Client/Web/App
  - Node.js Middleware/API Gateway
  - Smart Contract Layer (Solidity)
  - Blockchain Network (Ethereum/Besu/Hyperledger)
  - Off-chain DB (PostgreSQL)
- Dòng dữ liệu:
  - Issue/Buy/Transfer/Cancel → on-chain events
  - Mirrors + PII + Payment detail → off-chain

3) Thiết kế dữ liệu
- On-chain:
  - Ticketing (NFT hoặc bản ghi duy nhất): ticketId, flightId, owner, class, status, price
  - Flight (tối thiểu: flightId, flightCode, route, timestamps) có thể phát từ Airline node
  - AirlineRegistry: phân quyền phát hành/huỷ vé
- Off-chain (PostgreSQL):
  - customer: thông tin PII (mã hoá ở tầng ứng dụng)
  - payment: mirror thanh toán với tx_hash
  - flight_mirror, ticket_mirror: ảnh on-chain để truy vấn nhanh
  - Xem db/offchain.sql

4) Smart Contracts (Solidity)
- Ticketing.sol:
  - issueTicket(flightId, price, classCode) chỉ airline hợp lệ
  - buy(id) thanh toán on-chain (demo)
  - transferTicket(id, to)
  - cancel(id) bởi airline/admin
- Sự kiện: TicketIssued, TicketPurchased, TicketTransferred, TicketCanceled
- Triển khai: consortium (PoA/BFT) hoặc testnet để demo

5) Đồng bộ sự kiện (Listener)
- scripts/web3-listener.ts:
  - Kết nối RPC qua ethers
  - Subscribe các sự kiện
  - Upsert ticket_mirror + flight_mirror trong Postgres
- Env:
  - RPC_URL, CONTRACT_ADDRESS, REGISTRY_ADDRESS, WALLET_PRIVATE_KEY

6) Giao dịch & bảo mật
- Vé = token duy nhất (NFT); đường đi: Issue → Purchase → Transfer → Cancel.
- Phân quyền: AirlineRegistry; tuỳ chọn multi-sig cho huỷ/điều chỉnh.
- Off-chain PII mã hoá; liên kết on-chain bằng ticket_id/tx_hash.
- Idempotency: kiểm tra ticket_mirror trước ghi; dựa trên tx_hash.

7) Mô hình triển khai
- Backend đồng bộ on-chain events → off-chain DB; API frontend đọc từ mirror để hiển thị nhanh.
- Xác thực vé: tra theo ticket_id trên chain + đối chiếu mirror.

8) Hướng phát triển
- Chuẩn hoá metadata e-ticket theo IATA.
- Layer2/payment channel tối ưu phí/latency.
- Cross-chain khi nhiều mạng liên minh.