import { useState, useEffect, lazy, Suspense } from 'react';
import {
  ArrowRight, Phone, Send, CheckCircle2, Building2, Sparkles, Cpu, Layers,
  MessageSquare, Award, ArrowUp, ArrowRightLeft, ShieldCheck, Factory, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Core Subcomponents (Eager Loaded for Instant LCP)
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import SEOManager from './components/SEOManager';
import { useLanguage } from './components/LanguageContext';
import { transformGoogleDriveUrl } from './utils/googleDrive';
import { BlogPost } from './types';
import AnimatedCounter from './components/AnimatedCounter';
import ScrollReveal from './components/ScrollReveal';
import FeaturedProductsShowcase from './components/FeaturedProductsShowcase';
import TestimonialsSection from './components/TestimonialsSection';

// Lazy Loaded Page Sections for Bundle Optimization
const ServicesSection = lazy(() => import('./components/ServicesSection'));
const ProjectsSection = lazy(() => import('./components/ProjectsSection'));
const ProductsSection = lazy(() => import('./components/ProductsSection'));
const AboutSection = lazy(() => import('./components/AboutSection'));
const ContactSection = lazy(() => import('./components/ContactSection'));
const BlogSection = lazy(() => import('./components/BlogSection'));
const AdminSection = lazy(() => import('./components/AdminSection'));

const DownloadCenterSection = lazy(() => import('./components/ExtraEnterpriseSections').then(m => ({ default: m.DownloadCenterSection })));
const CareersSection = lazy(() => import('./components/ExtraEnterpriseSections').then(m => ({ default: m.CareersSection })));
const FactorySection = lazy(() => import('./components/ExtraEnterpriseSections').then(m => ({ default: m.FactorySection })));
const InteractiveQuoteSection = lazy(() => import('./components/ExtraEnterpriseSections').then(m => ({ default: m.InteractiveQuoteSection })));
const FAQSection = lazy(() => import('./components/ExtraEnterpriseSections').then(m => ({ default: m.FAQSection })));

// Seed Data Fallbacks
import { STATS, PROCESS_STEPS, CLIENTS, TESTIMONIALS, SERVICES, PROJECTS, PRODUCTS, BLOG_POSTS } from './data';
import { useHomepage } from './components/HomepageContext';

export default function App() {
  const { t, language, blogs, projects, companyInfo } = useLanguage();
  const { homepageData } = useHomepage();
  const currentLang = (language as 'km' | 'en' | 'ko') || 'en';

  const getTelegramUrl = () => {
    if (!companyInfo?.Telegram) return 'https://t.me/sdycompanyci';
    if (companyInfo.Telegram.startsWith('http')) return companyInfo.Telegram;
    return `https://t.me/${companyInfo.Telegram.replace('@', '')}`;
  };

  const getWhatsAppUrl = () => {
    if (companyInfo?.WhatsApp && companyInfo.WhatsApp.startsWith('http')) return companyInfo.WhatsApp;
    const num = (companyInfo?.WhatsApp || companyInfo?.PhoneNumber || '85523888999').replace(/[^0-9]/g, '');
    return `https://wa.me/${num}`;
  };

  const getPhoneUrl = () => {
    const num = (companyInfo?.PhoneNumber || '+85523888999').replace(/[^0-9+]/g, '');
    return `tel:${num}`;
  };
  const [currentView, setCurrentView] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('product') || params.get('id')) {
      return 'products';
    }
    return 'home';
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);
  const [isFloatingMenuOpen, setIsFloatingMenuOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Testimonial state
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Load and apply dark mode
  useEffect(() => {
    const savedTheme = localStorage.getItem('sdy_theme_dark');
    if (savedTheme === 'true') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Elegant loading screen timeout
  useEffect(() => {
    const loadTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1600);
    return () => clearTimeout(loadTimer);
  }, []);

  // Monitor scroll height to show back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleToggleDarkMode = () => {
    const nextTheme = !isDarkMode;
    setIsDarkMode(nextTheme);
    if (nextTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sdy_theme_dark', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sdy_theme_dark', 'false');
    }
  };

  // Triggered when a user uses the header search bar
  const handleGlobalSearch = (query: string) => {
    setGlobalSearchQuery(query);
    setCurrentView('products');
    
    // Smooth scroll down to products section
    setTimeout(() => {
      const productsEl = document.getElementById('products-page');
      if (productsEl) {
        productsEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleNavigate = (view: string) => {
    let targetView = view;
    let scrollToId = '';

    if (view === 'quote') {
      targetView = 'contact';
    } else if (view === 'factory' || view === 'partners' || view === 'certificates' || view === 'downloads' || view === 'careers' || view === 'faq' || view === 'testimonials') {
      targetView = 'about';
      scrollToId = `${view}-section`;
    }

    setCurrentView(targetView);
    setGlobalSearchQuery(''); // reset search on navigation
    
    setTimeout(() => {
      if (scrollToId) {
        const el = document.getElementById(scrollToId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-dark text-white' : 'bg-bg-light text-dark'}`}>
      
      {/* Premium Enterprise Loading Animation Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 bg-[#101828] z-[9999] flex flex-col items-center justify-center text-white"
          >
            <div className="space-y-6 text-center max-w-xs w-full px-6">
              {/* Logo / Title Accent */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="space-y-2"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                  <span className="text-[10px] font-bold tracking-[0.25em] text-[#1E88E5] uppercase">
                    SDY C&I ENTERPRISE
                  </span>
                </div>
                <h1 className="text-2xl font-black tracking-widest text-white mt-3">
                  SDY COMPANY
                </h1>
                <p className="text-[10px] tracking-[0.4em] text-white/50 uppercase">
                  CONSTRUCTION & INTERIOR
                </p>
              </motion.div>

              {/* Ultra-slim elegant line-loader progress */}
              <div className="h-[2px] w-full bg-white/10 rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute h-full left-0 top-0 bg-gradient-to-r from-[#1E88E5] to-[#0A4DA3] rounded-full"
                />
              </div>
              
              <p className="text-[9px] text-white/40 tracking-wider font-mono">
                Establishing Rigidity & Bespoke Luxury...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SEO Manager Dynamic Handler */}
      <SEOManager currentView={currentView} />

      {/* Persistent Glassmorphism Sticky Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onSearch={handleGlobalSearch}
      />

      {/* Main Page Layout Switcher */}
      <main className="pt-20 sm:pt-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            
            {/* 1. HOME VIEW */}
            {currentView === 'home' && (
              <div className="space-y-24 pb-24">
                
                {/* Large Full Screen Animated Hero Banner */}
                <Hero onNavigate={handleNavigate} />

                {/* Company Introduction Section */}
                <ScrollReveal>
                  <section id="intro-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                      
                      {/* Left details */}
                      <div className="lg:col-span-7 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0A4DA3]/5 dark:bg-[#1E88E5]/10 rounded-full">
                          <Sparkles className="w-4 h-4 text-[#0A4DA3] dark:text-[#1E88E5]" />
                          <span className="text-xs sm:text-sm font-bold tracking-[0.2em] text-[#0A4DA3] dark:text-[#1E88E5] uppercase">
                            {t('intro.tag', 'Corporate Profile')}
                          </span>
                        </div>
                        
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#101828] dark:text-white tracking-tight leading-tight">
                          {homepageData?.hero_section?.hero_title?.[currentLang] || t('intro.title', 'Integrated Engineering & Bespoke Interior Contracting')}
                        </h2>
                        
                        <p className="text-sm sm:text-base text-[#101828]/60 dark:text-white/60 leading-relaxed font-normal">
                          {homepageData?.hero_section?.hero_subtitle?.[currentLang] || t('intro.desc', "At SDY Company C&I, we have unified Cambodia's premium interior design fit-out division with our massive high-precision manufacturing mill. Based in Phnom Penh, we build turn-key commercial renovations, high-durability pre-engineered metal plants, and double-glazed curtain facades under rigorous international quality controls.")}
                        </p>

                        <button
                          onClick={() => handleNavigate('about')}
                          className="group inline-flex items-center gap-2.5 px-5.5 py-3 rounded-xl bg-gradient-to-r from-[#0A4DA3] to-[#1E88E5] text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-[1.02] transition-all"
                        >
                          {homepageData?.hero_section?.hero_cta_primary?.label?.[currentLang] || t('hero.explore', 'Explore Corporate Profile')}
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                        </button>
                      </div>

                      {/* Right Bento Panel: Stats & Experience counter cards */}
                      <div className="lg:col-span-5 grid grid-cols-2 gap-4.5">
                        {[
                          { label: 'Factory Area', value: homepageData?.company_stats?.factory_area || '4,500 sqm' },
                          { label: 'Completed Projects', value: homepageData?.company_stats?.completed_projects || '450+' },
                          { label: 'Experienced Craftsmen', value: homepageData?.company_stats?.experienced_craftsmen || '180+' },
                          { label: 'Years Excellence', value: homepageData?.company_stats?.years_excellence || '8+' }
                        ].map((stat, idx) => (
                          <div
                            key={idx}
                            className="p-6 rounded-2xl bg-white dark:bg-dark border border-black/[0.03] dark:border-white/[0.03] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-center space-y-2 sleek-card"
                          >
                            <span className="text-2xl sm:text-3xl font-black text-[#0A4DA3] dark:text-[#1E88E5] tracking-tight block">
                              <AnimatedCounter value={stat.value} />
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-[#101828]/60 dark:text-white/60 uppercase tracking-wider block">
                              {stat.label}
                            </span>
                          </div>
                        ))}
                        
                        {/* Full-width callout inside bento */}
                        <div className="col-span-2 p-5 rounded-2xl bg-gradient-to-r from-[#0A4DA3]/5 to-[#1E88E5]/10 border border-[#0A4DA3]/10 dark:border-white/10 flex items-center gap-4">
                          <div className="w-10 h-10 bg-white dark:bg-[#101828] rounded-xl flex items-center justify-center shadow-md">
                            <ShieldCheck className="w-5.5 h-5.5 text-[#1E88E5]" />
                          </div>
                          <div className="text-sm">
                            <p className="font-bold text-[#101828] dark:text-white">{t('intro.registered_auth', 'Registered Contracting Authority')}</p>
                            <p className="text-[#101828]/70 dark:text-white/70 mt-0.5 text-xs sm:text-sm">
                              {homepageData?.company_stats?.assurance_text?.[currentLang] || t('intro.registered_auth_desc', 'Licensed for architectural planning and heavy industrial steel assembly in Cambodia.')}
                            </p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </section>
                </ScrollReveal>

                {/* Core Services Teaser Section */}
                <ScrollReveal delay={0.1}>
                  <section className="bg-[#F7F9FC] dark:bg-[#101828]/30 py-24 border-t border-b border-black/[0.03] dark:border-white/5">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                      
                      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-3 max-w-2xl">
                          <span className="text-sm sm:text-base font-bold tracking-[0.2em] text-[#0A4DA3] dark:text-[#1E88E5] uppercase block">{t('intro.divisions_tag', 'Divisions')}</span>
                          <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#101828] dark:text-white tracking-tight">
                            {homepageData?.capabilities?.capabilities_title?.[currentLang] || t('services.title', 'Our Core Industrial Capabilities')}
                          </h3>
                          <p className="text-sm sm:text-base text-[#101828]/70 dark:text-white/70 leading-relaxed">
                            {t('services.subtitle', 'We operate multiple modern manufacturing lines across Cambodia, ensuring premium materials, rigid steel trusses, high-performance acoustic doors, and luxury joinery.')}
                          </p>
                        </div>
                        <button
                          onClick={() => handleNavigate('services')}
                          className="shrink-0 inline-flex items-center gap-1.5 px-6 py-3 rounded-xl border border-[#0A4DA3]/20 hover:border-[#0A4DA3] text-sm font-bold uppercase tracking-wider text-[#0A4DA3] dark:text-[#1E88E5] transition-colors bg-white dark:bg-[#101828]"
                        >
                          {t('services.explore_all', 'Explore All Services')} &rarr;
                        </button>
                      </div>

                      {/* Preview list of capabilities */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {(homepageData?.capabilities?.items && homepageData.capabilities.items.length > 0
                          ? homepageData.capabilities.items
                          : [
                              { id: 'cap_1', title: { km: 'Advanced Machinery', en: 'Advanced Machinery', ko: 'Advanced Machinery' }, description: { km: 'Operated with modern precision machinery', en: 'Operated with modern precision machinery for high-efficiency woodworking and interior joinery.', ko: 'Operated with modern precision machinery' }, icon_type: 'Cpu' },
                              { id: 'cap_2', title: { km: 'High-Quality Doors', en: 'High-Quality Doors', ko: 'High-Quality Doors' }, description: { km: 'Modern, high-quality doors', en: 'Modern, high-quality doors supplied to major corporations and high-end architectural developments.', ko: 'Modern, high-quality doors' }, icon_type: 'DoorClosed' },
                              { id: 'cap_3', title: { km: 'Bespoke Interior Decor', en: 'Bespoke Interior Decor', ko: 'Bespoke Interior Decor' }, description: { km: 'Custom interior decor solutions', en: 'Custom interior decor solutions, architectural wall panelling, metal accents, and luxury finishings.', ko: 'Custom interior decor solutions' }, icon_type: 'Layers' }
                            ]
                        ).map((cap, idx) => {
                          const IconComponent = cap.icon_type === 'Cpu' ? Cpu : cap.icon_type === 'DoorClosed' ? Factory : Layers;
                          return (
                            <div
                              key={cap.id || idx}
                              className="p-8 rounded-2xl bg-white dark:bg-dark border border-black/5 dark:border-white/5 shadow-sm hover:shadow-md hover:-translate-y-1.5 transition-all duration-300 space-y-5 sleek-card"
                            >
                              <div className="w-12 h-12 rounded-lg bg-[#0A4DA3]/5 dark:bg-[#1E88E5]/15 flex items-center justify-center text-[#0A4DA3] dark:text-[#1E88E5]">
                                <IconComponent className="w-6 h-6" />
                              </div>
                              <h4 className="font-bold text-lg sm:text-xl text-[#101828] dark:text-white">
                                {cap.title?.[currentLang] || cap.title?.en}
                              </h4>
                              <p className="text-sm sm:text-base text-[#101828]/70 dark:text-white/70 leading-relaxed">
                                {cap.description?.[currentLang] || cap.description?.en}
                              </p>
                              <button
                                onClick={() => handleNavigate('services')}
                                className="text-sm font-bold text-[#0A4DA3] dark:text-[#1E88E5] hover:underline flex items-center gap-1"
                              >
                                {t('services.explore_specs', 'Explore specs')} &rarr;
                              </button>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  </section>
                </ScrollReveal>

                {/* Portfolio Showcase Teaser */}
                <ScrollReveal>
                  <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                      <div className="space-y-3">
                        <span className="text-sm sm:text-base font-bold tracking-[0.2em] text-[#0A4DA3] dark:text-[#1E88E5] uppercase block">{t('intro.landmarks_tag', 'Landmarks')}</span>
                        <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#101828] dark:text-white tracking-tight">{t('projects.recent_completions', 'Recent Project completions')}</h3>
                      </div>
                      <button
                        onClick={() => handleNavigate('projects')}
                        className="shrink-0 inline-flex items-center gap-1.5 px-6 py-3 rounded-xl border border-[#0A4DA3]/20 hover:border-[#0A4DA3] text-sm font-bold uppercase tracking-wider text-[#0A4DA3] dark:text-[#1E88E5] transition-colors bg-white dark:bg-[#101828]"
                      >
                        {t('projects.browse_portfolio', 'Browse Portfolio System')} &rarr;
                      </button>
                    </div>

                    {/* Highlights 2 items */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {projects && projects.slice(0, 2).map((project) => (
                        <div
                          key={project.id}
                          onClick={() => handleNavigate('projects')}
                          className="group cursor-pointer rounded-2xl bg-white dark:bg-dark border border-black/5 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1.5 transition-all duration-300 sleek-card"
                        >
                          <div className="relative aspect-[16/9] overflow-hidden bg-black/10">
                            <img
                              src={transformGoogleDriveUrl(project.coverImage) || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800"}
                              alt={project.title}
                              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                            <span className="absolute top-4 left-4 px-3.5 py-1.5 bg-[#0A4DA3] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg shadow-md">
                              {t('projects.cat_' + project.category.toLowerCase(), project.category)}
                            </span>
                          </div>
                          <div className="p-6.5 space-y-2">
                            <h4 className="font-bold text-lg sm:text-xl text-[#101828] dark:text-white group-hover:text-[#0A4DA3] dark:group-hover:text-[#1E88E5] transition-colors">
                              {language === 'km' ? project.Title_KH || project.title : language === 'ko' ? project.Title_KO || project.title : project.Title_EN || project.title}
                            </h4>
                            <p className="text-sm sm:text-base text-[#101828]/70 dark:text-white/70 line-clamp-2 leading-relaxed">
                              {language === 'km' ? project.Description_KH || project.description : language === 'ko' ? project.Description_KO || project.description : project.Description_EN || project.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </ScrollReveal>

                {/* Factory specifications Teaser */}
                <ScrollReveal>
                  <section className="bg-[#101828] text-white py-24 overflow-hidden relative">
                    {/* Spotlights */}
                    <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-[#0A4DA3]/20 rounded-full blur-[100px] pointer-events-none" />
                    
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        
                        <div className="lg:col-span-6 space-y-6">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                            <Factory className="w-4 h-4 text-[#1E88E5] animate-pulse" />
                            <span className="text-xs sm:text-sm font-bold tracking-[0.25em] text-[#1E88E5] uppercase">{t('home.factory_tag', 'Joinery & Steel Plant')}</span>
                          </div>
                          
                          <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                            {homepageData?.manufacturing_machinery?.section_title?.[currentLang] || t('home.factory_title', '4,500 sqm State-of-the-Art Factory')}
                          </h3>
                          
                          <p className="text-xs sm:text-sm text-white/75 leading-relaxed font-normal">
                            {homepageData?.manufacturing_machinery?.description?.[currentLang] || t('home.factory_desc', "Located strategically along National Road 3, our heavy engineering and wood joinery plant is equipped with German CNC cutting machinery, automatic timber kiln dryers, and standard load-testing trusses.")}
                          </p>

                          <div className="space-y-3">
                            {(homepageData?.manufacturing_machinery?.features || []).slice(0, 3).map((feat, fIdx) => (
                              <div key={fIdx} className="flex gap-2.5 items-center text-xs text-white/90 font-bold">
                                <CheckCircle2 className="w-4.5 h-4.5 text-[#1E88E5] shrink-0" />
                                {feat?.[currentLang] || feat?.en}
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={() => handleNavigate('about')}
                            className="px-6 py-3.5 bg-[#0A4DA3] hover:bg-[#1E88E5] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg transition-colors"
                          >
                            {t('home.factory_btn', 'View Factory Certificates')}
                          </button>
                        </div>

                        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="aspect-square rounded-2xl overflow-hidden bg-zinc-950 border border-white/5">
                            <img
                              src={transformGoogleDriveUrl(homepageData?.manufacturing_machinery?.gallery_images?.[0]) || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800"}
                              alt="German CNC laser milling"
                              className="w-full h-full object-cover filter brightness-90 hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800";
                              }}
                            />
                          </div>
                          <div className="space-y-4">
                            <div className="aspect-[16/10] sm:aspect-square rounded-2xl overflow-hidden bg-zinc-950 border border-white/5">
                              <img
                                src={transformGoogleDriveUrl(homepageData?.manufacturing_machinery?.gallery_images?.[1]) || "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800"}
                                alt="Timber kiln dryers"
                                className="w-full h-full object-cover filter brightness-90 hover:scale-105 transition-transform duration-500"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800";
                                }}
                              />
                            </div>
                            <div className="aspect-[16/10] sm:aspect-square rounded-2xl overflow-hidden bg-zinc-950 border border-white/5 hidden sm:block">
                              <img
                                src={transformGoogleDriveUrl(homepageData?.manufacturing_machinery?.gallery_images?.[2]) || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800"}
                                alt="Automated Joinery Plant"
                                className="w-full h-full object-cover filter brightness-90 hover:scale-105 transition-transform duration-500"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800";
                                }}
                              />
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </section>
                </ScrollReveal>

                {/* Why Choose Us Section */}
                <ScrollReveal>
                  <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                    <div className="text-center max-w-2xl mx-auto space-y-3">
                      <span className="text-xs sm:text-sm font-bold tracking-[0.2em] text-[#0A4DA3] dark:text-[#1E88E5] uppercase block">{t('home.why_choose_tag', 'Merits')}</span>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-[#101828] dark:text-white tracking-tight">{t('home.why_choose_title', 'Why Cambodia Developers Prefer SDY')}</h3>
                      <p className="text-xs sm:text-sm text-[#101828]/60 dark:text-white/60">{t('home.why_choose_desc', 'We bridge architectural design with heavy manufacturing to establish exceptional risk mitigation.')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {(homepageData?.why_choose_sdy?.reasons && homepageData.why_choose_sdy.reasons.length > 0
                        ? homepageData.why_choose_sdy.reasons
                        : [
                            { id: 'reason_1', step_number: '01', title: { km: 'German Mill CNC Accuracy', en: 'German Mill CNC Accuracy', ko: 'German Mill CNC Accuracy' }, description: { km: 'Precision milling guarantees tolerance', en: 'Precision milling guarantees that complex architectural designs translate exactly to wood joinery profiles with 0.1mm tolerance.', ko: 'Precision milling guarantees tolerance' } },
                            { id: 'reason_2', step_number: '02', title: { km: 'Strict Kiln Lumber Drying', en: 'Strict Kiln Lumber Drying', ko: 'Strict Kiln Lumber Drying' }, description: { km: 'Our internal seasoning kilns lower moisture', en: 'Our internal seasoning kilns lower wood moisture levels to 10-12%, completely preventing warping or cracking under Cambodia humid weather.', ko: 'Our internal seasoning kilns lower moisture' } },
                            { id: 'reason_3', step_number: '03', title: { km: 'UL Certified Security Doors', en: 'UL Certified Security Doors', ko: 'UL Certified Security Doors' }, description: { km: 'Independently validated fire doors', en: 'Independently validated fire doors engineered with expanding intumescent smoke gaskets to block heat transfer for up to two hours.', ko: 'Independently validated fire doors' } }
                          ]
                      ).map((reason, rIdx) => (
                        <div key={reason.id || rIdx} className="p-8 rounded-2xl bg-white dark:bg-dark border border-black/5 dark:border-white/5 shadow-sm hover:shadow-md hover:-translate-y-1.5 transition-all duration-300 space-y-4 sleek-card">
                          <div className="w-11 h-11 bg-blue-50 dark:bg-blue-950/20 text-[#0A4DA3] dark:text-[#1E88E5] rounded-xl flex items-center justify-center font-bold">
                            {reason.step_number || `0${rIdx + 1}`}
                          </div>
                          <h4 className="font-bold text-base text-[#101828] dark:text-white">
                            {reason.title?.[currentLang] || reason.title?.en}
                          </h4>
                          <p className="text-xs text-[#101828]/60 dark:text-white/60 leading-relaxed">
                            {reason.description?.[currentLang] || reason.description?.en}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                </ScrollReveal>

                {/* Our Systematic Process */}
                <ScrollReveal>
                  <section className="bg-[#F7F9FC] dark:bg-[#101828]/40 py-24 border-t border-b border-black/[0.03] dark:border-white/5">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                      
                      <div className="text-center max-w-2xl mx-auto space-y-3">
                        <span className="text-xs sm:text-sm font-bold tracking-[0.2em] text-[#0A4DA3] dark:text-[#1E88E5] uppercase block">
                          {homepageData?.operational_workflow?.section_tag?.[currentLang] || homepageData?.operational_workflow?.section_tag?.en || t('home.process_tag', 'Execution')}
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-[#101828] dark:text-white tracking-tight">
                          {homepageData?.operational_workflow?.section_title?.[currentLang] || homepageData?.operational_workflow?.section_title?.en || t('home.process_title', 'Our Four-Step Operational Workflow')}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#101828]/60 dark:text-white/60">
                          {homepageData?.operational_workflow?.section_subtitle?.[currentLang] || homepageData?.operational_workflow?.section_subtitle?.en || t('home.process_desc', 'Delivering structural integrity and exquisite aesthetic finishes systematically.')}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {(homepageData?.operational_workflow?.steps && homepageData.operational_workflow.steps.length > 0
                          ? homepageData.operational_workflow.steps
                          : PROCESS_STEPS.map(s => ({
                              step_number: s.num,
                              title: { km: t('process.step' + s.num + '.title', s.title), en: s.title, ko: s.title },
                              description: { km: t('process.step' + s.num + '.desc', s.desc), en: s.desc, ko: s.desc }
                            }))
                        ).map((step, sIdx) => (
                          <div key={step.step_number || sIdx} className="space-y-4 relative hover:translate-y-[-4px] transition-transform duration-300">
                            <span className="text-4xl font-black text-[#0A4DA3]/15 dark:text-white/10 tracking-wider block font-display">
                              {step.step_number || `0${sIdx + 1}`}
                            </span>
                            <h4 className="font-bold text-base text-[#101828] dark:text-white">
                              {step.title?.[currentLang] || step.title?.en}
                            </h4>
                            <p className="text-xs text-[#101828]/60 dark:text-white/60 leading-relaxed">
                              {step.description?.[currentLang] || step.description?.en}
                            </p>
                          </div>
                        ))}
                      </div>

                    </div>
                  </section>
                </ScrollReveal>

                {/* Dedicated Featured Products Showcase Section */}
                <ScrollReveal>
                  <FeaturedProductsShowcase onNavigate={handleNavigate} />
                </ScrollReveal>

                {/* Client Reviews & Testimonials Section */}
                <ScrollReveal>
                  <TestimonialsSection />
                </ScrollReveal>

                {/* News & Blogs Teaser */}
                <ScrollReveal>
                  <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                      <div className="space-y-3">
                        <span className="text-xs sm:text-sm font-bold tracking-[0.25em] text-[#0A4DA3] dark:text-[#1E88E5] uppercase block">{t('home.blogs_tag', 'Latest Publications')}</span>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-[#101828] dark:text-white tracking-tight">{t('blog.title', 'Corporate Insights & Building Tech')}</h3>
                      </div>
                      <button
                        onClick={() => handleNavigate('blogs')}
                        className="shrink-0 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-[#0A4DA3]/20 hover:border-[#0A4DA3] text-xs font-bold uppercase tracking-wider text-[#0A4DA3] dark:text-[#1E88E5] transition-colors bg-white dark:bg-[#101828]"
                      >
                        {t('blog.read_journal', 'Read Technical Journal')} &rarr;
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {blogs && blogs.slice(0, 3).map((post) => (
                        <div
                          key={post.id}
                          onClick={() => handleNavigate('blogs')}
                          className="group cursor-pointer rounded-2xl bg-[#F7F9FC] dark:bg-[#101828]/40 border border-black/5 dark:border-white/5 overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
                        >
                          <div className="relative aspect-[16/10] overflow-hidden bg-black/10">
                            <img
                              src={post.image || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800"}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="p-5.5 space-y-3">
                            <span className="text-[11px] font-bold text-[#0A4DA3] dark:text-[#1E88E5] uppercase tracking-wider block">
                              {t('blog.cat.' + post.category.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_'), post.category)}
                            </span>
                            <h4 className="font-bold text-sm sm:text-base text-[#101828] dark:text-white group-hover:text-[#0A4DA3] dark:group-hover:text-[#1E88E5] transition-colors line-clamp-2">
                              {language === 'km' ? post.Title_KH || post.title : language === 'ko' ? post.Title_KO || post.title : post.Title_EN || post.title}
                            </h4>
                            <p className="text-xs text-[#101828]/60 dark:text-white/60 line-clamp-2 leading-relaxed">
                              {language === 'km' ? post.Excerpt_KH || post.excerpt : language === 'ko' ? post.Excerpt_KO || post.excerpt : post.Excerpt_EN || post.excerpt}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </ScrollReveal>

                {/* Quick Contact Form Teaser */}
                <ScrollReveal>
                  <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-[#101828] via-[#0A4DA3] to-[#1E88E5] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
                      {/* Decorative spotlights */}
                      <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-white/10 rounded-full blur-[80px] pointer-events-none" />
                      
                      <div className="space-y-4 max-w-xl relative z-10">
                        <span className="text-xs sm:text-sm font-bold tracking-[0.25em] text-white/80 uppercase block">
                          {t('home.consultations_tag', 'Consultations')}
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                          {t('home.consultations_title', 'Need a Certified Technical Proposal?')}
                        </h3>
                        <p className="text-xs sm:text-sm text-white/85 leading-relaxed font-normal">
                          {t('home.consultations_desc', 'Coordinate with our engineering estimators. Send site dimensions or structural specs and download compliance certificates directly.')}
                        </p>
                      </div>

                      <div className="relative z-10 shrink-0">
                        <button
                          onClick={() => handleNavigate('contact')}
                          className="px-8 py-4 rounded-xl bg-white text-[#0A4DA3] hover:bg-white/95 text-xs sm:text-sm font-bold tracking-wider uppercase shadow-xl transition-all hover:scale-102 flex items-center gap-2"
                        >
                          <MessageSquare className="w-4 h-4 text-[#0A4DA3]" />
                          {t('home.consultations_btn', 'Request Structural Quote')}
                        </button>
                      </div>
                    </div>
                  </section>
                </ScrollReveal>

              </div>
            )}

            <Suspense fallback={
              <div className="min-h-[500px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-medium text-slate-500">Loading module...</p>
                </div>
              </div>
            }>
              {/* 2. SERVICES TAB VIEW */}
              {currentView === 'services' && (
                <ServicesSection onNavigate={handleNavigate} />
              )}

              {/* 3. PRODUCTS TAB VIEW */}
              {currentView === 'products' && (
                <ProductsSection
                  searchQuery={globalSearchQuery}
                  onSearch={handleGlobalSearch}
                  onNavigate={handleNavigate}
                />
              )}

              {/* 4. PROJECTS TAB VIEW */}
              {currentView === 'projects' && (
                <ProjectsSection />
              )}

              {/* 5. ABOUT COMPANY VIEW */}
              {currentView === 'about' && (
                <AboutSection />
              )}

              {/* 6. NEWS VIEW */}
              {currentView === 'blogs' && (
                <BlogSection />
              )}

              {/* 7. CONTACT VIEW */}
              {currentView === 'contact' && (
                <ContactSection />
              )}

              {/* 8. ADMIN DASHBOARD VIEW */}
              {currentView === 'admin' && (
                <AdminSection />
              )}

              {/* 9. DOWNLOAD CENTER VIEW */}
              {currentView === 'downloads' && (
                <DownloadCenterSection />
              )}

              {/* 10. CAREERS VIEW */}
              {currentView === 'careers' && (
                <CareersSection />
              )}

              {/* 11. FACTORY VIEW */}
              {currentView === 'factory' && (
                <FactorySection />
              )}

              {/* 12. INTERACTIVE QUOTE VIEW */}
              {currentView === 'quote' && (
                <InteractiveQuoteSection />
              )}

              {/* 13. FAQ VIEW */}
              {currentView === 'faq' && (
                <FAQSection />
              )}
            </Suspense>

          </motion.div>
        </AnimatePresence>
      </main>

      {/* Luxury Corporate Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* FLOATING ACTION TELEGRAM & WHATSAPP SOCIAL CONTACT PANEL */}
      <div id="floating-contact-bubble" className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5">
        
        {/* Expanded Contact Panel Options */}
        <AnimatePresence>
          {isFloatingMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 15 }}
              className="p-4 rounded-2xl bg-white dark:bg-[#101828] border border-black/10 dark:border-white/10 shadow-2xl flex flex-col gap-2 min-w-[200px]"
            >
              <p className="text-[10px] font-bold text-[#101828]/50 dark:text-white/55 uppercase tracking-wider mb-1 border-b border-black/5 dark:border-white/5 pb-1">{t('floating.title', 'SDY Direct Connect')}</p>
              
              <a
                href={getTelegramUrl()}
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="no-referrer"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-xs font-semibold text-[#26A5E4] hover:bg-blue-100 transition-colors"
              >
                <Send className="w-4 h-4 shrink-0" />
                {t('floating.telegram', 'Telegram Inquiry')}
              </a>
              
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="no-referrer"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-green-50 dark:bg-green-950/20 text-xs font-semibold text-[#25D366] hover:bg-green-100 transition-colors"
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                {t('floating.whatsapp', 'WhatsApp Estimates')}
              </a>
              
              <a
                href={getPhoneUrl()}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-white/5 text-xs font-semibold text-[#101828] dark:text-white hover:bg-zinc-200 transition-colors"
              >
                <Phone className="w-4 h-4 shrink-0" />
                {companyInfo?.PhoneNumber || t('floating.phone', 'Central Phone Line')}
              </a>

              <button
                onClick={() => {
                  handleNavigate('admin');
                  setIsFloatingMenuOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors w-full text-left"
              >
                <ShieldCheck className="w-4 h-4 shrink-0 text-amber-500" />
                {t('nav.admin', 'Admin Panel')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Master Floating Toggle Button */}
        <button
          onClick={() => setIsFloatingMenuOpen(!isFloatingMenuOpen)}
          className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#0A4DA3] to-[#1E88E5] text-white flex items-center justify-center shadow-xl shadow-[#0A4DA3]/35 hover:scale-105 transition-transform"
          aria-label={t('floating.hub_tooltip', 'Direct Connect channels')}
          title={t('floating.hub_tooltip', 'Direct Contact Hub')}
        >
          {isFloatingMenuOpen ? (
            <span className="font-extrabold text-sm">✕</span>
          ) : (
            <MessageSquare className="w-6 h-6 animate-pulse" />
          )}
        </button>

        {/* Back To Top Action Button */}
        {showBackToTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#101828] text-[#101828] dark:text-white border border-black/10 dark:border-white/10 flex items-center justify-center shadow-lg hover:-translate-y-1 transition-all"
            aria-label={t('floating.back_to_top', 'Back To Top')}
            title={t('floating.scroll_to_top', 'Scroll To Top')}
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}

      </div>

    </div>
  );
}
