import { cn } from "@/lib/utils";

type BotanicalHeartProps = {
  className?: string;
};

/** Cùng hình lá với BotanicalDecoration, thu nhỏ cho vừa một icon trái tim. */
const LEAF = "M0,0 Q9,-10.5 19,0 Q9,10.5 0,0 Z";

/**
 * Các lá rải theo viền một hình trái tim (2 thùy trên + điểm hội tụ dưới),
 * xoay theo hướng tiếp tuyến của viền để toả ra tự nhiên như một vòng lá nhỏ.
 * 2 lá "gold" (champagne) điểm ánh kim nhẹ, giống các nhánh góc.
 */
const LEAVES = [
  // Thùy trái
  { x: 44, y: 23, rotate: -95, scale: 0.42, gold: false },
  { x: 30, y: 17, rotate: -135, scale: 0.46, gold: false },
  { x: 16, y: 24, rotate: -168, scale: 0.4, gold: true },
  { x: 9, y: 39, rotate: 165, scale: 0.44, gold: false },
  { x: 13, y: 55, rotate: 133, scale: 0.4, gold: false },
  { x: 25, y: 71, rotate: 103, scale: 0.34, gold: false },
  // Thùy phải (đối xứng)
  { x: 56, y: 23, rotate: -85, scale: 0.42, gold: false },
  { x: 70, y: 17, rotate: -45, scale: 0.46, gold: true },
  { x: 84, y: 24, rotate: -12, scale: 0.4, gold: false },
  { x: 91, y: 39, rotate: 15, scale: 0.44, gold: false },
  { x: 87, y: 55, rotate: 47, scale: 0.4, gold: false },
  { x: 75, y: 71, rotate: 77, scale: 0.34, gold: false },
] as const;

/**
 * Trái tim tạo bởi một vòng lá nhỏ — thay cho ký tự "♡" thuần chữ ở những
 * điểm nhấn thuần trang trí (không phải nội dung). Kích thước ăn theo
 * font-size nơi gọi (w/h = 1em) nên có thể thả thẳng vào chỗ cũ.
 */
export function BotanicalHeart({ className }: BotanicalHeartProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      className={cn("inline-block h-[1em] w-[1em] align-[-0.12em]", className)}
    >
      {LEAVES.map((leaf, i) => (
        <path
          key={i}
          d={LEAF}
          transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.rotate}) scale(${leaf.scale})`}
          className={leaf.gold ? "fill-champagne" : "fill-sage"}
          opacity={leaf.gold ? 0.9 : 0.85}
        />
      ))}
      {/* Lá khép ở điểm hội tụ đáy tim */}
      <path
        d={LEAF}
        transform="translate(50 81) rotate(90) scale(0.4)"
        className="fill-sage"
        opacity="0.85"
      />
    </svg>
  );
}
