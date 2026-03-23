/**
 * Email Utility for Booking Notifications - Edge Runtime Compatible
 *
 * Uses Resend API (fetch-based). No PDF dependencies.
 *
 * Two-phase booking flow:
 * 1. sendBookingEmail() - Hotel gets notification with "Confirm" button
 * 2. sendConfirmationEmail() - Guest gets professional HTML receipt after hotel confirms
 *
 * HTML Email Design:
 * - Table-based layout for cross-client compatibility (Gmail, Outlook, Apple Mail)
 * - Strict inline CSS only (Gmail strips <style> tags)
 * - Max width 600px (universal email client standard)
 * - No flexbox, grid, or media queries (Outlook uses Word rendering engine)
 * - System font stack for Korean/English support
 *
 * Required environment variables:
 * - RESEND_API_KEY: Resend API key (re_xxxx)
 * - EMAIL_FROM: Verified sender email
 * - SITE_URL: Site base URL (for confirm button link)
 */

import { BookingFormData } from '@/types';
import { getRoomById, getRoomName, formatPrice, calculateRoomTotal } from '@/config/rooms';
import { getBrandConfig } from '@/config/brand';

const RESERVATION_TYPE_LABELS: Record<string, Record<string, string>> = {
  general: { ko: '일반', en: 'General' },
  corporate: { ko: '기업체', en: 'Corporate' },
  military: { ko: '군인', en: 'Military' },
};

const TRANSPORTATION_LABELS: Record<string, Record<string, string>> = {
  walk: { ko: '도보', en: 'Walk' },
  car: { ko: '차량', en: 'Car' },
};

// Shared font stack for all email templates
const FONT_STACK = "'Apple SD Gothic Neo', 'Malgun Gothic', 'Segoe UI', Arial, sans-serif";

/**
 * fetch 기반 이메일 전송 (Resend API)
 */
async function sendEmail(options: {
  to: string;
  from: string;
  subject: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[Email] CRITICAL: RESEND_API_KEY is not configured.');
    console.error(`[Email] To: ${options.to} | Subject: ${options.subject}`);
    throw new Error('RESEND_API_KEY environment variable is not set');
  }

  console.log(`[Email] Sending to: ${options.to} | Subject: ${options.subject}`);

  const payload = {
    from: options.from,
    to: [options.to],
    subject: options.subject,
    html: options.html,
  };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const responseBody = await response.text();

  if (!response.ok) {
    console.error(`[Email] Resend API error: ${response.status} ${response.statusText}`);
    console.error(`[Email] Response body: ${responseBody}`);
    console.error(`[Email] Payload from: ${payload.from} | to: ${payload.to}`);
    throw new Error(`Resend API ${response.status}: ${responseBody}`);
  }

  console.log(`[Email] Success: ${response.status} | Response: ${responseBody}`);
}

