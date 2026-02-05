'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Locale, ReservationType } from '@/types';
import { getTodayString, getTomorrowString } from '@/lib/utils';
import DatePickerInput from './DatePickerInput';
import DropdownSelect from './DropdownSelect';

interface BookingBarProps {
    locale: Locale;
}

export default function BookingBar({ locale }: BookingBarProps) {
    const router = useRouter();

    const [checkIn, setCheckIn] = useState(getTodayString());
    const [checkOut, setCheckOut] = useState(getTomorrowString());
    const [guests, setGuests] = useState('2');
    const [reservationType, setReservationType] = useState<ReservationType>('general');

    const labels = {
        checkIn: 'CHECK-IN',
        checkOut: 'CHECK-OUT',
        guests: 'GUESTS',
        type: 'TYPE',
    };

    const typeOptions: { value: ReservationType; label: Record<Locale, string> }[] = [
        { value: 'general', label: { ko: '일반', en: 'GENERAL', ja: '一般', zh: '普通' } },
        { value: 'corporate', label: { ko: '기업체', en: 'CORPORATE', ja: '法人', zh: '企业' } },
        { value: 'military', label: { ko: '군인', en: 'MILITARY', ja: '軍人', zh: '军人' } },
    ];

    const buttonLabel: Record<Locale, string> = {
        ko: '예약하기',
        en: 'BOOK NOW',
        ja: '予約する',
        zh: '立即预订',
    };

    const handleCheckInChange = (date: string) => {
        setCheckIn(date);
        if (checkOut <= date) {
            const nextDay = new Date(date + 'T00:00:00');
            nextDay.setDate(nextDay.getDate() + 1);
            const y = nextDay.getFullYear();
            const m = String(nextDay.getMonth() + 1).padStart(2, '0');
            const d = String(nextDay.getDate()).padStart(2, '0');
            setCheckOut(`${y}-${m}-${d}`);
        }
    };

    const handleBooking = () => {
        const params = new URLSearchParams({
            checkIn,
            checkOut,
            guestCount: guests,
            reservationType,
            step: 'room',
        });
        router.push(`/${locale}/booking?${params.toString()}`);
    };

    return (
        <div className="w-full bg-[#111111] text-white border-b border-neutral-800">
            <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
                <div className="flex flex-col md:flex-row gap-8 items-end">

                    {/* Check-In */}
                    <div className="w-full md:flex-1 group">
                        <label className="block text-[10px] tracking-[0.25em] text-neutral-500 mb-3 group-hover:text-neutral-300 transition-colors">
                            {labels.checkIn}
                        </label>
                        <DatePickerInput
                            value={checkIn}
                            onChange={handleCheckInChange}
                            minDate={getTodayString()}
                            locale={locale}
                            theme="dark"
                        />
                    </div>

                    {/* Check-Out */}
                    <div className="w-full md:flex-1 group">
                        <label className="block text-[10px] tracking-[0.25em] text-neutral-500 mb-3 group-hover:text-neutral-300 transition-colors">
                            {labels.checkOut}
                        </label>
                        <DatePickerInput
                            value={checkOut}
                            onChange={setCheckOut}
                            minDate={checkIn || getTodayString()}
                            locale={locale}
                            theme="dark"
                        />
                    </div>

                    {/* Guests */}
                    <div className="w-full md:w-32 group">
                        <label className="block text-[10px] tracking-[0.25em] text-neutral-500 mb-3 group-hover:text-neutral-300 transition-colors">
                            {labels.guests}
                        </label>
                        <DropdownSelect
                            value={guests}
                            onChange={setGuests}
                            options={[1, 2, 3, 4, 5, 6].map(n => ({ value: String(n), label: String(n) }))}
                            theme="dark"
                        />
                    </div>

                    {/* Reservation Type */}
                    <div className="w-full md:w-40 group">
                        <label className="block text-[10px] tracking-[0.25em] text-neutral-500 mb-3 group-hover:text-neutral-300 transition-colors">
                            {labels.type}
                        </label>
                        <DropdownSelect
                            value={reservationType}
                            onChange={(val) => setReservationType(val as ReservationType)}
                            options={typeOptions.map(opt => ({ value: opt.value, label: opt.label[locale] }))}
                            theme="dark"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleBooking}
                        className="w-full md:w-auto h-[54px] px-10 bg-white text-black font-body text-xs tracking-[0.3em] font-medium uppercase hover:bg-neutral-200 transition-all duration-300"
                    >
                        {buttonLabel[locale]}
                    </button>
                </div>
            </div>
        </div>
    );
}
