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
  -- Di sản của chức năng duyệt cũ (đã bỏ): lời chúc gửi lên là hiện ngay ở
  -- /wishes, admin chỉ còn quyền xoá. Giữ cột để không phải xoá dữ liệu cũ;
  -- mặc định true và không còn policy nào cho phép đổi giá trị này.
  is_approved boolean not null default true,
  constraint wedding_wishes_name_length check (char_length(name) between 1 and 80),
  constraint wedding_wishes_message_length check (char_length(message) between 1 and 500)
);

-- Bỏ duyệt lời chúc: bảng đã tạo trước đây có default false → đổi sang true,
-- và mở luôn những lời chúc còn nằm trong hàng chờ duyệt cũ.
alter table public.wedding_wishes alter column is_approved set default true;
update public.wedding_wishes set is_approved = true where is_approved = false;

-- Đọc trang /wishes theo "mới nhất trước".
drop index if exists public.wedding_wishes_approved_created_at_idx;
create index if not exists wedding_wishes_created_at_idx
  on public.wedding_wishes (created_at desc);

alter table public.wedding_wishes enable row level security;

-- Khách (chưa đăng nhập — role "anon"): đọc được mọi lời chúc.
drop policy if exists "public can read approved wishes" on public.wedding_wishes;
drop policy if exists "public can read wishes" on public.wedding_wishes;
create policy "public can read wishes"
  on public.wedding_wishes
  for select
  to anon
  using (true);

-- Được phép gửi lời chúc mới (cả khách chưa đăng nhập lẫn admin đang đăng
-- nhập sẵn khi tự dùng form RSVP trên trình duyệt của mình).
drop policy if exists "guests can insert unapproved wishes" on public.wedding_wishes;
drop policy if exists "guests can insert wishes" on public.wedding_wishes;
create policy "guests can insert wishes"
  on public.wedding_wishes
  for insert
  to anon, authenticated
  with check (true);

-- Khách: KHÔNG có policy update/delete nào cho role anon → mặc định bị từ chối.

-- Admin (đã đăng nhập qua Supabase Auth — role "authenticated"): đọc tất cả.
drop policy if exists "authenticated can read all wishes" on public.wedding_wishes;
create policy "authenticated can read all wishes"
  on public.wedding_wishes
  for select
  to authenticated
  using (true);

-- Không còn duyệt / bỏ duyệt → không ai được update lời chúc nữa (kể cả
-- admin). Gỡ policy update và trigger giới hạn cột update của chức năng cũ.
drop policy if exists "authenticated can update approval" on public.wedding_wishes;
drop trigger if exists wedding_wishes_restrict_update_trigger on public.wedding_wishes;
drop function if exists public.wedding_wishes_restrict_update();

-- Admin: xoá lời chúc.
drop policy if exists "authenticated can delete wishes" on public.wedding_wishes;
create policy "authenticated can delete wishes"
  on public.wedding_wishes
  for delete
  to authenticated
  using (true);

-- Xác nhận tham dự (RSVP) — trước đây /api/rsvp chỉ console.log, không lưu
-- đâu cả. Bảng này lưu thật để admin xem được danh sách khách + số người đi
-- kèm. `message` lưu lại luôn lời chúc kèm theo (nếu có) để admin thấy đủ ngữ
-- cảnh một lượt gửi — dù nội dung đó cũng đã vào wedding_wishes để hiển thị
-- công khai ở /wishes, đây chỉ là bản sao riêng cho mục đích quản lý RSVP.
create table if not exists public.rsvp_responses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  attending text not null,
  guests integer not null default 0,
  message text not null default '',
  created_at timestamptz not null default now(),
  constraint rsvp_responses_name_length check (char_length(name) between 1 and 120),
  constraint rsvp_responses_attending_valid check (attending in ('yes', 'no')),
  constraint rsvp_responses_guests_range check (guests between 0 and 20),
  constraint rsvp_responses_message_length check (char_length(message) <= 1000)
);

create index if not exists rsvp_responses_created_at_idx
  on public.rsvp_responses (created_at desc);

alter table public.rsvp_responses enable row level security;

