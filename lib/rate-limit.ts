/**
 * Giới hạn tần suất theo IP, lưu trong bộ nhớ của tiến trình — không cần
 * thêm dịch vụ ngoài (Redis/KV). Đủ dùng cho một site thiệp cưới lưu lượng
 * thấp, nhưng KHÔNG chính xác tuyệt đối trên serverless nhiều instance (mỗi
 * instance giữ state riêng) — đây là một lớp phòng thủ thêm bên cạnh
 * honeypot + kiểm tra thời gian điền form ở app/api/rsvp/route.ts, không
 * phải lớp chống spam duy nhất.
 */
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 5;
const MAX_TRACKED_KEYS = 5000;

const hitsByKey = new Map<string, number[]>();

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recentHits = (hitsByKey.get(key) ?? []).filter(
    (t) => now - t < WINDOW_MS,
  );
  recentHits.push(now);
  hitsByKey.set(key, recentHits);

  if (hitsByKey.size > MAX_TRACKED_KEYS) {
    for (const [k, timestamps] of hitsByKey) {
      if (timestamps.every((t) => now - t >= WINDOW_MS)) hitsByKey.delete(k);
    }
  }

  return recentHits.length > MAX_REQUESTS_PER_WINDOW;
}
