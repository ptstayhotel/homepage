/**
 * Admin Bookings API
 *
 * GET /api/admin/bookings
 * - Requires X-Admin-Key header (validated server-side)
 * - Lists all booking records from Cloudflare KV
 * - Falls back to in-memory store in local dev
 * - Returns bookings sorted by creation date (newest first)
 */

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

function getAdminPassword(): string {
  // Cloudflare Pages: env vars via getRequestContext().env
  try {
    const ctx = getRequestContext();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pw = (ctx.env as any).ADMIN_PASSWORD as string | undefined;
    if (pw) return pw;
  } catch {
    // local dev — fall through
  }
  // Fallback: process.env (next dev / .env.local)
  return process.env.ADMIN_PASSWORD || '';
}

interface KVLike {
  get(key: string): Promise<string | null>;
  list(options?: { prefix?: string }): Promise<{ keys: { name: string }[] }>;
}

// Mirror of the in-memory fallback from booking-store.ts
const memoryStore = (() => {
  // Access the same module-level Map used by booking-store
  // We re-import the pattern so list() works for local dev
  const store = new Map<string, string>();
  return {
    _map: store,
    async get(key: string) { return store.get(key) ?? null; },
    async list(options?: { prefix?: string }) {
      const keys: { name: string }[] = [];
      for (const k of Array.from(store.keys())) {
        if (!options?.prefix || k.startsWith(options.prefix)) {
          keys.push({ name: k });
        }
      }
      return { keys };
    },
  } satisfies KVLike & { _map: Map<string, string> };
})();

function getStore(): KVLike {
  try {
    const ctx = getRequestContext();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const env = ctx.env as any;
    const kv = env.BOOKING_KV as KVLike | undefined;
    if (kv) return kv;
  } catch {
    // local dev — fall through
  }
  return memoryStore;
}

export async function GET(request: NextRequest) {
  // --- Auth gate (server-side, env var) ---
  const key = request.headers.get('X-Admin-Key');
  const adminPassword = getAdminPassword();
  if (!adminPassword || key !== adminPassword) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const kv = getStore();
    const listed = await kv.list({ prefix: 'booking:' });

    // Fetch all booking values
    const bookings = await Promise.all(
      listed.keys.map(async ({ name }) => {
        const raw = await kv.get(name);
        if (!raw) return null;
        try { return JSON.parse(raw); } catch { return null; }
      })
    );

    // Filter nulls, sort newest first
    const sorted = bookings
      .filter(Boolean)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, bookings: sorted });
  } catch (error) {
    console.error('[admin/bookings] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
