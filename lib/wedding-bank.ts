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

export const weddingBankAccounts: { groom: BankAccount; bride: BankAccount } = {
  groom: {
    displayName: "Văn Tuấn",
    bankName: "GROOM_BANK",
    accountNumber: "GROOM_ACCOUNT",
    accountName: "GROOM_ACCOUNT_NAME",
    qrImage: null,
  },
  bride: {
    displayName: "Mai Hoa",
    bankName: "BRIDE_BANK",
    accountNumber: "BRIDE_ACCOUNT",
    accountName: "BRIDE_ACCOUNT_NAME",
    qrImage: null,
  },
};
