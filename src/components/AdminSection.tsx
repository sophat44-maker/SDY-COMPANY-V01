import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import {
  Database, Mail, Settings, CheckCircle, Flame, Plus, Trash2, Edit3,
  Copy, CheckCircle2, Shield, Eye, FileSpreadsheet, KeyRound, Cpu,
  Phone, Send, MapPin, Globe, Clock, Sparkles, AlertTriangle, LogIn, LogOut,
  Save, FileText, Image as ImageIcon, Loader2, ArrowRight, RefreshCw, Download, History,
  X, ShieldCheck, Code2, Truck, ShoppingBag, Lock, Home, Wrench, Building2, MessageSquare
} from 'lucide-react';
import { Product, Project, BlogPost, ContactMessage, AdminConfig, EntitySchema, PageSectionConfig, formatDriveUrl } from '../types';
import { ConcreteOrder } from '../services/concreteOrderService';
import { PRODUCTS, PROJECTS, BLOG_POSTS } from '../data';
import { useLanguage } from './LanguageContext';
import { transformGoogleDriveUrl, extractGoogleDriveFileId, getGoogleDriveViewUrl } from '../utils/googleDrive';
import { generateProductPdf } from '../utils/pdfGenerator';
import DynamicEntityBuilder, { PRESET_SCHEMAS } from './DynamicEntityBuilder';
import DynamicEntityManager from './DynamicEntityManager';
import DynamicSectionBuilder from './DynamicSectionBuilder';
import DynamicMediaLibrary from './DynamicMediaLibrary';
import EnterpriseIntelligencePlatform from './EnterpriseIntelligencePlatform';
import PlatformGovernanceStudio from './PlatformGovernanceStudio';
import EnterpriseRuntimeStudio from './EnterpriseRuntimeStudio';
import PlatformLifecycleStudio from './PlatformLifecycleStudio';
import DeveloperEcosystemStudio from './DeveloperEcosystemStudio';
import CommercialDocumentsStudio from './CommercialDocumentsStudio';
import HomepageCmsManager, { defaultHomepageCmsData } from './HomepageCmsManager';
import { useHomepage } from './HomepageContext';
import ServicesCmsManager from './ServicesCmsManager';
import { defaultServicesPageData, useServicesPage } from './ServicesContext';
import AboutCmsManager from './AboutCmsManager';
import { defaultAboutPageData, useAboutPage } from './AboutContext';
import TestimonialsCmsManager from './TestimonialsCmsManager';
import { TESTIMONIALS } from '../data';
import { initAuth, googleSignIn, logoutGoogle, getAccessToken } from '../services/googleAuthService';
import {
  listGoogleSpreadsheets,
  createNewGoogleSheet,
  syncProductsToSheet,
  fetchProductsFromSheet,
  syncProjectsToSheet,
  fetchProjectsFromSheet,
  syncBlogsToSheet,
  fetchBlogsFromSheet,
  syncCategoriesToSheet,
  fetchCategoriesFromSheet,
  syncMessagesToSheet,
  syncAllDataToSheet,
  SpreadsheetFile
} from '../services/googleSheetsDirectService';
import { fetchAllSheetTabsData } from '../services/multiSheetService';
import { getQuotations, getBoqs, getDeliveryNotes } from '../services/commercialDocsService';
import { User } from 'firebase/auth';

