import { Header } from "@/components/Header";
import { ProjectsSection } from "@/components/ProjectsSection";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";

const Projetos = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-24 md:pb-0">
        <ProjectsSection />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Projetos;
