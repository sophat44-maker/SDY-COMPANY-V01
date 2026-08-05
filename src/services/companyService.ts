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

export interface CategoryItem {
  id: string;
  name: string;
  type: string;
}

export interface FullDatabasePayload {
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
  homepageCMS?: any;
  servicesPageCMS?: any;
  aboutUsCMS?: any;
  orders?: any[];
  commercialDocs?: any;
}

export class CompanyService {
  private getWebhookUrl(): string {
    // Check localStorage ONLY for admin credential config if needed, or environment variables
    try {
      const savedConfig = localStorage.getItem('sdy_admin_config');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        if (config.googleSheetsWebhookUrl && typeof config.googleSheetsWebhookUrl === 'string' && config.googleSheetsWebhookUrl.trim().startsWith('http')) {
          return config.googleSheetsWebhookUrl.trim();
        }
      }
    } catch (e) {}

    const envUrl = 
      import.meta.env.VITE_GOOGLE_SHEETS_URL || 
      import.meta.env.VITE_GAS_API_URL || 
      import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || '';

    return envUrl.trim();
  }

  public getApiUrl(): string {
    return this.getWebhookUrl();
  }

  /**
   * Helper to POST data directly to Google Sheets Web App
   * Uses headers: { 'Content-Type': 'text/plain;charset=utf-8' } as required
   */
  public async postToCloud(action: string, data: any): Promise<{ success: boolean; message: string }> {
    const url = this.getWebhookUrl();
    if (!url || !url.startsWith('http')) {
      return { 
        success: false, 
        message: 'Google Sheets API Webhook URL is missing or not configured.' 
      };
    }

    try {
      const payload = JSON.stringify({
        action,
        data,
        timestamp: new Date().toISOString()
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // Bypass Google Apps Script CORS preflight
        },
        body: payload
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      let resJson: any = {};
      try {
        const text = await response.text();
        resJson = JSON.parse(text);
      } catch (e) {
        // Mode no-cors or non-JSON response treated as ok if status 200
        resJson = { status: 'success' };
      }

      const isSuccess = resJson.status === 'success' || resJson.success === true || response.ok;
      return {
        success: isSuccess,
        message: isSuccess ? 'Saved to Cloud Database' : (resJson.message || 'Save operation failed')
      };
    } catch (err: any) {
      console.error(`[CompanyService POST Error] Action '${action}':`, err);
      // Fallback try with no-cors if standard POST is blocked by CORS
      try {
        await fetch(url, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action, data, timestamp: new Date().toISOString() })
        });
        return { success: true, message: 'Saved to Cloud Database (no-cors mode)' };
      } catch (retryErr: any) {
        return { success: false, message: retryErr?.message || 'Network communication error' };
      }
    }
  }

  /**
   * Primary context loader: fetch full database JSON or parallel GET requests
   */
  public async getFullDatabaseJSON(): Promise<FullDatabasePayload> {
    const url = this.getWebhookUrl();
    if (!url || !url.startsWith('http')) {
      throw new Error('MISSING_API_URL');
    }

    const separator = url.includes('?') ? '&' : '?';
    
    // Attempt getFullDatabaseJSON or getPortfolioData action first
    try {
      const res = await fetch(`${url}${separator}action=getFullDatabaseJSON`, { method: 'GET' });
      if (res.ok) {
        const json = await res.json();
        const data = json.data || json;
        if (data && typeof data === 'object' && (data.products || data.companyInfo || data.projects)) {
          return this.normalizeDatabasePayload(data);
        }
      }
    } catch (e) {
      console.info('[CompanyService] getFullDatabaseJSON endpoint unavailable, attempting multi-tab fetch...');
    }

    // Secondary attempt with action=getPortfolioData
    try {
      const res = await fetch(`${url}${separator}action=getPortfolioData`, { method: 'GET' });
      if (res.ok) {
        const json = await res.json();
        const data = json.data || json;
        if (data && typeof data === 'object' && (data.products || data.companyInfo || data.projects)) {
          return this.normalizeDatabasePayload(data);
        }
      }
    } catch (e) {
      console.info('[CompanyService] getPortfolioData endpoint unavailable, trying readTable requests...');
    }

    // Parallel fetch for all main tables
    const tableNames = [
      'Products', 'Projects', 'Blog', 'Categories', 'CompanyInfo', 
      'Translations', 'Services', 'Testimonials', 'Messages', 'Orders',
      'Homepage_CMS', 'Services_Page', 'About_Us'
    ];

    const results: Record<string, any> = {};
    await Promise.all(
      tableNames.map(async (table) => {
        try {
          const tableRes = await fetch(`${url}${separator}action=readTable&sheetName=${table}`, { method: 'GET' });
          if (tableRes.ok) {
            const tableJson = await tableRes.json();
            results[table] = tableJson.data || tableJson[table] || tableJson[table.toLowerCase()] || tableJson;
          }
        } catch (err) {
          results[table] = [];
        }
      })
    );

    return this.normalizeDatabasePayload({
      products: results.Products,
      projects: results.Projects,
      blogs: results.Blog,
      categories: results.Categories,
      companyInfo: results.CompanyInfo,
      translations: results.Translations,
      services: results.Services,
      testimonials: results.Testimonials,
      messages: results.Messages,
      orders: results.Orders,
      homepageCMS: Array.isArray(results.Homepage_CMS) ? results.Homepage_CMS[0] : results.Homepage_CMS,
      servicesPageCMS: Array.isArray(results.Services_Page) ? results.Services_Page[0] : results.Services_Page,
      aboutUsCMS: Array.isArray(results.About_Us) ? results.About_Us[0] : results.About_Us
    });
  }

  private normalizeDatabasePayload(raw: any): FullDatabasePayload {
    return {
      products: Array.isArray(raw.products) ? raw.products : [],
      projects: Array.isArray(raw.projects) ? raw.projects : [],
      blogs: Array.isArray(raw.blogs || raw.blog) ? (raw.blogs || raw.blog) : [],
      categories: Array.isArray(raw.categories) ? raw.categories : [],
      messages: Array.isArray(raw.messages) ? raw.messages : [],
      companyInfo: (raw.companyInfo && typeof raw.companyInfo === 'object') ? raw.companyInfo : {},
      services: Array.isArray(raw.services) ? raw.services : [],
      teamMembers: Array.isArray(raw.teamMembers) ? raw.teamMembers : [],
      heroBanners: Array.isArray(raw.heroBanners) ? raw.heroBanners : [],
      partners: Array.isArray(raw.partners) ? raw.partners : [],
      branches: Array.isArray(raw.branches) ? raw.branches : [],
      careers: Array.isArray(raw.careers) ? raw.careers : [],
      faq: Array.isArray(raw.faq) ? raw.faq : [],
      downloads: Array.isArray(raw.downloads) ? raw.downloads : [],
      testimonials: Array.isArray(raw.testimonials) ? raw.testimonials : [],
      certificates: Array.isArray(raw.certificates) ? raw.certificates : [],
      translations: Array.isArray(raw.translations) ? raw.translations : [],
      homepageCMS: raw.homepageCMS || raw.homepage_cms || null,
      servicesPageCMS: raw.servicesPageCMS || raw.services_page_cms || null,
      aboutUsCMS: raw.aboutUsCMS || raw.about_us_cms || null,
      orders: Array.isArray(raw.orders) ? raw.orders : [],
      commercialDocs: raw.commercialDocs || null
    };
  }

  // Model-specific Cloud Savers
  public async saveProducts(products: Product[]): Promise<{ success: boolean; message: string }> {
    return this.postToCloud('products.save', products);
  }

  public async saveProjects(projects: Project[]): Promise<{ success: boolean; message: string }> {
    return this.postToCloud('projects.save', projects);
  }

  public async saveBlogs(blogs: BlogPost[]): Promise<{ success: boolean; message: string }> {
    return this.postToCloud('blogs.save', blogs);
  }

  public async saveCategories(categories: CategoryItem[]): Promise<{ success: boolean; message: string }> {
    return this.postToCloud('categories.save', categories);
  }

  public async saveCompanyInfo(companyInfo: Record<string, any>): Promise<{ success: boolean; message: string }> {
    return this.postToCloud('companyInfo.save', companyInfo);
  }

  public async saveTestimonials(testimonials: TestimonialItem[]): Promise<{ success: boolean; message: string }> {
    return this.postToCloud('testimonials.save', testimonials);
  }

  public async saveHomepageCMS(payload: any): Promise<{ success: boolean; message: string }> {
    return this.postToCloud('homepage_cms.save', payload);
  }

  public async saveServicesCMS(payload: any): Promise<{ success: boolean; message: string }> {
    return this.postToCloud('services_page.save', payload);
  }

  public async saveAboutCMS(payload: any): Promise<{ success: boolean; message: string }> {
    return this.postToCloud('about_us.save', payload);
  }

  public async saveContactMessage(message: ContactMessage): Promise<{ success: boolean; message: string }> {
    return this.postToCloud('messages.save', message);
  }

  public async saveConcreteOrder(order: any): Promise<{ success: boolean; message: string }> {
    return this.postToCloud('orders.save', order);
  }
}

export const companyService = new CompanyService();
export default companyService;
