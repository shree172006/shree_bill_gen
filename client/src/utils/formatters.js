export const formatCurrency = (amount) => {
  const num = parseFloat(amount || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatDate = (dateStr) => {
  if (!dateStr || dateStr === '-') return '-';
  try {
    // If it's an Excel serial number (e.g. 45951)
    const num = Number(dateStr);
    if (!isNaN(num) && num > 30000 && num < 65000) {
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const jsDate = new Date(excelEpoch.getTime() + num * 86400000);
      const day = String(jsDate.getUTCDate()).padStart(2, '0');
      const month = String(jsDate.getUTCMonth() + 1).padStart(2, '0');
      const year = jsDate.getUTCFullYear();
      return `${day}/${month}/${year}`;
    }

    // If dateStr is in DD/MM/YYYY format already
    if (typeof dateStr === 'string' && /^\d{2}\/\d{2}\/\d{4}/.test(dateStr)) {
      return dateStr;
    }

    // If dateStr is in YYYY-MM-DD format
    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      const [year, month, day] = dateStr.split('T')[0].split('-');
      if (parseInt(year, 10) < 2099) {
        return `${day}/${month}/${year}`;
      }
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
