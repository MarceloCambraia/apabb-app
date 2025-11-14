import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface Profile {
  full_name: string | null;
  phone: string | null;
}

interface Donation {
  id: string;
  amount: number;
  is_recurring: boolean;
  nucleus: string;
  payment_status: string;
  payment_method: string | null;
  created_at: string;
}

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile>({ full_name: '', phone: '' });
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingDonation, setUpdatingDonation] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadProfileAndDonations();
    }
  }, [user]);

  const loadProfileAndDonations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      if (profileData) {
        setProfile(profileData);
      }

      // Load donations
      const { data: donationsData, error: donationsError } = await supabase
        .from('donations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (donationsError) throw donationsError;
      if (donationsData) {
        setDonations(donationsData);
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar dados',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Perfil atualizado',
        description: 'Seus dados foram salvos com sucesso.'
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelRecurring = async (donationId: string) => {
    setUpdatingDonation(donationId);
    try {
      const { error } = await supabase
        .from('donations')
        .update({ is_recurring: false })
        .eq('id', donationId);

      if (error) throw error;

      toast({
        title: 'Doação recorrente cancelada',
        description: 'A doação recorrente foi cancelada com sucesso.'
      });

      // Reload donations
      await loadProfileAndDonations();
    } catch (error: any) {
      toast({
        title: 'Erro ao cancelar',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setUpdatingDonation(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      completed: 'default',
      pending: 'secondary',
      failed: 'destructive'
    };
    
    const labels: Record<string, string> = {
      completed: 'Concluída',
      pending: 'Pendente',
      failed: 'Falhou'
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const recurringDonations = donations.filter(d => d.is_recurring);
  const allDonations = donations;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">Meu Perfil</h1>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="recurring">Doações Recorrentes</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Dados Pessoais</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground">
                      O e-mail não pode ser alterado
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome Completo</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={profile.full_name || ''}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone || ''}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <Button type="submit" disabled={saving} className="w-full">
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar Alterações'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Doações</CardTitle>
                <CardDescription>
                  Todas as suas doações realizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allDonations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Você ainda não realizou nenhuma doação.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {allDonations.map((donation) => (
                      <div
                        key={donation.id}
                        className="border border-border rounded-lg p-4 space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-lg">
                              {formatCurrency(donation.amount)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {donation.nucleus}
                            </p>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(donation.payment_status)}
                            {donation.is_recurring && (
                              <Badge variant="outline" className="ml-2">
                                Recorrente
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{formatDate(donation.created_at)}</span>
                          {donation.payment_method && (
                            <span className="capitalize">{donation.payment_method}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recurring">
            <Card>
              <CardHeader>
                <CardTitle>Doações Recorrentes</CardTitle>
                <CardDescription>
                  Gerencie suas doações mensais
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recurringDonations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Você não possui doações recorrentes ativas.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {recurringDonations.map((donation) => (
                      <div
                        key={donation.id}
                        className="border border-border rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-lg">
                              {formatCurrency(donation.amount)}/mês
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {donation.nucleus}
                            </p>
                          </div>
                          {getStatusBadge(donation.payment_status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Iniciada em {formatDate(donation.created_at)}
                        </p>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelRecurring(donation.id)}
                          disabled={updatingDonation === donation.id}
                        >
                          {updatingDonation === donation.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Cancelando...
                            </>
                          ) : (
                            'Cancelar Doação Recorrente'
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
