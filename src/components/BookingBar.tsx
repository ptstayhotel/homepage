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
        <div className="relative z-40 w-full bg-[#111111]/95 backdrop-blur-sm text-white border-b border-neutral-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-5 md:py-8">
                <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-end">

                    {/* Check-In — value wrapper 높이 통일 */}
                    <div className="w-full md:flex-1 group">
                        <label className="block text-xs tracking-[0.25em] text-neutral-400 mb-2 group-hover:text-neutral-200 transition-colors font-medium">
                            {labels.checkIn}
                        </label>
                        <div className="md:min-h-[68px] md:flex md:flex-col md:justify-end">
                            <DatePickerInput
                                value={checkIn}
                                onChange={handleCheckInChange}
                                minDate={getTodayString()}
                                locale={locale}
                                theme="dark"
                            />
                        </div>
                    </div>

                    {/* Check-Out */}
                    <div className="w-full md:flex-1 group">
                        <label className="block text-xs tracking-[0.25em] text-neutral-400 mb-2 group-hover:text-neutral-200 transition-colors font-medium">
                            {labels.checkOut}
                        </label>
                        <div className="md:min-h-[68px] md:flex md:flex-col md:justify-end">
                            <DatePickerInput
                                value={checkOut}
                                onChange={setCheckOut}
                                minDate={checkIn || getTodayString()}
                                locale={locale}
                                theme="dark"
                            />
                        </div>
                    </div>

                    {/* Guests — DatePicker와 동일 높이 wrapper */}
                    <div className="w-full md:w-36 group">
                        <label className="block text-xs tracking-[0.25em] text-neutral-400 mb-2 group-hover:text-neutral-200 transition-colors font-medium">
                            {labels.guests}
                        </label>
                        <div className="md:min-h-[68px] md:flex md:flex-col md:justify-end">
                            <DropdownSelect
                                value={guests}
                                onChange={setGuests}
                                options={[1, 2, 3, 4].map(n => ({ value: String(n), label: `${n}${{ ko: '명', en: '', ja: '名', zh: '位' }[locale]}` }))}
                                theme="dark"
                            />
                        </div>
                    </div>

                    {/* Reservation Type — DatePicker와 동일 높이 wrapper */}
                    <div className="w-full md:w-44 group">
                        <label className="block text-xs tracking-[0.25em] text-neutral-400 mb-2 group-hover:text-neutral-200 transition-colors font-medium">
                            {labels.type}
                        </label>
                        <div className="md:min-h-[68px] md:flex md:flex-col md:justify-end">
                            <DropdownSelect
                                value={reservationType}
                                onChange={(val) => setReservationType(val as ReservationType)}
                                options={typeOptions.map(opt => ({ value: opt.value, label: opt.label[locale] }))}
                                theme="dark"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleBooking}
                        className="w-full md:w-auto h-[56px] px-8 md:px-12 bg-accent-500 text-primary-900 font-body text-sm tracking-[0.2em] font-bold uppercase hover:bg-white transition-all duration-300 mt-1 md:mt-0"
                    >
                        {buttonLabel[locale]}
                    </button>
                </div>
            </div>
        </div>
    );
}
