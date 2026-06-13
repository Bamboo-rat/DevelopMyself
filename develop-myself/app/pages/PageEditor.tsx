import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { pageService } from '~/service/pageService';
import { pageTemplateService, type PageTemplateResponse } from '~/service/pageTemplateService';
import toast from 'react-hot-toast';
import { FileText, LayoutTemplate, Loader2, FolderOpen } from 'lucide-react';
import { PageHeader } from '~/component/features/PageHeader';
import { NotePageView } from '~/component/views/NotePageView';
import { TaskBoardView } from '~/component/views/TaskBoardView';

import { GoalPageView } from '~/component/views/GoalPageView';
import { ProjectPageView } from '~/component/views/ProjectPageView';
import { RoadmapPageView } from '~/component/views/RoadmapPageView';
import { JournalPageView } from '~/component/views/JournalPageView';
import { KnowledgePageView } from '~/component/views/KnowledgePageView';

const normalizeContent = (content: any, type: string) => {
  const base = { version: 1, meta: {}, blocks: [] };
  if (!content || Object.keys(content).length === 0) {
    if (type === 'TASK_LIST' || type === 'PROJECT') {
      return { ...base, board: { columns: [{ id: 'todo', title: 'Cần làm', tasks: [] }, { id: 'in-progress', title: 'Đang làm', tasks: [] }, { id: 'done', title: 'Đã xong', tasks: [] }] } };
    }
    return base;
  }

  if (content.version === 1 && content.meta) {
    return content;
  }

  if (content.blocks) {
    return { ...base, blocks: content.blocks };
  }

  if (content.columns) {
    return { ...base, board: { columns: content.columns } };
  }

  return base;
};

