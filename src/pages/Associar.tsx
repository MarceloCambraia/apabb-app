import { Header } from "@/components/Header";
import { AssociateSignupSection } from "@/components/AssociateSignupSection";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";

const Associar = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-24 md:pb-0">
        <AssociateSignupSection />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Associar;
