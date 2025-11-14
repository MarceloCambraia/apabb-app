import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useUserRole() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [nucleus, setNucleus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserRole() {
      if (!user) {
        setIsAdmin(false);
        setNucleus(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role, nucleus')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (error) throw error;

        setIsAdmin(!!data);
        setNucleus(data?.nucleus || null);
      } catch (error) {
        console.error('Error fetching user role:', error);
        setIsAdmin(false);
        setNucleus(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUserRole();
  }, [user]);

  return { isAdmin, nucleus, loading };
}
