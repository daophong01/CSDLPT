export default function ArchitecturePage() {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Thiết kế CSDL phân tán cho quản lý vé máy bay</h1>
      <p>
        Bản mẫu này mô tả kiến trúc định hướng: microservices cho các miền chính (Danh mục chuyến bay,
        Tồn kho ghế/đặt chỗ, Thanh toán, Khách hàng), kèm các chiến lược dữ liệu phân tán.
      </p>
      <ul className="list-disc pl-5 space-y-2">
        <li>Phân vùng dữ liệu theo khu vực/đường bay; sao chép theo chế độ nhiều vùng để tăng sẵn sàng.</li>
        <li>Event sourcing + CQRS để tách luồng ghi (đặt chỗ) và luồng đọc (tìm kiếm) tối ưu.</li>
        <li>Kho dữ liệu tìm kiếm (ví dụ: Elasticsearch) đồng bộ bằng sự kiện để phục vụ truy vấn nhanh.</li>
        <li>Kho giao dịch nhất quán (ví dụ: Postgres/CockroachDB) cho tồn kho ghế với kiểm soát cạnh tranh.</li>
        <li>Hàng đợi sự kiện (Kafka/Pulsar) làm xương sống tích hợp giữa dịch vụ.</li>
      </ul>
      <p className="text-sm text-black/70 dark:text-white/70">
        Xem README để có mô tả chi tiết và các gợi ý triển khai thực tế.
      </p>
    </section>
  );
}