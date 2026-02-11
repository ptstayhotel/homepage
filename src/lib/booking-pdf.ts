/**
 * Booking Confirmation PDF Generator
 *
 * Premium hotel-style PDF with elegant layout (English).
 */

import { PDFDocument, rgb, PDFFont, PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { BookingFormData } from '@/types';
import { getRoomById, getRoomName, formatPrice } from '@/config/rooms';
import { getBrandConfig } from '@/config/brand';
import fs from 'fs';
import path from 'path';

let cachedFont: Buffer | null = null;

function getFont(): Buffer {
  if (cachedFont) return cachedFont;
  // Try Windows system font first, fallback to bundled font
  const winPath = 'C:\\Windows\\Fonts\\malgun.ttf';
  const bundledPath = path.join(process.cwd(), 'src', 'fonts', 'NotoSansKR-Regular.otf');
  const fontPath = fs.existsSync(winPath) ? winPath : bundledPath;
  cachedFont = fs.readFileSync(fontPath);
  return cachedFont;
}

function calculateNights(checkIn: string, checkOut: string): number {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return `${weekdays[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

const TYPE_LABELS: Record<string, string> = {
  general: 'General',
  corporate: 'Corporate',
  military: 'Military',
};

// Colors
const NAVY = rgb(0.1, 0.1, 0.18);
const GOLD = rgb(0.83, 0.69, 0.22);
const GOLD_LIGHT = rgb(0.92, 0.85, 0.6);
const TEXT_DARK = rgb(0.05, 0.05, 0.05);
const TEXT_MID = rgb(0.15, 0.15, 0.15);
const TEXT_LIGHT = rgb(0.3, 0.3, 0.3);
const LINE_COLOR = rgb(0.85, 0.85, 0.85);
const BG_LIGHT = rgb(0.97, 0.97, 0.97);

function drawCentered(page: PDFPage, text: string, y: number, font: PDFFont, size: number, color: ReturnType<typeof rgb>, pageWidth: number) {
  const w = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: (pageWidth - w) / 2, y, size, font, color });
}

function drawRight(page: PDFPage, text: string, y: number, font: PDFFont, size: number, color: ReturnType<typeof rgb>, rightX: number) {
  const w = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: rightX - w, y, size, font, color });
}

function drawSectionHeader(page: PDFPage, font: PDFFont, text: string, y: number, left: number, right: number) {
  page.drawText(text, { x: left, y, size: 11, font, color: NAVY });
  const lineY = y - 8;
  page.drawLine({ start: { x: left, y: lineY }, end: { x: right, y: lineY }, thickness: 0.7, color: GOLD_LIGHT });
  return lineY - 18;
}

function drawRow(page: PDFPage, font: PDFFont, label: string, value: string, y: number, left: number, right: number) {
  page.drawText(label, { x: left, y, size: 8.5, font, color: TEXT_LIGHT });
  drawRight(page, value, y, font, 9.5, TEXT_DARK, right);
  const lineY = y - 11;
  page.drawLine({ start: { x: left, y: lineY }, end: { x: right, y: lineY }, thickness: 0.3, color: rgb(0.92, 0.92, 0.92) });
  return y - 26;
}

export async function generateBookingPDF(
  data: BookingFormData,
  bookingId: string,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const fontBytes = getFont();
  const font = await pdfDoc.embedFont(fontBytes);

  const brand = getBrandConfig();
  const room = getRoomById(data.roomId);
  const roomName = room ? getRoomName(room, 'en') : data.roomId;
  const nights = calculateNights(data.checkIn, data.checkOut);
  const totalPrice = room ? room.pricePerNight * nights : 0;
  const priceText = room ? formatPrice(totalPrice, 'ko') : '-';

  const W = 595;
  const H = 842;
  const M = 56;
  const R = W - M;
  const CW = W - M * 2;
  const page = pdfDoc.addPage([W, H]);

  // ============================================================
  // HEADER
  // ============================================================
  const headerH = 90;
  page.drawRectangle({ x: 0, y: H - headerH, width: W, height: headerH, color: NAVY });
  page.drawRectangle({ x: 0, y: H - headerH, width: W, height: 2, color: GOLD });

  page.drawText('STAY HOTEL', { x: M, y: H - 50, size: 24, font, color: GOLD });
  drawRight(page, 'BOOKING CONFIRMATION', H - 50, font, 10, rgb(0.55, 0.55, 0.6), R);

  // ============================================================
  // BOOKING NUMBER
  // ============================================================
  let y = H - headerH - 28;

  const bnH = 54;
  page.drawRectangle({ x: M, y: y - bnH + 18, width: CW, height: bnH, color: BG_LIGHT });
  page.drawRectangle({ x: M, y: y - bnH + 18, width: 3, height: bnH, color: GOLD });

  page.drawText('Booking No.', { x: M + 14, y: y + 2, size: 8, font, color: TEXT_LIGHT });
  page.drawText(bookingId, { x: M + 14, y: y - 16, size: 17, font, color: NAVY });

  const today = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const issuedDate = `${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
  drawRight(page, `Issued: ${issuedDate}`, y - 8, font, 8, TEXT_LIGHT, R - 14);

  y -= bnH + 24;

  // ============================================================
  // STAY DETAILS
  // ============================================================
  y = drawSectionHeader(page, font, 'Stay Details', y, M, R);

  y = drawRow(page, font, 'Room', roomName, y, M, R);
  y = drawRow(page, font, 'Check-in', formatDate(data.checkIn), y, M, R);
  y = drawRow(page, font, 'Check-out', formatDate(data.checkOut), y, M, R);
  y = drawRow(page, font, 'Nights', `${nights} night${nights > 1 ? 's' : ''}`, y, M, R);
  y = drawRow(page, font, 'Guests', `${data.guestCount}`, y, M, R);
  y = drawRow(page, font, 'Reservation Type', TYPE_LABELS[data.reservationType] || data.reservationType, y, M, R);

  // Price - prominent
  y -= 2;
  const priceBoxH = 36;
  page.drawRectangle({ x: M, y: y - priceBoxH + 14, width: CW, height: priceBoxH, color: rgb(0.98, 0.96, 0.9) });
  page.drawText('Estimated Total', { x: M + 12, y: y - 2, size: 9, font, color: TEXT_MID });
  drawRight(page, priceText, y - 4, font, 16, GOLD, R - 12);
  y -= priceBoxH + 16;

  // ============================================================
  // GUEST INFO
  // ============================================================
  y = drawSectionHeader(page, font, 'Guest Information', y, M, R);

  y = drawRow(page, font, 'Name', data.guestName, y, M, R);
  y = drawRow(page, font, 'Phone', data.guestPhone, y, M, R);
  y = drawRow(page, font, 'Email', data.guestEmail, y, M, R);
  if (data.specialRequests) {
    y = drawRow(page, font, 'Special Requests', data.specialRequests, y, M, R);
  }

  // ============================================================
  // NOTICE
  // ============================================================
  y -= 18;
  const noticeLines = [
    '- Booking confirmation will be sent separately after hotel review.',
    '- Payment will be processed on-site (card / cash).',
    '- Free cancellation is available up to 24 hours before check-in.',
    '- For inquiries, please contact the hotel directly.',
  ];
  const lineH = 14;
  const noticePadding = 14;
  const noticeBoxH = noticePadding * 2 + 18 + noticeLines.length * lineH;

  page.drawRectangle({ x: M, y: y - noticeBoxH, width: CW, height: noticeBoxH, color: BG_LIGHT });
  page.drawRectangle({ x: M, y: y - noticeBoxH, width: CW, height: 0.5, color: LINE_COLOR });
  page.drawRectangle({ x: M, y, width: CW, height: 0.5, color: LINE_COLOR });

  let ny = y - noticePadding;
  page.drawText('Notice', { x: M + noticePadding, y: ny, size: 9, font, color: TEXT_DARK });
  ny -= 18;
  for (const line of noticeLines) {
    page.drawText(line, { x: M + noticePadding, y: ny, size: 7.5, font, color: TEXT_MID });
    ny -= lineH;
  }

  // ============================================================
  // FOOTER
  // ============================================================
  const footerY = 55;
  page.drawLine({ start: { x: M, y: footerY + 18 }, end: { x: R, y: footerY + 18 }, thickness: 0.5, color: GOLD_LIGHT });

  drawCentered(page, 'STAY HOTEL', footerY + 4, font, 8, TEXT_MID, W);
  drawCentered(page, `${brand.contact.phone}  |  ${brand.contact.email}`, footerY - 8, font, 7, TEXT_MID, W);
  drawCentered(page, brand.contact.address.en, footerY - 20, font, 7, TEXT_MID, W);

  return pdfDoc.save();
}
