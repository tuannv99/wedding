# Trang "Những lời yêu thương" (`/wishes`): layout hiện tại

Tài liệu này là input để re-design trang. Nó mô tả bố cục đang chạy, lấy từ `app/wishes/page.tsx`, `WishCard.tsx`, `WishesPagination.tsx` và `loading.tsx`.

---

## 1. Bối cảnh

- Trang **chỉ để đọc** các lời chúc. Lời chúc gửi lên là hiện ngay, không qua duyệt; admin chỉ có quyền xoá. Trang này không có form gửi.
- Lời chúc chỉ gửi được qua ô "Lời chúc" trong form RSVP ở trang chủ (`/#rsvp`).
- Trang render hoàn toàn ở server, không có JS phía client. Phân trang bằng URL `?page=n`, mỗi trang 12 lời chúc, mới nhất xếp trước.
- Nếu bản re-design cần tương tác (masonry động, mở rộng card, modal…) thì phải thêm client component.

## 2. Dữ liệu một lời chúc

| Field | Hiển thị | Giới hạn |
|---|---|---|
| `message` | có, giữ nguyên xuống dòng (`white-space: pre-line`) | tối đa 500 ký tự |
| `name` | có | tối đa 80 ký tự |
| `createdAt` | **chưa hiển thị** | ISO timestamp |

Card phải đẹp ở cả hai cực: lời chúc 1 dòng và lời chúc 500 ký tự. Tên người gửi cũng có thể dài.

## 3. Khung trang (từ trên xuống)

```
┌──────────────────────────────────────────────┐
│ SimpleHeader (header chung của các trang con) │
├──────────────────────────────────────────────┤
│                                    ❦ sprig   │  ← chỉ hiện từ lg trở lên
│              ── ❦ ──  (BotanicalRule)        │
│         NHỮNG LỜI YÊU THƯƠNG   (H1)          │
│    Cảm ơn bạn đã dành những lời chúc…        │
│                                              │
│   ┌────────┐  ┌────────┐  ┌────────┐         │
│   │  card  │  │  card  │  │  card  │         │  ← grid 1 / 2 / 3 cột
│   └────────┘  └────────┘  └────────┘         │
│   ┌────────┐  ┌────────┐  ┌────────┐         │
│   │  card  │  │  card  │  │  card  │         │
│   └────────┘  └────────┘  └────────┘         │
│                  ‹ ● ○ ○ › (pagination)       │
└──────────────────────────────────────────────┘
```

### 3.1 `main`

- Nền `ivory`, full width, `overflow-hidden`.
- Padding:
  - mobile: ngang 24px, trên 20px, dưới 112px
  - md trở lên: ngang 20px, trên 64px, dưới 160px

### 3.2 Botanical accent

- Một nhánh lá `sprig` dạng line-art, opacity 0.26, lật ngang.
- Vị trí: `top 4%`, `right -2vw`. Kích thước: cao 30vh, rộng 16vh.
- Chỉ hiện từ breakpoint `lg` trở lên.

### 3.3 Hero rút gọn

Hero căn giữa, max-width 700px. Mục tiêu chiều cao khoảng 250–320px trên desktop và 180–240px trên mobile, tính đến lúc bắt đầu grid.

| Phần tử | Chi tiết |
|---|---|
| `BotanicalRule` | Đường kẻ có hoạ tiết lá. Mỗi nhánh rộng 32px, từ `sm` là 48px. |
| H1 | "Những lời yêu thương". Viết hoa, `tracking 0.16em`. Cỡ chữ `clamp(26px, 4.5vw, 44px)`, từ md là `clamp(34px, 4.5vw + 8px, 52px)`. Cách đường kẻ 16px, từ md là 20px. |
| Mô tả | "Cảm ơn bạn đã dành những lời chúc tốt đẹp cho hành trình mới của chúng mình." Style `wd-body-sm`, max-width 420px, cách H1 12px. |

### 3.4 Grid lời chúc

- Max-width 1300px, căn giữa. Cách hero 20px, từ md là 48px.
- Số cột: **1** dưới `sm` · **2** từ `sm` · **3** từ `lg`.
- Khoảng cách giữa các card: 20px, từ `sm` là 24px.
- Các card cùng hàng đang **cao bằng nhau** (grid stretch). Vì vậy lời chúc ngắn đứng cạnh lời chúc dài sẽ để lại nhiều khoảng trống.

### 3.5 Card lời chúc

