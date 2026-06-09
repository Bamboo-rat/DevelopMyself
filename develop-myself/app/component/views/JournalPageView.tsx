import React, { useState } from 'react';
import { NotionEditor } from '~/component/features/NotionEditor';
import { Calendar, Smile, Frown, Meh, Sun, CloudRain, Flame } from 'lucide-react';

interface JournalPageViewProps {
  page: any;
  onSave: (data: any) => void;
}

export const JournalPageView = ({ page, onSave }: JournalPageViewProps) => {
  const [meta, setMeta] = useState(page.content?.meta || {});

  const updateMeta = (key: string, value: any) => {
    const newMeta = { ...meta, [key]: value };
    setMeta(newMeta);
    onSave({ ...page.content, meta: newMeta });
  };

  const getMoodIcon = (mood: string) => {
    if (mood === 'EXCELLENT') return <Sun size={20} className="text-yellow-500" />;
    if (mood === 'GOOD') return <Smile size={20} className="text-emerald-500" />;
    if (mood === 'BAD') return <Frown size={20} className="text-rose-500" />;
    if (mood === 'TERRIBLE') return <CloudRain size={20} className="text-purple-500" />;
    return <Meh size={20} className="text-gray-400" />;
  };

  return (
    <div className="flex-1 flex flex-col px-2 md:px-5 max-w-4xl mx-auto w-full">
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        
        <div className="bg-[#F8FBFC] p-4 rounded-2xl border border-[#AED8E6]/40 flex-1 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm text-[#0A529B]"><Calendar size={20}/></div>
            <div>
              <div className="text-[10px] font-bold text-[#023468]/60 uppercase tracking-wider mb-1">Ngày viết</div>
              <input type="date" value={meta.date || ''} onChange={e => updateMeta('date', e.target.value)} className="bg-transparent font-bold text-[#023468] outline-none cursor-pointer" />
            </div>
          </div>
        </div>

        <div className="bg-[#F8FBFC] p-4 rounded-2xl border border-[#AED8E6]/40 flex-1 flex items-center justify-between">
          <div className="flex items-center gap-3 w-full">
            <div className="p-2 bg-white rounded-xl shadow-sm">
              {getMoodIcon(meta.mood)}
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-bold text-[#023468]/60 uppercase tracking-wider mb-1">Cảm xúc hôm nay</div>
              <select value={meta.mood || 'NEUTRAL'} onChange={e => updateMeta('mood', e.target.value)} className="w-full bg-transparent font-bold text-[#023468] outline-none cursor-pointer">
                <option value="EXCELLENT">Cực kỳ tuyệt vời</option>
                <option value="GOOD">Tốt</option>
                <option value="NEUTRAL">Bình thường</option>
                <option value="BAD">Tệ</option>
                <option value="TERRIBLE">Rất tồi tệ</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-[#F8FBFC] p-4 rounded-2xl border border-[#AED8E6]/40 flex-1 flex items-center justify-between">
          <div className="flex items-center gap-3 w-full">
            <div className="p-2 bg-white rounded-xl shadow-sm text-orange-500"><Flame size={20}/></div>
            <div className="flex-1">
              <div className="text-[10px] font-bold text-[#023468]/60 uppercase tracking-wider mb-1">Độ khó của ngày</div>
              <select value={meta.difficulty || 'NORMAL'} onChange={e => updateMeta('difficulty', e.target.value)} className="w-full bg-transparent font-bold text-[#023468] outline-none cursor-pointer">
                <option value="EASY">Nhẹ nhàng</option>
                <option value="NORMAL">Bình thường</option>
                <option value="HARD">Áp lực / Vất vả</option>
              </select>
            </div>
          </div>
        </div>

      </div>

      <div className="border-t border-gray-100 pt-8 mt-2 mb-2 flex items-center gap-3">
         <div className="h-6 w-1.5 bg-[#82CAFA] rounded-full"></div>
         <h3 className="font-bold text-[#023468] text-xl">Nội dung nhật ký</h3>
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
