'use client';

import { useState, useRef, useEffect } from 'react';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  theme: 'dark' | 'light';
  placeholder?: string;
}

export default function DropdownSelect({
  value,
  onChange,
  options,
  theme,
  placeholder = '',
}: DropdownSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);
  const displayValue = selectedOption?.label || placeholder;
  const isDark = theme === 'dark';

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

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left border-b py-3 transition-all cursor-pointer flex items-center justify-between ${
          isDark
            ? 'bg-transparent border-neutral-700 text-white font-body text-lg font-normal tracking-wider hover:border-neutral-400 focus:outline-none focus:border-white'
            : 'bg-transparent border-neutral-300 text-neutral-900 font-body text-[0.95rem] font-light tracking-wide hover:border-neutral-500 focus:outline-none focus:border-primary-900'
        }`}
      >
        <span>{displayValue}</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${
            isDark ? 'text-neutral-500' : 'text-neutral-400'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown popup */}
      {isOpen && (
        <div
          className={`absolute top-full left-0 mt-2 z-50 w-full min-w-[160px] animate-fade-in ${
            isDark ? 'dropdown-dark' : 'dropdown-light'
          }`}
        >
          <ul className={`py-1.5 ${
            isDark
              ? 'bg-[#1a1a1f] border border-[#333] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]'
              : 'bg-white border border-[#e5e5e5] shadow-[0_4px_25px_-5px_rgba(0,0,0,0.1)]'
          }`}>
            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full text-left px-6 py-3.5 font-body transition-all duration-200 ${
                    isDark
                      ? `text-[0.85rem] tracking-[0.08em] ${
                          value === option.value
                            ? 'bg-[#c9a227]/15 text-[#c9a227] font-medium'
                            : 'text-[#ccc] font-normal hover:bg-[#ffffff08] hover:text-white'
                        }`
                      : `text-[0.85rem] tracking-[0.04em] ${
                          value === option.value
                            ? 'bg-[#f8f7f4] text-[#1a1a1f] font-medium border-l-2 border-[#c9a227]'
                            : 'text-[#777] font-light hover:bg-[#fafafa] hover:text-[#1a1a1f] border-l-2 border-transparent'
                        }`
                  }`}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
