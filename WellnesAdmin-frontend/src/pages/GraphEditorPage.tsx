import { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Canvas } from '@/components/Canvas';
import { InspectorPanel } from '@/components/InspectorPanel';
import { useIsMobile } from '@/hooks/useResponsive';

export function GraphEditorPage() {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ReactFlowProvider>
      <div className="flex h-full w-full overflow-hidden relative">
        {!isMobile ? (
          <Sidebar />
        ) : (
          <AnimatePresence>
            {sidebarOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setSidebarOpen(false)}
                  className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[60]"
                />
                <motion.div
                  initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed top-0 left-0 bottom-0 w-[260px] z-[70] shadow-2xl"
                >
                  <Sidebar onClose={() => setSidebarOpen(false)} />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        )}

        <main className="flex-1 relative overflow-hidden bg-[var(--color-bg)]">
          <Canvas />

          {isMobile && !sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="fixed bottom-4 right-4 w-12 h-12 rounded-full bg-[var(--color-text-primary)] text-white shadow-xl flex items-center justify-center z-[50] active:scale-90 transition-transform"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </main>

        <InspectorPanel />
      </div>
    </ReactFlowProvider>
  );
}
