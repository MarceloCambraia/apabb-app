import { Header } from "@/components/Header";
import { AssociateSignupSection } from "@/components/AssociateSignupSection";
import { Footer } from "@/components/Footer";

const Associar = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <AssociateSignupSection />
      </main>
      <Footer />
    </div>
  );
};

export default Associar;
