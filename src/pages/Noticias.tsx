import { Header } from "@/components/Header";
import { NewsSection } from "@/components/NewsSection";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";

const Noticias = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-24 md:pb-0">
        <NewsSection />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Noticias;
