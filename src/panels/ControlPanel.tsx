import { GlobalForm } from './GlobalForm';
import { MomentListPanel } from './MomentListPanel';

export function ControlPanel() {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      <section>
        <h2 className="text-sm font-bold text-gray-700 mb-3">全局设置</h2>
        <GlobalForm />
      </section>
      <section>
        <h2 className="text-sm font-bold text-gray-700 mb-3">动态列表</h2>
        <MomentListPanel />
      </section>
    </div>
  );
}
