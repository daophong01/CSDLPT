# BÁO CÁO: CÔNG NGHỆ BLOCKCHAIN

Tài liệu này tổng hợp phần Tổng quan, Cơ chế đồng thuận, Hợp đồng thông minh, Ứng dụng thực tế, và đi sâu vào một trường hợp ứng dụng: Hệ thống quản lý vé máy bay trên blockchain. Phần nội dung tổng quan bên dưới được biên soạn dựa trên yêu cầu.

---

## PHẦN 1: TỔNG QUAN VỀ CÔNG NGHỆ BLOCKCHAIN

### 1. Khái niệm Blockchain là gì?
Blockchain (Chuỗi khối) là một loại cơ sở dữ liệu phân tán, nơi dữ liệu được ghi lại trong các khối (block) và liên kết với nhau bằng mật mã. Mạng lưới được vận hành bởi nhiều máy tính độc lập (nodes) trong mô hình ngang hàng (P2P), thay vì một máy chủ trung tâm.

### 1.1. Các tính chất đặc trưng
- Phi tập trung (Decentralized)
  - Không có cơ quan trung ương kiểm soát; dữ liệu được sao chép trên tất cả nodes.
  - Chống kiểm duyệt, giảm rủi ro tấn công vào một điểm yếu duy nhất.
- Bất biến (Immutable)
  - Dữ liệu một khi đã ghi vào blockchain thì gần như không thể thay đổi hoặc xóa bỏ.
  - Tạo ra sổ cái vĩnh cửu, đáng tin cậy.
- Minh bạch (Transparent)
  - Mọi giao dịch đều công khai; bất kỳ ai cũng có thể kiểm tra.
  - Danh tính người dùng ẩn danh qua địa chỉ ví.
- Bảo mật cao (Secure)
  - Sử dụng mật mã học đảm bảo toàn vẹn dữ liệu và xác thực quyền sở hữu.

### 2. Lịch sử hình thành
- 1991–2008: Khái niệm “chuỗi khối bảo mật bằng mật mã” (Haber & Stornetta).
- 2009: Satoshi Nakamoto ứng dụng blockchain tạo ra Bitcoin, giải quyết “chi tiêu kép” mà không cần bên thứ ba.
- 2013: Ethereum giới thiệu Hợp đồng thông minh (Smart Contract), mở rộng phạm vi ứng dụng ngoài tiền tệ.

### 3. Kiến trúc một khối (Block)
- Data: thông tin giao dịch (người gửi, người nhận, số lượng…)
- Hash: “dấu vân tay” của khối; thay đổi nhỏ trong dữ liệu → hash thay đổi.
- Previous Hash: liên kết khối hiện tại với khối ngay trước đó.
- Nonce: số ngẫu nhiên được tìm (đặc biệt trong PoW) để thỏa điều kiện mạng (ví dụ: số lượng số 0 ở đầu hash).

### 4. Vai trò của mật mã học
- Hash Function (ví dụ: SHA-256): chuyển dữ liệu độ dài bất kỳ thành chuỗi cố định; đảm bảo toàn vẹn.
- Mật mã khóa công khai
  - Public Key: nhận giao dịch (địa chỉ ví).
  - Private Key: ký giao dịch, chứng minh quyền sở hữu và ủy quyền chuyển tiền.

### 5. So sánh: CSDL tập trung vs CSDL phân tán (Blockchain)
- Quyền kiểm soát: tập trung (tổ chức) vs phi tập trung (nhiều nodes).
- Minh bạch: hạn chế vs công khai.
- Bất biến: dễ sửa/xóa vs gần như không thể thay đổi.
- Điểm yếu: single point of failure vs chịu lỗi cao, không điểm hỏng đơn lẻ.
- Tốc độ: thường nhanh vs chậm hơn do cần đồng thuận.
- Ví dụ: ngân hàng/Facebook vs Bitcoin/Ethereum.

---

## PHẦN 2: CƠ CHẾ ĐỒNG THUẬN & HỢP ĐỒNG THÔNG MINH

### 1. Cơ chế đồng thuận (Consensus Mechanism)
- Định nghĩa: Tập hợp quy tắc giúp các nodes đạt đồng thuận về trạng thái sổ cái và thứ tự giao dịch.
- Mục đích: Đảm bảo nhất quán, toàn vẹn dữ liệu, ngăn gian lận (chi tiêu kép).

