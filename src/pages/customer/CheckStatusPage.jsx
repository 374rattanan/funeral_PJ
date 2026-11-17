import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileDown,
  ArrowLeft,
  Eye
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { buildFullScheduleItems } from '../../data/initialData';

export default function CheckStatusPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { bookings, assignments, setPreviewImageModal } = useApp();

  const initialQuery = searchParams.get('code') || 'BW-00001';
  const [inputCode, setInputCode] = useState(initialQuery);
  const [activeCode, setActiveCode] = useState(initialQuery);
  const [expandedStep, setExpandedStep] = useState(3);
  const [showFullSheet, setShowFullSheet] = useState(false);
  const [sheetTab, setSheetTab] = useState('INCLUDED'); // 'INCLUDED' | 'ADDED'

  // ค้นหาจากทั้ง BW-00001 หรือ A001 หรือชื่อผู้เสียชีวิต
  const booking = bookings.find(
    b =>
      b.id.toLowerCase() === activeCode.trim().toLowerCase() ||
      b.code.toLowerCase() === activeCode.trim().toLowerCase() ||
      b.deceased.fullName.includes(activeCode.trim())
  );

  const handleSearch = (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    setActiveCode(inputCode.trim());
    setSearchParams({ code: inputCode.trim() });
    setShowFullSheet(false);
  };

  const bookingTasks = booking
    ? assignments.filter(t => t.bookingId === booking.id)
    : [];

  // แปลงวันที่เป็นภาษาไทยอ่านง่าย
  const formatThaiDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // สร้างสถานะ 8 ขั้นตอนตามรูปดีไซน์ที่ 8 และ 9 โดยเชื่อมกับข้อมูลจริงของแผนก
  const getTimelineSteps = () => {
    if (!booking) return [];

    const isApproved = booking.status === 'กำลังดำเนินงาน' || booking.status === 'เสร็จสิ้น';
    const isCompleted = booking.status === 'เสร็จสิ้น';

    const venueTask = bookingTasks.find(t => t.seq === 1);
    const audioTask = bookingTasks.find(t => t.seq === 5);
    const foodTask = bookingTasks.find(t => t.seq === 6);
    const flowerTask = bookingTasks.find(t => t.seq === 4);
    const ritualTask = bookingTasks.find(t => t.seq === 8);

    const step3SubItems = [
      ...(venueTask?.checklist || []).map(c => ({
        label: c.label,
        isDone: c.isChecked,
        time: c.completedTime || '09:55 น.'
      })),
      ...(audioTask?.checklist || []).slice(0, 1).map(c => ({
        label: 'ระบบไฟฟ้าและเครื่องเสียง',
        isDone: c.isChecked,
        time: c.completedTime || '10:45 น.'
      }))
    ];

    const step3Photos = [
      ...(venueTask?.photos || []),
      ...(audioTask?.photos || [])
    ];

    return [
      {
        no: 1,
        title: 'รับคำขอ ตรวจสอบข้อมูลและยืนยันการจอง',
        sublines: [
          'รับข้อมูลคำขอจัดงาน',
          'ตรวจสอบข้อมูลผู้เสียชีวิต',
          'ยืนยันวันจัดงานและสถานที่',
          'ยืนยันแพ็กเกจ'
        ],
        dateText: formatThaiDate(booking.appointmentDate),
        timeText: '9:15 น.',
        personText: 'ผู้รับเรื่อง : คุณรัตนา แสนดี (ศูนย์บริการบ้านวิเวก)',
        status: isApproved ? 'เสร็จสิ้น' : 'กำลังดำเนินงาน',
        subItems: [],
        photos: []
      },
      {
        no: 2,
        title: 'ชำระเงิน / ยืนยันการชำระเงิน',
        sublines: [
          booking.installment1Paid
            ? `ชำระเงิน${booking.paymentOption === 'FULL' ? 'เต็มจำนวน' : 'มัดจำงวดแรก'}เรียบร้อย (${booking.installment1Amount.toLocaleString()} บาท)`
            : `รอชำระเงิน ณ ศูนย์บริการ (${booking.installment1Amount.toLocaleString()} บาท)`
        ],
        dateText: formatThaiDate(booking.appointmentDate),
        timeText: '9:15 น.',
        personText: 'ช่องทาง : ชำระ ณ ศูนย์บริการวิสาหกิจชุมชนบ้านวิเวก',
        status: booking.installment1Paid ? 'เสร็จสิ้น' : 'รอดำเนินงาน',
        subItems: [],
        photos: booking.installment1Slip ? [booking.installment1Slip] : []
      },
      {
        no: 3,
        title: 'จัดเตรียมสถานที่และอุปกรณ์',
        sublines: [venueTask?.status || 'กำลังดำเนินการ'],
        dateText: formatThaiDate(booking.startDate),
        timeText: '9:15 น.',
        personText: `ผู้รับผิดชอบ : ${venueTask?.department || 'ฝ่ายสถานที่'} (${venueTask?.staffName || 'ป้าฝ้าย'})`,
        status: !isApproved
          ? 'รอดำเนินงาน'
          : venueTask?.status === 'เสร็จสิ้น'
          ? 'เสร็จสิ้น'
          : 'กำลังดำเนินงาน',
        subItems: step3SubItems,
        photos: step3Photos
      },
      {
        no: 4,
        title: 'เตรียมอาหารและวัตถุดิบ',
        sublines: [foodTask?.status || 'รอดำเนินการ'],
        dateText: formatThaiDate(booking.startDate),
        timeText: '15:00 น.',
        personText: `ผู้รับผิดชอบ : ทีมแม่ครัว (${foodTask?.staffName || 'ป้านุ่น'})`,
        status: !isApproved
          ? 'รอดำเนินงาน'
          : foodTask?.status === 'เสร็จสิ้น'
          ? 'เสร็จสิ้น'
          : foodTask?.status === 'กำลังดำเนินงาน'
          ? 'กำลังดำเนินงาน'
          : 'รอดำเนินงาน',
        subItems: (foodTask?.checklist || []).map(c => ({
          label: c.label,
          isDone: c.isChecked,
          time: c.completedTime
        })),
        photos: foodTask?.photos || []
      },
      {
        no: 5,
        title: 'จัดดอกไม้และตกแต่ง',
        sublines: [flowerTask?.status || 'รอดำเนินการ'],
        dateText: formatThaiDate(booking.startDate),
        timeText: '13:00 น.',
        personText: `ผู้รับผิดชอบ : ทีมดอกไม้ (${flowerTask?.staffName || 'ลุงคำ'})`,
        status: !isApproved
          ? 'รอดำเนินงาน'
          : flowerTask?.status === 'เสร็จสิ้น'
          ? 'เสร็จสิ้น'
          : flowerTask?.status === 'กำลังดำเนินงาน'
          ? 'กำลังดำเนินงาน'
          : 'รอดำเนินงาน',
        subItems: (flowerTask?.checklist || []).map(c => ({
          label: c.label,
          isDone: c.isChecked,
          time: c.completedTime
        })),
        photos: flowerTask?.photos || []
      },
      {
        no: 6,
        title: 'ดำเนินพิธีการตามกำหนดการ',
        sublines: [ritualTask?.status || 'รอดำเนินการ'],
        dateText: formatThaiDate(booking.startDate),
        timeText: '19:00 น.',
        personText: `ผู้รับผิดชอบ : ฝ่ายพิธีการ (${ritualTask?.staffName || 'ป้าหวาย'})`,
        status: !isApproved
          ? 'รอดำเนินงาน'
          : ritualTask?.status === 'เสร็จสิ้น'
          ? 'เสร็จสิ้น'
          : ritualTask?.status === 'กำลังดำเนินงาน'
          ? 'กำลังดำเนินงาน'
          : 'รอดำเนินงาน',
        subItems: (ritualTask?.checklist || []).map(c => ({
          label: c.label,
          isDone: c.isChecked,
          time: c.completedTime
        })),
        photos: ritualTask?.photos || []
      },
      {
        no: 7,
        title: 'วันฌาปนกิจ',
        sublines: [isCompleted ? 'เสร็จสิ้นพิธีฌาปนกิจ' : 'รอดำเนินการ'],
        dateText: formatThaiDate(booking.cremationDate),
        timeText: '13:00 น.',
        personText: 'ผู้รับผิดชอบ : ฝ่ายพิธีการและสัปเหร่อ',
        status: isCompleted ? 'เสร็จสิ้น' : 'รอดำเนินงาน',
        subItems: [],
        photos: []
      },
      {
        no: 8,
        title: 'งานเสร็จสิ้น',
        sublines: [isCompleted ? 'เสร็จสิ้นบริบูรณ์' : 'รอดำเนินการ'],
        dateText: formatThaiDate(booking.boneCollectionDate),
        timeText: '09:00 น.',
        personText: 'ผู้รับผิดชอบ : วิสาหกิจชุมชนบ้านวิเวก',
        status: isCompleted ? 'เสร็จสิ้น' : 'รอดำเนินงาน',
        subItems: [],
        photos: []
      }
    ];
  };

  const timelineSteps = getTimelineSteps();

  // หากกดปุ่ม "รายละเอียด" บนการ์ดงานศพ จะแสดงหน้าตารางแจกแจงรายการของงานศพนั้น + ปุ่ม Quotation PDF (ตามรูปที่ 6)
  if (showFullSheet && booking) {
    const scheduleGroups = buildFullScheduleItems(booking.packageId);

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-xs text-stone-400 mb-6 flex items-center gap-2">
          <span>หน้าหลัก</span>
          <span>&gt;</span>
          <button onClick={() => setShowFullSheet(false)} className="hover:text-stone-700">
            ตรวจสอบการจัดงาน
          </button>
          <span>&gt;</span>
          <span className="text-stone-800 font-semibold">{booking.packageName}</span>
        </div>

        {/* Header ของงานศพตามรูปที่ 6 */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E6DAC3] shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-8">
          <div className="lg:col-span-5 space-y-1.5">
            <h1 className="text-2xl font-bold text-stone-900">
              งานศพ คุณ {booking.deceased.fullName}
            </h1>
            <p className="text-sm font-semibold text-stone-700">
              เจ้าภาพ {booking.contact.prefix} {booking.contact.fullName}
            </p>
            <p className="text-xs text-stone-500">หมายเลข : {booking.id} ({booking.code})</p>
            <p className="text-xs text-stone-500">
              {formatThaiDate(booking.startDate)} - {formatThaiDate(booking.boneCollectionDate)}
            </p>
            <div className="pt-2">
              <p className="text-xs font-bold text-stone-800">สถานที่จัดงาน</p>
              <p className="text-xs text-stone-600">{booking.locationName} ({booking.pavilionName})</p>
              <p className="text-xs text-stone-500">ต.หนองหาร อ.สันทราย จ.เชียงใหม่</p>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-1.5">
            <h2 className="text-xl font-bold text-stone-900">{booking.packageName}</h2>
            <p className="text-xs text-stone-600">แพ็กเกจยอดนิยม ครบถ้วนทุกพิธีกรรมและการบริการ</p>
            <p className="text-xs text-stone-600">รองรับแขก : ประมาณ {booking.totalGuests} คน</p>
            <p className="text-xs text-stone-600">รูปแบบพิธีกรรม : <strong>{booking.ritualName}</strong></p>
          </div>

          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-stone-200 p-4 bg-[#FDFBF7] text-right">
              <p className="text-xs text-stone-400">ยอดรวมสุทธิ</p>
              <p className="text-2xl font-bold text-[#2E5A44]">
                {booking.netTotal.toLocaleString()} <span className="text-xs font-normal text-stone-600">บาท</span>
              </p>
            </div>
          </div>
        </div>

        {/* แท็บ รายการที่รวมในแพ็กเกจ / รายการที่เพิ่ม */}
        <div className="bg-[#F3E9D8] p-2 rounded-t-2xl flex gap-2 border border-b-0 border-[#E2D3B9]">
          <button
            onClick={() => setSheetTab('INCLUDED')}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition ${
              sheetTab === 'INCLUDED' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'
            }`}
          >
            รายการที่รวมในแพ็กเกจ
          </button>
          <button
            onClick={() => setSheetTab('ADDED')}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition ${
              sheetTab === 'ADDED' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'
            }`}
          >
            รายการที่เพิ่ม ({booking.addons?.length || 0})
          </button>
        </div>

        <div className="bg-white rounded-b-2xl border border-[#E2D3B9] overflow-hidden shadow-sm">
          {sheetTab === 'INCLUDED' ? (
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#F5E9D6] text-stone-800 font-semibold border-b border-[#E2D3B9]">
                  <th className="py-3 px-4 w-20">ลำดับ</th>
                  <th className="py-3 px-4">รายการ</th>
                  <th className="py-3 px-4 text-center">จำนวน</th>
                  <th className="py-3 px-4 text-right">ราคา (บาท)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {scheduleGroups.map((grp, gIdx) => (
                  <React.Fragment key={gIdx}>
                    <tr className="bg-[#FAF6EE]">
                      <td colSpan={4} className="py-2.5 px-4 font-bold text-stone-800">
                        {grp.groupTitle}
                      </td>
                    </tr>
                    {grp.items.map((item, iIdx) => (
                      <tr key={iIdx} className="hover:bg-stone-50">
                        <td className="py-2.5 px-4 text-stone-500">{item.code}</td>
                        <td className="py-2.5 px-4 text-stone-700">{item.name}</td>
                        <td className="py-2.5 px-4 text-center text-stone-600">1 ชุด</td>
                        <td className="py-2.5 px-4 text-right font-medium text-stone-800">
                          {item.price > 0 ? item.price.toLocaleString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6">
              {(!booking.addons || booking.addons.length === 0) ? (
                <p className="text-center text-sm text-stone-400 py-8">ไม่มีรายการสั่งเพิ่มพิเศษในใบงานนี้</p>
              ) : (
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-600">
                      <th className="py-2">รายการเสริม</th>
                      <th className="py-2 text-center">จำนวน</th>
                      <th className="py-2 text-right">ราคาต่อหน่วย</th>
                      <th className="py-2 text-right">ราคารวม</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {booking.addons.map(a => (
                      <tr key={a.id}>
                        <td className="py-3 font-medium text-stone-800">{a.name}</td>
                        <td className="py-3 text-center">{a.qty} {a.unit}</td>
                        <td className="py-3 text-right">{a.price.toLocaleString()} บาท</td>
                        <td className="py-3 text-right font-bold">{a.total.toLocaleString()} บาท</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => setShowFullSheet(false)}
            className="px-5 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-xs font-semibold text-stone-700 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            ย้อนกลับหน้าความคืบหน้า
          </button>

          <button
            onClick={() => window.print()}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow"
          >
            <FileDown className="w-4 h-4" />
            ดาวน์โหลดใบเสนอราคา (Quotation PDF)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-12">
      {/* แบนเนอร์รูปเทียนด้านบนตามรูปดีไซน์ที่ 8 & 9 */}
      <section className="relative bg-stone-900 py-14 sm:py-20 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1508873696983-2dfd5898f08b?auto=format&fit=crop&w=1600&q=80"
          alt="เทียนตรวจสอบสถานะการจัดงาน"
          className="absolute inset-0 w-full h-full object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative max-w-4xl mx-auto px-4 text-left">
          <h1 className="text-xl sm:text-3xl font-bold text-white leading-snug mb-6">
            ตรวจสอบสถานะการจัดงาน และ<br />
            การดำเนินพิธีการทางศาสนา
          </h1>

          <form
            onSubmit={handleSearch}
            className="bg-white rounded-2xl p-2 flex items-center shadow-xl max-w-3xl"
          >
            <input
              type="text"
              placeholder="กรอกหมายเลขรายการ เช่น BW-00001, BW-00002, A001 หรือชื่อผู้เสียชีวิต"
              value={inputCode}
              onChange={e => setInputCode(e.target.value)}
              className="flex-1 px-4 py-2.5 text-sm text-stone-800 focus:outline-none"
            />
            <button
              type="submit"
              className="px-8 py-2.5 rounded-xl bg-[#C5A572] hover:bg-[#B28F58] text-white font-semibold text-sm transition"
            >
              ยืนยัน
            </button>
          </form>

          {/* ปุ่มเลือกดูตัวอย่างใบงานที่มีอยู่ในระบบ */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-stone-200">
            <span>ตัวอย่างรหัสคำขอในระบบ:</span>
            {bookings.map(b => (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  setInputCode(b.id);
                  setActiveCode(b.id);
                }}
                className={`px-2.5 py-0.5 rounded-full border transition ${
                  booking?.id === b.id
                    ? 'bg-amber-400 text-stone-900 border-amber-400 font-bold'
                    : 'bg-black/40 text-white border-white/30 hover:bg-black/60'
                }`}
              >
                {b.id} ({b.deceased.fullName} - {b.status})
              </button>
            ))}
          </div>
        </div>
      </section>

      {!booking ? (
        <div className="max-w-4xl mx-auto px-4 mt-10">
          <div className="bg-white rounded-2xl p-8 text-center border border-stone-200">
            <p className="text-base font-bold text-stone-800">ไม่พบหมายเลขรายการ "{activeCode}"</p>
            <p className="text-xs text-stone-500 mt-1">กรุณาตรวจสอบรหัสคำขออีกครั้ง หรือคลิกปุ่มรหัสตัวอย่างด้านบน</p>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto px-4 mt-8 space-y-8">
          {/* การ์ดข้อมูลงานศพและกำหนดการสำคัญ ตามรูปที่ 8 & 9 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-3 lg:border-r lg:border-stone-200 lg:pr-6">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
                งานศพ คุณ {booking.deceased.fullName}
              </h2>
              <p className="text-sm font-bold text-stone-800">
                เจ้าภาพ &nbsp; {booking.contact.prefix} {booking.contact.fullName}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-stone-600">หมายเลข : <strong>{booking.id}</strong></span>
                <span className="px-3 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-semibold">
                  {booking.packageName}
                </span>
                <button
                  onClick={() => setShowFullSheet(true)}
                  className="px-4 py-1 rounded-md bg-[#C5A572] hover:bg-[#B28F58] text-white text-xs font-semibold transition"
                >
                  รายละเอียด
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 text-xs">
                <div>
                  <p className="font-bold text-stone-800">วันที่เริ่มงาน</p>
                  <p className="text-stone-600 mt-0.5">{formatThaiDate(booking.startDate)}</p>
                </div>
                <div>
                  <p className="font-bold text-stone-800">วันฌาปนกิจ</p>
                  <p className="text-stone-600 mt-0.5">{formatThaiDate(booking.cremationDate)}</p>
                </div>
                <div>
                  <p className="font-bold text-stone-800">วันเก็บกระดูก</p>
                  <p className="text-stone-600 mt-0.5">{formatThaiDate(booking.boneCollectionDate)}</p>
                </div>
                <div>
                  <p className="font-bold text-stone-800">สถานที่จัดงาน</p>
                  <p className="text-stone-600 mt-0.5">{booking.locationName}</p>
                  <p className="text-[10px] text-stone-400">ต.หนองหาร อ.สันทราย จ.เชียงใหม่</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-2.5 text-xs">
              <h3 className="font-bold text-stone-900 text-sm mb-2">กำหนดการสำคัญ & สถานะการชำระเงิน</h3>
              <div className="flex justify-between">
                <span className="text-stone-600 font-medium">วันเริ่มงาน (สวดคืนแรก)</span>
                <span className="font-semibold text-stone-900">{formatThaiDate(booking.startDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600 font-medium">วันฌาปนกิจ</span>
                <span className="font-semibold text-stone-900">{formatThaiDate(booking.cremationDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600 font-medium">วันเก็บกระดูก</span>
                <span className="font-semibold text-stone-900">{formatThaiDate(booking.boneCollectionDate)}</span>
              </div>
              <hr className="border-stone-100 my-2" />
              <div className="flex justify-between items-center">
                <span className="text-stone-600">
                  งวดที่ 1 ({booking.paymentOption === 'FULL' ? 'เต็มจำนวน 100%' : `มัดจำ ${booking.installment1Percent}%`}):
                </span>
                <span className={`font-bold ${booking.installment1Paid ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {booking.installment1Amount.toLocaleString()} บาท ({booking.installment1Paid ? 'ชำระแล้ว' : 'รอชำระที่ศูนย์ฯ'})
                </span>
              </div>
              {booking.paymentOption === 'INSTALLMENT' && (
                <div className="flex justify-between items-center">
                  <span className="text-stone-600">งวดที่ 2 (หลังจบงาน):</span>
                  <span className={`font-bold ${booking.installment2Paid ? 'text-emerald-700' : 'text-stone-600'}`}>
                    {booking.installment2Amount.toLocaleString()} บาท ({booking.installment2Paid ? 'ชำระแล้ว' : 'ชำระวันจบงาน'})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ความคืบหน้าการจัดงาน 8 ขั้นตอน (Timeline) ตามรูปที่ 8 & 9 */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-8">ความคืบหน้าการจัดงาน</h2>

            <div className="space-y-5 relative">
              {timelineSteps.map((st, idx) => {
                const isDone = st.status === 'เสร็จสิ้น';
                const isWorking = st.status === 'กำลังดำเนินงาน';
                const isExpanded = expandedStep === st.no;

                return (
                  <div key={st.no} className="flex items-start gap-4 sm:gap-6 relative">
                    {/* เส้นเชื่อมแนวตั้ง */}
                    {idx < timelineSteps.length - 1 && (
                      <div
                        className={`w-0.5 absolute left-5 top-10 -bottom-6 ${
                          isDone ? 'bg-[#3D7352]' : 'bg-stone-300'
                        }`}
                      />
                    )}

                    {/* วงกลมตัวเลข 1 - 8 */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 z-10 mt-2 ${
                        isDone
                          ? 'bg-[#3D7352] text-white'
                          : isWorking
                          ? 'bg-[#B5894B] text-white'
                          : 'bg-stone-300 text-white'
                      }`}
                    >
                      {st.no}
                    </div>

                    {/* กล่องรายละเอียดของแต่ละขั้น */}
                    <div className="flex-1 rounded-2xl border border-stone-300 overflow-hidden bg-white shadow-sm">
                      <div
                        onClick={() => setExpandedStep(isExpanded ? null : st.no)}
                        className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/70 transition"
                      >
                        <div className="space-y-1 min-w-[200px]">
                          <h3 className="font-bold text-sm sm:text-base text-stone-900">{st.title}</h3>
                          {st.sublines.map((line, lIdx) => (
                            <p
                              key={lIdx}
                              className={`text-xs ${
                                isWorking ? 'text-[#B5894B] font-medium' : 'text-stone-500'
                              }`}
                            >
                              {line}
                            </p>
                          ))}
                        </div>

                        <div className="text-xs text-stone-600 space-y-1">
                          <p>วันที่ : {st.dateText}</p>
                          <p>เวลา : {st.timeText}</p>
                          <p>{st.personText}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                              isDone
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : isWorking
                                ? 'bg-[#F8DFB6] text-stone-900'
                                : 'bg-stone-200 text-stone-700'
                            }`}
                          >
                            {st.status}
                          </span>
                          {(st.subItems.length > 0 || st.photos.length > 0) && (
                            isExpanded ? <ChevronUp className="w-4 h-4 text-stone-500" /> : <ChevronDown className="w-4 h-4 text-stone-500" />
                          )}
                        </div>
                      </div>

                      {/* ส่วนขยายแสดงรายการย่อย (Checklist) และรูปหน้างานของแผนก ตามรูปที่ 8 */}
                      {isExpanded && (st.subItems.length > 0 || st.photos.length > 0) && (
                        <div className="bg-[#F5F2EB] px-6 py-4 border-t border-stone-200 space-y-3">
                          {st.subItems.map((sub, sIdx) => (
                            <div key={sIdx} className="flex items-center justify-between text-xs sm:text-sm max-w-xl">
                              <div className="flex items-center gap-2.5">
                                {sub.isDone ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                                ) : (
                                  <span className="w-4 h-4 inline-block" />
                                )}
                                <span className="font-medium text-stone-800">{sub.label}</span>
                              </div>
                              <div>
                                {sub.isDone ? (
                                  <span className="text-stone-700">
                                    <strong>เสร็จสิ้น</strong> &nbsp; เวลา : {sub.time || '10:30 น.'}
                                  </span>
                                ) : (
                                  <span className="text-[#B5894B] font-medium">กำลังดำเนินการ</span>
                                )}
                              </div>
                            </div>
                          ))}

                          {st.photos.length > 0 && (
                            <div className="pt-2 border-t border-stone-200/80 flex flex-wrap items-center gap-3">
                              <span className="text-xs font-semibold text-stone-600">หลักฐาน / รูปหน้างาน:</span>
                              {st.photos.map((photoUrl, pIdx) => (
                                <button
                                  key={pIdx}
                                  type="button"
                                  onClick={() =>
                                    setPreviewImageModal({
                                      title: `${st.title} - รูปที่ ${pIdx + 1}`,
                                      url: photoUrl
                                    })
                                  }
                                  className="px-3 py-1 rounded-lg bg-white border border-stone-300 text-xs font-medium text-[#2E5A44] flex items-center gap-1.5 hover:bg-stone-50"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  ดูรูปภาพ ({pIdx + 1})
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 bg-[#EFECE6] rounded-xl py-3 px-4 text-center text-xs text-stone-700">
              หากมีข้อสงสัยหรือต้องการความช่วยเหลือ กรุณาติดต่อเจ้าหน้าที่ <strong>0123456789</strong> (8.00 - 17.00 น.)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
