import Image from "next/image";
import { wedding } from "@/lib/wedding";
import { Reveal } from "@/components/ui/Reveal";
import { Botanical, BotanicalRule } from "@/components/ui/Botanical";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BotanicalAccent } from "@/components/ui/BotanicalAccent";
import { cn } from "@/lib/utils";

export function OurStory() {
  return (
    <section
      id="our-story"
      className="relative isolate w-full overflow-hidden bg-ivory px-6 py-16 md:px-5 md:py-40"
    >
      {/*
        Section được ưu tiên botanical: một nhánh dài chạy dọc mép phải, phần
        gốc tràn khỏi viewport, ngọn vươn vào chồng nhẹ lên rìa cột ảnh — cảm
        giác nhánh "đi xuyên" qua layout thay vì đóng khung nó.
        Chỉ desktop: ở mobile ảnh chiếm trọn bề ngang nên nhánh sẽ đè vào nội dung.
        Cỡ chuẩn hoá: branch 62vh/0.32.
        (Không đặt thêm sprig mép trái: mục 02 có ảnh nằm bên trái nên sprig
        từng đè trực tiếp lên ảnh.)
      */}
      <BotanicalAccent
        variant="branch"
        opacity={0.32}
        depth={7}
        flip
        className="top-[16%] -right-[3vw] hidden h-[62vh] w-[24vh] lg:block"
      />

      <div className="mx-auto w-full max-w-4xl">
        {/* Căn giữa ở mobile, dồn về trái từ md — nên không dùng align="left"
            mà ghi đè bằng biến thể md: trên chính wrapper của SectionHeading. */}
        <SectionHeading
          label={wedding.copy.story.eyebrow}
          title={wedding.copy.story.title}
          titleClassName="wd-h1-fit"
          className="md:items-start md:text-left"
        />

        <div className="mt-14 flex flex-col md:mt-16">
          {wedding.story.map((step, index) => {
            // Mốc chẵn (02) đảo ảnh sang trái để bố cục so le
            const photoFirst = index % 2 === 1;

            return (
              <div key={step.image.src}>
                {index > 0 ? <BotanicalRule className="my-12 md:my-16" /> : null}

                <Reveal delay={0.1} y={20}>
                  {/* Chữ và ảnh luôn nằm CÙNG MỘT HÀNG, kể cả mobile; thứ tự
                      trái/phải đảo so le theo mốc ở mọi bề rộng màn hình. */}
                  <div className="grid grid-cols-[1fr_1.15fr] items-center gap-5 sm:gap-8 md:gap-14">
                    {/* Số thứ tự + đường kẻ + chữ.
                        Ở desktop kéo khối chữ về sát ảnh cho cặp trái/phải cân nhau. */}
                    <div
                      className={cn(
                        "min-w-0 md:max-w-[380px]",
                        photoFirst
                          ? "order-2 md:justify-self-start"
                          : "order-1 md:justify-self-end",
                      )}
                    >
                      {/* Dùng đúng wd-body-serif (font-weight 300, không kéo
                          letter-spacing) như đoạn text bên cạnh — chỉ phóng
                          cỡ chữ lớn hơn để vẫn đọc ra là số thứ tự. */}
                      <span className="wd-body-serif wd-num block text-[clamp(1.5rem,6.5vw,2.25rem)] leading-none">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div className="mt-3 grid grid-cols-[1px_1fr] gap-x-3 sm:mt-4 sm:gap-x-5">
                        <span
                          aria-hidden="true"
                          className="relative w-px bg-champagne/45"
                        >
                          <span className="absolute top-2 -left-[2.5px] h-1.5 w-1.5 rounded-full bg-champagne" />
                        </span>

                        <p className="wd-body-serif text-[clamp(1.25rem,4.6vw,1.8rem)] leading-[1.5] whitespace-pre-line sm:leading-[1.6]">
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
                        khối ảnh sạch bo góc rất nhẹ. Desktop giới hạn bề rộng
                        để ảnh không lấn hết section. */}
                    <div
                      className={cn(
                        "min-w-0 md:w-full md:max-w-[400px]",
                        photoFirst ? "order-1 md:mr-auto" : "order-2 md:ml-auto",
                      )}
                    >
                      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[3px] bg-warm">
                        <Image
                          src={step.image.src}
                          alt={step.image.alt}
                          fill
                          loading="lazy"
                          sizes="(max-width: 768px) 50vw, 400px"
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
            <span aria-hidden="true" className="h-px w-10 bg-champagne/70 sm:w-16" />
                <Botanical variant="mark" className="h-4 w-11 text-sage/65" />
            <span aria-hidden="true" className="h-px w-10 bg-champagne/70 sm:w-16" />
          </div>

        </Reveal>
      </div>
    </section>
  );
}
