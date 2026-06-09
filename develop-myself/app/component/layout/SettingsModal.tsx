import React, { useState, useRef, useEffect } from 'react';
import { X, User, Shield, Camera, Loader2, LogOut } from 'lucide-react';
import { userService } from '~/service/userService';
import toast from 'react-hot-toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUserUpdate: (newUser: any) => void;
}

export const SettingsModal = ({ isOpen, onClose, user, onUserUpdate }: SettingsModalProps) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  
  // Profile state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password state
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Ảnh tải lên không được vượt quá 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const res: any = await userService.uploadFile(file);
      if (res.success && res.data?.url) {
        setAvatarUrl(res.data.url);
        toast.success('Tải ảnh thành công');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi khi tải ảnh lên');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      toast.error('Tên không được để trống');
      return;
    }

    setIsSavingProfile(true);
    try {
      const res: any = await userService.updateProfile({ fullName, avatarUrl });
      if (res.success) {
        toast.success('Đã cập nhật hồ sơ');
        const updatedUser = { ...user, fullName, avatarUrl };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        onUserUpdate(updatedUser);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi khi cập nhật hồ sơ');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePassword = async () => {
    if (!passwords.oldPassword || !passwords.newPassword || !passwords.confirmPassword) {
      toast.error('Vui lòng điền đủ thông tin');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsSavingPassword(true);
    try {
      const res: any = await userService.changePassword({
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
        confirmPassword: passwords.confirmPassword
      });
      if (res.success) {
        toast.success('Đổi mật khẩu thành công');
        setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi khi đổi mật khẩu');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#023468]/30 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-3xl h-[600px] bg-white rounded-2xl shadow-2xl flex overflow-hidden border border-[#AED8E6]/50 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        
        {/* Sidebar */}
        <div className="w-64 bg-[#F8FBFC] border-r border-[#AED8E6]/40 p-4 flex flex-col">
          <h2 className="text-xl font-bold text-[#023468] mb-6 px-2">Cài đặt</h2>
          
          <div className="flex flex-col gap-1 flex-1">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-[#AED8E6]/30 text-[#0A529B]' : 'text-[#023468]/70 hover:bg-[#AED8E6]/10'}`}
            >
              <User size={18} /> Hồ sơ cá nhân
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'security' ? 'bg-[#AED8E6]/30 text-[#0A529B]' : 'text-[#023468]/70 hover:bg-[#AED8E6]/10'}`}
            >
              <Shield size={18} /> Bảo mật & Mật khẩu
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col relative bg-white">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors z-10">
            <X size={20} />
          </button>

          <div className="flex-1 overflow-y-auto p-10">
            {activeTab === 'profile' && (
              <div className="max-w-md mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-2xl font-bold text-[#023468] mb-8">Hồ sơ cá nhân</h3>
                
                {/* Avatar Upload */}
                <div className="flex flex-col items-center mb-8">
                  <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#AED8E6]/50 shadow-md">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#023468] text-white flex items-center justify-center text-3xl font-bold">
                          {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                    </div>
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                      {isUploading ? (
                        <Loader2 size={24} className="text-white animate-spin" />
                      ) : (
                        <Camera size={24} className="text-white" />
                      )}
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <div className="mt-3 text-sm text-[#023468]/60">Nhấp vào ảnh để thay đổi</div>
                </div>

                {/* Form Fields */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-[#023468]/60 uppercase tracking-wider mb-2">Tên hiển thị</label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F8FBFC] border border-[#AED8E6]/60 rounded-xl outline-none focus:ring-2 focus:ring-[#82CAFA] focus:bg-white text-[#023468] transition-all"
                      placeholder="Nhập tên của bạn"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-[#023468]/60 uppercase tracking-wider mb-2">Email (Đăng nhập)</label>
                    <input 
                      type="email" 
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  <div className="pt-6">
                    <button 
                      onClick={handleSaveProfile}
                      disabled={isSavingProfile || isUploading}
                      className="w-full py-3 bg-[#0A529B] hover:bg-[#023468] disabled:bg-[#0A529B]/50 text-white rounded-xl font-medium shadow-md transition-colors flex items-center justify-center gap-2"
                    >
                      {isSavingProfile ? <Loader2 size={18} className="animate-spin" /> : 'Lưu thay đổi'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="max-w-md mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-2xl font-bold text-[#023468] mb-8">Đổi mật khẩu</h3>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-[#023468]/60 uppercase tracking-wider mb-2">Mật khẩu hiện tại</label>
                    <input 
                      type="password" 
                      value={passwords.oldPassword}
                      onChange={e => setPasswords({...passwords, oldPassword: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[#F8FBFC] border border-[#AED8E6]/60 rounded-xl outline-none focus:ring-2 focus:ring-[#82CAFA] focus:bg-white text-[#023468] transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-[#023468]/60 uppercase tracking-wider mb-2">Mật khẩu mới</label>
                    <input 
                      type="password" 
                      value={passwords.newPassword}
                      onChange={e => setPasswords({...passwords, newPassword: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[#F8FBFC] border border-[#AED8E6]/60 rounded-xl outline-none focus:ring-2 focus:ring-[#82CAFA] focus:bg-white text-[#023468] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#023468]/60 uppercase tracking-wider mb-2">Xác nhận mật khẩu mới</label>
                    <input 
                      type="password" 
                      value={passwords.confirmPassword}
                      onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[#F8FBFC] border border-[#AED8E6]/60 rounded-xl outline-none focus:ring-2 focus:ring-[#82CAFA] focus:bg-white text-[#023468] transition-all"
                    />
                  </div>

                  <div className="pt-6">
                    <button 
                      onClick={handleSavePassword}
                      disabled={isSavingPassword}
                      className="w-full py-3 bg-[#0A529B] hover:bg-[#023468] disabled:bg-[#0A529B]/50 text-white rounded-xl font-medium shadow-md transition-colors flex items-center justify-center gap-2"
                    >
                      {isSavingPassword ? <Loader2 size={18} className="animate-spin" /> : 'Cập nhật mật khẩu'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
