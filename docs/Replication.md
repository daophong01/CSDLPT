# Đồng bộ hoá & Replication

Tài liệu này mô tả các lựa chọn replication cho hệ thống: Postgres Logical Replication (khuyến nghị cho demo) và MSSQL Publication/Subscription (tuỳ chọn).

## 1. Postgres Logical Replication (gợi ý)
- Mục tiêu: nhân bản các bảng reference như airport, airplane, và các bảng site-local sang node khác phục vụ DR/analytics.
- Bước mẫu:
  1) Bật wal_level = logical trên publisher.
  2) Tạo publication:
     - CREATE PUBLICATION pub_ref FOR TABLE public.airport, public.airplane;
  3) Trên subscriber, tạo subscription:
     - CREATE SUBSCRIPTION sub_ref CONNECTION 'host=... dbname=... user=...' PUBLICATION pub_ref;
- Lưu ý:
  - Đảm bảo quyền và network (VPN).
  - Với site schemas (hn/dn/hcm), có thể tạo publication riêng cho từng site.

## 2. MSSQL Publication/Subscription (tuỳ chọn)
- Áp dụng khi demo môi trường MSSQL Server.
- Bảng gợi ý: HANGBAY (airline), MAYBAY (airplane), CHUYENBAY (flight), VE (ticket).
- Các bước:
  - Tạo Publication từ Publisher (chi nhánh trung tâm).
  - Thêm Subscription ở Subscriber (chi nhánh phụ).
  - Cấu hình SQL Server Agent để đẩy dữ liệu định kỳ.
- Chụp màn hình các bước thiết lập để nghiệm thu.

## 3. Kiểm thử đồng bộ
- Nhập dữ liệu mẫu: db/sample_data.sql.
- Truy vấn chéo node/site để kiểm tra:
  - SELECT * FROM public.flight;
  - SELECT * FROM public.booking;
- Kiểm tra nhất quán dữ liệu sau replication.