// ข้อมูลตั้งต้น (Initial Seed Data) สำหรับวิสาหกิจชุมชนบ้านวิเวก ม.8 ต.หนองหาร อ.สันทราย จ.เชียงใหม่

export const RITUAL_TYPES = [
  {
    id: 'RITUAL-01',
    code: 'แบบที่ 1',
    name: 'แบบที่ 1 ล้านนาเต็มรูปแบบ',
    shortName: 'ล้านนาเต็มรูปแบบ',
    bullets: [
      'สวดพระอภิธรรมครบทุกขั้นตอน',
      'ครอบคลุมพิธีกรรมล้านนาโบราณครบชุด (ตานบ้านน้อย/จองอ้อย, ตานกองทราย 108, สะตวงถอน, พระสวดถอน, บั้งไฟ)',
      'มีพระสงฆ์และครูบาอาจารย์ดูแลตลอดงาน'
    ],
    upgradePriceFrom3: 8500,
    upgradePriceFrom2: 5000
  },
  {
    id: 'RITUAL-02',
    code: 'แบบที่ 2',
    name: 'แบบที่ 2 ล้านนาแบบย่อ',
    shortName: 'ล้านนาแบบย่อ',
    bullets: [
      'สวดพระอภิธรรมครบทุกขั้นตอน',
      'ครอบคลุมพิธีกรรมล้านนาหลัก (ขันตั้ง, สะตวงถอน, ควักเซี่ยงเมี่ยง, ฝ้ายจูง, ต่าแหล๋ว)',
      'มีพระสงฆ์และครูบาอาจารย์ดูแลตลอดงาน'
    ],
    upgradePriceFrom3: 3500,
    upgradePriceFrom2: 0
  },
  {
    id: 'RITUAL-03',
    code: 'แบบที่ 3',
    name: 'แบบที่ 3 New Normal (พิธีกรรมเรียบง่าย)',
    shortName: 'New Normal (พิธีกรรมเรียบง่าย)',
    bullets: [
      'สวดพระอภิธรรมครบทุกขั้นตอน',
      'ครอบคลุมพิธีกรรมล้านนาแบบเรียบง่าย กระชับ ได้ใจความสำคัญ',
      'มีพระสงฆ์และครูบาอาจารย์ดูแลตลอดงาน'
    ],
    upgradePriceFrom3: 0,
    upgradePriceFrom2: 0
  }
];

export const SERVICE_CATEGORIES_10 = [
  { id: 1, title: '1. การเคลื่อนย้ายและเตรียมร่าง' },
  { id: 2, title: '2. หีบศพและงานตกแต่งสถานที่' },
  { id: 3, title: '3. การตั้งศพ – พิธีรดน้ำศพ' },
  { id: 4, title: '4. พิธีสวดพระอภิธรรม (ทุกคืน)' },
  { id: 5, title: '5. พระสงฆ์แสดงพระธรรมเทศนา' },
  { id: 6, title: '6. พิธีเคลื่อนขบวนและเวียนรอบเมรุ' },
  { id: 7, title: '7. พิธีฌาปนกิจ' },
  { id: 8, title: '8. พิธีเก็บอัฐิและลอยอังคาร' },
  { id: 9, title: '9. อาหาร เครื่องดื่ม และของชำร่วย' },
  { id: 10, title: '10. บริการสถานที่และสาธารณูปโภค' }
];

// ตารางแจกแจงรายวันแบบเต็ม (อ้างอิงจากภาพแคตตาล็อกบ้านวิเวก)
export const buildFullScheduleItems = (pkgId) => {
  const isPkg1 = pkgId === 'PKG-01';
  const isPkg2 = pkgId === 'PKG-02';
  const isPkg3 = pkgId === 'PKG-03';
  const isPkg4 = pkgId === 'PKG-04';
  const has3Nights = isPkg3 || isPkg4;

  return [
    {
      groupTitle: 'หมวดสถานที่ อุปกรณ์ และการอำนวยความสะดวก',
      items: [
        {
          code: '1',
          name: 'งานโครงสร้าง สถานที่ (จัดโต๊ะ + เก้าอี้ + โต๊ะหมู่ + กล่องธรรม + อาสนะ)',
          day1: true, night1: false, day2: false, night2: false, day3: false, night3: false, cremation: false, bone: false,
          price: isPkg1 ? 2600 : isPkg2 ? 3600 : isPkg3 ? 4500 : 5400
        },
        {
          code: '1.2',
          name: 'จุดเคารพศพ (กระถางธูป, ซองสั้น/ยาว, ธูปใหญ่เกลียว 3 ดอก, ธูปห่อใหญ่, เทียน 12 เล่ม, น้ำมันตะเกียง, ดอกไม้จันทน์)',
          day1: true, night1: false, day2: false, night2: false, day3: false, night3: false, cremation: false, bone: false,
          price: isPkg1 ? 570 : isPkg2 ? 770 : isPkg3 ? 1140 : 1320
        },
        {
          code: '2',
          name: 'ค่าไฟ + ประปา',
          day1: true, night1: false, day2: false, night2: false, day3: false, night3: false, cremation: false, bone: false,
          price: isPkg1 ? 600 : isPkg2 ? 1000 : isPkg3 ? 1400 : 2000
        },
        {
          code: '3',
          name: 'แม่บ้านดูแลความสะอาด (ห้องน้ำ + ศาลา + เก็บเศษอาหาร)',
          day1: true, night1: false, day2: false, night2: false, day3: false, night3: false, cremation: false, bone: false,
          price: isPkg1 ? 600 : isPkg2 ? 600 : 900
        },
        {
          code: '4',
          name: 'น้ำยาล้างห้องน้ำ + น้ำยาเช็ดพื้น + ผ้าเช็ด + ถุงดำ',
          day1: true, night1: false, day2: false, night2: false, day3: false, night3: false, cremation: false, bone: false,
          price: isPkg1 || isPkg2 ? 300 : 600
        },
        {
          code: '5',
          name: 'ค่าทำความสะอาดเมรุ + วัสดุเผา',
          day1: false, night1: false, day2: false, night2: false, day3: false, night3: false, cremation: true, bone: false,
          price: isPkg1 || isPkg2 ? 1000 : 1500
        },
        {
          code: '6',
          name: 'ค่าน้ำมันเผา',
          day1: false, night1: false, day2: false, night2: false, day3: false, night3: false, cremation: true, bone: false,
          price: 300
        },
        {
          code: '7',
          name: 'เช็ดโต๊ะเก้าอี้ / ตัดหญ้า / เตรียมและเก็บอุปกรณ์',
          day1: false, night1: false, day2: false, night2: false, day3: false, night3: false, cremation: true, bone: false,
          price: 500
        },
        {
          code: '8',
          name: 'รถเครื่องเสียง + คนคุม',
          day1: false, night1: false, day2: false, night2: false, day3: false, night3: false, cremation: !isPkg1, bone: false,
          price: isPkg1 ? 0 : 300
        }
      ]
    },
    {
      groupTitle: 'หมวดการจัดการศพและเคลื่อนย้าย',
      items: [
        {
          code: '1',
          name: 'รับศพจากโรงพยาบาล (พระ 1 รูป + เจ้าหน้าที่ 2 คน)',
          day1: true, night1: false, day2: false, night2: false, day3: false, night3: false, cremation: false, bone: false,
          price: 0
        },
        {
          code: '2',
          name: 'สวดเข้าโลง (สวยดอก + ผ้าบังสุกุล + น้ำหยาด + ซอง)',
          day1: true, night1: false, day2: false, night2: false, day3: false, night3: false, cremation: false, bone: false,
          price: 300
        },
        {
          code: '3',
          name: 'ค่าเช่าโลงเย็น + ยกขึ้นปราสาท + ทำความสะอาด',
          day1: true, night1: false, day2: false, night2: false, day3: false, night3: false, cremation: false, bone: false,
          price: 500
        },
        {
          code: '4',
          name: 'ค่าอาบน้ำศพ, สบู่, ถุงมือ, แป้ง, ขมิ้นส้มป่อย',
          day1: true, night1: false, day2: false, night2: false, day3: false, night3: false, cremation: false, bone: false,
          price: 0
        },
        {
          code: '5',
          name: 'ค่าหีบศพธรรมดา (ฝ้าย 3 เส้น + ผ้ารอง + ผ้าห่อศพ)',
          day1: true, night1: false, day2: false, night2: false, day3: false, night3: false, cremation: false, bone: false,
          price: 0
        },
        {
          code: '6',
          name: 'ล้อลาก + พร้อมตกแต่ง + เก็บ',
          day1: false, night1: false, day2: false, night2: false, day3: false, night3: false, cremation: true, bone: false,
          price: 300
        },
        {
          code: '7',
          name: 'ค่าล้อลาก ยกหีบลงรถ + ขึ้นเมรุ',
          day1: false, night1: false, day2: false, night2: false, day3: false, night3: false, cremation: true, bone: false,
          price: isPkg1 || isPkg2 ? 300 : 600
        }
      ]
    },
    {
      groupTitle: 'หมวดพิธีกรรมและของใช้ในพิธีกรรม',
      items: [
        {
          code: '1',
          name: 'มะพร้าว, สายจูง, สายสิญจน์, พาน, ตุงเหล็ก, บาตร',
          day1: true, night1: false, day2: false, night2: false, day3: false, night3: false, cremation: false, bone: false,
          price: 300
        },
        {
          code: '2',
          name: 'ขันตั้ง / ศพ / สวด',
          day1: false, night1: true, day2: false, night2: false, day3: false, night3: false, cremation: false, bone: false,
          price: 300
        },
        {
          code: '3',
          name: 'ขันพระพุทธ + ขันขอศีล',
          day1: false, night1: true, day2: false, night2: true, day3: false, night3: has3Nights, cremation: true, bone: false,
          price: has3Nights ? 240 : 180
        },
        {
          code: '4',
          name: 'สวยดอกองค์เทศน์ / อาจารย์',
          day1: false, night1: true, day2: false, night2: true, day3: false, night3: false, cremation: false, bone: false,
          price: 60
        },
        {
          code: '5',
          name: 'ผ้าบังสุกุล + ผ้าไตรบังสุกุล',
          day1: false, night1: true, day2: false, night2: true, day3: false, night3: has3Nights, cremation: true, bone: true,
          price: has3Nights ? 420 : 320
        },
        {
          code: '6',
          name: 'สังฆทานองค์เทศน์ (น้ำดื่ม / สวยดอก / วันเผา)',
          day1: false, night1: true, day2: false, night2: true, day3: false, night3: false, cremation: has3Nights, bone: false,
          price: has3Nights ? 900 : 140
        },
        {
          code: '7',
          name: 'ตานบ้านน้อย/จองอ้อย, ตานกองทราย 108 + ท้าวทั้ง 4 (พิธีล้านนาเต็มรูปแบบ)',
          day1: false, night1: false, day2: false, night2: false, day3: isPkg4, night3: false, cremation: false, bone: false,
          price: isPkg4 ? 2000 : 0,
          highlightRed: !isPkg4
        },
        {
          code: '8',
          name: 'สะตวงถอน + ควักเซี่ยงเมี่ยง + ฝ้ายจูง',
          day1: false, night1: false, day2: false, night2: false, day3: isPkg3 || isPkg4, night3: false, cremation: true, bone: false,
          price: 330
        },
        {
          code: '9',
          name: 'ถุงข้าวด่วน + ต่าแหล๋ว (นำไปขึงประตูบ้าน)',
          day1: false, night1: false, day2: false, night2: false, day3: false, night3: false, cremation: true, bone: false,
          price: 230
        },
        {
          code: '10',
          name: 'น้ำขมิ้นส้มป่อย + สังคหะ + ประตูวัด + ประตูสุสาน + บาตรน้ำมนต์ + ชุดเทียนหยด',
          day1: false, night1: false, day2: false, night2: false, day3: false, night3: false, cremation: true, bone: false,
          price: 200
        },
        {
          code: '11',
          name: 'กล่องเก็บกระดูก / หม้อดิน + ผ้าขาว + สวยดอก + น้ำขมิ้นส้มป่อย (วันเก็บกระดูก)',
          day1: false, night1: false, day2: false, night2: false, day3: false, night3: false, cremation: false, bone: has3Nights,
          price: has3Nights ? 300 : 0
        }
      ]
    },
    {
      groupTitle: 'หมวดปัจจัยและค่าตอบแทนบุคลากร/ผู้ประกอบพิธี',
      items: [
        {
          code: '1',
          name: 'ค่าทำพิธี',
          day1: false, night1: true, day2: false, night2: false, day3: false, night3: false, cremation: false, bone: false,
          price: has3Nights ? 1000 : 600
        },
        {
          code: '2',
          name: 'ซองอาจารย์ + ซองผู้ช่วยอาจารย์',
          day1: false, night1: true, day2: false, night2: true, day3: false, night3: has3Nights, cremation: true, bone: false,
          price: isPkg1 ? 1800 : isPkg2 ? 2400 : 3200
        },
        {
          code: '3',
          name: 'ซองปัจจัยองค์เทศน์ + ซองพระพุทธ',
          day1: false, night1: true, day2: false, night2: true, day3: false, night3: has3Nights, cremation: true, bone: false,
          price: isPkg1 ? 900 : isPkg2 ? 1300 : 2400
        },
        {
          code: '4',
          name: 'ซองสวดอภิธรรม + ซองสวดมาติกา/สังคหะ + พุทธมนต์',
          day1: false, night1: true, day2: false, night2: true, day3: false, night3: has3Nights, cremation: true, bone: false,
          price: isPkg1 || isPkg2 ? 2400 : isPkg3 ? 3200 : 4400
        },
        {
          code: '5',
          name: 'ค่าสัปเหร่อ',
          day1: false, night1: false, day2: false, night2: false, day3: false, night3: false, cremation: true, bone: false,
          price: 500
        }
      ]
    },
    {
      groupTitle: 'หมวดปราสาทและตกแต่งสถานที่',
      items: [
        {
          code: '1',
          name: isPkg1 || isPkg2 ? 'จัดดอกไม้แห้ง + กรอบรูป + ตกแต่งสถานที่/นิทรรศการ' : 'จัดดอกไม้สด + กรอบรูป + ตกแต่งสถานที่/นิทรรศการ',
          day1: false, night1: false, day2: true, night2: false, day3: false, night3: false, cremation: false, bone: false,
          price: isPkg1 ? 1300 : isPkg2 ? 2100 : isPkg3 ? 5000 : 8000
        },
        {
          code: '2',
          name: 'ปราสาทเช่า',
          day1: false, night1: false, day2: false, night2: false, day3: true, night3: false, cremation: false, bone: false,
          price: 2900
        }
      ]
    }
  ];
};

