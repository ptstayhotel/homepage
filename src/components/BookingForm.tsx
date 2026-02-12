'use client';

/**
 * Booking Form Component - Seoul Dragon City Style
 *
 * Elegant multi-step booking form with premium styling
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/lib/translations';
import { Locale, BookingFormData, ReservationType } from '@/types';
import { rooms, getRoomName, formatPrice, calculateRoomTotal } from '@/config/rooms';
import DatePickerInput from './DatePickerInput';
import DropdownSelect from './DropdownSelect';
import { getTodayString, getTomorrowString, calculateNights, formatCurrency } from '@/lib/utils';

interface BookingFormProps {
  locale: Locale;
  preselectedRoomId?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuestCount?: number;
  initialReservationType?: ReservationType;
  initialStep?: 'dates' | 'room';
}

type FormStep = 'dates' | 'room' | 'info' | 'confirm' | 'success';

const reservationTypeOptions: { value: ReservationType; label: Record<Locale, string> }[] = [
  { value: 'general', label: { ko: '일반', en: 'General', ja: '一般', zh: '普通' } },
  { value: 'corporate', label: { ko: '기업체', en: 'Corporate', ja: '法人', zh: '企业' } },
  { value: 'military', label: { ko: '군인', en: 'Military', ja: '軍人', zh: '军人' } },
];

export default function BookingForm({ locale, preselectedRoomId, initialCheckIn, initialCheckOut, initialGuestCount, initialReservationType, initialStep }: BookingFormProps) {
  const t = useTranslations('booking');
  const tErrors = useTranslations('errors');
  const router = useRouter();

  // Form state
  const [step, setStep] = useState<FormStep>(initialStep || 'dates');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Form data
  const [formData, setFormData] = useState<BookingFormData>({
    roomId: preselectedRoomId || '',
    checkIn: initialCheckIn || getTodayString(),
    checkOut: initialCheckOut || getTomorrowString(),
    guestCount: initialGuestCount || 2,
    reservationType: initialReservationType || 'general',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    specialRequests: '',
  });

  // If preselected room, skip to info step
  useEffect(() => {
    if (preselectedRoomId) {
      setStep('dates');
    }
  }, [preselectedRoomId]);

  // Get selected room
  const selectedRoom = rooms.find((r) => r.id === formData.roomId);

  // Calculate total price (day-by-day for Fri/Sat rates)
  const nights = calculateNights(formData.checkIn, formData.checkOut);
  const totalPrice = selectedRoom ? calculateRoomTotal(selectedRoom, formData.checkIn, formData.checkOut) : 0;

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  // Validate current step
  const validateStep = (): boolean => {
    switch (step) {
      case 'dates':
        if (!formData.checkIn || !formData.checkOut) {
          setError(tErrors('invalidDates'));
          return false;
        }
        if (new Date(formData.checkOut) <= new Date(formData.checkIn)) {
          setError(tErrors('invalidDates'));
          return false;
        }
        return true;

      case 'room':
        if (!formData.roomId) {
          setError({ ko: '객실을 선택해주세요', en: 'Please select a room', ja: '客室を選択してください', zh: '请选择客房' }[locale] || 'Please select a room');
          return false;
        }
        return true;

      case 'info':
        if (!formData.guestName) {
          setError(tErrors('requiredField'));
          return false;
        }
        if (!formData.guestEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.guestEmail)) {
          setError(tErrors('invalidEmail'));
          return false;
        }
        if (!formData.guestPhone) {
          setError(tErrors('invalidPhone'));
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  // Navigate to next step
  const nextStep = () => {
    if (!validateStep()) return;

    switch (step) {
      case 'dates':
        setStep(formData.roomId ? 'info' : 'room');
        break;
      case 'room':
        setStep('info');
        break;
      case 'info':
        setStep('confirm');
        break;
    }
  };

  // Navigate to previous step
  const prevStep = () => {
    switch (step) {
      case 'room':
        setStep('dates');
        break;
      case 'info':
        setStep('room');
        break;
      case 'confirm':
        setStep('info');
        break;
    }
  };

  // Submit booking
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      // Call API to create booking
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setBookingId(result.bookingId || 'BK-' + Date.now().toString(36).toUpperCase());
        setStep('success');
      } else {
        setError(result.message || tErrors('bookingFailed'));
      }
    } catch {
      setError(tErrors('bookingFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step indicator
  const steps = [
    { key: 'dates', label: t('step1') },
    { key: 'room', label: t('step2') },
    { key: 'info', label: t('step3') },
    { key: 'confirm', label: t('step4') },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="bg-white overflow-hidden">
      {/* Step indicator */}
      {step !== 'success' && (
        <div className="border-b border-neutral-200 px-6 py-6">
          <div className="flex items-center justify-between max-w-xl mx-auto">
            {steps.map((s, index) => (
              <div key={s.key} className="flex items-center">
                <div
                  className={`w-10 h-10 flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    index <= currentStepIndex
                      ? 'bg-primary-900 text-white'
                      : 'bg-neutral-100 text-neutral-400'
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`ml-3 text-xs tracking-widest uppercase hidden sm:block transition-colors ${
                    index <= currentStepIndex ? 'text-primary-900' : 'text-neutral-400'
                  }`}
                >
                  {s.label}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 sm:w-12 h-px mx-3 transition-colors ${
                      index < currentStepIndex ? 'bg-primary-900' : 'bg-neutral-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form content */}
      <div className="p-4 sm:p-6 md:p-8 lg:p-12">
        {/* Error message */}
        {error && (
          <div className="mb-8 p-4 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Dates */}
        {step === 'dates' && (
          <div className="space-y-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-serif text-primary-900 tracking-wide">
                {t('step1')}
              </h2>
              <div className="w-12 h-px bg-accent-500 mx-auto mt-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="form-label">{t('checkIn')}</label>
                <DatePickerInput
                  value={formData.checkIn}
                  onChange={(date) => {
                    setFormData(prev => {
                      const updated = { ...prev, checkIn: date };
                      if (prev.checkOut <= date) {
                        const nextDay = new Date(date + 'T00:00:00');
                        nextDay.setDate(nextDay.getDate() + 1);
                        const y = nextDay.getFullYear();
                        const m = String(nextDay.getMonth() + 1).padStart(2, '0');
                        const d = String(nextDay.getDate()).padStart(2, '0');
                        updated.checkOut = `${y}-${m}-${d}`;
                      }
                      return updated;
                    });
                    setError('');
                  }}
                  minDate={getTodayString()}
                  locale={locale}
                  theme="light"
                />
              </div>

              <div>
                <label className="form-label">{t('checkOut')}</label>
                <DatePickerInput
                  value={formData.checkOut}
                  onChange={(date) => {
                    setFormData(prev => ({ ...prev, checkOut: date }));
                    setError('');
                  }}
                  minDate={formData.checkIn || getTodayString()}
                  locale={locale}
                  theme="light"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="form-label">{t('numberOfGuests')}</label>
                <DropdownSelect
                  value={String(formData.guestCount)}
                  onChange={(val) => {
                    setFormData(prev => ({ ...prev, guestCount: Number(val) }));
                    setError('');
                  }}
                  options={[1, 2, 3, 4, 5, 6].map((n) => ({
                    value: String(n),
                    label: `${n} ${{ ko: '명', en: n === 1 ? 'guest' : 'guests', ja: '名', zh: '位' }[locale]}`,
                  }))}
                  theme="light"
                />
              </div>

              <div>
                <label className="form-label">
                  {{ ko: '예약 유형', en: 'Reservation Type', ja: '予約タイプ', zh: '预订类型' }[locale]}
                </label>
                <DropdownSelect
                  value={formData.reservationType}
                  onChange={(val) => {
                    setFormData(prev => ({ ...prev, reservationType: val as ReservationType }));
                    setError('');
                  }}
                  options={reservationTypeOptions.map((opt) => ({
                    value: opt.value,
                    label: opt.label[locale],
                  }))}
                  theme="light"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Room selection */}
        {step === 'room' && (
          <div className="space-y-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-serif text-primary-900 tracking-wide">
                {t('selectRoom')}
              </h2>
              <div className="w-12 h-px bg-accent-500 mx-auto mt-4" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {rooms
                .filter((room) => room.maxGuests >= formData.guestCount)
                .map((room) => (
                  <label
                    key={room.id}
                    className={`flex items-center gap-3 p-3 sm:gap-4 sm:p-4 md:gap-6 md:p-6 cursor-pointer transition-all duration-300 ${
                      formData.roomId === room.id
                        ? 'bg-primary-900 text-white'
                        : 'bg-neutral-50 hover:bg-neutral-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="roomId"
                      value={room.id}
                      checked={formData.roomId === room.id}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 border flex items-center justify-center flex-shrink-0 transition-colors ${
                        formData.roomId === room.id
                          ? 'border-accent-500 bg-accent-500'
                          : 'border-neutral-300'
                      }`}
                    >
                      {formData.roomId === room.id && (
                        <svg className="w-3 h-3 text-primary-900" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-serif text-lg tracking-wide ${
                        formData.roomId === room.id ? 'text-white' : 'text-primary-900'
                      }`}>
                        {getRoomName(room, locale)}
                      </h3>
                      <p className={`text-sm mt-1 ${
                        formData.roomId === room.id ? 'text-white/70' : 'text-neutral-500'
                      }`}>
                        {room.maxGuests} {{ ko: '인', en: 'guests', ja: '名', zh: '位' }[locale]} · {room.size}m²
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`font-serif text-xl ${
                        formData.roomId === room.id ? 'text-accent-500' : 'text-primary-900'
                      }`}>
                        {formatPrice(room.pricePerNight, locale)}~
                      </span>
                      <span className={`text-sm block ${
                        formData.roomId === room.id ? 'text-white/70' : 'text-neutral-500'
                      }`}>
                        {{ ko: '/박', en: '/night', ja: '/泊', zh: '/晚' }[locale]}
                      </span>
                    </div>
                  </label>
                ))}
            </div>
          </div>
        )}

        {/* Step 3: Guest information */}
        {step === 'info' && (
          <div className="space-y-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-serif text-primary-900 tracking-wide">
                {t('guestInfo')}
              </h2>
              <div className="w-12 h-px bg-accent-500 mx-auto mt-4" />
            </div>

            <div>
              <label className="form-label">{t('guestName')} *</label>
              <input
                type="text"
                name="guestName"
                value={formData.guestName}
                onChange={handleChange}
                placeholder={t('guestNamePlaceholder')}
                className="w-full px-4 py-4 border-b border-neutral-300 text-sm focus:border-primary-900 focus:outline-none bg-transparent transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="form-label">{t('email')} *</label>
                <input
                  type="email"
                  name="guestEmail"
                  value={formData.guestEmail}
                  onChange={handleChange}
                  placeholder={t('emailPlaceholder')}
                  className="w-full px-4 py-4 border-b border-neutral-300 text-sm focus:border-primary-900 focus:outline-none bg-transparent transition-colors"
                  required
                />
              </div>

              <div>
                <label className="form-label">{t('phone')} *</label>
                <input
                  type="tel"
                  name="guestPhone"
                  value={formData.guestPhone}
                  onChange={handleChange}
                  placeholder={t('phonePlaceholder')}
                  className="w-full px-4 py-4 border-b border-neutral-300 text-sm focus:border-primary-900 focus:outline-none bg-transparent transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">{t('specialRequests')}</label>
              <textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleChange}
                placeholder={t('specialRequestsPlaceholder')}
                className="w-full px-4 py-4 border border-neutral-300 text-sm focus:border-primary-900 focus:outline-none bg-transparent transition-colors min-h-[120px] resize-none"
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 'confirm' && selectedRoom && (
          <div className="space-y-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-serif text-primary-900 tracking-wide">
                {t('bookingSummary')}
              </h2>
              <div className="w-12 h-px bg-accent-500 mx-auto mt-4" />
            </div>

            <div className="border border-neutral-200 divide-y divide-neutral-200">
              <div className="flex justify-between p-4">
                <span className="text-neutral-500 text-sm">{t('selectedRoom')}</span>
                <span className="font-medium text-primary-900">
                  {getRoomName(selectedRoom, locale)}
                </span>
              </div>
              <div className="flex justify-between p-4">
                <span className="text-neutral-500 text-sm">{t('stayDuration')}</span>
                <span className="font-medium text-primary-900">
                  {formData.checkIn} ~ {formData.checkOut} ({nights}{' '}
                  {{ ko: '박', en: nights === 1 ? 'night' : 'nights', ja: '泊', zh: '晚' }[locale]})
                </span>
              </div>
              <div className="flex justify-between p-4">
                <span className="text-neutral-500 text-sm">{t('numberOfGuests')}</span>
                <span className="font-medium text-primary-900">
                  {formData.guestCount} {{ ko: '명', en: 'guests', ja: '名', zh: '位' }[locale]}
                </span>
              </div>
              <div className="flex justify-between p-4">
                <span className="text-neutral-500 text-sm">
                  {{ ko: '예약 유형', en: 'Reservation Type', ja: '予約タイプ', zh: '预订类型' }[locale]}
                </span>
                <span className="font-medium text-primary-900">
                  {reservationTypeOptions.find(o => o.value === formData.reservationType)?.label[locale]}
                </span>
              </div>
              <div className="flex justify-between p-4">
                <span className="text-neutral-500 text-sm">{t('guestName')}</span>
                <span className="font-medium text-primary-900">{formData.guestName}</span>
              </div>
              <div className="flex justify-between p-4">
                <span className="text-neutral-500 text-sm">{t('email')}</span>
                <span className="font-medium text-primary-900">{formData.guestEmail}</span>
              </div>
              <div className="flex justify-between p-4">
                <span className="text-neutral-500 text-sm">{t('phone')}</span>
                <span className="font-medium text-primary-900">{formData.guestPhone}</span>
              </div>

              <div className="p-4 bg-neutral-50">
                <div className="flex justify-between mb-2">
                  <span className="text-neutral-500 text-sm">{t('roomRate')}</span>
                  <span className="font-medium text-primary-900">
                    {nights}{{ ko: '박', en: ' nights', ja: '泊', zh: '晚' }[locale]}
                    {' '}
                    <span className="text-neutral-400 text-xs">
                      ({{ ko: '요일별 요금 적용', en: 'Daily rates applied', ja: '曜日別料金適用', zh: '按日费率计算' }[locale]})
                    </span>
                  </span>
                </div>
                <div className="flex justify-between pt-4 border-t border-neutral-200">
                  <span className="font-medium text-primary-900">{t('total')}</span>
                  <span className="font-serif text-2xl text-accent-500">
                    {formatCurrency(totalPrice, locale)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-primary-50 border-l-2 border-primary-900">
              <p className="text-primary-900 text-sm">{t('paymentNote')}</p>
            </div>
          </div>
        )}

        {/* Success */}
        {step === 'success' && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-8 flex items-center justify-center text-accent-500">
              <svg
                className="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-serif text-primary-900 mb-4 tracking-wide">
              {t('bookingSuccess')}
            </h2>
            <p className="text-neutral-500 mb-8">{t('bookingSuccessMessage')}</p>
            <div className="inline-block border border-neutral-200 px-8 py-4 mb-10">
              <span className="text-xs text-neutral-500 tracking-widest uppercase block mb-1">{t('bookingId')}</span>
              <p className="text-xl font-mono font-bold text-primary-900">{bookingId}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push(`/${locale}`)}
                className="px-8 py-4 border border-primary-900 text-primary-900 text-sm tracking-widest uppercase transition-all duration-300 hover:bg-primary-900 hover:text-white"
              >
                {t('backToHome')}
              </button>
              <button
                onClick={() => {
                  setStep('dates');
                  setFormData({
                    roomId: '',
                    checkIn: getTodayString(),
                    checkOut: getTomorrowString(),
                    guestCount: 2,
                    reservationType: 'general',
                    guestName: '',
                    guestEmail: '',
                    guestPhone: '',
                    specialRequests: '',
                  });
                }}
                className="px-8 py-4 bg-primary-900 text-white text-sm tracking-widest uppercase transition-all duration-300 hover:bg-accent-500"
              >
                {t('makeAnotherBooking')}
              </button>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        {step !== 'success' && (
          <div className="flex justify-between mt-12 pt-8 border-t border-neutral-200">
            {step !== 'dates' ? (
              <button
                onClick={prevStep}
                className="px-8 py-4 border border-neutral-300 text-neutral-600 text-sm tracking-widest uppercase transition-all duration-300 hover:border-primary-900 hover:text-primary-900"
              >
                {{ ko: '이전', en: 'Back', ja: '戻る', zh: '返回' }[locale]}
              </button>
            ) : (
              <div />
            )}

            {step === 'confirm' ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-10 py-4 bg-accent-500 text-primary-900 text-sm tracking-widest uppercase transition-all duration-300 hover:bg-primary-900 hover:text-white disabled:opacity-50"
              >
                {isSubmitting
                  ? ({ ko: '처리 중...', en: 'Processing...', ja: '処理中...', zh: '处理中...' }[locale])
                  : t('confirmBooking')}
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="px-10 py-4 bg-primary-900 text-white text-sm tracking-widest uppercase transition-all duration-300 hover:bg-accent-500"
              >
                {{ ko: '다음', en: 'Next', ja: '次へ', zh: '下一步' }[locale]}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
