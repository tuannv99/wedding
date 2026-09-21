import type { Metadata } from "next";
import { CreateLinkForm } from "@/app/create-link/CreateLinkForm";

/** Công cụ nội bộ, không phải trang khách xem — không cần Google index. */
export const metadata: Metadata = {
  title: "Tạo link gửi thiệp",
  robots: { index: false, follow: false },
};

export default function CreateLinkPage() {
  return <CreateLinkForm />;
}
