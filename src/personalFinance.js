export function normalizeThaiNumerals(value) {
  return String(value || '').replace(/[๐-๙]/g, (digit) => String('๐๑๒๓๔๕๖๗๘๙'.indexOf(digit)));
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
