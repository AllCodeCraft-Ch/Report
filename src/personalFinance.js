export function normalizeThaiNumerals(value) {
  return String(value || '').replace(/[๐-๙]/g, (digit) => String('๐๑๒๓๔๕๖๗๘๙'.indexOf(digit)));
}

export function parseFinanceOcr(rawText) {
  const lines = normalizeThaiNumerals(rawText).replace(/[：﹕]/g, ':').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const dateCandidates = new Set();
  const monthNames = { 'ม.ค.': 1, 'มกราคม': 1, 'ก.พ.': 2, 'กุมภาพันธ์': 2, 'มี.ค.': 3, 'มีนาคม': 3, 'เม.ย.': 4, 'เมษายน': 4, 'พ.ค.': 5, 'พฤษภาคม': 5, 'มิ.ย.': 6, 'มิถุนายน': 6, 'ก.ค.': 7, 'กรกฎาคม': 7, 'ส.ค.': 8, 'สิงหาคม': 8, 'ก.ย.': 9, 'กันยายน': 9, 'ต.ค.': 10, 'ตุลาคม': 10, 'พ.ย.': 11, 'พฤศจิกายน': 11, 'ธ.ค.': 12, 'ธันวาคม': 12 };
  const addDate = (yearValue, monthValue, dayValue) => {
    let year = Number(yearValue); const month = Number(monthValue); const day = Number(dayValue);
    if (year >= 2400) year -= 543;
    const check = new Date(Date.UTC(year, month - 1, day));
    if (check.getUTCFullYear() === year && check.getUTCMonth() === month - 1 && check.getUTCDate() === day) dateCandidates.add(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
  };
  for (const line of lines) {
    for (const match of line.matchAll(/\b(20\d{2}|25\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/g)) addDate(match[1], match[2], match[3]);
    for (const match of line.matchAll(/\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})\b/g)) addDate(match[3].length === 2 ? `20${match[3]}` : match[3], match[2], match[1]);
    for (const match of line.matchAll(/\b(\d{1,2})\s+(ม\.ค\.|มกราคม|ก\.พ\.|กุมภาพันธ์|มี\.ค\.|มีนาคม|เม\.ย\.|เมษายน|พ\.ค\.|พฤษภาคม|มิ\.ย\.|มิถุนายน|ก\.ค\.|กรกฎาคม|ส\.ค\.|สิงหาคม|ก\.ย\.|กันยายน|ต\.ค\.|ตุลาคม|พ\.ย\.|พฤศจิกายน|ธ\.ค\.|ธันวาคม)\s+(\d{4})/g)) addDate(match[3], monthNames[match[2]], match[1]);
  }

  const timeCandidates = new Set();
  for (const line of lines) {
    // Slip OCR commonly separates the date/time label and value onto adjacent lines.
    for (const match of line.matchAll(/(?:^|[^\d])(\d{1,2}):(\d{2})(?::([0-5]\d))?\s*(AM|PM)?(?=$|[^\w])/gi)) {
      let hour = Number(match[1]); const meridiem = (match[4] || '').toUpperCase();
      if (meridiem) { if (hour < 1 || hour > 12) continue; if (hour === 12) hour = 0; if (meridiem === 'PM') hour += 12; }
      const minute = Number(match[2]);
      if (hour <= 23 && minute <= 59) timeCandidates.add(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    }
  }

  const amountCandidates = new Set();
  const amountLabel = /(ยอด(?:เงิน|โอน|ชำระ)|จำนวนเงิน|จำนวนที่โอน|รวม(?:ทั้งสิ้น)?|amount|total|transfer\s*amount|payment)/i;
  const excludeAmount = /(คงเหลือ|balance|available|ค่าธรรมเนียม|fee|เลขที่|บัญชี|account|reference|ref\.?)/i;
  const amountPattern = /(?:฿\s*)?(\d{1,3}(?:[,\s]\d{3})+|\d+)(?:\.(\d{1,2}))?(?:\s*(?:บาท|THB))?/gi;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const labelMatch = line.match(amountLabel);
    if (!labelMatch || excludeAmount.test(line)) continue;
    const sameLine = [...line.slice(labelMatch.index + labelMatch[0].length).matchAll(amountPattern)];
    // When the OCR puts the value below its label, inspect only that immediately following line.
    const valueLines = sameLine.length ? [line.slice(labelMatch.index + labelMatch[0].length)] : [lines[index + 1] || ''];
    for (const valueLine of valueLines) for (const match of valueLine.matchAll(amountPattern)) {
      const whole = match[1].replace(/[ ,]/g, '');
      const satang = Number(whole) * 100 + Number((match[2] || '').padEnd(2, '0'));
      if (Number.isSafeInteger(satang) && satang > 0) amountCandidates.add(satang);
    }
  }

  return {
    amountSatang: amountCandidates.size === 1 ? [...amountCandidates][0] : null,
    date: dateCandidates.size === 1 ? [...dateCandidates][0] : '',
    time: timeCandidates.size === 1 ? [...timeCandidates][0] : '',
  };
}

