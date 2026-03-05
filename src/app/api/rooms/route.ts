/**
 * Rooms API Route
 *
 * GET /api/rooms - Get all rooms
 * GET /api/rooms?id=xxx - Get room by ID
 * POST /api/rooms - Create a booking (pending, sends email to hotel only)
 */

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { BookingFormData } from '@/types';
import { rooms, getRoomById } from '@/config/rooms';
import { saveBooking } from '@/lib/booking-store';
import { sendBookingEmail } from '@/lib/email';

/**
 * GET handler - Fetch rooms from static config
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const roomId = searchParams.get('id');

    if (roomId) {
      const room = getRoomById(roomId);
      if (!room) {
        return NextResponse.json(
          { success: false, error: 'Room not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: room });
    }

    return NextResponse.json({ success: true, data: rooms });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}

/**
 * POST handler - Create booking (pending) and send hotel notification
 */
export async function POST(request: NextRequest) {
  try {
    const body: BookingFormData = await request.json();

    // Validate required fields
    if (
      !body.roomId ||
      !body.checkIn ||
      !body.checkOut ||
      !body.guestName ||
      !body.guestEmail ||
      !body.guestPhone
    ) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate booking ID
    const bookingId = 'BK-' + Date.now().toString(36).toUpperCase();

    // Save booking as pending
    const booking = saveBooking(body, bookingId);

    // Send notification to hotel only (with confirm button)
    sendBookingEmail(body, bookingId, booking.token).catch((err) => {
      console.error('Background email send failed:', err);
    });

    return NextResponse.json({
      success: true,
      bookingId,
      message: 'Booking request sent successfully',
    });
  } catch (error) {
    console.error('Booking Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
