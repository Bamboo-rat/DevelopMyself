import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  MoreHorizontal, 
  FileText,
  Search,
  Settings,
  FolderOpen,
  LogOut,
  User as UserIcon,
  Trash2,
  GripVertical,
  Copy,
  Archive,
  Edit2
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { pageService, type PageTreeResponse } from '~/service/pageService';
import { authService } from '~/service/authService';
import toast from 'react-hot-toast';
import { DynamicIcon } from '~/component/ui/DynamicIcon';
import { GlobalSearchModal } from './GlobalSearchModal';
import { SettingsModal } from './SettingsModal';

// Modal Thêm Trang
const CreatePageModal = ({ isOpen, onClose, onSubmit, parentId }: any) => {
  const [title, setTitle] = useState('');
  const [pageType, setPageType] = useState('NOTE');
  
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setPageType('NOTE');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold text-[#023468] mb-4">
          Tạo trang mới
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#023468]/70 mb-1">Tên trang</label>
            <input 
              autoFocus
              type="text" 
              placeholder="Nhập tên trang..." 
              className="w-full px-4 py-2 border border-[#AED8E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#82CAFA] text-[#023468]"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && title.trim()) {
                  onSubmit(title.trim(), parentId, pageType);
                }
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#023468]/70 mb-1">Loại trang</label>
            <select
              value={pageType}
              onChange={e => setPageType(e.target.value)}
              className="w-full px-4 py-2 border border-[#AED8E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#82CAFA] text-[#023468] bg-white"
            >
              <option value="NOTE">Ghi chú (Note)</option>
              <option value="TASK_LIST">Công việc (Task List)</option>
              <option value="PROJECT">Dự án (Project)</option>
              <option value="GOAL">Mục tiêu (Goal)</option>
              <option value="JOURNAL">Nhật ký (Journal)</option>
              <option value="ROADMAP">Lộ trình (Roadmap)</option>
              <option value="KNOWLEDGE">Kiến thức (Knowledge)</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-[#023468]/70 hover:bg-gray-100 rounded-lg transition-colors font-medium">Hủy</button>
          <button 
            disabled={!title.trim()}
            onClick={() => onSubmit(title.trim(), parentId, pageType)} 
            className="px-4 py-2 bg-[#82CAFA] hover:bg-[#023468] text-white rounded-lg transition-colors font-medium disabled:opacity-50"
          >
            Tạo mới
          </button>
        </div>
      </div>
    </div>
  );
}

