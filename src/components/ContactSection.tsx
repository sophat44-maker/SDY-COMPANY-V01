import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import {
  Mail, Phone, Send, MapPin, Globe, CheckCircle2, AlertCircle, Smartphone,
  Facebook, Play, HelpCircle
} from 'lucide-react';
import { ContactMessage, AdminConfig } from '../types';
import { useLanguage } from './LanguageContext';

export default function ContactSection() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: ''
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isSyncingWithSheets, setIsSyncingWithSheets] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [mapUrl, setMapUrl] = useState('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3908.7706603099953!2d104.8885621!3d11.5682855!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3109513dc76a6e7b%3A0x4eb29ef3878b2735!2sPhnom%20Penh%20International%20Airport!5e0!3m2!1sen!2skh!4v1721245000000!5m2!1sen!2skh');
  const [companyPhone, setCompanyPhone] = useState('+855 (0) 23 888 999');
  const [companyEmail, setCompanyEmail] = useState('info@sdy-ci.com');
  const [socialTelegram, setSocialTelegram] = useState('https://t.me/sdycompanyci');
  const [socialFacebook, setSocialFacebook] = useState('https://facebook.com/sdycompanyci');
  const [socialTikTok, setSocialTikTok] = useState('https://tiktok.com/@sdycompanyci');
  const [socialYouTube, setSocialYouTube] = useState('https://youtube.com/@sdycompanyci');

  useEffect(() => {
    const updateInfoFromStorage = () => {
      const savedInfo = localStorage.getItem('sdy_company_info');
      if (savedInfo) {
        try {
          const info = JSON.parse(savedInfo);
          if (info.GoogleMapEmbedURL) setMapUrl(info.GoogleMapEmbedURL);
          if (info.PhoneNumber) setCompanyPhone(info.PhoneNumber);
          if (info.Email) setCompanyEmail(info.Email);
          if (info.Telegram) setSocialTelegram(info.Telegram);
          if (info.Facebook) setSocialFacebook(info.Facebook);
          if (info.TikTok) setSocialTikTok(info.TikTok);
          if (info.YouTube) setSocialYouTube(info.YouTube);
        } catch (e) {
          console.error('Error parsing company info:', e);
        }
      }
    };

    updateInfoFromStorage();
    window.addEventListener('sdy_company_info_updated', updateInfoFromStorage);
    return () => window.removeEventListener('sdy_company_info_updated', updateInfoFromStorage);
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Simple verification
    if (!formData.name || !formData.email || !formData.phone || !formData.subject || !formData.message) {
      setStatus('error');
      setErrorMessage(t('validation.fields_required', 'Please complete all required fields (*).'));
      return;
    }

    setStatus('loading');

    const newMessage: ContactMessage = {
      id: 'msg_' + Date.now(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company || undefined,
      subject: formData.subject,
      message: formData.message,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      status: 'New'
    };

    try {
      // 1. Save locally to LocalStorage Contact Database
      const existingMessagesJson = localStorage.getItem('sdy_contact_messages');
      const messages: ContactMessage[] = existingMessagesJson ? JSON.parse(existingMessagesJson) : [];
      messages.unshift(newMessage);
      localStorage.setItem('sdy_contact_messages', JSON.stringify(messages));

      // Trigger custom window event to notify Admin panel instantly
      window.dispatchEvent(new Event('sdy_message_submitted'));

      // 2. Real Google Sheets Webhook Sync!
      const adminConfigJson = localStorage.getItem('sdy_admin_config');
      if (adminConfigJson) {
        const config: AdminConfig = JSON.parse(adminConfigJson);
        if (config.isSyncEnabled && config.googleSheetsWebhookUrl) {
          setIsSyncingWithSheets(true);
          
          // Dispatch a real fetch POST to their Google Sheets / Google Apps Script endpoint!
          const response = await fetch(config.googleSheetsWebhookUrl, {
            method: 'POST',
            mode: 'no-cors', // standard for Google Apps Script Webhooks to prevent CORS hurdles
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(newMessage)
          });
          
          console.log('Real HTTP Webhook submission triggered:', response);
        }
      }

      setTimeout(() => {
        setStatus('success');
        setIsSyncingWithSheets(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          subject: '',
          message: ''
        });
      }, 1500);

    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err?.message || 'Failed to dispatch submission. Local cache preserved.');
      setIsSyncingWithSheets(false);
    }
  };

  const socialLinks = [
    { name: t('contact.social_tg', 'Telegram Channels'), icon: Send, url: socialTelegram, val: socialTelegram.replace('https://', ''), desc: t('contact.social_tg_desc', 'Secure direct workspace coordination') },
    { name: t('contact.social_fb', 'Facebook Brand Portal'), icon: Facebook, url: socialFacebook, val: 'SDY Company C&I', desc: t('contact.social_fb_desc', 'Active project albums & completions') },
    { name: t('contact.social_tt', 'TikTok Showcase'), icon: Globe, url: socialTikTok, val: socialTikTok.replace('https://', '').split('/')[1] || '@sdycompanyci', desc: t('contact.social_tt_desc', 'High-end factory manufacturing snippets') },
    { name: t('contact.social_yt', 'YouTube Engineering'), icon: Play, url: socialYouTube, val: 'SDY C&I Cambodia', desc: t('contact.social_yt_desc', 'Full architectural video walk-throughs') }
  ];

  return (
    <section id="contact-page" className="py-24 bg-white dark:bg-[#101828] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* Page Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#0A4DA3]/5 dark:bg-[#1E88E5]/10 rounded-full">
            <span className="text-sm sm:text-[18px] font-bold tracking-[0.2em] text-[#0A4DA3] dark:text-[#1E88E5] uppercase">
              {t('contact.get_in_touch', 'Get in Touch')}
            </span>
          </div>
          <h2 className="text-3xl sm:text-[40px] sm:leading-[70.6px] font-extrabold text-[#101828] dark:text-white tracking-tight">
            {t('contact.title', 'Initiate Your Engineering Proposal Today')}
          </h2>
          <p className="text-base sm:text-lg text-[#101828]/70 dark:text-white/70 leading-relaxed">
            {t('contact.subtitle', 'Have questions about load bearing metrics, UL certification, custom kiln timber, or cost assessments? Leave a query below, or dial our central office directly.')}
          </p>
        </div>

        {/* Dual Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Form and Webhook synchronizer notifications */}
          <div className="lg:col-span-7 bg-[#F7F9FC] dark:bg-[#101828]/40 border border-black/5 dark:border-white/5 p-6 sm:p-10 rounded-3xl shadow-xl space-y-6">
            
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-[#101828] dark:text-white">{t('contact.form_title', 'Commercial Inquiry Form')}</h3>
              <p className="text-sm sm:text-base text-[#101828]/65 dark:text-white/65">{t('contact.form_desc', 'Complete the form below. Responses are stored in your localized database, and automatically synchronizes to Google Sheets if configured.')}</p>
            </div>

            {/* Status Feedback Banners */}
            {status === 'success' && (
              <div className="p-4.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm sm:text-base font-semibold flex items-center gap-3 animate-fade-in">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <div>
                  <p className="font-bold">{t('contact.success_title', 'Message Dispatched Successfully!')}</p>
                  <p className="text-xs sm:text-sm opacity-85 mt-0.5">{t('contact.success_desc', 'Your inquiry is logged in the local database. View submissions anytime in the System Portal.')}</p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="p-4.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm sm:text-base font-semibold flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <div>
                  <p className="font-bold">{t('contact.error_title', 'Failed to Dispatch Message')}</p>
                  <p className="text-xs sm:text-sm opacity-85 mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-[#101828]/70 dark:text-white/70 uppercase tracking-wider block">{t('contact.label_name', 'Your Name *')}</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t('contact.placeholder_name', 'e.g., Jung Veasna')}
                    required
                    className="w-full px-4 py-3.5 text-sm sm:text-base rounded-xl bg-white dark:bg-[#101828] text-[#101828] dark:text-white border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-[#101828]/70 dark:text-white/70 uppercase tracking-wider block">{t('contact.label_email', 'Contact Email *')}</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={t('contact.placeholder_email', 'e.g., company@sdy-ci.com')}
                    required
                    className="w-full px-4 py-3.5 text-sm sm:text-base rounded-xl bg-white dark:bg-[#101828] text-[#101828] dark:text-white border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-[#101828]/70 dark:text-white/70 uppercase tracking-wider block">{t('contact.label_phone', 'Phone Number *')}</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder={t('contact.placeholder_phone', 'e.g., +855 23 888 999')}
                    required
                    className="w-full px-4 py-3.5 text-sm sm:text-base rounded-xl bg-white dark:bg-[#101828] text-[#101828] dark:text-white border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-[#101828]/70 dark:text-white/70 uppercase tracking-wider block">{t('contact.label_company', 'Company Name')}</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder={t('contact.placeholder_company', 'e.g., ABA Bank Cambodia')}
                    className="w-full px-4 py-3.5 text-sm sm:text-base rounded-xl bg-white dark:bg-[#101828] text-[#101828] dark:text-white border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-[#101828]/70 dark:text-white/70 uppercase tracking-wider block">{t('contact.label_subject', 'Subject *')}</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3.5 text-sm sm:text-base rounded-xl bg-white dark:bg-[#101828] text-[#101828] dark:text-white border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                >
                  <option value="">{t('contact.choose_subject', '-- Choose Subject --')}</option>
                  <option value="Interior Fit-Out Estimate">{t('services.cat_interior', 'Interior Fit-Out')}</option>
                  <option value="Custom Door Fabrication">{t('services.cat_doors', 'Custom Door Fabrication')}</option>
                  <option value="Structural Steel Framing Truss">{t('services.cat_steel', 'Structural Steel Works')}</option>
                  <option value="Facade Curtain Wall Cladding">{t('services.cat_glass', 'Glass & Aluminum')}</option>
                  <option value="Bespoke Loose Furniture Systems">{t('services.cat_furniture', 'Bespoke Furniture')}</option>
                  <option value="General Industrial Partnership">{t('contact.subject_partnership', 'General Industrial Partnership')}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-[#101828]/70 dark:text-white/70 uppercase tracking-wider block">{t('contact.label_message', 'Detailed Message *')}</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder={t('contact.placeholder_message', 'Provide details about dimensions, steel grading, wood preferences, or location constraints...')}
                  required
                  className="w-full px-4 py-3.5 text-sm sm:text-base rounded-xl bg-white dark:bg-[#101828] text-[#101828] dark:text-white border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-4.5 bg-[#0A4DA3] hover:bg-[#1E88E5] text-white text-sm sm:text-base font-bold uppercase tracking-widest rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2.5 disabled:opacity-50"
              >
                {status === 'loading' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t('contact.btn_sending', 'Dispatching Securely...')}
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" /> {t('contact.btn_send', 'Send Proposal Request')}
                  </>
                )}
              </button>
            </form>

          </div>

          {/* Right Column: Coordinate directories & Google Map */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Quick Contacts */}
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-bold text-[#101828] dark:text-white">{t('contact.coordinates_title', 'SDY C&I Coordinates')}</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-[#F7F9FC] dark:bg-[#101828]/50 border border-black/5 dark:border-white/5 flex gap-3.5 items-center">
                  <Smartphone className="w-10 h-10 text-[#1E88E5] shrink-0" />
                  <div>
                    <span className="text-[15px] font-bold text-black dark:text-white/80 uppercase tracking-wider block">{t('contact.office_phone', 'Office Phone')}</span>
                    <a href={`tel:${companyPhone}`} className="text-[14px] font-bold text-[#101828]/90 dark:text-white/90 hover:text-[#0A4DA3] transition-colors">{companyPhone}</a>
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-[#F7F9FC] dark:bg-[#101828]/50 border border-black/5 dark:border-white/5 flex gap-3.5 items-center">
                  <Mail className="w-10 h-10 text-[#1E88E5] shrink-0" />
                  <div>
                    <span className="text-[15px] font-bold text-black dark:text-white/80 uppercase tracking-wider block">{t('contact.email_address', 'Email Address')}</span>
                    <a href={`mailto:${companyEmail}`} className="text-[14px] font-bold text-[#101828]/90 dark:text-white/90 hover:text-[#0A4DA3] transition-colors">{companyEmail}</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Social handles */}
            <div className="space-y-3.5">
              <h4 className="text-sm sm:text-base font-bold uppercase tracking-widest text-[#0A4DA3] dark:text-[#1E88E5]">{t('contact.social_title', 'Social Brand Outlets')}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {socialLinks.map((link, idx) => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      referrerPolicy="no-referrer"
                      className="p-4.5 rounded-xl bg-white dark:bg-[#101828]/40 border border-black/5 dark:border-white/5 hover:border-[#0A4DA3]/20 dark:hover:border-[#1E88E5]/20 shadow-sm transition-all hover:shadow-md flex items-center gap-3.5 group"
                    >
                      <div className="p-2.5 rounded-lg bg-[#0A4DA3]/5 dark:bg-[#1E88E5]/10 text-[#0A4DA3] dark:text-[#1E88E5] group-hover:bg-[#0A4DA3] group-hover:text-white transition-colors duration-300">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[16px] font-bold text-[#101828]/90 dark:text-white/90 block leading-tight">{link.name}</span>
                        <span className="text-[15px] text-[#0A4DA3] dark:text-[#1E88E5] font-semibold block mt-0.5">{link.val}</span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Google Map Panel */}
            <div className="space-y-2.5">
              <span className="text-xs sm:text-sm font-bold text-[#101828]/55 dark:text-white/55 uppercase tracking-wider block flex items-center gap-2">
                <MapPin className="w-4 h-4" /> {t('contact.geography', 'Central HQ and Factory Geography')}
              </span>
              <div className="rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden shadow-lg h-60 bg-black/10">
                <iframe
                  title="SDY Company C&I Phnom Penh HQ Map"
                  src={mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
