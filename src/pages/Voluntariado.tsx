import { Header } from "@/components/Header";
import { VolunteerSection } from "@/components/VolunteerSection";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";

const Voluntariado = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-24 md:pb-0">
        <VolunteerSection />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Voluntariado;
