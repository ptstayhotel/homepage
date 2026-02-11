'use client';

import { useState, useEffect, useRef } from 'react';
import { Locale } from '@/types';

interface FloatingMessengerProps {
  locale: Locale;
}

const WHATSAPP_NUMBER = '821012345678';
const LINE_ID = 'stayhotel_pt';
const WECHAT_ID = 'StayHotelPT';

export default function FloatingMessenger({ locale }: FloatingMessengerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeQR, setActiveQR] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveQR(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setActiveQR(null);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const messengers = [
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      color: '#25D366',
      url: `https://wa.me/${WHATSAPP_NUMBER}`,
      qrData: `https://wa.me/${WHATSAPP_NUMBER}`,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    },
    {
      key: 'line',
      label: 'LINE',
      color: '#06C755',
      url: `https://line.me/ti/p/~${LINE_ID}`,
      qrData: `https://line.me/ti/p/~${LINE_ID}`,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.365 9.864c.018 0 .049 0 .018 0C19.855 4.42 15.86.96 12 .96c-4.674 0-8.5 3.207-8.5 7.147 0 3.533 3.135 6.5 7.37 7.066.287.062.672.19.77.436.09.222.06.57.03.794l-.124.738c-.038.228-.178.893.782.487.96-.406 5.18-3.05 7.07-5.224 1.304-1.43 1.932-2.88 1.967-4.54zM8.56 11.817H6.937a.422.422 0 01-.422-.422V8.188c0-.233.189-.422.422-.422.233 0 .422.189.422.422v2.785h1.2a.422.422 0 010 .844zm1.867-.422a.422.422 0 01-.844 0V8.188a.422.422 0 01.844 0v3.207zm3.625 0a.422.422 0 01-.76.253l-1.788-2.435v2.182a.422.422 0 01-.844 0V8.188a.422.422 0 01.76-.253l1.788 2.435V8.188a.422.422 0 01.844 0v3.207zm3.078-2.364a.422.422 0 010 .844h-1.2v.678h1.2a.422.422 0 010 .844H15.73a.422.422 0 01-.422-.422V8.188c0-.233.189-.422.422-.422h1.2a.422.422 0 010 .844h-1.2v.678h1.2z" />
        </svg>
      ),
    },
    {
      key: 'wechat',
      label: 'WeChat',
      color: '#07C160',
      url: `weixin://dl/chat?${WECHAT_ID}`,
      qrData: `weixin://dl/chat?${WECHAT_ID}`,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm3.35 4.326c-3.67 0-6.651 2.513-6.651 5.614 0 3.1 2.981 5.614 6.651 5.614a7.98 7.98 0 002.222-.319.672.672 0 01.557.076l1.477.864a.253.253 0 00.13.04.227.227 0 00.224-.228c0-.056-.023-.11-.037-.165l-.301-1.148a.458.458 0 01.165-.516C21.077 18.66 22 17.12 22 15.931c0-3.1-2.981-5.614-6.651-5.614h-.401zm-2.478 3.169a.904.904 0 110 1.809.904.904 0 010-1.809zm4.156 0a.904.904 0 110 1.809.904.904 0 010-1.809z" />
        </svg>
      ),
    },
  ];

  const tooltip: Record<Locale, string> = {
    ko: '문의하기',
    en: 'Contact Us',
    ja: 'お問い合わせ',
    zh: '联系我们',
  };

  const scanText: Record<Locale, string> = {
    ko: 'QR 코드를 스캔하세요',
    en: 'Scan QR Code',
    ja: 'QRコードをスキャン',
    zh: '扫描二维码',
  };

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Messenger Buttons - show when open */}
      <div
        className={`flex flex-col items-end gap-2 transition-all duration-300 ${
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {messengers.map((m, i) => (
          <div key={m.key} className="relative flex items-center gap-3" style={{ transitionDelay: isOpen ? `${i * 60}ms` : '0ms' }}>

            {/* Desktop: QR Popup */}
            {activeQR === m.key && (
              <div className="hidden md:block absolute right-full mr-3 animate-fadeIn">
                <div className="bg-white rounded-xl shadow-2xl p-5 border border-neutral-100 w-[220px]">
                  <p className="text-xs font-medium text-neutral-800 text-center mb-3 tracking-wide">
                    {m.label}
                  </p>
                  <div className="bg-neutral-50 rounded-lg p-3">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(m.qrData)}&margin=8`}
                      alt={`${m.label} QR Code`}
                      className="w-full h-auto"
                    />
                  </div>
                  <p className="text-[10px] text-neutral-400 text-center mt-3 tracking-wide">
                    {scanText[locale]}
                  </p>
                </div>
                {/* Arrow pointing right */}
                <div className="absolute top-1/2 -right-[6px] -translate-y-1/2 w-3 h-3 bg-white border-r border-b border-neutral-100 rotate-[-45deg]" />
              </div>
            )}

            {/* Label */}
            <span className="hidden md:block text-xs font-medium text-white bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full whitespace-nowrap">
              {m.label}
            </span>

            {/* Mobile: direct link / Desktop: QR toggle */}
            <a
              href={m.url}
              target="_blank"
              rel="noopener noreferrer"
              className="md:hidden w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 transition-all duration-200"
              style={{ backgroundColor: m.color }}
              aria-label={m.label}
            >
              {m.icon}
            </a>
            <button
              onClick={() => setActiveQR(activeQR === m.key ? null : m.key)}
              className="hidden md:flex w-12 h-12 rounded-full items-center justify-center text-white shadow-lg hover:scale-110 transition-all duration-200 cursor-pointer"
              style={{ backgroundColor: m.color }}
              aria-label={`${m.label} QR`}
            >
              {m.icon}
            </button>
          </div>
        ))}
      </div>

      {/* Main FAB Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (isOpen) setActiveQR(null);
        }}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
          isOpen
            ? 'bg-neutral-800 rotate-45 scale-95'
            : 'bg-accent-500 hover:bg-accent-600 hover:scale-110 hover:shadow-2xl'
        }`}
        aria-label={tooltip[locale]}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>
    </div>
  );
}
