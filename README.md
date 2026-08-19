# Thiệp cưới online · Tuấn & Hoa

Website thiệp cưới cho **Văn Tuấn & Mai Hoa** — ngày cưới **20.09.2026**.
Phong cách editorial / minimal, mobile-first, dựng bằng Next.js App Router.

```
Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · Lucide · next/font (Google Fonts)
```

---

## Chạy dự án

```bash
npm install
npm run dev        # http://localhost:3000
```

Các script khác:

| Script               | Việc nó làm                                                       |
| -------------------- | ----------------------------------------------------------------- |
| `npm run build`      | Build production                                                  |
| `npm start`          | Chạy bản production đã build                                      |
| `npm run typecheck`  | Kiểm tra TypeScript                                               |
| `npm run lint`       | ESLint (next/core-web-vitals)                                     |
| `npm run gen:images` | Sinh lại toàn bộ ảnh placeholder + ảnh Open Graph trong `public/` |

---

## Sửa nội dung thiệp

**Toàn bộ dữ liệu nằm trong một file duy nhất: [`lib/wedding.ts`](lib/wedding.ts).**
Không có nội dung nào bị hard-code rải rác trong component.

```ts
wedding = {
  groom, bride,        // tên chú rể / cô dâu (dạng đầy đủ + dạng ngắn in hoa)
  date,                // ngày cưới + mốc countdown (ISO có timezone +07:00)
  ceremony, reception,  // giờ lễ / giờ tiệc
  venue,               // tên, địa chỉ, link Google Maps   ← đang là placeholder
  story,               // các đoạn text "Our story"
  timeline,            // lịch trình "Our day"
  images, gallery,     // đường dẫn + tỉ lệ ảnh
  music,               // file nhạc, âm lượng, có bật khi "Mở thiệp" hay không
  nav,                 // menu
  copy,                // TOÀN BỘ chữ hiển thị trên trang (tiếng Việt)
  site,                // metadata SEO/Open Graph
}
```

`copy` gom hết chữ của từng section (`hero`, `story`, `details`, `countdown`, `timeline`,
`gallery`, `rsvp`, `closing`) — sửa câu chữ chỉ cần vào đây, không phải mở component.
Các nhãn nhỏ được CSS tự viết hoa nên trong config cứ ghi chữ thường.

Cần sửa trước khi gửi thiệp:

1. `venue.name`, `venue.address`, `venue.mapsUrl` — hiện là `[Tên nhà hàng tiệc cưới]`.
2. `site.url` — domain thật (dùng cho Open Graph / metadataBase).

---

## Thay ảnh cưới thật

Ảnh nằm trong `public/images/wedding/`. Chỉ cần **ghi đè file cùng tên**, không phải sửa code:

| File                    | Vị trí dùng      | Tỉ lệ nên dùng |
| ----------------------- | ---------------- | -------------- |
| `hero.jpg`              | Section 01 Hero  | 4:5 (dọc)      |
| `story.jpg`             | Our Story        | 4:5 (dọc)      |
| `gallery-01.jpg`        | Gallery — ảnh to | 4:5            |
| `gallery-02/03.jpg`     | Gallery — 2 ảnh nhỏ | 1:1         |
| `gallery-04.jpg`        | Gallery          | 3:4            |
| `gallery-05.jpg`        | Gallery          | 3:2 (ngang)    |
| `gallery-06.jpg`        | Gallery — full width | 2:1        |
| `closing.jpg`           | Section cuối     | 3:2 (ngang)    |
| `og.jpg`                | Ảnh share Facebook/Zalo | 1200×630 |

Nếu đổi tỉ lệ, cập nhật `width`/`height` tương ứng trong `lib/wedding.ts` (dùng cho `next/image`).
Ảnh hiện tại là placeholder sinh bằng `npm run gen:images` (xem `scripts/generate-placeholders.mjs`).

## Nhạc nền

File nhạc đặt trong `public/audio/`, tên khai báo ở `wedding.music.src` (đang dùng `mot-doi.mp3`).
Nhạc **không** tự phát khi load (trình duyệt chặn autoplay) — chỉ phát khi khách bấm
nút nhạc ở góc phải, hoặc bấm **MỞ THIỆP** ở hero (`wedding.music.startOnOpen`).
Chưa có file thì nút nhạc tự ẩn.

> File hiện tại nặng ~13MB. Nên nén xuống ~3–4MB (mp3 128 kbps) trước khi gửi thiệp:
> khách mở bằng 3G/4G sẽ đỡ tốn dung lượng, và repo Git cũng không phình theo mỗi lần đổi nhạc.

---

## Nhận RSVP thật

Form đang POST tới [`app/api/rsvp/route.ts`](app/api/rsvp/route.ts) — route này validate dữ liệu rồi
`console.log` (xem được trong Vercel → Logs). Muốn lưu thật, thay chỗ `// TODO` bằng một trong:

