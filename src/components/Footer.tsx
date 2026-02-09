'use client';

/**
 * Footer Component - Seoul Dragon City Style
 *
 * Elegant, minimal footer with premium feel
 * WhatsApp / LINE / WeChat contact with QR (desktop) and deep links (mobile)
 */

import Link from 'next/link';
import { useTranslations } from '@/lib/translations';
import { Locale } from '@/types';
import { getBrandConfig } from '@/config/brand';

interface FooterProps {
  locale: Locale;
}

const WHATSAPP_NUMBER = '821012345678';
const LINE_ID = 'stayhotel_pt';
const WECHAT_ID = 'StayHotelPT';

// Placeholder QR images - replace with actual QR code image paths later
const QR_IMAGES = {
  whatsapp: '/qr/whatsapp-qr.png',
  line: '/qr/line-qr.png',
  wechat: '/qr/wechat-qr.png',
};

export default function Footer({ locale }: FooterProps) {
  const t = useTranslations('footer');
  const brand = getBrandConfig();

  const brandName = brand.name[locale] || brand.name.en;
  const currentYear = new Date().getFullYear();

  const messengerApps = [
    {
      key: 'whatsapp' as const,
      label: 'WhatsApp',
      color: '#25D366',
      mobileUrl: `https://wa.me/${WHATSAPP_NUMBER}`,
      qrImage: QR_IMAGES.whatsapp,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
    },
    {
      key: 'line' as const,
      label: 'LINE',
      color: '#06C755',
      mobileUrl: `https://line.me/ti/p/~${LINE_ID}`,
      qrImage: QR_IMAGES.line,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.365 9.864c.018 0 .049 0 .018 0C19.855 4.42 15.86.96 12 .96c-4.674 0-8.5 3.207-8.5 7.147 0 3.533 3.135 6.5 7.37 7.066.287.062.672.19.77.436.09.222.06.57.03.794l-.124.738c-.038.228-.178.893.782.487.96-.406 5.18-3.05 7.07-5.224 1.304-1.43 1.932-2.88 1.967-4.54zM8.56 11.817H6.937a.422.422 0 01-.422-.422V8.188c0-.233.189-.422.422-.422.233 0 .422.189.422.422v2.785h1.2a.422.422 0 010 .844zm1.867-.422a.422.422 0 01-.844 0V8.188a.422.422 0 01.844 0v3.207zm3.625 0a.422.422 0 01-.76.253l-1.788-2.435v2.182a.422.422 0 01-.844 0V8.188a.422.422 0 01.76-.253l1.788 2.435V8.188a.422.422 0 01.844 0v3.207zm3.078-2.364a.422.422 0 010 .844h-1.2v.678h1.2a.422.422 0 010 .844H15.73a.422.422 0 01-.422-.422V8.188c0-.233.189-.422.422-.422h1.2a.422.422 0 010 .844h-1.2v.678h1.2z"/>
        </svg>
      ),
    },
    {
      key: 'wechat' as const,
      label: 'WeChat',
      color: '#07C160',
      mobileUrl: `weixin://dl/chat?${WECHAT_ID}`,
      qrImage: QR_IMAGES.wechat,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm3.35 4.326c-3.67 0-6.651 2.513-6.651 5.614 0 3.1 2.981 5.614 6.651 5.614a7.98 7.98 0 002.222-.319.672.672 0 01.557.076l1.477.864a.253.253 0 00.13.04.227.227 0 00.224-.228c0-.056-.023-.11-.037-.165l-.301-1.148a.458.458 0 01.165-.516C21.077 18.66 22 17.12 22 15.931c0-3.1-2.981-5.614-6.651-5.614h-.401zm-2.478 3.169a.904.904 0 110 1.809.904.904 0 010-1.809zm4.156 0a.904.904 0 110 1.809.904.904 0 010-1.809z"/>
        </svg>
      ),
    },
  ];

  const scanText: Record<Locale, string> = {
    ko: 'QR 코드를 스캔하세요',
    en: 'Scan QR Code',
    ja: 'QRコードをスキャン',
    zh: '扫描二维码',
  };

  return (
    <footer className="bg-primary-900 text-white">
      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="flex flex-col lg:flex-row items-start gap-12">
          {/* Left: Brand + Contact */}
          <div className="flex-shrink-0">
            <h3 className="font-serif text-2xl text-white mb-4 tracking-wider">
              {brandName}
            </h3>
            <p className="text-white/60 text-sm max-w-sm leading-relaxed mb-6">
              {{ ko: '비즈니스와 레저를 위한 최고의 선택. 도심 속 프리미엄 호텔에서 완벽한 휴식을 경험하세요.',
                 en: 'The perfect choice for business and leisure. Experience premium comfort in the heart of the city.',
                 ja: 'ビジネスとレジャーに最適な選択。都心のプレミアムホテルで完璧な休息をご体験ください。',
                 zh: '商务与休闲的最佳选择。在城市中心的高端酒店体验完美休憩。'
              }[locale]}
            </p>
            <div className="space-y-1.5 text-sm text-white/50">
              <p>{brand.contact.phone}</p>
              <p>{brand.contact.email}</p>
              <p>{brand.contact.address[locale] || brand.contact.address.ko}</p>
            </div>
          </div>

          {/* Right: Messenger Contact */}
          <div className="lg:ml-auto">
            <p className="text-xs text-white/40 tracking-widest uppercase mb-6">
              {{ ko: '문의하기', en: 'Contact Us', ja: 'お問い合わせ', zh: '联系我们' }[locale]}
            </p>

            <div className="flex items-start gap-8">
              {messengerApps.map((app) => (
                <div key={app.key} className="flex flex-col items-center">
                  {/* Desktop: QR code + icon */}
                  <div className="hidden md:flex flex-col items-center">
                    <div className="w-[120px] h-[120px] bg-white rounded-md p-2 mb-3">
                      <img
                        src={app.qrImage}
                        alt={`${app.label} QR Code`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          // Fallback: show placeholder if image not found
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent && !parent.querySelector('.qr-placeholder')) {
                            const placeholder = document.createElement('div');
                            placeholder.className = 'qr-placeholder w-full h-full flex items-center justify-center text-neutral-300';
                            placeholder.innerHTML = `<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>`;
                            parent.appendChild(placeholder);
                          }
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-white/60">
                      {app.icon}
                      <span className="text-xs tracking-wider">{app.label}</span>
                    </div>
                    <p className="text-[10px] text-white/30 mt-1.5 tracking-wide">
                      {scanText[locale]}
                    </p>
                  </div>

                  {/* Mobile: deep link button */}
                  <a
                    href={app.mobileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="md:hidden flex flex-col items-center gap-2 group"
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white active:scale-95 transition-all duration-200"
                      style={{ backgroundColor: app.color }}
                    >
                      {app.icon}
                    </div>
                    <span className="text-[11px] text-white/50 tracking-wider">
                      {app.label}
                    </span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40 tracking-wide">
            <p>&copy; {currentYear} {brandName}. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href={`/${locale}/privacy`} className="hover:text-accent-500 transition-colors">
                {t('privacyPolicy')}
              </Link>
              <Link href={`/${locale}/terms`} className="hover:text-accent-500 transition-colors">
                {t('termsOfService')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
