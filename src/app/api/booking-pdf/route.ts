export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { generateBookingPDF } from '@/lib/booking-pdf';

// POST - from success page download button
export async function POST(request: NextRequest) {
  try {
    const { bookingData, bookingId } = await request.json();

    if (!bookingData || !bookingId) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const pdfBytes = await generateBookingPDF(bookingData, bookingId);

    return new NextResponse(new Uint8Array(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="STAY_HOTEL_${bookingId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 },
    );
  }
}

// GET - from email download link (?d=base64encodedData)
export async function GET(request: NextRequest) {
  try {
    const encoded = request.nextUrl.searchParams.get('d');

    if (!encoded) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // Edge-compatible base64url decoding (Buffer 대체)
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const jsonStr = atob(base64);
    const decoded = JSON.parse(jsonStr);
    const { bookingData, bookingId } = decoded;

    if (!bookingData || !bookingId) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const pdfBytes = await generateBookingPDF(bookingData, bookingId);

    return new NextResponse(new Uint8Array(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="STAY_HOTEL_${bookingId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 },
    );
  }
}
