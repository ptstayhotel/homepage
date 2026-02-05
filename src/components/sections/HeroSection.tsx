'use client';

/**
 * Hero Section - Seoul Dragon City Style
 *
 * Features:
 * - Full-screen image/video slider
 * - High contrast text with shadows
 * - Slide navigation arrows
 * - Ken Burns effect
 */

import { useState, useEffect } from 'react';
import { Locale } from '@/types';

interface HeroSectionProps {
  locale: Locale;
}

interface SlideData {
  type: 'video' | 'image';
  url: string;
  title: { ko: string; en: string; ja: string; zh: string };
  subtitle: { ko: string; en: string; ja: string; zh: string };
}

// Slider content
const sliderImages: SlideData[] = [
  {
    type: 'video',
    url: 'https://videos.pexels.com/video-files/3195350/3195350-uhd_2560_1440_25fps.mp4', // City night traffic time lapse
    title: { ko: '도심 속 완벽한 휴식', en: 'Perfect Urban Retreat', ja: '都心の完璧な休息', zh: '城市中的完美休憩' },
    subtitle: { ko: '평택의 랜드마크, 스테이호텔에서 특별한 하루를', en: 'A Landmark in Pyeongtaek, Experience Luxury', ja: '平澤のランドマーク、ステイホテルで特別な一日を', zh: '平泽地标，在Stay Hotel度过特别的一天' },
  },
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1920&auto=format&fit=crop',
    title: { ko: '프리미엄 비즈니스 스테이', en: 'Premium Business Stay', ja: 'プレミアムビジネスステイ', zh: '高端商务住宿' },
    subtitle: { ko: '비즈니스와 휴식의 완벽한 조화', en: 'Where business meets comfort', ja: 'ビジネスと休息の完璧な調和', zh: '商务与舒适的完美融合' },
  },
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1920&auto=format&fit=crop',
    title: { ko: '특별한 순간을 위한 공간', en: 'Space for Special Moments', ja: '特別なひとときのための空間', zh: '为特别时刻打造的空间' },
    subtitle: { ko: '소중한 추억을 만들어 드립니다', en: 'Creating precious memories', ja: '大切な思い出をお作りします', zh: '为您创造珍贵的回忆' },
  },
];

export default function HeroSection({ locale }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 8000); // 8 seconds per slide

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const currentContent = sliderImages[currentSlide];

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Slider Background */}
      <div className="absolute inset-0 bg-black">
        {sliderImages.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
          >
            {slide.type === 'video' ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              >
                <source src={slide.url} type="video/mp4" />
              </video>
            ) : (
              <div
                className={`w-full h-full bg-cover bg-center ${index === currentSlide ? 'animate-kenburns' : ''}`}
                style={{ backgroundImage: `url(${slide.url})` }}
              />
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50" />
          </div>
        ))}
      </div>

      {/* Content - Slightly above center */}
      <div className="relative z-20 h-full flex items-start justify-center px-4 pt-[38vh]">
        <div className="text-center max-w-5xl">
          {/* Main Title */}
          <div className="overflow-hidden">
            <h1
              key={`title-${currentSlide}`}
              className="text-white text-5xl md:text-6xl lg:text-7xl font-serif font-medium leading-tight animate-fadeInUp delay-200"
              style={{
                textShadow: '0 4px 20px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.3)',
                animationDelay: '0.3s',
                animationFillMode: 'both'
              }}
            >
              {currentContent.title[locale]}
            </h1>
          </div>
        </div>
      </div>

      {/* Slide Indicators - Bottom center */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {sliderImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-0.5 transition-all duration-500 ${index === currentSlide
                ? 'w-12 bg-white'
                : 'w-6 bg-white/40 hover:bg-white/60'
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