export default function AdminSection() {
  const { 
    t, language, setLanguage, products, projects, blogs, companyInfo: dynamicCompanyInfo, 
    categories, translationsList, refreshAllData, services, teamMembers, 
    heroBanners, partners, branches, careers, faq, downloads, testimonials, certificates 
  } = useLanguage();

  const { homepageData } = useHomepage();
  const { servicesPageData } = useServicesPage();
  const { aboutPageData } = useAboutPage();
  
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [sessionToken, setSessionToken] = useState('');

  // Admin Custom Password Management
  const [adminPassword, setAdminPassword] = useState<string>(() => {
    const saved = localStorage.getItem('sdy_admin_custom_password');
    if (saved === 'admin123') {
      localStorage.removeItem('sdy_admin_custom_password');
    }
    return (saved && saved !== 'admin123') ? saved : ((import.meta as any).env?.VITE_ADMIN_PASSWORD || 'sdy2026');
  });
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [oldPassInput, setOldPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmPassInput, setConfirmPassInput] = useState('');
  const [showPasswordChangeFormOnLogin, setShowPasswordChangeFormOnLogin] = useState(false);

  // Metadata-Driven CMS State
  const [customSchemas, setCustomSchemas] = useState<EntitySchema[]>(PRESET_SCHEMAS);
  const [activeDynamicSchema, setActiveDynamicSchema] = useState<EntitySchema>(PRESET_SCHEMAS[0]);
  const [pageSections, setPageSections] = useState<PageSectionConfig[]>([]);

  // Tab State
  const [activeTab, setActiveTab] = useState<
    'messages' | 'concrete_orders' | 'commercial_docs' | 'products' | 'projects' | 'blogs' | 'info' | 'categories' | 'translations' | 'sheets' |
    'platform_governance' | 'entity_builder' | 'dynamic_manager' | 'section_builder' | 'media_library'
  >(() => {
    const savedTab = localStorage.getItem('sdy_admin_active_tab') as any;
    if (savedTab) return savedTab;
    return 'messages';
  });

  // Tab navigation listener for deep links like admin-products
  useEffect(() => {
    const handleTabChange = (e: any) => {
      if (e.detail && typeof e.detail === 'string') {
        setActiveTab(e.detail as any);
      }
    };
    window.addEventListener('sdy_admin_tab_change', handleTabChange);
    return () => {
      window.removeEventListener('sdy_admin_tab_change', handleTabChange);
    };
  }, []);
  
  // Datasets State
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [concreteOrdersList, setConcreteOrdersList] = useState<ConcreteOrder[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [blogsList, setBlogsList] = useState<BlogPost[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [translationsListState, setTranslationsListState] = useState<any[]>([]);
  
  // Webhook Configuration State
  const [sheetsConfig, setSheetsConfig] = useState<AdminConfig>({
    googleSheetsWebhookUrl: '',
    isSyncEnabled: false
  });

  // Company Information State
  const [companyInfo, setCompanyInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('sdy_company_info');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      CompanyName: 'SDY COMPANY',
      Logo: 'SDY',
      Tagline: 'Construction & Interior',
      PhoneNumber: '+855 (0) 23 888 999',
      Telegram: 'https://t.me/sdycompanyci',
      WhatsApp: 'https://wa.me/85523888999',
      Facebook: 'https://facebook.com/sdycompanyci',
      TikTok: 'https://tiktok.com/@sdycompanyci',
      YouTube: 'https://youtube.com/@sdycompanyci',
      Email: 'info@sdy-ci.com',
      Address: 'Phnom Penh, Cambodia',
      GoogleMapEmbedURL: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3908.7706603099953!2d104.8885621!3d11.5682855!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3109513dc76a6e7b%3A0x4eb29ef3878b2735!2sPhnom%20Penh%20International%20Airport!5e0!3m2!1sen!2skh!4v1721245000000!5m2!1sen!2skh',
      WorkingHours: 'Mon - Sat: 8:00 AM - 5:00 PM'
    };
  });

  // UI state managers
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUploading, setIsUploading] = useState<{[key: string]: boolean}>({});
  const [copiedScript, setCopiedScript] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  const [errorToast, setErrorToast] = useState('');

  // Direct Google Workspace Integration State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [userSpreadsheets, setUserSpreadsheets] = useState<SpreadsheetFile[]>([]);
  const [activeSpreadsheetId, setActiveSpreadsheetId] = useState<string>(() => {
    return localStorage.getItem('sdy_active_spreadsheet_id') || '';
  });
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Initialize Firebase Auth listener for Google Account
  useEffect(() => {
    const unsubscribe = initAuth(
      (u, tok) => {
        setGoogleUser(u);
        setGoogleToken(tok);
        if (tok) {
          listGoogleSpreadsheets(tok).then(files => setUserSpreadsheets(files)).catch(() => {});
        }
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setGoogleToken(res.accessToken);
        showToast(`Signed in as ${res.user.email}`);
        const files = await listGoogleSpreadsheets(res.accessToken);
        setUserSpreadsheets(files);
      }
    } catch (err: any) {
      showErrorToast(err.message || 'Google Sign-In failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleLogout = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    setGoogleToken(null);
    setUserSpreadsheets([]);
    showToast('Signed out from Google Account');
  };

  const handleCreateNewSheet = async () => {
    if (!googleToken) {
      showErrorToast('Please sign in with Google first.');
      return;
    }
    setIsGoogleLoading(true);
    try {
      const sheet = await createNewGoogleSheet(googleToken, 'SDY_Company_Database');
      setActiveSpreadsheetId(sheet.spreadsheetId);
      localStorage.setItem('sdy_active_spreadsheet_id', sheet.spreadsheetId);
      showToast('Created new SDY Database Google Sheet in Drive!');
      
      // Auto sync all company datasets (Products, Projects, Blog, Categories, Messages, CompanyInfo)
      const currentProducts = productsList.length > 0 ? productsList : PRODUCTS;
      const currentProjects = projectsList.length > 0 ? projectsList : PROJECTS;
      const currentBlogs = blogsList.length > 0 ? blogsList : BLOG_POSTS;
      const currentCategories = categoriesList.length > 0 ? categoriesList : [
        { id: 'cat_doors', name: 'Doors & Windows', type: 'product' },
        { id: 'cat_fitout', name: 'Interior Fit-Out', type: 'project' },
        { id: 'cat_renov', name: 'Renovation', type: 'project' },
        { id: 'cat_furn', name: 'Furniture', type: 'product' }
      ];

      await syncAllDataToSheet(googleToken, sheet.spreadsheetId, {
        products: currentProducts,
        projects: currentProjects,
        blogs: currentBlogs,
        categories: currentCategories,
        messages: messages,
        companyInfo: companyInfo
      });
      showToast('All company datasets synced to new Google Sheet!');

      const files = await listGoogleSpreadsheets(googleToken);
      setUserSpreadsheets(files);
    } catch (err: any) {
      showErrorToast(err.message || 'Failed to create Google Sheet');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSyncProductsToSelectedSheet = async () => {
    if (!googleToken) {
      showErrorToast('Please sign in with Google first.');
      return;
    }
    if (!activeSpreadsheetId) {
      showErrorToast('Please select or create a Google Sheet first.');
      return;
    }
    setIsGoogleLoading(true);
    try {
      const currentProducts = productsList.length > 0 ? productsList : PRODUCTS;
      await syncProductsToSheet(googleToken, activeSpreadsheetId, currentProducts);
      showToast('Successfully synced all products to Google Sheet!');
    } catch (err: any) {
      showErrorToast(err.message || 'Failed to sync products to Google Sheet');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleImportProductsFromSelectedSheet = async () => {
    if (!googleToken) {
      showErrorToast('Please sign in with Google first.');
      return;
    }
    if (!activeSpreadsheetId) {
      showErrorToast('Please select or create a Google Sheet first.');
      return;
    }
    setIsGoogleLoading(true);
    try {
      const imported = await fetchProductsFromSheet(googleToken, activeSpreadsheetId);
      if (imported && imported.length > 0) {
        setProductsList(imported);
        localStorage.setItem('sdy_local_products', JSON.stringify(imported));
        window.dispatchEvent(new Event('sdy_products_updated'));
        showToast(`Imported ${imported.length} products from Google Sheet!`);
      } else {
        showToast('No products found in the Products tab of selected sheet.');
      }
    } catch (err: any) {
      showErrorToast(err.message || 'Failed to import products from Google Sheet');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSyncProjectsToSelectedSheet = async () => {
    if (!googleToken) {
      showErrorToast('Please sign in with Google first.');
      return;
    }
    if (!activeSpreadsheetId) {
      showErrorToast('Please select or create a Google Sheet first.');
      return;
    }
    setIsGoogleLoading(true);
    try {
      const currentProjects = projectsList.length > 0 ? projectsList : PROJECTS;
      await syncProjectsToSheet(googleToken, activeSpreadsheetId, currentProjects);
      showToast('Successfully synced all projects to Google Sheet!');
    } catch (err: any) {
      showErrorToast(err.message || 'Failed to sync projects to Google Sheet');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleImportProjectsFromSelectedSheet = async () => {
    if (!googleToken) {
      showErrorToast('Please sign in with Google first.');
      return;
    }
    if (!activeSpreadsheetId) {
      showErrorToast('Please select or create a Google Sheet first.');
      return;
    }
    setIsGoogleLoading(true);
    try {
      const imported = await fetchProjectsFromSheet(googleToken, activeSpreadsheetId);
      if (imported && imported.length > 0) {
        setProjectsList(imported);
        localStorage.setItem('sdy_local_projects', JSON.stringify(imported));
        showToast(`Imported ${imported.length} projects from Google Sheet!`);
      } else {
        showToast('No projects found in the Projects tab of selected sheet.');
      }
    } catch (err: any) {
      showErrorToast(err.message || 'Failed to import projects from Google Sheet');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSyncBlogsToSelectedSheet = async () => {
    if (!googleToken) {
      showErrorToast('Please sign in with Google first.');
      return;
    }
    if (!activeSpreadsheetId) {
      showErrorToast('Please select or create a Google Sheet first.');
      return;
    }
    setIsGoogleLoading(true);
    try {
      const currentBlogs = blogsList.length > 0 ? blogsList : BLOG_POSTS;
      await syncBlogsToSheet(googleToken, activeSpreadsheetId, currentBlogs);
      showToast('Successfully synced all blog articles to Google Sheet!');
    } catch (err: any) {
      showErrorToast(err.message || 'Failed to sync blogs to Google Sheet');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleImportBlogsFromSelectedSheet = async () => {
    if (!googleToken) {
      showErrorToast('Please sign in with Google first.');
      return;
    }
    if (!activeSpreadsheetId) {
      showErrorToast('Please select or create a Google Sheet first.');
      return;
    }
    setIsGoogleLoading(true);
    try {
      const imported = await fetchBlogsFromSheet(googleToken, activeSpreadsheetId);
      if (imported && imported.length > 0) {
        setBlogsList(imported);
        localStorage.setItem('sdy_local_blogs', JSON.stringify(imported));
        showToast(`Imported ${imported.length} blog articles from Google Sheet!`);
      } else {
        showToast('No articles found in the Blog tab of selected sheet.');
      }
    } catch (err: any) {
      showErrorToast(err.message || 'Failed to import blogs from Google Sheet');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSyncCategoriesToSelectedSheet = async () => {
    if (!googleToken) {
      showErrorToast('Please sign in with Google first.');
      return;
    }
    if (!activeSpreadsheetId) {
      showErrorToast('Please select or create a Google Sheet first.');
      return;
    }
    setIsGoogleLoading(true);
    try {
      const currentCategories = categoriesList.length > 0 ? categoriesList : [
        { id: 'cat_doors', name: 'Doors & Windows', type: 'product' },
        { id: 'cat_fitout', name: 'Interior Fit-Out', type: 'project' },
        { id: 'cat_renov', name: 'Renovation', type: 'project' },
        { id: 'cat_furn', name: 'Furniture', type: 'product' }
      ];
      await syncCategoriesToSheet(googleToken, activeSpreadsheetId, currentCategories);
      showToast('Successfully synced all categories to Google Sheet!');
    } catch (err: any) {
      showErrorToast(err.message || 'Failed to sync categories to Google Sheet');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleImportCategoriesFromSelectedSheet = async () => {
    if (!googleToken) {
      showErrorToast('Please sign in with Google first.');
      return;
    }
    if (!activeSpreadsheetId) {
      showErrorToast('Please select or create a Google Sheet first.');
      return;
    }
    setIsGoogleLoading(true);
    try {
      const imported = await fetchCategoriesFromSheet(googleToken, activeSpreadsheetId);
      if (imported && imported.length > 0) {
        setCategoriesList(imported);
        showToast(`Imported ${imported.length} categories from Google Sheet!`);
      } else {
        showToast('No categories found in the Categories tab of selected sheet.');
      }
    } catch (err: any) {
      showErrorToast(err.message || 'Failed to import categories from Google Sheet');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSyncAllDataToSelectedSheet = async () => {
    if (!googleToken) {
      showErrorToast('Please sign in with Google first.');
      return;
    }
    if (!activeSpreadsheetId) {
      showErrorToast('Please select or create a Google Sheet first.');
      return;
    }
    setIsGoogleLoading(true);
    try {
      const currentProducts = productsList.length > 0 ? productsList : PRODUCTS;
      const currentProjects = projectsList.length > 0 ? projectsList : PROJECTS;
      const currentBlogs = blogsList.length > 0 ? blogsList : BLOG_POSTS;
      const currentCategories = categoriesList.length > 0 ? categoriesList : [
        { id: 'cat_doors', name: 'Doors & Windows', type: 'product' },
        { id: 'cat_fitout', name: 'Interior Fit-Out', type: 'project' },
        { id: 'cat_renov', name: 'Renovation', type: 'project' },
        { id: 'cat_furn', name: 'Furniture', type: 'product' }
      ];

      await syncAllDataToSheet(googleToken, activeSpreadsheetId, {
        products: currentProducts,
        projects: currentProjects,
        blogs: currentBlogs,
        categories: currentCategories,
        messages: messages,
        companyInfo: companyInfo,
        homepageData: homepageData,
        servicesData: servicesPageData,
        aboutData: aboutPageData
      });
      showToast('Successfully synced ALL company data (Products, Projects, Blog, Categories, Messages, CompanyInfo, Homepage_CMS, Services_CMS, About_CMS) to Google Sheet!');
    } catch (err: any) {
      showErrorToast(err.message || 'Failed to sync all data to Google Sheet');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleImportAllDataFromSelectedSheet = async () => {
    if (!activeSpreadsheetId && !sheetsConfig.googleSheetsWebhookUrl) {
      showErrorToast('Please select a Google Sheet or configure a Webhook URL first.');
      return;
    }
    setIsGoogleLoading(true);
    try {
      const data = await fetchAllSheetTabsData({
        webhookUrl: sheetsConfig.googleSheetsWebhookUrl,
        accessToken: googleToken,
        spreadsheetId: activeSpreadsheetId
      });

      if (data) {
        let importedCount = 0;
        if (data.products.length > 0) {
          setProductsList(data.products);
          localStorage.setItem('sdy_local_products', JSON.stringify(data.products));
          importedCount += data.products.length;
        }
        if (data.projects.length > 0) {
          setProjectsList(data.projects);
          localStorage.setItem('sdy_local_projects', JSON.stringify(data.projects));
          importedCount += data.projects.length;
        }
        if (data.blogs.length > 0) {
          setBlogsList(data.blogs);
          localStorage.setItem('sdy_local_blogs', JSON.stringify(data.blogs));
          importedCount += data.blogs.length;
        }
        if (data.categories.length > 0) {
          setCategoriesList(data.categories);
        }
        if (data.companyInfo && Object.keys(data.companyInfo).length > 0) {
          localStorage.setItem('sdy_company_info', JSON.stringify(data.companyInfo));
          window.dispatchEvent(new Event('sdy_company_info_updated'));
        }
        await refreshAllData();
        showToast(`Successfully imported multi-sheet data (${importedCount} total items across Products, Projects, Blogs, Categories, etc.)!`);
      } else {
        showErrorToast('No data retrieved from selected Google Sheet / Webhook.');
      }
    } catch (err: any) {
      showErrorToast(err.message || 'Failed to import multi-sheet data from Google Sheet');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Sync states with global Context from Google Sheets
  useEffect(() => {
    setProductsList(products);
  }, [products]);

  useEffect(() => {
    setProjectsList(projects);
  }, [projects]);

  useEffect(() => {
    setBlogsList(blogs);
  }, [blogs]);

  useEffect(() => {
    if (dynamicCompanyInfo) {
      setCompanyInfo(dynamicCompanyInfo);
    }
  }, [dynamicCompanyInfo]);

  useEffect(() => {
    setCategoriesList(categories || []);
  }, [categories]);

  useEffect(() => {
    setTranslationsListState(translationsList || []);
  }, [translationsList]);

  // CRUD Editing states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [previewPdfUri, setPreviewPdfUri] = useState<string | null>(null);
  const [selectedProductVersions, setSelectedProductVersions] = useState<Product | null>(null);
  const [showVersionsModal, setShowVersionsModal] = useState(false);
  const [productForm, setProductForm] = useState({
    id: '', // Product Code
    name: '',
    category: 'Doors & Windows',
    collection: '',
    language: 'en',
    revision: 'REV-2026.01',
    image: '',
    gallery: '',
    description: '',
    specification: '',
    material: '',
    size: '',
    pdfUrl: '#',
    pdf_spec_url: '',
    price: '',
    originalPrice: '',
    promotionTag: '',
    isPromotional: false,
    
    // Multilingual names and descriptions
    ProductName_EN: '',
    ProductName_KH: '',
    ProductName_KO: '',
    Description_EN: '',
    Description_KH: '',
    Description_KO: '',
    shortDescriptionEN: '',
    shortDescriptionKH: '',
    shortDescriptionKO: '',
    longDescriptionEN: '',
    longDescriptionKH: '',
    longDescriptionKO: '',
    
    // Specifications
    construction: '',
    finish: '',
    customSize: '',
    weight: '',
    fireRating: '',
    acousticRating: '',
    warranty: '',
    productFeatures: '',
    technicalNotes: '',
    specificationTable: '',
    
    // Advanced drawings & images
    galleryImage1: '',
    galleryImage2: '',
    galleryImage3: '',
    galleryImage4: '',
    technicalDrawing: '',
    crossSectionDrawing: '',
    dimensionDrawing: '',
    installationDrawing: '',
    
    // Certificates
    cert_iso: false,
    cert_ul: false,
    cert_astm: false,
    cert_fireRated: false,
    cert_acousticTested: false,
    cert_ce: false,
    cert_fsc: false,
    
    // Applications
    app_residential: false,
    app_apartment: false,
    app_hotel: false,
    app_office: false,
    app_hospital: false,
    app_school: false,
    app_luxuryVilla: false,
    app_commercial: false,
    app_retail: false,
    app_airport: false,
    app_shoppingMall: false,
  });

  const [productFormLang, setProductFormLang] = useState<'km' | 'en' | 'ko'>('km');
  const [projectFormLang, setProjectFormLang] = useState<'km' | 'en' | 'ko'>('km');
  const [blogFormLang, setBlogFormLang] = useState<'km' | 'en' | 'ko'>('km');

  // Synchronize internal form language states with global LanguageContext
  useEffect(() => {
    if (language === 'km' || language === 'en' || language === 'ko') {
      setProductFormLang(language);
      setProjectFormLang(language);
      setBlogFormLang(language);
    }
  }, [language]);

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: '',
    category: 'Commercial Fit-Out',
    coverImage: '',
    gallery: '',
    location: '',
    area: '',
    completionYear: '',
    description: '',
    constructionType: '',
    client: '',
    Title_KH: '',
    Title_EN: '',
    Title_KO: '',
    Description_KH: '',
    Description_EN: '',
    Description_KO: ''
  });

  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [isAddingBlog, setIsAddingBlog] = useState(false);
  const [blogForm, setBlogForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'General Insights',
    image: '',
    author: 'Corporate Administrator',
    Title_KH: '',
    Title_EN: '',
    Title_KO: '',
    Excerpt_KH: '',
    Excerpt_EN: '',
    Excerpt_KO: '',
    Content_KH: '',
    Content_EN: '',
    Content_KO: '',
    Author_KH: '',
    Author_EN: '',
    Author_KO: ''
  });

  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    id: '',
    name: '',
    type: 'product'
  });

  const [editingTranslation, setEditingTranslation] = useState<any | null>(null);
  const [isAddingTranslation, setIsAddingTranslation] = useState(false);
  const [translationForm, setTranslationForm] = useState({
    key: '',
    khmer: '',
    english: '',
    korean: ''
  });

  // Universal Google Sheets 22-sheet Database Console States
  const [selectedSheet, setSelectedSheet] = useState('Products');
  const [sheetRows, setSheetRows] = useState<any[]>([]);
  const [sheetColumns, setSheetColumns] = useState<string[]>([]);
  const [isLoadingSheet, setIsLoadingSheet] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [editingSheetRow, setEditingSheetRow] = useState<any | null>(null);
  const [isAddingSheetRow, setIsAddingSheetRow] = useState(false);
  const [sheetSearchQuery, setSheetSearchQuery] = useState('');
  const [bulkUpdateField, setBulkUpdateField] = useState('');
  const [bulkUpdateValue, setBulkUpdateValue] = useState('');

  // Auto-authentication check
  useEffect(() => {
    const logged = localStorage.getItem('sdy_admin_logged_in');
    if (logged === 'true') {
      setIsLoggedIn(true);
      setSessionToken(localStorage.getItem('sdy_admin_session_token') || '');
    }
    loadLocalData();
  }, []);

  // Sync data from Google Sheets when webhook configured and active
  useEffect(() => {
    if (isLoggedIn && sheetsConfig.googleSheetsWebhookUrl && sheetsConfig.isSyncEnabled) {
      syncDataFromSheets();
    }
  }, [isLoggedIn, sheetsConfig.googleSheetsWebhookUrl, sheetsConfig.isSyncEnabled]);

  useEffect(() => {
    const handleNewOrder = () => {
      const orders = localStorage.getItem('sdy_concrete_orders');
      if (orders) {
        setConcreteOrdersList(JSON.parse(orders));
      }
    };
    window.addEventListener('sdy_concrete_order_submitted', handleNewOrder);
    return () => window.removeEventListener('sdy_concrete_order_submitted', handleNewOrder);
  }, []);

  const loadLocalData = () => {
    // 1. Messages
    const savedMsgs = localStorage.getItem('sdy_contact_messages');
    if (savedMsgs) {
      setMessages(JSON.parse(savedMsgs));
    } else {
      const seedMsgs: ContactMessage[] = [
        {
          id: 'seed_1',
          name: 'Chea Sophal',
          email: 'sphal.chea@vattanac.com',
          phone: '+855 12 777 888',
          company: 'Vattanac properties',
          subject: 'Interior Fit-Out Estimate',
          message: 'Need a complete design and fit-out proposal for our new corporate workspace on level 12. Total area is approximately 450 sqm. Soundproof doors are a key requirement.',
          date: '7/17/2026, 09:30 AM',
          status: 'Pending'
        }
      ];
      localStorage.setItem('sdy_contact_messages', JSON.stringify(seedMsgs));
      setMessages(seedMsgs);
    }

    // 2. Concrete Orders (បេតុងទិញ)
    const savedConcreteOrders = localStorage.getItem('sdy_concrete_orders');
    if (savedConcreteOrders) {
      setConcreteOrdersList(JSON.parse(savedConcreteOrders));
    }

    // 5. Config
    const savedConfig = localStorage.getItem('sdy_admin_config');
    if (savedConfig) {
      setSheetsConfig(JSON.parse(savedConfig));
    }
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const showErrorToast = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(''), 4000);
  };

  // Google Sheets Action Executor
  const executeSheetsAction = async (action: string, payload: any) => {
    if (!sheetsConfig.googleSheetsWebhookUrl || !sheetsConfig.isSyncEnabled) {
      return { status: 'local_only' };
    }
    const url = sheetsConfig.googleSheetsWebhookUrl.trim();
    if (url.includes('docs.google.com/spreadsheets')) {
      return { 
        status: 'error', 
        message: 'Invalid Webhook URL. You provided a Google Sheets spreadsheet link instead of a Google Apps Script Web App URL (https://script.google.com/macros/s/.../exec).' 
      };
    }
    try {
      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action,
          sessionToken,
          ...payload
        })
      });
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (jsonErr) {
        return {
          status: 'error',
          message: 'Webhook URL returned non-JSON response. Please check Apps Script deployment.'
        };
      }
    } catch (e: any) {
      console.warn('Apps Script Webhook offline or unreachable:', e?.message || e);
      return { status: 'error', message: 'Apps Script Webhook URL is unreachable. Data saved locally & synced to direct Google Sheet.' };
    }
  };

  const syncDataFromSheets = async () => {
    setIsSyncing(true);
    try {
      await refreshAllData();
      showToast('Datasets synchronized with Google Sheets successfully!');
    } catch (err) {
      console.error('Bi-directional sheets synchronization error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleForcePushAllCmsData = async () => {
    const webhookUrl = sheetsConfig.googleSheetsWebhookUrl || (import.meta as any).env?.VITE_GOOGLE_SHEETS_URL || '';
    if (!webhookUrl || !webhookUrl.startsWith('http')) {
      alert('Please configure a valid Google Apps Script Webhook URL first in Settings > Google Sheets!');
      return;
    }

    setIsSyncing(true);
    let successCount = 0;
    let failCount = 0;

    const pushPayload = async (action: string, sheetName: string, dataPayload: any) => {
      try {
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action, sheetName, data: dataPayload })
        });
        if (res.ok) successCount++;
        else failCount++;
      } catch (err) {
        console.error(`Force push error for ${sheetName}:`, err);
        failCount++;
      }
    };

    // 1. Homepage CMS Data
    let hpData = null;
    try {
      const saved = localStorage.getItem('sdy_homepage_cms_data') || localStorage.getItem('sdy_homepage_content');
      if (saved) hpData = JSON.parse(saved);
    } catch (e) {}
    if (!hpData) hpData = defaultHomepageCmsData;

    // 2. Services Page Data
    let srvData = null;
    try {
      const saved = localStorage.getItem('sdy_services_page_data');
      if (saved) srvData = JSON.parse(saved);
    } catch (e) {}
    if (!srvData) srvData = defaultServicesPageData;

    // 3. About Us Page Data
    let abtData = null;
    try {
      const saved = localStorage.getItem('sdy_about_page_data');
      if (saved) abtData = JSON.parse(saved);
    } catch (e) {}
    if (!abtData) abtData = defaultAboutPageData;

    // 4. Testimonials Data
    let tstData = null;
    try {
      const saved = localStorage.getItem('sdy_local_testimonials');
      if (saved) tstData = JSON.parse(saved);
    } catch (e) {}
    if (!tstData) tstData = TESTIMONIALS;

    await pushPayload('homepage_cms.save', 'Homepage_CMS', hpData);
    await pushPayload('services_page.save', 'Services_Page', srvData);
    await pushPayload('about_us.save', 'About_Us', abtData);
    await pushPayload('testimonials.save', 'Testimonials', tstData);

    setIsSyncing(false);
    if (failCount === 0) {
      showToast('🚀 All 4 CMS Sheet Tabs initialized & pushed to Google Sheets!');
    } else {
      showErrorToast(`Push completed: ${successCount} synced, ${failCount} failed. Check your Webhook URL.`);
    }
  };

  // ==================== UNIVERSAL DATABASE CONSOLE METHODS ====================
  const SHEETS_LIST = [
    { name: 'Products', idKey: 'ProductID' },
    { name: 'Projects', idKey: 'ProjectID' },
    { name: 'DoorAndFurnitureOrders', idKey: 'id' },
    { name: 'Blog', idKey: 'BlogID' },
    { name: 'CompanyInfo', idKey: 'Key' },
    { name: 'ContactMessages', idKey: 'id' },
    { name: 'Categories', idKey: 'CategoryID' },
    { name: 'Translations', idKey: 'Key' },
    { name: 'Homepage_CMS', idKey: 'Id' },
    { name: 'Services_Page', idKey: 'Id' },
    { name: 'About_Us', idKey: 'Id' },
    { name: 'Testimonials', idKey: 'TestimonialID' },
    { name: 'Quotations', idKey: 'QuotationID' },
    { name: 'BOQs', idKey: 'BOQID' },
    { name: 'DeliveryNotes', idKey: 'DeliveryNoteID' },
    { name: 'Users', idKey: 'UserID' },
    { name: 'Settings', idKey: 'Key' },
    { name: 'ActivityLogs', idKey: 'LogID' },
    { name: 'Gallery', idKey: 'id' },
    { name: 'Files', idKey: 'id' },
    { name: 'Services', idKey: 'ServiceID' },
    { name: 'Downloads', idKey: 'DownloadID' },
    { name: 'FAQ', idKey: 'FAQID' },
    { name: 'Careers', idKey: 'JobID' },
    { name: 'Certificates', idKey: 'CertificateID' },
    { name: 'Navigation', idKey: 'NavID' },
    { name: 'Footer', idKey: 'FooterID' },
    { name: 'SEO', idKey: 'PageID' },
    { name: 'Homepage', idKey: 'SectionID' }
  ];

  const loadSelectedSheetData = async (sheetName = selectedSheet) => {
    if (!sheetsConfig.googleSheetsWebhookUrl || !sheetsConfig.isSyncEnabled) {
      return;
    }
    setIsLoadingSheet(true);
    setSelectedRowIds([]);
    try {
      const res = await executeSheetsAction('readTable', { sheetName });
      if (res && res.status === 'success' && Array.isArray(res.data)) {
        setSheetRows(res.data);
        if (res.data.length > 0) {
          const cols = Object.keys(res.data[0]).filter(k => k !== 'rowNum');
          setSheetColumns(cols);
        } else {
          const sheetInfo = SHEETS_LIST.find(s => s.name === sheetName);
          setSheetColumns([sheetInfo?.idKey || 'id', 'Created', 'Updated']);
        }
      } else {
        setSheetRows([]);
        setSheetColumns([]);
      }
    } catch (err) {
      console.error('Error loading sheet data:', err);
    } finally {
      setIsLoadingSheet(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'sheets' && sheetsConfig.googleSheetsWebhookUrl && sheetsConfig.isSyncEnabled) {
      loadSelectedSheetData(selectedSheet);
    }
  }, [selectedSheet, activeTab, sheetsConfig.googleSheetsWebhookUrl, sheetsConfig.isSyncEnabled]);

  const handleDeleteSheetRow = async (idValue: string) => {
    if (!confirm(`Are you sure you want to delete this record (${idValue})? This action is immediate and permanent.`)) return;
    setIsLoadingSheet(true);
    const sheetInfo = SHEETS_LIST.find(s => s.name === selectedSheet);
    const idKey = sheetInfo?.idKey || 'id';
    try {
      const res = await executeSheetsAction('removeRecord', {
        sheetName: selectedSheet,
        idKey,
        idValue
      });
      if (res && res.status === 'success') {
        showToast(`Record ${idValue} successfully deleted.`);
        await loadSelectedSheetData();
      } else {
        showErrorToast(res && res.message ? res.message : "Failed to delete record.");
      }
    } catch (err) {
      console.error(err);
      showErrorToast("Error removing record.");
    } finally {
      setIsLoadingSheet(false);
    }
  };

  const handleBulkDeleteSheetRows = async () => {
    if (selectedRowIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete all ${selectedRowIds.length} selected records?`)) return;
    setIsLoadingSheet(true);
    const sheetInfo = SHEETS_LIST.find(s => s.name === selectedSheet);
    const idKey = sheetInfo?.idKey || 'id';
    try {
      const res = await executeSheetsAction('bulkDeleteRecords', {
        sheetName: selectedSheet,
        idKey,
        idValues: selectedRowIds
      });
      if (res && res.status === 'success') {
        showToast(`Successfully deleted ${selectedRowIds.length} records.`);
        await loadSelectedSheetData();
      } else {
        showErrorToast(res && res.message ? res.message : "Failed to perform bulk deletion.");
      }
    } catch (err) {
      console.error(err);
      showErrorToast("Error in bulk delete transaction.");
    } finally {
      setIsLoadingSheet(false);
    }
  };

  const handleBulkUpdateSheetRows = async () => {
    if (selectedRowIds.length === 0 || !bulkUpdateField) {
      showErrorToast("Please select rows and a field to update.");
      return;
    }
    if (!confirm(`Bulk Update: Are you sure you want to update "${bulkUpdateField}" to "${bulkUpdateValue}" for ${selectedRowIds.length} rows?`)) return;
    setIsLoadingSheet(true);
    const sheetInfo = SHEETS_LIST.find(s => s.name === selectedSheet);
    const idKey = sheetInfo?.idKey || 'id';
    try {
      const res = await executeSheetsAction('bulkUpdateRecords', {
        sheetName: selectedSheet,
        idKey,
        idValues: selectedRowIds,
        field: bulkUpdateField,
        value: bulkUpdateValue
      });
      if (res && res.status === 'success') {
        showToast(`Successfully updated ${selectedRowIds.length} records.`);
        setBulkUpdateField('');
        setBulkUpdateValue('');
        await loadSelectedSheetData();
      } else {
        showErrorToast(res && res.message ? res.message : "Failed to perform bulk update.");
      }
    } catch (err) {
      console.error(err);
      showErrorToast("Error in bulk update transaction.");
    } finally {
      setIsLoadingSheet(false);
    }
  };

  const handleSaveSheetRow = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingSheetRow) return;
    setIsLoadingSheet(true);
    const sheetInfo = SHEETS_LIST.find(s => s.name === selectedSheet);
    const idKey = sheetInfo?.idKey || 'id';
    
    try {
      const res = await executeSheetsAction('saveRecord', {
        sheetName: selectedSheet,
        idKey,
        record: editingSheetRow
      });
      if (res && res.status === 'success') {
        showToast("Record successfully committed to Google Sheets.");
        setEditingSheetRow(null);
        setIsAddingSheetRow(false);
        await loadSelectedSheetData();
      } else {
        showErrorToast(res && res.message ? res.message : "Failed to commit record.");
      }
    } catch (err) {
      console.error(err);
      showErrorToast("Error saving record.");
    } finally {
      setIsLoadingSheet(false);
    }
  };

  const handleChangePassword = (e: FormEvent) => {
    e.preventDefault();
    const envPass = (import.meta as any).env?.VITE_ADMIN_PASSWORD;
    const sheetPass = companyInfo?.AdminPassword || companyInfo?.adminPassword || companyInfo?.ADMIN_PASSWORD;
    const savedCustom = localStorage.getItem('sdy_admin_custom_password');
    if (savedCustom === 'admin123') {
      localStorage.removeItem('sdy_admin_custom_password');
    }
    const customPass = (savedCustom && savedCustom !== 'admin123') ? savedCustom : null;
    const currentStoredPass = customPass || (adminPassword && adminPassword !== 'admin123' ? adminPassword : null) || envPass || sheetPass || 'sdy2026';

    const validOldPasswords = [
      currentStoredPass.trim(),
      customPass?.trim(),
      'sdy2026',
      '095426095',
      envPass?.trim(),
      sheetPass?.trim()
    ].filter(Boolean);

    if (!validOldPasswords.includes(oldPassInput.trim())) {
      showErrorToast(language === 'km' ? 'ពាក្យសម្ងាត់បច្ចុប្បន្នមិនត្រឹមត្រូវទេ!' : 'Current password is incorrect!');
      return;
    }

    if (!newPassInput || newPassInput.trim().length < 3) {
      showErrorToast(language === 'km' ? 'ពាក្យសម្ងាត់ថ្មីត្រូវមានយ៉ាងហោចណាស់ ៣ តួអក្សរ!' : 'New password must be at least 3 characters!');
      return;
    }

    if (newPassInput !== confirmPassInput) {
      showErrorToast(language === 'km' ? 'ពាក្យសម្ងាត់ថ្មី និងការផ្ទៀងផ្ទាត់មិនត្រូវគ្នាទេ!' : 'New password and confirmation do not match!');
      return;
    }

    const updatedPass = newPassInput.trim();
    setAdminPassword(updatedPass);
    localStorage.setItem('sdy_admin_custom_password', updatedPass);
    
    setIsChangePasswordOpen(false);
    setShowPasswordChangeFormOnLogin(false);
    setOldPassInput('');
    setNewPassInput('');
    setConfirmPassInput('');

    showToast(language === 'km' ? 'ពាក្យសម្ងាត់ Admin ត្រូវបានផ្លាស់ប្តូរដោយជោគជ័យ!' : 'Admin password updated successfully!');
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);

    const saved = localStorage.getItem('sdy_admin_custom_password');
    if (saved === 'admin123') {
      localStorage.removeItem('sdy_admin_custom_password');
    }
    const customPass = (saved && saved !== 'admin123') ? saved : null;
    const envPass = (import.meta as any).env?.VITE_ADMIN_PASSWORD;
    const sheetPass = companyInfo?.AdminPassword || companyInfo?.adminPassword || companyInfo?.ADMIN_PASSWORD;

    const inputTrimmed = passwordInput.trim();

    // Valid passcodes include any custom password set plus initial master passcodes 'sdy2026' and '095426095'
    const validPasscodes = [
      customPass?.trim(),
      (adminPassword && adminPassword !== 'admin123' ? adminPassword.trim() : null),
      'sdy2026',
      '095426095',
      envPass?.trim(),
      sheetPass?.trim()
    ].filter(Boolean);

    if (validPasscodes.includes(inputTrimmed)) {
      setIsLoggedIn(true);
      localStorage.setItem('sdy_admin_logged_in', 'true');
      showToast(language === 'km' ? 'បានចូលប្រើប្រាស់ Admin ដោយជោគជ័យ!' : 'Admin mode authenticated successfully!');
      setIsSyncing(false);
      return;
    }

    // Otherwise, check via Google Sheets Webhook authentication if configured
    if (sheetsConfig.googleSheetsWebhookUrl && sheetsConfig.isSyncEnabled) {
      try {
        const url = sheetsConfig.googleSheetsWebhookUrl.trim();
        if (url.includes('docs.google.com/spreadsheets')) {
          showErrorToast('Invalid Webhook URL: Enter Apps Script URL (https://script.google.com/macros/s/.../exec)');
          setIsSyncing(false);
          return;
        }
        const response = await fetch(url, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify({
            action: 'adminLogin',
            password: passwordInput
          })
        });
        const text = await response.text();
        let data: any;
        try {
          data = JSON.parse(text);
        } catch (jsonErr) {
          showErrorToast(language === 'km' ? 'ពាក្យសម្ងាត់មិនត្រឹមត្រូវឡើយ។' : 'Invalid password.');
          setIsSyncing(false);
          return;
        }
        if (data && data.status === 'success') {
          setIsLoggedIn(true);
          setSessionToken(data.token);
          localStorage.setItem('sdy_admin_logged_in', 'true');
          localStorage.setItem('sdy_admin_session_token', data.token);
          showToast(data.message || 'Authenticated successfully!');
          syncDataFromSheets();
        } else {
          showErrorToast(data.message || (language === 'km' ? 'ពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ!' : 'Invalid passcode.'));
        }
      } catch (err) {
        showErrorToast(language === 'km' ? 'ពាក្យសម្ងាត់មិនត្រឹមត្រូវឡើយ។' : 'Invalid password.');
      }
    } else {
      showErrorToast(language === 'km' ? 'ពាក្យសម្ងាត់មិនត្រឹមត្រូវឡើយ។' : 'Invalid password.');
    }
    setIsSyncing(false);
  };

  const handleLogout = async () => {
    if (sheetsConfig.googleSheetsWebhookUrl && sheetsConfig.isSyncEnabled && sessionToken) {
      await executeSheetsAction('adminLogout', {});
    }
    setIsLoggedIn(false);
    setSessionToken('');
    localStorage.removeItem('sdy_admin_logged_in');
    localStorage.removeItem('sdy_admin_session_token');
    showToast('Secure session logged out.');
  };

  // Google Drive Image & File Upload Handler
  const handleDriveFileUpload = async (e: ChangeEvent<HTMLInputElement>, fieldName: string, onUpdateUrl: (url: string) => void, referenceId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(prev => ({ ...prev, [fieldName]: true }));
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = reader.result as string;

        if (sheetsConfig.googleSheetsWebhookUrl && sheetsConfig.isSyncEnabled) {
          try {
            const res = await executeSheetsAction('uploadFileToDrive', {
              base64Data,
              filename: file.name,
              referenceId: referenceId || ''
            });
            if (res && res.status === 'success' && res.url) {
              onUpdateUrl(res.url);
              showToast(`Uploaded ${file.name} directly to Google Drive! URL is saved.`);
              return;
            } else {
              console.warn('Apps Script upload failed:', res.message);
              showErrorToast(res.message || 'Google Drive upload failed.');
            }
          } catch (err) {
            console.error('Google Drive direct upload exception:', err);
            showErrorToast('Google Drive upload failed. Please verify credentials.');
          }
        }

        // Local fallback: Keep base64 in state for real-time display immediately
        onUpdateUrl(base64Data);
        showToast('Local file selected. Configure Sheets Sync to upload directly to Google Drive!');
      };
    } catch (err) {
      showErrorToast('Could not convert or parse asset.');
    } finally {
      setIsUploading(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  // PDF Advanced Actions
  const handlePreviewPdf = async (product: Product) => {
    try {
      showToast("Generating preview...");
      const directPdf = product.pdf_spec_url || product.pdfUrl;
      if (directPdf && directPdf !== '#' && directPdf.trim()) {
        const rawUrl = directPdf.trim();
        const driveFileId = extractGoogleDriveFileId(rawUrl);
        if (driveFileId) {
          const viewUrl = getGoogleDriveViewUrl(rawUrl);
          window.open(viewUrl, '_blank', 'noopener,noreferrer');
          return;
        }
        if (rawUrl.startsWith('data:') || rawUrl.startsWith('blob:') || rawUrl.endsWith('.pdf')) {
          window.open(rawUrl, '_blank', 'noopener,noreferrer');
          return;
        }
      }
      const doc = await generateProductPdf(product, 'en', false);
      const pdfBlob = doc.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      setPreviewPdfUri(blobUrl);
    } catch (err) {
      console.error(err);
      showErrorToast("Could not generate PDF preview.");
    }
  };

  const handleDownloadPdfDirect = async (product: Product) => {
    try {
      showToast("Generating & Downloading PDF Specification...");
      const directPdf = product.pdf_spec_url || product.pdfUrl;
      if (directPdf && directPdf !== '#' && directPdf.trim()) {
        const cleanUrl = directPdf.trim().toLowerCase();
        if (cleanUrl.endsWith('.pdf') && !cleanUrl.includes('drive.google.com') && !cleanUrl.includes('lh3.googleusercontent.com')) {
          try {
            const res = await fetch(directPdf);
            if (res.ok) {
              const blob = await res.blob();
              const blobUrl = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = blobUrl;
              link.download = `SDY_${(product.name || 'Product').replace(/\s+/g, '_')}_Specification.pdf`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
              return;
            }
          } catch (e) {
            console.warn('Direct PDF fetch failed:', e);
          }
        }
      }
      await generateProductPdf(product, 'en', true);
    } catch (err) {
      console.error(err);
      showErrorToast("Could not download PDF.");
    }
  };

  const handleDeletePdfLink = async (product: Product) => {
    if (!confirm('Are you sure you want to delete the PDF Link from Google Sheets? Historical files will remain in Drive.')) return;
    setIsSyncing(true);
    try {
      const sheetRecord = {
        "ProductID": product.id,
        "PDF": "#",
        "PDFVersions": "[]"
      };
      const res = await executeSheetsAction('saveRecord', {
        sheetName: 'Products',
        idKey: 'ProductID',
        record: sheetRecord
      });
      if (res.status === 'success') {
        showToast("PDF URL successfully removed.");
        await refreshAllData();
      } else {
        showErrorToast(res.message || "Failed to remove PDF.");
      }
    } catch (err) {
      console.error(err);
      showErrorToast("Error removing PDF link.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRegenerateProductPdf = async (product: Product) => {
    setIsSyncing(true);
    showToast("Regenerating PDF & uploading to Google Drive...");
    try {
      // Generate client-side
      const doc = await generateProductPdf(product, 'en', false);
      const pdfBase64 = doc.output('datauristring');
      
      const existingVersions = product.pdfVersions || [];
      const versionNumStr = `v1.${existingVersions.length + 1}`;
      const cleanName = product.name.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `SDY_Bespoke_Brochure_${cleanName}_${versionNumStr}.pdf`;
      
      const uploadRes = await executeSheetsAction('uploadFileToDrive', {
        base64Data: pdfBase64,
        filename,
        referenceId: product.id
      });
      
      if (uploadRes && uploadRes.status === 'success' && uploadRes.url) {
        const fileUrl = uploadRes.url;
        const newVersion = {
          version: versionNumStr,
          date: new Date().toLocaleString(),
          url: fileUrl
        };
        const updatedVersions = [...existingVersions, newVersion];
        
        const sheetRecord = {
          "ProductID": product.id,
          "PDF": fileUrl,
          "PDFVersions": JSON.stringify(updatedVersions)
        };
        
        const saveRes = await executeSheetsAction('saveRecord', {
          sheetName: 'Products',
          idKey: 'ProductID',
          record: sheetRecord
        });
        
        if (saveRes && saveRes.status === 'success') {
          showToast(`PDF regenerated successfully to ${versionNumStr}!`);
          await refreshAllData();
        } else {
          showErrorToast(`Failed to update sheet record: ${saveRes.message}`);
        }
      } else {
        showErrorToast(`Drive upload failed: ${uploadRes.message || 'Unknown response'}`);
      }
    } catch (err) {
      console.error(err);
      showErrorToast("Error regenerating PDF brochure.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Products CRUD Save & Update
  const handleSaveProduct = async (e: FormEvent) => {
    e.preventDefault();
    const productName = (productForm.name || '').trim();
    if (!productName) {
      showErrorToast('Product Item Name is required.');
      return;
    }

    const isEdit = !!editingProduct;

    setIsSyncing(true);
    try {
      const customCode = (productForm.id || '').trim();
      const targetId = customCode || (isEdit ? editingProduct!.id : 'pr_' + Math.random().toString(36).substring(2, 8));

      const isKhmerInput = /[\u1780-\u17FF]/.test(productName);
      
      const productNameEN = (productForm.ProductName_EN || '').trim() || (isKhmerInput ? '' : productName);
      const productNameKH = (productForm.ProductName_KH || '').trim() || (isKhmerInput ? productName : '');
      const productNameKO = (productForm.ProductName_KO || '').trim();

      const descMain = (productForm.description || '').trim();
      const isKhmerDesc = /[\u1780-\u17FF]/.test(descMain);
      const descEN = (productForm.Description_EN || '').trim() || (isKhmerDesc ? '' : descMain);
      const descKH = (productForm.Description_KH || '').trim() || (isKhmerDesc ? descMain : '');
      const descKO = (productForm.Description_KO || '').trim();

      const payload: Product = {
        id: targetId,
        name: productNameEN || productName,
        category: productForm.category || 'Doors & Windows',
        collection: (productForm.collection || '').trim(),
        language: productForm.language || 'en',
        revision: (productForm.revision || 'REV-2026.01').trim(),
        image: productForm.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600',
        gallery: productForm.gallery ? productForm.gallery.split(',').map(s => s.trim()) : [],
        description: descEN || descMain || descKH,
        specification: (productForm.specification || '').trim(),
        material: (productForm.material || '').trim(),
        size: (productForm.size || '').trim(),
        pdfUrl: productForm.pdfUrl || '#',
        pdf_spec_url: (productForm.pdf_spec_url || '').trim(),
        price: (productForm.price || '').trim(),
        originalPrice: (productForm.originalPrice || '').trim(),
        promotionTag: (productForm.promotionTag || '').trim(),
        isPromotional: !!productForm.isPromotional,
        
        ProductName_EN: productNameEN || productName,
        ProductName_KH: productNameKH,
        ProductName_KO: productNameKO,
        Description_EN: descEN || descMain,
        Description_KH: descKH,
        Description_KO: descKO,
        shortDescriptionEN: (productForm.shortDescriptionEN || '').trim(),
        shortDescriptionKH: (productForm.shortDescriptionKH || '').trim(),
        shortDescriptionKO: (productForm.shortDescriptionKO || '').trim(),
        longDescriptionEN: (productForm.longDescriptionEN || '').trim(),
        longDescriptionKH: (productForm.longDescriptionKH || '').trim(),
        longDescriptionKO: (productForm.longDescriptionKO || '').trim(),
        
        construction: (productForm.construction || '').trim(),
        finish: (productForm.finish || '').trim(),
        customSize: (productForm.customSize || '').trim(),
        weight: (productForm.weight || '').trim(),
        fireRating: (productForm.fireRating || '').trim(),
        acousticRating: (productForm.acousticRating || '').trim(),
        warranty: (productForm.warranty || '').trim(),
        productFeatures: (productForm.productFeatures || '').trim(),
        technicalNotes: (productForm.technicalNotes || '').trim(),
        specificationTable: (productForm.specificationTable || '').trim(),
        
        galleryImage1: (productForm.galleryImage1 || '').trim(),
        galleryImage2: (productForm.galleryImage2 || '').trim(),
        galleryImage3: (productForm.galleryImage3 || '').trim(),
        galleryImage4: (productForm.galleryImage4 || '').trim(),
        technicalDrawing: (productForm.technicalDrawing || '').trim(),
        crossSectionDrawing: (productForm.crossSectionDrawing || '').trim(),
        dimensionDrawing: (productForm.dimensionDrawing || '').trim(),
        installationDrawing: (productForm.installationDrawing || '').trim(),
        
        certificates: {
          iso: productForm.cert_iso,
          ul: productForm.cert_ul,
          astm: productForm.cert_astm,
          fireRated: productForm.cert_fireRated,
          acousticTested: productForm.cert_acousticTested,
          ce: productForm.cert_ce,
          fsc: productForm.cert_fsc
        },
        applications: {
          residential: productForm.app_residential,
          apartment: productForm.app_apartment,
          hotel: productForm.app_hotel,
          office: productForm.app_office,
          hospital: productForm.app_hospital,
          school: productForm.app_school,
          luxuryVilla: productForm.app_luxuryVilla,
          commercial: productForm.app_commercial,
          retail: productForm.app_retail,
          airport: productForm.app_airport,
          shoppingMall: productForm.app_shoppingMall
        },
        pdfVersions: editingProduct?.pdfVersions || []
      };

      showToast("🔄 Saving to Google Sheets...");

      const currentProducts = [...productsList];
      let nextProductsList: Product[];
      if (isEdit) {
        nextProductsList = currentProducts.map(p => p.id === targetId ? payload : p);
      } else {
        nextProductsList = [payload, ...currentProducts];
      }
      setProductsList(nextProductsList);
      localStorage.setItem('sdy_local_products', JSON.stringify(nextProductsList));
      window.dispatchEvent(new Event('sdy_products_updated'));

      // Direct Google Sheet sync if active
      if (googleToken && activeSpreadsheetId) {
        try {
          await syncProductsToSheet(googleToken, activeSpreadsheetId, nextProductsList);
        } catch (sheetErr) {
          console.error("Direct Google Sheet sync warning:", sheetErr);
        }
      }

      // Webhook Sheets sync
      const sheetRecord = {
        "ProductID": targetId,
        "Code": productForm.id || targetId,
        "Category": payload.category,
        "Collection": payload.collection,
        "Language": payload.language,
        "Revision": payload.revision,
        "Name EN": payload.ProductName_EN || payload.name,
        "Name KH": payload.ProductName_KH,
        "Name KO": payload.ProductName_KO,
        "Description EN": payload.Description_EN || payload.description,
        "Description KH": payload.Description_KH,
        "Description KO": payload.Description_KO,
        "ShortDescriptionEN": payload.shortDescriptionEN,
        "ShortDescriptionKH": payload.shortDescriptionKH,
        "ShortDescriptionKO": payload.shortDescriptionKO,
        "LongDescriptionEN": payload.longDescriptionEN,
        "LongDescriptionKH": payload.longDescriptionKH,
        "LongDescriptionKO": payload.longDescriptionKO,
        "Material": payload.material,
        "Construction": payload.construction,
        "Finish": payload.finish,
        "StandardSize": payload.size,
        "CustomSize": payload.customSize,
        "Weight": payload.weight,
        "FireRating": payload.fireRating,
        "AcousticRating": payload.acousticRating,
        "Warranty": payload.warranty,
        "ProductFeatures": payload.productFeatures,
        "TechnicalNotes": payload.technicalNotes,
        "SpecificationTable": payload.specificationTable,
        "ImageID": payload.image,
        "Gallery": payload.gallery.join(', '),
        "GalleryImage1": payload.galleryImage1,
        "GalleryImage2": payload.galleryImage2,
        "GalleryImage3": payload.galleryImage3,
        "GalleryImage4": payload.galleryImage4,
        "TechnicalDrawing": payload.technicalDrawing,
        "CrossSectionDrawing": payload.crossSectionDrawing,
        "DimensionDrawing": payload.dimensionDrawing,
        "InstallationDrawing": payload.installationDrawing,
        "CertISO": payload.certificates?.iso ? 'Yes' : 'No',
        "CertUL": payload.certificates?.ul ? 'Yes' : 'No',
        "CertASTM": payload.certificates?.astm ? 'Yes' : 'No',
        "CertFireRated": payload.certificates?.fireRated ? 'Yes' : 'No',
        "CertAcousticTested": payload.certificates?.acousticTested ? 'Yes' : 'No',
        "CertCE": payload.certificates?.ce ? 'Yes' : 'No',
        "CertFSC": payload.certificates?.fsc ? 'Yes' : 'No',
        "AppResidential": payload.applications?.residential ? 'Yes' : 'No',
        "AppApartment": payload.applications?.apartment ? 'Yes' : 'No',
        "AppHotel": payload.applications?.hotel ? 'Yes' : 'No',
        "AppOffice": payload.applications?.office ? 'Yes' : 'No',
        "AppHospital": payload.applications?.hospital ? 'Yes' : 'No',
        "AppSchool": payload.applications?.school ? 'Yes' : 'No',
        "AppLuxuryVilla": payload.applications?.luxuryVilla ? 'Yes' : 'No',
        "AppCommercial": payload.applications?.commercial ? 'Yes' : 'No',
        "AppRetail": payload.applications?.retail ? 'Yes' : 'No',
        "AppAirport": payload.applications?.airport ? 'Yes' : 'No',
        "AppShoppingMall": payload.applications?.shoppingMall ? 'Yes' : 'No',
        "PDF": payload.pdfUrl || '#',
        "PDFSpecURL": payload.pdf_spec_url || '',
        "pdf_spec_url": payload.pdf_spec_url || '',
        "PDFVersions": JSON.stringify(payload.pdfVersions || []),
        "Slug": (payload.ProductName_EN || payload.name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        "Featured": 'Yes',
        "SortOrder": 1,
        "Status": 'Active'
      };

      if (sheetsConfig.googleSheetsWebhookUrl && sheetsConfig.isSyncEnabled) {
        const res = await executeSheetsAction('saveRecord', { 
          sheetName: 'Products', 
          idKey: 'ProductID', 
          record: sheetRecord 
        });
        if (res.status === 'error') {
          showErrorToast(`Spreadsheet action error: ${res.message}`);
        } else {
          // Auto-generate luxury PDF brochure if sheets synced
          try {
            const doc = await generateProductPdf(payload, 'en', false);
            const pdfBase64 = doc.output('datauristring');
            
            const updatedVersions = [...(payload.pdfVersions || [])];
            const nextVersionNum = `v1.${updatedVersions.length + 1}`;
            const cleanName = payload.name.replace(/[^a-zA-Z0-9]/g, '_');
            const filename = `SDY_Bespoke_Brochure_${cleanName}_${nextVersionNum}.pdf`;

            const uploadRes = await executeSheetsAction('uploadFileToDrive', {
              base64Data: pdfBase64,
              filename,
              referenceId: targetId
            });

            if (uploadRes && uploadRes.status === 'success' && uploadRes.url) {
              const fileUrl = uploadRes.url;
              const newVer = {
                version: nextVersionNum,
                date: new Date().toLocaleString(),
                url: fileUrl
              };
              const finalVersions = [...updatedVersions, newVer];

              const finalUpdateRecord = {
                "ProductID": targetId,
                "PDF": fileUrl,
                "PDFVersions": JSON.stringify(finalVersions)
              };

              await executeSheetsAction('saveRecord', {
                sheetName: 'Products',
                idKey: 'ProductID',
                record: finalUpdateRecord
              });
            }
          } catch (pdfErr) {
            console.warn("Auto-regenerating PDF warning:", pdfErr);
          }

          await refreshAllData();
        }
      }

      showToast(isEdit ? 'Product updated successfully.' : 'Product created successfully.');

      setIsAddingProduct(false);
      setEditingProduct(null);
      setProductForm({
        id: '',
        name: '',
        category: 'Doors & Windows',
        collection: '',
        language: 'en',
        revision: 'REV-2026.01',
        image: '',
        gallery: '',
      description: '',
      specification: '',
      material: '',
      size: '',
      pdfUrl: '#',
      pdf_spec_url: '',
      
      ProductName_EN: '',
      ProductName_KH: '',
      ProductName_KO: '',
      Description_EN: '',
      Description_KH: '',
      Description_KO: '',
      shortDescriptionEN: '',
      shortDescriptionKH: '',
      shortDescriptionKO: '',
      longDescriptionEN: '',
      longDescriptionKH: '',
      longDescriptionKO: '',
      
      construction: '',
      finish: '',
      customSize: '',
      weight: '',
      fireRating: '',
      acousticRating: '',
      warranty: '',
      productFeatures: '',
      technicalNotes: '',
      specificationTable: '',
      
      galleryImage1: '',
      galleryImage2: '',
      galleryImage3: '',
      galleryImage4: '',
      technicalDrawing: '',
      crossSectionDrawing: '',
      dimensionDrawing: '',
      installationDrawing: '',
      
      cert_iso: false,
      cert_ul: false,
      cert_astm: false,
      cert_fireRated: false,
      cert_acousticTested: false,
      cert_ce: false,
      cert_fsc: false,
      
      app_residential: false,
      app_apartment: false,
      app_hotel: false,
      app_office: false,
      app_hospital: false,
      app_school: false,
      app_luxuryVilla: false,
      app_commercial: false,
      app_retail: false,
      app_airport: false,
      app_shoppingMall: false
    });

    showToast("✅ Saved to Cloud Database");
    } catch (err: any) {
      console.error('Error saving product:', err);
      showErrorToast(err.message || 'Failed to save product.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This action is permanent.')) return;
    setIsSyncing(true);
    showToast("🔄 Saving to Google Sheets...");

    const updatedProducts = productsList.filter(p => p.id !== id);
    setProductsList(updatedProducts);
    localStorage.setItem('sdy_local_products', JSON.stringify(updatedProducts));
    window.dispatchEvent(new Event('sdy_products_updated'));

    if (googleToken && activeSpreadsheetId) {
      try {
        await syncProductsToSheet(googleToken, activeSpreadsheetId, updatedProducts);
      } catch (sheetErr) {
        console.error("Direct Google Sheet sync error on delete:", sheetErr);
      }
    }

    if (sheetsConfig.googleSheetsWebhookUrl && sheetsConfig.isSyncEnabled) {
      const res = await executeSheetsAction('removeRecord', { 
        sheetName: 'Products', 
        idKey: 'ProductID', 
        idValue: id 
      });
      if (res.status === 'error') {
        showErrorToast(`Spreadsheet transaction failed: ${res.message}`);
      } else {
        await refreshAllData();
      }
    }

    showToast('Product removed from database.');
    setIsSyncing(false);
  };

  // Projects CRUD Save & Update
  const handleSaveProject = async (e: FormEvent) => {
    e.preventDefault();
    const titleEN = (projectForm.Title_EN || projectForm.title || '').trim();
    const titleKH = (projectForm.Title_KH || '').trim();
    const titleKO = (projectForm.Title_KO || '').trim();
    const projectTitle = titleEN || titleKH || titleKO;

    if (!projectTitle) {
      showErrorToast('Project Title is required in at least one language.');
      return;
    }

    const descEN = (projectForm.Description_EN || projectForm.description || '').trim();
    const descKH = (projectForm.Description_KH || '').trim();
    const descKO = (projectForm.Description_KO || '').trim();
    const projectDesc = descEN || descKH || descKO;

    const isEdit = !!editingProject;

    // Check duplicate title
    const hasDuplicate = projectsList.some(p => 
      ((p.title || p.Title_EN || p.ProjectName_EN || '').toLowerCase().trim() === projectTitle.toLowerCase()) && 
      (!isEdit || p.id !== editingProject?.id)
    );
    if (hasDuplicate) {
      showErrorToast('Duplicate Check: A project with this exact title already exists.');
      return;
    }

    setIsSyncing(true);
    try {
      const targetId = isEdit ? editingProject!.id : 'proj_' + Math.random().toString(36).substring(2, 8);

      const payload: Project = {
        id: targetId,
        title: projectTitle,
        category: projectForm.category || 'Commercial Fit-Out',
        coverImage: projectForm.coverImage || 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=800',
        gallery: projectForm.gallery ? projectForm.gallery.split(',').map(s => s.trim()) : [],
        location: (projectForm.location || '').trim(),
        area: (projectForm.area || '').trim(),
        completionYear: (projectForm.completionYear || '').trim(),
        description: projectDesc,
        constructionType: (projectForm.constructionType || '').trim(),
        client: (projectForm.client || '').trim(),

        Title_KH: titleKH,
        Title_EN: titleEN,
        Title_KO: titleKO,
        ProjectName_KH: titleKH,
        ProjectName_EN: titleEN,
        ProjectName_KO: titleKO,
        Description_KH: descKH,
        Description_EN: descEN,
        Description_KO: descKO,
      };

      showToast("🔄 Saving to Google Sheets...");

      const currentProjects = [...projectsList];
      let nextProjectsList: Project[];
      if (isEdit) {
        nextProjectsList = currentProjects.map(p => p.id === targetId ? payload : p);
      } else {
        nextProjectsList = [payload, ...currentProjects];
      }
      setProjectsList(nextProjectsList);
      localStorage.setItem('sdy_local_projects', JSON.stringify(nextProjectsList));
      window.dispatchEvent(new Event('sdy_projects_updated'));

      // 2. Direct Google Sheet sync if connected
      if (googleToken && activeSpreadsheetId) {
        try {
          await syncProjectsToSheet(googleToken, activeSpreadsheetId, nextProjectsList);
        } catch (sheetErr) {
          console.error("Direct Google Sheet sync error on project save:", sheetErr);
        }
      }

      // 3. Webhook Sheets sync if configured
      const sheetRecord = {
        "ProjectID": targetId,
        "Name EN": titleEN || projectTitle,
        "Name KH": titleKH || titleEN || projectTitle,
        "Name KO": titleKO || titleEN || projectTitle,
        "Category": payload.category,
        "Client": payload.client || 'SDY Corporate Developer',
        "Location": payload.location,
        "Area": payload.area,
        "CompletionYear": payload.completionYear,
        "Description EN": descEN || projectDesc,
        "Description KH": descKH || descEN || projectDesc,
        "Description KO": descKO || descEN || projectDesc,
        "CoverImage": payload.coverImage,
        "Gallery": payload.gallery ? payload.gallery.join(', ') : '',
        "Featured": 'Yes',
        "SortOrder": 1,
        "Status": 'Active'
      };

      if (sheetsConfig.googleSheetsWebhookUrl && sheetsConfig.isSyncEnabled) {
        const res = await executeSheetsAction('saveRecord', { 
          sheetName: 'Projects', 
          idKey: 'ProjectID', 
          record: sheetRecord 
        });
        if (res.status === 'error') {
          showErrorToast(`Webhook warning: ${res.message}`);
        } else {
          await refreshAllData();
        }
      }

      setIsAddingProject(false);
      setEditingProject(null);
      setProjectForm({
        title: '',
        category: 'Commercial Fit-Out',
        coverImage: '',
        gallery: '',
        location: '',
        area: '',
        completionYear: '',
        description: '',
        constructionType: '',
        client: '',
        Title_KH: '',
        Title_EN: '',
        Title_KO: '',
        Description_KH: '',
        Description_EN: '',
        Description_KO: ''
      });

      showToast("✅ Saved to Cloud Database");
    } catch (err: any) {
      console.error('Error saving project:', err);
      showErrorToast(err.message || 'Failed to save project.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    setIsSyncing(true);
    showToast("🔄 Saving to Google Sheets...");

    try {
      const updatedProjects = projectsList.filter(p => p.id !== id);
      setProjectsList(updatedProjects);
      localStorage.setItem('sdy_local_projects', JSON.stringify(updatedProjects));
      window.dispatchEvent(new Event('sdy_projects_updated'));

      if (googleToken && activeSpreadsheetId) {
        try {
          await syncProjectsToSheet(googleToken, activeSpreadsheetId, updatedProjects);
        } catch (sheetErr) {
          console.error("Direct Google Sheet sync error on project delete:", sheetErr);
        }
      }

      if (sheetsConfig.googleSheetsWebhookUrl && sheetsConfig.isSyncEnabled) {
        const res = await executeSheetsAction('removeRecord', { 
          sheetName: 'Projects', 
          idKey: 'ProjectID', 
          idValue: id 
        });
        if (res.status === 'error') {
          showErrorToast(`Webhook warning: ${res.message}`);
        } else {
          await refreshAllData();
        }
      }

      showToast('Project deleted permanently.');
    } catch (err: any) {
      console.error('Error deleting project:', err);
      showErrorToast(err.message || 'Failed to delete project.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Blogs CRUD Save & Update
  const handleSaveBlog = async (e: FormEvent) => {
    e.preventDefault();
    const titleEN = (blogForm.Title_EN || blogForm.title || '').trim();
    const titleKH = (blogForm.Title_KH || '').trim();
    const titleKO = (blogForm.Title_KO || '').trim();
    const blogTitle = titleEN || titleKH || titleKO;

    const excerptEN = (blogForm.Excerpt_EN || blogForm.excerpt || '').trim();
    const excerptKH = (blogForm.Excerpt_KH || '').trim();
    const excerptKO = (blogForm.Excerpt_KO || '').trim();

    const contentEN = (blogForm.Content_EN || blogForm.content || '').trim();
    const contentKH = (blogForm.Content_KH || '').trim();
    const contentKO = (blogForm.Content_KO || '').trim();
    const blogContent = contentEN || contentKH || contentKO;

    const authorEN = (blogForm.Author_EN || blogForm.author || '').trim();
    const authorKH = (blogForm.Author_KH || '').trim();
    const authorKO = (blogForm.Author_KO || '').trim();

    if (!blogTitle || !blogContent) {
      showErrorToast('Blog Title and Content are required in at least one language.');
      return;
    }

    const isEdit = !!editingBlog;

    // Check duplicate
    const hasDuplicate = blogsList.some(b => 
      ((b.title || b.Title_EN || '').toLowerCase().trim() === blogTitle.toLowerCase()) && 
      (!isEdit || b.id !== editingBlog?.id)
    );
    if (hasDuplicate) {
      showErrorToast('Duplicate Check: A blog post with this title already exists.');
      return;
    }

    setIsSyncing(true);
    try {
      const targetId = isEdit ? editingBlog!.id : 'blog_' + Math.random().toString(36).substring(2, 8);

      const payload: BlogPost = {
        id: targetId,
        title: blogTitle,
        excerpt: excerptEN || excerptKH || excerptKO || (blogContent.substring(0, 150) + '...'),
        content: blogContent,
        category: blogForm.category || 'General Insights',
        image: blogForm.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600',
        author: authorEN || authorKH || 'Corporate Administrator',
        date: isEdit ? editingBlog!.date : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),

        Title_KH: titleKH,
        Title_EN: titleEN,
        Title_KO: titleKO,
        Excerpt_KH: excerptKH,
        Excerpt_EN: excerptEN,
        Excerpt_KO: excerptKO,
        Content_KH: contentKH,
        Content_EN: contentEN,
        Content_KO: contentKO,
        Author_KH: authorKH,
        Author_EN: authorEN,
        Author_KO: authorKO
      };

      showToast("🔄 Saving to Google Sheets...");

      const currentBlogs = [...blogsList];
      let nextBlogsList: BlogPost[];
      if (isEdit) {
        nextBlogsList = currentBlogs.map(b => b.id === targetId ? payload : b);
      } else {
        nextBlogsList = [payload, ...currentBlogs];
      }
      setBlogsList(nextBlogsList);
      localStorage.setItem('sdy_local_blogs', JSON.stringify(nextBlogsList));
      window.dispatchEvent(new Event('sdy_blogs_updated'));

      if (googleToken && activeSpreadsheetId) {
        try {
          await syncBlogsToSheet(googleToken, activeSpreadsheetId, nextBlogsList);
        } catch (sheetErr) {
          console.error("Direct Google Sheet sync error on blog save:", sheetErr);
        }
      }

      const sheetRecord = {
        "BlogID": targetId,
        "Title EN": titleEN || blogTitle,
        "Title KH": titleKH || titleEN || blogTitle,
        "Title KO": titleKO || titleEN || blogTitle,
        "Slug": blogTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        "Category": payload.category,
        "Author": payload.author,
        "Keywords": 'Construction, Architecture, interior',
        "Content EN": contentEN || blogContent,
        "Content KH": contentKH || contentEN || blogContent,
        "Content KO": contentKO || contentEN || blogContent,
        "ImageURL": payload.image,
        "Featured": 'Yes',
        "SortOrder": 1,
        "Status": 'Published',
        "PublishedDate": new Date().toISOString()
      };

      if (sheetsConfig.googleSheetsWebhookUrl && sheetsConfig.isSyncEnabled) {
        const res = await executeSheetsAction('saveRecord', { 
          sheetName: 'Blog', 
          idKey: 'BlogID', 
          record: sheetRecord 
        });
        if (res.status === 'error') {
          showErrorToast(`Webhook warning: ${res.message}`);
        } else {
          await refreshAllData();
        }
      }

      setIsAddingBlog(false);
      setEditingBlog(null);
      setBlogForm({
        title: '',
        excerpt: '',
        content: '',
        category: 'General Insights',
        image: '',
        author: 'Corporate Administrator',
        Title_KH: '',
        Title_EN: '',
        Title_KO: '',
        Excerpt_KH: '',
        Excerpt_EN: '',
        Excerpt_KO: '',
        Content_KH: '',
        Content_EN: '',
        Content_KO: '',
        Author_KH: '',
        Author_EN: '',
        Author_KO: ''
      });

      showToast("✅ Saved to Cloud Database");
    } catch (err: any) {
      console.error('Error saving blog:', err);
      showErrorToast(err.message || 'Failed to save blog post.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    setIsSyncing(true);
    showToast("🔄 Saving to Google Sheets...");

    try {
      const updatedBlogs = blogsList.filter(b => b.id !== id);
      setBlogsList(updatedBlogs);
      localStorage.setItem('sdy_local_blogs', JSON.stringify(updatedBlogs));
      window.dispatchEvent(new Event('sdy_blogs_updated'));

      if (googleToken && activeSpreadsheetId) {
        try {
          await syncBlogsToSheet(googleToken, activeSpreadsheetId, updatedBlogs);
        } catch (sheetErr) {
          console.error("Direct Google Sheet sync error on blog delete:", sheetErr);
        }
      }

      if (sheetsConfig.googleSheetsWebhookUrl && sheetsConfig.isSyncEnabled) {
        const res = await executeSheetsAction('removeRecord', { 
          sheetName: 'Blog', 
          idKey: 'BlogID', 
          idValue: id 
        });
        if (res.status === 'error') {
          showErrorToast(`Webhook warning: ${res.message}`);
        } else {
          await refreshAllData();
        }
      }

      showToast('Article deleted permanently.');
    } catch (err: any) {
      console.error('Error deleting blog:', err);
      showErrorToast(err.message || 'Failed to delete blog.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Categories CRUD handlers
  const handleSaveCategory = async (e: FormEvent) => {
    e.preventDefault();
    const catName = (categoryForm.name || '').trim();
    if (!catName) {
      showErrorToast('Category Name is required.');
      return;
    }

    setIsSyncing(true);
    try {
      const isEdit = !!editingCategory;
      const targetId = isEdit ? editingCategory.id : 'cat_' + Math.random().toString(36).substring(2, 8);
      const payload = {
        id: targetId,
        name: catName,
        type: categoryForm.type || 'product'
      };

      const currentCats = [...categoriesList];
      let nextCats: any[];
      if (isEdit) {
        nextCats = currentCats.map(c => c.id === targetId ? payload : c);
      } else {
        nextCats = [payload, ...currentCats];
      }
      setCategoriesList(nextCats);
      localStorage.setItem('sdy_local_categories', JSON.stringify(nextCats));
      window.dispatchEvent(new Event('sdy_categories_updated'));

      if (googleToken && activeSpreadsheetId) {
        try {
          await syncCategoriesToSheet(googleToken, activeSpreadsheetId, nextCats);
        } catch (sheetErr) {
          console.error("Direct Google Sheet sync error on category save:", sheetErr);
        }
      }

      const sheetRecord = {
        "CategoryID": targetId,
        "Name EN": catName,
        "Name KH": catName,
        "Name KO": catName,
        "Type": categoryForm.type || 'product',
        "Status": 'Active'
      };

      if (sheetsConfig.googleSheetsWebhookUrl && sheetsConfig.isSyncEnabled) {
        const res = await executeSheetsAction('saveRecord', { 
          sheetName: 'Categories', 
          idKey: 'CategoryID', 
          record: sheetRecord 
        });
        if (res && res.status === 'success') {
          await refreshAllData();
        }
      }

      showToast(isEdit ? 'Category updated successfully!' : 'Category created successfully!');
      setIsAddingCategory(false);
      setEditingCategory(null);
      setCategoryForm({ id: '', name: '', type: 'product' });
    } catch (err) {
      console.error('Error saving category:', err);
      showErrorToast('Failed to save category.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category? Related products/projects will remain intact but their category category-link will be deleted.')) {
      return;
    }

    setIsSyncing(true);
    try {
      const updatedCats = categoriesList.filter(c => c.id !== id);
      setCategoriesList(updatedCats);
      localStorage.setItem('sdy_local_categories', JSON.stringify(updatedCats));
      window.dispatchEvent(new Event('sdy_categories_updated'));

      if (googleToken && activeSpreadsheetId) {
        try {
          await syncCategoriesToSheet(googleToken, activeSpreadsheetId, updatedCats);
        } catch (sheetErr) {
          console.error("Direct Google Sheet sync error on category delete:", sheetErr);
        }
      }

      if (sheetsConfig.googleSheetsWebhookUrl && sheetsConfig.isSyncEnabled) {
        const res = await executeSheetsAction('removeRecord', { 
          sheetName: 'Categories', 
          idKey: 'CategoryID', 
          idValue: id 
        });
        if (res && res.status === 'success') {
          await refreshAllData();
        }
      }

      showToast('Category deleted successfully!');
    } catch (err) {
      console.error('Error deleting category:', err);
      showErrorToast('Failed to delete category.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Translations CRUD handlers
  const handleSaveTranslation = async (e: FormEvent) => {
    e.preventDefault();
    const transKey = (translationForm.key || '').trim();
    if (!transKey) {
      showErrorToast('Translation Key is required.');
      return;
    }

    setIsSyncing(true);
    try {
      const payload = {
        "Key": transKey,
        "English": (translationForm.english || '').trim(),
        "Khmer": (translationForm.khmer || '').trim(),
        "Korean": (translationForm.korean || '').trim(),
        "Category": "General",
        "Status": "Active"
      };

      const res = await executeSheetsAction('saveRecord', { 
        sheetName: 'Translations', 
        idKey: 'Key', 
        record: payload 
      });
      if (res && res.status === 'success') {
        showToast(res.message || 'Translation saved successfully!');
        setIsAddingTranslation(false);
        setEditingTranslation(null);
        setTranslationForm({ key: '', khmer: '', english: '', korean: '' });
        await refreshAllData();
      } else {
        showErrorToast(res && res.message ? res.message : 'Failed to save translation.');
      }
    } catch (err) {
      console.error('Error saving translation:', err);
      showErrorToast('Failed to save translation.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteTranslation = async (key: string) => {
    if (!window.confirm(`Are you sure you want to delete the translation key "${key}"?`)) {
      return;
    }

    setIsSyncing(true);
    try {
      const res = await executeSheetsAction('removeRecord', { 
        sheetName: 'Translations', 
        idKey: 'Key', 
        idValue: key 
      });
      if (res && res.status === 'success') {
        showToast(res.message || 'Translation key deleted successfully!');
        await refreshAllData();
      } else {
        showErrorToast(res && res.message ? res.message : 'Failed to delete translation key.');
      }
    } catch (err) {
      console.error('Error deleting translation key:', err);
      showErrorToast('Failed to delete translation key.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Company profile updater
  const handleSaveCompanyInfo = async (e: FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    showToast("🔄 Saving to Google Sheets...");

    if (companyInfo.LogoUrl) {
      window.dispatchEvent(new Event('sdy_custom_logo_updated'));
    }

    window.dispatchEvent(new Event('sdy_company_info_updated'));

    const res = await executeSheetsAction('updateCompanyInfo', { companyInfo });
    if (res.status === 'error') {
      showErrorToast(res.message || 'Error syncing company profile.');
      setIsSyncing(false);
      return;
    }

    try {
      await refreshAllData();
      window.dispatchEvent(new Event('sdy_global_db_updated'));
    } catch (e) {
      console.warn('Error refreshing data after saving company info:', e);
    }
    
    showToast("✅ Saved to Cloud Database");
    setIsSyncing(false);
  };

  // Inquiries status updater
  const handleUpdateMessageStatus = async (id: string, newStatus: 'Pending' | 'Contacted' | 'Completed') => {
    setIsSyncing(true);
    const res = await executeSheetsAction('updateMessageStatus', { targetId: id, newStatus });
    if (res.status === 'error') {
      showErrorToast(res.message);
      setIsSyncing(false);
      return;
    }

    const updated = messages.map(msg => msg.id === id ? { ...msg, status: newStatus } : msg);
    localStorage.setItem('sdy_contact_messages', JSON.stringify(updated));
    setMessages(updated);
    showToast('Submission pipeline status advanced.');
    setIsSyncing(false);
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer record?')) return;
    setIsSyncing(true);

    const res = await executeSheetsAction('deleteMessage', { targetId: id });
    if (res.status === 'error') {
      showErrorToast(res.message);
      setIsSyncing(false);
      return;
    }

    const updated = messages.filter(msg => msg.id !== id);
    localStorage.setItem('sdy_contact_messages', JSON.stringify(updated));
    setMessages(updated);
    showToast('Customer inquiry deleted permanently.');
    setIsSyncing(false);
  };

  const handleSaveWebhookConfig = (e: FormEvent) => {
    e.preventDefault();
    localStorage.setItem('sdy_admin_config', JSON.stringify(sheetsConfig));
    window.dispatchEvent(new Event('sdy_config_updated'));
    showToast('Google Sheets Webhook configuration applied! Database synchronization active.');
    syncDataFromSheets();
  };

  // Bulk Database Exporter/Sync
  const handleSyncAllToSheets = async () => {
    if (!sheetsConfig.googleSheetsWebhookUrl || !sheetsConfig.isSyncEnabled) {
      showErrorToast("Google Sheets Sync is currently disabled or Webhook URL is empty.");
      return;
    }
    if (!confirm("Are you sure you want to perform a full system sync? This will write ALL local Products, Projects, Categories, Blogs, and Translations records to the Google Sheets backend.")) {
      return;
    }

    setIsSyncing(true);
    showToast("Starting comprehensive database sync...");

    try {
      // 1. Sync Categories
      showToast("Syncing Categories (1/5)...");
      for (const cat of categoriesList) {
        await executeSheetsAction('saveRecord', {
          sheetName: 'Categories',
          idKey: 'CategoryID',
          record: {
            "CategoryID": cat.id || cat.CategoryID || `cat_${Math.random().toString(36).substring(2, 8)}`,
            "Name EN": cat.name || cat["Name EN"] || '',
            "Name KH": cat.name || cat["Name KH"] || '',
            "Name KO": cat.name || cat["Name KO"] || '',
            "Type": cat.type || 'product',
            "Status": 'Active'
          }
        });
      }

      // 2. Sync Products
      showToast("Syncing Products & compiling PDF files (2/5)...");
      for (const prod of productsList) {
        const sheetRecord = {
          "ProductID": prod.id,
          "Code": prod.id,
          "Category": prod.category,
          "Collection": prod.collection || '',
          "Language": prod.language || 'en',
          "Revision": prod.revision || 'REV-2026',
          "Name EN": prod.ProductName_EN || prod.name || '',
          "Name KH": prod.ProductName_KH || '',
          "Name KO": prod.ProductName_KO || '',
          "Description EN": prod.Description_EN || prod.description || '',
          "Description KH": prod.Description_KH || '',
          "Description KO": prod.Description_KO || '',
          "ShortDescriptionEN": prod.shortDescriptionEN || '',
          "ShortDescriptionKH": prod.shortDescriptionKH || '',
          "ShortDescriptionKO": prod.shortDescriptionKO || '',
          "LongDescriptionEN": prod.longDescriptionEN || '',
          "LongDescriptionKH": prod.longDescriptionKH || '',
          "LongDescriptionKO": prod.longDescriptionKO || '',
          "Material": prod.material || '',
          "Construction": prod.construction || '',
          "Finish": prod.finish || '',
          "StandardSize": prod.size || '',
          "CustomSize": prod.customSize || '',
          "Weight": prod.weight || '',
          "FireRating": prod.fireRating || '',
          "AcousticRating": prod.acousticRating || '',
          "Warranty": prod.warranty || '',
          "ProductFeatures": prod.productFeatures || '',
          "TechnicalNotes": prod.technicalNotes || '',
          "SpecificationTable": prod.specificationTable || '',
          "ImageID": prod.image || '',
          "Gallery": prod.gallery ? prod.gallery.join(', ') : '',
          "GalleryImage1": prod.galleryImage1 || '',
          "GalleryImage2": prod.galleryImage2 || '',
          "GalleryImage3": prod.galleryImage3 || '',
          "GalleryImage4": prod.galleryImage4 || '',
          "TechnicalDrawing": prod.technicalDrawing || '',
          "CrossSectionDrawing": prod.crossSectionDrawing || '',
          "DimensionDrawing": prod.dimensionDrawing || '',
          "InstallationDrawing": prod.installationDrawing || '',
          "CertISO": prod.certificates?.iso ? 'Yes' : 'No',
          "CertUL": prod.certificates?.ul ? 'Yes' : 'No',
          "CertASTM": prod.certificates?.astm ? 'Yes' : 'No',
          "CertFireRated": prod.certificates?.fireRated ? 'Yes' : 'No',
          "CertAcousticTested": prod.certificates?.acousticTested ? 'Yes' : 'No',
          "CertCE": prod.certificates?.ce ? 'Yes' : 'No',
          "CertFSC": prod.certificates?.fsc ? 'Yes' : 'No',
          "AppResidential": prod.applications?.residential ? 'Yes' : 'No',
          "AppApartment": prod.applications?.apartment ? 'Yes' : 'No',
          "AppHotel": prod.applications?.hotel ? 'Yes' : 'No',
          "AppOffice": prod.applications?.office ? 'Yes' : 'No',
          "AppHospital": prod.applications?.hospital ? 'Yes' : 'No',
          "AppSchool": prod.applications?.school ? 'Yes' : 'No',
          "AppLuxuryVilla": prod.applications?.luxuryVilla ? 'Yes' : 'No',
          "AppCommercial": prod.applications?.commercial ? 'Yes' : 'No',
          "AppRetail": prod.applications?.retail ? 'Yes' : 'No',
          "AppAirport": prod.applications?.airport ? 'Yes' : 'No',
          "AppShoppingMall": prod.applications?.shoppingMall ? 'Yes' : 'No',
          "PDF": prod.pdfUrl || '#',
          "PDFVersions": JSON.stringify(prod.pdfVersions || []),
          "Slug": (prod.ProductName_EN || prod.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          "Featured": 'Yes',
          "SortOrder": 1,
          "Status": 'Active'
        };

        await executeSheetsAction('saveRecord', {
          sheetName: 'Products',
          idKey: 'ProductID',
          record: sheetRecord
        });
      }

      // 3. Sync Projects
      showToast("Syncing Project registries (3/5)...");
      for (const proj of projectsList) {
        await executeSheetsAction('saveRecord', {
          sheetName: 'Projects',
          idKey: 'ProjectID',
          record: {
            "ProjectID": proj.id,
            "Title EN": proj.title || proj["Title EN"] || '',
            "Title KH": proj["Title KH"] || proj.title || '',
            "Title KO": proj["Title KO"] || proj.title || '',
            "Category": proj.category,
            "CoverImage": proj.coverImage,
            "Gallery": proj.gallery ? proj.gallery.join(', ') : '',
            "Location": proj.location || '',
            "Area": proj.area || '',
            "CompletionYear": proj.completionYear || '',
            "Description": proj.description || '',
            "ConstructionType": proj.constructionType || '',
            "Status": 'Active'
          }
        });
      }

      // 4. Sync Blogs
      showToast("Syncing Blog Insights (4/5)...");
      for (const post of blogsList) {
        await executeSheetsAction('saveRecord', {
          sheetName: 'Blog',
          idKey: 'BlogID',
          record: {
            "BlogID": post.id,
            "Title EN": post.title || post["Title EN"] || '',
            "Title KH": post["Title KH"] || post.title || '',
            "Title KO": post["Title KO"] || post.title || '',
            "Excerpt": post.excerpt || '',
            "Content EN": post.content || post["Content EN"] || '',
            "Content KH": post["Content KH"] || post.content || '',
            "Content KO": post["Content KO"] || post.content || '',
            "Category": post.category,
            "ImageURL": post.image,
            "Author": post.author || 'Corporate Administrator',
            "PublishedDate": post.date || new Date().toISOString(),
            "Status": 'Published'
          }
        });
      }

      // 5. Sync Translations
      showToast("Syncing Multilingual Translations (5/6)...");
      for (const trans of translationsListState) {
        await executeSheetsAction('saveRecord', {
          sheetName: 'Translations',
          idKey: 'Key',
          record: {
            "Key": trans.Key || trans.key,
            "English": trans.English || trans.english || '',
            "Khmer": trans.Khmer || trans.khmer || '',
            "Korean": trans.Korean || trans.korean || '',
            "Category": trans.Category || 'General',
            "Status": "Active"
          }
        });
      }

      // 6. Sync Commercial Documents
      showToast("Syncing Commercial Documents (Quotations, BOQs, DOs) (6/6)...");
      try {
        const localQuotes = getQuotations();
        for (const q of localQuotes) {
          await executeSheetsAction('saveRecord', {
            sheetName: 'Quotations',
            idKey: 'QuotationID',
            record: {
              "QuotationID": q.id,
              "QuoteNumber": q.quoteNumber,
              "IssueDate": q.issueDate,
              "ExpiryDate": q.expiryDate,
              "PreparedBy": q.preparedBy || '',
              "ClientName": q.clientName,
              "ClientCompany": q.clientCompany || '',
              "ClientPhone": q.clientPhone || '',
              "ClientEmail": q.clientEmail || '',
              "ProjectSite": q.projectSite || '',
              "ItemsJSON": JSON.stringify(q.items),
              "Subtotal": q.subtotal,
              "DiscountTotal": q.discountTotal,
              "VatPercent": q.vatPercent,
              "VatAmount": q.vatAmount,
              "GrandTotalUSD": q.grandTotalUsd,
              "GrandTotalKHR": q.grandTotalKhr,
              "TermsAndConditions": q.termsAndConditions,
              "Status": q.status,
              "CreatedAt": q.createdAt,
              "UpdatedAt": q.updatedAt
            }
          });
        }

        const localBoqs = getBoqs();
        for (const b of localBoqs) {
          await executeSheetsAction('saveRecord', {
            sheetName: 'BOQs',
            idKey: 'BOQID',
            record: {
              "BOQID": b.id,
              "BOQNumber": b.boqNumber,
              "Date": b.date,
              "ClientName": b.clientName,
              "ProjectName": b.projectName,
              "ProjectLocation": b.projectLocation,
              "CategoriesJSON": JSON.stringify(b.categories),
              "Subtotal": b.subtotal,
              "ContingencyPercent": b.contingencyPercent,
              "ContingencyAmount": b.contingencyAmount,
              "ProfitPercent": b.profitPercent,
              "ProfitAmount": b.profitAmount,
              "VatPercent": b.vatPercent,
              "VatAmount": b.vatAmount,
              "GrandTotalUSD": b.grandTotalUsd,
              "GrandTotalKHR": b.grandTotalKhr,
              "Status": b.status,
              "CreatedAt": b.createdAt,
              "UpdatedAt": b.updatedAt
            }
          });
        }

        const localDns = getDeliveryNotes();
        for (const d of localDns) {
          await executeSheetsAction('saveRecord', {
            sheetName: 'DeliveryNotes',
            idKey: 'DeliveryNoteID',
            record: {
              "DeliveryNoteID": d.id,
              "DeliveryNumber": d.deliveryNumber,
              "POReference": d.poReference,
              "Date": d.date,
              "ClientName": d.clientName,
              "ProjectSite": d.projectSite,
              "ContactPerson": d.contactPerson,
              "VehicleNo": d.vehicleNo,
              "DriverName": d.driverName,
              "ItemsJSON": JSON.stringify(d.items),
              "PreparedBy": d.preparedBy,
              "DispatchedBy": d.dispatchedBy,
              "ReceivedBy": d.receivedBy,
              "Notes": d.notes,
              "Status": d.status,
              "CreatedAt": d.createdAt,
              "UpdatedAt": d.updatedAt
            }
          });
        }
      } catch (errDocs) {
        console.warn("Commercial docs bulk sync warning:", errDocs);
      }

      // 7. Sync Company Info
      showToast("Syncing Corporate Metadata & Location map...");
      await executeSheetsAction('updateCompanyInfo', { companyInfo });

      showToast("System database full bulk synchronization successfully finished!");
      await refreshAllData();
    } catch (err) {
      console.error(err);
      showErrorToast("Bulk sync encountered a network error.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Google Apps Script source code
  const appsScriptCode = `/**
 * Complete Google Apps Script Enterprise Backend for SDY C&I
 * Supports 22 Google Sheet Tables, Webhook API, Google Drive File Storage & Auto-Init.
 * 
 * Setup Instructions:
 * 1. Open your Google Sheet (https://sheets.new)
 * 2. Click Extensions > Apps Script
 * 3. Delete any code and paste this entire file
 * 4. Click Deploy > New Deployment
 * 5. Choose Type: Web App
 * 6. Set "Execute as": Me
 * 7. Set "Who has access": Anyone
 * 8. Click Deploy and copy the Web App URL to SDY Admin Settings!
 */

function doGet(e) {
  try {
    var data = getFullDatabaseJSON();
    return ContentService.createTextOutput(JSON.stringify(data))
                         .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var contents = e.postData ? e.postData.contents : "";
    var data = contents ? JSON.parse(contents) : {};
    var action = data.action || "";

    if (action === "readTable") {
      return createJsonResponse(readTable(data.sheetName));
    } else if (action === "saveRecord") {
      return createJsonResponse(saveRecord(data.sheetName, data.idKey, data.record));
    } else if (action === "deleteRecord" || action === "removeRecord") {
      var recordId = data.idValue || data.recordId || data.targetId || data.id || data.key || data.categoryId;
      return createJsonResponse(deleteRecord(data.sheetName, data.idKey, recordId));
    } else if (action === "bulkUpdateRows" || action === "bulkUpdateRecords") {
      return createJsonResponse(bulkUpdateRows(data.sheetName, data.idKey, data.rowIds, data.field, data.value));
    } else if (action === "bulkDeleteRows" || action === "bulkDeleteRecords") {
      return createJsonResponse(bulkDeleteRows(data.sheetName, data.idKey, data.rowIds));
    } else if (action === "saveTranslationKey") {
      return createJsonResponse(saveTranslationKey(data.translation));
    } else if (action === "deleteTranslationKey") {
      return createJsonResponse(deleteTranslationKey(data.key));
    } else if (action === "saveCategory") {
      return createJsonResponse(saveCategory(data.category));
    } else if (action === "deleteCategory") {
      return createJsonResponse(deleteCategory(data.categoryId || data.idValue));
    } else if (action === "updateCompanyInfo") {
      return createJsonResponse(updateCompanyInfo(data.companyInfo));
    } else if (action === "registerMissingKey" || action === "autoCreateTranslation") {
      return createJsonResponse(registerMissingKey(data.key, data.defaultValue));
    } else if (action === "updateMessageStatus") {
      return createJsonResponse(updateMessageStatus(data.targetId, data.newStatus));
    } else if (action === "deleteMessage") {
      return createJsonResponse(deleteMessage(data.targetId || data.idValue));
    }

    // Default contact message save
    var saveResult = saveContactMessage(data);
    return createJsonResponse(saveResult);
  } catch (error) {
    return createJsonResponse({ status: "error", message: error.toString() });
  }
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
                       .setMimeType(ContentService.MimeType.JSON);
}

function getFullDatabaseJSON() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  var db = {};
  
  sheets.forEach(function(sheet) {
    var name = sheet.getName();
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      db[name] = [];
      return;
    }
    var headers = data[0];
    var rows = [];
    for (var i = 1; i < data.length; i++) {
      var rowObj = {};
      for (var j = 0; j < headers.length; j++) {
        rowObj[headers[j]] = data[i][j];
      }
      rows.push(rowObj);
    }
    db[name] = rows;
  });
  
  return { status: "success", data: db };
}

function readTable(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { status: "success", data: [] };
  
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "success", data: [] };
  
  var headers = data[0];
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var rowObj = {};
    for (var j = 0; j < headers.length; j++) {
      rowObj[headers[j]] = data[i][j];
    }
    rows.push(rowObj);
  }
  return { status: "success", data: rows };
}

function saveRecord(sheetName, idKey, record) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  
  var data = sheet.getDataRange().getValues();
  var headers = data.length > 0 && data[0][0] !== "" ? data[0] : Object.keys(record);
  
  if (data.length === 0 || data[0][0] === "") {
    sheet.appendRow(headers);
  }
  
  var recordId = String(record[idKey] || record.id || record.ID || "");
  var rowIndex = -1;
  
  if (data.length > 1 && idKey) {
    var idColIdx = headers.indexOf(idKey);
    if (idColIdx !== -1) {
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][idColIdx]) === recordId) {
          rowIndex = i + 1;
          break;
        }
      }
    }
  }
  
  var rowValues = headers.map(function(h) {
    return record[h] !== undefined ? record[h] : "";
  });
  
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }
  
  return { status: "success", message: "Record saved successfully to " + sheetName };
}

function deleteRecord(sheetName, idKey, recordId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { status: "error", message: "Sheet not found" };
  
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "error", message: "No data in sheet" };
  
  var headers = data[0];
  var idColIdx = headers.indexOf(idKey);
  if (idColIdx === -1) idColIdx = 0;
  
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][idColIdx]) === String(recordId)) {
      sheet.deleteRow(i + 1);
      return { status: "success", message: "Record deleted from " + sheetName };
    }
  }
  return { status: "error", message: "Record ID not found" };
}