export const INITIAL_PACKAGES = [
  {
    id: 'PKG-01',
    name: 'แพ็กเกจเริ่มต้น',
    tagline: 'แพ็กเกจจัดงานศพแบบเรียบง่าย ประหยัด ครบตามประเพณีพื้นฐาน',
    targetGroup: 'ครอบครัวขนาดเล็ก',
    price: 25000,
    durationDays: 3,
    durationNights: 2,
    durationText: '3 วัน 2 คืน (สวด 2 คืน)',
    baseGuests: 50,
    maxGuests: 100,
    defaultRitualId: 'RITUAL-03',
    isRecommended: false,
    coverImage: '/images/package-cover.jpg',
    highlights: [
      'สวดพระอภิธรรม 2 คืน (3 วัน 2 คืน)',
      'รองรับแขกประมาณ 50 คน',
      'พิธีกรรมแบบที่ 3 New Normal (เรียบง่าย)',
      'จัดดอกไม้แห้งประดับหน้าหีบศพและปราสาทเช่า',
      'รวมอาหารกลางวันวันเผาและน้ำดื่มตลอดงาน'
    ],
    categories10: [
      {
        id: 1,
        title: '1. การเคลื่อนย้ายและเตรียมร่าง',
        items: [
          'บริการรถรับร่างจากโรงพยาบาล (พระ 1 ท่าน เจ้าหน้าที่ 2 ท่าน)',
          'พิธีอาบน้ำศพ แต่งร่าง และบรรจุลงโลง',
          '(มะพร้าว สายสิญจน์ พาน ตุงเหล็ก บาตร ถุงข้าวด่วน ต่าแหล๋ว)'
        ]
      },
      {
        id: 2,
        title: '2. หีบศพและงานตกแต่งสถานที่',
        items: [
          'หีบศพพุ่นธรรมดา / โลงเย็นตลอดงาน',
          'งานจัดดอกไม้แห้งประดับหน้าโลงศพ กรอบรูป และตกแต่งสถานที่',
          'ปราสาทศพเช่าสำหรับประดับพิธี'
        ]
      },
      {
        id: 3,
        title: '3. การตั้งศพ – พิธีรดน้ำศพ',
        items: [
          'อุปกรณ์ประกอบพิธีรดน้ำศพ (น้ำขมิ้นส้มป่อย, สบู่, แป้ง, ผ้าเช็ดตัว)',
          'ชุดอุปกรณ์เคารพศพ (กระถางธูป, ธูป, เทียน, น้ำมันตะเกียง, ดอกไม้จันทน์ 50 ดอก)'
        ]
      },
      {
        id: 4,
        title: '4. พิธีสวดพระอภิธรรม (2 คืน)',
        items: [
          'เครื่องใช้และอุปกรณ์ประกอบพิธีสงฆ์ (ขันพิธี, ขันพระพุทธ, ขันขอศีล, สวยดอก, สะตวงถอน)',
          'ผ้าบังสุกุล / ชุดสังฆทาน',
          'ปัจจัยถวายพระสงฆ์ และค่าตอบแทนอาจารย์พิธี (สวด 2 คืน)'
        ]
      },
      {
        id: 5,
        title: '5. พระสงฆ์แสดงพระธรรมเทศนา',
        items: [
          'ชุดถวายปัจจัยและสังฆทานองค์เทศน์',
          'ผ้าไตรบังสุกุลและสวยดอกบูชา'
        ]
      },
      {
        id: 6,
        title: '6. พิธีเคลื่อนขบวนและเวียนรอบเมรุ',
        items: [
          'รถล้อลากเคลื่อนขบวนพร้อมตกแต่ง',
          'ค่าตอบแทนเจ้าหน้าที่และทีมงานยกหีบขึ้นเมรุ',
          'ชุดสังฆทานและน้ำมนต์สำหรับขบวนเคลื่อนศพ'
        ]
      },
      {
        id: 7,
        title: '7. พิธีฌาปนกิจ',
        items: [
          'เจ้าหน้าที่พิธีกรรมและสัปเหร่อดูแลตลอดพิธี',
          'ค่าน้ำมันเผา และค่าทำความสะอาดเมรุ'
        ]
      },
      {
        id: 8,
        title: '8. พิธีเก็บอัฐิและลอยอังคาร',
        items: [
          'คำแนะนำพิธีเก็บอัฐิตามประเพณี (สามารถเลือกเพิ่มชุดหม้อดิน/กล่องเก็บกระดูกได้)'
        ]
      },
      {
        id: 9,
        title: '9. อาหาร เครื่องดื่ม และของชำร่วย',
        items: [
          'น้ำดื่ม (300 มล. * 12 ขวด) และน้ำแข็ง ตลอดงาน',
          'อาหารกลางวันวันเผา (รวมถวายพระสงฆ์ รองรับ 50 คน)'
        ]
      },
      {
        id: 10,
        title: '10. บริการสถานที่และสาธารณูปโภค',
        items: [
          'โต๊ะ เก้าอี้ 30 ชุด เต็นท์ 2 หลัง และพัดลมอำนวยความสะดวก',
          'ค่าไฟฟ้า ประปา และเครื่องเสียงมาตรฐาน',
          'แม่บ้านดูแลความสะอาดตลอดงาน'
        ]
      }
    ]
  },
  {
    id: 'PKG-02',
    name: 'แพ็กเกจประหยัด',
    tagline: 'แพ็กเกจคุ้มค่า รองรับแขกขนาดกลาง พร้อมบริการอาหารว่างและรถเครื่องเสียง',
    targetGroup: 'ครอบครัวขนาดเล็ก – กลาง',
    price: 45000,
    durationDays: 3,
    durationNights: 2,
    durationText: '3 วัน 2 คืน (สวด 2 คืน)',
    baseGuests: 100,
    maxGuests: 150,
    defaultRitualId: 'RITUAL-03',
    isRecommended: false,
    coverImage: '/images/package-cover.jpg',
    highlights: [
      'สวดพระอภิธรรม 2 คืน (3 วัน 2 คืน)',
      'รองรับแขกประมาณ 100 คน',
      'พิธีกรรมแบบที่ 3 New Normal (เรียบง่าย)',
      'รวมอาหารว่าง (เบรก) เครื่องเสียงชุดใหญ่ และรถเครื่องเสียงเคลื่อนขบวน',
      'รวมอาหารกลางวันวันเผาและน้ำดื่มตลอดงาน'
    ],
    categories10: [
      {
        id: 1,
        title: '1. การเคลื่อนย้ายและเตรียมร่าง',
        items: [
          'บริการรถรับร่างจากโรงพยาบาล (พระ 1 ท่าน เจ้าหน้าที่ 2 ท่าน)',
          'พิธีอาบน้ำศพ แต่งร่าง และบรรจุลงโลง',
          '(มะพร้าว สายสิญจน์ พาน ตุงเหล็ก บาตร ถุงข้าวด่วน ต่าแหล๋ว)'
        ]
      },
      {
        id: 2,
        title: '2. หีบศพและงานตกแต่งสถานที่',
        items: [
          'หีบศพพุ่นธรรมดา / โลงเย็นตลอดงาน',
          'งานจัดดอกไม้ประดับหน้าโลงศพ กรอบรูป และตกแต่งสถานที่ขนาดกลาง',
          'ปราสาทศพเช่าสำหรับประดับพิธี'
        ]
      },
      {
        id: 3,
        title: '3. การตั้งศพ – พิธีรดน้ำศพ',
        items: [
          'อุปกรณ์ประกอบพิธีรดน้ำศพ (น้ำขมิ้นส้มป่อย, สบู่, แป้ง, ผ้าเช็ดตัว)',
          'ชุดอุปกรณ์เคารพศพ (กระถางธูป, ธูป, เทียน, น้ำมันตะเกียง, ดอกไม้จันทน์ 100 ดอก)'
        ]
      },
      {
        id: 4,
        title: '4. พิธีสวดพระอภิธรรม (2 คืน)',
        items: [
          'เครื่องใช้และอุปกรณ์ประกอบพิธีสงฆ์ (ขันพิธี, ขันพระพุทธ, ขันขอศีล, สวยดอก, สะตวงถอน)',
          'ผ้าบังสุกุล / ชุดสังฆทาน + น้ำดื่มสิงห์แพ็คถวายพระ',
          'ปัจจัยถวายพระสงฆ์ และค่าตอบแทนอาจารย์พิธี (สวด 2 คืน)'
        ]
      },
      {
        id: 5,
        title: '5. พระสงฆ์แสดงพระธรรมเทศนา',
        items: [
          'ชุดถวายปัจจัยและสังฆทานองค์เทศน์',
          'ผ้าไตรบังสุกุลและสวยดอกบูชา'
        ]
      },
      {
        id: 6,
        title: '6. พิธีเคลื่อนขบวนและเวียนรอบเมรุ',
        items: [
          'รถล้อลากเคลื่อนขบวนพร้อมตกแต่ง',
          'ค่าตอบแทนเจ้าหน้าที่และทีมงานยกหีบขึ้นเมรุ',
          'ชุดสังฆทานและน้ำมนต์สำหรับขบวนเคลื่อนศพ',
          'รถเครื่องเสียงและคนควบคุมตลอดขบวน'
        ]
      },
      {
        id: 7,
        title: '7. พิธีฌาปนกิจ',
        items: [
          'เจ้าหน้าที่พิธีกรรมและสัปเหร่อดูแลตลอดพิธี',
          'ค่าน้ำมันเผา และค่าทำความสะอาดเมรุ'
        ]
      },
      {
        id: 8,
        title: '8. พิธีเก็บอัฐิและลอยอังคาร',
        items: [
          'คำแนะนำพิธีเก็บอัฐิตามประเพณี (สามารถเลือกเพิ่มชุดหม้อดิน/กล่องเก็บกระดูกได้)'
        ]
      },
      {
        id: 9,
        title: '9. อาหาร เครื่องดื่ม และของชำร่วย',
        items: [
          'อาหารว่าง (เบรก) และเครื่องดื่ม (น้ำดื่ม, น้ำแข็ง) ตลอดงาน',
          'อาหารกลางวันวันเผา (รวมถวายพระสงฆ์ รองรับ 100 คน)'
        ]
      },
      {
        id: 10,
        title: '10. บริการสถานที่และสาธารณูปโภค',
        items: [
          'โต๊ะ เก้าอี้ 30 ชุด เต็นท์ 2 หลัง และพัดลมอำนวยความสะดวก',
          'ค่าไฟฟ้า ประปา และเครื่องเสียงชุดใหญ่พร้อมไฟส่องสว่าง',
          'แม่บ้านดูแลความสะอาดตลอดงาน'
        ]
      }
    ]
  },
  {
    id: 'PKG-03',
    name: 'แพ็กเกจมาตรฐาน',
    tagline: 'แพ็กเกจยอดนิยม ครบถ้วนทุกพิธีกรรมและการบริการ',
    targetGroup: 'ครอบครัวขนาดกลาง',
    price: 75000,
    durationDays: 4,
    durationNights: 3,
    durationText: '4 วัน 3 คืน (สวด 3 คืน)',
    baseGuests: 150,
    maxGuests: 200,
    defaultRitualId: 'RITUAL-02',
    isRecommended: true,
    coverImage: '/images/package-cover.jpg',
    highlights: [
      'สวดพระอภิธรรม 3 คืน (4 วัน 3 คืน)',
      'รองรับแขกประมาณ 150 คน',
      'พิธีกรรมแบบที่ 2 ล้านนาแบบย่อ (อยู่ในแพ็กเกจ)',
      'จัดดอกไม้สดประดับหน้าโลงศพ (5,000 บาท) และปราสาทเช่า',
      'รวมเบรกทุกคืน + อาหารกลางวันวันเผา (20,000 บาท) + ของชำร่วย (4,000 บาท)'
    ],
    categories10: [
      {
        id: 1,
        title: '1. การเคลื่อนย้ายและเตรียมร่าง',
        items: [
          'บริการรถรับร่างจากโรงพยาบาล (พระ 1 ท่าน เจ้าหน้าที่ 2 ท่าน)',
          'พิธีอาบน้ำศพ แต่งร่าง และบรรจุลงโลง',
          '(มะพร้าว สายสิญจน์ พาน ตุงเหล็ก บาตร)'
        ]
      },
      {
        id: 2,
        title: '2. หีบศพและงานตกแต่งสถานที่',
        items: [
          'หีบศพพุ่นธรรมดา / โลงเย็น',
          'งานจัดดอกไม้สดประดับหน้าโลงศพ กรอบรูป และตกแต่งสถานที่',
          'ปราสาทศพเช่าสำหรับประดับพิธี'
        ]
      },
      {
        id: 3,
        title: '3. การตั้งศพ – พิธีรดน้ำศพ',
        items: [
          'อุปกรณ์ประกอบพิธีรดน้ำศพ (น้ำขมิ้นส้มป่อย, สบู่, แป้ง, ผ้าเช็ดตัว)',
          'ชุดอุปกรณ์เคารพศพ (กระถางธูป, ธูป, เทียน, น้ำมันตะเกียง, ดอกไม้จันทน์ 120 ดอก)'
        ]
      },
      {
        id: 4,
        title: '4. พิธีสวดพระอภิธรรม (ทุกคืน)',
        items: [
          'เครื่องใช้และอุปกรณ์ประกอบพิธีสงฆ์ (ขันพิธี, สวยดอก)',
          '(ขันพิธี, ขันพระพุทธ, ขันขอศีล, สวยดอก, สะตวงถอน)',
          'ผ้าบังสุกุล / ชุดสังฆทาน',
          'ปัจจัยถวายพระสงฆ์ และค่าตอบแทนอาจารย์พิธี'
        ]
      },
      {
        id: 5,
        title: '5. พระสงฆ์แสดงพระธรรมเทศนา',
        items: [
          'ชุดถวายปัจจัยและสังฆทานองค์เทศน์',
          'ผ้าไตรบังสุกุลและสวยดอกบูชา'
        ]
      },
      {
        id: 6,
        title: '6. พิธีเคลื่อนขบวนและเวียนรอบเมรุ',
        items: [
          'รถล้อลากเคลื่อนขบวนพร้อมตกแต่ง',
          'ค่าตอบแทนเจ้าหน้าที่และทีมงานยกหีบขึ้นเมรุ',
          'ชุดสังฆทานและน้ำมนต์สำหรับขบวนเคลื่อนศพ',
          'รถเครื่องเสียงและคนควบคุม'
        ]
      },
      {
        id: 7,
        title: '7. พิธีฌาปนกิจ',
        items: [
          'เจ้าหน้าที่พิธีกรรมและสัปเหร่อดูแลตลอดพิธี',
          'ค่าน้ำมันเผา และค่าทำความสะอาดเมรุ'
        ]
      },
      {
        id: 8,
        title: '8. พิธีเก็บอัฐิและลอยอังคาร',
        items: [
          'กล่องเก็บกระดูก / หม้อดิน พร้อมผ้าขาว',
          'ผ้าบังสุกุลและน้ำขมิ้นส้มป่อยสำหรับพิธีเก็บกระดูก',
          'ปัจจัยถวายพระสงฆ์และอาจารย์ผู้ทำพิธี'
        ]
      },
      {
        id: 9,
        title: '9. อาหาร เครื่องดื่ม และของชำร่วย',
        items: [
          'อาหารว่าง (เบรก) และเครื่องดื่ม (น้ำดื่ม, น้ำแข็ง) ตลอดงาน',
          'อาหารกลางวันวันเผา (รวมถวายพระสงฆ์)',
          'ของชำร่วยแจกผู้มาร่วมงาน'
        ]
      },
      {
        id: 10,
        title: '10. บริการสถานที่และสาธารณูปโภค',
        items: [
          'โต๊ะ เก้าอี้ เต็นท์ และพัดลมอำนวยความสะดวก',
          'ค่าไฟฟ้า ประปา และเครื่องเสียง',
          'แม่บ้านดูแลความสะอาดตลอดงาน'
        ]
      }
    ]
  },
  {
    id: 'PKG-04',
    name: 'แพ็กเกจพิเศษ',
    tagline: 'แพ็กเกจสมบูรณ์แบบ ครบทุกขั้นตอนพิธีกรรมล้านนาโบราณเต็มรูปแบบ',
    targetGroup: 'ครอบครัวขนาดใหญ่',
    price: 120000,
    durationDays: 4,
    durationNights: 3,
    durationText: '4 วัน 3 คืน (สวด 3 คืน)',
    baseGuests: 200,
    maxGuests: 300,
    defaultRitualId: 'RITUAL-01',
    isRecommended: false,
    coverImage: '/images/package-cover.jpg',
    highlights: [
      'สวดพระอภิธรรม 3 คืน (4 วัน 3 คืน)',
      'รองรับแขกประมาณ 200 คน',
      'พิธีกรรมแบบที่ 1 ล้านนาเต็มรูปแบบ (ครบทุกพิธีโบราณ)',
      'จัดดอกไม้สดชุดใหญ่พิเศษ (8,000 บาท) และปราสาทเช่า',
      'รวมเบรกชุดใหญ่ + อาหารกลางวันวันเผา (36,000 บาท) + ของชำร่วยชุดพิเศษ (8,000 บาท)'
    ],
    categories10: [
      {
        id: 1,
        title: '1. การเคลื่อนย้ายและเตรียมร่าง',
        items: [
          'บริการรถรับร่างจากโรงพยาบาล (พระ 1 ท่าน เจ้าหน้าที่ 2 ท่าน)',
          'พิธีอาบน้ำศพ แต่งร่าง และบรรจุลงโลง',
          '(มะพร้าว สายสิญจน์ พาน ตุงเหล็ก บาตร ถุงข้าวด่วน ต่าแหล๋ว พิธีตัดผัวเมีย)'
        ]
      },
      {
        id: 2,
        title: '2. หีบศพและงานตกแต่งสถานที่',
        items: [
          'หีบศพพุ่นพิเศษ / โลงเย็น',
          'งานจัดดอกไม้สดชุดใหญ่พิเศษประดับหน้าโลงศพ กรอบรูป และนิทรรศการ',
          'ปราสาทศพเช่าพร้อมตุง 3 หางและตุงแดงประดับพิธี'
        ]
      },
      {
        id: 3,
        title: '3. การตั้งศพ – พิธีรดน้ำศพ',
        items: [
          'อุปกรณ์ประกอบพิธีรดน้ำศพครบชุด',
          'ชุดอุปกรณ์เคารพศพ (กระถางธูป, ธูป, เทียน, น้ำมันตะเกียง, ดอกไม้จันทน์ 200 ดอก)'
        ]
      },
      {
        id: 4,
        title: '4. พิธีสวดพระอภิธรรม (ทุกคืน) & พิธีล้านนาเต็มรูปแบบ',
        items: [
          'เครื่องใช้และอุปกรณ์ประกอบพิธีสงฆ์ครบชุดทุกคืน',
          'พิธีล้านนาเต็มรูปแบบ: ตานบ้านน้อย/จองอ้อย, ตานกองทราย 108 + ท้าวทั้ง 4, สะตวงถอน',
          'ผ้าบังสุกุล / ชุดสังฆทานชุดใหญ่',
          'ปัจจัยถวายพระสงฆ์ พระรับทาน พระสวดถอน และค่าตอบแทนอาจารย์พิธี'
        ]
      },
      {
        id: 5,
        title: '5. พระสงฆ์แสดงพระธรรมเทศนา',
        items: [
          'ชุดถวายปัจจัยและสังฆทานองค์เทศน์ครบทุกกัณฑ์',
          'ผ้าไตรบังสุกุลและสวยดอกบูชา'
        ]
      },
      {
        id: 6,
        title: '6. พิธีเคลื่อนขบวนและเวียนรอบเมรุ',
        items: [
          'รถล้อลากเคลื่อนขบวนพร้อมตกแต่ง',
          'ค่าตอบแทนเจ้าหน้าที่และทีมงานยกหีบขึ้นเมรุ',
          'ชุดสังฆทาน น้ำมนต์ และฝ้ายจูงสำหรับขบวนเคลื่อนศพ',
          'รถเครื่องเสียงและคนควบคุม'
        ]
      },
      {
        id: 7,
        title: '7. พิธีฌาปนกิจ',
        items: [
          'เจ้าหน้าที่พิธีกรรมและสัปเหร่อดูแลตลอดพิธี',
          'ชุดบั้งไฟจุดปราสาทศพตามประเพณีล้านนา',
          'ค่าน้ำมันเผา และค่าทำความสะอาดเมรุ'
        ]
      },
      {
        id: 8,
        title: '8. พิธีเก็บอัฐิและลอยอังคาร',
        items: [
          'กล่องเก็บกระดูก / หม้อดิน พร้อมผ้าขาว',
          'ผ้าบังสุกุลและน้ำขมิ้นส้มป่อยสำหรับพิธีเก็บกระดูก',
          'ปัจจัยถวายพระสงฆ์และอาจารย์ผู้ทำพิธี'
        ]
      },
      {
        id: 9,
        title: '9. อาหาร เครื่องดื่ม และของชำร่วย',
        items: [
          'อาหารว่าง (เบรกชุดใหญ่) และเครื่องดื่ม (น้ำดื่ม, น้ำแข็ง) ตลอดงาน',
          'อาหารกลางวันวันเผาชุดใหญ่ (36,000 บาท รวมถวายพระสงฆ์และของทานเล่น)',
          'ของชำร่วยชุดพิเศษแจกผู้มาร่วมงาน 200 ชิ้น'
        ]
      },
      {
        id: 10,
        title: '10. บริการสถานที่และสาธารณูปโภค',
        items: [
          'โต๊ะ เก้าอี้ เต็นท์ และพัดลมอำนวยความสะดวกครบชุด',
          'ค่าไฟฟ้า ประปา และเครื่องเสียงชุดใหญ่',
          'แม่บ้านดูแลความสะอาดตลอดงาน'
        ]
      }
    ]
  }
];

