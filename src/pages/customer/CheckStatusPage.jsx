import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
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
<<<<<<< HEAD
=======
import { IS_DEMO_MODE, SITE_CONFIG } from '../../config/siteConfig';
>>>>>>> 9ae9a7ed19e834d47718f4fd4d43cb16d1094faa
import QuotationPrintView from '../../components/QuotationPrintView';

export default function CheckStatusPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { bookings, assignments, locations, packages, setPreviewImageModal } = useApp();

  const urlCode = searchParams.get('code') || '';
  const [inputCode, setInputCode] = useState(urlCode);
  const [activeCode, setActiveCode] = useState(urlCode);
  const [expandedStep, setExpandedStep] = useState(3);
  const [showFullSheet, setShowFullSheet] = useState(false);
  const [sheetTab, setSheetTab] = useState('INCLUDED'); // 'INCLUDED' | 'ADDED'

  // ซิงก์เมื่อ URL ?code= เปลี่ยน
  useEffect(() => {
    setInputCode(urlCode);
    setActiveCode(urlCode);
    setShowFullSheet(false);
  }, [urlCode]);

  const query = activeCode.trim().toLowerCase();
  const booking = query
    ? bookings.find(
        b =>
          b.id.toLowerCase() === query ||
          b.code.toLowerCase() === query ||
          b.deceased.fullName.toLowerCase().includes(query)
      )
    : null;

  const handleSearch = (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const trimmed = inputCode.trim();
    setActiveCode(trimmed);
    setSearchParams({ code: trimmed });
    setShowFullSheet(false);
  };

  const bookingTasks = booking
    ? assignments.filter(t => t.bookingId === booking.id)
    : [];

  const matchedLocation = booking
    ? (locations || []).find(l => l.id === booking.locationId || l.name === booking.locationName)
    : null;

  const locationAddressText = matchedLocation
    ? `ต.${matchedLocation.subdistrict || 'หนองหาร'} อ.${matchedLocation.district || 'สันทราย'} จ.${matchedLocation.province || 'เชียงใหม่'}`
    : SITE_CONFIG.addressShort;

  const matchedPackage = booking
    ? (packages || []).find(p => p.id === booking.packageId || p.name === booking.packageName)
    : null;

  // แปลงวันที่เป็นภาษาไทยอ่านง่าย
  const formatThaiDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
        ? new Date(...dateStr.split('-').map((v, i) => (i === 1 ? Number(v) - 1 : Number(v))))
        : new Date(dateStr);
      if (Number.isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // สรุปสถานะรวมของชุดใบงานย่อยหลายฝ่าย
  const deriveGroupStatus = (tasksList, isApproved, isCancelled) => {
    if (isCancelled) return 'ยกเลิก';
    if (!isApproved) return 'รอดำเนินงาน';
    const valid = tasksList.filter(Boolean);
    if (valid.length === 0) return 'รอดำเนินงาน';
    if (valid.every(t => t.status === 'เสร็จสิ้น')) return 'เสร็จสิ้น';
    if (valid.some(t => t.status === 'กำลังดำเนินงาน' || t.status === 'เสร็จสิ้น')) return 'กำลังดำเนินงาน';
    return 'รอดำเนินงาน';
  };

  // สร้างไทม์ไลน์ 8 ขั้นตอนเชื่อมข้อมูลจริงครบทั้ง 8 ฝ่ายปฏิบัติงาน
  const getTimelineSteps = () => {
    if (!booking) return [];

    const isCancelled = booking.status === 'ยกเลิก';
    const isApproved = booking.status === 'กำลังดำเนินงาน' || booking.status === 'เสร็จสิ้น';
    const isCompleted = booking.status === 'เสร็จสิ้น';

    const venueTask = bookingTasks.find(t => t.seq === 1);
    const vehicleTask = bookingTasks.find(t => t.seq === 2);
    const coffinTask = bookingTasks.find(t => t.seq === 3);
    const flowerTask = bookingTasks.find(t => t.seq === 4);
    const audioTask = bookingTasks.find(t => t.seq === 5);
    const foodTask = bookingTasks.find(t => t.seq === 6);
    const craftTask = bookingTasks.find(t => t.seq === 7);
    const ritualTask = bookingTasks.find(t => t.seq === 8);

    const mapChecklists = (...tasks) =>
      tasks.filter(Boolean).flatMap(t =>
        (t.checklist || []).map(c => ({
          label: c.label,
          isDone: Boolean(c.isChecked),
          time: c.completedTime || ''
        }))
      );

    const collectPhotos = (...tasks) =>
      tasks.filter(Boolean).flatMap(t => t.photos || []);

    const isAllPaid = booking.paymentOption === 'FULL'
      ? Boolean(booking.installment1Paid)
      : Boolean(booking.installment1Paid && booking.installment2Paid);

    const paymentSlips = [booking.installment1Slip, booking.installment2Slip].filter(Boolean);
    const paymentSublines = [];
    if (booking.installment1Paid) {
      paymentSublines.push(
        `ชำระ${booking.paymentOption === 'FULL' ? 'เต็มจำนวน' : 'มัดจำงวดที่ 1'}แล้ว (${Number(booking.installment1Amount || 0).toLocaleString()} บาท)${booking.installment1PaidAt ? ` เมื่อ ${booking.installment1PaidAt}` : ''}`
      );
    } else {
      paymentSublines.push(
        `รอชำระ${booking.paymentOption === 'FULL' ? 'เต็มจำนวน' : 'งวดที่ 1'} ณ ศูนย์บริการ (${Number(booking.installment1Amount || 0).toLocaleString()} บาท)`
      );
    }
    if (booking.paymentOption === 'INSTALLMENT') {
      paymentSublines.push(
        booking.installment2Paid
          ? `ชำระงวดที่ 2 ครบถ้วนแล้ว (${Number(booking.installment2Amount || 0).toLocaleString()} บาท)${booking.installment2PaidAt ? ` เมื่อ ${booking.installment2PaidAt}` : ''}`
          : `งวดที่ 2 คงเหลือ ${Number(booking.installment2Amount || 0).toLocaleString()} บาท (ชำระก่อนวันจบงาน)`
      );
    }

    return [
      {
        no: 1,
        title: 'รับคำขอ ตรวจสอบข้อมูลและยืนยันการจอง',
        sublines: isCancelled
          ? [`คำขอถูกยกเลิก: ${booking.cancelReason || 'ยกเลิกโดยผู้ดูแลระบบ'}`]
          : [
              'รับข้อมูลคำขอจัดงานและตรวจสอบเอกสารสำคัญ',
              `ยืนยันวันจัดงาน (${formatThaiDate(booking.startDate)}) และสถานที่ (${booking.locationName})`
            ],
        dateText: formatThaiDate(booking.createdAt || booking.appointmentDate),
        timeText: booking.appointmentTime || '-',
        personText: `ผู้ดูแล : ศูนย์บริการ${SITE_CONFIG.brandName}`,
        status: isCancelled ? 'ยกเลิก' : isApproved ? 'เสร็จสิ้น' : 'กำลังดำเนินงาน',
        subItems: [],
        photos: []
      },
      {
        no: 2,
        title: 'ชำระเงิน / ยืนยันหลักฐานการชำระเงิน',
        sublines: isCancelled ? ['ยกเลิกรายการชำระเงิน'] : paymentSublines,
        dateText: formatThaiDate(booking.appointmentDate),
        timeText: booking.appointmentTime || '-',
        personText: `ช่องทาง : ศูนย์บริการ${SITE_CONFIG.brandName}`,
        status: isCancelled
          ? 'ยกเลิก'
          : isAllPaid
            ? 'เสร็จสิ้น'
            : booking.installment1Paid
              ? 'กำลังดำเนินงาน'
              : 'รอดำเนินงาน',
        subItems: [],
        photos: paymentSlips
      },
      {
        no: 3,
        title: 'จัดเตรียมสถานที่ อุปกรณ์ ระบบไฟฟ้าและเครื่องเสียง',
        sublines: [
          `ฝ่ายสถานที่: ${venueTask?.status || 'รอดำเนินงาน'}`,
          `ฝ่ายเครื่องเสียงและไฟฟ้า: ${audioTask?.status || 'รอดำเนินงาน'}`
        ],
        dateText: formatThaiDate(venueTask?.workDate || booking.startDate),
        timeText: venueTask?.workTime || '08:30 น.',
        personText: `ผู้รับผิดชอบ : ${[venueTask?.staffName, audioTask?.staffName].filter(Boolean).join(', ') || 'ฝ่ายสถานที่และเครื่องเสียง'}`,
        status: deriveGroupStatus([venueTask, audioTask], isApproved, isCancelled),
        subItems: mapChecklists(venueTask, audioTask),
        photos: collectPhotos(venueTask, audioTask)
      },
      {
        no: 4,
        title: 'เคลื่อนย้ายร่างและจัดเตรียมหีบศพ / โลงเย็น',
        sublines: [
          `ฝ่ายยานพาหนะ: ${vehicleTask?.status || 'รอดำเนินงาน'}`,
          `ฝ่ายหีบศพและอุปกรณ์: ${coffinTask?.status || 'รอดำเนินงาน'}`
        ],
        dateText: formatThaiDate(vehicleTask?.workDate || booking.startDate),
        timeText: vehicleTask?.workTime || '09:00 น.',
        personText: `ผู้รับผิดชอบ : ${[vehicleTask?.staffName, coffinTask?.staffName].filter(Boolean).join(', ') || 'ฝ่ายยานพาหนะและหีบศพ'}`,
        status: deriveGroupStatus([vehicleTask, coffinTask], isApproved, isCancelled),
        subItems: mapChecklists(vehicleTask, coffinTask),
        photos: collectPhotos(vehicleTask, coffinTask)
      },
      {
        no: 5,
        title: 'จัดดอกไม้ ตกแต่งหน้าหีบศพ และเตรียมของชำร่วย/หัตถกรรม',
        sublines: [
          `ฝ่ายดอกไม้และตกแต่ง: ${flowerTask?.status || 'รอดำเนินงาน'}`,
          `ฝ่ายหัตถกรรมและของชำร่วย: ${craftTask?.status || 'รอดำเนินงาน'}`
        ],
        dateText: formatThaiDate(flowerTask?.workDate || booking.startDate),
        timeText: flowerTask?.workTime || '13:00 น.',
        personText: `ผู้รับผิดชอบ : ${[flowerTask?.staffName, craftTask?.staffName].filter(Boolean).join(', ') || 'ฝ่ายดอกไม้และหัตถกรรม'}`,
        status: deriveGroupStatus([flowerTask, craftTask], isApproved, isCancelled),
        subItems: mapChecklists(flowerTask, craftTask),
        photos: collectPhotos(flowerTask, craftTask)
      },
      {
        no: 6,
<<<<<<< HEAD
        title: 'ดำเนินพิธีการตามกำหนดการ',
        sublines: [ritualTask?.status || 'รอดำเนินการ'],
        dateText: formatThaiDate(booking.startDate),
        timeText: '19:00 น.',
        personText: `ผู้รับผิดชอบ : ฝ่ายพิธีการและศาสนา (${ritualTask?.staffName || 'ป้าหวาย'})`,
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
=======
        title: 'เตรียมอาหาร น้ำดื่ม และบริการรับรองแขก',
        sublines: [foodTask?.status || 'รอดำเนินงาน'],
        dateText: formatThaiDate(foodTask?.workDate || booking.startDate),
        timeText: foodTask?.workTime || '15:00 น.',
        personText: `ผู้รับผิดชอบ : ${foodTask?.department || 'ฝ่ายอาหารและเครื่องดื่ม'}${foodTask?.staffName ? ` (${foodTask.staffName})` : ''}`,
        status: deriveGroupStatus([foodTask], isApproved, isCancelled),
        subItems: mapChecklists(foodTask),
        photos: collectPhotos(foodTask)
>>>>>>> 9ae9a7ed19e834d47718f4fd4d43cb16d1094faa
      },
      {
        no: 7,
        title: 'ดำเนินพิธีสวดพระอภิธรรมและพิธีการทางศาสนา',
        sublines: [ritualTask?.status || 'รอดำเนินงาน'],
        dateText: formatThaiDate(ritualTask?.workDate || booking.startDate),
        timeText: ritualTask?.workTime || '19:00 น.',
        personText: `ผู้รับผิดชอบ : ${ritualTask?.department || 'ฝ่ายพิธีการและศาสนา'}${ritualTask?.staffName ? ` (${ritualTask.staffName})` : ''}`,
        status: deriveGroupStatus([ritualTask], isApproved, isCancelled),
        subItems: mapChecklists(ritualTask),
        photos: collectPhotos(ritualTask)
      },
      {
        no: 8,
        title: 'พิธีฌาปนกิจ เก็บอัฐิ และส่งมอบงานเสร็จสิ้นบริบูรณ์',
        sublines: [isCancelled ? 'ยกเลิกการจัดงาน' : isCompleted ? 'ส่งมอบงานและปิดงานเรียบร้อยแล้ว' : `กำหนดวันฌาปนกิจ ${formatThaiDate(booking.cremationDate)}`],
        dateText: formatThaiDate(booking.boneCollectionDate || booking.cremationDate),
        timeText: 'ตามกำหนดการพิธี',
        personText: `ผู้รับผิดชอบ : ทุกฝ่าย (${SITE_CONFIG.brandName})`,
        status: isCancelled ? 'ยกเลิก' : isCompleted ? 'เสร็จสิ้น' : 'รอดำเนินงาน',
        subItems: [],
        photos: []
      }
    ];
  };

  const timelineSteps = getTimelineSteps();

<<<<<<< HEAD
  // เพิ่มฟังก์ชันสั่งพิมพ์พร้อมตั้งชื่อไฟล์อัตโนมัติ
=======
  // ฟังก์ชันสั่งพิมพ์ใบเสนอราคา A4 พร้อมตั้งชื่อไฟล์อัตโนมัติ
>>>>>>> 9ae9a7ed19e834d47718f4fd4d43cb16d1094faa
  const handlePrintQuotation = () => {
    if (!booking) return;
    const originalTitle = document.title;
    document.title = `ใบเสนอราคา_${booking.id}`;
<<<<<<< HEAD
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 500);
  };

  // หากกดปุ่ม "รายละเอียด" บนการ์ดงานศพ จะแสดงหน้าตารางแจกแจงรายการของงานศพนั้น + ปุ่ม Quotation PDF (ตามรูปที่ 6)
