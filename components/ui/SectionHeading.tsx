import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";
import { BotanicalRule } from "@/components/ui/Botanical";

type SectionHeadingProps = {
  /** Nhãn nhỏ phía trên (.wd-eyebrow). */
  label?: string;
  title: string;
  /** Nét — lá — nét dưới tiêu đề (đồng bộ với divider dùng trong Our Story). */
  rule?: boolean;
  align?: "left" | "center";
  className?: string;
  /** Ghi đè cỡ chữ tiêu đề cho riêng một section — không đổi font/weight/tracking. */
  titleClassName?: string;
  /**
   * Bậc heading. Mặc định h2 (tiêu đề của một section). Dùng h3 cho tiêu đề
   * của một khối NẰM TRONG section — ví dụ "Địa điểm / Tổ chức" nằm dưới
   * "Lời hẹn / Ngày cưới" — để cây heading của trang không bị nhảy bậc.
   */
  as?: "h2" | "h3";
  /**
   * Đặt false khi tiêu đề đã nằm sẵn trong một <Reveal> khác. Lồng hai lớp
   * Reveal là nhân hai lần fade vào nhau: chữ bắt đầu hiện lúc lớp ngoài còn
   * chưa rõ hẳn, thành ra nhấp nháy đúng kiểu mà Reveal vốn sinh ra để tránh.
   */
  reveal?: boolean;
};

export function SectionHeading({
  label,
  title,
  rule = true,
  align = "center",
  className,
  titleClassName,
  as: Title = "h2",
  reveal = true,
}: SectionHeadingProps) {
  const content = (
    <>
      {label ? <span className="wd-eyebrow">{label}</span> : null}
      <Title className={cn("wd-h1 tracking-[0.16em] uppercase", titleClassName)}>
        {title}
      </Title>
      {rule ? <BotanicalRule lineClassName="w-10 sm:w-14" /> : null}
    </>
  );

  const classes = cn(
    "flex flex-col gap-5",
    align === "center" ? "items-center text-center" : "items-start text-left",
    className,
  );

  if (!reveal) return <div className={classes}>{content}</div>;

  return <Reveal className={classes}>{content}</Reveal>;
}
