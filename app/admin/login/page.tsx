"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SimpleHeader } from "@/components/ui/SimpleHeader";
import { EnsureOpened } from "@/components/ui/EnsureOpened";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Đăng nhập admin qua Supabase Auth (email + mật khẩu) — xem cách tạo tài
 * khoản admin trong README / báo cáo cuối phần triển khai. Không có form
 * "đăng ký" ở đây: tài khoản admin tạo tay trong Supabase Dashboard, trang
 * này chỉ đăng nhập.
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Chưa cấu hình Supabase — thêm biến môi trường rồi thử lại.");
      return;
    }

    setSending(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setSending(false);

    if (signInError) {
      setError("Sai email hoặc mật khẩu.");
      return;
    }

    router.push("/admin/wishes");
    router.refresh();
  }

  return (
    <>
      <EnsureOpened />
      <SimpleHeader />
      <main className="flex min-h-[70svh] w-full items-center justify-center bg-ivory px-6 py-28">
        <div className="w-full max-w-[380px]">
          <h1 className="wd-h1 text-center text-[clamp(28px,4vw,40px)]">
            Đăng nhập admin
          </h1>

          <form className="wd-form mt-12" onSubmit={handleSubmit} noValidate>
            <label className="wd-field">
              <span className="wd-field-label">Email</span>
              <input
                className="wd-input"
                type="email"
                name="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label className="wd-field mt-8">
              <span className="wd-field-label">Mật khẩu</span>
              <input
                className="wd-input"
                type="password"
                name="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            {error ? (
              <p role="alert" className="wd-body-sm mt-2" style={{ textAlign: "center" }}>
                {error}
              </p>
            ) : null}

            <div className="mt-9 flex justify-center">
              <button className="wd-cta" type="submit" disabled={sending}>
                {sending ? "Đang đăng nhập…" : "Đăng nhập"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
