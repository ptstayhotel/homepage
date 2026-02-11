/**
 * Sanhawings CMS Adapter
 *
 * TODO: Implement this adapter when Sanhawings CMS API is available
 *
 * This adapter will connect to the Sanhawings CMS API to:
 * - Fetch real room data
 * - Check real-time availability
 * - Create actual bookings
 *
 * INTEGRATION STEPS:
 * 1. Obtain API credentials from Sanhawings
 * 2. Update .env.local with:
 *    - SANHAWINGS_API_KEY=your_actual_key
 *    - SANHAWINGS_API_URL=https://api.sanhawings.com/v1
 *    - NEXT_PUBLIC_USE_MOCK_CMS=false
 * 3. Implement the methods below according to API documentation
 * 4. Test thoroughly before deploying
 *
 * API DOCUMENTATION:
 * Contact Sanhawings for API documentation and credentials
 */

import { Room, BookingFormData, BookingResponse, RoomAmenity } from '@/types';
import { BaseCMSAdapter } from './adapter';

/**
 * Expected API response types from Sanhawings
 * TODO: Update these types based on actual API documentation
 */
interface SanhawingsRoomResponse {
  id: string;
  name: string;
  name_en: string;
  description: string;
  description_en: string;
  price: number;
  friday_price?: number;
  saturday_price?: number;
  max_guests: number;
  size_sqm: number;
  bed_type: string;
  view_type: string;
  amenities: string[];
  images: Array<{
    url: string;
    caption: string;
    is_primary: boolean;
  }>;
  is_available: boolean;
}

interface SanhawingsAvailabilityResponse {
  room_id: string;
  is_available: boolean;
  available_dates: string[];
  blocked_dates: string[];
}

interface SanhawingsBookingResponse {
  success: boolean;
  booking_id: string;
  status: 'confirmed' | 'pending' | 'failed';
  message: string;
  error_code?: string;
}

/**
 * Sanhawings CMS Adapter Implementation
 *
 * TODO: Complete implementation when API is available
 */
export class SanhawingsCMSAdapter extends BaseCMSAdapter {
  private headers: HeadersInit;

  constructor(apiUrl: string, apiKey: string) {
    super(apiUrl, apiKey);

    // Set up authentication headers
    this.headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'X-API-Version': '1.0', // TODO: Update based on API version
    };

