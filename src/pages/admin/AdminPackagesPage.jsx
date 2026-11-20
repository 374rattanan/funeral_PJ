import React, { useState } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Package,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useApp, fileToDataUrl } from '../../context/AppContext';
import { SERVICE_CATEGORIES_10 } from '../../data/initialData';

export default function AdminPackagesPage() {
  const {
    packages,
    services,
    ritualTypes,
    departments,
    savePackage,
    deletePackage,
    saveServiceAddon,
    deleteServiceAddon
  } = useApp();

  const [activeTab, setActiveTab] = useState('MAIN_PACKAGES'); // 'MAIN_PACKAGES' | 'ADDONS'
  const [search, setSearch] = useState('');
  const [addonSearch, setAddonSearch] = useState('');
  const [editingPkg, setEditingPkg] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [openCatId, setOpenCatId] = useState(1);

  const handleCreateNewPackage = () => {
    const maxNum = packages.reduce((max, p) => {
      const n = parseInt(String(p.id || '').replace(/\D/g, ''), 10);
      return Number.isFinite(n) && n > max ? n : max;
    }, 0);
    const nextId = `PKG-${String(maxNum + 1).padStart(2, '0')}`;

    setEditingPkg({
      id: nextId,
      name: '',
      tagline: '',
      targetGroup: 'ครอบครัวขนาดกลาง',
      price: 55000,
      durationDays: 3,
      durationNights: 2,
      durationText: '3 วัน 2 คืน (สวด 2 คืน)',
      baseGuests: 100,
      maxGuests: 150,
      defaultRitualId: 'RITUAL-02',
      isRecommended: false,
      coverImage: '/images/package-cover.jpg',
      highlights: [
        'สวดพระอภิธรรมครบทุกขั้นตอน',
        'รองรับแขกตามจำนวนที่กำหนด',
        'รวมดอกไม้ประดับและอาหารกลางวันวันเผา'
      ],
      categories10: SERVICE_CATEGORIES_10.map(c => ({
        id: c.id,
        title: c.title,
        items: ['รายการมาตรฐานประจำหมวด']
      }))
    });
  };

  const handleUploadPkgImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editingPkg) return;
    const dataUrl = await fileToDataUrl(file);
    setEditingPkg(prev => ({ ...prev, coverImage: dataUrl }));
  };

  const handleSavePackageForm = (e) => {
    e.preventDefault();
    if (!editingPkg.name.trim()) return;
    const parsedPrice = Number(editingPkg.price);
    const parsedBaseGuests = Math.max(1, Number(editingPkg.baseGuests) || 50);
    const parsedMaxGuests = Math.max(
      parsedBaseGuests,
      Number(editingPkg.maxGuests) || parsedBaseGuests + 50
    );
    const parsedDays = Math.max(1, Number(editingPkg.durationDays) || 1);
    const parsedNights = Math.max(
      0,
      Number.isFinite(Number(editingPkg.durationNights)) && editingPkg.durationNights !== ''
        ? Number(editingPkg.durationNights)
        : Math.max(0, parsedDays - 1)
    );

    const updated = {
      ...editingPkg,
      name: editingPkg.name.trim(),
      price: Number.isFinite(parsedPrice) && parsedPrice >= 0 ? parsedPrice : 25000,
      baseGuests: parsedBaseGuests,
      maxGuests: parsedMaxGuests,
      durationDays: parsedDays,
      durationNights: parsedNights,
      durationText: `${parsedDays} วัน ${parsedNights} คืน (สวด ${parsedNights} คืน)`
    };
    savePackage(updated);
    setEditingPkg(null);
  };

  // หากกำลังเปิดหน้า "เพิ่ม/แก้ไขแพ็กเกจ"
  if (editingPkg) {
    return (
      <form onSubmit={handleSavePackageForm} className="max-w-4xl space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-stone-900">
            {packages.some(p => p.id === editingPkg.id) ? `แก้ไข${editingPkg.name}` : 'เพิ่มแพ็กเกจ'}
          </h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditingPkg(null)}
              className="px-5 py-2 rounded-xl bg-stone-300 hover:bg-stone-400 text-stone-800 text-xs font-semibold"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-[#3D7352] hover:bg-[#2E5A44] text-white text-xs font-semibold shadow"
            >
              บันทึก
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          {/* 1. ข้อมูลทั่วไป */}
          <div className="space-y-4">
            <h2 className="font-bold text-sm text-stone-900">1. ข้อมูลทั่วไป</h2>
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">ชื่อแพ็กเกจ</label>
              <input
                type="text"
                required
                placeholder="เช่น แพ็กเกจมาตรฐาน"
                value={editingPkg.name}
                onChange={e => setEditingPkg({ ...editingPkg, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">คำอธิบายภาพรวม</label>
              <textarea
                rows={3}
                placeholder="อธิบายสั้นๆ เช่น ดูแลครบถ้วนทุกขั้นตอน ถูกต้องตามหลักศาสนา"
                value={editingPkg.tagline}
                onChange={e => setEditingPkg({ ...editingPkg, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-2">รูปภาพแพ็กเกจ</label>
              <div className="flex items-center gap-5">
                <div className="w-36 h-28 rounded-2xl border border-stone-200 overflow-hidden bg-stone-50 flex items-center justify-center">
                  {editingPkg.coverImage ? (
                    <img src={editingPkg.coverImage} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-stone-300" />
                  )}
                </div>
                <div className="space-y-1.5 text-xs text-stone-500">
                  <p className="font-semibold text-stone-800">เพิ่มรูปภาพ</p>
                  <p>รูปแบบไฟล์ภาพ .jpg, .jpeg, .png (อัตราส่วนแนวนอน)</p>
                  <label className="inline-block px-4 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold cursor-pointer">
                    อัปโหลดรูป
                    <input type="file" accept="image/*" onChange={handleUploadPkgImage} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-stone-200" />

          {/* 2. ราคาและเงื่อนไขแพ็กเกจ */}
          <div className="space-y-4">
            <h2 className="font-bold text-sm text-stone-900">2. ราคาและเงื่อนไขแพ็กเกจ</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">ราคา (บาท)</label>
                <input
                  type="number"
                  min="0"
                  value={editingPkg.price}
                  onChange={e => setEditingPkg({ ...editingPkg, price: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">รองรับแขกมาตรฐาน (คน)</label>
                <input
                  type="number"
                  min="1"
                  value={editingPkg.baseGuests}
                  onChange={e => setEditingPkg({ ...editingPkg, baseGuests: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">รองรับแขกสูงสุด (คน)</label>
                <input
                  type="number"
                  min={editingPkg.baseGuests || 1}
                  value={editingPkg.maxGuests ?? editingPkg.baseGuests}
                  onChange={e => setEditingPkg({ ...editingPkg, maxGuests: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">ระยะเวลาดำเนินการ</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden">
                  <input
                    type="number"
                    min="1"
                    value={editingPkg.durationDays}
                    onChange={e => setEditingPkg({ ...editingPkg, durationDays: e.target.value })}
                    className="w-24 px-3 py-2 text-sm focus:outline-none"
                  />
                  <span className="px-3 py-2 bg-stone-100 text-xs text-stone-600">วัน</span>
                </div>
                <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden">
                  <input
                    type="number"
                    min="0"
                    value={editingPkg.durationNights}
                    onChange={e => setEditingPkg({ ...editingPkg, durationNights: e.target.value })}
                    className="w-24 px-3 py-2 text-sm focus:outline-none"
                  />
                  <span className="px-3 py-2 bg-stone-100 text-xs text-stone-600">คืน</span>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-stone-200" />

          {/* 3. รายละเอียดในแพ็กเกจ (10 หมวดหมู่) */}
          <div className="space-y-3">
            <h2 className="font-bold text-sm text-stone-900">3. รายละเอียดในแพ็กเกจ (10 รายการหมวดหมู่)</h2>
            <div className="space-y-2.5">
              {editingPkg.categories10.map((cat, cIdx) => {
                const isOpen = openCatId === cat.id;
                return (
                  <div key={cat.id} className="rounded-2xl border border-stone-200 overflow-hidden">
                    <div
                      onClick={() => setOpenCatId(isOpen ? null : cat.id)}
                      className="px-4 py-3 bg-stone-50 flex items-center justify-between cursor-pointer"
                    >
                      <span className="font-bold text-xs text-stone-800">{cat.title}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-stone-500" /> : <ChevronDown className="w-4 h-4 text-stone-500" />}
                    </div>
                    {isOpen && (
                      <div className="p-4 space-y-2 bg-white">
                        {cat.items.map((line, lIdx) => (
                          <div key={lIdx} className="flex items-center gap-2">
                            <span className="text-xs text-stone-400 w-8">{cat.id}.{lIdx + 1}</span>
                            <input
                              type="text"
                              value={line}
                              onChange={e => {
                                const nextCats = [...editingPkg.categories10];
                                const nextItems = [...nextCats[cIdx].items];
                                nextItems[lIdx] = e.target.value;
                                nextCats[cIdx] = { ...nextCats[cIdx], items: nextItems };
                                setEditingPkg({ ...editingPkg, categories10: nextCats });
                              }}
                              className="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const nextCats = [...editingPkg.categories10];
                                const nextItems = nextCats[cIdx].items.filter((_, idx) => idx !== lIdx);
                                nextCats[cIdx] = { ...nextCats[cIdx], items: nextItems };
                                setEditingPkg({ ...editingPkg, categories10: nextCats });
                              }}
                              className="p-1.5 text-stone-400 hover:text-red-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const nextCats = [...editingPkg.categories10];
                            nextCats[cIdx] = {
                              ...nextCats[cIdx],
                              items: [...nextCats[cIdx].items, 'รายการบริการใหม่']
                            };
                            setEditingPkg({ ...editingPkg, categories10: nextCats });
                          }}
                          className="mt-2 px-3 py-1 rounded-lg border border-emerald-600 text-emerald-700 text-xs font-semibold hover:bg-emerald-50"
                        >
                          + เพิ่มรายการบริการ
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <hr className="border-stone-200" />

          {/* 4. พิธีกรรม (เลือกได้ 1 แบบ) */}
          <div className="space-y-3">
            <h2 className="font-bold text-sm text-stone-900">4. พิธีกรรมเริ่มต้นในแพ็กเกจ (เลือกได้ 1 แบบ)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ritualTypes.map(r => (
                <div
                  key={r.id}
                  onClick={() => setEditingPkg({ ...editingPkg, defaultRitualId: r.id })}
                  className={`cursor-pointer rounded-2xl p-4 border transition ${
                    editingPkg.defaultRitualId === r.id
                      ? 'border-2 border-[#3D7352] bg-[#F4F9F6]'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="radio"
                      checked={editingPkg.defaultRitualId === r.id}
                      onChange={() => setEditingPkg({ ...editingPkg, defaultRitualId: r.id })}
                      className="accent-[#3D7352]"
                    />
                    <span className="font-bold text-xs text-stone-900">{r.name}</span>
                  </div>
                  <ul className="text-[11px] text-stone-600 space-y-1 list-disc list-inside">
                    {r.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
    );
  }

  const filteredAddons = services.filter(srv => {
    const q = addonSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      srv.name.toLowerCase().includes(q) ||
      (srv.category || '').toLowerCase().includes(q) ||
      (srv.department || '').toLowerCase().includes(q)
    );
  });

  const serviceDeptOptions =
    editingService && editingService.department && !departments.includes(editingService.department)
      ? [editingService.department, ...departments]
      : departments;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-stone-900">แพ็กเกจและบริการเสริม</h1>
        <div className="flex gap-2 bg-stone-200/80 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('MAIN_PACKAGES')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'MAIN_PACKAGES' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'
            }`}
          >
            แพ็กเกจหลัก ({packages.length})
          </button>
          <button
            onClick={() => setActiveTab('ADDONS')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'ADDONS' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'
            }`}
          >
            แพ็กเกจเสริม / Add-ons ({services.length})
          </button>
        </div>
      </div>

      {activeTab === 'MAIN_PACKAGES' ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-bold text-base text-stone-800">แพ็กเกจทั้งหมด</h2>
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="ค้นหาชื่อแพ็กเกจ..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-4 pr-9 py-2 rounded-full border border-stone-300 bg-white text-xs"
                />
                <Search className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
              </div>
              <button
                onClick={handleCreateNewPackage}
                className="px-5 py-2 rounded-full bg-stone-300 hover:bg-stone-400 text-stone-900 text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> เพิ่ม
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {packages
              .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
              .map(pkg => (
                <div
                  key={pkg.id}
                  className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center text-stone-700">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-sm sm:text-base text-stone-900">{pkg.name}</p>
                        {pkg.isRecommended && (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#B5945B] text-white text-[11px] font-semibold">
                            ★ แพ็กเกจแนะนำ (เลือกใช้สูงสุด)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500">
                        {pkg.durationText} | แขก {pkg.baseGuests} คน | ลูกค้าเลือกใช้แล้ว {pkg.bookingCount || 0} งาน
                      </p>
                    </div>
                  </div>

                  <div className="text-sm font-medium text-stone-800">
                    ราคา : <strong>{Number(pkg.price || 0).toLocaleString()}</strong> บาท
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setEditingPkg(pkg)}
                      className="p-2 rounded-lg text-blue-900 hover:bg-stone-100"
                      title="แก้ไขแพ็กเกจ"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`ต้องการลบ ${pkg.name} ใช่หรือไม่?`)) {
                          deletePackage(pkg.id);
                        }
                      }}
                      className="p-2 rounded-lg text-blue-900 hover:bg-red-50 hover:text-red-600"
                      title="ลบแพ็กเกจ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-stone-600">
              รายการบริการเสริมที่นี่จะถูกดึงไปแสดงที่หน้าเลือกบริการเสริม (Step 2) ของลูกค้าโดยตรง
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative w-60">
                <input
                  type="text"
                  placeholder="ค้นหาชื่อบริการเสริม / แผนก"
                  value={addonSearch}
                  onChange={e => setAddonSearch(e.target.value)}
                  className="w-full pl-4 pr-9 py-2 rounded-full border border-stone-300 bg-white text-xs"
                />
                <Search className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
              </div>
              <button
                onClick={() =>
                  setEditingService({
                    id: '',
                    category: 'หมวดสถานที่ อุปกรณ์ และการอำนวยความสะดวก',
                    name: '',
                    unit: 'ชุด',
                    price: 300,
                    department: departments[0] || 'ฝ่ายสถานที่',
                    remark: '',
                    isActive: true
                  })
                }
                className="px-4 py-2 rounded-xl bg-[#2E5A44] text-white text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> เพิ่มบริการเสริม (Add-on)
              </button>
            </div>
          </div>

          {editingService && (
            <form
              onSubmit={e => {
                e.preventDefault();
                if (!editingService.name.trim()) return;
                saveServiceAddon({
                  ...editingService,
                  name: editingService.name.trim(),
                  price: Math.max(0, Number(editingService.price) || 0)
                });
                setEditingService(null);
              }}
              className="bg-[#FAF6EE] p-5 rounded-2xl border border-[#E6DAC3] space-y-4"
            >
              <h3 className="font-bold text-sm text-stone-900">
                {editingService.id ? 'แก้ไขบริการเสริม' : 'เพิ่มบริการเสริมใหม่'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-medium mb-1">ชื่อบริการเสริม *</label>
                  <input
                    type="text"
                    required
                    value={editingService.name}
                    onChange={e => setEditingService({ ...editingService, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">หมวดหมู่ *</label>
                  <select
                    value={editingService.category}
                    onChange={e => setEditingService({ ...editingService, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white"
                  >
                    <option value="หมวดสถานที่ อุปกรณ์ และการอำนวยความสะดวก">หมวดสถานที่ อุปกรณ์ และการอำนวยความสะดวก</option>
                    <option value="หมวดอาหาร เครื่องดื่ม และของชำร่วยรับรองแขก">หมวดอาหาร เครื่องดื่ม และของชำร่วยรับรองแขก</option>
                    <option value="หมวดบันทึกภาพและบริการพิเศษ">หมวดบันทึกภาพและบริการพิเศษ</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">ราคาต่อหน่วย (บาท) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingService.price}
                    onChange={e => setEditingService({ ...editingService, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">หน่วยนับ</label>
                  <input
                    type="text"
                    value={editingService.unit}
                    onChange={e => setEditingService({ ...editingService, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">แผนกที่รับผิดชอบ</label>
                  <select
                    value={editingService.department}
                    onChange={e => setEditingService({ ...editingService, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white"
                  >
                    {serviceDeptOptions.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">หมายเหตุ</label>
                  <input
                    type="text"
                    value={editingService.remark}
                    onChange={e => setEditingService({ ...editingService, remark: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-1.5 rounded-lg bg-stone-300 text-xs font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-lg bg-[#2E5A44] text-white text-xs font-semibold"
                >
                  บันทึกบริการเสริม
                </button>
              </div>
            </form>
          )}

          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left min-w-[680px]">
                <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">รายการเสริม</th>
                    <th className="py-3 px-4">หมวดหมู่</th>
                    <th className="py-3 px-4">แผนกรับผิดชอบ</th>
                    <th className="py-3 px-4 text-right">ราคาต่อหน่วย</th>
                    <th className="py-3 px-4 text-center">สถานะ</th>
                    <th className="py-3 px-4 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredAddons.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-stone-400">
                        ไม่พบบริการเสริมที่ตรงกับคำค้นหา
                      </td>
                    </tr>
                  ) : (
                    filteredAddons.map(srv => (
                      <tr key={srv.id} className="hover:bg-stone-50">
                        <td className="py-3 px-4 font-semibold text-stone-900">{srv.name}</td>
                        <td className="py-3 px-4 text-stone-600">{srv.category}</td>
                        <td className="py-3 px-4 text-stone-600">{srv.department}</td>
                        <td className="py-3 px-4 text-right font-bold text-stone-800">
                          {Number(srv.price || 0).toLocaleString()} บาท / {srv.unit}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => saveServiceAddon({ ...srv, isActive: !srv.isActive })}
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              srv.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                            }`}
                          >
                            {srv.isActive ? 'เปิดใช้งาน' : 'ซ่อน'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => setEditingService(srv)}
                            className="p-1.5 text-blue-800 hover:bg-stone-100 rounded"
                            title="แก้ไขบริการเสริม"
                          >
                            <Pencil className="w-3.5 h-3.5 inline" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`ต้องการลบบริการเสริม "${srv.name}" ใช่หรือไม่?`)) {
                                deleteServiceAddon(srv.id);
                              }
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            title="ลบบริการเสริม"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
