# Phân tích & Đặt vấn đề

Tài liệu này mô tả nhu cầu, mục tiêu, phạm vi và mô hình tác nhân của Hệ thống Quản lý Bán Vé Máy Bay phân tán (Hybrid on-chain/off-chain).

## 1. Nhu cầu và tầm quan trọng
- Gian lận và chỉnh sửa dữ liệu trong hệ tập trung.
- Thiếu minh bạch giữa các bên (hãng bay, đại lý, sân bay).
- Quy trình thủ công tốn kém, xử lý hoàn/đổi phức tạp.
- Nhu cầu truy vết giao dịch, kiểm chứng vé, đối soát thanh toán.

## 2. Mục tiêu dự án
- Vé điện tử (NFT e-ticket) được lưu và xác thực on-chain; dữ liệu nhạy cảm giữ off-chain.
- Phân tán dữ liệu theo chi nhánh/khu vực; tối ưu truy vấn cục bộ.
- Đồng bộ sự kiện on-chain sang mirror DB để hiển thị nhanh.
- Phân quyền rõ ràng theo vai trò nghiệp vụ.

## 3. Phạm vi và nhiệm vụ chính
- Quản lý chuyến bay (CHUYENBAY): tạo/sửa/huỷ, đồng bộ.
- Quản lý vé (VE): phát hành, mua, chuyển nhượng, huỷ.
- Đặt mua/đổi/hoàn: kiểm tra điều kiện, cập nhật trạng thái.
- Check-in, đối soát thanh toán: cập nhật on/off-chain.
- Phân quyền + kiểm soát truy cập: theo tác nhân.

## 4. Tác nhân tham gia
- Hãng bay (Airline Ops): quản trị flight, phát hành vé.
- Đại lý (Agent): đặt/giữ vé, thanh toán, xuất vé.
- Sân bay (Airport): kiểm tra vé, hành khách, hỗ trợ boarding.
- Khách hàng (Customer): tra cứu, đặt/mua vé, đổi/hoàn.
- Bộ phận kiểm soát (Auditor): thống kê, đối soát, kiểm tra truy vết.

## 5. Chức năng và tần suất truy cập (tóm tắt)
- Airline Ops: CRUD Flight (cao), đọc Ticket (trung bình), thống kê (trung bình).
- Agent: Create Booking/Payment (cao), đọc Flight (cao), xuất Ticket (cao).
- Customer: đọc Flight/Ticket (cao), yêu cầu đổi/hoàn (thấp-trung bình).
- Airport: đọc Ticket/Booking (trung bình), check-in (trung bình).
- Auditor: đọc mirror/analytics (thấp), duyệt đối soát (thấp).

## 6. Phân quyền theo vai trò (khái quát)
- On-chain: AirlineRegistry, Ticketing, Flight (role/permission).
- Off-chain: vai trò DB (airline_ops, agent, customer, auditor) với GRANT phù hợp trên schemas hn/dn/hcm và sec.

## 7. ERD (mô hình thực thể–liên kết)
Xem docs/ERD.mmd (Mermaid) hoặc ERD.png.
Thực thể chính: Airport, Branch, Airplane, Flight, Customer_public/private, Booking, Ticket, Payment.