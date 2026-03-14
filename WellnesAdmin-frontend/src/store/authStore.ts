import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthState, User } from '@/types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (login, password) => {
        // Simulation of a basic admin authentication
        if (login === 'admin' && password === 'admin') {
          const mockUser: User = {
            id: 'admin-1',
            login: 'admin',
            role: 'admin',
          };
          
          set({ user: mockUser, isAuthenticated: true });
          return true;
        }
        return false;
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
