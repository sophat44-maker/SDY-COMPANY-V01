export interface Product {
  id: string;
  name: string;
  category: string;
  collection?: string;
  language?: string;
  revision?: string;
  image: string;
  gallery: string[];
  description: string;
  specification: string;
  material: string;
  size: string;
  pdfUrl?: string;
  pdf_spec_url?: string;
  price?: string;
  originalPrice?: string;
  promotionTag?: string;
  isPromotional?: boolean;
  ProductName_KH?: string;
  ProductName_EN?: string;
  ProductName_KO?: string;
  Description_KH?: string;
  Description_EN?: string;
  Description_KO?: string;
  // Enterprise features
  dimensions?: string;
  warranty?: string;
  finishes?: string[];
  colors?: string[];
  installationGuideUrl?: string;

  // Luxury Automatic Product Datasheet System Fields
  shortDescriptionEN?: string;
  shortDescriptionKH?: string;
  shortDescriptionKO?: string;
  longDescriptionEN?: string;
  longDescriptionKH?: string;
  longDescriptionKO?: string;
  construction?: string;
  finish?: string;
  customSize?: string;
  weight?: string;
  fireRating?: string;
  acousticRating?: string;
  productFeatures?: string;
  technicalNotes?: string;
  specificationTable?: string;

  // Advanced Product Images & Drawings (Stored in Google Drive)
  galleryImage1?: string;
  galleryImage2?: string;
  galleryImage3?: string;
  galleryImage4?: string;
  technicalDrawing?: string;
  crossSectionDrawing?: string;
  dimensionDrawing?: string;
  installationDrawing?: string;

  // Selected Certificates
  certificates?: {
    iso?: boolean;
    ul?: boolean;
    astm?: boolean;
    fireRated?: boolean;
    acousticTested?: boolean;
    ce?: boolean;
    fsc?: boolean;
  };

  // Enabled Application Icons
  applications?: {
    residential?: boolean;
    apartment?: boolean;
    hotel?: boolean;
    office?: boolean;
    hospital?: boolean;
    school?: boolean;
    luxuryVilla?: boolean;
    commercial?: boolean;
    retail?: boolean;
    airport?: boolean;
    shoppingMall?: boolean;
  };

  // PDF Version Control
  pdfVersions?: Array<{
    version: string;
    date: string;
    url: string;
    fileId?: string;
  }>;
}

export interface Project {
  id: string;
  title: string;
  category: 'Interior Fit-Out' | 'Renovation' | 'Furniture' | 'Construction' | 'Steel Works' | 'Glass & Aluminum';
  coverImage: string;
  gallery: string[];
  location: string;
  area: string; // e.g. "1,200 sqm"
  completionYear: string;
  description: string;
  constructionType: string;
  ProjectName_KH?: string;
  ProjectName_EN?: string;
  ProjectName_KO?: string;
  Title_KH?: string;
  Title_EN?: string;
  Title_KO?: string;
  Description_KH?: string;
  Description_EN?: string;
  Description_KO?: string;
  // Enterprise features
  client?: string;
  country?: string;
  timeline?: string;
  challenges?: string;
  solutions?: string;
  beforeImage?: string;
  afterImage?: string;
  materialsUsed?: string[];
}

export interface TrilingualText {
  km: string;
  en: string;
  ko: string;
}

export interface ServiceCardItem {
  id: string;
  category_tag: string;
  title: TrilingualText;
  description: TrilingualText;
  icon_type: string;
  action_text: TrilingualText;
}

export interface ServicesPageData {
  header: {
    title: TrilingualText;
    subtitle: TrilingualText;
  };
  categories: string[];
  services_list: ServiceCardItem[];
}

export interface CoreValueItem {
  id: string;
  icon: string;
  title: TrilingualText;
  description: TrilingualText;
}

export interface TimelineEventItem {
  id: string;
  year: string;
  title: TrilingualText;
  description: TrilingualText;
}

export interface TeamLeaderItem {
  id: string;
  name: string;
  role: TrilingualText;
  photo_or_initials: string;
  image_url?: string;
  sub_skills: string[];
  department?: TrilingualText;
  bio?: TrilingualText;
  category?: 'directors' | 'management' | 'leaders';
}

export interface AboutPageData {
  overview: {
    tag: TrilingualText;
    title: TrilingualText;
    story_paragraphs: TrilingualText[];
    factory_image_url: string;
    badge_text: TrilingualText;
    badge_subtext: TrilingualText;
  };
  core_values: {
    section_title: TrilingualText;
    section_subtitle: TrilingualText;
    values_list: CoreValueItem[];
  };
  timeline: {
    section_title: TrilingualText;
    section_subtitle: TrilingualText;
    events: TimelineEventItem[];
  };
  team_governance: {
    section_title: TrilingualText;
    section_subtitle: TrilingualText;
    leaders: TeamLeaderItem[];
  };
}

