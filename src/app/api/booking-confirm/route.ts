/**
 * Booking Confirm API Route
 *
 * GET /api/booking-confirm?token=xxx
 * - Hotel clicks "Confirm" button in email
 * - Validates token, updates booking status to confirmed
 * - Sends confirmation email + PDF to guest
 * - Returns a styled HTML confirmation page
 */

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { confirmBooking, getBookingByToken } from '@/lib/booking-store';
import { sendConfirmationEmail } from '@/lib/email';
import { getRoomById, getRoomName, formatPrice, calculateRoomTotal } from '@/config/rooms';

function calculateNights(checkIn: string, checkOut: string): number {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function htmlPage(title: string, message: string, details?: string) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - STAY HOTEL</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; background: #f5f5f5; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .card { background: white; max-width: 500px; width: 90%; padding: 48px; text-align: center; box-shadow: 0 2px 20px rgba(0,0,0,0.08); }
    .logo { color: #d4af37; font-size: 14px; letter-spacing: 3px; margin-bottom: 32px; }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { font-size: 22px; color: #1a1a2e; margin-bottom: 12px; }
    p { font-size: 14px; color: #666; line-height: 1.6; }
    .details { margin-top: 24px; padding: 20px; background: #f9f9f9; text-align: left; font-size: 13px; color: #444; }
    .details .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .details .row:last-child { border-bottom: none; }
    .details .label { color: #888; }
    .details .value { font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">STAY HOTEL</div>
    <h1>${title}</h1>
    <p>${message}</p>
    ${details || ''}
  </div>
</body>
</html>`;
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return new NextResponse(
      htmlPage('잘못된 요청', '유효하지 않은 링크입니다.'),
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  // Check if booking exists
  const existing = getBookingByToken(token);
  if (!existing) {
    return new NextResponse(
      htmlPage('예약을 찾을 수 없습니다', '유효하지 않거나 만료된 링크입니다.'),
      { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  // Already confirmed
  if (existing.status === 'confirmed') {
    return new NextResponse(
      htmlPage('이미 확정된 예약입니다', `예약번호 ${existing.bookingId}는 이미 확정 처리되었습니다.`),
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  // Confirm the booking
  const booking = confirmBooking(token);
  if (!booking) {
    return new NextResponse(
      htmlPage('오류 발생', '예약 확정 처리 중 오류가 발생했습니다.'),
      { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  // Send confirmation email to guest (in background)
  sendConfirmationEmail(booking.formData, booking.bookingId).catch((err) => {
    console.error('Guest confirmation email failed:', err);
  });

  // Build details HTML
  const data = booking.formData;
  const room = getRoomById(data.roomId);
  const roomName = room ? getRoomName(room, 'ko') : data.roomId;
  const nights = calculateNights(data.checkIn, data.checkOut);
  const totalPrice = room ? calculateRoomTotal(room, data.checkIn, data.checkOut) : 0;
  const priceText = room ? formatPrice(totalPrice, 'ko') : '-';

  const detailsHtml = `
    <div class="details">
      <div class="row"><span class="label">예약번호</span><span class="value">${booking.bookingId}</span></div>
      <div class="row"><span class="label">고객명</span><span class="value">${data.guestName}</span></div>
      <div class="row"><span class="label">객실</span><span class="value">${roomName}</span></div>
      <div class="row"><span class="label">체크인</span><span class="value">${data.checkIn}</span></div>
      <div class="row"><span class="label">체크아웃</span><span class="value">${data.checkOut} (${nights}박)</span></div>
      <div class="row"><span class="label">예상 금액</span><span class="value" style="color: #d4af37;">${priceText}</span></div>
    </div>`;

  return new NextResponse(
    htmlPage(
      '예약이 확정되었습니다',
      `고객(${data.guestEmail})에게 확정 메일이 발송되었습니다.`,
      detailsHtml
    ),
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}
