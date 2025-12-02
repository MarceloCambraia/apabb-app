import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  link: string;
  image: string;
  nucleus?: string;
  date?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching news from APABB website...');
    
    const response = await fetch('https://www.apabb.org.br/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch APABB website: ${response.status}`);
    }

    const html = await response.text();
    console.log('HTML fetched successfully, parsing news...');

    // Parse news items from HTML
    const newsItems: NewsItem[] = [];
    
    // Pattern to match news items in the destaques section
    const newsPattern = /<div class="item"[^>]*data-href="(https:\/\/www\.apabb\.org\.br\/(?:nucleos\/[^/]+\/)?noticias\/[^"]+)"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[\s\S]*?<\/div>/gi;
    
    // Alternative pattern for news links
    const linkPattern = /<a[^>]*href="(https:\/\/www\.apabb\.org\.br\/(?:nucleos\/([^/]+)\/)?noticias\/([^"]+))"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[\s\S]*?<\/a>/gi;
    
    let match;
    const seenLinks = new Set<string>();
    
    // Try to extract news from link pattern
    while ((match = linkPattern.exec(html)) !== null && newsItems.length < 12) {
      const [, link, nucleus, , image, title] = match;
      
      if (seenLinks.has(link) || !title || title.length < 10) continue;
      seenLinks.add(link);
      
      // Clean up the title
      const cleanTitle = title.trim().replace(/\s+/g, ' ');
      if (cleanTitle.length < 10) continue;
      
      newsItems.push({
        id: `news-${newsItems.length + 1}`,
        title: cleanTitle,
        excerpt: cleanTitle.substring(0, 150) + (cleanTitle.length > 150 ? '...' : ''),
        link,
        image: image.startsWith('http') ? image : `https://www.apabb.org.br${image}`,
        nucleus: nucleus ? `Núcleo ${nucleus.toUpperCase()}` : undefined,
      });
    }

    // Also extract from h2 followed by links
    const h2Pattern = /href="(https:\/\/www\.apabb\.org\.br\/(?:nucleos\/([^/]+)\/)?noticias\/[^"]+)"[^>]*>[\s\S]*?<h2[^>]*>([^<]+)<\/h2>/gi;
    
    while ((match = h2Pattern.exec(html)) !== null && newsItems.length < 12) {
      const [, link, nucleus, title] = match;
      
      if (seenLinks.has(link)) continue;
      seenLinks.add(link);
      
      const cleanTitle = title.trim().replace(/\s+/g, ' ');
      if (cleanTitle.length < 10) continue;
      
      // Find associated image
      const imageMatch = html.match(new RegExp(`<img[^>]*src="([^"]+)"[^>]*alt="${cleanTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'i'));
      const image = imageMatch ? imageMatch[1] : 'https://www.apabb.org.br/skin/img/temp/apabb_noticias.jpg';
      
      newsItems.push({
        id: `news-${newsItems.length + 1}`,
        title: cleanTitle,
        excerpt: cleanTitle.substring(0, 150) + (cleanTitle.length > 150 ? '...' : ''),
        link,
        image: image.startsWith('http') ? image : `https://www.apabb.org.br${image}`,
        nucleus: nucleus ? `Núcleo ${nucleus.toUpperCase()}` : undefined,
      });
    }

    // Hardcoded fallback news from the scraped data if parsing fails
    if (newsItems.length < 3) {
      const fallbackNews: NewsItem[] = [
        {
          id: 'news-1',
          title: 'Apabb é uma das 100 Melhores ONGs de 2025',
          excerpt: 'A Apabb foi reconhecida como uma das 100 melhores ONGs de 2025, destacando-se pelo trabalho de inclusão e apoio às pessoas com deficiência.',
          link: 'https://www.apabb.org.br/noticias/apabb-e-uma-das-100-melhores-ongs-de-2025-10319.html',
          image: 'https://www.apabb.org.br/arquivos/upload/home_banner/2025/11/17/rotativo_site_59_3.jpg',
        },
        {
          id: 'news-2',
          title: 'Apabb intensifica Encontros de Famílias nos últimos meses do ano',
          excerpt: 'A Apabb está intensificando os Encontros de Famílias em todo o país, promovendo integração e apoio às famílias de pessoas com deficiência.',
          link: 'https://www.apabb.org.br/noticias/apabb-intensifica-encontros-de-familias-nos-ultimos-meses-do-ano-pais-afora-10323.html',
          image: 'https://www.apabb.org.br/arquivos/upload/home_banner/2025/11/27/whatsapp-image-2025-11-27-at-08-30-20_57_3.jpeg',
        },
        {
          id: 'news-3',
          title: 'Apabb e Cassi fortalecem parceria para inclusão',
          excerpt: 'A Apabb, em parceria com a CASSI, lançou o projeto CASSI em Movimento para incentivo à prática de esportes por pessoas com deficiência.',
          link: 'https://www.apabb.org.br/noticias/apabb-e-cassi-fortalecem-parceria-para-inclusao-de-pessoas-com-deficiencia-10315.html',
          image: 'https://www.apabb.org.br/arquivos/upload/home_destaques/2025/10/28/apabb-cassi_82_10.jpeg',
        },
        {
          id: 'news-4',
          title: 'JENAF Inclusiva promovida pela Apabb e Fenabb',
          excerpt: 'Entre os dias 23 e 26 de outubro, Brasília foi palco da primeira edição da JENAF Inclusiva, evento histórico para o Banco do Brasil.',
          link: 'https://www.apabb.org.br/noticias/apabb-fenabb-e-diretoria-de-gestao-de-pessoas-do-bb-promovem-jenaf-inclusiva-10316.html',
          image: 'https://www.apabb.org.br/arquivos/upload/home_destaques/2025/10/28/whatsapp-image-2025-10-28-at-10-50-31_83_10.jpeg',
        },
        {
          id: 'news-5',
          title: 'Projeto Robótica da Apabb SC conquista premiação',
          excerpt: 'A Apabb Santa Catarina marcou presença no Challenge Robomind e obteve destaque com 1º e 2º lugar na competição.',
          link: 'https://www.apabb.org.br/nucleos/sc/noticias/projeto-robotica-da-apabb-sc-conquista-1-e-2-em-competicao-10320.html',
          image: 'https://www.apabb.org.br/arquivos/upload/noticias/2025/11/24/destaquesc_10320_35_thumb_3.jpg',
          nucleus: 'Núcleo Santa Catarina',
        },
        {
          id: 'news-6',
          title: 'Apabb Sergipe participa de ação de banho assistido',
          excerpt: 'A Apabb Sergipe, em parceria com a SETUR, promoveu ação de banho assistido na Praia da Cinelândia.',
          link: 'https://www.apabb.org.br/nucleos/se/noticias/apabb-sergipe-participa-de-acao-de-banho-assistido-na-praia-da-cinelandia-10322.html',
          image: 'https://www.apabb.org.br/arquivos/upload/noticias/2025/11/24/destque-se_10322_35_thumb_3.jpg',
          nucleus: 'Núcleo Sergipe',
        },
      ];
      
      newsItems.push(...fallbackNews.slice(0, 6 - newsItems.length));
    }

    console.log(`Successfully parsed ${newsItems.length} news items`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: newsItems,
        count: newsItems.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error fetching news:', error);
    
    // Return fallback data on error
    const fallbackNews: NewsItem[] = [
      {
        id: 'news-1',
        title: 'Apabb é uma das 100 Melhores ONGs de 2025',
        excerpt: 'A Apabb foi reconhecida como uma das 100 melhores ONGs de 2025.',
        link: 'https://www.apabb.org.br/noticias/apabb-e-uma-das-100-melhores-ongs-de-2025-10319.html',
        image: 'https://www.apabb.org.br/arquivos/upload/home_banner/2025/11/17/rotativo_site_59_3.jpg',
      },
      {
        id: 'news-2',
        title: 'Apabb intensifica Encontros de Famílias',
        excerpt: 'A Apabb está intensificando os Encontros de Famílias em todo o país.',
        link: 'https://www.apabb.org.br/noticias/apabb-intensifica-encontros-de-familias-nos-ultimos-meses-do-ano-pais-afora-10323.html',
        image: 'https://www.apabb.org.br/arquivos/upload/home_banner/2025/11/27/whatsapp-image-2025-11-27-at-08-30-20_57_3.jpeg',
      },
      {
        id: 'news-3',
        title: 'Apabb e Cassi fortalecem parceria',
        excerpt: 'A Apabb, em parceria com a CASSI, lançou o projeto CASSI em Movimento.',
        link: 'https://www.apabb.org.br/noticias/apabb-e-cassi-fortalecem-parceria-para-inclusao-de-pessoas-com-deficiencia-10315.html',
        image: 'https://www.apabb.org.br/arquivos/upload/home_destaques/2025/10/28/apabb-cassi_82_10.jpeg',
      },
    ];

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: fallbackNews,
        count: fallbackNews.length,
        fromCache: true
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  }
});
