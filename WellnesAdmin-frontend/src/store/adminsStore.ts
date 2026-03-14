import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Admin, AdminsState } from '@/types';

const INITIAL_ADMINS: Admin[] = [
  {
    id: 'admin-1',
    login: 'admin',
    createdAt: '2024-01-15T10:00:00Z',
    lastLogin: new Date().toISOString(),
    status: 'active',
  },
];

export const useAdminsStore = create<AdminsState>()(
  persist(
    (set) => ({
      admins: INITIAL_ADMINS,

      addAdmin: async (login, _password) => {
        const newAdmin: Admin = {
          id: uuidv4(),
          login,
          createdAt: new Date().toISOString(),
          status: 'active',
        };
        set(state => ({ admins: [newAdmin, ...state.admins] }));
        return newAdmin;
      },

      editAdmin: async (id, login, _password) => {
        set(state => ({
          admins: state.admins.map(a => a.id === id ? { ...a, login } : a),
        }));
      },

      removeAdmin: (id) =>
        set(state => ({ admins: state.admins.filter(a => a.id !== id) })),

      toggleAdminStatus: (id) =>
        set(state => ({
          admins: state.admins.map(a =>
            a.id === id ? { ...a, status: a.status === 'active' ? 'suspended' : 'active' } : a
          ),
        })),
    }),
    {
      name: 'wellnes-admins',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
