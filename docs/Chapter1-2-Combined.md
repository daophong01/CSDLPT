# Chương 1 + Phần đầu Chương 2: Cơ sở lý thuyết và phân tích – thiết kế hệ thống quản lý bán vé máy bay ứng dụng CSDL phân tán và Blockchain

Tài liệu này gộp phần lý thuyết CSDL phân tán & Blockchain, quy trình tìm kiếm chuyến bay, và vai trò quản trị (Admin), chuẩn đồ án đại học (PTIT/HUST).

---

## 1.1. Khái niệm về cơ sở dữ liệu phân tán

Cơ sở dữ liệu phân tán (CSDLPT) là hệ thống dữ liệu được lưu trữ tại nhiều địa điểm (site) khác nhau, nhưng vẫn quản lý thống nhất như một cơ sở dữ liệu duy nhất. Mỗi site có thể hoạt động độc lập, song tất cả đều phối hợp để đảm bảo tính toàn vẹn, an toàn và sẵn sàng cao.

Đặc điểm:
- Tính phân tán: dữ liệu lưu ở nhiều node, giảm tải và tăng hiệu năng.
- Tính trong suốt: người dùng không cần biết dữ liệu nằm ở đâu.
- Tính tin cậy: khi một nút lỗi, hệ thống vẫn hoạt động.
- Tính mở rộng: dễ dàng thêm node mới.
- Tính đồng bộ: dữ liệu giữa các site luôn nhất quán.

Mô hình CSDL phân tán:

| Mô hình                | Mô tả                                         | Ví dụ               |
|------------------------|-----------------------------------------------|---------------------|
| Đồng nhất              | Tất cả site dùng cùng hệ QTCSDL               | MySQL Cluster       |
| Không đồng nhất        | Site khác nhau về cấu trúc/phần mềm           | Oracle – PostgreSQL |
| Client–Server          | Client truy cập dữ liệu qua server trung tâm  | Website quản lý     |
| Peer-to-Peer (P2P)     | Các node bình đẳng, chia sẻ dữ liệu trực tiếp | Blockchain          |

---

## 1.2. Kỹ thuật phân mảnh và sao chép dữ liệu

a) Phân mảnh ngang
- Chia bảng theo hàng (ví dụ theo vùng địa lý):
- Flight_HN, Flight_DN, Flight_HCM; tương tự Booking/Payment/Ticket theo site.

b) Phân mảnh dọc
- Chia bảng theo cột (tách nhạy cảm):
- Customer_Public (ID, Name, Phone)
- Customer_Private (ID, Address, CCCD)

c) Phân mảnh hỗn hợp
- Kết hợp ngang + dọc cho hệ thống phức tạp.

d) Sao chép dữ liệu (Replication)
- Lưu bản sao ở nhiều node để tăng sẵn sàng và tốc độ truy cập; cần chính sách nhất quán.

---

## 1.3. Quản lý giao dịch và tính nhất quán

a) Giao dịch phân tán
- Tập hợp các thao tác trên nhiều site, nhưng phải đảm bảo ACID (Atomicity – Consistency – Isolation – Durability).

b) Giao thức đảm bảo nhất quán
- 2-Phase Commit (2PC): mọi node cùng commit hoặc rollback.
- Concurrency Control: điều phối truy cập đồng thời (Lock-based, Timestamp).
- Recovery: khôi phục dữ liệu khi site gặp lỗi.

---

## 1.4. Giới thiệu về Blockchain

Blockchain là chuỗi các khối dữ liệu liên kết bằng hash; mỗi khối chứa danh sách giao dịch. Dữ liệu on-chain không thể chỉnh sửa và được xác thực bởi mạng lưới các node ngang hàng (P2P).

Đặc điểm nổi bật:
- Phi tập trung (không máy chủ trung tâm).
- Minh bạch (giao dịch truy vết công khai).
- Bất biến (dữ liệu đã ghi không thể xoá/sửa).
- An toàn (mã hoá, chữ ký số).
- Tự động (Smart Contract).

---

## 1.5. Hợp đồng thông minh (Smart Contract)

Smart Contract là các chương trình tự động thực thi trên blockchain khi thỏa điều kiện xác định. Trong hệ thống bán vé máy bay, Smart Contract có thể:
- Phát hành vé khi thanh toán thành công.
- Lưu thông tin vé/chuyến bay/giao dịch.
- Ngăn chặn gian lận và trùng lặp vé.

---

## 1.6. Mối quan hệ giữa CSDL phân tán và Blockchain

| Tiêu chí         | CSDL phân tán truyền thống      | Blockchain                  |
|------------------|----------------------------------|-----------------------------|
| Kiến trúc        | Client–Server, nhiều site        | P2P, phi tập trung          |
| Đồng bộ          | 2PC, replication                 | Đồng thuận (consensus)      |
| Toàn vẹn dữ liệu | ACID                             | Hash & chữ ký số            |
| Bảo mật          | Tài khoản & phân quyền           | Mã hoá, minh bạch           |
| Thay đổi dữ liệu | Có thể cập nhật                  | Bất biến                    |
| Hiệu năng        | Nhanh, cần quản trị              | Chậm hơn, an toàn hơn       |

Kết luận: Blockchain là một dạng đặc biệt của CSDL phân tán, nơi mọi node đều lưu bản sao dữ liệu và đồng thuận trước khi ghi mới.

---

