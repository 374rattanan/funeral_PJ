import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, FileDown, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { buildFullScheduleItems } from '../../data/initialData';

export default function PackageDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { packages, services, ritualTypes } = useApp();

  const pkg = packages.find(p => p.id === id) || packages[2] || packages[0];
  const [viewMode, setViewMode] = useState('SUMMARY_10'); // 'SUMMARY_10' | 'FULL_TABLE'
  const [activeTab, setActiveTab] = useState('INCLUDED'); // 'INCLUDED' | 'ADDONS'
  const [selectedRitualId, setSelectedRitualId] = useState(pkg?.defaultRitualId || 'RITUAL-02');

  if (!pkg) return null;

  const scheduleGroups = buildFullScheduleItems(pkg.id);

  // จัดกลุ่มบริการเสริมตามหมวดหมู่สำหรับแท็บ "รายการที่สามารถเพิ่มได้"
  const addonGroups = services.reduce((acc, srv) => {
    if (!srv.isActive) return acc;
    if (!acc[srv.category]) acc[srv.category] = [];
    acc[srv.category].push(srv);
    return acc;
  }, {});

  // คำนวณส่วนต่างกรณีเลือกพิธีกรรมนอกแพ็กเกจ
  const getRitualUpgradeCost = (ritualId) => {
    if (ritualId === pkg.defaultRitualId) return 0;
    if (pkg.defaultRitualId === 'RITUAL-03') {
      if (ritualId === 'RITUAL-02') return 3500;
      if (ritualId === 'RITUAL-01') return 8500;
    }
    if (pkg.defaultRitualId === 'RITUAL-02') {
      if (ritualId === 'RITUAL-01') return 5000;
    }
    return 0;
  };

  const handleSelectPackage = () => {
    navigate(`/booking?package=${pkg.id}&ritual=${selectedRitualId}`);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="text-xs text-stone-400 mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-stone-600">หน้าหลัก</Link>
        <span>&gt;</span>
        <Link to="/packages" className="hover:text-stone-600">แพ็กเกจจัดงาน</Link>
        <span>&gt;</span>
        <span className="text-stone-700 font-medium">{pkg.name}</span>
      </div>

      {/* Header Card ด้านบนตามรูปดีไซน์ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E6DAC3] shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* รูปภาพด้านซ้าย */}
        <div className="lg:col-span-4">
          <div className="rounded-2xl overflow-hidden bg-[#FDF6E9] border border-[#E6DAC3] h-56">
            <img
              src={pkg.coverImage}
              alt={pkg.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* รายละเอียดตรงกลาง */}
        <div className="lg:col-span-5 space-y-3">
          {pkg.isRecommended && (
            <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#C5A067] text-white text-xs font-semibold">
              ★ แพ็กเกจแนะนำ{pkg.bookingCount > 0 ? ` (ลูกค้าเลือกใช้สูงสุด ${pkg.bookingCount} งาน)` : ''}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">{pkg.name}</h1>
          <p className="text-sm text-stone-600">{pkg.tagline}</p>

          <div className="pt-2 space-y-1.5 text-sm">
            <div className="flex gap-4">
              <span className="text-stone-500 w-24">เหมาะสำหรับ</span>
              <span className="font-medium text-stone-800">{pkg.targetGroup}</span>
            </div>
            <div className="flex gap-4">
              <span className="text-stone-500 w-24">ระยะเวลา</span>
              <span className="font-medium text-stone-800">{pkg.durationText}</span>
            </div>
            <div className="flex gap-4">
              <span className="text-stone-500 w-24">รองรับแขก</span>
              <span className="font-medium text-stone-800">ประมาณ {pkg.baseGuests} คน</span>
            </div>
          </div>
        </div>

        {/* กล่องราคาและปุ่มด้านขวา */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-stone-200 p-5 bg-[#FDFBF7] space-y-3">
            <p className="text-xs text-stone-500">ราคาเริ่มต้น</p>
            <p className="text-3xl font-bold text-stone-900">
              {pkg.price.toLocaleString()} <span className="text-sm font-normal">บาท</span>
            </p>
            <p className="text-[11px] text-stone-400">(ราคาไม่รวมค่าใช้จ่ายที่เพิ่มเองบางรายการ)</p>

            {viewMode === 'SUMMARY_10' ? (
              <button
                onClick={() => setViewMode('FULL_TABLE')}
                className="w-full py-2.5 rounded-xl bg-[#2E5A44] hover:bg-[#234635] text-white text-xs font-semibold transition"
              >
                รายละเอียดแบบเต็ม
              </button>
            ) : (
              <button
                onClick={() => setViewMode('SUMMARY_10')}
                className="w-full py-2.5 rounded-xl bg-[#2E5A44] hover:bg-[#234635] text-white text-xs font-semibold transition"
              >
                ดูสรุป 10 หมวดหมู่
              </button>
            )}

            <button
              onClick={handlePrintPdf}
              className="w-full py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-medium flex items-center justify-center gap-1.5 transition"
            >
              <FileDown className="w-3.5 h-3.5" />
              ดาวน์โหลดรายละเอียด (PDF)
            </button>
          </div>
        </div>
      </div>

      {/* สลับการแสดงผลระหว่าง 10 หมวดหมู่ (ภาพแรก) กับ ตารางแจกแจงรายวัน (ภาพเต็ม) */}
      {viewMode === 'SUMMARY_10' ? (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-stone-900">
              รายละเอียดบริการ{pkg.name} (10 หมวดหมู่)
            </h2>
            <button
              onClick={() => setViewMode('FULL_TABLE')}
              className="text-xs font-semibold text-[#9B7B45] hover:underline"
            >
              สลับดูตารางแจกแจงรายวันแบบเต็ม &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pkg.categories10.map(cat => (
              <div
                key={cat.id}
                className="rounded-2xl border border-[#E6DAC3] bg-white overflow-hidden shadow-sm"
              >
                <div className="px-5 py-3 bg-[#F5E9D6] border-b border-[#E6DAC3]">
                  <h3 className="font-bold text-sm text-stone-800">{cat.title}</h3>
                </div>
                <div className="p-5 space-y-1.5 text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {cat.items.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-10">
          {/* แท็บสลับ รายการที่รวมในแพ็กเกจ / รายการที่สามารถเพิ่มได้ ตามรูปดีไซน์ */}
          <div className="bg-[#F3E9D8] p-2 rounded-t-2xl flex flex-wrap gap-2 border border-b-0 border-[#E2D3B9]">
            <button
              onClick={() => setActiveTab('INCLUDED')}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeTab === 'INCLUDED'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              รายการที่รวมในแพ็กเกจ
            </button>
            <button
              onClick={() => setActiveTab('ADDONS')}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeTab === 'ADDONS'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              รายการที่สามารถเพิ่มได้
            </button>
          </div>

          <div className="bg-white rounded-b-2xl border border-[#E2D3B9] overflow-x-auto shadow-sm">
            {activeTab === 'INCLUDED' ? (
              <table className="w-full text-xs text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-[#F5E9D6] text-stone-800 font-semibold border-b border-[#E2D3B9]">
                    <th className="py-3 px-4 w-16">ลำดับ</th>
                    <th className="py-3 px-4">รายการ</th>
                    <th className="py-3 px-2 text-center">วันแรก</th>
                    <th className="py-3 px-2 text-center">คืนแรก</th>
                    <th className="py-3 px-2 text-center">วันที่สอง</th>
                    <th className="py-3 px-2 text-center">คืนที่สอง</th>
                    <th className="py-3 px-2 text-center">วันที่สาม</th>
                    <th className="py-3 px-2 text-center">คืนที่สาม</th>
                    <th className="py-3 px-2 text-center">วันเผา</th>
                    <th className="py-3 px-2 text-center">วันเก็บกระดูก</th>
                    <th className="py-3 px-4 text-right">ราคา</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {scheduleGroups.map((grp, gIdx) => (
                    <React.Fragment key={gIdx}>
                      <tr className="bg-[#FAF6EE]">
                        <td colSpan={11} className="py-2.5 px-4 font-bold text-stone-800">
                          {grp.groupTitle}
                        </td>
                      </tr>
                      {grp.items.map((item, iIdx) => (
                        <tr key={iIdx} className="hover:bg-stone-50/80">
                          <td className="py-2.5 px-4 text-stone-500">{item.code}</td>
                          <td className={`py-2.5 px-4 font-medium ${item.highlightRed ? 'text-red-600' : 'text-stone-700'}`}>
                            {item.name}
                          </td>
                          {['day1', 'night1', 'day2', 'night2', 'day3', 'night3', 'cremation', 'bone'].map(col => (
                            <td key={col} className="py-2.5 px-2 text-center">
                              {item[col] ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                              ) : (
                                <span className="text-stone-300">—</span>
                              )}
                            </td>
                          ))}
                          <td className="py-2.5 px-4 text-right font-medium text-stone-700">
                            {item.price > 0 ? item.price.toLocaleString() : 'รวมในแพ็กเกจ'}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-xs text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-[#F5E9D6] text-stone-800 font-semibold border-b border-[#E2D3B9]">
                    <th className="py-3 px-4 w-16">ลำดับ</th>
                    <th className="py-3 px-4">รายการ</th>
                    <th className="py-3 px-2 text-center">วันแรก</th>
                    <th className="py-3 px-2 text-center">คืนแรก</th>
                    <th className="py-3 px-2 text-center">วันที่สอง</th>
                    <th className="py-3 px-2 text-center">คืนที่สอง</th>
                    <th className="py-3 px-2 text-center">วันที่สาม</th>
                    <th className="py-3 px-2 text-center">คืนที่สาม</th>
                    <th className="py-3 px-2 text-center">วันเผา</th>
                    <th className="py-3 px-2 text-center">วันเก็บกระดูก</th>
                    <th className="py-3 px-4 text-right">ราคาต่อหน่วย</th>
                    <th className="py-3 px-4">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {Object.entries(addonGroups).map(([catName, items], gIdx) => (
                    <React.Fragment key={gIdx}>
                      <tr className="bg-[#FAF6EE]">
                        <td colSpan={12} className="py-2.5 px-4 font-bold text-stone-800">
                          {catName}
                        </td>
                      </tr>
                      {items.map((srv, idx) => (
                        <tr key={srv.id} className="hover:bg-stone-50">
                          <td className="py-2.5 px-4 text-stone-500">{idx + 1}.</td>
                          <td className="py-2.5 px-4 font-medium text-stone-800">{srv.name}</td>
                          {['day1', 'night1', 'day2', 'night2', 'day3', 'night3', 'cremation', 'bone'].map(col => (
                            <td key={col} className="py-2.5 px-2 text-center">
                              {srv[col] ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                              ) : (
                                <span className="text-stone-300">—</span>
                              )}
                            </td>
                          ))}
                          <td className="py-2.5 px-4 text-right font-semibold text-stone-800">
                            {srv.price.toLocaleString()} บาท/{srv.unit}
                          </td>
                          <td className="py-2.5 px-4 text-stone-500">{srv.remark || '—'}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* หมายเหตุและกล่องเลือกพิธีกรรม 3 แบบ ตามรูปดีไซน์ */}
      <div className="mt-8 space-y-6">
        <p className="text-xs text-stone-600">
          <strong>หมายเหตุ:</strong> รายละเอียดอาจมีการเปลี่ยนแปลงไปตามความเหมาะสม สามารถเลือกรูปแบบพิธีกรรมด้านล่างได้ (หากอยู่นอกแพ็กเกจจะมีค่าใช้จ่ายเพิ่มเติม)
        </p>

        <div>
          <h3 className="text-base font-bold text-stone-900 text-center mb-4">
            พิธีกรรม (เลือกได้ 1 แบบ)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ritualTypes.map(ritual => {
              const isIncluded = ritual.id === pkg.defaultRitualId;
              const isSelected = ritual.id === selectedRitualId;
              const extraCost = getRitualUpgradeCost(ritual.id);

              return (
                <div
                  key={ritual.id}
                  onClick={() => setSelectedRitualId(ritual.id)}
                  className={`cursor-pointer rounded-2xl p-5 border transition relative ${
                    isSelected
                      ? 'border-2 border-[#2E5A44] bg-[#F4F9F6] shadow-sm'
                      : 'border-[#E2D3B9] bg-white hover:border-[#B5945B]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-sm text-stone-900">{ritual.name}</h4>
                  </div>
                  <ul className="space-y-1 text-xs text-stone-600 list-disc list-inside">
                    {ritual.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                  <div className="mt-4 flex items-center justify-between text-[11px]">
                    {isIncluded ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                        อยู่ในแพ็กเกจ (ฟรี)
                      </span>
                    ) : extraCost > 0 ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-semibold">
                        อัปเกรดเพิ่ม +{extraCost.toLocaleString()} บาท
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                        เลือกใช้ได้โดยไม่เสียค่าใช้จ่ายเพิ่ม
                      </span>
                    )}
                    {isSelected && (
                      <span className="font-bold text-[#2E5A44]">✓ เลือกแบบนี้อยู่</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* แถบเบอร์ติดต่อช่วยเหลือ */}
        <div className="bg-[#EFECE6] rounded-xl py-3 px-4 text-center text-xs text-stone-700">
          หากมีข้อสงสัยหรือต้องการความช่วยเหลือ กรุณาติดต่อเจ้าหน้าที่ <strong>0123456789</strong> (ทุกวัน 8.00 - 17.00 น.)
        </div>

        {/* ปุ่มย้อนกลับ และ ปุ่มเลือกแพ็กเกจนี้ */}
        <div className="flex items-center justify-between pt-2">
          <Link
            to="/packages"
            className="px-5 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-xs sm:text-sm font-medium text-stone-700 flex items-center gap-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            ย้อนกลับไปหน้ารวมแพ็กเกจ
          </Link>

          <button
            onClick={handleSelectPackage}
            className="px-8 py-3 rounded-xl bg-[#2E5A44] hover:bg-[#234635] text-white text-sm font-semibold shadow-md transition"
          >
            เลือกแพ็กเกจนี้
          </button>
        </div>
      </div>
    </div>
  );
}
