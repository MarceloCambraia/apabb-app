import { Header } from "@/components/Header";
import { DonationSection } from "@/components/DonationSection";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Doar = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <DonationSection />
      </main>
      <Footer />
    </div>
  );
};

export default Doar;
