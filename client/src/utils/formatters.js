export const formatCurrency = (amount) => {
  const num = parseFloat(amount || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

export const parseAnyDateToISO = (val) => {
  if (!val || val === '-') return '';
  const num = Number(val);
  // Excel numeric date serials (e.g. 45995)
  if (!isNaN(num) && num > 30000 && num < 65000) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const jsDate = new Date(excelEpoch.getTime() + num * 86400000);
    const y = jsDate.getUTCFullYear();
    const m = String(jsDate.getUTCMonth() + 1).padStart(2, '0');
    const d = String(jsDate.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (/^\d{5}$/.test(trimmed)) {
      const n = parseInt(trimmed, 10);
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const jsDate = new Date(excelEpoch.getTime() + n * 86400000);
      const y = jsDate.getUTCFullYear();
      const m = String(jsDate.getUTCMonth() + 1).padStart(2, '0');
      const d = String(jsDate.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
      const [d, m, y] = trimmed.split('/');
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.split('T')[0];
    }
  }
  return String(val);
};

export const formatDate = (dateStr) => {
  if (!dateStr || dateStr === '-') return '-';
  try {
    const iso = parseAnyDateToISO(dateStr);
    if (iso && /^\d{4}-\d{2}-\d{2}/.test(iso)) {
      const [year, month, day] = iso.split('-');
      return `${day}/${month}/${year}`;
    }

    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    if (d.getFullYear() > 2099) return '-';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (_) {
    return String(dateStr);
  }
};

export const normalizeStandard = (rawStd = '') => {
  if (!rawStd) return 'Class 10';
  const s = String(rawStd).trim();
  const lower = s.toLowerCase();

  // Roman numerals and school classes
  if (lower === 'x' || lower === '10' || lower === '10th' || lower === 'class 10' || lower.includes('10th') || lower.includes('class 10')) {
    return 'Class 10';
  }
  if (lower === 'ix' || lower === '9' || lower === '9th' || lower === 'class 9' || lower.includes('9th') || lower.includes('class 9')) {
    return 'Class 9';
  }
  if (lower === 'viii' || lower === '8' || lower === '8th' || lower === 'class 8' || lower.includes('8th') || lower.includes('class 8')) {
    return 'Class 8';
  }
  if (lower === 'vii' || lower === '7' || lower === '7th' || lower === 'class 7' || lower.includes('7th') || lower.includes('class 7')) {
    return 'Class 7';
  }
  if (lower === 'vi' || lower === '6' || lower === '6th' || lower === 'class 6' || lower.includes('6th') || lower.includes('class 6')) {
    return 'Class 6';
  }
  // College commerce sections
  if (lower === 'xii' || lower === '12' || lower === '12th' || lower.includes('syjc') || lower.includes('12th')) {
    return 'SYJC (12th Commerce)';
  }
  if (lower === 'xi' || lower === '11' || lower === '11th' || lower.includes('fyjc') || lower.includes('11th')) {
    return 'FYJC (11th Commerce)';
  }
  return s;
};

export const normalizeCourseName = (standard, courseName) => {
  if (courseName && !courseName.toLowerCase().endsWith('package') && !courseName.toLowerCase().includes('package')) {
    return courseName;
  }
  if (standard.includes('SYJC')) {
    return 'SYJC - COMMERCE (BK, Accounts, Maths, Eco, OCM)';
  }
  if (standard.includes('FYJC')) {
    return 'FYJC - COMMERCE (BK, Accounts, Maths, Eco, OCM)';
  }
  return `${standard} - CBSE / ICSE / SSC (Maths & Science Package)`;
};
