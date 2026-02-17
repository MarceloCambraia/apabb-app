import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Plus, Users, ArrowLeft, Pencil } from 'lucide-react';

interface AdminProjectsManagerProps {
  nucleus: string;
}

const nucleusNames: Record<string, string> = {
  df: 'Brasília - DF', sp: 'São Paulo - SP', rj: 'Rio de Janeiro - RJ',
  mg: 'Belo Horizonte - MG', rs: 'Porto Alegre - RS', ba: 'Salvador - BA',
  pr: 'Curitiba - PR', ce: 'Fortaleza - CE', pe: 'Recife - PE',
  go: 'Goiânia - GO', pa: 'Belém - PA', sc: 'Florianópolis - SC',
  es: 'Vitória - ES', rn: 'Natal - RN', se: 'Aracaju - SE',
};

export function AdminProjectsManager({ nucleus }: AdminProjectsManagerProps) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [form, setForm] = useState({ title: '', description: '', image_url: '', status: 'ativo' as string, max_slots: '' });

  const { data: projects, isLoading } = useQuery({
    queryKey: ['admin-projects', nucleus],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('nucleus', nucleus)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: registrations, isLoading: registrationsLoading } = useQuery({
    queryKey: ['project-registrations', selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return [];
      const { data, error } = await supabase
        .from('project_registrations')
        .select('*, profiles:user_id(full_name, phone)')
        .eq('project_id', selectedProjectId)
        .order('registration_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedProjectId,
  });

  const createMutation = useMutation({
    mutationFn: async (project: { title: string; description: string; nucleus: string; image_url?: string; status: 'ativo' | 'encerrado'; max_slots?: number }) => {
      const { error } = await supabase.from('projects').insert([project]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      toast({ title: 'Projeto criado com sucesso!' });
      resetForm();
    },
    onError: (err: any) => toast({ title: 'Erro ao criar projeto', description: err.message, variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...project }: any) => {
      const { error } = await supabase.from('projects').update(project).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      toast({ title: 'Projeto atualizado!' });
      resetForm();
    },
    onError: (err: any) => toast({ title: 'Erro ao atualizar', description: err.message, variant: 'destructive' }),
  });

  const updateRegistrationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('project_registrations').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-registrations'] });
      toast({ title: 'Status atualizado!' });
    },
  });

  const resetForm = () => {
    setForm({ title: '', description: '', image_url: '', status: 'ativo', max_slots: '' });
    setEditingProject(null);
    setDialogOpen(false);
  };

  const handleSubmit = () => {
    if (!form.title || !form.description) {
      toast({ title: 'Preencha título e descrição', variant: 'destructive' });
      return;
    }
    const payload: { title: string; description: string; nucleus: string; status: 'ativo' | 'encerrado'; image_url?: string; max_slots?: number } = {
      title: form.title, description: form.description, nucleus, status: form.status as 'ativo' | 'encerrado',
    };
    if (form.image_url) payload.image_url = form.image_url;
    if (form.max_slots) payload.max_slots = parseInt(form.max_slots);

    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const openEdit = (project: any) => {
    setForm({
      title: project.title,
      description: project.description,
      image_url: project.image_url || '',
      status: project.status,
      max_slots: project.max_slots?.toString() || '',
    });
    setEditingProject(project);
    setDialogOpen(true);
  };

  // View: registrations list
  if (selectedProjectId) {
    const selectedProject = projects?.find((p) => p.id === selectedProjectId);
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setSelectedProjectId(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle>Inscritos - {selectedProject?.title}</CardTitle>
              <CardDescription>{registrations?.length || 0} inscrição(ões)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {registrationsLoading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !registrations?.length ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma inscrição ainda</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.map((reg: any) => (
                  <TableRow key={reg.id}>
                    <TableCell className="font-medium">{reg.profiles?.full_name || 'N/A'}</TableCell>
                    <TableCell>{reg.profiles?.phone || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={reg.status === 'confirmado' ? 'default' : 'secondary'}>
                        {reg.status === 'confirmado' ? 'Confirmado' : 'Pendente'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(reg.registration_date).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateRegistrationMutation.mutate({
                            id: reg.id,
                            status: reg.status === 'confirmado' ? 'pendente' : 'confirmado',
                          })
                        }
                      >
                        {reg.status === 'confirmado' ? 'Reverter' : 'Confirmar'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    );
  }

  // View: projects list
  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-xl md:text-2xl">Projetos</CardTitle>
          <CardDescription>Gerencie os projetos do núcleo {nucleusNames[nucleus] || nucleus}</CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setDialogOpen(open); }}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto"><Plus className="h-4 w-4 mr-2" />Novo Projeto</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingProject ? 'Editar Projeto' : 'Novo Projeto'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>Título</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Nome do projeto" />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição detalhada" rows={4} />
              </div>
              <div>
                <Label>URL da Imagem (opcional)</Label>
                <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="encerrado">Encerrado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Vagas (opcional)</Label>
                  <Input type="number" value={form.max_slots} onChange={(e) => setForm({ ...form, max_slots: e.target.value })} placeholder="Sem limite" />
                </div>
              </div>
              <Button className="w-full" onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                {editingProject ? 'Salvar Alterações' : 'Criar Projeto'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : !projects?.length ? (
          <p className="text-center text-muted-foreground py-8">Nenhum projeto cadastrado</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vagas</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.title}</TableCell>
                    <TableCell>
                      <Badge variant={project.status === 'ativo' ? 'default' : 'secondary'}>
                        {project.status === 'ativo' ? 'Ativo' : 'Encerrado'}
                      </Badge>
                    </TableCell>
                    <TableCell>{project.max_slots || '∞'}</TableCell>
                    <TableCell>{new Date(project.created_at).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(project)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setSelectedProjectId(project.id)}>
                        <Users className="h-3 w-3 mr-1" /> Inscritos
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
