"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type SaveImageButtonProps = {
  src: string;
  /** Tên file khi lưu, kèm đuôi (vd. "qr-chu-re.png"). */
  fileName: string;
  label: string;
  className?: string;
};

/**
 * Lưu ảnh về máy.
 *
 * Điện thoại: mở bảng chia sẻ của hệ điều hành (Web Share API kèm file) — trên
 * iPhone có mục "Lưu hình ảnh" vào thẳng Ảnh, còn thẻ <a download> chỉ lưu
 * vào app Tệp nên khách khó tìm lại để mở bằng app ngân hàng.
 * Máy không share được file (đa số desktop): tải file xuống như bình thường.
 *
 * Ảnh được tải sẵn thành Blob ngay khi nút hiện ra: Safari chỉ cho gọi
 * navigator.share() trong lúc còn "user gesture", nếu bấm xong mới fetch thì
 * chờ mạng xong là đã mất quyền đó và share bị chặn.
 */
export function SaveImageButton({ src, fileName, label, className }: SaveImageButtonProps) {
  const fileRef = useRef<File | null>(null);
  const [status, setStatus] = useState<"idle" | "saved" | "failed">("idle");

  useEffect(() => {
    let cancelled = false;
    fetch(src)
      .then((res) => (res.ok ? res.blob() : Promise.reject(new Error(String(res.status)))))
      .then((blob) => {
        if (!cancelled) fileRef.current = new File([blob], fileName, { type: blob.type });
      })
      .catch(() => {
        // Không tải trước được thì lúc bấm vẫn còn đường tải xuống bằng link.
      });
    return () => {
      cancelled = true;
    };
  }, [src, fileName]);

  // Feedback tự biến mất sau một khoảng ngắn, giống CopyButton.
  useEffect(() => {
    if (status === "idle") return;
    const timer = window.setTimeout(() => setStatus("idle"), 2200);
    return () => window.clearTimeout(timer);
  }, [status]);

  async function handleClick() {
    const file = fileRef.current;

    if (file && typeof navigator !== "undefined" && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
        setStatus("saved");
        return;
      } catch (error) {
        // Khách tự đóng bảng chia sẻ: không phải lỗi, không làm gì thêm.
        if (error instanceof DOMException && error.name === "AbortError") return;
        // Lỗi khác: rơi xuống tải file bên dưới.
      }
    }

    try {
      const href = file ? URL.createObjectURL(file) : src;
      const link = document.createElement("a");
      link.href = href;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (file) window.setTimeout(() => URL.revokeObjectURL(href), 1000);
      setStatus("saved");
    } catch {
      setStatus("failed");
    }
  }

  return (
    <button type="button" className={cn("wd-btn-ghost", className)} onClick={handleClick}>
      {status === "saved" ? "✓ Đã lưu ảnh" : status === "failed" ? "Không lưu được ảnh" : label}
    </button>
  );
}
