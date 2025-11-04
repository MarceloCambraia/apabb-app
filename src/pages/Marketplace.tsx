import { Header } from "@/components/Header";
import { MarketplaceSection } from "@/components/MarketplaceSection";
import { Footer } from "@/components/Footer";

const Marketplace = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <MarketplaceSection />
      </main>
      <Footer />
    </div>
  );
};

export default Marketplace;
