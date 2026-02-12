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
        image: '/images/events/early-bird.jpg',
        title: { ko: '얼리버드 특가', en: 'Early Bird Deal', ja: 'アーリーバード特価', zh: '早鸟特价' },
        subtitle: { ko: '15% 할인', en: '15% OFF', ja: '15%OFF', zh: '15%折扣' },
        desc: { ko: '14일 전 예약 시 15% 할인 · 취소 불가 상품', en: '15% off when booked 14 days ahead · Non-refundable', ja: '14日前予約で15%OFF · キャンセル不可', zh: '提前14天预订享15%折扣 · 不可取消' },
        period: { ko: '상시 운영', en: 'Always Available', ja: '常時開催', zh: '常年有效' },
        details: {
            ko: [
                '체크인 14일 전까지 예약 시 객실 요금의 15%가 할인됩니다.',
                '본 상품은 취소 불가 상품입니다 (체크인 3일 전부터 취소·변경 불가).',
                '할인율은 객실 유형에 관계없이 동일하게 적용됩니다.',
                '다른 프로모션 및 할인과 중복 적용이 불가합니다.',
                '성수기(공휴일, 연말연시) 기간에는 적용이 제한될 수 있습니다.',
                '결제는 예약 시 선결제로 진행됩니다.',
            ],
            en: [
                '15% discount on room rates when booked at least 14 days before check-in.',
                'This is a non-refundable rate (no cancellation or modification within 3 days of check-in).',
                'Discount applies equally regardless of room type.',
                'Cannot be combined with other promotions or discounts.',
                'Restrictions may apply during peak seasons (holidays, year-end).',
                'Full prepayment is required at the time of booking.',
            ],
            ja: [
                'チェックイン14日前までのご予約で客室料金が15%割引になります。',
                '本商品はキャンセル不可です（チェックイン3日前からキャンセル・変更不可）。',
                '割引率は客室タイプに関係なく一律適用されます。',
                '他のプロモーションや割引との併用はできません。',
                '繁忙期（祝日、年末年始）は適用が制限される場合があります。',
                'ご予約時に事前決済となります。',
            ],
            zh: [
                '入住前14天预订可享客房价格15%折扣。',
                '本产品不可取消（入住前3天起不可取消或修改）。',
                '折扣率不分房型统一适用。',
                '不可与其他促销或折扣同时使用。',
                '旺季（节假日、年末年初）期间可能有限制。',
                '预订时需全额预付。',
            ],
        },
    },
    {
        id: 2,
        type: 'event',
        image: '/images/events/공용혜택.png',
        title: { ko: '홈페이지 예약 특전', en: 'Online Booking Benefits', ja: 'ホームページ予約特典', zh: '官网预订专享' },
        subtitle: { ko: '모든 예약자 공용 혜택', en: 'Benefits for All Guests', ja: '全予約者共通特典', zh: '所有预订者共享优惠' },
        desc: { ko: '라운지 무료 이용 · 회의실 대관 할인 · 라운지 커피&홍차 무료', en: 'Free lounge access · Meeting room discount · Complimentary coffee & tea at lounge', ja: 'ラウンジ無料利用 · 会議室割引 · ラウンジでコーヒー＆紅茶無料', zh: '免费使用休息室 · 会议室折扣 · 休息室免费咖啡和红茶' },
        period: { ko: '상시 운영', en: 'Always Available', ja: '常時開催', zh: '常年有效' },
        details: {
            ko: [
                '본 홈페이지를 통해 직접 예약하신 모든 고객에게 적용되는 혜택입니다.',
                '투숙 기간 동안 라운지를 무료로 이용하실 수 있습니다.',
                '회의실 대관 시 할인이 적용됩니다 (자세한 요금은 프론트 문의).',
                '라운지에서 커피와 아마드티(홍차)를 자유롭게 무료로 즐기실 수 있습니다 (체크인~체크아웃).',
                '다른 프로모션(얼리버드, 비즈니스 패키지 등)과 중복 적용이 가능합니다.',
                'OTA(야놀자, 여기어때 등) 예약은 적용 대상이 아닙니다.',
            ],
            en: [
                'These benefits apply to all guests who book directly through our website.',
                'Complimentary lounge access throughout your stay.',
                'Discounted meeting room rental (contact the front desk for rates).',
                'Coffee and Ahmad Tea (black tea) are freely available at the lounge at no charge (from check-in to check-out).',
                'Can be combined with other promotions (Early Bird, Business Package, etc.).',
                'Bookings through OTAs (third-party platforms) are not eligible.',
            ],
            ja: [
                '本ホームページから直接ご予約いただいたすべてのお客様に適用される特典です。',
                'ご滞在中、ラウンジを無料でご利用いただけます。',
                '会議室レンタル時に割引が適用されます（料金の詳細はフロントへお問い合わせください）。',
                'ラウンジでコーヒーとアーマッドティー(紅茶)を自由に無料でお楽しみいただけます（チェックイン～チェックアウト）。',
                '他のプロモーション（アーリーバード、ビジネスパッケージなど）との併用が可能です。',
                'OTA（第三者プラットフォーム）経由のご予約は対象外です。',
            ],
            zh: [
                '此优惠适用于通过本官网直接预订的所有客人。',
                '住宿期间可免费使用休息室。',
                '会议室租用享受折扣（详细价格请咨询前台）。',
                '休息室免费提供咖啡和Ahmad红茶，可自由享用（从入住到退房）。',
                '可与其他促销活动（早鸟特价、商务套餐等）同时使用。',
                '通过OTA（第三方平台）预订不适用。',
            ],
        },
    },
    {
        id: 4,
        type: 'event',
        image: '/images/events/미군 이미지.png',
        title: { ko: '밀리터리 스페셜', en: 'Military Special', ja: 'ミリタリースペシャル', zh: '军人特惠' },
        subtitle: { ko: 'US Military 전용 혜택', en: 'Exclusive for US Military', ja: '米軍専用特典', zh: '美军专属优惠' },
        desc: { ko: '미군 ID카드 제시 시 특별 할인 & 선물 제공 · 자세한 내용은 문의', en: 'Special discount & gift with US Military ID · Contact us for details', ja: '米軍ID提示で特別割引＆ギフト · 詳細はお問い合わせ', zh: '出示美军ID享特别折扣及礼物 · 详情请咨询' },
        period: { ko: '상시 운영', en: 'Always Available', ja: '常時開催', zh: '常年有効' },
        details: {
            ko: [
                '체크인 시 유효한 미군 ID카드(CAC 또는 군인 신분증)를 제시해 주세요.',
                '본인 및 동반 가족(배우자, 자녀)에게 적용됩니다.',
                '할인율 및 혜택 내용은 객실 유형과 투숙 조건에 따라 달라지며, 전화 또는 메신저로 문의해 주시면 상세히 안내드립니다.',
                '체크인 시 스페셜 기프트를 제공해 드립니다.',
                '퇴역 군인(Veteran) ID도 적용 가능합니다.',
                '사전 예약 시 예약 유형을 "군인"으로 선택해 주세요.',
                '다른 할인 및 프로모션과 중복 적용이 불가합니다.',
            ],
            en: [
                'Please present a valid US Military ID (CAC or Military ID) at check-in.',
                'Applies to the cardholder and accompanying family members (spouse, children).',
                'Discount rates and benefits vary by room type and stay conditions. Please contact us by phone or messenger for detailed information.',
                'A special gift will be provided upon check-in.',
                'Veteran IDs are also accepted.',
                'Please select "Military" as your reservation type when booking online.',
                'Cannot be combined with other discounts or promotions.',
            ],
            ja: [
                'チェックイン時に有効な米軍IDカード（CACまたは軍人身分証）をご提示ください。',
                'ご本人および同伴のご家族（配偶者・お子様）に適用されます。',
                '割引率や特典内容は客室タイプや宿泊条件により異なります。お電話またはメッセンジャーでお問い合わせいただければ詳しくご案内いたします。',
                'チェックイン時にスペシャルギフトをご用意いたします。',
                '退役軍人IDも適用可能です。',
                'オンライン予約時は予約タイプを「軍人」に選択してください。',
                '他の割引やプロモーションとの併用はできません。',
            ],
            zh: [
                '入住时请出示有效的美军ID卡（CAC或军人身份证）。',
                '适用于持卡人及随行家属（配偶、子女）。',
                '折扣率和优惠内容因房型和住宿条件而异，请通过电话或即时通讯联系我们获取详细信息。',
                '入住时将提供特别礼物。',
                '退伍军人ID也可使用。',
                '在线预订时请选择"军人"作为预订类型。',
                '不可与其他折扣或促销活动同时使用。',
            ],
        },
    },
    {
        id: 5,
        type: 'event',
        image: '/images/events/기업체 이미지.png',
        title: { ko: '기업체 특별 혜택', en: 'Corporate Benefits', ja: '法人特別特典', zh: '企业专属优惠' },
        subtitle: { ko: '기업 고객 맞춤 할인', en: 'Tailored Corporate Rates', ja: '法人向けカスタム割引', zh: '企业定制优惠' },
        desc: { ko: '기업 고객 대상 할인 및 우대 서비스 · 문의를 통해 맞춤 견적 제공', en: 'Custom rates & premium services for corporate clients · Contact us for a quote', ja: '法人顧客向け割引＆優待 · お問い合わせで見積もり提供', zh: '企业客户折扣及优质服务 · 联系我们获取报价' },
        period: { ko: '상시 운영', en: 'Always Available', ja: '常時開催', zh: '常年有效' },
        details: {
            ko: [
                '체크인 시 명함을 제출해 주세요.',
                '정기 이용 기업체의 경우 별도 협약을 통해 추가 혜택을 제공해 드립니다.',
                '세금계산서 발행이 가능합니다.',
                '자세한 요금 및 조건은 전화 또는 메신저로 문의해 주세요.',
                '사전 예약 시 예약 유형을 "기업체"로 선택해 주세요.',
                '다른 프로모션과 중복 적용이 불가합니다.',
            ],
            en: [
                'Please present your business card at check-in.',
                'Recurring corporate clients may receive additional benefits through a separate agreement.',
                'Tax invoices can be issued upon request.',
                'Please contact us by phone or messenger for detailed rates and conditions.',
                'Please select "Corporate" as your reservation type when booking online.',
                'Cannot be combined with other promotions.',
            ],
            ja: [
                'チェックイン時に名刺をご提出ください。',
                '定期ご利用の法人様には別途契約による追加特典をご提供いたします。',
                '請求書の発行が可能です。',
                '詳しい料金・条件はお電話またはメッセンジャーでお問い合わせください。',
                'オンライン予約時は予約タイプを「法人」に選択してください。',
                '他のプロモーションとの併用はできません。',
            ],
            zh: [
                '入住时请出示名片。',
                '定期使用的企业客户可通过另行协议获得额外优惠。',
                '可开具税务发票。',
                '详细价格及条件请通过电话或即时通讯联系我们。',
                '在线预订时请选择"企业"作为预订类型。',
                '不可与其他促销活动同时使用。',
            ],
        },
    },
];
