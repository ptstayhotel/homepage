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
  agreedAt: string; // ISO timestamp — legal proof of cancellation policy agreement
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
    const env = ctx.env as any;
    const kv = env.BOOKING_KV as KVLike | undefined;
    if (kv) {
      console.log('[BookingStore] ✅ Using Cloudflare KV (BOOKING_KV binding)');
      return kv;
    }
    const envKeys = Object.keys(env);
    console.error(`[BookingStore] ❌ BOOKING_KV NOT FOUND in env. Available bindings: [${envKeys.join(', ')}]`);
  } catch (e) {
    console.error(`[BookingStore] ❌ getRequestContext() failed: ${e instanceof Error ? e.message : String(e)}`);
  }
  console.warn('[BookingStore] ⚠️ FALLING BACK TO IN-MEMORY STORE — data will NOT persist between requests');
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
    agreedAt: new Date().toISOString(),
  };

  const kvKey = `booking:${booking.token}`;
  const kv = getStore();

  console.log(`[BookingStore] PUT key="${kvKey}" | bookingId=${bookingId}`);
  await kv.put(kvKey, JSON.stringify(booking), { expirationTtl: KV_TTL });

  // Verify write — immediate read-back
  const verify = await kv.get(kvKey);
  if (verify) {
    console.log(`[BookingStore] ✅ PUT verified: key="${kvKey}" | data length=${verify.length}`);
  } else {
    console.error(`[BookingStore] ❌ PUT verification FAILED: key="${kvKey}" — read-back returned null`);
  }

  return booking;
}

/**
 * Find a booking by its confirmation token
 */
export async function getBookingByToken(token: string): Promise<StoredBooking | null> {
  const kvKey = `booking:${token}`;
  console.log(`[BookingStore] GET key="${kvKey}"`);

  const kv = getStore();
  const data = await kv.get(kvKey);

  console.log(`[BookingStore] KV GET result: ${data === null ? 'NULL' : `string(${data.length} chars)`}`);

  if (!data) {
    console.error(`[BookingStore] ❌ LOOKUP FAILED: key="${kvKey}" | KV returned null`);
    return null;
  }

  const booking = JSON.parse(data) as StoredBooking;
  console.log(`[BookingStore] ✅ Found: ${booking.bookingId} | status: ${booking.status} | token: ${token}`);
  return booking;
}

/**
 * Confirm a booking by token, returns the updated booking or null if not found
 */
export async function confirmBooking(token: string): Promise<StoredBooking | null> {
  const kvKey = `booking:${token}`;
  console.log(`[BookingStore] CONFIRM key="${kvKey}"`);

  const kv = getStore();
  const data = await kv.get(kvKey);

  console.log(`[BookingStore] CONFIRM GET result: ${data === null ? 'NULL' : `string(${data.length} chars)`}`);

  if (!data) {
    console.error(`[BookingStore] ❌ CONFIRM FAILED: key="${kvKey}" | KV returned null`);
    return null;
  }

  const booking = JSON.parse(data) as StoredBooking;
  booking.status = 'confirmed';
  booking.confirmedAt = new Date().toISOString();

  await kv.put(kvKey, JSON.stringify(booking), { expirationTtl: KV_TTL });

  console.log(`[BookingStore] ✅ Confirmed: ${booking.bookingId} | token: ${token}`);
  return booking;
}