### 2. Proof of Work (PoW)
- Nguyên lý: Miners dùng sức mạnh tính toán để tìm Nonce hợp lệ; ai tìm trước được thêm khối và nhận thưởng.
- Ưu: bảo mật cao (Bitcoin đã chứng minh).
- Nhược: tiêu tốn năng lượng lớn, TPS chậm.
- Ứng dụng: Bitcoin.

### 3. Proof of Stake (PoS)
- Nguyên lý: Validators được chọn theo stake để tạo/xác thực khối.
- Ưu: tiết kiệm năng lượng, tốc độ nhanh hơn PoW.
- Nhược: có rủi ro tập trung vào người nắm giữ nhiều tài sản.
- Ứng dụng: Ethereum (The Merge), Cardano, Solana.

### 4. Hợp đồng thông minh (Smart Contract)
- Định nghĩa: Chương trình tự động thực thi trên blockchain khi điều kiện lập trình sẵn được thỏa mãn (IF…THEN…).
- Đặc điểm: tự động, tin cậy, không thể bị can thiệp sau triển khai, loại bỏ nhu cầu trung gian.

### 5. Ví dụ DeFi: Cho vay ngang hàng
- Luồng:
  1) Người cho vay gửi tài sản vào pool thanh khoản (smart contract).
  2) Người vay thế chấp, thỏa điều kiện → giải ngân tự động.
  3) Hợp đồng theo dõi thời gian và tính lãi.
  4) Trả nợ → hoàn gốc+lãi cho người cho vay.
  5) Không trả nợ → thanh lý tài sản thế chấp theo điều kiện.

---

## PHẦN 3: ỨNG DỤNG & MINH HỌA GIAO DỊCH

### 1. Ứng dụng thực tế của Blockchain
- Tiền mã hóa (Cryptocurrency): hệ thống thanh toán phi tập trung (Bitcoin, Ethereum).
- NFT: chứng nhận quyền sở hữu độc nhất cho tài sản số/vật lý.
- Chuỗi cung ứng: truy xuất nguồn gốc sản phẩm.
- Bầu cử điện tử (E-voting): minh bạch, bất biến, chống gian lận.

### 2. Ứng dụng trong hệ thống quản lý vé máy bay
- Vấn đề hệ tập trung:
  - Bảo mật & gian lận: vé dễ bị làm giả/bán lặp.
  - Quy trình thủ công & tốn kém: hoàn tiền/đổi vé phức tạp qua nhiều trung gian.
  - Thiếu nhất quán: các bên có dữ liệu khác nhau về trạng thái vé.
- Giải pháp với blockchain:
  - Mỗi vé là một token/NFT duy nhất, không thể sao chép.
  - Smart contract tự động quản lý vòng đời vé: đặt chỗ, thanh toán, check-in, đổi vé, hoàn tiền theo điều kiện.
  - Mạng lưới phi tập trung giúp các bên nhìn thấy trạng thái vé theo thời gian thực.
- Lợi ích: tự động hóa, giảm chi phí nhân sự, chống gian lận, tăng niềm tin.

### 3. Minh họa giao dịch đơn giản
Giả sử A gửi 1 BTC cho B:
1) A tạo giao dịch chuyển 1 BTC đến địa chỉ của B.
2) A ký giao dịch bằng private key (chứng minh quyền sở hữu).
3) Giao dịch phát tán lên mạng P2P.
4) Miners/Validators gom giao dịch vào khối mới và xác thực theo PoW/PoS.
5) Khối mới được thêm vào chuỗi; giao dịch được ghi vĩnh viễn, B nhận 1 BTC.

### 4. Tổng kết & kết luận
- Giá trị cốt lõi: Phi tập trung, Minh bạch, Bất biến.
- PoW/PoS là trái tim đảm bảo an toàn và đồng nhất.
- Smart contract mở ra tự động hóa trong DeFi, Quản trị, Chuỗi cung ứng.
- Thách thức:
  - Khả năng mở rộng (Scalability), tốc độ giao dịch còn chậm so với hệ tập trung.
  - Tiêu thụ năng lượng (đặc biệt PoW).
  - Khung pháp lý và mức độ chấp nhận đại chúng.

