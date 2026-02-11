/**
 * Booking Store - JSON file-based storage
 *
 * Stores bookings in data/bookings.json with pending/confirmed status.
 * Used for the hotel-approval booking flow.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { BookingFormData } from '@/types';

export interface StoredBooking {
  bookingId: string;
  token: string;
  status: 'pending' | 'confirmed';
  formData: BookingFormData;
  createdAt: string;
  confirmedAt?: string;
}

const BOOKINGS_PATH = path.join(process.cwd(), 'data', 'bookings.json');

function readBookings(): StoredBooking[] {
  try {
    const data = fs.readFileSync(BOOKINGS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeBookings(bookings: StoredBooking[]): void {
  const dir = path.dirname(BOOKINGS_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(BOOKINGS_PATH, JSON.stringify(bookings, null, 2), 'utf-8');
}

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

  const bookings = readBookings();
  bookings.push(booking);
  writeBookings(bookings);

  console.log(`📝 Booking saved: ${bookingId} (pending)`);
  return booking;
}

/**
 * Find a booking by its confirmation token
 */
export function getBookingByToken(token: string): StoredBooking | null {
  const bookings = readBookings();
  return bookings.find((b) => b.token === token) || null;
}

/**
 * Confirm a booking by token, returns the updated booking or null if not found
 */
export function confirmBooking(token: string): StoredBooking | null {
  const bookings = readBookings();
  const index = bookings.findIndex((b) => b.token === token);

  if (index === -1) return null;

  bookings[index].status = 'confirmed';
  bookings[index].confirmedAt = new Date().toISOString();
  writeBookings(bookings);

  console.log(`✅ Booking confirmed: ${bookings[index].bookingId}`);
  return bookings[index];
}