export const INITIAL_SERVICES = [
  // หมวดสถานที่ อุปกรณ์ และการอำนวยความสะดวก
  {
    id: 'SRV-01',
    category: 'หมวดสถานที่ อุปกรณ์ และการอำนวยความสะดวก',
    name: 'พัดลม',
    unit: 'ตัว',
    price: 300,
    department: 'ฝ่ายสถานที่',
    day1: true, night1: false, day2: false, night2: false, day3: false, night3: false, cremation: false, bone: false,
    remark: 'เพิ่มตัวละ 300 บาท',
    isActive: true
  },
  {
    id: 'SRV-02',
    category: 'หมวดสถานที่ อุปกรณ์ และการอำนวยความสะดวก',
    name: 'เครื่องเสียง + ไฟฟ้าส่องสว่าง',
    unit: 'ชุด',
    price: 1500,
    department: 'ฝ่ายเครื่องเสียงและไฟฟ้า',
    day1: true, night1: false, day2: false, night2: false, day3: false, night3: false, cremation: false, bone: false,
    remark: 'เพิ่มชุดละ 1,500 บาท',
    isActive: true
  },
  {
    id: 'SRV-03',
    category: 'หมวดสถานที่ อุปกรณ์ และการอำนวยความสะดวก',
    name: 'ตั้งเต็นท์เพิ่ม',
    unit: 'หลัง',
    price: 300,
    department: 'ฝ่ายสถานที่',
    day1: true, night1: false, day2: false, night2: false, day3: false, night3: false, cremation: false, bone: false,
    remark: 'เพิ่มหลังละ 300 บาท',
    isActive: true
  },
  {
    id: 'SRV-04',
    category: 'หมวดสถานที่ อุปกรณ์ และการอำนวยความสะดวก',
    name: 'โต๊ะเก้าอี้ (30 ที่นั่ง)',
    unit: 'ชุด',
    price: 300,
    department: 'ฝ่ายสถานที่',
    day1: true, night1: false, day2: false, night2: false, day3: false, night3: false, cremation: true, bone: false,
    remark: 'เพิ่มชุดละ 300 บาท',
    isActive: true
  },
  // หมวดอาหาร เครื่องดื่ม และของชำร่วยรับรองแขก
  {
    id: 'SRV-05',
    category: 'หมวดอาหาร เครื่องดื่ม และของชำร่วยรับรองแขก',
    name: 'เบรก 30 บาท (ชุด 50 กล่อง)',
    unit: 'ชุด',
    price: 1500,
    department: 'ฝ่ายอาหารและเครื่องดื่ม',
    day1: false, night1: true, day2: false, night2: true, day3: false, night3: true, cremation: false, bone: false,
    remark: 'กล่องละ 30 บาท (ชุดละ 50 กล่อง)',
    isActive: true
  },
  {
    id: 'SRV-06',
    category: 'หมวดอาหาร เครื่องดื่ม และของชำร่วยรับรองแขก',
    name: 'น้ำดื่ม (300 มล. * 12 ขวด) ชุด 10 แพ็ค',
    unit: 'ชุด',
    price: 700,
    department: 'ฝ่ายอาหารและเครื่องดื่ม',
    day1: false, night1: true, day2: false, night2: true, day3: false, night3: true, cremation: true, bone: false,
    remark: 'แพ็คละ 70 บาท',
    isActive: true
  },
  {
    id: 'SRV-07',
    category: 'หมวดอาหาร เครื่องดื่ม และของชำร่วยรับรองแขก',
    name: 'น้ำแข็ง (ส่งตลอดงาน)',
    unit: 'ชุด',
    price: 300,
    department: 'ฝ่ายอาหารและเครื่องดื่ม',
    day1: false, night1: true, day2: false, night2: true, day3: false, night3: true, cremation: true, bone: false,
    remark: 'เพิ่มตามจำนวนแขก',
    isActive: true
  },
  {
    id: 'SRV-08',
    category: 'หมวดอาหาร เครื่องดื่ม และของชำร่วยรับรองแขก',
    name: 'อาหารกลางวันเพิ่ม (เลี้ยงแขกและถวายพระ)',
    unit: 'ชุด',
    price: 5000,
    department: 'ฝ่ายอาหารและเครื่องดื่ม',
    day1: false, night1: false, day2: false, night2: false, day3: false, night3: false, cremation: true, bone: false,
    remark: 'รองรับแขกเพิ่ม 50 ท่าน',
    isActive: true
  },
  {
    id: 'SRV-09',
    category: 'หมวดอาหาร เครื่องดื่ม และของชำร่วยรับรองแขก',
    name: 'ของชำร่วย (ชุด 100 ชิ้น)',
    unit: 'ชุด',
    price: 4000,
    department: 'ฝ่ายหัตถกรรมและของชำร่วย',
    day1: false, night1: false, day2: false, night2: false, day3: false, night3: false, cremation: true, bone: false,
    remark: 'ชิ้นละ 40 บาท',
    isActive: true
  },
  // หมวดบันทึกภาพและบริการพิเศษ
  {
    id: 'SRV-10',
    category: 'หมวดบันทึกภาพและบริการพิเศษ',
    name: 'ถ่ายรูป / วิดีโอ ตลอดพิธี',
    unit: 'งาน',
    price: 3500,
    department: 'ฝ่ายดอกไม้และตกแต่ง',
    day1: false, night1: false, day2: false, night2: false, day3: false, night3: false, cremation: true, bone: false,
    remark: 'ช่างภาพมืออาชีพ',
    isActive: true
  },
  {
    id: 'SRV-11',
    category: 'หมวดบันทึกภาพและบริการพิเศษ',
    name: 'อุปกรณ์ปลงผม + แชมพู + สบู่ + ผ้าเช็ดตัว (บวชหน้าไฟ)',
    unit: 'ชุด',
    price: 1000,
    department: 'ฝ่ายพิธีการและศาสนา',
    day1: false, night1: false, day2: false, night2: false, day3: false, night3: false, cremation: true, bone: false,
    remark: 'กรณีมีบวชหน้าไฟ',
    isActive: true
  },
  {
    id: 'SRV-12',
    category: 'หมวดบันทึกภาพและบริการพิเศษ',
    name: 'บั้งไฟจุดปราสาทศพ (พิธีล้านนา)',
    unit: 'ชุด',
    price: 1000,
    department: 'ฝ่ายหีบศพและอุปกรณ์',
    day1: false, night1: false, day2: false, night2: false, day3: false, night3: false, cremation: true, bone: false,
    remark: 'จุดวันฌาปนกิจ',
    isActive: true
  }
];

