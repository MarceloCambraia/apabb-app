import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ExternalLink, Newspaper, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  link: string;
  image: string;
  nucleus?: string;
}

const NUCLEOS = [
  "Todos",
  "Porto Alegre",
  "Florianópolis", 
  "Curitiba",
  "São Paulo",
  "Rio de Janeiro",
  "Vitória",
  "Belo Horizonte",
  "Brasília",
  "Goiânia",
  "Salvador",
  "Aracaju",
  "Recife",
  "Natal",
  "Fortaleza",
  "Belém"
];

export function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNucleus, setSelectedNucleus] = useState("Todos");

  const filteredNews = selectedNucleus === "Todos" 
    ? news 
    : news.filter(item => item.nucleus?.toLowerCase().includes(selectedNucleus.toLowerCase()));

  useEffect(() => {
    async function fetchNews() {
      try {
        const { data, error } = await supabase.functions.invoke('fetch-apabb-news');
        
        if (error) {
          console.error('Error fetching news:', error);
          return;
        }

        if (data?.success && data?.data) {
          setNews(data.data);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, []);

  const handleOpenNews = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="noticias" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Newspaper className="w-4 h-4 mr-2" />
            Notícias APABB
          </Badge>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Últimas Notícias
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Acompanhe as novidades e conquistas da APABB em todo o Brasil
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Filtrar por Núcleo:</span>
          </div>
          <Select value={selectedNucleus} onValueChange={setSelectedNucleus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecione um núcleo" />
            </SelectTrigger>
            <SelectContent>
              {NUCLEOS.map((nucleo) => (
                <SelectItem key={nucleo} value={nucleo}>
                  {nucleo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Nenhuma notícia encontrada para o núcleo {selectedNucleus}.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setSelectedNucleus("Todos")}
            >
              Ver todas as notícias
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((item) => (
              <Card 
                key={item.id} 
                className="overflow-hidden shadow-soft hover:shadow-medium transition-smooth cursor-pointer group"
                onClick={() => handleOpenNews(item.link)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = 'https://www.apabb.org.br/skin/img/temp/apabb_noticias.jpg';
                    }}
                  />
                  {item.nucleus && (
                    <Badge className="absolute top-4 left-4 bg-secondary text-secondary-foreground">
                      {item.nucleus}
                    </Badge>
                  )}
                </div>
                
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {item.excerpt}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Button variant="donation" className="w-full">
                    Ler Notícia
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => window.open('https://www.apabb.org.br/noticias/', '_blank', 'noopener,noreferrer')}
          >
            Ver Todas as Notícias no Site APABB
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
