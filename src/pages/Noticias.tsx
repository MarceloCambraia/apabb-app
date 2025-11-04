import { Header } from "@/components/Header";
import { NewsSection } from "@/components/NewsSection";
import { Footer } from "@/components/Footer";

const Noticias = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <NewsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Noticias;
