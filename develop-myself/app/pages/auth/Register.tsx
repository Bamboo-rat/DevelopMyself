import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { authService } from '~/service/authService';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    if (formData.password !== formData.confirmPassword) {
      setErrors(['Mật khẩu xác nhận không khớp.']);
      return;
    }

    setLoading(true);

    try {
      const res: any = await authService.register({
        fullName: formData.name,
        email: formData.email,
        password: formData.password
      });

      if (res.success) {
        toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
        navigate('/login');
      } else {
        setErrors([res.message || 'Đăng ký thất bại.']);
      }
    } catch (err: any) {
      if (err?.errors) {
        setErrors(Object.values(err.errors) as string[]);
      } else {
        setErrors([err?.message || 'Có lỗi xảy ra, vui lòng thử lại.']);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#AED8E6]/20 p-8 rounded-2xl shadow-sm border border-[#AED8E6]/50">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src="/logo-removebg.png" alt="DevMyself Logo" className="h-16 w-auto" />
        </div>

        <h2 className="text-2xl font-bold text-center text-[#023468] mb-6">
          Tạo tài khoản mới
        </h2>

        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-sm">
            <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
              <AlertCircle size={18} />
              <span>Vui lòng kiểm tra lại:</span>
            </div>
            <ul className="list-disc list-inside text-sm text-red-600/90 ml-1 space-y-1">
              {errors.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#023468] mb-1">Họ và tên</label>
            <input
              type="text"
              required
              placeholder="VD: Nguyễn Văn A"
              className="w-full px-4 py-3 rounded-lg border border-[#AED8E6] focus:outline-none focus:ring-2 focus:ring-[#82CAFA] text-[#023468] bg-white"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#023468] mb-1">Email</label>
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
            <label className="block text-sm font-medium text-[#023468] mb-1">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Tạo mật khẩu"
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

          <div>
            <label className="block text-sm font-medium text-[#023468] mb-1">Xác nhận mật khẩu</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Nhập lại mật khẩu"
                className="w-full px-4 py-3 rounded-lg border border-[#AED8E6] focus:outline-none focus:ring-2 focus:ring-[#82CAFA] text-[#023468] bg-white pr-10"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#82CAFA] hover:bg-[#023468] text-white font-semibold py-3 rounded-lg transition-colors flex justify-center items-center mt-2"
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký tài khoản'}
          </button>
        </form>

        <p className="text-center text-sm text-[#023468] mt-6">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-semibold text-[#82CAFA] hover:text-[#023468] transition-colors">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
