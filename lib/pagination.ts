/**
 * Sinh danh sách token trang rút gọn kiểu "1 … 4 5 6 … 42" — dùng cho
 * pagination /wishes khi có hàng trăm lời chúc (không hiện hết số trang).
 */
export type PageToken = number | "ellipsis";

export function buildPageTokens(
  current: number,
  total: number,
  siblingCount = 1,
): PageToken[] {
  if (total <= 0) return [];

  const totalVisible = siblingCount * 2 + 5;
  if (total <= totalVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(current - siblingCount, 1);
  const rightSibling = Math.min(current + siblingCount, total);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < total - 1;

  const tokens: PageToken[] = [1];

  if (showLeftEllipsis) tokens.push("ellipsis");
  else if (leftSibling === 2) tokens.push(2);

  for (let page = Math.max(leftSibling, 2); page <= Math.min(rightSibling, total - 1); page++) {
    tokens.push(page);
  }

  if (showRightEllipsis) tokens.push("ellipsis");
  else if (rightSibling === total - 1) tokens.push(total - 1);

  tokens.push(total);

  return tokens;
}
