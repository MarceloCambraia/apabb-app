import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Projetos from "./pages/Projetos";
import Marketplace from "./pages/Marketplace";
import Voluntariado from "./pages/Voluntariado";
import Associar from "./pages/Associar";
import Doar from "./pages/Doar";
import Auth from "./pages/Auth";
import ClubeBeneficios from "./pages/ClubeBeneficios";
import Noticias from "./pages/Noticias";
import Transparencia from "./pages/Transparencia";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/projetos" element={<Projetos />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/voluntariado" element={<Voluntariado />} />
            <Route path="/associar" element={<Associar />} />
            <Route path="/doar" element={<Doar />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/clube-beneficios" element={<ClubeBeneficios />} />
            <Route path="/noticias" element={<Noticias />} />
            <Route path="/transparencia" element={<Transparencia />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
