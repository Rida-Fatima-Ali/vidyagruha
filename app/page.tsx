"use client";

import LandingNavbar    from "@/components/landing/LandingNavbar";
import HeroSection      from "@/components/landing/HeroSection";
import AboutSection     from "@/components/landing/AboutSection";
import WhyCampusSection from "@/components/landing/WhyCampusSection";
import FinalCTASection  from "@/components/landing/FinalCTASection";

export default function HomePage() {
  return (
    <main
      style={{
        width: "100vw",
        maxWidth: "100vw",
        overflowX: "hidden",
        backgroundColor: "#000",
        color: "#fff",
      }}
    >
      <LandingNavbar />
      <HeroSection />
      <AboutSection />
      <WhyCampusSection />
      <FinalCTASection />
    </main>
  );
}
