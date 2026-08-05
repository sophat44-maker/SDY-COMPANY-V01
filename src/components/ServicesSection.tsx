import { useState, useMemo } from 'react';
import {
  LayoutGrid, Hammer, Sofa, Compass, DoorClosed, Shield, Flame, Grid,
  Wrench, Layers, Building2, ShoppingBag, Utensils, Landmark, Bed, Home,
  Building, ChevronRight, CheckCircle2, Cpu
} from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useServicesPage } from './ServicesContext';

interface ServicesSectionProps {
  onNavigate: (view: string) => void;
}

// Helper to render lucide icons based on mapped names
const IconRenderer = ({ name, className }: { name: string; className?: string }) => {
  switch (name) {
    case 'LayoutGrid': return <LayoutGrid className={className} />;
    case 'Hammer': return <Hammer className={className} />;
    case 'Sofa': return <Sofa className={className} />;
    case 'Compass': return <Compass className={className} />;
    case 'DoorClosed': return <DoorClosed className={className} />;
    case 'Shield': return <Shield className={className} />;
    case 'Flame': return <Flame className={className} />;
    case 'Grid': return <Grid className={className} />;
    case 'Wrench': return <Wrench className={className} />;
    case 'Layers': return <Layers className={className} />;
    case 'Building2': return <Building2 className={className} />;
    case 'ShoppingBag': return <ShoppingBag className={className} />;
    case 'Utensils': return <Utensils className={className} />;
    case 'Landmark': return <Landmark className={className} />;
    case 'Bed': return <Bed className={className} />;
    case 'Home': return <Home className={className} />;
    case 'Building': return <Building className={className} />;
    default: return <Cpu className={className} />;
  }
};

export default function ServicesSection({ onNavigate }: ServicesSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { t, language } = useLanguage();
  const { servicesPageData } = useServicesPage();
  const currentLang = (language as 'km' | 'en' | 'ko') || 'en';

  const categories = useMemo(() => {
    if (servicesPageData && Array.isArray(servicesPageData.categories) && servicesPageData.categories.length > 0) {
      return servicesPageData.categories;
    }
    return ['All', 'Design & Fit-Out', 'Doors & Manufacturing', 'Decor & Construction', 'Glass & Facade', 'Sectors'];
  }, [servicesPageData]);

  const filteredServices = useMemo(() => {
    if (!servicesPageData || !Array.isArray(servicesPageData.services_list)) return [];
    if (selectedCategory === 'All') return servicesPageData.services_list;
    return servicesPageData.services_list.filter(service => service.category_tag === selectedCategory);
  }, [selectedCategory, servicesPageData]);

  const headerTitle = servicesPageData?.header?.title?.[currentLang] || servicesPageData?.header?.title?.en || t('services.title', 'Our Core Industrial Capabilities');
  const headerSubtitle = servicesPageData?.header?.subtitle?.[currentLang] || servicesPageData?.header?.subtitle?.en || t('services.subtitle', 'We operate multiple modern manufacturing lines across Cambodia, ensuring premium materials, rigid steel trusses, high-performance acoustic doors, and luxury joinery.');

  return (
    <section id="services-page" className="py-24 bg-[#F7F9FC] dark:bg-[#101828]/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0A4DA3]/5 dark:bg-[#1E88E5]/10 rounded-full">
            <span className="text-xs sm:text-sm font-bold tracking-[0.2em] text-[#0A4DA3] dark:text-[#1E88E5] uppercase">
              {t('services.explore_specs', 'Explore specs')}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#101828] dark:text-white tracking-tight">
            {headerTitle}
          </h2>
          <p className="text-sm sm:text-base text-[#101828]/60 dark:text-white/60 leading-relaxed">
            {headerSubtitle}
          </p>
        </div>

        {/* Filter Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-white dark:bg-dark text-dark/70 dark:text-white/70 hover:text-primary dark:hover:text-accent border border-black/5 dark:border-white/5'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Services Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service) => {
            const cardTitle = service.title?.[currentLang] || service.title?.en || '';
            const cardDesc = service.description?.[currentLang] || service.description?.en || '';
            const cardAction = service.action_text?.[currentLang] || service.action_text?.en || 'Inquire Division >';

            return (
              <div
                key={service.id}
                className="group relative rounded-2xl bg-white dark:bg-dark p-8 border border-black/[0.03] dark:border-white/[0.03] shadow-sm flex flex-col justify-between overflow-hidden sleek-card"
              >
                
                {/* Glassmorphic Background Blur Accent */}
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                
                <div>
                  {/* Icon Container */}
                  <div className="w-12 h-12 rounded-xl bg-primary/5 dark:bg-accent/10 flex items-center justify-center text-primary dark:text-accent mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <IconRenderer name={service.icon_type} className="w-6 h-6" />
                  </div>

                  <span className="text-xs sm:text-sm tracking-widest font-extrabold uppercase text-primary dark:text-accent block mb-2.5">
                    {service.category_tag}
                  </span>

                  <h3 className="text-lg font-bold text-dark dark:text-white mb-3 group-hover:text-primary dark:group-hover:text-accent transition-colors">
                    {cardTitle}
                  </h3>

                  <p className="text-xs sm:text-sm text-dark/60 dark:text-white/60 leading-relaxed mb-6">
                    {cardDesc}
                  </p>
                </div>

                {/* Card Footer CTA */}
                <button
                  onClick={() => onNavigate('contact')}
                  className="mt-auto inline-flex items-center gap-1.5 text-xs font-bold text-primary dark:text-accent group-hover:underline"
                >
                  {cardAction}
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>

              </div>
            );
          })}
        </div>

        {/* Division Core Merits (Bento Layout) */}
        <div className="mt-20 rounded-3xl bg-white dark:bg-dark border border-black/5 dark:border-white/5 p-8 sm:p-12 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8 sleek-card">
          <div className="space-y-4 max-w-xl">
            <h3 className="text-xl sm:text-2xl font-bold text-dark dark:text-white">
              {t('services.guaranteed_standards', 'Guaranteed Technical Standards')}
            </h3>
            <p className="text-xs sm:text-sm text-dark/60 dark:text-white/60 leading-relaxed">
              {t('services.guaranteed_standards_desc', 'Every SDY C&I project undergoes systematic quality checkpoints. Our products are backed by compliance certifications, and structural designs are certified by accredited national engineers.')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-dark/85 dark:text-white/85">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                {t('services.iso_9001', 'ISO 9001 Structural Rigidity')}
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-dark/85 dark:text-white/85">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                {t('services.ul_fire_code', 'UL Fire Code Compliance')}
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-dark/85 dark:text-white/85">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                {t('services.soundproofing', 'Sound-proofing Decibel Tests')}
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-dark/85 dark:text-white/85">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                {t('services.traceability', 'Local Materials Traceability')}
              </div>
            </div>
          </div>
          
          <div className="shrink-0">
            <button
              onClick={() => onNavigate('contact')}
              className="px-7 py-4 bg-primary hover:bg-accent text-white text-xs sm:text-sm font-bold tracking-wider uppercase rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              {t('services.get_proposal', 'Get Engineering Proposal')}
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
