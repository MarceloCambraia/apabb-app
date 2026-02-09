import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { MapPin, Target, CheckCircle, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const nucleusNames: Record<string, string> = {
  df: 'Brasília - DF', sp: 'São Paulo - SP', rj: 'Rio de Janeiro - RJ',
  mg: 'Belo Horizonte - MG', rs: 'Porto Alegre - RS', ba: 'Salvador - BA',
  pr: 'Curitiba - PR', ce: 'Fortaleza - CE', pe: 'Recife - PE',
  go: 'Goiânia - GO', pa: 'Belém - PA', sc: 'Florianópolis - SC',
  es: 'Vitória - ES', rn: 'Natal - RN', se: 'Aracaju - SE',
};

export function ProjectsSection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['public-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'ativo')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: myRegistrations } = useQuery({
    queryKey: ['my-registrations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('project_registrations')
        .select('project_id')
        .eq('user_id', user.id);
      if (error) throw error;
      return data.map((r) => r.project_id);
    },
    enabled: !!user,
  });

  const registerMutation = useMutation({
    mutationFn: async (projectId: string) => {
      if (!user) throw new Error('Login necessário');
      const { error } = await supabase.from('project_registrations').insert({
        project_id: projectId,
        user_id: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
      toast({ title: 'Inscrição realizada com sucesso!' });
    },
    onError: (err: any) => toast({ title: 'Erro na inscrição', description: err.message, variant: 'destructive' }),
  });

  const handleRegister = (projectId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    registerMutation.mutate(projectId);
  };

  return (
    <section id="projetos" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Target className="w-4 h-4 mr-2" />
            Projetos Regionais
          </Badge>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Projetos em Todo o Brasil
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Conheça as iniciativas desenvolvidas pelos nossos núcleos regionais em 15 capitais brasileiras
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64" />)}
          </div>
        ) : !projects?.length ? (
          <p className="text-center text-muted-foreground py-12">Nenhum projeto disponível no momento.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const isRegistered = myRegistrations?.includes(project.id);
              return (
                <Card key={project.id} className="shadow-soft hover:shadow-medium transition-smooth flex flex-col">
                  {project.image_url && (
                    <div className="h-48 overflow-hidden rounded-t-lg">
                      <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">Ativo</Badge>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        <MapPin className="w-3 h-3" />
                        <span>{nucleusNames[project.nucleus] || project.nucleus}</span>
                      </div>
                    </div>
                    <CardTitle className="text-xl">{project.title}</CardTitle>
                    <CardDescription className="line-clamp-3">{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    {project.max_slots && (
                      <p className="text-xs text-muted-foreground mb-3">Vagas: {project.max_slots}</p>
                    )}
                    {isRegistered ? (
                      <Button variant="outline" className="w-full" disabled>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Inscrição Realizada
                      </Button>
                    ) : (
                      <Button className="w-full" onClick={() => handleRegister(project.id)} disabled={registerMutation.isPending}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Quero me Inscrever
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
