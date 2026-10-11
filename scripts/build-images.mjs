/**
 * Nén bộ ảnh cưới gốc thành ảnh web cho TOÀN BỘ site (trang chủ + /album).
 *
 *   node scripts/build-images.mjs
 *
 * Đọc: public/images/anh_cuoi/  (ảnh gốc "01 (N).jpg" ~270MB, KHÔNG commit — đã gitignore)
 * Ghi: public/images/wedding/*.jpg và public/images/album/*.jpg, đúng tên file
 *      mà lib/wedding.ts đang dùng — đổi ảnh chỉ cần sửa số N ở hai bảng dưới.
 *
 * Mục tiêu là nét nhất có thể ở cỡ web, vì next/image còn nén lại một lần nữa
 * khi phục vụ: ảnh nguồn càng sạch thì bản WebP gửi cho khách càng nét.
 *   - Cạnh dài 2400px (dọc) / 3000px (ngang): đủ cho lightbox toàn màn hình
 *     trên màn retina mà không phải phóng to.
 *   - JPEG q85 + chroma 4:4:4: không bệt màu ở viền váy trắng / nền xanh,
 *     không có khối nhoè kiểu q78 4:2:0 trước đây.
 *   - sharpen rất nhẹ (sigma 0.5) sau khi thu nhỏ để bù độ mềm do lanczos.
 */

import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const SRC = "public/images/anh_cuoi";
const at = (n) => path.join(SRC, `01 (${n}).jpg`);

const PORTRAIT_EDGE = 2400;
const WIDE_EDGE = 3000;

/** Ảnh trang chủ: tên file → số N của ảnh gốc. */
const HOME = {
  "home-hero": 18,
  "home-story-01": 24,
  "home-story-02": 14,
  "home-story-03": 19,
  "venue-bride": 15,
  "venue-groom": 26,
  chu_re_1: 12,
  co_dau: 11,
  "home-gallery-01": 27,
  "home-gallery-02": 8,
  "home-gallery-03": 7,
  "home-gallery-04": 20,
  "home-gallery-05": 10,
  "home-gallery-06": 22,
  "home-closing": 16,
};
/** Ảnh chia sẻ link (Open Graph) — cắt 1200×630 từ ảnh footer. */
const OG = 16;

/**
 * /album: mỗi ảnh của site xuất hiện đúng một lần, kể cả ảnh trang chủ. 07 và 10
 * giữ ảnh cũ của venue-groom / venue-bride (ảnh studio) nên trong wedding.album.photos
 * chúng đứng ở khối studio, còn chỗ cũ của chúng do venue-groom / venue-bride thế vào.
 */
const ALBUM = [1, 2, 4, 5, 6, 13, 20, 25, 27, 22, 9, 10, 21, 23, 7, 8];
const ALBUM_WIDE = { cover: 3, closing: 17 };

let bytes = 0;
let count = 0;
async function write(n, dest, pipeline) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  // .rotate() KHÔNG có tham số = áp cờ EXIF orientation rồi ghi thẳng vào pixel.
  const info = await pipeline(sharp(at(n)).rotate())
    .jpeg({ quality: 85, mozjpeg: true, progressive: true, chromaSubsampling: "4:4:4" })
    .toFile(dest);
  bytes += info.size;
  count += 1;
  console.log(dest.padEnd(42), `${info.width}x${info.height}`.padEnd(10), (info.size / 1024).toFixed(0) + "KB");
}

/** Thu nhỏ để cạnh dài = edge (không phóng to ảnh nhỏ hơn), rồi làm nét nhẹ. */
const fit = (edge) => (img) =>
  img
    .resize({ width: edge, height: edge, fit: "inside", withoutEnlargement: true, kernel: "lanczos3" })
    .sharpen({ sigma: 0.5 });

for (const [name, n] of Object.entries(HOME)) {
  const meta = await sharp(at(n)).metadata();
  const wide = (meta.width ?? 0) > (meta.height ?? 0);
  await write(n, `public/images/wedding/${name}.jpg`, fit(wide ? WIDE_EDGE : PORTRAIT_EDGE));
}
await write(OG, "public/images/wedding/og.jpg", (img) =>
  img.resize({ width: 1200, height: 630, fit: "cover", kernel: "lanczos3" }).sharpen({ sigma: 0.5 }),
);

for (let i = 0; i < ALBUM.length; i++) {
  await write(ALBUM[i], `public/images/album/${String(i + 1).padStart(2, "0")}.jpg`, fit(PORTRAIT_EDGE));
}
for (const [name, n] of Object.entries(ALBUM_WIDE)) {
  await write(n, `public/images/album/${name}.jpg`, fit(WIDE_EDGE));
}

console.log(`${count} ảnh, TỔNG: ${(bytes / 1048576).toFixed(1)}MB`);
