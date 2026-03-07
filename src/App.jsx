import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient.js';

const PAGES = {
  DAILY: 'daily',
  SUMMARY: 'summary',
  CALENDAR: 'calendar',
  MEDIA: 'media',
};

function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/* ── SVG Icons ─────────────────────────────────────────── */
const IconEdit = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const IconTrash = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const IconCopy = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);
const IconClipboard = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);
const IconCalendar = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const IconPhoto = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const IconMenuAlt = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);
const IconLogout = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);
const IconClock = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
  </svg>
);

const NAV_ITEMS = [
  { page: PAGES.DAILY,    label: 'สรุปงานรายวัน', Icon: IconClipboard },
  { page: PAGES.SUMMARY,  label: 'ดูสรุปรายวัน',  Icon: IconEdit },
  { page: PAGES.CALENDAR, label: 'ปฏิทิน',         Icon: IconCalendar },
  { page: PAGES.MEDIA,    label: 'บันทึกภาพ/วิดีโอ', Icon: IconPhoto },
];

function Layout({ currentPage, setCurrentPage, onLogout }) {
  const now = useNow();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const formattedTime = new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'short', timeStyle: 'medium',
  }).format(now);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f0f2f5' }}>

      {/* ── Top Navbar ─────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 h-14 flex items-center px-4 shadow-md relative"
        style={{ background: 'linear-gradient(90deg,#1e3a5f 0%,#1a5276 100%)' }}>

        {/* Left: Hamburger */}
        {!sidebarOpen && (
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-blue-200 hover:text-white hover:bg-white/10 mr-3 focus:outline-none relative z-50"
          >
            <IconMenuAlt />
          </button>
        )}

        {/* Right: Clock + Logout */}
        <div className="ml-auto flex items-center gap-4 relative z-50">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-blue-200">
            <IconClock />
            <span>{formattedTime}</span>
          </div>
          <button
            type="button"
            onClick={() => { if (window.confirm('ต้องการออกจากระบบหรือไม่?')) onLogout?.(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-blue-100 border border-blue-500/50
              hover:bg-white/10 hover:text-white transition focus:outline-none"
          >
            <IconLogout />
            <span className="hidden sm:inline">ออกจากระบบ</span>
          </button>
        </div>

        {/* Center: Logo block */}
        <div className="absolute inset-x-0 flex justify-center pointer-events-none">
          <div className="flex items-center gap-2 select-none pointer-events-auto">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow"
              style={{ background: 'rgb(46, 134, 193)' }}
            >
              DR
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-white leading-none tracking-wide">Daily Report</p>
              <p className="text-[10px] text-blue-300 mt-0.5">ระบบสรุปงานรายวัน</p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Sidebar backdrop ─────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 pt-14">

        {/* ── Sidebar ─────────────────────────────────────── */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-60 pt-14 flex flex-col
          shadow-xl transition-transform duration-200 ease-in-out
          ${ sidebarOpen ? 'translate-x-0' : '-translate-x-full' }`}
          style={{ background: '#1a2943' }}>

          {/* User badge */}
          <div className="px-4 py-4 border-b flex items-center gap-3" style={{ borderColor: '#243556' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
              style={{ background: '#2e86c1' }}>N</div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">Natthawut</p>
              <p className="text-[10px] text-blue-400">Administrator</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-blue-500">เมนูหลัก</p>
            {NAV_ITEMS.map(({ page, label, Icon }) => {
              const active = currentPage === page;
              return (
                <button key={page} type="button"
                  onClick={() => { setCurrentPage(page); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition font-medium ${
                    active
                      ? 'text-white shadow-md'
                      : 'text-blue-200 hover:bg-white/8 hover:text-white'
                  }`}
                  style={active ? { background: '#2e86c1' } : {}}
                >
                  <span className={active ? 'text-white' : 'text-blue-400'}><Icon /></span>
                  {label}
                </button>
              );
            })}
          </nav>

          <div className="px-4 py-3 border-t text-[10px] text-blue-600" style={{ borderColor: '#243556' }}>
            © Private Daily Report System
          </div>
        </aside>

        {/* ── Main ────────────────────────────────────────── */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 min-w-0">
          {currentPage === PAGES.DAILY    && <DailyPage now={now} />}
          {currentPage === PAGES.SUMMARY  && <SummaryPage />}
          {currentPage === PAGES.CALENDAR && <CalendarPage />}
          {currentPage === PAGES.MEDIA    && <MediaPage />}
        </main>
      </div>
    </div>
  );
}

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (username.trim() === 'Natthawut' && password === 'Report@me') {
      onLogin?.();
    } else {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg,#1e3a5f 0%,#1a5276 60%,#2e86c1 100%)' }}>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header band */}
        <div className="px-8 py-7 text-center" style={{ background: '#1e3a5f' }}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3 shadow-lg"
            style={{ background: '#2e86c1' }}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide">Daily Report</h1>
          <p className="text-xs text-blue-300 mt-1">ระบบสรุปงานรายวัน — เข้าสู่ระบบ</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">ชื่อผู้ใช้</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-slate-50
                  focus:outline-none focus:ring-2 focus:border-transparent transition"
                style={{ '--tw-ring-color': '#2e86c1' }}
                placeholder="กรอกชื่อผู้ใช้"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">รหัสผ่าน</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input type={showPass ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-gray-200 text-sm bg-slate-50
                  focus:outline-none focus:ring-2 focus:border-transparent transition"
                placeholder="กรอกรหัสผ่าน"
              />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600">
                {showPass
                  ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                }
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-red-700 bg-red-50 border border-red-200">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <button type="submit"
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white shadow-md
              hover:opacity-90 active:scale-[.98] transition focus:outline-none"
            style={{ background: 'linear-gradient(90deg,#1e3a5f,#2e86c1)' }}>
            เข้าสู่ระบบ
          </button>
        </form>

        <p className="text-center text-[10px] text-slate-400 pb-5">© 2026 Daily Report System</p>
      </div>
    </div>
  );
}

