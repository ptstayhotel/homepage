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
  token: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  agreedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  cancelledBy?: 'hotel' | 'customer' | 'admin';
  appliedPromo?: string | null;
  finalAmount?: number | null;
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

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'cancelled';

const ROOM_LABELS: Record<string, string> = {
  standard: '스탠다드',
  'standard-premium': '스탠다드 프리미엄',
  deluxe: '디럭스',
  'family-twin': '패밀리 트윈',
  'family-triple': '패밀리 트리플',
  'royal-suite': '로얄 스위트',
  'party-suite': '파티 스위트',
};

// Base prices (Sun–Thu) for fallback when finalAmount is missing (legacy data)
const ROOM_BASE_PRICES: Record<string, number> = {
  standard: 70000,
  'standard-premium': 80000,
  deluxe: 90000,
  'family-twin': 90000,
  'family-triple': 120000,
  'royal-suite': 140000,
  'party-suite': 170000,
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

function calculateNights(checkIn: string, checkOut: string): number {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Smart currency display:
 * - military_fixed → "$64 × N nights" (USD)
 * - KRW finalAmount → "63,000원"
 * - Missing finalAmount (legacy) → fallback to base price estimate
 */
function formatDisplayPrice(b: BookingRecord): { text: string; isFallback: boolean } {
  // Military fixed rate: always USD
  if (b.appliedPromo === 'military_fixed') {
    const nights = calculateNights(b.formData.checkIn, b.formData.checkOut);
    return { text: `$${64 * nights}`, isFallback: false };
  }
  // Has finalAmount from frontend → KRW with comma
  if (b.finalAmount != null && b.finalAmount > 0) {
    return { text: `${b.finalAmount.toLocaleString()}원`, isFallback: false };
  }
  // Fallback for legacy data: estimate from base price
  const basePrice = ROOM_BASE_PRICES[b.formData.roomId];
  if (basePrice) {
    const nights = calculateNights(b.formData.checkIn, b.formData.checkOut);
    return { text: `${(basePrice * nights).toLocaleString()}원`, isFallback: true };
  }
  return { text: '-', isFallback: false };
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [cancellingToken, setCancellingToken] = useState<string | null>(null);

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

  const handleCancel = async (token: string, bookingId: string) => {
    if (!confirm(`예약 ${bookingId}을(를) 취소하시겠습니까?\n취소 시 고객에게 취소 메일이 발송됩니다.`)) return;

    setCancellingToken(token);
    try {
      const res = await fetch('/api/booking-cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': password,
        },
        body: JSON.stringify({ token, cancelledBy: 'admin' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(`취소 실패: ${data.error || '알 수 없는 오류'}`);
        return;
      }
      if (data.alreadyCancelled) {
        alert('이미 취소된 예약입니다.');
      } else {
        alert(`예약 ${bookingId} 취소 완료`);
      }
      fetchBookings(password);
    } catch {
      alert('서버 연결 실패');
    } finally {
      setCancellingToken(null);
    }
  };

  const filteredBookings = statusFilter === 'all'
    ? bookings
    : bookings.filter(b => b.status === statusFilter);

  const statusCounts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
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

      {/* 상태 필터 */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl px-6 py-3 mt-3 flex items-center gap-2 flex-wrap">
        {([
          { key: 'all' as StatusFilter, label: '전체', color: 'slate' },
          { key: 'pending' as StatusFilter, label: '대기', color: 'amber' },
          { key: 'confirmed' as StatusFilter, label: '확정', color: 'green' },
          { key: 'cancelled' as StatusFilter, label: '취소', color: 'red' },
        ]).map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              statusFilter === key
                ? color === 'slate' ? 'bg-slate-900 text-white'
                : color === 'amber' ? 'bg-amber-500 text-white'
                : color === 'green' ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {label} ({statusCounts[key]})
          </button>
        ))}
      </div>

      {/* Table Container */}
      <div className="mt-5 overflow-x-auto bg-white shadow-sm rounded-xl border border-slate-200">
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            {statusFilter === 'all' ? '예약 내역이 없습니다.' : `${statusFilter === 'pending' ? '대기' : statusFilter === 'confirmed' ? '확정' : '취소'} 상태의 예약이 없습니다.`}
          </div>
        ) : (
          <table className="w-full text-xs border-collapse min-w-[1400px]">
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
                <th className="px-4 py-3 font-medium whitespace-nowrap">결제예정금액</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">프로모션</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">정책동의</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">취소일시</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">요청사항</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">액션</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b, idx) => (
                <tr key={b.bookingId} className={`border-b border-slate-100 hover:bg-blue-50/40 transition-colors ${
                  b.status === 'cancelled' ? 'opacity-60' : ''
                } ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                      b.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : b.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {b.status === 'confirmed' ? '확정' : b.status === 'cancelled' ? '취소' : '대기'}
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
                  <td className="px-4 py-3 whitespace-nowrap text-right font-medium">
                    {(() => {
                      const { text, isFallback } = formatDisplayPrice(b);
                      if (text === '-') return <span className="text-slate-400">-</span>;
                      if (b.appliedPromo === 'military_fixed') return <span className="text-blue-700 font-bold">{text}</span>;
                      if (isFallback) return <span className="text-slate-400" title="finalAmount 미저장 (추정치)">{text} <span className="text-[10px]">(추정)</span></span>;
                      return <span className="text-slate-700">{text}</span>;
                    })()}
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    {b.appliedPromo ? (
                      <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                        b.appliedPromo === 'military_fixed' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {b.appliedPromo === 'military_fixed' ? 'Military $64' : b.appliedPromo === 'longstay_15' ? '연박15%' : b.appliedPromo === 'longstay_10' ? '연박10%' : b.appliedPromo}
                      </span>
                    ) : <span className="text-slate-400">-</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                    {b.agreedAt ? formatDateTime(b.agreedAt) : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                    {b.cancelledAt ? (
                      <span className="text-red-600">{formatDateTime(b.cancelledAt)}</span>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3 max-w-[200px] truncate text-slate-600" title={b.formData.specialRequests || ''}>
                    {b.formData.specialRequests || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {b.status !== 'cancelled' ? (
                      <button
                        onClick={() => handleCancel(b.token, b.bookingId)}
                        disabled={cancellingToken === b.token}
                        className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-red-300 text-red-600 bg-white hover:bg-red-50 hover:border-red-400 transition-colors disabled:opacity-50"
                      >
                        {cancellingToken === b.token ? '처리중...' : '취소'}
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400">-</span>
                    )}
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
