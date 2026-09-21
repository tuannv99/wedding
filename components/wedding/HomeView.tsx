import { Navigation } from "@/components/wedding/Navigation";
import { Hero } from "@/components/wedding/Hero";
import { OurStory } from "@/components/wedding/OurStory";
import { Couple } from "@/components/wedding/Couple";
import { WeddingDetails } from "@/components/wedding/WeddingDetails";
import { Countdown } from "@/components/wedding/Countdown";
import { Timeline } from "@/components/wedding/Timeline";
import { Gallery } from "@/components/wedding/Gallery";
import { RSVP } from "@/components/wedding/RSVP";
import { Closing } from "@/components/wedding/Closing";
import { AfterOpen } from "@/components/wedding/AfterOpen";

type HomeViewProps = {
  /** Tên khách mời lấy từ URL cá nhân hoá /[guest] — bỏ trống ở URL mặc định "/". */
  guestName?: string;
  /** Lời chào trước tên, ví dụ "Gửi bạn yêu" — xem data/guests.ts. */
  guestGreeting?: string;
};

/** Toàn bộ nội dung thiệp — dùng chung cho URL mặc định "/" và URL cá nhân hoá "/[guest]". */
export function HomeView({ guestName, guestGreeting }: HomeViewProps) {
  return (
    <>
      <Navigation />
      <main id="main">
        <Hero guestName={guestName} guestGreeting={guestGreeting} />
        <AfterOpen>
          <OurStory />
          <Couple />
          <WeddingDetails />
          <Countdown />
          <Timeline />
          <Gallery />
          <RSVP />
          <Closing />
        </AfterOpen>
      </main>
    </>
  );
}
