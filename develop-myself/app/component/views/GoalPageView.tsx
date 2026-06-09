import React, { useState } from 'react';
import { NotionEditor } from '~/component/features/NotionEditor';
import { Target, Flag, Calendar, Activity, Plus, Trash2 } from 'lucide-react';

interface GoalPageViewProps {
  page: any;
  onSave: (data: any) => void;
}

export const GoalPageView = ({ page, onSave }: GoalPageViewProps) => {
  const [meta, setMeta] = useState(page.content?.meta || {});
  const [milestones, setMilestones] = useState<{ id: string, text: string, checked: boolean }[]>(page.content?.milestones || []);

  const updateMeta = (key: string, value: any) => {
    const newMeta = { ...meta, [key]: value };
    setMeta(newMeta);
    onSave({ ...page.content, meta: newMeta, milestones });
  };

  const addMilestone = () => {
    const newMilestones = [...milestones, { id: `ms-${Date.now()}`, text: '', checked: false }];
    setMilestones(newMilestones);
    onSave({ ...page.content, meta, milestones: newMilestones });
  };

  const updateMilestone = (id: string, text: string, checked: boolean) => {
    const newMilestones = milestones.map(m => m.id === id ? { ...m, text, checked } : m);
    setMilestones(newMilestones);
    onSave({ ...page.content, meta, milestones: newMilestones });
  };

  const deleteMilestone = (id: string) => {
    const newMilestones = milestones.filter(m => m.id !== id);
    setMilestones(newMilestones);
    onSave({ ...page.content, meta, milestones: newMilestones });
  };

  const calculateProgress = () => {
    if (milestones.length === 0) return 0;
    const done = milestones.filter(m => m.checked).length;
    return Math.round((done / milestones.length) * 100);
  };

  const progress = calculateProgress();

  return (
    <div className="flex-1 flex flex-col px-2 md:px-5 max-w-4xl mx-auto w-full">
      {/* Cards Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 flex items-center gap-3">
          <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><Activity size={20} /></div>
          <div className="flex-1">
            <div className="text-[10px] font-bold text-rose-800 uppercase tracking-wider mb-1">Trạng thái</div>
            <select value={meta.status || 'DRAFT'} onChange={e => updateMeta('status', e.target.value)} className="bg-transparent font-semibold text-rose-900 outline-none w-full text-sm cursor-pointer">
              <option value="DRAFT">Bản nháp</option>
              <option value="IN_PROGRESS">Đang thực hiện</option>
              <option value="ON_HOLD">Tạm dừng</option>
              <option value="COMPLETED">Đã hoàn thành</option>
            </select>
          </div>
        </div>

        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 flex items-center gap-3">
          <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Flag size={20} /></div>
          <div className="flex-1">
            <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">Mức ưu tiên</div>
            <select value={meta.priority || 'MEDIUM'} onChange={e => updateMeta('priority', e.target.value)} className="bg-transparent font-semibold text-amber-900 outline-none w-full text-sm cursor-pointer">
              <option value="LOW">Thấp (Low)</option>
              <option value="MEDIUM">Trung bình (Med)</option>
              <option value="HIGH">Cao (High)</option>
            </select>
          </div>
        </div>

        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Calendar size={20} /></div>
          <div className="flex flex-col flex-1">
             <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1">Thời gian</div>
             <div className="flex items-center gap-1 text-xs text-emerald-900 font-semibold">
               <input type="date" value={meta.startDate || ''} onChange={e => updateMeta('startDate', e.target.value)} className="bg-transparent outline-none w-24 cursor-pointer" />
               <span className="text-emerald-400">→</span>
               <input type="date" value={meta.targetDate || ''} onChange={e => updateMeta('targetDate', e.target.value)} className="bg-transparent outline-none w-24 cursor-pointer" />
             </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex justify-between items-end mb-3">
          <h3 className="font-bold text-[#023468] text-lg flex items-center gap-2"><Target size={20} /> Tiến độ mục tiêu</h3>
          <span className="font-black text-3xl text-rose-500 drop-shadow-sm">{progress}%</span>
        </div>
        <div className="h-5 bg-gray-100 rounded-full overflow-hidden border border-gray-200/50 shadow-inner">
          <div className="h-full bg-linear-to-r from-rose-400 to-rose-600 transition-all duration-700 ease-out relative" style={{ width: `${progress}%` }}>
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="mb-12 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-bold text-gray-800 text-lg">Các cột mốc (Milestones)</h3>
          <button onClick={addMilestone} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"><Plus size={16}/> Thêm chặng</button>
        </div>
        <div className="space-y-3">
          {milestones.length === 0 && <div className="text-sm text-gray-400 italic text-center py-4 bg-gray-50 rounded-xl">Chưa có cột mốc nào. Hãy thêm để tính tiến độ tự động.</div>}
          {milestones.map(m => (
            <div key={m.id} className="flex items-center gap-3 bg-gray-50/50 hover:bg-gray-50 p-3 rounded-xl border border-gray-100 group transition-colors">
              <input type="checkbox" checked={m.checked} onChange={e => updateMilestone(m.id, m.text, e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-rose-500 focus:ring-rose-500 cursor-pointer transition-colors" />
              <input type="text" value={m.text} onChange={e => updateMilestone(m.id, e.target.value, m.checked)} placeholder="Nhập tên cột mốc..." className={`flex-1 outline-none bg-transparent transition-all ${m.checked ? 'line-through text-gray-400' : 'text-gray-700 font-medium'}`} />
              <button onClick={() => deleteMilestone(m.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 bg-white hover:bg-red-50 rounded-md shadow-sm border border-gray-200 hover:border-red-100"><Trash2 size={14}/></button>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-8 mt-2 mb-2 flex items-center gap-3">
         <div className="h-6 w-1.5 bg-[#82CAFA] rounded-full"></div>
         <h3 className="font-bold text-[#023468] text-xl">Kế hoạch chi tiết</h3>
      </div>
      
      {/* Editor */}
      <div className="-mx-8">
        <NotionEditor
          initialBlocks={page.content?.blocks || []}
          onSave={(blocks) => onSave({ ...page.content, blocks })}
        />
      </div>
    </div>
  );
};
