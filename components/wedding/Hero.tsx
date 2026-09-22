"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { wedding } from "@/lib/wedding";
import { emitOpenInvitation } from "@/lib/events";
import { useInvitation } from "@/lib/invitation";
import { Botanical } from "@/components/ui/Botanical";
import { BotanicalAccent } from "@/components/ui/BotanicalAccent";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const EASE_CLOSE = [0.32, 0.72, 0.3, 1] as const;
const EASE_OPEN = [0.45, 0.05, 0.2, 1] as const;

/** "TUẤN" (wedding.groom.short, luôn viết hoa) → "Tuấn" cho chữ ký trên con dấu. */
const toTitleCase = (value: string) => value.charAt(0) + value.slice(1).toLowerCase();

/**
 * Nhịp "mở thiệp", tổng ~2.17s tính tới lúc cánh mở hết (nội dung bên trong
 * còn tiếp tục nổi lên thêm một chút sau đó, xem .wd-rise trong wedding.css):
 *  0 – 0.72s     hai cánh trượt vào khép lại giữa màn hình (phase "closing")
 *  0.62 – 1.02s  con dấu hiện lên giữa mặt thiệp
 *  1.02 – 2.17s  hai cánh xoay mở ra hai bên, con dấu fade out (phase "unfolding")
 */
const CLOSE_MS = 720;
const SEAL_DELAY_MS = 620;
const UNFOLD_START_MS = 1020;
const UNFOLD_MS = 1150;

/** Khớp scroll-margin-top của section[id] trong globals.css (mốc md). */
const HEADER_H = 73;

type Phase = null | "closing" | "unfolding";

type HeroProps = {
  /** Tên khách mời từ URL /[guest] (xem app/[guest]/page.tsx) — bỏ trống ở URL mặc định. */
  guestName?: string;
  /** Lời chào trước tên, ví dụ "Gửi bạn yêu" — xem data/guests.ts. */
  guestGreeting?: string;
};

