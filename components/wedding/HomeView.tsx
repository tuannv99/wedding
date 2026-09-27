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
import { DebugPanel } from "@/components/ui/DebugPanel";
import type { GuestInvitation } from "@/lib/guest-invitation";

type HomeViewProps = {
  /** Lời mời cá nhân hoá từ URL /[guest] — bỏ trống ở URL mặc định "/". Xem data/guests.ts. */
  invitation?: GuestInvitation;
};

/** Toàn bộ nội dung thiệp — dùng chung cho URL mặc định "/" và URL cá nhân hoá "/[guest]". */
export function HomeView({ invitation }: HomeViewProps) {
  return (
    <>
      <Navigation />
      <main id="main">
        <Hero invitation={invitation} />
        <AfterOpen>
          <Couple />
          <OurStory />
          <WeddingDetails />
          <Countdown />
          <Timeline />
          <Gallery />
          <RSVP />
          <Closing />
        </AfterOpen>
      </main>
      <DebugPanel />
    </>
  );
}
