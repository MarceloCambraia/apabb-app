import { useEffect, useState, useMemo } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Heart, CalendarDays, Shield, Star, Crown, Gem } from 'lucide-react';

interface Donation {
  id: string;
  amount: number;
  payment_status: string;
  created_at: string;
}

interface TierInfo {
  level: number;
  title: string;
  color: string;
  icon: React.ReactNode;
  minAmount: number;
  maxAmount: number | null;
}

const TIERS: TierInfo[] = [
  { level: 1, title: 'Apoiador', color: '#CD7F32', icon: <Shield className="h-6 w-6" />, minAmount: 0, maxAmount: 39.99 },
  { level: 2, title: 'Parceiro', color: '#C0C0C0', icon: <Star className="h-6 w-6" />, minAmount: 40, maxAmount: 59.99 },
  { level: 3, title: 'Protetor', color: '#FFD700', icon: <Crown className="h-6 w-6" />, minAmount: 60, maxAmount: 99.99 },
  { level: 4, title: 'Anjo', color: '#00BFFF', icon: <Gem className="h-6 w-6" />, minAmount: 100, maxAmount: null },
];

function getTier(totalDonated: number): TierInfo {
  if (totalDonated >= 100) return TIERS[3];
  if (totalDonated >= 60) return TIERS[2];
  if (totalDonated >= 40) return TIERS[1];
  return TIERS[0];
}

