import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { DonationSection } from "@/components/DonationSection";
import { ClubeBenefits } from "@/components/ClubeBenefits";
import { TransparencySection } from "@/components/TransparencySection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <DonationSection />
        <ClubeBenefits />
        <TransparencySection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