=======
    document.body.classList.add('printing-quotation');
    const cleanup = () => {
      document.title = originalTitle;
      document.body.classList.remove('printing-quotation');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.print();
    setTimeout(cleanup, 1000);
  };

  // รวมรายการเพิ่มเติมทั้งหมด (บริการเสริม + แขกเพิ่ม + อัปเกรดพิธีกรรม) เพื่อแสดงในใบเสนอราคาให้ยอดตรง 100%
  const extraChargesRows = booking
    ? [
        ...(booking.ritualUpgradePrice > 0
          ? [{
              id: 'EXTRA-RITUAL',
              name: `อัปเกรดรูปแบบพิธีกรรม (${booking.ritualName})`,
              qtyText: '1 งาน',
              unitPrice: Number(booking.ritualUpgradePrice),
              total: Number(booking.ritualUpgradePrice)
            }]
          : []),
        ...(booking.extraGuests > 0 && booking.extraGuestsCost > 0
          ? [{
              id: 'EXTRA-GUESTS',
              name: `เพิ่มจำนวนแขกรองรับเกินแพ็กเกจ (อาหารว่าง/น้ำดื่ม/เก้าอี้)`,
              qtyText: `${booking.extraGuests} คน`,
              unitPrice: 150,
              total: Number(booking.extraGuestsCost)
            }]
          : []),
        ...(booking.addons || []).map(a => ({
          id: a.id,
          name: a.name,
          qtyText: `${a.qty} ${a.unit || 'ชุด'}`,
          unitPrice: Number(a.price) || 0,
          total: Number(a.total) || 0
        }))
      ]
    : [];

  // หน้าใบเสนอราคา/รายละเอียดฉบับเต็ม (Quotation PDF)
