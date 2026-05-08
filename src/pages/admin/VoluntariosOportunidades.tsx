import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { NUCLEUS_OPTIONS, NUCLEUS_NAMES } from '@/lib/volunteer-constants';
import { Plus, Pencil, X } from 'lucide-react';

const empty = { title: '', description: '', nucleus: '', time_commitment: '', max_slots: '', image_url: '', status: 'ativo' as 'ativo' | 'encerrado' };

export default function VoluntariosOportunidades() {
  const { isAdmin, nucleus } = useUserRole();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(empty);

  const { data: opps, isLoading } = useQuery({
    queryKey: ['admin-opportunities-all', isAdmin, nucleus],
    queryFn: async () => {
      let q = supabase.from('volunteer_opportunities').select('*').order('created_at', { ascending: false });
      if (!isAdmin && nucleus) q = q.eq('nucleus', nucleus);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const createMut = useMutation({
    mutationFn: async (payload: any) => {
      const { error } = await supabase.from('volunteer_opportunities').insert([payload]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-opportunities-all'] });
      toast({ title: 'Oportunidade criada' });
      reset();
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, ...payload }: any) => {
      const { error } = await supabase.from('volunteer_opportunities').update(payload).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-opportunities-all'] });
      toast({ title: 'Atualizada' });
      reset();
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  const reset = () => {
    setForm(empty);
    setEditing(null);
    setOpen(false);
  };

  const startEdit = (opp: any) => {
    setEditing(opp);
    setForm({
      title: opp.title,
      description: opp.description,
      nucleus: opp.nucleus,
      time_commitment: opp.time_commitment || '',
      max_slots: opp.max_slots?.toString() || '',
      image_url: opp.image_url || '',
      status: opp.status,
    });
    setOpen(true);
  };

  const startCreate = () => {
    setEditing(null);
    setForm({ ...empty, nucleus: !isAdmin && nucleus ? nucleus : '' });
    setOpen(true);
  };

  const submit = () => {
    if (!form.title || !form.description || !form.nucleus) {
      toast({ title: 'Preencha título, descrição e núcleo', variant: 'destructive' });
      return;
    }
    const payload: any = {
      title: form.title,
      description: form.description,
      nucleus: form.nucleus,
      status: form.status,
      time_commitment: form.time_commitment || null,
      image_url: form.image_url || null,
      max_slots: form.max_slots ? parseInt(form.max_slots) : null,
    };
    if (editing) updateMut.mutate({ id: editing.id, ...payload });
    else createMut.mutate(payload);
  };

  const close = (opp: any) => updateMut.mutate({ id: opp.id, status: 'encerrado' });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Oportunidades</h2>
          <p className="text-sm text-muted-foreground">Gerencie as oportunidades de voluntariado</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); else setOpen(true); }}>
          <DialogTrigger asChild>
            <Button onClick={startCreate}><Plus className="h-4 w-4 mr-2" />Nova Oportunidade</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar' : 'Nova'} Oportunidade</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Título</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <Label>Núcleo</Label>
                <Select value={form.nucleus} onValueChange={(v) => setForm({ ...form, nucleus: v })} disabled={!isAdmin}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {NUCLEUS_OPTIONS.map((n) => (
                      <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Carga horária</Label>
                  <Input value={form.time_commitment} onChange={(e) => setForm({ ...form, time_commitment: e.target.value })} placeholder="Ex: 4h/semana" />
                </div>
                <div>
                  <Label>Vagas</Label>
                  <Input type="number" value={form.max_slots} onChange={(e) => setForm({ ...form, max_slots: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Imagem (URL)</Label>
                <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v: any) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="encerrado">Encerrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={reset}>Cancelar</Button>
              <Button onClick={submit} disabled={createMut.isPending || updateMut.isPending}>
                {editing ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !opps?.length ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma oportunidade</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Núcleo</TableHead>
                    <TableHead>Vagas</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {opps.map((o: any) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{o.title}</TableCell>
                      <TableCell>{NUCLEUS_NAMES[o.nucleus] || o.nucleus}</TableCell>
                      <TableCell>{o.filled_slots}/{o.max_slots ?? '∞'}</TableCell>
                      <TableCell><StatusBadge status={o.status} /></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => startEdit(o)}><Pencil className="h-3 w-3" /></Button>
                          {o.status === 'ativo' && (
                            <Button size="sm" variant="outline" onClick={() => close(o)}><X className="h-3 w-3 mr-1" />Encerrar</Button>
                          )}
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