- Google Sheets API (miễn phí, dễ xem nhất cho gia đình)
- Supabase / Neon / `@vercel/postgres`
- Notion / Airtable, hoặc gửi email qua Resend

Payload gửi lên:

```json
{ "name": "string", "attending": "yes" | "no", "guests": 0, "message": "string" }
```

---

## Cấu trúc

```
app/
  layout.tsx            # font, metadata, Open Graph
  page.tsx              # ghép các section
  globals.css           # palette + typography tokens (Tailwind v4 @theme)
  icon.svg              # favicon monogram
  api/rsvp/route.ts     # endpoint nhận RSVP
components/
  wedding/
    Navigation.tsx      # sticky nav + menu mobile
    Hero.tsx            # ảnh full-screen, tên, "Mở thiệp"
    OurStory.tsx
    WeddingDetails.tsx
    Countdown.tsx       # đếm ngược, không hydration mismatch
    Timeline.tsx        # Our day
    Gallery.tsx         # masonry bất đối xứng
    Lightbox.tsx        # xem ảnh lớn: keyboard + swipe
    RSVP.tsx            # section RSVP: khung + gọi API
    RsvpForm.tsx        # UI form (export từ Claude Design)
    Closing.tsx
    MusicPlayer.tsx
  ui/
    Reveal.tsx          # fade-up khi scroll, tôn trọng prefers-reduced-motion
    SectionHeading.tsx
styles/
  wedding.css           # text + form styles (.wd-*)
lib/
  wedding.ts            # ⇦ toàn bộ nội dung thiệp
  utils.ts              # cn() + scrollToSection()
  events.ts
scripts/
  generate-placeholders.mjs
```

---

## Design system

Text style + form style nằm trong [`styles/wedding.css`](styles/wedding.css) (export từ Claude Design),
được import vào `app/globals.css` ở `layer(components)` để utility của Tailwind vẫn ghi đè được:

| Class            | Dùng cho                                 |
| ---------------- | ---------------------------------------- |
| `.wd-display`    | Tên cô dâu chú rể (focal point)          |
| `.wd-h1`         | Heading section, tên nhà hàng            |
| `.wd-numeral`    | Ngày / tháng / năm, giờ lễ, countdown    |
| `.wd-body-serif` | Đoạn kể chuyện                           |
| `.wd-quote`      | Câu nhấn italic ("And here we are...")   |
| `.wd-eyebrow`    | Nhãn nhỏ trên heading, caption           |
| `.wd-label`      | Nhãn timeline, thứ trong tuần            |
| `.wd-body-sm`    | Địa chỉ, ghi chú                         |
| `.wd-rule`       | Gạch ngang champagne                     |
| `.wd-form` …     | Form RSVP: input, pill chọn, nút gửi     |
| `.wd-btn-ghost`  | Nút viền bo tròn (Mở thiệp, Xem bản đồ)  |

| Token       | Màu       | Dùng cho                  |
| ----------- | --------- | ------------------------- |
| `ivory`     | `#F9F7F2` | background chính          |
| `warm`      | `#FFFDFC` | background section xen kẽ |
| `ink`       | `#3D3935` | text chính                |
| `ink-soft`  | `#6E6862` | text phụ                  |
| `taupe`     | `#A99F95` | text phụ, hairline        |
| `sage`      | `#AAB2A3` | accent                    |
| `champagne` | `#D8C5A5` | accent (dấu &, gạch nhỏ)  |

Typography: **Cormorant Garamond** (heading, tên cô dâu chú rể) + **Manrope** (body), nạp bằng
`next/font` với subset `vietnamese`.

> File export gốc ghi body font là DM Sans, nhưng DM Sans trên Google Fonts chỉ có subset
> `latin` + `latin-ext` — thiếu khoảng `U+1EA0–1EF1` của tiếng Việt (ạ, ế, ộ, ừ…), nên chữ có dấu
> sẽ rơi về font hệ thống. Vì vậy `--wd-font-body` được map sang Manrope. Muốn dùng đúng DM Sans
> thì phải self-host bản có dựng thêm glyph tiếng Việt.

Animation: chỉ `opacity` + `translateY` nhỏ, `duration` 0.8–1.2s, ease-out.
Có `prefers-reduced-motion` cho mọi animation và cho smooth scroll.

---

## Deploy lên Vercel

1. Push code lên GitHub.
2. Vercel → **Add New → Project** → chọn repo. Framework tự nhận là Next.js, không cần đổi setting nào.
3. Deploy. Không cần environment variable nào (trừ khi bạn nối RSVP với database).
4. Sau khi có domain, cập nhật `site.url` trong `lib/wedding.ts` để ảnh Open Graph hiển thị đúng khi share.

## Đã kiểm tra

Chạy Chromium thật ở 1440 / 1280 / 768 / 390 / 375 px:

- không có overflow ngang, không vỡ layout, không có lỗi console
- lightbox: click mở, ← → chuyển ảnh, Esc đóng, swipe trên mobile
- RSVP: submit → success state
- countdown chạy đúng, không hydration mismatch
