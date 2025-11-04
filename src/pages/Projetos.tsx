import { Header } from "@/components/Header";
import { ProjectsSection } from "@/components/ProjectsSection";
import { Footer } from "@/components/Footer";

const Projetos = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <ProjectsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Projetos;