export const INITIAL_LOCATIONS = [
  {
    id: 'LOC-01',
    name: 'วัดวิเวกวนาราม',
    type: 'วัด',
    address: 'หมู่ 8 ถนนสายหลัก',
    subdistrict: 'หนองหาร',
    district: 'สันทราย',
    province: 'เชียงใหม่',
    postalCode: '50290',
    phone: '053-123456',
    mapUrl: 'https://maps.google.com/?q=วัดวิเวกวนาราม+สันทราย+เชียงใหม่',
    details: 'วัดประจำชุมชนบ้านวิเวก มีลานจอดรถกว้างขวาง รองรับแขกได้มากกว่า 300 คน พร้อมเมรุปลอดมลพิษ',
    isActive: true,
    images: [
      'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=800&q=80'
    ],
    pavilions: [
      { id: 'PAV-01', name: 'ศาลา 1 (ศาลาใหญ่)', capacity: 200, isActive: true },
      { id: 'PAV-02', name: 'ศาลา 2 (ศาลากลางน้ำ)', capacity: 150, isActive: true }
    ]
  },
  {
    id: 'LOC-02',
    name: 'สุสานบ้านวิเวก (ฌาปนสถานชุมชน)',
    type: 'สุสาน / ฌาปนสถาน',
    address: 'หมู่ 8 บ้านวิเวก',
    subdistrict: 'หนองหาร',
    district: 'สันทราย',
    province: 'เชียงใหม่',
    postalCode: '50290',
    phone: '081-2345678',
    mapUrl: 'https://maps.google.com/?q=หนองหาร+สันทราย+เชียงใหม่',
    details: 'ฌาปนสถานมาตรฐานของหมู่บ้านวิเวก สำหรับประกอบพิธีฌาปนกิจและจุดปราสาทศพแบบล้านนา',
    isActive: true,
    images: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'
    ],
    pavilions: [
      { id: 'PAV-03', name: 'ศาลาบำเพ็ญกุศล 1', capacity: 200, isActive: true }
    ]
  }
];

