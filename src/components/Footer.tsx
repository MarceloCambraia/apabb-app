import { Button } from "@/components/ui/button";
import { Heart, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react";
import apabbLogo from "@/assets/apabb-logo.png";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Logo e Descrição */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src={apabbLogo} alt="APABB" className="w-12 h-12 filter brightness-0 invert" />
              <div>
                <h3 className="text-xl font-bold">APABB</h3>
                <p className="text-primary-foreground/80 text-sm">Transformando vidas</p>
              </div>
            </div>
            <p className="text-primary-foreground/90 mb-6 max-w-md leading-relaxed">
              Há 38 anos promovendo os direitos das pessoas com deficiência e suas famílias em 15 capitais brasileiras. 
              Atuamos na inclusão social, acessibilidade, formação cidadã e convivência comunitária.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" size="icon" className="rounded-full">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Instagram className="w-4 h-4" />
              </Button>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Twitter className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Links Rápidos */}
          <div>
            <h4 className="font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li>
                <a href="#inicio" className="hover:text-secondary transition-smooth">
                  Início
                </a>
              </li>
              <li>
                <a href="#projetos" className="hover:text-secondary transition-smooth">
                  Projetos Regionais
                </a>
              </li>
              <li>
                <a href="#marketplace" className="hover:text-secondary transition-smooth">
                  Marketplace
                </a>
              </li>
              <li>
                <a href="#voluntariado" className="hover:text-secondary transition-smooth">
                  Voluntariado
                </a>
              </li>
              <li>
                <a href="#associar" className="hover:text-secondary transition-smooth">
                  Associar-se
                </a>
              </li>
              <li>
                <a href="#noticias" className="hover:text-secondary transition-smooth">
                  Notícias
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contato */}
          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <div className="space-y-3 text-primary-foreground/80">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-secondary" />
                <span className="text-sm">(61) 3344-1234</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-secondary" />
                <span className="text-sm">contato@apabb.org.br</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-secondary mt-0.5" />
                <span className="text-sm">
                  SGAS 915, Lote 72<br />
                  Brasília - DF, 70390-150
                </span>
              </div>
            </div>
          </div>
          
        </div>
        
        {/* Linha de Separação */}
        <div className="border-t border-primary-foreground/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-primary-foreground/70 text-sm">
              © 2024 APABB. Todos os direitos reservados.
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-primary-foreground/70">Feito com</span>
              <Heart className="w-4 h-4 text-secondary" />
              <span className="text-primary-foreground/70">para transformar vidas</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}