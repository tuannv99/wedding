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

/**
 * Placeholder theo đúng "ngôn ngữ" của bản design: nền ivory ấm, sọc chéo rất nhạt,
 * nhãn mono ở góc phải dưới (giống class .wd-mono trong styles/wedding.css).
 */
function svg({ width, height, label, tone }) {
  const [from, to] = tone;
  const short = Math.min(width, height);
  const pad = Math.round(short * 0.045);
  const stripe = Math.max(8, Math.round(short * 0.018));
  const labelSize = Math.max(11, Math.round(short * 0.019));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="base" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${PALETTE.warm}"/>
      <stop offset="60%" stop-color="${PALETTE.ivory}"/>
      <stop offset="100%" stop-color="${from}" stop-opacity="0.35"/>
    </linearGradient>
    <radialGradient id="glow" cx="24%" cy="20%" r="70%">
      <stop offset="0%" stop-color="${to}" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="${to}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="hatch" width="${stripe}" height="${stripe}"
             patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="${stripe}"
            stroke="${PALETTE.taupe}" stroke-opacity="0.16" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#base)"/>
  <rect width="${width}" height="${height}" fill="url(#glow)"/>
  <rect width="${width}" height="${height}" fill="url(#hatch)"/>

  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}"
        fill="none" stroke="${PALETTE.taupe}" stroke-opacity="0.3" stroke-width="1"/>

  <text x="${width - pad}" y="${height - pad}" text-anchor="end"
        font-family="Consolas, 'Courier New', monospace" font-size="${labelSize}"
        letter-spacing="${Math.max(1, Math.round(labelSize * 0.14))}"
        fill="${PALETTE.taupe}">${escapeXml(label.toUpperCase())}</text>
</svg>`;
}

const IMAGES = [
  { file: "hero.jpg", width: 1600, height: 2000, label: "Ảnh bìa · ảnh cưới tràn viền", tone: TONES[0] },
  { file: "story.jpg", width: 1200, height: 1500, label: "Chuyện chúng mình · 4:5", tone: TONES[1] },
  { file: "closing.jpg", width: 1800, height: 1200, label: "Ảnh kết · 3:2", tone: TONES[2] },
  { file: "gallery-01.jpg", width: 1200, height: 1500, label: "Ảnh cưới 01 · 4:5", tone: TONES[3] },
  { file: "gallery-02.jpg", width: 1200, height: 1200, label: "Ảnh cưới 02 · 1:1", tone: TONES[0] },
  { file: "gallery-03.jpg", width: 1200, height: 1200, label: "Ảnh cưới 03 · 1:1", tone: TONES[1] },
  { file: "gallery-04.jpg", width: 1200, height: 1600, label: "Ảnh cưới 04 · 3:4", tone: TONES[2] },
  { file: "gallery-05.jpg", width: 1600, height: 1067, label: "Ảnh cưới 05 · 3:2", tone: TONES[3] },
  { file: "gallery-06.jpg", width: 2000, height: 1000, label: "Ảnh cưới 06 · 2:1", tone: TONES[1] },
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
    label: "20 · 09 · 2026",
    tone: TONES[0],
  }).replace(
    "</svg>",
    `<text x="50%" y="46%" text-anchor="middle" dominant-baseline="middle"
       font-family="Cambria, 'Times New Roman', Georgia, serif" font-size="104" letter-spacing="16"
       fill="${PALETTE.ink}" fill-opacity="0.85">${escapeXml("TUẤN & HOA")}</text>
     <text x="50%" y="63%" text-anchor="middle" dominant-baseline="middle"
       font-family="Helvetica, Arial, sans-serif" font-size="22" letter-spacing="12"
       fill="${PALETTE.ink}" fill-opacity="0.55">${escapeXml("CHÚNG MÌNH SẮP CƯỚI")}</text>
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