export const INITIAL_DEPARTMENTS = [
  'ฝ่ายสถานที่',
  'ฝ่ายดอกไม้และตกแต่ง',
  'ฝ่ายพิธีการและศาสนา',
  'ฝ่ายเครื่องเสียงและไฟฟ้า',
  'ฝ่ายอาหารและเครื่องดื่ม',
  'ฝ่ายยานพาหนะ',
  'ฝ่ายหีบศพและอุปกรณ์',
  'ฝ่ายหัตถกรรมและของชำร่วย'
];

export const INITIAL_STAFF = [
  {
    id: 'STF-01',
    prefix: 'นาง',
    fullName: 'ป้าฝ้าย ใจดี',
    department: 'ฝ่ายสถานที่',
    phone: '081-222-3344',
    email: 'fai@banwiwek.org',
    address: '101 หมู่ 8',
    subdistrict: 'หนองหาร',
    district: 'สันทราย',
    province: 'เชียงใหม่',
    postalCode: '50290'
  },
  {
    id: 'STF-02',
    prefix: 'นาง',
    fullName: 'ป้าไหม สุขใจ',
    department: 'ฝ่ายหัตถกรรมและของชำร่วย',
    phone: '089-111-2233',
    email: 'mai@banwiwek.org',
    address: '88 หมู่ 8',
    subdistrict: 'หนองหาร',
    district: 'สันทราย',
    province: 'เชียงใหม่',
    postalCode: '50290'
  },
  {
    id: 'STF-03',
    prefix: 'นาง',
    fullName: 'ป้านุ่น อิ่มบุญ',
    department: 'ฝ่ายอาหารและเครื่องดื่ม',
    phone: '086-555-6677',
    email: 'noon@banwiwek.org',
    address: '45 หมู่ 8',
    subdistrict: 'หนองหาร',
    district: 'สันทราย',
    province: 'เชียงใหม่',
    postalCode: '50290'
  },
  {
    id: 'STF-04',
    prefix: 'นาง',
    fullName: 'ป้าหวาย มงคล',
    department: 'ฝ่ายพิธีการและศาสนา',
    phone: '084-888-9900',
    email: 'wai@banwiwek.org',
    address: '12 หมู่ 8',
    subdistrict: 'หนองหาร',
    district: 'สันทราย',
    province: 'เชียงใหม่',
    postalCode: '50290'
  },
  {
    id: 'STF-05',
    prefix: 'นาย',
    fullName: 'ลุงคำ งามตา',
    department: 'ฝ่ายดอกไม้และตกแต่ง',
    phone: '082-333-4455',
    email: 'kham@banwiwek.org',
    address: '59 หมู่ 8',
    subdistrict: 'หนองหาร',
    district: 'สันทราย',
    province: 'เชียงใหม่',
    postalCode: '50290'
  },
  {
    id: 'STF-06',
    prefix: 'นาย',
    fullName: 'ช่างเอก เสียงใส',
    department: 'ฝ่ายเครื่องเสียงและไฟฟ้า',
    phone: '083-777-8899',
    email: 'aek@banwiwek.org',
    address: '72 หมู่ 8',
    subdistrict: 'หนองหาร',
    district: 'สันทราย',
    province: 'เชียงใหม่',
    postalCode: '50290'
  },
  {
    id: 'STF-07',
    prefix: 'นาย',
    fullName: 'ลุงมี เดินทาง',
    department: 'ฝ่ายยานพาหนะ',
    phone: '085-444-5566',
    email: 'mee@banwiwek.org',
    address: '33 หมู่ 8',
    subdistrict: 'หนองหาร',
    district: 'สันทราย',
    province: 'เชียงใหม่',
    postalCode: '50290'
  },
  {
    id: 'STF-08',
    prefix: 'นาย',
    fullName: 'ลุงแก้ว บุญเรือง',
    department: 'ฝ่ายหีบศพและอุปกรณ์',
    phone: '087-666-7788',
    email: 'kaew@banwiwek.org',
    address: '91 หมู่ 8',
    subdistrict: 'หนองหาร',
    district: 'สันทราย',
    province: 'เชียงใหม่',
    postalCode: '50290'
  }
];

// รูป SVG จำลองสำหรับสำเนาบัตรประชาชนและใบมรณบัตรในข้อมูลตัวอย่าง
export const SAMPLE_ID_CARD_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
  <rect width="600" height="380" rx="18" fill="#F8FAFC" stroke="#94A3B8" stroke-width="3"/>
  <rect x="24" y="24" width="552" height="54" rx="8" fill="#1E3A8A"/>
  <text x="44" y="58" font-family="sans-serif" font-size="22" font-weight="bold" fill="#FFFFFF">สำเนาบัตรประจำตัวประชาชน (ตัวอย่าง)</text>
  <rect x="44" y="106" width="130" height="160" rx="10" fill="#E2E8F0" stroke="#64748B" stroke-width="2"/>
  <text x="109" y="192" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#475569">รูปถ่าย</text>
  <text x="200" y="130" font-family="sans-serif" font-size="18" font-weight="bold" fill="#0F172A">เลขประจำตัวประชาชน: 1-5099-00123-45-6</text>
  <text x="200" y="168" font-family="sans-serif" font-size="18" fill="#1E293B">ชื่อตัวและชื่อสกุล: นาย อุ่น ใจดี</text>
  <text x="200" y="204" font-family="sans-serif" font-size="16" fill="#334155">เกิดวันที่: 12 มกราคม 2520</text>
  <text x="200" y="240" font-family="sans-serif" font-size="16" fill="#334155">ที่อยู่: 123 หมู่ 8 ต.หนองหาร อ.สันทราย จ.เชียงใหม่</text>
  <text x="300" y="325" text-anchor="middle" font-family="sans-serif" font-size="20" font-weight="bold" fill="#DC2626" transform="rotate(-8 300 325)">รับรองสำเนาถูกต้อง (สำหรับขอจัดงานศพเท่านั้น)</text>
</svg>
`)}`;

export const SAMPLE_DEATH_CERT_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420">
  <rect width="600" height="420" rx="12" fill="#FFFBEB" stroke="#B45309" stroke-width="3"/>
  <text x="300" y="54" text-anchor="middle" font-family="sans-serif" font-size="24" font-weight="bold" fill="#78350F">มรณบัตร (สำเนาเอกสารสำคัญ)</text>
  <line x1="60" y1="74" x2="540" y2="74" stroke="#D97706" stroke-width="2"/>
  <text x="60" y="120" font-family="sans-serif" font-size="18" fill="#1E293B">ผู้ตาย: นาย สมชาย ใจดี</text>
  <text x="60" y="156" font-family="sans-serif" font-size="18" fill="#1E293B">เลขประจำตัวประชาชน: 1-5099-00011-22-3</text>
  <text x="60" y="192" font-family="sans-serif" font-size="18" fill="#1E293B">เพศ: ชาย | อายุ: 74 ปี</text>
  <text x="60" y="228" font-family="sans-serif" font-size="18" fill="#1E293B">ถึงแก่กรรมเมื่อ: 2 สิงหาคม 2569</text>
  <text x="60" y="264" font-family="sans-serif" font-size="18" fill="#1E293B">สถานที่เสียชีวิต: โรงพยาบาลสันทราย จ.เชียงใหม่</text>
  <rect x="60" y="300" width="480" height="70" rx="8" fill="#FEF3C7" stroke="#F59E0B"/>
  <text x="300" y="342" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="bold" fill="#92400E">เอกสารตรวจสอบแล้วโดยระบบวิสาหกิจชุมชนบ้านวิเวก</text>
