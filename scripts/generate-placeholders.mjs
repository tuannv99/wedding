/**
 * Sinh ảnh cưới placeholder (mock) cho toàn bộ website.
 *
 *   npm run gen:images
 *
 * Ảnh được ghi vào public/images/wedding/ đúng tên file mà lib/wedding.ts đang dùng,
 * nên khi có ảnh cưới thật chỉ cần ghi đè file cùng tên (giữ đúng tỉ lệ khung là đẹp nhất).
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT_DIR = path.join(process.cwd(), "public", "images", "wedding");

const PALETTE = {
  ivory: "#F9F7F2",
  warm: "#FFFDFC",
  ink: "#3D3935",
  taupe: "#A99F95",
  sage: "#AAB2A3",
  champagne: "#D8C5A5",
};

/** Mỗi ảnh có một tổ hợp tone riêng để gallery không bị đơn điệu. */
const TONES = [
  [PALETTE.champagne, PALETTE.taupe],
  [PALETTE.sage, PALETTE.champagne],
  [PALETTE.taupe, PALETTE.sage],
  [PALETTE.champagne, PALETTE.sage],
];

function escapeXml(value) {
  // normalize NFC: dấu tiếng Việt phải là ký tự dựng sẵn, nếu không letter-spacing
  // sẽ đẩy dấu thanh lệch khỏi nguyên âm khi render SVG.
  return value
    .normalize("NFC")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function svg({ width, height, label, tone, monogram = true }) {
  const [from, to] = tone;
  const short = Math.min(width, height);
  const frame = Math.round(short * 0.045);
  const monogramSize = Math.round(short * 0.13);
  const labelSize = Math.max(11, Math.round(short * 0.022));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="base" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${PALETTE.warm}"/>
      <stop offset="55%" stop-color="${PALETTE.ivory}"/>
      <stop offset="100%" stop-color="${from}" stop-opacity="0.55"/>
    </linearGradient>
    <radialGradient id="glowA" cx="22%" cy="18%" r="65%">
      <stop offset="0%" stop-color="${to}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${to}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowB" cx="82%" cy="88%" r="70%">
      <stop offset="0%" stop-color="${from}" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="${from}" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="${Math.round(short * 0.06)}"/>
    </filter>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#base)"/>
  <rect width="${width}" height="${height}" fill="url(#glowA)"/>
  <rect width="${width}" height="${height}" fill="url(#glowB)"/>

  <g filter="url(#soft)" opacity="0.5">
    <ellipse cx="${width * 0.3}" cy="${height * 0.72}" rx="${width * 0.3}" ry="${height * 0.2}" fill="${to}" opacity="0.35"/>
    <ellipse cx="${width * 0.76}" cy="${height * 0.3}" rx="${width * 0.26}" ry="${height * 0.18}" fill="${from}" opacity="0.3"/>
  </g>

  <rect x="${frame}" y="${frame}" width="${width - frame * 2}" height="${height - frame * 2}"
        fill="none" stroke="${PALETTE.taupe}" stroke-opacity="0.45" stroke-width="1"/>

  ${
    monogram
      ? `<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
        font-family="Cambria, 'Times New Roman', Georgia, serif" font-size="${monogramSize}"
        letter-spacing="${Math.round(monogramSize * 0.12)}"
        fill="${PALETTE.ink}" fill-opacity="0.42">T &amp; H</text>`
      : ""
  }

  <text x="50%" y="${height - frame * 2}" text-anchor="middle"
        font-family="Helvetica, Arial, sans-serif" font-size="${labelSize}"
        letter-spacing="${Math.round(labelSize * 0.28)}"
        fill="${PALETTE.ink}" fill-opacity="0.35">${escapeXml(label.toUpperCase())}</text>
</svg>`;
}

const IMAGES = [
  { file: "hero.jpg", width: 1600, height: 2000, label: "Hero · 4:5", tone: TONES[0], monogram: false },
  { file: "story.jpg", width: 1200, height: 1500, label: "Our story · 4:5", tone: TONES[1] },
  { file: "closing.jpg", width: 1800, height: 1200, label: "Closing · 3:2", tone: TONES[2], monogram: false },
  { file: "gallery-01.jpg", width: 1200, height: 1500, label: "Gallery 01 · 4:5", tone: TONES[3] },
  { file: "gallery-02.jpg", width: 1200, height: 1200, label: "Gallery 02 · 1:1", tone: TONES[0] },
  { file: "gallery-03.jpg", width: 1200, height: 1200, label: "Gallery 03 · 1:1", tone: TONES[1] },
  { file: "gallery-04.jpg", width: 1200, height: 1600, label: "Gallery 04 · 3:4", tone: TONES[2] },
  { file: "gallery-05.jpg", width: 1600, height: 1067, label: "Gallery 05 · 3:2", tone: TONES[3] },
  { file: "gallery-06.jpg", width: 2000, height: 1000, label: "Gallery 06 · 2:1", tone: TONES[1] },
];

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  for (const image of IMAGES) {
    const buffer = Buffer.from(svg(image));
    const target = path.join(OUT_DIR, image.file);

    await sharp(buffer, { density: 96 })
      .jpeg({ quality: 82, mozjpeg: true, chromaSubsampling: "4:4:4" })
      .toFile(target);

    console.log(`✓ ${image.file} (${image.width}×${image.height})`);
  }

  // Ảnh Open Graph 1200×630
  const ogSvg = svg({
    width: 1200,
    height: 630,
    label: "Tuấn & Hoa · 20 · 09 · 2026",
    tone: TONES[0],
    monogram: false,
  }).replace(
    "</svg>",
    `<text x="50%" y="46%" text-anchor="middle" dominant-baseline="middle"
       font-family="Cambria, 'Times New Roman', Georgia, serif" font-size="104" letter-spacing="16"
       fill="${PALETTE.ink}" fill-opacity="0.85">${escapeXml("TUẤN & HOA")}</text>
     <text x="50%" y="63%" text-anchor="middle" dominant-baseline="middle"
       font-family="Helvetica, Arial, sans-serif" font-size="22" letter-spacing="12"
       fill="${PALETTE.ink}" fill-opacity="0.55">WE ARE GETTING MARRIED</text>
   </svg>`,
  );

  await sharp(Buffer.from(ogSvg))
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(path.join(OUT_DIR, "og.jpg"));
  console.log("✓ og.jpg (1200×630)");

  // Ghi chú cho thư mục nhạc
  const audioDir = path.join(process.cwd(), "public", "audio");
  await mkdir(audioDir, { recursive: true });
  await writeFile(
    path.join(audioDir, "README.md"),
    [
      "# Nhạc nền",
      "",
      "Tên file cấu hình trong `lib/wedding.ts` (`wedding.music.src`).",
      "",
      "- Nếu file lỗi hoặc chưa có, nút nhạc ở góc phải sẽ tự động ẩn.",
      "- Nên nén xuống dưới ~4MB (128 kbps) cho khách dùng 3G/4G.",
      "- Nhớ dùng bản nhạc có bản quyền hợp lệ.",
      "",
    ].join("\n"),
    // "wx": không ghi đè nếu file đã có (tránh xoá ghi chú bạn tự sửa)
    { encoding: "utf8", flag: "wx" },
  ).then(
    () => console.log("✓ public/audio/README.md"),
    () => console.log("· public/audio/README.md đã có, bỏ qua"),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
