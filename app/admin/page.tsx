import { redirect } from "next/navigation";

/**
 * /admin không có nội dung riêng — chuyển thẳng sang trang quản lý lời chúc.
 * (Chưa đăng nhập thì middleware đã đá về /admin/login trước khi tới đây.)
 */
export default function AdminIndexPage() {
  redirect("/admin/wishes");
}
