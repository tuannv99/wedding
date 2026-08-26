import Image from "next/image";
import { wedding } from "@/lib/wedding";
import { Reveal } from "@/components/ui/Reveal";
import { Botanical, BotanicalRule } from "@/components/ui/Botanical";
import { BotanicalAccent } from "@/components/ui/BotanicalAccent";
import { cn } from "@/lib/utils";

export function OurStory() {
  return (
    <section
      id="our-story"
      className="relative isolate w-full overflow-hidden bg-ivory px-5 py-24 sm:px-6 md:py-32"
    >
      {/*
        Section được ưu tiên botanical: một nhánh dài chạy dọc mép phải, phần
        gốc tràn khỏi viewport, ngọn vươn vào chồng nhẹ lên rìa cột ảnh — cảm
        giác nhánh "đi xuyên" qua layout thay vì đóng khung nó.
        Chỉ desktop: ở mobile ảnh chiếm trọn bề ngang nên nhánh sẽ đè vào nội dung.
      */}
      <BotanicalAccent
        variant="branch"
        opacity={0.34}
        depth={7}
        flip
        className="top-[16%] -right-[3vw] hidden h-[62vh] w-[24vh] lg:block"
      />

      <div className="mx-auto w-full max-w-4xl">
        {/* Tiêu đề kiểu bản design: chữ viết tay "Our" chờm lên góc trái tiêu đề,
            căn trái từ md (mobile vẫn căn giữa cho cân với ảnh full-width). */}
        <Reveal className="flex flex-col items-center md:items-start">
          <p
            aria-hidden="true"
            className="wd-script relative z-10 -mb-[0.35em] translate-x-0 md:-translate-x-1"
          >
            {wedding.copy.script.story}
          </p>
          <h2 className="wd-h1 text-center tracking-[0.16em] uppercase md:text-left">
            {wedding.copy.story.title}
          </h2>
          <span aria-hidden="true" className="mt-6 h-px w-14 bg-champagne/70" />
        </Reveal>

        <div className="mt-14 flex flex-col md:mt-16">
          {wedding.story.map((step, index) => {
            // Mốc chẵn (02) đảo ảnh sang trái để bố cục so le
            const photoFirst = index % 2 === 1;

            return (
              <div key={step.image.src}>
                {index > 0 ? <BotanicalRule className="my-12 md:my-16" /> : null}

                <Reveal delay={0.1} y={20}>
                  {/* Mobile xếp dọc — ẢNH trước, CHỮ sau — thay vì ép hai cột
                      hẹp cạnh nhau; từ md mới thành hai cột so le trái/phải. */}
                  <div className="flex flex-col gap-8 md:grid md:grid-cols-[1fr_1.15fr] md:items-center md:gap-14">
                    {/* Số thứ tự + đường kẻ + chữ.
                        Ở desktop kéo khối chữ về sát ảnh cho cặp trái/phải cân nhau. */}
                    <div
                      className={cn(
                        "order-2 min-w-0 md:max-w-[380px]",
                        photoFirst
                          ? "md:order-2 md:justify-self-start"
                          : "md:order-1 md:justify-self-end",
                      )}
                    >
                      <span className="font-display block text-[clamp(1.5rem,6.5vw,2.25rem)] leading-none tracking-[0.14em] text-champagne">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div className="mt-4 grid grid-cols-[1px_1fr] gap-x-4 sm:gap-x-5">
                        <span
                          aria-hidden="true"
                          className="relative w-px bg-champagne/45"
                        >
                          <span className="absolute top-2 -left-[2.5px] h-1.5 w-1.5 rounded-full bg-champagne" />
                        </span>

                        <p className="wd-body-serif text-[clamp(1.35rem,4.6vw,1.8rem)] leading-[1.6] whitespace-pre-line">
                          {step.text}
                          {step.emphasis ? (
                            <>
                              {"\n"}
                              <span className="wd-quote text-[0.92em]">
                                {step.emphasis}
                              </span>
                            </>
                          ) : null}
                        </p>
                      </div>
                    </div>

                    {/* Ảnh editorial: bỏ khung viền/nền kiểu card, chỉ còn
                        khối ảnh sạch bo góc rất nhẹ. Mobile ảnh chiếm trọn bề
                        ngang; desktop giới hạn bề rộng để không lấn section. */}
                    <div
                      className={cn(
                        "order-1 min-w-0 md:w-full md:max-w-[400px]",
                        photoFirst ? "md:order-1 md:mr-auto" : "md:order-2 md:ml-auto",
                      )}
                    >
                      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[3px] bg-warm">
                        <Image
                          src={step.image.src}
                          alt={step.image.alt}
                          fill
                          loading="lazy"
                          sizes="(max-width: 768px) 92vw, 400px"
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>
            );
          })}
        </div>

        {/* Chữ ký: — VĂN TUẤN · MAI HOA — + một nét lá nhỏ khép lại câu chuyện */}
        <Reveal delay={0.15} className="mt-16 flex flex-col items-center md:mt-20">
          <div className="flex items-center gap-5">
            <span aria-hidden="true" className="h-px w-10 bg-champagne/60 sm:w-16" />
            <p className="wd-eyebrow text-champagne">
              {wedding.groom.name} · {wedding.bride.name}
            </p>
            <span aria-hidden="true" className="h-px w-10 bg-champagne/60 sm:w-16" />
          </div>
          <Botanical variant="mark" className="mt-8 h-5 w-14 text-sage/65" />
        </Reveal>
      </div>
    </section>
  );
}
