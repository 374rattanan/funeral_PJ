import React from 'react';
import { createPortal } from 'react-dom';
<<<<<<< HEAD
=======
import { SITE_CONFIG } from '../config/siteConfig';
>>>>>>> 9ae9a7ed19e834d47718f4fd4d43cb16d1094faa

function thaiBahtText(amount) {
  const num = Number(amount) || 0;
  if (num === 0) return 'ศูนย์บาทถ้วน';

  const txtNum = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const txtDigit = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

  const convertInt = (nStr) => {
    let res = '';
    const len = nStr.length;
    for (let i = 0; i < len; i++) {
      const digit = parseInt(nStr[i], 10);
      const pos = len - i - 1;
      if (digit !== 0) {
        if (pos % 6 === 1 && digit === 1) res += '';
        else if (pos % 6 === 1 && digit === 2) res += 'ยี่';
        else if (pos % 6 === 0 && digit === 1 && i > 0 && nStr[i - 1] !== '0') res += 'เอ็ด';
        else res += txtNum[digit];

        res += txtDigit[pos % 6];
      }
      if (pos !== 0 && pos % 6 === 0) res += 'ล้าน';
    }
    return res;
  };

  const [intPart, decPart] = num.toFixed(2).split('.');
  let result = convertInt(intPart) + 'บาท';
  if (decPart === '00') {
    result += 'ถ้วน';
  } else {
    result += convertInt(decPart) + 'สตางค์';
  }
  return result;
}

