import { create } from 'zustand';
import { apiService } from '@/services/api';
import type { Admin, AdminsState } from '@/types';

export const useAdminsStore = create<AdminsState>((set, get) => ({
  admins: [],
  isLoading: false,

  fetchAdmins: async () => {
    set({ isLoading: true });
    try {
      const data = await apiService.getAdmins();
      const formatted: Admin[] = data.map((ba: any) => ({
        id: ba.id,
        login: ba.login,
        status: ba.status,
        createdAt: ba.created_at,
        lastLogin: ba.last_login,
      }));
      set({ admins: formatted });
    } catch (error) {
      console.error('Failed to fetch admins:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addAdmin: async (login, password) => {
    set({ isLoading: true });
    try {
      const ba = await apiService.createAdmin({ login, password });
      const newAdmin: Admin = {
        id: ba.id,
        login: ba.login,
        status: ba.status,
        createdAt: ba.created_at,
        lastLogin: ba.last_login,
      };
      set(state => ({ admins: [newAdmin, ...state.admins] }));
      return newAdmin;
    } catch (error) {
      console.error('Failed to add admin:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  editAdmin: async (id, login, password) => {
    set({ isLoading: true });
    try {
      const ba = await apiService.updateAdmin(id, { login, password });
      set(state => ({
        admins: state.admins.map(a => a.id === id ? {
          ...a,
          login: ba.login,
          status: ba.status,
        } : a),
      }));
    } catch (error) {
      console.error('Failed to edit admin:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  removeAdmin: async (id) => {
    try {
      await apiService.deleteAdmin(id);
      set(state => ({ admins: state.admins.filter(a => a.id !== id) }));
    } catch (error) {
      console.error('Failed to remove admin:', error);
    }
  },

  toggleAdminStatus: async (id) => {
    try {
      const ba = await apiService.toggleAdminStatus(id);
      set(state => ({
        admins: state.admins.map(a => a.id === id ? {
          ...a,
          status: ba.status
        } : a),
      }));
    } catch (error) {
      console.error('Failed to toggle admin status:', error);
    }
  },
}));
