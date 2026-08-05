import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Building2 } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { useHomepage } from './HomepageContext';
import { transformGoogleDriveUrl } from '../utils/googleDrive';

import heroSliderImage from '../assets/images/luxury_joinery_doors_1784953499593.jpg';

interface HeroProps {
  onNavigate: (view: string) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
  const { t, language, heroBanners } = useLanguage();
  const { homepageData } = useHomepage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const shouldReduceMotion = useReducedMotion();

  const hero = homepageData?.hero_section;
  const currentLang = (language as 'km' | 'en' | 'ko') || 'en';

  const cmsTitle = hero?.hero_title?.[currentLang] || t('hero.title', 'Integrated Engineering & Bespoke Interior Contracting');
  const cmsSubtitle = hero?.hero_subtitle?.[currentLang] || t('hero.subtitle', "Phnom Penh's leading full-scale manufacturing mill & premium contractor.");
  const cmsCtaPrimary = hero?.hero_cta_primary?.label?.[currentLang] || t('hero.explore', 'Explore Corporate Profile');
  const cmsCtaSecondary = hero?.hero_cta_secondary?.label?.[currentLang] || t('nav.contact', 'Contact');
  const cmsBgImage = transformGoogleDriveUrl(hero?.bg_image_url) || heroSliderImage;

  const defaultSlides = [
    {
      image: cmsBgImage,
      subtitle: t('intro.tag', 'Premium Corporate Fit-Out'),
      title: cmsTitle,
      description: cmsSubtitle,
      tag: t('intro.tag', 'Premium Corporate Fit-Out'),
      icon: Building2
    }
  ];

  const HERO_SLIDES = (heroBanners && heroBanners.length > 0)
    ? heroBanners.map((b) => ({
        image: transformGoogleDriveUrl(b.image) || cmsBgImage,
        subtitle: b.subtitle || b.tag || 'SDY C&I',
        title: b.title || cmsTitle,
        description: b.description || cmsSubtitle,
        tag: b.tag || 'Featured',
        icon: Building2
      }))
    : defaultSlides;

  // Preload background images to eliminate network-induced flickering
  useEffect(() => {
    HERO_SLIDES.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
    });
  }, []);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (shouldReduceMotion) return;
    const { clientX, clientY } = e;
    // Normalize coordinates around the screen center: range [-1, 1]
    const x = (clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    const y = (clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    setCoords({ x, y });
  };

  const handleMouseLeave = () => {
    setCoords({ x: 0, y: 0 });
  };

  const SlideIcon = HERO_SLIDES[currentSlide].icon;

  // Stagger variants for the text group
  const textContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15
      }
    }
  };

  const textItemVariants = {
    hidden: shouldReduceMotion 
      ? { opacity: 0 } 
      : { opacity: 0, y: 18 },
    visible: shouldReduceMotion 
      ? { opacity: 1 } 
      : { 
          opacity: 1, 
          y: 0, 
          transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
        }
  };

  return (
    <section 
      id="hero-section" 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative h-screen w-full overflow-hidden bg-[#101828]"
    >
      
      {/* Background Slideshow with GPU-accelerated slow-zoom (Ken Burns) and parallax */}
      <div className="absolute inset-0">
        {HERO_SLIDES.map((slide, index) => {
          const isActive = currentSlide === index;
          return (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-[1200ms] ease-in-out ${
                isActive ? 'opacity-100 z-0' : 'opacity-0 -z-10'
              }`}
            >
              {/* The Background Image */}
              <motion.img
                src={slide.image}
                alt={slide.title}
                initial={{ scale: 1.02 }}
                animate={isActive 
                  ? { 
                      scale: shouldReduceMotion ? 1.02 : 1.08,
                      x: shouldReduceMotion ? 0 : coords.x * -12,
                      y: shouldReduceMotion ? 0 : coords.y * -12
                    } 
                  : { scale: 1.02, x: 0, y: 0 }
                }
                transition={isActive 
                  ? {
                      scale: { duration: 6.5, ease: 'linear' },
                      x: { duration: 0.5, ease: 'easeOut' },
                      y: { duration: 0.5, ease: 'easeOut' }
                    }
                  : { duration: 0.5 }
                }
                className="w-full h-full object-cover object-center filter brightness-45 contrast-105"
                referrerPolicy="no-referrer"
              />
              {/* Soft Ambient Color Overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#101828]/95 via-[#101828]/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#101828] via-transparent to-black/30" />
              
              {/* Ambient Accent Blue Spotlights with inverse parallax effect */}
              <motion.div 
                animate={{
                  x: shouldReduceMotion ? 0 : coords.x * -40,
                  y: shouldReduceMotion ? 0 : coords.y * -40
                }}
                transition={{ type: 'spring', stiffness: 80, damping: 25 }}
                className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#0A4DA3]/20 rounded-full blur-[120px] pointer-events-none" 
              />
              <motion.div 
                animate={{
                  x: shouldReduceMotion ? 0 : coords.x * -55,
                  y: shouldReduceMotion ? 0 : coords.y * -55
                }}
                transition={{ type: 'spring', stiffness: 80, damping: 25 }}
                className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#1E88E5]/15 rounded-full blur-[180px] pointer-events-none" 
              />
            </div>
          );
        })}
      </div>

      {/* Hero Interactive UI Layer */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center z-10">
        
        {/* Fixed Hero Text Overlay */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={textContainerVariants}
          className="max-w-3xl space-y-6 md:space-y-8"
        >
          
          {/* Subtitle Accent Card */}
          <motion.div
            variants={textItemVariants}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#1E88E5] animate-pulse" />
            <span className="text-xs sm:text-sm font-bold tracking-[0.25em] text-[#1E88E5] uppercase transition-all duration-300">
              {t('intro.tag', 'Premium Corporate Fit-Out')}
            </span>
          </motion.div>

          {/* Headline and Static Text */}
          <div className="space-y-3">
            <motion.h1 
              variants={textItemVariants}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1]"
              style={{ minHeight: '120px' }}
            >
              {cmsTitle}
            </motion.h1>
          </div>

          {/* Description Block */}
          <motion.p 
            variants={textItemVariants}
            className="text-sm sm:text-base text-white/70 max-w-xl leading-relaxed font-normal min-h-[48px]"
          >
            {cmsSubtitle}
          </motion.p>

          {/* Call to Actions (Button Fade-Up) */}
          <motion.div
            variants={textItemVariants}
            className="flex flex-wrap gap-4 pt-2"
          >
            <button
              onClick={() => onNavigate('projects')}
              className="group px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold tracking-wider uppercase text-white bg-[#0A4DA3] hover:bg-[#1E88E5] shadow-xl shadow-[#0A4DA3]/35 flex items-center gap-2.5 transition-all duration-300 transform hover:-translate-y-1"
            >
              {cmsCtaPrimary}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold tracking-wider uppercase text-white bg-white/10 hover:bg-white/15 border border-white/10 backdrop-blur-sm flex items-center gap-2 transition-all duration-300 transform hover:-translate-y-1"
            >
              {cmsCtaSecondary}
            </button>
          </motion.div>

        </motion.div>



        {/* Carousel Slide Indicators */}
        <div className="absolute bottom-12 left-4 sm:left-8 lg:left-12 flex items-center gap-3">
          {HERO_SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentSlide === index ? 'w-10 bg-[#1E88E5]' : 'w-2 bg-white/20'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

      </div>

    </section>
  );
}
