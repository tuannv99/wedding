/**
 * Thông tin tài khoản mừng cưới — CHỈ sửa ở đây khi có thông tin thật, không
 * lặp lại giá trị này ở component nào khác.
 *
 * `qrImage`: để `null` thì GiftModal tự vẽ một khung QR placeholder (không
 * phải ảnh QR thật, chỉ là ô giữ chỗ có viền nét đứt). Khi có ảnh QR thật:
 *   1. Bỏ file ảnh vào public/images/qr/ (ví dụ groom-qr.png)
 *   2. Đổi qrImage thành "/images/qr/groom-qr.png"
 * Ảnh QR có thể là ảnh chụp/export từ app ngân hàng, hoặc tạo qua VietQR
 * (https://vietqr.io) rồi tải ảnh PNG về bỏ vào thư mục trên — không tự động
 * generate QR từ số tài khoản ở đây vì cần đúng mã ngân hàng (BIN) thật.
 */
export type BankAccount = {
  displayName: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  qrImage: string | null;
};

// Hiện chỉ có 1 ảnh QR (của chú rể) — dùng chung cho cả hai khối theo yêu cầu,
// nên khối "Mai Hoa" thực chất vẫn chuyển khoản vào tài khoản Văn Tuấn. Khi có
// QR riêng của cô dâu, đổi qrImage + 3 field bên dưới của `bride` là đủ.
//
// Ảnh gốc do người dùng cung cấp (public/images/wedding/qr_chu_re.jpg) là ảnh
// dạng "story" mạng xã hội — có chữ tiêu đề + hình đồng xu trang trí phía
// trên/dưới khối QR thật. Khung hiển thị trong modal chỉ vuông ~168-188px,
// nên nếu dùng nguyên ảnh gốc (tỉ lệ dọc dài), QR sẽ bị object-contain co nhỏ
// lại rất nhiều, khó quét. Đã crop lại chỉ giữ khối QR (đã decode lại bằng
// jsQR để xác nhận vẫn ra đúng payload VietQR như ảnh gốc, không mất dữ liệu)
// và lưu ở đây theo đúng quy ước "public/images/qr/" của file này.
const SHARED_QR_IMAGE = "/images/qr/shared-qr.png";

export const weddingBankAccounts: { groom: BankAccount; bride: BankAccount } = {
  groom: {
    displayName: "Văn Tuấn",
    bankName: "Techcombank",
    // Không để dấu cách: đây là giá trị nút "Sao chép số tài khoản" copy
    // thẳng ra clipboard — để cách có thể khiến một số app ngân hàng dán
    // vào ô số tài khoản bị lỗi. Ảnh QR vẫn hiện số có cách để dễ đọc.
    accountNumber: "19038078381017",
    accountName: "NGUYEN VAN TUAN",
    qrImage: SHARED_QR_IMAGE,
  },
  bride: {
    displayName: "Mai Hoa",
    bankName: "Techcombank",
    // Không để dấu cách: đây là giá trị nút "Sao chép số tài khoản" copy
    // thẳng ra clipboard — để cách có thể khiến một số app ngân hàng dán
    // vào ô số tài khoản bị lỗi. Ảnh QR vẫn hiện số có cách để dễ đọc.
    accountNumber: "19038078381017",
    accountName: "NGUYEN VAN TUAN",
    qrImage: SHARED_QR_IMAGE,
  },
};
