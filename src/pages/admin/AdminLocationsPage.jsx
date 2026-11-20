import React, { useState } from 'react';
import { Search, Plus, Pencil, Trash2, X } from 'lucide-react';
import { useApp, fileToDataUrl } from '../../context/AppContext';

export default function AdminLocationsPage() {
  const { locations, saveLocation, deleteLocation } = useApp();
  const [search, setSearch] = useState('');
  const [editingLoc, setEditingLoc] = useState(null);

  const handleOpenCreate = () => {
    setEditingLoc({
      id: '',
      name: '',
      type: 'วัด',
      address: '',
      province: 'เชียงใหม่',
      subdistrict: 'หนองหาร',
      district: 'สันทราย',
      postalCode: '50290',
      phone: '',
      mapUrl: '',
      details: '',
      isActive: true,
      images: [],
      pavilions: [
        { id: `PAV-${Date.now()}`, name: 'ศาลา 1', capacity: 150, isActive: true }
      ]
    });
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editingLoc) return;
    const dataUrl = await fileToDataUrl(file);
    setEditingLoc(prev => ({
      ...prev,
      images: [...(prev.images || []), dataUrl]
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!editingLoc.name.trim()) return;
    saveLocation(editingLoc);
    setEditingLoc(null);
  };

  // หน้าฟอร์ม "เพิ่มสถานที่" ตามรูปที่ 6 ของ Admin
  if (editingLoc) {
    return (
      <form onSubmit={handleSave} className="max-w-4xl space-y-6 pb-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-stone-900">
            {editingLoc.id ? 'แก้ไขสถานที่' : 'เพิ่มสถานที่'}
          </h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditingLoc(null)}
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
          <div className="space-y-4">
            <h2 className="font-bold text-sm text-stone-900">ข้อมูลสถานที่</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  ชื่อสถานที่ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น วัดวิเวกวนาราม"
                  value={editingLoc.name}
                  onChange={e => setEditingLoc({ ...editingLoc, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  ประเภทสถานที่ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="วัด / สุสาน / ฌาปนสถาน"
                  value={editingLoc.type}
                  onChange={e => setEditingLoc({ ...editingLoc, type: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                ที่อยู่สถานที่ <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="บ้านเลขที่, หมู่, ซอย, ถนน"
                value={editingLoc.address}
                onChange={e => setEditingLoc({ ...editingLoc, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  จังหวัด <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  list="loc-provinces"
                  required
                  value={editingLoc.province}
                  onChange={e => setEditingLoc({ ...editingLoc, province: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm"
                />
                <datalist id="loc-provinces">
                  <option value="เชียงใหม่" />
                  <option value="ลำพูน" />
                  <option value="เชียงราย" />
                  <option value="ลำปาง" />
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  ตำบล / แขวง <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  list="loc-subdistricts"
                  required
                  value={editingLoc.subdistrict}
                  onChange={e => setEditingLoc({ ...editingLoc, subdistrict: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm"
                />
                <datalist id="loc-subdistricts">
                  <option value="หนองหาร" />
                  <option value="แม่แฝก" />
                  <option value="สันทรายหลวง" />
                  <option value="สันทรายน้อย" />
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  อำเภอ / เขต <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  list="loc-districts"
                  required
                  value={editingLoc.district}
                  onChange={e => setEditingLoc({ ...editingLoc, district: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm"
                />
                <datalist id="loc-districts">
                  <option value="สันทราย" />
                  <option value="เมืองเชียงใหม่" />
                  <option value="แม่ริม" />
                  <option value="ดอยสะเก็ด" />
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  รหัสไปรษณีย์ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingLoc.postalCode}
                  onChange={e => setEditingLoc({ ...editingLoc, postalCode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="text"
                  value={editingLoc.phone}
                  onChange={e => setEditingLoc({ ...editingLoc, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-stone-50">
                <div>
                  <p className="text-xs font-bold text-stone-800">สถานะการเปิดให้บริการสถานที่</p>
                  <p className="text-[11px] text-stone-500">หากปิด สถานที่นี้จะไม่แสดงในหน้าจองของลูกค้า</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingLoc({ ...editingLoc, isActive: !(editingLoc.isActive !== false) })}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                    editingLoc.isActive !== false
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {editingLoc.isActive !== false ? 'เปิดให้บริการ' : 'ปิดชั่วคราว'}
                </button>
              </div>
            </div>
          </div>

          {/* จัดการศาลาในวัด */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm text-stone-900">ศาลาบำเพ็ญกุศลในสถานที่นี้</h2>
              <button
                type="button"
                onClick={() =>
                  setEditingLoc({
                    ...editingLoc,
                    pavilions: [
                      ...(editingLoc.pavilions || []),
                      { id: `PAV-${Date.now()}`, name: `ศาลา ${(editingLoc.pavilions?.length || 0) + 1}`, capacity: 150, isActive: true }
                    ]
                  })
                }
                className="px-3 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-xs font-semibold"
              >
                + เพิ่มศาลา
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {(editingLoc.pavilions || []).map((pav, idx) => (
                <div key={pav.id} className="p-3 rounded-xl border border-stone-200 flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    required
                    value={pav.name}
                    onChange={e => {
                      const next = [...editingLoc.pavilions];
                      next[idx] = { ...next[idx], name: e.target.value };
                      setEditingLoc({ ...editingLoc, pavilions: next });
                    }}
                    className="flex-1 min-w-[140px] px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs"
                  />
                  <input
                    type="number"
                    min="10"
                    value={pav.capacity}
                    onChange={e => {
                      const next = [...editingLoc.pavilions];
                      next[idx] = { ...next[idx], capacity: Number(e.target.value) || 100 };
                      setEditingLoc({ ...editingLoc, pavilions: next });
                    }}
                    className="w-20 px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs"
                  />
                  <span className="text-xs text-stone-500">คน</span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = [...editingLoc.pavilions];
                      next[idx] = { ...next[idx], isActive: !(next[idx].isActive !== false) };
                      setEditingLoc({ ...editingLoc, pavilions: next });
                    }}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                      pav.isActive !== false
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {pav.isActive !== false ? 'เปิดใช้' : 'ปิดปรับปรุง'}
                  </button>
                  <button
                    type="button"
                    disabled={(editingLoc.pavilions || []).length <= 1}
                    onClick={() => {
                      if (window.confirm(`ต้องการลบ "${pav.name}" ออกจากสถานที่นี้ใช่หรือไม่?`)) {
                        const next = editingLoc.pavilions.filter((_, i) => i !== idx);
                        setEditingLoc({ ...editingLoc, pavilions: next });
                      }
                    }}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="ลบศาลา (ต้องมีอย่างน้อย 1 ศาลา)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-stone-100">
            <h2 className="font-bold text-sm text-stone-900">พิกัดสถานที่</h2>
            <label className="block text-xs font-medium text-stone-700">
              ลิงก์แผนที่
            </label>
            <input
              type="text"
              placeholder="https://maps.google.com/..."
              value={editingLoc.mapUrl}
              onChange={e => setEditingLoc({ ...editingLoc, mapUrl: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
            />
          </div>

          {/* รูปภาพสถานที่ */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <h2 className="font-bold text-sm text-stone-900">รูปภาพสถานที่</h2>
            <div className="flex flex-wrap gap-4">
              {(editingLoc.images || []).map((imgUrl, idx) => (
                <div key={idx} className="w-40 h-28 rounded-2xl bg-stone-200 relative overflow-hidden border border-stone-300">
                  <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() =>
                      setEditingLoc({
                        ...editingLoc,
                        images: editingLoc.images.filter((_, i) => i !== idx)
                      })
                    }
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white text-stone-800 flex items-center justify-center shadow"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <label className="w-40 h-28 rounded-2xl border border-stone-300 hover:border-stone-500 flex flex-col items-center justify-center cursor-pointer bg-white">
                <Plus className="w-5 h-5 text-stone-600 mb-1" />
                <span className="text-xs text-stone-600">เพิ่มรูปภาพ</span>
                <input type="file" accept="image/*" onChange={handleUploadImage} className="hidden" />
              </label>
            </div>
            <p className="text-[11px] text-stone-400">ไฟล์ที่แนะนำ : JPG, PNG (ไม่เกิน 10 MB/ไฟล์)</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">รายละเอียดเพิ่มเติม</label>
            <textarea
              rows={3}
              placeholder="ข้อมูลเกี่ยวกับสถานที่เพิ่มเติม (ถ้ามี)"
              value={editingLoc.details}
              onChange={e => setEditingLoc({ ...editingLoc, details: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
            />
          </div>
        </div>
      </form>
    );
  }

  const q = search.trim().toLowerCase();

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-2xl font-bold text-stone-900">สถานที่</h1>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-bold text-base text-stone-800">สถานที่ทั้งหมด</h2>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="ค้นหาชื่อสถานที่ / จังหวัด"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-4 pr-9 py-2 rounded-full border border-stone-300 bg-white text-xs"
            />
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
          </div>
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2 rounded-full bg-stone-300 hover:bg-stone-400 text-stone-900 text-xs font-bold flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> เพิ่ม
          </button>
        </div>
      </div>

      {/* รายการสถานที่ */}
      <div className="space-y-4">
        {locations
          .filter(
            l =>
              !q ||
              l.name.toLowerCase().includes(q) ||
              (l.province || '').toLowerCase().includes(q)
          )
          .map(loc => (
            <div
              key={loc.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-sm flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex items-center gap-5">
                <div className="w-24 h-16 rounded-xl bg-stone-100 overflow-hidden border border-stone-200 shrink-0">
                  {loc.images?.[0] && (
                    <img src={loc.images[0]} alt={loc.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm sm:text-base text-stone-900">{loc.name}</p>
                    {loc.isActive === false && (
                      <span className="px-2 py-0.5 rounded-full bg-stone-200 text-stone-600 text-[10px] font-bold">
                        ปิดชั่วคราว
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500">
                    ศาลาทั้งหมด:{' '}
                    {(loc.pavilions || [])
                      .map(p => `${p.name}${p.isActive === false ? ' (ปิดปรับปรุง)' : ''}`)
                      .join(', ')}
                  </p>
                </div>
              </div>

              <div className="text-sm text-stone-800">
                จังหวัด : <strong>{loc.province}</strong>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEditingLoc(loc)}
                  className="p-2 rounded-lg text-blue-900 hover:bg-stone-100"
                  title="แก้ไขสถานที่"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`ต้องการลบสถานที่ "${loc.name}" และศาลาทั้งหมดภายในใช่หรือไม่?`)) {
                      deleteLocation(loc.id);
                    }
                  }}
                  className="p-2 rounded-lg text-blue-900 hover:bg-red-50 hover:text-red-600"
                  title="ลบสถานที่"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
