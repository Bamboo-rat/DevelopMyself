import React, { useState, useEffect } from 'react';
import { pageService } from '~/service/pageService';
import toast from 'react-hot-toast';
import { Smile } from 'lucide-react';
import { DynamicIcon, AVAILABLE_ICONS } from '~/component/ui/DynamicIcon';

interface PageHeaderProps {
  page: any;
  onPageUpdate: (updatedFields: any) => void;
}

export const PageHeader = ({ page, onPageUpdate }: PageHeaderProps) => {
  const [localTitle, setLocalTitle] = useState(page.title || '');
  const [showIconPicker, setShowIconPicker] = useState(false);

  // Sync when page changes from parent
  useEffect(() => {
    setLocalTitle(page.title || '');
  }, [page.id]);

  // Tự động lưu tiêu đề khi ngừng gõ 500ms
  useEffect(() => {
    if (localTitle !== page.title && localTitle.trim() !== '') {
      const timer = setTimeout(async () => {
        try {
          await pageService.updateTitle(page.id, localTitle);
          onPageUpdate({ title: localTitle });
          window.dispatchEvent(new CustomEvent('page-updated'));
        } catch (err) {
          toast.error('Lỗi khi lưu tên trang');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [localTitle, page.id, page.title, onPageUpdate]);

  const handleIconSelect = async (iconName: string) => {
    try {
      setShowIconPicker(false);
      await pageService.updateIcon(page.id, iconName);
      onPageUpdate({ icon: iconName });
      window.dispatchEvent(new CustomEvent('page-updated'));
    } catch (err) {
      toast.error('Lỗi khi lưu Icon');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="mb-8 group relative animate-in fade-in duration-300">
      {/* Thông tin Meta: Type & Updated At */}
      <div className="flex items-center gap-3 mb-6">
        <span className="px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase bg-[#E8F1F5] text-[#0A529B] rounded-md border border-[#AED8E6]/50">
          {page.pageType || 'NOTE'}
        </span>
        {page.updatedAt && (
          <span className="text-xs text-[#023468]/50 font-medium">
            Last updated: {formatDate(page.updatedAt)}
          </span>
        )}
      </div>

      {/* Khu vực Icon & Title Inline */}
      <div className="flex items-center gap-4 mb-4">
        {/* Icon */}
        <div className="relative shrink-0">
          {page.icon ? (
            <div
              className="text-[#023468] cursor-pointer hover:bg-[#F8FBFC] border border-transparent hover:border-[#AED8E6] rounded-xl p-3 transition-colors flex items-center justify-center"
              onClick={() => setShowIconPicker(!showIconPicker)}
            >
              <DynamicIcon name={page.icon} size={48} />
            </div>
          ) : (
            <button
              onClick={() => setShowIconPicker(!showIconPicker)}
              className="flex items-center text-[#023468]/40 hover:text-[#023468] hover:bg-[#F8FBFC] px-3 py-1.5 rounded-lg transition-colors group/iconbtn opacity-0 group-hover:opacity-100 font-medium text-sm border border-transparent hover:border-[#AED8E6]"
            >
              <Smile size={16} className="mr-2 group-hover/iconbtn:scale-110 transition-transform" /> Thêm icon
            </button>
          )}

          {/* Icon Picker Popup */}
          {showIconPicker && (
            <div className="absolute top-full left-0 mt-2 p-4 bg-white rounded-2xl shadow-xl border border-[#AED8E6]/50 w-72 z-50 animate-in zoom-in-95 duration-200">
              <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {AVAILABLE_ICONS.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => handleIconSelect(icon)}
                    className="p-3 hover:bg-[#F8FBFC] rounded-xl flex items-center justify-center text-[#023468]/70 hover:text-[#023468] hover:scale-110 transition-all border border-transparent hover:border-[#AED8E6]"
                  >
                    <DynamicIcon name={icon} size={22} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Title */}
        <input
          type="text"
          placeholder="Trang không tên"
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          className="flex-1 min-w-0 text-5xl font-extrabold bg-transparent outline-none text-[#023468] placeholder:text-[#023468]/20 focus:bg-[#F8FBFC] hover:bg-[#F8FBFC]/50 px-3 py-2 rounded-xl transition-colors border border-transparent focus:border-[#AED8E6]"
        />
      </div>
    </div>
  );
};
