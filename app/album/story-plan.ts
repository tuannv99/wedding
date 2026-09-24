import type { AlbumInterlude, AlbumPhoto } from "@/lib/wedding";

/**
 * Nhịp của trang /album.
 *
 * Trang cũ chia 33 ảnh thành ba chương rồi cắt mỗi chương thành từng TRANG
 * giấy lật được: một ảnh là một trang, một trang là một màn hình. Muốn xem
 * lại tấm thứ 3 khi đang ở tấm thứ 25 thì phải lật ngược 22 lần.
 *
 * Ở đây không còn trang, không còn chương. 35 ảnh dọc chảy thành MỘT dòng
 * liên tục, và nhịp thị giác đến từ việc mỗi khối ảnh có bố cục khác nhau —
 * lúc một tấm lớn giữa trang, lúc hai tấm cạnh nhau, lúc một tấm dồn hẳn về
 * một bên để chừa ra một mảng trắng.
 *
 * Nhịp này được VIẾT TAY chứ không sinh ra từ một chu kỳ lặp hay một hàm
 * random: 35 là con số cố định và đã biết trước, nên cứ xếp thẳng ra thì đọc
 * được ngay đoạn nào đang dồn dập, đoạn nào đang thở. Chu kỳ lặp (cách làm
 * của page-plan.ts cũ) tiết kiệm được vài dòng nhưng luôn để lại một đoạn
 * cụt ở cuối, đúng chỗ cần chắc tay nhất.
 */

export type StoryLayout =
  /** 1 ảnh lớn, căn giữa — điểm nhấn, mở một đoạn. */
  | "hero"
  /** 1 ảnh nhỏ hơn, căn giữa, nhiều khoảng trắng hai bên — nhịp lặng. */
  | "single"
  /** 1 ảnh vừa, dồn hẳn về trái; mảng trắng nằm bên phải. */
  | "offset-left"
  /** Như trên nhưng ngược bên. */
  | "offset-right"
  /** 2 ảnh bằng nhau, cạnh nhau. */
  | "pair"
  /** 2 ảnh lệch cỡ và lệch tầng — tấm nhỏ tụt xuống so với tấm lớn. */
  | "asymmetric"
  /** 2 ảnh trên + 1 ảnh dưới hơi lệch tâm. */
  | "trio";

/** Số ảnh mà mỗi bố cục nhận. */
const CAPACITY: Record<StoryLayout, number> = {
  hero: 1,
  single: 1,
  "offset-left": 1,
  "offset-right": 1,
  pair: 2,
  asymmetric: 2,
  trio: 3,
};

/**
 * Nhịp đã viết sẵn, cộng lại đúng 35 ảnh.
 *
 * Bốn ranh giới 4 / 13 / 19 / 32 là chỗ bốn câu chen (wedding.album.interludes)
 * rơi vào — buildStory() kiểm tra lại điều đó và ném lỗi nếu lệch, nên không
 * có cách nào sửa một bên mà quên bên kia.
 */
const RHYTHM: StoryLayout[] = [
  // Mở ra: một tấm lớn, rồi dồn dập dần.
  "hero", // 1
  "pair", // 2–3
  "offset-left", // 4          ← câu chen 1
  "asymmetric", // 5–6
  "pair", // 7–8
  "single", // 9
  "trio", // 10–12
  "offset-right", // 13        ← câu chen 2
  "hero", // 14
  "pair", // 15–16
  "asymmetric", // 17–18
  "single", // 19              ← câu chen 3
  // Vào studio: mở lại bằng một tấm lớn, đúng như lúc mở đầu.
  "hero", // 20
  "pair", // 21–22
  "offset-left", // 23
  "asymmetric", // 24–25
  "trio", // 26–28
  "single", // 29
  "pair", // 30–31
  "offset-right", // 32        ← câu chen 4
  // Ba tấm áo dài: một tấm lớn rồi hai tấm cạnh nhau, hết.
  "hero", // 33
  "pair", // 34–35
];

export type StoryItem = {
  photo: AlbumPhoto;
  /**
   * Số thứ tự trong TOÀN BỘ 37 ảnh (1 = ảnh ngang mở đầu, 37 = ảnh ngang khép
   * lại). Dùng cho anchor `#anh-07`, cho bộ đếm lightbox, và cho ô thumbnail
   * tương ứng ở phần xem tổng thể.
   */
  n: number;
};

export type StorySection =
  | { kind: "photos"; key: string; layout: StoryLayout; items: StoryItem[] }
  | { kind: "interlude"; key: string; tone: AlbumInterlude["tone"]; text: string };

/**
 * Chỉ số 1-based trong bộ 37 ảnh, dùng cho anchor và cho lightbox.
 *
 * Ảnh ngang mở đầu là số 1, 35 ảnh dọc là 2–36, ảnh ngang khép lại là 37 —
 * đúng thứ tự người xem gặp chúng khi cuộn từ trên xuống.
 */
export const FIRST_INDEX = 1;
export const LAST_INDEX = 37;

/** Id của neo cuộn gắn trên từng ảnh. */
export function anchorId(n: number): string {
  return `anh-${String(n).padStart(2, "0")}`;
}

/**
 * Dựng danh sách section từ dữ liệu trong lib/wedding.ts.
 *
 * Hàm chạy lúc render (cả hai phía đều cho ra một kết quả vì không có gì ngẫu
 * nhiên hay phụ thuộc thời gian), nên không cần memo hoá.
 */
export function buildStory(
  photos: readonly AlbumPhoto[],
  interludes: readonly AlbumInterlude[],
): StorySection[] {
  const planned = RHYTHM.reduce((sum, layout) => sum + CAPACITY[layout], 0);
  if (planned !== photos.length) {
    throw new Error(
      `Nhịp /album đang xếp chỗ cho ${planned} ảnh nhưng wedding.album.photos có ${photos.length}. Sửa RHYTHM trong app/album/story-plan.ts cho khớp.`,
    );
  }

  const byPosition = new Map(interludes.map((item) => [item.after, item]));
  const sections: StorySection[] = [];
  const boundaries = new Set<number>();

  let taken = 0;

  RHYTHM.forEach((layout, step) => {
    const size = CAPACITY[layout];
    const items = photos.slice(taken, taken + size).map((photo, i) => ({
      photo,
      // +1 vì ảnh số 1 của cả bộ là ảnh ngang mở đầu, không nằm trong `photos`.
      n: taken + i + 2,
    }));

    sections.push({ kind: "photos", key: `s${step}`, layout, items });
    taken += size;
    boundaries.add(taken);

    const interlude = byPosition.get(taken);
    if (interlude) {
      sections.push({
        kind: "interlude",
        key: `i${taken}`,
        tone: interlude.tone,
        text: interlude.text,
      });
    }
  });

  const orphan = interludes.find((item) => !boundaries.has(item.after));
  if (orphan) {
    throw new Error(
      `Câu chen sau ảnh ${orphan.after} rơi vào GIỮA một khối ảnh nên sẽ bị bỏ qua. Đổi \`after\` hoặc đổi RHYTHM trong app/album/story-plan.ts.`,
    );
  }

  return sections;
}
