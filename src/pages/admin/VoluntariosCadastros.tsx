import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { StatusBadge } from '@/components/admin/StatusBadge';
import {
  NUCLEUS_OPTIONS,
  NUCLEUS_NAMES,
  INTEREST_AREAS,
  INTEREST_AREA_NAMES,
  VolunteerStatus,
  VOLUNTEER_STATUS_LABELS,
} from '@/lib/volunteer-constants';
import { MessageSquare, Search } from 'lucide-react';

export default function VoluntariosCadastros() {
  const { isAdmin, nucleus } = useUserRole();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [filterNucleus, setFilterNucleus] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterArea, setFilterArea] = useState<string>('all');
  const [search, setSearch] = useState('');

  const [target, setTarget] = useState<{ id: string; status: VolunteerStatus } | null>(null);
  const [notes, setNotes] = useState('');

  const effectiveNucleus = !isAdmin ? nucleus : filterNucleus === 'all' ? null : filterNucleus;

  const { data: volunteers, isLoading } = useQuery({
    queryKey: ['admin-volunteers', effectiveNucleus, isAdmin],
    queryFn: async () => {
      let q = supabase.from('volunteers').select('*').order('created_at', { ascending: false });
      if (effectiveNucleus) q = q.eq('nucleus', effectiveNucleus);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    return (volunteers || []).filter((v: any) => {
      if (filterStatus !== 'all' && v.status !== filterStatus) return false;
      if (filterArea !== 'all' && v.interest_area !== filterArea) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!v.name?.toLowerCase().includes(s) && !v.email?.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [volunteers, filterStatus, filterArea, search]);

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, review_notes }: { id: string; status: string; review_notes: string }) => {
      const { error } = await supabase
        .from('volunteers')
        .update({
          status,
          review_notes: review_notes || null,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-volunteers'] });
      queryClient.invalidateQueries({ queryKey: ['voluntarios-dashboard'] });
      toast({ title: 'Status atualizado' });
      setTarget(null);
      setNotes('');
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Cadastros de Voluntários</h2>
        <p className="text-sm text-muted-foreground">Aprove, rejeite ou marque voluntários como em contato</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {isAdmin && (
              <Select value={filterNucleus} onValueChange={setFilterNucleus}>
                <SelectTrigger><SelectValue placeholder="Núcleo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos núcleos</SelectItem>
                  {NUCLEUS_OPTIONS.map((n) => (
                    <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                {Object.entries(VOLUNTEER_STATUS_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterArea} onValueChange={setFilterArea}>
              <SelectTrigger><SelectValue placeholder="Área" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas áreas</SelectItem>
                {INTEREST_AREAS.map((a) => (
                  <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-8" placeholder="Nome ou email" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum voluntário encontrado</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Núcleo</TableHead>
                    <TableHead>Área</TableHead>
                    <TableHead>Mensagem</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((v: any) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.name}</TableCell>
                      <TableCell className="text-sm">
                        <div>{v.email}</div>
                        <div className="text-muted-foreground">{v.phone}</div>
                      </TableCell>
                      <TableCell>{NUCLEUS_NAMES[v.nucleus] || v.nucleus}</TableCell>
                      <TableCell>{INTEREST_AREA_NAMES[v.interest_area] || v.interest_area}</TableCell>
                      <TableCell>
                        {v.message ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon"><MessageSquare className="h-4 w-4" /></Button>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs"><p>{v.message}</p></TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{new Date(v.created_at).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell><StatusBadge status={v.status} /></TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setTarget({ id: v.id, status: 'aprovado' })}>Aprovar</Button>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setTarget({ id: v.id, status: 'em_contato' })}>Em Contato</Button>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setTarget({ id: v.id, status: 'rejeitado' })}>Rejeitar</Button>
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

      <Dialog open={!!target} onOpenChange={(o) => { if (!o) { setTarget(null); setNotes(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Marcar como {target ? VOLUNTEER_STATUS_LABELS[target.status] : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Notas da revisão (opcional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Observações..." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setTarget(null); setNotes(''); }}>Cancelar</Button>
            <Button
              onClick={() => target && updateMutation.mutate({ id: target.id, status: target.status, review_notes: notes })}
              disabled={updateMutation.isPending}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
