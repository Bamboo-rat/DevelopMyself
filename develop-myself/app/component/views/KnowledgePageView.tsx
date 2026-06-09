import React, { useMemo } from 'react';
import { NotionEditor } from '~/component/features/NotionEditor';
import { BookOpen, Hash } from 'lucide-react';

interface KnowledgePageViewProps {
  page: any;
  onSave: (data: any) => void;
}

export const KnowledgePageView = ({ page, onSave }: KnowledgePageViewProps) => {
  const blocks = page.content?.blocks || [];

  const toc = useMemo(() => {
    const headings: { id: string, text: string, level: number }[] = [];
    blocks.forEach((block: any) => {
      if (block.type === 'heading' && (block.props?.level == 1 || block.props?.level == 2 || block.props?.level == 3)) {
        let text = '';
        if (Array.isArray(block.content)) {
          text = block.content.map((c: any) => c.text || c.textContent || '').join('');
        } else if (typeof block.content === 'string') {
          text = block.content;
        }
        if (text) {
          headings.push({ id: block.id, text, level: parseInt(block.props.level) || 1 });
        }
      }
    });
    return headings;
  }, [blocks]);

  const handleScrollToBlock = (id: string) => {
    // BlockNote editor renders blocks with data-id attributes
    const el = document.querySelector(`[data-id="${id}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-8 px-2 md:px-8 max-w-7xl mx-auto w-full relative">
      
      {/* Editor Content */}
      <div className="flex-1 min-w-0 -mx-8 lg:mx-0">
        <NotionEditor
          initialBlocks={blocks}
          onSave={(newBlocks) => onSave({ ...page.content, blocks: newBlocks })}
        />
      </div>

      {/* Table of Contents - Right Sidebar */}
      <div className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-8 bg-[#F8FBFC] p-6 rounded-2xl border border-[#AED8E6]/40 max-h-[80vh] overflow-y-auto custom-scrollbar shadow-sm">
          <h4 className="font-bold text-[#023468] flex items-center gap-2 mb-6 text-sm uppercase tracking-wider border-b border-[#AED8E6]/50 pb-3">
            <BookOpen size={16} className="text-[#82CAFA]" /> Mục lục bài viết
          </h4>
          
          {toc.length === 0 ? (
            <div className="text-sm text-gray-400 italic">Chưa có tiêu đề H1/H2 nào trong bài viết.</div>
          ) : (
            <ul className="space-y-3">
              {toc.map((heading) => (
                <li 
                  key={heading.id} 
                  className={`text-sm cursor-pointer hover:text-[#0A529B] transition-colors flex items-start ${heading.level === 1 ? 'font-semibold text-gray-800' : 'text-gray-500 pl-4 border-l-2 border-[#AED8E6]/50 hover:border-[#82CAFA]'}`}
                  onClick={() => handleScrollToBlock(heading.id)}
                >
                  <span className="flex items-start gap-1.5 mt-0.5">
                    {heading.level === 1 && <Hash size={14} className="opacity-40 text-[#023468] mt-0.5" />}
                    <span className="leading-snug">{heading.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
    </div>
  );
};