export default function QuotationPrintView({ booking }) {
  if (!booking) return null;

  const formatThaiDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
<<<<<<< HEAD
      return new Date(dateStr).toLocaleDateString('th-TH', {
=======
      const d =
        typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
          ? new Date(...dateStr.split('-').map((v, i) => (i === 1 ? Number(v) - 1 : Number(v))))
          : new Date(dateStr);
      if (Number.isNaN(d.getTime())) return String(dateStr);
      return d.toLocaleDateString('th-TH', {
>>>>>>> 9ae9a7ed19e834d47718f4fd4d43cb16d1094faa
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
<<<<<<< HEAD
      return dateStr;
=======
      return String(dateStr);
>>>>>>> 9ae9a7ed19e834d47718f4fd4d43cb16d1094faa
    }
  };

  const rawIssueDate = booking.createdAt || booking.created_at || booking.bookingDate;
  const parsedIssueDate = rawIssueDate ? new Date(rawIssueDate) : new Date();
  const issueDate = Number.isNaN(parsedIssueDate.getTime()) ? new Date() : parsedIssueDate;

  const validUntil = new Date(issueDate);
  validUntil.setDate(issueDate.getDate() + 15);

  const addons = booking.addons || [];
  const addonsTotal = addons.reduce((sum, a) => sum + (Number(a.total) || 0), 0);
  const ritualUpgrade = Number(booking.ritualUpgradePrice) || 0;
<<<<<<< HEAD
  const packageBasePrice =
    booking.packagePrice != null
      ? Number(booking.packagePrice)
      : Math.max(0, Number(booking.netTotal || 0) - addonsTotal - ritualUpgrade);

  const contactName = `${booking.contact?.prefix || ''}${booking.contact?.fullName || '-'}`.trim();
=======
  const extraGuests = Number(booking.extraGuests) || 0;
  const extraGuestsCost = Number(booking.extraGuestsCost) || 0;
  const extraGuestUnitPrice = extraGuests > 0 ? extraGuestsCost / extraGuests : 150;
  const netTotal = Number(booking.netTotal) || 0;
  const packageBasePrice =
    booking.packagePrice != null
      ? Number(booking.packagePrice)
      : Math.max(0, netTotal - addonsTotal - ritualUpgrade - extraGuestsCost);

  const contactName = `${booking.contact?.prefix || ''}${booking.contact?.fullName || '-'}`.trim();
  const deceasedName = `${booking.deceased?.prefix || 'คุณ '}${booking.deceased?.fullName || '-'}`.trim();
>>>>>>> 9ae9a7ed19e834d47718f4fd4d43cb16d1094faa
  const contactPhone = booking.contact?.phone || '-';
  const contactAddress =
    booking.contact?.address ||
    [
      booking.contact?.addressDetail,
      booking.contact?.subdistrict && `ต.${booking.contact.subdistrict}`,
      booking.contact?.district && `อ.${booking.contact.district}`,
      booking.contact?.province && `จ.${booking.contact.province}`,
      booking.contact?.postalCode
    ]
      .filter(Boolean)
      .join(' ') ||
<<<<<<< HEAD
    'ต.หนองหาร อ.สันทราย จ.เชียงใหม่';
=======
    SITE_CONFIG.addressShort;

  const mainPackageRows = [
    {
      key: 'main-package',
      title: booking.packageName,
      subtitle: `รองรับแขกประมาณ ${booking.totalGuests} คน | รูปแบบพิธีกรรม: ${booking.ritualName}`,
      qty: 1,
      unit: 'แพ็กเกจ',
      unitPrice: packageBasePrice,
      amount: packageBasePrice
    },
    ...(ritualUpgrade > 0
      ? [
          {
            key: 'ritual-upgrade',
            title: `ค่าบริการเพิ่มเติมรูปแบบพิธีกรรม (${booking.ritualName})`,
            qty: 1,
            unit: 'งาน',
            unitPrice: ritualUpgrade,
            amount: ritualUpgrade
          }
        ]
      : []),
    ...(extraGuests > 0 && extraGuestsCost > 0
      ? [
          {
            key: 'extra-guests',
            title: 'เพิ่มจำนวนแขกรองรับเกินแพ็กเกจ (อาหารว่าง/น้ำดื่ม/เก้าอี้)',
            qty: extraGuests,
            unit: 'คน',
            unitPrice: extraGuestUnitPrice,
            amount: extraGuestsCost
          }
        ]
      : [])
  ];
>>>>>>> 9ae9a7ed19e834d47718f4fd4d43cb16d1094faa

  const content = (
    <div
      id="quotation-print-area"
      className="hidden bg-white text-stone-800 text-[11px] leading-snug"
      style={{ fontFamily: "'Prompt', sans-serif" }}
    >
      <div className="w-full max-w-[182mm] mx-auto bg-white">
        {/* 1. ส่วนหัวเอกสาร */}
        <div className="flex justify-between items-start pb-3">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">ใบเสนอราคา</h1>
            <p className="text-sm font-medium text-stone-600">
              Quotation <span className="text-xs text-stone-400 font-normal ml-2">(ต้นฉบับ / Original)</span>
            </p>
          </div>

          <div className="w-12 h-12 rounded-full border-2 border-stone-700 flex items-center justify-center font-bold text-sm text-stone-800">
            BW
          </div>
        </div>

        {/* 2. ข้อมูลลูกค้า (เจ้าภาพ) และ เลขที่เอกสาร */}
        <div className="grid grid-cols-12 gap-6 py-2.5 border-t border-b border-stone-300 text-[11px]">
          <div className="col-span-7 space-y-0.5">
            <div className="flex">
              <span className="text-stone-500 w-28 shrink-0">ลูกค้า / Customer</span>
              <span className="font-semibold text-stone-900">
                {contactName} {booking.contact?.relationship ? `(${booking.contact.relationship})` : ''}
              </span>
            </div>
            <div className="flex">
              <span className="text-stone-500 w-28 shrink-0">ที่อยู่ / Address</span>
              <span>{contactAddress}</span>
            </div>
            <div className="flex">
              <span className="text-stone-500 w-28 shrink-0">ติดต่อ / Contact</span>
              <span>
                โทร. {contactPhone} {booking.contact?.lineId ? `| Line: ${booking.contact.lineId}` : ''}
              </span>
            </div>
            <div className="flex">
              <span className="text-stone-500 w-28 shrink-0">งานฌาปนกิจ</span>
<<<<<<< HEAD
              <span className="font-semibold text-stone-900">คุณ {booking.deceased?.fullName || '-'}</span>
=======
              <span className="font-semibold text-stone-900">{deceasedName}</span>
>>>>>>> 9ae9a7ed19e834d47718f4fd4d43cb16d1094faa
            </div>
          </div>

          <div className="col-span-5 space-y-0.5">
            <div className="flex justify-between">
              <span className="text-stone-500">เลขที่ / No.</span>
              <span className="font-bold text-stone-900">QT-{booking.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">วันที่ / Issue</span>
              <span>{formatThaiDate(issueDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">ใช้ได้ถึง / Valid</span>
              <span>{formatThaiDate(validUntil)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">อ้างอิง / Ref</span>
              <span>
                {booking.id} {booking.code ? `(${booking.code})` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* 3. ข้อมูลผู้ออกเอกสาร & สถานที่/กำหนดการ */}
        <div className="grid grid-cols-12 gap-6 py-2.5 text-[11px]">
          <div className="col-span-7 space-y-0.5">
            <div className="flex">
              <span className="text-stone-500 w-28 shrink-0">ผู้ออก / Issuer</span>
              <div>
<<<<<<< HEAD
                <p className="font-semibold text-stone-900">วิสาหกิจชุมชนบ้านวิเวก</p>
                <p className="text-stone-600">หมู่ 8 ต.หนองหาร อ.สันทราย จ.เชียงใหม่ 50290</p>
                <p className="text-stone-600">โทร. 012-345-6789</p>
=======
                <p className="font-semibold text-stone-900">{SITE_CONFIG.brandName}</p>
                <p className="text-stone-600">{SITE_CONFIG.addressShort}</p>
                <p className="text-stone-600">
                  โทร. {SITE_CONFIG.contactPhone}
                  {SITE_CONFIG.contactMobile ? ` / ${SITE_CONFIG.contactMobile}` : ''}
                </p>
>>>>>>> 9ae9a7ed19e834d47718f4fd4d43cb16d1094faa
              </div>
            </div>
          </div>

          <div className="col-span-5 space-y-0.5 text-stone-700">
            <div className="flex justify-between">
              <span className="text-stone-500">สถานที่:</span>
              <span className="font-medium text-stone-900">
                {booking.locationName} ({booking.pavilionName || 'ศาลา 1'})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">เริ่มสวด:</span>
              <span>{formatThaiDate(booking.startDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">ฌาปนกิจ:</span>
              <span>{formatThaiDate(booking.cremationDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">เก็บอัฐิ:</span>
              <span>{formatThaiDate(booking.boneCollectionDate)}</span>
            </div>
          </div>
        </div>

        {/* 4. ตารางที่ 1: แพ็กเกจหลัก */}
        <div className="mt-1">
          <p className="font-bold text-stone-800 text-[11px] mb-1">รายการแพ็กเกจหลัก / Main Package</p>
          <table className="w-full table-fixed border-collapse border border-stone-400 text-[11px]">
            <thead style={{ display: 'table-header-group' }}>
              <tr className="border-b border-stone-400 text-stone-900 bg-stone-50/70">
                <th className="py-1.5 px-2 w-12 text-center font-bold border-r border-stone-300">
                  ลำดับ
                  <span className="block text-[9px] font-normal text-stone-400">No.</span>
                </th>
                <th className="py-1.5 px-3 text-left font-bold border-r border-stone-300">
                  คำอธิบายรายการ
                  <span className="block text-[9px] font-normal text-stone-400">Description</span>
                </th>
                <th className="py-1.5 px-2 w-14 text-center font-bold border-r border-stone-300">
                  จำนวน
                  <span className="block text-[9px] font-normal text-stone-400">Qty</span>
                </th>
                <th className="py-1.5 px-2 w-24 text-center font-bold border-r border-stone-300">
                  หน่วย
                  <span className="block text-[9px] font-normal text-stone-400">Unit</span>
                </th>
                <th className="py-1.5 px-2.5 w-24 text-right font-bold border-r border-stone-300">
                  ราคาต่อหน่วย
                  <span className="block text-[9px] font-normal text-stone-400">Unit Price</span>
                </th>
                <th className="py-1.5 px-2.5 w-24 text-right font-bold">
                  จำนวนเงิน
                  <span className="block text-[9px] font-normal text-stone-400">Amount</span>
                </th>
              </tr>
            </thead>
            <tbody>
<<<<<<< HEAD
              <tr className="align-top border-b border-stone-300 break-inside-avoid">
                <td className="py-2 px-2 text-center border-r border-stone-300">1</td>
                <td className="py-2 px-3 border-r border-stone-300">
                  <p className="font-semibold text-stone-900">{booking.packageName}</p>
                  <p className="text-[10px] text-stone-600 mt-0.5">
                    รองรับแขกประมาณ {booking.totalGuests} คน | รูปแบบพิธีกรรม: {booking.ritualName}
                  </p>
                </td>
                <td className="py-2 px-2 text-center border-r border-stone-300">1</td>
                <td className="py-2 px-2 text-center border-r border-stone-300">แพ็กเกจ</td>
                <td className="py-2 px-2.5 text-right border-r border-stone-300">
                  {packageBasePrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2 px-2.5 text-right font-medium text-stone-900">
                  {packageBasePrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </td>
              </tr>

              {ritualUpgrade > 0 && (
                <tr className="align-top border-b border-stone-300 break-inside-avoid">
                  <td className="py-1.5 px-2 text-center border-r border-stone-300">2</td>
                  <td className="py-1.5 px-3 border-r border-stone-300">
                    ค่าบริการเพิ่มเติมรูปแบบพิธีกรรม ({booking.ritualName})
                  </td>
                  <td className="py-1.5 px-2 text-center border-r border-stone-300">1</td>
                  <td className="py-1.5 px-2 text-center border-r border-stone-300">งาน</td>
                  <td className="py-1.5 px-2.5 text-right border-r border-stone-300">
                    {ritualUpgrade.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-1.5 px-2.5 text-right font-medium text-stone-900">
                    {ritualUpgrade.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              )}
=======
              {mainPackageRows.map((row, idx) => (
                <tr key={row.key} className="align-top border-b border-stone-300 break-inside-avoid">
                  <td className="py-1.5 px-2 text-center border-r border-stone-300">{idx + 1}</td>
                  <td className="py-1.5 px-3 border-r border-stone-300">
                    <p className={row.subtitle ? 'font-semibold text-stone-900' : ''}>{row.title}</p>
                    {row.subtitle && (
                      <p className="text-[10px] text-stone-600 mt-0.5">{row.subtitle}</p>
                    )}
                  </td>
                  <td className="py-1.5 px-2 text-center border-r border-stone-300">{row.qty}</td>
                  <td className="py-1.5 px-2 text-center border-r border-stone-300">{row.unit}</td>
                  <td className="py-1.5 px-2.5 text-right border-r border-stone-300">
                    {row.unitPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-1.5 px-2.5 text-right font-medium text-stone-900">
                    {row.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
>>>>>>> 9ae9a7ed19e834d47718f4fd4d43cb16d1094faa
            </tbody>
          </table>
        </div>

        {/* 5. ตารางที่ 2: รายการสั่งเพิ่มพิเศษ (แสดงเฉพาะเมื่อมีรายการเสริม) */}
        {addons.length > 0 && (
          <div className="mt-3">
            <p className="font-bold text-stone-800 text-[11px] mb-1">รายการสั่งเพิ่มพิเศษ / Additional Items</p>
            <table className="w-full table-fixed border-collapse border border-stone-400 text-[11px]">
              <thead style={{ display: 'table-header-group' }}>
                <tr className="border-b border-stone-400 text-stone-900 bg-stone-50/70">
                  <th className="py-1.5 px-2 w-12 text-center font-bold border-r border-stone-300">
                    ลำดับ
                    <span className="block text-[9px] font-normal text-stone-400">No.</span>
                  </th>
                  <th className="py-1.5 px-3 text-left font-bold border-r border-stone-300">
                    รายการเสริม
                    <span className="block text-[9px] font-normal text-stone-400">Description</span>
                  </th>
                  <th className="py-1.5 px-2 w-14 text-center font-bold border-r border-stone-300">
                    จำนวน
                    <span className="block text-[9px] font-normal text-stone-400">Qty</span>
                  </th>
                  <th className="py-1.5 px-2 w-24 text-center font-bold border-r border-stone-300">
                    หน่วย
                    <span className="block text-[9px] font-normal text-stone-400">Unit</span>
                  </th>
                  <th className="py-1.5 px-2.5 w-24 text-right font-bold border-r border-stone-300">
                    ราคาต่อหน่วย
                    <span className="block text-[9px] font-normal text-stone-400">Unit Price</span>
                  </th>
                  <th className="py-1.5 px-2.5 w-24 text-right font-bold">
                    จำนวนเงิน
                    <span className="block text-[9px] font-normal text-stone-400">Amount</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {addons.map((addon, idx) => (
                  <tr key={addon.id || idx} className="align-top border-b border-stone-300 break-inside-avoid">
                    <td className="py-1.5 px-2 text-center border-r border-stone-300">{idx + 1}</td>
                    <td className="py-1.5 px-3 border-r border-stone-300">{addon.name}</td>
                    <td className="py-1.5 px-2 text-center border-r border-stone-300">
                      {Math.round(Number(addon.qty) || 0)}
                    </td>
                    <td className="py-1.5 px-2 text-center border-r border-stone-300">{addon.unit || 'ชุด'}</td>
                    <td className="py-1.5 px-2.5 text-right border-r border-stone-300">
<<<<<<< HEAD
                      {Number(addon.price).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-1.5 px-2.5 text-right font-medium text-stone-900">
                      {Number(addon.total).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
=======
                      {(Number(addon.price) || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-1.5 px-2.5 text-right font-medium text-stone-900">
                      {(Number(addon.total) || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
>>>>>>> 9ae9a7ed19e834d47718f4fd4d43cb16d1094faa
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* รวบส่วนสรุปยอด + ลายเซ็น ไม่ให้โดนตัดครึ่งข้ามหน้า */}
        <div className="break-inside-avoid">
          {/* 6. ส่วนสรุปยอด & เงื่อนไขการชำระเงิน */}
          <div className="grid grid-cols-12 gap-6 pt-3 text-[11px]">
            <div className="col-span-7 space-y-1 text-stone-600">
              <p className="font-bold text-stone-800">
                หมายเหตุ / Remarks <span className="font-normal text-stone-400">&amp; เงื่อนไขการชำระเงิน</span>
              </p>
              {booking.paymentOption === 'FULL' ? (
                <p>
                  • รูปแบบชำระเต็มจำนวน (100%): ยอดชำระ{' '}
<<<<<<< HEAD
                  <strong className="text-stone-900">{Number(booking.netTotal).toLocaleString()} บาท</strong> ณ ศูนย์บริการวิสาหกิจชุมชนบ้านวิเวก
=======
                  <strong className="text-stone-900">{netTotal.toLocaleString()} บาท</strong> ณ ศูนย์บริการ{SITE_CONFIG.brandName}
>>>>>>> 9ae9a7ed19e834d47718f4fd4d43cb16d1094faa
                </p>
              ) : (
                <>
                  <p>
                    • งวดที่ 1 (มัดจำ {booking.installment1Percent || 25}%): ชำระ{' '}
<<<<<<< HEAD
                    <strong className="text-stone-900">{Number(booking.installment1Amount).toLocaleString()} บาท</strong> วันนัดหมายติดต่อศูนย์บริการ
                  </p>
                  <p>
                    • งวดที่ 2 (ส่วนที่เหลือ): ชำระ{' '}
                    <strong className="text-stone-900">{Number(booking.installment2Amount).toLocaleString()} บาท</strong> วันเสร็จสิ้นงาน ณ ศูนย์บริการ
=======
                    <strong className="text-stone-900">{Number(booking.installment1Amount || 0).toLocaleString()} บาท</strong> วันนัดหมายติดต่อศูนย์บริการ
                  </p>
                  <p>
                    • งวดที่ 2 (ส่วนที่เหลือ): ชำระ{' '}
                    <strong className="text-stone-900">{Number(booking.installment2Amount || 0).toLocaleString()} บาท</strong> วันเสร็จสิ้นงาน ณ ศูนย์บริการ
>>>>>>> 9ae9a7ed19e834d47718f4fd4d43cb16d1094faa
                  </p>
                </>
              )}
              {booking.appointmentDate && (
                <p>
                  • วันนัดหมายติดต่อศูนย์บริการ: {formatThaiDate(booking.appointmentDate)}{' '}
                  {booking.appointmentTime ? `เวลา ${booking.appointmentTime}` : ''}
                </p>
              )}
              <p className="text-[10px] text-stone-500 pt-0.5">
<<<<<<< HEAD
                * ชำระเงินกับเจ้าหน้าที่ ณ ศูนย์บริการวิสาหกิจชุมชนบ้านวิเวกเท่านั้น เพื่อออกใบเสร็จรับเงินอย่างเป็นทางการ
=======
                * ชำระเงินกับเจ้าหน้าที่ ณ ศูนย์บริการ{SITE_CONFIG.brandName}เท่านั้น เพื่อออกใบเสร็จรับเงินอย่างเป็นทางการ
>>>>>>> 9ae9a7ed19e834d47718f4fd4d43cb16d1094faa
              </p>
            </div>

            <div className="col-span-5">
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-600">รวมเป็นเงินทั้งสิ้น (บาท) / Subtotal</span>
                <span className="font-medium text-stone-900">
<<<<<<< HEAD
                  {Number(booking.netTotal).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
=======
                  {netTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
>>>>>>> 9ae9a7ed19e834d47718f4fd4d43cb16d1094faa
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-300">
                <span className="text-stone-600">ส่วนลด (บาท) / Discount</span>
                <span>0.00</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-400 items-center">
                <span className="font-bold text-stone-900">จำนวนเงินรวมทั้งสิ้น (บาท) / Grand Total</span>
                <span className="font-bold text-sm text-stone-900">
<<<<<<< HEAD
                  {Number(booking.netTotal).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
=======
                  {netTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
>>>>>>> 9ae9a7ed19e834d47718f4fd4d43cb16d1094faa
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-300 text-[10px]">
                <span className="text-stone-500">Total Amount</span>
<<<<<<< HEAD
                <span className="font-semibold text-stone-800">({thaiBahtText(booking.netTotal)})</span>
=======
                <span className="font-semibold text-stone-800">({thaiBahtText(netTotal)})</span>
>>>>>>> 9ae9a7ed19e834d47718f4fd4d43cb16d1094faa
              </div>
            </div>
          </div>

          {/* 7. ส่วนลงนามสไตล์โปร่ง */}
          <div className="grid grid-cols-2 gap-8 pt-6 mt-4 border-t border-stone-200 text-[11px] text-center">
            <div className="px-4 flex flex-col justify-between">
              <p className="font-bold text-stone-900 mb-10">ผู้ว่าจ้าง / เจ้าภาพ</p>
              <div className="space-y-1">
                <p className="text-stone-600">ลงชื่อ ........................................................................</p>
                <p className="font-medium text-stone-900">({contactName})</p>
                <p className="text-[10px] text-stone-500">วันที่ ........... / ........... / ...........</p>
              </div>
            </div>

            <div className="px-4 flex flex-col justify-between">
<<<<<<< HEAD
              <p className="font-bold text-stone-900 mb-10">ผู้เสนอราคา / เจ้าหน้าที่วิสาหกิจชุมชนบ้านวิเวก</p>
              <div className="space-y-1">
                <p className="text-stone-600">ลงชื่อ ........................................................................</p>
                <p className="font-medium text-stone-900">(เจ้าหน้าที่ศูนย์บริการวิสาหกิจชุมชนบ้านวิเวก)</p>
=======
              <p className="font-bold text-stone-900 mb-10">ผู้เสนอราคา / เจ้าหน้าที่{SITE_CONFIG.brandName}</p>
              <div className="space-y-1">
                <p className="text-stone-600">ลงชื่อ ........................................................................</p>
                <p className="font-medium text-stone-900">(เจ้าหน้าที่ศูนย์บริการ{SITE_CONFIG.brandName})</p>
>>>>>>> 9ae9a7ed19e834d47718f4fd4d43cb16d1094faa
                <p className="text-[10px] text-stone-500">วันที่ {formatThaiDate(issueDate)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
<<<<<<< HEAD
}
=======
}
>>>>>>> 9ae9a7ed19e834d47718f4fd4d43cb16d1094faa
