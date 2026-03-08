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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 w-full max-w-sm">
          <h1 className="text-lg font-bold text-slate-800 mb-1">STAY HOTEL ADMIN</h1>
          <p className="text-xs text-slate-500 mb-6">예약 관리 대시보드</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 입력"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 mb-3"
            autoFocus
          />
          {error && <p className="text-red-600 text-xs mb-3">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 bg-slate-900 text-white text-sm tracking-wider uppercase rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            {loading ? '확인 중...' : '로그인'}
          </button>
        </form>
      </div>
    );
  }

  // --- Dashboard ---
  return (
    <div className="min-h-screen mt-[80px] pb-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      {/* Admin Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm rounded-xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">예약 관리 대시보드</h1>
          <p className="text-xs text-slate-500 mt-0.5">STAY HOTEL ADMIN &middot; 총 <span className="font-semibold text-slate-700">{bookings.length}</span>건</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 text-xs font-medium border border-slate-300 text-slate-700 bg-white rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors disabled:opacity-50"
          >
            {loading ? '로딩...' : '새로고침'}
          </button>
          <button
            onClick={() => { setAuthenticated(false); setPassword(''); setBookings([]); }}
            className="px-4 py-2 text-xs font-medium border border-slate-300 text-slate-700 bg-white rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="mt-5 overflow-x-auto bg-white shadow-sm rounded-xl border border-slate-200">
        {bookings.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            예약 내역이 없습니다.
          </div>
        ) : (
          <table className="w-full text-xs border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-slate-800 text-white text-left">
                <th className="px-4 py-3 font-medium whitespace-nowrap">상태</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">예약번호</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">예약일시</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">고객명</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">이메일</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">연락처</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">체크인/아웃</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">룸 타입</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">인원</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">군인할인</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">방문방법</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">프로모션</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">정책동의</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">요청사항</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, idx) => (
                <tr key={b.bookingId} className={`border-b border-slate-100 hover:bg-blue-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                      b.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {b.status === 'confirmed' ? '확정' : '대기'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono whitespace-nowrap text-slate-600">{b.bookingId}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">{formatDateTime(b.createdAt)}</td>
                  <td className="px-4 py-3 font-medium whitespace-nowrap text-slate-900">{b.formData.guestName}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">{b.formData.guestEmail}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">{b.formData.guestPhone}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                    {b.formData.checkIn} ~ {b.formData.checkOut}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                    {ROOM_LABELS[b.formData.roomId] || b.formData.roomId}
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap text-slate-600">{b.formData.guestCount}</td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    {b.formData.reservationType === 'military' ? (
                      <span className="text-blue-700 font-bold">YES</span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap text-slate-600">
                    {b.formData.transportation === 'car' ? '차량' : '도보'}
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    {b.appliedPromo ? (
                      <span className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-purple-100 text-purple-800">
                        {b.appliedPromo === 'longstay_15' ? '연박15%' : b.appliedPromo === 'longstay_10' ? '연박10%' : b.appliedPromo}
                      </span>
                    ) : <span className="text-slate-400">-</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                    {b.agreedAt ? formatDateTime(b.agreedAt) : '-'}
                  </td>
                  <td className="px-4 py-3 max-w-[200px] truncate text-slate-600" title={b.formData.specialRequests || ''}>
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
