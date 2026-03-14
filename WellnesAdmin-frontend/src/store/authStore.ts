import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiService } from '@/services/api';
import type { AuthState, User } from '@/types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (login, password) => {
        try {
          const admin = await apiService.login({ login, password });
          
          const user: User = {
            id: admin.id,
            login: admin.login,
            role: 'admin',
          };
          
          set({ user, isAuthenticated: true });
          return true;
        } catch (error) {
          console.error('Login failed:', error);
          return false;
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'wellnes-admin-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
