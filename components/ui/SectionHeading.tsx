import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";

type SectionHeadingProps = {
  /** Nhãn nhỏ phía trên (uppercase, letter-spacing rộng). */
  label?: string;
  title: string;
  /** Gạch ngang champagne dưới tiêu đề. */
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
      {label ? <span className="label">{label}</span> : null}
      <h2 className="text-[clamp(2rem,6.5vw,3.5rem)] tracking-[0.16em] uppercase">
        {title}
      </h2>
      {rule ? (
        <span aria-hidden="true" className="block h-px w-14 bg-champagne" />
      ) : null}
    </Reveal>
  );
}
