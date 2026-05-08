import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { NUCLEUS_OPTIONS, NUCLEUS_NAMES } from '@/lib/volunteer-constants';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const empty = { name: '', email: '', phone: '', whatsapp: '', nucleus: '', area: 'voluntarios' };

export default function VoluntariosCoordenadores() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(empty);

  const { data: list, isLoading } = useQuery({
    queryKey: ['nucleus-coordinators'],
    queryFn: async () => {
      const { data, error } = await supabase.from('nucleus_coordinators').select('*').order('nucleus');
      if (error) throw error;
      return data;
    },
  });

  const upsertMut = useMutation({
    mutationFn: async (payload: any) => {
      if (editing) {
        const { error } = await supabase.from('nucleus_coordinators').update(payload).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('nucleus_coordinators').insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nucleus-coordinators'] });
      toast({ title: editing ? 'Coordenador atualizado' : 'Coordenador criado' });
      reset();
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('nucleus_coordinators').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nucleus-coordinators'] });
      toast({ title: 'Removido' });
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  const reset = () => { setForm(empty); setEditing(null); setOpen(false); };

  const startEdit = (c: any) => {
    setEditing(c);
    setForm({
      name: c.name, email: c.email, phone: c.phone || '', whatsapp: c.whatsapp || '', nucleus: c.nucleus, area: c.area || 'voluntarios',
    });
    setOpen(true);
  };

  const submit = () => {
    if (!form.name || !form.email || !form.nucleus) {
      toast({ title: 'Preencha nome, email e núcleo', variant: 'destructive' });
      return;
    }
    upsertMut.mutate({
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      whatsapp: form.whatsapp || null,
      nucleus: form.nucleus,
      area: form.area,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Coordenadores por Núcleo</h2>
          <p className="text-sm text-muted-foreground">Gerencie os coordenadores de voluntariado</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); else setOpen(true); }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(null); setForm(empty); setOpen(true); }}><Plus className="h-4 w-4 mr-2" />Novo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar' : 'Novo'} Coordenador</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div><Label>Nome</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Telefone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div><Label>WhatsApp</Label><Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></div>
              </div>
              <div>
                <Label>Núcleo</Label>
                <Select value={form.nucleus} onValueChange={(v) => setForm({ ...form, nucleus: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {NUCLEUS_OPTIONS.map((n) => <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Área</Label>
                <Select value={form.area} onValueChange={(v) => setForm({ ...form, area: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="voluntarios">Voluntários</SelectItem>
                    <SelectItem value="projetos">Projetos</SelectItem>
                    <SelectItem value="geral">Geral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={reset}>Cancelar</Button>
              <Button onClick={submit} disabled={upsertMut.isPending}>{editing ? 'Salvar' : 'Criar'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !list?.length ? (
            <p className="text-center text-muted-foreground py-8">Nenhum coordenador cadastrado</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Núcleo</TableHead>
                    <TableHead>Área</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.map((c: any) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.email}</TableCell>
                      <TableCell>{c.phone || '—'}</TableCell>
                      <TableCell>{NUCLEUS_NAMES[c.nucleus] || c.nucleus}</TableCell>
                      <TableCell className="capitalize">{c.area}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => startEdit(c)}><Pencil className="h-3 w-3" /></Button>
                          <Button size="sm" variant="outline" onClick={() => { if (confirm('Remover este coordenador?')) deleteMut.mutate(c.id); }}><Trash2 className="h-3 w-3" /></Button>
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
