# Thiết kế CSDL Phân tán (Phân mảnh)

Tài liệu này tóm tắt lược đồ phân mảnh ngang/dẫn xuất và dọc, tương ứng với db/fragmentation.sql.

## 1. Site schemas
- hn: Hà Nội
- dn: Đà Nẵng
- hcm: TP.HCM
- sec: dữ liệu nhạy cảm (private)

## 2. Phân mảnh dọc (Vertical) cho Khách hàng
- Bảng customer_public tại mỗi site: thông tin cơ bản (full_name, phone).
- Bảng sec.customer_private: thông tin nhạy cảm (email, address, national_id).
- View hợp nhất:
  - public.customer_public: UNION ALL hn/dn/hcm.customer_public.
  - public.customer: JOIN public.customer_public với sec.customer_private.

## 3. Phân mảnh ngang (Horizontal)
- Flight theo khu vực xuất phát (origin):
  - hn.flight, dn.flight, hcm.flight; view public.flight hợp nhất.
- Booking/Ticket/Payment đồng định vị theo site flight:
  - hn.booking/ticket/payment, dn.booking/ticket/payment, hcm.booking/ticket/payment.
  - Views public.booking/public.ticket/public.payment hợp nhất.

## 4. Ràng buộc và toàn vẹn
- Khóa ngoại cục bộ trong từng site (ví dụ hn.ticket → hn.booking).
- Toàn vẹn liên site quản lý qua ứng dụng hoặc trigger cross-schema.
- Kiểm tra sức chứa máy bay (capacity) qua trigger trg_CheckSeatAvailability (xem db/triggers.sql).

## 5. Lợi ích và hiệu năng
- Truy vấn cục bộ nhanh hơn, giảm tải liên miền.
- Phân quyền theo site, dễ cô lập sự cố.
- Analytics dùng các view hợp nhất để tổng hợp.

## 6. Ghi chú triển khai
- Ưu tiên dùng Postgres cho demo phân mảnh vật lý (schemas).
- Có thể thay bằng nhiều cluster vật lý qua FDW hoặc logical replication.