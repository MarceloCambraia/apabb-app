import { Header } from "@/components/Header";
import { VolunteerSection } from "@/components/VolunteerSection";
import { Footer } from "@/components/Footer";

const Voluntariado = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <VolunteerSection />
      </main>
      <Footer />
    </div>
  );
};

export default Voluntariado;
