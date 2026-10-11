/**
 * Nén bộ ảnh cưới gốc thành ảnh web cho trang /album.
 *
 *   node scripts/build-album-images.mjs
 *
 * Đọc: public/images/anh_cuoi/moi/  (ảnh gốc "01 (N).jpg" ~300MB, KHÔNG commit — đã gitignore)
 * Ghi: public/images/album/NN.jpg + cover.jpg + closing.jpg
 *
 * Số trong PLAN/WIDE là số N trong tên file gốc "01 (N).jpg". Album chỉ gồm
 * các ảnh CHƯA dùng ở trang chủ (hero, chuyện chúng mình, địa điểm, footer,
 * chân dung cô dâu chú rể). Muốn đổi ảnh thì sửa mấy mảng đó, chạy lại script,
 * rồi cập nhật wedding.album.photos (lib/wedding.ts) và RHYTHM
 * (app/album/story-plan.ts) nếu số lượng ảnh thay đổi.
 */

import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const SRC = "public/images/anh_cuoi/moi";
const OUT = "public/images/album";
const at = (n) => path.join(SRC, `01 (${n}).jpg`);

// Đúng thứ tự kể chuyện: ngoại cảnh → studio → áo dài.
const PLAN = [1, 2, 19, 5, 6, 13, 26, 25, 27, 15, 9, 10, 21, 23, 7, 8];
// Hai ảnh ngang duy nhất còn lại — dành cho hai đầu câu chuyện.
const WIDE = { cover: 3, closing: 17 };

const PORTRAIT_EDGE = 1800;
const WIDE_EDGE = 2200;

let bytes = 0;
async function write(src, dest, edge) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  // .rotate() KHÔNG có tham số = áp cờ EXIF orientation rồi ghi thẳng vào pixel.
  const info = await sharp(src)
    .rotate()
    .resize({ width: edge, height: edge, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 78, mozjpeg: true, progressive: true })
    .toFile(dest);
  bytes += info.size;
  return info;
}

for (let i = 0; i < PLAN.length; i++) {
  await write(at(PLAN[i]), path.join(OUT, String(i + 1).padStart(2, "0") + ".jpg"), PORTRAIT_EDGE);
}
console.log("ảnh dọc", PLAN.length);
for (const [name, n] of Object.entries(WIDE)) {
  const info = await write(at(n), path.join(OUT, name + ".jpg"), WIDE_EDGE);
  console.log(name.padEnd(10), info.width + "x" + info.height);
}
console.log("TỔNG:", (bytes / 1048576).toFixed(1) + "MB");
