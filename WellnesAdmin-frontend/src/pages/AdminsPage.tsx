import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Ban, CheckCircle, Users, Clock, MoreVertical, Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAdminsStore } from '@/store/adminsStore';
import { useAuthStore } from '@/store/authStore';
import { AdminModal } from '@/components/NewAdminModal';
import type { Admin } from '@/types';

export function AdminsPage() {
  const { admins, isLoading, fetchAdmins, removeAdmin, toggleAdminStatus } = useAdminsStore();
  const { user } = useAuthStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Admin | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const activeCount = admins.filter(a => a.status === 'active').length;

  return (
    <div className="h-full overflow-y-auto bg-[var(--color-bg)] p-4 md:p-6 pb-24 md:pb-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[var(--color-text-primary)]">Administrators</h1>
          <p className="text-sm font-bold text-[var(--color-text-muted)] mt-0.5">Manage who has access to this panel</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-sm font-black active:scale-95 transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" /> New Admin
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 mb-8 max-w-sm">
        <StatCard label="Total" value={admins.length} icon={<Users className="w-4 h-4" />} color="bg-blue-50 text-blue-600" />
        <StatCard label="Active" value={activeCount} icon={<CheckCircle className="w-4 h-4" />} color="bg-emerald-50 text-emerald-600" />
      </div>

      {isLoading && admins.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-10 h-10 text-[var(--color-text-muted)] animate-spin" />
          <p className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Loading administrators...</p>
        </div>
      ) : (
        /* Admin Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence initial={false} mode="popLayout">
          {admins.map((admin, i) => {
            const isSelf = admin.login === user?.login;
            return (
              <motion.div
                key={admin.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ delay: i * 0.04 }}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 shadow-sm hover:shadow-md transition-all relative group"
              >
                {/* Avatar + Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <span className="text-lg font-black text-slate-600">{admin.login[0].toUpperCase()}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-black text-[var(--color-text-primary)] truncate">{admin.login}</p>
                      {isSelf && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 shrink-0">You</span>
                      )}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Administrator</span>
                  </div>

                  {/* Action Menu */}
                  {!isSelf && (
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === admin.id ? null : admin.id)}
                        className="p-1.5 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border)]/30 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      <AnimatePresence>
                        {openMenuId === admin.id && (
                          <>
                            <div className="fixed inset-0 z-[50]" onClick={() => setOpenMenuId(null)} />
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9, y: -4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: -4 }}
                              className="absolute right-0 top-9 w-44 bg-white border border-[var(--color-border)] rounded-2xl shadow-2xl z-[60] overflow-hidden py-1.5"
                            >
                              <DropdownItem
                                icon={<Pencil className="w-3.5 h-3.5" />}
                                label="Edit"
                                onClick={() => { setEditTarget(admin); setOpenMenuId(null); }}
                              />
                              <DropdownItem
                                icon={admin.status === 'active' ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                label={admin.status === 'active' ? 'Suspend' : 'Activate'}
                                onClick={() => { toggleAdminStatus(admin.id); setOpenMenuId(null); }}
                              />
                              <div className="my-1 mx-3 h-px bg-[var(--color-border)]" />
                              <DropdownItem
                                icon={<Trash2 className="w-3.5 h-3.5" />}
                                label="Delete"
                                onClick={() => { removeAdmin(admin.id); setOpenMenuId(null); }}
                                danger
                              />
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* Status badge */}
                <div className="flex items-center justify-between">
                  <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black",
                    admin.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : 'bg-red-50 text-red-600 border-red-100'
                  )}>
                    <div className={cn("w-1.5 h-1.5 rounded-full", admin.status === 'active' ? 'bg-emerald-500' : 'bg-red-400')} />
                    {admin.status === 'active' ? 'Active' : 'Suspended'}
                  </div>
                  <div className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px] font-bold">{new Date(admin.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      )}

      {/* Create Modal */}
      <AdminModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      {/* Edit Modal */}
      <AdminModal isOpen={!!editTarget} onClose={() => setEditTarget(null)} editTarget={editTarget} />
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-4 shadow-sm flex items-center gap-3">
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", color)}>{icon}</div>
      <div>
        <p className="text-xl font-black text-[var(--color-text-primary)] leading-tight">{value}</p>
        <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
}

function DropdownItem({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-left transition-colors",
        danger ? "text-red-600 hover:bg-red-50" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
      )}
    >
      {icon} {label}
    </button>
  );
}
