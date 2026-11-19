import React from 'react';
import { createPortal } from 'react-dom';
import { SITE_CONFIG } from '../config/siteConfig';

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

export default function PackageDetailPrintView({
  pkg,
  ritualTypes = [],
  selectedRitualId,
  selectedUpgradeCost = 0,
  displayPrice
}) {
  if (!pkg) return null;

  const basePrice = Number(pkg.price) || 0;
  const upgradeCost = Number(selectedUpgradeCost) || 0;
  const totalPrice = displayPrice != null ? Number(displayPrice) : basePrice + upgradeCost;
  const deposit25 = Math.round(totalPrice * 0.25);
  const remain75 = totalPrice - deposit25;

  const todayText = new Date().toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const selectedRitual =
    ritualTypes.find(r => r.id === selectedRitualId) ||
    ritualTypes.find(r => r.id === pkg.defaultRitualId) ||
    null;

  const getRitualUpgradeCost = (ritual) => {
    if (!ritual || ritual.id === pkg.defaultRitualId) return 0;
    if (pkg.defaultRitualId === 'RITUAL-03') return Number(ritual.upgradePriceFrom3) || 0;
    if (pkg.defaultRitualId === 'RITUAL-02') return Number(ritual.upgradePriceFrom2) || 0;
    return 0;
  };

  const categories = pkg.categories10 || [];

  const content = (
    <div
      id="package-print-area"
      className="hidden bg-white text-stone-800 text-[11px] leading-snug"
      style={{ fontFamily: "'Prompt', sans-serif" }}
    >
      <div className="w-full max-w-[182mm] mx-auto bg-white">
        {/* 1. ส่วนหัวเอกสารทางการ */}
        <div className="flex justify-between items-start pb-3 border-b-2 border-[#B5945B]">
          <div>
            <p className="text-[10px] font-semibold text-[#9B7B45] uppercase tracking-wider">
              เอกสารรายละเอียดแพ็กเกจบริการ / Package Details
            </p>
            <h1 className="text-xl font-bold text-stone-900 mt-0.5">
              {pkg.name}
            </h1>
            <p className="text-[11px] text-stone-600 mt-0.5 max-w-[110mm]">
              {pkg.tagline}
            </p>
          </div>

          <div className="text-right flex items-start gap-2.5 shrink-0">
            <div className="text-[10px] text-stone-600 leading-relaxed">
              <p className="font-bold text-stone-900 text-xs">{SITE_CONFIG.brandName}</p>
              <p>{SITE_CONFIG.addressShort}</p>
              <p>โทร. {SITE_CONFIG.contactPhone} / {SITE_CONFIG.contactMobile}</p>
              <p>LINE: {SITE_CONFIG.contactLine} | วันที่พิมพ์: {todayText}</p>
            </div>
            <div className="w-11 h-11 rounded-full bg-[#B5945B] text-white font-bold flex items-center justify-center text-sm shrink-0">
              บว
            </div>
          </div>
        </div>

        {/* 2. สรุปข้อมูลแพ็กเกจ */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 py-3 border-b border-stone-300 text-[11px]">
          <div className="flex">
            <span className="text-stone-500 w-28 shrink-0">เหมาะสำหรับ</span>
            <span className="font-semibold text-stone-900">{pkg.targetGroup || '-'}</span>
          </div>
          <div className="flex">
            <span className="text-stone-500 w-28 shrink-0">ระยะเวลาจัดงาน</span>
            <span className="font-semibold text-stone-900">{pkg.durationText || '-'}</span>
          </div>
          <div className="flex">
            <span className="text-stone-500 w-28 shrink-0">รองรับแขก</span>
            <span className="font-semibold text-stone-900">ประมาณ {pkg.baseGuests || 50} คน</span>
          </div>
          <div className="flex">
            <span className="text-stone-500 w-28 shrink-0">รูปแบบพิธีกรรม</span>
            <span className="font-semibold text-stone-900">
              {selectedRitual?.name || '-'}
              {upgradeCost > 0 ? ` (+${upgradeCost.toLocaleString()} บาท)` : ' (รวมในแพ็กเกจ)'}
            </span>
          </div>
        </div>

        {/* 3. ตารางรายละเอียดบริการเต็มตามหมวดหมู่ (ครบทั้ง 10 หมวดหมู่) */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <h2 className="font-bold text-stone-900 text-xs">
              รายละเอียดบริการที่รวมในแพ็กเกจ (ครบทั้ง {categories.length} หมวดหมู่)
            </h2>
            <span className="text-[10px] text-stone-500">
              ราคาเต็มแพ็กเกจ {basePrice.toLocaleString('th-TH')} บาท
            </span>
          </div>

          <table className="w-full table-fixed border-collapse border border-stone-400 text-[10.5px]">
            <thead style={{ display: 'table-header-group' }}>
              <tr className="bg-[#F5E9D6] border-b border-stone-400 text-stone-900">
                <th className="py-1.5 px-2 w-12 text-center font-bold border-r border-stone-300">
                  หมวด
                </th>
                <th className="py-1.5 px-2.5 w-48 text-left font-bold border-r border-stone-300">
                  หมวดหมู่บริการ
                </th>
                <th className="py-1.5 px-3 text-left font-bold">
                  รายละเอียดรายการที่รวมในแพ็กเกจ
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, idx) => {
                const cleanTitle = String(cat.title || '').replace(/^\d+\.\s*/, '');
                return (
                  <tr
                    key={cat.id || idx}
                    className={`align-top border-b border-stone-300 break-inside-avoid ${
                      idx % 2 === 1 ? 'bg-stone-50/50' : 'bg-white'
                    }`}
                  >
                    <td className="py-2 px-2 text-center font-bold text-[#7C6032] border-r border-stone-300">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-2.5 font-semibold text-stone-900 border-r border-stone-300">
                      {cleanTitle}
                    </td>
                    <td className="py-2 px-3 text-stone-700">
                      <ul className="space-y-0.5">
                        {(cat.items || []).map((line, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-[#9B7B45] font-bold">•</span>
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 4. ตารางเปรียบเทียบรูปแบบพิธีกรรม 3 แบบ */}
        {ritualTypes.length > 0 && (
          <div className="mt-3 break-inside-avoid">
            <h2 className="font-bold text-stone-900 text-xs mb-1.5">
              รูปแบบพิธีกรรมที่เลือกปรับได้ (เลือกได้ 1 แบบ)
            </h2>
            <table className="w-full table-fixed border-collapse border border-stone-400 text-[10px]">
              <thead>
                <tr className="bg-stone-100 border-b border-stone-400 text-stone-900">
                  <th className="py-1.5 px-2.5 w-52 text-left font-bold border-r border-stone-300">
                    รูปแบบพิธีกรรม
                  </th>
                  <th className="py-1.5 px-3 text-left font-bold border-r border-stone-300">
                    ขอบเขตพิธีการสำคัญ
                  </th>
                  <th className="py-1.5 px-2.5 w-32 text-right font-bold">
                    เงื่อนไขราคา
                  </th>
                </tr>
              </thead>
              <tbody>
                {ritualTypes.map(ritual => {
                  const isDefault = ritual.id === pkg.defaultRitualId;
                  const isPicked = ritual.id === selectedRitualId;
                  const extra = getRitualUpgradeCost(ritual);

                  return (
                    <tr
                      key={ritual.id}
                      className={`align-top border-b border-stone-300 ${
                        isPicked ? 'bg-[#F4F9F6]' : 'bg-white'
                      }`}
                    >
                      <td className="py-1.5 px-2.5 font-semibold text-stone-900 border-r border-stone-300">
                        {ritual.name}
                        {isPicked && (
                          <span className="block text-[9px] text-[#2E5A44] font-bold mt-0.5">
                            ✓ รูปแบบที่เลือกดูในเอกสารนี้
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 px-3 text-stone-600 border-r border-stone-300">
                        {(ritual.bullets || []).join(' • ')}
                      </td>
                      <td className="py-1.5 px-2.5 text-right font-semibold">
                        {isDefault ? (
                          <span className="text-[#7C6032]">อยู่ในแพ็กเกจ (ฟรี)</span>
                        ) : extra > 0 ? (
                          <span className="text-stone-900">+{extra.toLocaleString()} บาท</span>
                        ) : (
                          <span className="text-[#2E5A44]">ไม่เสียค่าใช้จ่ายเพิ่ม</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. สรุปราคาเต็ม + เงื่อนไขชำระเงิน + ช่องทางติดต่อท้ายเอกสาร */}
        <div className="mt-3 pt-3 border-t border-stone-300 grid grid-cols-12 gap-5 break-inside-avoid">
          <div className="col-span-7 space-y-1 text-[10px] text-stone-600">
            <p className="font-bold text-stone-900 text-[11px]">
              เงื่อนไขการชำระเงินและหมายเหตุ
            </p>
            <p>
              • <strong>ชำระเต็มจำนวน (100%):</strong> {totalPrice.toLocaleString()} บาท ณ ศูนย์บริการ{SITE_CONFIG.brandName}
            </p>
            <p>
              • <strong>แบ่งชำระ 2 งวด:</strong> งวดที่ 1 มัดจำ 25% ({deposit25.toLocaleString()} บาท) วันนัดหมายติดต่อศูนย์ฯ และงวดที่ 2 ส่วนที่เหลือ 75% ({remain75.toLocaleString()} บาท) วันเสร็จสิ้นงาน
            </p>
            <p>
              • สามารถสั่งเพิ่มจำนวนแขกหรือบริการเสริมพิเศษ (อาหาร/ดอกไม้/อุปกรณ์) เพิ่มเติมได้ในขั้นตอนการจอง
            </p>
            <p className="text-stone-500 pt-0.5">
              * สอบถามรายละเอียดเพิ่มเติมหรือนัดหมายล่วงหน้า: โทร. <strong>{SITE_CONFIG.contactPhone}</strong> / <strong>{SITE_CONFIG.contactMobile}</strong> | LINE: <strong>{SITE_CONFIG.contactLine}</strong> ({SITE_CONFIG.serviceHours})
            </p>
          </div>

          <div className="col-span-5 text-[10.5px]">
            <div className="rounded-xl border border-stone-300 p-3 bg-stone-50/70 space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-600">ราคาเต็มแพ็กเกจ</span>
                <span className="font-medium text-stone-900">
                  {basePrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
                </span>
              </div>
              {upgradeCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-stone-600">ค่าอัปเกรดพิธีกรรม</span>
                  <span className="font-medium text-stone-900">
                    {upgradeCost.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-1.5 mt-1 border-t border-stone-400 items-baseline">
                <span className="font-bold text-stone-900">รวมราคาทั้งสิ้น</span>
                <span className="font-bold text-sm text-[#2E5A44]">
                  {totalPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
                </span>
              </div>
              <p className="text-right text-[9.5px] font-semibold text-stone-600">
                ({thaiBahtText(totalPrice)})
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
