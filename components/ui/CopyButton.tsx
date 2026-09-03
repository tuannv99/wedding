"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type CopyButtonProps = {
  value: string;
  label: string;
  copiedLabel?: string;
  className?: string;
};

/** Copy an toàn: thử Clipboard API trước, fallback sang execCommand cho
 * context không có (http, trình duyệt cũ) hoặc bị chặn quyền. */
async function copyToClipboard(value: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // rơi xuống fallback bên dưới
    }
  }

  if (typeof document === "undefined") return false;

  try {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export function CopyButton({ value, label, copiedLabel = "✓ Đã sao chép", className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  // Feedback tự biến mất sau một khoảng ngắn.
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function handleClick() {
    const ok = await copyToClipboard(value);
    setFailed(!ok);
    setCopied(ok);
    if (!ok) window.setTimeout(() => setFailed(false), 2200);
  }

  return (
    <button type="button" className={cn("wd-btn-ghost", className)} onClick={handleClick}>
      {copied ? copiedLabel : failed ? "Không sao chép được" : label}
    </button>
  );
}
