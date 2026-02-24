"use client";

import FeatureParallaxScroll from "@/components/home/FeatureParallaxScroll";
import Footer from "@/components/home/Footer";
import GetStartedSection from "@/components/home/GetStartedSection";
import PricingSection from "@/components/home/PricingSection";
import ReviewMarquee from "@/components/home/ReviewMarquee";
import Hero from "@/components/home/Hero";
import ValueProposition from "@/components/home/ValueProposition";

export default function Home() {
  return (
    <div className="bg-black min-h-screen font-sans selection:bg-[#00AE43] selection:text-white">
      {/* <CustomCursor /> */}
      <Hero />
      <ValueProposition />
      <FeatureParallaxScroll />
      <ReviewMarquee />
      <PricingSection />
      <GetStartedSection />
      <Footer />
    </div>
  );
}
