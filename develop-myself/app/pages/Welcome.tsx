import { Link } from 'react-router';
import { ArrowRight, LogIn, UserPlus } from 'lucide-react';

const Welcome = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="px-8 py-6 flex justify-between items-center border-b border-[#AED8E6]/30">
        <div className="flex items-center gap-3">
          <img src="/logo-removebg.png" alt="DevMyself Logo" className="h-12 w-auto" />
          <span className="text-xl font-bold text-[#023468]">DevMyself</span>
        </div>
        <div className="flex gap-4">
          <Link
            to="/login"
            className="px-5 py-2.5 text-[#023468] hover:bg-[#AED8E6]/20 font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <LogIn size={18} />
            Đăng nhập
          </Link>
          <Link
            to="/register"
            className="px-5 py-2.5 bg-[#82CAFA] hover:bg-[#023468] text-white font-medium rounded-lg transition-colors shadow-sm flex items-center gap-2"
          >
            <UserPlus size={18} />
            Đăng ký
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 -mt-10">
        <div className="bg-[#AED8E6]/10 p-4 rounded-full mb-8 inline-block border border-[#AED8E6]/30">
          <img src="/logo-removebg.png" alt="Hero Logo" className="h-28 w-auto hover:scale-105 transition-transform" />
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold text-[#023468] mb-6 tracking-tight max-w-4xl">
          Định hướng sự nghiệp & <br />
          <span className="text-[#82CAFA]">Phát triển bản thân</span>
        </h1>

        <p className="text-lg text-[#023468]/70 mb-10 max-w-2xl leading-relaxed">
          Nền tảng giúp bạn quản lý mục tiêu, ghi chú kiến thức, lên kế hoạch công việc và theo dõi hành trình sự nghiệp một cách thông minh, hiệu quả.
        </p>

        <div className="flex gap-4">
          <Link
            to="/login"
            className="px-8 py-4 bg-[#023468] hover:bg-[#82CAFA] text-white text-lg font-semibold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 group"
          >
            Bắt đầu ngay
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-[#023468]/50 text-sm border-t border-[#AED8E6]/30">
        © {new Date().getFullYear()} DevMyself. All rights reserved.
      </footer>
    </div>
  )
}

export default Welcome
