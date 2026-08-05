import { useState, useEffect, useRef, FormEvent } from 'react';
import { Menu, X, Search, Moon, Sun, ChevronDown, Award, HardHat, Sparkles, Sliders, Settings, MessageSquare, Info, Newspaper, Home, DoorClosed, Building2, ShieldCheck, Phone, Send } from 'lucide-react';
import { SERVICES } from '../data';
import { useLanguage } from './LanguageContext';
import { motion, AnimatePresence, useScroll, useSpring, useReducedMotion } from 'motion/react';
import sdyLogoImg from '../assets/images/sdy_official_logo_v2_1784772926599.jpg';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onSearch: (query: string) => void;
}

export default function Header({
  currentView,
  onNavigate,
  isDarkMode,
  onToggleDarkMode,
  onSearch
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<'services' | 'products' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  const { language, setLanguage, t, companyInfo } = useLanguage();
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

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

  const megaMenuRef = useRef<HTMLDivElement>(null);

  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mega menu on clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setActiveMegaMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close language dropdown on clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock background body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    setIsSearchOpen(false);
  };

  const menuItems = [
    { id: 'home', label: t('nav.home', 'Home'), icon: Home },
    { id: 'services', label: t('nav.services', 'Services'), icon: Sliders, hasMega: true, megaType: 'services' as const },
    { id: 'products', label: t('nav.products', 'Products'), icon: DoorClosed, hasMega: true, megaType: 'products' as const },
    { id: 'projects', label: t('nav.projects', 'Projects'), icon: Building2 },
    { id: 'about', label: t('nav.about', 'About Us'), icon: Info },
    { id: 'blogs', label: t('nav.blog', 'News & Journal'), icon: Newspaper },
    { id: 'admin', label: t('admin.gateway', 'Admin Gateway'), icon: ShieldCheck },
  ];

  const languagesList = [
    { code: 'en' as const, label: 'English', flag: '🇺🇸' },
    { code: 'km' as const, label: 'Khmer', flag: '🇰🇭' },
    { code: 'ko' as const, label: 'Korean', flag: '🇰🇷' }
  ];

  const currentLanguageObj = languagesList.find(l => l.code === language) || languagesList[0];


  return (
    <header
      id="main-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-20 flex items-center ${
        isScrolled
          ? 'glass-header border-b border-black/[0.04] dark:border-white/[0.04] shadow-sm'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      {/* Scroll Progress Indicator */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#0A4DA3] via-[#1E88E5] to-accent origin-left"
        style={{ scaleX }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full">
        <div className="flex items-center justify-between h-full gap-4 lg:gap-6">
          
          {/* Logo & Desktop Navigation Wrapper */}
          <div className="flex items-center gap-4 lg:gap-6 xl:gap-8 min-w-0 shrink-0">
            {/* Brand Logo Container */}
            <div
              id="logo-container"
              onClick={() => { onNavigate('home'); setActiveMegaMenu(null); }}
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group max-h-[56px] py-1 shrink-0"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-md border border-black/10 dark:border-white/10 group-hover:scale-105 transition-transform duration-300 shrink-0 bg-white flex items-center justify-center">
                <img
                  src={displayLogo}
                  alt="SDY Company Logo"
                  referrerPolicy="no-referrer"
                  className="max-h-10 w-auto object-contain"
                />
              </div>
              <div className="flex flex-col justify-center whitespace-nowrap shrink-0">
                <h1 className="text-xs sm:text-base font-bold text-dark dark:text-white tracking-wide group-hover:text-primary dark:group-hover:text-accent transition-colors duration-300 leading-tight">
                  SDY COMPANY
                </h1>
                <p className="text-[7px] sm:text-[9px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-primary dark:text-accent font-semibold mt-0.5 leading-tight">
                  CONSTRUCTION & INTERIOR
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav 
              id="desktop-nav" 
              className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 bg-black/[0.02] dark:bg-white/[0.02] p-1 rounded-full border border-black/[0.04] dark:border-white/[0.04] h-[52px] relative shrink-0"
              onMouseLeave={() => setHoveredItem(null)}
            >
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                const isHovered = hoveredItem === item.id;
                
                const buttonClasses = `relative flex items-center justify-center gap-1.5 xl:gap-2 px-2.5 xl:px-4 rounded-full text-xs xl:text-sm font-medium transition-colors duration-200 whitespace-nowrap h-[44px] min-h-[44px] z-10 shrink-0 ${
                  language === 'km' ? 'leading-relaxed' : ''
                } ${
                  isActive || activeMegaMenu === item.megaType
                    ? 'text-primary dark:text-accent font-semibold'
                    : 'text-dark/80 dark:text-white/80 hover:text-primary dark:hover:text-accent'
                } ${
                  (shouldReduceMotion || activeMegaMenu === item.megaType) && isActive
                    ? 'bg-white dark:bg-[#1E88E5]/10 border border-primary/10 dark:border-accent/10 shadow-sm'
                    : ''
                }`;

                const backgroundPill = (
                  <>
                    {!shouldReduceMotion && isActive && (
                      <motion.div
                        layoutId="activeNavBg"
                        className="absolute inset-0 bg-white dark:bg-[#1E88E5]/10 border border-primary/10 dark:border-accent/10 shadow-sm rounded-full -z-10"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    {!shouldReduceMotion && isHovered && !isActive && (
                      <motion.div
                        layoutId="hoverNavBg"
                        className="absolute inset-0 bg-black/[0.04] dark:bg-white/[0.06] rounded-full -z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </>
                );

                if (item.hasMega) {
                  return (
                    <div key={item.id} className="relative flex items-center">
                      <button
                        onClick={() => setActiveMegaMenu(activeMegaMenu === item.megaType ? null : item.megaType)}
                        onMouseEnter={() => setHoveredItem(item.id)}
                        className={buttonClasses}
                      >
                        {backgroundPill}
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="flex items-center">{item.label}</span>
                        <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-300 ${activeMegaMenu === item.megaType ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => { onNavigate(item.id); setActiveMegaMenu(null); }}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    className={buttonClasses}
                  >
                    {backgroundPill}
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="flex items-center">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right-side controls */}
          <div id="header-actions" className="flex items-center gap-1 sm:gap-2.5 lg:gap-4 shrink-0">
            {/* Language Switcher */}
            <div className="relative" ref={langDropdownRef}>
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold text-dark/80 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10 transition-all duration-300"
                aria-label="Select Language"
              >
                <span>{currentLanguageObj.flag}</span>
                <span className="uppercase">{currentLanguageObj.code}</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isLangDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-32 bg-white dark:bg-[#101828] border border-black/10 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="py-1">
                      {languagesList.map((lang) => (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => {
                            setLanguage(lang.code);
                            setIsLangDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs text-left font-medium transition-colors ${
                            language === lang.code
                              ? 'bg-primary/5 text-primary dark:text-accent font-semibold'
                              : 'text-dark/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5'
                          }`}
                        >
                          <span>{lang.flag}</span>
                          <span>{lang.label}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Admin Quick Switch (Settings - visible on sm+ screens) */}
            <button
              onClick={() => { onNavigate('admin'); setActiveMegaMenu(null); }}
              className={`hidden sm:flex p-2 sm:p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300 items-center justify-center relative ${
                currentView === 'admin' ? 'text-primary dark:text-accent' : 'text-dark/60 dark:text-white/60'
              }`}
              title="Admin Portal"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 animate-spin-slow" />
            </button>

            {/* Search Box - Far right, Width: 240px on desktop (xl), 180px on laptop (lg) */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden lg:flex items-center relative"
            >
              <input
                type="text"
                placeholder={t('nav.search_placeholder', 'Search catalog...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[180px] xl:w-[240px] px-4 py-2.5 pr-10 text-xs rounded-full border border-primary/20 bg-white dark:bg-dark text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition-all duration-300"
              />
              <button type="submit" className="absolute right-3.5 text-dark/60 dark:text-white/60 hover:text-primary">
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Search Icon - Only visible on tablet/mobile (<lg) */}
            <div className="flex lg:hidden">
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="p-2 sm:p-2.5 rounded-full text-dark/80 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300 flex items-center justify-center"
                aria-label="Search Catalog"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Mobile Menu Toggle (3-Line / Hamburger Menu) - Guaranteed visible on mobile & tablet (<lg) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 sm:p-2.5 lg:hidden rounded-xl text-[#004b93] dark:text-white bg-[#004b93]/10 dark:bg-white/10 hover:bg-[#004b93]/20 transition-all duration-300 flex items-center justify-center shrink-0 border border-[#004b93]/20 dark:border-white/20"
              aria-label="Toggle Navigation Menu"
              title="Open Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* MEGA MENUS (Desktop Only) */}
      {activeMegaMenu && (
        <div
          ref={megaMenuRef}
          className="hidden lg:block absolute top-20 left-0 right-0 bg-white dark:bg-[#101828] border-b border-[#0A4DA3]/10 dark:border-white/10 shadow-2xl z-40 transition-all duration-300"
        >
          <div className="max-w-7xl mx-auto px-8 py-10 grid grid-cols-4 gap-8">
            
            {activeMegaMenu === 'services' && (
              <>
                <div className="col-span-1 border-r border-[#0A4DA3]/10 dark:border-white/10 pr-6">
                  <h3 className="text-[#0A4DA3] dark:text-[#1E88E5] text-sm font-bold tracking-widest uppercase mb-3">{t('header.our_expertise', 'Our Expertise')}</h3>
                  <p className="text-xs text-[#101828]/60 dark:text-white/60 leading-relaxed mb-4">
                    {t('header.expertise_desc', 'SDY C&I designs, manufactures, and constructs with international luxury standards, supporting industrial plants to premium high-rise suites.')}
                  </p>
                  <button
                    onClick={() => { onNavigate('services'); setActiveMegaMenu(null); }}
                    className="text-xs font-bold text-[#0A4DA3] dark:text-[#1E88E5] hover:underline"
                  >
                    {t('header.view_all_18', 'View All 18 Services')} &rarr;
                  </button>
                </div>
                
                <div className="col-span-3 grid grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-xs font-bold text-[#101828] dark:text-white uppercase tracking-wider mb-2.5">{t('services.cat_design_fitout', 'Design & Fit-Out')}</h4>
                    <ul className="space-y-1.5 text-xs text-[#101828]/70 dark:text-white/70">
                      <li className="hover:text-[#0A4DA3] dark:hover:text-[#1E88E5] cursor-pointer" onClick={() => { onNavigate('services'); setActiveMegaMenu(null); }}>{t('service.s1.name', 'Interior Fit-Out')}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#101828] dark:text-white uppercase tracking-wider mb-2.5">{t('services.cat_doors_manufacturing', 'Doors & Manufacturing')}</h4>
                    <ul className="space-y-1.5 text-xs text-[#101828]/70 dark:text-white/70">
                      <li className="hover:text-[#0A4DA3] dark:hover:text-[#1E88E5] cursor-pointer" onClick={() => { onNavigate('services'); setActiveMegaMenu(null); }}>{t('header.acoustic_wood_doors', 'Acoustic Wood Doors')}</li>
                      <li className="hover:text-[#0A4DA3] dark:hover:text-[#1E88E5] cursor-pointer" onClick={() => { onNavigate('services'); setActiveMegaMenu(null); }}>{t('header.hydraulic_glass_doors', 'Hydraulic Glass Doors')}</li>
                      <li className="hover:text-[#0A4DA3] dark:hover:text-[#1E88E5] cursor-pointer" onClick={() => { onNavigate('services'); setActiveMegaMenu(null); }}>{t('header.bespoke_custom_furniture', 'Bespoke Custom Furniture')}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#101828] dark:text-white uppercase tracking-wider mb-2.5">{t('header.steel_cladding', 'Steel & Cladding')}</h4>
                    <ul className="space-y-1.5 text-xs text-[#101828]/70 dark:text-white/70">
                      <li className="hover:text-[#0A4DA3] dark:hover:text-[#1E88E5] cursor-pointer" onClick={() => { onNavigate('services'); setActiveMegaMenu(null); }}>{t('header.double_glazed_curtain_walls', 'Double-Glazed Curtain Walls')}</li>
                      <li className="hover:text-[#0A4DA3] dark:hover:text-[#1E88E5] cursor-pointer" onClick={() => { onNavigate('services'); setActiveMegaMenu(null); }}>{t('header.aluminum_glass_cladding', 'Aluminum Glass Cladding')}</li>
                      <li className="hover:text-[#0A4DA3] dark:hover:text-[#1E88E5] cursor-pointer" onClick={() => { onNavigate('services'); setActiveMegaMenu(null); }}>{t('header.facade_engineering', 'Facade Engineering')}</li>
                    </ul>
                  </div>
                </div>
              </>
            )}

            {activeMegaMenu === 'products' && (
              <>
                <div className="col-span-1 border-r border-[#0A4DA3]/10 dark:border-white/10 pr-6">
                  <h3 className="text-[#0A4DA3] dark:text-[#1E88E5] text-sm font-bold tracking-widest uppercase mb-3">{t('header.product_catalog', 'Product Catalog')}</h3>
                  <p className="text-xs text-[#101828]/60 dark:text-white/60 leading-relaxed mb-4">
                    {t('header.product_catalog_desc', 'High-durability architectural materials engineered inside our local factory with full safety and quality compliance.')}
                  </p>
                  <button
                    onClick={() => { onNavigate('products'); onSearch(''); setActiveMegaMenu(null); }}
                    className="text-xs font-bold text-[#0A4DA3] dark:text-[#1E88E5] hover:underline flex items-center gap-1"
                  >
                    {t('header.browse_catalog', 'Browse Catalog System')} &rarr;
                  </button>
                </div>
                
                <div className="col-span-3 grid grid-cols-4 gap-4">
                  {/* Category 1: Doors & Windows */}
                  <div>
                    <h4
                      className="text-xs font-bold text-[#101828] dark:text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5 cursor-pointer hover:text-primary dark:hover:text-accent transition-colors"
                      onClick={() => { onNavigate('products'); onSearch('Doors & Windows'); setActiveMegaMenu(null); }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-accent inline-block"></span>
                      {t('products.cat_doors_windows', 'Doors & Windows')}
                    </h4>
                    <ul className="space-y-1.5 text-xs text-[#101828]/70 dark:text-white/70">
                      <li className="hover:text-[#0A4DA3] dark:hover:text-[#1E88E5] cursor-pointer transition-colors" onClick={() => { onNavigate('products'); onSearch('Doors & Windows'); setActiveMegaMenu(null); }}>
                        {t('header.interior_doors', 'Interior Doors')}
                      </li>
                      <li className="hover:text-[#0A4DA3] dark:hover:text-[#1E88E5] cursor-pointer transition-colors" onClick={() => { onNavigate('products'); onSearch('Doors & Windows'); setActiveMegaMenu(null); }}>
                        {t('header.wooden_doors', 'Wooden Doors')}
                      </li>
                      <li className="hover:text-[#0A4DA3] dark:hover:text-[#1E88E5] cursor-pointer transition-colors" onClick={() => { onNavigate('products'); onSearch('Doors & Windows'); setActiveMegaMenu(null); }}>
                        {t('header.fire_rated_doors', 'Fire Rated Doors')}
                      </li>
                      <li className="hover:text-[#0A4DA3] dark:hover:text-[#1E88E5] cursor-pointer transition-colors" onClick={() => { onNavigate('products'); onSearch('Doors & Windows'); setActiveMegaMenu(null); }}>
                        {t('header.hotel_doors', 'Hotel Doors')}
                      </li>
                    </ul>
                  </div>

                  {/* Category 2: Wardrobes & Cabinets / Fitted Kitchens */}
                  <div>
                    <h4
                      className="text-xs font-bold text-[#101828] dark:text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5 cursor-pointer hover:text-primary dark:hover:text-accent transition-colors"
                      onClick={() => { onNavigate('products'); onSearch('Wardrobes & Cabinets'); setActiveMegaMenu(null); }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-accent inline-block"></span>
                      {t('products.cat_wardrobes_cabinets', 'Wardrobes & Cabinets')}
                    </h4>
                    <ul className="space-y-1 text-xs text-[#101828]/70 dark:text-white/70">
                      <li className="hover:text-[#0A4DA3] dark:hover:text-[#1E88E5] cursor-pointer transition-colors" onClick={() => { onNavigate('products'); onSearch('Fitted Kitchens'); setActiveMegaMenu(null); }}>
                        {t('header.kitchen_cabinets', 'Kitchen Cabinets')}
                      </li>
                      <li className="hover:text-[#0A4DA3] dark:hover:text-[#1E88E5] cursor-pointer transition-colors" onClick={() => { onNavigate('products'); onSearch('Wardrobes & Cabinets'); setActiveMegaMenu(null); }}>
                        {t('header.wardrobes', 'Wardrobes')}
                      </li>
                      <li className="hover:text-[#0A4DA3] dark:hover:text-[#1E88E5] cursor-pointer transition-colors" onClick={() => { onNavigate('products'); onSearch('Wardrobes & Cabinets'); setActiveMegaMenu(null); }}>
                        {t('header.tv_cabinets', 'TV Cabinets')}
                      </li>
                      <li className="hover:text-[#0A4DA3] dark:hover:text-[#1E88E5] cursor-pointer transition-colors" onClick={() => { onNavigate('products'); onSearch('Wardrobes & Cabinets'); setActiveMegaMenu(null); }}>
                        {t('header.vanity_cabinets', 'Vanity Cabinets')}
                      </li>
                      <li className="hover:text-[#0A4DA3] dark:hover:text-[#1E88E5] cursor-pointer transition-colors" onClick={() => { onNavigate('products'); onSearch('Wardrobes & Cabinets'); setActiveMegaMenu(null); }}>
                        {t('header.display_cabinets', 'Display Cabinets')}
                      </li>
                      <li className="hover:text-[#0A4DA3] dark:hover:text-[#1E88E5] cursor-pointer transition-colors" onClick={() => { onNavigate('products'); onSearch('Wardrobes & Cabinets'); setActiveMegaMenu(null); }}>
                        {t('header.bookshelves', 'Bookshelves')}
                      </li>
                    </ul>
                  </div>

                  {/* Category 3: Executive Desks & Commercial Furniture */}
                  <div>
                    <h4
                      className="text-xs font-bold text-[#101828] dark:text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5 cursor-pointer hover:text-primary dark:hover:text-accent transition-colors"
                      onClick={() => { onNavigate('products'); onSearch('Executive Desks'); setActiveMegaMenu(null); }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-accent inline-block"></span>
                      {t('products.cat_executive_desks', 'Executive Desks')}
                    </h4>
                    <ul className="space-y-1 text-xs text-[#101828]/70 dark:text-white/70">
                      <li className="hover:text-[#0A4DA3] dark:hover:text-[#1E88E5] cursor-pointer transition-colors" onClick={() => { onNavigate('products'); onSearch('Executive Desks'); setActiveMegaMenu(null); }}>
                        {t('header.reception_counters', 'Reception Counters')}
                      </li>
                      <li className="hover:text-[#0A4DA3] dark:hover:text-[#1E88E5] cursor-pointer transition-colors" onClick={() => { onNavigate('products'); onSearch('Executive Desks'); setActiveMegaMenu(null); }}>
                        {t('header.office_workstations', 'Office Workstations')}
                      </li>
                      <li className="hover:text-[#0A4DA3] dark:hover:text-[#1E88E5] cursor-pointer transition-colors" onClick={() => { onNavigate('products'); onSearch('Executive Desks'); setActiveMegaMenu(null); }}>
                        {t('header.office_desks', 'Office Desks')}
                      </li>
                      <li className="hover:text-[#0A4DA3] dark:hover:text-[#1E88E5] cursor-pointer transition-colors" onClick={() => { onNavigate('products'); onSearch('Executive Desks'); setActiveMegaMenu(null); }}>
                        {t('header.meeting_tables', 'Meeting Tables')}
                      </li>
                      <li className="hover:text-[#0A4DA3] dark:hover:text-[#1E88E5] cursor-pointer transition-colors" onClick={() => { onNavigate('products'); onSearch('Executive Desks'); setActiveMegaMenu(null); }}>
                        {t('header.conference_tables', 'Conference Tables')}
                      </li>
                    </ul>
                  </div>

                  {/* Category 4: Millwork, Cladding, Ceilings & Custom Furnishings */}
                  <div>
                    <h4
                      className="text-xs font-bold text-[#101828] dark:text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5 cursor-pointer hover:text-primary dark:hover:text-accent transition-colors"
                      onClick={() => { onNavigate('products'); onSearch('Millwork & Cladding'); setActiveMegaMenu(null); }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-accent inline-block"></span>
                      {t('products.cat_millwork_cladding', 'Millwork & Cladding')}
                    </h4>
                    <ul className="space-y-1.5 text-xs text-[#101828]/70 dark:text-white/70">
                      <li className="hover:text-[#0A4DA3] dark:hover:text-[#1E88E5] cursor-pointer transition-colors" onClick={() => { onNavigate('products'); onSearch('Millwork & Cladding'); setActiveMegaMenu(null); }}>
                        {t('header.wall_panels', 'Wall Panels')}
                      </li>
                      <li className="hover:text-[#0A4DA3] dark:hover:text-[#1E88E5] cursor-pointer transition-colors" onClick={() => { onNavigate('products'); onSearch('Commercial Ceiling'); setActiveMegaMenu(null); }}>
                        {t('products.cat_commercial_ceiling', 'Commercial Ceiling')}
                      </li>
                      <li className="hover:text-[#0A4DA3] dark:hover:text-[#1E88E5] cursor-pointer transition-colors" onClick={() => { onNavigate('products'); onSearch('Millwork & Cladding'); setActiveMegaMenu(null); }}>
                        {t('header.wooden_louvers', 'Wooden Louvers')}
                      </li>
                      <li className="hover:text-[#0A4DA3] dark:hover:text-[#1E88E5] cursor-pointer transition-colors" onClick={() => { onNavigate('products'); onSearch('Custom Furnishings'); setActiveMegaMenu(null); }}>
                        {t('products.cat_custom_furnishings', 'Custom Furnishings')}
                      </li>
                    </ul>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* FULL HEIGHT MOBILE SLIDEOUT NAVIGATION DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden flex justify-end"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 right-0 z-50 w-full sm:w-[380px] h-[100dvh] flex flex-col bg-white dark:bg-[#101828] text-[#101828] dark:text-white shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sticky Drawer Header pinned at top */}
              <div className="sticky top-0 bg-[#004b93] z-10 shrink-0 p-4 flex items-center justify-between text-white shadow-md border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl overflow-hidden bg-white p-1 shadow-md border border-white/20 shrink-0">
                    <img src={displayLogo} alt="SDY Logo" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm tracking-wide leading-tight">SDY COMPANY</h3>
                    <p className="text-[9px] uppercase tracking-widest text-amber-300 font-bold mt-0.5">CONSTRUCTION & INTERIOR</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
                  aria-label="Close Menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Scrollable Navigation Body */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-4">
                {/* Quick Search Input */}
                <div className="bg-gray-50 dark:bg-slate-900/80 p-3 rounded-2xl border border-black/5 dark:border-white/5">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      onSearch(searchQuery);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center relative"
                  >
                    <input
                      type="text"
                      placeholder={t('nav.search_placeholder', 'Search products, projects...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2.5 pr-10 text-xs rounded-xl border border-primary/20 bg-white dark:bg-[#101828] text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                    <button type="submit" className="absolute right-3 text-[#004b93] dark:text-[#1E88E5]">
                      <Search className="w-4 h-4" />
                    </button>
                  </form>
                </div>

                {/* Navigation Links List */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-gray-500 px-3 py-1">
                    {t('nav.menu_title', 'Navigation Menu')}
                  </p>
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (
                      <div key={item.id}>
                        <button
                          onClick={() => {
                            onNavigate(item.id);
                            setIsMobileMenuOpen(false);
                            setActiveMegaMenu(null);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-bold transition-all ${
                            isActive
                              ? 'bg-[#004b93] text-white shadow-md shadow-[#004b93]/20'
                              : 'text-[#101828]/80 dark:text-white/80 hover:bg-[#004b93]/5 hover:text-[#004b93] dark:hover:bg-white/5 dark:hover:text-white'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span>{item.label}</span>
                        </button>

                        {/* Subcategory shortcuts for Products */}
                        {item.id === 'products' && (
                          <div className="ml-6 my-1 pl-3 border-l-2 border-[#004b93]/20 space-y-1 text-xs">
                            <button onClick={() => { onNavigate('products'); onSearch('Doors'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-1 font-medium text-gray-600 dark:text-gray-300 hover:text-[#004b93]">
                              • {t('products.cat_doors_windows', 'Doors & Windows')}
                            </button>
                            <button onClick={() => { onNavigate('products'); onSearch('Wardrobes'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-1 font-medium text-gray-600 dark:text-gray-300 hover:text-[#004b93]">
                              • {t('products.cat_wardrobes_cabinets', 'Wardrobes & Cabinets')}
                            </button>
                            <button onClick={() => { onNavigate('products'); onSearch('Millwork'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-1 font-medium text-gray-600 dark:text-gray-300 hover:text-[#004b93]">
                              • {t('products.cat_millwork_cladding', 'Millwork & Cladding')}
                            </button>
                            <button onClick={() => { onNavigate('products'); onSearch('Kitchen'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-1 font-medium text-gray-600 dark:text-gray-300 hover:text-[#004b93]">
                              • {t('products.cat_fitted_kitchens', 'Fitted Kitchens')}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Direct Contact Buttons */}
                <div className="pt-4 border-t border-black/10 dark:border-white/10 space-y-2">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-gray-500 px-3">
                    {t('nav.contact_support', 'Direct Contact & Support')}
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href="https://t.me/SDYCOMPANY"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-500 text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-600 transition-colors shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{t('nav.telegram', 'Telegram')}</span>
                    </a>
                    <a
                      href="tel:+85512345678"
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{t('nav.call_now', 'Call Now')}</span>
                    </a>
                  </div>
                  <button
                    onClick={() => { onNavigate('contact'); setIsMobileMenuOpen(false); }}
                    className="w-full py-3 rounded-xl text-center text-xs font-extrabold uppercase tracking-wider text-white bg-gradient-to-r from-[#004b93] to-[#1E88E5] shadow-lg hover:shadow-xl transition-all"
                  >
                    {t('nav.consultation', 'Request Consultation')}
                  </button>
                </div>

                {/* Mobile Language Selector */}
                <div className="pt-4 border-t border-black/10 dark:border-white/10 pb-6">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-gray-500 px-3 mb-2">
                    {t('nav.select_language', 'Select Language')}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {languagesList.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setLanguage(lang.code)}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                          language === lang.code
                            ? 'bg-[#004b93] text-white border-[#004b93] shadow-md'
                            : 'bg-transparent text-dark/80 dark:text-white/80 border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span className="uppercase">{lang.code}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Search Modal for Tablet/Mobile (<1200px) */}
      <AnimatePresence>
        {isSearchModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 bg-[#101828]/60 backdrop-blur-sm"
            onClick={() => setIsSearchModalOpen(false)}
          >
            <motion.div
              initial={{ y: -50, scale: 0.95, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: -50, scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="w-full max-w-lg bg-white dark:bg-[#101828] rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onSearch(searchQuery);
                  setIsSearchModalOpen(false);
                }}
                className="p-4 flex items-center gap-3"
              >
                <Search className="w-5 h-5 text-dark/50 dark:text-white/50 shrink-0" />
                <input
                  type="text"
                  placeholder={t('nav.search_placeholder', 'Search catalog...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-dark dark:text-white focus:outline-none py-1"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setIsSearchModalOpen(false)}
                  className="text-dark/50 dark:text-white/50 hover:text-red-500 text-xs font-bold px-2 py-1"
                >
                  {t('projects.close', 'Close')}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
