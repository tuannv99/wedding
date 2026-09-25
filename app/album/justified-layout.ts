/**
 * Thuật toán xếp hàng cho phần "xem tổng thể" ở /album — kiểu "justified
 * grid" (cách Flickr/Google Photos hay dùng), KHÔNG phải masonry và KHÔNG
 * phải lưới cột cố định.
 *
 * Ý tưởng: đi qua ảnh ĐÚNG THỨ TỰ, cộng dồn bề ngang của chúng (tỉ lệ thật
 * của từng ảnh × một chiều cao mục tiêu) tới khi vừa đủ bề ngang khung chứa,
 * rồi tính lại chiều cao CHÍNH XÁC của hàng đó sao cho các ảnh vừa khít bề
 * ngang — không ảnh nào bị cắt, chỉ có chiều cao hàng co giãn theo tỉ lệ ảnh.
 *
 * Vì input chỉ cần `ratio` (rộng/cao) của từng ảnh và bề rộng khung chứa,
 * hàm này chạy đúng với bất kỳ số lượng ảnh nào — không có gì viết riêng cho
 * con số 37 của bộ ảnh hiện tại.
 */

export type JustifiedRow<T> = {
  key: string;
  /** Chiều cao chung của cả hàng, tính bằng px. */
  height: number;
  items: { tile: T; width: number }[];
};

/**
 * Nhịp cao/thấp của các hàng liên tiếp, lặp lại theo CHỈ SỐ HÀNG (không theo
 * tổng số ảnh) — hàng nào rơi vào một số lớn hơn trong mảng này thì cao hơn,
 * nên chứa được ít ảnh hơn và mỗi ảnh trong đó được nhấn hơn. Đây là thứ duy
 * nhất viết tay trong cả thuật toán, và nó áp dụng y hệt cho 12 ảnh lẫn 137
 * ảnh — không phải một pattern cắt riêng cho đúng 37 ảnh.
 */
const ROW_RHYTHM = [1.15, 0.8, 1, 1.4, 0.85, 1.05, 0.75] as const;

/** Chiều cao "mục tiêu" của một hàng thường (trước khi nhân với nhịp), theo bề rộng khung. */
function baseHeightFor(containerWidth: number): number {
  if (containerWidth < 560) return 168;
  if (containerWidth < 860) return 228;
  return 300;
}

/** Khoảng cách giữa các ảnh — cùng một giá trị dùng cho cả gutter ngang lẫn dọc. */
export function gapFor(containerWidth: number): number {
  if (containerWidth < 560) return 8;
  if (containerWidth < 860) return 10;
  return 16;
}

/** Số ảnh tối đa nhồi vào một hàng — chặn trên để hàng không vụn thành quá nhiều ảnh nhỏ. */
function maxPerRowFor(containerWidth: number): number {
  if (containerWidth < 560) return 3;
  if (containerWidth < 860) return 4;
  return 6;
}

export function justifyRows<T extends { ratio: number }>(
  tiles: readonly T[],
  containerWidth: number,
): JustifiedRow<T>[] {
  if (containerWidth <= 0 || tiles.length === 0) return [];

  const gap = gapFor(containerWidth);
  const maxPerRow = maxPerRowFor(containerWidth);
  const base = baseHeightFor(containerWidth);

  const rows: JustifiedRow<T>[] = [];
  let i = 0;
  let rowIndex = 0;

  while (i < tiles.length) {
    const targetHeight = base * ROW_RHYTHM[rowIndex % ROW_RHYTHM.length];

    // Nhồi ảnh vào hàng hiện tại tới khi vừa đủ bề ngang khung (luôn lấy ít
    // nhất một ảnh, kể cả khi một mình nó đã vượt bề ngang — hàng đó sẽ tự co
    // chiều cao lại ở bước tính rowHeight bên dưới).
    let count = 0;
    let sumRatio = 0;
    while (i + count < tiles.length && count < maxPerRow) {
      const candidateRatio = tiles[i + count].ratio;
      const candidateSum = sumRatio + candidateRatio;
      const candidateWidth = candidateSum * targetHeight + count * gap;
      if (count > 0 && candidateWidth > containerWidth) break;
      sumRatio = candidateSum;
      count += 1;
    }

    const slice = tiles.slice(i, i + count);
    const isLastRow = i + count >= tiles.length;
    const totalGap = (count - 1) * gap;
    let rowHeight = (containerWidth - totalGap) / sumRatio;

    // Hàng cuối nếu chỉ còn lại quá ít ảnh thì đừng kéo giãn cho khớp hết bề
    // ngang — giữ đúng chiều cao mục tiêu và để trống phần thừa bên phải,
    // tránh cảnh vài ảnh cuối cùng bị phóng to bất thường.
    if (isLastRow && rowHeight > targetHeight * 1.35) {
      rowHeight = targetHeight;
    }
    rowHeight = Math.max(110, Math.min(rowHeight, base * 1.9));

    rows.push({
      key: `row-${i}`,
      height: rowHeight,
      items: slice.map((tile) => ({ tile, width: tile.ratio * rowHeight })),
    });

    i += count;
    rowIndex += 1;
  }

  return rows;
}