function bulkUpdateRows(sheetName, idKey, rowIds, field, value) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { status: "error", message: "Sheet not found" };
  
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "error", message: "No rows to update" };
  
  var headers = data[0];
  var idCol = headers.indexOf(idKey);
  var targetCol = headers.indexOf(field);
  if (idCol === -1 || targetCol === -1) return { status: "error", message: "Column headers not found" };
  
  var idsSet = {};
  rowIds.forEach(function(id) { idsSet[String(id)] = true; });
  
  for (var i = 1; i < data.length; i++) {
    if (idsSet[String(data[i][idCol])]) {
      sheet.getRange(i + 1, targetCol + 1).setValue(value);
    }
  }
  return { status: "success", message: "Bulk update completed" };
}

function bulkDeleteRows(sheetName, idKey, rowIds) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { status: "error", message: "Sheet not found" };
  
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "error", message: "No rows to delete" };
  
  var headers = data[0];
  var idCol = headers.indexOf(idKey);
  if (idCol === -1) idCol = 0;
  
  var idsSet = {};
  rowIds.forEach(function(id) { idsSet[String(id)] = true; });
  
  for (var i = data.length - 1; i >= 1; i--) {
    if (idsSet[String(data[i][idCol])]) {
      sheet.deleteRow(i + 1);
    }
  }
  return { status: "success", message: "Bulk delete completed" };
}

