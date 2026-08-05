import React, { useState } from 'react';
import { X, Send, ShoppingBag, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Sparkles, Phone, MapPin, Calendar, MessageSquare, Layers, Ruler } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { submitProductOrder, openTelegramOrderChat, ProductOrder } from '../services/concreteOrderService';

interface ConcreteOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProductTitle?: string;
}

export default function ConcreteOrderModal({ isOpen, onClose, defaultProductTitle }: ConcreteOrderModalProps) {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    productName: defaultProductTitle || 'ទ្វារឈើប្រណីត / Wooden Door',
    woodType: 'ឈើកៅស៊ូ (Rubberwood)',
    dimensions: '90cm x 220cm (ទំហំបទដ្ឋាន)',
    quantity: '1 ផ្ទាំង/ឈុត',
    deliveryLocation: '',
    deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: defaultProductTitle ? `កុម្ម៉ង់សម្រាប់: ${defaultProductTitle}` : '',
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
          notes: `កុម្ម៉ង់សម្រាប់: ${defaultProductTitle}`
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

  const productCategories = [
    'ទ្វារឈើប្រណីត (Solid Wooden Doors)',
    'ទ្វារសមាសធាតុ (Composite / WPC Doors)',
    'ទ្វារអាលុយមីញ៉ូម & កញ្ចក់ (Aluminum Glass Doors)',
    'គ្រឿងសង្ហារិម & ទូឈើ (Custom Cabinetry & Furniture)',
    'បង្អួច & ក្របឈើ (Wooden Windows & Frames)',
    'គ្រឿងតុបតែងឈើស្ថាបត្យកម្ម (Architectural Joinery)',
  ];

  const woodTypes = [
    'ឈើកៅស៊ូ (Rubberwood)',
    'MC board',
    'កង់ផ្លាកេរ',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName.trim() || !formData.phone.trim() || !formData.deliveryLocation.trim()) {
      setStatus('error');
      setErrorMessage(t('validation.fields_required', 'សូមបំពេញព័ត៌មានចាំបាច់ (*): ឈ្មោះ, លេខទូរស័ព្ទ, និង ទីតាំងដឹកជញ្ជូន'));
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
        setErrorMessage(res.message || 'មានបញ្ហាក្នុងការបញ្ជូន។ សូមព្យាយាមម្តងទៀត!');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err?.message || 'ការបញ្ជូនបរាជ័យ។ សូមពិនិត្យអ៊ីនធឺណិត!');
    }
  };

  const handleOpenTelegram = () => {
    if (lastSubmittedOrder) {
      openTelegramOrderChat(lastSubmittedOrder);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#101828]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="relative bg-white dark:bg-[#101828] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-black/10 dark:border-white/10 my-8">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#0A4DA3] via-[#113586] to-[#1E88E5] p-6 text-white relative">
          <button
            onClick={handleCloseModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-widest uppercase bg-white/20 text-white px-2.5 py-0.5 rounded-full">
                  SDY Doors, Furniture & Joinery
                </span>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-0.5">
                {t('door.order_title', 'បញ្ជាទិញទ្វារ & គ្រឿងសង្ហារិម (Order Doors & Joinery)')}
              </h3>
            </div>
          </div>

        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8">
          {status === 'success' && lastSubmittedOrder ? (
            <div className="text-center py-6 space-y-6 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h4 className="text-xl font-extrabold text-[#101828] dark:text-white">
                  {t('door.success_heading', 'ការបញ្ជាទិញទ្វារ/គ្រឿងសង្ហារិមត្រូវបានផ្ញើជោគជ័យ!')}
                </h4>
                <p className="text-xs sm:text-sm text-[#101828]/70 dark:text-white/70 max-w-md mx-auto">
                  {t('door.success_desc', 'ក្រុមការងារជំនាញ SDY នឹងទំនាក់ទំនងមកលោកអ្នកដើម្បីផ្ទៀងផ្ទាត់ទំហំ និងព័ត៌មានលម្អិត។')}
                </p>
              </div>

              {/* Order Status Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] font-bold">
                <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  បញ្ជូនទៅ Telegram Bot ដោយស្វ័យប្រវត្តិ
                </span>
                <span className="px-3 py-1.5 rounded-full bg-[#0A4DA3]/10 text-[#0A4DA3] dark:text-[#1E88E5] border border-[#0A4DA3]/20 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  រក្សាទុកក្នុង Google Sheets
                </span>
              </div>

              {/* Order Summary Card */}
              <div className="p-4 rounded-2xl bg-[#F7F9FC] dark:bg-black/20 border border-black/5 dark:border-white/10 text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between border-b border-black/5 dark:border-white/5 pb-2 font-bold text-[#0A4DA3] dark:text-[#1E88E5]">
                  <span>អត្តលេខការកុម្ម៉ង់:</span>
                  <span className="font-mono">{lastSubmittedOrder.id}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[#101828]/80 dark:text-white/80">
                  <div><strong>ឈ្មោះ:</strong> {lastSubmittedOrder.customerName}</div>
                  <div><strong>ទូរស័ព្ទ:</strong> {lastSubmittedOrder.phone}</div>
                  <div className="col-span-2"><strong>ផលិតផល:</strong> {lastSubmittedOrder.productName}</div>
                  <div><strong>ប្រភេទឈើ:</strong> {lastSubmittedOrder.woodType}</div>
                  <div><strong>បរិមាណ:</strong> {lastSubmittedOrder.quantity}</div>
                  <div className="col-span-2"><strong>ទីតាំង:</strong> {lastSubmittedOrder.deliveryLocation}</div>
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
                  {t('door.order_again', 'បញ្ជាទិញបន្ថែម / កុម្ម៉ង់ម្តងទៀត')}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#0A4DA3] hover:bg-[#113586] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-[#0A4DA3]/20"
                >
                  {t('door.close', 'យល់ព្រម / បិទបង្អួច')}
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
                    ឈ្មោះអតិថិជន / Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ឧទាហរណ៍: លោក សុខ ជា"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F9FC] dark:bg-[#101828] border border-black/10 dark:border-white/10 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="font-bold text-[#101828] dark:text-white/90 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#0A4DA3] dark:text-[#1E88E5]" />
                    លេខទូរស័ព្ទ / Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="012 345 678"
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
                  ឈ្មោះផលិតផល / Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ឧទាហរណ៍: ទ្វារឈើប្រណីតម៉ូដបុរាណ / Modern Solid Wood Door"
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
                    ប្រភេទឈើ/សម្ភារៈ (Wood/Material)
                  </label>
                  <select
                    value={formData.woodType}
                    onChange={(e) => setFormData(prev => ({ ...prev, woodType: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F9FC] dark:bg-[#101828] border border-black/10 dark:border-white/10 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                  >
                    {woodTypes.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>

                {/* Dimensions */}
                <div className="space-y-1">
                  <label className="font-bold text-[#101828] dark:text-white/90 flex items-center gap-1">
                    <Ruler className="w-3.5 h-3.5 text-[#0A4DA3] dark:text-[#1E88E5]" />
                    ខ្នាតទំហំ (Dimensions)
                  </label>
                  <input
                    type="text"
                    placeholder="90cm x 220cm ឬ តាមគំរូ"
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
                    បរិមាណ (Quantity)
                  </label>
                  <input
                    type="text"
                    placeholder="5 ផ្ទាំង"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F9FC] dark:bg-[#101828] border border-black/10 dark:border-white/10 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-[#101828] dark:text-white/90 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#0A4DA3] dark:text-[#1E88E5]" />
                    ទីតាំងដឹកជញ្ជូន/ដំឡើង <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ឧទាហរណ៍: បុរី ប៉េង ហួត, ផ្លូវ ៦០ម៉ែត្រ, ភ្នំពេញ"
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
                  កាលបរិច្ឆេទត្រូវការប្រគល់/ដំឡើង (Estimated Delivery Date)
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
                  កំណត់ចំណាំបន្ថែម / Special Requirements
                </label>
                <textarea
                  rows={2}
                  placeholder="ឧទាហរណ៍: ត្រូវការថ្នាំលាបពណ៌ខ្មៅរលោង, ត្រូវការប្រដាប់ខ្ទាស់ដែកប្រណីត..."
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
                      កំពុងបញ្ជូនទិន្នន័យ...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      បញ្ជូនការបញ្ជាទិញទ្វារ & គ្រឿងសង្ហារិម (Telegram & Google Sheet)
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

