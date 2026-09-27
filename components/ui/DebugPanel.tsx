"use client";

import { useEffect, useState } from "react";
import { OPEN_INVITATION_EVENT } from "@/lib/events";

/**
 * Bảng chẩn đoán hiệu ứng "Mở thiệp" — CHỈ hiện khi URL có ?debug=1, khách
 * bình thường không thấy gì. Dùng để đo trên máy thật (iPhone) những thứ
 * không giả lập được trên máy tính: prefers-reduced-motion, tần số khung hình
 * (Low Power Mode khoá 30fps), và hai cánh thiệp có thật sự chạy hay không.
 */
export function DebugPanel() {
  const [enabled, setEnabled] = useState(false);
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("debug") !== "1") return;
    setEnabled(true);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const base = [
      `reduced-motion: ${reduce ? "BẬT" : "tắt"}`,
      `viewport: ${window.innerWidth}x${window.innerHeight} @${window.devicePixelRatio}x`,
      `UA: ${navigator.userAgent.replace(/^Mozilla\/5\.0 /, "").slice(0, 110)}`,
    ];
    setLines(base);

    // FPS lúc đứng yên: 2 giây đầu.
    let frames = 0;
    const start = performance.now();
    const count = (now: number) => {
      frames += 1;
      if (now - start < 2000) requestAnimationFrame(count);
      else setLines((prev) => [...prev, `fps lúc nghỉ: ${Math.round(frames / ((now - start) / 1000))}`]);
    };
    requestAnimationFrame(count);

    const onOpen = () => {
      const t0 = performance.now();
      let last = t0;
      let n = 0;
      let maxGap = 0;
      let longFrames = 0;
      let coupleAt = -1;
      const samples: string[] = [];
      const marks = [300, 800, 1200, 1700, 2200, 2700];

      const tick = (now: number) => {
        const t = now - t0;
        const gap = now - last;
        last = now;
        n += 1;
        maxGap = Math.max(maxGap, gap);
        if (gap > 50) longFrames += 1;
        if (coupleAt < 0 && document.getElementById("couple")) coupleAt = Math.round(t);

        if (marks.length && t >= marks[0]) {
          const mark = marks.shift();
          const leaf = document.querySelector<HTMLElement>(".wd-leaf-left");
          const tf = leaf ? getComputedStyle(leaf).transform : "không có cánh";
          const anim = leaf ? getComputedStyle(leaf).animationName : "";
          samples.push(`${mark}ms: ${shortTransform(tf)} ${anim}`);
        }

        if (t < 3200) {
          requestAnimationFrame(tick);
        } else {
          setLines((prev) => [
            ...prev,
            `--- sau khi bấm Mở thiệp ---`,
            `frames: ${n} (~${Math.round(n / (t / 1000))}fps), gap lớn nhất: ${Math.round(maxGap)}ms, số frame >50ms: ${longFrames}`,
            `#couple mount lúc: ${coupleAt}ms`,
            ...samples,
          ]);
        }
      };
      requestAnimationFrame(tick);
    };

    window.addEventListener(OPEN_INVITATION_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_INVITATION_EVENT, onOpen);
  }, []);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-x-2 top-2 z-[200] rounded bg-black/80 p-2 font-mono text-[10px] leading-snug text-white">
      {lines.map((line, i) => (
        <div key={i} className="break-all">
          {line}
        </div>
      ))}
    </div>
  );
}

/** matrix(...) / matrix3d(...) → "x=-45 rotY=12°" cho dễ đọc. */
function shortTransform(tf: string): string {
  if (tf === "none" || !tf.startsWith("matrix")) return tf;
  const v = tf.slice(tf.indexOf("(") + 1, -1).split(",").map(Number);
  if (tf.startsWith("matrix3d")) {
    const deg = Math.round((Math.atan2(v[8], v[0]) * 180) / Math.PI);
    return `x=${Math.round(v[12])} rotY=${deg}°`;
  }
  return `x=${Math.round(v[4])}`;
}
