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
      // view não está nos tipos gerados ainda
      // @ts-ignore
      let q: any = supabase.from('project_registrations_detail').select('*').order('registration_date', { ascending: false });
      if (nucleus) q = q.eq('project_nucleus', nucleus);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
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
                    <TableHead>E-mail</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.project_title || '—'}</TableCell>
                      <TableCell>{NUCLEUS_NAMES[r.project_nucleus] || r.project_nucleus}</TableCell>
                      <TableCell>{r.user_name || '—'}</TableCell>
                      <TableCell className="text-sm">{r.user_email || '—'}</TableCell>
                      <TableCell className="text-sm">{new Date(r.registration_date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <StatusBadge status={r.status === 'aprovado' ? 'aprovado' : r.status === 'rejeitado' ? 'rejeitado' : 'pendente'} />
                      </TableCell>
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
