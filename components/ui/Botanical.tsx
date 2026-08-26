import { cn } from "@/lib/utils";

/**
 * Hệ botanical line-art dùng chung cho toàn site.
 *
 * Art direction: một nét vẽ mực mảnh (fine ink line) tình cờ xuất hiện trên
 * trang editorial — KHÔNG phải decoration đặt vào UI. Vì vậy:
 *  - chỉ stroke mảnh + fill gần như trong suốt, không có mảng màu đặc;
 *  - nhánh cong tự nhiên, lá thưa và nhỏ dần về ngọn, so le hai bên;
 *  - không khung hoa, không cụm đối xứng, không pattern.
 *
 * Hình được sinh từ một đường cong Bézier (thân cành) + lá đặt dọc theo
 * đường đó theo hướng tiếp tuyến, nên mọi preset dùng chung một bộ code —
 * không lặp lại path thủ công. viewBox cũng tính từ bao lồi của hình nên
 * thêm/bớt lá không bao giờ làm lá bị cắt ở mép SVG.
 */

type Point = readonly [number, number];
type Curve = readonly [Point, Point, Point, Point];

/**
 * Làm tròn mọi con số trước khi đưa vào thuộc tính SVG.
 *
 * Bắt buộc, không phải để cho gọn: Math.atan2/sin/cos KHÔNG được spec yêu cầu
 * làm tròn chính xác, nên Node (render phía server) và V8 trong trình duyệt có
 * thể lệch nhau ở vài chữ số cuối. Chuỗi transform/viewBox vì thế khác nhau và
 * React báo hydration mismatch. Làm tròn tới 3 chữ số xoá hẳn khác biệt đó
 * (sai số nằm ở chữ số có nghĩa thứ ~13) mà mắt không thấy khác gì.
 */
const r = (n: number) => Math.round(n * 1000) / 1000;

/** Điểm trên đường cubic Bézier tại t ∈ [0,1]. */
function pointAt([p0, p1, p2, p3]: Curve, t: number): Point {
  const u = 1 - t;
  return [
    r(u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0]),
    r(u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]),
  ];
}

/** Góc tiếp tuyến (độ) tại t — dùng làm hướng mọc của lá. */
function angleAt([p0, p1, p2, p3]: Curve, t: number): number {
  const u = 1 - t;
  const dx =
    3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]);
  const dy =
    3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]);
  return r((Math.atan2(dy, dx) * 180) / Math.PI);
}

const curveToPath = ([p0, p1, p2, p3]: Curve) =>
  `M${p0[0]} ${p0[1]} C${p1[0]} ${p1[1]}, ${p2[0]} ${p2[1]}, ${p3[0]} ${p3[1]}`;

/** Lá thuôn nhọn, vẽ từ gốc (0,0) hướng theo trục +x. */
const leafPath = (length: number, width: number) =>
  `M0 0 C${r(length * 0.2)} ${r(-width)}, ${r(length * 0.66)} ${r(-width * 0.82)}, ${r(length)} 0` +
  ` C${r(length * 0.66)} ${r(width * 0.82)}, ${r(length * 0.2)} ${r(width)}, 0 0`;

/** Tỉ lệ nửa-bề-ngang / chiều dài của một lá. */
const LEAF_RATIO = 0.3;

type Preset = {
  stem: Curve;
  /** Cành phụ (nếu có) — cho cảm giác cây dại, không đều tăm tắp. */
  offshoot?: Curve;
  /** [t đầu, t cuối] khoảng đặt lá dọc thân. */
  span: readonly [number, number];
  count: number;
  /** [dài nhất ở gốc, ngắn nhất ở ngọn]. */
  leaf: readonly [number, number];
  spread: number;
  /** Nụ hoa rất nhỏ ở ngọn — điểm nhấn duy nhất, chỉ vài preset dùng. */
  bloom?: boolean;
};

const PRESETS = {
  /** Nhánh dài, mảnh — dùng để tràn từ cạnh viewport vào trang. */
  branch: {
    stem: [
      [138, 374],
      [88, 300],
      [116, 158],
      [30, 18],
    ],
    offshoot: [
      [110, 226],
      [96, 208],
      [78, 202],
      [50, 198],
    ],
    span: [0.06, 0.95],
    count: 11,
    leaf: [36, 13],
    spread: 54,
    bloom: true,
  },
  /** Nhánh ngắn — dùng ở mép section, cạnh ảnh. */
  sprig: {
    stem: [
      [98, 202],
      [58, 156],
      [82, 78],
      [30, 10],
    ],
    span: [0.08, 0.94],
    count: 8,
    leaf: [28, 11],
    spread: 52,
  },
  /** Dấu nhỏ nằm ngang — dùng cho divider giữa hai đoạn / nét kết. */
  mark: {
    stem: [
      [4, 22],
      [26, 27],
      [56, 6],
      [84, 12],
    ],
    span: [0.16, 0.88],
    count: 6,
    leaf: [14, 5],
    spread: 46,
  },
} as const satisfies Record<string, Preset>;

export type BotanicalVariant = keyof typeof PRESETS;

type Leaf = { x: number; y: number; angle: number; length: number; strong: boolean };

function buildLeaves(
  curve: Curve,
  span: readonly [number, number],
  count: number,
  [leafMax, leafMin]: readonly [number, number],
  spread: number,
): Leaf[] {
  const [tStart, tEnd] = span;

  return Array.from({ length: count }, (_, i) => {
    const t = tStart + ((tEnd - tStart) * i) / (count - 1);
    const [x, y] = pointAt(curve, t);
    const side = i % 2 === 0 ? 1 : -1;

    return {
      x,
      y,
      angle: r(angleAt(curve, t) + side * spread),
      // Nhỏ dần về ngọn; cứ 3 lá lại có một lá ngắn hơn cho đỡ đều tăm tắp.
      length: r((leafMax + (leafMin - leafMax) * t) * (i % 3 === 1 ? 0.86 : 1)),
      strong: i % 3 !== 1,
    };
  });
}

