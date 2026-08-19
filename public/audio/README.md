# Nhạc nền

File đang dùng: `mot-doi.mp3` ("Một Đời").

- Tên file + tiêu đề được cấu hình trong `lib/wedding.ts` (`wedding.music.src`, `wedding.music.title`).
- Nếu file lỗi hoặc thiếu, nút nhạc ở góc phải sẽ tự động ẩn.
- Đặt tên file không dấu, không khoảng trắng (URL an toàn).
- Nhạc không autoplay: chỉ phát sau khi khách bấm "MỞ THIỆP" hoặc bấm nút nhạc.
- Nên dùng bản mp3 nhẹ (< 3MB) và có bản quyền hợp lệ. File hiện tại ~13MB — có thể nén
  xuống 96–128kbps mono để khách dùng 3G/4G không tốn nhiều dung lượng:
  `ffmpeg -i mot-doi.mp3 -b:a 96k -ac 1 mot-doi-light.mp3`
