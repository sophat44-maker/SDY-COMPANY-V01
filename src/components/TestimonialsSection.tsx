import React, { useState, useEffect, FormEvent } from 'react';
import { Star, MessageSquare, Plus, CheckCircle2, X, Send, User, Building2, Quote, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { TestimonialItem } from '../types';
import { TESTIMONIALS } from '../data';
import { getAccessToken } from '../services/googleAuthService';
import { appendTestimonialToSheet } from '../services/googleSheetsDirectService';

export default function TestimonialsSection() {
  const { t, language, testimonials: contextTestimonials, refreshAllData } = useLanguage();
  const currentLang = (language as 'km' | 'en' | 'ko') || 'en';

  // Display testimonials state
  const [displayTestimonials, setDisplayTestimonials] = useState<TestimonialItem[]>([]);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Active Carousel Slide State
  const [activeSlide, setActiveSlide] = useState<number>(0);

  // Review Form State
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formRating, setFormRating] = useState<number>(5);
  const [formMessage, setFormMessage] = useState('');
  const [formAvatar, setFormAvatar] = useState('');

  // Combine Context and default TESTIMONIALS
  useEffect(() => {
    let list: TestimonialItem[] = [];

    // Check context first
    if (contextTestimonials && contextTestimonials.length > 0) {
      list = [...contextTestimonials];
    } else {
      list = TESTIMONIALS;
    }

    // Filter to only APPROVED or default items for public display
    const approvedList = list.filter(item => {
      const status = (item.status || 'APPROVED').toUpperCase();
      return status === 'APPROVED';
    });

    setDisplayTestimonials(approvedList.length > 0 ? approvedList : TESTIMONIALS);
  }, [contextTestimonials]);

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % displayTestimonials.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + displayTestimonials.length) % displayTestimonials.length);
  };

  const handleSubmitReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formMessage.trim()) return;

    setIsSubmitting(true);
    const newId = 'testi_' + Date.now();
    const newReview: TestimonialItem = {
      id: newId,
      author: formName.trim(),
      role: formRole.trim() || 'Valued Client',
      company: formCompany.trim() || 'Private Client',
      quote: formMessage.trim(),
      Quote_EN: formMessage.trim(),
      rating: formRating,
      avatar: formAvatar.trim() || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      status: 'PENDING',
      isFeatured: false,
      date: new Date().toISOString().split('T')[0]
    };

    // 1. Save locally in localStorage for instant Admin availability
    try {
      const getLocalList = (key: string): TestimonialItem[] => {
        const raw = localStorage.getItem(key);
        if (raw) {
          try { return JSON.parse(raw); } catch (e) {}
        }
        return [];
      };
      const existingList = getLocalList('sdy_testimonials_custom');
      const updatedList = [newReview, ...existingList];
      localStorage.setItem('sdy_testimonials_custom', JSON.stringify(updatedList));
      localStorage.setItem('sdy_local_testimonials', JSON.stringify(updatedList));
    } catch (err) {
      console.warn('Failed to save review locally:', err);
    }

    // 2. Direct Google Sheets API sync if user is signed in with Google
    try {
      const activeSpreadsheetId = localStorage.getItem('sdy_active_spreadsheet_id');
      if (activeSpreadsheetId) {
        const token = await getAccessToken().catch(() => null);
        if (token) {
          await appendTestimonialToSheet(token, activeSpreadsheetId, newReview);
        }
      }
    } catch (err) {
      console.warn('Direct Google Sheet append failed:', err);
    }

    // 3. Cloud Sync to Google Sheets if Webhook URL exists
    try {
      const webhookUrl = (import.meta as any).env?.VITE_GOOGLE_SHEETS_URL || '';
      if (webhookUrl && webhookUrl.startsWith('http')) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'testimonials.submit',
            sheetName: 'Testimonials',
            data: {
              "TestimonialID": newReview.id,
              "Author": newReview.author,
              "Role": newReview.role,
              "Company": newReview.company,
              "Quote EN": newReview.quote,
              "Rating": newReview.rating,
              "Avatar": newReview.avatar,
              "Status": 'PENDING',
              "CreatedAt": newReview.date
            }
          })
        });
      }
    } catch (netErr) {
      console.warn('Network submit to Google Sheets failed or caught:', netErr);
    }

    // Dispatch custom events so Admin & Context pick it up immediately
    window.dispatchEvent(new Event('sdy_global_db_updated'));
    window.dispatchEvent(new Event('sdy_testimonials_updated'));

    setIsSubmitting(false);
    setSubmitSuccess(true);

    setTimeout(() => {
      setSubmitSuccess(false);
      setIsWriteModalOpen(false);
      setFormName('');
      setFormRole('');
      setFormCompany('');
      setFormRating(5);
      setFormMessage('');
      setFormAvatar('');
      if (refreshAllData) refreshAllData();
    }, 2000);
  };

  // Helper to get localized text
  const getLocalizedQuote = (item: TestimonialItem) => {
    if (currentLang === 'km' && item.Quote_KH) return item.Quote_KH;
    if (currentLang === 'ko' && item.Quote_KO) return item.Quote_KO;
    return item.Quote_EN || item.quote;
  };

  const getLocalizedAuthor = (item: TestimonialItem) => {
    if (currentLang === 'km' && item.Author_KH) return item.Author_KH;
    if (currentLang === 'ko' && item.Author_KO) return item.Author_KO;
    return item.author;
  };

  const getLocalizedRole = (item: TestimonialItem) => {
    if (currentLang === 'km' && item.Role_KH) return item.Role_KH;
    if (currentLang === 'ko' && item.Role_KO) return item.Role_KO;
    return item.role;
  };

  const getLocalizedCompany = (item: TestimonialItem) => {
    if (currentLang === 'km' && item.Company_KH) return item.Company_KH;
    if (currentLang === 'ko' && item.Company_KO) return item.Company_KO;
    return item.company;
  };

  return (
    <section className="relative py-20 bg-gradient-to-b from-[#F7F9FC] via-white to-[#F7F9FC] dark:from-[#101828]/60 dark:via-[#101828]/90 dark:to-[#101828]/60 border-t border-b border-black/[0.04] dark:border-white/5 overflow-hidden">
      {/* Light glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#0A4DA3]/5 dark:bg-[#1E88E5]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0A4DA3]/10 dark:bg-[#1E88E5]/20 text-[#0A4DA3] dark:text-[#1E88E5]">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase">
                {t('testimonials.badge', 'What Our Clients Say')}
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#101828] dark:text-white tracking-tight">
              {t('testimonials.title', 'Client Reviews & Industry Testimonials')}
            </h2>
            
            <p className="text-sm sm:text-base text-[#101828]/70 dark:text-white/70 leading-relaxed font-normal">
              {t('testimonials.subtitle', 'Hear from architects, project directors, and corporate clients about their experiences working with SDY Company C&I.')}
            </p>
          </div>

          <button
            onClick={() => setIsWriteModalOpen(true)}
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#0A4DA3] to-[#1E88E5] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t('testimonials.write_review_btn', '+ Write a Review')}</span>
          </button>
        </div>

        {/* Featured Testimonials Showcase Grid */}
        {displayTestimonials.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayTestimonials.slice(0, 6).map((item, idx) => (
              <motion.div
                key={item.id || idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="group relative flex flex-col justify-between p-7 rounded-3xl bg-white dark:bg-dark border border-black/5 dark:border-white/5 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 sleek-card"
              >
                {/* Quote Icon Background */}
                <Quote className="absolute top-6 right-6 w-10 h-10 text-[#0A4DA3]/10 dark:text-white/10 group-hover:scale-110 transition-transform" />

                <div className="space-y-4">
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, sIdx) => (
                      <Star
                        key={sIdx}
                        className={`w-4 h-4 ${
                          sIdx < (item.rating || 5)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-zinc-300 dark:text-zinc-700'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Review Quote Message */}
                  <p className="text-sm sm:text-base text-[#101828]/85 dark:text-white/90 leading-relaxed font-normal italic">
                    "{getLocalizedQuote(item)}"
                  </p>
                </div>

                {/* Client Profile Footer */}
                <div className="mt-6 pt-6 border-t border-black/5 dark:border-white/5 flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#0A4DA3]/20 to-[#1E88E5]/20 shrink-0 border border-[#0A4DA3]/20">
                    {item.avatar ? (
                      <img
                        src={item.avatar}
                        alt={item.author}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-[#0A4DA3] dark:text-[#1E88E5]">
                        {item.author?.charAt(0) || 'C'}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-[#101828] dark:text-white truncate">
                        {getLocalizedAuthor(item)}
                      </h4>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1E88E5] shrink-0" title="Verified Client Review" />
                    </div>
                    <p className="text-xs text-[#101828]/60 dark:text-white/60 truncate">
                      {getLocalizedRole(item)} {item.company ? `• ${getLocalizedCompany(item)}` : ''}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>

      {/* Interactive Write Review Modal Dialog */}
      <AnimatePresence>
        {isWriteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white dark:bg-[#101828] border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsWriteModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-black/5 dark:bg-white/10 text-black dark:text-white hover:bg-black/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {submitSuccess ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-[#101828] dark:text-white">
                    {t('testimonials.submitted_title', 'Review Submitted!')}
                  </h3>
                  <p className="text-sm text-[#101828]/70 dark:text-white/70 max-w-md mx-auto">
                    {t('testimonials.submitted_success', 'Thank you for your feedback! Your review has been submitted successfully and will be verified shortly.')}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-6">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A4DA3]/10 text-[#0A4DA3] dark:text-[#1E88E5] text-xs font-bold uppercase tracking-widest">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {t('testimonials.modal_tag', 'Client Feedback')}
                    </div>
                    <h3 className="text-2xl font-extrabold text-[#101828] dark:text-white tracking-tight">
                      {t('testimonials.modal_title', 'Submit Your Experience')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#101828]/60 dark:text-white/60">
                      {t('testimonials.modal_subtitle', 'Share your review with SDY Company C&I products, interior fit-outs, or structural engineering services.')}
                    </p>
                  </div>

                  {/* Rating selector */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#101828]/70 dark:text-white/70">
                      {t('testimonials.rating_label', 'Overall Star Rating *')}
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormRating(star)}
                          className="p-1 text-amber-400 hover:scale-125 transition-transform"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              star <= formRating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300 dark:text-zinc-700'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm font-bold text-[#0A4DA3] dark:text-[#1E88E5]">
                        {formRating} / 5 Stars
                      </span>
                    </div>
                  </div>

                  {/* Name and Role Input */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#101828]/70 dark:text-white/70">
                        {t('testimonials.name_label', 'Your Name *')}
                      </label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g. Sok Visal"
                        className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm font-bold text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#101828]/70 dark:text-white/70">
                        {t('testimonials.role_label', 'Title / Role')}
                      </label>
                      <input
                        type="text"
                        value={formRole}
                        onChange={(e) => setFormRole(e.target.value)}
                        placeholder="e.g. Project Director / Architect"
                        className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm font-bold text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                      />
                    </div>
                  </div>

                  {/* Company and Avatar */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#101828]/70 dark:text-white/70">
                        {t('testimonials.company_label', 'Company / Institution')}
                      </label>
                      <input
                        type="text"
                        value={formCompany}
                        onChange={(e) => setFormCompany(e.target.value)}
                        placeholder="e.g. ABA Bank / Chip Mong"
                        className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm font-bold text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#101828]/70 dark:text-white/70">
                        {t('testimonials.photo_label', 'Photo Link (Optional)')}
                      </label>
                      <input
                        type="url"
                        value={formAvatar}
                        onChange={(e) => setFormAvatar(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm font-bold text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                      />
                    </div>
                  </div>

                  {/* Review Message */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#101828]/70 dark:text-white/70">
                      {t('testimonials.review_label', 'Your Review Message *')}
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formMessage}
                      onChange={(e) => setFormMessage(e.target.value)}
                      placeholder="Write your experience with our services, manufacturing quality, or door installations..."
                      className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm font-medium text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsWriteModalOpen(false)}
                      className="px-5 py-3 rounded-xl border border-black/10 dark:border-white/10 text-xs font-bold uppercase tracking-wider text-[#101828] dark:text-white"
                    >
                      {t('common.cancel', 'Cancel')}
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0A4DA3] hover:bg-[#1E88E5] text-white text-xs font-bold uppercase tracking-wider shadow-lg transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Submitting...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>{t('testimonials.submit_btn', 'Submit Review')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
