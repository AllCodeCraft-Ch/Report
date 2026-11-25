import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { supabase, supabaseDiagnostics } from './supabaseClient.js';
import { formatFinanceAmount, parseFinanceAmount } from './personalFinance.js';

const PAGES = {
  DASHBOARD: 'dashboard',
  DAILY: 'daily',
  SUMMARY: 'summary',
  CALENDAR: 'calendar',
  MEDIA: 'media',
  SYSTEM: 'system',
  TRIPS: 'trips',
  BACKUP: 'backup',
  FINANCE: 'finance',
};

function useNow(interval = 1000) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), interval);
    return () => clearInterval(id);
  }, [interval]);
  return now;
}

function LiveClock({ locale, options, removeCommas = false }) {
  const now = useNow();
  const formatter = useMemo(() => new Intl.DateTimeFormat(locale, options), [locale, options]);
  const formatted = formatter.format(now);
  return <>{removeCommas ? formatted.replaceAll(',', '') : formatted}</>;
}

function MonthlyReminder({ onNavigate }) {
  const now = useNow(60_000);
  if (now.getDate() !== 26) return null;
  return (
    <div role="status" className="mb-5 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-bold">แจ้งเตือนประจำเดือน · วันนี้วันที่ 26</p>
        <p className="mt-0.5 text-xs leading-5 text-amber-900">อย่าลืมตัดรอบข้อมูลออกต่างจังหวัด และบันทึกช่วงวันที่ที่ส่งให้ผู้ทำตารางแล้ว</p>
      </div>
      <button type="button" onClick={onNavigate} className="shrink-0 rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100">ไปหน้าตัดรอบ</button>
    </div>
  );
}

function localISODate(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function bangkokISODate(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const part = (type) => parts.find((item) => item.type === type)?.value || '';
  return `${part('year')}-${part('month')}-${part('day')}`;
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
const IconDashboard = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="3" width="8" height="8" rx="1.5" />
    <rect x="13" y="3" width="8" height="5" rx="1.5" />
    <rect x="13" y="10" width="8" height="11" rx="1.5" />
    <rect x="3" y="13" width="8" height="8" rx="1.5" />
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
const IconSettings = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    <circle cx="8" cy="6" r="2" fill="currentColor" stroke="none" />
    <circle cx="15" cy="12" r="2" fill="currentColor" stroke="none" />
    <circle cx="10" cy="18" r="2" fill="currentColor" stroke="none" />
  </svg>
);
const IconPlane = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 14l8-2 3-9a1 1 0 012 0l1 8 4 2a1.5 1.5 0 01-.4 2.8L16 17l-1 4-2-3-1-3-7 1-2-1 2-1z" />
  </svg>
);

function requestAppDialog(type, message, value = '') {
  return new Promise((resolve) => {
    window.dispatchEvent(new CustomEvent('daily-report-dialog', {
      detail: { type, message: String(message ?? ''), value, resolve },
    }));
  });
}

