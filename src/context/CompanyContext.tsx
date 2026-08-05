import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import companyService, { FullDatabasePayload } from '../services/companyService';
import { Product, Project, BlogPost, ContactMessage, Service, TeamMember, HeroBannerItem, PartnerItem, BranchItem, CareerItem, FAQItem, DownloadItem, TestimonialItem, CertificateItem, TranslationRow } from '../types';

interface CompanyContextType {
  data: FullDatabasePayload;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
  refreshData: () => Promise<void>;
  
  // Unified cloud save helpers with direct POST and toast responses
  saveProducts: (products: Product[]) => Promise<{ success: boolean; message: string }>;
  saveProjects: (projects: Project[]) => Promise<{ success: boolean; message: string }>;
  saveBlogs: (blogs: BlogPost[]) => Promise<{ success: boolean; message: string }>;
  saveCategories: (categories: any[]) => Promise<{ success: boolean; message: string }>;
  saveCompanyInfo: (info: Record<string, any>) => Promise<{ success: boolean; message: string }>;
  saveTestimonials: (testimonials: TestimonialItem[]) => Promise<{ success: boolean; message: string }>;
  saveHomepageCMS: (cms: any) => Promise<{ success: boolean; message: string }>;
  saveServicesCMS: (cms: any) => Promise<{ success: boolean; message: string }>;
  saveAboutCMS: (cms: any) => Promise<{ success: boolean; message: string }>;
  saveMessage: (message: ContactMessage) => Promise<{ success: boolean; message: string }>;
  saveOrder: (order: any) => Promise<{ success: boolean; message: string }>;
}

const emptyDatabasePayload: FullDatabasePayload = {
  products: [],
  projects: [],
  blogs: [],
  categories: [],
  messages: [],
  companyInfo: {},
  services: [],
  teamMembers: [],
  heroBanners: [],
  partners: [],
  branches: [],
  careers: [],
  faq: [],
  downloads: [],
  testimonials: [],
  certificates: [],
  translations: []
};

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<FullDatabasePayload>(emptyDatabasePayload);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');

    const apiUrl = companyService.getApiUrl();
    if (!apiUrl || !apiUrl.startsWith('http')) {
      setIsLoading(false);
      setHasError(true);
      setErrorMessage('Google Sheets Cloud Database URL (VITE_GOOGLE_SHEETS_URL) is missing or unconfigured. Please configure your Webhook URL in Admin Settings.');
      return;
    }

    try {
      const fullData = await companyService.getFullDatabaseJSON();
      setData(fullData);
      setHasError(false);
    } catch (err: any) {
      console.error('[CompanyContext] Cloud Database loading error:', err);
      setHasError(true);
      if (err.message === 'MISSING_API_URL') {
        setErrorMessage('Google Sheets Cloud Database URL (VITE_GOOGLE_SHEETS_URL) is missing or unconfigured.');
      } else {
        setErrorMessage(`Failed to connect to Google Sheets Cloud Database: ${err?.message || 'Network Communication Error'}. Please check endpoint settings.`);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();

    const handleGlobalUpdate = () => {
      refreshData();
    };

    window.addEventListener('sdy_global_db_updated', handleGlobalUpdate);
    window.addEventListener('sdy_config_updated', handleGlobalUpdate);

    return () => {
      window.removeEventListener('sdy_global_db_updated', handleGlobalUpdate);
      window.removeEventListener('sdy_config_updated', handleGlobalUpdate);
    };
  }, [refreshData]);

  const handleSaveAndRefresh = async (
    saveFn: () => Promise<{ success: boolean; message: string }>
  ) => {
    const result = await saveFn();
    if (result.success) {
      await refreshData();
      window.dispatchEvent(new Event('sdy_global_db_updated'));
    }
    return result;
  };

  const saveProducts = (products: Product[]) => 
    handleSaveAndRefresh(() => companyService.saveProducts(products));

  const saveProjects = (projects: Project[]) => 
    handleSaveAndRefresh(() => companyService.saveProjects(projects));

  const saveBlogs = (blogs: BlogPost[]) => 
    handleSaveAndRefresh(() => companyService.saveBlogs(blogs));

  const saveCategories = (categories: any[]) => 
    handleSaveAndRefresh(() => companyService.saveCategories(categories));

  const saveCompanyInfo = (info: Record<string, any>) => 
    handleSaveAndRefresh(() => companyService.saveCompanyInfo(info));

  const saveTestimonials = (testimonials: TestimonialItem[]) => 
    handleSaveAndRefresh(() => companyService.saveTestimonials(testimonials));

  const saveHomepageCMS = (cms: any) => 
    handleSaveAndRefresh(() => companyService.saveHomepageCMS(cms));

  const saveServicesCMS = (cms: any) => 
    handleSaveAndRefresh(() => companyService.saveServicesCMS(cms));

  const saveAboutCMS = (cms: any) => 
    handleSaveAndRefresh(() => companyService.saveAboutCMS(cms));

  const saveMessage = (message: ContactMessage) => 
    handleSaveAndRefresh(() => companyService.saveContactMessage(message));

  const saveOrder = (order: any) => 
    handleSaveAndRefresh(() => companyService.saveConcreteOrder(order));

  return (
    <CompanyContext.Provider value={{
      data,
      isLoading,
      hasError,
      errorMessage,
      refreshData,
      saveProducts,
      saveProjects,
      saveBlogs,
      saveCategories,
      saveCompanyInfo,
      saveTestimonials,
      saveHomepageCMS,
      saveServicesCMS,
      saveAboutCMS,
      saveMessage,
      saveOrder
    }}>
      {/* Explicit UI Error Banner if connection fails or URL missing */}
      {hasError && (
        <div className="bg-red-600 text-white px-4 py-2 text-xs md:text-sm font-medium text-center flex items-center justify-center gap-2 z-[9999] relative shadow-md">
          <span className="font-bold">⚠️ Cloud Database Warning:</span> {errorMessage}
          <button 
            onClick={refreshData}
            className="ml-3 px-2 py-0.5 bg-white text-red-700 hover:bg-gray-100 rounded text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompanyContext() {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompanyContext must be used within a CompanyProvider');
  }
  return context;
}