</svg>
`)}`;

export const SAMPLE_SLIP_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="420" height="520" viewBox="0 0 420 520">
  <rect width="420" height="520" rx="16" fill="#ECFDF5" stroke="#10B981" stroke-width="3"/>
  <circle cx="210" cy="64" r="28" fill="#10B981"/>
  <text x="210" y="72" text-anchor="middle" font-family="sans-serif" font-size="26" font-weight="bold" fill="#FFFFFF">✓</text>
  <text x="210" y="122" text-anchor="middle" font-family="sans-serif" font-size="22" font-weight="bold" fill="#065F46">หลักฐานการรับชำระเงินสำเร็จ</text>
  <text x="210" y="150" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#047857">ศูนย์บริการวิสาหกิจชุมชนบ้านวิเวก</text>
  <line x1="40" y1="175" x2="380" y2="175" stroke="#A7F3D0" stroke-width="2"/>
  <text x="45" y="215" font-family="sans-serif" font-size="16" fill="#064E3B">รหัสอ้างอิง: SLIP-20260802-0915</text>
  <text x="45" y="250" font-family="sans-serif" font-size="16" fill="#064E3B">ผู้ชำระเงิน: นาย อุ่น ใจดี</text>
  <text x="45" y="285" font-family="sans-serif" font-size="16" fill="#064E3B">ผู้รับเงิน: วิสาหกิจชุมชนบ้านวิเวก</text>
  <text x="45" y="325" font-family="sans-serif" font-size="20" font-weight="bold" fill="#047857">จำนวนเงิน: 18,750.00 บาท</text>
  <text x="45" y="365" font-family="sans-serif" font-size="15" fill="#065F46">วันที่รับชำระ: 2 สิงหาคม 2569 เวลา 09:15 น.</text>
  <rect x="45" y="405" width="330" height="65" rx="8" fill="#D1FAE5"/>
  <text x="210" y="443" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="bold" fill="#065F46">ตรวจสอบและรับชำระ ณ ศูนย์บริการเรียบร้อย</text>
</svg>
`)}`;

export const SAMPLE_ONSITE_PHOTO_URL = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="500" height="340" viewBox="0 0 500 340">
  <rect width="500" height="340" rx="14" fill="#F5EFE6" stroke="#B5945B" stroke-width="3"/>
  <rect x="30" y="30" width="440" height="210" rx="10" fill="#E2CCA8"/>
  <text x="250" y="130" text-anchor="middle" font-family="sans-serif" font-size="22" font-weight="bold" fill="#4A4946">ภาพถ่ายหน้างานจริง: วัดวิเวกวนาราม</text>
  <text x="250" y="165" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#57534E">จัดเตรียมโต๊ะ เก้าอี้ เต็นท์ และระบบไฟฟ้าเรียบร้อย</text>
  <text x="40" y="280" font-family="sans-serif" font-size="16" font-weight="bold" fill="#2E5A44">✓ ฝ่ายสถานที่ รายงานความคืบหน้า</text>
  <text x="40" y="308" font-family="sans-serif" font-size="14" fill="#78716C">บันทึกภาพเมื่อ: 2 สิงหาคม 2569 เวลา 10:45 น.</text>
</svg>
`)}`;