const PageRenderer = () => {
  const { pageId } = useParams();
  const [page, setPage] = useState<any>(null);
  const [templates, setTemplates] = useState<PageTemplateResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingTemplate, setApplyingTemplate] = useState(false);

  useEffect(() => {
    if (pageId) {
      fetchPageDetail();
    }
  }, [pageId]);

  const fetchPageDetail = async () => {
    setLoading(true);
    try {
      const res: any = await pageService.getPageDetail(pageId!);
      if (res.success) {
        const normalizedData = {
          ...res.data,
          content: normalizeContent(res.data.content, res.data.pageType)
        };
        setPage(normalizedData);

        if (!res.data.content || Object.keys(res.data.content).length === 0) {
          fetchTemplates();
        }
      }
    } catch (err: any) {
      toast.error('Không thể tải trang');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res: any = await pageTemplateService.getAvailableTemplates();
      if (res.success) {
        setTemplates(res.data);
      }
    } catch (err) {
      console.error('Lỗi load templates', err);
    }
  };

  const getWeekNumber = (d: Date) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return weekNo;
  }

  const handleSelectTemplate = async (template: PageTemplateResponse | null) => {
    setApplyingTemplate(true);
    try {
      let rawContentToSave: any = { version: 1, meta: {}, blocks: [] };

      if (template) {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;

        let templateString = JSON.stringify(template.defaultContent);

        const today = new Date();
        const yyyy = today.getFullYear().toString();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;

        templateString = templateString
          .replace(/{{pageTitle}}/g, page.title || "Trang không tên")
          .replace(/{{userName}}/g, user?.fullName || "Người dùng")
          .replace(/{{today}}/g, todayStr)
          .replace(/{{currentYear}}/g, yyyy)
          .replace(/{{currentMonth}}/g, mm)
          .replace(/{{currentWeek}}/g, getWeekNumber(today).toString());

        const rawContent = JSON.parse(templateString);

        // For old blocknote templates
        if (rawContent.blocks && !rawContent.version) {
          rawContentToSave = {
            version: 1,
            meta: {},
            blocks: rawContent.blocks.map((b: any) => {
              let type = b.type;
              if (type === 'todo') type = 'checkListItem';
              if (type === 'link') type = 'paragraph';

              let text = b.props?.text || "";
              const newProps = { ...b.props };
              delete newProps.text;

              return {
                id: b.id,
                type: type,
                props: newProps,
                content: text ? [{ type: "text", text: text, styles: {} }] : []
              };
            })
          };
        } else if (rawContent.columns) {
          rawContentToSave = {
            version: 1,
            meta: {},
            board: { columns: rawContent.columns },
            blocks: []
          };
        } else {
          rawContentToSave = rawContent;
        }
      }

      const res: any = await pageService.updateContent(pageId!, rawContentToSave);

      if (template && page.pageType !== template.pageType) {
        await pageService.updatePageType(pageId!, template.pageType);
      }

      if (res.success) {
        toast.success(template ? `Đã áp dụng mẫu: ${template.name}` : 'Bắt đầu trang trống');
        fetchPageDetail();
        window.dispatchEvent(new CustomEvent('page-updated'));
      }
    } catch (err: any) {
      toast.error('Lỗi khi áp dụng mẫu');
    } finally {
      setApplyingTemplate(false);
    }
  };

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  const handlePageUpdate = (updatedFields: any) => {
    setPage((prev: any) => ({ ...prev, ...updatedFields }));
  };

  const handleSaveContent = (newContent: any) => {
    setPage((prev: any) => ({ ...prev, content: newContent }));
    setSaveStatus('saving');

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await pageService.updateContent(pageId!, newContent);
        setSaveStatus('saved');
        setTimeout(() => {
          setSaveStatus((prev) => prev === 'saved' ? 'idle' : prev);
        }, 2000);
      } catch (err) {
        toast.error('Lỗi khi lưu tự động');
        setSaveStatus('error');
      }
    }, 3000);
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="animate-spin text-[#82CAFA]" size={32} />
      </div>
    );
  }

  if (!page) {
    return <div className="p-8 text-center text-gray-500">Trang không tồn tại hoặc đã bị xóa.</div>;
  }

  if (page.pageKind === 'FOLDER') {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
        <FolderOpen size={64} className="text-[#82CAFA] mb-6 opacity-80" />
        <h2 className="text-2xl font-bold text-[#023468] mb-3">{page.title}</h2>
        <p className="text-[#023468]/60 max-w-md">
          Đây là một thư mục dùng để nhóm các trang con.
          <br/>
          Vui lòng mở Sidebar bên trái để xem nội dung bên trong thư mục này.
        </p>
      </div>
    );
  }

  const isEmptyPage = !page.content || Object.keys(page.content).length === 0;

  const renderPageView = () => {
    switch (page.pageType) {
      case 'TASK_LIST': return <TaskBoardView page={page} onSave={handleSaveContent} />;
      case 'PROJECT': return <ProjectPageView page={page} onSave={handleSaveContent} />;
      case 'GOAL': return <GoalPageView page={page} onSave={handleSaveContent} />;
      case 'JOURNAL': return <JournalPageView page={page} onSave={handleSaveContent} />;
      case 'ROADMAP': return <RoadmapPageView page={page} onSave={handleSaveContent} />;
      case 'KNOWLEDGE': return <KnowledgePageView page={page} onSave={handleSaveContent} />;
      case 'NOTE':
      default:
        return <NotePageView page={page} onSave={handleSaveContent} />;
    }
  };

  return (
    <div className="h-full flex flex-col p-8 lg:px-8 xl:px-10 animate-in fade-in duration-300">
      <PageHeader page={page} onPageUpdate={handlePageUpdate} saveStatus={saveStatus} />

      {isEmptyPage ? (
        <div className="flex-1">
          <div className="mb-6 text-[#023468]/60 text-lg">
            Nhấn Enter để tiếp tục với trang trống, hoặc chọn một mẫu bên dưới:
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => handleSelectTemplate(null)}
              disabled={applyingTemplate}
              className="flex items-center p-4 border border-[#AED8E6] rounded-xl hover:bg-[#F8FBFC] hover:border-[#82CAFA] transition-all text-left group"
            >
              <div className="w-10 h-10 shrink-0 rounded-lg bg-[#AED8E6]/30 flex items-center justify-center text-[#023468] mr-4 group-hover:scale-110 transition-transform">
                <FileText size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-[#023468] truncate">Trang trống</h4>
                <p className="text-sm text-[#023468]/60 truncate">Bắt đầu từ con số không</p>
              </div>
            </button>

            {templates.map(tpl => (
              <button
                key={tpl.id}
                onClick={() => handleSelectTemplate(tpl)}
                disabled={applyingTemplate}
                className="flex items-center p-4 border border-[#AED8E6] rounded-xl hover:bg-[#F8FBFC] hover:border-[#82CAFA] transition-all text-left group"
              >
                <div className="w-10 h-10 shrink-0 rounded-lg bg-[#82CAFA]/20 flex items-center justify-center text-[#82CAFA] mr-4 group-hover:scale-110 transition-transform">
                  <LayoutTemplate size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-[#023468] truncate">{tpl.name}</h4>
                  <p className="text-sm text-[#023468]/60 truncate">{tpl.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {renderPageView()}
        </>
      )}
    </div>
  );
};

export default PageRenderer;
