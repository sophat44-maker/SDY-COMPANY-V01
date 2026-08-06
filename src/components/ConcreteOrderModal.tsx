import React, { useState } from 'react';
import { X, Send, ShoppingBag, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Sparkles, Phone, MapPin, Calendar, MessageSquare, Layers, Ruler, Globe } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { submitProductOrder, openTelegramOrderChat, ProductOrder } from '../services/concreteOrderService';

interface ConcreteOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProductTitle?: string;
}

const FORM_TRANSLATIONS = {
  km: {
    modalTitle: 'បញ្ជាទិញទ្វារ & គ្រឿងសង្ហារិម',
    badgeText: 'SDY DOORS, FURNITURE & JOINERY',
    customerName: 'ឈ្មោះអតិថិជន',
    customerNamePlaceholder: 'ឧទាហរណ៍: លោក សុខ ជា',
    phone: 'លេខទូរស័ព្ទ',
    phonePlaceholder: '012 345 678',
    productName: 'ឈ្មោះផលិតផល',
    productNamePlaceholder: 'ឧទាហរណ៍: ទ្វារឈើប្រណីតម៉ូដបុរាណ / Solid Wood Door',
    woodType: 'ប្រភេទឈើ/សម្ភារៈ',
    dimensions: 'ខ្នាតទំហំ',
    dimensionsPlaceholder: '90cm x 220cm ឬ តាមគំរូ',
    quantity: 'បរិមាណ',
    quantityPlaceholder: '1 ផ្ទាំង / ឈុត',
    location: 'ទីតាំងដឹកជញ្ជូន/ដំឡើង',
    locationPlaceholder: 'ឧទាហរណ៍: បុរី ប៉េង ហួត, ផ្លូវ ៦០ម៉ែត្រ, ភ្នំពេញ',
    deliveryDate: 'កាលបរិច្ឆេទប្រគល់/ដំឡើង',
    notes: 'កំណត់ចំណាំបន្ថែម',
    notesPlaceholder: 'ឧទាហរណ៍: ត្រូវការថ្នាំលាបពណ៌ខ្មៅរលោង, គ្រឿងបន្លាស់...',
    submitBtn: 'បញ្ជាទិញឥឡូវនេះ',
    submittingBtn: 'កំពុងបញ្ជូនទិន្នន័យ...',
    successTitle: 'ការបញ្ជាទិញទ្វារ/គ្រឿងសង្ហារិមត្រូវបានផ្ញើជោគជ័យ!',
    successDesc: 'ក្រុមការងារជំនាញ SDY នឹងទំនាក់ទំនងមកលោកអ្នកដើម្បីផ្ទៀងផ្ទាត់ទំហំ និងព័ត៌មានលម្អិត។',
    orderAgain: 'បញ្ជាទិញបន្ថែម / កុម្ម៉ង់ម្តងទៀត',
    closeBtn: 'យល់ព្រម / បិទបង្អួច',
    requiredAlert: 'សូមបំពេញព័ត៌មានចាំបាច់ (*): ឈ្មោះ, លេខទូរស័ព្ទ, និង ទីតាំងដឹកជញ្ជូន',
    autoTelegramBadge: 'បញ្ជូនទៅ Telegram Bot ដោយស្វ័យប្រវត្តិ',
    autoSheetBadge: 'រក្សាទុកក្នុង Google Sheets',
    orderIdLabel: 'អត្តលេខការកុម្ម៉ង់:',
    woodTypes: [
      'ឈើកៅស៊ូ (Rubberwood)',
      'MC board (Medium Density Board)',
      'កង់ផ្លាកេរ (Veneer Plywood)',
      'ឈើប្រណីតធម្មជាតិ (Natural Solid Wood)',
    ]
  },
  en: {
    modalTitle: 'Order Doors, Furniture & Joinery',
    badgeText: 'SDY DOORS, FURNITURE & JOINERY',
    customerName: 'Customer Name',
    customerNamePlaceholder: 'e.g., Mr. John Smith',
    phone: 'Phone Number',
    phonePlaceholder: '012 345 678',
    productName: 'Product Name',
    productNamePlaceholder: 'e.g., Premium Solid Wood Door',
    woodType: 'Wood / Material Type',
    dimensions: 'Dimensions / Size',
    dimensionsPlaceholder: '90cm x 220cm or custom size',
    quantity: 'Quantity',
    quantityPlaceholder: '1 Set / Unit',
    location: 'Delivery & Installation Site',
    locationPlaceholder: 'e.g., Borey Peng Huoth, 60m St, Phnom Penh',
    deliveryDate: 'Requested Delivery Date',
    notes: 'Special Notes / Requirements',
    notesPlaceholder: 'e.g., Black matte finish, custom hardware...',
    submitBtn: 'Order Now',
    submittingBtn: 'Submitting Order...',
    successTitle: 'Your Order Has Been Successfully Submitted!',
    successDesc: 'SDY expert team will contact you shortly to verify dimensions and specifications.',
    orderAgain: 'Place Another Order',
    closeBtn: 'OK / Close Window',
    requiredAlert: 'Please fill in required fields (*): Customer Name, Phone, and Delivery Site',
    autoTelegramBadge: 'Auto-sent to Telegram Bot',
    autoSheetBadge: 'Saved in Google Sheets Database',
    orderIdLabel: 'Order ID:',
    woodTypes: [
      'Rubberwood',
      'MC board (MDF Board)',
      'Veneer Plywood',
      'Natural Solid Hardwood',
    ]
  },
  ko: {
    modalTitle: '문, 가구 및 목공 주문 (Order Form)',
    badgeText: 'SDY DOORS, FURNITURE & JOINERY',
    customerName: '고객명 (Customer Name)',
    customerNamePlaceholder: '예: 홍길동 (John Doe)',
    phone: '전화번호 (Phone Number)',
    phonePlaceholder: '012 345 678',
    productName: '제품명 (Product Name)',
    productNamePlaceholder: '예: 고급 원목 도어 (Solid Wood Door)',
    woodType: '목재 및 소재 유형 (Wood/Material)',
    dimensions: '치수/규격 (Dimensions)',
    dimensionsPlaceholder: '90cm x 220cm 또는 맞춤 규격',
    quantity: '수량 (Quantity)',
    quantityPlaceholder: '1 세트 / 개',
    location: '배송 및 설치 장소 (Delivery Address)',
    locationPlaceholder: '예: 프놈펜 펜후스 보레이 (Phnom Penh)',
    deliveryDate: '희망 배송/설치일 (Delivery Date)',
    notes: '추가 요청사항 (Special Notes)',
    notesPlaceholder: '예: 블랙 매트 도장, 맞춤 부속품...',
    submitBtn: '지금 주문하기 (Order Now)',
    submittingBtn: '주문 제출 중...',
    successTitle: '주문이 성공적으로 접수되었습니다!',
    successDesc: 'SDY 전문 팀이 규격 및 상세 사양 확인을 위해 곧 연락드리겠습니다.',
    orderAgain: '추가 주문하기 (Order Again)',
    closeBtn: '확인 / 닫기 (Close)',
    requiredAlert: '필수 항목(*)을 입력해 주세요: 고객명, 전화번호, 배송 장소',
    autoTelegramBadge: 'Telegram 봇으로 자동 전송됨',
    autoSheetBadge: 'Google Sheets 데이터베이스 저장됨',
    orderIdLabel: '주문 번호:',
    woodTypes: [
      '고무나무 (Rubberwood)',
      'MC 보드 / MDF Board',
      '베니어 합판 (Veneer Plywood)',
      '천연 고급 원목 (Natural Hardwood)',
    ]
  }
};

