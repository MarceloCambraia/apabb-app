import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useUserRole() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVolunteerCoordinator, setIsVolunteerCoordinator] = useState(false);
  const [nucleus, setNucleus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    async function fetchUserRole() {
      if (!user) {
        setIsAdmin(false);
        setIsVolunteerCoordinator(false);
        setNucleus(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role, nucleus')
          .eq('user_id', user.id);

        if (error) throw error;

        const adminRow = data?.find((r) => r.role === 'admin');
        const coordRow = data?.find((r: any) => r.role === 'coordenador_voluntarios');

        setIsAdmin(!!adminRow);
        setIsVolunteerCoordinator(!!coordRow);
        setNucleus(adminRow?.nucleus || coordRow?.nucleus || null);
      } catch (error) {
        console.error('Error fetching user role:', error);
        setIsAdmin(false);
        setIsVolunteerCoordinator(false);
        setNucleus(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUserRole();
  }, [user]);

  return { isAdmin, isVolunteerCoordinator, nucleus, loading };
}
