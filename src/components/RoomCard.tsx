'use client';

/**
 * Room Card Component - Seoul Dragon City Style
 *
 * Elegant, minimal design with:
 * - Image zoom on hover
 * - Sophisticated overlay
 * - Premium luxury feel
 */

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from '@/lib/translations';
import { Room, Locale } from '@/types';
import { getRoomName, getRoomDescription, formatPrice } from '@/config/rooms';

const BLUR_PLACEHOLDER = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAADAAQDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAABv/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AhgA//9k=';

interface RoomCardProps {
  room: Room;
  locale: Locale;
}

export default function RoomCard({ room, locale }: RoomCardProps) {
  const t = useTranslations('rooms');
  const tCommon = useTranslations('common');

  const roomName = getRoomName(room, locale);
  const description = getRoomDescription(room, locale);
  const primaryImage = room.images.find(img => img.isPrimary) || room.images[0];

  return (
    <Link href={`/${locale}/rooms/${room.slug}`} className="group block">
      <div className="bg-white overflow-hidden">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={75}
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Price Tag - Shows on hover */}
          <div className="absolute bottom-6 left-6 right-6 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-2xl text-white">{formatPrice(room.pricePerNight, locale)}</span>
              <span className="text-white/70 text-sm">{tCommon('perNight')}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 border border-neutral-100 border-t-0">
          {/* Room Name */}
          <h3 className="font-serif text-xl text-primary-900 mb-3 tracking-wide group-hover:text-accent-500 transition-colors duration-300">
            {roomName}
          </h3>

          {/* Room Info */}
          <div className="flex items-center gap-6 text-sm text-neutral-400 mb-4">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {room.maxGuests}{{ ko: '인', en: ' Guests', ja: '名', zh: '位' }[locale]}
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              {room.size}m²
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-neutral-500 line-clamp-2 mb-6 leading-relaxed">
            {description}
          </p>

          {/* View Details */}
          <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
            <span className="text-xs tracking-widest uppercase text-primary-900 group-hover:text-accent-500 transition-colors">
              {t('viewDetails')}
            </span>
            <svg
              className="w-5 h-5 text-primary-900 group-hover:text-accent-500 group-hover:translate-x-1 transition-all duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
