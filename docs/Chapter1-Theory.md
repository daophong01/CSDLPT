# Chương 1: Cơ sở lý thuyết về CSDL phân tán và Blockchain (ứng dụng bán vé máy bay)

Tài liệu này trình bày cơ sở lý thuyết cho đề tài “Thiết kế cơ sở dữ liệu phân tán ứng dụng Blockchain trong hệ thống quản lý bán vé máy bay”. Nội dung gồm khái niệm, mô hình, nguyên lý hoạt động của CSDL phân tán và Blockchain, cùng mối liên hệ giữa hai công nghệ.

## 1.1. Khái niệm về cơ sở dữ liệu phân tán (Distributed Database)

### 1.1.1. Định nghĩa
CSDL phân tán là tập hợp các cơ sở dữ liệu con được lưu trữ tại nhiều địa điểm khác nhau nhưng quản lý thống nhất, xuất hiện như một CSDL duy nhất với người dùng. Mục tiêu là nâng cao hiệu năng, độ sẵn sàng, tin cậy và khả năng mở rộng.

### 1.1.2. Đặc điểm
- Tính phân tán: dữ liệu chia nhỏ lưu tại nhiều site.
- Tính trong suốt: truy cập như CSDL tập trung.
- Tính độc lập: mỗi site hoạt động độc lập khi kết nối gián đoạn.
- Tính tin cậy: lỗi một nút không làm dừng toàn hệ thống.
- Khả năng mở rộng: thêm node dễ dàng.

### 1.1.3. Mô hình phân tán
- Phân tán đồng nhất: cùng hệ QTCSDL (MySQL Cluster).
- Phân tán không đồng nhất: khác hệ QTCSDL (Oracle + MongoDB).
- Client–Server: truy cập qua server trung tâm.
- Peer-to-Peer (P2P): các site bình đẳng, trao đổi trực tiếp (Blockchain).

## 1.2. Kỹ thuật phân mảnh và sao chép

### 1.2.1. Phân mảnh ngang
Chia theo bản ghi: ví dụ Booking_HN, Booking_DN, Booking_HCM theo sân bay khởi hành.

### 1.2.2. Phân mảnh dọc
Chia theo cột: Customer_Public (ID, Name, Phone), Customer_Private (ID, Address, CCCD).

### 1.2.3. Phân mảnh hỗn hợp
Kết hợp ngang và dọc cho hệ thống phức tạp.

### 1.2.4. Sao chép dữ liệu
Lưu nhiều bản sao ở các site để tăng sẵn sàng và tốc độ đọc; chú ý nhất quán và xung đột.

## 1.3. Quản lý giao dịch trong CSDL phân tán

- Giao dịch phân tán: thao tác tại nhiều site, đảm bảo ACID toàn hệ thống.
- 2PC (Two-Phase Commit): tất cả site commit hoặc rollback cùng lúc.
- Concurrency control: lock-based, timestamp-based.
- Recovery: khôi phục khi site sự cố (redo/undo log, checkpoints).

## 1.4. Blockchain

### 1.4.1. Khái niệm
Blockchain là chuỗi khối dữ liệu liên kết bằng hash; mỗi khối chứa danh sách giao dịch; mạng lưới P2P xác thực và lưu trữ; dữ liệu đã ghi bất biến.

### 1.4.2. Đặc điểm
- Phi tập trung: không máy chủ trung tâm.
- Minh bạch: giao dịch truy vết công khai.
- Bất biến: khó sửa/xoá dữ liệu đã ghi.
- An toàn: chữ ký số, hash, đồng thuận.
- Tự động: hợp đồng thông minh (smart contracts).

## 1.5. Smart Contract

### 1.5.1. Khái niệm
Smart Contract là mã chạy trên blockchain, tự động thực thi và kiểm soát giao dịch không cần trung gian.

### 1.5.2. Ưu điểm
- Loại bỏ trung gian, giảm chi phí.
- Minh bạch, giảm gian lận.
- Thực thi tin cậy.

## 1.6. Mối liên hệ giữa CSDL phân tán và Blockchain

| Tiêu chí         | CSDL phân tán truyền thống                 | Blockchain                                    |
|------------------|--------------------------------------------|-----------------------------------------------|
| Mô hình          | Phân tán theo site (server)                | Phân tán theo node P2P                        |
| Đồng bộ dữ liệu  | 2PC, replication                           | Đồng thuận (PoW/PoS/PoA/BFT)                  |
| Toàn vẹn         | ACID                                       | Chữ ký số + hash + bất biến                   |
| Bảo mật          | ACL, xác thực tập trung                    | Mã hoá, chữ ký số, phân quyền on-chain        |
| Mở rộng          | Theo cluster/site                          | Theo mạng lưới, có thể multi-chain            |

Kết luận: Blockchain là một hình thái đặc biệt của CSDL phân tán với xác thực phi tập trung và bất biến cao, phù hợp xác thực vé, tránh gian lận/trùng lặp.

## 1.7. Ứng dụng Blockchain trong bán vé máy bay

### 1.7.1. Vấn đề truyền thống
- Vé điện tử tập trung: có thể sửa/làm giả, trùng mã.
- Niềm tin giữa hãng–đại lý: dễ tranh chấp.
- Xác thực vé khó khi đa bên tham gia.

### 1.7.2. Giải pháp Blockchain
- Mỗi vé là token hoặc bản ghi bất biến on-chain.
- Giao dịch mua–chuyển–huỷ ghi nhận bởi nhiều node (hãng, đại lý, sân bay).
- Khách hàng xác minh vé không cần hệ thống hãng.

### 1.7.3. Lợi ích
- Chống gian lận.
- Minh bạch giữa các bên.
- Tăng tin cậy và giảm tải hệ thống tập trung.

## 1.8. Kết luận chương
Kết hợp CSDL phân tán và Blockchain mang lại hệ thống bán vé:
- Phân tán thực sự, bảo mật cao.
- Vé là tài sản số, giao dịch truy vết công khai.
- Hỗ trợ các mô hình liên minh nhiều hãng/đại lý/sân bay.