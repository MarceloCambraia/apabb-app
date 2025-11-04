import { Header } from "@/components/Header";
import { DonationSection } from "@/components/DonationSection";
import { Footer } from "@/components/Footer";

const Doar = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <DonationSection />
      </main>
      <Footer />
    </div>
  );
};

export default Doar;
