import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to track user session activity
 * - Saves last visited page
 * - Tracks cart state
 * - Records design flow progress
 */
export const useSessionTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const updateLastVisitedPage = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;

        // Update last visited page in profile
        await supabase
          .from('profiles')
          .update({ last_visited_page: location.pathname })
          .eq('id', user.id);
      } catch (error) {
        // Silent fail - session tracking shouldn't block user
        console.debug('Session tracking update failed:', error);
      }
    };

    updateLastVisitedPage();
  }, [location.pathname]);

  const updateDesignStep = async (step: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      await supabase
        .from('profiles')
        .update({ last_design_step: step })
        .eq('id', user.id);
    } catch (error) {
      console.debug('Design step tracking failed:', error);
    }
  };

  const saveCartState = async (cartItems: any[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      await supabase
        .from('profiles')
        .update({ cart_state: cartItems })
        .eq('id', user.id);
    } catch (error) {
      console.debug('Cart state save failed:', error);
    }
  };

  const loadCartState = async (): Promise<any[] | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('cart_state')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      const cartState = data?.cart_state;
      return Array.isArray(cartState) ? cartState : null;
    } catch (error) {
      console.debug('Cart state load failed:', error);
      return null;
    }
  };

  return {
    updateDesignStep,
    saveCartState,
    loadCartState,
  };
};