// สร้างชุดงานมอบหมาย 11 รายการมาตรฐานสำหรับแต่ละใบคำขอ
export const createDefaultAssignmentsForBooking = (booking) => {
  const venueLabel = `${booking.locationName} (${booking.pavilionName})`;
  const addonNotes = booking.addons && booking.addons.length > 0
    ? booking.addons.map(a => `+ ${a.name} (${a.qty} ${a.unit})`).join(', ')
    : 'ตามมาตรฐานแพ็กเกจ';

  return [
    {
      id: `${booking.id}-TSK-01`,
      bookingId: booking.id,
      seq: 1,
      title: 'จองศาลา / จัดเตรียมสถานที่และอุปกรณ์',
      department: 'ฝ่ายสถานที่',
      staffId: 'STF-01',
      staffName: 'ป้าฝ้าย ใจดี',
      staffPhone: '081-222-3344',
      workDate: booking.startDate,
      workTime: '08:30 น.',
      locationDisplay: venueLabel,
      note: `รองรับแขก ${booking.totalGuests} คน | ${addonNotes}`,
      status: booking.status === 'กำลังดำเนินงาน' || booking.status === 'เสร็จสิ้น' ? 'กำลังดำเนินงาน' : 'ยังไม่ได้มอบหมาย',
      currentStep: booking.status === 'กำลังดำเนินงาน' ? 2 : booking.status === 'เสร็จสิ้น' ? 4 : 1,
      checklist: [
        { id: 'chk-1', label: 'ทำความสะอาดศาลาและบริเวณโดยรอบ', isChecked: booking.status !== 'รออนุมัติ', completedTime: '09:30 น.' },
        { id: 'chk-2', label: 'จัดโต๊ะ เก้าอี้รับรองแขก และอาสนะสงฆ์', isChecked: booking.status !== 'รออนุมัติ', completedTime: '09:55 น.' },
        { id: 'chk-3', label: 'ติดตั้งเต็นท์และพัดลมอำนวยความสะดวก', isChecked: booking.status !== 'รออนุมัติ', completedTime: '10:30 น.' },
        { id: 'chk-4', label: 'ตรวจสอบความเรียบร้อยและส่งมอบพื้นที่', isChecked: booking.status === 'เสร็จสิ้น', completedTime: booking.status === 'เสร็จสิ้น' ? '11:00 น.' : '' }
      ],
      photos: booking.status !== 'รออนุมัติ' ? [SAMPLE_ONSITE_PHOTO_URL] : [],
      fieldNote: booking.status !== 'รออนุมัติ' ? 'จัดเตรียมเต็นท์และเก้าอี้ครบตามจำนวนแขกเรียบร้อยแล้ว' : '',
      completedAt: booking.status === 'เสร็จสิ้น' ? '2 ส.ค. 2569 11:00 น.' : null
    },
    {
      id: `${booking.id}-TSK-02`,
      bookingId: booking.id,
      seq: 2,
      title: 'เคลื่อนย้ายร่างจากโรงพยาบาล',
      department: 'ฝ่ายยานพาหนะ',
      staffId: 'STF-07',
      staffName: 'ลุงมี เดินทาง',
      staffPhone: '085-444-5566',
      workDate: booking.startDate,
      workTime: '09:00 น.',
      locationDisplay: venueLabel,
      note: `รับร่างจาก ${booking.deceased.placeOfDeath || 'โรงพยาบาล'} มายัง ${venueLabel}`,
      status: booking.status === 'กำลังดำเนินงาน' || booking.status === 'เสร็จสิ้น' ? 'เสร็จสิ้น' : 'ยังไม่ได้มอบหมาย',
      currentStep: booking.status === 'กำลังดำเนินงาน' || booking.status === 'เสร็จสิ้น' ? 4 : 1,
      checklist: [
        { id: 'chk-1', label: 'เตรียมรถรับร่างพร้อมพระสงฆ์ 1 รูป และเจ้าหน้าที่ 2 ท่าน', isChecked: booking.status !== 'รออนุมัติ', completedTime: '09:00 น.' },
        { id: 'chk-2', label: 'เคลื่อนย้ายร่างถึงศาลาบำเพ็ญกุศลอย่างปลอดภัย', isChecked: booking.status !== 'รออนุมัติ', completedTime: '10:15 น.' }
      ],
      photos: booking.status !== 'รออนุมัติ' ? [SAMPLE_ONSITE_PHOTO_URL] : [],
      fieldNote: 'เคลื่อนย้ายร่างถึงศาลาเรียบร้อย',
      completedAt: booking.status !== 'รออนุมัติ' ? '2 ส.ค. 2569 10:15 น.' : null
    },
    {
      id: `${booking.id}-TSK-03`,
      bookingId: booking.id,
      seq: 3,
      title: 'เตรียมหีบศพ โลงเย็น และปราสาทศพ',
      department: 'ฝ่ายหีบศพและอุปกรณ์',
      staffId: 'STF-08',
      staffName: 'ลุงแก้ว บุญเรือง',
      staffPhone: '087-666-7788',
      workDate: booking.startDate,
      workTime: '10:00 น.',
      locationDisplay: venueLabel,
      note: `หีบศพมาตรฐาน + โลงเย็น + ปราสาทเช่า`,
      status: booking.status === 'กำลังดำเนินงาน' || booking.status === 'เสร็จสิ้น' ? 'เสร็จสิ้น' : 'ยังไม่ได้มอบหมาย',
      currentStep: booking.status === 'กำลังดำเนินงาน' || booking.status === 'เสร็จสิ้น' ? 4 : 1,
      checklist: [
        { id: 'chk-1', label: 'จัดเตรียมหีบศพ (ฝ้าย 3 เส้น + ผ้ารอง + ผ้าห่อศพ) และโลงเย็น', isChecked: booking.status !== 'รออนุมัติ', completedTime: '10:20 น.' },
        { id: 'chk-2', label: 'ประกอบพิธีอาบน้ำศพและบรรจุร่างลงหีบ', isChecked: booking.status !== 'รออนุมัติ', completedTime: '11:30 น.' },
        { id: 'chk-3', label: 'ติดตั้งปราสาทศพและล้อลากสำหรับขบวนแห่', isChecked: booking.status !== 'รออนุมัติ', completedTime: '12:00 น.' }
      ],
      photos: booking.status !== 'รออนุมัติ' ? [SAMPLE_ONSITE_PHOTO_URL] : [],
      fieldNote: 'ตั้งหีบศพและโลงเย็นเรียบร้อย',
      completedAt: booking.status !== 'รออนุมัติ' ? '2 ส.ค. 2569 12:00 น.' : null
    },
    {
      id: `${booking.id}-TSK-04`,
      bookingId: booking.id,
      seq: 4,
      title: 'จัดดอกไม้หน้าหีบศพ กรอบรูป และตกแต่งสถานที่',
      department: 'ฝ่ายดอกไม้และตกแต่ง',
      staffId: 'STF-05',
      staffName: 'ลุงคำ งามตา',
      staffPhone: '082-333-4455',
      workDate: booking.startDate,
      workTime: '13:00 น.',
      locationDisplay: venueLabel,
      note: `ตกแต่งดอกไม้หน้าศพและกรอบรูปผู้วายชนม์`,
      status: booking.status === 'เสร็จสิ้น' ? 'เสร็จสิ้น' : booking.status === 'กำลังดำเนินงาน' ? 'มอบหมายแล้ว' : 'ยังไม่ได้มอบหมาย',
      currentStep: booking.status === 'เสร็จสิ้น' ? 4 : 1,
      checklist: [
        { id: 'chk-1', label: 'จัดซุ้มดอกไม้ประดับหน้าหีบศพและปราสาท', isChecked: booking.status === 'เสร็จสิ้น', completedTime: '' },
        { id: 'chk-2', label: 'ตั้งกรอบรูปหน้าศพและจุดวางพวงหรีด', isChecked: booking.status === 'เสร็จสิ้น', completedTime: '' },
        { id: 'chk-3', label: 'ตรวจสอบความสวยงามและฉีดพรมน้ำดอกไม้', isChecked: booking.status === 'เสร็จสิ้น', completedTime: '' }
      ],
      photos: booking.status === 'เสร็จสิ้น' ? [SAMPLE_ONSITE_PHOTO_URL] : [],
      fieldNote: '',
      completedAt: booking.status === 'เสร็จสิ้น' ? '2 ส.ค. 2569 15:30 น.' : null
    },
    {
      id: `${booking.id}-TSK-05`,
      bookingId: booking.id,
      seq: 5,
      title: 'ติดตั้งเครื่องเสียงและระบบไฟฟ้าส่องสว่าง',
      department: 'ฝ่ายเครื่องเสียงและไฟฟ้า',
      staffId: 'STF-06',
      staffName: 'ช่างเอก เสียงใส',
      staffPhone: '083-777-8899',
      workDate: booking.startDate,
      workTime: '11:00 น.',
      locationDisplay: venueLabel,
      note: 'ชุดเครื่องเสียงศาลา + ไฟส่องสว่าง + รถเครื่องเสียงวันเคลื่อนขบวน',
      status: booking.status === 'เสร็จสิ้น' ? 'เสร็จสิ้น' : booking.status === 'กำลังดำเนินงาน' ? 'กำลังดำเนินงาน' : 'ยังไม่ได้มอบหมาย',
      currentStep: booking.status === 'เสร็จสิ้น' ? 4 : booking.status === 'กำลังดำเนินงาน' ? 2 : 1,
      checklist: [
        { id: 'chk-1', label: 'เดินสายไฟส่องสว่างและจุดปลั๊กพ่วงปลอดภัย', isChecked: booking.status !== 'รออนุมัติ', completedTime: '10:45 น.' },
        { id: 'chk-2', label: 'ติดตั้งไมโครโฟนสำหรับพระสงฆ์และพิธีกร', isChecked: booking.status === 'เสร็จสิ้น', completedTime: '' },
        { id: 'chk-3', label: 'เตรียมรถเครื่องเสียงสำหรับขบวนแห่วันฌาปนกิจ', isChecked: booking.status === 'เสร็จสิ้น', completedTime: '' }
      ],
      photos: booking.status === 'เสร็จสิ้น' ? [SAMPLE_ONSITE_PHOTO_URL] : [],
      fieldNote: '',
      completedAt: booking.status === 'เสร็จสิ้น' ? '5 ส.ค. 2569 14:00 น.' : null
    },
    {
      id: `${booking.id}-TSK-06`,
      bookingId: booking.id,
      seq: 6,
      title: 'จัดเตรียมอาหาร เครื่องดื่ม น้ำแข็ง และเบรก',
      department: 'ฝ่ายอาหารและเครื่องดื่ม',
      staffId: 'STF-03',
      staffName: 'ป้านุ่น อิ่มบุญ',
      staffPhone: '086-555-6677',
      workDate: booking.startDate,
      workTime: '16:00 น.',
      locationDisplay: venueLabel,
      note: `ดูแลน้ำดื่ม เบรกทุกคืน และอาหารกลางวันวันเผา (แขก ${booking.totalGuests} คน)`,
      status: booking.status === 'เสร็จสิ้น' ? 'เสร็จสิ้น' : booking.status === 'กำลังดำเนินงาน' ? 'มอบหมายแล้ว' : 'ยังไม่ได้มอบหมาย',
      currentStep: booking.status === 'เสร็จสิ้น' ? 4 : 1,
      checklist: [
        { id: 'chk-1', label: 'จัดส่งน้ำดื่มและน้ำแข็งประจำศาลาทุกวัน', isChecked: booking.status === 'เสร็จสิ้น', completedTime: '' },
        { id: 'chk-2', label: 'จัดชุดอาหารว่าง (เบรก) บริการแขกในคืนสวดอภิธรรม', isChecked: booking.status === 'เสร็จสิ้น', completedTime: '' },
        { id: 'chk-3', label: 'จัดเตรียมภัตตาหารถวายพระสงฆ์และอาหารกลางวันเลี้ยงแขกวันเผา', isChecked: booking.status === 'เสร็จสิ้น', completedTime: '' }
      ],
      photos: booking.status === 'เสร็จสิ้น' ? [SAMPLE_ONSITE_PHOTO_URL] : [],
      fieldNote: '',
      completedAt: booking.status === 'เสร็จสิ้น' ? '5 ส.ค. 2569 13:00 น.' : null
    },
    {
      id: `${booking.id}-TSK-07`,
      bookingId: booking.id,
      seq: 7,
      title: 'จัดเตรียมผ้าบังสุกุล สังฆทาน และของชำร่วย',
      department: 'ฝ่ายหัตถกรรมและของชำร่วย',
      staffId: 'STF-02',
      staffName: 'ป้าไหม สุขใจ',
      staffPhone: '089-111-2233',
      workDate: booking.startDate,
      workTime: '15:00 น.',
      locationDisplay: venueLabel,
      note: 'ชุดสังฆทาน ผ้าไตรบังสุกุล ดอกไม้จันทน์ และของชำร่วย',
      status: booking.status === 'เสร็จสิ้น' ? 'เสร็จสิ้น' : booking.status === 'กำลังดำเนินงาน' ? 'มอบหมายแล้ว' : 'ยังไม่ได้มอบหมาย',
      currentStep: booking.status === 'เสร็จสิ้น' ? 4 : 1,
      checklist: [
        { id: 'chk-1', label: 'จัดเตรียมผ้าบังสุกุล ผ้าไตร และชุดสังฆทานประจำคืน', isChecked: booking.status === 'เสร็จสิ้น', completedTime: '' },
        { id: 'chk-2', label: 'จัดเตรียมพานดอกไม้จันทน์และของชำร่วยวันฌาปนกิจ', isChecked: booking.status === 'เสร็จสิ้น', completedTime: '' }
      ],
      photos: booking.status === 'เสร็จสิ้น' ? [SAMPLE_ONSITE_PHOTO_URL] : [],
      fieldNote: '',
      completedAt: booking.status === 'เสร็จสิ้น' ? '5 ส.ค. 2569 15:00 น.' : null
    },
    {
      id: `${booking.id}-TSK-08`,
      bookingId: booking.id,
      seq: 8,
      title: 'ดำเนินพิธีสวดพระอภิธรรม พิธีล้านนา และวันฌาปนกิจ',
      department: 'ฝ่ายพิธีการและศาสนา',
      staffId: 'STF-04',
      staffName: 'ป้าหวาย มงคล',
      staffPhone: '084-888-9900',
      workDate: booking.startDate,
      workTime: '19:00 น.',
      locationDisplay: venueLabel,
      note: `รูปแบบพิธีกรรม: ${booking.ritualName}`,
      status: booking.status === 'เสร็จสิ้น' ? 'เสร็จสิ้น' : booking.status === 'กำลังดำเนินงาน' ? 'มอบหมายแล้ว' : 'ยังไม่ได้มอบหมาย',
      currentStep: booking.status === 'เสร็จสิ้น' ? 4 : 1,
      checklist: [
        { id: 'chk-1', label: 'จัดเตรียมขันตั้ง ขันพระพุทธ ขันขอศีล สวยดอก และสะตวงถอน', isChecked: booking.status === 'เสร็จสิ้น', completedTime: '' },
        { id: 'chk-2', label: 'นิมนต์พระสงฆ์และดำเนินพิธีสวดพระอภิธรรมครบทุกคืน', isChecked: booking.status === 'เสร็จสิ้น', completedTime: '' },
        { id: 'chk-3', label: 'ดำเนินพิธีเคลื่อนขบวน เวียนเมรุ ฌาปนกิจ และพิธีเก็บอัฐิ', isChecked: booking.status === 'เสร็จสิ้น', completedTime: '' }
      ],
      photos: booking.status === 'เสร็จสิ้น' ? [SAMPLE_ONSITE_PHOTO_URL] : [],
      fieldNote: '',
      completedAt: booking.status === 'เสร็จสิ้น' ? '6 ส.ค. 2569 09:00 น.' : null
    }
  ].map(task => ({
    ...task,
    bookingCode: booking.code || booking.id,
    deceasedName: `${booking.deceased?.prefix || ''}${booking.deceased?.fullName || ''}`.trim(),
    hostName: `${booking.contact?.prefix || ''}${booking.contact?.fullName || ''}`.trim()
  }));
};

