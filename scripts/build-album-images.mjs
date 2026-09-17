/**
 * Nén bộ ảnh cưới gốc thành ảnh web cho trang /album.
 *
 *   node scripts/build-album-images.mjs
 *
 * Đọc: public/images/anh_cuoi/  (ảnh gốc ~332MB, KHÔNG commit — đã gitignore)
 * Ghi: public/images/album/<chapter>/NN.jpg  (~6.8MB cho 37 ảnh)
 *
 * Danh sách PLAN/WIDE/HERO bên dưới là số thứ tự ảnh sau khi sắp xếp tên file
 * theo alphabet. Muốn đổi ảnh nào vào album thì sửa đúng mấy mảng đó rồi chạy
 * lại script, sau đó cập nhật lib/wedding.ts nếu số lượng ảnh thay đổi.
 */

import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const SRC = "public/images/anh_cuoi";
const OUT = "public/images/album";
const files = fs.readdirSync(SRC).filter((f) => /\.jpe?g$/i.test(f)).sort();
const at = (n) => path.join(SRC, files[n - 1]);

// Chọn theo số thứ tự đã xem trên contact sheet. Bỏ các khung chụp liên thanh
// gần trùng nhau (01-06, 15-18, 40-43, 49-52, 55-56...) — album cần ảnh khác
// nhau, không cần đủ mọi khung bấm máy.
const PLAN = {
  "santori/": [17, 8, 9, 12, 13, 15, 19, 20, 21, 22, 23, 14, 26, 27, 28, 31, 34, 35],
  "studio/": [40, 42, 44, 45, 46, 47, 48, 49, 50, 52, 53, 55],
  "ao-dai/": [36, 38, 39],
};
// Ảnh ngang: chỉ 6 khung trong cả bộ, đều thuộc buổi ngoại cảnh.
const WIDE = { "santori/cover": 7, closing: 30 };
const HERO = { "hero-01": 24, "hero-02": 51 };

const PORTRAIT_EDGE = 1800;
const WIDE_EDGE = 2200;

let bytes = 0;
async function write(src, dest, edge) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  // .rotate() KHÔNG có tham số = áp cờ EXIF orientation rồi ghi thẳng vào pixel.
  // Bắt buộc: 50/56 ảnh gốc là ảnh dọc lưu nằm ngang kèm cờ xoay; bỏ bước này
  // thì bản nén ra sẽ mất cờ và hiển thị nằm nghiêng.
  const info = await sharp(src)
    .rotate()
    .resize({ width: edge, height: edge, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 78, mozjpeg: true, progressive: true })
    .toFile(dest);
  bytes += info.size;
  return info;
}

for (const [dir, list] of Object.entries(PLAN)) {
  for (let i = 0; i < list.length; i++) {
    const dest = path.join(OUT, dir, String(i + 1).padStart(2, "0") + ".jpg");
    await write(at(list[i]), dest, PORTRAIT_EDGE);
  }
  console.log(dir.padEnd(10), list.length, "ảnh");
}
for (const [name, n] of Object.entries(WIDE)) {
  const info = await write(at(n), path.join(OUT, name + ".jpg"), WIDE_EDGE);
  console.log(name.padEnd(16), info.width + "x" + info.height);
}
for (const [name, n] of Object.entries(HERO)) {
  const info = await write(at(n), path.join(OUT, name + ".jpg"), PORTRAIT_EDGE);
  console.log(name.padEnd(16), info.width + "x" + info.height);
}
console.log("TỔNG:", (bytes / 1048576).toFixed(1) + "MB");
