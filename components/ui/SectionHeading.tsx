import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";
import { TypewriterTitle } from "@/components/ui/TypewriterTitle";
import { BotanicalRule } from "@/components/ui/Botanical";
import { RevealGate } from "@/components/ui/RevealGate";

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
   * Đặt false khi tiêu đề đã nằm sẵn trong một <Reveal> khác: khi đó tiêu đề
   * đứng yên, không fade, không viết chữ. Lồng hai lớp Reveal là nhân hai lần
   * fade vào nhau — chữ bắt đầu hiện lúc lớp ngoài còn chưa rõ hẳn.
   */
  reveal?: boolean;
};

/**
 * Khi reveal (mặc định): nhãn nhỏ fade lên như mọi khối khác, tiêu đề tự viết
 * từng ký tự theo vị trí cuộn (TypewriterTitle), nét lá bên dưới chờ tiêu đề
 * viết xong mới hiện. Đặt trong một <RevealGate> thì cả nội dung phía sau của
 * section cũng chờ như nét lá.
 */
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
  const titleClasses = cn("wd-h1 tracking-[0.16em] uppercase", titleClassName);
  const classes = cn(
    "flex flex-col gap-5",
    align === "center" ? "items-center text-center" : "items-start text-left",
    className,
  );

  if (!reveal) {
    return (
      <div className={classes}>
        {label ? <span className="wd-eyebrow">{label}</span> : null}
        <Title className={titleClasses}>{title}</Title>
        {rule ? <BotanicalRule lineClassName="w-10 sm:w-14" /> : null}
      </div>
    );
  }

  // Từng phần tự lo hiệu ứng của mình, nên khung ngoài là div thường — cùng
  // class, cùng flex/gap như trước, bố cục không đổi.
  return (
    <RevealGate fallback>
      <div className={classes}>
        {label ? (
          <Reveal as="span" ignoreGate className="wd-eyebrow">
            {label}
          </Reveal>
        ) : null}
        <TypewriterTitle as={Title} className={titleClasses}>
          {title}
        </TypewriterTitle>
        {rule ? (
          <Reveal>
            <BotanicalRule lineClassName="w-10 sm:w-14" />
          </Reveal>
        ) : null}
      </div>
    </RevealGate>
  );
}
