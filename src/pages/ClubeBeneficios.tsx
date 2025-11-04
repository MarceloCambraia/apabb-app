import { Header } from "@/components/Header";
import { ClubeBenefits } from "@/components/ClubeBenefits";
import { Footer } from "@/components/Footer";

const ClubeBeneficios = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <ClubeBenefits />
      </main>
      <Footer />
    </div>
  );
};

export default ClubeBeneficios;