    console.log('🏨 SanhawingsCMSAdapter initialized');
    console.log(`   API URL: ${apiUrl}`);
  }

  /**
   * Fetch all rooms from Sanhawings API
   *
   * TODO: Implement this method
   * Expected endpoint: GET /rooms
   */
  async getRooms(): Promise<Room[]> {
    try {
      const response = await fetch(`${this.apiUrl}/rooms`, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data: SanhawingsRoomResponse[] = await response.json();
      return data.map(this.transformRoom);
    } catch (error) {
      console.error('Failed to fetch rooms from Sanhawings:', error);
      // TODO: Implement proper error handling
      // Consider falling back to mock data or showing error to user
      throw error;
    }
  }

  /**
   * Fetch a single room by ID
   *
   * TODO: Implement this method
   * Expected endpoint: GET /rooms/:id
   */
  async getRoomById(id: string): Promise<Room | null> {
    try {
      const response = await fetch(`${this.apiUrl}/rooms/${id}`, {
        method: 'GET',
        headers: this.headers,
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data: SanhawingsRoomResponse = await response.json();
      return this.transformRoom(data);
    } catch (error) {
      console.error(`Failed to fetch room ${id} from Sanhawings:`, error);
      throw error;
    }
  }

  /**
   * Fetch a single room by slug
   *
   * TODO: Implement this method
   * Expected endpoint: GET /rooms/slug/:slug
   * Note: If API doesn't support slug lookup, fetch all rooms and filter
   */
  async getRoomBySlug(slug: string): Promise<Room | null> {
    try {
      // Option 1: If API supports slug lookup
      const response = await fetch(`${this.apiUrl}/rooms/slug/${slug}`, {
        method: 'GET',
        headers: this.headers,
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data: SanhawingsRoomResponse = await response.json();
      return this.transformRoom(data);
    } catch {
      // Option 2: Fallback - fetch all rooms and filter by slug
      console.warn('Slug lookup failed, falling back to full list');
      const rooms = await this.getRooms();
      return rooms.find((room) => room.slug === slug) || null;
    }
  }

  /**
   * Check room availability
   *
   * TODO: Implement this method
   * Expected endpoint: POST /availability/check
   */
  async checkAvailability(
    roomId: string,
    checkIn: string,
    checkOut: string
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/availability/check`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          room_id: roomId,
          check_in: checkIn,
          check_out: checkOut,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data: SanhawingsAvailabilityResponse = await response.json();
      return data.is_available;
    } catch (error) {
      console.error('Failed to check availability:', error);
      // Return false on error to prevent double bookings
      return false;
    }
  }

  /**
   * Create a booking
   *
   * TODO: Implement this method
   * Expected endpoint: POST /bookings
   */
  async createBooking(data: BookingFormData): Promise<BookingResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/bookings`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          room_id: data.roomId,
          check_in: data.checkIn,
          check_out: data.checkOut,
          guest_count: data.guestCount,
          guest: {
            name: data.guestName,
            email: data.guestEmail,
            phone: data.guestPhone,
          },
          special_requests: data.specialRequests,
        }),
      });

      const result: SanhawingsBookingResponse = await response.json();

      if (!response.ok || !result.success) {
        return {
          success: false,
          message: result.message || 'Booking failed',
          error: result.error_code || 'UNKNOWN_ERROR',
        };
      }

      return {
        success: true,
        bookingId: result.booking_id,
        message: 'Booking confirmed successfully',
      };
    } catch (error) {
      console.error('Failed to create booking:', error);
      return {
        success: false,
        message: 'Failed to connect to booking system',
        error: 'CONNECTION_ERROR',
      };
    }
  }

  /**
   * Check API connection
   *
   * TODO: Implement this method
   * Expected endpoint: GET /health or GET /ping
   */
  async isConnected(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/health`, {
        method: 'GET',
        headers: this.headers,
      });

      return response.ok;
    } catch (error) {
      console.error('Sanhawings API connection failed:', error);
      return false;
    }
  }

  // ============================================
  // Data Transformation Methods
  // ============================================

  /**
   * Transform Sanhawings API response to our Room type
   * TODO: Update this based on actual API response structure
   */
  private transformRoom(apiRoom: SanhawingsRoomResponse): Room {
    return {
      id: apiRoom.id,
      slug: this.generateSlug(apiRoom.name_en),
      nameKo: apiRoom.name,
      nameEn: apiRoom.name_en,
      descriptionKo: apiRoom.description,
      descriptionEn: apiRoom.description_en,
      pricePerNight: apiRoom.price,
      fridayPrice: apiRoom.friday_price ?? apiRoom.price,
      saturdayPrice: apiRoom.saturday_price ?? apiRoom.price,
      maxGuests: apiRoom.max_guests,
      size: apiRoom.size_sqm,
      bedType: this.mapBedType(apiRoom.bed_type),
      viewType: this.mapViewType(apiRoom.view_type),
      amenities: this.mapAmenities(apiRoom.amenities),
      images: apiRoom.images.map((img) => ({
        url: img.url,
        alt: img.caption,
        isPrimary: img.is_primary,
      })),
      isAvailable: apiRoom.is_available,
    };
  }

  /**
   * Generate URL-friendly slug from room name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Map API bed type to our BedType
   * TODO: Update mapping based on API values
   */
  private mapBedType(type: string): Room['bedType'] {
    const mapping: Record<string, Room['bedType']> = {
      single: 'single',
      double: 'double',
      twin: 'twin',
      queen: 'queen',
      king: 'king',
    };
    return mapping[type.toLowerCase()] || 'double';
  }

  /**
   * Map API view type to our ViewType
   * TODO: Update mapping based on API values
   */
  private mapViewType(type: string): Room['viewType'] {
    const mapping: Record<string, Room['viewType']> = {
      city: 'city',
      garden: 'garden',
      pool: 'pool',
      mountain: 'mountain',
      ocean: 'ocean',
    };
    return mapping[type?.toLowerCase()] || 'city';
  }

  /**
   * Map API amenities to our RoomAmenity type
   * TODO: Update based on API response structure
   */
  private mapAmenities(amenities: string[]): RoomAmenity[] {
    const amenityMap: Record<string, RoomAmenity> = {
      wifi: { id: 'wifi', nameKo: '무료 Wi-Fi', nameEn: 'Free Wi-Fi', icon: 'wifi' },
      tv: { id: 'tv', nameKo: '스마트 TV', nameEn: 'Smart TV', icon: 'tv' },
      ac: { id: 'ac', nameKo: '에어컨', nameEn: 'Air Conditioning', icon: 'snowflake' },
      minibar: { id: 'minibar', nameKo: '미니바', nameEn: 'Mini Bar', icon: 'wine' },
      safe: { id: 'safe', nameKo: '객실 금고', nameEn: 'In-room Safe', icon: 'lock' },
      bathtub: { id: 'bathtub', nameKo: '욕조', nameEn: 'Bathtub', icon: 'bath' },
    };

    return amenities
      .map((a) => amenityMap[a.toLowerCase()])
      .filter((a): a is RoomAmenity => a !== undefined);
  }
}