export function Hero({ guestName, guestGreeting }: HeroProps) {
  const reduceMotion = useReducedMotion();
  const { hero } = wedding.images;
  const { open } = useInvitation();
  const [phase, setPhase] = useState<Phase>(null);

  /** Mỗi phần tử xuất hiện lần lượt: ngày → tên → "&" → nút. */
  const rise = (delay: number, distance = 18) => ({
    initial: { opacity: 0, y: reduceMotion ? 0 : distance },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reduceMotion ? 0.4 : 1.1,
      delay: reduceMotion ? 0 : delay,
      ease: EASE_OUT,
    },
  });

  const scrollToStory = () => {
    // open() chỉ setState — DOM của Our Story chưa kịp mount ngay trong cùng
    // tick, nên đợi hai animation frame để React commit xong rồi mới đo & cuộn.
    // Đo bằng viewport (getBoundingClientRect), KHÔNG dùng offsetTop: wrapper
    // nội dung có transform (wd-rise) nên trở thành offsetParent, khiến
    // offsetTop luôn bằng 0.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const el = document.getElementById("our-story");
        if (!el) return;
        const y = el.getBoundingClientRect().top + window.scrollY - HEADER_H;
        window.scrollTo({ top: Math.max(0, y), behavior: "instant" });
      });
    });
  };

  const handleOpen = () => {
    if (phase) return;

    if (reduceMotion) {
      if (wedding.music.startOnOpen) emitOpenInvitation();
      open();
      scrollToStory();
      return;
    }

    setPhase("closing");

    window.setTimeout(() => {
      if (wedding.music.startOnOpen) emitOpenInvitation();
      open();
      setPhase("unfolding");
      scrollToStory();
    }, UNFOLD_START_MS);

    window.setTimeout(() => setPhase(null), UNFOLD_START_MS + UNFOLD_MS);
  };

  return (
    <section
      id="hero"
      aria-label="Thiệp cưới Tuấn và Hoa"
      /*
        Bố cục chia đôi theo bản design: nửa trái là nền ivory + chữ, nửa phải
        là ảnh cưới tràn viền. Dưới md không chia đôi (cột hẹp sẽ bóp cả chữ
        lẫn ảnh) mà để ảnh tràn cả màn hình, chữ đè lên ảnh — cảm giác một tấm
        thiệp liền mạch.

        Chìa khoá là KHÔNG phủ ivory đều lên cả ảnh (ảnh cưới này tông trắng
        rất sáng, phủ đều là xoá luôn ảnh): nửa trên để nguyên cho thấy cô dâu
        chú rể, chữ dồn xuống nửa dưới nơi chỉ còn tà váy trắng mờ, và lớp phủ
        ivory chỉ đậm dần đúng ở vùng có chữ.
      */
      className="relative isolate grid h-[100svh] w-full grid-cols-1 overflow-hidden md:grid-cols-[1fr_1.05fr]"
    >
      {/* Ảnh cưới: mobile = nền tràn viền phía sau chữ; từ md = ô bên phải */}
      <motion.div
        initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduceMotion ? 0.5 : 2.2, ease: EASE_OUT }}
        /*
          Mobile: khung ảnh cao hơn màn và ghim vào ĐÁY, tức là cắt bớt phần
          trời trống phía trên. Cặp đôi nhờ vậy được đẩy cao lên, và vùng sáng
          chỉ-còn-tà-váy — nơi đặt chữ — luôn bắt đầu quanh 45–48% chiều cao
          màn ở MỌI chiều cao máy, vì khung ảnh giãn theo màn.

          Máy thấp (≤700px) cắt sâu hơn (132%): màn càng thấp thì khối chữ
          càng bắt đầu cao, nên phải kéo vùng sáng lên theo. Điều kiện bọc
          thêm max-md để một cửa sổ desktop thấp không rơi vào nhánh mobile.
        */
        className="absolute inset-x-0 bottom-0 -z-10 h-[118%] max-md:[@media(max-height:700px)]:h-[132%] md:relative md:z-0 md:col-start-2 md:row-start-1 md:h-full md:w-full"
      >
        <Image
          src={hero.src}
          alt={hero.alt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 55vw"
          className="object-cover object-center"
        />

        {/*
          Mobile: lớp phủ ivory KHÔNG đậm dần về đáy mà đậm nhất ở DẢI GIỮA
          rồi nhạt lại — nhờ vậy ảnh chạy thông tới cạnh dưới màn hình.

          Lý do: đo độ sáng của chính tấm ảnh trong dải chữ cho thấy vùng
          tay hai người + hàng cây (khoảng 48–56% chiều cao ảnh) có điểm rất
          tối (min ~10/255) nên chữ đặt lên đó phải có nền; còn từ 56% xuống
          đáy chỉ còn tà váy + voan sáng (min ~180) nên chữ ink đọc rõ mà chỉ
          cần lớp phủ rất mỏng (~30%), tức là vẫn thấy nếp váy tới cạnh dưới.
          Dải đậm ở giữa lại trùng đúng vệt tiền cảnh mờ có sẵn trong ảnh nên
          không lộ ra như một tấm nền dán thêm.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_34%,rgba(249,247,242,0.86)_52%,rgba(249,247,242,0.46)_68%,rgba(249,247,242,0.3)_100%)] md:hidden"
        />

        {/* Từ md: một dải chuyển ivory → ảnh cho mép nối giữa hai nửa mềm lại */}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 hidden w-[12%] bg-gradient-to-r from-ivory to-transparent md:block"
        />
      </motion.div>

      {/* Nhánh botanical mọc lên từ mép trái, đi sau chữ (-z-10).
          Cỡ chuẩn hoá dùng chung toàn site: branch 62vh/opacity 0.32. */}
      <BotanicalAccent
        variant="branch"
        opacity={0.32}
        depth={6}
        flip
        className="-bottom-[6svh] -left-[8svh] h-[62vh] w-[24vh]"
      />

      {/*
        Mobile: khối chữ dồn xuống đáy (justify-end) và nhịp giữa các dòng hẹp
        hơn desktop, để cả khối nằm gọn dưới mốc 56% nói trên. Từ md quay lại
        đúng nhịp của bản design: căn giữa theo trục dọc, canh trái.
      */}
      <div className="flex flex-col items-center justify-end gap-[clamp(7px,1.6svh,26px)] px-6 pb-[clamp(22px,5svh,64px)] text-center md:col-start-1 md:row-start-1 md:items-start md:justify-center md:gap-[clamp(10px,2.4svh,30px)] md:px-[clamp(32px,6vw,104px)] md:pb-0 md:text-left">
        <motion.p
          {...rise(0.4)}
          /* Mobile chữ đậm hơn desktop: dòng này nằm trực tiếp trên ảnh. */
          className="wd-eyebrow wd-num text-ink md:text-ink/70 md:tracking-[0.5em]"
        >
          {wedding.date.display}
        </motion.p>

        {/* Gửi khách mời cá nhân hoá (URL /[guest]) — chỉ hiện khi có guestName,
            không đổi gì ở URL mặc định "/". Dùng lại đúng style wd-quote của
            câu tagline bên dưới, không tạo badge/card mới. */}
        {guestName ? (
          <motion.p
            {...rise(0.62)}
            className="wd-quote max-w-[22ch] text-[clamp(1rem,2.2vw,1.35rem)] text-ink/85 text-balance md:text-ink/60"
          >
            {guestGreeting} <span className="text-ink">{guestName}</span>
          </motion.p>
        ) : null}

        <h1 className="flex flex-col items-center gap-1 md:items-start md:gap-2">
          <span className="sr-only">
            {wedding.groom.name} và {wedding.bride.name} — chúng mình sẽ kết hôn
          </span>

          <motion.span
            {...rise(0.85, 24)}
            className="wd-display block uppercase md:text-[clamp(3.5rem,9.4vw,10rem)]"
          >
            {wedding.groom.short}
          </motion.span>

          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: reduceMotion ? 0.4 : 1.4,
              delay: reduceMotion ? 0 : 1.35,
              ease: "easeOut",
            }}
            className="font-display block text-[clamp(1.75rem,min(7vw,6svh),3.25rem)] leading-none text-champagne italic md:self-center md:pr-[0.3em] md:text-[clamp(2rem,3.2vw,3.75rem)]"
          >
            &amp;
          </motion.span>

          <motion.span
            {...rise(1.6, 24)}
            className="wd-display block uppercase md:text-[clamp(3.5rem,9.4vw,10rem)]"
          >
            {wedding.bride.short}
          </motion.span>
        </h1>

        {/* Bản design để câu này ở dạng serif nghiêng, không phải nhãn hoa */}
        <motion.p
          {...rise(2.1)}
          className="wd-quote text-[clamp(1rem,2.2vw,1.35rem)] text-ink/85 md:text-ink/60"
        >
          {wedding.copy.hero.tagline}!
        </motion.p>

        {/*
          Nút "Mở thiệp" dạng pill (đúng kiểu wd-btn-ghost dùng xuyên suốt
          site) — chữ + trái tim nhỏ nằm cùng hàng, một nét kẻ mảnh phía trên
          tách nó khỏi câu tagline. Đây là user gesture duy nhất hợp lệ để bật
          nhạc và mở phần nội dung phía dưới.
        */}
        <motion.div
          {...rise(2.45)}
          className="mt-[clamp(8px,2svh,28px)] flex flex-col items-center gap-5 md:items-start"
        >
          <span aria-hidden="true" className="h-px w-10 bg-ink/25" />

          <motion.button
            type="button"
            onClick={handleOpen}
            disabled={phase !== null}
            whileTap={reduceMotion ? undefined : { scale: 0.96 }}
            className="wd-btn-ghost gap-3 disabled:opacity-60"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={phase ? "opening" : "idle"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {phase ? "Đang mở…" : wedding.copy.hero.openButton}
              </motion.span>
            </AnimatePresence>
            <Heart
              className="h-2.5 w-2.5 text-champagne"
              fill="currentColor"
              strokeWidth={0}
              aria-hidden="true"
            />
          </motion.button>
        </motion.div>
      </div>

      {/*
        Overlay "mở thiệp": hai cánh ivory trượt vào khép lại giữa màn hình
        (phase "closing"), một con dấu hiện lên giữa mặt thiệp, rồi hai cánh
        xoay mở ra hai bên bằng rotateY quanh mép ngoài (phase "unfolding") —
        mô phỏng mở một tấm thiệp thật thay vì một veil phẳng chớp qua.
        overflow-hidden bắt buộc: rotateY nếu không sẽ sinh thanh cuộn ngang.
      */}
      <AnimatePresence>
        {phase ? (
          <div
            key="opening-overlay"
            aria-hidden="true"
            className="fixed inset-0 z-100 overflow-hidden pointer-events-none"
            style={{ perspective: 1900 }}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={phase === "closing" ? { x: 0 } : { rotateY: -108 }}
              transition={
                phase === "closing"
                  ? { duration: CLOSE_MS / 1000, ease: EASE_CLOSE }
                  : { duration: UNFOLD_MS / 1000, ease: EASE_OPEN }
              }
              style={{
                transformOrigin: "left center",
                backfaceVisibility: "hidden",
                background: "linear-gradient(to right, #F9F7F2, #F5F2EB)",
                borderRight: "1px solid rgba(216,197,165,0.55)",
              }}
              className="absolute inset-y-0 left-0 w-1/2"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={phase === "closing" ? { x: 0 } : { rotateY: 108 }}
              transition={
                phase === "closing"
                  ? { duration: CLOSE_MS / 1000, ease: EASE_CLOSE }
                  : { duration: UNFOLD_MS / 1000, ease: EASE_OPEN }
              }
              style={{
                transformOrigin: "right center",
                backfaceVisibility: "hidden",
                background: "linear-gradient(to left, #F9F7F2, #F5F2EB)",
              }}
              className="absolute inset-y-0 right-0 w-1/2"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={phase === "closing" ? { opacity: 1, scale: 1 } : { opacity: 0 }}
              transition={
                phase === "closing"
                  ? { duration: 0.4, delay: SEAL_DELAY_MS / 1000, ease: EASE_OUT }
                  : { duration: 0.34, ease: "easeOut" }
              }
              className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            >
              <Botanical variant="mark" className="h-6 w-[66px] text-sage/85" />
              <span className="text-[13px] font-light tracking-[0.5em] text-taupe">
                {toTitleCase(wedding.groom.short)} &amp; {toTitleCase(wedding.bride.short)}
              </span>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
