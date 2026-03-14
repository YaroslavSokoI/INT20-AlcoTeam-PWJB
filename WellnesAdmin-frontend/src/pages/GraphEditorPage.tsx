import { ReactFlowProvider } from '@xyflow/react';
import { Sidebar } from '@/components/Sidebar';
import { Canvas } from '@/components/Canvas';
import { InspectorPanel } from '@/components/InspectorPanel';

export function GraphEditorPage() {
  return (
    <ReactFlowProvider>
      <div className="flex h-full w-full overflow-hidden">
        <Sidebar />
        <main className="flex-1 relative overflow-hidden bg-[var(--color-bg)]">
          <Canvas />
        </main>
        <InspectorPanel />
      </div>
    </ReactFlowProvider>
  );
}
