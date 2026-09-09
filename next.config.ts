import type { NextConfig } from "next";

// Header áp cho mọi route — không chặn được clickjacking cho riêng /admin vì
// Next.js không cho set header khác nhau theo path một cách có điều kiện dễ
// dàng ở đây, nhưng site này không có route nào cần bị nhúng iframe từ nơi
// khác nên áp toàn site là an toàn và đơn giản hơn.
const securityHeaders = [
  // Chặn toàn bộ site bị nhúng iframe từ nơi khác — mục tiêu chính là bảo vệ
  // /admin khỏi bị dụ click nhầm nút Duyệt/Xoá qua iframe ẩn (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
