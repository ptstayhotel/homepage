/**
 * Booking Store - Edge Runtime Compatible (In-Memory)
 *
 * In-memory store for booking data.
 * TODO: Production에서는 Cloudflare KV 또는 D1로 교체 필요.
 *
 * NOTE: In-memory 데이터는 Worker 재시작 시 초기화됩니다.
 * 기존 파일 기반 저장소도 재배포 시 데이터가 초기화되므로 동일 수준입니다.
 */

import { BookingFormData } from '@/types';

export interface StoredBooking {
  bookingId: string;
  token: string;
  status: 'pending' | 'confirmed';
  formData: BookingFormData;
  createdAt: string;
  confirmedAt?: string;
}

// In-memory store (Edge runtime에서 cold start 간 유지되지 않음)
const bookingsMap = new Map<string, StoredBooking>();

/**
 * Save a new booking with pending status
 */
export function saveBooking(formData: BookingFormData, bookingId: string): StoredBooking {
  const booking: StoredBooking = {
    bookingId,
    token: crypto.randomUUID(),
    status: 'pending',
    formData,
    createdAt: new Date().toISOString(),
  };

  bookingsMap.set(booking.token, booking);

  console.log(`[BookingStore] Saved: ${bookingId} | token: ${booking.token} | map size: ${bookingsMap.size}`);
  return booking;
}

/**
 * Find a booking by its confirmation token
 */
export function getBookingByToken(token: string): StoredBooking | null {
  const booking = bookingsMap.get(token) || null;
  if (!booking) {
    const storedTokens: string[] = [];
    bookingsMap.forEach((_, key) => storedTokens.push(key));
    console.error(`[BookingStore] LOOKUP FAILED: token="${token}" | map size: ${bookingsMap.size} | stored tokens: [${storedTokens.join(', ')}]`);
  } else {
    console.log(`[BookingStore] Found: ${booking.bookingId} | status: ${booking.status}`);
  }
  return booking;
}

/**
 * Confirm a booking by token, returns the updated booking or null if not found
 */
export function confirmBooking(token: string): StoredBooking | null {
  const booking = bookingsMap.get(token);
  if (!booking) return null;

  booking.status = 'confirmed';
  booking.confirmedAt = new Date().toISOString();
  bookingsMap.set(token, booking);

  console.log(`[BookingStore] Confirmed: ${booking.bookingId} | token: ${token}`);
  return booking;
}
