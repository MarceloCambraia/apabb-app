import { Button } from "@/components/ui/button";
import { Menu, Heart, User } from "lucide-react";
import apabbLogo from "@/assets/apabb-logo.png";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={apabbLogo} alt="APABB" className="w-10 h-10" />
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-primary">APABB</h1>
            <p className="text-xs text-muted-foreground">Transformando vidas</p>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="#inicio" className="text-sm font-medium hover:text-primary transition-smooth">
            Início
          </a>
          <a href="#sobre" className="text-sm font-medium hover:text-primary transition-smooth">
            Sobre
          </a>
          <a href="#clube" className="text-sm font-medium hover:text-primary transition-smooth">
            Clube do Doador
          </a>
          <a href="#transparencia" className="text-sm font-medium hover:text-primary transition-smooth">
            Transparência
          </a>
        </nav>
        
        <div className="flex items-center gap-2">
          <Button variant="yellow" size="sm" className="hidden sm:flex">
            <Heart className="w-4 h-4" />
            Doar
          </Button>
          <Button variant="ghost" size="icon">
            <User className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}