function saveTranslationKey(translation) {
  return saveRecord("Translations", "Key", {
    "Key": translation.key,
    "English": translation.english || "",
    "Khmer": translation.khmer || "",
    "Korean": translation.korean || ""
  });
}

function deleteTranslationKey(key) {
  return deleteRecord("Translations", "Key", key);
}

function saveCategory(category) {
  return saveRecord("Categories", "CategoryID", {
    "CategoryID": category.id || ("cat_" + Date.now()),
    "Name EN": category.name || "",
    "Name KH": category.name || "",
    "Name KO": category.name || "",
    "Type": category.type || "product",
    "Status": "Active"
  });
}

function deleteCategory(catId) {
  return deleteRecord("Categories", "CategoryID", catId);
}

function updateCompanyInfo(companyInfo) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("CompanyInfo");
  if (!sheet) sheet = ss.insertSheet("CompanyInfo");
  
  sheet.clear();
  sheet.appendRow(["Key", "Value"]);
  for (var k in companyInfo) {
    sheet.appendRow([k, companyInfo[k]]);
  }
  return { status: "success", message: "Company profile updated" };
}

function registerMissingKey(key, defaultValue) {
  return saveRecord("Translations", "Key", {
    "Key": key,
    "English": defaultValue || key,
    "Khmer": "",
    "Korean": ""
  });
}

function updateMessageStatus(targetId, newStatus) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("ContactMessages");
  if (!sheet) return { status: "error", message: "Messages sheet not found" };
  
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: "error", message: "No message records" };
  
  var headers = data[0];
  var idCol = headers.indexOf("id");
  var statusCol = headers.indexOf("status");
  
  if (idCol === -1 || statusCol === -1) return { status: "error", message: "Header mismatch" };
  
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(targetId)) {
      sheet.getRange(i + 1, statusCol + 1).setValue(newStatus);
      return { status: "success", message: "Message status updated to " + newStatus };
    }
  }
  return { status: "error", message: "Target message ID not found" };
}

function deleteMessage(targetId) {
  return deleteRecord("ContactMessages", "id", targetId);
}

