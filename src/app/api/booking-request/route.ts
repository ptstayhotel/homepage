/**
 * Booking Request API Route
 *
 * POST /api/booking-request
 * - Guest submits booking form
 * - Saves booking as 'pending'
 * - Sends notification email to hotel with confirm link
 */

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { BookingFormData } from '@/types';
import { saveBooking } from '@/lib/booking-store';
import { sendBookingEmail } from '@/lib/email';

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