function calculateNights(checkIn: string, checkOut: string): number {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

const PROMO_LABELS: Record<string, { ko: string; en: string }> = {
  longstay_10: { ko: '연박 10% 할인', en: '10% Long-Stay Discount' },
  longstay_15: { ko: '연박 15% 할인', en: '15% Long-Stay Discount' },
  military_fixed: { ko: 'US Military Special ($64 고정)', en: 'US Military Special ($64 Fixed)' },
};

function getBookingDetails(data: BookingFormData, finalAmount?: number) {
  const room = getRoomById(data.roomId);
  const roomName = room ? getRoomName(room, 'ko') : data.roomId;
  const roomNameEn = room ? getRoomName(room, 'en') : data.roomId;
  const nights = calculateNights(data.checkIn, data.checkOut);
  const basePrice = room ? calculateRoomTotal(room, data.checkIn, data.checkOut) : 0;
  // Use finalAmount from frontend (includes discounts) when available; fall back to base calculation
  const totalPrice = finalAmount != null ? finalAmount : basePrice;
  const priceText = totalPrice > 0 ? formatPrice(totalPrice, 'ko') : '-';
  const typeLabel = RESERVATION_TYPE_LABELS[data.reservationType]?.ko || data.reservationType;
  const typeLabelEn = RESERVATION_TYPE_LABELS[data.reservationType]?.en || data.reservationType;
  const transportLabel = TRANSPORTATION_LABELS[data.transportation]?.ko || data.transportation || '도보';
  const transportLabelEn = TRANSPORTATION_LABELS[data.transportation]?.en || data.transportation || 'Walk';
  const appliedPromo = data.appliedPromo || null;
  const promoLabelKo = appliedPromo ? (PROMO_LABELS[appliedPromo]?.ko || appliedPromo) : null;
  const promoLabelEn = appliedPromo ? (PROMO_LABELS[appliedPromo]?.en || appliedPromo) : null;
  return { room, roomName, roomNameEn, nights, basePrice, totalPrice, priceText, typeLabel, typeLabelEn, transportLabel, transportLabelEn, appliedPromo, promoLabelKo, promoLabelEn };
}

/**
 * Phase 1: Send booking notification to HOTEL ONLY (with confirm button)
 */
export async function sendBookingEmail(
  data: BookingFormData,
  bookingId: string,
  confirmToken: string,
  finalAmount?: number,
): Promise<{ success: boolean; error?: string }> {
  const brand = getBrandConfig();
  const hotelEmail = brand.contact.email;
  const brandName = brand.name.ko;
  const { roomName, roomNameEn, nights, priceText, typeLabel, transportLabel, promoLabelKo } = getBookingDetails(data, finalAmount);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000';
  const confirmUrl = `${siteUrl}/api/booking-confirm?token=${confirmToken}`;
  console.log(`[Email] Confirm URL generated: ${confirmUrl}`);
  const fromEmail = process.env.EMAIL_FROM || 'noreply@pyeongtaekstay.com';

  const hotelHtml = `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5;">
  <tr><td align="center" style="padding: 24px 16px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; width: 100%; background-color: #ffffff;">
      <!-- Header -->
      <tr><td style="background-color: #1a1a2e; padding: 24px 32px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="color: #d4af37; font-family: ${FONT_STACK}; font-size: 18px; font-weight: 700; letter-spacing: 2px;">${brandName}</td>
          </tr>
        </table>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding: 32px; border: 1px solid #e5e5e5; border-top: none;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr><td style="font-family: ${FONT_STACK}; font-size: 20px; font-weight: 700; color: #1a1a2e; padding-bottom: 24px;">새 예약 접수</td></tr>
          <tr><td style="font-family: ${FONT_STACK}; font-size: 13px; color: #888888; padding-bottom: 16px;">예약번호: <strong style="color: #1a1a2e;">${bookingId}</strong></td></tr>
        </table>
        <!-- Booking Info Table -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="font-family: ${FONT_STACK}; font-size: 14px;">
          <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 12px 0; color: #888888; width: 120px; border-bottom: 1px solid #f0f0f0;">객실</td>
            <td style="padding: 12px 0; font-weight: 600; color: #1a1a2e; border-bottom: 1px solid #f0f0f0;">${roomName} (${roomNameEn})</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #888888; border-bottom: 1px solid #f0f0f0;">체크인</td>
            <td style="padding: 12px 0; font-weight: 600; color: #1a1a2e; border-bottom: 1px solid #f0f0f0;">${data.checkIn}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #888888; border-bottom: 1px solid #f0f0f0;">체크아웃</td>
            <td style="padding: 12px 0; font-weight: 600; color: #1a1a2e; border-bottom: 1px solid #f0f0f0;">${data.checkOut} (${nights}박)</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #888888; border-bottom: 1px solid #f0f0f0;">인원</td>
            <td style="padding: 12px 0; font-weight: 600; color: #1a1a2e; border-bottom: 1px solid #f0f0f0;">${data.guestCount}명</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #888888; border-bottom: 1px solid #f0f0f0;">예약 유형</td>
            <td style="padding: 12px 0; font-weight: 600; color: #1a1a2e; border-bottom: 1px solid #f0f0f0;">${typeLabel}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #888888; border-bottom: 1px solid #f0f0f0;">방문 방법</td>
            <td style="padding: 12px 0; font-weight: 600; color: #1a1a2e; border-bottom: 1px solid #f0f0f0;">${transportLabel}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #888888; border-bottom: 1px solid #f0f0f0;">최종 금액</td>
            <td style="padding: 12px 0; font-weight: 600; color: #d4af37; border-bottom: 1px solid #f0f0f0;">${priceText}</td>
          </tr>
          ${promoLabelKo ? `<tr>
            <td style="padding: 12px 0; color: #888888; border-bottom: 1px solid #f0f0f0;">적용 할인</td>
            <td style="padding: 12px 0; font-weight: 600; color: #2e7d32; border-bottom: 1px solid #f0f0f0;">${promoLabelKo}</td>
          </tr>` : ''}
        </table>
        <!-- Guest Info -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 24px;">
          <tr><td style="font-family: ${FONT_STACK}; font-size: 16px; font-weight: 700; color: #1a1a2e; padding-bottom: 12px;">고객 정보</td></tr>
        </table>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="font-family: ${FONT_STACK}; font-size: 14px;">
          <tr>
            <td style="padding: 12px 0; color: #888888; width: 120px; border-bottom: 1px solid #f0f0f0;">이름</td>
            <td style="padding: 12px 0; font-weight: 600; color: #1a1a2e; border-bottom: 1px solid #f0f0f0;">${data.guestName}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #888888; border-bottom: 1px solid #f0f0f0;">이메일</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;"><a href="mailto:${data.guestEmail}" style="color: #1a1a2e; text-decoration: none;">${data.guestEmail}</a></td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #888888; border-bottom: 1px solid #f0f0f0;">전화</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;"><a href="tel:${data.guestPhone}" style="color: #1a1a2e; text-decoration: none;">${data.guestPhone}</a></td>
          </tr>
          ${data.specialRequests ? `<tr>
            <td style="padding: 12px 0; color: #888888; vertical-align: top;">요청사항</td>
            <td style="padding: 12px 0; color: #1a1a2e;">${data.specialRequests}</td>
          </tr>` : ''}
        </table>
        <!-- Confirm Button -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 32px;">
          <tr><td align="center">
            <!--[if mso]>
            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${confirmUrl}" style="height:52px;v-text-anchor:middle;width:280px;" fillcolor="#d4af37" stroke="f">
              <center style="color:#1a1a2e;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">예약 확정하기</center>
            </v:roundrect>
            <![endif]-->
            <!--[if !mso]><!-->
            <a href="${confirmUrl}" style="display: inline-block; padding: 16px 48px; background-color: #d4af37; color: #1a1a2e; font-family: ${FONT_STACK}; font-size: 16px; font-weight: 700; text-decoration: none; letter-spacing: 1px;">예약 확정하기</a>
            <!--<![endif]-->
          </td></tr>
          <tr><td align="center" style="padding-top: 12px; font-family: ${FONT_STACK}; font-size: 12px; color: #aaaaaa;">위 버튼을 클릭하면 예약이 확정되고 고객에게 확인 메일이 발송됩니다.</td></tr>
        </table>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  try {
    await sendEmail({
      from: `${brandName} 예약시스템 <${fromEmail}>`,
      to: hotelEmail,
      subject: `[STAY HOTEL] 새 예약 접수 - ${data.guestName} (${data.checkIn} ~ ${data.checkOut})`,
      html: hotelHtml,
    });

    console.log(`Hotel notification sent: ${bookingId} -> ${hotelEmail}`);
    return { success: true };
  } catch (error) {
    console.error('Hotel email send failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Phase 2: Send professional HTML receipt to GUEST (after hotel confirms)
 *
 * Cross-client compatible HTML email receipt:
 * - Table-based layout (Outlook Word engine compatible)
 * - Inline CSS only (Gmail compatible)
 * - 600px max-width (universal standard)
 * - Bilingual: Korean + English
 * - Brand colors: Navy #1a1a2e, Gold #d4af37
 */
export async function sendConfirmationEmail(
  data: BookingFormData,
  bookingId: string,
  finalAmount?: number,
): Promise<{ success: boolean; error?: string }> {
  const brand = getBrandConfig();
  const hotelEmail = brand.contact.email;
  const hotelPhone = brand.contact.phone;
  const brandName = brand.name.ko;
  const { roomName, roomNameEn, nights, priceText, typeLabel, typeLabelEn, transportLabel, transportLabelEn, promoLabelKo, promoLabelEn } = getBookingDetails(data, finalAmount);
  const fromEmail = process.env.EMAIL_FROM || 'noreply@pyeongtaekstay.com';
  const confirmedDate = new Date().toISOString().split('T')[0];

  const guestHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation - ${bookingId}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
<!-- Wrapper Table -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5;">
  <tr><td align="center" style="padding: 32px 16px;">

    <!-- Main Container (600px) -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; width: 100%; border-collapse: collapse;">

      <!-- ============================================ -->
      <!-- HEADER: Navy background with brand name     -->
      <!-- ============================================ -->
      <tr><td style="background-color: #1a1a2e; padding: 28px 40px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="font-family: Georgia, 'Times New Roman', serif; font-size: 20px; font-weight: 700; color: #d4af37; letter-spacing: 3px;">STAY HOTEL</td>
            <td align="right" style="font-family: ${FONT_STACK}; font-size: 10px; color: #8888a0; letter-spacing: 2px; text-transform: uppercase;">Booking Confirmation</td>
          </tr>
        </table>
      </td></tr>
      <!-- Gold accent line -->
      <tr><td style="background-color: #d4af37; height: 3px; font-size: 0; line-height: 0;">&nbsp;</td></tr>

      <!-- ============================================ -->
      <!-- CONFIRMATION MESSAGE                         -->
      <!-- ============================================ -->
      <tr><td style="background-color: #ffffff; padding: 32px 40px 24px 40px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr><td align="center" style="font-family: ${FONT_STACK}; font-size: 22px; font-weight: 700; color: #1a1a2e; padding-bottom: 8px;">예약이 확정되었습니다</td></tr>
          <tr><td align="center" style="font-family: ${FONT_STACK}; font-size: 13px; color: #888888; padding-bottom: 4px;">Your booking has been confirmed.</td></tr>
        </table>
      </td></tr>

      <!-- ============================================ -->
      <!-- BOOKING NUMBER BOX                           -->
      <!-- ============================================ -->
      <tr><td style="background-color: #ffffff; padding: 0 40px 28px 40px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8f8f8; border-left: 4px solid #d4af37;">
          <tr><td style="padding: 20px 24px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td>
                  <span style="font-family: ${FONT_STACK}; font-size: 11px; color: #888888; letter-spacing: 1px;">예약번호 / Booking No.</span><br>
                  <span style="font-family: 'Courier New', Courier, monospace; font-size: 22px; font-weight: 700; color: #1a1a2e; letter-spacing: 1px;">${bookingId}</span>
                </td>
                <td align="right" style="vertical-align: bottom;">
                  <span style="font-family: ${FONT_STACK}; font-size: 11px; color: #aaaaaa;">확정일: ${confirmedDate}</span>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </td></tr>

      <!-- ============================================ -->
      <!-- STAY DETAILS SECTION                         -->
      <!-- ============================================ -->
      <tr><td style="background-color: #ffffff; padding: 0 40px;">
        <!-- Section Title -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr><td style="font-family: ${FONT_STACK}; font-size: 13px; font-weight: 700; color: #1a1a2e; letter-spacing: 2px; text-transform: uppercase; padding-bottom: 8px;">숙박 정보 / Stay Details</td></tr>
          <tr><td style="border-bottom: 1px solid #d4af37; font-size: 0; line-height: 0; height: 1px;">&nbsp;</td></tr>
        </table>
        <!-- Details Table -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="font-family: ${FONT_STACK}; font-size: 14px;">
          <tr>
            <td style="padding: 14px 0 14px 0; color: #888888; width: 45%; border-bottom: 1px solid #f0f0f0;">객실 / Room</td>
            <td style="padding: 14px 0 14px 0; color: #1a1a2e; font-weight: 600; text-align: right; border-bottom: 1px solid #f0f0f0;">${roomName}<br><span style="font-size: 12px; color: #888888; font-weight: 400;">${roomNameEn}</span></td>
          </tr>
          <tr>
            <td style="padding: 14px 0; color: #888888; border-bottom: 1px solid #f0f0f0;">체크인 / Check-in</td>
            <td style="padding: 14px 0; color: #1a1a2e; font-weight: 600; text-align: right; border-bottom: 1px solid #f0f0f0;">${data.checkIn} <span style="font-size: 12px; color: #888888; font-weight: 400;">(15:00)</span></td>
          </tr>
          <tr>
            <td style="padding: 14px 0; color: #888888; border-bottom: 1px solid #f0f0f0;">체크아웃 / Check-out</td>
            <td style="padding: 14px 0; color: #1a1a2e; font-weight: 600; text-align: right; border-bottom: 1px solid #f0f0f0;">${data.checkOut} <span style="font-size: 12px; color: #888888; font-weight: 400;">(12:00)</span></td>
          </tr>
          <tr>
            <td style="padding: 14px 0; color: #888888; border-bottom: 1px solid #f0f0f0;">숙박 / Duration</td>
            <td style="padding: 14px 0; color: #1a1a2e; font-weight: 600; text-align: right; border-bottom: 1px solid #f0f0f0;">${nights}박 / ${nights} night${nights > 1 ? 's' : ''}</td>
          </tr>
          <tr>
            <td style="padding: 14px 0; color: #888888; border-bottom: 1px solid #f0f0f0;">인원 / Guests</td>
            <td style="padding: 14px 0; color: #1a1a2e; font-weight: 600; text-align: right; border-bottom: 1px solid #f0f0f0;">${data.guestCount}명</td>
          </tr>
          <tr>
            <td style="padding: 14px 0; color: #888888; border-bottom: 1px solid #f0f0f0;">예약유형 / Type</td>
            <td style="padding: 14px 0; color: #1a1a2e; font-weight: 600; text-align: right; border-bottom: 1px solid #f0f0f0;">${typeLabel} / ${typeLabelEn}</td>
          </tr>
          <tr>
            <td style="padding: 14px 0; color: #888888; border-bottom: 1px solid #f0f0f0;">방문 방법 / Transport</td>
            <td style="padding: 14px 0; color: #1a1a2e; font-weight: 600; text-align: right; border-bottom: 1px solid #f0f0f0;">${transportLabel} / ${transportLabelEn}</td>
          </tr>
        </table>
      </td></tr>

      <!-- ============================================ -->
      <!-- PRICE BOX                                    -->
      <!-- ============================================ -->
      <tr><td style="background-color: #ffffff; padding: 20px 40px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #faf6eb; border: 1px solid #f0e8d0;">
          <tr><td style="padding: 20px 24px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              ${promoLabelKo ? `<tr>
                <td style="font-family: ${FONT_STACK}; font-size: 12px; color: #2e7d32; padding-bottom: 8px;">적용 할인 / Discount</td>
                <td align="right" style="font-family: ${FONT_STACK}; font-size: 12px; font-weight: 600; color: #2e7d32; padding-bottom: 8px;">${promoLabelKo} / ${promoLabelEn}</td>
              </tr>` : ''}
              <tr>
                <td style="font-family: ${FONT_STACK}; font-size: 13px; color: #888888; vertical-align: middle;">최종 금액 / Total Due</td>
                <td align="right" style="font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: 700; color: #d4af37; letter-spacing: 1px;">${priceText}</td>
              </tr>
            </table>
          </td></tr>
        </table>
      </td></tr>

      <!-- ============================================ -->
      <!-- GUEST INFORMATION SECTION                    -->
      <!-- ============================================ -->
      <tr><td style="background-color: #ffffff; padding: 8px 40px 0 40px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr><td style="font-family: ${FONT_STACK}; font-size: 13px; font-weight: 700; color: #1a1a2e; letter-spacing: 2px; text-transform: uppercase; padding-bottom: 8px;">투숙객 정보 / Guest Information</td></tr>
          <tr><td style="border-bottom: 1px solid #d4af37; font-size: 0; line-height: 0; height: 1px;">&nbsp;</td></tr>
        </table>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="font-family: ${FONT_STACK}; font-size: 14px;">
          <tr>
            <td style="padding: 14px 0; color: #888888; width: 45%; border-bottom: 1px solid #f0f0f0;">성명 / Name</td>
            <td style="padding: 14px 0; color: #1a1a2e; font-weight: 600; text-align: right; border-bottom: 1px solid #f0f0f0;">${data.guestName}</td>
          </tr>
          <tr>
            <td style="padding: 14px 0; color: #888888; border-bottom: 1px solid #f0f0f0;">연락처 / Phone</td>
            <td style="padding: 14px 0; color: #1a1a2e; text-align: right; border-bottom: 1px solid #f0f0f0;">${data.guestPhone}</td>
          </tr>
          <tr>
            <td style="padding: 14px 0; color: #888888; border-bottom: 1px solid #f0f0f0;">이메일 / Email</td>
            <td style="padding: 14px 0; color: #1a1a2e; text-align: right; border-bottom: 1px solid #f0f0f0;">${data.guestEmail}</td>
          </tr>
          ${data.specialRequests ? `<tr>
            <td style="padding: 14px 0; color: #888888; vertical-align: top;">요청사항 / Requests</td>
            <td style="padding: 14px 0; color: #1a1a2e; text-align: right;">${data.specialRequests}</td>
          </tr>` : ''}
        </table>
      </td></tr>

      <!-- ============================================ -->
      <!-- NOTICE / IMPORTANT INFORMATION               -->
      <!-- ============================================ -->
      <tr><td style="background-color: #ffffff; padding: 24px 40px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #fffbeb; border-left: 3px solid #d4af37;">
          <tr><td style="padding: 20px 20px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="font-family: ${FONT_STACK}; font-size: 13px; color: #666666;">
              <tr><td style="font-weight: 700; color: #1a1a2e; padding-bottom: 12px; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">안내사항 / Notice</td></tr>
              <tr><td style="padding-bottom: 6px; line-height: 1.6;">&#8226; 결제는 현장에서 진행됩니다 (카드/현금)</td></tr>
              <tr><td style="padding-bottom: 6px; line-height: 1.6;">&#8226; 체크인 24시간 전까지 무료 취소 가능합니다</td></tr>
              <tr><td style="padding-bottom: 6px; line-height: 1.6;">&#8226; 문의사항은 호텔로 직접 연락해주세요</td></tr>
              <tr><td style="padding-top: 8px; border-top: 1px solid #f0e8d0; color: #888888; line-height: 1.6;">&#8226; Payment will be processed on-site (card / cash)</td></tr>
              <tr><td style="padding-bottom: 2px; color: #888888; line-height: 1.6;">&#8226; Free cancellation up to 24 hours before check-in</td></tr>
              <tr><td style="color: #888888; line-height: 1.6;">&#8226; For inquiries, please contact the hotel directly</td></tr>
            </table>
          </td></tr>
        </table>
      </td></tr>

      <!-- ============================================ -->
      <!-- FOOTER                                       -->
      <!-- ============================================ -->
      <tr><td style="background-color: #ffffff; padding: 0 40px 32px 40px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr><td style="border-top: 1px solid #e5e5e5; padding-top: 24px;" align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr><td align="center" style="font-family: Georgia, 'Times New Roman', serif; font-size: 14px; font-weight: 700; color: #1a1a2e; letter-spacing: 2px; padding-bottom: 8px;">STAY HOTEL</td></tr>
              <tr><td align="center" style="font-family: ${FONT_STACK}; font-size: 12px; color: #888888; padding-bottom: 4px;">${hotelPhone} &nbsp;|&nbsp; ${hotelEmail}</td></tr>
              <tr><td align="center" style="font-family: ${FONT_STACK}; font-size: 12px; color: #888888; padding-bottom: 4px;">${brand.contact.address.ko}</td></tr>
              <tr><td align="center" style="font-family: ${FONT_STACK}; font-size: 11px; color: #aaaaaa; padding-top: 4px;">${brand.contact.address.en}</td></tr>
            </table>
          </td></tr>
        </table>
      </td></tr>

    </table>
    <!-- /Main Container -->

  </td></tr>
</table>
</body>
</html>`;

  try {
    await sendEmail({
      from: `${brandName} <${fromEmail}>`,
      to: data.guestEmail,
      subject: `[STAY HOTEL] 예약 확정 / Booking Confirmed - ${bookingId}`,
      html: guestHtml,
    });

    console.log(`Guest confirmation sent: ${bookingId} -> ${data.guestEmail}`);
    return { success: true };
  } catch (error) {
    console.error('Guest email send failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Phase 3: Send cancellation notification to GUEST
 *
 * 예약 취소 시 고객에게 취소 안내 이메일 발송
 * - 예약번호, 객실명, 체크인/아웃, 인원, 취소 시각, 문의 연락처 포함
 * - 이중 언어 (한국어 + English)
 */
export async function sendCancellationEmail(
  data: BookingFormData,
  bookingId: string,
  cancelledAt: string,
  finalAmount?: number,
): Promise<{ success: boolean; error?: string }> {
  const brand = getBrandConfig();
  const hotelEmail = brand.contact.email;
  const hotelPhone = brand.contact.phone;
  const brandName = brand.name.ko;
  const { roomName, roomNameEn, nights, priceText } = getBookingDetails(data, finalAmount);
  const fromEmail = process.env.EMAIL_FROM || 'noreply@pyeongtaekstay.com';
  const cancelDate = cancelledAt.split('T')[0];
  const cancelTime = cancelledAt.split('T')[1]?.substring(0, 5) || '';

  const cancelHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Cancelled - ${bookingId}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5;">
  <tr><td align="center" style="padding: 32px 16px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; width: 100%; border-collapse: collapse;">

      <!-- 헤더 -->
      <tr><td style="background-color: #1a1a2e; padding: 28px 40px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="font-family: Georgia, 'Times New Roman', serif; font-size: 20px; font-weight: 700; color: #d4af37; letter-spacing: 3px;">STAY HOTEL</td>
            <td align="right" style="font-family: ${FONT_STACK}; font-size: 10px; color: #8888a0; letter-spacing: 2px; text-transform: uppercase;">Booking Cancelled</td>
          </tr>
        </table>
      </td></tr>
      <!-- 빨간색 경고선 -->
      <tr><td style="background-color: #dc2626; height: 3px; font-size: 0; line-height: 0;">&nbsp;</td></tr>

      <!-- 취소 메시지 -->
      <tr><td style="background-color: #ffffff; padding: 32px 40px 24px 40px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr><td align="center" style="font-family: ${FONT_STACK}; font-size: 22px; font-weight: 700; color: #dc2626; padding-bottom: 8px;">예약이 취소되었습니다</td></tr>
          <tr><td align="center" style="font-family: ${FONT_STACK}; font-size: 13px; color: #888888; padding-bottom: 4px;">Your booking has been cancelled.</td></tr>
        </table>
      </td></tr>

      <!-- 예약번호 -->
      <tr><td style="background-color: #ffffff; padding: 0 40px 28px 40px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #fef2f2; border-left: 4px solid #dc2626;">
          <tr><td style="padding: 20px 24px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td>
                  <span style="font-family: ${FONT_STACK}; font-size: 11px; color: #888888; letter-spacing: 1px;">예약번호 / Booking No.</span><br>
                  <span style="font-family: 'Courier New', Courier, monospace; font-size: 22px; font-weight: 700; color: #1a1a2e; letter-spacing: 1px;">${bookingId}</span>
                </td>
                <td align="right" style="vertical-align: bottom;">
                  <span style="font-family: ${FONT_STACK}; font-size: 11px; color: #dc2626;">취소일: ${cancelDate} ${cancelTime}</span>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </td></tr>

      <!-- 숙박 정보 -->
      <tr><td style="background-color: #ffffff; padding: 0 40px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr><td style="font-family: ${FONT_STACK}; font-size: 13px; font-weight: 700; color: #1a1a2e; letter-spacing: 2px; text-transform: uppercase; padding-bottom: 8px;">취소된 예약 정보 / Cancelled Booking Details</td></tr>
          <tr><td style="border-bottom: 1px solid #dc2626; font-size: 0; line-height: 0; height: 1px;">&nbsp;</td></tr>
        </table>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="font-family: ${FONT_STACK}; font-size: 14px;">
          <tr>
            <td style="padding: 14px 0; color: #888888; width: 45%; border-bottom: 1px solid #f0f0f0;">객실 / Room</td>
            <td style="padding: 14px 0; color: #1a1a2e; font-weight: 600; text-align: right; border-bottom: 1px solid #f0f0f0;">${roomName}<br><span style="font-size: 12px; color: #888888; font-weight: 400;">${roomNameEn}</span></td>
          </tr>
          <tr>
            <td style="padding: 14px 0; color: #888888; border-bottom: 1px solid #f0f0f0;">체크인 / Check-in</td>
            <td style="padding: 14px 0; color: #1a1a2e; font-weight: 600; text-align: right; border-bottom: 1px solid #f0f0f0;">${data.checkIn}</td>
          </tr>
          <tr>
            <td style="padding: 14px 0; color: #888888; border-bottom: 1px solid #f0f0f0;">체크아웃 / Check-out</td>
            <td style="padding: 14px 0; color: #1a1a2e; font-weight: 600; text-align: right; border-bottom: 1px solid #f0f0f0;">${data.checkOut} (${nights}박 / ${nights} night${nights > 1 ? 's' : ''})</td>
          </tr>
          <tr>
            <td style="padding: 14px 0; color: #888888; border-bottom: 1px solid #f0f0f0;">인원 / Guests</td>
            <td style="padding: 14px 0; color: #1a1a2e; font-weight: 600; text-align: right; border-bottom: 1px solid #f0f0f0;">${data.guestCount}명</td>
          </tr>
          <tr>
            <td style="padding: 14px 0; color: #888888; border-bottom: 1px solid #f0f0f0;">금액 / Amount</td>
            <td style="padding: 14px 0; color: #888888; font-weight: 600; text-align: right; border-bottom: 1px solid #f0f0f0; text-decoration: line-through;">${priceText}</td>
          </tr>
        </table>
      </td></tr>

      <!-- 안내사항 -->
      <tr><td style="background-color: #ffffff; padding: 24px 40px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f9fafb; border-left: 3px solid #9ca3af;">
          <tr><td style="padding: 20px 20px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="font-family: ${FONT_STACK}; font-size: 13px; color: #666666;">
              <tr><td style="font-weight: 700; color: #1a1a2e; padding-bottom: 12px; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">안내사항 / Notice</td></tr>
              <tr><td style="padding-bottom: 6px; line-height: 1.6;">&#8226; 본 예약은 정상적으로 취소 처리되었습니다</td></tr>
              <tr><td style="padding-bottom: 6px; line-height: 1.6;">&#8226; 재예약을 원하시면 홈페이지를 이용해주세요</td></tr>
              <tr><td style="padding-bottom: 6px; line-height: 1.6;">&#8226; 문의사항은 호텔로 직접 연락해주세요</td></tr>
              <tr><td style="padding-top: 8px; border-top: 1px solid #e5e7eb; color: #888888; line-height: 1.6;">&#8226; This booking has been successfully cancelled</td></tr>
              <tr><td style="padding-bottom: 2px; color: #888888; line-height: 1.6;">&#8226; To rebook, please visit our website</td></tr>
              <tr><td style="color: #888888; line-height: 1.6;">&#8226; For inquiries, please contact the hotel directly</td></tr>
            </table>
          </td></tr>
        </table>
      </td></tr>

      <!-- 푸터 -->
      <tr><td style="background-color: #ffffff; padding: 0 40px 32px 40px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr><td style="border-top: 1px solid #e5e5e5; padding-top: 24px;" align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr><td align="center" style="font-family: Georgia, 'Times New Roman', serif; font-size: 14px; font-weight: 700; color: #1a1a2e; letter-spacing: 2px; padding-bottom: 8px;">STAY HOTEL</td></tr>
              <tr><td align="center" style="font-family: ${FONT_STACK}; font-size: 12px; color: #888888; padding-bottom: 4px;">${hotelPhone} &nbsp;|&nbsp; ${hotelEmail}</td></tr>
              <tr><td align="center" style="font-family: ${FONT_STACK}; font-size: 12px; color: #888888; padding-bottom: 4px;">${brand.contact.address.ko}</td></tr>
              <tr><td align="center" style="font-family: ${FONT_STACK}; font-size: 11px; color: #aaaaaa; padding-top: 4px;">${brand.contact.address.en}</td></tr>
            </table>
          </td></tr>
        </table>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;

  try {
    await sendEmail({
      from: `${brandName} <${fromEmail}>`,
      to: data.guestEmail,
      subject: `[STAY HOTEL] 예약 취소 안내 / Booking Cancelled - ${bookingId}`,
      html: cancelHtml,
    });

    console.log(`Cancellation email sent: ${bookingId} -> ${data.guestEmail}`);
    return { success: true };
  } catch (error) {
    console.error('Cancellation email send failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}
