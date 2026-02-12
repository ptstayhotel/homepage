'use client';

import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { ko as koLocale } from 'date-fns/locale/ko';
import { enUS } from 'date-fns/locale/en-US';
import { ja as jaLocale } from 'date-fns/locale/ja';
import { zhCN } from 'date-fns/locale/zh-CN';
import { Locale } from '@/types';

interface DatePickerInputProps {
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
  locale: Locale;
  theme: 'dark' | 'light';
  placeholder?: string;
}

const localeMap = {
  ko: koLocale,
  en: enUS,
  ja: jaLocale,
  zh: zhCN,
};

const formatPatterns: Record<Locale, string> = {
  ko: 'yyyy. MM. dd',
  en: 'MMM dd, yyyy',
  ja: 'yyyy/MM/dd',
  zh: 'yyyy/MM/dd',
};

function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function DatePickerInput({
  value,
  onChange,
  minDate,
  locale,
  theme,
  placeholder = '',
}: DatePickerInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? parseDate(value) : undefined;
  const minDateObj = minDate ? parseDate(minDate) : undefined;
  const localeObj = localeMap[locale];
  const formatPattern = formatPatterns[locale];

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (day: Date | undefined) => {
    if (day) {
      onChange(toISODate(day));
      setIsOpen(false);
    }
  };

  const displayValue = selectedDate
    ? format(selectedDate, formatPattern, { locale: localeObj })
    : placeholder;

  const isDark = theme === 'dark';

  // Two-line display for BookingBar (dark theme): year on top, month.day below
  const renderDarkDisplay = () => {
    if (!selectedDate) return <span className="text-neutral-600">{placeholder}</span>;
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    return (
      <>
        <span className="block text-[10px] tracking-[0.2em] text-neutral-500">{year}</span>
        <span className="block text-lg font-normal tracking-wider">{month}.{day}</span>
      </>
    );
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left border-b py-3 transition-all cursor-pointer ${
          isDark
            ? 'bg-transparent border-neutral-700 text-white font-body hover:border-neutral-400 focus:outline-none focus:border-white'
            : 'bg-transparent border-neutral-300 text-neutral-900 font-body text-[0.95rem] font-light tracking-wide hover:border-neutral-500 focus:outline-none focus:border-primary-900'
        } ${!value && !isDark ? 'text-neutral-400' : ''}`}
      >
        {isDark ? renderDarkDisplay() : displayValue}
      </button>

      {/* Calendar popup */}
      {isOpen && (
        <div
          className={`absolute top-full left-0 mt-2 z-50 w-full min-w-[320px] animate-fade-in ${
            isDark ? 'date-picker-dark' : 'date-picker-light'
          }`}
        >
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            disabled={minDateObj ? { before: minDateObj } : undefined}
            locale={localeObj}
            defaultMonth={selectedDate || minDateObj || new Date()}
            showOutsideDays
            fixedWeeks
          />
        </div>
      )}
    </div>
  );
}