// Component hiển thị 1 trang
const PageItem = ({ 
  page, index, level = 0, 
  onAddSubPage, onDeletePage, onRenamePage, onDuplicatePage, onArchivePage 
}: { 
  page: PageTreeResponse, index: number, level?: number, 
  onAddSubPage: (parentId: string) => void, 
  onDeletePage: (id: string) => void,
  onRenamePage: (id: string, title: string) => void,
  onDuplicatePage: (id: string) => void,
  onArchivePage: (id: string) => void
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState(page.title);

  const hasChildren = page.children && page.children.length > 0;
  const navigate = useNavigate();

  return (
    <Draggable draggableId={page.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={{ ...provided.draggableProps.style }}
        >
          <div 
            className={`group flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-[#AED8E6]/30 cursor-pointer text-[#023468] transition-colors relative ${snapshot.isDragging ? 'bg-[#F8FBFC] shadow-md z-50 ring-1 ring-[#82CAFA]' : ''}`}
            style={{ paddingLeft: `${level * 12 + 8}px` }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => { setIsHovered(false); setShowOptions(false); }}
          >
            {/* Drag Handle */}
            <div 
              {...provided.dragHandleProps} 
              className={`mr-1 text-[#82CAFA] hover:text-[#0A529B] ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity`}
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical size={14} />
            </div>

            <div 
              className="flex items-center gap-2 overflow-hidden flex-1" 
              onClick={() => navigate(`/dashboard/${page.id}`)}
            >
              {/* Icon Mở/Đóng (chỉ hiện nếu có trang con) */}
              <div 
                className="w-4 flex items-center justify-center shrink-0 text-[#82CAFA] hover:text-[#023468] transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  if (hasChildren) setIsExpanded(!isExpanded);
                }}
              >
                {hasChildren ? (
                  isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                ) : null}
              </div>
              
              {/* Icon & Tên trang */}
              <div className="flex items-center truncate">
                {page.icon && (
                  <span className="mr-2 text-[#023468]">
                    <DynamicIcon name={page.icon} size={16} />
                  </span>
                )}
                {!page.icon && (
                  <span className="mr-2 text-[#82CAFA]">
                    {hasChildren ? <FolderOpen size={16} /> : <FileText size={16} />}
                  </span>
                )}
                {isEditingTitle ? (
                  <input 
                    autoFocus
                    value={editTitleValue}
                    onChange={e => setEditTitleValue(e.target.value)}
                    onBlur={() => {
                      setIsEditingTitle(false);
                      if (editTitleValue.trim() && editTitleValue.trim() !== page.title) {
                        onRenamePage(page.id, editTitleValue.trim());
                      } else {
                        setEditTitleValue(page.title);
                      }
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') e.currentTarget.blur();
                      if (e.key === 'Escape') {
                        setEditTitleValue(page.title);
                        setIsEditingTitle(false);
                      }
                    }}
                    className="text-sm flex-1 bg-white border border-[#AED8E6] outline-none px-1 py-0.5 rounded text-[#023468]"
                    onClick={e => e.stopPropagation()}
                  />
                ) : (
                  <span className="text-sm truncate select-none font-medium text-[#023468]/90">{page.title}</span>
                )}
              </div>
            </div>

            {/* Nút thao tác (hiện khi hover) */}
            <div className={`flex items-center gap-1 shrink-0 ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
              <button 
                className="p-1 hover:bg-[#AED8E6]/50 rounded text-[#023468]/60 hover:text-[#023468]"
                title="Thêm trang con"
                onClick={(e) => { e.stopPropagation(); setIsExpanded(true); onAddSubPage(page.id); }}
              >
                <Plus size={14} />
              </button>
              
              <div className="relative">
                <button 
                  className="p-1 hover:bg-[#AED8E6]/50 rounded text-[#023468]/60 hover:text-[#023468]"
                  title="Tùy chọn"
                  onClick={(e) => { e.stopPropagation(); setShowOptions(!showOptions); }}
                >
                  <MoreHorizontal size={14} />
                </button>
                
                {showOptions && (
                  <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-md shadow-lg border border-[#AED8E6]/40 py-1 z-50">
                    <button 
                      className="w-full text-left px-3 py-1.5 text-sm text-[#023468] hover:bg-[#AED8E6]/50 flex items-center gap-2"
                      onClick={(e) => { e.stopPropagation(); setShowOptions(false); setIsEditingTitle(true); }}
                    >
                      <Edit2 size={14} /> Đổi tên
                    </button>
                    <button 
                      className="w-full text-left px-3 py-1.5 text-sm text-[#023468] hover:bg-[#AED8E6]/50 flex items-center gap-2"
                      onClick={(e) => { e.stopPropagation(); setShowOptions(false); onDuplicatePage(page.id); }}
                    >
                      <Copy size={14} /> Nhân bản
                    </button>
                    <button 
                      className="w-full text-left px-3 py-1.5 text-sm text-[#023468] hover:bg-[#AED8E6]/50 flex items-center gap-2"
                      onClick={(e) => { e.stopPropagation(); setShowOptions(false); onArchivePage(page.id); }}
                    >
                      <Archive size={14} /> Lưu trữ
                    </button>
                    <button 
                      className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100"
                      onClick={(e) => { e.stopPropagation(); setShowOptions(false); onDeletePage(page.id); }}
                    >
                      <Trash2 size={14} /> Xóa trang
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hiển thị đệ quy các trang con */}
          {hasChildren && isExpanded && (
            <Droppable droppableId={page.id} type="PAGE">
              {(provided) => (
                <div 
                  className="mt-0.5"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {page.children.map((child, idx) => (
                    <PageItem 
                      key={child.id} index={idx} page={child} level={level + 1} 
                      onAddSubPage={onAddSubPage} 
                      onDeletePage={onDeletePage} 
                      onRenamePage={onRenamePage}
                      onDuplicatePage={onDuplicatePage}
                      onArchivePage={onArchivePage}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          )}
        </div>
      )}
    </Draggable>
  );
};

const Sidebar = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState<PageTreeResponse[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [targetParentId, setTargetParentId] = useState<string | null>(null);
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    // Phím tắt Ctrl+K mở tìm kiếm
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    // Load thông tin user
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Lắng nghe sự kiện từ PageEditor khi Title hoặc Icon thay đổi
    const handlePageUpdated = () => {
      fetchPages();
    };
    window.addEventListener('page-updated', handlePageUpdated);
    
    // Load cây page
    fetchPages();

    return () => {
      window.removeEventListener('page-updated', handlePageUpdated);
    };
  }, []);

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    try {
      if (source.droppableId === destination.droppableId) {
        // Cùng cấp: Chỉ cập nhật thứ tự
        await pageService.updateSortOrder(draggableId, destination.index);
      } else {
        // Đổi cha
        const newParentId = destination.droppableId === 'root' ? null : destination.droppableId;
        await pageService.moveToParent(draggableId, newParentId);
        
        // Cập nhật thêm sortOrder nếu có
        if (destination.index !== undefined) {
          await pageService.updateSortOrder(draggableId, destination.index);
        }
      }
      fetchPages();
    } catch (err) {
      toast.error('Lỗi khi di chuyển trang');
      console.error(err);
    }
  };

  const fetchPages = async () => {
    try {
      const res: any = await pageService.getPageTree();
      if (res.success) setPages(res.data);
    } catch (err) {
      console.error('Lỗi load danh sách trang', err);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error('Logout failed on backend:', e);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const openCreateModal = (parentId: string | null = null) => {
    setTargetParentId(parentId);
    setModalOpen(true);
  };

  const handleCreatePage = async (title: string, parentId: string | null, pageType: string = 'NOTE') => {
    try {
      const res: any = await pageService.createPage({ title, parentId, pageType });
      if (res.success && res.data) {
        toast.success('Đã tạo trang mới');
        fetchPages();
        // Chuyển hướng ngay tới trang vừa tạo
        navigate(`/dashboard/${res.data.id}`);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Không thể tạo trang');
    } finally {
      setModalOpen(false);
    }
  };

  const handleDeletePage = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa trang này vĩnh viễn?')) return;
    try {
      const res: any = await pageService.deletePage(id);
      if (res.success) {
        toast.success('Đã xóa trang');
        fetchPages();
      }
    } catch (err: any) {
      toast.error(err?.message || 'Không thể xóa trang');
    }
  };

  const handleRenamePage = async (id: string, newTitle: string) => {
    try {
      await pageService.updateTitle(id, newTitle);
      fetchPages();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể đổi tên trang');
    }
  };

  const handleDuplicatePage = async (id: string) => {
    try {
      await pageService.duplicatePage(id);
      toast.success('Đã nhân bản trang');
      fetchPages();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể nhân bản trang');
    }
  };

  const handleArchivePage = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn đưa trang này vào lưu trữ?')) return;
    try {
      await pageService.updateArchive(id, true);
      toast.success('Đã lưu trữ trang');
      fetchPages();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể lưu trữ trang');
    }
  };

  return (
    <div className="w-64 h-screen bg-[#F8FBFC] border-r border-[#AED8E6]/40 flex flex-col shadow-[2px_0_8px_-4px_rgba(2,52,104,0.1)] relative">
      
      {/* Header Workspace */}
      <div className="p-4 flex items-center justify-between border-b border-[#AED8E6]/30">
        <div className=" mx-auto cursor-pointer hover:bg-[#AED8E6]/20 p-1.5 rounded-lg transition-colors">
        <Link to="/dashboard" className="flex items-end gap-2">
        <img src="/logo-removebg.png" alt="Logo" className="h-12 w-auto drop-shadow-sm" />
          <span className="font-bold text-[#023468] text-lg tracking-tight justify-center">DevMyself</span>
        </Link>
          
        </div>
      </div>

      {/* Search & Quick Actions */}
      <div className="px-3 py-4 space-y-1 border-b border-[#AED8E6]/20">
        <button 
          onClick={() => setIsSearchOpen(true)}
          className="w-full flex items-center justify-between px-2 py-1.5 text-sm font-medium text-[#023468]/80 hover:bg-[#AED8E6]/30 rounded-md transition-colors"
        >
          <div className="flex items-center gap-2">
            <Search size={16} className="text-[#82CAFA]" />
            Tìm kiếm
          </div>
          <kbd className="hidden group-hover:block text-[10px] bg-white border border-[#AED8E6] text-[#023468]/60 px-1 rounded">Ctrl K</kbd>
        </button>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-[#023468]/80 hover:bg-[#AED8E6]/30 rounded-md transition-colors"
        >
          <Settings size={16} className="text-[#82CAFA]" />
          Cài đặt
        </button>
      </div>

      {/* Pages Tree Area */}
      <div className="flex-1 overflow-y-auto px-2 py-4 scrollbar-thin scrollbar-thumb-[#AED8E6]/50 scrollbar-track-transparent">
        <div className="flex items-center justify-between px-2 mb-2 group">
          <span className="text-xs font-semibold text-[#023468]/60 uppercase tracking-wider">
            Ghi chú của tôi
          </span>
          <button 
            onClick={() => openCreateModal(null)}
            className="p-1 text-[#023468]/40 hover:text-[#023468] hover:bg-[#AED8E6]/30 rounded transition-colors opacity-0 group-hover:opacity-100"
            title="Thêm trang mới"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="space-y-0.5">
          {pages.length === 0 ? (
            <div className="text-center text-sm text-[#023468]/50 py-4 px-2">
              Chưa có trang nào. Hãy tạo mới!
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="root" type="PAGE">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="min-h-[50px]"
                  >
                    {pages.map((page, index) => (
                      <PageItem 
                        key={page.id} 
                        index={index}
                        page={page} 
                        onAddSubPage={openCreateModal}
                        onDeletePage={handleDeletePage}
                        onRenamePage={handleRenamePage}
                        onDuplicatePage={handleDuplicatePage}
                        onArchivePage={handleArchivePage}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      </div>
      
      {/* Footer / User Info */}
      <div className="p-3 border-t border-[#AED8E6]/30 relative">
        <button 
          onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
          className="w-full flex items-center gap-3 px-2 py-2 hover:bg-[#AED8E6]/20 rounded-lg transition-colors"
        >
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full shadow-sm object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#023468] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <div className="flex flex-col items-start flex-1 min-w-0">
            <span className="text-sm font-semibold text-[#023468] truncate w-full text-left">
              {user?.fullName || 'Đang tải...'}
            </span>
            <span className="text-xs text-[#023468]/60 truncate w-full text-left">
              {user?.email || ''}
            </span>
          </div>
        </button>

        {/* Dropdown User */}
        {isUserDropdownOpen && (
          <div className="absolute bottom-full left-3 w-[calc(100%-24px)] mb-2 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(2,52,104,0.15)] border border-[#AED8E6]/50 py-2 z-50 animate-in slide-in-from-bottom-2 duration-200">
            <button 
              onClick={() => { setIsUserDropdownOpen(false); setIsSettingsOpen(true); }}
              className="w-full px-4 py-2 text-sm text-[#023468] hover:bg-[#AED8E6]/20 flex items-center gap-3 transition-colors text-left font-medium"
            >
              <UserIcon size={16} className="text-[#82CAFA]" /> Hồ sơ của tôi
            </button>
            <div className="h-px bg-[#AED8E6]/30 my-1 mx-2" />
            <button 
              onClick={handleLogout}
              className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors text-left font-medium"
            >
              <LogOut size={16} /> Thoát tài khoản
            </button>
          </div>
        )}
      </div>

      <CreatePageModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSubmit={handleCreatePage}
        parentId={targetParentId}
      />

      <GlobalSearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        user={user}
        onUserUpdate={(u) => setUser(u)}
      />
    </div>
  );
};

export default Sidebar;
