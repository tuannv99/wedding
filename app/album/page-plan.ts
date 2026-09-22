import type { AlbumChapter } from "@/lib/wedding";

/**
 * Chia ảnh của một chương thành các TRANG ALBUM.
 *
 * Khác hẳn bản cũ (một dòng chảy ảnh dài, cắt thành khối pair/solo/offset):
 * ở đây mỗi trang là một composition đứng riêng, vừa đúng một màn hình, vì
 * người xem sẽ lật từng trang một chứ không cuộn qua một dải ảnh.
 *
 * Vì vậy số ảnh trên một trang phải ít — một trang album thật không bao giờ
 * dán 6 tấm. Tối đa 2 tấm, và hai tấm đó luôn có trọng lượng thị giác khác
 * nhau ở ba trong năm layout.
 */

export type PageLayout =
  /**
   * Trang tiêu đề: không ảnh, chỉ số chương + tên + ghi chú.
   *
   * MỌI chương đều có trang này ở đầu xấp giấy của mình. Với chương đầu, lật
   * nó ra chính là động tác "mở album". Với các chương sau, nó là trang đầu
   * tiên sau màn chuyển chương (ChapterSeparator) — màn đó chỉ hiện số + tên
   * chương trong lúc thiệp khép/mở, còn đoạn ghi chú đầy đủ luôn nằm ở đây,
   * trên một tờ giấy thật sự chứ không phải chữ nổi lên trên nền thiệp.
   */
  | "title"
  /** 1 ảnh NGANG tràn trang — chỉ dùng cho ảnh bìa của chương. */
  | "cover"
  /** 1 ảnh dọc lớn nhất có thể: điểm nhấn của chương. */
  | "hero"
  /** 1 ảnh dọc nhỏ hơn, nhiều khoảng trắng hai bên: nhịp lặng. */
  | "single"
  /** 2 ảnh dọc bằng nhau, cạnh nhau. */
  | "double"
  /** 1 ảnh chính + 1 ảnh phụ nhỏ, cùng chạm đáy trang. */
  | "hero-support"
  /** 2 ảnh lệch cỡ và lệch tầng, nhưng lệch có chủ đích. */
  | "asymmetric";

export type PageItem = {
  src: string;
  alt: string;
  /**
   * Chỉ số của ảnh trong lightbox toàn album. `-1` = ảnh bìa: nó là trang
   * trí của chương chứ không phải một tấm trong bộ ảnh, nên không bấm mở
   * được và không làm lệch bộ đếm "01 / 33".
   */
  index: number;
};

export type PageIntro = {
  number: string;
  title: string;
  note: string;
  titleId: string;
};

export type AlbumPageSpec = {
  key: string;
  layout: PageLayout;
  items: PageItem[];
  /** Chỉ có ở layout "title". */
  intro?: PageIntro;
};

const CAPACITY: Record<PageLayout, number> = {
  title: 0,
  cover: 1,
  hero: 1,
  single: 1,
  double: 2,
  "hero-support": 2,
  asymmetric: 2,
};

/**
 * Nhịp của một chương: lặng → gần → động → lặng.
 *
 * Cố định chứ không random: hai lần mở cùng một chương phải ra đúng một cuốn
 * album. Chu kỳ 10 trang dài hơn mọi chương hiện có nên không đoạn nào lặp
 * lại y nguyên hai lần liền.
 */
const RHYTHM: PageLayout[] = [
  "single",
  "double",
  "hero",
  "hero-support",
  "double",
  "single",
  "asymmetric",
  "double",
  "hero-support",
  "double",
];

/**
 * @param base  chỉ số toàn cục của ảnh đầu tiên trong chương (để mở lightbox).
 * @param narrow  màn hẹp (< 640px): mỗi trang chỉ một ảnh. Nhồi 2 ảnh dọc vào
 *   một trang điện thoại thì mỗi tấm chỉ còn ~160px — thà lật nhiều trang hơn
 *   mà tấm nào cũng xem được.
 * @param titleIntro  có thì chèn một trang tiêu đề lên đầu chương.
 */
export function buildPages(
  chapter: AlbumChapter,
  base: number,
  narrow: boolean,
  titleIntro?: PageIntro,
): AlbumPageSpec[] {
  const pages: AlbumPageSpec[] = [];
  const push = (layout: PageLayout, items: PageItem[], intro?: PageIntro) =>
    pages.push({ key: `${chapter.id}-${pages.length}`, layout, items, intro });

  if (titleIntro) push("title", [], titleIntro);

  if (chapter.cover) {
    push("cover", [
      {
        src: chapter.cover,
        alt: `Ảnh mở đầu buổi chụp ${chapter.title}`,
        index: -1,
      },
    ]);
  }

  const photos: PageItem[] = chapter.photos.map((photo, i) => ({
    src: photo.src,
    alt: photo.alt,
    index: base + i,
  }));

  if (narrow) {
    photos.forEach((photo) => push("hero", [photo]));
    return pages;
  }

  // Chương rất ít ảnh (Áo dài chỉ 3 tấm): một tấm lớn, rồi phần còn lại thành
  // một trang. Đưa nó qua nhịp 10 trang ở dưới thì chương kết thúc ngay giữa
  // chu kỳ, đọc ra là cụt.
  if (photos.length <= 3) {
    push("hero", [photos[0]]);
    const rest = photos.slice(1);
    if (rest.length === 1) push("single", rest);
    else if (rest.length === 2) push("double", rest);
    return pages;
  }

  // Tấm cuối luôn đứng riêng một trang "hero": chương khép lại bằng một nhịp
  // tĩnh, đúng như trang cuối của một chương trong album thật.
  const body = photos.slice(0, -1);
  const last = photos[photos.length - 1];

  let i = 0;
  let step = 0;

  while (i < body.length) {
    const remaining = body.length - i;
    let layout = RHYTHM[step % RHYTHM.length];
    step += 1;

    // Chỉ còn 1 ảnh mà layout đang tới cần 2 → hạ xuống một trang đơn.
    if (remaining < CAPACITY[layout]) layout = "single";

    const size = Math.min(CAPACITY[layout], remaining);
    push(layout, body.slice(i, i + size));
    i += size;
  }

  push("hero", [last]);

  return pages;
}
