import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { setSession, clearAuth, updateLastActivity } from '../store/slices/authSlice';
import { authService } from '../services/supabase/authService';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      const session = await authService.getCurrentSession();
      const user = await authService.getCurrentUser();
      
      if (session && user) {
        dispatch(setSession({ session, user }));
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const user = await authService.getCurrentUser();
          dispatch(setSession({ session, user }));
        } else if (event === 'SIGNED_OUT') {
          dispatch(clearAuth());
        } else if (event === 'TOKEN_REFRESHED' && session) {
          const user = await authService.getCurrentUser();
          dispatch(setSession({ session, user }));
        }
      }
    );

    // Activity tracking
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const updateActivity = () => {
      if (auth.isAuthenticated) {
        dispatch(updateLastActivity());
      }
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Cleanup
    return () => {
      subscription?.unsubscribe();
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, [dispatch, auth.isAuthenticated]);

  // Session timeout check
  useEffect(() => {
    if (auth.isAuthenticated && auth.lastActivity) {
      const checkSessionTimeout = () => {
        const now = Date.now();
        const sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
        
        if (now - auth.lastActivity > sessionTimeout) {
          dispatch(clearAuth());
          authService.signOut();
        }
      };

      const interval = setInterval(checkSessionTimeout, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [auth.isAuthenticated, auth.lastActivity, dispatch]);

  return {
    user: auth.user,
    session: auth.session,
    loading: auth.loading,
    error: auth.error,
    isAuthenticated: auth.isAuthenticated,
    role: auth.role,
    permissions: auth.permissions,
    lastActivity: auth.lastActivity,
  };
};