function saveContactMessage(msg) {
  return saveRecord("ContactMessages", "id", {
    "id": msg.id || ("msg_" + Date.now()),
    "name": msg.name || "",
    "email": msg.email || "",
    "phone": msg.phone || "",
    "company": msg.company || "",
    "subject": msg.subject || "",
    "message": msg.message || "",
    "status": msg.status || "Pending",
    "date": msg.date || (new Date().toISOString())
  });
}
`;

  const copyScriptToClipboard = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  // SECURE GATE OVERLAY
  if (!isLoggedIn) {
    return (
      <section id="admin-login-page" className="py-24 bg-white dark:bg-[#101828] min-h-[80vh] flex items-center justify-center transition-colors">
        <div className="max-w-md w-full mx-auto px-6 py-10 rounded-3xl bg-[#F7F9FC] dark:bg-[#101828]/50 border border-black/5 dark:border-white/5 shadow-2xl space-y-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-[#0A4DA3]/10 flex items-center justify-center text-[#0A4DA3] dark:text-[#1E88E5]">
            <Shield className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-[#101828] dark:text-white uppercase tracking-wider">{t('admin.login_gateway', 'SDY Administrative Gateway')}</h2>
            <p className="text-xs text-[#101828]/50 dark:text-white/50">{t('admin.login_passcode_desc', 'Enter authorized passcode for cloud state CRUD controls.')}</p>
          </div>


          {!showPasswordChangeFormOnLogin ? (
            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase tracking-wider block">
                    {t('admin.login_password_label', 'Security Password')}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPasswordChangeFormOnLogin(true)}
                    className="text-[10px] font-bold text-[#0A4DA3] dark:text-[#1E88E5] hover:underline"
                  >
                    {language === 'km' ? 'កំណត់ពាក្យសម្ងាត់ថ្មី' : 'Set Custom Password'}
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-[#101828]/40 dark:text-white/40" />
                  <input
                    type="password"
                    placeholder={t('admin.login_placeholder', language === 'km' ? 'វាយបញ្ចូលពាក្យសម្ងាត់ Admin' : 'Enter Admin Password')}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-xs rounded-xl bg-white dark:bg-[#101828] text-[#101828] dark:text-white border border-black/5 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSyncing}
                className="w-full py-3.5 bg-[#0A4DA3] hover:bg-[#1E88E5] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('admin.login_authenticating', 'Authenticating Server...')}
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" /> {t('admin.login_authenticate_btn', 'Authenticate Access')}
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-3.5 text-left border-t border-black/5 dark:border-white/5 pt-4">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-[#101828] dark:text-white uppercase">
                  {language === 'km' ? 'កំណត់ពាក្យសម្ងាត់ Admin ផ្ទាល់' : 'Change Admin Password Directly'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPasswordChangeFormOnLogin(false)}
                  className="text-[10px] font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {language === 'km' ? 'បោះបង់' : 'Cancel'}
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase">
                  {language === 'km' ? 'ពាក្យសម្ងាត់បច្ចុប្បន្ន (Current Password)' : 'Current Password'}
                </label>
                <input
                  type="password"
                  placeholder={language === 'km' ? 'វាយបញ្ចូលពាក្យសម្ងាត់បច្ចុប្បន្ន' : 'Current password'}
                  value={oldPassInput}
                  onChange={(e) => setOldPassInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white dark:bg-[#101828] text-[#101828] dark:text-white border border-black/10 dark:border-white/10"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase">
                  {language === 'km' ? 'ពាក្យសម្ងាត់ថ្មី (New Password)' : 'New Password'}
                </label>
                <input
                  type="password"
                  placeholder={language === 'km' ? 'បញ្ចូលពាក្យសម្ងាត់ថ្មី' : 'Enter new password'}
                  value={newPassInput}
                  onChange={(e) => setNewPassInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white dark:bg-[#101828] text-[#101828] dark:text-white border border-black/10 dark:border-white/10"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase">
                  {language === 'km' ? 'ផ្ទៀងផ្ទាត់ពាក្យសម្ងាត់ថ្មី (Confirm Password)' : 'Confirm New Password'}
                </label>
                <input
                  type="password"
                  placeholder={language === 'km' ? 'វាយបញ្ចូលពាក្យសម្ងាត់ថ្មីម្តងទៀត' : 'Re-enter new password'}
                  value={confirmPassInput}
                  onChange={(e) => setConfirmPassInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white dark:bg-[#101828] text-[#101828] dark:text-white border border-black/10 dark:border-white/10"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-2"
              >
                <Lock className="w-4 h-4" />
                {language === 'km' ? 'រក្សាទុកពាក្យសម្ងាត់ថ្មី' : 'Save New Password'}
              </button>
            </form>
          )}

          {errorToast && (
            <p className="text-xs font-bold text-red-500 bg-red-500/10 py-2.5 px-4 rounded-xl border border-red-500/15 animate-shake">
              {errorToast}
            </p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section id="admin-page" className="py-24 bg-white dark:bg-[#101828] transition-colors duration-300 min-h-[80vh]">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 space-y-8">
        
        {/* Header summary */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 sm:p-8 rounded-2xl bg-[#113586] w-full shadow-md">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-white">
              <Shield className="w-5 h-5 text-white" />
              <span className="text-[15px] font-bold tracking-[0.25em] uppercase text-white">{t('admin.console_badge', 'Secure Multi-table CRUD Console')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f8f8f8] tracking-tight">
              {t('admin.management_center_title', 'SDY C&I Management Center')}
            </h2>
            <p className="text-xs sm:text-sm text-white">
              {t('admin.management_center_desc', 'Full create, read, update, and delete access. Auto-generates IDs, uploads assets to Drive, and logs details.')}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 items-center">
            {sheetsConfig.isSyncEnabled && (
              <button
                onClick={syncDataFromSheets}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/30 text-white bg-white/10 text-xs font-bold uppercase transition-all"
              >
                {isSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : <FileSpreadsheet className="w-3.5 h-3.5 text-white" />}
                {t('admin.force_sync_btn', 'Force Sync Now')}
              </button>
            )}
            <button
              onClick={() => {
                setOldPassInput('');
                setNewPassInput('');
                setConfirmPassInput('');
                setIsChangePasswordOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 border border-amber-400/30 text-xs font-bold uppercase tracking-wide transition-all shadow-sm"
            >
              <KeyRound className="w-4 h-4 text-amber-300" />
              {language === 'km' ? 'ដូរពាក្យសម្ងាត់' : 'Change Password'}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white border border-red-500/20 text-xs font-bold uppercase tracking-wide transition-all shadow-sm"
            >
              <LogOut className="w-4 h-4 text-white" /> {t('admin.sign_out_btn', 'Sign Out')}
            </button>
          </div>
        </div>

        {/* Floating Success Toast */}
        {successToast && (
          <div className="fixed bottom-12 right-12 z-50 p-4 rounded-xl bg-[#0A4DA3] text-white text-xs font-bold uppercase tracking-widest shadow-2xl flex items-center gap-2.5 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-green-300" />
            {successToast}
          </div>
        )}

        {/* Floating Error Toast */}
        {errorToast && (
          <div className="fixed bottom-12 right-12 z-50 p-4 rounded-xl bg-red-600 text-white text-xs font-bold uppercase tracking-widest shadow-2xl flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-200" />
            {errorToast}
          </div>
        )}

        {/* Main Interface Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-12 gap-6 xl:gap-8 items-start">
          
          {/* Tabs Selector Column */}
          <div className="lg:col-span-3 xl:col-span-3 2xl:col-span-2 space-y-2">
            {[
              { id: 'homepage_cms', label: t('admin.tab_homepage_cms', 'Homepage CMS Manager'), icon: Home },
              { id: 'services_cms', label: t('admin.tab_services_cms', 'Services Page Manager'), icon: Wrench },
              { id: 'about_cms', label: t('admin.tab_about_cms', 'About Us Manager'), icon: Building2 },
              { id: 'testimonials_cms', label: t('admin.tab_testimonials_cms', 'Client Reviews Manager'), icon: MessageSquare },
              { id: 'messages', label: t('admin.tab_inquiries', 'Inbound Inquiries'), icon: Mail },
              { id: 'concrete_orders', label: t('admin.tab_orders', 'Doors & Furniture Orders'), icon: ShoppingBag },
              { id: 'commercial_docs', label: t('admin.tab_commercial_docs', 'Commercial Documents (Quotation, BOQ & DO)'), icon: FileText },
              { id: 'products', label: t('admin.tab_products', 'Products Database'), icon: Database },
              { id: 'projects', label: t('admin.tab_projects', 'Projects Database'), icon: Cpu },
              { id: 'blogs', label: t('admin.tab_blogs', 'News & Technical Blogs'), icon: FileText },
              { id: 'sheets', label: t('admin.tab_sheets', 'Google Sheets Integration'), icon: FileSpreadsheet },
              { id: 'categories', label: t('admin.tab_categories', 'Categories Manager'), icon: Settings },
              { id: 'translations', label: t('admin.tab_translations', 'Translations Dictionary'), icon: Globe },
              { id: 'info', label: t('admin.tab_info', 'Company Profile Details'), icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setIsAddingProduct(false);
                    setEditingProduct(null);
                    setIsAddingProject(false);
                    setEditingProject(null);
                    setIsAddingBlog(false);
                    setEditingBlog(null);
                    setIsAddingCategory(false);
                    setEditingCategory(null);
                    setIsAddingTranslation(false);
                    setEditingTranslation(null);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left text-sm sm:text-base font-bold tracking-wide transition-all border border-[#254177] ${
                    activeTab === tab.id
                      ? 'bg-[#0A4DA3] text-white shadow-lg scale-[1.01]'
                      : 'bg-[#F7F9FC] dark:bg-[#101828]/50 text-[#101828]/85 dark:text-white/80 hover:bg-[#0A4DA3]/10 dark:hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab View Container Column */}
          <div className="lg:col-span-9 xl:col-span-9 2xl:col-span-10 bg-[#F7F9FC] dark:bg-[#101828]/35 border border-black/5 dark:border-white/5 p-6 sm:p-8 rounded-3xl shadow-xl min-h-[450px] w-full">
            
            {/* HOMEPAGE CMS MANAGER VIEW */}
            {activeTab === 'homepage_cms' && (
              <HomepageCmsManager />
            )}

            {/* SERVICES PAGE CMS MANAGER VIEW */}
            {activeTab === 'services_cms' && (
              <ServicesCmsManager />
            )}

            {/* ABOUT US PAGE CMS MANAGER VIEW */}
            {activeTab === 'about_cms' && (
              <AboutCmsManager />
            )}

            {/* CLIENT REVIEWS CMS MANAGER VIEW */}
            {activeTab === 'testimonials_cms' && (
              <TestimonialsCmsManager />
            )}

            {/* ENTERPRISE INTELLIGENCE PLATFORM (EIP) VIEW */}
            {activeTab === 'enterprise_intelligence' && (
              <EnterpriseIntelligencePlatform />
            )}

            {/* ENTERPRISE RUNTIME & AUTONOMOUS OPERATIONS VIEW */}
            {activeTab === 'enterprise_runtime' && (
              <EnterpriseRuntimeStudio />
            )}

            {/* PLATFORM LIFECYCLE & OPERATIONS VIEW */}
            {activeTab === 'platform_lifecycle' && (
              <PlatformLifecycleStudio />
            )}

            {/* DEVELOPER SDK & MARKETPLACE ECOSYSTEM VIEW */}
            {activeTab === 'developer_ecosystem' && (
              <DeveloperEcosystemStudio />
            )}

            {/* PLATFORM GOVERNANCE & QUALITY GATES VIEW */}
            {activeTab === 'platform_governance' && (
              <PlatformGovernanceStudio />
            )}

            {/* LOW-CODE ENTITY BUILDER VIEW */}
            {activeTab === 'entity_builder' && (
              <DynamicEntityBuilder
                schemas={customSchemas}
                onSchemaChange={(updated) => {
                  setCustomSchemas(updated);
                  if (updated.length > 0) setActiveDynamicSchema(updated[updated.length - 1]);
                }}
              />
            )}

            {/* DYNAMIC MODULE DATA MANAGER VIEW */}
            {activeTab === 'dynamic_manager' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-[#101828] rounded-2xl border border-black/5 dark:border-white/10">
                  <span className="text-xs font-bold text-dark dark:text-white uppercase tracking-wider">
                    Select Business Module to Manage:
                  </span>
                  <select
                    value={activeDynamicSchema.id}
                    onChange={(e) => {
                      const found = customSchemas.find(s => s.id === e.target.value);
                      if (found) setActiveDynamicSchema(found);
                    }}
                    className="px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs font-bold text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {customSchemas.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.tableName})</option>
                    ))}
                  </select>
                </div>

                <DynamicEntityManager schema={activeDynamicSchema} />
              </div>
            )}

            {/* VISUAL LAYOUT BUILDER VIEW */}
            {activeTab === 'section_builder' && (
              <DynamicSectionBuilder
                sections={pageSections}
                onSectionsChange={(updated) => setPageSections(updated)}
              />
            )}

            {/* GOOGLE DRIVE MEDIA CDN LIBRARY VIEW */}
            {activeTab === 'media_library' && (
              <DynamicMediaLibrary />
            )}

            {/* COMMERCIAL DOCUMENTS VIEW (Quotation, BOQ, Delivery Note) */}
            {activeTab === 'commercial_docs' && (
              <CommercialDocumentsStudio />
            )}

            {/* 1. CONTACT MESSAGES VIEW */}
            {activeTab === 'messages' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5">
                  <h3 className="font-bold text-lg text-[#101828] dark:text-white">{t('admin.submissions_title', 'Form Submissions Logs')}</h3>
                  <span className="text-[10px] bg-[#0A4DA3]/10 text-[#0A4DA3] dark:text-[#1E88E5] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
                    {sheetsConfig.isSyncEnabled ? t('admin.webhook_live', 'Live Webhook Pipeline') : t('admin.persisted_local', 'Persisted LocalState')}
                  </span>
                </div>

                {messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className="p-5 rounded-2xl bg-white dark:bg-[#101828] border border-black/5 dark:border-white/10 space-y-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                          <div>
                            <p className="font-bold text-[#101828] dark:text-white text-base">{msg.name}</p>
                            <p className="text-xs sm:text-sm text-[#101828]/60 dark:text-white/60">{msg.email} | {msg.phone} {msg.company ? `| ${msg.company}` : ''}</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                              msg.status === 'Completed'
                                ? 'bg-green-100 dark:bg-green-950/20 text-green-600'
                                : msg.status === 'Contacted'
                                ? 'bg-blue-100 dark:bg-blue-950/20 text-blue-600'
                                : 'bg-amber-100 dark:bg-amber-950/20 text-amber-600'
                            }`}>
                              {msg.status === 'Completed'
                                ? t('status.completed', 'Completed')
                                : msg.status === 'Contacted'
                                ? t('status.contacted', 'Contacted')
                                : t('status.pending', 'Pending')}
                            </span>
                            <span className="text-xs text-[#101828]/50 dark:text-white/50">{msg.date}</span>
                          </div>
                        </div>

                        <div className="space-y-1.5 p-4 rounded-xl bg-[#F7F9FC] dark:bg-[#101828]/85 text-sm sm:text-base text-[#101828]/90 dark:text-white/90">
                          <p className="font-bold text-[#0A4DA3] dark:text-[#1E88E5]">{t('admin.subject_area_label', 'Subject Area:')} {msg.subject}</p>
                          <p className="leading-relaxed whitespace-pre-wrap mt-1">{msg.message}</p>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-black/5 dark:border-white/5 text-[10px]">
                          <div className="flex items-center gap-2">
                            <span className="font-bold uppercase text-[#101828]/45 dark:text-white/45">{t('admin.update_pipeline_label', 'Update pipeline:')}</span>
                            <button
                              onClick={() => handleUpdateMessageStatus(msg.id, 'Contacted')}
                              className="px-2 py-1 rounded bg-blue-50 dark:bg-blue-950/20 text-blue-500 font-bold uppercase hover:bg-blue-500 hover:text-white transition-colors"
                            >
                              {t('status.contacted', 'Contacted')}
                            </button>
                            <button
                              onClick={() => handleUpdateMessageStatus(msg.id, 'Completed')}
                              className="px-2 py-1 rounded bg-green-50 dark:bg-green-950/20 text-green-500 font-bold uppercase hover:bg-green-500 hover:text-white transition-colors"
                            >
                              {t('status.completed', 'Completed')}
                            </button>
                          </div>

                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors"
                            title="Delete submission entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-xs font-semibold text-[#101828]/50 dark:text-white/50">
                    {t('admin.no_inquiries', 'No inquiries recorded in database logs. Submit a message in the Contact Page to test!')}
                  </div>
                )}
              </div>
            )}

            {/* DOOR & FURNITURE ORDERS LOGS VIEW */}
            {activeTab === 'concrete_orders' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5">
                  <div>
                    <h3 className="font-bold text-lg text-[#101828] dark:text-white flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-[#0A4DA3] dark:text-[#1E88E5]" />
                      {t('admin.orders_title', 'កំណត់ត្រាបញ្ជាទិញទ្វារ & គ្រឿងសង្ហារិម')}
                    </h3>
                    <p className="text-xs text-[#101828]/60 dark:text-white/60">
                      {t('admin.orders_subtitle', 'ទិន្នន័យត្រូវបានផ្ញើទៅ Telegram Bot Chat (@sdy_notification_bot) និង Google Sheet ដោយស្វ័យប្រវត្តិ')}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      refreshAllData();
                    }}
                    className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-xs font-bold flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> {t('admin.reload_logs', 'ផ្ទុកកំណត់ត្រាឡើងវិញ')}
                  </button>
                </div>

                {concreteOrdersList.length > 0 ? (
                  <div className="space-y-4">
                    {concreteOrdersList.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-5 rounded-2xl bg-white dark:bg-[#101828] border border-black/10 dark:border-white/10 space-y-3 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-black/5 dark:border-white/5 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-extrabold text-[#0A4DA3] dark:text-[#1E88E5]">{ord.id}</span>
                            <span className="text-[#101828]/40 dark:text-white/40">|</span>
                            <span className="font-bold text-[#101828] dark:text-white">{ord.customerName}</span>
                            <span className="text-emerald-600 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full text-[10px]">
                              {ord.phone}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-[#101828]/50 dark:text-white/50">
                            <Clock className="w-3 h-3" />
                            <span>{ord.createdAt}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-[#F7F9FC] dark:bg-[#101828]/80 p-3 rounded-xl border border-black/5 dark:border-white/5">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-[#101828]/50 dark:text-white/50 block">{t('admin.order_product_name', 'ឈ្មោះផលិតផល:')}</span>
                            <span className="font-bold text-[#101828] dark:text-white">{ord.productName || ord.concreteGrade || 'ទ្វារ/គ្រឿងសង្ហារិម'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-[#101828]/50 dark:text-white/50 block">{t('admin.order_material', 'ប្រភេទឈើ/សម្ភារៈ:')}</span>
                            <span className="font-semibold text-[#101828] dark:text-white">{ord.woodType || ord.pourType || 'តាមការប្រឹក្សា'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-[#101828]/50 dark:text-white/50 block">{t('admin.order_dimensions', 'ខ្នាត/ទំហំ:')}</span>
                            <span className="font-semibold text-[#101828] dark:text-white">{ord.dimensions || 'ទំហំបទដ្ឋាន'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-[#101828]/50 dark:text-white/50 block">{t('admin.order_quantity', 'បរិមាណ:')}</span>
                            <span className="font-bold text-[#0A4DA3] dark:text-[#1E88E5] text-sm">{ord.quantity || ord.quantityM3 || '1'}</span>
                          </div>
                        </div>

                        <div className="text-xs text-[#101828]/80 dark:text-white/80 space-y-1">
                          <p><strong>{t('admin.order_delivery_location', 'ទីតាំងដឹកជញ្ជូន/ដំឡើង:')}</strong> {ord.deliveryLocation}</p>
                          {ord.deliveryDate && <p><strong>{t('admin.order_required_date', 'កាលបរិច្ឆេទត្រូវការ:')}</strong> {ord.deliveryDate}</p>}
                          {ord.notes && <p className="text-[11px] text-[#101828]/60 dark:text-white/60 italic"><strong>{t('admin.order_notes', 'ចំណាំ:')}</strong> {ord.notes}</p>}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5 text-[10px]">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 font-bold flex items-center gap-1">
                              <Send className="w-3 h-3" /> Telegram Bot Sent: {ord.telegramStatus || 'OK'}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold flex items-center gap-1">
                              <FileSpreadsheet className="w-3 h-3" /> Google Sheet: {ord.sheetStatus || 'Synced'}
                            </span>
                          </div>

                          <button
                            onClick={async () => {
                              if (!confirm('តើអ្នកពិតជាចង់លុបប័ណ្ណបញ្ជាទិញនេះមែនទេ?')) return;
                              const updated = concreteOrdersList.filter(o => o.id !== ord.id);
                              setConcreteOrdersList(updated);
                              localStorage.setItem('sdy_concrete_orders', JSON.stringify(updated));
                              showToast('លុបប័ណ្ណបញ្ជាទិញបានជោគជ័យ');
                              if (sheetsConfig.googleSheetsWebhookUrl && sheetsConfig.isSyncEnabled) {
                                await executeSheetsAction('deleteRecord', {
                                  sheetName: 'DoorAndFurnitureOrders',
                                  idKey: 'id',
                                  idValue: ord.id
                                });
                              }
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors"
                            title="Delete order record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-xs font-semibold text-[#101828]/50 dark:text-white/50 bg-white dark:bg-[#101828] rounded-2xl border border-black/5 dark:border-white/5">
                    {t('admin.no_orders', 'មិនទាន់មានទិន្នន័យកុម្ម៉ង់ទ្វារ ឬគ្រឿងសង្ហារិមនៅឡើយទេ។')}
                  </div>
                )}
              </div>
            )}

            {/* 2. PRODUCT DATABASE VIEW */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                
                {/* Product form if active */}
                {isAddingProduct || editingProduct ? (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5">
                      <h4 className="font-bold text-[#101828] dark:text-white">
                        {editingProduct 
                          ? `${t('admin.edit_catalog_product', 'Edit Catalog Product:')} ${editingProduct.name}` 
                          : t('admin.append_new_product', 'Append New Catalog Product')}
                      </h4>
                      <button
                        onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }}
                        className="px-3 py-1 bg-gray-200 dark:bg-zinc-800 text-[#101828] dark:text-white text-xs font-bold rounded-lg"
                      >
                        {t('admin.cancel', 'Cancel')}
                      </button>
                    </div>

                    <form onSubmit={handleSaveProduct} className="space-y-5">
                      {/* Global Category Selector */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase block">{t('admin.category_line_label', 'Category Line')}</label>
                          <select
                            value={productForm.category}
                            onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-black/10 dark:border-white/10 text-[#101828] dark:text-white focus:outline-none"
                          >
                            <option value="Doors & Windows">{t('products.cat_doors_windows', 'Doors & Windows')}</option>
                            <option value="Wardrobes & Cabinets">{t('products.cat_wardrobes_cabinets', 'Wardrobes & Cabinets')}</option>
                            <option value="Millwork & Cladding">{t('products.cat_millwork_cladding', 'Millwork & Cladding')}</option>
                            <option value="Fitted Kitchens">{t('products.cat_fitted_kitchens', 'Fitted Kitchens')}</option>
                            <option value="Executive Desks">{t('products.cat_executive_desks', 'Executive Desks')}</option>
                            <option value="Commercial Ceiling">{t('products.cat_commercial_ceiling', 'Commercial Ceiling')}</option>
                            <option value="Custom Furnishings">{t('products.cat_custom_furnishings', 'Custom Furnishings')}</option>
                            {Array.isArray(categoriesList) && categoriesList
                              .filter((c: any) => (c.type || c.Type || 'product') === 'product')
                              .map((c: any) => {
                                const cName = c.name || c.Name || c.categoryName;
                                const masterList = ["Doors & Windows", "Wardrobes & Cabinets", "Millwork & Cladding", "Fitted Kitchens", "Executive Desks", "Commercial Ceiling", "Custom Furnishings"];
                                if (!cName || masterList.includes(cName)) return null;
                                return <option key={cName} value={cName}>{cName}</option>;
                              })}
                            {productForm.category && !["Doors & Windows", "Wardrobes & Cabinets", "Millwork & Cladding", "Fitted Kitchens", "Executive Desks", "Commercial Ceiling", "Custom Furnishings", ...(Array.isArray(categoriesList) ? categoriesList.map((c: any) => c.name || c.Name) : [])].includes(productForm.category) && (
                              <option value={productForm.category}>{productForm.category}</option>
                            )}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase block">Product Code / SKU</label>
                          <input
                            type="text"
                            placeholder="e.g. SDY-WD-9021"
                            value={productForm.id || ''}
                            onChange={(e) => setProductForm(prev => ({ ...prev, id: e.target.value }))}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-slate-300 dark:border-slate-700 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3] dark:focus:ring-[#1E88E5]"
                          />
                        </div>
                      </div>

                      {/* Tabbed Trilingual Content Switcher Bar */}
                      <div className="bg-slate-100 dark:bg-slate-800/80 p-2 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-inner">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 px-2 pb-1.5 uppercase tracking-wider">
                          <span>{t('admin.trilingual_editor', 'Trilingual Language Content')}</span>
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                            {productFormLang === 'km' ? '🇰🇭 Khmer Active' : productFormLang === 'en' ? '🇬🇧 English Active' : '🇰🇷 Korean Active'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => { setProductFormLang('km'); setLanguage('km'); }}
                            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                              productFormLang === 'km'
                                ? 'bg-white dark:bg-[#101828] text-[#0A4DA3] dark:text-[#1E88E5] shadow-md border border-blue-300 dark:border-blue-700 font-extrabold'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            <span className="text-base">🇰🇭</span>
                            <span>Khmer (ខ្មែរ)</span>
                            {productForm.ProductName_KH && <span className="w-2 h-2 rounded-full bg-emerald-500" title="Filled" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setProductFormLang('en'); setLanguage('en'); }}
                            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                              productFormLang === 'en'
                                ? 'bg-white dark:bg-[#101828] text-[#0A4DA3] dark:text-[#1E88E5] shadow-md border border-blue-300 dark:border-blue-700 font-extrabold'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            <span className="text-base">🇬🇧</span>
                            <span>English</span>
                            {(productForm.ProductName_EN || productForm.name) && <span className="w-2 h-2 rounded-full bg-emerald-500" title="Filled" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setProductFormLang('ko'); setLanguage('ko'); }}
                            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                              productFormLang === 'ko'
                                ? 'bg-white dark:bg-[#101828] text-[#0A4DA3] dark:text-[#1E88E5] shadow-md border border-blue-300 dark:border-blue-700 font-extrabold'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            <span className="text-base">🇰🇷</span>
                            <span>Korean (한국어)</span>
                            {productForm.ProductName_KO && <span className="w-2 h-2 rounded-full bg-emerald-500" title="Filled" />}
                          </button>
                        </div>
                      </div>

                      {/* Language Specific Content Panel */}
                      {productFormLang === 'km' && (
                        <div className="p-4 bg-blue-50/40 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/40 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#0A4DA3] dark:text-[#1E88E5]">
                            <span>🇰🇭</span>
                            <span>ព័ត៌មានផលិតផលជាភាសាខ្មែរ (Khmer Language Fields)</span>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#0A4DA3] dark:text-[#1E88E5] uppercase block">
                              ឈ្មោះផលិតផលជាភាសាខ្មែរ (Khmer Product Name)
                            </label>
                            <input
                              type="text"
                              lang="km"
                              placeholder="ឧ. ទ្វារឈើប្រណិតការពារសំឡេង SDY Royal"
                              value={productForm.ProductName_KH || ''}
                              onChange={(e) => setProductForm(prev => ({ ...prev, ProductName_KH: e.target.value }))}
                              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-blue-200 dark:border-blue-800 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#0A4DA3] dark:text-[#1E88E5] uppercase block">
                              សង្ខេបអំពីផលិតផល (Khmer Short Description / Highlights)
                            </label>
                            <input
                              type="text"
                              lang="km"
                              placeholder="ឧ. ផលិតផលឈើប្រណិតគុណភាពខ្ពស់ ធន់នឹងទឹក..."
                              value={productForm.shortDescriptionKH || ''}
                              onChange={(e) => setProductForm(prev => ({ ...prev, shortDescriptionKH: e.target.value }))}
                              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-blue-200 dark:border-blue-800 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#0A4DA3] dark:text-[#1E88E5] uppercase block">
                              ការពិពណ៌នាលម្អិតជាភាសាខ្មែរ (Khmer Detailed Description)
                            </label>
                            <textarea
                              lang="km"
                              placeholder="ការពិពណ៌នាលម្អិតអំពីលក្ខណៈបច្ចេកទេស និងគុណសម្បត្តិ..."
                              rows={3}
                              value={productForm.Description_KH || productForm.longDescriptionKH || ''}
                              onChange={(e) => setProductForm(prev => ({ ...prev, Description_KH: e.target.value, longDescriptionKH: e.target.value }))}
                              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-blue-200 dark:border-blue-800 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            ></textarea>
                          </div>
                        </div>
                      )}

                      {productFormLang === 'en' && (
                        <div className="p-4 bg-blue-50/40 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/40 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#0A4DA3] dark:text-[#1E88E5]">
                            <span>🇬🇧</span>
                            <span>English Language Fields</span>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#0A4DA3] dark:text-[#1E88E5] uppercase block">
                              English Product Name *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. SDY Royal Acoustic Solid Wood Door"
                              value={productForm.ProductName_EN || productForm.name || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setProductForm(prev => ({ ...prev, ProductName_EN: val, name: val }));
                              }}
                              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-blue-200 dark:border-blue-800 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#0A4DA3] dark:text-[#1E88E5] uppercase block">
                              Short Description / Summary (English)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Premium 100% solid timber door engineered for acoustic control..."
                              value={productForm.shortDescriptionEN || ''}
                              onChange={(e) => setProductForm(prev => ({ ...prev, shortDescriptionEN: e.target.value }))}
                              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-blue-200 dark:border-blue-800 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#0A4DA3] dark:text-[#1E88E5] uppercase block">
                              Detailed Product Description (English)
                            </label>
                            <textarea
                              placeholder="Comprehensive specification details, finish options, millwork details..."
                              rows={3}
                              value={productForm.Description_EN || productForm.description || productForm.longDescriptionEN || ''}
                              onChange={(e) => setProductForm(prev => ({ ...prev, Description_EN: e.target.value, description: e.target.value, longDescriptionEN: e.target.value }))}
                              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-blue-200 dark:border-blue-800 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            ></textarea>
                          </div>
                        </div>
                      )}

                      {productFormLang === 'ko' && (
                        <div className="p-4 bg-blue-50/40 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/40 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#0A4DA3] dark:text-[#1E88E5]">
                            <span>🇰🇷</span>
                            <span>한국어 제품 정보 (Korean Language Fields)</span>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#0A4DA3] dark:text-[#1E88E5] uppercase block">
                              한국어 제품명 (Korean Product Name)
                            </label>
                            <input
                              type="text"
                              lang="ko"
                              placeholder="예: SDY 로열 방음 원목 도어"
                              value={productForm.ProductName_KO || ''}
                              onChange={(e) => setProductForm(prev => ({ ...prev, ProductName_KO: e.target.value }))}
                              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-blue-200 dark:border-blue-800 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#0A4DA3] dark:text-[#1E88E5] uppercase block">
                              제품 요약 (Korean Short Description)
                            </label>
                            <input
                              type="text"
                              lang="ko"
                              placeholder="예: 최고급 원목 소재와 음향 방음 기술이 적용된 고급 원목 도어..."
                              value={productForm.shortDescriptionKO || ''}
                              onChange={(e) => setProductForm(prev => ({ ...prev, shortDescriptionKO: e.target.value }))}
                              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-blue-200 dark:border-blue-800 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#0A4DA3] dark:text-[#1E88E5] uppercase block">
                              한국어 상세 설명 (Korean Detailed Description)
                            </label>
                            <textarea
                              lang="ko"
                              placeholder="제품의 기술 사양, 마감재 옵션, 맞춤 제작 안내..."
                              rows={3}
                              value={productForm.Description_KO || productForm.longDescriptionKO || ''}
                              onChange={(e) => setProductForm(prev => ({ ...prev, Description_KO: e.target.value, longDescriptionKO: e.target.value }))}
                              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-blue-200 dark:border-blue-800 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            ></textarea>
                          </div>
                        </div>
                      )}

                      {/* General Settings Section */}
                      <div className="pt-2">
                        <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 pb-2 border-b border-black/5 dark:border-white/5 mb-3">
                          General Settings & Technical Specifications
                        </h5>

                        {/* Pricing & Promotional Badge Section */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-3.5 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200/50 dark:border-amber-900/30 mb-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase block">
                              Selling Price (តម្លៃលក់)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. $350 or From $280/sqm"
                              value={productForm.price || ''}
                              onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-amber-200 dark:border-amber-800 text-[#101828] dark:text-white focus:outline-none font-bold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase block">
                              Original Price (Strikethrough)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. $450"
                              value={productForm.originalPrice || ''}
                              onChange={(e) => setProductForm(prev => ({ ...prev, originalPrice: e.target.value }))}
                              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-amber-200 dark:border-amber-800 text-[#101828] dark:text-white focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase block">
                              Promo Badge / Tag
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. PROMO 15% OFF, BEST SELLER"
                              value={productForm.promotionTag || ''}
                              onChange={(e) => setProductForm(prev => ({ ...prev, promotionTag: e.target.value }))}
                              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-amber-200 dark:border-amber-800 text-[#101828] dark:text-white focus:outline-none"
                            />
                          </div>
                          <div className="flex items-center space-x-2 pt-5">
                            <input
                              type="checkbox"
                              id="isPromotionalCheck"
                              checked={!!productForm.isPromotional}
                              onChange={(e) => setProductForm(prev => ({ ...prev, isPromotional: e.target.checked }))}
                              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                            />
                            <label htmlFor="isPromotionalCheck" className="text-xs font-bold text-amber-800 dark:text-amber-300 cursor-pointer">
                              Promotional Item
                            </label>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase block">{t('admin.key_materials_label', 'Key Materials')}</label>
                            <input
                              type="text"
                              placeholder="e.g. Teak Wood, Mineral Acoustic Core"
                              value={productForm.material}
                              onChange={(e) => setProductForm(prev => ({ ...prev, material: e.target.value }))}
                              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-black/5 dark:border-white/5 text-[#101828] dark:text-white focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase block">{t('admin.technical_dimensions_label', 'Technical Dimensions')}</label>
                            <input
                              type="text"
                              placeholder="e.g. 1200 x 2400 x 50 mm"
                              value={productForm.size}
                              onChange={(e) => setProductForm(prev => ({ ...prev, size: e.target.value }))}
                              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-black/5 dark:border-white/5 text-[#101828] dark:text-white focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#0A4DA3] dark:text-[#1E88E5] uppercase block">
                              PDF Specification File URL
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. https://drive.google.com/... (pdf_spec_url)"
                              value={productForm.pdf_spec_url || productForm.pdfUrl || ''}
                              onChange={(e) => setProductForm(prev => ({ ...prev, pdf_spec_url: e.target.value, pdfUrl: e.target.value }))}
                              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-black/10 dark:border-white/10 text-[#101828] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A4DA3]"
                            />
                          </div>
                        </div>

                        {/* File Upload Direct to Google Drive */}
                        <div className="p-4 rounded-xl border border-dashed border-black/10 dark:border-white/10 bg-white/40 dark:bg-black/10 space-y-3 mb-4">
                          <div className="flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold block">{t('admin.asset_drive_uploader', 'Asset Google Drive Uploader')}</span>
                              <span className="text-[10px] text-[#101828]/50 dark:text-white/50">{t('admin.auto_saves_drive_desc', "Auto-saves image and specification PDF files to Drive.")}</span>
                            </div>
                            <ImageIcon className="w-5 h-5 text-[#1E88E5]" />
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 block uppercase">{t('admin.product_feature_image', 'Product Feature Image')}</label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleDriveFileUpload(e, 'image', (url) => setProductForm(prev => ({ ...prev, image: url })), productForm.id)}
                                className="text-xs text-[#101828]/60 dark:text-white/60"
                              />
                              {isUploading.image && <Loader2 className="w-4 h-4 animate-spin text-[#0A4DA3] mt-1" />}
                              {productForm.image && (
                                <img src={productForm.image} alt="Feature Preview" className="h-16 w-16 object-cover rounded mt-2 border" referrerPolicy="no-referrer" />
                              )}
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 block uppercase">{t('admin.upload_pdf_catalog', 'Upload PDF Catalog')}</label>
                              <input
                                type="file"
                                accept="application/pdf"
                                onChange={(e) => handleDriveFileUpload(e, 'pdf', (url) => setProductForm(prev => ({ ...prev, pdfUrl: url, pdf_spec_url: url })), productForm.id)}
                                className="text-xs text-[#101828]/60 dark:text-white/60"
                              />
                              {isUploading.pdf && <Loader2 className="w-4 h-4 animate-spin text-[#0A4DA3] mt-1" />}
                              {productForm.pdfUrl && productForm.pdfUrl !== '#' && (
                                <p className="text-[10px] text-green-500 font-bold mt-1">{t('admin.pdf_uploaded_success', '✓ PDF catalog uploaded to cloud')}</p>
                              )}
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-[#0A4DA3] dark:text-[#1E88E5] block uppercase">Upload PDF Spec (.pdf)</label>
                              <input
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={(e) => handleDriveFileUpload(e, 'pdf_spec', (url) => setProductForm(prev => ({ ...prev, pdf_spec_url: url })), productForm.id)}
                                className="text-xs text-[#101828]/60 dark:text-white/60"
                              />
                              {isUploading.pdf_spec && <Loader2 className="w-4 h-4 animate-spin text-[#0A4DA3] mt-1" />}
                              {productForm.pdf_spec_url && (
                                <p className="text-[10px] text-green-500 font-bold mt-1">✓ PDF Spec linked</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1 mb-4">
                          <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase block">{t('admin.engineering_specifications', 'Engineering Specifications')}</label>
                          <textarea
                            placeholder="e.g. UL 10C certified, Sound reduction coefficient STC-45..."
                            rows={2}
                            value={productForm.specification}
                            onChange={(e) => setProductForm(prev => ({ ...prev, specification: e.target.value }))}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-black/5 dark:border-white/5 text-[#101828] dark:text-white focus:outline-none"
                          ></textarea>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase block">{t('admin.gallery_comma_separated', 'Gallery (Comma separated URLs / Google Drive File IDs)')}</label>
                        <input
                          type="text"
                          placeholder="https://drive.google.com/..., https://drive.google.com/..."
                          value={productForm.gallery}
                          onChange={(e) => setProductForm(prev => ({ ...prev, gallery: e.target.value }))}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-black/5 dark:border-white/5 text-[#101828] dark:text-white focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSyncing}
                        className="px-5 py-2.5 bg-[#0A4DA3] hover:bg-[#1E88E5] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center gap-1.5 shadow-md"
                      >
                        <Save className="w-4 h-4" /> {t('admin.save_product_record', 'Save Product Record')}
                      </button>
                    </form>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5">
                      <h3 className="font-bold text-lg text-[#101828] dark:text-white">{t('admin.active_product_registries', 'Active Product Registries')}</h3>
                      <button
                        onClick={() => {
                          setIsAddingProduct(true);
                          setEditingProduct(null);
                          setProductForm({
                            id: '',
                            name: '',
                            category: 'Doors & Windows',
                            collection: '',
                            language: 'en',
                            revision: 'REV-2026.01',
                            image: '',
                            gallery: '',
                            description: '',
                            specification: '',
                            material: '',
                            size: '',
                            pdfUrl: '#',
                            pdf_spec_url: '',
                            price: '',
                            originalPrice: '',
                            promotionTag: '',
                            isPromotional: false,
                            
                            ProductName_EN: '',
                            ProductName_KH: '',
                            ProductName_KO: '',
                            Description_EN: '',
                            Description_KH: '',
                            Description_KO: '',
                            shortDescriptionEN: '',
                            shortDescriptionKH: '',
                            shortDescriptionKO: '',
                            longDescriptionEN: '',
                            longDescriptionKH: '',
                            longDescriptionKO: '',
                            
                            construction: '',
                            finish: '',
                            customSize: '',
                            weight: '',
                            fireRating: '',
                            acousticRating: '',
                            warranty: '',
                            productFeatures: '',
                            technicalNotes: '',
                            specificationTable: '',
                            
                            galleryImage1: '',
                            galleryImage2: '',
                            galleryImage3: '',
                            galleryImage4: '',
                            technicalDrawing: '',
                            crossSectionDrawing: '',
                            dimensionDrawing: '',
                            installationDrawing: '',
                            
                            cert_iso: false,
                            cert_ul: false,
                            cert_astm: false,
                            cert_fireRated: false,
                            cert_acousticTested: false,
                            cert_ce: false,
                            cert_fsc: false,
                            
                            app_residential: false,
                            app_apartment: false,
                            app_hotel: false,
                            app_office: false,
                            app_hospital: false,
                            app_school: false,
                            app_luxuryVilla: false,
                            app_commercial: false,
                            app_retail: false,
                            app_airport: false,
                            app_shoppingMall: false
                          });
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0A4DA3] hover:bg-[#1E88E5] text-white text-[11px] font-bold uppercase tracking-wider shadow-md"
                      >
                        <Plus className="w-4 h-4" /> {t('admin.add_product', 'Add Product')}
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-black/10 dark:border-white/10 bg-slate-100/90 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 uppercase font-bold text-xs sm:text-sm tracking-wider">
                            <th className="px-4 py-3">{t('admin.table_item_name', 'Item Name')}</th>
                            <th className="px-4 py-3">{t('admin.table_category', 'Category')}</th>
                            <th className="px-4 py-3">{t('admin.table_dimensions', 'Dimensions')}</th>
                            <th className="px-4 py-3">Catalog PDF</th>
                            <th className="px-4 py-3">PDF Compiler</th>
                            <th className="px-4 py-3 text-right">{t('admin.table_actions', 'Actions')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 dark:divide-white/5 text-sm sm:text-base">
                          {productsList.map((prod) => (
                            <tr key={prod.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                              <td className="px-4 py-3.5 font-semibold text-[#101828] dark:text-white">
                                <div className="flex items-center gap-3">
                                  <img src={prod.image || null} alt={prod.name} className="w-9 h-9 object-cover rounded-lg shadow-sm" referrerPolicy="no-referrer" />
                                  <div className="flex flex-col">
                                    <span className="font-bold text-sm sm:text-base">{prod.name}</span>
                                    <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">{prod.id}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3.5 font-semibold text-[#0A4DA3] dark:text-[#1E88E5] text-sm sm:text-base">
                                {prod.category === "Doors & Windows" ? t('products.cat_doors_windows', 'Doors & Windows') :
                                 prod.category === "Wardrobes & Cabinets" ? t('products.cat_wardrobes_cabinets', 'Wardrobes & Cabinets') :
                                 prod.category === "Millwork & Cladding" ? t('products.cat_millwork_cladding', 'Millwork & Cladding') :
                                 prod.category === "Fitted Kitchens" ? t('products.cat_fitted_kitchens', 'Fitted Kitchens') :
                                 prod.category === "Executive Desks" ? t('products.cat_executive_desks', 'Executive Desks') :
                                 prod.category === "Commercial Ceiling" ? t('products.cat_commercial_ceiling', 'Commercial Ceiling') :
                                 prod.category === "Custom Furnishings" ? t('products.cat_custom_furnishings', 'Custom Furnishings') :
                                 prod.category}
                              </td>
                              <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 text-sm sm:text-base">{prod.size}</td>
                              <td className="py-3">
                                <div className="flex flex-col gap-0.5">
                                  {prod.pdfUrl && prod.pdfUrl !== '#' && prod.pdfUrl.trim() !== '' ? (
                                    <a
                                      href={getGoogleDriveViewUrl(prod.pdfUrl) || prod.pdfUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => {
                                        const cleanUrl = (prod.pdfUrl || '').trim();
                                        if (!cleanUrl || cleanUrl === '#' || cleanUrl === '/') {
                                          e.preventDefault();
                                          handlePreviewPdf(prod);
                                        }
                                      }}
                                      className="inline-flex items-center gap-1 text-xs text-[#0A4DA3] dark:text-[#1E88E5] font-bold hover:underline cursor-pointer"
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                      <span>View PDF</span>
                                    </a>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handlePreviewPdf(prod)}
                                      className="inline-flex items-center gap-1 text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 hover:bg-amber-500/25 transition-colors rounded font-bold uppercase tracking-wide w-max cursor-pointer"
                                      title="Click to generate and view PDF specification"
                                    >
                                      <FileText className="w-2.5 h-2.5" />
                                      <span>View PDF</span>
                                    </button>
                                  )}
                                  
                                  {prod.pdfVersions && prod.pdfVersions.length > 0 && (
                                    <button
                                      onClick={() => {
                                        setSelectedProductVersions(prod);
                                        setShowVersionsModal(true);
                                      }}
                                      className="inline-flex items-center gap-1 text-[9px] text-[#101828]/50 dark:text-white/40 hover:text-[#0A4DA3] hover:underline"
                                    >
                                      <History className="w-2.5 h-2.5" />
                                      <span>{prod.pdfVersions.length} Releases</span>
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="py-3">
                                <div className="flex items-center gap-1.5">
                                  {/* Preview */}
                                  <button
                                    onClick={() => handlePreviewPdf(prod)}
                                    className="p-1 text-gray-500 hover:text-[#0A4DA3] hover:bg-[#0A4DA3]/10 rounded transition-colors"
                                    title="Live Preview Catalog"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Download */}
                                  <button
                                    onClick={() => handleDownloadPdfDirect(prod)}
                                    className="p-1 text-gray-500 hover:text-green-500 hover:bg-green-500/10 rounded transition-colors"
                                    title="Direct Download Brochure"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Regenerate & Drive Backup */}
                                  <button
                                    onClick={() => handleRegenerateProductPdf(prod)}
                                    disabled={isSyncing}
                                    className="p-1 text-gray-500 hover:text-indigo-500 hover:bg-indigo-500/10 rounded transition-colors disabled:opacity-50"
                                    title="Regenerate & Auto-Sync to Drive"
                                  >
                                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                                  </button>

                                  {/* Delete PDF Link */}
                                  {prod.pdfUrl && prod.pdfUrl !== '#' && (
                                    <button
                                      onClick={() => handleDeletePdfLink(prod)}
                                      className="p-1 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                      title="Delete Link"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 text-right space-x-1">
                                <button
                                  onClick={() => {
                                    setEditingProduct(prod);
                                    setProductForm({
                                      id: prod.id || '',
                                      name: prod.name,
                                      price: prod.price || '',
                                      originalPrice: prod.originalPrice || '',
                                      promotionTag: prod.promotionTag || '',
                                      isPromotional: !!prod.isPromotional,
                                      category: prod.category,
                                      collection: prod.collection || '',
                                      language: prod.language || 'en',
                                      revision: prod.revision || 'REV-2026.01',
                                      image: prod.image,
                                      gallery: prod.gallery ? prod.gallery.join(', ') : '',
                                      description: prod.description || '',
                                      specification: prod.specification || '',
                                      material: prod.material || '',
                                      size: prod.size || '',
                                      pdfUrl: prod.pdfUrl || '#',
                                      pdf_spec_url: prod.pdf_spec_url || '',
                                      
                                      ProductName_EN: prod.ProductName_EN || prod.name || '',
                                      ProductName_KH: prod.ProductName_KH || '',
                                      ProductName_KO: prod.ProductName_KO || '',
                                      Description_EN: prod.Description_EN || prod.description || '',
                                      Description_KH: prod.Description_KH || '',
                                      Description_KO: prod.Description_KO || '',
                                      shortDescriptionEN: prod.shortDescriptionEN || '',
                                      shortDescriptionKH: prod.shortDescriptionKH || '',
                                      shortDescriptionKO: prod.shortDescriptionKO || '',
                                      longDescriptionEN: prod.longDescriptionEN || '',
                                      longDescriptionKH: prod.longDescriptionKH || '',
                                      longDescriptionKO: prod.longDescriptionKO || '',
                                      
                                      construction: prod.construction || '',
                                      finish: prod.finish || '',
                                      customSize: prod.customSize || '',
                                      weight: prod.weight || '',
                                      fireRating: prod.fireRating || '',
                                      acousticRating: prod.acousticRating || '',
                                      warranty: prod.warranty || '',
                                      productFeatures: prod.productFeatures || '',
                                      technicalNotes: prod.technicalNotes || '',
                                      specificationTable: prod.specificationTable || '',
                                      
                                      galleryImage1: prod.galleryImage1 || '',
                                      galleryImage2: prod.galleryImage2 || '',
                                      galleryImage3: prod.galleryImage3 || '',
                                      galleryImage4: prod.galleryImage4 || '',
                                      technicalDrawing: prod.technicalDrawing || '',
                                      crossSectionDrawing: prod.crossSectionDrawing || '',
                                      dimensionDrawing: prod.dimensionDrawing || '',
                                      installationDrawing: prod.installationDrawing || '',
                                      
                                      cert_iso: prod.certificates?.iso || false,
                                      cert_ul: prod.certificates?.ul || false,
                                      cert_astm: prod.certificates?.astm || false,
                                      cert_fireRated: prod.certificates?.fireRated || false,
                                      cert_acousticTested: prod.certificates?.acousticTested || false,
                                      cert_ce: prod.certificates?.ce || false,
                                      cert_fsc: prod.certificates?.fsc || false,
                                      
                                      app_residential: prod.applications?.residential || false,
                                      app_apartment: prod.applications?.apartment || false,
                                      app_hotel: prod.applications?.hotel || false,
                                      app_office: prod.applications?.office || false,
                                      app_hospital: prod.applications?.hospital || false,
                                      app_school: prod.applications?.school || false,
                                      app_luxuryVilla: prod.applications?.luxuryVilla || false,
                                      app_commercial: prod.applications?.commercial || false,
                                      app_retail: prod.applications?.retail || false,
                                      app_airport: prod.applications?.airport || false,
                                      app_shoppingMall: prod.applications?.shoppingMall || false
                                    });
                                  }}
                                  className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/25 rounded"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(prod.id)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/25 rounded"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 3. PROJECT DATABASE VIEW */}
            {activeTab === 'projects' && (
              <div className="space-y-6">
                
                {isAddingProject || editingProject ? (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5">
                      <h4 className="font-bold text-[#101828] dark:text-white">
                        {editingProject 
                          ? `${t('admin.edit_showcase_project', 'Edit Showcase Project:')} ${editingProject.title}` 
                          : t('admin.publish_new_project', 'Publish New Showcase Project')}
                      </h4>
                      <button
                        onClick={() => { setIsAddingProject(false); setEditingProject(null); }}
                        className="px-3 py-1 bg-gray-200 dark:bg-zinc-800 text-[#101828] dark:text-white text-xs font-bold rounded-lg"
                      >
                        {t('admin.cancel', 'Cancel')}
                      </button>
                    </div>

                    <form onSubmit={handleSaveProject} className="space-y-5">
                      {/* Global Category Selector */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase block">{t('admin.showcase_category_label', 'Showcase Category')}</label>
                          <select
                            value={projectForm.category}
                            onChange={(e) => setProjectForm(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-black/10 dark:border-white/10 text-[#101828] dark:text-white focus:outline-none"
                          >
                            <option value="Commercial Fit-Out">{t('projects.cat_commercial_fit_out', 'Commercial Fit-Out')}</option>
                            <option value="Structural Steel">{t('projects.cat_structural_steel', 'Structural Steel')}</option>
                            <option value="Bespoke Millwork">{t('projects.cat_bespoke_millwork', 'Bespoke Millwork')}</option>
                            <option value="Residential Construction">{t('projects.cat_residential_construction', 'Residential Construction')}</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase block">Client / Developer Name</label>
                          <input
                            type="text"
                            placeholder="e.g. ABA Bank / Chip Mong Group"
                            value={projectForm.client || ''}
                            onChange={(e) => setProjectForm(prev => ({ ...prev, client: e.target.value }))}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-black/10 dark:border-white/10 text-[#101828] dark:text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Tabbed Trilingual Content Switcher Bar */}
                      <div className="bg-slate-100 dark:bg-slate-800/80 p-2 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-inner">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 px-2 pb-1.5 uppercase tracking-wider">
                          <span>{t('admin.trilingual_editor', 'Trilingual Language Content')}</span>
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                            {projectFormLang === 'km' ? '🇰🇭 Khmer Active' : projectFormLang === 'en' ? '🇬🇧 English Active' : '🇰🇷 Korean Active'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => { setProjectFormLang('km'); setLanguage('km'); }}
                            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                              projectFormLang === 'km'
                                ? 'bg-white dark:bg-[#101828] text-[#0A4DA3] dark:text-[#1E88E5] shadow-md border border-blue-300 dark:border-blue-700 font-extrabold'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            <span className="text-base">🇰🇭</span>
                            <span>Khmer (ខ្មែរ)</span>
                            {projectForm.Title_KH && <span className="w-2 h-2 rounded-full bg-emerald-500" title="Filled" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setProjectFormLang('en'); setLanguage('en'); }}
                            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                              projectFormLang === 'en'
                                ? 'bg-white dark:bg-[#101828] text-[#0A4DA3] dark:text-[#1E88E5] shadow-md border border-blue-300 dark:border-blue-700 font-extrabold'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            <span className="text-base">🇬🇧</span>
                            <span>English</span>
                            {(projectForm.Title_EN || projectForm.title) && <span className="w-2 h-2 rounded-full bg-emerald-500" title="Filled" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setProjectFormLang('ko'); setLanguage('ko'); }}
                            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                              projectFormLang === 'ko'
                                ? 'bg-white dark:bg-[#101828] text-[#0A4DA3] dark:text-[#1E88E5] shadow-md border border-blue-300 dark:border-blue-700 font-extrabold'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            <span className="text-base">🇰🇷</span>
                            <span>Korean (한국어)</span>
                            {projectForm.Title_KO && <span className="w-2 h-2 rounded-full bg-emerald-500" title="Filled" />}
                          </button>
                        </div>
                      </div>

                      {/* Language Specific Content Panel */}
                      {projectFormLang === 'km' && (
                        <div className="p-4 bg-blue-50/40 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/40 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#0A4DA3] dark:text-[#1E88E5]">
                            <span>🇰🇭</span>
                            <span>ព័ត៌មានគម្រោងជាភាសាខ្មែរ (Khmer Project Information)</span>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#0A4DA3] dark:text-[#1E88E5] uppercase block">
                              ចំណងជើងគម្រោងជាភាសាខ្មែរ (Khmer Project Title)
                            </label>
                            <input
                              type="text"
                              lang="km"
                              placeholder="ឧ. គម្រោងដំឡើងគ្រឿងសង្ហារិមការិយាល័យកណ្ដាល ធនាគារ ABA"
                              value={projectForm.Title_KH || ''}
                              onChange={(e) => setProjectForm(prev => ({ ...prev, Title_KH: e.target.value }))}
                              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-blue-200 dark:border-blue-800 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#0A4DA3] dark:text-[#1E88E5] uppercase block">
                              ការពិពណ៌នាគម្រោងជាភាសាខ្មែរ (Khmer Project Description)
                            </label>
                            <textarea
                              lang="km"
                              placeholder="ព័ត៌មានលម្អិតអំពីការរចនា និងការដំឡើងគ្រឿងសង្ហារិម..."
                              rows={3}
                              value={projectForm.Description_KH || ''}
                              onChange={(e) => setProjectForm(prev => ({ ...prev, Description_KH: e.target.value }))}
                              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-blue-200 dark:border-blue-800 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            ></textarea>
                          </div>
                        </div>
                      )}

                      {projectFormLang === 'en' && (
                        <div className="p-4 bg-blue-50/40 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/40 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#0A4DA3] dark:text-[#1E88E5]">
                            <span>🇬🇧</span>
                            <span>English Project Information</span>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#0A4DA3] dark:text-[#1E88E5] uppercase block">
                              English Project Title *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. ABA Bank Headquarters Interior Fit-Out"
                              value={projectForm.Title_EN || projectForm.title || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setProjectForm(prev => ({ ...prev, Title_EN: val, title: val }));
                              }}
                              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-blue-200 dark:border-blue-800 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#0A4DA3] dark:text-[#1E88E5] uppercase block">
                              English Project Description
                            </label>
                            <textarea
                              placeholder="Provide details of spatial design, millwork engineering tolerances, project challenges..."
                              rows={3}
                              value={projectForm.Description_EN || projectForm.description || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setProjectForm(prev => ({ ...prev, Description_EN: val, description: val }));
                              }}
                              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-blue-200 dark:border-blue-800 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            ></textarea>
                          </div>
                        </div>
                      )}

                      {projectFormLang === 'ko' && (
                        <div className="p-4 bg-blue-50/40 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/40 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#0A4DA3] dark:text-[#1E88E5]">
                            <span>🇰🇷</span>
                            <span>한국어 프로젝트 정보 (Korean Project Information)</span>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#0A4DA3] dark:text-[#1E88E5] uppercase block">
                              한국어 프로젝트 제목 (Korean Project Title)
                            </label>
                            <input
                              type="text"
                              lang="ko"
                              placeholder="예: ABA 은행 본사 인테리어 시공 젝트"
                              value={projectForm.Title_KO || ''}
                              onChange={(e) => setProjectForm(prev => ({ ...prev, Title_KO: e.target.value }))}
                              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-blue-200 dark:border-blue-800 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#0A4DA3] dark:text-[#1E88E5] uppercase block">
                              한국어 프로젝트 설명 (Korean Project Description)
                            </label>
                            <textarea
                              lang="ko"
                              placeholder="공간 설계, 원목가구 공학 공차, 프로젝트 특징 안내..."
                              rows={3}
                              value={projectForm.Description_KO || ''}
                              onChange={(e) => setProjectForm(prev => ({ ...prev, Description_KO: e.target.value }))}
                              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-blue-200 dark:border-blue-800 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            ></textarea>
                          </div>
                        </div>
                      )}

                      {/* General Settings Section */}
                      <div className="pt-2">
                        <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 pb-2 border-b border-black/5 dark:border-white/5 mb-3">
                          Project Specifications & Media Assets
                        </h5>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase block">{t('admin.geographical_location_label', 'Geographical Location')}</label>
                            <input
                              type="text"
                              placeholder="e.g. Phnom Penh, Cambodia"
                              value={projectForm.location}
                              onChange={(e) => setProjectForm(prev => ({ ...prev, location: e.target.value }))}
                              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-black/10 dark:border-white/10 text-[#101828] dark:text-white focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase block">{t('admin.surface_area_label', 'Surface Area (sqm)')}</label>
                            <input
                              type="text"
                              placeholder="e.g. 1,200 sqm"
                              value={projectForm.area}
                              onChange={(e) => setProjectForm(prev => ({ ...prev, area: e.target.value }))}
                              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-black/10 dark:border-white/10 text-[#101828] dark:text-white focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase block">{t('admin.completion_year_label', 'Completion Year')}</label>
                            <input
                              type="text"
                              placeholder="e.g. 2026"
                              value={projectForm.completionYear}
                              onChange={(e) => setProjectForm(prev => ({ ...prev, completionYear: e.target.value }))}
                              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-black/10 dark:border-white/10 text-[#101828] dark:text-white focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase block">{t('admin.construction_details_label', 'Construction Details')}</label>
                            <input
                              type="text"
                              placeholder="e.g. Heavy Joinery, CNC Trussing"
                              value={projectForm.constructionType}
                              onChange={(e) => setProjectForm(prev => ({ ...prev, constructionType: e.target.value }))}
                              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-black/10 dark:border-white/10 text-[#101828] dark:text-white focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* File Upload to Google Drive */}
                        <div className="p-4 rounded-xl border border-dashed border-black/10 dark:border-white/10 bg-white/40 dark:bg-black/10 space-y-3 mb-4">
                          <div className="flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold block">{t('admin.gallery_drive_uploader', 'Gallery Google Drive Uploader')}</span>
                              <span className="text-[10px] text-[#101828]/50 dark:text-white/50">{t('admin.gallery_drive_uploader_desc', "Saves images directly to Google Drive 'SDY_Assets' folder.")}</span>
                            </div>
                            <ImageIcon className="w-5 h-5 text-[#1E88E5]" />
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 block uppercase">{t('admin.project_cover_image', 'Project Cover Image')}</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleDriveFileUpload(e, 'proj_cover', (url) => setProjectForm(prev => ({ ...prev, coverImage: url })), projectForm.id)}
                              className="text-xs text-[#101828]/60 dark:text-white/60"
                            />
                            {isUploading.proj_cover && <Loader2 className="w-4 h-4 animate-spin text-[#0A4DA3] mt-1" />}
                            {projectForm.coverImage && (
                              <img src={projectForm.coverImage} alt="Cover Preview" className="h-16 w-32 object-cover rounded mt-2 border" referrerPolicy="no-referrer" />
                            )}
                          </div>
                        </div>

                        <div className="space-y-1 mb-4">
                          <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase block">{t('admin.additional_gallery_images', 'Additional Gallery Images (Comma separated URLs / Google Drive File IDs)')}</label>
                          <input
                            type="text"
                            placeholder="https://drive.google.com/..., https://drive.google.com/..."
                            value={projectForm.gallery}
                            onChange={(e) => setProjectForm(prev => ({ ...prev, gallery: e.target.value }))}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-black/10 dark:border-white/10 text-[#101828] dark:text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSyncing}
                        className="px-5 py-2.5 bg-[#0A4DA3] hover:bg-[#1E88E5] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center gap-1.5 shadow-md"
                      >
                        <Save className="w-4 h-4" /> {t('admin.save_project_showcase', 'Save Project Showcase')}
                      </button>
                    </form>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5">
                      <h3 className="font-bold text-lg text-[#101828] dark:text-white">{t('admin.active_projects_showcase', 'Active Projects Showcase')}</h3>
                      <button
                        onClick={() => {
                          setIsAddingProject(true);
                          setProjectForm({
                            title: '',
                            category: 'Commercial Fit-Out',
                            coverImage: '',
                            gallery: '',
                            location: '',
                            area: '',
                            completionYear: '',
                            description: '',
                            constructionType: '',
                            client: '',
                            Title_EN: '',
                            Title_KH: '',
                            Title_KO: '',
                            Description_EN: '',
                            Description_KH: '',
                            Description_KO: ''
                          });
                          setProjectFormLang('en');
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0A4DA3] hover:bg-[#1E88E5] text-white text-[10px] font-bold uppercase tracking-wider shadow-md"
                      >
                        <Plus className="w-3.5 h-3.5" /> {t('admin.add_project', 'Add Project')}
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-black/10 dark:border-white/10 bg-slate-100/90 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 uppercase font-bold text-xs sm:text-sm tracking-wider">
                            <th className="px-4 py-3">{t('admin.table_project_title', 'Project Title')}</th>
                            <th className="px-4 py-3">{t('admin.table_geographical_location', 'Geographical Location')}</th>
                            <th className="px-4 py-3">{t('admin.table_surface_area', 'Surface Area')}</th>
                            <th className="px-4 py-3">{t('admin.table_completion_year', 'Completion Year')}</th>
                            <th className="px-4 py-3 text-right">{t('admin.table_actions', 'Actions')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 dark:divide-white/5 text-sm sm:text-base">
                          {projectsList.map((proj) => (
                            <tr key={proj.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                              <td className="px-4 py-3.5 font-semibold text-[#101828] dark:text-white">
                                <div className="flex items-center gap-3">
                                  <img src={proj.coverImage || null} alt={proj.title} className="w-9 h-9 object-cover rounded-lg shadow-sm" referrerPolicy="no-referrer" />
                                  <span className="font-bold text-sm sm:text-base">{proj.title}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 text-sm sm:text-base">{proj.location}</td>
                              <td className="px-4 py-3.5 text-[#0A4DA3] dark:text-[#1E88E5] font-bold text-sm sm:text-base">{proj.area}</td>
                              <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 text-sm sm:text-base">{proj.completionYear}</td>
                              <td className="px-4 py-3.5 text-right space-x-1">
                                <button
                                  onClick={() => {
                                    setEditingProject(proj);
                                    setProjectForm({
                                      title: proj.title,
                                      category: proj.category,
                                      coverImage: proj.coverImage,
                                      gallery: proj.gallery ? proj.gallery.join(', ') : '',
                                      location: proj.location || '',
                                      area: proj.area || '',
                                      completionYear: proj.completionYear || '',
                                      description: proj.description || '',
                                      constructionType: proj.constructionType || '',
                                      client: proj.client || '',
                                      Title_EN: proj.Title_EN || proj.title || '',
                                      Title_KH: proj.Title_KH || '',
                                      Title_KO: proj.Title_KO || '',
                                      Description_EN: proj.Description_EN || proj.description || '',
                                      Description_KH: proj.Description_KH || '',
                                      Description_KO: proj.Description_KO || ''
                                    });
                                  }}
                                  className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/25 rounded"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProject(proj.id)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/25 rounded"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 4. TECHNICAL BLOGS CRUD */}
            {activeTab === 'blogs' && (
              <div className="space-y-6">
                {isAddingBlog || editingBlog ? (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5">
                      <h4 className="font-bold text-[#101828] dark:text-white">
                        {editingBlog 
                          ? `${t('admin.edit_technical_blog', 'Edit Technical Blog:')} ${editingBlog.title}` 
                          : t('admin.publish_new_blog', 'Publish New Technical Blog Post')}
                      </h4>
                      <button
                        onClick={() => { setIsAddingBlog(false); setEditingBlog(null); }}
                        className="px-3 py-1 bg-gray-200 dark:bg-zinc-800 text-[#101828] dark:text-white text-xs font-bold rounded-lg"
                      >
                        {t('admin.cancel', 'Cancel')}
                      </button>
                    </div>

                    <form onSubmit={handleSaveBlog} className="space-y-5">
                      {/* Global Category & Author Controls */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase block">{t('admin.article_category_label', 'Article Category')}</label>
                          <select
                            value={blogForm.category}
                            onChange={(e) => setBlogForm(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-black/10 dark:border-white/10 text-[#101828] dark:text-white focus:outline-none"
                          >
                            <option value="General Insights">{t('blogs.cat_general_insights', 'General Insights')}</option>
                            <option value="Building Code & Directives">{t('blogs.cat_building_code_directives', 'Building Code & Directives')}</option>
                            <option value="Material Engineering">{t('blogs.cat_material_engineering', 'Material Engineering')}</option>
                            <option value="Corporate Updates">{t('blogs.cat_corporate_updates', 'Corporate Updates')}</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase block">{t('admin.author_label', 'Author')}</label>
                          <input
                            type="text"
                            value={blogForm.author}
                            onChange={(e) => setBlogForm(prev => ({ ...prev, author: e.target.value }))}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-black/10 dark:border-white/10 text-[#101828] dark:text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Tabbed Trilingual Content Switcher Bar */}
                      <div className="bg-slate-100 dark:bg-slate-800/80 p-2 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-inner">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 px-2 pb-1.5 uppercase tracking-wider">
                          <span>{t('admin.trilingual_editor', 'Trilingual Language Content')}</span>
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                            {blogFormLang === 'km' ? '🇰🇭 Khmer Active' : blogFormLang === 'en' ? '🇬🇧 English Active' : '🇰🇷 Korean Active'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => { setBlogFormLang('km'); setLanguage('km'); }}
                            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                              blogFormLang === 'km'
                                ? 'bg-white dark:bg-[#101828] text-[#0A4DA3] dark:text-[#1E88E5] shadow-md border border-blue-300 dark:border-blue-700 font-extrabold'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            <span className="text-base">🇰🇭</span>
                            <span>Khmer (ខ្មែរ)</span>
                            {blogForm.Title_KH && <span className="w-2 h-2 rounded-full bg-emerald-500" title="Filled" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setBlogFormLang('en'); setLanguage('en'); }}
                            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                              blogFormLang === 'en'
                                ? 'bg-white dark:bg-[#101828] text-[#0A4DA3] dark:text-[#1E88E5] shadow-md border border-blue-300 dark:border-blue-700 font-extrabold'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            <span className="text-base">🇬🇧</span>
                            <span>English</span>
                            {(blogForm.Title_EN || blogForm.title) && <span className="w-2 h-2 rounded-full bg-emerald-500" title="Filled" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setBlogFormLang('ko'); setLanguage('ko'); }}
                            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                              blogFormLang === 'ko'
                                ? 'bg-white dark:bg-[#101828] text-[#0A4DA3] dark:text-[#1E88E5] shadow-md border border-blue-300 dark:border-blue-700 font-extrabold'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            <span className="text-base">🇰🇷</span>
                            <span>Korean (한국어)</span>
                            {blogForm.Title_KO && <span className="w-2 h-2 rounded-full bg-emerald-500" title="Filled" />}
                          </button>
                        </div>
                      </div>

                      {/* Language Specific Content Panel */}
                      {blogFormLang === 'km' && (
                        <div className="p-4 bg-blue-50/40 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/40 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#0A4DA3] dark:text-[#1E88E5]">
                            <span>🇰🇭</span>
                            <span>ព័ត៌មានអត្ថបទជាភាសាខ្មែរ (Khmer Article Content)</span>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#0A4DA3] dark:text-[#1E88E5] uppercase block">
                              ចំណងជើងអត្ថបទជាភាសាខ្មែរ (Khmer Title)
                            </label>
                            <input
                              type="text"
                              lang="km"
                              placeholder="ចំណងជើងអត្ថបទបច្ចេកទេស..."
                              value={blogForm.Title_KH || ''}
                              onChange={(e) => setBlogForm(prev => ({ ...prev, Title_KH: e.target.value }))}
                              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-blue-200 dark:border-blue-800 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#0A4DA3] dark:text-[#1E88E5] uppercase block">
                              សង្ខេបអត្ថបទជាភាសាខ្មែរ (Khmer Excerpt)
                            </label>
                            <textarea
                              lang="km"
                              placeholder="សង្ខេបខ្លីៗ 1-2 ជួរ..."
                              rows={2}
                              value={blogForm.Excerpt_KH || ''}
                              onChange={(e) => setBlogForm(prev => ({ ...prev, Excerpt_KH: e.target.value }))}
                              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-blue-200 dark:border-blue-800 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            ></textarea>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#0A4DA3] dark:text-[#1E88E5] uppercase block">
                              ខ្លឹមសារលម្អិតជាភាសាខ្មែរ (Khmer Content)
                            </label>
                            <textarea
                              lang="km"
                              placeholder="សរសេរខ្លឹមសារបច្ចេកទេសលម្អិតនៅទីនេះ..."
                              rows={6}
                              value={blogForm.Content_KH || ''}
                              onChange={(e) => setBlogForm(prev => ({ ...prev, Content_KH: e.target.value }))}
                              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-blue-200 dark:border-blue-800 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            ></textarea>
                          </div>
                        </div>
                      )}

                      {blogFormLang === 'en' && (
                        <div className="p-4 bg-blue-50/40 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/40 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#0A4DA3] dark:text-[#1E88E5]">
                            <span>🇬🇧</span>
                            <span>English Article Content</span>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#0A4DA3] dark:text-[#1E88E5] uppercase block">
                              English Article Title *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Advancements in Dry Kiln Lumber Treatment in Cambodia"
                              value={blogForm.Title_EN || blogForm.title || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setBlogForm(prev => ({ ...prev, Title_EN: val, title: val }));
                              }}
                              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-blue-200 dark:border-blue-800 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#0A4DA3] dark:text-[#1E88E5] uppercase block">
                              English Article Excerpt
                            </label>
                            <textarea
                              placeholder="A quick 1-2 sentence description..."
                              rows={2}
                              value={blogForm.Excerpt_EN || blogForm.excerpt || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setBlogForm(prev => ({ ...prev, Excerpt_EN: val, excerpt: val }));
                              }}
                              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-blue-200 dark:border-blue-800 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            ></textarea>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#0A4DA3] dark:text-[#1E88E5] uppercase block">
                              English Detailed Content *
                            </label>
                            <textarea
                              required
                              placeholder="Write technical details here..."
                              rows={6}
                              value={blogForm.Content_EN || blogForm.content || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setBlogForm(prev => ({ ...prev, Content_EN: val, content: val }));
                              }}
                              className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-[#101828] border border-blue-200 dark:border-blue-800 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            ></textarea>
                          </div>
                        </div>
                      )}

                      {blogFormLang === 'ko' && (
                        <div className="p-4 bg-blue-50/40 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/40 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#0A4DA3] dark:text-[#1E88E5]">
                            <span>🇰🇷</span>
                            <span>한국어 기사 내용 (Korean Article Content)</span>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#0A4DA3] dark:text-[#1E88E5] uppercase block">
                              한국어 기사 제목 (Korean Title)
                            </label>
                            <input
                              type="text"
                              lang="ko"
                              placeholder="기사 제목을 입력하세요..."
                              value={blogForm.Title_KO || ''}
                              onChange={(e) => setBlogForm(prev => ({ ...prev, Title_KO: e.target.value }))}
                              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-blue-200 dark:border-blue-800 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#0A4DA3] dark:text-[#1E88E5] uppercase block">
                              한국어 요약문 (Korean Excerpt)
                            </label>
                            <textarea
                              lang="ko"
                              placeholder="1-2문장의 요약문..."
                              rows={2}
                              value={blogForm.Excerpt_KO || ''}
                              onChange={(e) => setBlogForm(prev => ({ ...prev, Excerpt_KO: e.target.value }))}
                              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-blue-200 dark:border-blue-800 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            ></textarea>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#0A4DA3] dark:text-[#1E88E5] uppercase block">
                              한국어 본문 내용 (Korean Content)
                            </label>
                            <textarea
                              lang="ko"
                              placeholder="기술 본문 내용을 작성하세요..."
                              rows={6}
                              value={blogForm.Content_KO || ''}
                              onChange={(e) => setBlogForm(prev => ({ ...prev, Content_KO: e.target.value }))}
                              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-blue-200 dark:border-blue-800 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            ></textarea>
                          </div>
                        </div>
                      )}

                      {/* General Settings Section */}
                      <div className="pt-2">
                        <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 pb-2 border-b border-black/5 dark:border-white/5 mb-3">
                          Featured Media Asset & Uploader
                        </h5>

                        <div className="p-4 rounded-xl border border-dashed border-black/10 dark:border-white/10 bg-white/40 dark:bg-black/10 space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold">{t('admin.feature_image_drive_uploader', 'Feature Image Drive Uploader')}</span>
                            <ImageIcon className="w-5 h-5 text-[#1E88E5]" />
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleDriveFileUpload(e, 'blog_img', (url) => setBlogForm(prev => ({ ...prev, image: url })), blogForm.id)}
                            className="text-xs text-[#101828]/60 dark:text-white/60"
                          />
                          {isUploading.blog_img && <Loader2 className="w-4 h-4 animate-spin text-[#0A4DA3] mt-1" />}
                          {blogForm.image && (
                            <img src={blogForm.image} alt="Blog Preview" className="h-16 w-28 object-cover rounded mt-2 border" referrerPolicy="no-referrer" />
                          )}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSyncing}
                        className="px-5 py-2.5 bg-[#0A4DA3] hover:bg-[#1E88E5] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center gap-1.5 shadow-md"
                      >
                        <Save className="w-4 h-4" /> {t('admin.save_technical_post', 'Save Technical Post')}
                      </button>
                    </form>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5">
                      <h3 className="font-bold text-lg text-[#101828] dark:text-white">{t('admin.active_news_technical_logs', 'Active News & Technical Logs')}</h3>
                      <button
                        onClick={() => {
                          setIsAddingBlog(true);
                          setBlogForm({
                            title: '',
                            excerpt: '',
                            content: '',
                            category: 'General Insights',
                            image: '',
                            author: 'Corporate Administrator',
                            Title_EN: '',
                            Title_KH: '',
                            Title_KO: '',
                            Excerpt_EN: '',
                            Excerpt_KH: '',
                            Excerpt_KO: '',
                            Content_EN: '',
                            Content_KH: '',
                            Content_KO: ''
                          });
                          setBlogFormLang('en');
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0A4DA3] hover:bg-[#1E88E5] text-white text-[10px] font-bold uppercase tracking-wider shadow-md"
                      >
                        <Plus className="w-3.5 h-3.5" /> {t('admin.publish_blog_post', 'Publish Blog Post')}
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-black/10 dark:border-white/10 bg-slate-100/90 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 uppercase font-bold text-xs sm:text-sm tracking-wider">
                            <th className="px-4 py-3">{t('admin.table_blog_title', 'Blog Title')}</th>
                            <th className="px-4 py-3">{t('admin.table_category', 'Category')}</th>
                            <th className="px-4 py-3">{t('admin.table_author', 'Author')}</th>
                            <th className="px-4 py-3">{t('admin.table_publish_date', 'Publish Date')}</th>
                            <th className="px-4 py-3 text-right">{t('admin.table_actions', 'Actions')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 dark:divide-white/5 text-sm sm:text-base">
                          {blogsList.map((blog) => (
                            <tr key={blog.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                              <td className="px-4 py-3.5 font-semibold text-[#101828] dark:text-white">
                                <div className="flex items-center gap-3">
                                  <img src={blog.image || null} alt={blog.title} className="w-9 h-9 object-cover rounded-lg shadow-sm" referrerPolicy="no-referrer" />
                                  <span className="font-bold text-sm sm:text-base truncate max-w-[280px]">{blog.title}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3.5 font-semibold text-[#0A4DA3] dark:text-[#1E88E5] text-sm sm:text-base">
                                {blog.category === "General Insights" ? t('blogs.cat_general_insights', 'General Insights') :
                                 blog.category === "Building Code & Directives" ? t('blogs.cat_building_code_directives', 'Building Code & Directives') :
                                 blog.category === "Material Engineering" ? t('blogs.cat_material_engineering', 'Material Engineering') :
                                 blog.category === "Corporate Updates" ? t('blogs.cat_corporate_updates', 'Corporate Updates') :
                                 blog.category}
                              </td>
                              <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 text-sm sm:text-base">{blog.author}</td>
                              <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 text-sm sm:text-base">{blog.date}</td>
                              <td className="px-4 py-3.5 text-right space-x-1">
                                <button
                                  onClick={() => {
                                    setEditingBlog(blog);
                                    setBlogForm({
                                      title: blog.title,
                                      excerpt: blog.excerpt || '',
                                      content: blog.content || '',
                                      category: blog.category || 'General Insights',
                                      image: blog.image,
                                      author: blog.author || 'Corporate Administrator',
                                      Title_EN: blog.Title_EN || blog.title || '',
                                      Title_KH: blog.Title_KH || '',
                                      Title_KO: blog.Title_KO || '',
                                      Excerpt_EN: blog.Excerpt_EN || blog.excerpt || '',
                                      Excerpt_KH: blog.Excerpt_KH || '',
                                      Excerpt_KO: blog.Excerpt_KO || '',
                                      Content_EN: blog.Content_EN || blog.content || '',
                                      Content_KH: blog.Content_KH || '',
                                      Content_KO: blog.Content_KO || ''
                                    });
                                  }}
                                  className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/25 rounded"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteBlog(blog.id)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/25 rounded"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 5. COMPANY DETAILS EDITING PANEL */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5">
                  <h3 className="font-bold text-lg text-[#101828] dark:text-white">{t('admin.corporate_coordinates_title', 'Corporate Coordinates Settings')}</h3>
                  <span className="text-[10px] bg-[#0A4DA3]/10 text-[#0A4DA3] dark:text-[#1E88E5] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">{t('admin.editable_profiles', 'Editable Profiles')}</span>
                </div>

                <form onSubmit={handleSaveCompanyInfo} className="space-y-5">
                  {/* Logo Upload & URL Control */}
                  <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#101828] dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-primary dark:text-accent" />
                        Company Brand Logo
                      </label>
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        Header & Footer Dynamic Sync
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <div className="md:col-span-2 space-y-2">
                        <input
                          type="text"
                          placeholder="Paste Logo Image URL (e.g. https://... or Base64 data:image/...)"
                          value={companyInfo.LogoUrl || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCompanyInfo(prev => ({ ...prev, LogoUrl: val }));
                            localStorage.setItem('sdy_custom_logo', val);
                            window.dispatchEvent(new Event('sdy_custom_logo_updated'));
                          }}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-black/10 dark:border-white/10 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                        />

                        <div className="flex items-center gap-3">
                          <label className="cursor-pointer px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-sm">
                            <ImageIcon className="w-3.5 h-3.5" />
                            Upload Logo Image File
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    const result = reader.result as string;
                                    setCompanyInfo(prev => ({ ...prev, LogoUrl: result }));
                                    localStorage.setItem('sdy_custom_logo', result);
                                    window.dispatchEvent(new Event('sdy_custom_logo_updated'));
                                    showToast('Custom logo uploaded & applied to website!');
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>

                          {companyInfo.LogoUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setCompanyInfo(prev => ({ ...prev, LogoUrl: '' }));
                                localStorage.removeItem('sdy_custom_logo');
                                window.dispatchEvent(new Event('sdy_custom_logo_updated'));
                                showToast('Reset to default SDY logo.');
                              }}
                              className="text-xs text-red-500 hover:underline font-semibold"
                            >
                              Reset to Default
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center p-2 bg-white dark:bg-[#101828] rounded-xl border border-black/10 dark:border-white/10">
                        <p className="text-[10px] text-black/50 dark:text-white/50 mb-1 font-bold">Logo Preview</p>
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-black/10 shadow-sm flex items-center justify-center">
                          <img
                            src={companyInfo?.LogoUrl || localStorage.getItem('sdy_custom_logo') || '/src/assets/images/sdy_official_logo_v2_1784772926599.jpg'}
                            alt="Logo Preview"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/src/assets/images/sdy_official_logo_v2_1784772926599.jpg';
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase block">{t('admin.phone_number_label', 'Phone Number')}</label>
                      <input
                        type="text"
                        value={companyInfo.PhoneNumber || ''}
                        onChange={(e) => setCompanyInfo(prev => ({ ...prev, PhoneNumber: e.target.value }))}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-black/5 dark:border-white/5 text-[#101828] dark:text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase block">{t('admin.telegram_link_label', 'Telegram Link / Username')}</label>
                      <input
                        type="text"
                        value={companyInfo.Telegram || ''}
                        onChange={(e) => setCompanyInfo(prev => ({ ...prev, Telegram: e.target.value }))}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-black/5 dark:border-white/5 text-[#101828] dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Telegram Bot API Settings for Order Dispatch */}
                  <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-200 dark:border-blue-900/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0A4DA3] dark:text-[#1E88E5] uppercase tracking-wider flex items-center gap-1.5">
                        <Send className="w-4 h-4" />
                        Telegram Bot Config (បញ្ជាទិញទ្វារ & គ្រឿងសង្ហារិម / Door & Joinery Order Bot)
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        Bot: 8968337676:AAGSexfjDTle...
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase block">Telegram Bot Token</label>
                        <input
                          type="password"
                          placeholder="8968337676:AAGSexfjDTle0aIz7K415_ff3E6CnyoCFtc"
                          value={companyInfo.TelegramBotToken || '8968337676:AAGSexfjDTle0aIz7K415_ff3E6CnyoCFtc'}
                          onChange={(e) => setCompanyInfo(prev => ({ ...prev, TelegramBotToken: e.target.value }))}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-black/10 dark:border-white/10 text-[#101828] dark:text-white focus:outline-none font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase block">Telegram Chat ID / Group ID (e.g. -100xxx or 123456)</label>
                        <input
                          type="text"
                          placeholder="-100123456789"
                          value={companyInfo.TelegramChatId || ''}
                          onChange={(e) => setCompanyInfo(prev => ({ ...prev, TelegramChatId: e.target.value }))}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-black/10 dark:border-white/10 text-[#101828] dark:text-white focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase block">{t('admin.whatsapp_link_label', 'WhatsApp Link')}</label>
                      <input
                        type="url"
                        value={companyInfo.WhatsApp}
                        onChange={(e) => setCompanyInfo(prev => ({ ...prev, WhatsApp: e.target.value }))}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-black/5 dark:border-white/5 text-[#101828] dark:text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase block">{t('admin.facebook_page_label', 'Facebook page')}</label>
                      <input
                        type="url"
                        value={companyInfo.Facebook}
                        onChange={(e) => setCompanyInfo(prev => ({ ...prev, Facebook: e.target.value }))}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-black/5 dark:border-white/5 text-[#101828] dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase block">{t('admin.tiktok_link_label', 'TikTok link')}</label>
                      <input
                        type="url"
                        value={companyInfo.TikTok}
                        onChange={(e) => setCompanyInfo(prev => ({ ...prev, TikTok: e.target.value }))}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-black/5 dark:border-white/5 text-[#101828] dark:text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase block">{t('admin.youtube_link_label', 'YouTube link')}</label>
                      <input
                        type="url"
                        value={companyInfo.YouTube}
                        onChange={(e) => setCompanyInfo(prev => ({ ...prev, YouTube: e.target.value }))}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-black/5 dark:border-white/5 text-[#101828] dark:text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase block">{t('admin.corporate_email_label', 'Corporate Email')}</label>
                      <input
                        type="email"
                        value={companyInfo.Email}
                        onChange={(e) => setCompanyInfo(prev => ({ ...prev, Email: e.target.value }))}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-black/5 dark:border-white/5 text-[#101828] dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase block">{t('admin.physical_hq_address_label', 'Physical HQ and Plant Address')}</label>
                    <input
                      type="text"
                      value={companyInfo.Address}
                      onChange={(e) => setCompanyInfo(prev => ({ ...prev, Address: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-black/5 dark:border-white/5 text-[#101828] dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase block">{t('admin.google_maps_embed_label', 'Google Maps Embed URL')}</label>
                    <input
                      type="url"
                      value={companyInfo.GoogleMapEmbedURL}
                      onChange={(e) => setCompanyInfo(prev => ({ ...prev, GoogleMapEmbedURL: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-black/5 dark:border-white/5 text-[#101828] dark:text-white focus:outline-none text-emerald-600 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase block">{t('admin.working_hours_label', 'Factory and Office Working Hours')}</label>
                    <input
                      type="text"
                      value={companyInfo.WorkingHours}
                      onChange={(e) => setCompanyInfo(prev => ({ ...prev, WorkingHours: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-black/5 dark:border-white/5 text-[#101828] dark:text-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSyncing}
                    className="px-5 py-2.5 bg-[#0A4DA3] hover:bg-[#1E88E5] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" /> {t('admin.save_corporate_settings', 'Save Corporate Settings')}
                  </button>
                </form>
              </div>
            )}

            {/* 7. CATEGORIES MANAGER VIEW */}
            {activeTab === 'categories' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5">
                  <div>
                    <h3 className="font-bold text-lg text-[#101828] dark:text-white">{t('admin.tab_categories', 'Categories Manager')}</h3>
                    <p className="text-[11px] text-[#101828]/50 dark:text-white/50">{t('admin.categories_desc', 'Manage taxonomy and categorization filters for products and projects.')}</p>
                  </div>
                  {!isAddingCategory && !editingCategory && (
                    <button
                      onClick={() => {
                        setIsAddingCategory(true);
                        setEditingCategory(null);
                        setCategoryForm({ id: '', name: '', type: 'product' });
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0A4DA3] hover:bg-[#1E88E5] text-white text-[10px] font-bold uppercase tracking-wider shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5" /> {t('admin.add_category', 'Add Category')}
                    </button>
                  )}
                </div>

                {(isAddingCategory || editingCategory) ? (
                  <form onSubmit={handleSaveCategory} className="p-5 rounded-2xl bg-white dark:bg-[#101828] border border-black/5 dark:border-white/10 space-y-4 shadow-sm animate-fade-in">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#101828]/70 dark:text-white/70">
                      {editingCategory ? t('admin.edit_category_details', 'Edit Category Details') : t('admin.add_new_category', 'Add New Category')}
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase block">{t('admin.category_name_label', 'Category Name *')}</label>
                        <input
                          type="text"
                          required
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-[#F7F9FC] dark:bg-[#101828] border border-black/5 dark:border-white/5 text-[#101828] dark:text-white focus:outline-none"
                          placeholder="e.g. Doors, Sliding Windows, Commercial..."
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase block">{t('admin.category_type_label', 'Category Type *')}</label>
                        <select
                          value={categoryForm.type}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, type: e.target.value }))}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-[#F7F9FC] dark:bg-[#101828] border border-black/5 dark:border-white/5 text-[#101828] dark:text-white focus:outline-none"
                        >
                          <option value="product">{t('admin.product_category_opt', 'Product Category')}</option>
                          <option value="project">{t('admin.project_category_opt', 'Project Category')}</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        disabled={isSyncing}
                        className="px-4 py-2 bg-[#0A4DA3] hover:bg-[#1E88E5] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors shadow-sm"
                      >
                        {isSyncing ? t('admin.saving_dots', 'Saving...') : t('admin.save_category', 'Save Category')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingCategory(false);
                          setEditingCategory(null);
                        }}
                        className="px-4 py-2 bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-700"
                      >
                        {t('admin.cancel', 'Cancel')}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-black/10 dark:border-white/10 bg-slate-100/90 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 uppercase font-bold text-xs sm:text-sm tracking-wider">
                          <th className="px-4 py-3">{t('admin.table_category_id', 'Category ID')}</th>
                          <th className="px-4 py-3">{t('admin.table_category_name', 'Category Name')}</th>
                          <th className="px-4 py-3">{t('admin.table_type', 'Type')}</th>
                          <th className="px-4 py-3 text-right">{t('admin.table_actions', 'Actions')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 dark:divide-white/5 text-sm sm:text-base">
                        {categoriesList.map((cat: any) => (
                          <tr key={cat.id || cat.ID} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3.5 font-mono text-xs text-gray-500 font-bold">{cat.id || cat.ID}</td>
                            <td className="px-4 py-3.5 font-bold text-[#101828] dark:text-white text-sm sm:text-base">{cat.name || cat.Name}</td>
                            <td className="px-4 py-3.5">
                              <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                                (cat.type || cat.Type) === 'product'
                                  ? 'bg-[#0A4DA3]/10 text-[#0A4DA3] dark:text-[#1E88E5]'
                                  : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                              }`}>
                                {(cat.type || cat.Type) === 'product' ? t('admin.product_category_opt', 'Product Category') : t('admin.project_category_opt', 'Project Category')}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-right space-x-1">
                              <button
                                onClick={() => {
                                  setEditingCategory(cat);
                                  setCategoryForm({
                                    id: cat.id || cat.ID,
                                    name: cat.name || cat.Name,
                                    type: cat.type || cat.Type || 'product'
                                  });
                                }}
                                className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/25 rounded"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat.id || cat.ID)}
                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/25 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {categoriesList.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-4 text-center text-gray-400">{t('admin.no_categories_found', 'No categories found in Google Sheets.')}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 8. TRANSLATIONS DICTIONARY VIEW */}
            {activeTab === 'translations' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5">
                  <div>
                    <h3 className="font-bold text-lg text-[#101828] dark:text-white">{t('admin.tab_translations', 'Translations Dictionary')}</h3>
                    <p className="text-[11px] text-[#101828]/50 dark:text-white/50">{t('admin.translations_desc', 'Manage dynamic multilingual mappings for English, Khmer, and Korean markets.')}</p>
                  </div>
                  {!isAddingTranslation && !editingTranslation && (
                    <button
                      onClick={() => {
                        setIsAddingTranslation(true);
                        setEditingTranslation(null);
                        setTranslationForm({ key: '', khmer: '', english: '', korean: '' });
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0A4DA3] hover:bg-[#1E88E5] text-white text-[10px] font-bold uppercase tracking-wider shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5" /> {t('admin.add_key', 'Add Key')}
                    </button>
                  )}
                </div>

                {(isAddingTranslation || editingTranslation) ? (
                  <form onSubmit={handleSaveTranslation} className="p-5 rounded-2xl bg-white dark:bg-[#101828] border border-black/5 dark:border-white/10 space-y-4 shadow-sm">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#101828]/70 dark:text-white/70">
                      {editingTranslation ? t('admin.edit_translation_values', 'Edit Translation values') : t('admin.create_translation_key', 'Create Translation Key')}
                    </h4>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase block">{t('admin.translation_key_label', 'Translation Key *')}</label>
                      <input
                        type="text"
                        required
                        disabled={!!editingTranslation}
                        value={translationForm.key}
                        onChange={(e) => setTranslationForm(prev => ({ ...prev, key: e.target.value }))}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-[#F7F9FC] dark:bg-[#101828] border border-black/5 dark:border-white/5 text-[#101828] dark:text-white focus:outline-none disabled:opacity-50 font-mono"
                        placeholder="e.g. menu.contact, button.read_more..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase block">{t('admin.english_translation_label', 'English Translation (en)')}</label>
                        <textarea
                          rows={2}
                          value={translationForm.english}
                          onChange={(e) => setTranslationForm(prev => ({ ...prev, english: e.target.value }))}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-[#F7F9FC] dark:bg-[#101828] border border-black/5 dark:border-white/5 text-[#101828] dark:text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase block">{t('admin.khmer_translation_label', 'Khmer Translation (km)')}</label>
                        <textarea
                          rows={2}
                          value={translationForm.khmer}
                          onChange={(e) => setTranslationForm(prev => ({ ...prev, khmer: e.target.value }))}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-[#F7F9FC] dark:bg-[#101828] border border-black/5 dark:border-white/5 text-[#101828] dark:text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase block">{t('admin.korean_translation_label', 'Korean Translation (ko)')}</label>
                        <textarea
                          rows={2}
                          value={translationForm.korean}
                          onChange={(e) => setTranslationForm(prev => ({ ...prev, korean: e.target.value }))}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-[#F7F9FC] dark:bg-[#101828] border border-black/5 dark:border-white/5 text-[#101828] dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        disabled={isSyncing}
                        className="px-4 py-2 bg-[#0A4DA3] hover:bg-[#1E88E5] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors shadow-sm"
                      >
                        {isSyncing ? t('admin.saving_dots', 'Saving...') : t('admin.save_mappings', 'Save Mappings')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingTranslation(false);
                          setEditingTranslation(null);
                        }}
                        className="px-4 py-2 bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-700"
                      >
                        {t('admin.cancel', 'Cancel')}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder={t('admin.search_translations_placeholder', 'Search translation key or translation content...')}
                      className="w-full px-4 py-2 text-xs rounded-xl bg-white dark:bg-[#101828] border border-black/5 dark:border-white/10 text-[#101828] dark:text-white focus:outline-none"
                      onChange={(e) => {
                        const term = e.target.value.toLowerCase();
                        if (!term) {
                          setTranslationsListState(translationsList || []);
                        } else {
                          const filtered = (translationsList || []).filter((item: any) => {
                            const keyStr = (item.Key || item.key || '').toLowerCase();
                            const enStr = (item.English || item.english || '').toLowerCase();
                            const kmStr = (item.Khmer || item.khmer || '').toLowerCase();
                            const koStr = (item.Korean || item.korean || '').toLowerCase();
                            return keyStr.includes(term) || enStr.includes(term) || kmStr.includes(term) || koStr.includes(term);
                          });
                          setTranslationsListState(filtered);
                        }
                      }}
                    />

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-black/10 dark:border-white/10 bg-slate-100/90 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 uppercase font-bold text-xs sm:text-sm tracking-wider">
                            <th className="px-4 py-3">{t('admin.table_translation_key', 'Translation Key')}</th>
                            <th className="px-4 py-3">{t('admin.table_english', 'English')}</th>
                            <th className="px-4 py-3">{t('admin.table_khmer', 'Khmer')}</th>
                            <th className="px-4 py-3">{t('admin.table_korean', 'Korean')}</th>
                            <th className="px-4 py-3 text-right">{t('admin.table_actions', 'Actions')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 dark:divide-white/5 text-sm sm:text-base">
                          {translationsListState.map((row: any) => {
                            const key = row.Key || row.key;
                            const englishVal = row.English || row.english || '';
                            const khmerVal = row.Khmer || row.khmer || '';
                            const koreanVal = row.Korean || row.korean || '';
                            return (
                              <tr key={key} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-500">{key}</td>
                                <td className="px-4 py-3.5 text-slate-800 dark:text-slate-200 font-medium max-w-[280px] truncate">{englishVal}</td>
                                <td className="px-4 py-3.5 text-slate-800 dark:text-slate-200 font-medium max-w-[280px] truncate">{khmerVal}</td>
                                <td className="px-4 py-3.5 text-slate-800 dark:text-slate-200 font-medium max-w-[280px] truncate">{koreanVal}</td>
                                <td className="px-4 py-3.5 text-right space-x-1">
                                  <button
                                    onClick={() => {
                                      setEditingTranslation(row);
                                      setTranslationForm({
                                        key: key,
                                        english: englishVal,
                                        khmer: khmerVal,
                                        korean: koreanVal
                                      });
                                    }}
                                    className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/25 rounded"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTranslation(key)}
                                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/25 rounded"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                          {translationsListState.length === 0 && (
                            <tr>
                              <td colSpan={5} className="py-4 text-center text-gray-400">{t('admin.no_translation_keys', 'No translation keys found in Google Sheets.')}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 6. GOOGLE SHEETS INTEGRATION VIEW */}
            {activeTab === 'sheets' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5">
                  <h3 className="font-bold text-lg text-[#101828] dark:text-white">{t('admin.sheets_title', 'Google Sheets Integration Setup')}</h3>
                  <span className="text-[10px] bg-green-100 text-green-700 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">{t('admin.sheets_ready', 'Sheets Ready')}</span>
                </div>

                {/* DIRECT GOOGLE WORKSPACE OAUTH & SHEETS CONTROL PANEL */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0A4DA3]/5 via-white to-blue-50/30 dark:from-[#101828] dark:via-[#101828] dark:to-blue-950/20 border border-[#0A4DA3]/20 dark:border-white/10 space-y-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 dark:border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0A4DA3]/10 text-[#0A4DA3] dark:text-[#1E88E5] flex items-center justify-center font-bold">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-[#101828] dark:text-white">Google Account Direct Sync</h4>
                        <p className="text-xs text-[#101828]/60 dark:text-white/60">Connect your Google Account to read/write Google Sheets & Drive files directly without third-party servers.</p>
                      </div>
                    </div>

                    {!googleUser ? (
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isGoogleLoading}
                        className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white dark:bg-[#101828] border border-black/15 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-xs font-bold text-gray-800 dark:text-white shadow-sm"
                      >
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                        </svg>
                        <span>{isGoogleLoading ? (language === 'km' ? 'កំពុងភ្ជាប់...' : 'Connecting...') : (language === 'km' ? 'ចូលប្រើប្រាស់ Google' : 'Sign in with Google')}</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 bg-white dark:bg-[#101828] p-2 rounded-xl border border-black/10 dark:border-white/10">
                        {googleUser.photoURL ? (
                          <img src={googleUser.photoURL || null} alt={googleUser.displayName || 'User'} className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#0A4DA3] text-white flex items-center justify-center text-xs font-bold">
                            {googleUser.email?.[0].toUpperCase()}
                          </div>
                        )}
                        <div className="text-left">
                          <p className="text-xs font-bold text-[#101828] dark:text-white truncate max-w-[150px]">{googleUser.displayName || googleUser.email}</p>
                          <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> {language === 'km' ? 'បានភ្ជាប់' : 'Connected'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleGoogleLogout}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                          title={language === 'km' ? 'ចាកចេញ' : 'Sign Out'}
                        >
                          <LogOut className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {googleUser && (
                    <div className="space-y-5 animate-fade-in">
                      {/* Active Google Sheet Selection & Creation */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="md:col-span-2 space-y-1.5">
                          <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase tracking-wider block">
                            {language === 'km' ? 'ជ្រើសរើស Google Sheet ពី Google Drive' : 'Select Google Sheet from Drive'}
                          </label>
                          <select
                            value={activeSpreadsheetId}
                            onChange={(e) => {
                              const val = e.target.value;
                              setActiveSpreadsheetId(val);
                              localStorage.setItem('sdy_active_spreadsheet_id', val);
                            }}
                            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white dark:bg-[#101828] text-[#101828] dark:text-white border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#0A4DA3] font-mono"
                          >
                            <option value="">{language === 'km' ? '-- ជ្រើសរើស Google Sheet --' : '-- Choose a Google Spreadsheet --'}</option>
                            {userSpreadsheets.map((sheet) => (
                              <option key={sheet.id} value={sheet.id}>
                                📄 {sheet.name} ({sheet.id.slice(0, 10)}...)
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={handleCreateNewSheet}
                          disabled={isGoogleLoading}
                          className="px-4 py-2.5 bg-[#0A4DA3] hover:bg-[#1E88E5] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" /> {language === 'km' ? 'បង្កើត Google Sheet ថ្មី' : 'Create New Database Sheet'}
                        </button>
                      </div>

                      {/* Sheet Sync Controls */}
                      {activeSpreadsheetId && (
                        <div className="p-4 bg-white dark:bg-[#101828] rounded-xl border border-black/10 dark:border-white/10 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#101828] dark:text-white flex items-center gap-2">
                              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                              {language === 'km' ? 'អត្តសញ្ញាណ Sheet សកម្ម:' : 'Active Spreadsheet ID:'} <code className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">{activeSpreadsheetId}</code>
                            </span>
                            <a
                              href={`https://docs.google.com/spreadsheets/d/${activeSpreadsheetId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-[#0A4DA3] dark:text-[#1E88E5] font-bold hover:underline flex items-center gap-1"
                            >
                              {language === 'km' ? 'បើកក្នុង Google Sheets' : 'Open in Google Sheets'} <ArrowRight className="w-3 h-3" />
                            </a>
                          </div>

                          <div className="flex flex-wrap gap-3 pt-1">
                            <button
                              type="button"
                              onClick={handleSyncAllDataToSelectedSheet}
                              disabled={isGoogleLoading}
                              className="px-4 py-2.5 bg-[#0A4DA3] hover:bg-[#1E88E5] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <RefreshCw className={`w-4 h-4 ${isGoogleLoading ? 'animate-spin' : ''}`} /> {language === 'km' ? 'ភ្ជាប់ / Sync ទិន្នន័យទាំងអស់ទៅ Google Sheet' : 'Sync All Data to Google Sheet'}
                            </button>

                            <button
                              type="button"
                              onClick={handleSyncProductsToSelectedSheet}
                              disabled={isGoogleLoading}
                              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${isGoogleLoading ? 'animate-spin' : ''}`} /> {language === 'km' ? 'Sync ផលិតផល' : 'Sync Products'}
                            </button>

                            <button
                              type="button"
                              onClick={handleImportProductsFromSelectedSheet}
                              disabled={isGoogleLoading}
                              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <Download className="w-3.5 h-3.5" /> {language === 'km' ? 'នាំចូលផលិតផល' : 'Import Products'}
                            </button>

                            <button
                              type="button"
                              onClick={handleSyncProjectsToSelectedSheet}
                              disabled={isGoogleLoading}
                              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${isGoogleLoading ? 'animate-spin' : ''}`} /> {language === 'km' ? 'Sync គម្រោង' : 'Sync Projects'}
                            </button>

                            <button
                              type="button"
                              onClick={handleImportProjectsFromSelectedSheet}
                              disabled={isGoogleLoading}
                              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <Download className="w-3.5 h-3.5" /> {language === 'km' ? 'នាំចូលគម្រោង' : 'Import Projects'}
                            </button>

                            <button
                              type="button"
                              onClick={handleSyncBlogsToSelectedSheet}
                              disabled={isGoogleLoading}
                              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${isGoogleLoading ? 'animate-spin' : ''}`} /> {language === 'km' ? 'Sync ប្លុក' : 'Sync Blog'}
                            </button>

                            <button
                              type="button"
                              onClick={handleImportBlogsFromSelectedSheet}
                              disabled={isGoogleLoading}
                              className="px-3.5 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <Download className="w-3.5 h-3.5" /> {language === 'km' ? 'នាំចូលប្លុក' : 'Import Blog'}
                            </button>

                            <button
                              type="button"
                              onClick={handleSyncCategoriesToSelectedSheet}
                              disabled={isGoogleLoading}
                              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${isGoogleLoading ? 'animate-spin' : ''}`} /> {language === 'km' ? 'Sync ប្រភេទ' : 'Sync Categories'}
                            </button>

                            <button
                              type="button"
                              onClick={handleImportCategoriesFromSelectedSheet}
                              disabled={isGoogleLoading}
                              className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <Download className="w-3.5 h-3.5" /> {language === 'km' ? 'នាំចូលប្រភេទ' : 'Import Categories'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <form onSubmit={handleSaveWebhookConfig} className="p-5 rounded-2xl bg-white dark:bg-[#101828] border border-black/5 dark:border-white/10 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-[#101828] dark:text-white">{t('admin.sheets_toggle', 'Enable Real-Time Sheet Sync')}</p>
                      <p className="text-[11px] text-[#101828]/50 dark:text-white/50">{t('admin.sheets_desc', 'When enabled, CRUD actions and form submissions dispatch securely directly to Google Sheets.')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sheetsConfig.isSyncEnabled}
                        onChange={(e) => setSheetsConfig(prev => ({ ...prev, isSyncEnabled: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:bg-zinc-700 peer-checked:bg-[#0A4DA3]"></div>
                    </label>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <label className="text-[10px] font-bold text-[#101828]/60 dark:text-white/60 uppercase tracking-wider block">{t('admin.webhook_url_label', 'Google Apps Web App Webhook URL')}</label>
                    <input
                      type="url"
                      placeholder="e.g. https://script.google.com/macros/s/.../exec"
                      value={sheetsConfig.googleSheetsWebhookUrl}
                      onChange={(e) => setSheetsConfig(prev => ({ ...prev, googleSheetsWebhookUrl: e.target.value }))}
                      className="w-full px-4 py-3 text-xs rounded-xl bg-[#F7F9FC] dark:bg-[#101828] text-[#101828] dark:text-white border border-black/5 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                    <p className="font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                      <span>💡</span> ព័ត៌មានអំពីលទ្ធផល Web App (Notice about Web App output):
                    </p>
                    <p className="leading-relaxed text-[11px]">
                      ប្រសិនបើអ្នកបើកលីង Web App ហើយឃើញ <code className="bg-amber-200 dark:bg-amber-950 px-1 py-0.5 rounded font-mono text-[10px] text-amber-900 dark:text-amber-100">{`{"status":"success","data":{"Sheet1":[]}}`}</code> ឬ <code className="bg-amber-200 dark:bg-amber-950 px-1 py-0.5 rounded font-mono text-[10px] text-amber-900 dark:text-amber-100">{`{"Sheet1":[]}`}</code> មានន័យថា Apps Script Web App ដំណើរការត្រឹមត្រូវហើយ ប៉ុន្តែ Google Sheet របស់អ្នកមិនទាន់មាន Sheet Tabs ទិន្នន័យ (ដូចជា Products, Projects, Blog, CompanyInfo...) នៅឡើយទេ។
                    </p>
                    <p className="leading-relaxed text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                      👉 ដើម្បីដោះស្រាយ៖ សូមចុចប៊ូតុង <strong>"Sync All to Google Sheets"</strong> នៅខាងក្រោម ដើម្បីបង្កើត Sheet Tabs និងបញ្ជូនទិន្នន័យទាំងអស់ទៅកាន់ Google Sheet ដោយស្វ័យប្រវត្តិ!
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#0A4DA3] hover:bg-[#1E88E5] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-md"
                    >
                      {t('admin.btn_save', 'Save Webhook Config')}
                    </button>
                    <button
                      type="button"
                      onClick={handleForcePushAllCmsData}
                      disabled={isSyncing}
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 border border-emerald-400/30 disabled:opacity-50"
                      title="Auto-create missing tabs & push initial JSON data for Homepage, Services, About Us, and Testimonials"
                    >
                      <Sparkles className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>🚀 INITIALIZE & FORCE PUSH ALL CMS DATA TO GOOGLE SHEETS</span>
                    </button>
                    {sheetsConfig.googleSheetsWebhookUrl && (
                      <button
                        type="button"
                        onClick={handleImportAllDataFromSelectedSheet}
                        disabled={isGoogleLoading}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-md flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Download className="w-3.5 h-3.5" /> នាំចូលទិន្នន័យ (Import Data from Webhook)
                      </button>
                    )}
                  </div>
                </form>

                <div className="space-y-3.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#101828]/85 dark:text-white/90">
                    <KeyRound className="w-4 h-4 text-[#1E88E5]" />
                    <span>{t('admin.code_title', 'Copy-Paste Apps Script Deployment Code')}</span>
                  </div>
                  
                  <p className="text-xs text-[#101828]/60 dark:text-white/60 leading-relaxed">
                    {t('admin.sheets_code_instruction', 'Follow the instructions inside the code comments below to launch a microservice using your personal Google Drive in seconds. SDY website handles data mappings automatically.')}
                  </p>

                  <div className="relative rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 shadow-lg text-[11px] font-mono">
                    <div className="bg-[#101828] text-white/50 px-4 py-2.5 flex items-center justify-between border-b border-white/5">
                      <span>sdy_sheets_synchronizer.js</span>
                      <button
                        onClick={copyScriptToClipboard}
                        className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-white font-bold rounded-md transition-colors"
                      >
                        {copiedScript ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-green-300" /> {t('admin.copied', 'Copied!')}
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> {t('admin.copy_code', 'Copy Code')}
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 bg-zinc-950 text-emerald-400 overflow-x-auto max-h-[250px] leading-relaxed">
                      {appsScriptCode}
                    </pre>
                  </div>
                </div>

                {/* BULK DATABASE SYNC PANEL */}
                <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-[#101828]/40 border border-[#0A4DA3]/15 dark:border-white/5 space-y-4 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-sm text-[#101828] dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Database className="w-4 h-4 text-[#0A4DA3]" />
                        {t('admin.bulk_exporter_title', 'Bulk Database Exporter')}
                      </h4>
                      <p className="text-[11px] text-[#101828]/60 dark:text-white/50">
                        {t('admin.bulk_exporter_desc', 'Export all local data (Products, Projects, Categories, Blogs, Translations) directly to Google Sheets database. This creates a complete cloud-hosted source-of-truth.')}
                      </p>
                    </div>
                    <button
                      onClick={handleSyncAllToSheets}
                      disabled={isSyncing}
                      className="px-5 py-3 bg-[#0A4DA3] hover:bg-[#1E88E5] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                      {t('admin.sync_all_btn', 'Sync All to Google Sheets')}
                    </button>
                  </div>
                </div>

                {/* UNIVERSAL SPREADSHEET DATABASE EXPLORER */}
                <div className="p-6 rounded-2xl bg-white dark:bg-[#101828] border border-black/5 dark:border-white/10 space-y-6 shadow-sm">
                  <div>
                    <h4 className="font-bold text-sm text-[#101828] dark:text-white uppercase tracking-wider">
                      {t('admin.universal_admin_title', 'Universal Database Administrator')}
                    </h4>
                    <p className="text-[11px] text-[#101828]/50 dark:text-white/50">
                      {t('admin.universal_admin_desc', 'Query, manipulate, filter, and perform bulk operations on any of the 22 linked Google Sheets.')}
                    </p>
                  </div>

                  {sheetsConfig.isSyncEnabled && sheetsConfig.googleSheetsWebhookUrl ? (
                    <div className="space-y-4">
                      {/* Controls Row */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="w-full sm:w-1/3">
                          <label className="text-[9px] uppercase font-bold text-gray-400 block mb-1">{t('admin.select_worksheet', 'Select Worksheet')}</label>
                          <select
                            value={selectedSheet}
                            onChange={(e) => setSelectedSheet(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-[#F7F9FC] dark:bg-zinc-900 text-[#101828] dark:text-white border border-black/5 dark:border-white/5 focus:outline-none"
                          >
                            {SHEETS_LIST.map(sh => (
                              <option key={sh.name} value={sh.name}>{sh.name} ({sh.idKey})</option>
                            ))}
                          </select>
                        </div>

                        <div className="w-full sm:w-2/3">
                          <label className="text-[9px] uppercase font-bold text-gray-400 block mb-1">{t('admin.filter_records', 'Filter Records')}</label>
                          <input
                            type="text"
                            placeholder={t('admin.filter_placeholder', 'Type search terms to query sheet values...')}
                            value={sheetSearchQuery}
                            onChange={(e) => setSheetSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-[#F7F9FC] dark:bg-zinc-900 text-[#101828] dark:text-white border border-black/5 dark:border-white/5 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Bulk Operations Row */}
                      {selectedRowIds.length > 0 && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="text-[11px] text-blue-700 dark:text-blue-300 font-medium">
                            {selectedRowIds.length} {t('admin.rows_selected', 'rows selected for bulk operations')}
                          </div>
                          <div className="flex flex-wrap gap-2 items-center">
                            <select
                              value={bulkUpdateField}
                              onChange={(e) => setBulkUpdateField(e.target.value)}
                              className="px-2 py-1.5 text-[10px] rounded bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 border border-black/5"
                            >
                              <option value="">{t('admin.choose_field', '-- Choose Field to Update --')}</option>
                              {sheetColumns.map(col => (
                                <option key={col} value={col}>{col}</option>
                              ))}
                            </select>
                            <input
                              type="text"
                              placeholder={t('admin.new_value_placeholder', 'New value')}
                              value={bulkUpdateValue}
                              onChange={(e) => setBulkUpdateValue(e.target.value)}
                              className="px-2 py-1.5 text-[10px] rounded bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 border border-black/5 w-24"
                            />
                            <button
                              onClick={handleBulkUpdateSheetRows}
                              className="px-3 py-1.5 bg-[#0A4DA3] hover:bg-[#1E88E5] text-white text-[9px] font-bold uppercase rounded"
                            >
                              {t('admin.apply_update', 'Apply Update')}
                            </button>
                            <button
                              onClick={handleBulkDeleteSheetRows}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[9px] font-bold uppercase rounded flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" /> {t('admin.bulk_delete', 'Bulk Delete')}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Table Operations */}
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => {
                            const newRecord: any = {};
                            sheetColumns.forEach(c => {
                              newRecord[c] = '';
                            });
                            const sheetInfo = SHEETS_LIST.find(s => s.name === selectedSheet);
                            newRecord[sheetInfo?.idKey || 'id'] = '';
                            setEditingSheetRow(newRecord);
                            setIsAddingSheetRow(true);
                          }}
                          className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" /> {t('admin.add_new_row', 'Add New Row')}
                        </button>

                        <button
                          onClick={() => loadSelectedSheetData()}
                          className="text-[10px] text-gray-400 hover:text-white underline"
                        >
                          {t('admin.refresh_table', 'Refresh Table')}
                        </button>
                      </div>

                      {/* Table Grid */}
                      <div className="overflow-x-auto rounded-xl border border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-950/20 max-h-[400px]">
                        {isLoadingSheet ? (
                          <div className="py-12 flex flex-col items-center justify-center space-y-2">
                            <div className="w-6 h-6 border-2 border-[#0A4DA3] border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Loading dynamic worksheet...</span>
                          </div>
                        ) : (
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-black/10 dark:border-white/10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold text-xs sm:text-sm tracking-wider sticky top-0 z-10">
                                <th className="px-4 py-3 w-8">
                                  <input
                                    type="checkbox"
                                    checked={sheetRows.length > 0 && selectedRowIds.length === sheetRows.length}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        const sheetInfo = SHEETS_LIST.find(s => s.name === selectedSheet);
                                        const idKey = sheetInfo?.idKey || 'id';
                                        setSelectedRowIds(sheetRows.map(r => String(r[idKey] || '')));
                                      } else {
                                        setSelectedRowIds([]);
                                      }
                                    }}
                                  />
                                </th>
                                {sheetColumns.map(col => (
                                  <th key={col} className="px-4 py-3 whitespace-nowrap">{col}</th>
                                ))}
                                <th className="px-4 py-3 text-right sticky right-0 bg-slate-100 dark:bg-slate-800">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5 dark:divide-white/5 text-sm sm:text-base">
                              {sheetRows
                                .filter(row => {
                                  if (!sheetSearchQuery) return true;
                                  const query = sheetSearchQuery.toLowerCase();
                                  return Object.values(row).some(val => 
                                    String(val).toLowerCase().includes(query)
                                  );
                                })
                                .map((row, idx) => {
                                  const sheetInfo = SHEETS_LIST.find(s => s.name === selectedSheet);
                                  const idKey = sheetInfo?.idKey || 'id';
                                  const rowId = String(row[idKey] || '');
                                  const isSelected = selectedRowIds.includes(rowId);

                                  return (
                                    <tr key={idx} className={`hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${isSelected ? 'bg-blue-50/20 dark:bg-blue-950/10' : ''}`}>
                                      <td className="px-4 py-3.5">
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              setSelectedRowIds(prev => [...prev, rowId]);
                                            } else {
                                              setSelectedRowIds(prev => prev.filter(x => x !== rowId));
                                            }
                                          }}
                                        />
                                      </td>
                                      {sheetColumns.map(col => {
                                        const val = String(row[col] !== undefined ? row[col] : '');
                                        return (
                                          <td key={col} className="px-4 py-3.5 whitespace-nowrap max-w-[280px] truncate text-slate-800 dark:text-slate-200 font-medium" title={val}>
                                            {val}
                                          </td>
                                        );
                                      })}
                                      <td className="p-3 text-right space-x-1 sticky right-0 bg-white/90 dark:bg-[#101828]/95 backdrop-blur z-10">
                                        <button
                                          onClick={() => {
                                            setEditingSheetRow({ ...row });
                                            setIsAddingSheetRow(false);
                                          }}
                                          className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/25 rounded"
                                        >
                                          <Edit3 className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteSheetRow(rowId)}
                                          className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/25 rounded"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}

                              {sheetRows.length === 0 && (
                                <tr>
                                  <td colSpan={sheetColumns.length + 2} className="py-8 text-center text-gray-400">
                                    No records found inside this worksheet yet.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center border border-dashed border-black/10 dark:border-white/10 rounded-xl text-xs text-gray-400">
                      Please enable Real-Time Sheets Sync and provide a valid Google Apps Script Webhook URL above to unlock the database administrator.
                    </div>
                  )}
                </div>

                {/* DYNAMIC RECORD MODAL */}
                {editingSheetRow && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#101828] border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                      <div className="bg-zinc-100 dark:bg-zinc-900/50 px-6 py-4 flex items-center justify-between border-b border-black/5 dark:border-white/10">
                        <span className="font-bold text-xs uppercase tracking-wider text-[#101828] dark:text-white">
                          {isAddingSheetRow ? 'Create New Sheet Record' : 'Edit Sheet Record'} ({selectedSheet})
                        </span>
                        <button
                          onClick={() => {
                            setEditingSheetRow(null);
                            setIsAddingSheetRow(false);
                          }}
                          className="text-gray-400 hover:text-white"
                        >
                          ✕
                        </button>
                      </div>

                      <form onSubmit={handleSaveSheetRow} className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
                        {sheetColumns.map(col => {
                          const sheetInfo = SHEETS_LIST.find(s => s.name === selectedSheet);
                          const isIdKey = col === (sheetInfo?.idKey || 'id');
                          const value = editingSheetRow[col] || '';

                          return (
                            <div key={col} className="space-y-1.5">
                              <label className="text-[9px] uppercase font-bold tracking-wider text-gray-400 block">
                                {col} {isIdKey && <span className="text-blue-500">(Primary Key)</span>}
                              </label>
                              <input
                                type="text"
                                disabled={isIdKey && !isAddingSheetRow}
                                value={value}
                                placeholder={isIdKey ? "Leave blank for auto-generation" : `Enter ${col}`}
                                onChange={(e) => {
                                  setEditingSheetRow((prev: any) => ({
                                    ...prev,
                                    [col]: e.target.value
                                  }));
                                }}
                                className="w-full px-3 py-2 text-xs rounded-xl bg-[#F7F9FC] dark:bg-zinc-900 text-[#101828] dark:text-white border border-black/5 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-[#0A4DA3]"
                              />
                            </div>
                          );
                        })}

                        <div className="flex gap-2 pt-4 justify-end border-t border-black/5 dark:border-white/5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSheetRow(null);
                              setIsAddingSheetRow(false);
                            }}
                            className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 text-[10px] font-bold uppercase tracking-wider rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-[#0A4DA3] hover:bg-[#1E88E5] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm"
                          >
                            Save Record
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* PDF LIVE PREVIEW OVERLAY */}
                {previewPdfUri && (
                  <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[60] p-4 sm:p-8 animate-in fade-in duration-200">
                    <div className="w-full max-w-5xl h-[85vh] rounded-3xl bg-white dark:bg-[#101828] border border-black/15 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden">
                      <div className="bg-zinc-50 dark:bg-zinc-900/40 px-6 py-4 flex items-center justify-between border-b border-black/5 dark:border-white/10">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="font-bold text-xs uppercase tracking-wider text-[#101828] dark:text-white">
                            Luxury Brochure Compiler Live Preview
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={previewPdfUri}
                            download="SDY_Brochure_Preview.pdf"
                            className="px-3.5 py-1.5 bg-[#0A4DA3] hover:bg-[#1E88E5] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-1 transition-all"
                          >
                            <Download className="w-3.5 h-3.5" /> Save File
                          </a>
                          <button
                            onClick={() => {
                              URL.revokeObjectURL(previewPdfUri);
                              setPreviewPdfUri(null);
                            }}
                            className="p-1.5 bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:text-white rounded-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 bg-zinc-900">
                        <iframe
                          src={previewPdfUri}
                          className="w-full h-full border-0"
                          title="PDF Live Preview Panel"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* PDF RELEASE VERSION HISTORY MODAL */}
                {showVersionsModal && selectedProductVersions && (
                  <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#101828] border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden">
                      <div className="bg-zinc-100 dark:bg-zinc-900/50 px-6 py-4 flex items-center justify-between border-b border-black/5 dark:border-white/10">
                        <span className="font-bold text-xs uppercase tracking-wider text-[#101828] dark:text-white flex items-center gap-2">
                          <History className="w-4 h-4 text-[#0a4da3]" />
                          Revision History Logs: {selectedProductVersions.name}
                        </span>
                        <button
                          onClick={() => {
                            setShowVersionsModal(false);
                            setSelectedProductVersions(null);
                          }}
                          className="text-gray-400 hover:text-white"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="overflow-x-auto rounded-xl border border-black/5 dark:border-white/10">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-zinc-50 dark:bg-zinc-900/30 border-b border-black/10 dark:border-white/10 text-[#101828]/50 dark:text-white/50 uppercase font-bold text-[9px] tracking-wider">
                                <th className="p-3">Revision</th>
                                <th className="p-3">Date Released</th>
                                <th className="p-3 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5 dark:divide-white/5">
                              {(selectedProductVersions.pdfVersions || []).map((ver: any, i: number) => (
                                <tr key={i} className="hover:bg-black/5 dark:hover:bg-white/5">
                                  <td className="p-3 font-mono font-bold text-gray-500">{ver.version}</td>
                                  <td className="p-3 text-gray-700 dark:text-gray-300">{ver.date}</td>
                                  <td className="p-3 text-right">
                                    <a
                                      href={ver.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-[#0A4DA3]/10 text-[#0A4DA3] dark:text-[#1E88E5] font-bold rounded hover:bg-[#0A4DA3] hover:text-white transition-all text-[10px]"
                                    >
                                      <Download className="w-3 h-3" /> Get PDF
                                    </a>
                                  </td>
                                </tr>
                              ))}
                              {(!selectedProductVersions.pdfVersions || selectedProductVersions.pdfVersions.length === 0) && (
                                <tr>
                                  <td colSpan={3} className="py-6 text-center text-gray-400">No revisions recorded yet.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            onClick={() => {
                              setShowVersionsModal(false);
                              setSelectedProductVersions(null);
                            }}
                            className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 text-[10px] font-bold uppercase tracking-wider rounded-lg"
                          >
                            Close Log
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>

        </div>

        {/* CHANGE ADMIN PASSWORD MODAL */}
        {isChangePasswordOpen && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#101828] border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden">
              <div className="bg-[#113586] px-6 py-4 flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  {language === 'km' ? 'កំណត់/ផ្លាស់ប្តូរពាក្យសម្ងាត់ Admin ផ្ទាល់' : 'Change Admin Security Password'}
                </span>
                <button
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="text-white/70 hover:text-white transition-colors text-base"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider block">
                    {language === 'km' ? 'ពាក្យសម្ងាត់បច្ចុប្បន្ន (Current Password)' : 'Current Password'}
                  </label>
                  <input
                    type="password"
                    placeholder="admin123"
                    value={oldPassInput}
                    onChange={(e) => setOldPassInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-zinc-900 text-[#101828] dark:text-white border border-gray-200 dark:border-zinc-700 focus:ring-2 focus:ring-[#0A4DA3]"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider block">
                    {language === 'km' ? 'ពាក្យសម្ងាត់ថ្មី (New Password)' : 'New Password'}
                  </label>
                  <input
                    type="password"
                    placeholder={language === 'km' ? 'បញ្ចូលពាក្យសម្ងាត់ថ្មី' : 'Enter new password'}
                    value={newPassInput}
                    onChange={(e) => setNewPassInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-zinc-900 text-[#101828] dark:text-white border border-gray-200 dark:border-zinc-700 focus:ring-2 focus:ring-[#0A4DA3]"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider block">
                    {language === 'km' ? 'ផ្ទៀងផ្ទាត់ពាក្យសម្ងាត់ថ្មី (Confirm Password)' : 'Confirm New Password'}
                  </label>
                  <input
                    type="password"
                    placeholder={language === 'km' ? 'វាយបញ្ចូលពាក្យសម្ងាត់ថ្មីម្តងទៀត' : 'Re-enter new password'}
                    value={confirmPassInput}
                    onChange={(e) => setConfirmPassInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-zinc-900 text-[#101828] dark:text-white border border-gray-200 dark:border-zinc-700 focus:ring-2 focus:ring-[#0A4DA3]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/5 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsChangePasswordOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all"
                  >
                    {language === 'km' ? 'បោះបង់' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#0A4DA3] hover:bg-[#1E88E5] text-white shadow-md flex items-center gap-2 transition-all"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    {language === 'km' ? 'រក្សាទុកពាក្យសម្ងាត់' : 'Save Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
