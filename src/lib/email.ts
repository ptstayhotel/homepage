/**
 * Email Utility for Booking Notifications
 *
 * Sends booking notification to hotel and confirmation to guest via Gmail SMTP.
 *
 * Required environment variables:
 * - SMTP_USER: Gmail address (e.g., ptstayhotel@gmail.com)
 * - SMTP_PASS: Gmail app password
 */

import nodemailer from 'nodemailer';
import { BookingFormData } from '@/types';
import { getRoomById, getRoomName, formatPrice } from '@/config/rooms';
import { getBrandConfig } from '@/config/brand';
import { generateBookingPDF } from './booking-pdf';

const RESERVATION_TYPE_LABELS: Record<string, Record<string, string>> = {
  general: { ko: '일반', en: 'General' },
  corporate: { ko: '기업체', en: 'Corporate' },
  military: { ko: '군인', en: 'Military' },
};

function getTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error('SMTP_USER and SMTP_PASS environment variables are required');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

function calculateNights(checkIn: string, checkOut: string): number {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Send booking notification email to hotel + confirmation to guest
 */
export async function sendBookingEmail(
  data: BookingFormData,
  bookingId?: string,
): Promise<{ success: boolean; bookingId: string; error?: string }> {
  const transporter = getTransporter();
  const brand = getBrandConfig();
  const hotelEmail = brand.contact.email;
  const hotelPhone = brand.contact.phone;
  const brandName = brand.name.ko;

  const room = getRoomById(data.roomId);
  const roomName = room ? getRoomName(room, 'ko') : data.roomId;
  const roomNameEn = room ? getRoomName(room, 'en') : data.roomId;
  const nights = calculateNights(data.checkIn, data.checkOut);
  const totalPrice = room ? room.pricePerNight * nights : 0;
  const priceText = room ? formatPrice(totalPrice, 'ko') : '-';
  const typeLabel = RESERVATION_TYPE_LABELS[data.reservationType]?.ko || data.reservationType;

  if (!bookingId) {
    bookingId = 'BK-' + Date.now().toString(36).toUpperCase();
  }

  // --- Hotel notification email ---
  const hotelHtml = `
<div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a2e;">
  <div style="background: #1a1a2e; padding: 24px 32px;">
    <h1 style="color: #d4af37; font-size: 18px; margin: 0; letter-spacing: 2px;">${brandName}</h1>
  </div>
  <div style="padding: 32px; border: 1px solid #e5e5e5; border-top: none;">
    <h2 style="font-size: 20px; margin: 0 0 24px 0; color: #1a1a2e;">새 예약 접수</h2>
    <p style="font-size: 13px; color: #888; margin: 0 0 16px 0;">예약번호: <strong style="color: #1a1a2e;">${bookingId}</strong></p>

    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 12px 0; color: #888; width: 120px;">객실</td>
        <td style="padding: 12px 0; font-weight: 600;">${roomName} (${roomNameEn})</td>
      </tr>
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 12px 0; color: #888;">체크인</td>
        <td style="padding: 12px 0; font-weight: 600;">${data.checkIn}</td>
      </tr>
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 12px 0; color: #888;">체크아웃</td>
        <td style="padding: 12px 0; font-weight: 600;">${data.checkOut} (${nights}박)</td>
      </tr>
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 12px 0; color: #888;">인원</td>
        <td style="padding: 12px 0; font-weight: 600;">${data.guestCount}명</td>
      </tr>
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 12px 0; color: #888;">예약 유형</td>
        <td style="padding: 12px 0; font-weight: 600;">${typeLabel}</td>
      </tr>
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 12px 0; color: #888;">예상 금액</td>
        <td style="padding: 12px 0; font-weight: 600; color: #d4af37;">${priceText}</td>
      </tr>
    </table>

    <h3 style="font-size: 16px; margin: 24px 0 12px 0; color: #1a1a2e;">고객 정보</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 12px 0; color: #888; width: 120px;">이름</td>
        <td style="padding: 12px 0; font-weight: 600;">${data.guestName}</td>
      </tr>
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 12px 0; color: #888;">이메일</td>
        <td style="padding: 12px 0;"><a href="mailto:${data.guestEmail}" style="color: #1a1a2e;">${data.guestEmail}</a></td>
      </tr>
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 12px 0; color: #888;">전화</td>
        <td style="padding: 12px 0;"><a href="tel:${data.guestPhone}" style="color: #1a1a2e;">${data.guestPhone}</a></td>
      </tr>
      ${data.specialRequests ? `
      <tr>
        <td style="padding: 12px 0; color: #888; vertical-align: top;">요청사항</td>
        <td style="padding: 12px 0;">${data.specialRequests}</td>
      </tr>` : ''}
    </table>
  </div>
</div>`;

  // --- Guest confirmation email ---
  const guestHtml = `
<div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a2e;">
  <div style="background: #1a1a2e; padding: 24px 32px; text-align: center;">
    <h1 style="color: #d4af37; font-size: 18px; margin: 0; letter-spacing: 2px;">${brandName}</h1>
  </div>
  <div style="padding: 32px; border: 1px solid #e5e5e5; border-top: none;">
    <h2 style="font-size: 20px; margin: 0 0 8px 0; text-align: center;">예약 접수가 완료되었습니다</h2>
    <p style="text-align: center; font-size: 13px; color: #888; margin: 0 0 24px 0;">Your booking request has been received.</p>

    <div style="background: #f8f8f8; padding: 20px; margin-bottom: 24px;">
      <p style="font-size: 12px; color: #888; margin: 0 0 4px 0;">예약번호 / Booking No.</p>
      <p style="font-size: 20px; font-weight: 700; margin: 0; letter-spacing: 1px;">${bookingId}</p>
    </div>

    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 10px 0; color: #888;">객실 / Room</td>
        <td style="padding: 10px 0; text-align: right; font-weight: 600;">${roomName}</td>
      </tr>
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 10px 0; color: #888;">체크인 / Check-in</td>
        <td style="padding: 10px 0; text-align: right;">${data.checkIn}</td>
      </tr>
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 10px 0; color: #888;">체크아웃 / Check-out</td>
        <td style="padding: 10px 0; text-align: right;">${data.checkOut} (${nights}박)</td>
      </tr>
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 10px 0; color: #888;">인원 / Guests</td>
        <td style="padding: 10px 0; text-align: right;">${data.guestCount}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; color: #888;">예상 금액 / Est. Total</td>
        <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #d4af37;">${priceText}</td>
      </tr>
    </table>

    <div style="margin-top: 24px; padding: 16px; background: #fffbeb; border-left: 3px solid #d4af37; font-size: 13px; color: #666;">
      <p style="margin: 0 0 8px 0;"><strong>안내사항</strong></p>
      <p style="margin: 0 0 4px 0;">- 예약 확정은 호텔에서 확인 후 별도 연락드립니다.</p>
      <p style="margin: 0 0 4px 0;">- 결제는 현장에서 진행됩니다 (카드/현금).</p>
      <p style="margin: 0;">- Confirmation will be sent separately by the hotel.</p>
    </div>

    <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #e5e5e5; text-align: center; font-size: 13px; color: #888;">
      <p style="margin: 0 0 4px 0;">${brandName}</p>
      <p style="margin: 0 0 4px 0;">${hotelPhone} | ${hotelEmail}</p>
      <p style="margin: 0;">${brand.contact.address.ko}</p>
    </div>
  </div>
</div>`;

  try {
    // Generate PDF confirmation
    const pdfBytes = await generateBookingPDF(data, bookingId);
    const pdfAttachment = {
      filename: `STAY_HOTEL_${bookingId}.pdf`,
      content: Buffer.from(pdfBytes),
      contentType: 'application/pdf' as const,
    };

    // Send to hotel
    await transporter.sendMail({
      from: `"${brandName} 예약시스템" <${process.env.SMTP_USER}>`,
      to: hotelEmail,
      subject: `[STAY HOTEL] 새 예약 접수 - ${data.guestName} (${data.checkIn} ~ ${data.checkOut})`,
      html: hotelHtml,
    });

    // Send confirmation to guest with PDF attachment
    await transporter.sendMail({
      from: `"${brandName}" <${process.env.SMTP_USER}>`,
      to: data.guestEmail,
      subject: `[STAY HOTEL] 예약 접수 확인 / Booking Confirmation - ${bookingId}`,
      html: guestHtml,
      attachments: [pdfAttachment],
    });

    console.log(`📧 Booking email sent: ${bookingId} → ${hotelEmail}, ${data.guestEmail}`);
    return { success: true, bookingId };
  } catch (error) {
    console.error('Email send failed:', error);
    return {
      success: false,
      bookingId: '',
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}
