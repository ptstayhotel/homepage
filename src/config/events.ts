export type TabType = 'all' | 'room' | 'event';

export interface Offer {
    id: number;
    type: TabType;
    image: string;
    title: { ko: string; en: string; ja: string; zh: string };
    subtitle: { ko: string; en: string; ja: string; zh: string };
    desc: { ko: string; en: string; ja: string; zh: string };
    period: { ko: string; en: string; ja: string; zh: string };
    details: { ko: string[]; en: string[]; ja: string[]; zh: string[] };
}

export const offers: Offer[] = [
    {
        id: 1,
        type: 'room',
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800&auto=format&fit=crop',
        title: { ko: '얼리버드 스페셜', en: 'Early Bird Special', ja: 'アーリーバードスペシャル', zh: '早鸟特惠' },
        subtitle: { ko: '최대 30% 할인', en: 'Up to 30% OFF', ja: '最大30%OFF', zh: '最高30%折扣' },
        desc: { ko: '14일 전 예약 시 특별 할인', en: 'Book 14 days in advance', ja: '14日前のご予約で特別割引', zh: '提前14天预订享特别优惠' },
        period: { ko: '상시 운영', en: 'Always Available', ja: '常時開催', zh: '常年有效' },
        details: {
            ko: [
                '체크인 14일 전까지 예약 시 적용됩니다.',
                '할인율은 객실 유형 및 시즌에 따라 달라질 수 있습니다.',
                '다른 프로모션과 중복 적용이 불가합니다.',
                '예약 후 변경 및 취소 시 할인이 취소될 수 있습니다.',
                '성수기(공휴일, 연말연시) 기간에는 적용이 제한될 수 있습니다.',
            ],
            en: [
                'Must be booked at least 14 days before check-in.',
                'Discount rates may vary by room type and season.',
                'Cannot be combined with other promotions.',
                'Discount may be revoked upon modification or cancellation.',
                'Restrictions may apply during peak seasons (holidays, year-end).',
            ],
            ja: [
                'チェックイン14日前までのご予約に適用されます。',
                '割引率は客室タイプおよびシーズンにより異なります。',
                '他のプロモーションとの併用はできません。',
                '予約変更・キャンセル時は割引が取り消される場合があります。',
                '繁忙期（祝日、年末年始）は適用が制限される場合があります。',
            ],
            zh: [
                '须在入住前14天预订方可享受优惠。',
                '折扣率根据房型和季节可能有所不同。',
                '不可与其他促销活动同时使用。',
                '修改或取消预订时，折扣可能被取消。',
                '旺季（节假日、年末年初）期间可能有限制。',
            ],
        },
    },
    {
        id: 2,
        type: 'room',
        image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800&auto=format&fit=crop',
        title: { ko: '로맨틱 스테이', en: 'Romantic Stay', ja: 'ロマンティックステイ', zh: '浪漫之旅' },
        subtitle: { ko: '커플 패키지', en: 'Couple Package', ja: 'カップルパッケージ', zh: '情侣套餐' },
        desc: { ko: '와인 & 조식 포함', en: 'Includes wine & breakfast', ja: 'ワイン＆朝食付き', zh: '含红酒和早餐' },
        period: { ko: '상시 운영', en: 'Always Available', ja: '常時開催', zh: '常年有效' },
        details: {
            ko: [
                '2인 기준 패키지이며, 추가 인원 시 별도 요금이 발생합니다.',
                '와인 1병과 2인 조식이 포함됩니다.',
                '체크인 시 프론트에서 와인을 수령하실 수 있습니다.',
                '조식은 체크인 다음 날 이용 가능합니다.',
                '다른 프로모션과 중복 적용이 불가합니다.',
            ],
            en: [
                'Package is based on 2 guests; additional guests incur extra charges.',
                'Includes 1 bottle of wine and breakfast for 2.',
                'Wine can be collected at the front desk upon check-in.',
                'Breakfast is available the morning after check-in.',
                'Cannot be combined with other promotions.',
            ],
            ja: [
                '2名様基準のパッケージです。追加人数には別途料金がかかります。',
                'ワイン1本と2名様分の朝食が含まれます。',
                'チェックイン時にフロントでワインをお受け取りいただけます。',
                '朝食はチェックイン翌日にご利用いただけます。',
                '他のプロモーションとの併用はできません。',
            ],
            zh: [
                '套餐以2人为基准，额外人员需另行收费。',
                '包含1瓶红酒和2人早餐。',
                '入住时可在前台领取红酒。',
                '早餐于入住次日提供。',
                '不可与其他促销活动同时使用。',
            ],
        },
    },
    {
        id: 4,
        type: 'event',
        image: 'https://images.unsplash.com/photo-1521791055366-0d553872125f?q=80&w=800&auto=format&fit=crop',
        title: { ko: '밀리터리 스페셜', en: 'Military Special', ja: 'ミリタリースペシャル', zh: '军人特惠' },
        subtitle: { ko: 'US Military 전용 특별 혜택', en: 'Exclusive US Military Benefits', ja: '米軍専用特別特典', zh: '美军专属优惠' },
        desc: { ko: '미군 ID카드 제시 시 스페셜 요금 & 스페셜 기프트 제공', en: 'Show your US Military ID for special rates & a special gift', ja: '米軍IDカード提示でスペシャル料金＆スペシャルギフト', zh: '出示美军ID卡享特别价格及特别礼物' },
        period: { ko: '상시 운영', en: 'Always Available', ja: '常時開催', zh: '常年有効' },
        details: {
            ko: [
                '체크인 시 유효한 미군 ID카드(CAC 또는 군인 신분증)를 반드시 제시해야 합니다.',
                '본인 및 동반 가족(배우자, 자녀)에게 적용됩니다.',
                '스페셜 요금은 객실 유형에 따라 상이합니다.',
                '스페셜 기프트는 체크인 시 객실에서 제공됩니다.',
                '다른 할인 및 프로모션과 중복 적용이 불가합니다.',
                '사전 예약 시 예약 유형을 "군인"으로 선택해 주세요.',
                '퇴역 군인(Veteran) ID도 적용 가능합니다.',
            ],
            en: [
                'A valid US Military ID (CAC or Military ID) must be presented at check-in.',
                'Applies to the cardholder and accompanying family members (spouse, children).',
                'Special rates vary by room type.',
                'A special gift will be provided in your room upon check-in.',
                'Cannot be combined with other discounts or promotions.',
                'Please select "Military" as your reservation type when booking online.',
                'Veteran IDs are also accepted.',
            ],
            ja: [
                'チェックイン時に有効な米軍IDカード（CACまたは軍人身分証）の提示が必要です。',
                'ご本人および同伴のご家族（配偶者・お子様）に適用されます。',
                'スペシャル料金は客室タイプにより異なります。',
                'スペシャルギフトはチェックイン時にお部屋にご用意いたします。',
                '他の割引やプロモーションとの併用はできません。',
                'オンライン予約時は予約タイプを「軍人」に選択してください。',
                '退役軍人IDも適用可能です。',
            ],
            zh: [
                '入住时须出示有效的美军ID卡（CAC或军人身份证）。',
                '适用于持卡人及随行家属（配偶、子女）。',
                '特别价格根据房型有所不同。',
                '入住时将在房间内提供特别礼物。',
                '不可与其他折扣或促销活动同时使用。',
                '在线预订时请选择"军人"作为预订类型。',
                '退伍军人ID也可使用。',
            ],
        },
    },
    {
        id: 6,
        type: 'event',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop',
        title: { ko: '기업체 특별 요금', en: 'Corporate Special Rate', ja: '法人特別料金', zh: '企业特别价格' },
        subtitle: { ko: '기업 고객 전용 혜택', en: 'Exclusive Corporate Benefits', ja: '法人顧客専用特典', zh: '企业客户专属优惠' },
        desc: { ko: '기업체 고객 대상 스페셜 요금 및 우대 서비스 제공', en: 'Special rates & premium services for corporate clients', ja: '法人顧客向けスペシャル料金＆優待サービス', zh: '企业客户专享特别价格及优质服务' },
        period: { ko: '상시 운영', en: 'Always Available', ja: '常時開催', zh: '常年有效' },
        details: {
            ko: [
                '사업자등록증 또는 재직증명서를 체크인 시 제시해야 합니다.',
                '기업체 특별 요금은 객실 유형 및 계약 조건에 따라 상이합니다.',
                '정기 이용 기업체의 경우 별도 협약을 통해 추가 할인이 가능합니다.',
                '세금계산서 발행이 가능합니다.',
                '다른 프로모션과 중복 적용이 불가합니다.',
                '사전 예약 시 예약 유형을 "기업체"로 선택해 주세요.',
                '문의: 프론트 데스크 또는 영업팀으로 연락 바랍니다.',
            ],
            en: [
                'Business registration or employment certificate must be presented at check-in.',
                'Corporate rates vary by room type and contract terms.',
                'Additional discounts available for recurring corporate clients through separate agreements.',
                'Tax invoices can be issued upon request.',
                'Cannot be combined with other promotions.',
                'Please select "Corporate" as your reservation type when booking online.',
                'Contact: Please reach out to the front desk or sales team for inquiries.',
            ],
            ja: [
                'チェックイン時に事業者登録証または在職証明書の提示が必要です。',
                '法人特別料金は客室タイプおよび契約条件により異なります。',
                '定期利用の法人様は別途契約により追加割引が可能です。',
                '請求書の発行が可能です。',
                '他のプロモーションとの併用はできません。',
                'オンライン予約時は予約タイプを「法人」に選択してください。',
                'お問い合わせ：フロントデスクまたは営業チームまでご連絡ください。',
            ],
            zh: [
                '入住时须出示营业执照或在职证明。',
                '企业价格根据房型和合同条款有所不同。',
                '定期使用的企业客户可通过另行协议获得额外折扣。',
                '可开具税务发票。',
                '不可与其他促销活动同时使用。',
                '在线预订时请选择"企业"作为预订类型。',
                '咨询：请联系前台或销售团队。',
            ],
        },
    },
    {
        id: 5,
        type: 'room',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop',
        title: { ko: '비즈니스 패키지', en: 'Business Package', ja: 'ビジネスパッケージ', zh: '商务套餐' },
        subtitle: { ko: '출장객 특별 혜택', en: 'Business Traveler Benefits', ja: 'ビジネス旅行者特典', zh: '商旅特别优惠' },
        desc: { ko: '조식 & 라운지 이용', en: 'Breakfast & Lounge access', ja: '朝食＆ラウンジ利用', zh: '含早餐和休息室使用' },
        period: { ko: '상시 운영', en: 'Always Available', ja: '常時開催', zh: '常年有効' },
        details: {
            ko: [
                '1인 조식 뷔페가 포함됩니다.',
                '비즈니스 라운지 이용이 가능합니다 (운영시간: 07:00 - 22:00).',
                '무료 고속 Wi-Fi 및 비즈니스 센터 이용이 포함됩니다.',
                '레이트 체크아웃(14:00)이 가능합니다 (객실 상황에 따라).',
                '다른 프로모션과 중복 적용이 불가합니다.',
            ],
            en: [
                'Includes breakfast buffet for 1 guest.',
                'Access to the business lounge (operating hours: 7AM - 10PM).',
                'Complimentary high-speed Wi-Fi and business center access included.',
                'Late checkout (2PM) available subject to room availability.',
                'Cannot be combined with other promotions.',
            ],
            ja: [
                '1名様分の朝食ビュッフェが含まれます。',
                'ビジネスラウンジをご利用いただけます（営業時間：07:00〜22:00）。',
                '無料高速Wi-Fiおよびビジネスセンターのご利用が含まれます。',
                'レイトチェックアウト（14:00）が可能です（客室状況による）。',
                '他のプロモーションとの併用はできません。',
            ],
            zh: [
                '包含1人早餐自助。',
                '可使用商务休息室（营业时间：07:00 - 22:00）。',
                '包含免费高速Wi-Fi及商务中心使用。',
                '可延迟退房至14:00（视房间情况而定）。',
                '不可与其他促销活动同时使用。',
            ],
        },
    },
];