function DailyPage({ now }) {
  const [form, setForm] = useState({
    date: '',
    location: '',
    work: '',
    problems: '',
    cause: '',
    solution: '',
    result: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    if (!supabase) {
      setLoading(false);
      setMessage('ยังไม่ได้ตั้งค่า Supabase (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
      return;
    }

    const { error } = await supabase.from('daily_reports').insert({
      date: form.date || new Date().toISOString().slice(0, 10),
      location: form.location,
      work_today: form.work,
      problems: form.problems,
      cause: form.cause,
      solution: form.solution,
      result: form.result,
    });
    setLoading(false);
    if (error) {
      setMessage('บันทึกไม่สำเร็จ: ' + error.message);
    } else {
      setMessage('บันทึกสำเร็จ');
      setForm({ date: '', location: '', work: '', problems: '', cause: '', solution: '', result: '' });
    }
  };

  const formattedNow = new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'full',
    timeStyle: 'medium',
  }).format(now);

  const inputCls = 'mt-1 block w-full rounded-lg border border-gray-200 bg-slate-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';
  const labelCls = 'block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-0.5';

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <div>
          <h1 className="text-xl font-bold text-slate-800">สรุปงานรายวัน</h1>
          <p className="text-xs text-slate-500 mt-0.5">{formattedNow}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-white shadow-sm self-start"
          style={{ background: '#1e3a5f' }}>
          <IconClipboard /> บันทึกรายงาน
        </span>
      </div>

      {/* Card */}
      <section className="bg-white rounded-xl shadow border border-gray-100">
        {/* Card header */}
        <div className="px-5 sm:px-7 py-4 border-b border-gray-100 rounded-t-xl"
          style={{ background: 'linear-gradient(90deg,#1e3a5f 0%,#1a5276 100%)' }}>
          <h2 className="text-sm font-semibold text-white">เพิ่มงานวันนี้</h2>
          <p className="text-[11px] text-blue-300 mt-0.5">บันทึกสรุปรายงานการทำงานประจำวันของคุณ</p>
        </div>

        <form onSubmit={handleSubmit} className="px-5 sm:px-7 py-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className={labelCls}>เลือกวันที่</label>
              <input type="date" id="date" value={form.date} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label htmlFor="location" className={labelCls}>สถานที่</label>
              <input type="text" id="location" value={form.location} onChange={handleChange}
                className={inputCls} placeholder="เช่น สำนักงานใหญ่" />
            </div>
          </div>

          {[['work','งานที่ทำวันนี้'],['problems','ปัญหาที่พบ'],['cause','สาเหตุของปัญหา'],['solution','วิธีแก้ปัญหา'],['result','ผล']].map(([id, lbl]) => (
            <div key={id}>
              <label htmlFor={id} className={labelCls}>{lbl}</label>
              <textarea id={id} rows={3} value={form[id]} onChange={handleChange}
                className={inputCls + ' resize-y'} />
            </div>
          ))}

          {message && (
            <p className={`text-xs px-3 py-2 rounded-lg ${
              message.startsWith('บันทึกสำเร็จ')
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>{message}</p>
          )}

          <div className="pt-2 flex flex-col sm:flex-row sm:justify-end gap-2">
            <button type="button"
              onClick={() => setForm({ date:'',location:'',work:'',problems:'',cause:'',solution:'',result:'' })}
              className="px-5 py-2 rounded-lg border border-gray-300 text-sm font-medium text-slate-600
                hover:bg-gray-50 focus:outline-none transition">
              ล้างข้อมูล
            </button>
            <button type="submit" disabled={loading}
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white shadow
                hover:opacity-90 disabled:opacity-60 focus:outline-none transition"
              style={{ background: 'linear-gradient(90deg,#1e3a5f,#2e86c1)' }}>
              {loading ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function SummaryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    date: '',
    location: '',
    work: '',
    problems: '',
    cause: '',
    solution: '',
    result: '',
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState('');
  const [copyItem, setCopyItem] = useState(null);
  const [copyFields, setCopyFields] = useState([]);

  useEffect(() => {
    async function fetchData() {
      if (!supabase) {
        setError('ยังไม่ได้ตั้งค่า Supabase (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      const { data, error } = await supabase
        .from('daily_reports')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        setError('ไม่สามารถดึงข้อมูลได้: ' + error.message);
        setItems([]);
      } else {
        setItems(data || []);
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  const groups = items.reduce((acc, item) => {
    const key = item.date || 'ไม่ทราบวันที่';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const sortedDates = Object.keys(groups).sort((a, b) => {
    if (a === 'ไม่ทราบวันที่') return 1;
    if (b === 'ไม่ทราบวันที่') return -1;
    return new Date(b) - new Date(a);
  });

  const formatThaiDate = (isoDate) => {
    if (!isoDate || isoDate === 'ไม่ทราบวันที่') return 'ไม่ทราบวันที่';
    return new Intl.DateTimeFormat('th-TH', { dateStyle: 'long' }).format(new Date(isoDate));
  };

  const copyText = async (text) => {
    if (!text) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        alert('คัดลอกข้อความแล้ว');
      } else {
        window.prompt('คัดลอกข้อความนี้ด้วยตนเอง:', text);
      }
    } catch (err) {
      console.error('ไม่สามารถคัดลอกได้', err);
      window.prompt('คัดลอกข้อความนี้ด้วยตนเอง:', text);
    }
  };

  const handleCopyDay = (dateKey) => {
    const group = groups[dateKey] || [];
    if (group.length === 0) return;

    const header = `วันที่: ${formatThaiDate(dateKey)} (ทั้งหมด ${group.length} งาน)`;
    const lines = [header, ''];

    group.forEach((item, index) => {
      lines.push(`งานที่ ${index + 1}`);
      lines.push(`สถานที่: ${item.location || '-'}`);
      lines.push(`งานที่ทำวันนี้: ${item.work_today || '-'}`);
      lines.push(`ปัญหาที่พบ: ${item.problems || '-'}`);
      lines.push(`สาเหตุของปัญหา: ${item.cause || '-'}`);
      lines.push(`วิธีแก้ปัญหา: ${item.solution || '-'}`);
      lines.push(`ผล: ${item.result || '-'}`);
      lines.push('');
    });

    copyText(lines.join('\n'));
  };

  const buildMultiCopyText = (item, keys) => {
    if (!keys || keys.length === 0) return '';
    const lines = [];

    // วันที่อยู่บรรทัดแรกเสมอ
    lines.push(formatThaiDate(item.date));

    // ค่าที่เลือกทั้งหมด อยู่รวมกันในบรรทัดถัดไป
    const parts = [];
    keys.forEach((key) => {
      let value = '';
      switch (key) {
        case 'วันที่':
          // ข้ามเพราะใส่ไปแล้วบรรทัดแรก
          break;
        case 'สถานที่':
          value = item.location || '';
          break;
        case 'งาน':
          value = item.work_today || '';
          break;
        case 'ปัญหา':
          value = item.problems || '';
          break;
        case 'สาเหตุ':
          value = item.cause || '';
          break;
        case 'วิธีแก้':
          value = item.solution || '';
          break;
        case 'ผล':
          value = item.result || '';
          break;
        default:
          break;
      }
      if (value) {
        parts.push(value);
      }
    });

    if (parts.length > 0) {
      lines.push(parts.join(' '));
    }

    return lines.join('\n');
  };

  const handleCopyItem = (item) => {
    setCopyItem(item);
    setCopyFields([]);
  };

  const handleCopyChoice = async (key) => {
    if (!copyItem) return;
    const keys =
      key === 'ทั้งหมด'
        ? ['วันที่', 'สถานที่', 'งาน', 'ปัญหา', 'สาเหตุ', 'วิธีแก้', 'ผล']
        : [key];
    const text = buildMultiCopyText(copyItem, keys);
    if (!text) return;
    await copyText(text);
    setCopyItem(null);
  };

  const toggleCopyField = (key) => {
    setCopyFields((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleCopySelected = async () => {
    if (!copyItem) return;
    if (!copyFields.length) return;
    const text = buildMultiCopyText(copyItem, copyFields);
    if (!text) return;
    await copyText(text);
    setCopyItem(null);
  };

  const handleDelete = async (itemId) => {
    if (!supabase) {
      alert('ยังไม่ได้ตั้งค่า Supabase (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
      return;
    }

    const confirmDelete = window.confirm('ต้องการลบรายการนี้ใช่หรือไม่?');
    if (!confirmDelete) return;

    const { error: deleteError } = await supabase
      .from('daily_reports')
      .delete()
      .eq('id', itemId);

    if (deleteError) {
      alert('ลบไม่สำเร็จ: ' + deleteError.message);
    } else {
      setItems((prev) => prev.filter((it) => it.id !== itemId));
      alert('ลบสำเร็จ');
    }
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setEditMessage('');
    setEditForm({
      date: item.date || '',
      location: item.location || '',
      work: item.work_today || '',
      problems: item.problems || '',
      cause: item.cause || '',
      solution: item.solution || '',
      result: item.result || '',
    });
  };

  const handleEditChange = (e) => {
    const { id, value } = e.target;
    setEditForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!supabase) {
      setEditMessage('ยังไม่ได้ตั้งค่า Supabase (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
      return;
    }

    setEditLoading(true);
    setEditMessage('');

    const { error: updateError } = await supabase
      .from('daily_reports')
      .update({
        date: editForm.date || null,
        location: editForm.location,
        work_today: editForm.work,
        problems: editForm.problems,
        cause: editForm.cause,
        solution: editForm.solution,
        result: editForm.result,
      })
      .eq('id', editingItem.id);

    setEditLoading(false);

    if (updateError) {
      setEditMessage('อัปเดตไม่สำเร็จ: ' + updateError.message);
    } else {
      setItems((prev) =>
        prev.map((it) =>
          it.id === editingItem.id
            ? {
                ...it,
                date: editForm.date || it.date,
                location: editForm.location,
                work_today: editForm.work,
                problems: editForm.problems,
                cause: editForm.cause,
                solution: editForm.solution,
                result: editForm.result,
              }
            : it
        )
      );
      setEditingItem(null);
      alert('อัปเดตสำเร็จ');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <div>
          <h1 className="text-xl font-bold text-slate-800">รายการสรุปทั้งหมด</h1>
          <p className="text-xs text-slate-500 mt-0.5">แสดงสรุปงานที่บันทึก แยกตามวันที่</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-white shadow-sm self-start"
          style={{ background: '#1e3a5f' }}>
          <IconEdit /> รายการสรุป
        </span>
      </div>

      {loading && <p className="text-sm text-slate-500">กำลังโหลดข้อมูล...</p>}
      {!loading && error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 py-16 text-center">
          <p className="text-sm text-slate-400">ยังไม่มีข้อมูลสรุปงาน</p>
        </div>
      )}

      {!loading && !error && sortedDates.map((dateKey) => {
        const group = groups[dateKey];
        return (
          <article key={dateKey} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Date header */}
            <header className="px-5 py-3 border-b border-gray-100 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              style={{ background: 'linear-gradient(90deg,#1e3a5f 0%,#1a5276 100%)' }}>
              <div className="flex items-center gap-2">
                <span className="text-blue-300"><IconCalendar /></span>
                <h2 className="text-sm font-semibold text-white">
                  {formatThaiDate(dateKey)}
                  <span className="ml-2 text-xs font-normal text-blue-300">{group.length} งาน</span>
                </h2>
              </div>
              <button type="button" onClick={() => handleCopyDay(dateKey)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-400/50 bg-white/10 px-3 py-1.5
                  text-xs font-medium text-white hover:bg-white/20 focus:outline-none transition whitespace-nowrap">
                <IconCopy /> คัดลอกทั้งวัน
              </button>
            </header>

            <div className="divide-y divide-gray-100">
              {group.map((item) => (
                <div key={item.id} className="px-5 py-4 hover:bg-slate-50 transition">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm mb-3">
                    {[['สถานที่',item.location],['งานที่ทำวันนี้',item.work_today],
                      ['ปัญหาที่พบ',item.problems],['วิธีแก้ปัญหา',item.solution]].map(([lbl,val]) => (
                      <div key={lbl}>
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{lbl}</span>
                        <p className="mt-0.5 text-slate-700 leading-snug">{val || <span className="text-slate-300">—</span>}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 justify-end">
                    <button type="button" onClick={() => openEdit(item)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5
                        text-xs font-medium text-blue-700 hover:bg-blue-100 focus:outline-none transition">
                      <IconEdit /> แก้ไข
                    </button>
                    <button type="button" onClick={() => handleDelete(item.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5
                        text-xs font-medium text-red-600 hover:bg-red-100 focus:outline-none transition">
                      <IconTrash /> ลบ
                    </button>
                    <button type="button" onClick={() => handleCopyItem(item)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5
                        text-xs font-medium text-amber-600 hover:bg-amber-100 focus:outline-none transition">
                      <IconCopy /> คัดลอก
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </article>
        );
      })}

      {/* ── Edit Modal ─── */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between"
              style={{ background: 'linear-gradient(90deg,#1e3a5f,#1a5276)' }}>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2"><IconEdit /> แก้ไขสรุปงาน</h2>
              <button type="button" onClick={() => setEditingItem(null)}
                className="text-blue-300 hover:text-white text-xl leading-none focus:outline-none">×</button>
            </div>
            <form onSubmit={handleEditSubmit} className="px-6 py-5 space-y-3 max-h-[70vh] overflow-y-auto">
              {[['date','วันที่','date'],['location','สถานที่','text']].map(([id,lbl,type]) => (
                <div key={id}>
                  <label htmlFor={id} className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1">{lbl}</label>
                  <input type={type} id={id} value={editForm[id]} onChange={handleEditChange}
                    className="block w-full rounded-lg border border-gray-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              ))}
              {[['work','งานที่ทำวันนี้'],['problems','ปัญหาที่พบ'],['cause','สาเหตุของปัญหา'],['solution','วิธีแก้ปัญหา'],['result','ผล']].map(([id,lbl]) => (
                <div key={id}>
                  <label htmlFor={id} className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1">{lbl}</label>
                  <textarea id={id} rows={2} value={editForm[id]} onChange={handleEditChange}
                    className="block w-full rounded-lg border border-gray-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y" />
                </div>
              ))}
              {editMessage && <p className="text-xs text-red-600">{editMessage}</p>}
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-slate-600 hover:bg-gray-50 focus:outline-none transition">ยกเลิก</button>
                <button type="submit" disabled={editLoading}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white shadow hover:opacity-90 disabled:opacity-60 focus:outline-none transition"
                  style={{ background: 'linear-gradient(90deg,#1e3a5f,#2e86c1)' }}>
                  {editLoading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Copy Modal ─── */}
      {copyItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between"
              style={{ background: 'linear-gradient(90deg,#1e3a5f,#1a5276)' }}>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2"><IconCopy /> คัดลอกข้อความ</h2>
              <button type="button" onClick={() => setCopyItem(null)}
                className="text-blue-300 hover:text-white text-xl leading-none focus:outline-none">×</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-xs text-slate-500">เลือกส่วนที่ต้องการคัดลอก หรือกดคัดลอกทั้งหมด</p>
              <button type="button" onClick={() => handleCopyChoice('ทั้งหมด')}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-2.5
                  text-sm font-medium text-slate-700 hover:bg-gray-50 focus:outline-none transition">
                <IconClipboard /> คัดลอกทั้งหมดของรายการนี้
              </button>
              <div className="grid grid-cols-2 gap-2">
                {[['วันที่','วันที่'],['สถานที่','สถานที่'],['งาน','งานที่ทำวันนี้'],
                  ['ปัญหา','ปัญหาที่พบ'],['สาเหตุ','สาเหตุของปัญหา'],['วิธีแก้','วิธีแก้ปัญหา'],['ผล','ผล']].map(([key,lbl]) => (
                  <label key={key}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer text-xs transition ${
                      copyFields.includes(key)
                        ? 'border-blue-400 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-slate-600 hover:bg-gray-50'
                    }`}>
                    <input type="checkbox" checked={copyFields.includes(key)}
                      onChange={() => toggleCopyField(key)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    {lbl}
                  </label>
                ))}
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setCopyItem(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-slate-600 hover:bg-gray-50 focus:outline-none transition">ยกเลิก</button>
                <button type="button" onClick={handleCopySelected} disabled={!copyFields.length}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white shadow hover:opacity-90 disabled:opacity-50 focus:outline-none transition"
                  style={{ background: '#e67e22' }}>
                  คัดลอกที่เลือก ({copyFields.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [eventsByDate, setEventsByDate] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const formatMonthYearThai = (date) => {
    return new Intl.DateTimeFormat('th-TH', {
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const toISODate = (date) => {
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, '0');
    const d = `${date.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const loadMonthData = async () => {
    if (!supabase) {
      setError('ยังไม่ได้ตั้งค่า Supabase (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
      setEventsByDate({});
      return;
    }

    setLoading(true);
    setError('');

    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startISO = toISODate(monthStart);
    const endISO = toISODate(monthEnd);

    const { data, error } = await supabase
      .from('calendar_notes')
      .select('*')
      .gte('date', startISO)
      .lte('date', endISO)
      .order('date', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      setError('ไม่สามารถดึงข้อมูลปฏิทินได้: ' + error.message);
      setEventsByDate({});
    } else {
      const grouped = (data || []).reduce((acc, item) => {
        const key = item.date || '';
        if (!key) return acc;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {});
      setEventsByDate(grouped);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMonthData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const openAddNote = (isoDate) => {
    setSelectedDate(isoDate);
    setNote('');
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!selectedDate || !note.trim()) return;
    if (!supabase) {
      alert('ยังไม่ได้ตั้งค่า Supabase (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from('calendar_notes')
      .insert({
        date: selectedDate,
        note: note.trim(),
      })
      .select('*')
      .single();

    setSaving(false);

    if (error) {
      alert('บันทึกโน้ตไม่สำเร็จ: ' + error.message);
      return;
    }

    setEventsByDate((prev) => {
      const current = prev[selectedDate] || [];
      return {
        ...prev,
        [selectedDate]: [...current, data],
      };
    });
    setSelectedDate('');
    setNote('');
  };

  const handleDeleteNote = async (noteId, isoDate) => {
    if (!supabase) {
      alert('ยังไม่ได้ตั้งค่า Supabase (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
      return;
    }
    const confirmDelete = window.confirm('ต้องการลบโน้ตนี้ใช่หรือไม่?');
    if (!confirmDelete) return;

    const { error } = await supabase
      .from('calendar_notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      alert('ลบโน้ตไม่สำเร็จ: ' + error.message);
      return;
    }

    setEventsByDate((prev) => {
      const current = prev[isoDate] || [];
      const next = current.filter((item) => item.id !== noteId);
      const copy = { ...prev };
      if (next.length) {
        copy[isoDate] = next;
      } else {
        delete copy[isoDate];
      }
      return copy;
    });
  };

  const daysOfWeek = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

  const buildCalendarCells = () => {
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const leadingEmpty = firstDay.getDay(); // 0 = อา.
    const totalDays = lastDay.getDate();

    const cells = [];
    for (let i = 0; i < leadingEmpty; i += 1) {
      cells.push(null);
    }
    for (let day = 1; day <= totalDays; day += 1) {
      const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const iso = toISODate(dateObj);
      cells.push({ day, iso });
    }
    return cells;
  };

  const cells = buildCalendarCells();

  return (
    <div className="max-w-6xl mx-auto space-y-5">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <div>
          <h1 className="text-xl font-bold text-slate-800">ปฏิทิน</h1>
          <p className="text-xs text-slate-500 mt-0.5">ดูและบันทึกโน้ตสรุปงานในแต่ละวัน</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-white shadow-sm self-start"
          style={{ background: '#1e3a5f' }}>
          <IconCalendar /> ตารางงาน
        </span>
      </div>

      <section className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
        {/* Calendar header */}
        <div className="px-5 py-4 flex items-center justify-between"
          style={{ background: 'linear-gradient(90deg,#1e3a5f 0%,#1a5276 100%)' }}>
          <button type="button" onClick={handlePrevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-full text-blue-200 hover:bg-white/20 text-lg leading-none focus:outline-none transition">
            ‹
          </button>
          <div className="text-base font-semibold text-white">{formatMonthYearThai(currentMonth)}</div>
          <button type="button" onClick={handleNextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-full text-blue-200 hover:bg-white/20 text-lg leading-none focus:outline-none transition">
            ›
          </button>
        </div>

        {error && <p className="px-5 py-2 text-xs text-red-600 bg-red-50">{error}</p>}
        {loading && <p className="px-5 py-2 text-xs text-slate-500">กำลังโหลดข้อมูล...</p>}

        {/* Grid */}
        <div className="grid grid-cols-7 gap-px" style={{ background: '#e5e7eb' }}>
          {daysOfWeek.map((d) => (
            <div key={d} className="py-2 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wide"
              style={{ background: '#f8fafc' }}>
              {d}
            </div>
          ))}
          {cells.map((cell, index) => {
            if (!cell) return <div key={`empty-${index}`} className="h-20 sm:h-24" style={{ background: '#f8fafc' }} />;
            const dayEvents = eventsByDate[cell.iso] || [];
            const isToday = cell.iso === new Date().toISOString().slice(0,10);
            return (
              <button key={cell.iso} type="button" onClick={() => openAddNote(cell.iso)}
                className="relative flex flex-col items-start bg-white h-20 sm:h-24 p-1.5 sm:p-2 text-left
                  hover:bg-blue-50 focus:outline-none focus:z-10 transition">
                <span className={`text-[11px] sm:text-xs font-bold mb-1 w-5 h-5 flex items-center justify-center rounded-full ${
                  isToday ? 'text-white' : 'text-slate-600'
                }`} style={isToday ? { background: '#2e86c1' } : {}}>
                  {cell.day}
                </span>
                <div className="space-y-0.5 w-full overflow-hidden">
                  {dayEvents.slice(0, 2).map((ev) => (
                    <div key={ev.id}
                      className="truncate rounded px-1 py-0.5 text-[10px]"
                      style={{ background: '#eaf4fb', color: '#1a5276' }}>
                      {ev.note || 'บันทึก'}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <p className="text-[10px] text-slate-400">+{dayEvents.length - 2}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Note Modal ─── */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between"
              style={{ background: 'linear-gradient(90deg,#1e3a5f,#1a5276)' }}>
              <div>
                <h2 className="text-sm font-semibold text-white flex items-center gap-2"><IconCalendar /> บันทึกวัน</h2>
                <p className="text-[11px] text-blue-300 mt-0.5">
                  {new Intl.DateTimeFormat('th-TH', { dateStyle: 'full' }).format(new Date(selectedDate))}
                </p>
              </div>
              <button type="button" onClick={() => setSelectedDate('')}
                className="text-blue-300 hover:text-white text-xl leading-none focus:outline-none">×</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {eventsByDate[selectedDate]?.length > 0 && (
                <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-100 divide-y divide-gray-100">
                  {eventsByDate[selectedDate].map((ev) => (
                    <div key={ev.id} className="flex items-center justify-between gap-3 px-3 py-2 text-xs text-slate-700">
                      <span className="flex-1">{ev.note}</span>
                      <button type="button" onClick={() => handleDeleteNote(ev.id, selectedDate)}
                        className="shrink-0 flex items-center gap-1 text-red-500 hover:text-red-700 focus:outline-none">
                        <IconTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={handleSaveNote} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1">โน้ตสรุปงานสั้น ๆ</label>
                  <textarea rows={3} value={note} onChange={e => setNote(e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 bg-slate-50 px-3 py-2 text-sm
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                    placeholder="เช่น งานหลักที่ทำวันนี้ หรือเหตุการณ์สำคัญ" />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setSelectedDate('')}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-slate-600 hover:bg-gray-50 focus:outline-none transition">ยกเลิก</button>
                  <button type="submit" disabled={saving || !note.trim()}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-white shadow hover:opacity-90 disabled:opacity-60 focus:outline-none transition"
                    style={{ background: 'linear-gradient(90deg,#1e3a5f,#2e86c1)' }}>
                    {saving ? 'กำลังบันทึก...' : 'บันทึกโน้ต'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MediaPage() {
  const [uploadDate, setUploadDate] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [files, setFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [filesError, setFilesError] = useState('');

  const currentFolder = uploadDate || 'no-date';

  const loadFiles = async (folder) => {
    if (!supabase) {
      setFilesError('ยังไม่ได้ตั้งค่า Supabase (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
      setFiles([]);
      return;
    }
    setFilesLoading(true);
    setFilesError('');
    const { data, error } = await supabase.storage
      .from('media')
      .list(folder, { limit: 100, sortBy: { column: 'name', order: 'desc' } });

    if (error) {
      console.error('Supabase list files error', error);
      setFilesError('ไม่สามารถดึงรายการไฟล์ได้: ' + (error.message || 'ไม่ทราบสาเหตุ'));
      setFiles([]);
    } else {
      const enhanced = (data || []).map((item) => {
        const path = `${folder}/${item.name}`;
        const { data: urlData } = supabase.storage.from('media').getPublicUrl(path);
        return { ...item, publicUrl: urlData?.publicUrl || '' };
      });
      setFiles(enhanced);
    }
    setFilesLoading(false);
  };

  useEffect(() => {
    loadFiles(currentFolder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadDate]);

  const handleUpload = async () => {
    if (!file) {
      setStatus('กรุณาเลือกไฟล์ก่อน');
      return;
    }
    if (!supabase) {
      setStatus('ยังไม่ได้ตั้งค่า Supabase (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
      return;
    }
    setStatus('กำลังอัปโหลด...');
    // ทำชื่อไฟล์ให้ปลอดภัยสำหรับ Supabase (ตัดช่องว่าง/อักขระพิเศษออก)
    const safeName = file.name
      .normalize('NFKD')
      .replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${uploadDate || 'no-date'}/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage
      .from('media')
      .upload(path, file, { upsert: true, cacheControl: '3600' });
    if (error) {
      console.error('Supabase upload error', error);
      setStatus('อัปโหลดไม่สำเร็จ: ' + (error.message || 'ไม่ทราบสาเหตุ (ดู console เพิ่มเติม)'));
    } else {
      setStatus('อัปโหลดสำเร็จ');
      loadFiles(currentFolder);
    }
  };

  const handleDeleteFile = async (name) => {
    if (!supabase) {
      setStatus('ยังไม่ได้ตั้งค่า Supabase (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
      return;
    }
    const confirmDelete = window.confirm('ต้องการลบไฟล์นี้ใช่หรือไม่?');
    if (!confirmDelete) return;

    const fullPath = `${currentFolder}/${name}`;
    const { error } = await supabase.storage.from('media').remove([fullPath]);
    if (error) {
      console.error('Supabase delete file error', error);
      setStatus('ลบไฟล์ไม่สำเร็จ: ' + (error.message || 'ไม่ทราบสาเหตุ'));
    } else {
      setStatus('ลบไฟล์สำเร็จ');
      setFiles((prev) => prev.filter((f) => f.name !== name));
    }
  };

  const isImageFile = (name) => /\.(png|jpe?g|gif|webp|svg)$/i.test(name || '');

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <div>
          <h1 className="text-xl font-bold text-slate-800">บันทึกภาพและวิดีโอ</h1>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-white shadow-sm self-start"
          style={{ background: '#1e3a5f' }}>
          <IconPhoto /> สื่อและไฟล์
        </span>
      </div>

      {/* Upload card */}
      <section className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100"
          style={{ background: 'linear-gradient(90deg,#1e3a5f 0%,#1a5276 100%)' }}>
          <h2 className="text-sm font-semibold text-white">เพิ่มไฟล์ใหม่</h2>
          <p className="text-[11px] text-blue-300 mt-0.5">รองรับรูปภาพและวิดีโอ</p>
        </div>
        <div className="px-5 sm:px-7 py-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="upload-date"
                className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1">เลือกวันที่</label>
              <input type="date" id="upload-date" value={uploadDate}
                onChange={e => setUploadDate(e.target.value)}
                className="block w-full rounded-lg border border-gray-200 bg-slate-50 px-3 py-2.5 text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
            </div>
            <div>
              <label htmlFor="media-file"
                className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1">เลือกไฟล์</label>
              <input type="file" id="media-file" accept="image/*,video/*"
                onChange={e => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-600 rounded-lg border border-gray-200 bg-slate-50 px-3 py-2
                  file:mr-3 file:rounded-md file:border-0 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white
                  hover:file:opacity-90 focus:outline-none"
                style={{ '--file-bg': '#1e3a5f' }} />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              {status && (
                <p className={`text-xs px-3 py-2 rounded-lg ${
                  status.includes('สำเร็จ')
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : status.startsWith('กำลัง')
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>{status}</p>
              )}
            </div>
            <button type="button" onClick={handleUpload}
              className="shrink-0 px-5 py-2.5 rounded-lg text-sm font-semibold text-white shadow
                hover:opacity-90 focus:outline-none transition"
              style={{ background: 'linear-gradient(90deg,#1e3a5f,#2e86c1)' }}>
              อัปโหลดไฟล์
            </button>
          </div>
        </div>
      </section>

      {/* File list card */}
      <section className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-slate-50">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <IconPhoto />
            ไฟล์ในวันที่: <span className="font-normal text-slate-500">{currentFolder}</span>
          </h3>
          {filesLoading && <span className="text-xs text-slate-400">กำลังโหลด...</span>}
        </div>

        {filesError && <p className="px-5 py-3 text-xs text-red-600">{filesError}</p>}

        {!filesLoading && !filesError && files.length === 0 && (
          <div className="py-14 text-center">
            <p className="text-sm text-slate-400">ยังไม่มีไฟล์ในวันที่นี้</p>
          </div>
        )}

        {!filesLoading && !filesError && files.length > 0 && (
          <div className="divide-y divide-gray-100">
            {files.map((f) => (
              <div key={f.name}
                className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition">
                {/* Thumbnail */}
                {isImageFile(f.name) && f.publicUrl
                  ? <img src={f.publicUrl} alt={f.name}
                      className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0" />
                  : <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: '#eaf4fb' }}>
                      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                }
                <span className="flex-1 min-w-0 text-sm text-slate-700 truncate">{f.name}</span>
                <button type="button" onClick={() => handleDeleteFile(f.name)}
                  className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50
                    px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 focus:outline-none transition">
                  <IconTrash /> ลบ
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState(PAGES.DAILY);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage(PAGES.DAILY);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLoginSuccess} />;
  }

  return (
    <Layout
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      onLogout={handleLogout}
    />
  );
}