// Prepare each receipt entirely in memory. No object URL, cache, or network upload is used.
export async function prepareFinanceOcrImage(file) {
  let bitmap;
  let image;
  let objectUrl = '';
  let canvas;
  try {
    if (typeof createImageBitmap === 'function') {
      try { bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch { /* Use the browser image decoder fallback below. */ }
    }
    if (!bitmap) {
      objectUrl = URL.createObjectURL(file);
      image = new Image();
      image.src = objectUrl;
      await image.decode();
    }
    const source = bitmap || image;
    const maxDimension = 2600;
    const scale = Math.min(1, maxDimension / Math.max(source.width || source.naturalWidth, source.height || source.naturalHeight));
    canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round((source.width || source.naturalWidth) * scale));
    canvas.height = Math.max(1, Math.round((source.height || source.naturalHeight) * scale));
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) return file;
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(source, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
    return blob || file;
  } catch {
    // Let Tesseract handle formats it supports directly; unsupported formats become a blank draft.
    return file;
  } finally {
    bitmap?.close?.();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    if (canvas) { canvas.width = 0; canvas.height = 0; }
  }
}

export const formatFinanceAmount = (satang) => {
  const value = typeof satang === 'bigint' ? satang : BigInt(Number.isSafeInteger(satang) ? satang : 0);
  const baht = value / 100n;
  const fraction = String(value % 100n).padStart(2, '0');
  return `${new Intl.NumberFormat('th-TH').format(baht)}.${fraction}`;
};

export function parseFinanceAmount(value) {
  const normalized = normalizeThaiNumerals(value).replace(/[\s฿]/g, '').replace(/บาท|THB/gi, '').trim();
  if (!/^(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?$/.test(normalized)) return null;
  const [baht, fraction = ''] = normalized.split('.');
  const satang = Number(baht.replace(/,/g, '')) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(satang) && satang > 0 ? satang : null;
}

function bytesToBase64(bytes) {
  let binary = ''; for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

export async function deriveFinanceKey(passphrase, ownerId) {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: new TextEncoder().encode(`daily-report-personal-finance-v1:${ownerId}`), iterations: 600000, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

export async function encryptFinanceRecord(key, ownerId, recordId, record) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const additionalData = new TextEncoder().encode(`finance-v1:${ownerId}:${recordId}`);
  const plaintext = new TextEncoder().encode(JSON.stringify({ amountSatang: record.amountSatang, date: record.date, time: record.time, detail: record.detail }));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData }, key, plaintext);
  return `v1.${bytesToBase64(iv)}.${bytesToBase64(new Uint8Array(encrypted))}`;
}

export async function decryptFinanceRecord(key, ownerId, row) {
  const [version, iv, encrypted] = String(row.encrypted_payload || '').split('.');
  if (version !== 'v1' || !iv || !encrypted) throw new Error('Invalid encrypted record');
  const additionalData = new TextEncoder().encode(`finance-v1:${ownerId}:${row.id}`);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: base64ToBytes(iv), additionalData }, key, base64ToBytes(encrypted));
  const record = JSON.parse(new TextDecoder().decode(plaintext));
  if (!Number.isSafeInteger(record.amountSatang) || record.amountSatang <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(record.date) || !/^\d{2}:\d{2}$/.test(record.time) || typeof record.detail !== 'string') throw new Error('Invalid finance data');
  return { ...record, id: row.id };
}
