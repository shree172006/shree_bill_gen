import React, { useRef } from 'react';
import { Calendar } from 'lucide-react';
import { parseAnyDateToISO } from '../utils/formatters';

export const DateInput = ({
  value,
  onChange,
  className = '',
  required = false,
  placeholder = 'DD/MM/YYYY',
}) => {
  const hiddenDateInputRef = useRef(null);

  // Normalize incoming value to ISO YYYY-MM-DD
  const isoDate = parseAnyDateToISO(value);

  // Convert YYYY-MM-DD to DD/MM/YYYY for display
  const toDisplayDate = (val) => {
    if (!val) return '';
    const iso = parseAnyDateToISO(val);
    if (!iso) return '';
    try {
      const parts = iso.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    } catch (_) {}
    return iso;
  };

  // Convert typed DD/MM/YYYY to YYYY-MM-DD
  const handleTextChange = (e) => {
    const text = e.target.value;
    const match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
      const day = match[1].padStart(2, '0');
      const month = match[2].padStart(2, '0');
      const year = match[3];
      onChange(`${year}-${month}-${day}`);
    } else {
      if (!text) onChange('');
    }
  };

  const handleNativeDateSelect = (e) => {
    if (e.target.value) {
      onChange(e.target.value);
    }
  };

  const openCalendar = () => {
    if (hiddenDateInputRef.current) {
      if (typeof hiddenDateInputRef.current.showPicker === 'function') {
        hiddenDateInputRef.current.showPicker();
      } else {
        hiddenDateInputRef.current.focus();
      }
    }
  };

  return (
    <div className="relative flex items-center">
      <input
        type="text"
        required={required}
        placeholder={placeholder}
        value={toDisplayDate(value)}
        onChange={handleTextChange}
        onClick={openCalendar}
        className={`w-full pr-8 cursor-pointer ${className}`}
        readOnly
      />
      <button
        type="button"
        onClick={openCalendar}
        tabIndex={-1}
        className="absolute right-2.5 text-slate-400 hover:text-blue-900 transition-colors"
        title="Choose date (DD/MM/YYYY)"
      >
        <Calendar className="h-4 w-4" />
      </button>

      {/* Hidden native date input for picker UI */}
      <input
        ref={hiddenDateInputRef}
        type="date"
        value={isoDate || ''}
        onChange={handleNativeDateSelect}
        className="sr-only absolute pointer-events-none opacity-0"
        tabIndex={-1}
      />
    </div>
  );
};
