"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { wedding } from "@/lib/wedding";
import { OPEN_INVITATION_EVENT } from "@/lib/events";

type MusicState = {
  /** Có file nhạc dùng được không — false thì mọi control tự ẩn. */
  available: boolean;
  playing: boolean;
  /** Thời lượng đã phát, dạng "mm:ss" (khớp chỉ báo 00:00 trên thanh nav). */
  elapsed: string;
  toggle: () => void;
};

const MusicContext = createContext<MusicState | null>(null);

const formatTime = (seconds: number) => {
  const total = Math.max(0, Math.floor(seconds));
  const mm = String(Math.floor(total / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return `${mm}:${ss}`;
};

/**
 * Nhạc nền dạng opt-in, tách khỏi giao diện.
 *
 * Trước đây phần audio + nút bấm nằm chung trong MusicPlayer nên nút buộc phải
 * ở một chỗ cố định. Bản design mới đặt điều khiển nhạc ngay trên thanh nav,
 * nên state được nâng lên context: `<audio>` do provider giữ, còn nút chỉ là
 * một consumer — không nhân đôi logic phát/dừng ở hai nơi.
 *
 * Không autoplay lúc load (trình duyệt chặn); chỉ phát sau user gesture: bấm
 * nút nhạc, hoặc bấm "Mở thiệp" ở hero.
 */
export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(true);
  const [elapsed, setElapsed] = useState("00:00");

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

  // Bấm "Mở thiệp" ở hero cũng bật nhạc (đó là một user gesture hợp lệ)
  useEffect(() => {
    if (!wedding.music.startOnOpen) return;

    const onOpen = () => {
      if (audioRef.current) void play();
    };

    window.addEventListener(OPEN_INVITATION_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_INVITATION_EVENT, onOpen);
  }, [play]);

  const value = useMemo(
    () => ({ available, playing, elapsed, toggle }),
    [available, playing, elapsed, toggle],
  );

  return (
    <MusicContext.Provider value={value}>
      <audio
        ref={audioRef}
        src={wedding.music.src}
        loop
        preload="none"
        onTimeUpdate={(event) =>
          setElapsed(formatTime(event.currentTarget.currentTime))
        }
        onError={() => {
          setAvailable(false);
          setPlaying(false);
        }}
      />
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic(): MusicState {
  const context = useContext(MusicContext);
  if (!context) throw new Error("useMusic phải nằm trong <MusicProvider>");
  return context;
}
