'use client';

/**
 * Admin Dashboard — Front Desk Booking Viewer
 *
 * Password-gated. Password is validated server-side via the API.
 * Displays all bookings in a dense spreadsheet-style table.
 */

import { useState, useCallback } from 'react';

interface BookingRecord {
  bookingId: string;
  status: 'pending' | 'confirmed';
  createdAt: string;
  agreedAt?: string;
  appliedPromo?: string | null;
  formData: {
    roomId: string;
    checkIn: string;
    checkOut: string;
    guestCount: number;
    reservationType: string;
    transportation: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    specialRequests?: string;
  };
}

const ROOM_LABELS: Record<string, string> = {
  standard: '스탠다드',
  'standard-premium': '스탠다드 프리미엄',
  deluxe: '디럭스',
  'family-twin': '패밀리 트윈',
  'family-triple': '패밀리 트리플',
  'royal-suite': '로얄 스위트',
  'party-suite': '파티 스위트',
};

function formatDateTime(iso: string): string {
  if (!iso) return '-';
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${h}:${min}`;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchBookings = useCallback(async (pw: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/bookings', {
        headers: { 'X-Admin-Key': pw },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || '인증 실패');
        setAuthenticated(false);
        return;
      }
      setAuthenticated(true);
      setBookings(data.bookings || []);
    } catch {
      setError('서버 연결 실패');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings(password);
  };

  const handleRefresh = () => {
    fetchBookings(password);
  };

  // --- Login Gate ---
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 shadow-md w-full max-w-sm">
          <h1 className="text-lg font-bold text-neutral-800 mb-1">STAY HOTEL ADMIN</h1>
          <p className="text-xs text-neutral-500 mb-6">예약 관리 대시보드</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 입력"
            className="w-full px-4 py-3 border border-neutral-300 text-sm focus:outline-none focus:border-neutral-800 mb-3"
            autoFocus
          />
          {error && <p className="text-red-600 text-xs mb-3">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 bg-neutral-900 text-white text-sm tracking-wider uppercase hover:bg-neutral-700 transition-colors disabled:opacity-50"
          >
            {loading ? '확인 중...' : '로그인'}
          </button>
        </form>
      </div>
    );
  }

  // --- Dashboard ---
  return (
    <div className="min-h-screen pt-32 pb-12 px-4 bg-gray-50">
      {/* Header */}
      <div className="bg-neutral-900 text-white px-6 py-4 flex items-center justify-between rounded-lg">
        <div>
          <h1 className="text-base font-bold tracking-wider">STAY HOTEL ADMIN</h1>
          <p className="text-xs text-neutral-400">예약 관리 대시보드</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-neutral-400">총 {bookings.length}건</span>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 text-xs border border-neutral-600 text-neutral-300 hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            {loading ? '로딩...' : '새로고침'}
          </button>
          <button
            onClick={() => { setAuthenticated(false); setPassword(''); setBookings([]); }}
            className="px-4 py-2 text-xs border border-neutral-600 text-neutral-300 hover:bg-neutral-800 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto bg-white shadow-md rounded-lg">
        {bookings.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 text-sm">
            예약 내역이 없습니다.
          </div>
        ) : (
          <table className="w-full text-xs border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-neutral-800 text-white text-left">
                <th className="px-3 py-2 border border-neutral-600 font-medium whitespace-nowrap">상태</th>
                <th className="px-3 py-2 border border-neutral-600 font-medium whitespace-nowrap">예약번호</th>
                <th className="px-3 py-2 border border-neutral-600 font-medium whitespace-nowrap">예약일시</th>
                <th className="px-3 py-2 border border-neutral-600 font-medium whitespace-nowrap">고객명</th>
                <th className="px-3 py-2 border border-neutral-600 font-medium whitespace-nowrap">이메일</th>
                <th className="px-3 py-2 border border-neutral-600 font-medium whitespace-nowrap">연락처</th>
                <th className="px-3 py-2 border border-neutral-600 font-medium whitespace-nowrap">체크인/아웃</th>
                <th className="px-3 py-2 border border-neutral-600 font-medium whitespace-nowrap">룸 타입</th>
                <th className="px-3 py-2 border border-neutral-600 font-medium whitespace-nowrap">인원</th>
                <th className="px-3 py-2 border border-neutral-600 font-medium whitespace-nowrap">군인할인</th>
                <th className="px-3 py-2 border border-neutral-600 font-medium whitespace-nowrap">방문방법</th>
                <th className="px-3 py-2 border border-neutral-600 font-medium whitespace-nowrap">프로모션</th>
                <th className="px-3 py-2 border border-neutral-600 font-medium whitespace-nowrap">정책동의</th>
                <th className="px-3 py-2 border border-neutral-600 font-medium whitespace-nowrap">요청사항</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.bookingId} className="hover:bg-neutral-50 border-b border-neutral-200">
                  <td className="px-3 py-2 border border-neutral-200 whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      b.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {b.status === 'confirmed' ? '확정' : '대기'}
                    </span>
                  </td>
                  <td className="px-3 py-2 border border-neutral-200 font-mono whitespace-nowrap">{b.bookingId}</td>
                  <td className="px-3 py-2 border border-neutral-200 whitespace-nowrap">{formatDateTime(b.createdAt)}</td>
                  <td className="px-3 py-2 border border-neutral-200 font-medium whitespace-nowrap">{b.formData.guestName}</td>
                  <td className="px-3 py-2 border border-neutral-200 whitespace-nowrap">{b.formData.guestEmail}</td>
                  <td className="px-3 py-2 border border-neutral-200 whitespace-nowrap">{b.formData.guestPhone}</td>
                  <td className="px-3 py-2 border border-neutral-200 whitespace-nowrap">
                    {b.formData.checkIn} ~ {b.formData.checkOut}
                  </td>
                  <td className="px-3 py-2 border border-neutral-200 whitespace-nowrap">
                    {ROOM_LABELS[b.formData.roomId] || b.formData.roomId}
                  </td>
                  <td className="px-3 py-2 border border-neutral-200 text-center">{b.formData.guestCount}</td>
                  <td className="px-3 py-2 border border-neutral-200 text-center whitespace-nowrap">
                    {b.formData.reservationType === 'military' ? (
                      <span className="text-blue-700 font-bold">YES</span>
                    ) : (
                      <span className="text-neutral-400">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2 border border-neutral-200 text-center whitespace-nowrap">
                    {b.formData.transportation === 'car' ? '차량' : '도보'}
                  </td>
                  <td className="px-3 py-2 border border-neutral-200 text-center whitespace-nowrap">
                    {b.appliedPromo ? (
                      <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800">
                        {b.appliedPromo === 'longstay_15' ? '연박15%' : b.appliedPromo === 'longstay_10' ? '연박10%' : b.appliedPromo}
                      </span>
                    ) : <span className="text-neutral-400">-</span>}
                  </td>
                  <td className="px-3 py-2 border border-neutral-200 whitespace-nowrap">
                    {b.agreedAt ? formatDateTime(b.agreedAt) : '-'}
                  </td>
                  <td className="px-3 py-2 border border-neutral-200 max-w-[200px] truncate" title={b.formData.specialRequests || ''}>
                    {b.formData.specialRequests || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
