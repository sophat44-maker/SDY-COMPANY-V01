import { useState } from 'react';
import { MapPin, Expand, Calendar, Info, X, ChevronLeft, ChevronRight, HardHat } from 'lucide-react';
import { Project } from '../types';
import { useLanguage } from './LanguageContext';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

export default function ProjectsSection() {
  const { t, language, projects, isLoading } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeProjectModal, setActiveProjectModal] = useState<Project | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const shouldReduceMotion = useReducedMotion();

  const categories = ['All', 'Interior Fit-Out', 'Renovation', 'Furniture', 'Construction', 'Steel Works', 'Glass & Aluminum'];

  const filteredProjects = selectedCategory === 'All'
    ? projects
    : projects.filter(project => project.category === selectedCategory);

  const handleOpenModal = (project: Project) => {
    setActiveProjectModal(project);
    setActiveImageIndex(0);
  };

  const handleNextImage = () => {
    if (activeProjectModal) {
      setActiveImageIndex((prev) => (prev + 1) % activeProjectModal.gallery.length);
    }
  };

  const handlePrevImage = () => {
    if (activeProjectModal) {
      setActiveImageIndex((prev) => (prev - 1 + activeProjectModal.gallery.length) % activeProjectModal.gallery.length);
    }
  };

  return (
    <section id="projects-page" className="py-24 bg-white dark:bg-[#101828] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0A4DA3]/5 dark:bg-[#1E88E5]/10 rounded-full">
            <span className="text-xs sm:text-sm font-bold tracking-[0.2em] text-[#0A4DA3] dark:text-[#1E88E5] uppercase">
              {t('nav.projects', 'Projects')}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#101828] dark:text-white tracking-tight">
            {t('projects.title', 'Our Landmark Projects in Cambodia')}
          </h2>
          <p className="text-sm sm:text-base text-[#101828]/60 dark:text-white/60 leading-relaxed">
            {t('projects.subtitle', 'Examine our high-end engineering portfolio spanning grade-A corporate offices, premium seaside villas, multi-story structural steel assembly plants, and bank headquarters.')}
          </p>
        </div>

        {/* Categories Tab Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`relative px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors duration-300 whitespace-nowrap overflow-hidden ${
                  isActive
                    ? 'text-white z-10'
                    : 'text-dark/70 dark:text-white/70 hover:text-primary dark:hover:text-accent bg-white dark:bg-dark border border-black/5 dark:border-white/5'
                }`}
              >
                {isActive && !shouldReduceMotion && (
                  <motion.div
                    layoutId="activeCategoryBg"
                    className="absolute inset-0 bg-primary -z-10 shadow-lg shadow-primary/20"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {isActive && shouldReduceMotion && (
                  <div className="absolute inset-0 bg-primary -z-10 shadow-lg shadow-primary/20" />
                )}
                {category === 'All' ? t('nav.all', 'All') : t('projects.cat_' + category.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_'), category)}
              </button>
            );
          })}
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0A4DA3]"></div>
            <p className="mt-4 text-xs font-semibold text-[#101828]/50 dark:text-white/50">{t('validation.loading', 'Loading live projects from Google Sheets...')}</p>
          </div>
        ) : filteredProjects.length > 0 ? (
          <motion.div 
            layout={!shouldReduceMotion ? "position" : undefined}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project) => (
                <motion.div
                  layout={!shouldReduceMotion}
                  key={project.id}
                  initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => handleOpenModal(project)}
                  className="group cursor-pointer rounded-2xl bg-white dark:bg-dark border border-black/[0.03] dark:border-white/[0.03] overflow-hidden shadow-sm hover:shadow-xl hover:scale-[1.015] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Image Container */}
                    <div className="relative aspect-[3/2] w-full overflow-hidden">
                      <img
                        src={project.coverImage}
                        alt={project.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />
                      
                      {/* Category Badge */}
                      <span className="absolute top-4 left-4 px-3 py-1 bg-primary text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg shadow-lg">
                        {t('projects.cat_' + project.category.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_'), project.category)}
                      </span>

                      {/* Cover Metrics Overlay */}
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-accent" />
                          {project.location.split(',')[0]}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-md">
                          <Expand className="w-3.5 h-3.5 text-accent" />
                          {project.area}
                        </div>
                      </div>
                    </div>

                    {/* Information Body */}
                    <div className="p-6.5 space-y-3.5">
                      <h3 className="text-base sm:text-lg font-bold text-dark dark:text-white group-hover:text-primary dark:group-hover:text-accent transition-colors leading-snug">
                        {language === 'km' && project.ProjectName_KH ? project.ProjectName_KH : language === 'ko' && project.ProjectName_KO ? project.ProjectName_KO : project.ProjectName_EN || project.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-dark/60 dark:text-white/60 line-clamp-2 leading-relaxed">
                        {language === 'km' && project.Description_KH ? project.Description_KH : language === 'ko' && project.Description_KO ? project.Description_KO : project.Description_EN || project.description}
                      </p>
                    </div>
                  </div>

                  {/* Extra metrics */}
                  <div className="px-6.5 pb-6.5">
                    <div className="pt-3.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs font-bold text-dark/60 dark:text-white/60 uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {t('projects.year', 'Year')}: {project.completionYear}
                      </span>
                      <span className="text-primary dark:text-accent flex items-center gap-0.5">
                        {t('projects.view_portfolio', 'View Portfolio')} &rarr;
                      </span>
                    </div>
                  </div>

                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-[#101828] rounded-2xl border border-black/5 dark:border-white/5 max-w-lg mx-auto w-full col-span-full">
            <p className="text-sm font-semibold text-[#101828]/60 dark:text-white/60">{t('validation.no_results', 'No items found matching your filters.')}</p>
          </div>
        )}

      </div>

      {/* PORTFOLIO LIGHTBOX DETAIL MODAL */}
      {activeProjectModal && (
        <div className="fixed inset-0 z-50 bg-[#101828]/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="relative bg-white dark:bg-[#101828] w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border border-white/5 max-h-[90vh] flex flex-col">
            
            {/* Close Button */}
            <button
              onClick={() => setActiveProjectModal(null)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/60 text-white hover:bg-[#0A4DA3] transition-all"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12">
              
              {/* Left Column: Image Carousel */}
              <div className="lg:col-span-7 relative bg-slate-100 dark:bg-slate-900/80 flex items-center justify-center min-h-[300px] sm:min-h-[450px] p-4">
                <img
                  src={activeProjectModal.gallery[activeImageIndex] || activeProjectModal.coverImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80'}
                  alt={`${activeProjectModal.title} Slide ${activeImageIndex + 1}`}
                  className="w-full h-full object-contain max-h-[500px] rounded-xl transition-all duration-300"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80') {
                      target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80';
                    }
                  }}
                />
                
                {/* Carousel Navigation Buttons */}
                {activeProjectModal.gallery.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 p-2 rounded-full bg-black/55 text-white hover:bg-[#0A4DA3] transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 p-2 rounded-full bg-black/55 text-white hover:bg-[#0A4DA3] transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    
                    {/* Index Indicator */}
                    <span className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-3.5 py-1 text-[11px] font-bold text-white tracking-widest rounded-full">
                      {activeImageIndex + 1} / {activeProjectModal.gallery.length}
                    </span>
                  </>
                )}
              </div>

              {/* Right Column: Project Specifications */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0A4DA3]/10 text-[#0A4DA3] dark:text-[#1E88E5] text-xs font-bold uppercase tracking-wider rounded-lg">
                    <HardHat className="w-3.5 h-3.5" />
                    {t('projects.cat_' + activeProjectModal.category.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_'), activeProjectModal.category)}
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-bold text-[#101828] dark:text-white leading-tight">
                    {language === 'km' && activeProjectModal.ProjectName_KH ? activeProjectModal.ProjectName_KH : language === 'ko' && activeProjectModal.ProjectName_KO ? activeProjectModal.ProjectName_KO : activeProjectModal.ProjectName_EN || activeProjectModal.title}
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-[#101828]/60 dark:text-white/60 leading-relaxed">
                    {language === 'km' && activeProjectModal.Description_KH ? activeProjectModal.Description_KH : language === 'ko' && activeProjectModal.Description_KO ? activeProjectModal.Description_KO : activeProjectModal.Description_EN || activeProjectModal.description}
                  </p>
                </div>

                {/* Engineering Spec Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 py-4.5 border-t border-b border-black/5 dark:border-white/5">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#101828]/50 dark:text-white/50 uppercase tracking-wider block">{t('projects.location', 'Location')}</span>
                    <span className="text-xs font-bold text-[#101828]/90 dark:text-white/90 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#1E88E5] shrink-0" />
                      {t('project.' + activeProjectModal.id + '.location', activeProjectModal.location)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#101828]/50 dark:text-white/50 uppercase tracking-wider block">{t('projects.area', 'Project Area')}</span>
                    <span className="text-xs font-bold text-[#101828]/90 dark:text-white/90 flex items-center gap-1">
                      <Expand className="w-3.5 h-3.5 text-[#1E88E5] shrink-0" />
                      {activeProjectModal.area}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#101828]/50 dark:text-white/50 uppercase tracking-wider block">{t('projects.completed', 'Completed')}</span>
                    <span className="text-xs font-bold text-[#101828]/90 dark:text-white/90 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#1E88E5] shrink-0" />
                      {activeProjectModal.completionYear}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#101828]/50 dark:text-white/50 uppercase tracking-wider block">{t('projects.contract_type', 'Contract Type')}</span>
                    <span className="text-xs font-bold text-[#101828]/90 dark:text-white/90 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-[#1E88E5] shrink-0" />
                      {t('project.' + activeProjectModal.id + '.constructionType', activeProjectModal.constructionType)}
                    </span>
                  </div>
                </div>

                {/* Request Quote Button */}
                <div className="pt-2">
                  <p className="text-xs text-center text-[#101828]/60 dark:text-white/60 leading-normal mb-3.5">
                    {t('projects.need_similar', 'Need a similar premium design or engineering structure in Cambodia?')}
                  </p>
                  <button
                    onClick={() => {
                      setActiveProjectModal(null);
                      const contactEl = document.getElementById('contact-page');
                      if (contactEl) {
                        contactEl.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="w-full py-3 bg-[#0A4DA3] hover:bg-[#1E88E5] text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg transition-colors"
                  >
                    {t('projects.discuss', 'Discuss This Project')}
                  </button>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

    </section>
  );
}
