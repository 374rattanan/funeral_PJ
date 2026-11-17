import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function PackagesPage() {
  const { packages } = useApp();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="text-xs text-stone-400 mb-4 flex items-center gap-2">
        <Link to="/" className="hover:text-stone-600">หน้าหลัก</Link>
        <span>&gt;</span>
        <span className="text-stone-700 font-medium">แพ็กเกจจัดงาน</span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-8">
        แพ็กเกจสำหรับการจัดงาน
      </h1>

      {/* การ์ด 4 แพ็กเกจ 2x2 ตามรูปดีไซน์เป๊ะ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {packages.map(pkg => (
          <div
            key={pkg.id}
            className="group relative rounded-3xl overflow-hidden shadow-lg border border-stone-200 h-72 sm:h-80 bg-stone-900"
          >
            <img
              src={pkg.coverImage}
              alt={pkg.name}
              className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/25 to-black/80" />

            {/* มุมขวาบน: ชื่อแพ็กเกจ จำนวนวัน และจำนวนแขก */}
            <div className="absolute top-6 right-6 text-right text-white">
              {pkg.isRecommended && (
                <span className="inline-block mb-1.5 px-3 py-0.5 rounded-full bg-[#B5945B] text-white text-xs font-semibold shadow">
                  ★ แพ็กเกจแนะนำ{pkg.bookingCount > 0 ? ` (เลือกใช้สูงสุด ${pkg.bookingCount} งาน)` : ''}
                </span>
              )}
              <h2 className="text-2xl sm:text-3xl font-bold drop-shadow">{pkg.name}</h2>
              <p className="text-sm sm:text-base font-medium text-stone-100 mt-1 drop-shadow">
                {pkg.durationDays} วัน {pkg.durationNights} คืน &nbsp;&nbsp; แขก {pkg.baseGuests} คน
              </p>
            </div>

            {/* แถบล่าง: ราคาเริ่มต้น และปุ่มรายละเอียด */}
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
              <div className="text-white">
                <span className="text-base sm:text-lg font-medium mr-2">ราคาเริ่มต้น</span>
                <span className="text-2xl sm:text-3xl font-bold text-amber-200">
                  {pkg.price.toLocaleString()}
                </span>
                <span className="text-base sm:text-lg font-medium ml-1.5">บาท</span>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/packages/${pkg.id}`}
                  className="px-5 py-2 rounded-xl bg-[#FDFBF7] hover:bg-amber-100 text-stone-900 font-bold text-sm sm:text-base shadow transition"
                >
                  รายละเอียด
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
