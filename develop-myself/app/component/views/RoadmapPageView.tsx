import React, { useState } from 'react';
import { NotionEditor } from '~/component/features/NotionEditor';
import { Route, Plus, Trash2, CheckCircle2, Circle, PlayCircle } from 'lucide-react';

interface RoadmapPageViewProps {
  page: any;
  onSave: (data: any) => void;
}

export const RoadmapPageView = ({ page, onSave }: RoadmapPageViewProps) => {
  const [stages, setStages] = useState<{ id: string, title: string, description: string, status: string, date: string }[]>(page.content?.stages || []);

  const addStage = () => {
    const newStages = [...stages, { id: `stage-${Date.now()}`, title: '', description: '', status: 'TODO', date: '' }];
    setStages(newStages);
    onSave({ ...page.content, stages: newStages });
  };

  const updateStage = (id: string, key: string, value: string) => {
    const newStages = stages.map(s => s.id === id ? { ...s, [key]: value } : s);
    setStages(newStages);
    onSave({ ...page.content, stages: newStages });
  };

  const deleteStage = (id: string) => {
    const newStages = stages.filter(s => s.id !== id);
    setStages(newStages);
    onSave({ ...page.content, stages: newStages });
  };

  const getStatusIcon = (status: string) => {
    if (status === 'DONE') return <CheckCircle2 size={24} className="text-emerald-500 bg-[#FAFBFD]" />;
    if (status === 'IN_PROGRESS') return <PlayCircle size={24} className="text-[#82CAFA] bg-[#FAFBFD]" />;
    return <Circle size={24} className="text-gray-300 bg-[#FAFBFD]" />;
  };

  return (
    <div className="flex-1 flex flex-col px-2 md:px-5 max-w-4xl mx-auto w-full">
      <div className="mb-12">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-bold text-[#023468] text-2xl flex items-center gap-3"><Route size={28} className="text-[#82CAFA]" /> Lộ trình & Các chặng</h3>
          <button onClick={addStage} className="text-sm text-white bg-[#0A529B] hover:bg-[#023468] flex items-center gap-1 font-medium px-4 py-2 rounded-lg transition-colors"><Plus size={16}/> Thêm chặng mới</button>
        </div>

        <div className="relative border-l-2 border-[#AED8E6]/50 ml-4 space-y-6 pb-4">
          {stages.length === 0 && <div className="text-sm text-gray-400 italic ml-8 py-4">Lộ trình trống. Hãy thêm các chặng (stage) để bắt đầu.</div>}
          
          {stages.map((stage, index) => (
            <div key={stage.id} className="relative pl-8 group">
              <div className="absolute -left-3.5 top-4 rounded-full bg-[#FAFBFD]">
                {getStatusIcon(stage.status)}
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-[#82CAFA]/50 transition-all hover:shadow-md">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 mr-4">
                    <input type="text" value={stage.title} onChange={e => updateStage(stage.id, 'title', e.target.value)} placeholder="Tên chặng (Vd: Giai đoạn 1: Lên ý tưởng)" className={`text-lg font-bold outline-none w-full bg-transparent ${stage.status === 'DONE' ? 'text-gray-400 line-through' : 'text-[#023468]'}`} />
                  </div>
                  <div className="flex items-center gap-3">
                    <select value={stage.status} onChange={e => updateStage(stage.id, 'status', e.target.value)} className="text-[10px] font-bold uppercase tracking-wider bg-gray-50 border border-gray-200 text-gray-600 rounded-md p-1.5 outline-none cursor-pointer">
                      <option value="TODO">Sắp tới</option>
                      <option value="IN_PROGRESS">Đang làm</option>
                      <option value="DONE">Đã xong</option>
                    </select>
                    <input type="date" value={stage.date} onChange={e => updateStage(stage.id, 'date', e.target.value)} className="text-xs font-semibold text-gray-500 outline-none cursor-pointer bg-transparent" />
                    <button onClick={() => deleteStage(stage.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 bg-gray-50 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                  </div>
                </div>
                <textarea 
                  value={stage.description} 
                  onChange={e => updateStage(stage.id, 'description', e.target.value)} 
                  placeholder="Mô tả chi tiết mục tiêu của chặng này..." 
                  className="w-full text-sm text-gray-600 outline-none resize-none bg-transparent"
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-8 mt-2 mb-2 flex items-center gap-3">
         <div className="h-6 w-1.5 bg-[#82CAFA] rounded-full"></div>
         <h3 className="font-bold text-[#023468] text-xl">Tài liệu tham khảo & Ghi chú</h3>
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
