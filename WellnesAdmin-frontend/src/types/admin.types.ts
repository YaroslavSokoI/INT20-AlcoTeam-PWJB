export interface Admin {
  id: string;
  login: string;
  createdAt: string;
  lastLogin?: string;
  status: 'active' | 'suspended';
}

export interface AdminsState {
  admins: Admin[];
  isLoading: boolean;
  fetchAdmins: () => Promise<void>;
  addAdmin: (login: string, password: string) => Promise<Admin>;
  editAdmin: (id: string, login: string, password: string) => Promise<void>;
  removeAdmin: (id: string) => void;
  toggleAdminStatus: (id: string) => void;
}
