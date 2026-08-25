import { cn } from "@/lib/utils";

type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right";
type Size = "sm" | "md" | "lg";

type BotanicalDecorationProps = {
  /** Góc gắn vào — nhánh luôn hướng nhẹ vào phía content. */
  position: Position;
  size?: Size;
  className?: string;
};

/**
 * Một nhánh lá (kiểu eucalyptus/olive, watercolor botanical) dùng làm
 * decoration góc/viền cho các section — hoàn toàn trang trí, không ảnh
 * hưởng layout: `absolute` + `pointer-events-none` + `-z-10` (vẽ sau nền
 * section, trước content, giống cách Hero/Closing đặt ảnh nền của họ).
 *
 * Artwork chỉ vẽ một hướng (gốc ở dưới-trái, hướng lên trên-phải); 3 góc
 * còn lại chỉ là lật/xoay CSS của chính hướng đó — không lặp lại markup.
 */
const POSITION_CLASS: Record<Position, string> = {
  "bottom-left": "bottom-0 left-0",
  "top-left": "top-0 left-0 -scale-y-100",
  "top-right": "top-0 right-0 rotate-180",
  "bottom-right": "bottom-0 right-0 -scale-x-100",
};

const SIZE_CLASS: Record<Size, string> = {
  sm: "h-16 w-16 md:h-28 md:w-28",
  md: "h-20 w-20 md:h-36 md:w-36",
  lg: "h-24 w-24 md:h-44 md:w-44",
};

/**
 * Lá dọc theo thân cành — to và dày dần về phía gốc, thưa và nhỏ dần về
 * ngọn, xoay so le hai bên cho tự nhiên. 2 lá "gold" (màu champagne) tạo
 * điểm nhấn ánh kim nhẹ giống phong cách botanical watercolor tham khảo.
 */
const LEAVES = [
  { x: 13, y: 87, rotate: 150, scale: 1.5, gold: false },
  { x: 18, y: 75, rotate: 54, scale: 1.3, gold: false },
  { x: 24, y: 64, rotate: 160, scale: 1.4, gold: true },
  { x: 32, y: 54, rotate: 50, scale: 1.1, gold: false },
  { x: 41, y: 45, rotate: 165, scale: 1.15, gold: false },
  { x: 50, y: 36, rotate: 48, scale: 0.95, gold: true },
  { x: 60, y: 27, rotate: 158, scale: 0.88, gold: false },
  { x: 70, y: 19, rotate: 45, scale: 0.72, gold: false },
  { x: 79, y: 12, rotate: 152, scale: 0.55, gold: false },
] as const;

export function BotanicalDecoration({
  position,
  size = "md",
  className,
}: BotanicalDecorationProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      className={cn(
        "pointer-events-none absolute -z-10 select-none text-sage",
        SIZE_CLASS[size],
        POSITION_CLASS[position],
        className,
      )}
    >
      {/* Thân cành: một đường cong mảnh, hơi lệch để trông tự nhiên */}
      <path
        d="M10,92 C26,78 14,52 36,40 C54,30 58,26 90,8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Lá đầy, xoè hai bên thân, có gân lá mảnh cho cảm giác vẽ tay */}
      {LEAVES.map((leaf, i) => (
        <g
          key={i}
          opacity={leaf.gold ? 0.8 : 0.62 + (i % 2) * 0.08}
          transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.rotate}) scale(${leaf.scale})`}
        >
          <path
            d="M0,0 Q9,-10.5 19,0 Q9,10.5 0,0 Z"
            className={leaf.gold ? "fill-champagne" : "fill-current"}
          />
          <path
            d="M2,0 Q9,-1.1 16,0"
            fill="none"
            className="stroke-ink/20"
            strokeWidth="0.5"
          />
        </g>
      ))}

      {/* Hai hạt nhỏ ven thân, kiểu seed pod của eucalyptus */}
      <circle cx="34" cy="49" r="1.6" fill="currentColor" opacity="0.4" />
      <circle cx="56" cy="27" r="1.4" fill="currentColor" opacity="0.4" />

      {/* Nụ hoa nhỏ ở đầu cành — điểm nhấn duy nhất, không phải trọng tâm */}
      <g opacity="0.85">
        <circle cx="83" cy="12" r="2.4" fill="currentColor" opacity="0.5" />
        <circle cx="90" cy="7" r="2" className="fill-champagne" />
        <circle cx="93.8" cy="11.8" r="1.5" className="fill-champagne" opacity="0.75" />
      </g>
    </svg>
  );
}
