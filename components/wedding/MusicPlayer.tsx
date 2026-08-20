"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { wedding } from "@/lib/wedding";
import { OPEN_INVITATION_EVENT } from "@/lib/events";
import { cn } from "@/lib/utils";
import { useInvitation } from "@/lib/invitation";

/**
 * Nhạc nền dạng opt-in.
 * Không autoplay khi load (trình duyệt sẽ chặn) — chỉ phát sau một user gesture:
 * bấm nút này, hoặc bấm "MỞ THIỆP" ở hero.
 * Nếu chưa có file nhạc trong public/audio, nút sẽ tự ẩn.
 */
export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(true);
  const { opened } = useInvitation();

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      audio.volume = wedding.music.volume;
      await audio.play();
      setPlaying(true);
    } catch {
      // Trình duyệt chặn hoặc file lỗi — giữ trạng thái tắt, không báo lỗi ồn ào.
      setPlaying(false);
    }
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    void play();
  }, [play, playing]);

  // Bấm "MỞ THIỆP" ở hero cũng bật nhạc (đó là một user gesture hợp lệ)
  useEffect(() => {
    if (!wedding.music.startOnOpen) return;

    const onOpen = () => {
      if (!audioRef.current) return;
      void play();
    };

    window.addEventListener(OPEN_INVITATION_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_INVITATION_EVENT, onOpen);
  }, [play]);

  if (!available) return null;

  return (
    <>
      <audio
        ref={audioRef}
        src={wedding.music.src}
        loop
        preload="none"
        onError={() => {
          setAvailable(false);
          setPlaying(false);
        }}
      />

      {/* Nút chỉ hiện sau khi khách bấm "Mở thiệp" — trước đó layout chỉ có Hero. */}
      {opened ? (
        <motion.button
          type="button"
          onClick={toggle}
          aria-pressed={playing}
          aria-label={
            playing
              ? `Tắt nhạc nền: ${wedding.music.title}`
              : `Bật nhạc nền: ${wedding.music.title}`
          }
          title={wedding.music.title}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          /* Pill chữ ở góc trái dưới, đúng như bản design */
          className={cn(
            "wd-btn-ghost fixed bottom-5 left-5 z-50 min-h-11 gap-2 px-5 backdrop-blur-md md:bottom-8 md:left-8",
            playing
              ? "border-ink/40 bg-ivory/90"
              : "border-taupe/50 bg-ivory/75",
          )}
        >
          Nhạc: {playing ? "Bật" : "Tắt"}
        </motion.button>
      ) : null}
    </>
  );
}
