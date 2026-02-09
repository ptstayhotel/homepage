'use client';

/**
 * Special Offers Section - Seoul Dragon City Style
 *
 * Tab-filtered grid of offer cards
 */

import { useState } from 'react';
import Link from 'next/link';
import { Locale } from '@/types';
import { offers, TabType } from '@/config/events';

interface SpecialOffersSectionProps {
  locale: Locale;
}

const tabs: { key: TabType; label: { ko: string; en: string; ja: string; zh: string } }[] = [
  { key: 'all', label: { ko: '전체', en: 'ALL', ja: 'すべて', zh: '全部' } },
  { key: 'room', label: { ko: '객실 패키지', en: 'ROOM PACKAGE', ja: '客室パッケージ', zh: '客房套餐' } },
  { key: 'event', label: { ko: '이벤트', en: 'EVENTS', ja: 'イベント', zh: '活动' } },
];

export default function SpecialOffersSection({ locale }: SpecialOffersSectionProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const filteredOffers = activeTab === 'all'
    ? offers
    : offers.filter(offer => offer.type === activeTab);

  return (
    <section className="py-20 md:py-28 bg-neutral-50">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-normal text-primary-900 tracking-wide">
            {{ ko: '특별 혜택', en: 'Exclusive Benefits', ja: '特別特典', zh: '专属礼遇' }[locale]}
          </h2>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 text-xs tracking-widest uppercase transition-all duration-300 ${activeTab === tab.key
                  ? 'bg-primary-900 text-white'
                  : 'bg-white text-neutral-500 hover:text-primary-900'
                }`}
            >
              {tab.label[locale]}
            </button>
          ))}
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.map((offer) => (
            <Link
              href={`/${locale}/events`}
              key={offer.id}
              className="group bg-white overflow-hidden cursor-pointer"
            >
              {/* Image */}
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={offer.image}
                  alt={offer.title[locale]}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-primary-900/0 group-hover:bg-primary-900/40 transition-all duration-500 flex items-center justify-center">
                  <span className="text-white text-sm tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-500 border border-white px-6 py-2">
                    {{ ko: '자세히 보기', en: 'View Details', ja: '詳細を見る', zh: '查看详情' }[locale]}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Subtitle/Badge */}
                <span className="text-xs text-accent-500 tracking-widest uppercase">
                  {offer.subtitle[locale]}
                </span>

                {/* Title */}
                <h3 className="font-serif text-xl text-primary-900 mt-2 mb-2 tracking-wide group-hover:text-accent-500 transition-colors">
                  {offer.title[locale]}
                </h3>

                {/* Description */}
                <p className="text-sm text-neutral-500 mb-4">
                  {offer.desc[locale]}
                </p>

                {/* Period */}
                <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                  <span className="text-xs text-neutral-400">
                    {offer.period[locale]}
                  </span>
                  <svg
                    className="w-5 h-5 text-neutral-300 group-hover:text-accent-500 group-hover:translate-x-1 transition-all duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href={`/${locale}/events`}
            className="inline-flex items-center gap-3 px-8 py-4 border border-primary-900 text-primary-900 text-sm tracking-widest uppercase transition-all duration-300 hover:bg-primary-900 hover:text-white"
          >
            {{ ko: '전체 보기', en: 'View All', ja: 'すべて見る', zh: '查看全部' }[locale]}
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
