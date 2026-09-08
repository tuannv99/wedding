import { Navigation } from "@/components/wedding/Navigation";
import { Hero } from "@/components/wedding/Hero";
import { OurStory } from "@/components/wedding/OurStory";
import { WeddingDetails } from "@/components/wedding/WeddingDetails";
import { Countdown } from "@/components/wedding/Countdown";
import { Timeline } from "@/components/wedding/Timeline";
import { Gallery } from "@/components/wedding/Gallery";
import { RSVP } from "@/components/wedding/RSVP";
import { Closing } from "@/components/wedding/Closing";
import { AfterOpen } from "@/components/wedding/AfterOpen";

export default function Home() {
  return (
    <>
      <Navigation />
      <main id="main">
        <Hero />
        <AfterOpen>
          <OurStory />
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
