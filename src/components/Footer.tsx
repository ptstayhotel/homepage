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

export default function Footer({ locale }: FooterProps) {
  const t = useTranslations('footer');
  const brand = getBrandConfig();

  const brandName = brand.name[locale] || brand.name.en;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-900 text-white">
      {/* Main Footer */}
      <div className="container-custom py-10 md:py-16">
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
