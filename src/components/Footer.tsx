import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Facebook, Send, Play, Globe } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useHomepage } from './HomepageContext';
import sdyLogoImg from '../assets/images/sdy_official_logo_v2_1784772926599.jpg';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const { t, language, companyInfo } = useLanguage();
  const { homepageData } = useHomepage();

  const footerCms = homepageData?.cta_banner_and_footer;
  const currentLang = (language as 'km' | 'en' | 'ko') || 'en';

  const cmsAddress = footerCms?.address?.[currentLang] || companyInfo?.Address || t('contact.address_val', 'National Road 3, Phnom Penh, Kingdom of Cambodia');
  const cmsPhone = footerCms?.phone || companyInfo?.PhoneNumber || '+855 (0) 23 888 999';
  const cmsEmail = footerCms?.email || companyInfo?.Email || 'info@sdy-ci.com';
  const cmsTagline = footerCms?.company_tagline?.[currentLang] || 'CONSTRUCTION • INTERIOR DESIGN • FURNITURE';

  const [customLogo, setCustomLogo] = useState<string | null>(() => {
    return localStorage.getItem('sdy_custom_logo') || companyInfo?.LogoUrl || companyInfo?.Logo || null;
  });

  useEffect(() => {
    const updateLogo = () => {
      const stored = localStorage.getItem('sdy_custom_logo');
      if (stored) {
        setCustomLogo(stored);
      } else if (companyInfo?.LogoUrl || companyInfo?.Logo) {
        const infoLogo = companyInfo.LogoUrl || companyInfo.Logo;
        if (typeof infoLogo === 'string' && (infoLogo.startsWith('http') || infoLogo.startsWith('data:'))) {
          setCustomLogo(infoLogo);
        }
      }
    };
    updateLogo();
    window.addEventListener('sdy_custom_logo_updated', updateLogo);
    window.addEventListener('sdy_company_info_updated', updateLogo);
    return () => {
      window.removeEventListener('sdy_custom_logo_updated', updateLogo);
      window.removeEventListener('sdy_company_info_updated', updateLogo);
    };
  }, [companyInfo]);

  const displayLogo = (customLogo && typeof customLogo === 'string' && (customLogo.startsWith('http') || customLogo.startsWith('data:'))) ? customLogo : sdyLogoImg;

  const socialChannels = [
    { name: 'Telegram', icon: Send, url: companyInfo?.Telegram || 'https://t.me/sdycompanyci', color: 'hover:text-[#26A5E4]' },
    { name: 'Facebook', icon: Facebook, url: companyInfo?.Facebook || 'https://facebook.com/sdycompanyci', color: 'hover:text-[#1877F2]' },
    { name: 'TikTok', icon: Globe, url: companyInfo?.TikTok || 'https://tiktok.com/@sdycompanyci', color: 'hover:text-[#000000] dark:hover:text-[#FFFFFF]' },
    { name: 'YouTube', icon: Play, url: companyInfo?.YouTube || 'https://youtube.com/@sdycompanyci', color: 'hover:text-[#FF0000]' },
  ];

  return (
    <footer id="main-footer" className="bg-[#101828] text-white pt-20 pb-10 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        
        {/* Company Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-white/20 flex items-center justify-center shrink-0 shadow-md">
              <img
                src={displayLogo}
                alt="SDY Company Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wider whitespace-nowrap">SDY COMPANY C&I</h2>
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#1E88E5] font-semibold -mt-0.5 whitespace-nowrap">CONSTRUCTION & INTERIOR</p>
            </div>
          </div>
          <p className="text-xs text-white/60 leading-relaxed">
            {t('footer.desc', "SDY Company C&I is Cambodia's premium commercial contractor, uniting bespoke millwork with heavy engineering and structural fabrication.")}
          </p>
          
          {/* Social Icons */}
          <div className="flex gap-2.5 pt-2">
            {socialChannels.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  className={`p-2 rounded-lg bg-white/5 border border-white/10 text-white/70 transition-all duration-300 ${social.color} hover:bg-white/10 hover:-translate-y-1`}
                  aria-label={`Follow SDY on ${social.name}`}
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Quick Navigation Links */}
        <div>
          <h3 className="text-[#1E88E5] text-xs font-bold uppercase tracking-[0.15em] mb-6">{t('footer.links', 'Quick Navigation')}</h3>
          <ul className="space-y-3.5 text-xs">
            {[
              { id: 'home', label: t('nav.home', 'Home') },
              { id: 'services', label: t('nav.services', 'Services') },
              { id: 'products', label: t('nav.products', 'Products') },
              { id: 'projects', label: t('nav.projects', 'Projects') },
              { id: 'about', label: t('nav.about', 'About Us') },
              { id: 'factory', label: t('footer.factory', 'Our Factory') },
              { id: 'quote', label: t('footer.quote', 'Request Quote') },
              { id: 'partners', label: t('footer.partners', 'Corporate Partners') },
              { id: 'blogs', label: t('nav.blog', 'News') },
              { id: 'contact', label: t('nav.contact', 'Contact') },
              { id: 'admin', label: t('nav.admin', 'Admin Panel') }
            ].map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className="text-white/60 hover:text-white transition-all hover:translate-x-1 flex items-center gap-1.5"
                >
                  <span className="text-[10px] text-[#0A4DA3] dark:text-[#1E88E5]">◆</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Specialized Services */}
        <div>
          <h3 className="text-[#1E88E5] text-xs font-bold uppercase tracking-[0.15em] mb-6">{t('hero.services', 'Our 18 Premium Services')}</h3>
          <ul className="space-y-3 text-xs text-white/60">
            <li>• {t('hero.joinery', 'Premium Joinery & Doors')}</li>
            <li>• {t('hero.structures', 'High-Load Steel Structures')}</li>
            <li>• {t('products.material', 'Material Composition')}</li>
            <li>• {t('products.specifications', 'Technical Specifications')}</li>
            <li>• {t('contact.office', 'Headquarters & Factory')}</li>
          </ul>
        </div>

        {/* Corporate Address & Contact */}
        <div className="space-y-5">
          <h3 className="text-[#1E88E5] text-xs font-bold uppercase tracking-[0.15em] mb-6">{t('nav.contact', 'Contact')}</h3>
          
          <div className="flex gap-3 items-start text-xs text-white/70">
            <MapPin className="w-5 h-5 text-[#1E88E5] shrink-0" />
            <div>
              <p className="font-bold text-white mb-0.5">{t('contact.office', 'Headquarters & Factory')}</p>
              <p className="text-white/60 leading-relaxed">{cmsAddress}</p>
            </div>
          </div>

          <div className="flex gap-3 items-center text-xs text-white/70">
            <Phone className="w-5 h-5 text-[#1E88E5] shrink-0" />
            <div>
              <p className="font-bold text-white mb-0.5">{t('contact.phone', 'Phone Number')}</p>
              <a href={`tel:${cmsPhone.replace(/[^0-9+]/g, '')}`} className="text-white/60 hover:text-[#1E88E5]">{cmsPhone}</a>
            </div>
          </div>

          <div className="flex gap-3 items-center text-xs text-white/70">
            <Mail className="w-5 h-5 text-[#1E88E5] shrink-0" />
            <div>
              <p className="font-bold text-white mb-0.5">{t('contact.email', 'Email Address')}</p>
              <a href={`mailto:${cmsEmail}`} className="text-white/60 hover:text-[#1E88E5]">{cmsEmail}</a>
            </div>
          </div>
        </div>

      </div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
        <p>© {currentYear} {t('nav.sdy_company', 'SDY COMPANY')}. {t('footer.rights', 'All rights reserved.')}</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">{t('footer.privacy_policy', 'Privacy Policy')}</a>
          <a href="#" className="hover:text-white transition-colors">{t('footer.terms_of_service', 'Terms of Service')}</a>
          <button onClick={() => onNavigate('admin')} className="hover:text-[#1E88E5] transition-colors">{t('nav.admin', 'Admin Panel')}</button>
        </div>
      </div>
    </footer>
  );
}
