/** Kiểu dữ liệu dùng chung giữa /api/rsvp và trang admin quản lý RSVP. */

export type RsvpResponse = {
  id: string;
  name: string;
  attending: "yes" | "no";
  guests: number;
  message: string;
  createdAt: string;
};
