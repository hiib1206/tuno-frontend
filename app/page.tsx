"use client";

import FeaturesBento from "@/components/home/FeaturesBento";
import Footer from "@/components/home/Footer";
import Header from "@/components/home/Header";
import HeroSection from "@/components/home/HeroSection";
import HowItWorks from "@/components/home/HowItWorks";
import MarqueeTicker from "@/components/home/MarqueeTicker";
import TrustStats from "@/components/home/TrustStats";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-[var(--color-accent)] selection:text-[var(--color-accent-foreground)]">
      <Header />
      <HeroSection />
      <MarqueeTicker />
      <FeaturesBento />
      <HowItWorks />
      <TrustStats />
      <Footer />
    </main>
  );
}
