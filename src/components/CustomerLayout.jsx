import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Phone, MapPin, ShieldCheck, Wrench, RotateCcw, Facebook, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export default function CustomerLayout() {
  const { resetDemoData, bookings } = useApp();
  const { loginAsAdmin, loginAsDepartment } = useAuth();
  const navigate = useNavigate();

  const pendingCount = bookings.filter(b => b.status === 'รออนุมัติ').length;

  const handleGoAdmin = () => {
    loginAsAdmin();
    navigate('/admin');
  };

  const handleGoDept = () => {
    loginAsDepartment('ฝ่ายสถานที่', 'ป้าฝ้าย ใจดี');
    navigate('/department');
  };

  const handleReset = () => {
    if (window.confirm('ต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้น (Demo Data) ใช่หรือไม่?')) {
      resetDemoData();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-stone-800">
      {/* แถบสลับ Portal สำหรับทดสอบระบบ 3 ฝั่ง */}
      <div className="bg-[#353432] text-stone-200 text-xs py-2 px-4 border-b border-stone-700">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-medium text-amber-200">โหมดทดสอบระบบ 3 Portals (Real-time LocalStorage):</span>
            <span className="text-stone-300 hidden sm:inline">ขณะนี้คุณอยู่ที่ <strong>ฝั่งลูกค้า (Public)</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleGoAdmin}
              className="px-2.5 py-1 rounded bg-amber-600/90 hover:bg-amber-500 text-white font-medium flex items-center gap-1 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              เข้าฝั่งแอดมิน (Admin)
              {pendingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[10px]">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={handleGoDept}
              className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-medium flex items-center gap-1 transition"
            >
              <Wrench className="w-3.5 h-3.5" />
              เข้าฝั่งแผนกปฏิบัติงาน (Department)
            </button>
            <button
              onClick={handleReset}
              className="px-2.5 py-1 rounded bg-stone-700 hover:bg-stone-600 text-stone-200 flex items-center gap-1 transition"
              title="รีเซ็ตข้อมูลเริ่มต้น"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">รีเซ็ตข้อมูลเริ่มต้น</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navbar หลักตามรูปดีไซน์ */}
      <header className="sticky top-0 z-40 bg-[#FAF6EE]/95 backdrop-blur border-b border-[#E8DEC8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#9E9B95] text-stone-900 font-bold flex items-center justify-center text-sm shadow-inner">
              Logo
            </div>
            <div>
              <p className="font-bold text-stone-800 text-base sm:text-lg leading-tight">วิสาหกิจชุมชนบ้านวิเวก</p>
              <p className="text-xs text-stone-500">ต.หนองหาร อ.สันทราย จ.เชียงใหม่</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-700">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `py-2 border-b-2 transition ${isActive ? 'border-[#9B7B45] text-[#9B7B45] font-semibold' : 'border-transparent hover:text-[#9B7B45]'}`
              }
            >
              หน้าหลัก
            </NavLink>
            <a
              href="/#about-section"
              className="py-2 border-b-2 border-transparent hover:text-[#9B7B45] transition"
            >
              เกี่ยวกับเรา
            </a>
            <NavLink
              to="/packages"
              className={({ isActive }) =>
                `py-2 border-b-2 transition ${isActive ? 'border-[#9B7B45] text-[#9B7B45] font-semibold' : 'border-transparent hover:text-[#9B7B45]'}`
              }
            >
              แพ็กเกจจัดงาน
            </NavLink>
            <NavLink
              to="/portfolio"
              className={({ isActive }) =>
                `py-2 border-b-2 transition ${isActive ? 'border-[#9B7B45] text-[#9B7B45] font-semibold' : 'border-transparent hover:text-[#9B7B45]'}`
              }
            >
              ผลงาน
            </NavLink>
            <NavLink
              to="/check-status"
              className={({ isActive }) =>
                `py-2 border-b-2 transition ${isActive ? 'border-[#9B7B45] text-[#9B7B45] font-semibold' : 'border-transparent hover:text-[#9B7B45]'}`
              }
            >
              ตรวจสอบการจัดงาน
            </NavLink>
          </nav>

          <div className="flex md:hidden items-center gap-2 text-xs">
            <Link to="/packages" className="px-3 py-1.5 rounded-lg bg-[#9B7B45] text-white font-medium">
              แพ็กเกจ
            </Link>
            <Link to="/check-status" className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 font-medium">
              เช็กสถานะ
            </Link>
          </div>
        </div>
      </header>

      {/* เนื้อหาหลัก */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer ตามรูปดีไซน์ */}
      <footer className="bg-[#FAF6EE] border-t border-[#E6DAC3] mt-16 py-10 text-stone-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="md:border-r md:border-stone-300 md:pr-6">
              <h4 className="font-bold text-stone-900 mb-3">บริการ</h4>
              <p className="text-sm leading-relaxed text-stone-600">
                จัดงานศพแบบครบวงจร ที่ดูแลด้วยใจ<br />
                โดยคนในชุมชน เพื่อคนสำคัญของคุณ
              </p>
            </div>

            <div className="md:border-r md:border-stone-300 md:px-6">
              <h4 className="font-bold text-stone-900 mb-3">ช่องทางการติดต่อ</h4>
              <ul className="space-y-2 text-sm text-stone-700">
                <li className="flex items-center gap-2.5">
                  <Facebook className="w-4 h-4 text-stone-800 shrink-0" />
                  <span>กลุ่มรับเหมาจัดงานบ้านวิเวก</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <MessageCircle className="w-4 h-4 text-stone-800 shrink-0" />
                  <span>LINE: กลุ่มรับเหมาจัดงานบ้านวิเวก</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-stone-800 shrink-0" />
                  <span>0123456789</span>
                </li>
              </ul>
              <p className="text-xs text-stone-500 mt-3">ติดต่อได้ทุกวัน 8.00 - 17.00 น.</p>
            </div>

            <div className="flex items-start justify-between gap-4 md:pl-4">
              <div>
                <h4 className="font-bold text-stone-900 mb-3">ที่อยู่</h4>
                <p className="text-sm text-stone-700 leading-relaxed">
                  หมู่ 8 ตำบล หนองหาร<br />
                  อำเภอสันทราย<br />
                  จังหวัดเชียงใหม่ 50290
                </p>
              </div>
              <div className="w-20 h-20 rounded-xl border-2 border-stone-700 flex items-center justify-center bg-white/80 shrink-0">
                <MapPin className="w-10 h-10 text-stone-800" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
