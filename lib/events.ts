/** Sự kiện phát ra khi khách bấm "MỞ THIỆP" — MusicPlayer lắng nghe để bật nhạc. */
export const OPEN_INVITATION_EVENT = "wedding:open-invitation";

export function emitOpenInvitation() {
  window.dispatchEvent(new Event(OPEN_INVITATION_EVENT));
}
