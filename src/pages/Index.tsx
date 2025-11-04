import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { DonationSection } from "@/components/DonationSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { ClubeBenefits } from "@/components/ClubeBenefits";
import { MarketplaceSection } from "@/components/MarketplaceSection";
import { NewsSection } from "@/components/NewsSection";
import { VolunteerSection } from "@/components/VolunteerSection";
import { AssociateSignupSection } from "@/components/AssociateSignupSection";
import { TransparencySection } from "@/components/TransparencySection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <DonationSection />
        <ProjectsSection />
        <ClubeBenefits />
        <MarketplaceSection />
        <NewsSection />
        <VolunteerSection />
        <AssociateSignupSection />
        <TransparencySection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
