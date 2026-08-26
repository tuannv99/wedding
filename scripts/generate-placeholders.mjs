/**
 * Sinh ảnh cưới DEMO cho toàn bộ website.
 *
 *   npm run gen:images
 *
 * Đây KHÔNG phải ảnh cưới thật — chỉ là ảnh dựng sẵn để xem bố cục. Ảnh được
 * ghi vào public/images/wedding/ đúng tên file mà lib/wedding.ts đang dùng, nên
 * khi có ảnh thật chỉ cần ghi đè file cùng tên (giữ đúng tỉ lệ khung là đẹp nhất).
 *
 * Ngôn ngữ hình ảnh cố tình trùng với art direction của site: nền ivory ấm,
 * quầng sáng nhoè kiểu ảnh xoá phông, và một nhánh botanical nét mảnh dựng từ
 * ĐÚNG công thức hình học trong components/ui/Botanical.tsx (Bézier + lá đặt
 * theo tiếp tuyến), để ảnh demo và hoạ tiết trên trang là cùng một nét vẽ.
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

/** PRNG có hạt giống — chạy lại script luôn ra đúng bộ ảnh cũ. */
function makeRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const round = (n) => Math.round(n * 1000) / 1000;

// ---------------------------------------------------------------------------
// Hình học botanical — giữ khớp với components/ui/Botanical.tsx
// ---------------------------------------------------------------------------

function pointAt([p0, p1, p2, p3], t) {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
}

function angleAt([p0, p1, p2, p3], t) {
  const u = 1 - t;
  const dx =
    3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]);
  const dy =
    3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

const leafPath = (length, width) =>
  `M0 0 C${round(length * 0.2)} ${round(-width)}, ${round(length * 0.66)} ${round(-width * 0.82)}, ${round(length)} 0` +
  ` C${round(length * 0.66)} ${round(width * 0.82)}, ${round(length * 0.2)} ${round(width)}, 0 0`;

const STEM = [
  [138, 374],
  [88, 300],
  [116, 158],
  [30, 18],
];

/** Nhánh botanical vẽ trong hệ toạ độ 150×392, để caller scale/xoay tuỳ ảnh. */
function botanicalBranch({ opacity }) {
  const leaves = Array.from({ length: 11 }, (_, i) => {
    const t = 0.06 + (0.89 * i) / 10;
    const [x, y] = pointAt(STEM, t);
    const side = i % 2 === 0 ? 1 : -1;
    const length = (36 + (13 - 36) * t) * (i % 3 === 1 ? 0.86 : 1);
    return { x: round(x), y: round(y), angle: round(angleAt(STEM, t) + side * 54), length: round(length) };
  });

  const stemPath = `M${STEM[0][0]} ${STEM[0][1]} C${STEM[1][0]} ${STEM[1][1]}, ${STEM[2][0]} ${STEM[2][1]}, ${STEM[3][0]} ${STEM[3][1]}`;

  return `<g fill="none" stroke="${PALETTE.sage}" stroke-linecap="round"
             stroke-linejoin="round" opacity="${opacity}">
    <path d="${stemPath}" stroke-width="1.6"/>
    ${leaves
      .map(
        (leaf) => `<g transform="translate(${leaf.x} ${leaf.y}) rotate(${leaf.angle})">
        <path d="${leafPath(leaf.length, leaf.length * 0.3)}" stroke-width="1.3"
              fill="${PALETTE.sage}" fill-opacity="0.16"/>
      </g>`,
      )
      .join("\n    ")}
  </g>`;
}

// ---------------------------------------------------------------------------
// Ảnh demo
// ---------------------------------------------------------------------------

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
 * "Quầng sáng xoá phông": vài vòng tròn mềm, to nhỏ khác nhau, đặt theo PRNG —
 * đủ để mắt đọc ra là một tấm ảnh chụp thiếu nét chứ không phải ô màu phẳng.
 */
function bokeh({ width, height, seed, tint }) {
  const random = makeRandom(seed);
  const short = Math.min(width, height);

  return Array.from({ length: 14 }, (_, i) => {
    const r = short * (0.05 + random() * 0.22);
    const cx = width * (random() * 1.1 - 0.05);
    const cy = height * (random() * 1.1 - 0.05);
    const fill = i % 3 === 0 ? PALETTE.warm : tint;
    const alpha = 0.12 + random() * 0.26;

    return `<circle cx="${round(cx)}" cy="${round(cy)}" r="${round(r)}"
            fill="${fill}" opacity="${round(alpha)}" filter="url(#soft)"/>`;
  }).join("\n    ");
}

