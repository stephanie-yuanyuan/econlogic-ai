import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useAuthStore = create((set, get) => ({
  // --- State ---
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  error: null,

  // --- Actions ---

  /**
   * Initialize auth: check existing session + subscribe to auth changes.
   * Call once on app mount.
   */
  initialize: async () => {
    try {
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (session) {
        const profile = await get()._fetchProfile(session.user.id);
        set({
          user: session.user,
          session,
          profile,
          isLoading: false,
          error: null,
        });
      } else {
        set({ isLoading: false });
      }

      // Subscribe to auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' && session) {
            const profile = await get()._fetchProfile(session.user.id);
            set({
              user: session.user,
              session,
              profile,
              isLoading: false,
              error: null,
            });
          } else if (event === 'SIGNED_OUT') {
            set({
              user: null,
              session: null,
              profile: null,
              isLoading: false,
              error: null,
            });
          } else if (event === 'TOKEN_REFRESHED' && session) {
            set({ session });
          }
        }
      );

      // Store subscription for potential cleanup
      set({ _subscription: subscription });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ isLoading: false, error: error.message });
    }
  },

  /**
   * Register a new user with email, password, name, and role.
   */
  register: async (email, password, fullName, role = 'student') => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
          },
        },
      });

      if (error) throw error;

      // If email confirmation is disabled, user is immediately signed in
      // The onAuthStateChange listener will handle the state update
      if (!data.session) {
        // Email confirmation required
        set({ isLoading: false });
        return { needsConfirmation: true };
      }

      set({ isLoading: false });
      return { needsConfirmation: false };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  /**
   * Login with email and password.
   */
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // The onAuthStateChange listener will handle the state update
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  /**
   * Sign out and clear state.
   */
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      set({
        user: null,
        session: null,
        profile: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({ isLoading: false, error: error.message });
    }
  },

  /**
   * Clear error state.
   */
  clearError: () => set({ error: null }),

  // --- Internal helpers ---

  /**
   * Fetch user profile from profiles table.
   * @private
   */
  _fetchProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Failed to fetch profile:', error.message);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Profile fetch error:', error);
      return null;
    }
  },
}));
