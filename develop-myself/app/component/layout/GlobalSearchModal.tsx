import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, Target, Map, BookOpen, KanbanSquare, X, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router';
import { pageService, type PageTreeResponse } from '~/service/pageService';
import { DynamicIcon } from '~/component/ui/DynamicIcon';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PAGE_TYPES = [
  { value: '', label: 'Tất cả' },
  { value: 'NOTE', label: 'Ghi chú' },
  { value: 'PROJECT', label: 'Dự án' },
  { value: 'GOAL', label: 'Mục tiêu' },
  { value: 'ROADMAP', label: 'Lộ trình' },
  { value: 'JOURNAL', label: 'Nhật ký' },
];

export const GlobalSearchModal = ({ isOpen, onClose }: GlobalSearchModalProps) => {
  const [keyword, setKeyword] = useState('');
  const [activeType, setActiveType] = useState('');
  const [results, setResults] = useState<PageTreeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setKeyword('');
      setResults([]);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res: any = await pageService.searchPages(keyword, activeType || undefined);
        if (res.success) {
          setResults(res.data || []);
        }
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [keyword, activeType, isOpen]);

  if (!isOpen) return null;

  const handleSelect = (id: string) => {
    navigate(`/dashboard/${id}`);
    onClose();
  };

  const getPageIcon = (page: PageTreeResponse) => {
    if (page.icon) return <DynamicIcon name={page.icon} size={18} />;
    
    switch (page.pageType) {
      case 'NOTE': return <FileText size={18} />;
      case 'GOAL': return <Target size={18} />;
      case 'ROADMAP': return <Map size={18} />;
      case 'JOURNAL': return <BookOpen size={18} />;
      case 'PROJECT': return <KanbanSquare size={18} />;
      default: return <FileText size={18} />;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] bg-[#023468]/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#AED8E6]/50"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center px-4 py-4 border-b border-[#AED8E6]/30">
          <Search size={22} className="text-[#82CAFA] mr-3" />
          <input
            ref={inputRef}
            className="flex-1 text-lg outline-none bg-transparent text-[#023468] placeholder-[#023468]/40"
            placeholder="Tìm kiếm tài liệu, dự án, mục tiêu..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') onClose();
            }}
          />
          <button 
            onClick={onClose}
            className="p-1 rounded hover:bg-[#F8FBFC] text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters */}
        <div className="px-4 py-2 bg-[#F8FBFC] flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-[#AED8E6]/20">
          {PAGE_TYPES.map(type => (
            <button
              key={type.value}
              onClick={() => setActiveType(type.value)}
              className={`px-3 py-1 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                activeType === type.value 
                  ? 'bg-[#0A529B] text-white shadow-sm' 
                  : 'text-[#023468]/70 hover:bg-[#AED8E6]/30'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {isLoading ? (
            <div className="py-10 text-center text-[#023468]/50 text-sm">Đang tìm kiếm...</div>
          ) : results.length === 0 ? (
            <div className="py-10 text-center text-[#023468]/50 text-sm">
              {keyword ? 'Không tìm thấy kết quả phù hợp.' : 'Hãy nhập từ khóa để tìm kiếm.'}
            </div>
          ) : (
            <div className="space-y-1">
              {results.map(page => (
                <div 
                  key={page.id}
                  onClick={() => handleSelect(page.id)}
                  className="flex items-center p-3 hover:bg-[#F8FBFC] rounded-xl cursor-pointer group transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#AED8E6]/20 flex items-center justify-center text-[#0A529B] group-hover:bg-[#82CAFA] group-hover:text-white transition-colors mr-3 shrink-0">
                    {getPageIcon(page)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[#023468] font-medium truncate">{page.title}</div>
                    <div className="text-xs text-[#023468]/50 truncate uppercase tracking-wider mt-0.5">
                      {PAGE_TYPES.find(t => t.value === page.pageType)?.label || page.pageType}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Đi tới ↵
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer info */}
        <div className="bg-[#F8FBFC] px-4 py-2 border-t border-[#AED8E6]/20 flex items-center justify-between text-xs text-[#023468]/50">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><kbd className="bg-white border border-[#AED8E6]/50 rounded px-1.5 py-0.5 shadow-sm">↑↓</kbd> để chọn</span>
            <span className="flex items-center gap-1"><kbd className="bg-white border border-[#AED8E6]/50 rounded px-1.5 py-0.5 shadow-sm">↵</kbd> để mở</span>
            <span className="flex items-center gap-1"><kbd className="bg-white border border-[#AED8E6]/50 rounded px-1.5 py-0.5 shadow-sm">Esc</kbd> để đóng</span>
          </div>
        </div>
      </div>
    </div>
  );
};
