/**
 * Booking Cancel API Route
 *
 * POST /api/booking-cancel
 * Body: { token, reason?, cancelledBy? }
 * Header: X-Admin-Key (관리자 인증)
 *
 * 상태 전이 규칙:
 * - pending → cancelled ✅
 * - confirmed → cancelled ✅
 * - cancelled → cancelled ✅ (idempotent, 에러 아님)
 * - cancelled → confirmed ❌ (booking-confirm에서 차단)
 */

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { cancelBooking, getBookingByToken } from '@/lib/booking-store';
import { sendCancellationEmail } from '@/lib/email';

function getAdminPassword(): string {
  try {
    const ctx = getRequestContext();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pw = (ctx.env as any).ADMIN_PASSWORD as string | undefined;
    if (pw) return pw;
  } catch {
    // local dev — fall through
  }
  return process.env.ADMIN_PASSWORD || '';
}

export async function POST(request: NextRequest) {
  // --- 관리자 인증 ---
  const key = request.headers.get('X-Admin-Key');
  const adminPassword = getAdminPassword();
  if (!adminPassword || key !== adminPassword) {
    return NextResponse.json(
      { success: false, error: '인증 실패' },
      { status: 401 }
    );
  }

  let body: { token?: string; reason?: string; cancelledBy?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: '잘못된 요청 형식' },
      { status: 400 }
    );
  }

  const { token, reason, cancelledBy } = body;

  if (!token) {
    return NextResponse.json(
      { success: false, error: '토큰이 필요합니다' },
      { status: 400 }
    );
  }

  // --- 예약 조회 ---
  const existing = await getBookingByToken(token);
  if (!existing) {
    return NextResponse.json(
      { success: false, error: '예약을 찾을 수 없습니다' },
      { status: 404 }
    );
  }

  // --- 취소 처리 ---
  const validCancelledBy = (cancelledBy === 'hotel' || cancelledBy === 'customer' || cancelledBy === 'admin')
    ? cancelledBy
    : 'admin';

  const { booking, alreadyCancelled } = await cancelBooking(token, reason, validCancelledBy);

  if (!booking) {
    return NextResponse.json(
      { success: false, error: '취소 처리 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }

  // 이미 취소된 경우 idempotent 응답
  if (alreadyCancelled) {
    return NextResponse.json({
      success: true,
      message: '이미 취소된 예약입니다',
      bookingId: booking.bookingId,
      alreadyCancelled: true,
    });
  }

  // --- 고객에게 취소 이메일 발송 ---
  const emailResult = await sendCancellationEmail(
    booking.formData,
    booking.bookingId,
    booking.cancelledAt || new Date().toISOString(),
    booking.finalAmount,
  );

  if (!emailResult.success) {
    console.error(`[booking-cancel] 취소 이메일 발송 실패: ${booking.bookingId}: ${emailResult.error}`);
  } else {
    console.log(`[booking-cancel] 취소 이메일 발송 완료: ${booking.bookingId}`);
  }

  return NextResponse.json({
    success: true,
    message: '예약이 취소되었습니다',
    bookingId: booking.bookingId,
    alreadyCancelled: false,
  });
}
