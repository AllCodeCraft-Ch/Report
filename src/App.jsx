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

function Layout({ currentPage, setCurrentPage, onLogout, children }) {
  const now = useNow();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-20">
          {/* Left: Hamburger */}
          <div className="flex items-center">
            {!sidebarOpen && (
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="inline-flex items-center justify-center p-3 rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="sr-only">Toggle navigation</span>
                <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
          </div>

          {/* Center: App Title / Logo */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-sm font-semibold">
                DR
              </div>
              <div>
                <div className="text-sm font-semibold tracking-wide uppercase text-gray-200">Daily Report</div>
                <div className="text-xs text-gray-400">ระบบสรุปงานรายวัน</div>
              </div>
            </div>
          </div>

          {/* Right: Logout */}
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('ต้องการออกจากระบบหรือไม่?')) {
                  onLogout && onLogout();
                }
              }}
              className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              ออก
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 pt-20">
        {/* Sidebar Drawer */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full flex flex-col">
            <div className="px-5 py-4 border-b border-slate-800 hidden md:block">
              <p className="text-xs uppercase tracking-wide text-slate-400">เมนูหลัก</p>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
              <button
                type="button"
                onClick={() => {
                  setCurrentPage(PAGES.DAILY);
                  setSidebarOpen(false);
                }}
                className={`w-full text-left flex items-center px-3 py-2 rounded-md transition ${
                  currentPage === PAGES.DAILY
                    ? 'bg-blue-600 text-white font-medium shadow-sm'
                    : 'text-slate-100 hover:bg-slate-800'
                }`}
              >
                <span className="ml-1">สรุปงานรายวัน</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentPage(PAGES.SUMMARY);
                  setSidebarOpen(false);
                }}
                className={`w-full text-left flex items-center px-3 py-2 rounded-md transition ${
                  currentPage === PAGES.SUMMARY
                    ? 'bg-blue-600 text-white font-medium shadow-sm'
                    : 'text-slate-100 hover:bg-slate-800'
                }`}
              >
                <span className="ml-1">ดูสรุปรายวัน</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentPage(PAGES.CALENDAR);
                  setSidebarOpen(false);
                }}
                className={`w-full text-left flex items-center px-3 py-2 rounded-md transition ${
                  currentPage === PAGES.CALENDAR
                    ? 'bg-blue-600 text-white font-medium shadow-sm'
                    : 'text-slate-100 hover:bg-slate-800'
                }`}
              >
                <span className="ml-1">ปฏิทิน</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentPage(PAGES.MEDIA);
                  setSidebarOpen(false);
                }}
                className={`w-full text-left flex items-center px-3 py-2 rounded-md transition ${
                  currentPage === PAGES.MEDIA
                    ? 'bg-blue-600 text-white font-medium shadow-sm'
                    : 'text-slate-100 hover:bg-slate-800'
                }`}
              >
                <span className="ml-1">บันทึกภาพ/วิดีโอ</span>
              </button>
            </nav>

            <div className="px-5 py-4 border-t border-slate-800 text-xs text-slate-500">
              © 2026 Daily Report
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
          {currentPage === PAGES.DAILY && <DailyPage now={now} />}
          {currentPage === PAGES.SUMMARY && <SummaryPage />}
          {currentPage === PAGES.CALENDAR && <CalendarPage />}
          {currentPage === PAGES.MEDIA && <MediaPage />}
        </main>
      </div>
    </div>
  );
}

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const validUser = username.trim() === 'Natthawut';
    const validPass = password === 'Report@me';

    if (validUser && validPass) {
      onLogin && onLogin();
      setUsername('');
      setPassword('');
    } else {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-md border border-gray-100 p-6 space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-blue-600 text-white text-lg font-semibold">
            DR
          </div>
          <h1 className="text-xl font-semibold text-slate-900">เข้าสู่ระบบ Daily Report</h1>
          <p className="text-xs text-slate-500">กรอกชื่อผู้ใช้และรหัสผ่านเพื่อเข้าใช้งาน</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">ชื่อผู้ใช้</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">รหัสผ่าน</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            เข้าสู่ระบบ
          </button>
        </form>
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <section className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">สรุปงานรายวัน</h1>
        <p className="text-sm text-slate-500">{formattedNow}</p>
      </section>

      <section className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">เพิ่มงานวันนี้</h2>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500">บันทึกสรุปรายงานการทำงานประจำวันของคุณ</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-5 space-y-4 sm:space-y-5">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-slate-700">
              เลือกวันที่
            </label>
            <input
              type="date"
              id="date"
              value={form.date}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-slate-700">
              สถานที่
            </label>
            <input
              type="text"
              id="location"
              value={form.location}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="work" className="block text-sm font-medium text-slate-700">
              งานที่ทำวันนี้
            </label>
            <textarea
              id="work"
              rows="3"
              value={form.work}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-y"
            />
          </div>

          <div>
            <label htmlFor="problems" className="block text-sm font-medium text-slate-700">
              ปัญหาที่พบ
            </label>
            <textarea
              id="problems"
              rows="3"
              value={form.problems}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-y"
            />
          </div>

          <div>
            <label htmlFor="cause" className="block text-sm font-medium text-slate-700">
              สาเหตุของปัญหา
            </label>
            <textarea
              id="cause"
              rows="3"
              value={form.cause}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-y"
            />
          </div>

          <div>
            <label htmlFor="solution" className="block text-sm font-medium text-slate-700">
              วิธีแก้ปัญหา
            </label>
            <textarea
              id="solution"
              rows="3"
              value={form.solution}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-y"
            />
          </div>

          <div>
            <label htmlFor="result" className="block text-sm font-medium text-slate-700">
              ผล
            </label>
            <textarea
              id="result"
              rows="3"
              value={form.result}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-y"
            />
          </div>

          {message && <p className="text-sm text-slate-600">{message}</p>}

          <div className="pt-3 flex flex-col sm:flex-row sm:justify-end gap-3">
            <button
              type="button"
              onClick={() => setForm({ date: '', location: '', work: '', problems: '', cause: '', solution: '', result: '' })}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              ยกเลิกการแก้ไข
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
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
    <div className="max-w-5xl mx-auto space-y-6">
      <section className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">รายการสรุปทั้งหมด</h1>
        <p className="text-sm text-slate-500">
          แสดงสรุปงานที่บันทึก แยกตามวันที่
        </p>
      </section>

      {loading && (
        <p className="text-sm text-slate-500">กำลังโหลดข้อมูล...</p>
      )}

      {!loading && error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="text-sm text-slate-500">ยังไม่มีข้อมูลสรุปงาน</p>
      )}

      {!loading && !error &&
        sortedDates.map((dateKey) => {
          const group = groups[dateKey];
          const header = `${formatThaiDate(dateKey)} (${group.length} งาน)`;
          return (
            <article
              key={dateKey}
              className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
            >
              <header className="px-4 sm:px-6 py-3 border-b border-gray-100 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-slate-50">
                <h2 className="text-sm sm:text-base font-semibold text-slate-900">
                  {header}
                </h2>
                <button
                  type="button"
                  onClick={() => handleCopyDay(dateKey)}
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
                >
                  คัดลอกทั้งวัน
                </button>
              </header>

              <div className="px-4 sm:px-6 py-4 space-y-4 text-sm text-slate-800">
                {group.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-100 rounded-md p-3 sm:p-4 space-y-2"
                  >
                    <div>
                      <span className="font-medium text-slate-700">สถานที่:</span>
                      <span className="ml-1 text-slate-800">{item.location || '-'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">งานที่ทำวันนี้:</span>
                      <span className="ml-1 text-slate-800">{item.work_today || '-'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">ปัญหาที่พบ:</span>
                      <span className="ml-1 text-slate-800">{item.problems || '-'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">วิธีแก้ปัญหา:</span>
                      <span className="ml-1 text-slate-800">{item.solution || '-'}</span>
                    </div>
                    <div className="pt-2 flex flex-wrap gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="inline-flex justify-center rounded-md border border-blue-200 px-3 py-1.5 text-xs sm:text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        แก้ไข
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="inline-flex justify-center rounded-md border border-red-200 px-3 py-1.5 text-xs sm:text-sm font-medium text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        ลบ
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyItem(item)}
                        className="inline-flex justify-center rounded-md border border-amber-200 px-3 py-1.5 text-xs sm:text-sm font-medium text-amber-600 bg-white hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        คัดลอก
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          );
        })}

      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">แก้ไขสรุปงาน</h2>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-slate-500 hover:text-slate-700 text-sm"
              >
                ปิด
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label htmlFor="date" className="block text-xs sm:text-sm font-medium text-slate-700">
                  วันที่
                </label>
                <input
                  type="date"
                  id="date"
                  value={editForm.date}
                  onChange={handleEditChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-xs sm:text-sm font-medium text-slate-700">
                  สถานที่
                </label>
                <input
                  type="text"
                  id="location"
                  value={editForm.location}
                  onChange={handleEditChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="work" className="block text-xs sm:text-sm font-medium text-slate-700">
                  งานที่ทำวันนี้
                </label>
                <textarea
                  id="work"
                  rows="2"
                  value={editForm.work}
                  onChange={handleEditChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-y"
                />
              </div>

              <div>
                <label htmlFor="problems" className="block text-xs sm:text-sm font-medium text-slate-700">
                  ปัญหาที่พบ
                </label>
                <textarea
                  id="problems"
                  rows="2"
                  value={editForm.problems}
                  onChange={handleEditChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-y"
                />
              </div>

              <div>
                <label htmlFor="cause" className="block text-xs sm:text-sm font-medium text-slate-700">
                  สาเหตุของปัญหา
                </label>
                <textarea
                  id="cause"
                  rows="2"
                  value={editForm.cause}
                  onChange={handleEditChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-y"
                />
              </div>

              <div>
                <label htmlFor="solution" className="block text-xs sm:text-sm font-medium text-slate-700">
                  วิธีแก้ปัญหา
                </label>
                <textarea
                  id="solution"
                  rows="2"
                  value={editForm.solution}
                  onChange={handleEditChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-y"
                />
              </div>

              <div>
                <label htmlFor="result" className="block text-xs sm:text-sm font-medium text-slate-700">
                  ผล
                </label>
                <textarea
                  id="result"
                  rows="2"
                  value={editForm.result}
                  onChange={handleEditChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-y"
                />
              </div>

              {editMessage && (
                <p className="text-xs sm:text-sm text-red-600">{editMessage}</p>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="inline-flex justify-center rounded-md bg-blue-600 px-3 py-1.5 text-xs sm:text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {editLoading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {copyItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">คัดลอกข้อความ</h2>
              <button
                type="button"
                onClick={() => setCopyItem(null)}
                className="text-slate-500 hover:text-slate-700 text-sm"
              >
                ปิด
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600">
              เลือกส่วนที่ต้องการคัดลอกจากรายการนี้ สามารถเลือกได้หลายรายการ หรือกดคัดลอกทั้งหมด
            </p>
            <div className="flex flex-col gap-3 text-xs sm:text-sm">
              <button
                type="button"
                onClick={() => handleCopyChoice('ทั้งหมด')}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-3 py-2 font-medium text-slate-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                คัดลอกทั้งหมดของรายการนี้
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'วันที่',
                  'สถานที่',
                  'งาน',
                  'ปัญหา',
                  'สาเหตุ',
                  'วิธีแก้',
                  'ผล',
                ].map((key) => (
                  <label
                    key={key}
                    className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-slate-700 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={copyFields.includes(key)}
                      onChange={() => toggleCopyField(key)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs sm:text-sm">
                      {key === 'งาน'
                        ? 'งานที่ทำวันนี้'
                        : key === 'ปัญหา'
                        ? 'ปัญหาที่พบ'
                        : key === 'สาเหตุ'
                        ? 'สาเหตุของปัญหา'
                        : key === 'วิธีแก้'
                        ? 'วิธีแก้ปัญหา'
                        : key}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setCopyItem(null)}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleCopySelected}
                className="inline-flex justify-center rounded-md bg-amber-500 px-3 py-1.5 text-xs sm:text-sm font-medium text-white shadow-sm hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-70"
                disabled={!copyFields.length}
              >
                คัดลอกที่เลือก
              </button>
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
    <div className="max-w-6xl mx-auto space-y-6">
      <section className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">ปฏิทิน</h1>
        <p className="text-sm text-slate-500">ดูและบันทึกโน้ตสรุปงานในแต่ละวัน</p>
      </section>

      <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white p-1.5 text-slate-600 hover:bg-gray-50"
          >
            ‹
          </button>
          <div className="text-base sm:text-lg font-semibold text-slate-900">
            {formatMonthYearThai(currentMonth)}
          </div>
          <button
            type="button"
            onClick={handleNextMonth}
            className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white p-1.5 text-slate-600 hover:bg-gray-50"
          >
            ›
          </button>
        </div>

        {error && (
          <p className="text-xs sm:text-sm text-red-600">{error}</p>
        )}
        {loading && (
          <p className="text-xs sm:text-sm text-slate-500">กำลังโหลดข้อมูล...</p>
        )}

        <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden text-xs sm:text-sm">
          {daysOfWeek.map((d) => (
            <div
              key={d}
              className="bg-slate-50 py-2 text-center font-semibold text-slate-600"
            >
              {d}
            </div>
          ))}
          {cells.map((cell, index) => {
            if (!cell) {
              return <div key={`empty-${index}`} className="bg-slate-50 h-20 sm:h-24" />;
            }
            const dayEvents = eventsByDate[cell.iso] || [];
            return (
              <button
                key={cell.iso}
                type="button"
                onClick={() => openAddNote(cell.iso)}
                className="relative flex flex-col items-start bg-white h-20 sm:h-24 p-1.5 sm:p-2 text-left hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[11px] sm:text-xs font-medium text-slate-800">
                    {cell.day}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="rounded-full bg-blue-100 text-blue-700 px-1.5 py-0.5 text-[10px] sm:text-[11px]">
                      {dayEvents.length}
                    </span>
                  )}
                </div>
                <div className="space-y-0.5 w-full overflow-hidden">
                  {dayEvents.slice(0, 2).map((ev) => (
                    <div
                      key={ev.id}
                      className="truncate rounded-sm bg-emerald-50 text-emerald-700 px-1 text-[10px] sm:text-[11px]"
                    >
                      {ev.note || 'บันทึก'}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[10px] sm:text-[11px] text-slate-500 truncate">+ {dayEvents.length - 2} รายการ</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">เพิ่มโน้ตสำหรับวัน</h2>
              <button
                type="button"
                onClick={() => setSelectedDate('')}
                className="text-slate-500 hover:text-slate-700 text-sm"
              >
                ปิด
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              {new Intl.DateTimeFormat('th-TH', { dateStyle: 'full' }).format(new Date(selectedDate))}
            </p>
            {eventsByDate[selectedDate] && eventsByDate[selectedDate].length > 0 && (
              <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-md p-2 space-y-1 bg-slate-50">
                {eventsByDate[selectedDate].map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-start justify-between gap-2 text-xs sm:text-sm text-slate-700"
                  >
                    <div className="flex-1 truncate">{ev.note || 'บันทึก'}</div>
                    <button
                      type="button"
                      onClick={() => handleDeleteNote(ev.id, selectedDate)}
                      className="shrink-0 text-[11px] sm:text-xs text-red-600 hover:text-red-700"
                    >
                      ลบ
                    </button>
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={handleSaveNote} className="space-y-3">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700">
                  โน้ตสรุปงานสั้น ๆ
                </label>
                <textarea
                  rows="3"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-y"
                  placeholder="เช่น งานหลักที่ทำวันนี้ หรือเหตุการณ์สำคัญ"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDate('')}
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving || !note.trim()}
                  className="inline-flex justify-center rounded-md bg-blue-600 px-3 py-1.5 text-xs sm:text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {saving ? 'กำลังบันทึก...' : 'บันทึกโน้ต'}
                </button>
              </div>
            </form>
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
    <div className="max-w-4xl mx-auto space-y-6">
      <section className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">บันทึกภาพและวิดีโอ</h1>
        <p className="text-sm text-slate-500">อัปโหลดไฟล์ไปยัง Supabase Storage</p>
      </section>

      <section className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900">เพิ่มไฟล์ใหม่</h2>
        </div>
        <div className="px-4 sm:px-6 py-5 space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="upload-date" className="block text-sm font-medium text-slate-700">
                เลือกวันที่
              </label>
              <input
                type="date"
                id="upload-date"
                value={uploadDate}
                onChange={(e) => setUploadDate(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="media-file" className="block text-sm font-medium text-slate-700">
                เลือกไฟล์ รูป/วิดีโอ
              </label>
              <input
                type="file"
                id="media-file"
                accept="image/*,video/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="mt-1 block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>
          <div className="pt-1 flex justify-end">
            <button
              type="button"
              onClick={handleUpload}
              className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
            >
              อัปโหลดไป Supabase
            </button>
          </div>
          {status && <p className="text-sm text-slate-600">{status}</p>}
          <div className="mt-4 border-t border-gray-100 pt-4 space-y-2">
            <h3 className="text-sm font-medium text-slate-800">
              ไฟล์ในโฟลเดอร์วันที่: {currentFolder}
            </h3>
            {filesError && (
              <p className="text-xs text-red-600">{filesError}</p>
            )}
            {filesLoading && (
              <p className="text-xs text-slate-500">กำลังโหลดรายการไฟล์...</p>
            )}
            {!filesLoading && !filesError && files.length === 0 && (
              <p className="text-xs text-slate-500">ยังไม่มีไฟล์ในวันนี้</p>
            )}
            {!filesLoading && !filesError && files.length > 0 && (
              <div className="space-y-1 text-xs sm:text-sm">
                {files.map((f) => (
                  <div
                    key={f.name}
                    className="flex items-center justify-between rounded-md border border-gray-100 bg-slate-50 px-3 py-1.5 gap-2"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {isImageFile(f.name) && f.publicUrl && (
                        <img
                          src={f.publicUrl}
                          alt={f.name}
                          className="w-10 h-10 rounded object-cover border border-gray-200 bg-white"
                        />
                      )}
                      <span className="truncate">{f.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteFile(f.name)}
                      className="shrink-0 inline-flex justify-center rounded-md border border-red-200 bg-white px-2 py-0.5 text-[11px] font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-1 focus:ring-red-500"
                    >
                      ลบ
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