function AppDialogLayer() {
  const [dialog, setDialog] = useState(null);
  const [copyFallback, setCopyFallback] = useState(false);
  const promptRef = useRef(null);

  useEffect(() => {
    const handleDialog = (event) => setDialog(event.detail);
    window.addEventListener('daily-report-dialog', handleDialog);
    return () => window.removeEventListener('daily-report-dialog', handleDialog);
  }, []);

  useEffect(() => {
    setCopyFallback(false);
    if (dialog?.type === 'prompt') {
      promptRef.current?.focus();
      promptRef.current?.select();
    }
    if (!dialog) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        const current = dialog;
        setDialog(null);
        current.resolve(current.type === 'prompt' ? null : current.type === 'confirm' ? false : true);
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [dialog]);

  if (!dialog) return null;
  const finish = (result) => {
    const current = dialog;
    setDialog(null);
    current.resolve(result);
  };
  const isConfirm = dialog.type === 'confirm';
  const isPrompt = dialog.type === 'prompt';
  const isAlert = dialog.type === 'alert';
  const submitPrompt = async () => {
    const value = promptRef.current?.value ?? '';
    if (!navigator.clipboard?.writeText) {
      setCopyFallback(true);
      promptRef.current?.select();
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      finish(value);
    } catch {
      setCopyFallback(true);
      promptRef.current?.select();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 py-6" onMouseDown={(event) => event.stopPropagation()}>
      <section role="alertdialog" aria-modal="true" aria-labelledby="app-dialog-title" aria-describedby="app-dialog-message"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start gap-4 px-5 pb-2 pt-5 sm:px-6 sm:pt-6">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${isConfirm ? 'bg-amber-50 text-amber-700' : isPrompt ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
            {isConfirm ? <IconTrash /> : isPrompt ? <IconCopy /> : <IconClipboard />}
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="app-dialog-title" className="text-lg font-bold text-slate-800">{isConfirm ? 'ยืนยันการทำรายการ' : isPrompt ? 'คัดลอกข้อความ' : 'แจ้งเตือน'}</h2>
            <p id="app-dialog-message" className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">{dialog.message}</p>
          </div>
        </div>
        {isPrompt && <div className="px-5 pt-3 sm:px-6"><textarea ref={promptRef} defaultValue={dialog.value} rows={5} readOnly className="w-full select-all rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700" />{copyFallback && <p className="mt-2 text-xs text-slate-500">เลือกข้อความไว้แล้ว กดคัดลอกบนอุปกรณ์เพื่อคัดลอกข้อความ</p>}</div>}
        <div className="flex justify-end gap-2 px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
          {(isConfirm || isPrompt) && <button type="button" onClick={() => finish(isPrompt ? null : false)} className="min-h-10 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">{isPrompt ? 'ปิด' : 'ยกเลิก'}</button>}
          <button type="button" autoFocus={!isPrompt} onClick={() => isPrompt ? submitPrompt() : finish(isConfirm ? true : true)}
            className={`min-h-10 rounded-xl px-5 py-2 text-sm font-semibold text-white shadow-sm ${isConfirm ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-700 hover:bg-blue-800'}`}>
            {isConfirm ? 'ยืนยัน' : isPrompt ? 'คัดลอก' : 'ตกลง'}
          </button>
        </div>
      </section>
    </div>
  );
}

const NAV_ITEMS = [
  { page: PAGES.DASHBOARD, label: 'ภาพรวม Dashboard', Icon: IconDashboard },
  { page: PAGES.DAILY,    label: 'สรุปงานรายวัน', Icon: IconClipboard },
  { page: PAGES.SUMMARY,  label: 'ดูสรุปรายวัน',  Icon: IconEdit },
  { page: PAGES.CALENDAR, label: 'ปฏิทิน',         Icon: IconCalendar },
  { page: PAGES.MEDIA,    label: 'บันทึกภาพ/วิดีโอ', Icon: IconPhoto },
  { page: PAGES.TRIPS,    label: 'ออกต่างจังหวัด', Icon: IconPlane },
  { page: PAGES.SYSTEM,   label: 'ระบบ',             Icon: IconSettings },
  { page: PAGES.BACKUP,   label: 'สำรองและกู้คืน',   Icon: IconCopy },
  { page: PAGES.FINANCE,  label: 'รายการเงิน', Icon: IconSettings },
];

function parseSheetTable(rawText) {
  const firstLine = rawText.split(/\r?\n/, 1)[0] || '';
  const delimiter = firstLine.includes('\t') ? '\t' : (firstLine.includes(';') && !firstLine.includes(',') ? ';' : ',');
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < rawText.length; i += 1) {
    const char = rawText[i];
    if (char === '"') {
      if (quoted && rawText[i + 1] === '"') { cell += '"'; i += 1; }
      else quoted = !quoted;
    } else if (!quoted && char === delimiter) {
      row.push(cell.trim()); cell = '';
    } else if (!quoted && (char === '\n' || char === '\r')) {
      if (char === '\r' && rawText[i + 1] === '\n') i += 1;
      row.push(cell.trim());
      if (row.some((value) => value)) rows.push(row);
      row = []; cell = '';
    } else {
      cell += char;
    }
  }
  row.push(cell.trim());
  if (row.some((value) => value)) rows.push(row);
  if (!rows.length) return { items: [], skipped: 0 };

  const normalizeHeader = (value) => value.toLowerCase().replace(/[\s_\-().]/g, '');
  const headers = rows[0].map(normalizeHeader);
  const dateIndex = headers.findIndex((value) => ['date', 'วันที่', 'วัน'].includes(value) || value.includes('วันที่'));
  const detailIndex = headers.findIndex((value) => ['details', 'detail', 'task', 'title', 'note', 'event', 'งาน', 'รายละเอียดงาน', 'รายละเอียด', 'รายการ', 'หัวข้อ', 'บันทึก'].includes(value) || value.includes('รายละเอียด') || value.includes('งาน'));
  const hasHeader = dateIndex >= 0 && detailIndex >= 0;
  const start = hasHeader ? 1 : 0;
  const dateCol = hasHeader ? dateIndex : 0;
  const detailCol = hasHeader ? detailIndex : 1;
  const items = [];
  let skipped = 0;

  const toISO = (input) => {
    const value = String(input || '').trim();
    const iso = value.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    if (iso) {
      let year = Number(iso[1]);
      if (year > 2400) year -= 543;
      const month = Number(iso[2]); const day = Number(iso[3]);
      const check = new Date(Date.UTC(year, month - 1, day));
      return check.getUTCFullYear() === year && check.getUTCMonth() === month - 1 && check.getUTCDate() === day
        ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
    }
    const local = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (local) {
      const day = Number(local[1]); const month = Number(local[2]);
      let year = Number(local[3]);
      if (year > 2400) year -= 543;
      const check = new Date(Date.UTC(year, month - 1, day));
      return check.getUTCFullYear() === year && check.getUTCMonth() === month - 1 && check.getUTCDate() === day
        ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
    }
    if (/^\d{5}(\.\d+)?$/.test(value)) {
      const date = new Date(Date.UTC(1899, 11, 30) + Number(value) * 86400000);
      return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
    }
    return '';
  };

  for (const cells of rows.slice(start)) {
    const date = toISO(cells[dateCol]);
    const note = String(cells[detailCol] || '').trim();
    if (!date || !note) { skipped += 1; continue; }
    items.push({ date, note });
  }
  return { items, skipped };
}

function parseTripSheetRows(rows) {
  const nonEmpty = (rows || []).filter((row) => row.some((value) => String(value ?? '').trim() !== ''));
  if (!nonEmpty.length) return { items: [], skipped: 0 };
  const header = nonEmpty[0].map((value) => String(value ?? '').toLowerCase().replace(/[\s_\-().]/g, ''));
  const dateIndex = header.findIndex((value) => value === 'date' || value === 'วันที่' || value === 'วัน' || value.includes('วันที่'));
  const detailsIndex = header.findIndex((value) => ['details', 'detail', 'task', 'title', 'งาน', 'รายละเอียดงาน', 'รายละเอียด', 'รายการ', 'หัวข้อ'].includes(value) || value.includes('รายละเอียด') || value.includes('งาน'));
  const timeIndex = header.findIndex((value) => value.includes('time') || value.includes('เวลา'));
  const noteIndex = header.findIndex((value) => value === 'note' || value.includes('หมายเหตุ') || value.includes('remark'));
  const hasHeader = dateIndex >= 0 && detailsIndex >= 0;
  const start = hasHeader ? 1 : 0;
  const dateCol = hasHeader ? dateIndex : 0;
  const detailsCol = hasHeader ? detailsIndex : 1;
  const timeCol = hasHeader ? timeIndex : 2;
  const noteCol = hasHeader ? noteIndex : 3;
  const parseDate = (value) => {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, '0')}-${String(value.getUTCDate()).padStart(2, '0')}`;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      const date = new Date(Date.UTC(1899, 11, 30) + Math.floor(value) * 86400000);
      return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
    }
    const text = String(value ?? '').trim();
    const iso = text.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    const local = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
    let year; let month; let day;
    if (iso) [, year, month, day] = iso;
    else if (local) [, day, month, year] = local;
    else return '';
    year = Number(year); month = Number(month); day = Number(day);
    if (year > 2400) year -= 543;
    const check = new Date(Date.UTC(year, month - 1, day));
    return check.getUTCFullYear() === year && check.getUTCMonth() === month - 1 && check.getUTCDate() === day
      ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
  };
  const parseTime = (value) => {
    if (typeof value === 'number' && value >= 0 && value < 1) {
      const total = Math.round(value * 86400);
      return `${String(Math.floor(total / 3600) % 24).padStart(2, '0')}:${String(Math.floor(total / 60) % 60).padStart(2, '0')}:00`;
    }
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return `${String(value.getUTCHours()).padStart(2, '0')}:${String(value.getUTCMinutes()).padStart(2, '0')}:00`;
    }
    const match = String(value ?? '').trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
    if (!match) return null;
    let hour = Number(match[1]);
    if (match[3]) {
      if (hour === 12) hour = 0;
      if (match[3].toUpperCase() === 'PM') hour += 12;
    }
    return hour <= 23 ? `${String(hour).padStart(2, '0')}:${match[2]}:00` : null;
  };
  const items = [];
  let skipped = 0;
  for (const row of nonEmpty.slice(start)) {
    const date = parseDate(row[dateCol]);
    const details = String(row[detailsCol] ?? '').trim();
    const departure_time = timeCol >= 0 ? parseTime(row[timeCol]) : null;
    const note = noteCol >= 0 ? String(row[noteCol] ?? '').trim() : '';
    if (!date || !details) { skipped += 1; continue; }
    items.push({ date, details, departure_time, note: note || null });
  }
  return { items, skipped };
}

function Layout({ currentPage, setCurrentPage, onLogout, user }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!sidebarOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  return (
    <div className="app-shell min-h-screen flex flex-col">

      {/* ── Top Navbar ─────────────────────────────────────── */}
      <header className="app-header no-print fixed top-0 inset-x-0 z-50 h-14 flex items-center px-4 shadow-md"
        style={{ background: 'linear-gradient(90deg,#1e3a5f 0%,#1a5276 100%)' }}>

        {/* Left: Hamburger */}
        <div className="flex items-center gap-2 relative z-50">
          {!sidebarOpen && (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="เปิดเมนูหลัก"
              aria-expanded={sidebarOpen}
              className="p-2 rounded-md text-blue-200 hover:text-white hover:bg-white/10 focus:outline-none lg:hidden"
            >
              <IconMenuAlt />
            </button>
          )}
        </div>

        {/* Right: Clock + Logout */}
        <div className="ml-auto flex items-center gap-4 relative z-50">
          <div className="hidden xl:flex items-center gap-1.5 text-xs text-blue-200">
            <IconClock />
            <LiveClock locale="en-GB" options={{
              weekday: 'short', day: 'numeric', month: 'short',
              hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
            }} removeCommas />
          </div>
          <button
            type="button"
            onClick={async () => { if (await requestAppDialog('confirm', 'ต้องการออกจากระบบหรือไม่?')) onLogout?.(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-blue-100 border border-blue-500/50
              hover:bg-white/10 hover:text-white transition focus:outline-none"
          >
            <IconLogout />
            <span className="hidden sm:inline">ออกจากระบบ</span>
          </button>
        </div>

        {/* Workspace identity */}
        <div className="app-header-brand select-none pointer-events-none">
            <div>
              <p className="text-sm font-semibold text-white leading-none tracking-wide">Daily Report</p>
              <p className="text-[10px] text-blue-300 mt-0.5">WORKSPACE · {NAV_ITEMS.find((item) => item.page === currentPage)?.label}</p>
            </div>
        </div>
      </header>

      {/* ── Sidebar backdrop ─────────────────────────────── */}
      {sidebarOpen && (
          <button
            type="button"
            aria-label="ปิดเมนูหลัก"
            className="fixed inset-0 bg-slate-950/45 z-40 cursor-default lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
      )}

      <div className="flex flex-1 pt-14">

        {/* ── Sidebar ─────────────────────────────────────── */}
        <aside aria-label="เมนูหลัก" className={`app-sidebar no-print fixed inset-y-0 left-0 z-50 w-60 pt-14 flex flex-col
          border-r border-slate-700 shadow-xl transition-transform duration-200 ease-in-out lg:translate-x-0 lg:shadow-none
          ${ sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0' }`}
          style={{ background: '#1a2943' }}>

          <div className="app-sidebar-intro">
            <div className="app-sidebar-intro-eyebrow">
              <span className="app-sidebar-live-dot" aria-hidden="true" />
              PERSONAL WORKSPACE
            </div>
            <p className="app-sidebar-intro-title">จัดการงานประจำวัน</p>
            <p className="app-sidebar-intro-caption">บันทึกงาน · ปฏิทิน · สื่อ</p>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-blue-500">เมนูหลัก</p>
            {NAV_ITEMS.map(({ page, label, Icon }) => {
              const active = currentPage === page;
              return (
                <button key={page} type="button"
                  onClick={() => { setCurrentPage(page); setSidebarOpen(false); }}
                  aria-current={active ? 'page' : undefined}
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

          {/* User badge */}
          <div className="app-user-badge px-4 py-4 border-t flex items-center gap-3" style={{ borderColor: '#243556' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
              style={{ background: '#2e86c1' }}>N</div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">Natthawut</p>
              <p className="text-[10px] text-blue-400">Administrator</p>
            </div>
            <button type="button" onClick={() => setSidebarOpen(false)} aria-label="ปิดเมนูหลัก"
              className="ml-auto rounded-lg p-2 text-blue-300 hover:bg-white/10 hover:text-white focus:outline-none lg:hidden">
              <span aria-hidden="true" className="text-xl leading-none">×</span>
            </button>
          </div>

          <div className="px-4 py-3 border-t text-[10px] text-blue-600" style={{ borderColor: '#243556' }}>
            © Private Daily Report System
          </div>
        </aside>

        {/* ── Main ────────────────────────────────────────── */}
        <main className="app-main flex-1 px-4 sm:px-6 lg:px-8 py-6 min-w-0 lg:ml-60">
          <MonthlyReminder onNavigate={() => setCurrentPage(PAGES.TRIPS)} />
          {currentPage === PAGES.DASHBOARD && <DashboardPage onNavigate={setCurrentPage} />}
          {currentPage === PAGES.DAILY    && <DailyPage />}
          {currentPage === PAGES.SUMMARY  && <SummaryPage onCreateReport={() => setCurrentPage(PAGES.DAILY)} />}
          {currentPage === PAGES.CALENDAR && <CalendarPage />}
          {currentPage === PAGES.MEDIA    && <MediaPage />}
          {currentPage === PAGES.SYSTEM   && <SystemPage />}
          {currentPage === PAGES.BACKUP   && <BackupPage />}
          {currentPage === PAGES.FINANCE  && <PersonalFinancePage ownerId={user?.id} />}
          {currentPage === PAGES.TRIPS    && <ProvincialTripsPage />}
        </main>
      </div>
    </div>
  );
}

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handlePasswordResetRequest = async () => {
    setError('');
    setNotice('');
    if (!email.trim()) {
      setError('กรุณากรอกอีเมลก่อนขอลิงก์ตั้งรหัสผ่านใหม่');
      return;
    }
    if (!supabase) {
      setError('ยังไม่ได้ตั้งค่าการเชื่อมต่อ Supabase');
      return;
    }
    setSubmitting(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });
      if (resetError) {
        setError('ส่งลิงก์ไม่สำเร็จ กรุณาตรวจสอบอีเมลแล้วลองอีกครั้ง');
        return;
      }
      setNotice('ส่งลิงก์ตั้งรหัสผ่านใหม่แล้ว กรุณาตรวจกล่องจดหมายและจดหมายขยะ');
    } catch {
      setError('เชื่อมต่อระบบไม่ได้ กรุณาลองขอลิงก์ใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!supabase) {
      setError('ยังไม่ได้ตั้งค่าการเชื่อมต่อ Supabase');
      return;
    }
    setSubmitting(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError) {
        setError('เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน');
        return;
      }
      if (data.user?.app_metadata?.role !== 'admin') {
        await supabase.auth.signOut();
        setError('บัญชีนี้ยังไม่ได้รับสิทธิ์ผู้ดูแลระบบ');
        return;
      }
      onLogin?.(data.user);
    } catch {
      setError('เชื่อมต่อระบบเข้าสู่ระบบไม่ได้ กรุณาลองอีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="no-print min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg,#111d28 0%,#1b3141 60%,#24465b 100%)' }}>

      {/* Card */}
      <div className="workspace-login-card grid w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">

        <section className="login-intro hidden md:flex flex-col justify-between p-10 lg:p-12">
          <div>
            <img src="/logo.png" alt="Daily Report" className="h-14 w-14 rounded-2xl border border-white/15 object-cover shadow-xl" />
            <p className="mt-10 text-[11px] font-semibold tracking-[.22em] text-blue-300">PERSONAL WORKSPACE</p>
            <h2 className="mt-4 max-w-sm text-4xl font-semibold leading-tight tracking-tight text-white">ทุกวันทำงาน<br />ชัดเจนในที่เดียว</h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-300">บันทึกงานประจำวัน วางแผนตาราง และเก็บรายละเอียดการทำงานไว้ในพื้นที่เดียว</p>
          </div>
          <div className="login-feature-list grid grid-cols-2 gap-3">
            <div><IconClipboard /><span>บันทึกงาน</span></div>
            <div><IconCalendar /><span>วางแผนวัน</span></div>
            <div><IconPhoto /><span>จัดเก็บสื่อ</span></div>
            <div><IconPlane /><span>บันทึกเดินทาง</span></div>
          </div>
        </section>

        <div className="login-form-panel">

        {/* Header band */}
        <div className="px-8 py-7 text-center" style={{ background: '#1c2b38' }}>
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
            <label htmlFor="login-email" className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">อีเมล</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required
                autoComplete="username"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-slate-50
                  focus:outline-none focus:ring-2 focus:border-transparent transition"
                style={{ '--tw-ring-color': '#2e86c1' }}
                placeholder="กรอกอีเมลบัญชี Supabase Auth"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">รหัสผ่าน</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input id="login-password" type={showPass ? 'text' : 'password'} value={password} required
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-gray-200 text-sm bg-slate-50
                  focus:outline-none focus:ring-2 focus:border-transparent transition"
                placeholder="กรอกรหัสผ่าน"
              />
              <button type="button" aria-label={showPass ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'} onClick={() => setShowPass(v => !v)}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600">
                {showPass
                  ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                }
              </button>
            </div>
            <div className="mt-2 flex justify-end">
              <button type="button" onClick={handlePasswordResetRequest} disabled={submitting}
                className="text-xs font-semibold text-blue-700 transition hover:text-blue-900 hover:underline disabled:cursor-wait disabled:opacity-60">
                ลืมรหัสผ่าน?
              </button>
            </div>
          </div>

          {notice && (
            <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs leading-5 text-emerald-800">
              {notice}
            </div>
          )}

          {error && (
            <div role="alert" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-red-700 bg-red-50 border border-red-200">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <button type="submit" disabled={submitting}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white shadow-md disabled:cursor-wait disabled:opacity-70
              hover:opacity-90 active:scale-[.98] transition focus:outline-none"
            style={{ background: 'linear-gradient(90deg,#1e3a5f,#2e86c1)' }}>
            {submitting ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <p className="text-center text-[10px] text-slate-400 pb-5">© 2026 Daily Report System</p>
        </div>
      </div>
    </div>
  );
}

function PasswordRecoveryPage({ onComplete }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('รหัสผ่านทั้งสองช่องไม่ตรงกัน');
      return;
    }
    if (!supabase) {
      setError('ยังไม่ได้ตั้งค่าการเชื่อมต่อ Supabase');
      return;
    }
    setSubmitting(true);
    try {
      const { data, error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError || data.user?.app_metadata?.role !== 'admin') {
        setError(updateError ? 'เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาขอลิงก์ใหม่แล้วลองอีกครั้ง' : 'บัญชีนี้ยังไม่ได้รับสิทธิ์ผู้ดูแลระบบ');
        return;
      }
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
      onComplete?.(data.user);
    } catch {
      setError('เชื่อมต่อระบบไม่ได้ กรุณาลองอีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="no-print flex min-h-screen items-center justify-center px-4" style={{ background: 'linear-gradient(135deg,#111d28 0%,#1b3141 60%,#24465b 100%)' }}>
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="px-8 py-7 text-center" style={{ background: '#1c2b38' }}>
          <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg" style={{ background: '#2e86c1' }}>
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-wide text-white">ตั้งรหัสผ่านใหม่</h1>
          <p className="mt-1 text-xs text-blue-300">Daily Report</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 px-8 py-7">
          <div>
            <label htmlFor="recovery-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">รหัสผ่านใหม่</label>
            <input id="recovery-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete="new-password"
              className="w-full rounded-lg border border-gray-200 bg-slate-50 px-3 py-2.5 text-sm transition focus:border-transparent focus:outline-none focus:ring-2" style={{ '--tw-ring-color': '#2e86c1' }} placeholder="อย่างน้อย 8 ตัวอักษร" />
          </div>
          <div>
            <label htmlFor="recovery-password-confirm" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">ยืนยันรหัสผ่านใหม่</label>
            <input id="recovery-password-confirm" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={8} autoComplete="new-password"
              className="w-full rounded-lg border border-gray-200 bg-slate-50 px-3 py-2.5 text-sm transition focus:border-transparent focus:outline-none focus:ring-2" style={{ '--tw-ring-color': '#2e86c1' }} placeholder="กรอกรหัสผ่านอีกครั้ง" />
          </div>
          {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">{error}</div>}
          <button type="submit" disabled={submitting} className="w-full rounded-lg py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:cursor-wait disabled:opacity-70" style={{ background: 'linear-gradient(90deg,#1e3a5f,#2e86c1)' }}>
            {submitting ? 'กำลังบันทึกรหัสผ่าน…' : 'บันทึกรหัสผ่านใหม่'}
          </button>
        </form>
        <p className="pb-5 text-center text-[10px] text-slate-400">© 2026 Daily Report System</p>
      </div>
    </div>
  );
}

function DashboardPage({ onNavigate }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');
  const [keyword, setKeyword] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState([]);
  const [visibleCount, setVisibleCount] = useState(50);

  useEffect(() => {
    let cancelled = false;
    const monthStart = `${localISODate().slice(0, 7)}-01`;
    const countRows = async (table, startDate = '') => {
      let query = supabase.from(table).select('id', { count: 'exact', head: true });
      if (startDate) query = query.gte('date', startDate);
      return query;
    };

    async function loadDashboard() {
      setStatsLoading(true);
      setStatsError('');
      if (!supabase) {
        setStatsError('ยังไม่ได้ตั้งค่าการเชื่อมต่อ Supabase');
        setStatsLoading(false);
        return;
      }
      const [reports, reportsMonth, trips, tripsMonth, calendar, calendarMonth, media, monthReports] = await Promise.all([
        countRows('daily_reports'), countRows('daily_reports', monthStart),
        countRows('provincial_trips'), countRows('provincial_trips', monthStart),
        countRows('calendar_notes'), countRows('calendar_notes', monthStart),
        measureBucketUsage(supabase.storage.from('media')).then((data) => ({ data })).catch((error) => ({ error })),
        fetchAllRows('daily_reports', 'id,date,location,work_today', monthStart, localISODate()).catch(() => []),
      ]);
      if (cancelled) return;
      const errors = [reports, reportsMonth, trips, tripsMonth, calendar, calendarMonth].filter((item) => item.error);
      if (errors.length) setStatsError('โหลดสรุปบางส่วนไม่สำเร็จ กรุณากดรีเฟรชเพื่อลองอีกครั้ง');
      setStats({
        reports: { total: reports.count ?? null, month: reportsMonth.count ?? null },
        trips: { total: trips.count ?? null, month: tripsMonth.count ?? null },
        calendar: { total: calendar.count ?? null, month: calendarMonth.count ?? null },
        media: media.data || null,
        monthReports,
      });
      setStatsLoading(false);
    }
    loadDashboard();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const fetchAllRows = async (table, columns, startDate, endDate) => {
    const rows = [];
    const pageSize = 500;
    let offset = 0;
    while (true) {
      let query = supabase.from(table).select(columns).order('date', { ascending: false }).range(offset, offset + pageSize - 1);
      if (startDate) query = query.gte('date', startDate);
      if (endDate) query = query.lte('date', endDate);
      const { data, error } = await query;
      if (error) throw error;
      rows.push(...(data || []));
      if (!data || data.length < pageSize) return rows;
      offset += pageSize;
    }
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    const term = keyword.trim().toLocaleLowerCase();
    if (dateFrom && dateTo && dateFrom > dateTo) {
      setSearchError('วันที่เริ่มต้นต้องไม่อยู่หลังวันที่สิ้นสุด');
      return;
    }
    if (!term && !dateFrom && !dateTo) {
      setSearchError('พิมพ์คำค้นหรือเลือกช่วงวันที่อย่างน้อยหนึ่งอย่าง');
      return;
    }
    if (!supabase) {
      setSearchError('ยังไม่ได้ตั้งค่าการเชื่อมต่อ Supabase');
      return;
    }

    setSearchLoading(true);
    setSearchError('');
    setHasSearched(true);
    setResults([]);
    setVisibleCount(50);
    try {
      const [reports, trips, calendar] = await Promise.all([
        fetchAllRows('daily_reports', 'id,date,location,work_today,problems,cause,solution,result', dateFrom, dateTo),
        fetchAllRows('provincial_trips', 'id,date,details,departure_time,note', dateFrom, dateTo),
        fetchAllRows('calendar_notes', 'id,date,note', dateFrom, dateTo),
      ]);
      const includesTerm = (values) => !term || values.some((value) => String(value ?? '').toLocaleLowerCase().includes(term));
      const reportResults = reports.filter((row) => includesTerm([
        row.location, row.work_today, row.problems, row.cause, row.solution, row.result,
      ])).map((row) => ({
        id: `report-${row.id}`, type: 'รายงานประจำวัน', destination: PAGES.SUMMARY, date: row.date,
        title: row.location || 'รายงานประจำวัน', body: row.work_today || row.result || 'ไม่มีรายละเอียดงาน',
        extra: [row.problems, row.solution].filter(Boolean).join(' · '),
      }));
      const tripResults = trips.filter((row) => includesTerm([row.details, row.note]))
        .map((row) => ({
          id: `trip-${row.id}`, type: 'ออกต่างจังหวัด', destination: PAGES.TRIPS, date: row.date,
          title: row.details || 'รายการเดินทาง', body: row.note || 'ไม่มีหมายเหตุ', extra: row.departure_time ? `เวลา ${String(row.departure_time).slice(0, 5)}` : '',
        }));
      const calendarResults = calendar.filter((row) => includesTerm([row.note]))
        .map((row) => ({
          id: `calendar-${row.id}`, type: 'ปฏิทิน', destination: PAGES.CALENDAR, date: row.date,
          title: row.note || 'บันทึกปฏิทิน', body: '', extra: '',
        }));
      const combined = [...reportResults, ...tripResults, ...calendarResults]
        .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
      setResults(combined);
    } catch {
      setSearchError('ค้นหาข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSearchLoading(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return 'ไม่ระบุวันที่';
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('th-TH', { dateStyle: 'long' }).format(date);
  };
  const availableCounts = [stats?.reports?.total, stats?.trips?.total, stats?.calendar?.total].filter(Number.isFinite);
  const totalEntries = availableCounts.length === 3 ? availableCounts.reduce((sum, count) => sum + count, 0) : null;
  const metricCards = [
    { label: 'รายงานทั้งหมด', value: stats?.reports?.total, month: stats?.reports?.month, page: PAGES.SUMMARY, Icon: IconClipboard, tint: 'blue' },
    { label: 'รายการเดินทาง', value: stats?.trips?.total, month: stats?.trips?.month, page: PAGES.TRIPS, Icon: IconPlane, tint: 'cyan' },
    { label: 'บันทึกปฏิทิน', value: stats?.calendar?.total, month: stats?.calendar?.month, page: PAGES.CALENDAR, Icon: IconCalendar, tint: 'violet' },
  ];
  const monthSummary = useMemo(() => {
    const rows = stats?.monthReports || [];
    const workRows = rows.filter((row) => row.work_today && !/^ลา\s*[:：]/.test(row.work_today.trim()));
    const countBy = (values) => {
      const counts = new Map();
      values.filter(Boolean).forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
      return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
    };
    const today = localISODate();
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(`${today}T00:00:00`);
      date.setDate(date.getDate() - (6 - index));
      const key = localISODate(date);
      return { key, label: new Intl.DateTimeFormat('th-TH', { weekday: 'short' }).format(date), count: rows.filter((row) => row.date === key && row.work_today && !/^ลา\s*[:：]/.test(row.work_today.trim())).length };
    });
    const uniqueWorkDays = new Set(workRows.map((row) => row.date).filter(Boolean)).size;
    return {
      workDays: uniqueWorkDays,
      workCount: workRows.length,
      leaveCount: rows.filter((row) => /^ลา\s*[:：]/.test((row.work_today || '').trim())).length,
      locations: countBy(workRows.map((row) => row.location?.trim()).filter(Boolean)),
      works: countBy(workRows.map((row) => row.work_today?.trim().split(/\n/)[0].slice(0, 64)).filter(Boolean)),
      days,
      maxDay: Math.max(1, ...days.map((day) => day.count)),
    };
  }, [stats]);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">ภาพรวม Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">สรุปข้อมูลทั้งหมดและค้นหารายการจากจุดเดียว</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800">{totalEntries === null ? 'กำลังรวมข้อมูล…' : `${totalEntries.toLocaleString('th-TH')} รายการทั้งหมด`}</span>
          <button type="button" onClick={() => setRefreshKey((key) => key + 1)} disabled={statsLoading}
            className="min-h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
            {statsLoading ? 'กำลังโหลด…' : 'รีเฟรช'}
          </button>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 text-white shadow-sm">
        <div className="border-b border-slate-700 bg-gradient-to-r from-blue-900 to-cyan-900 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-blue-100"><IconDashboard /></span>
            <div>
              <h2 className="text-base font-bold">ค้นหาทั้งระบบ</h2>
              <p className="mt-0.5 text-xs text-blue-100/80">ค้นจากงาน สถานที่ ปัญหา วิธีแก้ไข รายละเอียดเดินทาง และโน้ตปฏิทิน</p>
            </div>
          </div>
        </div>
        <form onSubmit={handleSearch} className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-[minmax(220px,1.6fr)_minmax(140px,.8fr)_minmax(140px,.8fr)_auto] lg:items-end">
          <label className="block min-w-0 sm:col-span-2 lg:col-span-1">
            <span className="mb-1 block text-xs font-semibold text-slate-300">คำค้น</span>
            <input type="search" value={keyword} onChange={(event) => setKeyword(event.target.value)}
              placeholder="เช่น ติดตั้ง, Pandora, ประชุม..." className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
          </label>
          <label className="block min-w-0">
            <span className="mb-1 block text-xs font-semibold text-slate-300">ตั้งแต่วันที่</span>
            <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="w-full min-w-0 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white" />
          </label>
          <label className="block min-w-0">
            <span className="mb-1 block text-xs font-semibold text-slate-300">ถึงวันที่</span>
            <input type="date" value={dateTo} min={dateFrom || undefined} onChange={(event) => setDateTo(event.target.value)} className="w-full min-w-0 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white" />
          </label>
          <button type="submit" disabled={searchLoading}
            className="min-h-11 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-sm hover:bg-blue-500 disabled:opacity-60 sm:col-span-2 lg:col-span-1">
            {searchLoading ? 'กำลังค้นหา…' : 'ค้นหา'}
          </button>
          {searchError && <p role="alert" className="text-sm text-rose-300 sm:col-span-2 lg:col-span-4">{searchError}</p>}
        </form>
      </section>

      {statsError && <p role="status" className="rounded-xl border border-amber-300/30 bg-amber-900/20 px-4 py-3 text-sm text-amber-200">{statsError}</p>}

      <section aria-label="สรุปข้อมูล" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map(({ label, value, month, page, Icon }) => (
          <button key={label} type="button" onClick={() => onNavigate(page)}
            className="group rounded-2xl border border-slate-700 bg-slate-900 p-4 text-left shadow-sm transition hover:border-blue-500/70 hover:bg-slate-800">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300"><Icon /></span>
            <span className="mt-3 block text-xs font-medium text-slate-400">{label}</span>
            <span className="mt-1 block text-2xl font-bold text-white">{statsLoading ? '…' : Number.isFinite(value) ? value.toLocaleString('th-TH') : '—'}</span>
            <span className="mt-1 block text-[11px] text-slate-500">เดือนนี้ {statsLoading ? '…' : Number.isFinite(month) ? month.toLocaleString('th-TH') : '—'} รายการ · เปิดดู →</span>
          </button>
        ))}
        <button type="button" onClick={() => onNavigate(PAGES.MEDIA)}
          className="group rounded-2xl border border-slate-700 bg-slate-900 p-4 text-left shadow-sm transition hover:border-cyan-500/70 hover:bg-slate-800">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300"><IconPhoto /></span>
          <span className="mt-3 block text-xs font-medium text-slate-400">พื้นที่คลังภาพและวิดีโอ</span>
          <span className="mt-1 block text-2xl font-bold text-white">{statsLoading ? '…' : stats?.media ? formatMetricBytes(stats.media.bytes) : '—'}</span>
          <span className="mt-1 block text-[11px] text-slate-500">{stats?.media ? `${stats.media.files.toLocaleString('th-TH')} ไฟล์ใน Storage · เปิดดู →` : 'เปิดคลังสื่อ →'}</span>
        </button>
      </section>

      <section aria-label="สรุปงานอัตโนมัติประจำเดือน" className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 text-white shadow-sm">
        <div className="flex flex-col gap-1 border-b border-slate-700 px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-5">
          <div>
            <h2 className="text-base font-bold">สรุปงานอัตโนมัติ</h2>
            <p className="mt-1 text-xs text-slate-400">ภาพรวมจากรายงานที่บันทึกในเดือนนี้</p>
          </div>
          <span className="text-xs font-medium text-blue-200">{new Intl.DateTimeFormat('th-TH', { month: 'long', year: 'numeric' }).format(new Date())}</span>
        </div>
        {statsLoading ? <p className="px-5 py-6 text-sm text-slate-400">กำลังสรุปข้อมูล…</p> : (
          <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1.1fr_1fr_1fr]">
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <p className="text-xs text-slate-400">วันที่มีรายงาน</p>
                <p className="mt-1 text-2xl font-bold">{monthSummary.workDays}<span className="ml-1 text-xs font-medium text-slate-400">วัน</span></p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <p className="text-xs text-slate-400">งานที่บันทึก</p>
                <p className="mt-1 text-2xl font-bold">{monthSummary.workCount}<span className="ml-1 text-xs font-medium text-slate-400">รายการ</span></p>
              </div>
              <div className="col-span-2 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2.5 text-xs">
                <span className="text-slate-400">บันทึกการลา</span><strong className="text-slate-200">{monthSummary.leaveCount} วัน</strong>
              </div>
              <button type="button" onClick={() => onNavigate(PAGES.TRIPS)} className="col-span-2 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2.5 text-xs hover:border-blue-500/60">
                <span className="text-slate-400">เดินทางต่างจังหวัด</span><strong className="text-blue-200">{Number.isFinite(stats?.trips?.month) ? `${stats.trips.month} รายการ · เปิดดู →` : 'เปิดดู →'}</strong>
              </button>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
              <h3 className="text-xs font-semibold text-slate-300">กิจกรรม 7 วันล่าสุด</h3>
              <div className="mt-4 flex h-24 items-end justify-between gap-2" role="img" aria-label="จำนวนงานในแต่ละวันช่วง 7 วันล่าสุด">
                {monthSummary.days.map((day) => <div key={day.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1" title={`${day.label}: ${day.count} งาน`}>
                  <span className="text-[10px] text-slate-400">{day.count || ''}</span>
                  <span className="w-full max-w-8 rounded-t-md bg-gradient-to-t from-blue-700 to-cyan-400" style={{ height: `${Math.max(day.count ? 14 : 4, day.count / monthSummary.maxDay * 58)}px`, opacity: day.count ? 1 : .25 }} />
                  <span className="text-[10px] text-slate-500">{day.label}</span>
                </div>)}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div>
                <h3 className="text-xs font-semibold text-slate-300">สถานที่ที่พบบ่อย</h3>
                {monthSummary.locations.length ? <ol className="mt-2 space-y-1.5">{monthSummary.locations.map(([label, count], index) => <li key={label} className="flex min-w-0 items-center gap-2 text-xs"><span className="w-4 text-slate-500">{index + 1}</span><span className="min-w-0 flex-1 truncate text-slate-200">{label}</span><span className="text-slate-400">{count}</span></li>)}</ol> : <p className="mt-2 text-xs text-slate-500">ยังไม่มีข้อมูลสถานที่</p>}
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-300">งานที่บันทึกบ่อย</h3>
                {monthSummary.works.length ? <ol className="mt-2 space-y-1.5">{monthSummary.works.map(([label, count], index) => <li key={label} className="flex min-w-0 items-center gap-2 text-xs"><span className="w-4 text-slate-500">{index + 1}</span><span className="min-w-0 flex-1 truncate text-slate-200">{label}</span><span className="text-slate-400">{count}</span></li>)}</ol> : <p className="mt-2 text-xs text-slate-500">ยังไม่มีข้อมูลงาน</p>}
              </div>
            </div>
          </div>
        )}
      </section>

      {hasSearched && (
        <section aria-live="polite" className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 px-4 py-3 sm:px-5">
            <div>
              <h2 className="text-sm font-bold text-white">ผลการค้นหา</h2>
              {!searchLoading && <p className="mt-0.5 text-xs text-slate-400">พบ {results.length.toLocaleString('th-TH')} รายการ</p>}
            </div>
            <button type="button" onClick={() => { setHasSearched(false); setResults([]); setSearchError(''); }} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800">ล้างผลลัพธ์</button>
          </div>
          {searchLoading ? <p className="px-5 py-8 text-center text-sm text-slate-400">กำลังค้นหาข้อมูลรายงาน เดินทาง และปฏิทิน…</p>
            : results.length === 0 ? <p className="px-5 py-8 text-center text-sm text-slate-400">ไม่พบรายการที่ตรงกับคำค้นหรือช่วงวันที่นี้</p>
              : <div className="divide-y divide-slate-800">
                {results.slice(0, visibleCount).map((item) => (
                  <article key={item.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-blue-500/15 px-2.5 py-1 text-[10px] font-semibold text-blue-200">{item.type}</span>
                        <time className="text-xs text-slate-400">{formatDate(item.date)}</time>
                      </div>
                      <h3 className="mt-2 break-words text-sm font-semibold text-slate-100">{item.title}</h3>
                      {item.body && <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">{item.body}</p>}
                      {item.extra && <p className="mt-1 break-words text-xs text-slate-400">{item.extra}</p>}
                    </div>
                    <button type="button" onClick={() => onNavigate(item.destination)} className="min-h-9 shrink-0 self-start rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-blue-200 hover:border-blue-500 hover:bg-blue-500/10">เปิดหน้า{item.type}</button>
                  </article>
                ))}
                {results.length > visibleCount && <div className="p-4 text-center"><button type="button" onClick={() => setVisibleCount((count) => count + 50)} className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800">แสดงเพิ่มอีก 50 รายการ</button></div>}
              </div>}
        </section>
      )}

      {!hasSearched && (
        <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4 sm:p-5">
          <h2 className="text-sm font-bold text-white">ทางลัด</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              [PAGES.DAILY, 'บันทึกรายงาน', IconClipboard], [PAGES.SUMMARY, 'ดูรายงาน', IconEdit],
              [PAGES.CALENDAR, 'เปิดปฏิทิน', IconCalendar], [PAGES.TRIPS, 'จัดการเดินทาง', IconPlane],
            ].map(([page, label, Icon]) => <button key={page} type="button" onClick={() => onNavigate(page)} className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/50 px-3 text-left text-xs font-semibold text-slate-200 hover:border-blue-500/60 hover:bg-slate-800"><Icon />{label}</button>)}
          </div>
        </section>
      )}
    </div>
  );
}

function DailyPage() {
  const reportFields = [
    ['work', 'งานที่ทำวันนี้', 'เช่น ตรวจสอบระบบ ประชุมทีม หรือจัดทำเอกสาร'],
    ['problems', 'ปัญหาที่พบ', 'ถ้าไม่มีปัญหา สามารถเว้นว่างหรือเอาเครื่องหมายหัวข้อนี้ออก'],
    ['cause', 'สาเหตุของปัญหา', 'ระบุสาเหตุที่ทำให้เกิดปัญหา'],
    ['solution', 'วิธีแก้ปัญหา', 'ระบุวิธีที่ใช้แก้ไขหรือประสานงาน'],
    ['result', 'ผล', 'สรุปผลหลังดำเนินการ'],
  ];
  const [form, setForm] = useState({
    date: localISODate(),
    location: '',
    work: '',
    problems: '',
    cause: '',
    solution: '',
    result: '',
  });
  const [enabledFields, setEnabledFields] = useState(() => {
    const defaults = Object.fromEntries(reportFields.map(([id]) => [id, true]));
    try {
      const saved = JSON.parse(window.localStorage.getItem('daily-report-enabled-fields') || 'null');
      if (!saved || typeof saved !== 'object') return defaults;
      return Object.fromEntries(reportFields.map(([id]) => [id, typeof saved[id] === 'boolean' ? saved[id] : true]));
    } catch {
      return defaults;
    }
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [includeProvincialTrip, setIncludeProvincialTrip] = useState(false);
  const [tripDepartureTime, setTripDepartureTime] = useState('');
  const [tripDetails, setTripDetails] = useState('');
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveError, setLeaveError] = useState('');
  const [leaveLoading, setLeaveLoading] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem('daily-report-enabled-fields', JSON.stringify(enabledFields));
    } catch {
      // Keep the form usable if browser storage is unavailable.
    }
  }, [enabledFields]);

  const openLeaveDialog = () => {
    if (!form.date) {
      requestAppDialog('alert', 'กรุณาเลือกวันที่ก่อนบันทึกการลา');
      return;
    }

    if (!supabase) {
      setMessage('ยังไม่ได้ตั้งค่า Supabase (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
      return;
    }

    setLeaveReason('');
    setLeaveError('');
    setLeaveDialogOpen(true);
  };

  const handleLeave = async () => {
    const reason = leaveReason.trim();
    if (!reason) {
      setLeaveError('กรุณาระบุเหตุผลการลา');
      return;
    }

    setLeaveLoading(true);
    setLeaveError('');

    const { error } = await supabase.from('daily_reports').insert({
      date: form.date,
      location: '',
      work_today: `ลา: ${reason}`,
      problems: null,
      cause: null,
      solution: null,
      result: null,
    });

    setLeaveLoading(false);
    if (error) {
      setLeaveError('บันทึกการลาไม่สำเร็จ: ' + error.message);
    } else {
      setMessage('บันทึกการลาสำเร็จ');
      setLeaveDialogOpen(false);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleFieldToggle = (id) => {
    setEnabledFields((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (includeProvincialTrip && (!tripDepartureTime || !tripDetails.trim())) {
      setMessage('กรุณากรอกเวลาเลิกงานและรายละเอียดงานออกต่างจังหวัดให้ครบ');
      return;
    }
    setLoading(true);
    setMessage('');
    if (!supabase) {
      setLoading(false);
      setMessage('ยังไม่ได้ตั้งค่า Supabase (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
      return;
    }
    const reportDate = form.date || localISODate();
    let tripRecord = null;
    if (includeProvincialTrip) {
      const { data, error: tripError } = await supabase
        .from('provincial_trips')
        .insert({
          date: reportDate,
          details: tripDetails.trim(),
          departure_time: tripDepartureTime,
          note: null,
        })
        .select('id')
        .single();
      if (tripError) {
        setLoading(false);
        setMessage('บันทึกรายการออกต่างจังหวัดไม่สำเร็จ: ' + tripError.message);
        return;
      }
      tripRecord = data;
    }

    const { error } = await supabase.from('daily_reports').insert({
      date: reportDate,
      location: form.location,
      work_today: enabledFields.work ? form.work : null,
      problems: enabledFields.problems ? form.problems : null,
      cause: enabledFields.cause ? form.cause : null,
      solution: enabledFields.solution ? form.solution : null,
      result: enabledFields.result ? form.result : null,
    });
    if (error) {
      if (tripRecord?.id) {
        const { error: rollbackError } = await supabase.from('provincial_trips').delete().eq('id', tripRecord.id);
        if (rollbackError) {
          setLoading(false);
          setMessage(`บันทึกรายงานไม่สำเร็จ และล้างรายการออกต่างจังหวัดไม่สำเร็จ: ${error.message} · ${rollbackError.message}`);
          return;
        }
      }
      setLoading(false);
      setMessage('บันทึกไม่สำเร็จ: ' + error.message);
    } else {
      setLoading(false);
      setMessage(includeProvincialTrip ? 'บันทึกสำเร็จ และเพิ่มรายการในหน้าออกต่างจังหวัดแล้ว' : 'บันทึกสำเร็จ');
      setForm({ date: localISODate(), location: '', work: '', problems: '', cause: '', solution: '', result: '' });
      setIncludeProvincialTrip(false);
      setTripDepartureTime('');
      setTripDetails('');
    }
  };

  const inputCls = 'mt-1 block w-full rounded-lg border border-gray-200 bg-slate-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';
  const labelCls = 'block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-0.5';

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* Page header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <div>
          <h1 className="text-xl font-bold text-slate-800">สรุปงานรายวัน</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            <LiveClock locale="th-TH" options={{ dateStyle: 'full', timeStyle: 'medium' }} />
          </p>
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
            <div className="report-date-field-wrapper">
              <label htmlFor="date" className={labelCls}>วันที่ของรายงาน</label>
              <input type="date" id="date" value={form.date} onChange={handleChange} className={`${inputCls} report-date-input`} />
              <p className="mt-1 text-xs text-slate-400">ตั้งเป็นวันนี้ไว้แล้ว เปลี่ยนได้เมื่อทำรายงานย้อนหลัง</p>
            </div>
            <div>
              <label htmlFor="location" className={labelCls}>สถานที่</label>
              <input type="text" id="location" value={form.location} onChange={handleChange}
                className={inputCls} placeholder="เช่น สำนักงานใหญ่" />
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <input type="checkbox" checked={includeProvincialTrip} onChange={(event) => setIncludeProvincialTrip(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-emerald-300 text-emerald-700 focus:ring-emerald-500" />
            <span>
              <span className="block text-sm font-semibold text-emerald-950">ออกต่างจังหวัด</span>
              <span className="mt-0.5 block text-xs leading-5 text-emerald-800">เมื่อติ๊ก รายการจะถูกเพิ่มในหน้าต่างจังหวัดตามวันที่ของรายงานด้วย</span>
            </span>
          </label>

          {includeProvincialTrip && (
            <div className="grid grid-cols-1 gap-4 rounded-xl border border-emerald-100 bg-white p-4 sm:grid-cols-2">
              <div>
                <label htmlFor="daily-trip-departure-time" className={labelCls}>เวลาเลิกงาน</label>
                <AnimatedTimePicker id="daily-trip-departure-time" name="departure_time" value={tripDepartureTime}
                  onChange={(event) => setTripDepartureTime(event.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="daily-trip-details" className={labelCls}>รายละเอียดงานออกต่างจังหวัด</label>
                <textarea id="daily-trip-details" rows={3} required value={tripDetails}
                  onChange={(event) => setTripDetails(event.target.value)}
                  placeholder="เช่น ไปประชุม ติดตั้ง หรือเข้าบริการลูกค้าที่จังหวัด..."
                  className={inputCls + ' resize-y'} />
              </div>
            </div>
          )}

          {reportFields.map(([id, lbl, placeholder]) => (
            <div key={id}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <label htmlFor={id} className={labelCls}>{lbl}</label>
                <label className={`inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 transition-colors ${enabledFields[id] ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                  <input
                    type="checkbox"
                    role="switch"
                    aria-checked={enabledFields[id]}
                    checked={enabledFields[id]}
                    onChange={() => handleFieldToggle(id)}
                    className="peer sr-only"
                  />
                  <span aria-hidden="true" className="relative h-5 w-9 shrink-0 rounded-full bg-slate-300 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:bg-emerald-600 peer-checked:after:translate-x-4 peer-focus-visible:ring-4 peer-focus-visible:ring-emerald-200" />
                  <span className="text-xs font-semibold">{enabledFields[id] ? 'ใช้หัวข้อนี้' : 'ข้ามหัวข้อนี้'}</span>
                </label>
              </div>
              {enabledFields[id] && (
                <textarea id={id} rows={3} value={form[id]} onChange={handleChange} placeholder={placeholder}
                  className={inputCls + ' resize-y'} />
              )}
            </div>
          ))}
          <p className="-mt-2 text-xs text-slate-400">เอาเครื่องหมาย “ใช้หัวข้อนี้” ออกเพื่อข้ามหัวข้อนั้นในรายงานวันนี้</p>

          {message && (
            <p className={`text-xs px-3 py-2 rounded-lg ${
              message.startsWith('บันทึกสำเร็จ')
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`} role={message.startsWith('บันทึกสำเร็จ') ? 'status' : 'alert'} aria-live="polite">{message}</p>
          )}

          <div className="pt-2 flex flex-col sm:flex-row sm:justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setForm({ date: localISODate(), location: '', work: '', problems: '', cause: '', solution: '', result: '' });
                setIncludeProvincialTrip(false);
                setTripDepartureTime('');
                setTripDetails('');
              }}
              className="px-5 py-2 rounded-lg border border-gray-300 text-sm font-medium text-slate-600 hover:bg-gray-50 focus:outline-none transition"
            >
              ล้างข้อมูล
            </button>
            <button
              type="button"
              onClick={openLeaveDialog}
              className="px-5 py-2 rounded-lg text-sm font-semibold border border-green-500 bg-green-500 text-white hover:bg-green-600 focus:outline-none shadow-sm"
            >
              ลา
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white shadow hover:opacity-90 disabled:opacity-60 focus:outline-none transition"
              style={{ background: 'linear-gradient(90deg,#1e3a5f,#2e86c1)' }}
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
        {leaveDialogOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 px-4 py-6 backdrop-blur-sm">
            <section role="dialog" aria-modal="true" aria-labelledby="leave-dialog-title" aria-describedby="leave-dialog-description"
              className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5 text-white shadow-2xl sm:p-6">
              <div className="mb-4 flex items-start gap-3">
                <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-300/20 bg-emerald-400/10 text-xl text-emerald-300">✓</span>
                <div>
                  <h2 id="leave-dialog-title" className="text-lg font-semibold">บันทึกการลา</h2>
                  <p id="leave-dialog-description" className="mt-1 text-sm text-slate-400">วันที่ {new Intl.DateTimeFormat('th-TH', { dateStyle: 'long' }).format(new Date(`${form.date}T00:00:00`))}</p>
                </div>
              </div>
              <label htmlFor="leave-reason" className="mb-1.5 block text-sm font-medium text-slate-200">เหตุผลการลา <span className="text-rose-300">*</span></label>
              <textarea id="leave-reason" rows={4} autoFocus required value={leaveReason}
                onChange={(event) => { setLeaveReason(event.target.value); setLeaveError(''); }}
                placeholder="เช่น ลาป่วย ลากิจ หรือนัดหมายส่วนตัว"
                className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20" />
              {leaveError && <p role="alert" className="mt-2 text-sm text-rose-300">{leaveError}</p>}
              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setLeaveDialogOpen(false)} disabled={leaveLoading}
                  className="min-h-10 rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50">ยกเลิก</button>
                <button type="button" onClick={handleLeave} disabled={leaveLoading}
                  className="min-h-10 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-wait disabled:opacity-60">
                  {leaveLoading ? 'กำลังบันทึก…' : 'บันทึกการลา'}
                </button>
              </div>
            </section>
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryPage({ onCreateReport }) {
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
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  useEffect(() => {
    async function fetchData() {
      if (!supabase) {
        setError('ยังไม่ได้ตั้งค่า Supabase (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      const pageSize = 1000;
      const allItems = [];
      let offset = 0;
      let fetchError = null;

      while (true) {
        const { data, error } = await supabase
          .from('daily_reports')
          .select('*')
          .order('date', { ascending: false })
          .order('created_at', { ascending: false })
          .range(offset, offset + pageSize - 1);

        if (error) {
          fetchError = error;
          break;
        }

        allItems.push(...(data || []));
        if (!data || data.length < pageSize) break;
        offset += pageSize;
      }

      if (fetchError) {
        setError('ไม่สามารถดึงข้อมูลได้: ' + fetchError.message);
        setItems([]);
      } else {
        setItems(allItems);
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  const groups = useMemo(() => items.reduce((acc, item) => {
    const key = item.date || 'ไม่ทราบวันที่';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {}), [items]);

  const sortedDates = useMemo(() => Object.keys(groups).sort((a, b) => {
    if (a === 'ไม่ทราบวันที่') return 1;
    if (b === 'ไม่ทราบวันที่') return -1;
    return new Date(b) - new Date(a);
  }), [groups]);

  const filteredDates = sortedDates.filter((dateKey) => {
    if (dateKey === 'ไม่ทราบวันที่') {
      return !filterStartDate && !filterEndDate;
    }
    const time = new Date(dateKey).getTime();
    if (Number.isNaN(time)) return false;

    if (filterStartDate) {
      const startTime = new Date(filterStartDate).getTime();
      if (time < startTime) return false;
    }
    if (filterEndDate) {
      const endTime = new Date(filterEndDate).getTime();
      if (time > endTime) return false;
    }
    return true;
  });
  const visibleItemCount = filteredDates.reduce((total, dateKey) => total + groups[dateKey].length, 0);
  const hasDateFilter = Boolean(filterStartDate || filterEndDate);

  const formatThaiDate = (isoDate) => {
    if (!isoDate || isoDate === 'ไม่ทราบวันที่') return 'ไม่ทราบวันที่';
    return new Intl.DateTimeFormat('th-TH', { dateStyle: 'long' }).format(new Date(isoDate));
  };

  const copyText = async (text) => {
    if (!text) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        requestAppDialog('alert', 'คัดลอกข้อความแล้ว');
      } else {
        await requestAppDialog('prompt', 'คัดลอกข้อความนี้ด้วยตนเอง:', text);
      }
    } catch {
      await requestAppDialog('prompt', 'คัดลอกข้อความนี้ด้วยตนเอง:', text);
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
      lines.push(parts.join('\n\n'));
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
      requestAppDialog('alert', 'ยังไม่ได้ตั้งค่า Supabase (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
      return;
    }

    const confirmDelete = await requestAppDialog('confirm', 'ต้องการลบรายการนี้ใช่หรือไม่?');
    if (!confirmDelete) return;

    const { error: deleteError } = await supabase
      .from('daily_reports')
      .delete()
      .eq('id', itemId);

    if (deleteError) {
      requestAppDialog('alert', 'ลบไม่สำเร็จ: ' + deleteError.message);
    } else {
      setItems((prev) => prev.filter((it) => it.id !== itemId));
      requestAppDialog('alert', 'ลบสำเร็จ');
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
      requestAppDialog('alert', 'อัปเดตสำเร็จ');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Page header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <div>
          <h1 className="text-xl font-bold text-slate-800">รายการสรุปทั้งหมด</h1>
          <p className="text-xs text-slate-500 mt-0.5">แสดงสรุปงานที่บันทึก แยกตามวันที่</p>
        </div>
        <div className="summary-tools flex flex-wrap items-center gap-2 self-start">
          <span
            className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-white shadow-sm"
            style={{ background: '#1e3a5f' }}
          >
            <IconEdit /> {visibleItemCount} รายการ
          </span>
          <div className="summary-date-filter flex flex-wrap items-center gap-1 text-[11px] text-slate-500">
            <span className="w-full sm:w-auto">กรองตามวันที่</span>
            <input
              type="date"
              aria-label="วันที่เริ่มต้น"
              title="วันที่เริ่มต้น"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="rounded border border-gray-300 bg-white px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span>-</span>
            <input
              type="date"
              aria-label="วันที่สิ้นสุด"
              title="วันที่สิ้นสุด"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="rounded border border-gray-300 bg-white px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {hasDateFilter && (
              <button type="button" onClick={() => { setFilterStartDate(''); setFilterEndDate(''); }}
                className="rounded-lg px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50 focus:outline-none">
                ล้างตัวกรอง
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-gray-50 focus:outline-none transition"
          >
            พิมพ์ / บันทึกเป็น PDF (A4)
          </button>
        </div>
      </div>

      {loading && <p className="text-sm text-slate-500">กำลังโหลดข้อมูล...</p>}
      {!loading && error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && filteredDates.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700"><IconClipboard /></div>
          <h2 className="text-base font-semibold text-slate-800">{hasDateFilter ? 'ไม่พบรายงานในช่วงวันที่นี้' : 'ยังไม่มีรายงานที่บันทึกไว้'}</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            {hasDateFilter ? 'ลองเปลี่ยนช่วงวันที่ หรือล้างตัวกรองเพื่อดูรายการทั้งหมด' : 'เมื่อบันทึกรายงานแล้ว รายการจะแสดงที่หน้านี้'}
          </p>
          <button type="button"
            onClick={hasDateFilter ? () => { setFilterStartDate(''); setFilterEndDate(''); } : onCreateReport}
            className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800">
            {hasDateFilter ? 'ล้างตัวกรอง' : 'ไปบันทึกรายงาน'}
          </button>
        </div>
      )}

      {!loading && !error && filteredDates.map((dateKey) => {
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
                className="no-print inline-flex items-center gap-1.5 rounded-lg border border-blue-400/50 bg-white/10 px-3 py-1.5
                  text-xs font-medium text-white hover:bg-white/20 focus:outline-none transition whitespace-nowrap">
                <IconCopy /> คัดลอกทั้งวัน
              </button>
            </header>

            <div className="divide-y divide-gray-100">
              {group.map((item) => (
                <div key={item.id} className="px-5 py-4 hover:bg-slate-50 transition">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm mb-3">
                    {[['สถานที่',item.location],['งานที่ทำวันนี้',item.work_today],
                      ['ปัญหาที่พบ',item.problems],['สาเหตุของปัญหา',item.cause],
                      ['วิธีแก้ปัญหา',item.solution],['ผล',item.result]]
                      .filter(([, value]) => value !== null && value !== undefined && value !== '')
                      .map(([lbl,val]) => (
                      <div key={lbl}>
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{lbl}</span>
                        <p className="mt-0.5 whitespace-pre-wrap break-words text-slate-700 leading-snug">{val || <span className="text-slate-300">—</span>}</p>
                      </div>
                    ))}
                  </div>
                  <div className="no-print flex flex-wrap gap-2 justify-end">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-5">
          <div role="dialog" aria-modal="true" aria-labelledby="edit-dialog-title" className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between"
              style={{ background: 'linear-gradient(90deg,#1e3a5f,#1a5276)' }}>
              <h2 id="edit-dialog-title" className="text-sm font-semibold text-white flex items-center gap-2"><IconEdit /> แก้ไขสรุปงาน</h2>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-5">
          <div role="dialog" aria-modal="true" aria-labelledby="copy-dialog-title" className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between"
              style={{ background: 'linear-gradient(90deg,#1e3a5f,#1a5276)' }}>
              <h2 id="copy-dialog-title" className="text-sm font-semibold text-white flex items-center gap-2"><IconCopy /> คัดลอกข้อความ</h2>
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
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importItems, setImportItems] = useState([]);
  const [importSkipped, setImportSkipped] = useState(0);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const importFileRef = useRef(null);

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

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const openAddNote = (isoDate) => {
    setSelectedDate(isoDate);
    setNote('');
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!selectedDate || !note.trim()) return;
    if (!supabase) {
      requestAppDialog('alert', 'ยังไม่ได้ตั้งค่า Supabase (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
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
      requestAppDialog('alert', 'บันทึกโน้ตไม่สำเร็จ: ' + error.message);
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
      requestAppDialog('alert', 'ยังไม่ได้ตั้งค่าการเชื่อมต่อ Supabase');
      return;
    }
    const confirmDelete = await requestAppDialog('confirm', 'ต้องการลบโน้ตนี้ใช่หรือไม่?');
    if (!confirmDelete) return;

    const { error } = await supabase
      .from('calendar_notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      requestAppDialog('alert', 'ลบโน้ตไม่สำเร็จ: ' + error.message);
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

  const updateImportText = (value) => {
    setImportText(value);
    const parsed = parseSheetTable(value);
    setImportItems(parsed.items);
    setImportSkipped(parsed.skipped);
    setImportMessage('');
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    updateImportText(await file.text());
  };

  const handleImportSheet = async () => {
    if (!importItems.length || importing) return;
    if (!supabase) {
      setImportMessage('ยังไม่ได้ตั้งค่า Supabase จึงนำเข้าข้อมูลไม่ได้');
      return;
    }
    setImporting(true);
    setImportMessage('กำลังนำเข้ารายการ...');
    let inserted = 0;
    let importError = null;
    for (let i = 0; i < importItems.length; i += 100) {
      const { error: batchError } = await supabase.from('calendar_notes').insert(importItems.slice(i, i + 100));
      if (batchError) { importError = batchError; break; }
      inserted += Math.min(100, importItems.length - i);
    }
    setImporting(false);
    if (importError) {
      setImportMessage(`นำเข้าได้ ${inserted} รายการ แล้วพบข้อผิดพลาด: ${importError.message}`);
      if (inserted) loadMonthData();
      return;
    }
    setImportMessage(`นำเข้าสำเร็จ ${inserted} รายการ${importSkipped ? ` · ข้าม ${importSkipped} แถวที่ไม่มีวันที่หรือรายละเอียด` : ''}`);
    await loadMonthData();
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
    while (cells.length % 7 !== 0) cells.push(null);
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
        <div className="flex items-center gap-2 self-start">
          <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-white shadow-sm"
            style={{ background: '#1e3a5f' }}>
            <IconCalendar /> ตารางงาน
          </span>
          <button type="button" onClick={() => { setImportOpen(true); setImportMessage(''); }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-800 shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300">
            <IconCopy /> นำเข้าจากชีต
          </button>
        </div>
      </div>

      <p className="-mt-3 text-sm text-slate-500">เลือกวันที่เพื่อเพิ่มโน้ตงาน หรือเลือกวันที่มีรายการเพื่อดูและจัดการโน้ต</p>

      <section className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
        {/* Calendar header */}
        <div className="px-5 py-4 flex items-center justify-between"
          style={{ background: 'linear-gradient(90deg,#1e3a5f 0%,#1a5276 100%)' }}>
          <button type="button" aria-label="เดือนก่อนหน้า" title="เดือนก่อนหน้า" onClick={handlePrevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-full text-blue-200 hover:bg-white/20 text-lg leading-none focus:outline-none transition">
            ‹
          </button>
          <div className="flex items-center gap-3">
            <div className="text-base font-semibold text-white">{formatMonthYearThai(currentMonth)}</div>
            <button type="button" onClick={handleToday}
              className="rounded-full border border-white/30 px-3 py-1 text-xs font-medium text-white hover:bg-white/10 focus:outline-none">
              วันนี้
            </button>
          </div>
          <button type="button" aria-label="เดือนถัดไป" title="เดือนถัดไป" onClick={handleNextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-full text-blue-200 hover:bg-white/20 text-lg leading-none focus:outline-none transition">
            ›
          </button>
        </div>

        {error && <p className="px-5 py-2 text-xs text-red-600 bg-red-50">{error}</p>}
        {loading && <p className="px-5 py-2 text-xs text-slate-500">กำลังโหลดข้อมูล...</p>}

        {/* Calendar compresses into seven readable columns on phones */}
        <div className="w-full min-w-0">
          <div className="daily-calendar-grid grid w-full min-w-0 grid-cols-7 gap-px" style={{ background: '#1a2736', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
            {daysOfWeek.map((d) => (
              <div
                key={d}
                className="calendar-weekday bg-blue-50 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500"
              >
                {d}
              </div>
            ))}
            {cells.map((cell, index) => {
              if (!cell)
                return (
                  <div
                    key={`empty-${index}`}
                    className="calendar-empty h-20 bg-slate-50 sm:h-24"
                  />
                );
              const dayEvents = eventsByDate[cell.iso] || [];
              const isToday = cell.iso === toISODate(new Date());
              return (
                <button
                  key={cell.iso}
                  type="button"
                  aria-label={`${new Intl.DateTimeFormat('th-TH', { dateStyle: 'full' }).format(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), cell.day))}${dayEvents.length ? ` มี ${dayEvents.length} โน้ต` : ''}`}
                  onClick={() => openAddNote(cell.iso)}
                    className="daily-calendar-day relative flex h-20 w-full min-w-0 flex-col items-start bg-white p-1.5 text-left transition hover:bg-blue-50 focus:z-10 focus:outline-none sm:h-24 sm:p-2"
                >
                  <span
                    className={`text-[11px] sm:text-xs font-bold mb-1 w-5 h-5 flex items-center justify-center rounded-full ${
                      isToday ? 'text-white' : 'text-slate-600'
                    }`}
                    style={isToday ? { background: '#2e86c1' } : {}}
                  >
                    {cell.day}
                  </span>
                  <div className="space-y-0.5 w-full overflow-hidden">
                    {dayEvents.length > 0 && <span className="calendar-note-mobile block w-full truncate rounded bg-blue-50 px-1 py-0.5 text-[9px] font-semibold leading-tight text-blue-800 sm:hidden">{dayEvents[0].note || 'มีงาน'}</span>}
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className="calendar-note-pill hidden line-clamp-2 whitespace-pre-wrap break-words rounded-md border border-blue-100 bg-blue-50 px-1.5 py-1 text-[10px] font-medium text-blue-800 sm:block"
                      >
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
        </div>
      </section>

      {importOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 px-4 py-5">
          <div role="dialog" aria-modal="true" aria-labelledby="sheet-import-title" className="w-full max-w-2xl max-h-[calc(100vh-2.5rem)] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between rounded-t-2xl px-5 py-4 text-white" style={{ background: 'linear-gradient(90deg,#1e3a5f,#1a5276)' }}>
              <div>
                <h2 id="sheet-import-title" className="text-base font-semibold">นำเข้าตารางจากชีต</h2>
                <p className="mt-0.5 text-xs text-blue-200">คัดลอกเซลล์จาก Google Sheets แล้ววาง หรือเลือกไฟล์ CSV/TSV</p>
              </div>
              <button type="button" onClick={() => setImportOpen(false)} aria-label="ปิดหน้าต่างนำเข้า" className="rounded-lg px-2 py-1 text-2xl leading-none text-blue-100 hover:bg-white/10">×</button>
            </div>
            <div className="space-y-4 p-5">
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-900">
                ใช้หัวคอลัมน์ <strong>วันที่</strong> และ <strong>รายละเอียดงาน</strong> · รองรับวันที่ พ.ศ./ค.ศ. เช่น 24/11/2569 หรือ 2026-11-24
              </div>
              <div>
                <label htmlFor="sheet-import-text" className="mb-1.5 block text-sm font-semibold text-slate-700">วางข้อมูลจากชีต</label>
                <textarea id="sheet-import-text" value={importText} onChange={(event) => updateImportText(event.target.value)} rows={7}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-xs leading-5 text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder={'วันที่\tรายละเอียดงาน\n24/11/2569\tประชุมติดตามงาน\n25/11/2569\tจัดทำรายงาน'} />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <input ref={importFileRef} type="file" accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values" onChange={handleImportFile} className="hidden" />
                <button type="button" onClick={() => importFileRef.current?.click()} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">เลือกไฟล์ CSV/TSV</button>
                {importItems.length > 0 && <span className="text-xs text-emerald-700">พบ {importItems.length} รายการ{importSkipped ? ` · ข้าม ${importSkipped} แถว` : ''}</span>}
              </div>
              {importItems.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">ตัวอย่างข้อมูลนำเข้า · {importItems.length} รายการ</div>
                  <div className="max-h-40 overflow-y-auto divide-y divide-slate-100">
                    {importItems.slice(0, 5).map((item, index) => (
                      <div key={`${item.date}-${index}`} className="grid grid-cols-[120px_1fr] gap-3 px-3 py-2 text-xs text-slate-700">
                        <span className="font-medium">{item.date}</span><span className="whitespace-pre-wrap">{item.note}</span>
                      </div>
                    ))}
                    {importItems.length > 5 && <p className="px-3 py-2 text-[11px] text-slate-400">และอีก {importItems.length - 5} รายการ</p>}
                  </div>
                </div>
              )}
              {importMessage && <p role="status" className={`rounded-lg px-3 py-2 text-xs ${importMessage.includes('ข้อผิดพลาด') || importMessage.includes('ไม่ได้') ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-600'}`}>{importMessage}</p>}
              <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
                <button type="button" onClick={() => setImportOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">ปิด</button>
                <button type="button" onClick={handleImportSheet} disabled={!importItems.length || importing} className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-50" style={{ background: 'linear-gradient(90deg,#1e3a5f,#2e86c1)' }}>
                  {importing ? 'กำลังนำเข้า...' : `นำเข้า ${importItems.length || ''} รายการ`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Note Modal ─── */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-5">
          <div role="dialog" aria-modal="true" aria-labelledby="calendar-dialog-title" className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[calc(100vh-2.5rem)] overflow-y-auto">
            <div className="px-6 py-4 flex items-center justify-between"
              style={{ background: 'linear-gradient(90deg,#1e3a5f,#1a5276)' }}>
              <div>
                <h2 id="calendar-dialog-title" className="text-sm font-semibold text-white flex items-center gap-2"><IconCalendar /> บันทึกวัน</h2>
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
                    <div key={ev.id} className="flex items-start justify-between gap-3 px-3 py-2 text-xs text-slate-700">
                      <span className="flex-1 whitespace-pre-wrap break-words">{ev.note}</span>
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

async function optimizeImageForUpload(file) {
  if (!file.type.startsWith('image/') || /\.(gif|svg|apng)$/i.test(file.name)) {
    return { file, optimized: false, reason: 'คงไฟล์ต้นฉบับ' };
  }

  let imageSource;
  let width;
  let height;
  let cleanup = () => {};
  try {
    if (typeof createImageBitmap === 'function') {
      const bitmap = await createImageBitmap(file);
      imageSource = bitmap;
      width = bitmap.width;
      height = bitmap.height;
      cleanup = () => bitmap.close();
    }
  } catch {
    // Fall back to the browser image decoder below.
  }
  if (!imageSource) {
    const sourceUrl = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = sourceUrl;
      await image.decode();
      imageSource = image;
      width = image.naturalWidth;
      height = image.naturalHeight;
      cleanup = () => URL.revokeObjectURL(sourceUrl);
    } catch {
      URL.revokeObjectURL(sourceUrl);
      return { file, optimized: false, reason: 'เปิดไฟล์ภาพเพื่อย่อไม่ได้ ใช้ไฟล์เดิม' };
    }
  }

  try {
    const maxDimension = 1920;
    const scale = Math.min(1, maxDimension / Math.max(width, height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const context = canvas.getContext('2d');
    if (!context) return { file, optimized: false, reason: 'เบราว์เซอร์ไม่รองรับการย่อภาพ ใช้ไฟล์เดิม' };
    context.drawImage(imageSource, 0, 0, canvas.width, canvas.height);

    const encode = (quality) => new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
    let blob = await encode(0.84);
    if (!blob) return { file, optimized: false, reason: 'บีบอัดภาพไม่ได้ ใช้ไฟล์เดิม' };
    if (blob.size > 1_500_000) {
      blob = await encode(0.74) || blob;
    }
    if (blob.size >= file.size && scale === 1) {
      return { file, optimized: false, reason: 'ไฟล์เดิมมีขนาดเล็กกว่าไฟล์ที่บีบอัด' };
    }
    if (blob.size >= file.size) return { file, optimized: false, reason: 'ไฟล์เดิมมีขนาดเล็กกว่าไฟล์ที่บีบอัด' };

    const extension = blob.type === 'image/webp' ? 'webp' : 'png';
    const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
    const optimizedFile = new File([blob], `${baseName}.${extension}`, { type: blob.type || 'image/webp', lastModified: file.lastModified });
    return { file: optimizedFile, optimized: true, reason: '' };
  } catch {
    return { file, optimized: false, reason: 'ย่อภาพไม่ได้ ใช้ไฟล์เดิม' };
  } finally {
    cleanup();
  }
}

function MediaPage() {
  const [uploadDate, setUploadDate] = useState('');
  const [uploadDetails, setUploadDetails] = useState('');
  const [viewDate, setViewDate] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [preparingFiles, setPreparingFiles] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [groupMetadata, setGroupMetadata] = useState({});
  const [editingGroupKey, setEditingGroupKey] = useState('');
  const [groupDetailsDraft, setGroupDetailsDraft] = useState('');
  const [groupDateDraft, setGroupDateDraft] = useState('');
  const [filesLoading, setFilesLoading] = useState(false);
  const [filesError, setFilesError] = useState('');
  const groupFileInputRefs = useRef({});
  const previewUrlsRef = useRef(new Set());

  useEffect(() => () => {
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrlsRef.current.clear();
  }, []);

  const uploadFolder = uploadDate || 'no-date';

  const loadFiles = async () => {
    if (!supabase) {
      setFilesError('ยังไม่ได้ตั้งค่า Supabase (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
      setFiles([]);
      return;
    }
    setFilesLoading(true);
    setFilesError('');
    try {
      const allFiles = [];
      const walkFolder = async (folder = '', depth = 0) => {
        if (depth > 12) throw new Error('โครงสร้างโฟลเดอร์ลึกเกินกว่าที่ตรวจสอบได้');
        const folders = [];
        let offset = 0;
        while (true) {
          const { data, error } = await supabase.storage.from('media').list(folder, {
            limit: 1000, offset, sortBy: { column: 'name', order: 'desc' },
          });
          if (error) throw error;
          const entries = data || [];
          entries.forEach((item) => {
            const path = folder ? `${folder}/${item.name}` : item.name;
            if (item.metadata && item.metadata.size !== undefined) {
              allFiles.push({ ...item, folder: folder || 'ไฟล์ทั่วไป', path });
            } else if (item.name) {
              folders.push(path);
            }
          });
          if (entries.length < 1000) break;
          offset += entries.length;
        }
        for (const childFolder of folders) await walkFolder(childFolder, depth + 1);
      };

      await walkFolder();
      const getGroupKeyFromManifest = (path) => {
        const parts = path.split('/');
        const fileName = parts.at(-1);
        if (fileName === '_group.json' && parts.length >= 3) return `${parts[0]}/${parts[1]}`;
        if (fileName === '_legacy.json') return `${parts.length >= 2 ? parts[0] : 'no-date'}/legacy`;
        return '';
      };
      const manifestFiles = allFiles.filter((item) => ['_group.json', '_legacy.json'].includes(item.name));
      const loadedMetadata = {};
      for (let start = 0; start < manifestFiles.length; start += 8) {
        const batch = manifestFiles.slice(start, start + 8);
        const results = await Promise.all(batch.map(async (item) => {
          const key = getGroupKeyFromManifest(item.path);
          if (!key) return null;
          const { data, error } = await supabase.storage.from('media').download(item.path);
          if (error || !data) return null;
          try {
            return [key, JSON.parse(await data.text())];
          } catch {
            return null;
          }
        }));
        results.filter(Boolean).forEach(([key, value]) => { loadedMetadata[key] = value; });
      }
      setGroupMetadata(loadedMetadata);

      const mediaFiles = allFiles.filter((item) => item.metadata && !['_group.json', '_legacy.json'].includes(item.name));
      mediaFiles.sort((a, b) => b.folder.localeCompare(a.folder) || b.name.localeCompare(a.name));
      setFiles(mediaFiles.map((item) => ({ ...item, publicUrl: '' })));

      // Sign media previews in small batches so large libraries do not flood Storage.
      for (let start = 0; start < mediaFiles.length; start += 12) {
        const batch = mediaFiles.slice(start, start + 12);
        const previews = await Promise.all(batch.map(async (item) => {
          if (!/\.(png|jpe?g|gif|webp|svg|mp4|mov|m4v|webm)$/i.test(item.name || '')) return null;
          const { data, error } = await supabase.storage.from('media').createSignedUrl(item.path, 60 * 60);
          return data?.signedUrl ? [item.path, data.signedUrl] : null;
        }));
        const signedByPath = new Map(previews.filter(Boolean));
        if (signedByPath.size) {
          setFiles((prev) => prev.map((item) => signedByPath.has(item.path)
            ? { ...item, publicUrl: signedByPath.get(item.path) }
            : item));
        }
      }
    } catch (error) {
      setFilesError('ไม่สามารถดึงรายการไฟล์ได้: ' + (error.message || 'ไม่ทราบสาเหตุ'));
      setFiles([]);
    } finally {
      setFilesLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectFiles = async (event) => {
    const additions = Array.from(event.target.files || []);
    event.target.value = '';
    if (!additions.length || preparingFiles || uploading) return;
    const fileKey = (file) => `${file.name}:${file.size}:${file.lastModified}`;
    const queued = new Set(selectedFiles.map((item) => fileKey(item.sourceFile)));
    const newFiles = additions.filter((file) => {
      const key = fileKey(file);
      if (queued.has(key)) return false;
      queued.add(key);
      return true;
    });
    if (!newFiles.length) return;

    setPreparingFiles(true);
    setStatus('กำลังเตรียมตัวอย่างและย่อรูป…');
    const prepared = [];
    for (let index = 0; index < newFiles.length; index += 1) {
      const sourceFile = newFiles[index];
      setStatus(`กำลังเตรียมไฟล์ ${index + 1}/${newFiles.length}…`);
      const optimized = await optimizeImageForUpload(sourceFile);
      const previewUrl = URL.createObjectURL(optimized.file);
      previewUrlsRef.current.add(previewUrl);
      prepared.push({
        key: fileKey(sourceFile), sourceFile, file: optimized.file, previewUrl,
        optimized: optimized.optimized, reason: optimized.reason,
      });
    }
    setSelectedFiles((current) => {
      const currentKeys = new Set(current.map((item) => item.key));
      return [...current, ...prepared.filter((item) => !currentKeys.has(item.key))];
    });
    setPreparingFiles(false);
    setStatus('');
  };

  const removeQueuedFile = (key) => {
    setSelectedFiles((current) => {
      const removed = current.find((item) => item.key === key);
      if (removed) {
        URL.revokeObjectURL(removed.previewUrl);
        previewUrlsRef.current.delete(removed.previewUrl);
      }
      return current.filter((item) => item.key !== key);
    });
  };

  const clearQueuedFiles = () => {
    selectedFiles.forEach((item) => {
      URL.revokeObjectURL(item.previewUrl);
      previewUrlsRef.current.delete(item.previewUrl);
    });
    setSelectedFiles([]);
    setStatus('');
  };

  const handleUpload = async () => {
    if (uploading || preparingFiles) return;
    if (!selectedFiles.length) {
      setStatus('กรุณาเลือกไฟล์ก่อน');
      return;
    }
    if (!supabase) {
      setStatus('ยังไม่ได้ตั้งค่า Supabase (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
      return;
    }
    setUploading(true);
    const groupId = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const groupPath = `${uploadFolder}/${groupId}`;
    let uploadedCount = 0;
    const failedFiles = [];
    for (let index = 0; index < selectedFiles.length; index += 1) {
      const selectedFile = selectedFiles[index];
      setStatus(`กำลังอัปโหลด ${index + 1}/${selectedFiles.length} ไฟล์…`);
      // ทำชื่อไฟล์ให้ปลอดภัยสำหรับ Supabase และเติมเวลา/ลำดับเพื่อไม่ให้ชื่อชนกัน
      const safeName = selectedFile.file.name
        .normalize('NFKD')
        .replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${groupPath}/${Date.now()}-${index}-${safeName}`;
      try {
        const { error } = await supabase.storage
          .from('media')
          .upload(path, selectedFile.file, { upsert: false, cacheControl: '3600', contentType: selectedFile.file.type || undefined });
        if (error) {
          failedFiles.push(selectedFile.sourceFile.name);
        } else uploadedCount += 1;
      } catch (error) {
        failedFiles.push(selectedFile.sourceFile.name);
      }
    }
    let metadataSaved = true;
    if (uploadedCount) {
      const manifest = new Blob([JSON.stringify({ details: uploadDetails.trim(), date: uploadDate, createdAt: new Date().toISOString() })], { type: 'application/json' });
      const { error } = await supabase.storage.from('media').upload(`${groupPath}/_group.json`, manifest, {
        upsert: true, cacheControl: '3600', contentType: 'application/json',
      });
      if (error) {
        metadataSaved = false;
      }
    }
    setUploading(false);
    selectedFiles.forEach((item) => {
      URL.revokeObjectURL(item.previewUrl);
      previewUrlsRef.current.delete(item.previewUrl);
    });
    setSelectedFiles([]);
    if (uploadedCount) setUploadDetails('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (failedFiles.length) {
      setStatus(`อัปโหลดสำเร็จ ${uploadedCount} ไฟล์ · ไม่สำเร็จ ${failedFiles.length} ไฟล์`);
    } else if (!metadataSaved) {
      setStatus(`อัปโหลดรูปสำเร็จ ${uploadedCount} ไฟล์ แต่บันทึกรายละเอียดกลุ่มไม่สำเร็จ`);
    } else {
      setStatus(`สร้างกลุ่มใหม่และอัปโหลดสำเร็จ ${uploadedCount} ไฟล์`);
    }
    if (uploadedCount) loadFiles();
  };

  const saveGroupDetails = async (group) => {
    if (!supabase) return;
    const manifestPath = group.isLegacy
      ? `${group.dateFolder}/_legacy.json`
      : `${group.storagePath}/_group.json`;
    const manifest = new Blob([JSON.stringify({
      details: groupDetailsDraft.trim(),
      date: groupDateDraft,
      createdAt: groupMetadata[group.key]?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })], { type: 'application/json' });
    const { error } = await supabase.storage.from('media').upload(manifestPath, manifest, {
      upsert: true, cacheControl: '3600', contentType: 'application/json',
    });
    if (error) {
      setStatus(`บันทึกรายละเอียดกลุ่มไม่สำเร็จ: ${error.message || 'ไม่ทราบสาเหตุ'}`);
      return;
    }
    setGroupMetadata((current) => ({ ...current, [group.key]: { ...current[group.key], details: groupDetailsDraft.trim(), date: groupDateDraft } }));
    setEditingGroupKey('');
    setStatus('บันทึกรายละเอียดกลุ่มแล้ว');
  };

  const handleAddFilesToGroup = async (group, additions) => {
    if (!additions.length || !supabase) return;
    setUploading(true);
    let uploadedCount = 0;
    for (let index = 0; index < additions.length; index += 1) {
      const sourceFile = additions[index];
      setStatus(`กำลังเตรียมและเพิ่มไฟล์ ${index + 1}/${additions.length}…`);
      const { file } = await optimizeImageForUpload(sourceFile);
      const safeName = file.name.normalize('NFKD').replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${group.storagePath}/${Date.now()}-${index}-${safeName}`;
      const { error } = await supabase.storage.from('media').upload(path, file, { upsert: false, cacheControl: '3600', contentType: file.type || undefined });
      if (error) {
      } else uploadedCount += 1;
    }
    setUploading(false);
    setStatus('');
    setStatus(`เพิ่มรูป/วิดีโอในกลุ่มสำเร็จ ${uploadedCount} จาก ${additions.length} ไฟล์`);
    if (uploadedCount) await loadFiles();
  };

  const handleDeleteGroup = async (group) => {
    const confirmed = await requestAppDialog('confirm', `ต้องการลบทั้งกลุ่ม “${group.details || formatMediaFolder(group.dateFolder)}” และไฟล์ ${group.files.length} รายการหรือไม่?`);
    if (!confirmed || !supabase) return;
    const groupPaths = group.isLegacy
      ? [...group.files.map((file) => file.path), `${group.dateFolder}/_legacy.json`]
      : [...group.files.map((file) => file.path), `${group.storagePath}/_group.json`];
    const uniquePaths = [...new Set(groupPaths)];
    for (let start = 0; start < uniquePaths.length; start += 100) {
      const { error } = await supabase.storage.from('media').remove(uniquePaths.slice(start, start + 100));
      if (error) {
        setStatus(`ลบกลุ่มไม่สำเร็จ: ${error.message || 'ไม่ทราบสาเหตุ'}`);
        return;
      }
    }
    setStatus('ลบกลุ่มและไฟล์ทั้งหมดแล้ว');
    setGroupMetadata((current) => {
      const next = { ...current };
      delete next[group.key];
      return next;
    });
    setFiles((current) => current.filter((file) => !group.files.some((groupFile) => groupFile.path === file.path)));
  };

  const handleDeleteFile = async (path) => {
    if (!supabase) {
      setStatus('ยังไม่ได้ตั้งค่า Supabase (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
      return;
    }
    const confirmDelete = await requestAppDialog('confirm', 'ต้องการลบไฟล์นี้ใช่หรือไม่?');
    if (!confirmDelete) return;

    const parts = path.split('/');
    const key = parts.length >= 3 ? `${parts[0]}/${parts[1]}` : `${parts.length >= 2 ? parts[0] : 'no-date'}/legacy`;
    const isLastInGroup = files.filter((file) => {
      const fileParts = file.path.split('/');
      const fileKey = fileParts.length >= 3 ? `${fileParts[0]}/${fileParts[1]}` : `${fileParts.length >= 2 ? fileParts[0] : 'no-date'}/legacy`;
      return fileKey === key;
    }).length === 1;
    const manifestPath = key.endsWith('/legacy')
      ? `${key.split('/')[0]}/_legacy.json`
      : `${key}/_group.json`;
    const { error } = await supabase.storage.from('media').remove(isLastInGroup ? [path, manifestPath] : [path]);
    if (error) {
      setStatus('ลบไฟล์ไม่สำเร็จ: ' + (error.message || 'ไม่ทราบสาเหตุ'));
    } else {
      setStatus('ลบไฟล์สำเร็จ');
      setFiles((prev) => prev.filter((f) => f.path !== path));
    }
  };

  const isImageFile = (name) => /\.(png|jpe?g|gif|webp|svg)$/i.test(name || '');
  const isVideoFile = (name) => /\.(mp4|mov|m4v|webm|ogv)$/i.test(name || '');
  const mediaGroups = Object.values(files.reduce((groups, file) => {
    const parts = file.path.split('/');
    const isGroupedPath = parts.length >= 3;
    const dateFolder = parts.length >= 2 ? parts[0] : 'no-date';
    const groupId = isGroupedPath ? parts[1] : 'legacy';
    const key = `${dateFolder}/${groupId}`;
    const isLegacy = groupId === 'legacy';
    const storagePath = isGroupedPath ? `${parts[0]}/${parts[1]}` : dateFolder;
    if (!groups[key]) {
      groups[key] = {
        key, dateFolder, groupId, storagePath, isLegacy,
        details: groupMetadata[key]?.details || '',
        date: groupMetadata[key]?.date ?? dateFolder,
        createdAt: groupMetadata[key]?.createdAt || '',
        files: [],
      };
    }
    groups[key].files.push(file);
    return groups;
  }, {}));
  const mediaFolders = [...new Set(mediaGroups.map((group) => group.date || 'no-date'))].sort((a, b) => b.localeCompare(a));
  const visibleGroups = mediaGroups.filter((group) => !viewDate || (group.date || 'no-date') === viewDate)
    .sort((a, b) => (b.date || 'no-date').localeCompare(a.date || 'no-date') || b.createdAt.localeCompare(a.createdAt) || b.key.localeCompare(a.key));
  const groupsByDate = visibleGroups.reduce((groups, group) => {
    ((groups[group.date || 'no-date'] ||= [])).push(group);
    return groups;
  }, {});
  const visibleFilesCount = visibleGroups.reduce((total, group) => total + group.files.length, 0);
  const queuedOriginalBytes = selectedFiles.reduce((total, item) => total + item.sourceFile.size, 0);
  const queuedUploadBytes = selectedFiles.reduce((total, item) => total + item.file.size, 0);
  const formatMediaFolder = (folder) => {
    if (folder === 'no-date') return 'ไม่ระบุวันที่';
    if (folder === 'ไฟล์ทั่วไป') return 'ไฟล์ทั่วไป';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(folder)) return folder;
    return new Intl.DateTimeFormat('th-TH', { dateStyle: 'long' }).format(new Date(`${folder}T00:00:00`));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <div>
          <h1 className="text-xl font-bold text-slate-800">บันทึกภาพและวิดีโอ</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start">
          <span
            className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-white shadow-sm"
            style={{ background: '#1e3a5f' }}
          >
            <IconPhoto /> สื่อและไฟล์
          </span>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-gray-50 focus:outline-none transition"
          >
            พิมพ์ / บันทึกเป็น PDF (A4)
          </button>
        </div>
      </div>

      {/* Upload card */}
      <section className="no-print bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100"
          style={{ background: 'linear-gradient(90deg,#1e3a5f 0%,#1a5276 100%)' }}>
          <h2 className="text-sm font-semibold text-white">สร้างกลุ่มรูปภาพ / วิดีโอ</h2>
          <p className="text-[11px] text-blue-300 mt-0.5">หนึ่งกลุ่มมีวันที่ รายละเอียด และไฟล์หลายรายการ</p>
        </div>
        <div className="px-5 sm:px-7 py-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="upload-date"
                className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1">วันที่ของไฟล์</label>
              <input type="date" id="upload-date" value={uploadDate}
                onChange={e => setUploadDate(e.target.value)}
                className="block w-full rounded-lg border border-gray-200 bg-slate-50 px-3 py-2.5 text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
              <p className="mt-1 text-xs text-slate-400">เลือกวันที่ก่อนอัปโหลด ไฟล์ที่ไม่ระบุวันที่จะอยู่ใน “ไม่ระบุวันที่”</p>
            </div>
            <div>
              <label htmlFor="media-details"
                className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1">รายละเอียดของกลุ่ม</label>
              <textarea id="media-details" rows={2} value={uploadDetails} onChange={(event) => setUploadDetails(event.target.value)}
                className="block w-full resize-y rounded-lg border border-gray-200 bg-slate-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="เช่น ติดตั้งเครื่องจักรที่โรงงานลูกค้า" />
              <p className="mt-1 text-xs text-slate-400">แก้ไขภายหลังได้จากหัวกลุ่ม</p>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="media-file"
                className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1">เลือกไฟล์</label>
              <div className="media-file-picker rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 transition hover:border-blue-400 hover:bg-blue-50/50">
              <input ref={fileInputRef} type="file" id="media-file" accept="image/*,video/*" multiple
                onChange={handleSelectFiles} disabled={preparingFiles || uploading}
                className="block w-full text-sm text-slate-600 rounded-lg border border-gray-200 bg-slate-50 px-3 py-2
                  file:mr-3 file:rounded-md file:border-0 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white
                  file:bg-[#1e3a5f] hover:file:bg-[#2e86c1] focus:outline-none"
              />
              <p className="mt-2 truncate text-xs font-medium text-slate-500">
                {selectedFiles.length
                  ? `เลือกแล้ว ${selectedFiles.length} ไฟล์ · ${selectedFiles.slice(0, 2).map((item) => item.sourceFile.name).join(', ')}${selectedFiles.length > 2 ? ` และอีก ${selectedFiles.length - 2} ไฟล์` : ''}`
                  : 'เลือกได้หลายไฟล์พร้อมกัน หรือเปิดเลือกเพิ่มทีละรูปได้'}
              </p>
              {selectedFiles.length > 0 && <>
                <p className="mt-2 text-xs text-slate-500">รวม {formatMetricBytes(queuedOriginalBytes)} → {formatMetricBytes(queuedUploadBytes)} ก่อนอัปโหลด · ภาพย่อสูงสุด 1920 px · วิดีโอไม่ถูกแปลง</p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {selectedFiles.map((item) => (
                    <article key={item.key} className="relative min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
                      <button type="button" onClick={() => removeQueuedFile(item.key)} aria-label={`นำ ${item.sourceFile.name} ออกจากรายการ`}
                        className="absolute right-1.5 top-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/75 text-lg leading-none text-white shadow hover:bg-rose-700">×</button>
                      <div className="aspect-[4/3] overflow-hidden bg-slate-900">
                        {item.file.type.startsWith('video/')
                          ? <video src={item.previewUrl} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                          : <img src={item.previewUrl} alt={`ตัวอย่าง ${item.sourceFile.name}`} className="h-full w-full object-cover" />}
                      </div>
                      <div className="p-2">
                        <p title={item.sourceFile.name} className="truncate text-[11px] font-semibold text-slate-700">{item.sourceFile.name}</p>
                        <p className="mt-0.5 text-[10px] text-slate-500">{formatMetricBytes(item.sourceFile.size)} → {formatMetricBytes(item.file.size)}</p>
                        <p className={`mt-1 text-[10px] font-semibold ${item.optimized ? 'text-emerald-700' : 'text-slate-500'}`}>
                          {item.optimized ? `ย่อแล้ว ${Math.max(1, Math.round((1 - item.file.size / item.sourceFile.size) * 100))}%` : item.reason || 'ใช้ไฟล์เดิม'}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
                <p className="mt-3 text-xs text-slate-500">ไฟล์ที่เลือกทั้งหมดจะบันทึกเป็นกลุ่มเดียวกันตามวันที่และรายละเอียดด้านบน</p>
                <button type="button" onClick={clearQueuedFiles} disabled={preparingFiles || uploading} className="mt-2 text-xs font-semibold text-blue-700 hover:underline disabled:opacity-50">ล้างรายการที่เลือก</button>
              </>}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              {status && (
                <p className={`text-xs px-3 py-2 rounded-lg ${
                  status.startsWith('กำลัง')
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : status.includes('ไม่สำเร็จ')
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : status.includes('สำเร็จ')
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>{status}</p>
              )}
            </div>
            <button type="button" onClick={handleUpload} disabled={!selectedFiles.length || uploading || preparingFiles}
              className="shrink-0 px-5 py-2.5 rounded-lg text-sm font-semibold text-white shadow
                hover:opacity-90 focus:outline-none transition disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: 'linear-gradient(90deg,#1e3a5f,#2e86c1)' }}>
              {preparingFiles ? 'กำลังเตรียมรูป…' : uploading ? status : `อัปโหลด ${selectedFiles.length || ''} ไฟล์`}
            </button>
          </div>
        </div>
      </section>

      {/* File list card */}
      <section className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
        <div className="media-library-toolbar flex flex-col gap-3 border-b border-gray-100 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><IconPhoto /></span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-700">รายการที่บันทึกไว้</h3>
              <p className="text-xs text-slate-500">{viewDate ? `${visibleGroups.length} กลุ่ม · ${visibleFilesCount} ไฟล์ · ${formatMediaFolder(viewDate)}` : `ทั้งหมด ${mediaGroups.length} กลุ่ม · ${files.length} ไฟล์`}</p>
            </div>
          </div>
          <label className="flex shrink-0 items-center gap-2 text-xs font-medium text-slate-500">
            <span>กรองวันที่</span>
            <select aria-label="กรองรายการสื่อตามวันที่" value={viewDate} onChange={(event) => setViewDate(event.target.value)}
              className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700">
              <option value="">ทุกวันที่</option>
              {mediaFolders.map((folder) => <option key={folder} value={folder}>{formatMediaFolder(folder)}</option>)}
            </select>
          </label>
        </div>
        <div className="px-5 pt-3">
          {filesLoading && <span className="text-xs text-slate-400">กำลังโหลด...</span>}
        </div>

        {filesError && <p className="px-5 py-3 text-xs text-red-600">{filesError}</p>}

        {!filesLoading && !filesError && visibleFilesCount === 0 && (
          <div className="media-empty-state px-5 py-12 text-center">
            <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-blue-400"><IconPhoto /></span>
            <p className="text-sm font-semibold text-slate-700">{viewDate ? 'ยังไม่มีไฟล์ในวันที่เลือก' : 'ยังไม่มีไฟล์ที่บันทึกไว้'}</p>
            <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">เลือกวันที่ด้านบนเพื่อจัดเก็บ แล้วอัปโหลดภาพหรือวิดีโอจากอุปกรณ์</p>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-300">เลือกไฟล์จากอุปกรณ์</button>
          </div>
        )}

        {!filesLoading && !filesError && visibleFilesCount > 0 && (
          <div className="space-y-4 p-4">
            {Object.entries(groupsByDate).map(([folder, dateGroups]) => (
              <section key={folder} className="media-date-group overflow-hidden rounded-xl border border-slate-200">
                <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
                  <h4 className="text-sm font-semibold text-slate-700">{formatMediaFolder(folder)}</h4>
                  <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">{dateGroups.length} กลุ่ม · {dateGroups.reduce((total, group) => total + group.files.length, 0)} ไฟล์</span>
                </header>
                <div className="space-y-3 p-3">
                  {dateGroups.map((group) => (
                    <article key={group.key} className="media-group-card overflow-hidden rounded-xl border border-slate-200 bg-slate-50/60">
                      <header className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-slate-500">รายละเอียดกลุ่ม</p>
                          {editingGroupKey === group.key ? (
                            <div className="mt-2 space-y-2">
                              <label className="block text-xs font-medium text-slate-500">
                                วันที่ของกลุ่ม
                                <input type="date" value={groupDateDraft} onChange={(event) => setGroupDateDraft(event.target.value)}
                                  className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
                              </label>
                              <textarea rows={2} value={groupDetailsDraft} onChange={(event) => setGroupDetailsDraft(event.target.value)}
                                aria-label="แก้ไขรายละเอียดกลุ่ม" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" placeholder="เพิ่มรายละเอียดของกลุ่มนี้" />
                              <div className="flex gap-2">
                                <button type="button" onClick={() => saveGroupDetails(group)} className="rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white">บันทึกรายละเอียด</button>
                                <button type="button" onClick={() => setEditingGroupKey('')} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600">ยกเลิก</button>
                              </div>
                            </div>
                          ) : (
                            <p className="mt-1 whitespace-pre-wrap break-words text-sm font-semibold text-slate-800">{group.details || 'ยังไม่ได้เพิ่มรายละเอียด'}</p>
                          )}
                          <p className="mt-1 text-xs text-slate-500">{group.files.length} ไฟล์{group.isLegacy ? ' · รายการเดิม' : ''}</p>
                        </div>
                        <div className="no-print flex flex-wrap gap-2">
                          <button type="button" onClick={() => { setEditingGroupKey(group.key); setGroupDetailsDraft(group.details); setGroupDateDraft(group.date === 'no-date' ? '' : group.date); }}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-blue-300">แก้รายละเอียด</button>
                          <button type="button" onClick={() => groupFileInputRefs.current[group.key]?.click()} disabled={uploading}
                            className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800 hover:bg-blue-100">เพิ่มไฟล์</button>
                          <input ref={(element) => { groupFileInputRefs.current[group.key] = element; }} type="file" accept="image/*,video/*" multiple className="hidden"
                            aria-label="เพิ่มรูปหรือวิดีโอในกลุ่มนี้"
                            onChange={(event) => {
                              const additions = Array.from(event.target.files || []);
                              event.target.value = '';
                              handleAddFilesToGroup(group, additions);
                            }} />
                          <button type="button" onClick={() => handleDeleteGroup(group)}
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100">ลบทั้งกลุ่ม</button>
                        </div>
                      </header>
                      <div className="media-files-grid grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 lg:grid-cols-3">
                        {group.files.map((f) => {
              const isImage = isImageFile(f.name);
              return (
                <article
                  key={f.path}
                  className={`media-row overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition hover:border-slate-300 ${
                    isImage ? 'media-image-row' : 'media-video-row'
                  }`}
                >
                  {/* Thumbnail */}
                  {isImage && f.publicUrl ? (
                    <img
                      src={f.publicUrl}
                      alt={f.name}
                      loading="lazy"
                      decoding="async"
                      className="media-image-thumb h-40 w-full border-b border-slate-200 object-cover"
                    />
                  ) : isVideoFile(f.name) && f.publicUrl ? (
                    <video src={f.publicUrl} className="media-video-thumb h-40 w-full border-b border-slate-200 object-contain" controls preload="metadata" />
                  ) : (
                    <div
                      className="media-video-thumb flex h-40 w-full items-center justify-center border-b border-slate-200"
                      style={{ background: '#eaf4fb' }}
                    >
                      <svg
                        className="h-10 w-10 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="flex items-center gap-2 p-3">
                    <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-700" title={f.name}>{f.name}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteFile(f.path)}
                      className="no-print inline-flex min-h-9 shrink-0 items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 focus:outline-none transition"
                    >
                      <IconTrash /> ลบ
                    </button>
                  </div>
                </article>
              );
                        })}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function AnimatedTimePicker({ id, name, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [draftHour, setDraftHour] = useState(null);
  const [draftMinute, setDraftMinute] = useState(null);
  const dialogRef = useRef(null);
  const pad = (number) => String(number).padStart(2, '0');
  const displayTime = value || '';

  const openPicker = () => {
    if (value) {
      const [hour, minute] = value.slice(0, 5).split(':').map(Number);
      setDraftHour(hour);
      setDraftMinute(minute);
    } else {
      setDraftHour(null);
      setDraftMinute(null);
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return undefined;
    dialogRef.current?.focus();
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  const commit = () => {
    if (draftHour === null || draftMinute === null) return;
    onChange({ target: { name, value: `${pad(draftHour)}:${pad(draftMinute)}` } });
    setOpen(false);
  };

  const clear = () => {
    onChange({ target: { name, value: '' } });
    setOpen(false);
  };

  return (
    <>
      <button id={id} type="button" onClick={openPicker} aria-haspopup="dialog"
        className="group relative flex min-h-12 w-full items-center justify-between overflow-hidden rounded-xl border border-slate-700 bg-slate-900 px-3.5 text-left shadow-inner transition hover:border-cyan-400/70 hover:shadow-[0_0_18px_rgba(34,211,238,.12)] focus:outline-none focus:ring-2 focus:ring-cyan-400/60">
        <span className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-cyan-300 via-blue-500 to-violet-500 opacity-80 transition group-hover:opacity-100" />
        <span className="flex min-w-0 items-center gap-3 pl-1">
          <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10 text-cyan-200">
            <IconClock />
            <span className="absolute inset-0 rounded-full border border-cyan-300/30 opacity-0 transition group-hover:scale-125 group-hover:opacity-100" />
          </span>
          <span className="min-w-0">
            <span className="block font-mono text-lg font-bold tracking-[0.14em] text-white">{displayTime || '--:--'}</span>
            <span className="block text-[10px] leading-none text-slate-400">{displayTime ? 'แตะเพื่อเปลี่ยนเวลา' : 'แตะเพื่อเลือกเวลา'}</span>
          </span>
        </span>
        <span className="rounded-lg border border-cyan-200/20 bg-cyan-100/10 px-2.5 py-1.5 text-[10px] font-semibold text-cyan-100 transition group-hover:bg-cyan-100/20">เลือก</span>
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto bg-slate-950/75 px-3 py-4 backdrop-blur-sm [padding-top:max(1rem,env(safe-area-inset-top))] [padding-bottom:max(1rem,env(safe-area-inset-bottom))]"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} tabIndex={-1}
            className="time-picker-enter my-auto max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 p-4 text-white shadow-[0_24px_80px_rgba(0,0,0,.55)] outline-none sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.24em] text-cyan-300">Departure time</p>
                <h2 id={`${id}-title`} className="mt-1 text-lg font-bold">เลือกเวลาเลิกงาน</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="ปิดตัวเลือกเวลา"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-700 text-xl text-slate-300 transition hover:border-slate-500 hover:bg-slate-800">×</button>
            </div>

            <div className="relative mt-4 overflow-hidden rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-4">
              <span className="time-picker-glow pointer-events-none absolute -right-8 -top-12 h-32 w-32 rounded-full bg-cyan-400/20 blur-2xl" />
              <div className="relative flex items-center gap-4">
                <div className="relative flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-full border border-cyan-300/25 bg-white/[.04]">
                  <span className="time-picker-turn absolute inset-1 rounded-full border border-dashed border-cyan-200/30" />
                  <span className="absolute inset-[10px] rounded-full border border-cyan-200/15" />
                  <span className="text-cyan-200"><IconClock /></span>
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,.9)]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-slate-400">เวลาที่เลือก</p>
                  <p key={`${draftHour}:${draftMinute}`} className="time-picker-select mt-0.5 font-mono text-4xl font-bold tracking-[.12em] text-white">
                    {draftHour === null ? '--' : pad(draftHour)}<span className="mx-1 text-cyan-300">:</span>{draftMinute === null ? '--' : pad(draftMinute)}
                  </p>
                  <p className="text-[10px] text-cyan-200/80">รูปแบบ 24 ชั่วโมง · เลือกได้ทุกนาที</p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[.86fr_1.14fr]">
              <section aria-label="เลือกชั่วโมง">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200">ชั่วโมง</h3>
                  <span className="text-[10px] text-slate-500">00–23</span>
                </div>
                <div className="grid max-h-40 grid-cols-6 gap-1.5 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/45 p-2 sm:max-h-52 sm:grid-cols-4">
                  {Array.from({ length: 24 }, (_, hour) => (
                    <button key={hour} type="button" aria-pressed={draftHour === hour} onClick={() => setDraftHour(hour)}
                      className={`time-choice min-h-9 rounded-lg font-mono text-xs font-semibold transition ${draftHour === hour ? 'time-picker-select bg-cyan-300 text-slate-950 shadow-[0_0_14px_rgba(103,232,249,.35)]' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                      {pad(hour)}
                    </button>
                  ))}
                </div>
              </section>
              <section aria-label="เลือกนาที">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200">นาที</h3>
                  <span className="text-[10px] text-slate-500">00–59</span>
                </div>
                <div className="grid max-h-40 grid-cols-6 gap-1.5 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/45 p-2 sm:max-h-52">
                  {Array.from({ length: 60 }, (_, minute) => (
                    <button key={minute} type="button" aria-pressed={draftMinute === minute} onClick={() => setDraftMinute(minute)}
                      className={`time-choice min-h-9 rounded-md font-mono text-[10px] font-semibold transition ${draftMinute === minute ? 'time-picker-select bg-blue-400 text-slate-950 shadow-[0_0_12px_rgba(96,165,250,.35)]' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                      {pad(minute)}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-800 pt-4">
              <button type="button" onClick={clear} className="min-h-10 rounded-xl px-3 text-xs font-semibold text-slate-400 transition hover:bg-slate-800 hover:text-white">ล้างเวลา</button>
              <div className="flex gap-2">
                <button type="button" onClick={() => setOpen(false)} className="min-h-10 rounded-xl border border-slate-700 px-4 text-xs font-semibold text-slate-300 transition hover:bg-slate-800">ยกเลิก</button>
                <button type="button" onClick={commit} disabled={draftHour === null || draftMinute === null}
                  className="min-h-10 rounded-xl bg-gradient-to-r from-cyan-300 to-blue-400 px-4 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-950/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">ยืนยันเวลา</button>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

function ProvincialTripsPage() {
  const today = localISODate();
  const [reportDate, setReportDate] = useState(today);
  const [form, setForm] = useState({ date: today, details: '', departure_time: '', note: '' });
  const [editingTripId, setEditingTripId] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [xlsxItems, setXlsxItems] = useState([]);
  const [xlsxSkipped, setXlsxSkipped] = useState(0);
  const [xlsxFileName, setXlsxFileName] = useState('');
  const [xlsxImporting, setXlsxImporting] = useState(false);
  const [xlsxImportOpen, setXlsxImportOpen] = useState(false);
  const xlsxInputRef = useRef(null);
  const [cutoffs, setCutoffs] = useState([]);
  const [cutoffLoading, setCutoffLoading] = useState(false);
  const [cutoffSaving, setCutoffSaving] = useState(false);
  const [cutoffForm, setCutoffForm] = useState({ date_from: today, date_to: today, note: '' });
  const [editingCutoffId, setEditingCutoffId] = useState(null);
  const [tripCalendarMonth, setTripCalendarMonth] = useState(() => {
    const date = new Date(`${today}T00:00:00`);
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const [selectedTripDay, setSelectedTripDay] = useState('');
  const [calendarTrips, setCalendarTrips] = useState([]);
  const [calendarTripsLoading, setCalendarTripsLoading] = useState(false);
  const [calendarRefresh, setCalendarRefresh] = useState(0);
  const [exportDateFrom, setExportDateFrom] = useState(today);
  const [exportDateTo, setExportDateTo] = useState(today);
  const [exportTrips, setExportTrips] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadTrips() {
      if (!supabase) {
        setTrips([]);
        setError('ยังไม่ได้ตั้งค่าการเชื่อมต่อ Supabase');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      const { data, error: queryError } = await supabase
        .from('provincial_trips')
        .select('*')
        .eq('date', reportDate)
        .order('departure_time', { ascending: true, nullsFirst: true })
        .order('created_at', { ascending: true });

      if (!cancelled) {
        setTrips(data || []);
        setError(queryError ? `โหลดรายการไม่สำเร็จ: ${queryError.message}` : '');
        setLoading(false);
      }
    }

    loadTrips();
    return () => { cancelled = true; };
  }, [reportDate]);

  useEffect(() => {
    let cancelled = false;
    async function loadCutoffs() {
      if (!supabase) return;
      setCutoffLoading(true);
      const { data, error: queryError } = await supabase
        .from('provincial_trip_cutoffs')
        .select('*')
        .order('date_from', { ascending: false })
        .order('created_at', { ascending: false });
      if (!cancelled) {
        setCutoffs(data || []);
        if (queryError) setError(`โหลดประวัติการตัดรอบไม่สำเร็จ: ${queryError.message}`);
        setCutoffLoading(false);
      }
    }
    loadCutoffs();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadMonthTrips() {
      if (!supabase) return;
      const monthStart = new Date(tripCalendarMonth.getFullYear(), tripCalendarMonth.getMonth(), 1);
      const monthEnd = new Date(tripCalendarMonth.getFullYear(), tripCalendarMonth.getMonth() + 1, 0);
      const toISO = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      setCalendarTripsLoading(true);
      setCalendarTrips([]);
      const { data, error: queryError } = await supabase
        .from('provincial_trips')
        .select('id,date,details,departure_time,note')
        .gte('date', toISO(monthStart))
        .lte('date', toISO(monthEnd))
        .order('date', { ascending: true });
      if (!cancelled) {
        setCalendarTrips(data || []);
        if (queryError) setError(`โหลดปฏิทินไม่สำเร็จ: ${queryError.message}`);
        setCalendarTripsLoading(false);
      }
    }
    loadMonthTrips();
    return () => { cancelled = true; };
  }, [tripCalendarMonth, calendarRefresh]);

  useEffect(() => {
    const date = new Date(`${reportDate}T00:00:00`);
    setTripCalendarMonth((month) => month.getFullYear() === date.getFullYear() && month.getMonth() === date.getMonth()
      ? month
      : new Date(date.getFullYear(), date.getMonth(), 1));
  }, [reportDate]);

  const handleChange = (event) => {
    const { id, name, value } = event.target;
    setForm((prev) => ({ ...prev, [name || id]: value }));
  };

  const handleAddTrip = async (event) => {
    event.preventDefault();
    if (!supabase) {
      setError('ยังไม่ได้ตั้งค่าการเชื่อมต่อ Supabase');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');
    const tripDate = form.date || localISODate();
    const wasPopupEdit = Boolean(editingTripId && selectedTripDay);
    const tripPayload = {
      date: tripDate,
      details: form.details.trim(),
      departure_time: form.departure_time || null,
      note: form.note.trim() || null,
    };
    const { data, error: insertError } = await supabase
      .from('provincial_trips')
      .insert(tripPayload)
      .select('*')
      .single();

    if (insertError) {
      setSaving(false);
      setError(`บันทึกไม่สำเร็จ: ${insertError.message}`);
      return;
    }

    if (editingTripId) {
      const { error: deleteOldError } = await supabase.from('provincial_trips').delete().eq('id', editingTripId);
      if (deleteOldError) {
        await supabase.from('provincial_trips').delete().eq('id', data.id);
        setSaving(false);
        setError(`แก้ไขไม่สำเร็จ: ${deleteOldError.message}`);
        return;
      }
      setTrips((prev) => prev.filter((trip) => trip.id !== editingTripId));
    }
    setSaving(false);

    if (tripDate === reportDate) setTrips((prev) => [...prev, data]);
    else setReportDate(tripDate);
    setEditingTripId(null);
    setForm({ date: tripDate, details: '', departure_time: '', note: '' });
    if (wasPopupEdit) setSelectedTripDay(tripDate);
    setCalendarRefresh((key) => key + 1);
    setMessage(editingTripId ? 'แก้ไขรายการเรียบร้อยแล้ว' : 'เพิ่มรายการเรียบร้อยแล้ว');
  };

  const startEditTrip = (trip, keepPopupOpen = false) => {
    if (!keepPopupOpen) setSelectedTripDay('');
    setEditingTripId(trip.id);
    setForm({
      date: trip.date,
      details: trip.details || '',
      departure_time: trip.departure_time ? trip.departure_time.slice(0, 5) : '',
      note: trip.note || '',
    });
    if (!keepPopupOpen) document.getElementById('trip-date')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const cancelEditTrip = () => {
    setEditingTripId(null);
    setForm({ date: reportDate, details: '', departure_time: '', note: '' });
  };

  const handleDeleteTrip = async (tripId) => {
    if (!supabase) return;
    if (!await requestAppDialog('confirm', 'ต้องการลบรายการนี้หรือไม่?')) return;

    const { error: deleteError } = await supabase
      .from('provincial_trips')
      .delete()
      .eq('id', tripId);

    if (deleteError) setError(`ลบรายการไม่สำเร็จ: ${deleteError.message}`);
    else {
      setTrips((prev) => prev.filter((trip) => trip.id !== tripId));
      setCalendarRefresh((key) => key + 1);
      setMessage('ลบรายการเรียบร้อยแล้ว');
    }
  };

  const handleAddCutoff = async (event) => {
    event.preventDefault();
    if (cutoffForm.date_to < cutoffForm.date_from) {
      setError('วันที่สิ้นสุดต้องไม่อยู่ก่อนวันที่เริ่มต้น');
      return;
    }
    if (!supabase) {
      setError('ยังไม่ได้ตั้งค่าการเชื่อมต่อ Supabase');
      return;
    }
    setCutoffSaving(true);
    setError('');
    const cutoffPayload = {
      date_from: cutoffForm.date_from,
      date_to: cutoffForm.date_to,
      note: cutoffForm.note.trim() || null,
    };
    const { data, error: insertError } = await supabase
      .from('provincial_trip_cutoffs')
      .insert(cutoffPayload)
      .select('*')
      .single();
    if (insertError) {
      setCutoffSaving(false);
      setError(`บันทึกช่วงวันที่ไม่สำเร็จ: ${insertError.message}`);
      return;
    }
    if (editingCutoffId) {
      const { error: deleteOldError } = await supabase.from('provincial_trip_cutoffs').delete().eq('id', editingCutoffId);
      if (deleteOldError) {
        await supabase.from('provincial_trip_cutoffs').delete().eq('id', data.id);
        setCutoffSaving(false);
        setError(`แก้ไขช่วงวันที่ไม่สำเร็จ: ${deleteOldError.message}`);
        return;
      }
      setCutoffs((prev) => [data, ...prev.filter((item) => item.id !== editingCutoffId)].sort((a, b) => b.date_from.localeCompare(a.date_from)));
    } else {
      setCutoffs((prev) => [data, ...prev].sort((a, b) => b.date_from.localeCompare(a.date_from)));
    }
    setCutoffSaving(false);
    setEditingCutoffId(null);
    setCutoffForm({ date_from: today, date_to: today, note: '' });
    setMessage(editingCutoffId ? 'แก้ไขช่วงวันที่เรียบร้อยแล้ว' : 'บันทึกช่วงวันที่ส่งให้ผู้ทำตารางแล้ว');
  };

  const startEditCutoff = (item) => {
    setEditingCutoffId(item.id);
    setCutoffForm({ date_from: item.date_from, date_to: item.date_to, note: item.note || '' });
    document.getElementById('trip-cutoff-from')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleDeleteCutoff = async (cutoffId) => {
    if (!supabase) return;
    if (!await requestAppDialog('confirm', 'ต้องการลบประวัติช่วงวันที่นี้หรือไม่?')) return;
    const { error: deleteError } = await supabase.from('provincial_trip_cutoffs').delete().eq('id', cutoffId);
    if (deleteError) setError(`ลบประวัติไม่สำเร็จ: ${deleteError.message}`);
    else {
      setCutoffs((prev) => prev.filter((item) => item.id !== cutoffId));
      setMessage('ลบประวัติช่วงวันที่แล้ว');
    }
  };

  const handleXlsxFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError('');
    setMessage('');
    setXlsxFileName(file.name);
    if (!/\.xlsx?$/i.test(file.name)) {
      setError('กรุณาเลือกไฟล์ Excel นามสกุล .xlsx หรือ .xls');
      setXlsxItems([]);
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError('ไฟล์ใหญ่เกิน 15 MB กรุณาลดขนาดไฟล์แล้วลองใหม่');
      setXlsxItems([]);
      return;
    }
    try {
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      if (!firstSheet) throw new Error('ไม่พบชีตในไฟล์นี้');
      const parsed = parseTripSheetRows(XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '', raw: true }));
      setXlsxItems(parsed.items);
      setXlsxSkipped(parsed.skipped);
      setXlsxImportOpen(true);
      if (!parsed.items.length) setMessage('ไม่พบรายการที่มีวันที่และรายละเอียดงาน ตรวจหัวคอลัมน์ในไฟล์แล้วลองอีกครั้ง');
    } catch (parseError) {
      setXlsxItems([]);
      setError(`อ่านไฟล์ Excel ไม่สำเร็จ: ${parseError.message || 'รูปแบบไฟล์ไม่ถูกต้อง'}`);
    }
    event.target.value = '';
  };

  const handleImportXlsx = async () => {
    if (!xlsxItems.length || xlsxImporting) return;
    if (!supabase) {
      setError('ยังไม่ได้ตั้งค่าการเชื่อมต่อ Supabase');
      return;
    }
    setXlsxImporting(true);
    setError('');
    let inserted = 0;
    let importError = null;
    for (let i = 0; i < xlsxItems.length; i += 100) {
      const { error: batchError } = await supabase.from('provincial_trips').insert(xlsxItems.slice(i, i + 100));
      if (batchError) { importError = batchError; break; }
      inserted += Math.min(100, xlsxItems.length - i);
    }
    setXlsxImporting(false);
    if (importError) {
      setError(`นำเข้าได้ ${inserted} รายการ แล้วพบข้อผิดพลาด: ${importError.message}`);
      if (inserted) setReportDate(xlsxItems[0].date);
      return;
    }
    setReportDate(xlsxItems[0].date);
    setCalendarRefresh((key) => key + 1);
    setMessage(`นำเข้าสำเร็จ ${inserted} รายการ${xlsxSkipped ? ` · ข้าม ${xlsxSkipped} แถวที่ไม่มีวันที่หรือรายละเอียด` : ''} · เลือกวันที่จากตารางเพื่อดูวันอื่น`);
    setXlsxImportOpen(false);
    setXlsxItems([]);
  };

  const formatTripDate = (value) => {
    if (!value) return '—';
    return new Intl.DateTimeFormat('th-TH', { dateStyle: 'long' }).format(new Date(`${value}T00:00:00`));
  };

  const formatTripMonth = (date) => new Intl.DateTimeFormat('th-TH', { month: 'long', year: 'numeric' }).format(date);
  const tripRowsByDate = calendarTrips.reduce((groups, item) => {
    (groups[item.date] ||= []).push(item);
    return groups;
  }, {});
  const firstDayOfTripMonth = new Date(tripCalendarMonth.getFullYear(), tripCalendarMonth.getMonth(), 1).getDay();
  const tripMonthDayCount = new Date(tripCalendarMonth.getFullYear(), tripCalendarMonth.getMonth() + 1, 0).getDate();
  const tripCalendarCells = [
    ...Array.from({ length: firstDayOfTripMonth }, () => null),
    ...Array.from({ length: tripMonthDayCount }, (_, index) => {
      const day = index + 1;
      const date = new Date(tripCalendarMonth.getFullYear(), tripCalendarMonth.getMonth(), day);
      return { day, iso: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` };
    }),
  ];
  const dateIsSent = (date) => cutoffs.some((cutoff) => date >= cutoff.date_from && date <= cutoff.date_to);

  const handleLoadExportRange = async () => {
    if (exportDateFrom > exportDateTo) {
      setError('วันเริ่มต้นต้องไม่อยู่หลังวันสิ้นสุด');
      return;
    }
    if (!supabase) {
      setError('ยังไม่ได้ตั้งค่าการเชื่อมต่อ Supabase');
      return;
    }
    setExportLoading(true);
    setError('');
    setMessage('');
    const { data, error: queryError } = await supabase
      .from('provincial_trips')
      .select('*')
      .gte('date', exportDateFrom)
      .lte('date', exportDateTo)
      .order('date', { ascending: true })
      .order('departure_time', { ascending: true, nullsFirst: true })
      .order('created_at', { ascending: true });
    setExportLoading(false);
    if (queryError) {
      setExportTrips([]);
      setError(`โหลดตารางช่วงวันที่ไม่สำเร็จ: ${queryError.message}`);
      return;
    }
    const sortedTrips = [...(data || [])].sort((a, b) =>
      a.date.localeCompare(b.date)
      || (a.departure_time || '').localeCompare(b.departure_time || '')
      || (a.created_at || '').localeCompare(b.created_at || '')
    );
    setExportTrips(sortedTrips);
    setMessage(sortedTrips.length ? `พบ ${sortedTrips.length} รายการในช่วงวันที่ที่เลือก` : 'ไม่พบรายการออกต่างจังหวัดในช่วงวันที่นี้');
  };

  const exportImage = async () => {
    if (!exportTrips.length) return;
    if (document.fonts?.ready) await document.fonts.ready;

    const canvas = document.createElement('canvas');
    const scale = 2;
    const padding = 48;
    const columns = [
      { label: 'วันที่', width: 280, value: (trip) => formatTripDate(trip.date) },
      { label: 'รายละเอียดงาน', width: 570, value: (trip) => trip.details || '—' },
      { label: 'เวลาเลิกงาน', width: 220, value: (trip) => trip.departure_time ? trip.departure_time.slice(0, 5) : '—' },
      { label: 'หมายเหตุ', width: 360, value: (trip) => trip.note || '—' },
    ];
    const tableWidth = columns.reduce((sum, column) => sum + column.width, 0);
    const innerWidth = tableWidth;
    const ctx = canvas.getContext('2d');
    const fontFamily = 'Kanit, system-ui, sans-serif';
    const wrapText = (text, maxWidth) => {
      const segmenter = typeof Intl.Segmenter === 'function'
        ? new Intl.Segmenter('th', { granularity: 'word' })
        : null;
      const lines = [];
      String(text).split(/\r\n|\r|\n/).forEach((paragraph) => {
        const words = segmenter ? [...segmenter.segment(paragraph)].map((part) => part.segment) : Array.from(paragraph);
        let line = '';
        words.forEach((word) => {
          const candidate = line + word;
          if (line && ctx.measureText(candidate).width > maxWidth) {
            lines.push(line.trimEnd());
            line = word.trimStart();
          } else line = candidate;
        });
        if (line) lines.push(line.trimEnd());
        else lines.push('');
      });
      return lines.length ? lines : [''];
    };

    ctx.font = `26px ${fontFamily}`;
    const rows = exportTrips.map((trip) => {
      const values = columns.map((column) => wrapText(column.value(trip), column.width - 32));
      const lineCount = Math.max(...values.map((lines) => lines.length));
      return { values, height: Math.max(76, lineCount * 34 + 32) };
    });
    const headerHeight = 72;
    const titleHeight = 190;
    const footerHeight = 56;
    const canvasHeight = titleHeight + headerHeight + rows.reduce((sum, row) => sum + row.height, 0) + footerHeight;
    canvas.width = (innerWidth + padding * 2) * scale;
    canvas.height = canvasHeight * scale;
    ctx.scale(scale, scale);
    ctx.fillStyle = '#f3f7f5';
    ctx.fillRect(0, 0, innerWidth + padding * 2, canvasHeight);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(padding, 28, innerWidth, canvasHeight - 56);
    ctx.fillStyle = '#24634f';
    ctx.fillRect(padding, 28, innerWidth, 12);
    ctx.fillStyle = '#173d32';
    ctx.font = `bold 40px ${fontFamily}`;
    ctx.fillText('รายการออกต่างจังหวัด', padding + 28, 100);
    ctx.fillStyle = '#5b6b65';
    ctx.font = `26px ${fontFamily}`;
    ctx.fillText(`ณัฐวุฒิ ชูงาม · ${exportTrips.length} รายการ`, padding + 28, 146);

    let y = 190;
    let x = padding;
    ctx.font = `bold 26px ${fontFamily}`;
    columns.forEach((column) => {
      ctx.fillStyle = '#286b55';
      ctx.fillRect(x, y, column.width, headerHeight);
      ctx.fillStyle = '#ffffff';
      ctx.textBaseline = 'middle';
      ctx.fillText(column.label, x + 16, y + headerHeight / 2);
      x += column.width;
    });
    y += headerHeight;

    rows.forEach((row, rowIndex) => {
      x = padding;
      ctx.fillStyle = rowIndex % 2 ? '#f6faf8' : '#ffffff';
      ctx.fillRect(padding, y, innerWidth, row.height);
      columns.forEach((column, columnIndex) => {
        ctx.strokeStyle = '#d9e5df';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, column.width, row.height);
        ctx.fillStyle = '#263b33';
        ctx.font = `${columnIndex === 0 ? '500 ' : ''}26px ${fontFamily}`;
        ctx.textBaseline = 'top';
        row.values[columnIndex].forEach((line, lineIndex) => {
          ctx.fillText(line, x + 16, y + 16 + lineIndex * 34);
        });
        x += column.width;
      });
      y += row.height;
    });

    ctx.fillStyle = '#7a8982';
    ctx.font = `20px ${fontFamily}`;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('Daily Report', padding + 4, canvasHeight - 24);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) {
      setError('สร้างภาพไม่สำเร็จ กรุณาลองอีกครั้ง');
      return;
    }

    const fileName = `รายการออกต่างจังหวัด_${exportDateFrom}_ถึง_${exportDateTo}.png`;
    const imageFile = new File([blob], fileName, { type: 'image/png' });
    if (navigator.share && navigator.canShare?.({ files: [imageFile] })) {
      try {
        await navigator.share({ files: [imageFile], title: 'รายการออกต่างจังหวัด' });
        setMessage('เปิดเมนูแชร์แล้ว เลือก “บันทึกรูปภาพ” เพื่อเก็บไว้ในแอปรูปภาพ');
      } catch (shareError) {
        if (shareError.name !== 'AbortError') setError(`แชร์รูปภาพไม่สำเร็จ: ${shareError.message || 'กรุณาลองอีกครั้ง'}`);
      }
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    setMessage('ดาวน์โหลดรูปภาพแล้ว');
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">ออกต่างจังหวัด</h1>
          <p className="mt-1 text-sm text-slate-500">ดูรายละเอียดรายวันในปฏิทิน แก้ไขรายการ และส่งออกเป็นตารางตามช่วงวันที่</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label htmlFor="trip-report-date" className="mb-1 block text-xs font-medium text-slate-600">เลือกวันที่ดูรายการ</label>
            <input id="trip-report-date" type="date" value={reportDate}
              onChange={(event) => setReportDate(event.target.value)}
              className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm" />
          </div>
          <input ref={xlsxInputRef} type="file" accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" onChange={handleXlsxFile} className="hidden" />
          <button type="button" onClick={() => xlsxInputRef.current?.click()}
            className="min-h-10 rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50">
            นำเข้า XLSX
          </button>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
        <div className="border-b border-emerald-100 bg-emerald-50 px-5 py-4">
          <h2 className="text-base font-semibold text-emerald-950">เพิ่มรายการเดินทาง</h2>
          <p className="mt-0.5 text-xs text-emerald-800">กรอกข้อมูลแล้วกดเพิ่ม รายการจะแสดงในตารางของวันที่เลือก</p>
        </div>
        <form onSubmit={handleAddTrip} className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="trip-date" className="mb-1 block text-xs font-semibold text-slate-600">วันที่</label>
            <input id="trip-date" name="date" type="date" value={form.date} onChange={handleChange} required
              className="min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" />
          </div>
          <div>
            <label htmlFor="trip-time" className="mb-1 block text-xs font-semibold text-slate-600">เวลาเลิกงาน</label>
            <AnimatedTimePicker id="trip-time" name="departure_time" value={form.departure_time} onChange={handleChange} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="trip-details" className="mb-1 block text-xs font-semibold text-slate-600">รายละเอียดงาน</label>
            <textarea id="trip-details" name="details" rows={2} value={form.details} onChange={handleChange} required
              placeholder="เช่น ไปประชุม / ติดตั้งงานที่จังหวัด..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm" />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label htmlFor="trip-note" className="mb-1 block text-xs font-semibold text-slate-600">หมายเหตุ</label>
            <input id="trip-note" name="note" type="text" value={form.note} onChange={handleChange}
              placeholder="ข้อมูลเพิ่มเติม (ถ้ามี)"
              className="min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" />
          </div>
          <div className="flex flex-col items-stretch">
            <button type="submit" disabled={saving}
              className="min-h-11 w-full rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50">
              {saving ? (editingTripId ? 'กำลังบันทึกการแก้ไข…' : 'กำลังเพิ่ม…') : (editingTripId ? 'บันทึกการแก้ไข' : 'เพิ่มรายการ')}
            </button>
            {editingTripId && <button type="button" onClick={cancelEditTrip} className="mt-2 min-h-10 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">ยกเลิกการแก้ไข</button>}
          </div>
        </form>
      </section>

      {xlsxImportOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 px-4 py-5">
          <div role="dialog" aria-modal="true" aria-labelledby="trip-xlsx-import-title" className="w-full max-w-2xl max-h-[calc(100vh-2.5rem)] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between rounded-t-2xl bg-emerald-800 px-5 py-4 text-white">
              <div>
                <h2 id="trip-xlsx-import-title" className="text-base font-semibold">ตรวจรายการจากไฟล์ Excel</h2>
                <p className="mt-0.5 text-xs text-emerald-100">{xlsxFileName}</p>
              </div>
              <button type="button" onClick={() => setXlsxImportOpen(false)} aria-label="ปิดหน้าต่างนำเข้า" className="rounded-lg px-2 py-1 text-2xl leading-none text-emerald-100 hover:bg-white/10">×</button>
            </div>
            <div className="space-y-4 p-5">
              <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs leading-5 text-emerald-900">
                อ่านชีตแรกของไฟล์ โดยใช้คอลัมน์ <strong>วันที่</strong>, <strong>รายละเอียดงาน</strong>, <strong>เวลาเลิกงาน</strong> และ <strong>หมายเหตุ</strong> (คอลัมน์เวลาและหมายเหตุไม่บังคับ)
              </p>
              {xlsxItems.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">ตัวอย่างนำเข้า · พบ {xlsxItems.length} รายการ{xlsxSkipped ? ` · ข้าม ${xlsxSkipped} แถว` : ''}</div>
                  <div className="max-h-64 overflow-auto">
                    <div className="space-y-2 p-3 md:hidden">
                      {xlsxItems.slice(0, 10).map((item, index) => (
                        <article key={`${item.date}-${index}`} className="rounded-lg border border-slate-200 bg-white p-3">
                          <p className="text-xs font-semibold text-emerald-700">{item.date} · {item.departure_time?.slice(0, 5) || 'ไม่ระบุเวลา'}</p>
                          <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-800">{item.details}</p>
                          {item.note && <p className="mt-1 whitespace-pre-wrap break-words text-xs text-slate-500">หมายเหตุ {item.note}</p>}
                        </article>
                      ))}
                    </div>
                    <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[600px] text-left text-xs">
                      <thead className="sticky top-0 bg-emerald-800 text-white"><tr>{['วันที่', 'รายละเอียดงาน', 'เวลาเลิกงาน', 'หมายเหตุ'].map((heading) => <th key={heading} className="px-3 py-2">{heading}</th>)}</tr></thead>
                      <tbody className="divide-y divide-slate-100">
                        {xlsxItems.slice(0, 10).map((item, index) => (
                          <tr key={`${item.date}-${index}`} className="odd:bg-white even:bg-slate-50">
                            <td className="whitespace-nowrap px-3 py-2">{item.date}</td>
                            <td className="whitespace-pre-wrap px-3 py-2">{item.details}</td>
                            <td className="whitespace-nowrap px-3 py-2">{item.departure_time?.slice(0, 5) || '—'}</td>
                            <td className="whitespace-pre-wrap px-3 py-2">{item.note || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                    {xlsxItems.length > 10 && <p className="px-3 py-2 text-[11px] text-slate-400">แสดง 10 รายการแรก จากทั้งหมด {xlsxItems.length} รายการ</p>}
                  </div>
                </div>
              ) : <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">ไม่พบรายการที่นำเข้าได้ กรุณาตรวจว่ามีคอลัมน์วันที่และรายละเอียดงาน</p>}
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button type="button" onClick={() => setXlsxImportOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">ยกเลิก</button>
                <button type="button" onClick={handleImportXlsx} disabled={!xlsxItems.length || xlsxImporting} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">
                  {xlsxImporting ? 'กำลังนำเข้า…' : `นำเข้า ${xlsxItems.length} รายการ`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading && <div role="status" className="border-b border-slate-200 px-5 py-3 text-xs text-slate-500">กำลังโหลดรายการ…</div>}
        {!loading && !error && trips.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"><IconPlane /></div>
            <p className="text-sm font-medium text-slate-700">ยังไม่มีรายการในวันนี้</p>
            <p className="mt-1 text-xs text-slate-500">เพิ่มรายการจากแบบฟอร์มด้านบน หรือเลือกวันที่อื่นเพื่อดูข้อมูล</p>
          </div>
        ) : !loading && !error && (
          <>
          <div className="space-y-3 p-3 xl:hidden">
            {trips.map((trip) => (
              <article key={trip.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-emerald-700">{formatTripDate(trip.date)}</p>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{trip.departure_time ? trip.departure_time.slice(0, 5) : 'ไม่ระบุเวลา'}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm font-medium leading-6 text-slate-800">{trip.details}</p>
                {trip.note && <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-5 text-slate-500">หมายเหตุ · {trip.note}</p>}
                <div className="no-print mt-3 flex gap-2 border-t border-slate-100 pt-3">
                  <button type="button" onClick={() => startEditTrip(trip)} className="flex-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100">แก้ไข</button>
                  <button type="button" onClick={() => handleDeleteTrip(trip.id)} className="flex-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100">ลบ</button>
                </div>
              </article>
            ))}
          </div>
          <div className="hidden overflow-x-auto xl:block">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-emerald-800 text-white">
                <tr>
                  {['วันที่', 'รายละเอียดงาน', 'เวลาเลิกงาน', 'หมายเหตุ'].map((heading) => (
                    <th key={heading} scope="col" className="px-4 py-3 font-semibold">{heading}</th>
                  ))}
                  <th scope="col" className="no-print px-4 py-3 font-semibold">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trips.map((trip) => (
                  <tr key={trip.id} className="odd:bg-white even:bg-slate-50/70">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">{formatTripDate(trip.date)}</td>
                    <td className="whitespace-pre-wrap px-4 py-3 text-slate-800">{trip.details}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">{trip.departure_time ? trip.departure_time.slice(0, 5) : '—'}</td>
                    <td className="whitespace-pre-wrap px-4 py-3 text-slate-600">{trip.note || '—'}</td>
                    <td className="no-print px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => startEditTrip(trip)}
                          className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100">แก้ไข</button>
                        <button type="button" onClick={() => handleDeleteTrip(trip.id)}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100">
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
        <div className="border-b border-blue-100 bg-blue-50 px-5 py-4">
          <h2 className="text-base font-semibold text-blue-950">ปฏิทินสถานะการตัดรอบ</h2>
          <p className="mt-1 text-xs leading-5 text-blue-900">วันที่มีรายการออกต่างจังหวัดจะแสดงสีเขียวเมื่อยังไม่ส่ง และเปลี่ยนเป็นสีเหลืองเมื่อบันทึกช่วงวันที่ส่งให้ผู้ทำตารางแล้ว</p>
        </div>
        <div className="p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <button type="button" aria-label="เดือนก่อนหน้า" onClick={() => setTripCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-xl text-slate-600 hover:bg-slate-50">‹</button>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-800">{formatTripMonth(tripCalendarMonth)}</h3>
              {calendarTripsLoading && <p className="mt-0.5 text-[11px] text-slate-500">กำลังโหลดรายการ…</p>}
            </div>
            <button type="button" aria-label="เดือนถัดไป" onClick={() => setTripCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-xl text-slate-600 hover:bg-slate-50">›</button>
          </div>
          <div className="mb-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600" aria-label="คำอธิบายสีปฏิทิน">
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-amber-300" />ส่งรอบแล้ว</span>
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-emerald-300" />มีรายการ · ยังไม่ส่ง</span>
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm border border-slate-200 bg-white" />ไม่มีรายการ</span>
          </div>
          <p className="mb-3 text-xs text-slate-500">เลือกวันที่เพื่อเปิดตารางรายการของวันนั้น</p>
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'].map((day) => (
              <div key={day} className="py-2 text-center text-[11px] font-semibold text-slate-500">{day}</div>
            ))}
            {tripCalendarCells.map((cell, index) => {
              if (!cell) return <div key={`blank-${index}`} className="min-h-[64px] rounded-lg bg-slate-50/60 sm:min-h-[76px]" />;
              const dayTrips = tripRowsByDate[cell.iso] || [];
              const count = dayTrips.length;
              const sent = dateIsSent(cell.iso);
              const hasTrips = count > 0;
              const selected = reportDate === cell.iso;
              const color = sent
                ? 'border-amber-300 bg-amber-100 text-amber-950 hover:bg-amber-200'
                : hasTrips
                  ? 'border-emerald-300 bg-emerald-100 text-emerald-950 hover:bg-emerald-200'
                  : 'border-slate-100 bg-white text-slate-700 hover:bg-slate-50';
              return (
                <button key={cell.iso} type="button" onClick={() => { setReportDate(cell.iso); setSelectedTripDay(cell.iso); }}
                  aria-label={`${formatTripDate(cell.iso)}${sent ? ', ส่งรอบแล้ว' : hasTrips ? `, ยังไม่ส่ง, ${count} รายการ` : ', ไม่มีรายการ'}`}
                  aria-pressed={selected} title={sent ? 'ส่งรอบแล้ว' : hasTrips ? 'มีรายการ แต่ยังไม่ส่ง' : 'ไม่มีรายการ'}
                  className={`flex min-h-[64px] flex-col items-start justify-between rounded-lg border p-1.5 text-left transition sm:min-h-[76px] sm:p-2 ${color} ${selected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}>
                  <span className="text-xs font-bold sm:text-sm">{cell.day}</span>
                  {count > 0 && <span className="mt-auto text-[9px] font-semibold leading-tight sm:hidden">{count} งาน</span>}
                  {count > 0 && (
                    <span className="mt-1 hidden w-full flex-col gap-0.5 overflow-hidden text-left text-[9px] font-medium leading-tight sm:flex sm:text-[10px]">
                      {dayTrips.slice(0, 2).map((trip) => <span key={trip.id} className="line-clamp-2 whitespace-pre-wrap break-words">{trip.details}</span>)}
                      {count > 2 && <span className="font-bold">อีก {count - 2} รายการ</span>}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <form onSubmit={handleAddCutoff} className="grid grid-cols-1 gap-3 border-b border-slate-100 p-5 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_2fr_auto] xl:items-end">
          <div>
            <label htmlFor="trip-cutoff-from" className="mb-1 block text-xs font-semibold text-slate-600">ตั้งแต่วันที่</label>
            <input id="trip-cutoff-from" type="date" required value={cutoffForm.date_from}
              onChange={(event) => setCutoffForm((prev) => ({ ...prev, date_from: event.target.value }))}
              className="min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" />
          </div>
          <div>
            <label htmlFor="trip-cutoff-to" className="mb-1 block text-xs font-semibold text-slate-600">ถึงวันที่</label>
            <input id="trip-cutoff-to" type="date" required min={cutoffForm.date_from} value={cutoffForm.date_to}
              onChange={(event) => setCutoffForm((prev) => ({ ...prev, date_to: event.target.value }))}
              className="min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" />
          </div>
          <div>
            <label htmlFor="trip-cutoff-note" className="mb-1 block text-xs font-semibold text-slate-600">หมายเหตุ (ถ้ามี)</label>
            <input id="trip-cutoff-note" type="text" value={cutoffForm.note}
              onChange={(event) => setCutoffForm((prev) => ({ ...prev, note: event.target.value }))}
              placeholder="เช่น ส่งรอบสิ้นเดือนให้คุณ..."
              className="min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" />
          </div>
          <button type="submit" disabled={cutoffSaving}
            className="min-h-11 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50">
            {cutoffSaving ? 'กำลังบันทึก…' : (editingCutoffId ? 'บันทึกการแก้ไข' : 'บันทึกช่วงที่ส่งแล้ว')}
          </button>
          {editingCutoffId && <button type="button" onClick={() => { setEditingCutoffId(null); setCutoffForm({ date_from: today, date_to: today, note: '' }); }} className="min-h-11 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">ยกเลิก</button>}
        </form>

      </section>

      <section className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
        <div className="border-b border-emerald-100 bg-emerald-50 px-5 py-4">
          <h2 className="text-base font-semibold text-emerald-950">ส่งออกตารางตามช่วงวันที่</h2>
          <p className="mt-1 text-xs leading-5 text-emerald-900">เลือกวันเริ่มต้นและวันสิ้นสุด ระบบจะใส่เฉพาะวันที่มีรายการออกต่างจังหวัดลงในตาราง</p>
        </div>
        <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_auto_auto] xl:items-end">
          <div>
            <label htmlFor="trip-export-from" className="mb-1 block text-xs font-semibold text-slate-600">ตั้งแต่วันที่</label>
            <input id="trip-export-from" type="date" value={exportDateFrom} onChange={(event) => { setExportDateFrom(event.target.value); setExportTrips([]); setMessage(''); setError(''); }}
              className="min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" />
          </div>
          <div>
            <label htmlFor="trip-export-to" className="mb-1 block text-xs font-semibold text-slate-600">ถึงวันที่</label>
            <input id="trip-export-to" type="date" min={exportDateFrom} value={exportDateTo} onChange={(event) => { setExportDateTo(event.target.value); setExportTrips([]); setMessage(''); setError(''); }}
              className="min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" />
          </div>
          <button type="button" onClick={handleLoadExportRange} disabled={exportLoading}
            className="min-h-11 rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 disabled:opacity-50">
            {exportLoading ? 'กำลังค้นหา…' : 'แสดงรายการ'}
          </button>
          <button type="button" onClick={exportImage} disabled={!exportTrips.length || exportLoading}
            className="min-h-11 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">
            บันทึก / แชร์รูปภาพ
          </button>
        </div>
        {exportTrips.length > 0 && (
          <div className="border-t border-slate-100 p-4 sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-emerald-800">พบ {exportTrips.length} รายการ · ตารางนี้แสดงเฉพาะวันที่มีรายการ</p>
              <button type="button" onClick={() => { setExportTrips([]); setMessage(''); }}
                className="min-h-9 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50">
                ปิดรายการ
              </button>
            </div>
            <div className="space-y-3 xl:hidden">
              {exportTrips.map((trip) => (
                <article key={trip.id} className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs font-semibold text-emerald-700">{formatTripDate(trip.date)}</p>
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm font-medium text-slate-800">{trip.details}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>เวลาเลิกงาน {trip.departure_time?.slice(0, 5) || '—'}</span>
                    {trip.note && <span className="break-words">หมายเหตุ {trip.note}</span>}
                  </div>
                </article>
              ))}
            </div>
            <div className="hidden overflow-x-auto rounded-xl border border-slate-200 xl:block">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead className="bg-emerald-800 text-white"><tr>{['วันที่', 'รายละเอียดงาน', 'เวลาเลิกงาน', 'หมายเหตุ'].map((heading) => <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>)}</tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {exportTrips.map((trip) => (
                    <tr key={trip.id} className="odd:bg-white even:bg-slate-50/70">
                      <td className="whitespace-nowrap px-4 py-3">{formatTripDate(trip.date)}</td>
                      <td className="whitespace-pre-wrap px-4 py-3">{trip.details}</td>
                      <td className="whitespace-nowrap px-4 py-3">{trip.departure_time?.slice(0, 5) || '—'}</td>
                      <td className="whitespace-pre-wrap px-4 py-3">{trip.note || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      {(error || message) && (
        <p role={error ? 'alert' : 'status'} aria-live="polite"
          className={`mx-5 mb-4 rounded-lg px-4 py-3 text-sm ${error ? 'border border-red-200 bg-red-50 text-red-700' : 'border border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
          {error || message}
        </p>
      )}

        <div className="border-t border-slate-100">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="text-base font-semibold text-slate-800">ช่วงวันที่ที่ส่งแล้ว</h3>
            <p className="mt-1 text-xs text-slate-500">ประวัติช่วงวันที่ที่บันทึกว่าส่งให้ผู้ทำตารางแล้ว</p>
          </div>
        {cutoffLoading ? (
          <p className="px-5 py-6 text-center text-sm text-slate-500">กำลังโหลดประวัติ…</p>
        ) : cutoffs.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-500">ยังไม่มีช่วงวันที่ที่บันทึกว่าส่งแล้ว</p>
        ) : (
          <>
          <div className="space-y-3 p-3 xl:hidden">
            {cutoffs.map((item) => (
              <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-sm font-semibold text-slate-800">{formatTripDate(item.date_from)} – {formatTripDate(item.date_to)}</p>
                {item.note && <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-600">{item.note}</p>}
                <p className="mt-2 text-[11px] text-slate-500">บันทึกเมื่อ {item.created_at ? new Intl.DateTimeFormat('th-TH', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(item.created_at)) : '—'}</p>
                <div className="no-print mt-3 flex gap-2 border-t border-slate-100 pt-3">
                  <button type="button" onClick={() => startEditCutoff(item)} className="flex-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100">แก้ไข</button>
                  <button type="button" onClick={() => handleDeleteCutoff(item.id)} className="flex-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100">ลบ</button>
                </div>
              </article>
            ))}
          </div>
          <div className="hidden overflow-x-auto xl:block">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">ช่วงวันที่ที่ส่งแล้ว</th>
                  <th scope="col" className="px-4 py-3 font-semibold">หมายเหตุ</th>
                  <th scope="col" className="px-4 py-3 font-semibold">บันทึกเมื่อ</th>
                  <th scope="col" className="no-print px-4 py-3 font-semibold">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cutoffs.map((item) => (
                  <tr key={item.id} className="odd:bg-white even:bg-slate-50/70">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800">{formatTripDate(item.date_from)} – {formatTripDate(item.date_to)}</td>
                    <td className="whitespace-pre-wrap px-4 py-3 text-slate-600">{item.note || '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">{item.created_at ? new Intl.DateTimeFormat('th-TH', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(item.created_at)) : '—'}</td>
                    <td className="no-print px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => startEditCutoff(item)} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100">แก้ไข</button>
                        <button type="button" onClick={() => handleDeleteCutoff(item.id)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100">ลบ</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
        </div>
      </section>

      {selectedTripDay && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 px-4 py-5" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedTripDay(''); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="trip-day-dialog-title" className="max-h-[calc(100vh-2.5rem)] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 rounded-t-2xl bg-emerald-800 px-5 py-4 text-white">
              <div>
                <h2 id="trip-day-dialog-title" className="text-base font-bold">รายการวันที่ {formatTripDate(selectedTripDay)}</h2>
                <p className="mt-1 text-xs text-emerald-100">{(tripRowsByDate[selectedTripDay] || []).length} รายการ</p>
              </div>
              <div className="flex items-center gap-2">
                {(tripRowsByDate[selectedTripDay] || []).length > 0 && (
                  <span className={`trip-send-status rounded-full px-2.5 py-1 text-xs font-semibold ${dateIsSent(selectedTripDay) ? 'sent' : 'pending'}`}>
                    {dateIsSent(selectedTripDay) ? 'ส่งรอบแล้ว' : 'ยังไม่ส่ง'}
                  </span>
                )}
                <button type="button" onClick={() => setSelectedTripDay('')} aria-label="ปิดรายละเอียดวัน" className="rounded-lg px-2 py-1 text-2xl leading-none text-emerald-100 hover:bg-white/10">×</button>
              </div>
            </div>
            <div className="space-y-3 p-5">
              {(tripRowsByDate[selectedTripDay] || []).length === 0 ? (
                calendarTripsLoading
                  ? <p className="py-8 text-center text-sm text-slate-500">กำลังโหลดรายการ…</p>
                  : <p className="py-8 text-center text-sm text-slate-500">วันที่เลือกยังไม่มีรายการออกต่างจังหวัด</p>
              ) : (tripRowsByDate[selectedTripDay] || []).map((trip) => (
                <article key={trip.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  {editingTripId === trip.id ? (
                    <form onSubmit={handleAddTrip} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label htmlFor="trip-popup-date" className="mb-1 block text-xs font-semibold text-slate-600">วันที่</label>
                        <input id="trip-popup-date" name="date" type="date" value={form.date} onChange={handleChange} required className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm" />
                      </div>
                      <div>
                        <label htmlFor="trip-popup-time" className="mb-1 block text-xs font-semibold text-slate-600">เวลาเลิกงาน</label>
                        <AnimatedTimePicker id="trip-popup-time" name="departure_time" value={form.departure_time} onChange={handleChange} />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="trip-popup-details" className="mb-1 block text-xs font-semibold text-slate-600">รายละเอียดงาน</label>
                        <textarea id="trip-popup-details" name="details" rows={3} value={form.details} onChange={handleChange} required className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="trip-popup-note" className="mb-1 block text-xs font-semibold text-slate-600">หมายเหตุ</label>
                        <input id="trip-popup-note" name="note" value={form.note} onChange={handleChange} className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm" />
                      </div>
                      <div className="flex justify-end gap-2 sm:col-span-2">
                        <button type="button" onClick={cancelEditTrip} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">ยกเลิก</button>
                        <button type="submit" disabled={saving} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'กำลังบันทึก…' : 'บันทึกการแก้ไข'}</button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="whitespace-pre-wrap break-words text-sm font-semibold leading-6 text-slate-800">{trip.details}</p>
                        {trip.departure_time && <p className="mt-2 text-xs text-slate-600">เวลาเลิกงาน {trip.departure_time.slice(0, 5)}</p>}
                        {trip.note && <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-slate-600">หมายเหตุ: {trip.note}</p>}
                      </div>
                      <button type="button" onClick={() => startEditTrip(trip, true)} className="shrink-0 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100">แก้ไข</button>
                    </div>
                  )}
                </article>
              ))}
              <div className="flex justify-end border-t border-slate-100 pt-3">
                <button type="button" onClick={() => setSelectedTripDay('')} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">ปิด</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value, mono = false }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 py-3 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className={`break-all text-sm text-slate-800 sm:text-right ${mono ? 'font-mono text-xs' : ''}`}>{value}</dd>
    </div>
  );
}

async function measureBucketUsage(bucket) {
  const totals = { files: 0, bytes: 0 };
  const walk = async (path = '', depth = 0) => {
    if (depth > 12) throw new Error('โครงสร้างโฟลเดอร์ลึกเกินกว่าที่ตรวจสอบได้');
    const folders = new Set();
    let offset = 0;
    while (true) {
      const { data, error } = await bucket.list(path, { limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } });
      if (error) throw error;
      const entries = data || [];
      for (const entry of entries) {
        if (entry.metadata && entry.metadata.size !== undefined) {
          totals.files += 1;
          totals.bytes += Number(entry.metadata.size) || 0;
        } else if (entry.name) {
          folders.add(path ? `${path}/${entry.name}` : entry.name);
        }
      }
      if (entries.length < 1000) break;
      offset += entries.length;
    }
    for (const folder of folders) await walk(folder, depth + 1);
  };
  await walk();
  return totals;
}

function formatMetricBytes(bytes) {
  if (bytes === null || bytes === undefined || Number.isNaN(Number(bytes))) return 'ยังตรวจไม่ได้';
  const value = Number(bytes);
  if (value < 1024) return `${value} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let amount = value / 1024;
  let unitIndex = 0;
  while (amount >= 1024 && unitIndex < units.length - 1) {
    amount /= 1024;
    unitIndex += 1;
  }
  return `${amount.toFixed(amount < 10 ? 2 : 1)} ${units[unitIndex]}`;
}

function UsageCard({ title, value, detail, badge, meter }) {
  const meterPercent = meter?.used !== null && meter?.used !== undefined && meter?.limit > 0
    ? Math.min(100, Math.max(0, (meter.used / meter.limit) * 100))
    : null;
  return (
    <article className="usage-card flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        {badge && <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-800">{badge}</span>}
      </div>
      <p className="mt-3 break-words text-xl font-bold text-slate-800">{value}</p>
      {meter && (
        <div className="mt-4" aria-label={meterPercent === null ? `${meter.label}: ยังไม่มีข้อมูลการใช้งานจริง` : `${meter.label}: ${meterPercent.toFixed(1)}%`}>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 ring-1 ring-inset ring-slate-200">
            {meterPercent !== null && <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-[width] duration-700 ease-out" style={{ width: `${meterPercent}%` }} />}
            {meterPercent === null && <div className="h-full w-full rounded-full bg-[repeating-linear-gradient(135deg,transparent,transparent_6px,rgba(148,163,184,.12)_6px,rgba(148,163,184,.12)_12px)]" />}
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 text-[11px] font-medium text-slate-500">
            <span>{meterPercent === null ? 'ยอดใช้งานจริงยังไม่เชื่อมต่อ' : `ใช้ ${meter.usedLabel || formatMetricBytes(meter.used)}`}</span>
            <span className="shrink-0">{meter.limitLabel}</span>
          </div>
        </div>
      )}
      <p className="mt-auto pt-3 text-xs leading-5 text-slate-500">{detail}</p>
    </article>
  );
}

function SystemPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [checking, setChecking] = useState(false);
  const [checks, setChecks] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function checkSupabase() {
      if (!supabase) {
        setChecks({
          reports: { ok: false, message: 'ยังไม่ได้ตั้งค่าการเชื่อมต่อ' },
          calendar: { ok: false, message: 'ยังไม่ได้ตั้งค่าการเชื่อมต่อ' },
          trips: { ok: false, message: 'ยังไม่ได้ตั้งค่าการเชื่อมต่อ' },
          media: { ok: false, message: 'ยังไม่ได้ตั้งค่าการเชื่อมต่อ' },
        });
        setChecking(false);
        return;
      }

      setChecking(true);
      const [reports, calendar, trips, mediaCheck, mediaUsage] = await Promise.all([
        supabase.from('daily_reports').select('id', { count: 'exact', head: true }),
        supabase.from('calendar_notes').select('id', { count: 'exact', head: true }),
        supabase.from('provincial_trips').select('id', { count: 'exact', head: true }),
        supabase.storage.from('media').list('', { limit: 1 }),
        measureBucketUsage(supabase.storage.from('media')).then((data) => ({ data })).catch((error) => ({ error })),
      ]);

      if (!cancelled) {
        setChecks({
          reports: reports.error
            ? { ok: false, message: reports.error.message, count: null }
            : { ok: true, message: `${reports.count ?? 0} รายการ`, count: reports.count ?? 0 },
          calendar: calendar.error
            ? { ok: false, message: calendar.error.message, count: null }
            : { ok: true, message: `${calendar.count ?? 0} รายการ`, count: calendar.count ?? 0 },
          trips: trips.error
            ? { ok: false, message: trips.error.message, count: null }
            : { ok: true, message: `${trips.count ?? 0} รายการ`, count: trips.count ?? 0 },
          media: mediaCheck.error || mediaUsage.error
            ? { ok: false, message: (mediaCheck.error || mediaUsage.error).message, files: null, bytes: null }
            : { ok: true, message: `${mediaUsage.data.files} ไฟล์ · ${formatMetricBytes(mediaUsage.data.bytes)}`, files: mediaUsage.data.files, bytes: mediaUsage.data.bytes },
        });
        setChecking(false);
      }
    }

    checkSupabase();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const supabaseDashboard = supabaseDiagnostics.projectRef
    ? `https://supabase.com/dashboard/project/${supabaseDiagnostics.projectRef}`
    : '';
  const totalRows = checks?.reports?.count !== null && checks?.reports?.count !== undefined
    && checks?.calendar?.count !== null && checks?.calendar?.count !== undefined
    && checks?.trips?.count !== null && checks?.trips?.count !== undefined
    ? checks.reports.count + checks.calendar.count + checks.trips.count
    : null;

  const StatusLine = ({ label, result }) => (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-3 last:border-b-0">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`max-w-[65%] text-right text-sm ${result?.ok ? 'text-emerald-700' : 'text-amber-700'}`}>
        {checking ? 'กำลังตรวจสอบ…' : result?.message || 'ยังไม่ได้ตรวจสอบ'}
      </span>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">สถานะระบบ</h1>
          <p className="mt-1 text-sm text-slate-500">ภาพรวมบริการที่เว็บใช้งานและการเชื่อมต่อปัจจุบัน</p>
        </div>
        <button type="button" onClick={() => setRefreshKey((key) => key + 1)}
          disabled={checking}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60">
          {checking ? 'กำลังตรวจสอบ…' : 'ตรวจสอบการเชื่อมต่ออีกครั้ง'}
        </button>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
        <div className="border-l-4 border-slate-800 px-5 py-5 sm:px-7">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm"><IconSettings /></span>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-800">ข้อมูลระบบสำหรับผู้ดูแล</h2>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2"><IconCalendar /> ฐานข้อมูลใช้ <strong className="text-slate-800">Supabase</strong></span>
                <span className="inline-flex items-center gap-2"><IconClock /> เว็บไซต์ใช้ <strong className="text-slate-800">Firebase Hosting</strong></span>
                <span className="inline-flex items-center gap-2"><IconCopy /> Source code อยู่ที่ <a className="font-semibold text-blue-800 underline underline-offset-2" href="https://github.com/AllCodeCraft-Ch/Report" target="_blank" rel="noreferrer">GitHub · Report ↗</a></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <h2 className="text-base font-bold text-slate-800">พื้นที่ โควตา และคำขอ</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">ยอดข้อมูลและไฟล์ที่อ่านจากโปรเจ็กต์แสดงตามจริงเท่าที่เว็บมีสิทธิ์อ่าน ส่วนยอดการใช้รวมของผู้ให้บริการต้องใช้ metrics API ฝั่งเซิร์ฟเวอร์ จึงไม่แสดงเป็นตัวเลขคาดเดา</p>
        </div>
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3 sm:p-5">
          <UsageCard title="Supabase · จำนวนข้อมูล" value={checking ? 'กำลังตรวจสอบ…' : totalRows === null ? 'ตรวจไม่ครบ' : `${totalRows.toLocaleString('th-TH')} แถว`} badge="นับแถวจริง"
            detail={totalRows === null ? 'จำนวนแถวจากตาราง daily_reports, calendar_notes และ provincial_trips' : `${totalRows.toLocaleString('th-TH')} แถว · ขนาดฐานข้อมูลเป็น MB/GB ต้องอ่านจาก Supabase Usage`} />
          <UsageCard title="Supabase · พื้นที่ไฟล์ media" value={checking ? 'กำลังตรวจสอบ…' : checks?.media?.ok ? formatMetricBytes(checks.media.bytes) : 'ตรวจไม่ได้'} badge="ยอดจากไฟล์ใน bucket"
            meter={{ used: checks?.media?.ok ? checks.media.bytes : null, limit: 1024 ** 3, label: 'Supabase Storage', limitLabel: 'จาก 1 GB*' }}
            detail={checks?.media?.ok ? `${checks.media.files.toLocaleString('th-TH')} ไฟล์ · 1 GB เป็นโควตาอ้างอิงของ Free plan; แผนจริงของโปรเจ็กต์นี้ยังไม่ได้อ่าน` : 'ต้องมีสิทธิ์ list ไฟล์ใน bucket media เพื่อรวมขนาดไฟล์'} />
          <UsageCard title="Supabase · Database size" value="ดูยอดจริงใน Usage" badge="ต้องใช้ project metrics"
            meter={{ used: null, limit: 500 * 1024 ** 2, label: 'Supabase Database', limitLabel: 'จาก 500 MB*' }}
            detail="เว็บใช้ anon key จึงอ่านขนาด PostgreSQL disk และ egress รวมของโปรเจ็กต์ไม่ได้ · 500 MB เป็นเพียงโควตาอ้างอิง Free plan" />
          <UsageCard title="Supabase · API requests / egress" value="ยอดรวมยังไม่เชื่อมต่อ" badge="ไม่มีการเดายอด"
            meter={{ used: null, limit: 5 * 1024 ** 3, label: 'Supabase Egress', limitLabel: 'Egress จาก 5 GB*' }}
            detail="Free plan ระบุ API requests ไม่จำกัดจำนวน และมี egress 5 GB + cached egress 5 GB เป็นค่าอ้างอิง · ยอดจริงดูจาก Usage dashboard" />
          <UsageCard title="Firebase Hosting · พื้นที่" value="โควตาอ้างอิง 10 GB" badge="ยอดจริงยังไม่เชื่อมต่อ"
            meter={{ used: null, limit: 10 * 1024 ** 3, label: 'Firebase Hosting storage', limitLabel: 'จาก 10 GB*' }}
            detail="รวมไฟล์ของ release ที่เก็บไว้ทั้งหมด ไม่ใช่แค่ไฟล์ใน dist ปัจจุบัน · แผนและยอดจริงตรวจจาก Firebase Usage dashboard" />
          <UsageCard title="Firebase Hosting · รับส่งข้อมูล" value="โควตาอ้างอิง 10 GB / เดือน" badge="คำขอผ่าน CDN"
            meter={{ used: null, limit: 10 * 1024 ** 3, label: 'Firebase Hosting transfer', limitLabel: 'จาก 10 GB/เดือน*' }}
            detail="Firebase คิดตาม data transfer มากกว่านับจำนวน request · ต้องเปิด Cloud Logging export จึงตรวจ request count, response count และ bytes ได้" />
        </div>
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 text-xs leading-5 text-slate-600 sm:px-6">
          โควตา Free/Spark ข้างต้นเป็นค่าอ้างอิงจากหน้าราคา ไม่ได้ยืนยัน billing plan ของโปรเจ็กต์นี้: <a className="font-semibold text-blue-700 underline" href="https://supabase.com/pricing" target="_blank" rel="noreferrer">Supabase pricing</a> · <a className="font-semibold text-blue-700 underline" href="https://firebase.google.com/docs/hosting/usage-quotas-pricing" target="_blank" rel="noreferrer">Firebase Hosting quotas</a> · <a className="font-semibold text-blue-700 underline" href="https://firebase.google.com/docs/hosting/web-request-logs-and-metrics" target="_blank" rel="noreferrer">Firebase request logs</a>
        </div>
      </section>

      <h2 className="-mb-2 text-base font-bold text-slate-800">การเชื่อมต่อปัจจุบัน</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          { title: 'Supabase Database', label: 'รายงานรายวัน', Icon: IconClipboard, result: checks?.reports },
          { title: 'Supabase Database', label: 'รายการในปฏิทิน', Icon: IconCalendar, result: checks?.calendar },
          { title: 'Supabase Database', label: 'ออกต่างจังหวัด', Icon: IconPlane, result: checks?.trips },
          { title: 'Supabase Storage', label: 'ไฟล์สื่อ · bucket media', Icon: IconPhoto, result: checks?.media },
        ].map(({ title, label, Icon, result }) => {
          const ready = result?.ok;
          const pending = checking || !checks;
          return (
            <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${ready ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}><Icon /></span>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">{title}</p>
                    <h3 className="truncate text-base font-bold text-slate-800">{label}</h3>
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${pending && !result ? 'bg-blue-50 text-blue-700' : ready ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  {pending && !result ? 'ตรวจสอบ…' : ready ? 'พร้อม' : 'ตรวจสอบ'}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-500">{ready ? 'เชื่อมต่อได้' : pending && !result ? 'กำลังตรวจสอบการเชื่อมต่อ' : 'ยังอ่านข้อมูลไม่ได้'}</span>
                <strong className={`text-right ${ready ? 'text-emerald-700' : 'text-slate-600'}`}>{pending && !result ? '…' : result?.message || 'รอตรวจสอบ'}</strong>
              </div>
              {result && !result.ok && !checking && <p className="mt-2 break-words text-xs leading-5 text-amber-700">{result.message}</p>}
            </article>
          );
        })}
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><IconClock /></span>
              <div><p className="text-xs text-slate-500">เว็บไซต์</p><h3 className="text-base font-bold text-slate-800">Firebase Hosting</h3></div>
            </div>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">ตั้งค่าแล้ว</span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 text-sm"><span className="text-slate-500">Project ID</span><strong className="text-slate-700">report-doday</strong></div>
          <a className="mt-2 inline-flex text-sm font-medium text-blue-700 underline underline-offset-2" href="https://report-doday.web.app/" target="_blank" rel="noreferrer">เปิดเว็บไซต์ ↗</a>
        </article>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div><h2 className="text-base font-bold text-slate-800">การตั้งค่า Supabase</h2><p className="mt-1 text-xs text-slate-500">ค่าที่เว็บใช้งานและผลตรวจการเข้าถึง</p></div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${supabaseDiagnostics.configured ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{supabaseDiagnostics.configured ? 'ตั้งค่าแล้ว' : 'ยังไม่ตั้งค่า'}</span>
          </div>
          <dl className="mt-3">
            <DetailRow label="Project ref" value={supabaseDiagnostics.projectRef || 'ไม่มีข้อมูล'} mono />
            <DetailRow label="Project URL" value={supabaseDiagnostics.projectUrl || 'ไม่ได้ตั้งค่า VITE_SUPABASE_URL'} mono />
            <DetailRow label="Publishable / anon key" value={supabaseDiagnostics.hasAnonKey ? 'ตั้งค่าแล้ว (ซ่อนค่าไว้)' : 'ไม่ได้ตั้งค่า'} />
          </dl>
          <div className="mt-2 border-t border-slate-100 pt-1">
            <StatusLine label="ตาราง daily_reports" result={checks?.reports} />
            <StatusLine label="ตาราง calendar_notes" result={checks?.calendar} />
            <StatusLine label="ตาราง provincial_trips" result={checks?.trips} />
            <StatusLine label="Storage bucket media" result={checks?.media} />
          </div>
          {supabaseDashboard && <div className="mt-4 flex flex-wrap gap-2">
            <a href={supabaseDashboard} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800">เปิด Supabase Dashboard ↗</a>
            <a href={`${supabaseDashboard}/settings/usage`} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100">ดู Usage จริง ↗</a>
          </div>}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div><h2 className="text-base font-bold text-slate-800">การตั้งค่า Firebase</h2><p className="mt-1 text-xs text-slate-500">เว็บไซต์และบริการที่กำหนดไว้ใน repository</p></div>
          <dl className="mt-3">
            <DetailRow label="Project ID" value="report-doday" mono />
            <DetailRow label="Hosting URL" value={<a className="break-all text-blue-700 underline" href="https://report-doday.web.app/" target="_blank" rel="noreferrer">https://report-doday.web.app/ ↗</a>} />
            <DetailRow label="โฟลเดอร์ที่ deploy" value="dist/" mono />
            <DetailRow label="บริการที่ตรวจพบจากโค้ด" value="Firebase Hosting" />
            <DetailRow label="Cloud Functions / Cloud Storage / Firestore / Realtime Database / FCM" value="ไม่พบการตั้งค่าใช้งานใน repository นี้" />
            <DetailRow label="Billing / quota" value="แผนจริงและยอดใช้จริงต้องตรวจใน Firebase Console" />
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href="https://console.firebase.google.com/project/report-doday/hosting" target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-800">เปิด Hosting Usage ↗</a>
            <a href="https://console.firebase.google.com/project/report-doday/usage" target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-100">ดู Usage & Billing ↗</a>
          </div>
        </section>
      </div>

      <aside className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
        Supabase Usage/Management API ต้องใช้สิทธิ์ผู้ดูแล จึงไม่ควรฝังคีย์ลับในเว็บ ส่วน Firebase Hosting request logs ต้องเปิด Cloud Logging export ก่อน ตัวเลขอ้างอิง Free/Spark ในหน้านี้ไม่ใช่การยืนยันแผนหรือยอดใช้จริงของบัญชี
      </aside>
    </div>
  );
}

async function deriveFinancePinHash(pin, salt) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: Uint8Array.from(atob(salt), (char) => char.charCodeAt(0)), iterations: 150000, hash: 'SHA-256' }, key, 256);
  return Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function PersonalFinancePage({ ownerId }) {
  const [pinMode, setPinMode] = useState('checking');
  const [pinError, setPinError] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [pinBusy, setPinBusy] = useState(false);
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [recordError, setRecordError] = useState('');
  const [month, setMonth] = useState(bangkokISODate().slice(0, 7));
  const [selectedDate, setSelectedDate] = useState(bangkokISODate());
  const [amount, setAmount] = useState('');
  const [detail, setDetail] = useState('');
  const [savingId, setSavingId] = useState('');
  const [editingId, setEditingId] = useState('');

  useEffect(() => {
    setPinCode(''); setPinError('');
    if (!ownerId) { setPinMode('error'); setPinError('ไม่พบผู้ใช้ที่เข้าสู่ระบบ'); return; }
    try {
      setPinMode(localStorage.getItem(`daily-report.finance-pin.v1.${ownerId}`) ? 'locked' : 'setup');
    } catch { setPinMode('error'); setPinError('เปิดที่เก็บ PIN ในเบราว์เซอร์ไม่ได้'); }
  }, [ownerId]);

  useEffect(() => {
    let active = true;
    async function loadRecords() {
      if (pinMode !== 'open' || !ownerId || !supabase) return;
      setRecordsLoading(true); setRecordError('');
      const { data, error: queryError } = await supabase.from('personal_finance').select('id,owner_id,amount_satang,transaction_at,detail').eq('owner_id', ownerId).order('transaction_at', { ascending: false });
      if (!active) return;
      if (queryError) {
        setRecordError('โหลดรายการไม่สำเร็จ ตรวจสอบการเชื่อมต่อแล้วลองใหม่');
        setRecordsLoading(false);
        return;
      }
      setRecords((data || []).filter((row) => row.amount_satang != null && row.transaction_at && row.detail != null).map((row) => ({
        id: row.id,
        amountSatang: Number(row.amount_satang),
        transactionAt: row.transaction_at,
        detail: row.detail,
      })));
      setRecordsLoading(false);
    }
    loadRecords().catch(() => { if (active) { setRecordError('โหลดรายการไม่สำเร็จ กรุณาลองอีกครั้ง'); setRecordsLoading(false); } });
    return () => { active = false; };
  }, [pinMode, ownerId]);

  const submitPin = async (event) => {
    event.preventDefault();
    const pin = pinCode.trim();
    if (!/^\d{6}$/.test(pin)) { setPinError('ตั้ง PIN เป็นตัวเลข 6 หลัก'); return; }
    setPinBusy(true); setPinError('');
    try {
      const key = `daily-report.finance-pin.v1.${ownerId}`;
      if (pinMode === 'setup') {
        const saltBytes = crypto.getRandomValues(new Uint8Array(16));
        const salt = btoa(String.fromCharCode(...saltBytes));
        const hash = await deriveFinancePinHash(pin, salt);
        localStorage.setItem(key, JSON.stringify({ salt, hash }));
        setPinMode('open');
      } else {
        const saved = JSON.parse(localStorage.getItem(key) || 'null');
        const hash = saved?.salt && saved?.hash ? await deriveFinancePinHash(pin, saved.salt) : '';
        if (!hash || hash !== saved.hash) throw new Error('PIN mismatch');
        setPinMode('open');
      }
      setPinCode('');
    } catch {
      setPinError(pinMode === 'setup' ? 'ตั้ง PIN ไม่สำเร็จ กรุณาลองใหม่' : 'PIN ไม่ถูกต้อง หรือไม่พบ PIN ที่ตั้งไว้');
    } finally { setPinBusy(false); }
  };

  const resetFinancePin = () => {
    try { localStorage.removeItem(`daily-report.finance-pin.v1.${ownerId}`); setPinCode(''); setPinError(''); setPinMode('setup'); }
    catch { setPinError('เปลี่ยน PIN ไม่สำเร็จ'); }
  };

  const saveRecord = async (event) => {
    event.preventDefault();
    const amountSatang = parseFinanceAmount(amount);
    if (!amountSatang || !detail.trim()) { setRecordError('กรอกจำนวนเงินและรายละเอียดให้ครบ'); return; }
    if (!supabase || !ownerId) { setRecordError('ยังไม่ได้เชื่อมต่อบัญชี'); return; }
    setSavingId(editingId || 'new'); setRecordError('');
    try {
      const values = { amount_satang: amountSatang, detail: detail.trim() };
      if (editingId) {
        const { data, error: updateError } = await supabase.from('personal_finance').update(values).eq('id', editingId).eq('owner_id', ownerId).select('id,owner_id,amount_satang,transaction_at,detail').maybeSingle();
        if (updateError || !data) throw updateError || new Error('No row updated');
        setRecords((current) => current.map((record) => record.id === editingId ? { ...record, amountSatang: Number(data.amount_satang), detail: data.detail } : record));
      } else {
        const { data, error: insertError } = await supabase.from('personal_finance').insert({ ...values, owner_id: ownerId }).select('id,owner_id,amount_satang,transaction_at,detail').single();
        if (insertError || !data) throw insertError || new Error('No row inserted');
        setRecords((current) => [{ id: data.id, amountSatang: Number(data.amount_satang), transactionAt: data.transaction_at, detail: data.detail }, ...current]);
      }
      setAmount(''); setDetail(''); setEditingId('');
    } catch {
      setRecordError('บันทึกไม่สำเร็จ ตรวจสอบว่ามีการอัปเดตตารางรายการเงินแล้วลองอีกครั้ง');
    } finally { setSavingId(''); }
  };

  const deleteRecord = async (record) => {
    if (!await requestAppDialog('confirm', 'ลบรายการการเงินนี้หรือไม่? การลบไม่สามารถกู้คืนจากระบบได้')) return;
    const { data, error: deleteError } = await supabase.from('personal_finance').delete().eq('id', record.id).eq('owner_id', ownerId).select('id').maybeSingle();
    if (deleteError || !data) { setRecordError('ลบรายการไม่สำเร็จ'); return; }
    setRecords((current) => current.filter((item) => item.id !== record.id));
  };

  const bangkokParts = (value) => Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(value)).map((part) => [part.type, part.value]));
  const dateKey = (value) => { const p = bangkokParts(value); return `${p.year}-${p.month}-${p.day}`; };
  const monthKey = (value) => dateKey(value).slice(0, 7);
  const formatTransactionDate = (value) => new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeZone: 'Asia/Bangkok' }).format(new Date(value));
  const monthRecords = records.filter((record) => monthKey(record.transactionAt) === month);
  const dayRecords = records.filter((record) => dateKey(record.transactionAt) === selectedDate);
  const sumAmount = (list) => list.reduce((sum, record) => sum + BigInt(record.amountSatang), 0n);

  if (pinMode !== 'open') return (
    <div className="mx-auto max-w-xl space-y-4 rounded-2xl border border-slate-700 bg-slate-900 p-5 text-white shadow-sm sm:p-7">
      <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-300">รายการเงิน</p><h1 className="mt-1 text-xl font-bold">{pinMode === 'setup' ? 'ตั้ง PIN 6 หลัก' : 'ใส่ PIN 6 หลัก'}</h1><p className="mt-1 text-sm text-slate-400">{pinMode === 'setup' ? 'กำหนด PIN ตัวเลขที่คุณต้องการเพื่อเปิดหน้านี้บนอุปกรณ์นี้' : 'ใช้ PIN ที่ตั้งไว้บนอุปกรณ์นี้'}</p></div>
      {pinMode === 'checking' && <p className="text-sm text-slate-300">กำลังตรวจสอบ PIN…</p>}
      {pinMode === 'error' && <p role="alert" className="text-sm text-rose-300">{pinError}</p>}
      {(pinMode === 'setup' || pinMode === 'locked') && <form onSubmit={submitPin} className="space-y-4">
        <label className="block"><span className="mb-1 block text-xs font-semibold text-slate-300">PIN ตัวเลข 6 หลัก</span><input value={pinCode} onChange={(event) => setPinCode(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="new-password" pattern="[0-9]{6}" maxLength={6} required className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-lg tracking-[.3em] text-white" /></label>
        {pinError && <p role="alert" className="text-sm text-rose-300">{pinError}</p>}
        <button type="submit" disabled={pinBusy || pinCode.length !== 6} className="min-h-11 w-full rounded-xl bg-blue-600 px-4 text-sm font-bold text-white disabled:opacity-60">{pinBusy ? 'กำลังตรวจสอบ…' : pinMode === 'setup' ? 'ตั้ง PIN และเปิดหน้า' : 'เข้าใช้งาน'}</button>
        {pinMode === 'locked' && <button type="button" onClick={resetFinancePin} className="min-h-10 w-full rounded-xl border border-slate-600 px-4 text-sm text-slate-300">ลืม PIN? ตั้งใหม่บนอุปกรณ์นี้</button>}
      </form>}
      <p className="text-xs leading-5 text-slate-500">PIN นี้เป็นด่านเปิดหน้าบนอุปกรณ์นี้เท่านั้น การเข้าสู่ระบบและสิทธิ์เจ้าของข้อมูลในฐานข้อมูลยังคงใช้ Supabase Auth และ RLS</p>
    </div>
  );

  const visibleMonthRecords = [...monthRecords].sort((a, b) => b.transactionAt.localeCompare(a.transactionAt));
  const cancelEdit = () => { setEditingId(''); setAmount(''); setDetail(''); };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <header><p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-300">บันทึกและสรุปยอด</p><h1 className="mt-1 text-2xl font-bold text-white">รายการเงิน</h1><p className="mt-1 text-sm text-slate-400">กรอกจำนวนเงินและรายละเอียด · วันที่และเวลาบันทึกให้อัตโนมัติ</p></header>
      <section className="rounded-2xl border border-slate-700 bg-slate-900 p-4 text-white sm:p-5">
        <h2 className="text-base font-bold">{editingId ? 'แก้ไขรายการ' : 'เพิ่มรายการ'}</h2>
        <form onSubmit={saveRecord} className="mt-4 space-y-3">
          <label className="block"><span className="mb-1 block text-xs text-slate-400">จำนวนเงิน (บาท)</span><input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" required className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-base text-white" /></label>
          <label className="block"><span className="mb-1 block text-xs text-slate-400">รายละเอียด</span><textarea rows={2} value={detail} onChange={(event) => setDetail(event.target.value)} placeholder="เช่น ค่าอาหาร, ค่าเดินทาง" required className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white placeholder:text-slate-500" /></label>
          {recordError && <p role="alert" className="text-sm text-rose-300">{recordError}</p>}
          <div className="flex flex-wrap gap-2">{editingId && <button type="button" onClick={cancelEdit} className="min-h-10 rounded-lg border border-slate-700 px-4 text-xs font-semibold text-slate-300">ยกเลิก</button>}<button type="submit" disabled={Boolean(savingId)} className="min-h-10 rounded-lg bg-blue-600 px-4 text-xs font-bold text-white disabled:opacity-60">{savingId ? 'กำลังบันทึก…' : editingId ? 'บันทึกการแก้ไข' : 'บันทึกรายการ'}</button></div>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-700 bg-slate-900 p-4 text-white sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-base font-bold">สรุปยอด</h2><p className="mt-1 text-xs text-slate-400">คำนวณจากรายการทั้งหมด · Asia/Bangkok</p></div><label className="block"><span className="mb-1 block text-xs text-slate-400">เลือกเดือน</span><input type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" /></label></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"><p className="text-xs text-slate-400">ยอดรวมรายเดือน · {month}</p><p className="mt-1 text-2xl font-bold text-cyan-200">฿{formatFinanceAmount(sumAmount(monthRecords))}</p><p className="mt-1 text-xs text-slate-500">{monthRecords.length} รายการ</p></div><div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"><label className="block"><span className="text-xs text-slate-400">สรุปรายวัน</span><input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" /></label><p className="mt-2 text-2xl font-bold text-cyan-200">฿{formatFinanceAmount(sumAmount(dayRecords))}</p><p className="mt-1 text-xs text-slate-500">{dayRecords.length} รายการ</p></div></div>
      </section>

      <section className="space-y-3"><div className="flex items-center justify-between gap-3"><h2 className="text-sm font-bold text-white">รายการของเดือน {month}</h2><span className="text-xs text-slate-400">{visibleMonthRecords.length} รายการ</span></div>
        {recordsLoading ? <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-8 text-center text-sm text-slate-400">กำลังโหลดรายการ…</div> : visibleMonthRecords.length ? visibleMonthRecords.map((record) => <article key={record.id} className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-white"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="text-lg font-bold text-cyan-200">฿{formatFinanceAmount(record.amountSatang)}</p><p className="mt-0.5 text-xs text-slate-400">{formatTransactionDate(record.transactionAt)} · {bangkokParts(record.transactionAt).hour}:{bangkokParts(record.transactionAt).minute} น.</p><p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-200">{record.detail}</p></div><div className="flex shrink-0 gap-2"><button type="button" onClick={() => { setEditingId(record.id); setAmount(formatFinanceAmount(record.amountSatang)); setDetail(record.detail); }} className="min-h-9 rounded-lg border border-slate-600 px-3 text-xs font-semibold text-blue-200">แก้ไข</button><button type="button" onClick={() => deleteRecord(record)} className="min-h-9 rounded-lg border border-rose-900 px-3 text-xs font-semibold text-rose-300">ลบ</button></div></div></article>) : <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-8 text-center text-sm text-slate-400">ยังไม่มีรายการในเดือนนี้</div>}
      </section>
    </div>
  );
}

const BACKUP_TABLES = [
  ['daily_reports', 'รายงานประจำวัน'],
  ['provincial_trips', 'การเดินทางต่างจังหวัด'],
  ['calendar_notes', 'บันทึกปฏิทิน'],
  ['provincial_trip_cutoffs', 'ประวัติช่วงวันที่ส่งแล้ว'],
];

function BackupPage() {
  const fileInputRef = useRef(null);
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [backupFile, setBackupFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const readTable = async (table) => {
    const rows = [];
    const pageSize = 500;
    for (let offset = 0; ; offset += pageSize) {
      const { data, error: queryError } = await supabase.from(table).select('*').order('id', { ascending: true }).range(offset, offset + pageSize - 1);
      if (queryError) throw queryError;
      rows.push(...(data || []));
      if (!data || data.length < pageSize) return rows;
    }
  };

  const downloadBackup = async () => {
    if (!supabase) { setError('ยังไม่ได้ตั้งค่าการเชื่อมต่อ Supabase'); return; }
    setBackupLoading(true); setError(''); setMessage('');
    try {
      const tables = {};
      for (const [table] of BACKUP_TABLES) tables[table] = await readTable(table);
      const backup = { format: 'daily-report-backup', version: 1, createdAt: new Date().toISOString(), tables };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `daily-report-backup-${localISODate()}.json`;
      document.body.appendChild(link); link.click(); link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage(`สำรองข้อมูลแล้ว · ${BACKUP_TABLES.reduce((sum, [table]) => sum + tables[table].length, 0).toLocaleString('th-TH')} รายการ`);
    } catch {
      setError('สำรองข้อมูลไม่สำเร็จ ตรวจสอบสิทธิ์การอ่านตารางแล้วลองอีกครั้ง');
    } finally { setBackupLoading(false); }
  };

  const selectBackupFile = async (file) => {
    setBackupFile(null); setPreview(null); setError(''); setMessage('');
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { setError('ไฟล์สำรองมีขนาดเกิน 50 MB'); return; }
    try {
      const data = JSON.parse(await file.text());
      if (data?.format !== 'daily-report-backup' || data?.version !== 1 || !data?.tables || BACKUP_TABLES.some(([table]) => !Array.isArray(data.tables[table]))) {
        throw new Error('invalid');
      }
      if (BACKUP_TABLES.some(([table]) => data.tables[table].some((row) => !row || typeof row !== 'object' || Array.isArray(row)))) {
        throw new Error('invalid');
      }
      setBackupFile(file);
      setPreview({ createdAt: data.createdAt || '', tables: data.tables });
    } catch {
      setError('ไฟล์ไม่ถูกต้องหรือไม่ใช่ไฟล์สำรองของ Daily Report');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const restoreBackup = async () => {
    if (!supabase || !preview || !backupFile) return;
    const total = BACKUP_TABLES.reduce((sum, [table]) => sum + preview.tables[table].length, 0);
    if (!total) { setError('ไฟล์นี้ไม่มีรายการให้กู้คืน'); return; }
    const confirmed = await requestAppDialog('confirm', `เพิ่มข้อมูลจากไฟล์สำรอง ${total.toLocaleString('th-TH')} รายการหรือไม่? รายการ ID ที่มีอยู่แล้วจะถูกข้าม ข้อมูลปัจจุบันจะไม่ถูกลบหรือเขียนทับ`);
    if (!confirmed) return;

    setRestoreLoading(true); setError(''); setMessage('');
    let restored = 0;
    let skipped = 0;
    try {
      for (const [table] of BACKUP_TABLES) {
        const incoming = preview.tables[table];
        const existingIds = new Set();
        if (incoming.some((row) => row.id !== undefined && row.id !== null)) {
          for (let offset = 0; ; offset += 500) {
            const { data, error: queryError } = await supabase.from(table).select('id').range(offset, offset + 499);
            if (queryError) throw queryError;
            (data || []).forEach((row) => existingIds.add(String(row.id)));
            if (!data || data.length < 500) break;
          }
        }
        const additions = incoming.filter((row) => row.id === undefined || row.id === null || !existingIds.has(String(row.id)));
        skipped += incoming.length - additions.length;
        for (let offset = 0; offset < additions.length; offset += 100) {
          const { error: insertError } = await supabase.from(table).insert(additions.slice(offset, offset + 100));
          if (insertError) throw insertError;
          restored += Math.min(100, additions.length - offset);
        }
      }
      setMessage(`กู้คืนเสร็จแล้ว · เพิ่ม ${restored.toLocaleString('th-TH')} รายการ · ข้ามรายการซ้ำ ${skipped.toLocaleString('th-TH')} รายการ`);
      setBackupFile(null); setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      setError(`กู้คืนได้ ${restored.toLocaleString('th-TH')} รายการก่อนพบข้อผิดพลาด ข้อมูลที่เพิ่มแล้วจะยังคงอยู่ กรุณาตรวจสอบข้อมูลก่อนลองอีกครั้ง`);
    } finally { setRestoreLoading(false); }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-300">Data safety</p>
        <h1 className="mt-1 text-2xl font-bold text-white">สำรองและกู้คืนข้อมูล</h1>
        <p className="mt-1 text-sm text-slate-400">ดาวน์โหลดข้อมูลไว้ในอุปกรณ์ และนำไฟล์สำรองกลับเข้าระบบได้</p>
      </header>

      <section className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 text-white shadow-sm">
        <div className="border-b border-slate-700 bg-gradient-to-r from-blue-950 to-cyan-950 px-5 py-4">
          <h2 className="text-base font-bold">สำรองข้อมูล</h2>
          <p className="mt-1 text-xs text-blue-100/80">สร้างไฟล์ JSON ที่รวมรายงาน การเดินทาง ปฏิทิน และประวัติช่วงวันที่ส่งแล้ว</p>
        </div>
        <div className="p-5">
          <button type="button" onClick={downloadBackup} disabled={backupLoading} className="min-h-11 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-60">
            {backupLoading ? 'กำลังเตรียมไฟล์สำรอง…' : 'ดาวน์โหลดไฟล์สำรอง'}
          </button>
          <p className="mt-3 text-xs leading-5 text-slate-400">ไฟล์จะถูกดาวน์โหลดลงอุปกรณ์ของคุณ ควรเก็บไว้ในที่ปลอดภัย และไม่ส่งต่อให้ผู้อื่น</p>
          <p className="mt-1 text-xs leading-5 text-amber-300">ไม่รวมรูปภาพและวิดีโอในคลังสื่อ เนื่องจากไฟล์สื่ออาจมีขนาดใหญ่</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 text-white shadow-sm">
        <div className="border-b border-slate-700 px-5 py-4">
          <h2 className="text-base font-bold">กู้คืนจากไฟล์สำรอง</h2>
          <p className="mt-1 text-xs text-slate-400">ตรวจสอบจำนวนรายการก่อนเพิ่มกลับเข้าระบบ รายการที่มี ID ซ้ำจะถูกข้าม</p>
        </div>
        <div className="space-y-4 p-5">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-slate-300">เลือกไฟล์สำรอง (.json)</span>
            <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={(event) => selectBackupFile(event.target.files?.[0])} className="block w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white" />
          </label>
          {preview && <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-4">
            <p className="break-all text-sm font-semibold text-white">{backupFile?.name}</p>
            {preview.createdAt && <p className="mt-1 text-xs text-slate-400">สร้างเมื่อ {new Date(preview.createdAt).toLocaleString('th-TH')}</p>}
            <ul className="mt-3 grid gap-2 text-xs text-slate-300 sm:grid-cols-2">{BACKUP_TABLES.map(([table, label]) => <li key={table} className="flex justify-between gap-3 rounded-lg border border-slate-800 px-3 py-2"><span>{label}</span><strong>{preview.tables[table].length.toLocaleString('th-TH')} รายการ</strong></li>)}</ul>
            <button type="button" onClick={restoreBackup} disabled={restoreLoading} className="mt-4 min-h-11 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-60">{restoreLoading ? 'กำลังกู้คืน…' : 'กู้คืนข้อมูล'}</button>
          </div>}
          {error && <p role="alert" className="rounded-xl border border-rose-900/70 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">{error}</p>}
          {message && <p role="status" className="rounded-xl border border-emerald-900/70 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-200">{message}</p>}
        </div>
      </section>

      <aside className="rounded-xl border border-amber-900/60 bg-amber-950/30 px-4 py-3 text-xs leading-5 text-amber-100">การกู้คืนจะเพิ่มรายการที่ยังไม่มีในระบบเท่านั้น ไม่ลบหรือเขียนทับรายการเดิม หากเกิดข้อผิดพลาดระหว่างกู้คืน รายการที่เพิ่มสำเร็จไปแล้วจะยังอยู่</aside>
    </div>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    try {
      const savedPage = window.sessionStorage.getItem('daily-report-current-page');
      return Object.values(PAGES).includes(savedPage) ? savedPage : PAGES.DAILY;
    } catch {
      return PAGES.DAILY;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [recoveryPending, setRecoveryPending] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('type') === 'recovery');
  const [authLoading, setAuthLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return undefined;
    }

    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === 'PASSWORD_RECOVERY') setRecoveryPending(true);
      if (event === 'INITIAL_SESSION') return;
      const isAdmin = session?.user?.app_metadata?.role === 'admin';
      setCurrentUser(isAdmin ? session.user : null);
      setIsAuthenticated(isAdmin);
    });

    supabase.auth.getSession().then(async ({ data, error }) => {
      if (!active) return;
      if (error || !data.session) {
        setIsAuthenticated(false);
        setAuthLoading(false);
        return;
      }
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!active) return;
      const isAdmin = !userError && user?.app_metadata?.role === 'admin';
      setCurrentUser(isAdmin ? user : null);
      setIsAuthenticated(isAdmin);
      setAuthLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLoginSuccess = (user) => {
    if (user?.app_metadata?.role !== 'admin') return;
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handlePasswordUpdated = (user) => {
    if (user?.app_metadata?.role !== 'admin') return;
    setCurrentUser(user);
    setRecoveryPending(false);
    setIsAuthenticated(true);
  };

  useEffect(() => {
    try {
      window.sessionStorage.setItem('daily-report-current-page', currentPage);
    } catch {
      // Keep navigation working if browser storage is unavailable.
    }
  }, [currentPage]);

  const handleLogout = async () => {
    await supabase?.auth.signOut();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setCurrentPage(PAGES.DAILY);
  };

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">กำลังตรวจสอบบัญชีผู้ใช้…</div>;
  }

  if (recoveryPending) {
    return <><PasswordRecoveryPage onComplete={handlePasswordUpdated} /><AppDialogLayer /></>;
  }

  if (!isAuthenticated) {
    return <><LoginPage onLogin={handleLoginSuccess} /><AppDialogLayer /></>;
  }

  return (
    <>
      <Layout
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onLogout={handleLogout}
        user={currentUser}
      />
      <AppDialogLayer />
    </>
  );
}
