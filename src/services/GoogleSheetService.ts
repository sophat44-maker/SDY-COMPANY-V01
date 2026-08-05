import { 
  Product, 
  Project, 
  BlogPost, 
  ContactMessage, 
  TranslationRow, 
  Service, 
  TeamMember, 
  HeroBannerItem, 
  PartnerItem, 
  BranchItem, 
  CareerItem, 
  FAQItem, 
  DownloadItem, 
  TestimonialItem, 
  CertificateItem
} from '../types';

import ApiService, { fetchWithRetry, createApiService } from './ApiService';

export interface CategoryItem {
  id: string;
  name: string;
  type: string;
}

export interface GoogleSheetDatabase {
  products: Product[];
  projects: Project[];
  blogs: BlogPost[];
  categories: CategoryItem[];
  messages: ContactMessage[];
  companyInfo: Record<string, any>;
  services: Service[];
  teamMembers: TeamMember[];
  heroBanners: HeroBannerItem[];
  partners: PartnerItem[];
  branches: BranchItem[];
  careers: CareerItem[];
  faq: FAQItem[];
  downloads: DownloadItem[];
  testimonials: TestimonialItem[];
  certificates: CertificateItem[];
  translations: TranslationRow[];
  homepageCMS?: Record<string, any>;
  servicesPageCMS?: Record<string, any>;
  aboutUsCMS?: Record<string, any>;
}

/**
 * GoogleSheetService
 * Centralized Service for fetching AND saving data directly to Google Sheets Cloud Database
 */
export class GoogleSheetService {
  private apiService: ApiService;
  private webAppUrl: string;

  constructor(webAppUrl?: string) {
    // 1. Auto-resolve Web App URL from .env if not explicitly passed
    const envUrl = 
      import.meta.env.VITE_GOOGLE_SHEETS_URL || 
      import.meta.env.VITE_GAS_API_URL || '';

    this.webAppUrl = (webAppUrl && webAppUrl.trim() !== '') ? webAppUrl.trim() : envUrl.trim();
    this.apiService = createApiService(this.webAppUrl);
  }

  /**
   * Dynamic URL Management
   */
  public setWebAppUrl(url: string) {
    this.webAppUrl = url.trim();
    this.apiService.setBaseUrl(this.webAppUrl);
  }

  public getWebAppUrl(): string {
    return this.webAppUrl || this.apiService.getBaseUrl();
  }

  /**
   * Helper function to POST data directly to Google Apps Script
   */
  private async postToGoogleSheets(action: string, payload: any): Promise<boolean> {
    const url = this.getWebAppUrl();
    if (!url || !url.startsWith('http')) {
      console.error('❌ GoogleSheetService: Invalid or missing Web App URL in .env!');
      return false;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // Crucial for bypassing Google Apps Script CORS preflight
        },
        body: JSON.stringify({
          action: action,
          data: payload,
          timestamp: new Date().toISOString()
        }),
      });

      const result = await response.json();
      if (result.status === 'success' || result.success) {
        console.log(`✅ [GoogleSheets Sync] Action '${action}' successfully saved to Google Sheets!`);
        return true;
      } else {
        console.warn(`⚠️ [GoogleSheets Sync] Server returned status:`, result);
        return false;
      }
    } catch (error) {
      console.error(`❌ [GoogleSheets Sync Error] Failed to execute '${action}':`, error);
      return false;
    }
  }

  /* =========================================================================
     READ OPERATIONS (FETCHING DATA)
     ========================================================================= */

  public async fetchProducts(): Promise<Product[]> {
    return this.apiService.fetchProducts();
  }

  public async fetchProjects(): Promise<Project[]> {
    return this.apiService.fetchProjects();
  }

  public async fetchBlog(): Promise<BlogPost[]> {
    return this.apiService.fetchBlog();
  }

  public async fetchCategories(): Promise<CategoryItem[]> {
    return this.apiService.fetchCategories();
  }

  public async fetchCompanyInfo(): Promise<Record<string, any>> {
    return this.apiService.fetchCompanyInfo();
  }

  public async fetchTranslations(): Promise<TranslationRow[]> {
    return this.apiService.fetchTranslations();
  }

  public async fetchAllDatabase(): Promise<Partial<GoogleSheetDatabase>> {
    return this.apiService.fetchAllDatabase();
  }

  /* =========================================================================
     WRITE / MUTATION OPERATIONS (SAVING TO GOOGLE SHEETS CLOUD)
     ========================================================================= */

  /**
   * Save Homepage CMS JSON payload to 'Homepage_CMS' sheet tab
   */
  public async saveHomepageCMS(payload: any): Promise<boolean> {
    return this.postToGoogleSheets('homepage_cms.save', payload);
  }

  /**
   * Save Services Page CMS JSON payload to 'Services_Page' sheet tab
   */
  public async saveServicesPageCMS(payload: any): Promise<boolean> {
    return this.postToGoogleSheets('services_page.save', payload);
  }

  /**
   * Save About Us CMS JSON payload to 'About_Us' sheet tab
   */
  public async saveAboutUsCMS(payload: any): Promise<boolean> {
    return this.postToGoogleSheets('about_us.save', payload);
  }

  /**
   * Save Client Reviews / Testimonials payload to 'Testimonials' sheet tab
   */
  public async saveTestimonials(payload: any): Promise<boolean> {
    return this.postToGoogleSheets('testimonials.save', payload);
  }

  /**
   * Save Products Database payload to 'Products' sheet tab
   */
  public async saveProducts(products: Product[]): Promise<boolean> {
    return this.postToGoogleSheets('products.save', products);
  }

  /**
   * Save Projects Database payload to 'Projects' sheet tab
   */
  public async saveProjects(projects: Project[]): Promise<boolean> {
    return this.postToGoogleSheets('projects.save', projects);
  }

  /**
   * Generic save dispatcher for any custom table action
   */
  public async saveGenericTable(action: string, data: any): Promise<boolean> {
    return this.postToGoogleSheets(action, data);
  }
}

/**
 * Singleton / Default Instance for easy import
 */
export const defaultGoogleSheetService = new GoogleSheetService();

/**
 * Factory function to create GoogleSheetService instance
 */
export function createGoogleSheetService(webAppUrl?: string): GoogleSheetService {
  return new GoogleSheetService(webAppUrl);
}

export default GoogleSheetService;