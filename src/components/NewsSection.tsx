import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ArrowRight, ExternalLink, Newspaper } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  link: string;
  image: string;
  nucleus?: string;
}

export function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
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
