import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, Users, MapPin, Sparkles, FileCheck2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PORTFOLIO_ITEMS } from '../../data/initialData';

export default function HomePage() {
  const { packages, locations, departments, staff, bookings } = useApp();
  const [pkgStartIndex, setPkgStartIndex] = useState(0);

  // แสดงครั้งละ 3 แพ็กเกจ แบบวนรอบต่อเนื่อง (Circular Wrap-around: 1-2-3 -> 2-3-4 -> 3-4-1 -> 4-1-2)
  const totalPackages = packages.length;
  const visibleCount = Math.min(3, totalPackages);
  const safeStartIndex = totalPackages > 0
    ? ((pkgStartIndex % totalPackages) + totalPackages) % totalPackages
    : 0;

  const visiblePackages = Array.from({ length: visibleCount }, (_, offset) => {
    return packages[(safeStartIndex + offset) % totalPackages];
  });

  const handlePrevPackages = () => {
    if (totalPackages === 0) return;
    setPkgStartIndex(prev => (prev - 1 + totalPackages) % totalPackages);
  };

  const handleNextPackages = () => {
    if (totalPackages === 0) return;
    setPkgStartIndex(prev => (prev + 1) % totalPackages);
  };

  // คำนวณสถิติความพร้อมและผลการให้บริการจริงจากฐานข้อมูลแบบ Real-time
  const validBookings = (bookings || []).filter(b => b.status !== 'ยกเลิก');
  const completedBookingsCount = validBookings.filter(b => b.status === 'เสร็จสิ้น').length;
  const activeLocations = (locations || []).filter(l => l.isActive !== false);
  const totalActivePavilions = activeLocations.reduce(
    (sum, loc) => sum + ((loc.pavilions || []).filter(p => p.isActive !== false).length || 0),
    0
  );
  const maxPkgBookings = Math.max(1, ...packages.map(p => p.bookingCount || 0));
  const recommendedPkg = packages.find(p => p.isRecommended) || packages[0];

  return (
    <div className="space-y-16 pb-8">
      {/* Hero Section ตามรูปดีไซน์ */}
      <section className="relative bg-stone-900 overflow-hidden min-h-[340px] sm:min-h-[420px] flex items-center">
        <img
          src="/images/header-banner.png"
          alt="แบนเนอร์ วิสาหกิจชุมชนบ้านวิเวก"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900/75 via-stone-900/40 to-transparent" />

        <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <h1 className="text-2xl sm:text-4xl font-bold text-white drop-shadow leading-snug">
            ยินดีต้อนรับ วิสาหกิจชุมชนบ้านวิเวก
          </h1>
          <p className="mt-2 text-lg sm:text-2xl text-amber-100 font-medium drop-shadow">
            ระบบจัดงานศพแบบครบวงจร<br />
            “ช่วยให้การจัดงานเป็นเรื่องง่าย”
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/packages"
              className="px-6 py-3 rounded-full bg-[#C5A572] hover:bg-[#B28F58] text-white font-semibold text-sm shadow-lg transition"
            >
              แพ็กเกจการจัดงาน
            </Link>
            <Link
              to="/check-status"
              className="px-6 py-3 rounded-full bg-white/90 hover:bg-white text-stone-800 font-semibold text-sm shadow-lg transition"
            >
              ตรวจสอบสถานะการจัดงาน
            </Link>
          </div>
        </div>
      </section>

      {/* 4 Icons Bar ลอยทับขอบล่าง Hero ตามรูป */}
      <section className="max-w-4xl mx-auto px-4 -mt-24 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg border border-stone-200 grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-stone-200 py-5">
          <div className="flex flex-col items-center justify-center p-3 text-center">
            <Users className="w-8 h-8 text-stone-800 mb-2" />
            <span className="font-semibold text-xs sm:text-sm text-stone-800">ชุมชนดูแลด้วยใจ</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 text-center">
            <MapPin className="w-8 h-8 text-stone-800 mb-2" />
            <span className="font-semibold text-xs sm:text-sm text-stone-800">สถานที่พร้อมบริการ</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 text-center">
            <Sparkles className="w-8 h-8 text-stone-800 mb-2" />
            <span className="font-semibold text-xs sm:text-sm text-stone-800">พิธีการทางศาสนา</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 text-center">
            <FileCheck2 className="w-8 h-8 text-stone-800 mb-2" />
            <span className="font-semibold text-xs sm:text-sm text-stone-800">แพ็กเกจโปร่งใส</span>
          </div>
        </div>
      </section>

      {/* แพ็กเกจของเรา (แสดงทีละ 3 แพ็กเกจ พร้อมปุ่มเลื่อนซ้าย-ขวา) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-stone-800">แพ็กเกจของเรา</h2>
          <p className="text-sm text-stone-500 mt-1">
            เลือกแพ็กเกจที่เหมาะสมกับครอบครัว พร้อมปรับเปลี่ยนพิธีกรรมได้ตามความต้องการ
          </p>
        </div>

        <div className="relative flex items-center gap-3 sm:gap-4">
          {/* ปุ่มเลื่อนซ้าย (แสดงเมื่อมีมากกว่า 3 แพ็กเกจ) */}
          {totalPackages > 3 && (
            <button
              type="button"
              onClick={handlePrevPackages}
              aria-label="แพ็กเกจก่อนหน้า"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-stone-300 shadow-md hover:bg-[#FAF5EC] hover:border-[#B5945B] text-stone-700 hover:text-[#7C6032] flex items-center justify-center shrink-0 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* แถวการ์ด 3 แพ็กเกจ (วนลูปต่อเนื่อง) */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 pt-3">
            {visiblePackages.map(pkg => (
              <div
                key={pkg.id}
                className={`relative bg-white rounded-2xl p-6 border transition flex flex-col justify-between shadow-sm hover:shadow-md ${
                  pkg.isRecommended ? 'border-2 border-[#B5945B] ring-4 ring-[#B5945B]/10' : 'border-stone-200'
                }`}
              >
                {pkg.isRecommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#B5945B] text-white text-xs font-semibold whitespace-nowrap shadow-sm">
                    ★ แนะนำ{pkg.bookingCount > 0 ? ` (เลือกใช้สูงสุด ${pkg.bookingCount} งาน)` : ''}
                  </div>
                )}

                <div>
                  <div className="text-center border-b border-stone-100 pb-4">
                    <h3 className="font-bold text-lg text-stone-800">{pkg.name}</h3>
                    <p className="text-xs text-stone-500 mt-0.5">{pkg.durationText} | แขก {pkg.baseGuests} คน</p>
                    <p className="mt-3 text-2xl font-bold text-[#9B7B45]">
                      {Number(pkg.price || 0).toLocaleString()} <span className="text-xs font-normal text-stone-500">บาท</span>
                    </p>
                  </div>

                  <ul className="mt-4 space-y-2.5 text-xs text-stone-600">
                    {pkg.highlights.map((hl, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 flex flex-col gap-2">
                  <Link
                    to={`/packages/${pkg.id}`}
                    className="w-full py-2.5 rounded-xl bg-[#2E5A44] hover:bg-[#234635] text-white text-xs font-semibold text-center transition"
                  >
                    ดูรายละเอียดแพ็กเกจ
                  </Link>
                  <Link
                    to={`/booking?package=${pkg.id}`}
                    className="w-full py-2 rounded-xl border border-[#B5945B] text-[#7C6032] hover:bg-[#FAF5EC] text-xs font-semibold text-center transition"
                  >
                    เลือกแพ็กเกจนี้ทันที
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* ปุ่มเลื่อนขวา (แสดงเมื่อมีมากกว่า 3 แพ็กเกจ) */}
          {totalPackages > 3 && (
            <button
              type="button"
              onClick={handleNextPackages}
              aria-label="แพ็กเกจถัดไป"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-stone-300 shadow-md hover:bg-[#FAF5EC] hover:border-[#B5945B] text-stone-700 hover:text-[#7C6032] flex items-center justify-center shrink-0 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* ตัวบอกตำแหน่งการเลื่อน (Dots) และลิงก์ดูแพ็กเกจทั้งหมด */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
          {totalPackages > 3 ? (
            <div className="flex items-center gap-2 mx-auto sm:mx-0">
              {packages.map((pkg, idx) => (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setPkgStartIndex(idx)}
                  aria-label={`เลื่อนไปที่ ${pkg.name}`}
                  className={`h-2 rounded-full transition-all ${
                    safeStartIndex === idx ? 'w-6 bg-[#B5945B]' : 'w-2 bg-stone-300 hover:bg-stone-400'
                  }`}
                />
              ))}
              {/* <span className="text-xs text-stone-500 ml-2">
                เลื่อนดูได้ต่อเนื่อง ({totalPackages} แพ็กเกจ)
              </span> */}
            </div>
          ) : <div />}

          <Link
            to="/packages"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#9B7B45] hover:underline mx-auto sm:mx-0"
          >
            ดูแพ็กเกจทั้งหมด ({totalPackages}) <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ผลงานของเรา (Masonry Grid ตามรูปหน้าแรก) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-stone-800 mx-auto">ผลงานของเรา</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {PORTFOLIO_ITEMS.map((item, i) => (
            <div
              key={item.id}
              className={`group relative rounded-xl overflow-hidden bg-stone-200 shadow-sm ${
                i === 0 ? 'col-span-2 row-span-2 h-72 sm:h-96' : 'h-36 sm:h-44'
              }`}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex flex-col justify-end p-4">
                <span className="text-[10px] text-amber-300 font-medium">{item.category}</span>
                <p className="text-white text-xs sm:text-sm font-semibold line-clamp-2">{item.title}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-6">
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#9B7B45] hover:underline"
          >
            ดูผลงานทั้งหมด <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* พิธีกรรมทางศาสนา: ปราสาทศพ ความเชื่อที่ซ่อนอยู่เบื้องหลังพิธีงานศพล้านนา */}
      <section id="about-section" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl font-bold text-stone-800 text-center mb-8">พิธีกรรมทางศาสนา</h2>
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E6DAC3] shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5 md:sticky md:top-28">
            <div className="rounded-xl overflow-hidden border border-stone-200 shadow bg-stone-50">
              <img
                src="/images/lanna-prasat.jpg"
                alt="ปราสาทศพแบบล้านนา"
                className="w-full h-auto max-h-[460px] object-cover"
              />
            </div>
            <p className="text-[11px] text-stone-500 mt-2.5 text-center leading-relaxed">
              แหล่งที่มา : โครงการสำรวจข้อมูลปราชญ์ท้องถิ่นล้านนา โดย นายวุฒิภัทร เกตุพัฒนพล ศูนย์ศิลปวัฒนธรรม มหาวิทยาลัยแม่โจ้
            </p>
          </div>

          <div className="md:col-span-7 space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
            <h3 className="font-bold text-stone-900 text-base sm:text-lg border-b border-[#E6DAC3] pb-2.5">
              ปราสาทศพ ความเชื่อที่ซ่อนอยู่เบื้องหลังพิธีงานศพล้านนา
            </h3>

            <div className="space-y-3.5">
              <div>
                <h4 className="font-bold text-[#7C6032] text-sm mb-1">ปราสาทศพคืออะไร</h4>
                <p>
                  "ปราสาท" ในความหมายดั้งเดิมคือเรือนยอดแหลมเป็นชั้น ๆ ที่ใช้เป็นที่ประทับของกษัตริย์หรือประดิษฐานสิ่งศักดิ์สิทธิ์ เมื่อนำมารวมกับคำว่า "ศพ" จึงหมายถึงเรือนยอดที่สร้างขึ้นเพื่อใส่โลงบรรจุร่างผู้วายชนม์ เป็นเหมือน "ที่พักสุดท้าย" ที่ครอบครัวตั้งใจสร้างให้อย่างสวยงามและสมเกียรติ
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#7C6032] text-sm mb-1">ความเชื่อที่มาของปราสาทศพ</h4>
                <p>
                  รากความเชื่อเรื่องปราสาทศพผสมผสานกันระหว่างสองศาสนา ฝั่งพราหมณ์-ฮินดูเชื่อเรื่องเขาพระสุเมรุ ภูเขาศักดิ์สิทธิ์ที่เป็นแกนกลางของจักรวาลและเป็นที่สถิตของเหล่าเทพ ผู้คนจึงจำลองรูปทรงนี้ขึ้นเป็น "ที่พัก" ให้ดวงวิญญาณผู้ตายได้ไปสู่สวรรค์ ส่วนฝั่งพระพุทธศาสนาจะสอดแทรกผ่านพิธีกรรมของสงฆ์ เช่น การบังสุกุลและกรวดน้ำอุทิศบุญกุศลให้ผู้ล่วงลับ ทั้งสองความเชื่อจึงหลอมรวมกันเป็นรูปแบบปราสาทศพที่เห็นในปัจจุบัน
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#7C6032] text-sm mb-1">หลักฐานทางประวัติศาสตร์</h4>
                <p>
                  แม้จะไม่มีหลักฐานชัดเจนว่าเริ่มสร้างปราสาทศพขึ้นเมื่อใด แต่หลักฐานเก่าแก่ที่สุดปรากฏในพงศาวดารโยนก กล่าวถึงพิธีปลงพระศพของเจ้านครพิงค์เชียงใหม่ในช่วงปลายราชวงศ์มังราย ซึ่งใช้ "วิมาน" หรือ "บุษบก" ตั้งอยู่บนหลังนกหัสดีลิงค์ขนาดใหญ่ ก่อนจะพัฒนามาเป็นต้นแบบของปราสาทศพในปัจจุบัน โดยแรกเริ่มใช้เฉพาะในพิธีของเจ้านายและพระสงฆ์ชั้นสูง ก่อนจะแพร่หลายมาสู่ชาวบ้านทั่วไปในเวลาต่อมา
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#7C6032] text-sm mb-1">ทำไมต้องประดับด้วยดอกไม้</h4>
                <p>
                  พิธีศพของชาวล้านนามีจุดเด่นต่างจากภาคอื่นตรงที่นิยมประดับปราสาทด้วยดอกไม้สดหรือดอกไม้แห้งให้ดูงดงามอลังการ ความเชื่อเบื้องหลังคือการยกย่องผู้ตายให้ได้ขึ้นสู่สรวงสวรรค์ชั้นฟ้า และเป็นการแสดงออกถึงความกตัญญูกตเวทีที่ลูกหลานมีต่อผู้มีพระคุณ แม้ร่างกายจะดับสูญไปแล้ว แต่ความเคารพยังคงมอบให้อย่างเต็มที่ผ่านความประณีตของพิธีกรรม
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#7C6032] text-sm mb-1">โครงสร้างของปราสาทศพ</h4>
                <p>
                  ปราสาทศพแบบล้านนาแบ่งเป็น 3 ส่วนหลัก ได้แก่ ส่วนยอดและหลังคา ซึ่งมีทั้งทรงกระโจมและทรงจั่วตั้งแต่ชั้นเดียวถึงสามชั้น ส่วนตัวปราสาทหรือเสา และ ส่วนฐาน ที่มีทั้งแบบธรรมดา แบบย่อมุม และแบบแท่นแก้ว ความประณีตของแต่ละส่วนสะท้อนฝีมือช่างและความตั้งใจของครอบครัวผู้จัดงาน
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#7C6032] text-sm mb-1">จากประเพณีชุมชน สู่บริการยุคใหม่</h4>
                <p>
                  ในอดีตปราสาทศพเป็นสิ่งที่ญาติมิตรและชุมชนช่วยกันสร้างขึ้นด้วยแรงศรัทธา แต่เมื่อสังคมเปลี่ยนไป การจัดหาปราสาทศพก็ค่อย ๆ กลายเป็นบริการของผู้เชี่ยวชาญที่สืบทอดฝีมือกันมาหลายชั่วอายุคน เพื่อให้ครอบครัวผู้สูญเสียได้รับความสะดวก โดยยังคงไว้ซึ่งความหมายและความงดงามตามแบบแผนดั้งเดิมของล้านนาอย่างครบถ้วน
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 text-[11px] sm:text-xs text-stone-500 bg-[#FAF6EE] p-3.5 rounded-xl border border-[#E6DAC3]">
              <strong>อ้างอิง:</strong> พระมหาจรัญ กันธิมา (2558). ศึกษาแนวคิดเชิงวัฒนธรรมในการสร้างปราสาทศพของชาวพุทธล้านนา. วารสารพุทธศาสตร์ศึกษา ปีที่ 6 ฉบับที่ 2
            </div>
          </div>
        </div>
      </section>

      {/* ความพร้อมและสถิติการให้บริการจริงของวิสาหกิจชุมชนบ้านวิเวก (ดึงจากฐานข้อมูล Real-time) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-stone-800">
            ความพร้อมและสถิติการให้บริการ วิสาหกิจชุมชนบ้านวิเวก
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            หมู่ที่ 8 ตำบลหนองหาร อำเภอสันทราย จังหวัดเชียงใหม่ (ข้อมูลเชื่อมโยงจากฐานข้อมูลระบบแบบ Real-time)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-6 flex flex-col justify-between gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-stone-300 text-center shadow-sm">
                <p className="text-xs font-semibold text-stone-600">งานที่ให้บริการในระบบ</p>
                <p className="text-2xl sm:text-3xl font-bold text-stone-900 mt-2">
                  {validBookings.length.toLocaleString()} <span className="text-sm font-medium text-stone-500">งาน</span>
                </p>
                <p className="text-[11px] text-emerald-700 font-medium mt-1">
                  ดำเนินการเสร็จสิ้นแล้ว {completedBookingsCount} งาน
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-stone-300 text-center shadow-sm">
                <p className="text-xs font-semibold text-stone-600">สถานที่และศาลาพร้อมรองรับ</p>
                <p className="text-2xl sm:text-3xl font-bold text-stone-900 mt-2">
                  {activeLocations.length} <span className="text-sm font-medium text-stone-500">แห่ง</span> / {totalActivePavilions} <span className="text-sm font-medium text-stone-500">ศาลา</span>
                </p>
                <p className="text-[11px] text-stone-400 mt-1">ตรวจสอบคิวศาลาว่างได้ทันที</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-stone-300 text-center shadow-sm">
                <p className="text-xs font-semibold text-stone-600">ฝ่ายปฏิบัติงานชุมชน</p>
                <p className="text-2xl sm:text-3xl font-bold text-stone-900 mt-2">
                  {departments.length} <span className="text-sm font-medium text-stone-500">ฝ่าย</span>
                </p>
                <p className="text-[11px] text-stone-400 mt-1">ดูแลครบทุกขั้นตอนพิธีการ</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-stone-300 text-center shadow-sm">
                <p className="text-xs font-semibold text-stone-600">บุคลากรในชุมชนพร้อมดูแล</p>
                <p className="text-2xl sm:text-3xl font-bold text-stone-900 mt-2">
                  {staff.length} <span className="text-sm font-medium text-stone-500">คน</span>
                </p>
                <p className="text-[11px] text-stone-400 mt-1">ทีมงานคนในพื้นที่บ้านวิเวก</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-stone-300 shadow-sm">
              <div className="mb-1.5">
                <h4 className="font-bold text-sm text-stone-800">แหล่งข้อมูลระบบจัดงาน</h4>
              </div>
              <p className="text-xs text-stone-600">
                แพ็กเกจยอดนิยมปัจจุบัน : <strong className="text-[#9B7B45]">{recommendedPkg?.name || '-'}</strong> (เลือกใช้สูงสุด {recommendedPkg?.bookingCount || 0} งาน)
              </p>
              <p className="text-xs text-stone-500 mt-1">
                แหล่งข้อมูล : ฐานข้อมูลวิสาหกิจชุมชนบ้านวิเวก หมู่ที่ 8 ต.หนองหาร อ.สันทราย จ.เชียงใหม่
              </p>
            </div>
          </div>

          {/* กราฟแท่งสถิติการเลือกใช้แพ็กเกจจริงจากฐานข้อมูล */}
          <div className="md:col-span-6 bg-white rounded-2xl p-6 border border-stone-300 shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-sm text-stone-800">
                สถิติการเลือกใช้แพ็กเกจจัดงานจริง (อ้างอิงจากใบจองในระบบ)
              </h4>
            </div>

            <div className="h-52 flex items-end justify-around gap-4 px-4 pt-6 border-b border-l border-stone-300 mt-4">
              {packages.map((pkg, idx) => {
                const count = pkg.bookingCount || 0;
                const heightPercent = count > 0 ? Math.max(20, Math.round((count / maxPkgBookings) * 76)) : 12;
                const barColors = ['bg-[#2E5A44]', 'bg-[#9B7B45]', 'bg-[#65543F]', 'bg-stone-600'];
                const barColor = pkg.isRecommended ? 'bg-[#B5945B]' : barColors[idx % barColors.length];

                return (
                  <div key={pkg.id} className="flex flex-col items-center justify-end h-full flex-1">
                    {pkg.isRecommended && (
                      <span className="mb-1 text-[10px] bg-[#B5945B] text-white px-1.5 py-0.5 rounded font-bold whitespace-nowrap shadow">
                        ★ แนะนำ
                      </span>
                    )}
                    <span className={`text-[11px] font-bold mb-1 ${pkg.isRecommended ? 'text-[#9B7B45]' : 'text-stone-600'}`}>
                      {count} งาน
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[42px] ${barColor} rounded-t-md shadow-sm transition-all duration-500`}
                      title={`${pkg.name}: ${count} งาน`}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-around gap-2 px-2 pt-3 text-[11px] font-semibold text-stone-700 text-center">
              {packages.map(pkg => (
                <span key={pkg.id} className="flex-1 truncate" title={pkg.name}>
                  {pkg.name.replace('แพ็กเกจ', '')}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
