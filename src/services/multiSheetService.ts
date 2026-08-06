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
  CertificateItem,
  formatDriveUrl
} from '../types';
import { Quotation, BoqDocument, DeliveryNote } from './commercialDocsService';
import { fetchAllSheetsDataDirectly } from './googleSheetsDirectService';
import { fetchWithRetry } from './ApiService';

export interface CategoryItem {
  id: string;
  name: string;
  type: string;
}

export interface MultiSheetData {
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
  quotations?: Quotation[];
  boqs?: BoqDocument[];
  deliveryNotes?: DeliveryNote[];
}

/**
 * Normalizes and maps raw Apps Script response or sheet rows into structured MultiSheetData
 */
export function normalizeSheetResponse(raw: any): MultiSheetData {
  const result: MultiSheetData = {
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
    translations: [],
    quotations: [],
    boqs: [],
    deliveryNotes: [],
  };

  if (!raw) return result;

  let dataContainer = raw.data || raw;
  if (typeof dataContainer === 'string') {
    try {
      dataContainer = JSON.parse(dataContainer);
    } catch (e) {
      dataContainer = raw;
    }
  }

  let rawProducts = dataContainer.products || dataContainer.Products || raw.products || [];
  let rawProjects = dataContainer.projects || dataContainer.Projects || raw.projects || [];
  let rawBlogs = dataContainer.blog || dataContainer.blogs || dataContainer.Blog || dataContainer.Blogs || raw.blog || raw.blogs || [];
  let rawCategories = dataContainer.categories || dataContainer.Categories || raw.categories || [];
  let rawMessages = dataContainer.messages || dataContainer.contactMessages || dataContainer.ContactMessages || raw.messages || [];
  let rawCompanyInfo = dataContainer.companyInfo || dataContainer.CompanyInfo || raw.companyInfo || {};
  let rawServices = dataContainer.services || dataContainer.Services || raw.services || [];
  let rawTeam = dataContainer.team || dataContainer.teamMembers || dataContainer.Team || dataContainer.TeamMembers || raw.team || [];
  let rawHeroBanners = dataContainer.heroBanners || dataContainer.banners || dataContainer.HeroBanners || dataContainer.Banners || raw.heroBanners || [];
  let rawPartners = dataContainer.partners || dataContainer.Partners || raw.partners || [];
  let rawBranches = dataContainer.branches || dataContainer.Branches || raw.branches || [];
  let rawCareers = dataContainer.careers || dataContainer.Careers || raw.careers || [];
  let rawFAQ = dataContainer.faq || dataContainer.FAQ || raw.faq || [];
  let rawDownloads = dataContainer.downloads || dataContainer.Downloads || raw.downloads || [];
  let rawTestimonials = dataContainer.testimonials || dataContainer.Testimonials || raw.testimonials || [];
  let rawCertificates = dataContainer.certificates || dataContainer.Certificates || raw.certificates || [];
  let rawTranslations = dataContainer.translations || dataContainer.Translations || raw.translations || [];
  let rawQuotations = dataContainer.quotations || dataContainer.Quotations || raw.quotations || [];
  let rawBOQs = dataContainer.boqs || dataContainer.BOQs || dataContainer.Boqs || raw.boqs || [];
  let rawDeliveryNotes = dataContainer.deliveryNotes || dataContainer.DeliveryNotes || raw.deliveryNotes || [];

  // Fallback if dataContainer has sheet names directly as keys (e.g., Sheet1)
  if (dataContainer && typeof dataContainer === 'object') {
    if (rawProducts.length === 0 && Array.isArray(dataContainer.Sheet1)) {
      rawProducts = dataContainer.Sheet1;
    }
  }

  // 1. Company Info
  if (Array.isArray(rawCompanyInfo)) {
    const infoObj: Record<string, any> = {};
    rawCompanyInfo.forEach((item: any) => {
      if (item) {
        const k = item.Key || item.key || (Array.isArray(item) ? item[0] : null);
        let v = item.Value !== undefined ? item.Value : (item.value !== undefined ? item.value : (Array.isArray(item) ? item[1] : ''));
        if (k) {
          if (typeof v === 'string' && (v.startsWith('{') || v.startsWith('['))) {
            try { v = JSON.parse(v); } catch (e) {}
          }
          infoObj[String(k).trim()] = v;
        }
      }
    });
    result.companyInfo = infoObj;
  } else if (rawCompanyInfo && typeof rawCompanyInfo === 'object') {
    result.companyInfo = rawCompanyInfo;
  }

  // 2. Categories
  if (Array.isArray(rawCategories)) {
    result.categories = rawCategories.map((c: any, index: number) => ({
      id: String(c.CategoryID || c.id || `cat_${index}`),
      name: c["Name EN"] || c.name || c.Name || 'Category',
      type: c.Type || c.type || 'product'
    }));
  }

  // 3. Products
  if (Array.isArray(rawProducts)) {
    result.products = rawProducts.map((p: any, index: number) => {
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

  // 4. Projects
  if (Array.isArray(rawProjects)) {
    result.projects = rawProjects.map((p: any, index: number) => ({
      ...p,
      id: String(p.ProjectID || p.id || `proj_${index}`),
      title: p["Title EN"] || p.title || 'Project Item',
      category: p.Category || p.category || 'Interior Fit-Out',
      location: p.Location || p.location || '',
      area: p.Area || p.area || '',
      completionYear: p.CompletionYear || p.completionYear || '',
      description: p["Description EN"] || p.description || '',
      coverImage: formatDriveUrl(p.CoverImage || p.coverImage || ''),
      gallery: p.Gallery ? (typeof p.Gallery === 'string' ? p.Gallery.split(',').map((s: string) => formatDriveUrl(s.trim())) : p.Gallery.map((g: string) => formatDriveUrl(g))) : []
    }));
  }

  // 5. Blogs
  if (Array.isArray(rawBlogs)) {
    result.blogs = rawBlogs.map((b: any, index: number) => ({
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

  // 6. Messages
  if (Array.isArray(rawMessages)) {
    result.messages = rawMessages.map((m: any, index: number) => ({
      id: String(m.MessageID || m.id || `msg_${index}`),
      name: m.Name || m.name || '',
      email: m.Email || m.email || '',
      phone: m.Phone || m.phone || '',
      company: m.Company || m.company || '',
      subject: m.Subject || m.subject || '',
      message: m.Message || m.message || '',
      date: m.Date || m.date || new Date().toISOString(),
      status: m.Status || m.status || 'New'
    }));
  }

  // 7. Services
  if (Array.isArray(rawServices)) {
    result.services = rawServices.map((s: any, index: number) => ({
      id: String(s.ServiceID || s.id || `srv_${index}`),
      name: s["Name EN"] || s.name || '',
      description: s["Description EN"] || s.description || '',
      iconName: s.IconName || s.iconName || 'Cpu',
      category: s.Category || s.category || 'Design & Fit-Out'
    }));
  }

  // 8. Team Members
  if (Array.isArray(rawTeam)) {
    result.teamMembers = rawTeam.map((m: any, index: number) => ({
      id: String(m.MemberID || m.id || `team_${index}`),
      name: m.Name || m.name || '',
      role: m.Role || m.role || '',
      department: m.Department || m.department || '',
      image: formatDriveUrl(m.Image || m.image || ''),
      bio: m.Bio || m.bio || '',
      email: m.Email || m.email || '',
      phone: m.Phone || m.phone || ''
    }));
  }

  // 9. Hero Banners
  if (Array.isArray(rawHeroBanners)) {
    result.heroBanners = rawHeroBanners.map((b: any, index: number) => ({
      id: String(b.BannerID || b.id || `banner_${index}`),
      title: b["Title EN"] || b.title || '',
      subtitle: b.Subtitle || b.subtitle || '',
      description: b["Description EN"] || b.description || '',
      tag: b.Tag || b.tag || '',
      image: formatDriveUrl(b.Image || b.image || ''),
      linkUrl: b.LinkUrl || b.linkUrl || ''
    }));
  }

  // 10. Partners
  if (Array.isArray(rawPartners)) {
    result.partners = rawPartners.map((p: any, index: number) => ({
      id: String(p.PartnerID || p.id || `partner_${index}`),
      name: p.Name || p.name || '',
      logo: formatDriveUrl(p.Logo || p.logo || ''),
      website: p.Website || p.website || ''
    }));
  }

  // 11. Branches
  if (Array.isArray(rawBranches)) {
    result.branches = rawBranches.map((b: any, index: number) => ({
      id: String(b.BranchID || b.id || `branch_${index}`),
      name: b.Name || b.name || '',
      address: b.Address || b.address || '',
      phone: b.Phone || b.phone || '',
      email: b.Email || b.email || '',
      mapsUrl: b.MapsUrl || b.mapsUrl || ''
    }));
  }

  // 12. Careers
  if (Array.isArray(rawCareers)) {
    result.careers = rawCareers.map((c: any, index: number) => ({
      id: String(c.CareerID || c.id || `job_${index}`),
      title: c["Title EN"] || c.title || '',
      department: c.Department || c.department || '',
      location: c.Location || c.location || '',
      type: c.Type || c.type || 'Full-Time',
      description: c.Description || c.description || '',
      requirements: c.Requirements || c.requirements || ''
    }));
  }

  // 13. FAQ
  if (Array.isArray(rawFAQ)) {
    result.faq = rawFAQ.map((f: any, index: number) => ({
      id: String(f.FaqID || f.id || `faq_${index}`),
      question: f["Question EN"] || f.question || '',
      answer: f["Answer EN"] || f.answer || '',
      category: f.Category || f.category || 'General'
    }));
  }

  // 14. Downloads
  if (Array.isArray(rawDownloads)) {
    result.downloads = rawDownloads.map((d: any, index: number) => ({
      id: String(d.DownloadID || d.id || `dl_${index}`),
      title: d["Title EN"] || d.title || '',
      type: d.Type || d.type || 'PDF',
      size: d.Size || d.size || '1.0 MB',
      category: d.Category || d.category || 'Brochure',
      fileUrl: formatDriveUrl(d.FileURL || d.fileUrl || '#')
    }));
  }

  // 15. Testimonials
  if (Array.isArray(rawTestimonials)) {
    result.testimonials = rawTestimonials.map((t: any, index: number) => ({
      id: String(t.TestimonialID || t.id || `testi_${index}`),
      author: t.Author || t.author || t.Name || t.name || '',
      role: t.Role || t.role || t.Title || t.title || '',
      company: t.Company || t.company || '',
      quote: t["Quote EN"] || t.Quote_EN || t.quote || t.content || t.Content || '',
      avatar: formatDriveUrl(t.Avatar || t.avatar || t.Photo || t.photo || ''),
      rating: Number(t.Rating || t.rating || 5),
      status: String(t.Status || t.status || 'APPROVED').toUpperCase(),
      isFeatured: t.IsFeatured === true || t.isFeatured === true || String(t.IsFeatured || t.isFeatured).toLowerCase() === 'true' || String(t.IsFeatured || t.isFeatured).toLowerCase() === 'yes',
      date: t.Date || t.date || t.CreatedAt || t.createdAt || new Date().toISOString().split('T')[0],
      Quote_KH: t["Quote KH"] || t.Quote_KH || '',
      Quote_KO: t["Quote KO"] || t.Quote_KO || '',
      Quote_EN: t["Quote EN"] || t.Quote_EN || t.quote || '',
      Author_KH: t.Author_KH || t.Name_KH || '',
      Author_KO: t.Author_KO || t.Name_KO || '',
      Role_KH: t.Role_KH || t.Title_KH || '',
      Role_KO: t.Role_KO || t.Title_KO || ''
    }));
  }

  // 16. Certificates
  if (Array.isArray(rawCertificates)) {
    result.certificates = rawCertificates.map((c: any, index: number) => ({
      id: String(c.CertificateID || c.id || `cert_${index}`),
      title: c.Title || c.title || '',
      issuer: c.Issuer || c.issuer || '',
      year: c.Year || c.year || '',
      fileUrl: formatDriveUrl(c.FileURL || c.fileUrl || ''),
      image: formatDriveUrl(c.Image || c.image || '')
    }));
  }

  // 17. Translations
  if (Array.isArray(rawTranslations)) {
    result.translations = rawTranslations.map((row: any) => ({
      Key: row.Key || row.key || '',
      English: row.English || row.english || '',
      Khmer: row.Khmer || row.khmer || '',
      Korean: row.Korean || row.korean || ''
    }));
  }

  // 18. Quotations
  if (Array.isArray(rawQuotations) && rawQuotations.length > 0) {
    result.quotations = rawQuotations.map((q: any) => ({
      id: String(q.QuotationID || q.id || `q-${Math.random().toString(36).substring(2,8)}`),
      quoteNumber: q.QuoteNumber || q.quoteNumber || '',
      issueDate: q.IssueDate || q.issueDate || '',
      expiryDate: q.ExpiryDate || q.expiryDate || '',
      preparedBy: q.PreparedBy || q.preparedBy || '',
      clientName: q.ClientName || q.clientName || '',
      clientCompany: q.ClientCompany || q.clientCompany || '',
      clientPhone: q.ClientPhone || q.clientPhone || '',
      clientEmail: q.ClientEmail || q.clientEmail || '',
      projectSite: q.ProjectSite || q.projectSite || '',
      items: typeof q.ItemsJSON === 'string' ? JSON.parse(q.ItemsJSON) : (Array.isArray(q.items) ? q.items : []),
      subtotal: Number(q.Subtotal || q.subtotal || 0),
      discountTotal: Number(q.DiscountTotal || q.discountTotal || 0),
      vatPercent: Number(q.VatPercent || q.vatPercent || 10),
      vatAmount: Number(q.VatAmount || q.vatAmount || 0),
      grandTotalUsd: Number(q.GrandTotalUSD || q.grandTotalUsd || 0),
      grandTotalKhr: Number(q.GrandTotalKHR || q.grandTotalKhr || 0),
      termsAndConditions: q.TermsAndConditions || q.termsAndConditions || '',
      status: q.Status || q.status || 'Draft',
      createdAt: q.CreatedAt || q.createdAt || new Date().toISOString(),
      updatedAt: q.UpdatedAt || q.updatedAt || new Date().toISOString()
    }));
  }

  // 19. BOQs
  if (Array.isArray(rawBOQs) && rawBOQs.length > 0) {
    result.boqs = rawBOQs.map((b: any) => ({
      id: String(b.BOQID || b.id || `boq-${Math.random().toString(36).substring(2,8)}`),
      boqNumber: b.BOQNumber || b.boqNumber || '',
      date: b.Date || b.date || '',
      clientName: b.ClientName || b.clientName || '',
      projectName: b.ProjectName || b.projectName || '',
      projectLocation: b.ProjectLocation || b.projectLocation || '',
      categories: typeof b.CategoriesJSON === 'string' ? JSON.parse(b.CategoriesJSON) : (Array.isArray(b.categories) ? b.categories : []),
      subtotal: Number(b.Subtotal || b.subtotal || 0),
      contingencyPercent: Number(b.ContingencyPercent || b.contingencyPercent || 0),
      contingencyAmount: Number(b.ContingencyAmount || b.contingencyAmount || 0),
      profitPercent: Number(b.ProfitPercent || b.profitPercent || 0),
      profitAmount: Number(b.ProfitAmount || b.profitAmount || 0),
      vatPercent: Number(b.VatPercent || b.vatPercent || 10),
      vatAmount: Number(b.VatAmount || b.vatAmount || 0),
      grandTotalUsd: Number(b.GrandTotalUSD || b.grandTotalUsd || 0),
      grandTotalKhr: Number(b.GrandTotalKHR || b.grandTotalKhr || 0),
      status: b.Status || b.status || 'Draft',
      createdAt: b.CreatedAt || b.createdAt || new Date().toISOString(),
      updatedAt: b.UpdatedAt || b.updatedAt || new Date().toISOString()
    }));
  }

  // 20. Delivery Notes
  if (Array.isArray(rawDeliveryNotes) && rawDeliveryNotes.length > 0) {
    result.deliveryNotes = rawDeliveryNotes.map((d: any) => ({
      id: String(d.DeliveryNoteID || d.id || `dn-${Math.random().toString(36).substring(2,8)}`),
      deliveryNumber: d.DeliveryNumber || d.deliveryNumber || '',
      poReference: d.POReference || d.poReference || '',
      date: d.Date || d.date || '',
      clientName: d.ClientName || d.clientName || '',
      projectSite: d.ProjectSite || d.projectSite || '',
      contactPerson: d.ContactPerson || d.contactPerson || '',
      vehicleNo: d.VehicleNo || d.vehicleNo || '',
      driverName: d.DriverName || d.driverName || '',
      items: typeof d.ItemsJSON === 'string' ? JSON.parse(d.ItemsJSON) : (Array.isArray(d.items) ? d.items : []),
      preparedBy: d.PreparedBy || d.preparedBy || '',
      dispatchedBy: d.DispatchedBy || d.dispatchedBy || '',
      receivedBy: d.ReceivedBy || d.receivedBy || '',
      notes: d.Notes || d.notes || '',
      status: d.Status || d.status || 'Pending',
      createdAt: d.CreatedAt || d.createdAt || new Date().toISOString(),
      updatedAt: d.UpdatedAt || d.updatedAt || new Date().toISOString()
    }));
  }

  return result;
}

/**
 * Fetch all sheet tabs using Apps Script Web App URL with smart action fallbacks
 */
export async function fetchMultiSheetDataFromAppsScript(webhookUrl: string): Promise<MultiSheetData> {
  const url = webhookUrl.trim();
  if (!url.startsWith('http')) {
    throw new Error('Invalid Apps Script Web App URL.');
  }

  const separator = url.includes('?') ? '&' : '?';

  // Attempt 1: action=getPortfolioData
  try {
    const fetchUrl = `${url}${separator}action=getPortfolioData`;
    const parsed = await fetchWithRetry(fetchUrl, { maxRetries: 1, timeoutMs: 15000 });
    if (parsed && (parsed.status === 'success' || parsed.products || parsed.data)) {
      const normalized = normalizeSheetResponse(parsed);
      if (normalized.products.length > 0 || normalized.projects.length > 0 || Object.keys(normalized.companyInfo).length > 0) {
        return normalized;
      }
    }
  } catch (e: any) {
    console.info('[MultiSheetService] getPortfolioData attempt complete, trying getFullDatabaseJSON fallback...');
  }

  // Attempt 2: action=getFullDatabaseJSON
  try {
    const fetchUrl2 = `${url}${separator}action=getFullDatabaseJSON`;
    const parsed2 = await fetchWithRetry(fetchUrl2, { maxRetries: 1, timeoutMs: 15000 });
    if (parsed2 && (parsed2.status === 'success' || parsed2.data)) {
      return normalizeSheetResponse(parsed2);
    }
  } catch (e: any) {
    console.info('[MultiSheetService] getFullDatabaseJSON attempt complete, trying individual readTable queries...');
  }

  // Attempt 3: Fallback tab-by-tab readTable for core sheets
  const coreTables = ['Products', 'Projects', 'DoorAndFurnitureOrders', 'Blog', 'Categories', 'ContactMessages', 'CompanyInfo', 'Translations', 'Quotations', 'BOQs', 'DeliveryNotes'];
  const aggregatedData: Record<string, any> = {};

  await Promise.all(coreTables.map(async (table) => {
    try {
      const json = await fetchWithRetry(`${url}${separator}action=readTable&sheetName=${table}`, { maxRetries: 1, timeoutMs: 15000 });
      if (json && json.status === 'success' && Array.isArray(json.data)) {
        aggregatedData[table] = json.data;
      }
    } catch (err: any) {
      console.info(`[MultiSheetService] Sheet table read complete for ${table}.`);
    }
  }));

  return normalizeSheetResponse({ data: aggregatedData });
}

/**
 * Fetch all sheet tabs directly via Google Sheets REST API
 */
export async function fetchMultiSheetDataFromDirectAPI(accessToken: string, spreadsheetId: string): Promise<MultiSheetData> {
  const directData = await fetchAllSheetsDataDirectly(accessToken, spreadsheetId);
  return normalizeSheetResponse(directData);
}

/**
 * Unified Multi-Tab Fetcher Service
 */
export async function fetchAllSheetTabsData(options: {
  webhookUrl?: string;
  accessToken?: string;
  spreadsheetId?: string;
}): Promise<MultiSheetData> {
  // Option 1: Try Apps Script Web App URL
  if (options.webhookUrl && options.webhookUrl.trim().startsWith('http') && !options.webhookUrl.includes('docs.google.com/spreadsheets')) {
    try {
      return await fetchMultiSheetDataFromAppsScript(options.webhookUrl);
    } catch (err) {
      console.warn('[MultiSheetService] Apps Script Web App fetch failed, trying direct API if available:', err);
    }
  }

  // Option 2: Try Direct Google Sheets REST API
  if (options.accessToken && options.spreadsheetId) {
    return await fetchMultiSheetDataFromDirectAPI(options.accessToken, options.spreadsheetId);
  }

  throw new Error('No valid Google Sheets endpoint or access credentials configured.');
}
