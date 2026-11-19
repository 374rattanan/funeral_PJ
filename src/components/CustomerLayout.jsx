import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Phone, ShieldCheck, Wrench, Facebook, MessageCircle, Lock, X, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { IS_DEMO_MODE, SITE_CONFIG, normalizeDepartmentName } from '../config/siteConfig';

export default function CustomerLayout() {
  const { departments, staff } = useApp();
  const { user, loginWithCredentials, loginAsDepartment } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [showStaffModal, setShowStaffModal] = useState(false);
  const [loginRole, setLoginRole] = useState('ADMIN'); // 'ADMIN' | 'DEPARTMENT'
  const [username, setUsername] = useState(IS_DEMO_MODE ? 'admin' : '');
  const [password, setPassword] = useState(IS_DEMO_MODE ? 'admin1234' : '');
  const [selectedDept, setSelectedDept] = useState(departments?.[0] || 'ฝ่ายสถานที่');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // ซิงก์ selectedDept เมื่อรายการแผนกโหลดจาก Supabase
  useEffect(() => {
    if (departments?.length > 0 && !departments.includes(selectedDept)) {
      setSelectedDept(departments[0]);
    }
  }, [departments, selectedDept]);

  useEffect(() => {
    const loginParam = searchParams.get('login');
    if (loginParam === 'admin' || loginParam === 'department') {
      const nextRole = loginParam === 'department' ? 'DEPARTMENT' : 'ADMIN';
      setLoginRole(nextRole);
      if (IS_DEMO_MODE) {
        setUsername(nextRole === 'ADMIN' ? 'admin' : 'venue_dept');
        setPassword(nextRole === 'ADMIN' ? 'admin1234' : 'dept1234');
      } else {
        setUsername('');
        setPassword('');
      }
      setShowStaffModal(true);
      setLoginError('กรุณาเข้าสู่ระบบสำหรับเจ้าหน้าที่ก่อนเข้าใช้งานส่วนจัดการระบบ');
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('login');
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleOpenStaffPortal = () => {
    if (user?.role === 'admin') {
      navigate('/admin');
      return;
    }
    if (user?.role === 'department') {
      navigate('/department');
      return;
    }
    setLoginError('');
    setShowStaffModal(true);
  };

  const handleCloseModal = () => {
    setShowStaffModal(false);
    setLoginError('');
  };

  const handleSwitchLoginRole = (role) => {
    setLoginRole(role);
    setLoginError('');
    if (IS_DEMO_MODE) {
      setUsername(role === 'ADMIN' ? 'admin' : 'venue_dept');
      setPassword(role === 'ADMIN' ? 'admin1234' : 'dept1234');
    } else {
      setUsername('');
      setPassword('');
    }
  };

  const handleGoAboutSection = (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    }
  };

  const handleStaffLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      if (loginRole === 'ADMIN') {
        const res = await loginWithCredentials(username, password, 'admin');
        if (!res.ok) {
          setLoginError(res.message || 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
          return;
        }
        handleCloseModal();
        navigate('/admin');
      } else {
        // โหมดใช้งานจริง: ล็อกอินด้วย username + password จากตาราง users_auth
        if (!IS_DEMO_MODE) {
          const res = await loginWithCredentials(username, password, 'department');
          if (!res.ok) {
            setLoginError(res.message || 'ชื่อผู้ใช้หรือรหัสผ่านประจำฝ่ายไม่ถูกต้อง');
            return;
          }
          handleCloseModal();
          navigate('/department');
          return;
        }

        // โหมดเดโม: รองรับทั้งกรอกบัญชี users_auth หรือเลือกฝ่าย + รหัสผ่าน (dept1234 / 123456)
        if (password === 'dept1234' || password === '123456') {
          const normDept = normalizeDepartmentName(selectedDept);
          const deptStaff = (staff || []).find(s => normalizeDepartmentName(s.department) === normDept);
          const staffFullName = deptStaff ? `${deptStaff.prefix || ''}${deptStaff.fullName}` : `เจ้าหน้าที่${normDept}`;
          handleCloseModal();
          loginAsDepartment(normDept, staffFullName);
          navigate('/department');
          return;
        }
        setLoginError('รหัสผ่านประจำฝ่ายไม่ถูกต้อง (โหมดสาธิตใช้ dept1234 หรือ 123456)');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-stone-800">
      {/* Navbar หลัก */}
      <header className="no-print sticky top-0 z-40 bg-[#FAF6EE]/95 backdrop-blur border-b border-[#E8DEC8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C8A46B] to-[#9B7B45] text-white font-bold flex items-center justify-center text-base shadow-inner">
              บว
            </div>
            <div>
              <p className="font-bold text-stone-800 text-base sm:text-lg leading-tight">{SITE_CONFIG.brandName}</p>
              <p className="text-xs text-stone-500">ต.หนองหาร อ.สันทราย จ.เชียงใหม่</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-700">
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
              onClick={handleGoAboutSection}
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

          {/* Mobile Navbar ครบทุกเมนูหลัก */}
          <div className="flex md:hidden items-center gap-1.5 text-xs">
            <Link to="/packages" className="px-2.5 py-1.5 rounded-lg bg-[#9B7B45] text-white font-medium">
              แพ็กเกจ
            </Link>
            <Link to="/portfolio" className="px-2.5 py-1.5 rounded-lg border border-stone-300 text-stone-700 font-medium">
              ผลงาน
            </Link>
            <Link to="/check-status" className="px-2.5 py-1.5 rounded-lg border border-stone-300 text-stone-700 font-medium">
              สถานะ
            </Link>
          </div>
        </div>
      </header>

      {/* เนื้อหาหลัก */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="no-print bg-[#FAF6EE] border-t border-[#E6DAC3] mt-16 py-10 text-stone-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 items-stretch md:divide-x md:divide-stone-300">
            <div className="md:pr-8">
              <h4 className="font-bold text-stone-900 mb-3">บริการ</h4>
              <p className="text-sm leading-relaxed text-stone-600">
                จัดงานศพแบบครบวงจร ที่ดูแลด้วยใจ<br />
                โดยคนในชุมชน เพื่อคนสำคัญของคุณ
              </p>
              <button
                type="button"
                onClick={handleOpenStaffPortal}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#9B7B45] hover:underline"
              >
                <Lock className="w-3.5 h-3.5" />
                {user ? 'กลับเข้าสู่ระบบเจ้าหน้าที่' : 'เข้าสู่ระบบสำหรับเจ้าหน้าที่'}
              </button>
            </div>

            <div className="md:px-8">
              <h4 className="font-bold text-stone-900 mb-3">ช่องทางการติดต่อ</h4>
              <ul className="space-y-2 text-sm text-stone-700">
                <li className="flex items-center gap-2.5">
                  <Facebook className="w-4 h-4 text-stone-800 shrink-0" />
                  <span>กลุ่มรับเหมาจัดงานบ้านวิเวก</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <MessageCircle className="w-4 h-4 text-stone-800 shrink-0" />
                  <span>LINE: {SITE_CONFIG.contactLine}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-stone-800 shrink-0" />
                  <a href={`tel:${SITE_CONFIG.contactPhone.replace(/[^0-9]/g, '')}`} className="hover:underline">
                    {SITE_CONFIG.contactPhone} / {SITE_CONFIG.contactMobile}
                  </a>
                </li>
              </ul>
              <p className="text-xs text-stone-500 mt-3">{SITE_CONFIG.serviceHours}</p>
            </div>

            <div className="md:pl-8">
              <h4 className="font-bold text-stone-900 mb-3">ที่อยู่</h4>
              <p className="text-sm text-stone-700 leading-relaxed">
                หมู่ 8 ตำบล หนองหาร<br />
                อำเภอสันทราย<br />
                จังหวัดเชียงใหม่ 50290
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal เข้าสู่ระบบสำหรับเจ้าหน้าที่ */}
      {showStaffModal && (
        <div className="no-print fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-[#E6DAC3] shadow-2xl relative">
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute top-5 right-5 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF5EC] border border-[#E6DAC3] flex items-center justify-center mx-auto mb-3 text-[#9B7B45]">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">เข้าสู่ระบบสำหรับเจ้าหน้าที่</h3>
              <p className="text-xs text-stone-500 mt-1">{SITE_CONFIG.brandName} {SITE_CONFIG.addressShort}</p>
            </div>

            {/* สลับบทบาท */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-stone-100 mb-5">
              <button
                type="button"
                onClick={() => handleSwitchLoginRole('ADMIN')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  loginRole === 'ADMIN'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-[#9B7B45]" />
                ผู้ดูแลระบบ (Admin)
              </button>
              <button
                type="button"
                onClick={() => handleSwitchLoginRole('DEPARTMENT')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  loginRole === 'DEPARTMENT'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Wrench className="w-4 h-4 text-[#2E5A44]" />
                ฝ่ายปฏิบัติงาน
              </button>
            </div>

            {loginError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleStaffLoginSubmit} className="space-y-4">
              {loginRole === 'ADMIN' || !IS_DEMO_MODE ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">ชื่อผู้ใช้งาน (Username)</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder={loginRole === 'ADMIN' ? 'เช่น admin' : 'เช่น venue_dept'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-[#9B7B45]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">รหัสผ่าน (Password)</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="กรอกรหัสผ่าน"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-[#9B7B45]"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">เลือกฝ่ายปฏิบัติงาน (โหมดสาธิต)</label>
                    <select
                      value={selectedDept}
                      onChange={e => setSelectedDept(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-[#2E5A44]"
                    >
                      {(departments || []).map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">รหัสผ่านประจำฝ่าย</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-[#2E5A44]"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className={`w-full py-3 rounded-xl text-white font-bold text-sm shadow-md transition disabled:opacity-60 ${
                  loginRole === 'ADMIN'
                    ? 'bg-[#9B7B45] hover:bg-[#846738]'
                    : 'bg-[#2E5A44] hover:bg-[#234635]'
                }`}
              >
                {isLoggingIn
                  ? 'กำลังตรวจสอบสิทธิ์...'
                  : loginRole === 'ADMIN'
                    ? 'เข้าสู่ระบบผู้ดูแลระบบ'
                    : IS_DEMO_MODE
                      ? `เข้าสู่ระบบ (${selectedDept})`
                      : 'เข้าสู่ระบบฝ่ายปฏิบัติงาน'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
