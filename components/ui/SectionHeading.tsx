import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";

type SectionHeadingProps = {
  /** Nhãn nhỏ phía trên (.wd-eyebrow). */
  label?: string;
  title: string;
  /** Gạch ngang champagne (.wd-rule) dưới tiêu đề. */
  rule?: boolean;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  label,
  title,
  rule = true,
  align = "center",
  className,
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
      <h2 className="wd-h1 tracking-[0.16em] uppercase">{title}</h2>
      {rule ? <hr className="wd-rule" /> : null}
    </Reveal>
  );
}