export default function ConcreteOrderModal({ isOpen, onClose, defaultProductTitle }: ConcreteOrderModalProps) {
  const { language, setLanguage } = useLanguage();
  const currentLang = (language === 'km' || language === 'ko' || language === 'en') ? language : 'km';
  const txt = FORM_TRANSLATIONS[currentLang];

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    productName: defaultProductTitle || 'ទ្វារឈើប្រណីត / Wooden Door',
    woodType: txt.woodTypes[0],
    dimensions: '90cm x 220cm',
    quantity: '1 ផ្ទាំង/ឈុត',
    deliveryLocation: '',
    deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: defaultProductTitle ? `កុម្ម៉ង់សម្រាប់ / Order for: ${defaultProductTitle}` : '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [lastSubmittedOrder, setLastSubmittedOrder] = useState<ProductOrder | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      if (defaultProductTitle) {
        setFormData(prev => ({
          ...prev,
          productName: defaultProductTitle,
          notes: `កុម្ម៉ង់សម្រាប់ / Order for: ${defaultProductTitle}`
        }));
      }
    }
  }, [isOpen, defaultProductTitle]);

  const handleResetForNewOrder = () => {
    setStatus('idle');
    setLastSubmittedOrder(null);
  };

  const handleCloseModal = () => {
    setStatus('idle');
    setLastSubmittedOrder(null);
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName.trim() || !formData.phone.trim() || !formData.deliveryLocation.trim()) {
      setStatus('error');
      setErrorMessage(txt.requiredAlert);
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await submitProductOrder({
        customerName: formData.customerName,
        phone: formData.phone,
        productName: formData.productName,
        woodType: formData.woodType,
        dimensions: formData.dimensions,
        quantity: formData.quantity,
        deliveryLocation: formData.deliveryLocation,
        deliveryDate: formData.deliveryDate,
        notes: formData.notes,
      });

      if (res.success) {
        setStatus('success');
        setLastSubmittedOrder(res.order);
      } else {
        setStatus('error');
        setErrorMessage(res.message || 'Error submitting order. Please try again!');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err?.message || 'Network error. Please try again!');
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-[#101828]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="relative bg-white dark:bg-[#101828] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-black/10 dark:border-white/10 my-auto">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#0A4DA3] via-[#113586] to-[#1E88E5] p-5 sm:p-6 text-white relative">
          <button
            onClick={handleCloseModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner shrink-0">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase bg-white/20 text-white px-2.5 py-0.5 rounded-full">
                    {txt.badgeText}
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold tracking-tight mt-0.5">
                  {txt.modalTitle}
                </h3>
              </div>
            </div>

            {/* 3-Language Switcher inside Modal */}
            <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl backdrop-blur-md border border-white/15 self-start sm:self-auto mt-1 sm:mt-0">
              <Globe className="w-3.5 h-3.5 text-amber-300 ml-1 mr-0.5 shrink-0" />
              <button
                type="button"
                onClick={() => setLanguage('km')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  language === 'km'
                    ? 'bg-white text-[#0A4DA3] shadow-md scale-105'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                🇰🇭 ខ្មែរ
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  language === 'en'
                    ? 'bg-white text-[#0A4DA3] shadow-md scale-105'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                🇬🇧 EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ko')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  language === 'ko'
                    ? 'bg-white text-[#0A4DA3] shadow-md scale-105'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                🇰🇷 한국어
              </button>
            </div>
          </div>

        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-7">
          {status === 'success' && lastSubmittedOrder ? (
            <div className="text-center py-6 space-y-6 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h4 className="text-lg sm:text-xl font-extrabold text-[#101828] dark:text-white">
                  {txt.successTitle}
                </h4>
                <p className="text-xs sm:text-sm text-[#101828]/70 dark:text-white/70 max-w-md mx-auto leading-relaxed">
                  {txt.successDesc}
                </p>
              </div>


              {/* Order Summary Card */}
              <div className="p-4 rounded-2xl bg-[#F7F9FC] dark:bg-black/20 border border-black/5 dark:border-white/10 text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between border-b border-black/5 dark:border-white/5 pb-2 font-bold text-[#0A4DA3] dark:text-[#1E88E5]">
                  <span>{txt.orderIdLabel}</span>
                  <span className="font-mono">{lastSubmittedOrder.id}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[#101828]/80 dark:text-white/80">
                  <div><strong>{txt.customerName}:</strong> {lastSubmittedOrder.customerName}</div>
                  <div><strong>{txt.phone}:</strong> {lastSubmittedOrder.phone}</div>
                  <div className="col-span-2"><strong>{txt.productName}:</strong> {lastSubmittedOrder.productName}</div>
                  <div><strong>{txt.woodType}:</strong> {lastSubmittedOrder.woodType}</div>
                  <div><strong>{txt.quantity}:</strong> {lastSubmittedOrder.quantity}</div>
                  <div className="col-span-2"><strong>{txt.location}:</strong> {lastSubmittedOrder.deliveryLocation}</div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetForNewOrder}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {txt.orderAgain}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#0A4DA3] hover:bg-[#113586] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-[#0A4DA3]/20"
                >
                  {txt.closeBtn}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {status === 'error' && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1">
                  <label className="font-bold text-[#101828] dark:text-white/90 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#0A4DA3] dark:text-[#1E88E5]" />
                    {txt.customerName} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={txt.customerNamePlaceholder}
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F9FC] dark:bg-[#101828] border border-black/10 dark:border-white/10 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="font-bold text-[#101828] dark:text-white/90 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#0A4DA3] dark:text-[#1E88E5]" />
                    {txt.phone} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder={txt.phonePlaceholder}
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F9FC] dark:bg-[#101828] border border-black/10 dark:border-white/10 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                  />
                </div>
              </div>

              {/* Product Selection */}
              <div className="space-y-1">
                <label className="font-bold text-[#101828] dark:text-white/90 flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#0A4DA3] dark:text-[#1E88E5]" />
                  {txt.productName} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={txt.productNamePlaceholder}
                  value={formData.productName}
                  onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F9FC] dark:bg-[#101828] border border-black/10 dark:border-white/10 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Wood / Material Type */}
                <div className="space-y-1">
                  <label className="font-bold text-[#101828] dark:text-white/90 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-[#0A4DA3] dark:text-[#1E88E5]" />
                    {txt.woodType}
                  </label>
                  <select
                    value={formData.woodType}
                    onChange={(e) => setFormData(prev => ({ ...prev, woodType: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F9FC] dark:bg-[#101828] border border-black/10 dark:border-white/10 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                  >
                    {txt.woodTypes.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>

                {/* Dimensions */}
                <div className="space-y-1">
                  <label className="font-bold text-[#101828] dark:text-white/90 flex items-center gap-1">
                    <Ruler className="w-3.5 h-3.5 text-[#0A4DA3] dark:text-[#1E88E5]" />
                    {txt.dimensions}
                  </label>
                  <input
                    type="text"
                    placeholder={txt.dimensionsPlaceholder}
                    value={formData.dimensions}
                    onChange={(e) => setFormData(prev => ({ ...prev, dimensions: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F9FC] dark:bg-[#101828] border border-black/10 dark:border-white/10 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                  />
                </div>
              </div>

              {/* Quantity & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#101828] dark:text-white/90 block">
                    {txt.quantity}
                  </label>
                  <input
                    type="text"
                    placeholder={txt.quantityPlaceholder}
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F9FC] dark:bg-[#101828] border border-black/10 dark:border-white/10 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-[#101828] dark:text-white/90 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#0A4DA3] dark:text-[#1E88E5]" />
                    {txt.location} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={txt.locationPlaceholder}
                    value={formData.deliveryLocation}
                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryLocation: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F9FC] dark:bg-[#101828] border border-black/10 dark:border-white/10 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                  />
                </div>
              </div>

              {/* Delivery Date */}
              <div className="space-y-1">
                <label className="font-bold text-[#101828] dark:text-white/90 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#0A4DA3] dark:text-[#1E88E5]" />
                  {txt.deliveryDate}
                </label>
                <input
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F9FC] dark:bg-[#101828] border border-black/10 dark:border-white/10 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="font-bold text-[#101828] dark:text-white/90 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-[#0A4DA3] dark:text-[#1E88E5]" />
                  {txt.notes}
                </label>
                <textarea
                  rows={2}
                  placeholder={txt.notesPlaceholder}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F9FC] dark:bg-[#101828] border border-black/10 dark:border-white/10 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                ></textarea>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#0A4DA3] to-[#1E88E5] hover:from-[#083c80] hover:to-[#1976D2] text-white font-extrabold text-xs uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
                >
                  {status === 'submitting' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      {txt.submittingBtn}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {txt.submitBtn}
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}


