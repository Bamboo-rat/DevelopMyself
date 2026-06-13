import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { authService } from '~/service/authService';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Gọi API đăng nhập (ApiResponse đã được bọc ở interceptor để trả về .data trực tiếp)
      const res: any = await authService.login(formData);

      if (res.success) {
        // Lưu thông tin user để dùng sau này (hiển thị avatar, tên...)
        if (res.data.user) {
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }

        toast.success('Đăng nhập thành công!');
        // Chuyển hướng vào dashboard
        navigate('/dashboard');
      } else {
        setError(res.message || 'Đăng nhập thất bại.');
      }
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#AED8E6]/20 p-8 rounded-2xl shadow-sm border border-[#AED8E6]/50">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src="/logo-removebg.png" alt="DevMyself Logo" className="h-20 w-auto" />
        </div>

        <h2 className="text-2xl font-bold text-center text-[#023468] mb-6">
          Chào mừng quay lại!
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#023468] mb-1">
              Email
            </label>
            <input
              type="email"
              required
              placeholder="Nhập email của bạn"
              className="w-full px-4 py-3 rounded-lg border border-[#AED8E6] focus:outline-none focus:ring-2 focus:ring-[#82CAFA] text-[#023468] bg-white"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#023468] mb-1">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Nhập mật khẩu"
                className="w-full px-4 py-3 rounded-lg border border-[#AED8E6] focus:outline-none focus:ring-2 focus:ring-[#82CAFA] text-[#023468] bg-white pr-10"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#023468]/60 hover:text-[#023468]"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <a href="#" className="text-sm text-[#82CAFA] hover:text-[#023468] transition-colors">
              Quên mật khẩu?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#82CAFA] hover:bg-[#023468] text-white font-semibold py-3 rounded-lg transition-colors flex justify-center items-center"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="text-center text-sm text-[#023468] mt-6">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-semibold text-[#82CAFA] hover:text-[#023468] transition-colors">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
