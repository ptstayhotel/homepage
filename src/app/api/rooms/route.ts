/**
 * Rooms API Route
 *
 * GET /api/rooms - Get all rooms
 * GET /api/rooms?id=xxx - Get room by ID
 */

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { rooms, getRoomById } from '@/config/rooms';

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