```
┌─────────────────────────┐
│ ♡                       │
│                         │
│ Nội dung lời chúc…      │  ← flex-1, card giãn theo nội dung
│ …                       │
│ ─────────────────────── │
│        Tên người        │  ← căn giữa, cắt bằng truncate
└─────────────────────────┘
```

| Thuộc tính | Giá trị |
|---|---|
| Nền / viền | Nền `warm` `#fffdfc`, viền 1px `taupe/20`, bo góc 3px, **không shadow** |
| Padding | 24px, từ md là 28px |
| `♡` | Màu champagne, 14px, từ md là 22px |
| Nội dung | Serif, 15px / 16px (sm) / 24px (md), line-height 1.7, cách ♡ 12px |
| Đường kẻ | 1px `taupe/20`, cách nội dung 20px |
| Tên | `wd-label`, 12px, từ md là 20px. Màu `ink/70`, căn giữa, cách đường kẻ 16px |
| Animation | Fade-up 6px trong 350ms. Mỗi card trễ hơn card trước 30ms, tối đa 8 card. Tự tắt khi người dùng bật reduced-motion. |

### 3.6 Pagination

- Căn giữa, cách grid 56px, từ md là 64px. Chỉ hiện khi có từ 2 trang trở lên.
- Thứ tự: `‹` · các chấm · `›`. Mỗi ô bấm rộng 24px, cao 44px.
- Chấm trang hiện tại: 7px, đặc màu `ink`. Chấm trang khác: 6px, viền `ink/30`, đậm lên `ink/60` khi hover.
- Khi nhiều trang thì rút gọn bằng chấm 3px màu `ink/25`.
- Mũi tên: 13px, từ md là 21px. Màu `ink/35`, hover thành `ink`. Ở trang đầu và trang cuối, mũi tên tương ứng mờ còn `ink/15`.
- Mỗi chấm có `aria-label="Trang N"` và trang hiện tại có `aria-current`, vì chấm không hiện số.

## 4. Các trạng thái cần có layout

| Trạng thái | Nội dung (căn giữa, `wd-body-sm`) |
|---|---|
| Có dữ liệu | Grid + pagination |
| Chưa có lời chúc | "Chưa có lời chúc nào." · "Hãy là người đầu tiên gửi lời yêu thương đến Tuấn & Hoa — [để lại khi xác nhận tham dự](/#rsvp)." |
| Trang vượt quá số trang | "Trang này không có lời chúc nào." · [Về trang đầu](/wishes) |
| Chưa kết nối DB | "Trang lời chúc chưa được kết nối database — bạn quay lại sau giúp mình nhé." |
| Loading | Skeleton `animate-pulse`: đường kẻ, tiêu đề 256–320px, dòng mô tả và 6 card cao 192px. Skeleton dùng cùng grid với trang thật. |

## 5. Design tokens

| Token | Giá trị | Dùng cho |
|---|---|---|
| `ivory` | `#f9f7f2` | nền trang |
| `warm` | `#fffdfc` | nền card |
| `ink` | `#3d3935` | chữ chính |
| `ink-soft` | `#6e6862` | chữ phụ |
| `taupe` | `#a99f95` | viền, đường kẻ |
| `sage` | `#aab2a3` | hoa lá |
| `champagne` | `#d8c5a5` | ký hiệu ♡ |

- Font: chỉ một họ serif là Cormorant Garamond, thêm "WD Digits" cho chữ số.
- Class có sẵn: `wd-h1`, `wd-body-sm`, `wd-body-serif`, `wd-label`.
- Breakpoint (Tailwind): `sm` 640px · `md` 768px · `lg` 1024px.

## 6. Nguyên tắc của site cần giữ

- Hoa lá chỉ là accent line-art, đặt thưa. Không dùng hoa lá làm khung trang trí và giới hạn số lượng theo breakpoint.
- Nếu có mockup thì bố cục theo mockup, kể cả khi mâu thuẫn với mô tả bằng chữ.
- Tông chung tối giản, nền giấy ivory, không shadow nặng.

## 7. Điểm yếu của layout hiện tại

- Các card cao bằng nhau nên lời chúc ngắn để lại nhiều khoảng trống. Có thể cân nhắc masonry hoặc CSS columns.
- Ở md trở lên, nội dung lời chúc dùng cỡ 24px. Với 3 cột, một lời chúc 500 ký tự sẽ làm card rất cao.
- Tên người gửi bị cắt `truncate` nên tên dài bị mất chữ.
- Có `createdAt` nhưng ngày gửi chưa được hiển thị.
- Pagination không hiện số trang, khách khó biết còn bao nhiêu lời chúc.
