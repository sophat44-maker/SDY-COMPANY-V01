import { Product, Project, ContactMessage, BlogPost, TranslationRow, TestimonialItem } from '../types';

export interface CategoryItem {
  id: string;
  name: string;
  type: string;
}

export interface SpreadsheetFile {
  id: string;
  name: string;
  modifiedTime?: string;
  webViewLink?: string;
}

export interface SheetValueResponse {
  range: string;
  majorDimension: string;
  values: any[][];
}

/**
 * List Google Spreadsheets from user's Google Drive
 */
export async function listGoogleSpreadsheets(accessToken: string): Promise<SpreadsheetFile[]> {
  try {
    const query = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,webViewLink)&orderBy=modifiedTime desc`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Failed to list spreadsheets');
    }

    const data = await res.json();
    return data.files || [];
  } catch (error) {
    console.error('Error listing Google Spreadsheets:', error);
    throw error;
  }
}

/**
 * Create a new Google Spreadsheet with structured tabs
 */
export async function createNewGoogleSheet(accessToken: string, title: string = 'SDY_Company_Database'): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  try {
    const body = {
      properties: {
        title,
      },
      sheets: [
        { properties: { title: 'Products' } },
        { properties: { title: 'Projects' } },
        { properties: { title: 'Blog' } },
        { properties: { title: 'Categories' } },
        { properties: { title: 'ContactMessages' } },
        { properties: { title: 'CompanyInfo' } },
      ],
    };

    const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Failed to create Google Spreadsheet');
    }

    const data = await res.json();
    const spreadsheetId = data.spreadsheetId;
    const spreadsheetUrl = data.spreadsheetUrl;

    // Initialize headers for Products tab
    await writeSheetValues(accessToken, spreadsheetId, 'Products!A1:J1', [
      ['ProductID', 'Name', 'Category', 'Description', 'Material', 'Specification', 'Size', 'Dimensions', 'Image', 'Gallery']
    ]);

    // Initialize headers for Projects tab
    await writeSheetValues(accessToken, spreadsheetId, 'Projects!A1:H1', [
      ['ProjectID', 'Title', 'Category', 'Location', 'Area', 'CompletionYear', 'Description', 'CoverImage']
    ]);

    // Initialize headers for Blog tab
    await writeSheetValues(accessToken, spreadsheetId, 'Blog!A1:G1', [
      ['BlogID', 'Title', 'Excerpt', 'Content', 'Category', 'Author', 'Image']
    ]);

    // Initialize headers for Categories tab
    await writeSheetValues(accessToken, spreadsheetId, 'Categories!A1:C1', [
      ['CategoryID', 'Name', 'Type']
    ]);

    // Initialize headers for ContactMessages tab
    await writeSheetValues(accessToken, spreadsheetId, 'ContactMessages!A1:H1', [
      ['MessageID', 'Name', 'Email', 'Phone', 'Company', 'Subject', 'Message', 'Date']
    ]);

    // Initialize headers for CompanyInfo tab
    await writeSheetValues(accessToken, spreadsheetId, 'CompanyInfo!A1:B1', [
      ['Key', 'Value']
    ]);

    // Initialize headers for Homepage_CMS tab
    await writeSheetValues(accessToken, spreadsheetId, 'Homepage_CMS!A1:B1', [
      ['Key', 'Value']
    ]);

    // Initialize headers for Services_CMS tab
    await writeSheetValues(accessToken, spreadsheetId, 'Services_CMS!A1:B1', [
      ['Key', 'Value']
    ]);

    // Initialize headers for About_CMS tab
    await writeSheetValues(accessToken, spreadsheetId, 'About_CMS!A1:B1', [
      ['Key', 'Value']
    ]);

    return { spreadsheetId, spreadsheetUrl };
  } catch (error) {
    console.error('Error creating Google Sheet:', error);
    throw error;
  }
}

/**
 * Ensures that a sheet tab with the given title exists in the spreadsheet.
 * If it doesn't exist, sends a batchUpdate addSheet request to create it.
 */
export async function ensureSheetTabExists(accessToken: string, spreadsheetId: string, sheetTitle: string): Promise<boolean> {
  try {
    const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!metaRes.ok) return false;
    const meta = await metaRes.json();
    const existingTitles = (meta.sheets || []).map((s: any) => s.properties?.title);
    if (existingTitles.includes(sheetTitle)) {
      return true;
    }

    const addRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetTitle,
              },
            },
          },
        ],
      }),
    });
    return addRes.ok;
  } catch (err) {
    console.warn(`Could not ensure tab ${sheetTitle} exists:`, err);
    return false;
  }
}

// In-Memory Caching & Rate-Limit Protection
const sheetCache = new Map<string, { timestamp: number; values: any[][] }>();
const inFlightRequests = new Map<string, Promise<any[][]>>();
const CACHE_TTL_MS = 60000; // 60 seconds TTL to preserve Google Sheets API quota

export function clearSheetCache(spreadsheetId?: string) {
  if (spreadsheetId) {
    for (const key of sheetCache.keys()) {
      if (key.startsWith(`${spreadsheetId}:`)) {
        sheetCache.delete(key);
      }
    }
  } else {
    sheetCache.clear();
  }
}

/**
 * Read multiple ranges in ONE single API call using Google Sheets API values:batchGet
 */
export async function batchReadSheetValues(
  accessToken: string,
  spreadsheetId: string,
  ranges: string[]
): Promise<Record<string, any[][]>> {
  const result: Record<string, any[][]> = {};
  const rangesToFetch: string[] = [];

  // Check cache first for each range
  for (const range of ranges) {
    const key = `${spreadsheetId}:${range}`;
    const cached = sheetCache.get(key);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      result[range] = cached.values;
    } else {
      rangesToFetch.push(range);
    }
  }

  if (rangesToFetch.length === 0) {
    return result;
  }

  try {
    const rangesQuery = rangesToFetch.map(r => `ranges=${encodeURIComponent(r)}`).join('&');
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${rangesQuery}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.ok) {
      const data = await res.json();
      const valueRanges: Array<{ range: string; values?: any[][] }> = data.valueRanges || [];
      valueRanges.forEach((vr, idx) => {
        const requestedRange = rangesToFetch[idx] || vr.range;
        const vals = vr.values || [];
        result[requestedRange] = vals;
        sheetCache.set(`${spreadsheetId}:${requestedRange}`, { timestamp: Date.now(), values: vals });
      });
    } else {
      const err = await res.json().catch(() => ({}));
      console.warn(`[batchReadSheetValues] Google Sheets API warning: ${err.error?.message || res.statusText}`);
      // Fallback: use stale cache or empty arrays
      rangesToFetch.forEach(r => {
        const cached = sheetCache.get(`${spreadsheetId}:${r}`);
        result[r] = cached ? cached.values : [];
      });
    }
  } catch (error) {
    console.warn(`[batchReadSheetValues] Network/Quota issue:`, error);
    rangesToFetch.forEach(r => {
      const cached = sheetCache.get(`${spreadsheetId}:${r}`);
      result[r] = cached ? cached.values : [];
    });
  }

  return result;
}

/**
 * Read values from a range in Google Sheets (with cache and deduplication)
 */
export async function readSheetValues(accessToken: string, spreadsheetId: string, range: string): Promise<any[][]> {
  const cacheKey = `${spreadsheetId}:${range}`;
  const cached = sheetCache.get(cacheKey);

  // Return fresh cached copy if within TTL
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.values;
  }

  // Deduplicate in-flight requests for the exact same range
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)!;
  }

  const fetchPromise = (async () => {
    try {
      let res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const sheetTitle = range.split('!')[0].replace(/'/g, '');

        if (err.error?.message?.includes('Unable to parse range') && sheetTitle) {
          const created = await ensureSheetTabExists(accessToken, spreadsheetId, sheetTitle);
          if (created) {
            res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (res.ok) {
              const data: SheetValueResponse = await res.json();
              const vals = data.values || [];
              sheetCache.set(cacheKey, { timestamp: Date.now(), values: vals });
              return vals;
            }
          }
        }

        // Handle Quota Exceeded (429) or other errors gracefully
        if (res.status === 429 || err.error?.status === 'RESOURCE_EXHAUSTED' || err.error?.message?.includes('Quota exceeded')) {
          console.warn(`[Google Sheets API] Quota limit hit for range ${range}. Returning cached/local state.`);
          if (cached) return cached.values;
          return [];
        }

        console.warn(`[readSheetValues] Warning reading range ${range}: ${err.error?.message || res.statusText}`);
        if (cached) return cached.values;
        return [];
      }

      const data: SheetValueResponse = await res.json();
      const vals = data.values || [];
      sheetCache.set(cacheKey, { timestamp: Date.now(), values: vals });
      return vals;
    } catch (error) {
      console.warn(`[readSheetValues] Exception reading Google Sheet range ${range}:`, error);
      if (cached) return cached.values;
      return [];
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
}

function sanitizeCell(val: any): string {
  if (val === null || val === undefined) return '';
  const str = typeof val === 'string' ? val : (typeof val === 'object' ? JSON.stringify(val) : String(val));
  if (str.length > 45000) {
    return str.slice(0, 45000);
  }
  return str;
}

/**
 * Write/overwrite values in a range in Google Sheets
 */
export async function writeSheetValues(accessToken: string, spreadsheetId: string, range: string, values: any[][]): Promise<boolean> {
  try {
    const sanitizedValues = values.map(row => row.map(sanitizeCell));
    let res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: sanitizedValues }),
    });

    if (!res.ok) {
      const err = await res.json();
      const sheetTitle = range.split('!')[0].replace(/'/g, '');
      if (err.error?.message?.includes('Unable to parse range') && sheetTitle) {
        const created = await ensureSheetTabExists(accessToken, spreadsheetId, sheetTitle);
        if (created) {
          res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ values: sanitizedValues }),
          });
          if (res.ok) return true;
        }
      }
      throw new Error(err.error?.message || `Failed to write values to range ${range}`);
    }

    return true;
  } catch (error) {
    console.error(`Error writing Google Sheet range ${range}:`, error);
    throw error;
  }
}

/**
 * Append row(s) to a Google Sheet tab
 */
export async function appendSheetValues(accessToken: string, spreadsheetId: string, range: string, values: any[][]): Promise<boolean> {
  try {
    const sanitizedValues = values.map(row => row.map(sanitizeCell));
    let res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: sanitizedValues }),
    });

    if (!res.ok) {
      const err = await res.json();
      const sheetTitle = range.split('!')[0].replace(/'/g, '');
      if (err.error?.message?.includes('Unable to parse range') && sheetTitle) {
        const created = await ensureSheetTabExists(accessToken, spreadsheetId, sheetTitle);
        if (created) {
          res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ values: sanitizedValues }),
          });
          if (res.ok) return true;
        }
      }
      throw new Error(err.error?.message || `Failed to append values to ${range}`);
    }

    return true;
  } catch (error) {
    console.error(`Error appending to Google Sheet range ${range}:`, error);
    throw error;
  }
}

/**
 * Sync full products array to Google Sheet
 */
export async function syncProductsToSheet(accessToken: string, spreadsheetId: string, products: Product[]): Promise<boolean> {
  const header = ['ProductID', 'Name', 'Category', 'Description', 'Material', 'Specification', 'Size', 'Dimensions', 'Image', 'Gallery'];
  const rows = products.map((p) => [
    p.id,
    p.name,
    p.category,
    p.description || '',
    p.material || '',
    p.specification || '',
    p.size || '',
    p.dimensions || '',
    p.image || '',
    Array.isArray(p.gallery) ? JSON.stringify(p.gallery) : ''
  ]);

  const allValues = [header, ...rows];
  return writeSheetValues(accessToken, spreadsheetId, 'Products!A1:J1000', allValues);
}

/**
 * Fetch products from Google Sheet tab
 */
export async function fetchProductsFromSheet(accessToken: string, spreadsheetId: string): Promise<Product[]> {
  const rows = await readSheetValues(accessToken, spreadsheetId, 'Products!A2:J1000');
  if (!rows || rows.length === 0) return [];

  return rows.filter(r => r && r[0]).map((r, index) => {
    let galleryArr: string[] = [];
    if (r[9]) {
      try {
        galleryArr = typeof r[9] === 'string' && r[9].startsWith('[') ? JSON.parse(r[9]) : [r[9]];
      } catch (e) {
        galleryArr = [r[9]];
      }
    }

    return {
      id: r[0] || `sheet_prod_${index}`,
      name: r[1] || 'Product',
      category: r[2] || 'Interior Doors',
      description: r[3] || '',
      material: r[4] || 'Natural Solid Wood / Engineered Timber',
      specification: r[5] || 'High Durability Standard',
      size: r[6] || 'Custom Made to Measure',
      dimensions: r[7] || '',
      image: r[8] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80',
      gallery: galleryArr.length > 0 ? galleryArr : [r[8] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80'],
    };
  });
}

/**
 * Sync full projects array to Google Sheet
 */
export async function syncProjectsToSheet(accessToken: string, spreadsheetId: string, projects: Project[]): Promise<boolean> {
  const header = ['ProjectID', 'Title', 'Category', 'Location', 'Area', 'CompletionYear', 'Description', 'CoverImage'];
  const rows = projects.map((p) => [
    p.id,
    p.title,
    p.category,
    p.location || '',
    p.area || '',
    p.completionYear || '',
    p.description || '',
    p.coverImage || ''
  ]);

  const allValues = [header, ...rows];
  return writeSheetValues(accessToken, spreadsheetId, 'Projects!A1:H1000', allValues);
}

/**
 * Fetch projects from Google Sheet tab
 */
export async function fetchProjectsFromSheet(accessToken: string, spreadsheetId: string): Promise<Project[]> {
  const rows = await readSheetValues(accessToken, spreadsheetId, 'Projects!A2:H1000');
  if (!rows || rows.length === 0) return [];

  return rows.filter(r => r && r[0]).map((r, index) => {
    return {
      id: r[0] || `sheet_proj_${index}`,
      title: r[1] || 'Project',
      category: (r[2] || 'Interior Fit-Out') as any,
      location: r[3] || 'Phnom Penh, Cambodia',
      area: r[4] || '1,000 sqm',
      completionYear: r[5] || '2025',
      description: r[6] || '',
      coverImage: r[7] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80',
      gallery: [r[7] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80'],
      constructionType: 'Turnkey Architectural Doors & Joinery'
    };
  });
}

/**
 * Sync Blogs array to Google Sheet
 */
export async function syncBlogsToSheet(accessToken: string, spreadsheetId: string, blogs: BlogPost[]): Promise<boolean> {
  const header = ['BlogID', 'Title', 'Excerpt', 'Content', 'Category', 'Author', 'Image'];
  const rows = blogs.map((b) => [
    b.id,
    b.title,
    b.excerpt || '',
    b.content || '',
    b.category || 'General Insights',
    b.author || 'Corporate Admin',
    b.image || ''
  ]);

  const allValues = [header, ...rows];
  return writeSheetValues(accessToken, spreadsheetId, 'Blog!A1:G1000', allValues);
}

/**
 * Fetch blogs from Google Sheet tab
 */
export async function fetchBlogsFromSheet(accessToken: string, spreadsheetId: string): Promise<BlogPost[]> {
  const rows = await readSheetValues(accessToken, spreadsheetId, 'Blog!A2:G1000');
  if (!rows || rows.length === 0) return [];

  return rows.filter(r => r && r[0]).map((r, index) => {
    return {
      id: r[0] || `sheet_blog_${index}`,
      title: r[1] || 'Article Title',
      excerpt: r[2] || '',
      content: r[3] || '',
      category: r[4] || 'General Insights',
      author: r[5] || 'Corporate Administrator',
      image: r[6] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80',
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };
  });
}

/**
 * Sync Categories to Google Sheet
 */
export async function syncCategoriesToSheet(accessToken: string, spreadsheetId: string, categories: CategoryItem[]): Promise<boolean> {
  const header = ['CategoryID', 'Name', 'Type'];
  const rows = categories.map((c) => [
    c.id,
    c.name,
    c.type || 'product'
  ]);

  const allValues = [header, ...rows];
  return writeSheetValues(accessToken, spreadsheetId, 'Categories!A1:C1000', allValues);
}

/**
 * Fetch categories from Google Sheet tab
 */
export async function fetchCategoriesFromSheet(accessToken: string, spreadsheetId: string): Promise<CategoryItem[]> {
  const rows = await readSheetValues(accessToken, spreadsheetId, 'Categories!A2:C1000');
  if (!rows || rows.length === 0) return [];

  return rows.filter(r => r && r[0]).map((r, index) => {
    return {
      id: r[0] || `sheet_cat_${index}`,
      name: r[1] || 'Category',
      type: r[2] || 'product'
    };
  });
}

/**
 * Sync contact messages to Google Sheet
 */
export async function syncMessagesToSheet(accessToken: string, spreadsheetId: string, messages: ContactMessage[]): Promise<boolean> {
  const header = ['MessageID', 'Name', 'Email', 'Phone', 'Company', 'Subject', 'Message', 'Date'];
  const rows = messages.map((m) => [
    m.id,
    m.name,
    m.email,
    m.phone,
    m.company || '',
    m.subject || '',
    m.message || '',
    m.date || new Date().toISOString()
  ]);

  const allValues = [header, ...rows];
  return writeSheetValues(accessToken, spreadsheetId, 'ContactMessages!A1:H1000', allValues);
}

/**
 * Sync Company Info to Google Sheet
 */
export async function syncCompanyInfoToSheet(accessToken: string, spreadsheetId: string, companyInfo: any): Promise<boolean> {
  const header = ['Key', 'Value'];
  const rows = Object.entries(companyInfo || {}).map(([k, v]) => [
    k,
    typeof v === 'object' ? JSON.stringify(v) : String(v || '')
  ]);

  const allValues = [header, ...rows];
  return writeSheetValues(accessToken, spreadsheetId, 'CompanyInfo!A1:B100', allValues);
}

/**
 * Sync Homepage CMS to Google Sheet (Homepage_CMS tab)
 */
export async function syncHomepageToSheet(accessToken: string, spreadsheetId: string, homepageData: any): Promise<boolean> {
  const header = ['Key', 'Value'];
  const rows = Object.entries(homepageData || {}).map(([k, v]) => [
    k,
    typeof v === 'object' ? JSON.stringify(v) : String(v || '')
  ]);

  const allValues = [header, ...rows];
  return writeSheetValues(accessToken, spreadsheetId, 'Homepage_CMS!A1:B100', allValues);
}

/**
 * Sync Services Page CMS to Google Sheet (Services_CMS tab)
 */
export async function syncServicesToSheet(accessToken: string, spreadsheetId: string, servicesData: any): Promise<boolean> {
  const header = ['Key', 'Value'];
  const rows = Object.entries(servicesData || {}).map(([k, v]) => [
    k,
    typeof v === 'object' ? JSON.stringify(v) : String(v || '')
  ]);

  const allValues = [header, ...rows];
  return writeSheetValues(accessToken, spreadsheetId, 'Services_CMS!A1:B100', allValues);
}

/**
 * Sync About Us CMS to Google Sheet (About_CMS tab)
 */
export async function syncAboutToSheet(accessToken: string, spreadsheetId: string, aboutData: any): Promise<boolean> {
  const header = ['Key', 'Value'];
  const rows = Object.entries(aboutData || {}).map(([k, v]) => [
    k,
    typeof v === 'object' ? JSON.stringify(v) : String(v || '')
  ]);

  const allValues = [header, ...rows];
  return writeSheetValues(accessToken, spreadsheetId, 'About_CMS!A1:B100', allValues);
}

/**
 * Sync Testimonials to Google Sheet (Testimonials tab)
 */
export async function syncTestimonialsToSheet(accessToken: string, spreadsheetId: string, testimonials: TestimonialItem[]): Promise<boolean> {
  const header = ['TestimonialID', 'Author', 'Role', 'Company', 'Quote EN', 'Rating', 'Avatar', 'Status', 'IsFeatured', 'CreatedAt', 'Quote KH', 'Quote KO'];
  const rows = testimonials.map((t) => [
    t.id,
    t.author || '',
    t.role || '',
    t.company || '',
    t.Quote_EN || t.quote || '',
    t.rating || 5,
    t.avatar || '',
    t.status || 'APPROVED',
    t.isFeatured ? 'YES' : 'NO',
    t.date || new Date().toISOString().split('T')[0],
    t.Quote_KH || '',
    t.Quote_KO || ''
  ]);

  const allValues = [header, ...rows];
  return writeSheetValues(accessToken, spreadsheetId, 'Testimonials!A1:L500', allValues);
}

/**
 * Append a new Testimonial to Google Sheet (Testimonials tab)
 */
export async function appendTestimonialToSheet(accessToken: string, spreadsheetId: string, item: TestimonialItem): Promise<boolean> {
  try {
    const existing = await readSheetValues(accessToken, spreadsheetId, 'Testimonials!A2:L500').catch(() => []);
    const row = [
      item.id,
      item.author || '',
      item.role || '',
      item.company || '',
      item.Quote_EN || item.quote || '',
      item.rating || 5,
      item.avatar || '',
      item.status || 'PENDING',
      item.isFeatured ? 'YES' : 'NO',
      item.date || new Date().toISOString().split('T')[0],
      item.Quote_KH || '',
      item.Quote_KO || ''
    ];
    const header = ['TestimonialID', 'Author', 'Role', 'Company', 'Quote EN', 'Rating', 'Avatar', 'Status', 'IsFeatured', 'CreatedAt', 'Quote KH', 'Quote KO'];
    const allValues = existing.length > 0 ? [header, ...existing, row] : [header, row];
    return writeSheetValues(accessToken, spreadsheetId, `Testimonials!A1:L${allValues.length}`, allValues);
  } catch (err) {
    console.warn('[appendTestimonialToSheet] Failed to append testimonial:', err);
    return false;
  }
}

/**
 * Sync ALL data to Google Sheet in bulk
 */
export async function syncAllDataToSheet(
  accessToken: string,
  spreadsheetId: string,
  data: {
    products: Product[];
    projects: Project[];
    blogs?: BlogPost[];
    categories?: CategoryItem[];
    messages?: ContactMessage[];
    companyInfo?: any;
    homepageData?: any;
    servicesData?: any;
    aboutData?: any;
    testimonials?: TestimonialItem[];
  }
): Promise<boolean> {
  await syncProductsToSheet(accessToken, spreadsheetId, data.products);
  await syncProjectsToSheet(accessToken, spreadsheetId, data.projects);
  if (data.blogs) {
    await syncBlogsToSheet(accessToken, spreadsheetId, data.blogs);
  }
  if (data.categories) {
    await syncCategoriesToSheet(accessToken, spreadsheetId, data.categories);
  }
  if (data.messages) {
    await syncMessagesToSheet(accessToken, spreadsheetId, data.messages);
  }
  if (data.companyInfo) {
    await syncCompanyInfoToSheet(accessToken, spreadsheetId, data.companyInfo);
  }
  if (data.homepageData) {
    await syncHomepageToSheet(accessToken, spreadsheetId, data.homepageData);
  }
  if (data.servicesData) {
    await syncServicesToSheet(accessToken, spreadsheetId, data.servicesData);
  }
  if (data.aboutData) {
    await syncAboutToSheet(accessToken, spreadsheetId, data.aboutData);
  }
  if (data.testimonials) {
    await syncTestimonialsToSheet(accessToken, spreadsheetId, data.testimonials);
  }
  return true;
}

/**
 * Fetch messages from ContactMessages tab
 */
export async function fetchMessagesFromSheet(accessToken: string, spreadsheetId: string): Promise<ContactMessage[]> {
  const rows = await readSheetValues(accessToken, spreadsheetId, 'ContactMessages!A2:H1000');
  if (!rows || rows.length === 0) return [];

  return rows.filter(r => r && r[0]).map((r, index) => ({
    id: r[0] || `msg_${index}`,
    name: r[1] || '',
    email: r[2] || '',
    phone: r[3] || '',
    company: r[4] || '',
    subject: r[5] || '',
    message: r[6] || '',
    date: r[7] || new Date().toISOString(),
    status: 'New'
  }));
}

/**
 * Fetch company info key-value pairs from CompanyInfo tab
 */
export async function fetchCompanyInfoFromSheet(accessToken: string, spreadsheetId: string): Promise<Record<string, any>> {
  const rows = await readSheetValues(accessToken, spreadsheetId, 'CompanyInfo!A2:B100');
  if (!rows || rows.length === 0) return {};

  const info: Record<string, any> = {};
  rows.forEach(r => {
    if (r && r[0]) {
      const key = String(r[0]).trim();
      let val = r[1] !== undefined ? String(r[1]) : '';
      if (val.startsWith('{') || val.startsWith('[')) {
        try {
          val = JSON.parse(val);
        } catch (e) {
          // Keep as string
        }
      }
      info[key] = val;
    }
  });
  return info;
}

/**
 * Fetch translations from Translations tab
 */
export async function fetchTranslationsFromSheet(accessToken: string, spreadsheetId: string): Promise<TranslationRow[]> {
  const rows = await readSheetValues(accessToken, spreadsheetId, 'Translations!A2:D1000');
  if (!rows || rows.length === 0) return [];

  return rows.filter(r => r && r[0]).map(r => ({
    Key: r[0] || '',
    English: r[1] || '',
    Khmer: r[2] || '',
    Korean: r[3] || ''
  }));
}

/**
 * Fetch Homepage CMS key-value object from Homepage_CMS tab
 */
export async function fetchHomepageFromSheet(accessToken: string, spreadsheetId: string): Promise<Record<string, any>> {
  const rows = await readSheetValues(accessToken, spreadsheetId, 'Homepage_CMS!A2:B100');
  if (!rows || rows.length === 0) return {};

  const info: Record<string, any> = {};
  rows.forEach(r => {
    if (r && r[0]) {
      const key = String(r[0]).trim();
      let val = r[1] !== undefined ? String(r[1]) : '';
      if (val.startsWith('{') || val.startsWith('[')) {
        try {
          val = JSON.parse(val);
        } catch (e) {
          // Keep as string
        }
      }
      info[key] = val;
    }
  });
  return info;
}

/**
 * Fetch Services Page CMS key-value object from Services_CMS tab
 */
export async function fetchServicesFromSheet(accessToken: string, spreadsheetId: string): Promise<Record<string, any>> {
  const rows = await readSheetValues(accessToken, spreadsheetId, 'Services_CMS!A2:B100');
  if (!rows || rows.length === 0) return {};

  const info: Record<string, any> = {};
  rows.forEach(r => {
    if (r && r[0]) {
      const key = String(r[0]).trim();
      let val = r[1] !== undefined ? String(r[1]) : '';
      if (val.startsWith('{') || val.startsWith('[')) {
        try {
          val = JSON.parse(val);
        } catch (e) {
          // Keep as string
        }
      }
      info[key] = val;
    }
  });
  return info;
}

/**
 * Fetch About Us CMS key-value object from About_CMS tab
 */
export async function fetchAboutFromSheet(accessToken: string, spreadsheetId: string): Promise<Record<string, any>> {
  const rows = await readSheetValues(accessToken, spreadsheetId, 'About_CMS!A2:B100');
  if (!rows || rows.length === 0) return {};

  const info: Record<string, any> = {};
  rows.forEach(r => {
    if (r && r[0]) {
      const key = String(r[0]).trim();
      let val = r[1] !== undefined ? String(r[1]) : '';
      if (val.startsWith('{') || val.startsWith('[')) {
        try {
          val = JSON.parse(val);
        } catch (e) {
          // Keep as string
        }
      }
      info[key] = val;
    }
  });
  return info;
}

/**
 * Fetch ALL sheets data directly via Google Sheets API (in 1 single batchGet request)
 */
export async function fetchAllSheetsDataDirectly(accessToken: string, spreadsheetId: string) {
  const ranges = [
    'Products!A2:J500',
    'Projects!A2:H500',
    'Blog!A2:G500',
    'Categories!A2:C200',
    'ContactMessages!A2:I500',
    'CompanyInfo!A2:B100',
    'Translations!A2:D1000',
    'Homepage_CMS!A2:B100',
    'Services_CMS!A2:B100',
    'About_CMS!A2:B100',
    'Testimonials!A2:L500'
  ];

  const batchResults = await batchReadSheetValues(accessToken, spreadsheetId, ranges);

  // Products
  const productRows = batchResults['Products!A2:J500'] || [];
  const products: Product[] = productRows.filter(r => r && r[0]).map(r => ({
    id: r[0] || '',
    name: r[1] || '',
    category: r[2] || '',
    description: r[3] || '',
    material: r[4] || '',
    specification: r[5] || '',
    size: r[6] || '',
    dimensions: r[7] || '',
    image: r[8] || '',
    gallery: r[9] ? (typeof r[9] === 'string' && r[9].startsWith('[') ? JSON.parse(r[9]) : [r[9]]) : []
  }));

  // Projects
  const projectRows = batchResults['Projects!A2:H500'] || [];
  const projects: Project[] = projectRows.filter(r => r && r[0]).map((r, index) => ({
    id: r[0] || `sheet_proj_${index}`,
    title: r[1] || 'Project',
    category: (r[2] || 'Interior Fit-Out') as any,
    location: r[3] || 'Phnom Penh, Cambodia',
    area: r[4] || '1,000 sqm',
    completionYear: r[5] || '2025',
    description: r[6] || '',
    coverImage: r[7] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80',
    gallery: [r[7] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80'],
    constructionType: 'Turnkey Architectural Doors & Joinery'
  }));

  // Blogs
  const blogRows = batchResults['Blog!A2:G500'] || [];
  const blogs: BlogPost[] = blogRows.filter(r => r && r[0]).map((r, index) => ({
    id: r[0] || `sheet_blog_${index}`,
    title: r[1] || 'Article Title',
    excerpt: r[2] || '',
    content: r[3] || '',
    category: r[4] || 'General Insights',
    author: r[5] || 'Corporate Administrator',
    image: r[6] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }));

  // Categories
  const catRows = batchResults['Categories!A2:C200'] || [];
  const categories: CategoryItem[] = catRows.filter(r => r && r[0]).map((r, index) => ({
    id: r[0] || `sheet_cat_${index}`,
    name: r[1] || 'Category',
    type: r[2] || 'product'
  }));

  // Messages
  const msgRows = batchResults['ContactMessages!A2:I500'] || [];
  const messages: ContactMessage[] = msgRows.filter(r => r && r[0]).map((r, index) => ({
    id: r[0] || `sheet_msg_${index}`,
    name: r[1] || 'Inquirer',
    fullName: r[1] || 'Inquirer',
    email: r[2] || '',
    phone: r[3] || '',
    company: r[8] || r[4] || '',
    subject: r[4] || '',
    message: r[5] || '',
    createdAt: r[6] || new Date().toISOString(),
    date: r[6] || new Date().toLocaleDateString('en-US'),
    status: (r[7] as any) || 'New'
  }));

  // CompanyInfo
  const infoRows = batchResults['CompanyInfo!A2:B100'] || [];
  const companyInfo: Record<string, any> = {};
  infoRows.forEach(r => {
    if (r && r[0]) {
      const key = String(r[0]).trim();
      let val = r[1] !== undefined ? String(r[1]) : '';
      if (val.startsWith('{') || val.startsWith('[')) {
        try { val = JSON.parse(val); } catch (e) {}
      }
      companyInfo[key] = val;
    }
  });

  // Translations
  const transRows = batchResults['Translations!A2:D1000'] || [];
  const translations: TranslationRow[] = transRows.filter(r => r && r[0]).map(r => ({
    Key: r[0] || '',
    English: r[1] || '',
    Khmer: r[2] || '',
    Korean: r[3] || ''
  }));

  // Homepage CMS
  const homeRows = batchResults['Homepage_CMS!A2:B100'] || [];
  const homepageCMS: Record<string, any> = {};
  homeRows.forEach(r => {
    if (r && r[0]) {
      const key = String(r[0]).trim();
      let val = r[1] !== undefined ? String(r[1]) : '';
      if (val.startsWith('{') || val.startsWith('[')) {
        try { val = JSON.parse(val); } catch (e) {}
      }
      homepageCMS[key] = val;
    }
  });

  // Services CMS
  const servRows = batchResults['Services_CMS!A2:B100'] || [];
  const servicesCMS: Record<string, any> = {};
  servRows.forEach(r => {
    if (r && r[0]) {
      const key = String(r[0]).trim();
      let val = r[1] !== undefined ? String(r[1]) : '';
      if (val.startsWith('{') || val.startsWith('[')) {
        try { val = JSON.parse(val); } catch (e) {}
      }
      servicesCMS[key] = val;
    }
  });

  // About CMS
  const abtRows = batchResults['About_CMS!A2:B100'] || [];
  const aboutCMS: Record<string, any> = {};
  abtRows.forEach(r => {
    if (r && r[0]) {
      const key = String(r[0]).trim();
      let val = r[1] !== undefined ? String(r[1]) : '';
      if (val.startsWith('{') || val.startsWith('[')) {
        try { val = JSON.parse(val); } catch (e) {}
      }
      aboutCMS[key] = val;
    }
  });

  // Testimonials
  const testiRows = batchResults['Testimonials!A2:L500'] || [];
  const testimonials: TestimonialItem[] = testiRows.filter(r => r && r[0]).map((r, index) => ({
    id: r[0] || `testi_${index}`,
    author: r[1] || '',
    role: r[2] || '',
    company: r[3] || '',
    quote: r[4] || '',
    rating: Number(r[5] || 5),
    avatar: r[6] || '',
    status: (r[7] || 'APPROVED').toUpperCase(),
    isFeatured: String(r[8]).toUpperCase() === 'YES' || String(r[8]).toLowerCase() === 'true',
    date: r[9] || new Date().toISOString().split('T')[0],
    Quote_EN: r[4] || '',
    Quote_KH: r[10] || '',
    Quote_KO: r[11] || ''
  }));

  return {
    products,
    projects,
    blogs,
    categories,
    messages,
    companyInfo,
    translations,
    homepageCMS,
    servicesCMS,
    aboutCMS,
    testimonials
  };
}



