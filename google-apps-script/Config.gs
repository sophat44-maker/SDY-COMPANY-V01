/**
 * Config.gs - SDY Enterprise Digital Operating System (SDY EDOS)
 * Global Configuration and Constants
 */

var CONFIG = {
  APP_NAME: "SDY EDOS Enterprise REST API",
  VERSION: "22.0.0-PROD",
  SECRET_KEY: "SDY_ENTERPRISE_JWT_SECRET_KEY_CHANGE_IN_PRODUCTION",
  JWT_EXPIRATION_HOURS: 24,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE_SIZE: 20,
  CACHE_EXPIRATION_SEC: 600, // 10 minutes
  DRIVE_FOLDER_ID: "", // Set Google Drive folder ID for uploads
  RATE_LIMIT_PER_MIN: 120,
  CORS_ENABLED: true,
  ALLOWED_ORIGINS: ["*"],
  
  // Sheet Names in Google Sheets Database
  SHEETS: {
    PRODUCTS: "Products",
    PRODUCTS_DATABASE: "Products_Database",
    CATEGORIES: "Categories",
    CATEGORIES_MANAGER: "Categories_Manager",
    PROJECTS: "Projects",
    PROJECTS_DATABASE: "Projects_Database",
    SERVICES: "Services",
    SERVICES_PAGE: "Services_Page",
    ABOUT_US: "About_Us",
    NEWS_BLOGS: "News_Blogs",
    ORDERS_INQUIRIES: "Orders_Inquiries",
    TRANSLATIONS_DICTIONARY: "Translations_Dictionary",
    GALLERY: "Gallery",
    DOWNLOADS: "Downloads",
    TESTIMONIALS: "Testimonials",
    PARTNERS: "Partners",
    CERTIFICATES: "Certificates",
    TEAM_MEMBERS: "TeamMembers",
    CAREERS: "Careers",
    BLOGS: "Blogs",
    FAQS: "FAQs",
    USERS: "Users",
    ROLES: "Roles",
    PERMISSIONS: "Permissions",
    BRANCHES: "Branches",
    SETTINGS: "Settings",
    COMPANY_INFO: "CompanyInfo",
    LANGUAGES: "Languages",
    TRANSLATIONS: "Translations",
    REVIEWS: "Reviews",
    AUDIT_LOGS: "AuditLogs",
    QUOTATIONS: "Quotations",
    INVOICES: "Invoices",
    DELIVERY_ORDERS: "DeliveryOrders",
    DELIVERY_NOTES: "DeliveryNotes",
    HOMEPAGE_CMS: "Homepage_CMS"
  }
};

/**
 * Get active spreadsheet instance
 */
function getSpreadsheet() {
  var id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (id) {
    return SpreadsheetApp.openById(id);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}