export interface Service {
  id: string;
  name: string;
  description: string;
  iconName: string;
  category: 'Design & Fit-Out' | 'Doors & Manufacturing' | 'Structural Steel' | 'Glass & Facade' | 'Sectors' | string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  image: string;
  author: string;
  Title_KH?: string;
  Title_EN?: string;
  Title_KO?: string;
  Excerpt_KH?: string;
  Excerpt_EN?: string;
  Excerpt_KO?: string;
  Content_KH?: string;
  Content_EN?: string;
  Content_KO?: string;
  Author_KH?: string;
  Author_EN?: string;
  Author_KO?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  subject: string;
  message: string;
  date: string;
  status: 'New' | 'Pending' | 'Contacted' | 'Completed';
}

export interface AdminConfig {
  googleSheetsWebhookUrl: string;
  isSyncEnabled: boolean;
}

export interface TranslationRow {
  Key: string;
  Khmer: string;
  English: string;
  Korean: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  image?: string;
  bio?: string;
  email?: string;
  phone?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  Question_KH?: string;
  Question_KO?: string;
  Answer_KH?: string;
  Answer_KO?: string;
}

export interface TestimonialItem {
  id: string;
  author: string;
  role: string;
  company: string;
  quote: string;
  avatar?: string;
  rating?: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  isFeatured?: boolean;
  date?: string;
  Quote_KH?: string;
  Quote_KO?: string;
  Quote_EN?: string;
  Author_KH?: string;
  Author_KO?: string;
  Role_KH?: string;
  Role_KO?: string;
  Company_KH?: string;
  Company_KO?: string;
}

export interface DownloadItem {
  id: string;
  title: string;
  type: string;
  size: string;
  category: string;
  fileUrl: string;
  Title_KH?: string;
  Title_KO?: string;
}

export interface CareerItem {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string;
  Title_KH?: string;
  Title_KO?: string;
}

export interface HeroBannerItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tag: string;
  image: string;
  linkUrl?: string;
  Title_KH?: string;
  Title_KO?: string;
}

export interface CertificateItem {
  id: string;
  title: string;
  issuer: string;
  year: string;
  fileUrl?: string;
  image?: string;
}

export interface PartnerItem {
  id: string;
  name: string;
  logo: string;
  website?: string;
}

export interface BranchItem {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  mapsUrl?: string;
}

export function formatDriveUrl(input?: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  if (trimmed.startsWith('http') && !trimmed.includes('drive.google.com') && !trimmed.includes('docs.google.com')) {
    return trimmed;
  }
  const match = trimmed.match(/[-\w]{25,}/);
  if (match) {
    return `https://lh3.googleusercontent.com/d/${match[0]}`;
  }
  return trimmed;
}

// ==========================================
// METADATA-DRIVEN CMS & LOW-CODE ENGINE TYPES
// ==========================================

export type FieldType = 
  | 'text'
  | 'textarea'
  | 'number'
  | 'currency'
  | 'boolean'
  | 'date'
  | 'email'
  | 'phone'
  | 'url'
  | 'image'
  | 'gallery'
  | 'file'
  | 'select'
  | 'relation'
  | 'richtext';

export interface FieldDefinition {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  defaultValue?: any;
  options?: string[]; // For select dropdowns
  relationTable?: string; // e.g. "Categories"
  relationLabelKey?: string; // e.g. "Name EN"
  showInTable?: boolean;
  searchable?: boolean;
}

export interface EntitySchema {
  id: string; // e.g., 'suppliers', 'warehouses', 'boq'
  name: string; // e.g. 'Suppliers'
  tableName: string; // Google Sheet tab name e.g. 'Suppliers'
  icon?: string; // Lucide icon name e.g. 'Truck'
  description?: string;
  fields: FieldDefinition[];
  status?: 'Published' | 'Draft';
  createdAt?: string;
  updatedAt?: string;
}

export interface DynamicRecord {
  id: string;
  uuid?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  status?: 'Draft' | 'Review' | 'Approved' | 'Published' | 'Archived';
  visibility?: 'Public' | 'Private' | 'Internal';
  sortOrder?: number;
  language?: string;
  version?: string;
  [key: string]: any;
}

export interface AuditLogItem {
  id: string;
  user: string;
  action: string;
  module: string;
  recordId: string;
  timestamp: string;
  oldValue?: string;
  newValue?: string;
}

export interface PageSectionConfig {
  id: string;
  type: 'hero' | 'services' | 'products' | 'projects' | 'about' | 'team' | 'faq' | 'downloads' | 'custom' | 'contact' | 'testimonials' | 'partners' | 'gallery';
  title: string;
  subtitle?: string;
  visible: boolean;
  sortOrder: number;
  backgroundColor?: string;
  padding?: string;
  customHtml?: string;
}


