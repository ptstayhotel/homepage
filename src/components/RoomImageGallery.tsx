'use client';

import { useState } from 'react';
import Image from 'next/image';
import { RoomImage } from '@/types';

const BLUR_PLACEHOLDER = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAADAAQDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAABv/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AhgA//9k=';

interface RoomImageGalleryProps {
  images: RoomImage[];
  roomName: string;
}

export default function RoomImageGallery({ images, roomName }: RoomImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images.length) return null;

  return (
    <div className="relative">
      {/* Main Image */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-primary-800">
        <Image
          src={images[activeIndex].url}
          alt={images[activeIndex].alt || `${roomName} - ${activeIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={activeIndex === 0}
          loading={activeIndex === 0 ? 'eager' : 'lazy'}
          quality={75}
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER}
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`relative flex-1 aspect-[4/3] rounded-lg overflow-hidden transition-all duration-300 ${
                index === activeIndex
                  ? 'ring-2 ring-accent-500 opacity-100'
                  : 'opacity-50 hover:opacity-80'
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt || `${roomName} - ${index + 1}`}
                fill
                className="object-cover"
                sizes="10vw"
                quality={40}
                loading="lazy"
                placeholder="blur"
                blurDataURL={BLUR_PLACEHOLDER}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
