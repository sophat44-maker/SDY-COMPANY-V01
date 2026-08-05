import { 
  Product, 
  Project, 
  BlogPost, 
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
  CertificateItem,
  formatDriveUrl 
} from '../types';

export interface CategoryItem {
  id: string;
  name: string;
  type: string;
}

export interface FetchOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  backoffFactor?: number;
  timeoutMs?: number;
  headers?: Record<string, string>;
  method?: string;
  body?: any;
}

export interface ApiDatabasePayload {
  products: Product[];
  projects: Project[];
  blogs: BlogPost[];
  categories: CategoryItem[];
  messages: any[];
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
}

/**
 * Robust fetch helper with exponential backoff, timeout, and explicit error logging
 */
export async function fetchWithRetry<T = any>(
  url: string, 
  options: FetchOptions = {}
): Promise<T> {
  const {
    maxRetries = 2,
    initialDelayMs = 1000,
    backoffFactor = 2,
    timeoutMs = 15000,
    headers = {},
    method = 'GET',
    body
  } = options;

  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      if (attempt > 0) {
        console.info(`[ApiService] Retry attempt ${attempt}/${maxRetries} for URL: ${url}`);
      }

      const response = await fetch(url, {
        method,
        headers,
        body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
        signal: controller.signal
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      let json: any;
      try {
        json = JSON.parse(text);
      } catch (parseError) {
        throw new Error(`Invalid JSON response received from server (${text.slice(0, 100)}...)`);
      }

      return json as T;
    } catch (err: any) {
      clearTimeout(timer);
      const isAbort = err.name === 'AbortError';
      const errorMessage = isAbort 
        ? `Request timed out after ${timeoutMs}ms` 
        : (err.message || 'Network request failed');

      lastError = new Error(errorMessage);

      if (attempt < maxRetries) {
        const delay = initialDelayMs * Math.pow(backoffFactor, attempt);
        console.warn(`[ApiService] Attempt ${attempt + 1}/${maxRetries + 1} failed (${errorMessage}). Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.info(`[ApiService] Network endpoint unreachable or slow (${url}): ${errorMessage}. Falling back gracefully.`);
      }
    }
    attempt++;
  }

  throw lastError || new Error('Request failed after retries');
}

// In-memory cache for API responses (5 min TTL)
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

export function clearApiCache(): void {
  apiCache.clear();
}

/**
 * ApiService class to handle Google Sheet Web App & REST communications resiliently
 */
export class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl.trim();
  }

  public clearCache(): void {
    apiCache.clear();
  }

  public setBaseUrl(url: string): void {
    this.baseUrl = url.trim();
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Helper to make GET requests to Apps Script Web App or REST endpoint
   */
  public async fetchEndpoint<T = any>(
    action: string, 
    extraParams: Record<string, string> = {}, 
    options?: FetchOptions
  ): Promise<T> {
    if (!this.baseUrl || !this.baseUrl.startsWith('http')) {
      throw new Error('ApiService: Invalid or missing endpoint URL.');
    }

    const queryParams = new URLSearchParams({ action, ...extraParams });
    const separator = this.baseUrl.includes('?') ? '&' : '?';
    const fullUrl = `${this.baseUrl}${separator}${queryParams.toString()}`;

    const reqMethod = (options?.method || 'GET').toUpperCase();
    const cacheKey = `${reqMethod}:${fullUrl}`;
    if (!options?.body && reqMethod === 'GET') {
      const cached = apiCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
        return cached.data as T;
      }
    }

    const result = await fetchWithRetry<T>(fullUrl, options);
    if (result && (!options?.body && reqMethod === 'GET')) {
      apiCache.set(cacheKey, { data: result, timestamp: Date.now() });
    }

    return result;
  }

  /**
   * Read table from Google Sheet with retries and parsing
   */
  public async readTable(tableName: string): Promise<any[]> {
    try {
      const json = await this.fetchEndpoint('readTable', { sheetName: tableName });
      if (!json) return [];
      const rows = json.data || json[tableName] || json[tableName.toLowerCase()] || (Array.isArray(json) ? json : []);
      return Array.isArray(rows) ? rows : [];
    } catch (err: any) {
      console.info(`[ApiService] Table "${tableName}" unavailable remotely: ${err.message}`);
      return [];
    }
  }

  /**
   * Fetch Products with auto-parsing and formatting
   */
  public async fetchProducts(): Promise<Product[]> {
    const rows = await this.readTable('Products');
    return rows.map((p: any, index: number) => {
      const rawImageVal = p.ImageID || p.Image || p.image || p.imageUrl || p.ImageURL || p.photo || p.Photo || p.coverImage || '';
      const mainImage = formatDriveUrl(rawImageVal);
      let galleryArr: string[] = [];

      if (p.Gallery) {
        galleryArr = typeof p.Gallery === 'string' 
          ? p.Gallery.split(',').map((s: string) => formatDriveUrl(s.trim())) 
          : (Array.isArray(p.Gallery) ? p.Gallery.map((g: string) => formatDriveUrl(g)) : []);
      } else if (p.gallery) {
        galleryArr = Array.isArray(p.gallery) ? p.gallery.map((g: string) => formatDriveUrl(g)) : [formatDriveUrl(p.gallery)];
      }

      [p.GalleryImage1 || p.galleryImage1, p.GalleryImage2 || p.galleryImage2, p.GalleryImage3 || p.galleryImage3, p.GalleryImage4 || p.galleryImage4].forEach(img => {
        if (img) {
          const formatted = formatDriveUrl(img);
          if (formatted && !galleryArr.includes(formatted)) galleryArr.push(formatted);
        }
      });

      galleryArr = galleryArr.filter(Boolean);

      if (mainImage && !galleryArr.includes(mainImage)) {
        galleryArr.unshift(mainImage);
      }

      const fallbackUrl = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80';
      const finalImage = mainImage || galleryArr[0] || fallbackUrl;
      if (galleryArr.length === 0) {
        galleryArr = [finalImage];
      }

      return {
        id: String(p.ProductID || p.id || `prod_${index}`),
        name: p["Name EN"] || p.ProductName_EN || p.name || 'Product Item',
        category: p.Category || p.category || 'Doors & Windows',
        collection: p.Collection || p.collection || '',
        language: p.Language || p.language || 'en',
        revision: p.Revision || p.revision || 'REV-2026',
        image: finalImage,
        gallery: galleryArr,
        description: p["Description EN"] || p.Description_EN || p.description || '',
        specification: p.Specification || p.specification || '',
        material: p.Material || p.material || '',
        size: p.Size || p.size || '',
        pdfUrl: formatDriveUrl(p.PDF || p.pdfUrl || '#'),
        
        ProductName_EN: p["Name EN"] || p.ProductName_EN || p.name || '',
        ProductName_KH: p["Name KH"] || p.ProductName_KH || '',
        ProductName_KO: p["Name KO"] || p.ProductName_KO || '',
        Description_EN: p["Description EN"] || p.Description_EN || p.description || '',
        Description_KH: p["Description KH"] || p.Description_KH || '',
        Description_KO: p["Description KO"] || p.Description_KO || '',
        
        shortDescriptionEN: p.ShortDescriptionEN || p.shortDescriptionEN || '',
        shortDescriptionKH: p.ShortDescriptionKH || p.shortDescriptionKH || '',
        shortDescriptionKO: p.ShortDescriptionKO || p.shortDescriptionKO || '',
        
        longDescriptionEN: p.LongDescriptionEN || p.longDescriptionEN || '',
        longDescriptionKH: p.LongDescriptionKH || p.longDescriptionKH || '',
        longDescriptionKO: p.LongDescriptionKO || p.longDescriptionKO || '',
        
        construction: p.Construction || p.construction || '',
        finish: p.Finish || p.finish || '',
        customSize: p.CustomSize || p.customSize || '',
        weight: p.Weight || p.weight || '',
        fireRating: p.FireRating || p.fireRating || '',
        acousticRating: p.AcousticRating || p.acousticRating || '',
        warranty: p.Warranty || p.warranty || '',
        
        productFeatures: p.ProductFeatures || p.productFeatures || '',
        technicalNotes: p.TechnicalNotes || p.technicalNotes || '',
        specificationTable: p.SpecificationTable || p.specificationTable || '',
        
        galleryImage1: formatDriveUrl(p.GalleryImage1 || p.galleryImage1 || ''),
        galleryImage2: formatDriveUrl(p.GalleryImage2 || p.galleryImage2 || ''),
        galleryImage3: formatDriveUrl(p.GalleryImage3 || p.galleryImage3 || ''),
        galleryImage4: formatDriveUrl(p.GalleryImage4 || p.galleryImage4 || ''),
        technicalDrawing: formatDriveUrl(p.TechnicalDrawing || p.technicalDrawing || ''),
        crossSectionDrawing: formatDriveUrl(p.CrossSectionDrawing || p.crossSectionDrawing || ''),
        dimensionDrawing: formatDriveUrl(p.DimensionDrawing || p.dimensionDrawing || ''),
        installationDrawing: formatDriveUrl(p.InstallationDrawing || p.installationDrawing || ''),
        
        certificates: {
          iso: p.CertISO === 'Yes' || (p.certificates && p.certificates.iso) || false,
          ul: p.CertUL === 'Yes' || (p.certificates && p.certificates.ul) || false,
          astm: p.CertASTM === 'Yes' || (p.certificates && p.certificates.astm) || false,
          fireRated: p.CertFireRated === 'Yes' || (p.certificates && p.certificates.fireRated) || false,
          acousticTested: p.CertAcousticTested === 'Yes' || (p.certificates && p.certificates.acousticTested) || false,
          ce: p.CertCE === 'Yes' || (p.certificates && p.certificates.ce) || false,
          fsc: p.CertFSC === 'Yes' || (p.certificates && p.certificates.fsc) || false,
        },
        applications: {
          residential: p.AppResidential === 'Yes' || (p.applications && p.applications.residential) || false,
          apartment: p.AppApartment === 'Yes' || (p.applications && p.applications.apartment) || false,
          hotel: p.AppHotel === 'Yes' || (p.applications && p.applications.hotel) || false,
          office: p.AppOffice === 'Yes' || (p.applications && p.applications.office) || false,
          hospital: p.AppHospital === 'Yes' || (p.applications && p.applications.hospital) || false,
          school: p.AppSchool === 'Yes' || (p.applications && p.applications.school) || false,
          luxuryVilla: p.AppLuxuryVilla === 'Yes' || (p.applications && p.applications.luxuryVilla) || false,
          commercial: p.AppCommercial === 'Yes' || (p.applications && p.applications.commercial) || false,
          retail: p.AppRetail === 'Yes' || (p.applications && p.applications.retail) || false,
          airport: p.AppAirport === 'Yes' || (p.applications && p.applications.airport) || false,
          shoppingMall: p.AppShoppingMall === 'Yes' || (p.applications && p.applications.shoppingMall) || false,
        },
        pdfVersions: p.PDFVersions ? (typeof p.PDFVersions === 'string' ? JSON.parse(p.PDFVersions) : p.PDFVersions) : (p.pdfVersions || [])
      };
    });
  }

  /**
   * Fetch Projects
   */
  public async fetchProjects(): Promise<Project[]> {
    const rows = await this.readTable('Projects');
    return rows.map((p: any, index: number) => ({
      ...p,
      id: String(p.ProjectID || p.id || `proj_${index}`),
      title: p["Title EN"] || p.title || 'Project Item',
      category: p.Category || p.category || 'Interior Fit-Out',
      location: p.Location || p.location || '',
      area: p.Area || p.area || '',
      completionYear: p.CompletionYear || p.completionYear || '',
      description: p["Description EN"] || p.description || '',
      coverImage: formatDriveUrl(p.CoverImage || p.coverImage || ''),
      gallery: p.Gallery 
        ? (typeof p.Gallery === 'string' ? p.Gallery.split(',').map((s: string) => formatDriveUrl(s.trim())) : p.Gallery.map((g: string) => formatDriveUrl(g))) 
        : []
    }));
  }

  /**
   * Fetch Blog
   */
  public async fetchBlog(): Promise<BlogPost[]> {
    const rows = await this.readTable('Blog');
    return rows.map((b: any, index: number) => ({
      ...b,
      id: String(b.BlogID || b.id || `blog_${index}`),
      title: b["Title EN"] || b.title || 'Article Title',
      excerpt: b.Excerpt || b.excerpt || '',
      content: b.Content || b.content || '',
      category: b.Category || b.category || 'General Insights',
      author: b.Author || b.author || 'Corporate Admin',
      image: formatDriveUrl(b.ImageID || b.image || ''),
      date: b.Date || b.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    }));
  }

  /**
   * Fetch Categories
   */
  public async fetchCategories(): Promise<CategoryItem[]> {
    const rows = await this.readTable('Categories');
    return rows.map((c: any, index: number) => ({
      id: String(c.CategoryID || c.id || `cat_${index}`),
      name: c["Name EN"] || c.name || c.Name || 'Category',
      type: c.Type || c.type || 'product'
    }));
  }

  /**
   * Fetch Company Info
   */
  public async fetchCompanyInfo(): Promise<Record<string, any>> {
    const rows = await this.readTable('CompanyInfo');
    const info: Record<string, any> = {};

    if (Array.isArray(rows)) {
      rows.forEach((r: any) => {
        if (r) {
          const key = r.Key || r.key || (Array.isArray(r) ? r[0] : null);
          let val = r.Value !== undefined ? r.Value : (r.value !== undefined ? r.value : (Array.isArray(r) ? r[1] : ''));
          if (key) {
            if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
              try { val = JSON.parse(val); } catch (e) {}
            }
            info[String(key).trim()] = val;
          }
        }
      });
    } else if (rows && typeof rows === 'object') {
      return rows;
    }
    return info;
  }

  /**
   * Fetch Translations
   */
  public async fetchTranslations(): Promise<TranslationRow[]> {
    const rows = await this.readTable('Translations');
    return rows.map((row: any) => ({
      Key: row.Key || row.key || '',
      English: row.English || row.english || '',
      Khmer: row.Khmer || row.khmer || '',
      Korean: row.Korean || row.korean || ''
    }));
  }

  /**
   * Fetch all tables in parallel or via full payload action
   */
  public async fetchAllDatabase(): Promise<Partial<ApiDatabasePayload>> {
    try {
      // First attempt single endpoint fetch
      const singleJson = await this.fetchEndpoint('getPortfolioData', {}, { maxRetries: 1, timeoutMs: 5000 });
      if (singleJson && singleJson.status === 'success') {
        const [products, projects, blogs, categories, companyInfo, translations] = await Promise.all([
          singleJson.products ? this.fetchProducts() : Promise.resolve([]),
          singleJson.projects ? this.fetchProjects() : Promise.resolve([]),
          singleJson.blog || singleJson.blogs ? this.fetchBlog() : Promise.resolve([]),
          singleJson.categories ? this.fetchCategories() : Promise.resolve([]),
          singleJson.companyInfo ? this.fetchCompanyInfo() : Promise.resolve({}),
          singleJson.translations ? this.fetchTranslations() : Promise.resolve([])
        ]);

        return { products, projects, blogs, categories, companyInfo, translations };
      }
    } catch (e) {
      console.info('[ApiService] getPortfolioData single bundle endpoint unavailable, falling back to multi-table fetch.');
    }

    // Parallel fetch with resilient individual retries
    const [products, projects, blogs, categories, companyInfo, translations] = await Promise.all([
      this.fetchProducts().catch(() => []),
      this.fetchProjects().catch(() => []),
      this.fetchBlog().catch(() => []),
      this.fetchCategories().catch(() => []),
      this.fetchCompanyInfo().catch(() => ({})),
      this.fetchTranslations().catch(() => [])
    ]);

    return { products, projects, blogs, categories, companyInfo, translations };
  }
}

/**
 * Helper factory function
 */
export function createApiService(baseUrl: string): ApiService {
  return new ApiService(baseUrl);
}

export default ApiService;
