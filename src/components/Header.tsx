import { Button } from "@/components/ui/button";
import { Heart, User, LogOut, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import apabbLogo from "@/assets/apabb-logo.jpg";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { isAdmin } = useUserRole();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const firstName =
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.user_metadata?.name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "";

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={apabbLogo} alt="APABB" className="w-10 h-10" />
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-primary">APABB</h1>
            {user ? (
              <p className="text-xs font-medium text-[#F39C12]">Olá, {firstName}!</p>
            ) : (
              <p className="text-xs text-muted-foreground">Transformando vidas</p>
            )}
          </div>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-smooth">
            Início
          </Link>
          <Link to="/projetos" className="text-sm font-medium hover:text-primary transition-smooth">
            Projetos
          </Link>
          <Link to="/marketplace" className="text-sm font-medium hover:text-primary transition-smooth">
            Marketplace
          </Link>
          <Link to="/voluntariado" className="text-sm font-medium hover:text-primary transition-smooth">
            Voluntariado
          </Link>
          <Link to="/noticias" className="text-sm font-medium hover:text-primary transition-smooth">
            Notícias
          </Link>
          <Link to="/associar" className="text-sm font-medium hover:text-primary transition-smooth">
            Associar-se
          </Link>
        </nav>
        
        <div className="flex items-center gap-2">
          <Link to="/doar" className="hidden md:flex">
            <Button variant="yellow" size="sm">
              <Heart className="w-4 h-4" />
              Doar
            </Button>
          </Link>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/perfil')}>
                  <User className="w-4 h-4 mr-2" />
                  Meu Perfil
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    <Shield className="w-4 h-4 mr-2" />
                    Dashboard Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>
            </Link>
          )}
          
        </div>
      </div>
    </header>
  );
}