function svg({ width, height, label, tint, seed, branch }) {
  const short = Math.min(width, height);
  const pad = Math.round(short * 0.045);
  const labelSize = Math.max(11, Math.round(short * 0.018));

  /*
    Nhánh neo theo GỐC cành (điểm 138,374 trong hệ toạ độ artwork), không theo
    góc hộp vẽ: nhờ vậy `branch.x/branch.y` là "cắm gốc cành ở đâu", còn thân
    và lá luôn vươn ra từ đó — đổi scale/rotate không làm cành trôi khỏi khung.
    `flip` lật ngang để cành vươn sang phía đối diện mà không cần vẽ hình mới.
  */
  const branchLayer = branch
    ? (() => {
        const scale = (short * branch.scale) / 392;
        const sx = branch.flip ? -scale : scale;
        return `<g transform="translate(${round(width * branch.x)} ${round(height * branch.y)}) rotate(${branch.rotate}) scale(${round(sx)} ${round(scale)}) translate(-138 -374)">
      ${botanicalBranch({ opacity: branch.opacity })}
    </g>`;
      })()
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="base" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0%" stop-color="${PALETTE.warm}"/>
      <stop offset="40%" stop-color="${PALETTE.ivory}"/>
      <stop offset="100%" stop-color="${tint}" stop-opacity="0.85"/>
    </linearGradient>
    <radialGradient id="sun" cx="24%" cy="14%" r="68%">
      <stop offset="0%" stop-color="${PALETTE.warm}" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="${PALETTE.warm}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vignette" cx="50%" cy="45%" r="72%">
      <stop offset="55%" stop-color="${PALETTE.taupe}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${PALETTE.taupe}" stop-opacity="0.34"/>
    </radialGradient>
    <linearGradient id="floor" x1="0" y1="0.55" x2="0" y2="1">
      <stop offset="0%" stop-color="${PALETTE.taupe}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${PALETTE.taupe}" stop-opacity="0.4"/>
    </linearGradient>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="${round(short * 0.028)}"/>
    </filter>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#base)"/>
  <g>
    ${bokeh({ width, height, seed, tint })}
  </g>
  <rect width="${width}" height="${height}" fill="url(#sun)"/>
  <rect width="${width}" height="${height}" fill="url(#floor)"/>
  ${branchLayer}
  <rect width="${width}" height="${height}" fill="url(#vignette)"/>

  <text x="${width - pad}" y="${height - pad}" text-anchor="end"
        font-family="Consolas, 'Courier New', monospace" font-size="${labelSize}"
        letter-spacing="${Math.max(1, Math.round(labelSize * 0.14))}"
        fill="${PALETTE.taupe}" fill-opacity="0.75">${escapeXml(label.toUpperCase())}</text>
</svg>`;
}

/** Lớp hạt phim rất nhẹ — bỏ đi thì ảnh trông "vector" chứ không giống ảnh chụp. */
async function grainOverlay(width, height, seed) {
  const random = makeRandom(seed);
  const pixels = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const v = 128 + Math.round((random() - 0.5) * 255);
    pixels[i * 4] = v;
    pixels[i * 4 + 1] = v;
    pixels[i * 4 + 2] = v;
    pixels[i * 4 + 3] = 12; // ~5% — chỉ đủ phá cảm giác gradient phẳng
  }

  return sharp(pixels, { raw: { width, height, channels: 4 } }).png().toBuffer();
}

const TINTS = [PALETTE.champagne, PALETTE.sage, PALETTE.taupe];

const IMAGES = [
  {
    file: "hero.jpg", width: 1500, height: 1900, label: "Ảnh bìa · nửa phải hero",
    tint: TINTS[0], seed: 11,
    branch: null,
  },
  {
    file: "story-01.jpg", width: 1200, height: 1500, label: "Chuyện chúng mình 01 · 4:5",
    tint: TINTS[1], seed: 23,
    branch: { x: 0.96, y: 1.02, rotate: 7, scale: 0.74, opacity: 0.5 },
  },
  {
    file: "story-02.jpg", width: 1200, height: 1500, label: "Chuyện chúng mình 02 · 4:5",
    tint: TINTS[0], seed: 37,
    branch: { x: 0.04, y: 1.0, rotate: -11, flip: true, scale: 0.66, opacity: 0.46 },
  },
  {
    file: "story-03.jpg", width: 1200, height: 1500, label: "Chuyện chúng mình 03 · 4:5",
    tint: TINTS[2], seed: 41,
    branch: { x: 0.97, y: 0.99, rotate: 10, scale: 0.7, opacity: 0.46 },
  },
  {
    file: "closing.jpg", width: 1800, height: 1200, label: "Ảnh kết · 3:2",
    tint: TINTS[1], seed: 53,
    branch: null,
  },
  // Gallery: cùng tỉ lệ 4:5 vì bản design xếp thành một hàng ảnh cao bằng nhau
  { file: "gallery-01.jpg", width: 1200, height: 1500, label: "Ảnh cưới 01", tint: TINTS[0], seed: 61, branch: { x: 0.96, y: 1.01, rotate: 9, scale: 0.64, opacity: 0.45 } },
  { file: "gallery-02.jpg", width: 1200, height: 1500, label: "Ảnh cưới 02", tint: TINTS[1], seed: 71, branch: null },
  { file: "gallery-03.jpg", width: 1200, height: 1500, label: "Ảnh cưới 03", tint: TINTS[2], seed: 83, branch: { x: 0.04, y: 1.01, rotate: -9, flip: true, scale: 0.6, opacity: 0.43 } },
  { file: "gallery-04.jpg", width: 1200, height: 1500, label: "Ảnh cưới 04", tint: TINTS[0], seed: 97, branch: null },
  { file: "gallery-05.jpg", width: 1200, height: 1500, label: "Ảnh cưới 05", tint: TINTS[1], seed: 103, branch: { x: 0.97, y: 1.0, rotate: 6, scale: 0.62, opacity: 0.45 } },
  { file: "gallery-06.jpg", width: 1200, height: 1500, label: "Ảnh cưới 06", tint: TINTS[2], seed: 113, branch: null },
];

async function render(spec) {
  const grain = await grainOverlay(spec.width, spec.height, spec.seed + 7);

  // .resize() là BẮT BUỘC, không phải để cho đẹp: sharp render SVG ở 96dpi
  // trong khi kích thước trong file SVG tính theo 72dpi, nên ảnh ra to hơn
  // 96/72 = 1.333 lần so với width/height khai báo. Không ép lại kích thước
  // thì lớp grain (đúng width×height) chỉ phủ được 75% ảnh và để lại một
  // đường viền chữ nhật thấy rõ ở đúng mốc 75%.
  return sharp(Buffer.from(svg(spec)), { density: 96 })
    .resize(spec.width, spec.height)
    .composite([{ input: grain, blend: "overlay" }])
    .jpeg({ quality: 84, mozjpeg: true, chromaSubsampling: "4:4:4" });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  for (const image of IMAGES) {
    const pipeline = await render(image);
    await pipeline.toFile(path.join(OUT_DIR, image.file));
    console.log(`✓ ${image.file} (${image.width}×${image.height})`);
  }

  // Ảnh Open Graph 1200×630
  const ogSpec = {
    width: 1200, height: 630, label: "25 · 10 · 2026",
    tint: TINTS[0], seed: 5,
    branch: { x: 0.08, y: 1.06, rotate: -10, scale: 1.05, opacity: 0.45 },
  };
  const ogSvg = svg(ogSpec).replace(
    "</svg>",
    `<text x="50%" y="46%" text-anchor="middle" dominant-baseline="middle"
       font-family="Cambria, 'Times New Roman', Georgia, serif" font-size="104" letter-spacing="16"
       fill="${PALETTE.ink}" fill-opacity="0.85">${escapeXml("TUẤN & HOA")}</text>
     <text x="50%" y="63%" text-anchor="middle" dominant-baseline="middle"
       font-family="Helvetica, Arial, sans-serif" font-size="22" letter-spacing="12"
       fill="${PALETTE.ink}" fill-opacity="0.55">${escapeXml("CHÚNG MÌNH SẮP CƯỚI")}</text>
   </svg>`,
  );
  await sharp(Buffer.from(ogSvg), { density: 96 })
    .resize(ogSpec.width, ogSpec.height)
    .composite([{ input: await grainOverlay(ogSpec.width, ogSpec.height, 12), blend: "overlay" }])
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
      "- Nếu file lỗi hoặc chưa có, nút nhạc trên thanh nav sẽ tự động ẩn.",
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
