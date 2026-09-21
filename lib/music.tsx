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
  toggle: () => void;
};

const MusicContext = createContext<MusicState | null>(null);

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
    () => ({ available, playing, toggle }),
    [available, playing, toggle],
  );

  return (
    <MusicContext.Provider value={value}>
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
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic(): MusicState {
  const context = useContext(MusicContext);
  if (!context) throw new Error("useMusic phải nằm trong <MusicProvider>");
  return context;
}
