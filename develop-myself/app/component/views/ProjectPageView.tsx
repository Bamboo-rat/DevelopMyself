import React, { useState } from 'react';
import { NotionEditor } from '~/component/features/NotionEditor';
import { Briefcase, Calendar, GitBranch, Globe, Link as LinkIcon, Plus, Trash2, CheckCircle2, Clock, Circle } from 'lucide-react';

interface ProjectPageViewProps {
  page: any;
  onSave: (data: any) => void;
}

export const ProjectPageView = ({ page, onSave }: ProjectPageViewProps) => {
  const [meta, setMeta] = useState(page.content?.meta || {});
  const [linkedPages, setLinkedPages] = useState<{ id: string, title: string, url: string }[]>(page.content?.linkedPages || []);

  const updateMeta = (key: string, value: any) => {
    const newMeta = { ...meta, [key]: value };
    setMeta(newMeta);
    onSave({ ...page.content, meta: newMeta, linkedPages });
  };

  const updateTaskSummary = (key: 'todo'|'inProgress'|'done', value: number) => {
    const newTasks = { ...(meta.tasks || { todo: 0, inProgress: 0, done: 0 }), [key]: value };
    updateMeta('tasks', newTasks);
  };

  const addLinkedPage = () => {
    const newLinks = [...linkedPages, { id: `link-${Date.now()}`, title: '', url: '' }];
    setLinkedPages(newLinks);
    onSave({ ...page.content, meta, linkedPages: newLinks });
  };

  const updateLinkedPage = (id: string, key: 'title'|'url', value: string) => {
    const newLinks = linkedPages.map(l => l.id === id ? { ...l, [key]: value } : l);
    setLinkedPages(newLinks);
    onSave({ ...page.content, meta, linkedPages: newLinks });
  };

  const deleteLinkedPage = (id: string) => {
    const newLinks = linkedPages.filter(l => l.id !== id);
    setLinkedPages(newLinks);
    onSave({ ...page.content, meta, linkedPages: newLinks });
  };

  return (
    <div className="flex-1 flex flex-col px-2 md:px-8 max-w-5xl mx-auto w-full">
      {/* Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        
        {/* Left Column: Meta & Links */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Trạng thái dự án</label>
                <select value={meta.status || 'PLANNING'} onChange={e => updateMeta('status', e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#82CAFA] focus:border-[#82CAFA] block p-2 outline-none font-semibold cursor-pointer">
                  <option value="PLANNING">Lên kế hoạch</option>
                  <option value="IN_PROGRESS">Đang triển khai</option>
                  <option value="MAINTENANCE">Bảo trì</option>
                  <option value="COMPLETED">Đã hoàn thành</option>
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Bắt đầu</label>
                  <input type="date" value={meta.startDate || ''} onChange={e => updateMeta('startDate', e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2 outline-none cursor-pointer font-medium" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Kết thúc</label>
                  <input type="date" value={meta.endDate || ''} onChange={e => updateMeta('endDate', e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2 outline-none cursor-pointer font-medium" />
                </div>
              </div>
            </div>

            <div className="w-px bg-gray-100 hidden sm:block"></div>

            <div className="flex-1 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1 mb-1"><GitBranch size={12}/> GitHub Repo</label>
                <input type="text" placeholder="https://github.com/..." value={meta.githubUrl || ''} onChange={e => updateMeta('githubUrl', e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2 outline-none focus:border-[#82CAFA]" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1 mb-1"><Globe size={12}/> Live Demo</label>
                <input type="text" placeholder="https://..." value={meta.demoUrl || ''} onChange={e => updateMeta('demoUrl', e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2 outline-none focus:border-[#82CAFA]" />
              </div>
            </div>
          </div>

          {/* Linked Pages */}
          <div className="bg-[#F8FBFC] p-6 rounded-2xl border border-[#AED8E6]/40">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-[#023468] flex items-center gap-2"><LinkIcon size={18} /> Tài nguyên / Trang liên kết</h3>
              <button onClick={addLinkedPage} className="text-sm text-[#0A529B] hover:text-[#023468] flex items-center gap-1 font-medium"><Plus size={16}/> Thêm Link</button>
            </div>
            <div className="space-y-2">
              {linkedPages.length === 0 && <p className="text-sm text-gray-400 italic">Chưa có liên kết nào.</p>}
              {linkedPages.map(link => (
                <div key={link.id} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 group shadow-sm transition-all hover:border-blue-200">
                  <input type="text" placeholder="Tên trang..." value={link.title} onChange={e => updateLinkedPage(link.id, 'title', e.target.value)} className="w-1/3 bg-transparent text-sm font-medium outline-none border-r border-gray-100 pr-2" />
                  <input type="text" placeholder="URL..." value={link.url} onChange={e => updateLinkedPage(link.id, 'url', e.target.value)} className="flex-1 bg-transparent text-sm text-blue-500 outline-none px-2" />
                  <a href={link.url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-500 p-1"><Globe size={14}/></a>
                  <button onClick={() => deleteLinkedPage(link.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 p-1"><Trash2 size={14}/></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Task Summary */}
        <div className="bg-gradient-to-b from-[#023468] to-[#0A529B] p-6 rounded-2xl shadow-lg text-white">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Briefcase size={20} className="text-[#82CAFA]" /> Tổng quan Task</h3>
          
          <div className="space-y-5">
            <div className="bg-white/10 p-4 rounded-xl border border-white/10 flex items-center justify-between backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Circle size={18} className="text-gray-300" />
                <span className="font-medium text-sm">Cần làm</span>
              </div>
              <input type="number" min="0" value={meta.tasks?.todo || 0} onChange={e => updateTaskSummary('todo', parseInt(e.target.value) || 0)} className="w-12 bg-transparent text-right font-bold text-xl outline-none" />
            </div>

            <div className="bg-white/10 p-4 rounded-xl border border-white/10 flex items-center justify-between backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-[#82CAFA]" />
                <span className="font-medium text-sm">Đang làm</span>
              </div>
              <input type="number" min="0" value={meta.tasks?.inProgress || 0} onChange={e => updateTaskSummary('inProgress', parseInt(e.target.value) || 0)} className="w-12 bg-transparent text-right font-bold text-xl outline-none text-[#82CAFA]" />
            </div>

            <div className="bg-white/10 p-4 rounded-xl border border-white/10 flex items-center justify-between backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-emerald-500/10"></div>
              <div className="flex items-center gap-3 relative z-10">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <span className="font-medium text-sm">Đã xong</span>
              </div>
              <input type="number" min="0" value={meta.tasks?.done || 0} onChange={e => updateTaskSummary('done', parseInt(e.target.value) || 0)} className="w-12 bg-transparent text-right font-bold text-xl outline-none text-emerald-400 relative z-10" />
            </div>
          </div>

          {/* Progress Mini Bar */}
          {(() => {
            const t = meta.tasks?.todo || 0;
            const p = meta.tasks?.inProgress || 0;
            const d = meta.tasks?.done || 0;
            const total = t + p + d;
            const percent = total === 0 ? 0 : Math.round((d / total) * 100);
            return (
              <div className="mt-8">
                <div className="flex justify-between text-xs font-semibold text-white/70 mb-2">
                  <span>Tiến độ dự án</span>
                  <span>{percent}%</span>
                </div>
                <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 transition-all duration-500" style={{ width: `${percent}%` }}></div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-8 mt-2 mb-2 flex items-center gap-3">
         <div className="h-6 w-1.5 bg-[#82CAFA] rounded-full"></div>
         <h3 className="font-bold text-[#023468] text-xl">Chi tiết & Ghi chú dự án</h3>
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
