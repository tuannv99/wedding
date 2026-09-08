-- Lời chúc cưới (Tuấn & Hoa)
-- Chạy file này trong Supabase Dashboard → SQL Editor → New query → Run.
-- An toàn để chạy lại nhiều lần (dùng "if not exists" / "or replace" ở những
-- chỗ hợp lệ); riêng phần policy thì drop-rồi-create vì Postgres không có
-- "create policy if not exists".

create extension if not exists "pgcrypto";

create table if not exists public.wedding_wishes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  message text not null,
  created_at timestamptz not null default now(),
  is_approved boolean not null default false,
  constraint wedding_wishes_name_length check (char_length(name) between 1 and 80),
  constraint wedding_wishes_message_length check (char_length(message) between 1 and 500)
);

-- Đọc trang /wishes theo "mới nhất trước" nên index sẵn is_approved + created_at.
create index if not exists wedding_wishes_approved_created_at_idx
  on public.wedding_wishes (is_approved, created_at desc);

alter table public.wedding_wishes enable row level security;

-- Khách (chưa đăng nhập — role "anon"): chỉ đọc được lời chúc đã duyệt.
drop policy if exists "public can read approved wishes" on public.wedding_wishes;
create policy "public can read approved wishes"
  on public.wedding_wishes
  for select
  to anon
  using (is_approved = true);

-- Được phép gửi lời chúc mới (cả khách chưa đăng nhập lẫn admin đang đăng
-- nhập sẵn khi tự dùng form RSVP/wishes trên trình duyệt của mình), nhưng
-- bắt buộc is_approved = false ngay ở tầng database — không thể tự set true
-- dù có sửa request thế nào.
drop policy if exists "guests can insert unapproved wishes" on public.wedding_wishes;
create policy "guests can insert unapproved wishes"
  on public.wedding_wishes
  for insert
  to anon, authenticated
  with check (is_approved = false);

-- Khách: KHÔNG có policy update/delete nào cho role anon → mặc định bị từ chối.

-- Admin (đã đăng nhập qua Supabase Auth — role "authenticated"): đọc tất cả,
-- kể cả lời chúc chưa duyệt.
drop policy if exists "authenticated can read all wishes" on public.wedding_wishes;
create policy "authenticated can read all wishes"
  on public.wedding_wishes
  for select
  to authenticated
  using (true);

-- Admin: duyệt / bỏ duyệt (chỉ được đổi is_approved, không đổi name/message).
drop policy if exists "authenticated can update approval" on public.wedding_wishes;
create policy "authenticated can update approval"
  on public.wedding_wishes
  for update
  to authenticated
  using (true)
  with check (true);

-- Admin: xoá lời chúc.
drop policy if exists "authenticated can delete wishes" on public.wedding_wishes;
create policy "authenticated can delete wishes"
  on public.wedding_wishes
  for delete
  to authenticated
  using (true);
