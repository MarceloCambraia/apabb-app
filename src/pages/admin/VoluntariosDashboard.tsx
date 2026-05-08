import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, CheckCircle2, Briefcase, ClipboardList } from 'lucide-react';

export default function VoluntariosDashboard() {
  const { isAdmin, nucleus } = useUserRole();
  const filterByNucleus = !isAdmin && !!nucleus;

  const { data, isLoading } = useQuery({
    queryKey: ['voluntarios-dashboard', filterByNucleus ? nucleus : 'all'],
    queryFn: async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const volPending = supabase
        .from('volunteers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pendente');
      const volApprovedMonth = supabase
        .from('volunteers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'aprovado')
        .gte('reviewed_at', startOfMonth.toISOString());
      const oppOpen = supabase
        .from('volunteer_opportunities')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ativo');

      if (filterByNucleus && nucleus) {
        volPending.eq('nucleus', nucleus);
        volApprovedMonth.eq('nucleus', nucleus);
        oppOpen.eq('nucleus', nucleus);
      }

      const [{ count: pending }, { count: approved }, { count: openOpps }] = await Promise.all([
        volPending,
        volApprovedMonth,
        oppOpen,
      ]);

      // Project registrations pending — need to filter by project nucleus when coordinator
      let pendingRegs = 0;
      if (filterByNucleus && nucleus) {
        const { data: projs } = await supabase.from('projects').select('id').eq('nucleus', nucleus);
        const ids = (projs || []).map((p) => p.id);
        if (ids.length) {
          const { count } = await supabase
            .from('project_registrations')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pendente')
            .in('project_id', ids);
          pendingRegs = count || 0;
        }
      } else {
        const { count } = await supabase
          .from('project_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pendente');
        pendingRegs = count || 0;
      }

      return {
        pending: pending || 0,
        approved: approved || 0,
        openOpps: openOpps || 0,
        pendingRegs,
      };
    },
  });

  const cards = [
    { title: 'Voluntários pendentes', value: data?.pending, icon: Users, color: 'text-yellow-700' },
    { title: 'Aprovados este mês', value: data?.approved, icon: CheckCircle2, color: 'text-green-700' },
    { title: 'Oportunidades abertas', value: data?.openOpps, icon: Briefcase, color: 'text-primary' },
    { title: 'Inscrições pendentes', value: data?.pendingRegs, icon: ClipboardList, color: 'text-secondary' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Visão geral da gestão de voluntariado</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold">{c.value ?? 0}</div>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
