import React from 'react';
import { Link } from 'react-router-dom';
import { PORTFOLIO_ITEMS } from '../../data/initialData';

export default function PortfolioPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-xs text-stone-400 mb-4 flex items-center gap-2">
        <Link to="/" className="hover:text-stone-600">หน้าหลัก</Link>
        <span>&gt;</span>
        <span className="text-stone-700 font-medium">ผลงานที่ผ่านมา</span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">ผลงานการจัดงานของวิสาหกิจชุมชนบ้านวิเวก</h1>
        <p className="text-sm text-stone-600 mt-1">
          ภาพบรรยากาศการจัดงานบำเพ็ญกุศลและพิธีฌาปนกิจที่เราดูแลด้วยความเคารพและใส่ใจในทุกขั้นตอน
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PORTFOLIO_ITEMS.map(item => (
          <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-[#E6DAC3] shadow-sm flex flex-col">
            <div className="h-52 overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover hover:scale-105 transition duration-500"
              />
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FAF5EC] text-[#7C6032] font-semibold border border-[#E6DAC3]">
                    {item.category}
                  </span>
                  <span>{item.date}</span>
                </div>
                <h3 className="font-bold text-base text-stone-800">{item.title}</h3>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">{item.description}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-100">
                <Link
                  to="/packages"
                  className="text-xs font-semibold text-[#2E5A44] hover:underline"
                >
                  ดูแพ็กเกจที่เกี่ยวข้อง &rarr;
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