---

## PHẦN 4: THIẾT KẾ HỆ THỐNG VÉ MÁY BAY TRONG REPO NÀY

Phần này trình bày chi tiết kiến trúc, dữ liệu, hợp đồng thông minh và quy trình đồng bộ đã/đang được thiết kế trong dự án.

### 1) Lý do và mục tiêu
- Lý do: Hệ thống tập trung dễ gian lận/chỉnh sửa; blockchain cung cấp sổ cái phân tán, bất biến, minh bạch.
- Mục tiêu:
  - Lưu trữ và xác thực vé (NFT e-ticket) on-chain.
  - Liên minh nhiều bên: hãng, đại lý, sân bay, cổng thanh toán.
  - Truy vết giao dịch; dữ liệu nhạy cảm giữ off-chain.

### 2) Kiến trúc tổng quan
- Thành phần:
  - Client/Web/App
  - Node.js Middleware/API Gateway
  - Smart Contract Layer (Solidity)
  - Blockchain Network (Ethereum/Besu/Hyperledger)
  - Off-chain DB (PostgreSQL)
- Dòng dữ liệu:
  - Issue/Buy/Transfer/Cancel → on-chain events
  - FlightCreated → on-chain event
  - Mirrors + PII + Payment detail → off-chain

### 3) Thiết kế dữ liệu
- On-chain:
  - Ticketing (NFT hoặc bản ghi duy nhất): ticketId, flightId, owner, class, status, price
  - Flight: flightId, flightCode, origin, destination, departure, arrival, airplaneHash, issuer
  - AirlineRegistry: phân quyền phát hành vé/chuyến bay
- Off-chain (PostgreSQL):
  - customer: thông tin PII (mã hoá ở tầng ứng dụng)
  - payment: mirror thanh toán với tx_hash
  - flight_mirror, ticket_mirror: ảnh on-chain để truy vấn nhanh
  - Xem db/offchain.sql

### 4) Smart Contracts (Solidity)
- AirlineRegistry.sol:
  - Admin thêm/xoá hãng; hàm isAirline(addr) phục vụ phân quyền cho Ticketing/Flight.
- Flight.sol:
  - createFlight(...) chỉ airline hợp lệ, phát sự kiện FlightCreated.
- Ticketing.sol:
  - issueTicket(flightId, price, classCode) chỉ airline hợp lệ.
  - buy(id) thanh toán on-chain (demo).
  - transferTicket(id, to).
  - cancel(id) bởi airline/admin.
- Sự kiện: TicketIssued, TicketPurchased, TicketTransferred, TicketCanceled, FlightCreated.
- Triển khai: consortium (PoA/BFT) hoặc testnet để demo.

### 5) Đồng bộ sự kiện (Listener)
- scripts/web3-listener.ts:
  - Kết nối RPC qua ethers.
  - Subscribe Ticketing + Flight contracts.
  - Upsert ticket_mirror + flight_mirror trong Postgres.
- Biến môi trường:
  - RPC_URL, CONTRACT_ADDRESS (Ticketing), FLIGHT_CONTRACT_ADDRESS (Flight), REGISTRY_ADDRESS (tuỳ chọn), WALLET_PRIVATE_KEY.

### 6) Giao dịch & bảo mật
- Vé = token duy nhất (NFT); đường đi: Issue → Purchase → Transfer → Cancel.
- Phân quyền: AirlineRegistry; tuỳ chọn multi-sig cho huỷ/điều chỉnh.
- Off-chain PII mã hoá; liên kết on-chain bằng ticket_id/tx_hash.
- Idempotency: kiểm tra mirror trước ghi; dựa trên tx_hash.

### 7) Mô hình triển khai
- Backend đồng bộ on-chain events → off-chain DB; API frontend đọc từ mirror để hiển thị nhanh.
- Xác thực vé: tra theo ticket_id trên chain + đối chiếu mirror.

### 8) Hướng phát triển
- Chuẩn hoá metadata e-ticket theo IATA.
- Layer2/payment channel tối ưu phí/latency.
- Cross-chain khi nhiều mạng liên minh.