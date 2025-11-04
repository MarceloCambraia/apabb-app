import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Users, Award, Newspaper, FileText } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        
        <section className="py-16 px-4 bg-background">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Conheça a APABB</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore nossas iniciativas e faça parte da transformação de vidas
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Heart className="w-10 h-10 text-primary mb-2" />
                  <CardTitle>Doar</CardTitle>
                  <CardDescription>
                    Sua doação transforma vidas e fortalece nossos projetos sociais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/doar">
                    <Button variant="yellow" className="w-full">
                      Fazer uma doação
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <FileText className="w-10 h-10 text-primary mb-2" />
                  <CardTitle>Projetos</CardTitle>
                  <CardDescription>
                    Conheça nossos projetos em 15 capitais do Brasil
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/projetos">
                    <Button variant="outline" className="w-full">
                      Ver projetos
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <ShoppingBag className="w-10 h-10 text-primary mb-2" />
                  <CardTitle>Marketplace</CardTitle>
                  <CardDescription>
                    Compre produtos que apoiam a causa social
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/marketplace">
                    <Button variant="outline" className="w-full">
                      Acessar marketplace
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Award className="w-10 h-10 text-primary mb-2" />
                  <CardTitle>Clube de Benefícios</CardTitle>
                  <CardDescription>
                    Vantagens exclusivas para doadores e parceiros
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/clube-beneficios">
                    <Button variant="outline" className="w-full">
                      Conhecer benefícios
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Users className="w-10 h-10 text-primary mb-2" />
                  <CardTitle>Voluntariado</CardTitle>
                  <CardDescription>
                    Seja um voluntário e contribua com seu tempo e talento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/voluntariado">
                    <Button variant="outline" className="w-full">
                      Quero ser voluntário
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Newspaper className="w-10 h-10 text-primary mb-2" />
                  <CardTitle>Notícias</CardTitle>
                  <CardDescription>
                    Fique por dentro das novidades e eventos da APABB
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/noticias">
                    <Button variant="outline" className="w-full">
                      Ver notícias
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 text-center">
              <Link to="/associar">
                <Button size="lg" variant="yellow">
                  Associar-se à APABB
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
