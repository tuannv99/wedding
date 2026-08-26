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
};

export function SectionHeading({
  label,
  title,
  rule = true,
  align = "center",
  className,
  titleClassName,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-5",
        align === "center"
          ? "items-center text-center"
          : "items-start text-left",
        className,
      )}
    >
      {label ? <span className="wd-eyebrow">{label}</span> : null}
      <h2 className={cn("wd-h1 tracking-[0.16em] uppercase", titleClassName)}>
        {title}
      </h2>
      {rule ? <BotanicalRule lineClassName="w-10 sm:w-14" /> : null}
    </Reveal>
  );
}
