import React, { useState } from 'react';
import { Search, Plus, Pencil, Trash2, UserCircle2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AdminStaffPage() {
  const {
    departments,
    staff,
    addDepartmentTag,
    removeDepartmentTag,
    saveStaffMember,
    deleteStaffMember
  } = useApp();

  const [newDeptName, setNewDeptName] = useState('');
  const [search, setSearch] = useState('');
  const [modalStaff, setModalStaff] = useState(null);

  const handleAddDept = (e) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    addDepartmentTag(newDeptName);
    setNewDeptName('');
  };

  const handleOpenAddModal = () => {
    setModalStaff({
      id: '',
      prefix: 'นาง',
      fullName: '',
      department: departments[0] || 'ฝ่ายสถานที่',
      address: '',
      province: 'เชียงใหม่',
      subdistrict: 'หนองหาร',
      district: 'สันทราย',
      postalCode: '50290',
      phone: '',
      email: ''
    });
  };

  const handleSaveStaff = (e) => {
    e.preventDefault();
    if (!modalStaff.fullName.trim()) return;
    if (!modalStaff.phone.trim()) {
      window.alert('กรุณากรอกเบอร์โทรศัพท์ของผู้รับผิดชอบ');
      return;
    }
    saveStaffMember({
      ...modalStaff,
      fullName: modalStaff.fullName.trim(),
      phone: modalStaff.phone.trim()
    });
    setModalStaff(null);
  };

  const q = search.trim().toLowerCase();

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-2xl font-bold text-stone-900">ผู้รับผิดชอบ</h1>

      {/* กล่องจัดการแผนก (แท็ก) */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
        <h2 className="font-bold text-base text-stone-900">แผนก</h2>
        <form onSubmit={handleAddDept} className="flex items-center gap-2 border border-stone-200 rounded-xl p-1.5">
          <input
            type="text"
            placeholder="กรอกชื่อแผนก เช่น ฝ่ายสถานที่, ฝ่ายหัตถกรรมและของชำร่วย"
            value={newDeptName}
            onChange={e => setNewDeptName(e.target.value)}
            className="flex-1 px-3 py-2 text-sm focus:outline-none"
          />
          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-stone-500 hover:bg-stone-600 text-white text-xs font-bold"
          >
            + เพิ่ม
          </button>
        </form>

        <div className="flex flex-wrap gap-2.5 pt-1">
          {departments.map(dept => (
            <span
              key={dept}
              className="px-4 py-1.5 rounded-full bg-stone-300/80 text-stone-800 text-xs font-semibold flex items-center gap-2"
            >
              <span>{dept}</span>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`ต้องการลบแผนก "${dept}" ใช่หรือไม่?`)) {
                    removeDepartmentTag(dept);
                  }
                }}
                className="hover:text-red-600"
                title={`ลบแผนก ${dept}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* รายการผู้รับผิดชอบทั้งหมด */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <h2 className="font-bold text-base text-stone-800">รายการทั้งหมด</h2>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="ค้นหาชื่อเจ้าหน้าที่ / แผนก / เบอร์โทร"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-4 pr-9 py-2 rounded-full border border-stone-300 bg-white text-xs"
            />
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
          </div>
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2 rounded-full bg-stone-300 hover:bg-stone-400 text-stone-900 text-xs font-bold flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> เพิ่ม
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {staff
          .filter(
            s =>
              !q ||
              s.fullName.toLowerCase().includes(q) ||
              (s.department || '').toLowerCase().includes(q) ||
              (s.phone || '').toLowerCase().includes(q)
          )
          .map(person => (
            <div
              key={person.id}
              className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-[220px]">
                <UserCircle2 className="w-10 h-10 text-stone-700 shrink-0" />
                <div>
                  <p className="font-bold text-sm text-stone-900">
                    {person.prefix ? `${person.prefix}` : ''}{person.fullName}
                  </p>
                  <p className="text-xs text-stone-500">{person.phone}</p>
                </div>
              </div>

              <div className="text-sm text-stone-800">
                แผนก : <strong>{person.department}</strong>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setModalStaff(person)}
                  className="p-2 rounded-lg text-blue-900 hover:bg-stone-100"
                  title="แก้ไขผู้รับผิดชอบ"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`ต้องการลบผู้รับผิดชอบ "${person.fullName}" ใช่หรือไม่?`)) {
                      deleteStaffMember(person.id);
                    }
                  }}
                  className="p-2 rounded-lg text-blue-900 hover:bg-red-50 hover:text-red-600"
                  title="ลบผู้รับผิดชอบ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Modal เพิ่ม/แก้ไขผู้รับผิดชอบ */}
      {modalStaff && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-stone-900">
                {modalStaff.id ? 'แก้ไขผู้รับผิดชอบ' : 'เพิ่มผู้รับผิดชอบ'}
              </h2>
              <button
                onClick={() => setModalStaff(null)}
                className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-4">
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    คำนำหน้า <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={modalStaff.prefix}
                    onChange={e => setModalStaff({ ...modalStaff, prefix: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200"
                  >
                    <option value="นาย">นาย</option>
                    <option value="นาง">นาง</option>
                    <option value="นางสาว">นางสาว</option>
                    <option value="พ่อหลวง">พ่อหลวง</option>
                    <option value="พ่อหนาน">พ่อหนาน</option>
                    <option value="แม่หลวง">แม่หลวง</option>
                  </select>
                </div>
                <div className="sm:col-span-8">
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    ชื่อ - นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={modalStaff.fullName}
                    onChange={e => setModalStaff({ ...modalStaff, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-5">
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    แผนก <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={modalStaff.department}
                    onChange={e => setModalStaff({ ...modalStaff, department: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200"
                  >
                    {departments.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-7">
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    ที่อยู่ผู้รับผิดชอบ
                  </label>
                  <input
                    type="text"
                    value={modalStaff.address}
                    onChange={e => setModalStaff({ ...modalStaff, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    จังหวัด
                  </label>
                  <input
                    type="text"
                    list="staff-provinces"
                    value={modalStaff.province}
                    onChange={e => setModalStaff({ ...modalStaff, province: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-stone-200 text-xs"
                  />
                  <datalist id="staff-provinces">
                    <option value="เชียงใหม่" />
                    <option value="ลำพูน" />
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    ตำบล / แขวง
                  </label>
                  <input
                    type="text"
                    list="staff-subdistricts"
                    value={modalStaff.subdistrict}
                    onChange={e => setModalStaff({ ...modalStaff, subdistrict: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-stone-200 text-xs"
                  />
                  <datalist id="staff-subdistricts">
                    <option value="หนองหาร" />
                    <option value="แม่แฝก" />
                    <option value="สันทรายหลวง" />
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    อำเภอ / เขต
                  </label>
                  <input
                    type="text"
                    list="staff-districts"
                    value={modalStaff.district}
                    onChange={e => setModalStaff({ ...modalStaff, district: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-stone-200 text-xs"
                  />
                  <datalist id="staff-districts">
                    <option value="สันทราย" />
                    <option value="เมืองเชียงใหม่" />
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    รหัสไปรษณีย์
                  </label>
                  <input
                    type="text"
                    value={modalStaff.postalCode}
                    onChange={e => setModalStaff({ ...modalStaff, postalCode: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-stone-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น 081-234-5678"
                    value={modalStaff.phone}
                    onChange={e => setModalStaff({ ...modalStaff, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    อีเมล (ไม่บังคับ)
                  </label>
                  <input
                    type="email"
                    value={modalStaff.email}
                    onChange={e => setModalStaff({ ...modalStaff, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalStaff(null)}
                  className="px-6 py-2.5 rounded-xl bg-stone-300 hover:bg-stone-400 text-stone-800 text-xs font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#3D7352] hover:bg-[#2E5A44] text-white text-xs font-bold"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