// ข้อมูลการจองตัวอย่าง (เพื่อให้เปิดเว็บมาทดสอบทั้ง 3 ฝั่งได้ทันที)
export const INITIAL_BOOKINGS = [
  {
    id: 'BW-00001',
    reqNumber: 'BW-00001',
    code: 'A001',
    createdAt: '2026-08-02T08:30:00',
    packageId: 'PKG-03',
    packageName: 'แพ็กเกจมาตรฐาน',
    packagePrice: 75000,
    durationDays: 4,
    durationNights: 3,
    baseGuests: 150,
    extraGuests: 0,
    totalGuests: 150,
    ritualId: 'RITUAL-02',
    ritualName: 'แบบที่ 2 ล้านนาแบบย่อ',
    ritualUpgradePrice: 0,
    locationId: 'LOC-01',
    locationName: 'วัดวิเวกวนาราม',
    pavilionId: 'PAV-01',
    pavilionName: 'ศาลา 1 (ศาลาใหญ่)',
    startDate: '2026-08-03',
    cremationDate: '2026-08-05',
    boneCollectionDate: '2026-08-06',
    appointmentDate: '2026-08-02',
    appointmentTime: '09:00 - 10:00 น.',
    paymentOption: 'INSTALLMENT', // 'FULL' | 'INSTALLMENT'
    installment1Percent: 25,
    installment1Amount: 18750,
    installment1Paid: true,
    installment1PaidAt: '2 สิงหาคม 2569 09:15 น.',
    installment1Slip: SAMPLE_SLIP_DATA_URL,
    installment2Amount: 56250,
    installment2Paid: false,
    installment2PaidAt: null,
    installment2Slip: null,
    addons: [],
    addonsTotal: 0,
    netTotal: 75000,
    status: 'กำลังดำเนินงาน', // 'รออนุมัติ' | 'กำลังดำเนินงาน' | 'เสร็จสิ้น'
    contact: {
      prefix: 'นาย',
      fullName: 'อุ่น ใจดี',
      relationship: 'บุตร',
      phone: '081-234-5678',
      backupPhone: '089-876-5432',
      lineId: 'aun_jaidee',
      email: 'aun.jaidee@email.com',
      address: '123 หมู่ 8 บ้านวิเวก',
      subdistrict: 'หนองหาร',
      district: 'สันทราย',
      province: 'เชียงใหม่',
      postalCode: '50290',
      idCardDoc: SAMPLE_ID_CARD_DATA_URL
    },
    deceased: {
      prefix: 'นาย',
      fullName: 'สมชาย ใจดี',
      nationalId: '1-5099-00011-22-3',
      gender: 'ชาย',
      birthDate: '1952-05-15',
      deathDate: '2026-08-02',
      age: 74,
      placeOfDeath: 'โรงพยาบาลสันทราย',
      deathCertDoc: SAMPLE_DEATH_CERT_DATA_URL
    }
  },
  {
    id: 'BW-00002',
    reqNumber: 'BW-00002',
    code: 'A002',
    createdAt: '2026-08-04T10:15:00',
    packageId: 'PKG-01',
    packageName: 'แพ็กเกจเริ่มต้น',
    packagePrice: 25000,
    durationDays: 3,
    durationNights: 2,
    baseGuests: 50,
    extraGuests: 0,
    totalGuests: 50,
    ritualId: 'RITUAL-03',
    ritualName: 'แบบที่ 3 New Normal (พิธีกรรมเรียบง่าย)',
    ritualUpgradePrice: 0,
    locationId: 'LOC-01',
    locationName: 'วัดวิเวกวนาราม',
    pavilionId: 'PAV-02',
    pavilionName: 'ศาลา 2 (ศาลากลางน้ำ)',
    startDate: '2026-08-10',
    cremationDate: '2026-08-12',
    boneCollectionDate: '2026-08-13',
    appointmentDate: '2026-08-09',
    appointmentTime: '10:00 - 11:00 น.',
    paymentOption: 'INSTALLMENT',
    installment1Percent: 25,
    installment1Amount: 6400,
    installment1Paid: false,
    installment1PaidAt: null,
    installment1Slip: null,
    installment2Amount: 19200,
    installment2Paid: false,
    installment2PaidAt: null,
    installment2Slip: null,
    addons: [
      { id: 'SRV-03', name: 'ตั้งเต็นท์เพิ่ม', qty: 1, unit: 'หลัง', price: 300, total: 300 },
      { id: 'SRV-04', name: 'โต๊ะเก้าอี้ (30 ที่นั่ง)', qty: 1, unit: 'ชุด', price: 300, total: 300 }
    ],
    addonsTotal: 600,
    netTotal: 25600,
    status: 'รออนุมัติ',
    contact: {
      prefix: 'นางสาว',
      fullName: 'สมหญิง ใจดี',
      relationship: 'บุตร',
      phone: '082-345-6789',
      backupPhone: '',
      lineId: 'somying_cm',
      email: 'somying@email.com',
      address: '123 หมู่ 4 ต.บ้านบัว',
      subdistrict: 'หนองหาร',
      district: 'สันทราย',
      province: 'เชียงใหม่',
      postalCode: '50290',
      idCardDoc: SAMPLE_ID_CARD_DATA_URL
    },
    deceased: {
      prefix: 'นาย',
      fullName: 'สม ใจดี',
      nationalId: '1-1111-11111-11-1',
      gender: 'ชาย',
      birthDate: '1952-08-15',
      deathDate: '2026-08-08',
      age: 74,
      placeOfDeath: 'โรงพยาบาลมหาราชนครเชียงใหม่',
      deathCertDoc: SAMPLE_DEATH_CERT_DATA_URL
    }
  },
  {
    id: 'BW-00003',
    reqNumber: 'BW-00003',
    code: 'A003',
    createdAt: '2026-07-20T09:00:00',
    packageId: 'PKG-02',
    packageName: 'แพ็กเกจประหยัด',
    packagePrice: 45000,
    durationDays: 3,
    durationNights: 2,
    baseGuests: 100,
    extraGuests: 0,
    totalGuests: 100,
    ritualId: 'RITUAL-03',
    ritualName: 'แบบที่ 3 New Normal (พิธีกรรมเรียบง่าย)',
    ritualUpgradePrice: 0,
    locationId: 'LOC-01',
    locationName: 'วัดวิเวกวนาราม',
    pavilionId: 'PAV-01',
    pavilionName: 'ศาลา 1 (ศาลาใหญ่)',
    startDate: '2026-07-23',
    cremationDate: '2026-07-25',
    boneCollectionDate: '2026-07-26',
    appointmentDate: '2026-07-22',
    appointmentTime: '09:30 - 10:30 น.',
    paymentOption: 'FULL',
    installment1Percent: 100,
    installment1Amount: 45000,
    installment1Paid: true,
    installment1PaidAt: '22 กรกฎาคม 2569 09:45 น.',
    installment1Slip: SAMPLE_SLIP_DATA_URL,
    installment2Amount: 0,
    installment2Paid: true,
    installment2PaidAt: '22 กรกฎาคม 2569 09:45 น.',
    installment2Slip: SAMPLE_SLIP_DATA_URL,
    addons: [],
    addonsTotal: 0,
    netTotal: 45000,
    status: 'เสร็จสิ้น',
    contact: {
      prefix: 'นาย',
      fullName: 'อุ่น บุญมี',
      relationship: 'บุตรชาย',
      phone: '098-765-4321',
      backupPhone: '',
      lineId: 'aun_boonmee',
      email: 'boonmee@email.com',
      address: '89 หมู่ 8 บ้านวิเวก',
      subdistrict: 'หนองหาร',
      district: 'สันทราย',
      province: 'เชียงใหม่',
      postalCode: '50290',
      idCardDoc: SAMPLE_ID_CARD_DATA_URL
    },
    deceased: {
      prefix: 'นาย',
      fullName: 'ทองดี บุญมี',
      nationalId: '3-5014-00234-56-7',
      gender: 'ชาย',
      birthDate: '1945-01-10',
      deathDate: '2026-07-22',
      age: 81,
      placeOfDeath: 'บ้านพักต.หนองหาร',
      deathCertDoc: SAMPLE_DEATH_CERT_DATA_URL
    }
  }
];

export const PORTFOLIO_ITEMS = [
  {
    id: 'PF-01',
    title: 'งานบำเพ็ญกุศลและพิธีล้านนาเต็มรูปแบบ วัดวิเวกวนาราม',
    category: 'แพ็กเกจพิเศษ',
    date: 'กรกฎาคม 2569',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80',
    description: 'จัดซุ้มดอกไม้สดขาว-ทอง พร้อมปราสาทศพแบบล้านนาและขบวนแห่เวียนเมรุอย่างสมเกียรติ'
  },
  {
    id: 'PF-02',
    title: 'การจัดซุ้มดอกไม้สดหน้าหีบศพและนิทรรศการรำลึก',
    category: 'แพ็กเกจมาตรฐาน',
    date: 'มิถุนายน 2569',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=900&q=80',
    description: 'งานจัดดอกไม้สดโทนสุภาพอบอุ่น พร้อมโต๊ะหมู่บูชาและเครื่องสักการะล้านนาครบชุด'
  },
  {
    id: 'PF-03',
    title: 'พิธีสวดพระอภิธรรมและตานขันข้าวตามจารีตล้านนา',
    category: 'แพ็กเกจมาตรฐาน',
    date: 'พฤษภาคม 2569',
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=900&q=80',
    description: 'ดูแลโดยมัคนายกและครูบาอาจารย์ประจำชุมชน ครบถ้วนตามประเพณี'
  },
  {
    id: 'PF-04',
    title: 'บริการจัดเตรียมสถานที่ เต็นท์ และโรงครัวชุมชนบ้านวิเวก',
    category: 'แพ็กเกจประหยัด',
    date: 'เมษายน 2569',
    image: 'https://images.unsplash.com/photo-1464692805480-a69dfaafdb0d?auto=format&fit=crop&w=900&q=80',
    description: 'ทีมแม่ครัวและฝ่ายสถานที่คนในชุมชน ดูแลอาหารว่างและภัตตาหารอย่างสะอาดถูกหลักอนามัย'
  },
  {
    id: 'PF-05',
    title: 'ขบวนล้อลากเคลื่อนศพและปราสาทล้านนาโบราณ',
    category: 'แพ็กเกจพิเศษ',
    date: 'มีนาคม 2569',
    image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=900&q=80',
    description: 'ขบวนแห่ปราสาทศพสู่สุสานบ้านวิเวก พร้อมรถเครื่องเสียงและพระสงฆ์นำขบวน'
  },
  {
    id: 'PF-06',
    title: 'พิธีฌาปนกิจและเก็บอัฐิแบบ New Normal เรียบง่ายอบอุ่น',
    category: 'แพ็กเกจเริ่มต้น',
    date: 'กุมภาพันธ์ 2569',
    image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=900&q=80',
    description: 'เหมาะสำหรับครอบครัวขนาดเล็กที่ต้องการความเรียบง่าย ประหยัด และถูกต้องตามประเพณี'
  }
];
