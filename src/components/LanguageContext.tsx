import React, { createContext, useContext, useState, useEffect } from 'react';
import { SEED_TRANSLATIONS, PRODUCTS, PROJECTS, BLOG_POSTS, SERVICES } from '../data';
import { TranslationRow, Product, Project, BlogPost, Service, TeamMember, FAQItem, TestimonialItem, DownloadItem, CareerItem, HeroBannerItem, CertificateItem, PartnerItem, BranchItem, formatDriveUrl } from '../types';
import { fetchAllSheetTabsData } from '../services/multiSheetService';
import ApiService, { createApiService } from '../services/ApiService';

type Language = 'en' | 'km' | 'ko';

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultVal?: string) => string;
  products: Product[];
  projects: Project[];
  blogs: BlogPost[];
  services: Service[];
  teamMembers: TeamMember[];
  heroBanners: HeroBannerItem[];
  partners: PartnerItem[];
  branches: BranchItem[];
  companyInfo: any;
  categories: any[];
  translationsList: TranslationRow[];
  careers: CareerItem[];
  faq: FAQItem[];
  downloads: DownloadItem[];
  testimonials: TestimonialItem[];
  certificates: CertificateItem[];
  isLoading: boolean;
  refreshAllData: () => Promise<void>;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [translations, setTranslations] = useState<Record<string, Record<Language, string>>>({});
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [blogs, setBlogs] = useState<BlogPost[]>(BLOG_POSTS);
  const [services, setServices] = useState<Service[]>(SERVICES);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [heroBanners, setHeroBanners] = useState<HeroBannerItem[]>([]);
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [translationsList, setTranslationsList] = useState<TranslationRow[]>([]);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [careers, setCareers] = useState<CareerItem[]>([]);
  const [faq, setFaq] = useState<FAQItem[]>([]);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch dynamic translations and multi-sheet data from Google Sheets / Apps Script Web App
  const fetchDynamicTranslations = async () => {
    setIsLoading(true);
    try {
      let webhookUrl = '';
      const savedConfig = localStorage.getItem('sdy_admin_config');
      if (savedConfig) {
        try {
          const config = JSON.parse(savedConfig);
          webhookUrl = config.googleSheetsWebhookUrl || '';
        } catch (e) {}
      }
      if (!webhookUrl || !webhookUrl.trim().startsWith('http')) {
        webhookUrl = (import.meta as any).env?.VITE_GOOGLE_SHEETS_URL || (import.meta as any).env?.VITE_GOOGLE_APPS_SCRIPT_URL || '';
      }

      const activeSpreadsheetId = localStorage.getItem('sdy_active_spreadsheet_id') || '';

      if (webhookUrl || activeSpreadsheetId) {
        let sheetData: any;
        if (webhookUrl && webhookUrl.trim().startsWith('http') && !webhookUrl.includes('docs.google.com/spreadsheets')) {
          const apiService = createApiService(webhookUrl);
          sheetData = await apiService.fetchAllDatabase();
        } else {
          sheetData = await fetchAllSheetTabsData({
            webhookUrl,
            spreadsheetId: activeSpreadsheetId
          });
        }

        if (sheetData) {
          // Company Info
          if (sheetData.companyInfo && Object.keys(sheetData.companyInfo).length > 0) {
            setCompanyInfo(sheetData.companyInfo);
            window.dispatchEvent(new Event('sdy_company_info_updated'));
          }

          // Categories
          if (sheetData.categories && sheetData.categories.length > 0) {
            setCategories(sheetData.categories);
          }

          // Products
          if (sheetData.products && sheetData.products.length > 0) {
            setProducts(sheetData.products);
            window.dispatchEvent(new Event('sdy_products_updated'));
          }

          // Projects
          if (sheetData.projects && sheetData.projects.length > 0) {
            setProjects(sheetData.projects);
          }

          // Blogs
          if (sheetData.blogs && sheetData.blogs.length > 0) {
            setBlogs(sheetData.blogs);
          }

          // Services
          if (sheetData.services && sheetData.services.length > 0) {
            setServices(sheetData.services);
          }

          // Team Members
          if (sheetData.teamMembers && sheetData.teamMembers.length > 0) {
            setTeamMembers(sheetData.teamMembers);
          }

          // Hero Banners
          if (sheetData.heroBanners && sheetData.heroBanners.length > 0) {
            setHeroBanners(sheetData.heroBanners);
          }

          // Partners
          if (sheetData.partners && sheetData.partners.length > 0) {
            setPartners(sheetData.partners);
          }

          // Branches
          if (sheetData.branches && sheetData.branches.length > 0) {
            setBranches(sheetData.branches);
          }

          // Careers
          if (sheetData.careers && sheetData.careers.length > 0) {
            setCareers(sheetData.careers);
          }

          // FAQ
          if (sheetData.faq && sheetData.faq.length > 0) {
            setFaq(sheetData.faq);
          }

          // Downloads
          if (sheetData.downloads && sheetData.downloads.length > 0) {
            setDownloads(sheetData.downloads);
          }

          // Testimonials
          let mergedTesti = sheetData.testimonials && sheetData.testimonials.length > 0 ? sheetData.testimonials : [];
          const readLocalTesti = (key: string): TestimonialItem[] => {
            const raw = localStorage.getItem(key);
            if (raw) { try { return JSON.parse(raw); } catch (e) {} }
            return [];
          };
          const customLocal = [...readLocalTesti('sdy_testimonials_custom'), ...readLocalTesti('sdy_local_testimonials')];
          if (customLocal.length > 0) {
            const existingIds = new Set(mergedTesti.map((t: any) => t.id));
            const uniqueLocal = customLocal.filter((t: any, idx: number, self: any[]) =>
              !existingIds.has(t.id) && self.findIndex((x: any) => x.id === t.id) === idx
            );
            const localMap = new Map(customLocal.map((t: any) => [t.id, t]));
            mergedTesti = mergedTesti.map((t: any) => localMap.get(t.id) || t);
            mergedTesti = [...uniqueLocal, ...mergedTesti];
          }
          if (mergedTesti.length > 0) {
            setTestimonials(mergedTesti);
          }

          // Certificates
          if (sheetData.certificates && sheetData.certificates.length > 0) {
            setCertificates(sheetData.certificates);
          }

          // Translations
          if (sheetData.translations && sheetData.translations.length > 0) {
            setTranslationsList(sheetData.translations);
            const dynamicMap: Record<string, Record<Language, string>> = {};
            sheetData.translations.forEach((row) => {
              if (row.Key) {
                dynamicMap[row.Key] = {
                  en: row.English || '',
                  km: row.Khmer || '',
                  ko: row.Korean || '',
                };
              }
            });
            setTranslations(prev => ({
              ...prev,
              ...dynamicMap
            }));
          }

          // Commercial Documents (Quotations, BOQs, Delivery Notes)
          if ((sheetData.quotations && sheetData.quotations.length > 0) ||
              (sheetData.boqs && sheetData.boqs.length > 0) ||
              (sheetData.deliveryNotes && sheetData.deliveryNotes.length > 0)) {
            window.dispatchEvent(new Event('sdy_commercial_docs_updated'));
          }

          console.log('[LanguageContext] Successfully loaded all dataset tabs from Google Sheets/Apps Script.');
        }
      }
    } catch (err) {
      console.warn('Failed to fetch dynamic multi-sheet portfolio data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Initialize translations and detect language
  useEffect(() => {
    // Transform SEED_TRANSLATIONS array to nested map for faster lookup
    const transMap: Record<string, Record<Language, string>> = {};
    SEED_TRANSLATIONS.forEach((row) => {
      transMap[row.Key] = {
        en: row.English,
        km: row.Khmer,
        ko: row.Korean,
      };
    });
    setTranslations(transMap);

    // Get saved language or detect browser language
    const savedLang = localStorage.getItem('sdy_selected_language') as Language | null;
    if (savedLang && ['en', 'km', 'ko'].includes(savedLang)) {
      setLanguageState(savedLang);
    } else {
      // Auto detect
      const browserLang = navigator.language.toLowerCase();
      let detected: Language = 'en';
      if (browserLang.startsWith('km') || browserLang.startsWith('kh')) {
        detected = 'km';
      } else if (browserLang.startsWith('ko')) {
        detected = 'ko';
      }
      setLanguageState(detected);
      localStorage.setItem('sdy_selected_language', detected);
    }

    // Initial dynamic load
    fetchDynamicTranslations();

    // Listen for config updates and model updates across the app
    const handleConfigUpdate = () => {
      fetchDynamicTranslations();
    };

    window.addEventListener('sdy_config_updated', handleConfigUpdate);
    window.addEventListener('sdy_global_db_updated', handleConfigUpdate);
    window.addEventListener('sdy_testimonials_updated', handleConfigUpdate);
    window.addEventListener('sdy_company_info_updated', handleConfigUpdate);
    window.addEventListener('sdy_products_updated', handleConfigUpdate);
    window.addEventListener('sdy_projects_updated', handleConfigUpdate);
    window.addEventListener('sdy_blogs_updated', handleConfigUpdate);
    return () => {
      window.removeEventListener('sdy_config_updated', handleConfigUpdate);
      window.removeEventListener('sdy_global_db_updated', handleConfigUpdate);
      window.removeEventListener('sdy_testimonials_updated', handleConfigUpdate);
      window.removeEventListener('sdy_company_info_updated', handleConfigUpdate);
      window.removeEventListener('sdy_products_updated', handleConfigUpdate);
      window.removeEventListener('sdy_projects_updated', handleConfigUpdate);
      window.removeEventListener('sdy_blogs_updated', handleConfigUpdate);
    };
  }, []);

  // Update document's lang attribute for language-specific styling
  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('sdy_selected_language', lang);
  };

  // Translate function & debounced missing key auto-registration queue
  const missingKeysCreated = React.useRef<Set<string>>(new Set());
  const missingKeysQueue = React.useRef<Map<string, string>>(new Map());
  const batchTimerRef = React.useRef<any>(null);

  const flushMissingKeys = async () => {
    if (missingKeysQueue.current.size === 0) return;
    const items = Array.from(missingKeysQueue.current.entries());
    missingKeysQueue.current.clear();

    try {
      // First try local backend endpoint if available
      const localRes = await fetch('/api/translations/auto-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.map(([k, v]) => ({ key: k, defaultValue: v })) })
      }).catch(() => null);

      if (localRes && localRes.ok) return;

      // Fallback to configured Google Sheets Webhook if valid and enabled
      const savedConfig = localStorage.getItem('sdy_admin_config');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        if (config.googleSheetsWebhookUrl && config.isSyncEnabled) {
          const url = config.googleSheetsWebhookUrl.trim();
          if (url.startsWith('http') && !url.includes('docs.google.com/spreadsheets')) {
            await Promise.all(items.map(([key, defaultValue]) =>
              fetch(url, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'autoCreateTranslation', key, defaultValue })
              }).catch(() => null)
            ));
          }
        }
      }
    } catch (err) {
      // Gracefully silent on missing key sync errors
    }
  };

  const queueMissingKey = (key: string, defaultVal?: string) => {
    if (missingKeysCreated.current.has(key)) return;
    missingKeysCreated.current.add(key);
    missingKeysQueue.current.set(key, defaultVal || key);

    if (batchTimerRef.current) {
      clearTimeout(batchTimerRef.current);
    }
    batchTimerRef.current = setTimeout(flushMissingKeys, 1500);
  };

  const t = React.useCallback((key: string, defaultVal?: string): string => {
    if (!key) return defaultVal || '';

    // 1. Direct lookup in current language
    const directVal = translations[key]?.[language];
    if (directVal !== undefined && directVal !== '') {
      return directVal;
    }

    // 2. Alias lookup (platform.*)
    const altKey = key.startsWith('platform.') ? key.slice(9) : 'platform.' + key;
    const altVal = translations[altKey]?.[language];
    if (altVal !== undefined && altVal !== '') {
      return altVal;
    }

    // 3. Fallback to English
    const enVal = translations[key]?.['en'] || translations[altKey]?.['en'];
    if (enVal !== undefined && enVal !== '') {
      return enVal;
    }

    // 4. Queue missing key for auto-creation
    queueMissingKey(key, defaultVal);

    return defaultVal || key;
  }, [translations, language]);

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t,
      products,
      projects,
      blogs,
      services,
      teamMembers,
      heroBanners,
      partners,
      branches,
      companyInfo,
      categories,
      translationsList,
      careers,
      faq,
      downloads,
      testimonials,
      certificates,
      isLoading,
      refreshAllData: fetchDynamicTranslations
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
