import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { NUCLEUS_NAMES } from '@/lib/volunteer-constants';

export default function VoluntariosProjetos() {
  const { isAdmin, nucleus } = useUserRole();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-project-registrations', isAdmin, nucleus],
    queryFn: async () => {
      let projQ = supabase.from('projects').select('id, title, nucleus');
      if (!isAdmin && nucleus) projQ = projQ.eq('nucleus', nucleus);
      const { data: projects, error: pe } = await projQ;
      if (pe) throw pe;
      const projectMap = new Map((projects || []).map((p) => [p.id, p]));
      const ids = (projects || []).map((p) => p.id);
      if (!ids.length) return [];

      const { data: regs, error: re } = await supabase
        .from('project_registrations')
        .select('*')
        .in('project_id', ids)
        .order('registration_date', { ascending: false });
      if (re) throw re;

      const userIds = Array.from(new Set((regs || []).map((r) => r.user_id)));
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, phone')
        .in('id', userIds);
      const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

      return (regs || []).map((r) => ({
        ...r,
        project: projectMap.get(r.project_id),
        profile: profileMap.get(r.user_id),
      }));
    },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('project_registrations').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-project-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['voluntarios-dashboard'] });
      toast({ title: 'Inscrição atualizada' });
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Inscrições em Projetos</h2>
        <p className="text-sm text-muted-foreground">Aprove ou rejeite participantes em projetos do seu núcleo</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !data?.length ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma inscrição</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Projeto</TableHead>
                    <TableHead>Núcleo</TableHead>
                    <TableHead>Voluntário</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.project?.title || '—'}</TableCell>
                      <TableCell>{NUCLEUS_NAMES[r.project?.nucleus] || r.project?.nucleus}</TableCell>
                      <TableCell>{r.profile?.full_name || '—'}</TableCell>
                      <TableCell>{r.profile?.phone || '—'}</TableCell>
                      <TableCell className="text-sm">{new Date(r.registration_date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell><StatusBadge status={r.status === 'aprovado' ? 'aprovado' : r.status === 'rejeitado' ? 'rejeitado' : 'pendente'} /></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => updateMut.mutate({ id: r.id, status: 'aprovado' })}>Aprovar</Button>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => updateMut.mutate({ id: r.id, status: 'rejeitado' })}>Rejeitar</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
