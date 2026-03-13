import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, Heart, HandHeart, DollarSign, TrendingUp, Calendar, FolderKanban, Filter } from 'lucide-react';
import { AdminProjectsManager } from '@/components/AdminProjectsManager';

import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const monthOptions = [
  { value: 'all', label: 'Todos os meses' },
  { value: '1', label: 'Janeiro' },
  { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Março' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' },
  { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
];

const currentYear = new Date().getFullYear();
const yearOptions = [
  { value: 'all', label: 'Todos os anos' },
  ...Array.from({ length: 3 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i),
  })),
];

interface Stats {
  totalDonations: number;
  totalAmount: number;
  totalAssociates: number;
  totalVolunteers: number;
}

interface Donation {
  id: string;
  amount: number;
  is_recurring: boolean;
  payment_status: string;
  created_at: string;
  user_id: string;
}

interface Associate {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  created_at: string;
}

interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  interest_area: string;
  created_at: string;
}

const nucleusNames: Record<string, string> = {
  df: 'Brasília - DF',
  sp: 'São Paulo - SP',
  rj: 'Rio de Janeiro - RJ',
  mg: 'Belo Horizonte - MG',
  rs: 'Porto Alegre - RS',
  ba: 'Salvador - BA',
  pr: 'Curitiba - PR',
  ce: 'Fortaleza - CE',
  pe: 'Recife - PE',
  go: 'Goiânia - GO',
  pa: 'Belém - PA',
  sc: 'Florianópolis - SC',
  es: 'Vitória - ES',
  rn: 'Natal - RN',
  se: 'Aracaju - SE',
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, nucleus, loading: roleLoading } = useUserRole();
  const [stats, setStats] = useState<Stats>({
    totalDonations: 0,
    totalAmount: 0,
    totalAssociates: 0,
    totalVolunteers: 0,
  });
  const [donations, setDonations] = useState<Donation[]>([]);
  const [associates, setAssociates] = useState<Associate[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');

  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!user || !isAdmin) {
        navigate('/');
      }
    }
  }, [user, isAdmin, authLoading, roleLoading, navigate]);

  useEffect(() => {
    if (isAdmin && nucleus) {
      fetchDashboardData();
    }
  }, [isAdmin, nucleus, selectedMonth, selectedYear]);

  // Realtime subscription for donations
  useEffect(() => {
    if (!isAdmin || !nucleus) return;

    const channel = supabase
      .channel('donations-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'donations', filter: `nucleus=eq.${nucleus}` },
        (payload) => {
          console.log('Realtime donation update:', payload);

          if (payload.eventType === 'INSERT') {
            const newDonation = payload.new as Donation;
            const inRange = isDonationInDateRange(newDonation.created_at);
            if (inRange) {
              setDonations((prev) => [newDonation, ...prev]);
              setStats((prev) => ({
                ...prev,
                totalDonations: prev.totalDonations + 1,
                totalAmount: newDonation.payment_status === 'paid'
                  ? prev.totalAmount + Number(newDonation.amount)
                  : prev.totalAmount,
              }));
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Donation;
            const old = payload.old as Partial<Donation>;
            setDonations((prev) =>
              prev.map((d) => (d.id === updated.id ? updated : d))
            );
            // Recalculate totalAmount when status changes
            const wasPaid = old.payment_status === 'paid';
            const nowPaid = updated.payment_status === 'paid';
            if (!wasPaid && nowPaid) {
              setStats((prev) => ({
                ...prev,
                totalAmount: prev.totalAmount + Number(updated.amount),
              }));
            } else if (wasPaid && !nowPaid) {
              setStats((prev) => ({
                ...prev,
                totalAmount: prev.totalAmount - Number(updated.amount),
              }));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, nucleus, selectedMonth, selectedYear]);

  const getDateRange = () => {
    if (selectedMonth === 'all' && selectedYear === 'all') return null;
    const year = selectedYear !== 'all' ? parseInt(selectedYear) : null;
    const month = selectedMonth !== 'all' ? parseInt(selectedMonth) : null;

    if (year && month) {
      const start = new Date(year, month - 1, 1).toISOString();
      const end = new Date(year, month, 0, 23, 59, 59, 999).toISOString();
      return { start, end };
    } else if (year) {
      const start = new Date(year, 0, 1).toISOString();
      const end = new Date(year, 11, 31, 23, 59, 59, 999).toISOString();
      return { start, end };
    } else if (month) {
      const year = currentYear;
      const start = new Date(year, month - 1, 1).toISOString();
      const end = new Date(year, month, 0, 23, 59, 59, 999).toISOString();
      return { start, end };
    }
    return null;
  };

  const isDonationInDateRange = (createdAt: string) => {
    const range = getDateRange();
    if (!range) return true;
    const date = new Date(createdAt);
    return date >= new Date(range.start) && date <= new Date(range.end);
  };

  const fetchDashboardData = async () => {
    if (!nucleus) return;

    try {
      setLoading(true);
      const dateRange = getDateRange();

      // Fetch donations
      let donationsQuery = supabase
        .from('donations')
        .select('*')
        .eq('nucleus', nucleus)
        .order('created_at', { ascending: false });

      if (dateRange) {
        donationsQuery = donationsQuery.gte('created_at', dateRange.start).lte('created_at', dateRange.end);
      }

      const { data: donationsData, error: donationsError } = await donationsQuery;

      if (donationsError) throw donationsError;

      // Fetch associates
      const { data: associatesData, error: associatesError } = await supabase
        .from('associates')
        .select('*')
        .eq('nucleus', nucleus)
        .order('created_at', { ascending: false });

      if (associatesError) throw associatesError;

      // Fetch volunteers
      const { data: volunteersData, error: volunteersError } = await supabase
        .from('volunteers')
        .select('*')
        .eq('nucleus', nucleus)
        .order('created_at', { ascending: false });

      if (volunteersError) throw volunteersError;

      // Calculate stats — Receita Total only counts 'paid' donations
      const totalAmount = donationsData
        ?.filter((d) => d.payment_status === 'paid')
        .reduce((sum, d) => sum + Number(d.amount), 0) || 0;

      setStats({
        totalDonations: donationsData?.length || 0,
        totalAmount,
        totalAssociates: associatesData?.length || 0,
        totalVolunteers: volunteersData?.length || 0,
      });

      setDonations(donationsData || []);
      setAssociates(associatesData || []);
      setVolunteers(volunteersData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || roleLoading || !isAdmin) {
    return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
        <Header />
        <div className="container mx-auto px-4 md:px-6 py-6 md:py-12 flex-1">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 md:px-6 py-6 md:py-12 flex-1">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">Dashboard Administrativo</h1>
          <p className="text-muted-foreground text-sm md:text-lg">
            {nucleus && nucleusNames[nucleus]}
          </p>
        </div>

        {/* Date Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((y) => (
                <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Doações</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDonations}</div>
              <p className="text-xs text-muted-foreground mt-1">
                R$ {stats.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Associados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAssociates}</div>
              <p className="text-xs text-muted-foreground mt-1">Pessoas cadastradas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Voluntários</CardTitle>
              <HandHeart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVolunteers}</div>
              <p className="text-xs text-muted-foreground mt-1">Pessoas interessadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {stats.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Em doações</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="donations" className="w-full">
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            <TabsList className="w-full flex flex-row overflow-x-auto flex-nowrap justify-start scrollbar-hide">
              <TabsTrigger value="donations">Doações</TabsTrigger>
              <TabsTrigger value="associates">Associados</TabsTrigger>
              <TabsTrigger value="volunteers">Voluntários</TabsTrigger>
              <TabsTrigger value="projects">Projetos</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="donations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Doações Recentes</CardTitle>
                <CardDescription>Lista de todas as doações do seu núcleo</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : donations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Nenhuma doação encontrada</p>
                ) : (
                  <div className="w-full overflow-x-auto">
                    <Table className="min-w-[500px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Doador</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Data</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {donations.map((donation) => (
                          <TableRow key={donation.id}>
                            <TableCell>Doador</TableCell>
                            <TableCell>R$ {Number(donation.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                            <TableCell>
                              {donation.is_recurring ? (
                                <Badge variant="default">Recorrente</Badge>
                              ) : (
                                <Badge variant="secondary">Única</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={donation.payment_status === 'paid' || donation.payment_status === 'completed' ? 'default' : donation.payment_status === 'failed' ? 'destructive' : 'secondary'}>
                                {donation.payment_status === 'pending' ? 'Pendente' : 
                                 donation.payment_status === 'paid' ? 'Pago' :
                                 donation.payment_status === 'completed' ? 'Completo' : 
                                 donation.payment_status === 'failed' ? 'Falhou' :
                                 donation.payment_status}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(donation.created_at).toLocaleDateString('pt-BR')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="associates" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Associados</CardTitle>
                <CardDescription>Lista de todos os associados do seu núcleo</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : associates.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Nenhum associado encontrado</p>
                ) : (
                  <div className="w-full overflow-x-auto">
                    <Table className="min-w-[500px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Telefone</TableHead>
                          <TableHead>Vínculo</TableHead>
                          <TableHead>Data</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {associates.map((associate) => (
                          <TableRow key={associate.id}>
                            <TableCell className="font-medium">{associate.name}</TableCell>
                            <TableCell>{associate.email}</TableCell>
                            <TableCell>{associate.phone}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {associate.relationship === 'pcd' ? 'PCD' :
                                 associate.relationship === 'pai' ? 'Pai/Mãe' :
                                 associate.relationship === 'familiar' ? 'Familiar' :
                                 associate.relationship === 'bb' ? 'Func. BB' :
                                 'Comunidade'}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(associate.created_at).toLocaleDateString('pt-BR')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="volunteers" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Voluntários</CardTitle>
                <CardDescription>Lista de todos os voluntários do seu núcleo</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : volunteers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Nenhum voluntário encontrado</p>
                ) : (
                  <div className="w-full overflow-x-auto">
                    <Table className="min-w-[500px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Telefone</TableHead>
                          <TableHead>Área de Interesse</TableHead>
                          <TableHead>Data</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {volunteers.map((volunteer) => (
                          <TableRow key={volunteer.id}>
                            <TableCell className="font-medium">{volunteer.name}</TableCell>
                            <TableCell>{volunteer.email}</TableCell>
                            <TableCell>{volunteer.phone}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{volunteer.interest_area}</Badge>
                            </TableCell>
                            <TableCell>{new Date(volunteer.created_at).toLocaleDateString('pt-BR')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="mt-6">
            {nucleus && <AdminProjectsManager nucleus={nucleus} />}
          </TabsContent>

          <TabsContent value="volunteer-opportunities" className="mt-6">
            {nucleus && <AdminVolunteerOpportunitiesManager nucleus={nucleus} />}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