/** Bao lồi thô của hình (thân + lá + nụ) để viewBox vừa khít, có đệm. */
function viewBoxFor(preset: Preset, leaves: Leaf[]): string {
  const xs: number[] = [];
  const ys: number[] = [];
  const push = (x: number, y: number) => {
    xs.push(x);
    ys.push(y);
  };

  const curves = preset.offshoot ? [preset.stem, preset.offshoot] : [preset.stem];
  for (const curve of curves) {
    for (let i = 0; i <= 24; i++) {
      const [x, y] = pointAt(curve, i / 24);
      push(x, y);
    }
  }

  for (const leaf of leaves) {
    const rad = (leaf.angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const halfWidth = leaf.length * LEAF_RATIO;

    push(leaf.x, leaf.y);
    push(leaf.x + leaf.length * cos, leaf.y + leaf.length * sin);
    // Hai mép phình rộng nhất của lá, quanh khoảng giữa gân
    for (const side of [1, -1]) {
      push(
        leaf.x + leaf.length * 0.45 * cos - side * halfWidth * sin,
        leaf.y + leaf.length * 0.45 * sin + side * halfWidth * cos,
      );
    }
  }

  if (preset.bloom) {
    const [bx, by] = preset.stem[3];
    push(bx - 9, by - 9);
    push(bx + 9, by + 9);
  }

  const pad = 3;
  const minX = r(Math.min(...xs) - pad);
  const minY = r(Math.min(...ys) - pad);

  return `${minX} ${minY} ${r(Math.max(...xs) + pad - minX)} ${r(Math.max(...ys) + pad - minY)}`;
}

type BotanicalProps = {
  variant?: BotanicalVariant;
  className?: string;
  /** Lật ngang để nhánh hướng ngược lại — không cần vẽ artwork mới. */
  flip?: boolean;
};

/**
 * SVG thuần, không state — an toàn trong server component.
 * Màu ăn theo `currentColor` (nơi gọi đặt `text-sage`), độ mờ do wrapper
 * quyết định để cùng một hình dùng lại được ở nhiều ngữ cảnh.
 */
export function Botanical({ variant = "sprig", className, flip }: BotanicalProps) {
  const preset: Preset = PRESETS[variant];
  const leaves = buildLeaves(
    preset.stem,
    preset.span,
    preset.count,
    preset.leaf,
    preset.spread,
  );
  // Cành phụ cố tình chỉ mang 2 lá để vẫn thưa.
  const offshootLeaves = preset.offshoot
    ? buildLeaves(preset.offshoot, [0.42, 0.88], 2, [19, 16], 46)
    : [];

  const renderLeaf = (leaf: Leaf, key: string, faint = false) => (
    <g key={key} transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.angle})`}>
      <path
        d={leafPath(leaf.length, leaf.length * LEAF_RATIO)}
        strokeWidth="0.9"
        opacity={faint ? 0.66 : leaf.strong ? 0.82 : 0.7}
        fill="currentColor"
        fillOpacity="0.07"
      />
      {/* Gân lá — nét mảnh nhất, chỉ để hình có cảm giác vẽ tay */}
      <path
        d={`M0 0 Q${r(leaf.length * 0.55)} ${r(leaf.length * 0.04)}, ${r(leaf.length * 0.9)} 0`}
        strokeWidth="0.5"
        opacity="0.38"
      />
    </g>
  );

  return (
    <svg
      aria-hidden="true"
      viewBox={viewBoxFor(preset, [...leaves, ...offshootLeaves])}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("select-none", flip && "-scale-x-100", className)}
    >
      <path d={curveToPath(preset.stem)} strokeWidth="1.1" opacity="0.85" />
      {preset.offshoot ? (
        <path d={curveToPath(preset.offshoot)} strokeWidth="0.85" opacity="0.55" />
      ) : null}

      {leaves.map((leaf, i) => renderLeaf(leaf, `l${i}`))}
      {offshootLeaves.map((leaf, i) => renderLeaf(leaf, `o${i}`, true))}

      {/* Nụ hoa rất nhỏ ở ngọn: 5 cánh mảnh + nhuỵ */}
      {preset.bloom ? (
        <g
          transform={`translate(${preset.stem[3][0]} ${preset.stem[3][1]})`}
          opacity="0.72"
        >
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse
              key={deg}
              cx="4.2"
              cy="0"
              rx="4.2"
              ry="2.1"
              strokeWidth="0.7"
              transform={`rotate(${deg})`}
            />
          ))}
          <circle r="1.1" fill="currentColor" stroke="none" opacity="0.5" />
        </g>
      ) : null}
    </svg>
  );
}

type BotanicalRuleProps = {
  className?: string;
  /** Ghi đè độ dài hai nét gạch hai bên. */
  lineClassName?: string;
};

/**
 * Nhịp ngăn giữa hai đoạn: nét mảnh — một dấu botanical nhỏ — nét mảnh.
 * Đây là "section transition" duy nhất của site, thay cho decoration lớn.
 */
export function BotanicalRule({ className, lineClassName }: BotanicalRuleProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("flex items-center justify-center gap-4", className)}
    >
      <span className={cn("h-px w-12 bg-champagne/50 sm:w-20", lineClassName)} />
      <Botanical variant="mark" className="h-5 w-14 text-sage/75 sm:h-6 sm:w-16" />
      <span className={cn("h-px w-12 bg-champagne/50 sm:w-20", lineClassName)} />
    </div>
  );
}
