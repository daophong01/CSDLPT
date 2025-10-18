import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AirTicket — Quản lý vé máy bay",
  description: "Ứng dụng Next.js mô phỏng quản lý vé máy bay, định hướng cơ sở dữ liệu phân tán.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="w-full border-b border-black/[.08] dark:border-white/[.145]">
          <nav className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="font-semibold">AirTicket</Link>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/search" className="hover:underline">Tìm chuyến bay</Link>
              <Link href="/bookings" className="hover:underline">Đặt chỗ</Link>
              <Link href="/architecture" className="hover:underline">Kiến trúc</Link>
              <Link href="/verify" className="hover:underline">Xác thực vé</Link>
              <Link href="/onchain" className="hover:underline">On-chain Flights</Link>
              <Link href="/onchain/tickets" className="hover:underline">On-chain Tickets</Link>
            </div>
          </nav>
        </header>
        <main className="max-w-5xl mx-auto px-6 py-8">
          {children}
        </main>
        <footer className="w-full border-t mt-12 border-black/[.08] dark:border-white/[.145]">
          <div className="max-w-5xl mx-auto px-6 py-6 text-sm text-black/70 dark:text-white/70">
            © {new Date().getFullYear()} AirTicket — Mô phỏng quản lý vé máy bay
          </div>
        </footer>
      </body>
    </html>
  );
}
