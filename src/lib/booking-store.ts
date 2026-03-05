/**
 * Booking Store - Cloudflare KV Persistent Storage
 *
 * Uses Cloudflare KV binding (BOOKING_KV) for persistent booking data.
 * Falls back to in-memory Map for local development only.
 *
 * Cloudflare Pages setup required:
 * 1. Create KV namespace "stayhotel-bookings" in Cloudflare dashboard
 * 2. Bind it as "BOOKING_KV" in Pages → Settings → Functions → KV namespace bindings
 *
 * Bookings expire after 30 days (KV TTL).
 */

import { getRequestContext } from '@cloudflare/next-on-pages';
import { BookingFormData } from '@/types';

export interface StoredBooking {
  bookingId: string;
  token: string;
  status: 'pending' | 'confirmed';
  formData: BookingFormData;
  createdAt: string;
  confirmedAt?: string;
}

/**
 * KV-compatible interface (subset of Cloudflare KVNamespace)
 */
interface KVLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

// In-memory fallback for local development (next dev)
const memoryStore = new Map<string, string>();
const memoryFallback: KVLike = {
  async get(key: string) { return memoryStore.get(key) ?? null; },
  async put(key: string, value: string) { memoryStore.set(key, value); },
};

const KV_TTL = 60 * 60 * 24 * 30; // 30 days

/**
 * Get KV store — Cloudflare KV in production, in-memory in local dev
 */
function getStore(): KVLike {
  try {
    const ctx = getRequestContext();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kv = (ctx.env as any).BOOKING_KV as KVLike | undefined;
    if (kv) {
      return kv;
    }
    console.warn('[BookingStore] BOOKING_KV binding not found in env. Using in-memory fallback.');
  } catch {
    // getRequestContext() throws outside Cloudflare runtime (local dev)
  }
  console.warn('[BookingStore] Not in Cloudflare runtime. Using in-memory fallback (local dev only).');
  return memoryFallback;
}

/**
 * Save a new booking with pending status
 */
export async function saveBooking(formData: BookingFormData, bookingId: string): Promise<StoredBooking> {
  const booking: StoredBooking = {
    bookingId,
    token: crypto.randomUUID(),
    status: 'pending',
    formData,
    createdAt: new Date().toISOString(),
  };

  const kv = getStore();
  await kv.put(`booking:${booking.token}`, JSON.stringify(booking), { expirationTtl: KV_TTL });

  console.log(`[BookingStore] Saved: ${bookingId} | token: ${booking.token}`);
  return booking;
}

/**
 * Find a booking by its confirmation token
 */
export async function getBookingByToken(token: string): Promise<StoredBooking | null> {
  const kv = getStore();
  const data = await kv.get(`booking:${token}`);

  if (!data) {
    console.error(`[BookingStore] LOOKUP FAILED: token="${token}" | No data found in KV store`);
    return null;
  }

  const booking = JSON.parse(data) as StoredBooking;
  console.log(`[BookingStore] Found: ${booking.bookingId} | status: ${booking.status}`);
  return booking;
}

/**
 * Confirm a booking by token, returns the updated booking or null if not found
 */
export async function confirmBooking(token: string): Promise<StoredBooking | null> {
  const kv = getStore();
  const data = await kv.get(`booking:${token}`);

  if (!data) {
    console.error(`[BookingStore] CONFIRM FAILED: token="${token}" | Booking not found in KV`);
    return null;
  }

  const booking = JSON.parse(data) as StoredBooking;
  booking.status = 'confirmed';
  booking.confirmedAt = new Date().toISOString();

  await kv.put(`booking:${token}`, JSON.stringify(booking), { expirationTtl: KV_TTL });

  console.log(`[BookingStore] Confirmed: ${booking.bookingId} | token: ${token}`);
  return booking;
}
