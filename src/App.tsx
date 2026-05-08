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
import Profile from "./pages/Profile";import ClubeBeneficios from "./pages/ClubeBeneficios";
import Noticias from "./pages/Noticias";
import Transparencia from "./pages/Transparencia";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import DocumentoVisao from "./pages/DocumentoVisao";
import { RequireVolunteerAdmin } from "@/components/admin/RequireVolunteerAdmin";
import { VolunteerAdminLayout } from "@/components/admin/VolunteerAdminLayout";
import VoluntariosDashboard from "./pages/admin/VoluntariosDashboard";
import VoluntariosCadastros from "./pages/admin/VoluntariosCadastros";
import VoluntariosOportunidades from "./pages/admin/VoluntariosOportunidades";
import VoluntariosProjetos from "./pages/admin/VoluntariosProjetos";
import VoluntariosCoordenadores from "./pages/admin/VoluntariosCoordenadores";

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
            <Route path="/perfil" element={<Profile />} />
            <Route path="/clube-beneficios" element={<ClubeBeneficios />} />
            <Route path="/noticias" element={<Noticias />} />
            <Route path="/transparencia" element={<Transparencia />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route element={<RequireVolunteerAdmin />}>
              <Route path="/admin/voluntarios" element={<VolunteerAdminLayout />}>
                <Route index element={<VoluntariosDashboard />} />
                <Route path="cadastros" element={<VoluntariosCadastros />} />
                <Route path="oportunidades" element={<VoluntariosOportunidades />} />
                <Route path="projetos" element={<VoluntariosProjetos />} />
                <Route element={<RequireVolunteerAdmin adminOnly />}>
                  <Route path="coordenadores" element={<VoluntariosCoordenadores />} />
                </Route>
              </Route>
            </Route>
            <Route path="/documento-visao" element={<DocumentoVisao />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
