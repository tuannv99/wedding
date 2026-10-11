/**
 * Sinh danh sách token trang rút gọn kiểu "1 … 4 5 6 … 42" — dùng cho
 * pagination /wishes khi có hàng trăm lời chúc (không hiện hết số trang).
 *
 * Số ô luôn cố định (siblingCount * 2 + 5) khi có nhiều trang: chuyển trang
 * không làm thanh pagination co giãn bề ngang, mũi tên không bị xô đi.
 * Mỗi số trang chỉ xuất hiện đúng một lần (dùng làm React key).
 */
export type PageToken = number | "ellipsis";

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

export function buildPageTokens(
  current: number,
  total: number,
  siblingCount = 1,
): PageToken[] {
  if (total <= 0) return [];

  const totalVisible = siblingCount * 2 + 5;
  if (total <= totalVisible) return range(1, total);

  // Số ô liền nhau ở một đầu khi trang hiện tại nằm sát đầu đó:
  // trang đầu/cuối + 2 ô sibling + chính nó + 1 ô bù cho dấu "…" bị bỏ.
  const edgeCount = siblingCount * 2 + 3;

  if (current <= edgeCount - siblingCount) {
    return [...range(1, edgeCount), "ellipsis", total];
  }
  if (current >= total - edgeCount + siblingCount + 1) {
    return [1, "ellipsis", ...range(total - edgeCount + 1, total)];
  }
  return [
    1,
    "ellipsis",
    ...range(current - siblingCount, current + siblingCount),
    "ellipsis",
    total,
  ];
}
