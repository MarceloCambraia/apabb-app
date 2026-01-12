import { Button } from "@/components/ui/button";
import { Heart, Users, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

// Import all hero images
import heroSlide1 from "@/assets/hero-slide-1.jpg";
import heroSlide2 from "@/assets/hero-slide-2.jpg";
import heroSlide3 from "@/assets/hero-slide-3.jpg";
import heroSlide4 from "@/assets/hero-slide-4.jpg";
import heroSlide5 from "@/assets/hero-slide-5.jpg";

const heroImages = [
  { src: heroSlide1, alt: "APABB - 100 Melhores ONGs do Brasil" },
  { src: heroSlide2, alt: "APABB - Relatório de Atividades" },
  { src: heroSlide3, alt: "APABB - Doe pontos Livelo" },
  { src: heroSlide4, alt: "APABB - Uma das melhores ONGs" },
  { src: heroSlide5, alt: "APABB - Encontros de Famílias" },
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    setTimeout(() => setIsTransitioning(false), 700);
  }, [isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
    setTimeout(() => setIsTransitioning(false), 700);
  }, [isTransitioning]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 700);
  }, [isTransitioning, currentSlide]);

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <section id="inicio" className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Images Carousel */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
            style={{ backgroundImage: `url(${image.src})` }}
            aria-hidden={index !== currentSlide}
          />
        ))}
        <div className="absolute inset-0 gradient-hero opacity-80"></div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 z-20 p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-300 text-white hidden md:flex items-center justify-center"
        aria-label="Imagem anterior"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 z-20 p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-300 text-white hidden md:flex items-center justify-center"
        aria-label="Próxima imagem"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-secondary w-6"
                : "bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Ir para imagem ${index + 1}`}
            aria-current={index === currentSlide ? "true" : "false"}
          />
        ))}
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Transforme vidas com sua
            <span className="block text-secondary drop-shadow-lg">doação recorrente</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto leading-relaxed">
            Há 38 anos promovendo inclusão e dignidade para pessoas com deficiência em 15 capitais brasileiras
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="outline" size="xl" className="text-lg border-primary text-primary hover:bg-white hover:scale-105 transition-bounce shadow-medium">
              <Heart className="w-5 h-5" />
              Começar a Doar
            </Button>
            <Button variant="hero" size="xl" className="text-lg">
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
              <div className="text-3xl font-bold text-secondary mb-2">38</div>
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
