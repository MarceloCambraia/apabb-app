import { Header } from "@/components/Header";
import { MarketplaceSection } from "@/components/MarketplaceSection";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";

const Marketplace = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-24 md:pb-0">
        <MarketplaceSection />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Marketplace;
