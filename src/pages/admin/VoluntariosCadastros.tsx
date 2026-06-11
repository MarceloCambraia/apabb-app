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

const todayStr = new Date().toISOString().split('T')[0];

const CONTACT_MEDIUM_OPTIONS = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'E-mail' },
  { value: 'telefone', label: 'Telefone' },
  { value: 'presencial', label: 'Presencial' },
];

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
  const [contactMedium, setContactMedium] = useState('');
  const [contactedAt, setContactedAt] = useState(todayStr);

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

  const resetDialog = () => {
    setTarget(null);
    setNotes('');
    setContactMedium('');
    setContactedAt(todayStr);
  };

  const handleAction = (v: any, status: VolunteerStatus) => {
    setTarget({ id: v.id, status });
  };

  const updateMutation = useMutation({
    mutationFn: async ({
      id, status, review_notes, contacted_at, contact_medium,
    }: {
      id: string; status: string; review_notes: string;
      contacted_at?: string; contact_medium?: string;
    }) => {
      const update: Record<string, any> = {
        status,
        review_notes: review_notes || null,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      };
      if (status === 'em_contato') {
        update.contacted_at = contacted_at || new Date().toISOString();
        update.contact_medium = contact_medium || null;
      }
      const { error } = await (supabase as any).from('volunteers').update(update).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-volunteers'] });
      queryClient.invalidateQueries({ queryKey: ['voluntarios-dashboard'] });
      toast({ title: 'Status atualizado' });
      resetDialog();
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Cadastros de Voluntários</h2>
        <p className="text-sm text-muted-foreground">Aprove, rejeite ou marque voluntários como em contato</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
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
            <div className="relative col-span-2 md:col-span-1">
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
            <>
              {/* Cards — mobile */}
              <div className="md:hidden space-y-3">
                {filtered.map((v: any) => (
                  <div key={v.id} className="bg-white rounded-lg border p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{v.name}</p>
                        <p className="text-xs text-gray-500">{v.email}</p>
                        <p className="text-xs text-gray-500">{v.phone}</p>
                      </div>
                      <StatusBadge status={v.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Núcleo: </span>
                        <span className="font-medium">{NUCLEUS_NAMES[v.nucleus] || v.nucleus}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Área: </span>
                        <span className="font-medium">{INTEREST_AREA_NAMES[v.interest_area] || v.interest_area}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Cadastro: </span>
                        <span className="font-medium">{new Date(v.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                      {v.contacted_at && (
                        <div>
                          <span className="text-gray-500">Contato: </span>
                          <span className="font-medium">
                            {new Date(v.contacted_at).toLocaleDateString('pt-BR')}
                            {v.contact_medium && ` via ${v.contact_medium}`}
                          </span>
                        </div>
                      )}
                    </div>

                    {v.message && (
                      <p className="text-xs text-gray-600 bg-gray-50 rounded p-2 line-clamp-2">{v.message}</p>
                    )}

                    <div className="flex gap-2 pt-1">
                      <Button size="sm" className="flex-1 text-xs bg-green-600 hover:bg-green-700"
                        onClick={() => handleAction(v, 'aprovado')}>
                        ✓ Aprovar
                      </Button>
                      <Button size="sm" className="flex-1 text-xs bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleAction(v, 'em_contato')}>
                        📞 Contato
                      </Button>
                      <Button size="sm" variant="destructive" className="flex-1 text-xs"
                        onClick={() => handleAction(v, 'rejeitado')}>
                        ✗ Rejeitar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tabela — desktop */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Núcleo</TableHead>
                      <TableHead>Área</TableHead>
                      <TableHead>Mensagem</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Último Contato</TableHead>
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
                        <TableCell className="text-sm">
                          {v.status === 'em_contato' && v.contacted_at ? (
                            <div>
                              <div>{new Date(v.contacted_at).toLocaleDateString('pt-BR')}</div>
                              {v.contact_medium && (
                                <div className="text-muted-foreground text-xs capitalize">{v.contact_medium}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell><StatusBadge status={v.status} /></TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => handleAction(v, 'aprovado')}>Aprovar</Button>
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => handleAction(v, 'em_contato')}>Em Contato</Button>
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => handleAction(v, 'rejeitado')}>Rejeitar</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!target} onOpenChange={(o) => { if (!o) resetDialog(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Marcar como {target ? VOLUNTEER_STATUS_LABELS[target.status] : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {target?.status === 'em_contato' && (
              <>
                <div className="space-y-2">
                  <Label>Meio de contato</Label>
                  <Select value={contactMedium} onValueChange={setContactMedium}>
                    <SelectTrigger><SelectValue placeholder="Selecione o meio" /></SelectTrigger>
                    <SelectContent>
                      {CONTACT_MEDIUM_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data do contato</Label>
                  <Input type="date" value={contactedAt} onChange={(e) => setContactedAt(e.target.value)} />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label>Notas da revisão (opcional)</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Observações..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetDialog}>Cancelar</Button>
            <Button
              onClick={() => target && updateMutation.mutate({
                id: target.id,
                status: target.status,
                review_notes: notes,
                contacted_at: target.status === 'em_contato' ? contactedAt : undefined,
                contact_medium: target.status === 'em_contato' ? contactMedium : undefined,
              })}
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