## 1.7. Ứng dụng Blockchain trong bán vé máy bay

Vấn đề truyền thống:
- Dữ liệu vé tập trung → dễ bị sửa/làm giả.
- Khó xác thực vé khi mua qua đại lý trung gian.
- Cần tin tưởng bên thứ ba (server hãng).

Giải pháp Blockchain:
- Mỗi vé là một bản ghi duy nhất (token) on-chain.
- Tất cả các node (hãng, sân bay, đại lý) cùng xác thực vé.
- Không thể sửa hoặc nhân bản vé.

Lợi ích:
- Minh bạch, bảo mật, chống gian lận.
- Giảm chi phí trung gian.
- Xác thực vé ngay cả khi máy chủ hãng lỗi.

---

## 2.1. Mục tiêu và phạm vi (Chương 2 – Phần đầu)

- Xây dựng hệ thống web cho phép người dùng tra cứu, đặt, thanh toán vé máy bay.
- Dữ liệu chuyến bay và vé được lưu phân tán giữa nhiều chi nhánh và blockchain, đảm bảo toàn vẹn và minh bạch.

---

## 2.2. Quy trình tìm kiếm chuyến bay

a) Mô tả tổng quan
- Người dùng nhập điểm đi – điểm đến – ngày khởi hành.
- Hệ thống gửi truy vấn đến các site phân tán (HN, DN, HCM) hoặc smart contract để lấy danh sách chuyến bay.

b) Sơ đồ quy trình

```
Người dùng → Nhập thông tin → Gửi yêu cầu →
API tìm kiếm → 
Truy vấn các site CSDL phân tán hoặc Blockchain →
Trả kết quả → Hiển thị danh sách chuyến bay
```

c) Quy trình kỹ thuật
1) Frontend (Next.js): giao diện tìm chuyến bay.
2) API Backend: SQL hợp nhất 3 site (ví dụ):

```sql
SELECT * FROM Flight_HN
UNION
SELECT * FROM Flight_DN
UNION
SELECT * FROM Flight_HCM;
```

3) Blockchain (Smart Contract): hàm truy vấn (ví dụ getAllFlights()) hoặc listener mirror FlightCreated để phục vụ đọc nhanh.
4) Hiển thị kết quả: Web gọi API và/hoặc Web3 để render danh sách.

d) Mục tiêu
- Người dùng xem toàn bộ chuyến bay hiện có, dù dữ liệu trải trên nhiều node hoặc on-chain.
- Minh bạch và không phụ thuộc server trung tâm.

---

## 2.3. Vai trò và cơ chế quản trị (Admin)

a) Vì sao cần Admin
- Tạo/xác thực các node phân tán.
- Deploy, nâng cấp, giám sát smart contracts.
- Tạo chuyến bay mới, quản lý người dùng/vé.
- Giám sát đồng bộ dữ liệu và xử lý sự cố.

b) Vai trò trong hệ thống

| Vai trò                    | Quyền hạn                            | Nhiệm vụ chính                                |
|---------------------------|--------------------------------------|-----------------------------------------------|
| Admin                     | Toàn quyền hệ thống                  | Tạo chuyến bay, quản lý node, deploy contract |
| Nhân viên (Employee)     | Quản lý vé, khách hàng tại chi nhánh | Cập nhật dữ liệu off-chain                    |
| Đại lý (Agent)           | Bán vé, tra cứu vé trên blockchain   | Giao dịch thực                                |
| Khách hàng (Customer)    | Đặt và xác thực vé                   | Giao diện web                                 |
| Sân bay (Airport Node)   | Check-in và xác minh vé              | Node xác thực blockchain                      |

c) Quyền quản trị trong Smart Contract (ví dụ)

```solidity
address public admin;

modifier onlyAdmin() {
    require(msg.sender == admin, "Only admin can perform this action");
    _;
}

constructor() {
    admin = msg.sender;
}

function createFlight(
    string memory _code,
    string memory _from,
    string memory _to,
    uint256 _date,
    uint256 _price
) public onlyAdmin {
    flights[_code] = Flight(_code, _from, _to, _date, _price, true);
}
```

Chỉ admin có quyền tạo/huỷ chuyến bay trên blockchain. Dữ liệu vé và giao dịch do người dùng tạo sẽ không thể sửa đổi, ngay cả bởi admin.

---

## 2.4. Kiến trúc tổng thể hệ thống

```
[Người dùng] 
   ↓
[Web/App (Next.js)] 
   ↓
[API Gateway / Node.js Backend]
   ↓
[CSDL Phân tán 3 site (HN, DN, HCM)]
   ↔ [Blockchain Network (Smart Contracts)]
```

- CSDL phân tán: lưu thông tin khách hàng, thanh toán.
- Blockchain: lưu vé, chuyến bay, giao dịch.
- API trung gian hợp nhất kết quả cho người dùng.

---

## 2.5. Kết luận phần gộp

Hệ thống quản lý bán vé máy bay ứng dụng Blockchain giúp:
- Đảm bảo toàn vẹn dữ liệu và chống gian lận.
- Tăng minh bạch và tin cậy giữa các bên.
- Kết hợp sức mạnh CSDL phân tán (hiệu năng) và Blockchain (an toàn, bất biến).
- Duy trì vai trò quản trị hợp lý (Admin) để đảm bảo vận hành, triển khai, giám sát toàn hệ thống.

---