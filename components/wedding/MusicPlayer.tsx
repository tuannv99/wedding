"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Music2, Pause } from "lucide-react";
import { wedding } from "@/lib/wedding";
import { OPEN_INVITATION_EVENT } from "@/lib/events";
import { cn } from "@/lib/utils";

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
        transition={{ duration: 1, delay: 3, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed right-5 bottom-5 z-50 flex h-12 w-12 items-center justify-center rounded-full border backdrop-blur-md transition-colors duration-700 md:right-8 md:bottom-8",
          playing
            ? "border-ink/30 bg-ivory/90 text-ink"
            : "border-taupe/30 bg-ivory/70 text-taupe hover:text-ink",
        )}
      >
        {playing ? (
          <Pause className="h-4 w-4" strokeWidth={1.25} aria-hidden="true" />
        ) : (
          <Music2 className="h-4 w-4" strokeWidth={1.25} aria-hidden="true" />
        )}
        <span className="sr-only">
          {playing ? "Đang phát nhạc nền" : "Nhạc nền đang tắt"}
        </span>
      </motion.button>
    </>
  );
}