>>>>>>> 9ae9a7ed19e834d47718f4fd4d43cb16d1094faa
  if (showFullSheet && booking) {
    const scheduleGroups = buildFullScheduleItems(booking.packageId);

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="no-print text-xs text-stone-400 mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-stone-700">หน้าหลัก</Link>
          <span>&gt;</span>
          <button onClick={() => setShowFullSheet(false)} className="hover:text-stone-700">
            ตรวจสอบการจัดงาน
          </button>
          <span>&gt;</span>
          <span className="text-stone-800 font-semibold">{booking.packageName}</span>
        </div>

        {/* Header ของใบเสนอราคา */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E6DAC3] shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-8">
          <div className="lg:col-span-5 space-y-1.5">
            <h1 className="text-2xl font-bold text-stone-900">
              งานศพ {booking.deceased.prefix}{booking.deceased.fullName}
            </h1>
            <p className="text-sm font-semibold text-stone-700">
              เจ้าภาพ {booking.contact.prefix}{booking.contact.fullName}
            </p>
            <p className="text-xs text-stone-500">หมายเลข : {booking.id} ({booking.code})</p>
            <p className="text-xs text-stone-500">
              {formatThaiDate(booking.startDate)} - {formatThaiDate(booking.boneCollectionDate)}
            </p>
            <div className="pt-2">
              <p className="text-xs font-bold text-stone-800">สถานที่จัดงาน</p>
              <p className="text-xs text-stone-600">{booking.locationName} ({booking.pavilionName})</p>
              <p className="text-xs text-stone-500">{locationAddressText}</p>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-1.5">
            <h2 className="text-xl font-bold text-stone-900">{booking.packageName}</h2>
            <p className="text-xs text-stone-600">
              {matchedPackage?.tagline || 'บริการจัดงานศพครบวงจรโดยวิสาหกิจชุมชนบ้านวิเวก'}
            </p>
            <p className="text-xs text-stone-600">รองรับแขก : ประมาณ {booking.totalGuests} คน</p>
            <p className="text-xs text-stone-600">รูปแบบพิธีกรรม : <strong>{booking.ritualName}</strong></p>
          </div>

          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-stone-200 p-4 bg-[#FDFBF7] text-right space-y-1">
              <p className="text-xs text-stone-400">ยอดรวมสุทธิ</p>
              <p className="text-2xl font-bold text-[#2E5A44]">
                {Number(booking.netTotal || 0).toLocaleString()} <span className="text-xs font-normal text-stone-600">บาท</span>
              </p>
              <p className="text-[11px] text-stone-500">
                แพ็กเกจ {Number(booking.packagePrice || 0).toLocaleString()} บาท
                {extraChargesRows.length > 0 && ` + รายการเพิ่ม ${extraChargesRows.reduce((s, r) => s + r.total, 0).toLocaleString()} บาท`}
              </p>
            </div>
          </div>
        </div>

        {/* แท็บ รายการที่รวมในแพ็กเกจ / รายการที่เพิ่ม */}
        <div className="no-print bg-[#F3E9D8] p-2 rounded-t-2xl flex gap-2 border border-b-0 border-[#E2D3B9]">
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
            รายการที่เพิ่ม ({extraChargesRows.length})
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
              {extraChargesRows.length === 0 ? (
                <p className="text-center text-sm text-stone-400 py-8">ไม่มีรายการสั่งเพิ่มพิเศษในใบงานนี้</p>
              ) : (
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-600">
                      <th className="py-2">รายการเพิ่มเติม</th>
                      <th className="py-2 text-center">จำนวน</th>
                      <th className="py-2 text-right">ราคาต่อหน่วย</th>
                      <th className="py-2 text-right">ราคารวม</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {extraChargesRows.map(row => (
                      <tr key={row.id}>
                        <td className="py-3 font-medium text-stone-800">{row.name}</td>
                        <td className="py-3 text-center">{row.qtyText}</td>
                        <td className="py-3 text-right">{row.unitPrice.toLocaleString()} บาท</td>
                        <td className="py-3 text-right font-bold">{row.total.toLocaleString()} บาท</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-stone-200 bg-stone-50 font-bold text-stone-900">
                      <td colSpan={3} className="py-3 px-2 text-right">รวมรายการเพิ่มเติมทั้งหมด</td>
                      <td className="py-3 text-right text-[#2E5A44]">
                        {extraChargesRows.reduce((sum, r) => sum + r.total, 0).toLocaleString()} บาท
                      </td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          )}
        </div>

        <div className="no-print mt-8 flex items-center justify-between">
          <button
            onClick={() => setShowFullSheet(false)}
            className="px-5 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-xs font-semibold text-stone-700 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            ย้อนกลับหน้าความคืบหน้า
          </button>

          <button
            onClick={handlePrintQuotation}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow"
          >
            <FileDown className="w-4 h-4" />
            ดาวน์โหลดใบเสนอราคา (Quotation PDF)
          </button>
        </div>

        {/* เอกสารใบเสนอราคา A4 (แสดงเฉพาะตอนสั่ง Print / Save as PDF) */}
        <QuotationPrintView booking={booking} />
      </div>
    );
  }

  return (
    <div className="pb-12">
      {/* แบนเนอร์ค้นหา */}
      <section className="no-print relative bg-stone-900 overflow-hidden min-h-[340px] sm:min-h-[420px] flex items-center">
        <img
          src="/images/header-banner.png"
          alt="แบนเนอร์ตรวจสอบสถานะการจัดงาน"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-55"
        />
        <div className="absolute inset-0 bg-stone-900/45" />

        <div className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 text-center">
          <h1 className="text-xl sm:text-3xl font-bold text-white drop-shadow leading-snug mb-6">
            ตรวจสอบสถานะการจัดงาน และ<br />
            การดำเนินพิธีการทางศาสนา
          </h1>

          <form
            onSubmit={handleSearch}
            className="bg-white rounded-2xl p-2 flex items-center shadow-xl max-w-3xl mx-auto"
          >
            <input
              type="text"
              placeholder="กรอกหมายเลขรายการ เช่น BW-00001 หรือ A001 หรือชื่อผู้เสียชีวิต"
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

          {/* แถบตัวอย่างรหัสคำขอ (แสดงเฉพาะโหมดเดโมสาธิต ซ่อนอัตโนมัติในโหมดใช้งานจริงเพื่อความเป็นส่วนตัว) */}
          {IS_DEMO_MODE && bookings.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-stone-200">
              <span>รหัสตัวอย่าง (โหมดสาธิต):</span>
              {bookings.map(b => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setInputCode(b.id);
                    setActiveCode(b.id);
                    setSearchParams({ code: b.id });
                    setShowFullSheet(false);
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
          )}
        </div>
      </section>

      {!activeCode.trim() ? (
        <div className="max-w-4xl mx-auto px-4 mt-10">
          <div className="bg-white rounded-2xl p-8 text-center border border-[#E6DAC3] shadow-sm space-y-2">
            <p className="text-base font-bold text-stone-800">
              กรุณากรอกหมายเลขคำขอจัดงาน (เช่น BW-00001 หรือ A001) หรือชื่อผู้เสียชีวิต
            </p>
            <p className="text-xs text-stone-500">
              เพื่อตรวจสอบกำหนดการ สถานะการชำระเงิน และความคืบหน้าของแต่ละฝ่ายปฏิบัติงาน
            </p>
          </div>
        </div>
      ) : !booking ? (
        <div className="max-w-4xl mx-auto px-4 mt-10">
          <div className="bg-white rounded-2xl p-8 text-center border border-stone-200">
            <p className="text-base font-bold text-stone-800">ไม่พบหมายเลขรายการ "{activeCode}"</p>
            <p className="text-xs text-stone-500 mt-1">
              กรุณาตรวจสอบหมายเลขคำขอจัดงานอีกครั้ง หรือติดต่อเจ้าหน้าที่โทร. {SITE_CONFIG.contactPhone}
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto px-4 mt-8 space-y-8">
          {booking.status === 'ยกเลิก' && (
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 text-red-900">
              <p className="font-bold text-sm sm:text-base">⚠️ คำขอจัดงานนี้ถูกยกเลิกแล้ว</p>
              <p className="text-xs sm:text-sm mt-1">
                เหตุผล: {booking.cancelReason || 'ยกเลิกคำขอจัดงานโดยผู้ดูแลระบบ'}
              </p>
            </div>
          )}

          {/* การ์ดข้อมูลงานศพและกำหนดการสำคัญ */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-3 lg:border-r lg:border-stone-200 lg:pr-6">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
                งานศพ {booking.deceased.prefix}{booking.deceased.fullName}
              </h2>
              <p className="text-sm font-bold text-stone-800">
                เจ้าภาพ &nbsp; {booking.contact.prefix}{booking.contact.fullName}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-stone-600">หมายเลข : <strong>{booking.id} ({booking.code})</strong></span>
                <span className="px-3 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-semibold">
                  {booking.packageName}
                </span>
                <span
                  className={`px-3 py-0.5 rounded-md text-xs font-bold ${
                    booking.status === 'เสร็จสิ้น'
                      ? 'bg-emerald-700 text-white'
                      : booking.status === 'กำลังดำเนินงาน'
                      ? 'bg-blue-100 text-blue-800'
                      : booking.status === 'ยกเลิก'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  สถานะ: {booking.status}
                </span>
                <button
                  onClick={() => setShowFullSheet(true)}
                  className="no-print px-4 py-1 rounded-md bg-[#C5A572] hover:bg-[#B28F58] text-white text-xs font-semibold transition"
                >
                  รายละเอียด / ใบเสนอราคา
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
                  <p className="text-[11px] text-stone-700 font-medium">{booking.pavilionName}</p>
                  <p className="text-[10px] text-stone-400">{locationAddressText}</p>
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
                  {Number(booking.installment1Amount || 0).toLocaleString()} บาท ({booking.installment1Paid ? 'ชำระแล้ว' : 'รอชำระที่ศูนย์ฯ'})
                </span>
              </div>
              {booking.paymentOption === 'INSTALLMENT' && (
                <div className="flex justify-between items-center">
                  <span className="text-stone-600">งวดที่ 2 (หลังจบงาน):</span>
                  <span className={`font-bold ${booking.installment2Paid ? 'text-emerald-700' : 'text-stone-600'}`}>
                    {Number(booking.installment2Amount || 0).toLocaleString()} บาท ({booking.installment2Paid ? 'ชำระแล้ว' : 'ชำระวันจบงาน'})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ความคืบหน้าการจัดงาน 8 ขั้นตอน (Timeline) */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-8">ความคืบหน้าการจัดงาน</h2>

            <div className="space-y-5 relative">
              {timelineSteps.map((st, idx) => {
                const isDone = st.status === 'เสร็จสิ้น';
                const isWorking = st.status === 'กำลังดำเนินงาน';
                const isCancelledStep = st.status === 'ยกเลิก';
                const isExpanded = expandedStep === st.no;

                return (
                  <div key={st.no} className="flex items-start gap-4 sm:gap-6 relative">
                    {idx < timelineSteps.length - 1 && (
                      <div
                        className={`w-0.5 absolute left-5 top-10 -bottom-6 ${
                          isDone ? 'bg-[#3D7352]' : isCancelledStep ? 'bg-red-200' : 'bg-stone-300'
                        }`}
                      />
                    )}

                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 z-10 mt-2 ${
                        isDone
                          ? 'bg-[#3D7352] text-white'
                          : isWorking
                          ? 'bg-[#B5894B] text-white'
                          : isCancelledStep
                          ? 'bg-red-400 text-white'
                          : 'bg-stone-300 text-white'
                      }`}
                    >
                      {st.no}
                    </div>

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
                                isCancelledStep
                                  ? 'text-red-600'
                                  : isWorking
                                  ? 'text-[#B5894B] font-medium'
                                  : 'text-stone-500'
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
                                : isCancelledStep
                                ? 'bg-red-100 text-red-700 border border-red-200'
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
                                    <strong>เสร็จสิ้น</strong>{sub.time ? ` • ${sub.time}` : ''}
                                  </span>
                                ) : isWorking ? (
                                  <span className="text-[#B5894B] font-medium">กำลังดำเนินงาน</span>
                                ) : (
                                  <span className="text-stone-400">รอดำเนินงาน</span>
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
              หากมีข้อสงสัยหรือต้องการความช่วยเหลือ กรุณาติดต่อเจ้าหน้าที่ <strong>{SITE_CONFIG.contactPhone}</strong> / <strong>{SITE_CONFIG.contactMobile}</strong> ({SITE_CONFIG.serviceHours})
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
