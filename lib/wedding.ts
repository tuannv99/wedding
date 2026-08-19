/**
 * Toàn bộ dữ liệu của thiệp cưới nằm trong file này.
 * Muốn đổi tên, ngày, địa điểm, timeline hay ảnh: chỉ sửa ở đây.
 */

export type GalleryImage = {
  src: string;
  alt: string;
  /** Tỉ lệ khung ảnh, dùng cho next/image và layout masonry. */
  width: number;
  height: number;
};

export type TimelineItem = {
  time: string;
  title: string;
};

export const wedding = {
  groom: {
    name: "Văn Tuấn",
    short: "TUẤN",
  },
  bride: {
    name: "Mai Hoa",
    short: "HOA",
  },

  /** Ngày cưới: 20/09/2026 (giờ Việt Nam, UTC+7). */
  date: {
    iso: "2026-09-20",
    /** Mốc countdown = giờ lễ thành hôn. */
    target: "2026-09-20T18:00:00+07:00",
    day: "20",
    month: "09",
    year: "2026",
    weekday: "Chủ Nhật",
    display: "20 · 09 · 2026",
  },

  ceremony: {
    label: "CEREMONY",
    time: "18:00",
  },
  reception: {
    label: "RECEPTION",
    time: "18:30",
  },

  venue: {
    // TODO: thay bằng thông tin thật trước khi gửi thiệp.
    name: "[Tên nhà hàng tiệc cưới]",
    address: "[Số nhà, đường, phường/xã, tỉnh/thành phố]",
    mapsUrl: "https://maps.google.com",
  },

  story: [
    "Một ngày bình thường,\nchúng mình gặp nhau.",
    "Rồi từ những điều rất nhỏ,\nchúng mình quyết định\nđi cùng nhau thật lâu.",
    "And here we are...",
  ],

  timeline: [
    { time: "17:30", title: "Đón khách" },
    { time: "18:00", title: "Lễ thành hôn" },
    { time: "18:30", title: "Tiệc cưới" },
    { time: "21:00", title: "Cheers & Celebration" },
  ] satisfies TimelineItem[],

  images: {
    hero: {
      src: "/images/wedding/hero.jpg",
      alt: "Văn Tuấn và Mai Hoa trong bộ ảnh cưới",
      width: 1600,
      height: 2000,
    },
    story: {
      src: "/images/wedding/story.jpg",
      alt: "Tuấn và Hoa nắm tay nhau",
      width: 1200,
      height: 1500,
    },
    closing: {
      src: "/images/wedding/closing.jpg",
      alt: "Tuấn và Hoa trong ánh chiều",
      width: 1800,
      height: 1200,
    },
  },

  gallery: [
    {
      src: "/images/wedding/gallery-01.jpg",
      alt: "Khoảnh khắc đầu tiên của buổi chụp",
      width: 1200,
      height: 1500,
    },
    {
      src: "/images/wedding/gallery-02.jpg",
      alt: "Bó hoa cưới trên nền vải lụa",
      width: 1200,
      height: 1200,
    },
    {
      src: "/images/wedding/gallery-03.jpg",
      alt: "Nụ cười của cô dâu",
      width: 1200,
      height: 1200,
    },
    {
      src: "/images/wedding/gallery-04.jpg",
      alt: "Chân dung hai người bên khung cửa",
      width: 1200,
      height: 1600,
    },
    {
      src: "/images/wedding/gallery-05.jpg",
      alt: "Cùng nhau đi trên con đường nhỏ",
      width: 1600,
      height: 1067,
    },
    {
      src: "/images/wedding/gallery-06.jpg",
      alt: "Ảnh cưới toàn cảnh",
      width: 2000,
      height: 1000,
    },
  ] satisfies GalleryImage[],

  music: {
    /** Đặt file nhạc tại public/audio/wedding-song.mp3. Nếu chưa có, nút nhạc sẽ tự ẩn. */
    src: "/audio/wedding-song.mp3",
    /** Bật nhạc khi khách bấm "MỞ THIỆP" (đây là user gesture nên trình duyệt cho phép). */
    startOnOpen: true,
    volume: 0.35,
  },

  nav: [
    { label: "OUR STORY", id: "our-story" },
    { label: "THE WEDDING", id: "the-wedding" },
    { label: "GALLERY", id: "gallery" },
    { label: "RSVP", id: "rsvp" },
  ],

  site: {
    url: "https://wedding-tuan-hoa.vercel.app",
    title: "Tuấn & Hoa · 20.09.2026",
    description:
      "Văn Tuấn & Mai Hoa — chúng mình sẽ kết hôn ngày 20 tháng 09 năm 2026. Rất mong được đón bạn trong ngày hạnh phúc.",
  },
} as const;

export const coupleShort = `${wedding.groom.short} & ${wedding.bride.short}`;
