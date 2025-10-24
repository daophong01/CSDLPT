import Link from "next/link";

export default function Home() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">AirTicket — Hệ thống quản lý vé máy bay</h1>
      <p className="text-black/80 dark:text-white/80">
        Đây là bản mẫu ứng dụng web bằng Next.js, mô phỏng quy trình tìm kiếm, đặt chỗ
        và quản lý vé máy bay. Ứng dụng định hướng thiết kế cơ sở dữ liệu phân tán để
        đảm bảo khả năng mở rộng, sẵn sàng cao và tính nhất quán hợp lý.
      </p>

      <div className="grid sm:grid-cols-3 gap-4">
        <Link href="/search" className="block border rounded-lg p-4 hover:bg-black/[.03] dark:hover:bg-white/[.06]">
          <h2 className="font-semibold">Tìm chuyến bay</h2>
          <p className="text-sm">Tìm kiếm theo điểm đi/đến, ngày bay.</p>
        </Link>
        <Link href="/bookings" className="block border rounded-lg p-4 hover:bg-black/[.03] dark:hover:bg-white/[.06]">
          <h2 className="font-semibold">Đặt chỗ</h2>
          <p className="text-sm">Xem và quản lý các đặt chỗ đã tạo.</p>
        </Link>
        <Link href="/architecture" className="block border rounded-lg p-4 hover:bg-black/[.03] dark:hover:bg-white/[.06]">
          <h2 className="font-semibold">Kiến trúc phân tán</h2>
          <p className="text-sm">Mô tả thiết kế CSDL phân tán cho hệ thống.</p>
        </Link>
        <Link href="/onchain" className="block border rounded-lg p-4 hover:bg-black/[.03] dark:hover:bg-white/[.06]">
          <h2 className="font-semibold">On-chain</h2>
          <p className="text-sm">Xem chuyến bay từ sự kiện on-chain và mua vé (demo).</p>
        </Link>
        <Link href="/verify" className="block border rounded-lg p-4 hover:bg-black/[.03] dark:hover:bg-white/[.06]">
          <h2 className="font-semibold">Xác thực vé</h2>
          <p className="text-sm">Tra cứu vé từ mirror on-chain theo ticketId.</p>
        </Link>
      </div>
    </section>
  );
}
