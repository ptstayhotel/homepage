/**
 * Booking Request API Route
 *
 * POST /api/booking-request
 * - Guest submits booking form
 * - Saves booking as 'pending'
 * - Sends notification email to hotel with confirm link
 */

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

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
      !body.guestPhone ||
      !body.transportation
    ) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate cancellation policy agreement (legal requirement)
    if (body.agreedToPolicy !== true) {
      return NextResponse.json(
        { success: false, error: 'You must agree to the cancellation policy' },
        { status: 400 }
      );
    }

    // Generate booking ID
    const bookingId = 'BK-' + Date.now().toString(36).toUpperCase();

    // Save booking as pending (KV persistent storage)
    const booking = await saveBooking(body, bookingId);

    // Send notification to hotel — MUST await before returning response.
    // Cloudflare Edge kills the V8 isolate the moment the response is sent.
    const emailResult = await sendBookingEmail(body, bookingId, booking.token);

    if (!emailResult.success) {
      console.error(`[booking-request] Email failed for ${bookingId}: ${emailResult.error}`);
      // Booking is saved but email failed — return 500 so client knows
      return NextResponse.json(
        {
          success: false,
          bookingId,
          error: `Booking saved but email notification failed: ${emailResult.error}`,
        },
        { status: 500 }
      );
    }

    console.log(`[booking-request] Success: ${bookingId}, email sent to hotel`);
    return NextResponse.json({
      success: true,
      bookingId,
      message: 'Booking request sent successfully',
    });
  } catch (error) {
    console.error('[booking-request] Unhandled error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
