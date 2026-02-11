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

    return new NextResponse(Buffer.from(pdfBytes), {
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

    const decoded = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8'));
    const { bookingData, bookingId } = decoded;

    if (!bookingData || !bookingId) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const pdfBytes = await generateBookingPDF(bookingData, bookingId);

    return new NextResponse(Buffer.from(pdfBytes), {
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
