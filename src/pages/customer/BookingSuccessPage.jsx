import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Copy, Search, FileDown, ShieldCheck, Calendar, MapPin, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { IS_DEMO_MODE, SITE_CONFIG } from '../../config/siteConfig';
import QuotationPrintView from '../../components/QuotationPrintView';

export default function BookingSuccessPage() {
  const [searchParams] = useSearchParams();
  const reqId = searchParams.get('req') || '';
  const { bookings } = useApp();
  const { loginAsAdmin } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const booking = reqId
    ? bookings.find(b => b.id === reqId || b.code === reqId)
    : null;

  const handleCopy = async () => {
    if (!booking) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(booking.id);
      } else {
        const tmp = document.createElement('textarea');
        tmp.value = booking.id;
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand('copy');
        document.body.removeChild(tmp);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.alert(`หมายเลขคำขอของคุณคือ: ${booking.id}`);
    }
  };

  const handleGoAdminApprove = () => {
    if (!IS_DEMO_MODE || !booking) return;
    loginAsAdmin();
    navigate(`/admin/requests/${booking.id}`);
  };

  const handlePrintQuotation = () => {
    if (!booking) return;
    const originalTitle = document.title;
    document.title = `ใบเสนอราคา_${booking.id}`;
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

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-white rounded-3xl p-8 border border-[#E6DAC3] shadow-sm text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-600 mx-auto" />
          <h1 className="text-xl font-bold text-stone-900">ไม่พบข้อมูลหมายเลขคำขอที่ระบุ</h1>
          <p className="text-sm text-stone-600">
            กรุณาตรวจสอบหมายเลขคำขอจัดงานของคุณ หรือค้นหาสถานะการจัดงานด้วยชื่อหรือหมายเลขคำขอที่หน้าตรวจสอบสถานะ
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              to="/check-status"
              className="px-6 py-2.5 rounded-xl bg-[#2E5A44] hover:bg-[#234635] text-white text-sm font-semibold"
            >
              ไปหน้าตรวจสอบสถานะ
            </Link>
            <Link
              to="/"
              className="px-6 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-sm font-medium"
            >
              กลับหน้าหลัก
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-white rounded-3xl p-8 border border-[#E6DAC3] shadow-lg text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">
            ส่งคำขอการจัดงานเรียบร้อยแล้ว
          </h1>
          <p className="text-sm text-stone-600">
            กรุณาบันทึกหมายเลขคำขอไว้เพื่อใช้ติดต่อเจ้าหน้าที่ ณ ศูนย์บริการ{SITE_CONFIG.brandName} และใช้ตรวจสอบสถานะการจัดงาน
          </p>
        </div>

        {/* กล่องแสดงหมายเลขคำขอ */}
        <div className="bg-[#FAF5EC] border-2 border-[#B5945B] rounded-2xl p-6 max-w-md mx-auto">
          <p className="text-xs text-stone-500 font-medium">หมายเลขคำขอจัดงานของคุณ (Request Number)</p>
          <div className="mt-2 flex items-center justify-center gap-3">
            <span className="text-3xl font-bold text-[#7C6032] tracking-wider">
              {booking.id}
            </span>
            <button
              onClick={handleCopy}
              className="no-print px-3 py-1.5 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 text-xs font-semibold text-stone-700 flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'คัดลอกแล้ว!' : 'คัดลอก'}
            </button>
          </div>
          <p className="text-xs text-stone-500 mt-1">รหัสใบงานอ้างอิงฝั่งแอดมิน: <strong>{booking.code}</strong></p>
        </div>

        {/* รายละเอียดวันนัดหมายติดต่อศูนย์บริการ */}
        <div className="bg-stone-50 rounded-2xl p-6 text-left border border-stone-200 space-y-3 text-xs sm:text-sm">
          <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#2E5A44]" />
            รายละเอียดนัดหมายชำระเงิน ณ ศูนย์บริการ{SITE_CONFIG.brandName}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <p><span className="text-stone-500">งานศพ:</span> <strong>{booking.deceased.prefix}{booking.deceased.fullName}</strong></p>
            <p><span className="text-stone-500">เจ้าภาพผู้ติดต่อ:</span> <strong>{booking.contact.prefix}{booking.contact.fullName}</strong></p>
            <p><span className="text-stone-500">แพ็กเกจที่เลือก:</span> <strong>{booking.packageName}</strong></p>
            <p><span className="text-stone-500">ยอดรวมสุทธิ:</span> <strong className="text-[#2E5A44]">{Number(booking.netTotal || 0).toLocaleString()} บาท</strong></p>
            <p><span className="text-stone-500">รูปแบบการชำระเงิน:</span> <strong>{booking.paymentOption === 'FULL' ? 'ชำระเต็มจำนวน 100%' : `แบ่งชำระ 2 งวด (งวดแรก ${booking.installment1Percent || 25}%)`}</strong></p>
            <p><span className="text-stone-500">วันเวลานัดหมาย:</span> <strong className="text-amber-800">{booking.appointmentDate} ({booking.appointmentTime})</strong></p>
          </div>

          {booking.paymentOption === 'INSTALLMENT' && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <p>งวดที่ 1 (ชำระวันนัดหมาย): <strong>{Number(booking.installment1Amount || 0).toLocaleString()} บาท</strong></p>
              <p>งวดที่ 2 (ชำระก่อนวันฌาปนกิจ): <strong>{Number(booking.installment2Amount || 0).toLocaleString()} บาท</strong></p>
            </div>
          )}

          <div className="pt-2 border-t border-stone-200 flex items-start gap-2 text-xs text-stone-600">
            <MapPin className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
            <span>
              สถานที่ติดต่อ: {SITE_CONFIG.addressFull} (โทร. {SITE_CONFIG.contactPhone} / {SITE_CONFIG.contactMobile})
            </span>
          </div>
        </div>

        <div className="no-print flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to={`/check-status?code=${booking.id}`}
            className="px-6 py-3 rounded-xl bg-[#2E5A44] hover:bg-[#234635] text-white text-sm font-semibold flex items-center gap-2 shadow transition"
          >
            <Search className="w-4 h-4" />
            ไปหน้าตรวจสอบสถานะการจัดงาน
          </Link>

          <button
            onClick={handlePrintQuotation}
            className="px-5 py-3 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 text-sm font-semibold flex items-center gap-2 transition"
          >
            <FileDown className="w-4 h-4" />
            ดาวน์โหลดใบเสนอราคา
          </button>

          {IS_DEMO_MODE && (
            <button
              onClick={handleGoAdminApprove}
              className="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold flex items-center gap-2 shadow transition"
              title="ปุ่มลัดสำหรับโหมดนำเสนอ/สาธิตเท่านั้น"
            >
              <ShieldCheck className="w-4 h-4" />
              สลับไปฝั่ง Admin เพื่อตรวจอนุมัติ (โหมดสาธิต)
            </button>
          )}
        </div>
      </div>

      {/* เอกสารใบเสนอราคา A4 (แสดงเฉพาะตอนกดโหลด/พิมพ์) */}
      <QuotationPrintView booking={booking} />
    </div>
  );
}
