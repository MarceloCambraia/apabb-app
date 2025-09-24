import { Button } from "@/components/ui/button";
import { Heart, Users, Target, Star } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";

export function Hero() {
  return (
    <section id="inicio" className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBanner})` }}
      >
        <div className="absolute inset-0 gradient-hero opacity-80"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Transforme vidas com sua
            <span className="block text-secondary drop-shadow-lg">doação recorrente</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto leading-relaxed">
            Junte-se à APABB e faça parte de uma comunidade que acredita na inclusão e no apoio às pessoas com deficiência
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="hero" size="xl" className="text-lg">
              <Heart className="w-5 h-5" />
              Começar a Doar
            </Button>
            <Button variant="outline" size="xl" className="text-lg border-white text-white hover:bg-white hover:text-primary">
              <Users className="w-5 h-5" />
              Saiba Mais
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary mb-2">2.5K+</div>
              <div className="text-sm text-white/80">Doadores Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary mb-2">15K+</div>
              <div className="text-sm text-white/80">Vidas Impactadas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary mb-2">95%</div>
              <div className="text-sm text-white/80">Transparência</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary mb-2">8</div>
              <div className="text-sm text-white/80">Anos de Impacto</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 text-secondary/20 hidden lg:block">
        <Heart className="w-16 h-16 animate-pulse" />
      </div>
      <div className="absolute bottom-20 right-10 text-secondary/20 hidden lg:block">
        <Star className="w-12 h-12 animate-bounce" />
      </div>
    </section>
  );
}