-- Khách: chỉ được gửi (insert), không đọc/sửa/xoá được RSVP của ai —
-- kể cả của chính mình gửi trước đó (không có policy select cho anon).
drop policy if exists "guests can insert rsvp" on public.rsvp_responses;
create policy "guests can insert rsvp"
  on public.rsvp_responses
  for insert
  to anon, authenticated
  with check (true);

-- Admin: đọc toàn bộ danh sách đã xác nhận.
drop policy if exists "authenticated can read all rsvp" on public.rsvp_responses;
create policy "authenticated can read all rsvp"
  on public.rsvp_responses
  for select
  to authenticated
  using (true);

-- Admin: xoá một RSVP (vd. gửi trùng/thử nghiệm).
drop policy if exists "authenticated can delete rsvp" on public.rsvp_responses;
create policy "authenticated can delete rsvp"
  on public.rsvp_responses
  for delete
  to authenticated
  using (true);

-- Khách mời cho link thiệp cá nhân hoá (/<slug>, xem app/[guest]/page.tsx).
-- Trước đây danh sách này nằm cứng trong data/guests.ts — muốn thêm một
-- khách là phải sửa code rồi deploy lại. Giờ admin tự thêm qua /admin/guests,
-- không cần deploy; data/guests.ts chỉ còn vài mục mẫu để fallback khi chưa
-- cấu hình Supabase (dev local) hoặc slug không có trong bảng này.
create table if not exists public.wedding_guests (
  slug text primary key,
  name text not null,
  -- Lời chào đứng trước tên, vd "Gửi bạn yêu". NULL thì trang tự dùng mặc
  -- định "Gửi bạn" (xem LEGACY_DEFAULT_GREETING trong lib/guest-invitation.ts).
  -- Chỉ áp dụng cho link chưa có cột pronoun bên dưới.
  greeting text,
  created_at timestamptz not null default now(),
  constraint wedding_guests_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint wedding_guests_name_length check (char_length(name) between 1 and 120),
  constraint wedding_guests_greeting_length check (greeting is null or char_length(greeting) between 1 and 40)
);

-- Cách xưng hô (thêm sau — "add column if not exists" để chạy lại an toàn
-- trên bảng đã có dữ liệu). Cột `name` giữ vai trò họ tên đầy đủ.
--   display_name: tên gọi trên thiệp, vd "Hiếu" cho "Đỗ Ngọc Hiếu".
--   pronoun:      anh | chị | em | bạn — quyết định "Gửi anh Hiếu, Trân
--                 trọng mời anh… của chúng em.." (lib/guest-invitation.ts).
-- Link tạo trước đó có pronoun NULL → thiệp giữ nguyên cách hiển thị cũ
-- (lời chào ở cột greeting + tên đầy đủ).
alter table public.wedding_guests add column if not exists display_name text;
alter table public.wedding_guests add column if not exists pronoun text;

alter table public.wedding_guests drop constraint if exists wedding_guests_display_name_length;
alter table public.wedding_guests add constraint wedding_guests_display_name_length
  check (display_name is null or char_length(display_name) between 1 and 60);

alter table public.wedding_guests drop constraint if exists wedding_guests_pronoun_valid;
alter table public.wedding_guests add constraint wedding_guests_pronoun_valid
  check (pronoun is null or pronoun in ('anh', 'chị', 'em', 'bạn'));

alter table public.wedding_guests enable row level security;

-- Mở link /<slug> là truy cập ẩn danh (role "anon") — phải đọc được đúng
-- tên/lời chào của mình thì trang mới cá nhân hoá được, nên cho đọc công
-- khai toàn bộ (dữ liệu chỉ là tên, không nhạy cảm).
drop policy if exists "public can read guests" on public.wedding_guests;
create policy "public can read guests"
  on public.wedding_guests
  for select
  to anon, authenticated
  using (true);

-- Chỉ admin (đã đăng nhập) mới được tạo/sửa/xoá khách mời.
drop policy if exists "authenticated can manage guests" on public.wedding_guests;
create policy "authenticated can manage guests"
  on public.wedding_guests
  for all
  to authenticated
  using (true)
  with check (true);