function getProgressToNext(totalDonated: number): { percent: number; remaining: number; nextTier: TierInfo | null } {
  const currentTier = getTier(totalDonated);
  const nextTierIndex = TIERS.findIndex(t => t.level === currentTier.level + 1);
  if (nextTierIndex === -1) return { percent: 100, remaining: 0, nextTier: null };
  const nextTier = TIERS[nextTierIndex];
  const rangeStart = currentTier.minAmount;
  const rangeEnd = nextTier.minAmount;
  const progress = ((totalDonated - rangeStart) / (rangeEnd - rangeStart)) * 100;
  return { percent: Math.min(Math.max(progress, 0), 100), remaining: Math.max(rangeEnd - totalDonated, 0), nextTier };
}

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profileName, setProfileName] = useState<string | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [profileRes, donationsRes] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('id', user.id).single(),
        supabase.from('donations').select('id, amount, payment_status, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);
      if (profileRes.data) setProfileName(profileRes.data.full_name);
      if (donationsRes.data) setDonations(donationsRes.data);
    } catch (error: any) {
      toast({ title: 'Erro ao carregar dados', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const paidDonations = useMemo(() => donations.filter(d => d.payment_status === 'paid'), [donations]);
  const totalDonated = useMemo(() => paidDonations.reduce((sum, d) => sum + Number(d.amount), 0), [paidDonations]);
  const donationsCount = paidDonations.length;

  const activeMonths = useMemo(() => {
    const months = new Set(paidDonations.map(d => {
      const date = new Date(d.created_at);
      return `${date.getFullYear()}-${date.getMonth()}`;
    }));
    return months.size;
  }, [paidDonations]);

  const currentTier = getTier(totalDonated);
  const { percent, remaining, nextTier } = getProgressToNext(totalDonated);

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const displayName = profileName || user?.email?.split('@')[0] || 'Doador';
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="container mx-auto px-4 max-w-lg py-12 pb-28 md:pb-12 flex-1 space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="h-28 w-28 rounded-full" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-4 w-full rounded-full" />
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          <Skeleton className="h-40 rounded-xl" />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-4 max-w-lg py-8 pb-28 md:pb-12 flex-1 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col items-center space-y-3 pt-4">
          <div
            className="rounded-full p-1"
            style={{
              background: `linear-gradient(135deg, ${currentTier.color}, ${currentTier.color}88)`,
              boxShadow: `0 0 24px ${currentTier.color}66, 0 0 48px ${currentTier.color}33`,
            }}
          >
            <Avatar className="h-28 w-28 border-4 border-background">
              <AvatarFallback className="text-2xl font-bold bg-card text-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{displayName}</h1>
          <Badge
            className="text-sm px-4 py-1 font-semibold border-0"
            style={{ backgroundColor: `${currentTier.color}22`, color: currentTier.color }}
          >
            {currentTier.level === 1 && '🛡️'}
            {currentTier.level === 2 && '⭐'}
            {currentTier.level === 3 && '👑'}
            {currentTier.level === 4 && '💎'}
            {' '}{currentTier.title}
          </Badge>
        </div>

        {/* Progress Bar */}
        <Card className="backdrop-blur-md bg-card/80 border-border/50 shadow-sm">
          <CardContent className="pt-5 pb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-medium">Nível {currentTier.level}</span>
              {nextTier ? (
                <span className="text-muted-foreground font-medium">Nível {nextTier.level}</span>
              ) : (
                <span className="font-medium" style={{ color: currentTier.color }}>Nível Máximo!</span>
              )}
            </div>
            <div className="relative">
              <Progress value={percent} className="h-3" />
              <div
                className="absolute top-0 left-0 h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${percent}%`,
                  background: `linear-gradient(90deg, ${currentTier.color}, ${nextTier?.color || currentTier.color})`,
                }}
              />
            </div>
            <p className="text-sm text-center text-muted-foreground">
              {nextTier
                ? `Faltam ${formatCurrency(remaining)} para virar ${nextTier.title}`
                : '🎉 Você alcançou o nível máximo!'}
            </p>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="backdrop-blur-md bg-card/80 border-border/50 shadow-sm">
            <CardContent className="pt-4 pb-3 flex flex-col items-center space-y-1">
              <DollarSign className="h-5 w-5 text-primary" />
              <p className="text-lg font-bold text-foreground">{formatCurrency(totalDonated)}</p>
              <p className="text-xs text-muted-foreground">Total Doado</p>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-md bg-card/80 border-border/50 shadow-sm">
            <CardContent className="pt-4 pb-3 flex flex-col items-center space-y-1">
              <Heart className="h-5 w-5 text-destructive" />
              <p className="text-lg font-bold text-foreground">{donationsCount}</p>
              <p className="text-xs text-muted-foreground">Doações</p>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-md bg-card/80 border-border/50 shadow-sm">
            <CardContent className="pt-4 pb-3 flex flex-col items-center space-y-1">
              <CalendarDays className="h-5 w-5 text-secondary" />
              <p className="text-lg font-bold text-foreground">{activeMonths}</p>
              <p className="text-xs text-muted-foreground">Meses Ativo</p>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <Card className="backdrop-blur-md bg-card/80 border-border/50 shadow-sm">
          <CardContent className="pt-5 pb-4 space-y-4">
            <h2 className="text-lg font-bold text-foreground">🏆 Conquistas</h2>
            <div className="grid grid-cols-4 gap-4">
              {TIERS.map((tier) => {
                const unlocked = totalDonated >= tier.minAmount;
                return (
                  <div key={tier.level} className="flex flex-col items-center space-y-2">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300"
                      style={{
                        backgroundColor: unlocked ? `${tier.color}22` : 'hsl(var(--muted))',
                        border: `3px solid ${unlocked ? tier.color : 'hsl(var(--border))'}`,
                        boxShadow: unlocked ? `0 0 16px ${tier.color}44` : 'none',
                        opacity: unlocked ? 1 : 0.4,
                        filter: unlocked ? 'none' : 'grayscale(100%)',
                      }}
                    >
                      <span style={{ color: unlocked ? tier.color : 'hsl(var(--muted-foreground))' }}>
                        {tier.icon}
                      </span>
                    </div>
                    <span
                      className="text-xs font-semibold text-center"
                      style={{ color: unlocked ? tier.color : 'hsl(var(--muted-foreground))' }}
                    >
                      {tier.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

      </div>
      <BottomNav />
    </div>
  );
}
