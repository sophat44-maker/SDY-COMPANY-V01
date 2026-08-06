import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Product, formatDriveUrl } from '../types';
import { transformGoogleDriveUrl } from './googleDrive';
import sdyLogoImg from '../assets/images/sdy_official_logo_v2_1784772926599.jpg';

// Luxury Brand Color Palette
const COLOR_DARK_NAVY = '#0A1128';    // Midnight Blue / Near Black
const COLOR_GOLD = '#C5A880';         // Champagne Luxury Gold
const COLOR_LIGHT_GRAY = '#F4F5F6';   // Soft Architectural White-Gray
const COLOR_BORDER_GRAY = '#E5E7EB';  // Elegant Fine Divider Color
const COLOR_TEXT_CHARCOAL = '#2D3748'; // Highly Readable Charcoal Text
const COLOR_TEXT_MUTED = '#718096';    // Sophisticated Soft Gray Text
const COLOR_SDY_BLUE = '#0A4DA3';     // SDY Brand Blue

// Standard Clean English Labels for PDF Technical Datasheets
const TEXT_MAPS = {
  en: {
    brandSubtitle: 'CONSTRUCTION • INTERIOR DESIGN • FURNITURE',
    premiumCollection: 'PREMIUM JOINERY & ARCHITECTURAL SYSTEMS',
    designDialogue: 'DESIGN DIALOGUE & PHILOSOPHY',
    specifications: 'SYSTEM SPECIFICATIONS',
    portfolioVisuals: 'EDITORIAL PORTFOLIO & VISUALS',
    integration: 'ARCHITECTURAL INTEGRATION & SECTORS',
    compliance: 'COMPLIANCE & CRAFTSMANSHIP AUTHENTICITY',
    scanToExplore: 'SCAN TO EXPLORE COLLECTION',
    material: 'Material',
    construction: 'Construction',
    acoustic: 'Acoustic Rating',
    fireRating: 'Fire Performance',
    dimensions: 'Standard Size',
    finish: 'Finish / Coating',
    architecturalDrawing: 'ARCHITECTURAL SCHEMATIC ILLUSTRATION',
    scaleText: 'SCALE 1:20 • ALL DIMENSIONS IN MM',
    residential: 'RESIDENTIAL',
    hotel: 'HOTEL & SPA',
    office: 'EXECUTIVE OFFICE',
    villa: 'LUXURY VILLA',
    commercial: 'COMMERCIAL',
    certifiedQuality: 'ISO 9001 QUALITY SYSTEM',
    certifiedFire: 'UL FIRE PERFORMANCE CERTIFIED',
    certifiedAcoustic: 'ASTM E90 ACOUSTIC APPROVED',
    certifiedSteel: 'ASTM STRUCTURAL STANDARDS',
    certifiedEco: 'SUSTAINABLE RESOURCE ECO-LABEL',
    footerAddress: 'SDY C&I Corporate Tower, Phnom Penh, Kingdom of Cambodia',
    footerContact: 'Web: www.sdy-ci.com | Email: info@sdy-ci.com | Tel: +855 23 888 999',
    copyright: '© SDY Company C&I. All rights reserved. Registered Trademark.'
  },
  km: {
    brandSubtitle: 'CONSTRUCTION • INTERIOR DESIGN • FURNITURE',
    premiumCollection: 'PREMIUM JOINERY & ARCHITECTURAL SYSTEMS',
    designDialogue: 'DESIGN DIALOGUE & PHILOSOPHY',
    specifications: 'SYSTEM SPECIFICATIONS',
    portfolioVisuals: 'EDITORIAL PORTFOLIO & VISUALS',
    integration: 'ARCHITECTURAL INTEGRATION & SECTORS',
    compliance: 'COMPLIANCE & CRAFTSMANSHIP AUTHENTICITY',
    scanToExplore: 'SCAN TO EXPLORE COLLECTION',
    material: 'Material',
    construction: 'Construction',
    acoustic: 'Acoustic Rating',
    fireRating: 'Fire Performance',
    dimensions: 'Standard Size',
    finish: 'Finish / Coating',
    architecturalDrawing: 'ARCHITECTURAL SCHEMATIC ILLUSTRATION',
    scaleText: 'SCALE 1:20 • ALL DIMENSIONS IN MM',
    residential: 'RESIDENTIAL',
    hotel: 'HOTEL & SPA',
    office: 'EXECUTIVE OFFICE',
    villa: 'LUXURY VILLA',
    commercial: 'COMMERCIAL',
    certifiedQuality: 'ISO 9001 QUALITY SYSTEM',
    certifiedFire: 'UL FIRE PERFORMANCE CERTIFIED',
    certifiedAcoustic: 'ASTM E90 ACOUSTIC APPROVED',
    certifiedSteel: 'ASTM STRUCTURAL STANDARDS',
    certifiedEco: 'SUSTAINABLE RESOURCE ECO-LABEL',
    footerAddress: 'SDY C&I Corporate Tower, Phnom Penh, Kingdom of Cambodia',
    footerContact: 'Web: www.sdy-ci.com | Email: info@sdy-ci.com | Tel: +855 23 888 999',
    copyright: '© SDY Company C&I. All rights reserved. Registered Trademark.'
  },
  ko: {
    brandSubtitle: 'CONSTRUCTION • INTERIOR DESIGN • FURNITURE',
    premiumCollection: 'PREMIUM JOINERY & ARCHITECTURAL SYSTEMS',
    designDialogue: 'DESIGN DIALOGUE & PHILOSOPHY',
    specifications: 'SYSTEM SPECIFICATIONS',
    portfolioVisuals: 'EDITORIAL PORTFOLIO & VISUALS',
    integration: 'ARCHITECTURAL INTEGRATION & SECTORS',
    compliance: 'COMPLIANCE & CRAFTSMANSHIP AUTHENTICITY',
    scanToExplore: 'SCAN TO EXPLORE COLLECTION',
    material: 'Material',
    construction: 'Construction',
    acoustic: 'Acoustic Rating',
    fireRating: 'Fire Performance',
    dimensions: 'Standard Size',
    finish: 'Finish / Coating',
    architecturalDrawing: 'ARCHITECTURAL SCHEMATIC ILLUSTRATION',
    scaleText: 'SCALE 1:20 • ALL DIMENSIONS IN MM',
    residential: 'RESIDENTIAL',
    hotel: 'HOTEL & SPA',
    office: 'EXECUTIVE OFFICE',
    villa: 'LUXURY VILLA',
    commercial: 'COMMERCIAL',
    certifiedQuality: 'ISO 9001 QUALITY SYSTEM',
    certifiedFire: 'UL FIRE PERFORMANCE CERTIFIED',
    certifiedAcoustic: 'ASTM E90 ACOUSTIC APPROVED',
    certifiedSteel: 'ASTM STRUCTURAL STANDARDS',
    certifiedEco: 'SUSTAINABLE RESOURCE ECO-LABEL',
    footerAddress: 'SDY C&I Corporate Tower, Phnom Penh, Kingdom of Cambodia',
    footerContact: 'Web: www.sdy-ci.com | Email: info@sdy-ci.com | Tel: +855 86​​ 949286',
    copyright: '© SDY Company C&I. All rights reserved. Registered Trademark.'
  }
};

/**
 * Dynamically renders the official SDY Logo to a Base64 PNG image
 * Loading the high resolution official brand logo asset.
 */
export interface SdyLogoData {
  base64: string;
  aspect: number;
}

export function generateSdyLogoData(): Promise<SdyLogoData> {
  return new Promise((resolve) => {
    const customLogo = typeof window !== 'undefined' ? localStorage.getItem('sdy_custom_logo') : null;
    const logoSrc = customLogo || sdyLogoImg;

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const naturalW = image.naturalWidth || image.width || 400;
      const naturalH = image.naturalHeight || image.height || 300;
      const aspect = naturalW / naturalH;

      const maxDim = 800;
      let w = naturalW;
      let h = naturalH;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((maxDim / w) * h);
          w = maxDim;
        } else {
          w = Math.round((maxDim / h) * w);
          h = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const context = canvas.getContext('2d');
      if (context) {
        context.clearRect(0, 0, w, h);
        context.drawImage(image, 0, 0, w, h);
        resolve({ base64: canvas.toDataURL('image/png'), aspect });
      } else {
        resolve({ base64: '', aspect: 1.25 });
      }
    };
    image.onerror = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0A4DA3';
        ctx.fillRect(0, 0, 400, 300);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SDY C&I', 200, 162);
        resolve({ base64: canvas.toDataURL('image/png'), aspect: 400 / 300 });
      } else {
        resolve({ base64: '', aspect: 1.25 });
      }
    };
    image.src = logoSrc;
  });
}

export async function generateSdyLogo(): Promise<string> {
  const data = await generateSdyLogoData();
  return data.base64;
}

/**
 * Standardizes images, drawing them with premium rounded corners and clean rendering
 * Falling back seamlessly to vector illustrations if Unsplash has CORS blocks.
 */
export function generateRoundedProductImage(url: string, width = 600, height = 450): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (context) {
        // Draw highly polished rounded rectangle clipping mask
        context.beginPath();
        const r = 16; // Elegant 16px corners
        context.moveTo(r, 0);
        context.lineTo(width - r, 0);
        context.quadraticCurveTo(width, 0, width, r);
        context.lineTo(width, height - r);
        context.quadraticCurveTo(width, height, width - r, height);
        context.lineTo(r, height);
        context.quadraticCurveTo(0, height, 0, height - r);
        context.lineTo(0, r);
        context.quadraticCurveTo(0, 0, r, 0);
        context.closePath();
        context.clip();
        
        // Dynamic cover sizing aspect-ratio math
        const imgAspect = img.width / img.height;
        const canvasAspect = width / height;
        let dw, dh, dx, dy;
        
        if (imgAspect > canvasAspect) {
          dh = height;
          dw = height * imgAspect;
          dx = (width - dw) / 2;
          dy = 0;
        } else {
          dw = width;
          dh = width / imgAspect;
          dx = 0;
          dy = (height - dh) / 2;
        }
        
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, width, height);
        context.drawImage(img, dx, dy, dw, dh);
        
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      } else {
        resolve('');
      }
    };
    img.onerror = () => {
      resolve('');
    };
    img.src = url;
  });
}

export function loadImageAsBase64(url: string | null | undefined): Promise<{ base64: string; aspect: number } | null> {
  return new Promise((resolve) => {
    if (!url || url === '#' || !url.trim()) return resolve(null);
    const formattedUrl = transformGoogleDriveUrl(url) || formatDriveUrl(url) || url;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const w = img.naturalWidth || img.width || 800;
        const h = img.naturalHeight || img.height || 600;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0);
          const aspect = w / h;
          resolve({ base64: canvas.toDataURL('image/jpeg', 0.95), aspect });
          return;
        }
      } catch (e) {
        console.warn('Canvas conversion error in loadImageAsBase64:', e);
      }
      resolve(null);
    };
    img.onerror = () => resolve(null);
    img.src = formattedUrl;
  });
}

// =========================================================================
// PREMIUM FINE-LINE VECTOR ILLUSTRATIONS (ARCHITECTURAL / BLUEPRINT STYLE)
// =========================================================================

function drawBespokeArchitecturalDrawing(doc: jsPDF, x: number, y: number, width: number, height: number, category: string, langText: any) {
  // Fine background grid for a bespoke engineering look
  doc.setFillColor('#FAFBFB');
  doc.rect(x, y, width, height, 'F');
  
  doc.setDrawColor('#ECEEF0');
  doc.setLineWidth(0.1);
  const gridSpacing = 4;
  for (let gx = x + gridSpacing; gx < x + width; gx += gridSpacing) {
    doc.line(gx, y, gx, y + height);
  }
  for (let gy = y + gridSpacing; gy < y + height; gy += gridSpacing) {
    doc.line(x, gy, x + width, gy);
  }

  // Double gold and navy border frame
  doc.setDrawColor(COLOR_BORDER_GRAY);
  doc.setLineWidth(0.2);
  doc.rect(x, y, width, height, 'S');
  
  doc.setDrawColor(COLOR_GOLD);
  doc.setLineWidth(0.35);
  doc.rect(x + 2, y + 2, width - 4, height - 4, 'S');

  // Draw delicate vector line illustration based on product category
  const cx = x + width / 2;
  const cy = y + height / 2 - 4;
  doc.setDrawColor(COLOR_DARK_NAVY);
  
  if (category === 'Doors') {
    // Elegant Architectural Double Door Blueprint with swing arcs
    doc.setLineWidth(0.6);
    doc.rect(cx - 24, cy - 18, 48, 36, 'S'); // Outer frame
    
    // Meeting stiles and door leaves
    doc.setLineWidth(0.3);
    doc.line(cx, cy - 18, cx, cy + 18); // Center seam
    doc.rect(cx - 21, cy - 15, 18, 30, 'S'); // Left panel
    doc.rect(cx + 3, cy - 15, 18, 30, 'S'); // Right panel
    
    // Hinges and handle vectors
    doc.setLineWidth(0.8);
    doc.line(cx - 2, cy - 1, cx - 2, cy + 3); // Minimal elegant handles
    doc.line(cx + 2, cy - 1, cx + 2, cy + 3);
    
    // Swing projection arcs (Dashed delicate gold lines)
    doc.setDrawColor(COLOR_GOLD);
    doc.setLineWidth(0.25);
    doc.line(cx - 24, cy + 18, cx - 36, cy + 6); // Slanted door open projection
    doc.line(cx + 24, cy + 18, cx + 36, cy + 6);
    
    // Hinge indicator centerline
    doc.setDrawColor(COLOR_SDY_BLUE);
    doc.line(cx, cy - 20, cx, cy - 22);
    doc.line(cx, cy + 20, cx, cy + 22);
  } 
  else if (category === 'Furniture') {
    // Beautiful isometric projection of executive desk
    doc.setLineWidth(0.45);
    // Table top
    doc.line(cx - 22, cy - 4, cx, cy - 13);
    doc.line(cx, cy - 13, cx + 22, cy - 4);
    doc.line(cx + 22, cy - 4, cx, cy + 5);
    doc.line(cx, cy + 5, cx - 22, cy - 4);
    
    doc.line(cx - 22, cy - 2, cx, cy + 7); // Top edge thickness
    doc.line(cx, cy + 7, cx + 22, cy - 2);
    doc.line(cx - 22, cy - 4, cx - 22, cy - 2);
    doc.line(cx, cy + 5, cx, cy + 7);
    doc.line(cx + 22, cy - 4, cx + 22, cy - 2);

    // Legs and support panels
    doc.setLineWidth(0.3);
    doc.line(cx - 18, cy - 1, cx - 18, cy + 14);
    doc.line(cx - 16, cy, cx - 16, cy + 14);
    doc.line(cx + 18, cy - 1, cx + 18, cy + 14);
    doc.line(cx + 16, cy, cx + 16, cy + 14);
    doc.line(cx + 2, cy + 5, cx + 2, cy + 17); // Front leg
    doc.line(cx - 2, cy + 3, cx - 2, cy + 16);
    
    // Aesthetic structural coordinate grid lines (Gold)
    doc.setDrawColor(COLOR_GOLD);
    doc.setLineWidth(0.15);
    doc.line(cx - 28, cy + 10, cx + 28, cy + 10);
    doc.line(cx - 20, cy + 14, cx + 20, cy + 14);
  } 
  else if (category === 'Steel') {
    // Detailed architectural H-Beam Cross Section
    doc.setLineWidth(0.5);
    const flW = 24; // Flange width
    const flT = 4.5; // Flange thickness
    const webH = 16; // Web height
    const webT = 3.5; // Web thickness

    // Top flange
    doc.rect(cx - flW / 2, cy - webH / 2 - flT, flW, flT, 'S');
    // Web section
    doc.rect(cx - webT / 2, cy - webH / 2, webT, webH, 'S');
    // Bottom flange
    doc.rect(cx - flW / 2, cy + webH / 2, flW, flT, 'S');

    // Section centerline vectors
    doc.setDrawColor(COLOR_GOLD);
    doc.setLineWidth(0.25);
    doc.line(cx, cy - 18, cx, cy + 18); // Vertical centerline
    doc.line(cx - 18, cy, cx + 18, cy); // Horizontal centerline
  } 
  else if (category === 'Glass') {
    // Acoustic double-pane structural glass framing
    doc.setLineWidth(0.5);
    doc.rect(cx - 20, cy - 16, 40, 32, 'S'); // Framing profile
    
    // Glass double panes
    doc.setLineWidth(0.7);
    doc.line(cx - 4, cy - 13, cx - 4, cy + 13);
    doc.line(cx + 4, cy - 13, cx + 4, cy + 13);

    // Dynamic wave vibration absorber lines (Gold)
    doc.setDrawColor(COLOR_GOLD);
    doc.setLineWidth(0.2);
    doc.line(cx - 14, cy - 8, cx - 9, cy - 10);
    doc.line(cx - 9, cy - 10, cx - 9, cy - 6);
    doc.line(cx + 9, cy + 8, cx + 14, cy + 6);
  } 
  else {
    // Golden ratio geometric layout blueprint
    doc.setDrawColor(COLOR_GOLD);
    doc.setLineWidth(0.3);
    doc.ellipse(cx, cy, 16, 16, 'S');
    doc.rect(cx - 16, cy - 16, 32, 32, 'S');
    doc.setDrawColor(COLOR_DARK_NAVY);
    doc.line(cx - 22, cy, cx + 22, cy);
    doc.line(cx, cy - 22, cx, cy + 22);
    doc.ellipse(cx, cy, 8, 8, 'S');
  }

  // Label branding inside illustration card
  doc.setTextColor(COLOR_DARK_NAVY);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text(langText.architecturalDrawing, cx, y + height - 8, { align: 'center' });

  doc.setTextColor(COLOR_TEXT_MUTED);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.text(langText.scaleText, cx, y + height - 4, { align: 'center' });
}

// =========================================================================
// PREMIUM FINE-LINE ICONS FOR CORE SPEC CARDS (Drawn using vectors)
// =========================================================================

function drawMaterialIcon(doc: jsPDF, x: number, y: number) {
  doc.setDrawColor(COLOR_GOLD);
  doc.setLineWidth(0.4);
  doc.rect(x, y, 7, 7, 'S');
  doc.line(x, y + 3.5, x + 7, y + 3.5);
  doc.line(x + 3.5, y, x + 3.5, y + 7);
}

function drawConstructionIcon(doc: jsPDF, x: number, y: number) {
  doc.setDrawColor(COLOR_GOLD);
  doc.setLineWidth(0.4);
  doc.line(x, y + 7, x + 7, y);
  doc.line(x, y, x + 7, y + 7);
  doc.rect(x + 1, y + 1, 5, 5, 'S');
}

function drawAcousticIcon(doc: jsPDF, x: number, y: number) {
  doc.setDrawColor(COLOR_GOLD);
  doc.setLineWidth(0.4);
  // Concentric elegant Soundwave lines
  doc.line(x + 3.5, y, x + 3.5, y + 7);
  doc.line(x + 1.5, y + 1.5, x + 1.5, y + 5.5);
  doc.line(x + 5.5, y + 1.5, x + 5.5, y + 5.5);
}

function drawFireIcon(doc: jsPDF, x: number, y: number) {
  doc.setDrawColor(COLOR_GOLD);
  doc.setLineWidth(0.4);
  // Minimal shield/fire badge vector
  doc.rect(x + 1, y, 5, 7, 'S');
  doc.line(x + 1, y + 3.5, x + 6, y + 3.5);
}

function drawDimensionsIcon(doc: jsPDF, x: number, y: number) {
  doc.setDrawColor(COLOR_GOLD);
  doc.setLineWidth(0.4);
  // Caliper scale tick mark icon
  doc.rect(x, y + 1, 7, 5, 'S');
  doc.line(x + 2, y + 1, x + 2, y + 3);
  doc.line(x + 4, y + 1, x + 4, y + 3);
}

function drawFinishIcon(doc: jsPDF, x: number, y: number) {
  doc.setDrawColor(COLOR_GOLD);
  doc.setLineWidth(0.4);
  // Paint swatch fan concept
  doc.triangle(x, y + 7, x + 5, y, x + 7, y + 5, 'S');
}

// =========================================================================
// PREMIUM FINE-LINE SECTOR ICONS (Page 2)
// =========================================================================

function drawResidentialIcon(doc: jsPDF, x: number, y: number) {
  doc.setDrawColor(COLOR_GOLD);
  doc.setLineWidth(0.45);
  doc.line(x, y + 7, x + 8, y + 7);
  doc.triangle(x + 1, y + 4, x + 4, y + 1, x + 7, y + 4, 'S');
  doc.rect(x + 2, y + 4, 4, 3, 'S');
}

function drawHotelIcon(doc: jsPDF, x: number, y: number) {
  doc.setDrawColor(COLOR_GOLD);
  doc.setLineWidth(0.45);
  doc.rect(x + 1, y, 6, 8, 'S');
  doc.line(x + 3, y + 2, x + 5, y + 2);
  doc.line(x + 3, y + 4, x + 5, y + 4);
  doc.line(x + 3, y + 6, x + 5, y + 6);
}

function drawOfficeIcon(doc: jsPDF, x: number, y: number) {
  doc.setDrawColor(COLOR_GOLD);
  doc.setLineWidth(0.45);
  // Geometric workstation profile
  doc.line(x, y + 7, x + 8, y + 7);
  doc.rect(x + 1, y + 2, 6, 3, 'S');
  doc.line(x + 2, y + 5, x + 2, y + 7);
  doc.line(x + 6, y + 5, x + 6, y + 7);
}

function drawVillaIcon(doc: jsPDF, x: number, y: number) {
  doc.setDrawColor(COLOR_GOLD);
  doc.setLineWidth(0.45);
  // Minimalist modernist flat roof villa
  doc.line(x, y + 7, x + 8, y + 7);
  doc.rect(x + 1, y + 3, 6, 4, 'S');
  doc.line(x + 1, y + 3, x + 7, y + 3); // Cantilevered roof flat overhang
  doc.line(x, y + 3, x + 8, y + 3);
}

function drawCommercialIcon(doc: jsPDF, x: number, y: number) {
  doc.setDrawColor(COLOR_GOLD);
  doc.setLineWidth(0.45);
  // Curtain wall high rise facade grid
  doc.rect(x, y, 8, 8, 'S');
  doc.line(x + 4, y, x + 4, y + 8);
  doc.line(x, y + 4, x + 8, y + 4);
}

// =========================================================================
// PREMIUM FINE-LINE CERTIFICATION BADGE VECTOR GRAPHICS (Circular Stamps)
// =========================================================================

function drawLuxuryCertificateBadge(doc: jsPDF, x: number, y: number, text: string) {
  const radius = 10;
  const cx = x + radius;
  const cy = y + radius;

  // Dual outer fine gold circles representing a luxury seal
  doc.setDrawColor(COLOR_GOLD);
  doc.setLineWidth(0.3);
  doc.ellipse(cx, cy, radius, radius, 'S');
  doc.setLineWidth(0.12);
  doc.ellipse(cx, cy, radius - 1.5, radius - 1.5, 'S');

  // Minimal star inside center
  doc.setFillColor(COLOR_GOLD);
  doc.triangle(cx, cy - 3.5, cx - 1.2, cy - 0.5, cx + 1.2, cy - 0.5, 'FD');
  doc.triangle(cx, cy + 1.5, cx - 1.2, cy - 1.5, cx + 1.2, cy - 1.5, 'FD');

  // Badge text label
  doc.setTextColor(COLOR_DARK_NAVY);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(5.5);
  
  // Wrap text neatly if long
  const words = text.split(' ');
  const line1 = words.slice(0, 2).join(' ');
  const line2 = words.slice(2).join(' ');
  
  doc.text(line1, cx, cy + 4.5, { align: 'center' });
  if (line2) {
    doc.text(line2, cx, cy + 7.2, { align: 'center' });
  }
}

// Helper function to sanitize text for standard jsPDF Helvetica rendering
function sanitizePdfText(text: string | undefined | null, fallback: string): string {
  if (!text) return fallback;
  const clean = text.replace(/[^\x20-\x7E]/g, ' ').replace(/\s+/g, ' ').trim();
  return clean.length > 0 ? clean : fallback;
}

// =========================================================================
// MAIN LUXURY REDESIGN GENERATION ENGINE
// =========================================================================

export async function generateProductPdf(product: Product, lang: 'en' | 'km' | 'ko' = 'en', download = true): Promise<jsPDF> {
  const langText = TEXT_MAPS[lang] || TEXT_MAPS.en;

  // Initialize jsPDF doc: A4 Landscape, dimensions in mm (297 x 210)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageW = 297;
  const pageH = 210;
  const marginL = 12;
  const marginR = 12;
  const marginT = 10;
  const marginB = 10;
  const contentW = pageW - marginL - marginR; // 273mm

  const rawProductName = product.ProductName_EN || product.name || 'SDY Architectural Product';
  const rawProductDesc = product.Description_EN || product.description || 'Bespoke design engineered with timeless aesthetic values and state-of-the-art durability.';

  const productName = sanitizePdfText(rawProductName, 'SDY ARCHITECTURAL SYSTEM');
  const productDesc = sanitizePdfText(rawProductDesc, 'Bespoke architectural engineering system crafted for superior structural performance and aesthetic excellence.');

  let collectionSubtitle = 'PREMIUM ARCHITECTURAL OPENINGS & JOINERY';
  if (product.category === 'Doors') collectionSubtitle = 'PREMIUM ARCHITECTURAL OPENINGS & DOOR SYSTEMS';
  else if (product.category === 'Furniture') collectionSubtitle = 'BESPOKE ARTISAN EXECUTIVE FURNITURE';
  else if (product.category === 'Steel') collectionSubtitle = 'ENGINEERED ARCHITECTURAL STEEL SYSTEM';
  else if (product.category === 'Glass') collectionSubtitle = 'HIGH-PERFORMANCE ACOUSTIC GLASS PARTITION';

  // Load uploaded technical drawing / spec sheet image if present
  const rawSpecUrl = product.pdf_spec_url || product.pdfUrl || product.technicalDrawing || product.dimensionDrawing;
  const specImgData = await loadImageAsBase64(rawSpecUrl);

  const totalPages = specImgData && specImgData.base64 ? 2 : 1;

  // =========================================================================
  // PAGE 1: ARCHITECTURAL BLUEPRINT DRAWING SHEET (If specImgData exists)
  // OR LANDSCAPE EXECUTIVE SPECIFICATION SHEET (If specImgData is missing)
  // =========================================================================

  if (specImgData && specImgData.base64) {
    // -----------------------------------------------------------------------
    // PAGE 1 (HAS SPEC SHEET): LANDSCAPE ARCHITECTURAL BLUEPRINT SHEET
    // -----------------------------------------------------------------------
    let curY = marginT;

    // Header
    let logoH = 15;
    let logoW = 18;
    let textX = marginL + 22;

    try {
      const logoData = await generateSdyLogoData();
      if (logoData && logoData.base64) {
        doc.addImage(logoData.base64, 'PNG', marginL, curY, logoW, logoH, 'logo_p1', 'MEDIUM');
      }
    } catch (err) {
      console.warn('Failed to load logo asset:', err);
    }

    doc.setTextColor(COLOR_DARK_NAVY);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text('SDY COMPANY C&I', textX, curY + 4);

    doc.setTextColor(COLOR_TEXT_MUTED);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text('TECHNICAL SPECIFICATION & ARCHITECTURAL DRAWING SHEET', textX, curY + 8.5);

    doc.setTextColor(COLOR_GOLD);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`PROJECT / SPEC: ${productName.toUpperCase()}`, pageW - marginR, curY + 4, { align: 'right' });

    doc.setTextColor(COLOR_TEXT_MUTED);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(6);
    doc.text(`CODE: SDY-${product.id.toUpperCase()} | ISO 9001:2026`, pageW - marginR, curY + 8.5, { align: 'right' });

    curY += 15;
    doc.setDrawColor(COLOR_GOLD);
    doc.setLineWidth(0.4);
    doc.line(marginL, curY, pageW - marginR, curY);

    // Main Blueprint / Drawing Canvas Box
    curY += 3;
    const canvasW = contentW; // 273mm
    const canvasH = 155; // Fits 210mm page height with header & footer

    // Background & Outer Frame
    doc.setFillColor('#FAFBFB');
    doc.rect(marginL, curY, canvasW, canvasH, 'F');
    doc.setDrawColor(COLOR_BORDER_GRAY);
    doc.setLineWidth(0.3);
    doc.rect(marginL, curY, canvasW, canvasH, 'S');

    // Drawing Viewport (Top Portion of Canvas: 126mm H)
    const viewportH = 126;
    const viewY = curY + 2;

    // Corner drafting crosshairs (+) inside viewport
    doc.setDrawColor(COLOR_GOLD);
    doc.setLineWidth(0.2);
    // Top-Left Crosshair
    doc.line(marginL + 3, viewY + 5, marginL + 9, viewY + 5);
    doc.line(marginL + 6, viewY + 2, marginL + 6, viewY + 8);
    // Top-Right Crosshair
    doc.line(marginL + canvasW - 9, viewY + 5, marginL + canvasW - 3, viewY + 5);
    doc.line(marginL + canvasW - 6, viewY + 2, marginL + canvasW - 6, viewY + 8);
    // Bottom-Left Crosshair
    doc.line(marginL + 3, viewY + viewportH - 5, marginL + 9, viewY + viewportH - 5);
    doc.line(marginL + 6, viewY + viewportH - 8, marginL + 6, viewY + viewportH - 2);
    // Bottom-Right Crosshair
    doc.line(marginL + canvasW - 9, viewY + viewportH - 5, marginL + canvasW - 3, viewY + viewportH - 5);
    doc.line(marginL + canvasW - 6, viewY + viewportH - 8, marginL + canvasW - 6, viewY + viewportH - 2);

    // Render Spec Drawing scaled inside viewport
    const maxW = canvasW - 12;
    const maxH = viewportH - 10;
    let drawW = maxW;
    let drawH = drawW / specImgData.aspect;
    if (drawH > maxH) {
      drawH = maxH;
      drawW = drawH * specImgData.aspect;
    }
    const drawX = marginL + (canvasW - drawW) / 2;
    const drawY = viewY + (viewportH - drawH) / 2;

    try {
      doc.addImage(specImgData.base64, 'JPEG', drawX, drawY, drawW, drawH, 'spec_full_p1', 'MEDIUM');
    } catch (e) {
      console.warn('Failed rendering specImgData on Page 1:', e);
    }

    // -----------------------------------------------------------------------
    // ARCHITECTURAL TITLE BLOCK (Bottom 27mm of Canvas)
    // -----------------------------------------------------------------------
    const titleBlockY = curY + viewportH;
    const titleBlockH = canvasH - viewportH; // 29mm

    // Divider Line above Title Block
    doc.setDrawColor(COLOR_GOLD);
    doc.setLineWidth(0.4);
    doc.line(marginL, titleBlockY, marginL + canvasW, titleBlockY);

    // Title Block Background
    doc.setFillColor('#FFFFFF');
    doc.rect(marginL, titleBlockY, canvasW, titleBlockH, 'F');
    doc.setDrawColor(COLOR_BORDER_GRAY);
    doc.setLineWidth(0.3);
    doc.rect(marginL, titleBlockY, canvasW, titleBlockH, 'S');

    // Title Block Vertical Column Dividers
    const c1W = 68;
    const c2W = 82;
    const c3W = 60;
    const c4W = canvasW - c1W - c2W - c3W; // 63mm

    const c1X = marginL;
    const c2X = c1X + c1W;
    const c3X = c2X + c2W;
    const c4X = c3X + c3W;

    doc.setDrawColor('#CBD5E1');
    doc.setLineWidth(0.2);
    doc.line(c2X, titleBlockY, c2X, titleBlockY + titleBlockH);
    doc.line(c3X, titleBlockY, c3X, titleBlockY + titleBlockH);
    doc.line(c4X, titleBlockY, c4X, titleBlockY + titleBlockH);

    // Cell 1: Company & Engineering Division
    doc.setTextColor(COLOR_DARK_NAVY);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('SDY ARCHITECTURAL SYSTEMS', c1X + 4, titleBlockY + 6);

    doc.setTextColor(COLOR_GOLD);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(6);
    doc.text('ENGINEERING & DESIGN DIVISION', c1X + 4, titleBlockY + 11);

    doc.setTextColor(COLOR_TEXT_MUTED);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.text('CAD / SPECIFICATION DRAWING SHEET', c1X + 4, titleBlockY + 16);
    doc.text('ISO 9001:2026 QUALITY ASSURED', c1X + 4, titleBlockY + 21);

    // Cell 2: Project & Product Details
    doc.setTextColor(COLOR_TEXT_MUTED);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.text('DRAWING TITLE:', c2X + 4, titleBlockY + 5.5);

    doc.setTextColor(COLOR_DARK_NAVY);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    const titleText = doc.splitTextToSize(productName.toUpperCase(), c2W - 8);
    doc.text(titleText.slice(0, 2), c2X + 4, titleBlockY + 10);

    doc.setTextColor(COLOR_TEXT_MUTED);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.text(`DRAWING NO: DWG-SDY-${product.id.toUpperCase()}-01`, c2X + 4, titleBlockY + 18);
    doc.text(`SYSTEM: ${collectionSubtitle}`, c2X + 4, titleBlockY + 22.5);

    // Cell 3: Scale & Technical Parameters
    doc.setTextColor(COLOR_TEXT_MUTED);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.text('SCALE / METRICS:', c3X + 4, titleBlockY + 5.5);

    doc.setTextColor(COLOR_DARK_NAVY);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(6);
    doc.text('SCALE: 1:20 @ A4 LANDSCAPE', c3X + 4, titleBlockY + 10);
    const dimVal = sanitizePdfText(product.dimensions || product.size, '900 x 2200 x 45 MM');
    doc.text(`DIMENSIONS: ${dimVal}`, c3X + 4, titleBlockY + 14.5);
    const matVal = sanitizePdfText(product.material, 'ARCHITECTURAL GRADE');
    doc.text(`MATERIAL: ${matVal}`, c3X + 4, titleBlockY + 19);
    doc.text('UNITS: MILLIMETERS (MM)', c3X + 4, titleBlockY + 23.5);

    // Cell 4: Approval & ISO Stamp Badge
    doc.setTextColor(COLOR_TEXT_MUTED);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.text('STATUS & APPROVAL:', c4X + 4, titleBlockY + 5.5);

    doc.setTextColor(COLOR_DARK_NAVY);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(6);
    doc.text('STATUS: ISSUED FOR CONSTRUCTION', c4X + 4, titleBlockY + 10);

    doc.setTextColor(COLOR_TEXT_MUTED);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.text('REVISION: REV-A02 (FINAL)', c4X + 4, titleBlockY + 14.5);

    // Stamp Badge
    doc.setFillColor('#FAFBFB');
    doc.rect(c4X + 4, titleBlockY + 17, c4W - 8, 8, 'F');
    doc.setDrawColor(COLOR_GOLD);
    doc.setLineWidth(0.3);
    doc.rect(c4X + 4, titleBlockY + 17, c4W - 8, 8, 'S');

    doc.setTextColor(COLOR_GOLD);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(6);
    doc.text('SDY CERTIFIED DRAWING', c4X + (c4W / 2), titleBlockY + 22.2, { align: 'center' });

    // Footer
    let footerY = pageH - marginB - 14;
    doc.setDrawColor(COLOR_GOLD);
    doc.setLineWidth(0.4);
    doc.line(marginL, footerY, pageW - marginR, footerY);

    footerY += 2;
    doc.setTextColor(COLOR_TEXT_MUTED);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(6);
    doc.text(langText.footerAddress, marginL, footerY + 3);
    doc.text(langText.footerContact, marginL, footerY + 6);

    doc.setTextColor(COLOR_DARK_NAVY);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(6);
    doc.text(langText.copyright, marginL, footerY + 9);

    // Deep-link QR code & page number
    const deepLinkUrl = `${window.location.origin}${window.location.pathname}?view=products&id=${product.id}`;
    const qrSize = 12;
    const qrX = pageW - marginR - qrSize;
    try {
      const qrBase64 = await QRCode.toDataURL(deepLinkUrl, { margin: 1, width: 120, color: { dark: COLOR_DARK_NAVY, light: '#FFFFFF' } });
      if (qrBase64) {
        doc.addImage(qrBase64, 'PNG', qrX, footerY, qrSize, qrSize, 'qr_p1', 'FAST');
      }
    } catch (e) { console.warn(e); }

    doc.setTextColor(COLOR_TEXT_MUTED);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(6);
    doc.text(`PAGE 1 OF ${totalPages}`, pageW - marginR - (qrSize + 4), footerY + 6, { align: 'right' });

    // -----------------------------------------------------------------------
    // PAGE 2: LANDSCAPE PRODUCT EXECUTIVE SPECIFICATION & DETAILS SHEET
    // -----------------------------------------------------------------------
    doc.addPage('a4', 'landscape');
    let p2CurY = marginT;

    // Header
    try {
      const logoData = await generateSdyLogoData();
      if (logoData && logoData.base64) {
        doc.addImage(logoData.base64, 'PNG', marginL, p2CurY, logoW, logoH, 'logo_p2', 'MEDIUM');
      }
    } catch (e) { console.warn(e); }

    doc.setTextColor(COLOR_DARK_NAVY);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text('SDY COMPANY C&I', textX, p2CurY + 4);

    doc.setTextColor(COLOR_TEXT_MUTED);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text('EXECUTIVE PRODUCT SPECIFICATIONS & TECHNICAL DATA', textX, p2CurY + 8.5);

    doc.setTextColor(COLOR_GOLD);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`COLLECTION: ${product.category.toUpperCase()}`, pageW - marginR, p2CurY + 4, { align: 'right' });

    doc.setTextColor(COLOR_TEXT_MUTED);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(6);
    doc.text(`CODE: SDY-${product.id.toUpperCase()} | SPEC SHEET`, pageW - marginR, p2CurY + 8.5, { align: 'right' });

    p2CurY += 15;
    doc.setDrawColor(COLOR_GOLD);
    doc.setLineWidth(0.4);
    doc.line(marginL, p2CurY, pageW - marginR, p2CurY);

    // Left Column (Hero Image & Design Dialogue)
    p2CurY += 4;
    const colLeftW = 128;
    const colRightX = marginL + colLeftW + 8; // 148mm
    const colRightW = contentW - colLeftW - 8; // 137mm

    const heroH = 85;
    let heroSuccess = false;
    try {
      const roundedHero = await generateRoundedProductImage(product.image, 600, 400);
      if (roundedHero) {
        doc.addImage(roundedHero, 'JPEG', marginL, p2CurY, colLeftW, heroH, 'hero_p2', 'MEDIUM');
        heroSuccess = true;
      }
    } catch (err) { console.warn(err); }

    if (!heroSuccess) {
      drawBespokeArchitecturalDrawing(doc, marginL, p2CurY, colLeftW, heroH, product.category, langText);
    }

    // Design Philosophy under Hero Image
    let descY = p2CurY + heroH + 6;
    doc.setTextColor(COLOR_DARK_NAVY);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(langText.designDialogue, marginL, descY);

    doc.setDrawColor(COLOR_GOLD);
    doc.setLineWidth(0.4);
    doc.line(marginL, descY + 1.5, marginL + 12, descY + 1.5);

    descY += 6;
    doc.setTextColor(COLOR_TEXT_CHARCOAL);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    const splitP2Desc = doc.splitTextToSize(productDesc, colLeftW);
    splitP2Desc.slice(0, 8).forEach((line: string) => {
      doc.text(line, marginL, descY);
      descY += 4;
    });

    // Right Column (Product Title, Specs Grid, Parameters Table)
    let rightY = p2CurY;
    doc.setTextColor(COLOR_DARK_NAVY);
    doc.setFont('Helvetica', 'bold');
    const p2TitleSize = productName.length > 28 ? 13 : 15;
    doc.setFontSize(p2TitleSize);
    const splitP2Title = doc.splitTextToSize(productName.toUpperCase(), colRightW);
    doc.text(splitP2Title, colRightX, rightY + 4);

    rightY += (splitP2Title.length * 5) + 2;
    doc.setTextColor(COLOR_GOLD);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(collectionSubtitle.toUpperCase(), colRightX, rightY);

    // Specs Grid (6 Cards, 2 cols x 3 rows)
    rightY += 5;
    let specPerformance = 'Class-A Architectural Grade';
    if (product.id === 'pr1') specPerformance = '38dB Sound Isolation (ASTM E90)';
    else if (product.id === 'pr2') specPerformance = 'UL 10C Fire Rated (60/90/120 Min)';
    else if (product.id === 'pr3') specPerformance = 'Hydraulic Pivot Bearing System';
    else if (product.id === 'pr4') specPerformance = 'Integrated Wire Cable Management';
    else if (product.id === 'pr5') specPerformance = 'Grade 50 Low-Alloy Structural Steel';
    else if (product.id === 'pr6') specPerformance = 'Solar Performance SHGC 0.22, EPDM Seals';

    const finishVal = product.finishes && product.finishes.length > 0 ? product.finishes.join(', ') : 'Bespoke Polyurethane Coat';

    const specsGrid = [
      { label: langText.material, value: sanitizePdfText(product.material, 'Solid Walnut / Timber'), drawIcon: drawMaterialIcon },
      { label: langText.construction, value: sanitizePdfText(product.specification, 'Architectural Core Joinery'), drawIcon: drawConstructionIcon },
      { label: langText.acoustic, value: specPerformance, drawIcon: drawAcousticIcon },
      { label: langText.fireRating, value: product.id === 'pr2' ? '60 / 90 / 120 Minutes' : 'Standard Architectural Grade', drawIcon: drawFireIcon },
      { label: langText.dimensions, value: sanitizePdfText(product.dimensions || product.size, '900 x 2200 x 45 mm'), drawIcon: drawDimensionsIcon },
      { label: langText.finish, value: sanitizePdfText(finishVal, 'Bespoke Polyurethane Coat'), drawIcon: drawFinishIcon }
    ];

    const cW = (colRightW - 4) / 2; // 66.5mm
    const cH = 18;
    const cGapX = 4;
    const cGapY = 2.5;

    specsGrid.forEach((card, index) => {
      const colIdx = index % 2;
      const rowIdx = Math.floor(index / 2);
      const cX = colRightX + colIdx * (cW + cGapX);
      const cY = rightY + rowIdx * (cH + cGapY);

      doc.setFillColor(COLOR_LIGHT_GRAY);
      doc.rect(cX, cY, cW, cH, 'F');

      doc.setDrawColor(COLOR_GOLD);
      doc.setLineWidth(0.3);
      doc.line(cX, cY, cX + 3, cY);
      doc.line(cX, cY, cX, cY + 3);

      card.drawIcon(doc, cX + 3, cY + 4.5);

      doc.setTextColor(COLOR_TEXT_MUTED);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(5.5);
      doc.text(card.label.toUpperCase(), cX + 11, cY + 5.5);

      doc.setTextColor(COLOR_DARK_NAVY);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(6.5);
      const wrappedVal = doc.splitTextToSize(card.value, cW - 13);
      doc.text(wrappedVal.slice(0, 2), cX + 11, cY + 10);
    });

    // Technical Parameters Box
    rightY += (3 * (cH + cGapY)) + 4;
    const paramBoxH = 68;
    doc.setFillColor('#FAFBFB');
    doc.rect(colRightX, rightY, colRightW, paramBoxH, 'F');
    doc.setDrawColor(COLOR_BORDER_GRAY);
    doc.setLineWidth(0.2);
    doc.rect(colRightX, rightY, colRightW, paramBoxH, 'S');

    doc.setTextColor(COLOR_DARK_NAVY);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('TECHNICAL COMPLIANCE & PARAMETERS', colRightX + 4, rightY + 6);

    doc.setDrawColor(COLOR_GOLD);
    doc.setLineWidth(0.3);
    doc.line(colRightX + 4, rightY + 8, colRightX + 28, rightY + 8);

    const paramRows = [
      { k: 'Structural Load Standard', v: 'ASTM E330 / BS 6399 Heavy Industrial Grade' },
      { k: 'Thermal Performance', v: 'U-Factor 0.28 BTU/h·ft²·°F (ISO 10077)' },
      { k: 'Surface Hardness', v: 'Shore D 82 Impact Resistant Polyurethane' },
      { k: 'Environmental Standard', v: 'LEED v4.1 Certified / Zero VOC Emissions' },
      { k: 'Quality Compliance', v: 'ISO 9001:2026 Factory Quality Assured' }
    ];

    let rowY = rightY + 14;
    paramRows.forEach((r) => {
      doc.setTextColor(COLOR_TEXT_MUTED);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.text(r.k, colRightX + 4, rowY);

      doc.setTextColor(COLOR_DARK_NAVY);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.text(r.v, colRightX + 52, rowY);

      doc.setDrawColor('#E2E8F0');
      doc.setLineWidth(0.15);
      doc.line(colRightX + 4, rowY + 2, colRightX + colRightW - 4, rowY + 2);

      rowY += 10;
    });

    // Footer Page 2
    let p2FooterY = pageH - marginB - 14;
    doc.setDrawColor(COLOR_GOLD);
    doc.setLineWidth(0.4);
    doc.line(marginL, p2FooterY, pageW - marginR, p2FooterY);

    p2FooterY += 2;
    doc.setTextColor(COLOR_TEXT_MUTED);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(6);
    doc.text(langText.footerAddress, marginL, p2FooterY + 3);
    doc.text(langText.footerContact, marginL, p2FooterY + 6);

    doc.setTextColor(COLOR_DARK_NAVY);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(6);
    doc.text(langText.copyright, marginL, p2FooterY + 9);

    doc.setTextColor(COLOR_TEXT_MUTED);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(6);
    doc.text('PAGE 2 OF 2', pageW - marginR, p2FooterY + 6, { align: 'right' });

  } else {
    // -----------------------------------------------------------------------
    // PAGE 1 (NO SPEC SHEET UPLOADED): SINGLE EXECUTIVE LANDSCAPE SPEC SHEET
    // Uses the exact same elegant 2-column layout as Page 2
    // -----------------------------------------------------------------------
    let curY = marginT;

    // Header
    let logoH = 15;
    let logoW = 18;
    let textX = marginL + 22;

    try {
      const logoData = await generateSdyLogoData();
      if (logoData && logoData.base64) {
        doc.addImage(logoData.base64, 'PNG', marginL, curY, logoW, logoH, 'logo_p1_solo', 'MEDIUM');
      }
    } catch (e) { console.warn(e); }

    doc.setTextColor(COLOR_DARK_NAVY);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text('SDY COMPANY C&I', textX, curY + 4);

    doc.setTextColor(COLOR_TEXT_MUTED);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text('EXECUTIVE PRODUCT SPECIFICATIONS & TECHNICAL DATA', textX, curY + 8.5);

    doc.setTextColor(COLOR_GOLD);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`COLLECTION: ${product.category.toUpperCase()}`, pageW - marginR, curY + 4, { align: 'right' });

    doc.setTextColor(COLOR_TEXT_MUTED);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(6);
    doc.text(`CODE: SDY-${product.id.toUpperCase()} | SPEC SHEET`, pageW - marginR, curY + 8.5, { align: 'right' });

    curY += 15;
    doc.setDrawColor(COLOR_GOLD);
    doc.setLineWidth(0.4);
    doc.line(marginL, curY, pageW - marginR, curY);

    // Left Column (Hero Image & Design Dialogue)
    curY += 4;
    const colLeftW = 128;
    const colRightX = marginL + colLeftW + 8; // 148mm
    const colRightW = contentW - colLeftW - 8; // 137mm

    const heroH = 85;
    let heroSuccess = false;
    try {
      const roundedHero = await generateRoundedProductImage(product.image, 600, 400);
      if (roundedHero) {
        doc.addImage(roundedHero, 'JPEG', marginL, curY, colLeftW, heroH, 'hero_p1_solo', 'MEDIUM');
        heroSuccess = true;
      }
    } catch (err) { console.warn(err); }

    if (!heroSuccess) {
      drawBespokeArchitecturalDrawing(doc, marginL, curY, colLeftW, heroH, product.category, langText);
    }

    // Design Philosophy under Hero Image
    let descY = curY + heroH + 6;
    doc.setTextColor(COLOR_DARK_NAVY);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(langText.designDialogue, marginL, descY);

    doc.setDrawColor(COLOR_GOLD);
    doc.setLineWidth(0.4);
    doc.line(marginL, descY + 1.5, marginL + 12, descY + 1.5);

    descY += 6;
    doc.setTextColor(COLOR_TEXT_CHARCOAL);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    const splitDesc = doc.splitTextToSize(productDesc, colLeftW);
    splitDesc.slice(0, 8).forEach((line: string) => {
      doc.text(line, marginL, descY);
      descY += 4;
    });

    // Right Column (Product Title, Specs Grid, Parameters Table)
    let rightY = curY;
    doc.setTextColor(COLOR_DARK_NAVY);
    doc.setFont('Helvetica', 'bold');
    const titleSize = productName.length > 28 ? 13 : 15;
    doc.setFontSize(titleSize);
    const splitTitle = doc.splitTextToSize(productName.toUpperCase(), colRightW);
    doc.text(splitTitle, colRightX, rightY + 4);

    rightY += (splitTitle.length * 5) + 2;
    doc.setTextColor(COLOR_GOLD);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(collectionSubtitle.toUpperCase(), colRightX, rightY);

    // Specs Grid (6 Cards, 2 cols x 3 rows)
    rightY += 5;
    let specPerformance = 'Class-A Architectural Grade';
    if (product.id === 'pr1') specPerformance = '38dB Sound Isolation (ASTM E90)';
    else if (product.id === 'pr2') specPerformance = 'UL 10C Fire Rated (60/90/120 Min)';
    else if (product.id === 'pr3') specPerformance = 'Hydraulic Pivot Bearing System';
    else if (product.id === 'pr4') specPerformance = 'Integrated Wire Cable Management';
    else if (product.id === 'pr5') specPerformance = 'Grade 50 Low-Alloy Structural Steel';
    else if (product.id === 'pr6') specPerformance = 'Solar Performance SHGC 0.22, EPDM Seals';

    const finishVal = product.finishes && product.finishes.length > 0 ? product.finishes.join(', ') : 'Bespoke Polyurethane Coat';

    const specsGrid = [
      { label: langText.material, value: sanitizePdfText(product.material, 'Solid Walnut / Timber'), drawIcon: drawMaterialIcon },
      { label: langText.construction, value: sanitizePdfText(product.specification, 'Architectural Core Joinery'), drawIcon: drawConstructionIcon },
      { label: langText.acoustic, value: specPerformance, drawIcon: drawAcousticIcon },
      { label: langText.fireRating, value: product.id === 'pr2' ? '60 / 90 / 120 Minutes' : 'Standard Architectural Grade', drawIcon: drawFireIcon },
      { label: langText.dimensions, value: sanitizePdfText(product.dimensions || product.size, '900 x 2200 x 45 mm'), drawIcon: drawDimensionsIcon },
      { label: langText.finish, value: sanitizePdfText(finishVal, 'Bespoke Polyurethane Coat'), drawIcon: drawFinishIcon }
    ];

    const cW = (colRightW - 4) / 2; // 66.5mm
    const cH = 18;
    const cGapX = 4;
    const cGapY = 2.5;

    specsGrid.forEach((card, index) => {
      const colIdx = index % 2;
      const rowIdx = Math.floor(index / 2);
      const cX = colRightX + colIdx * (cW + cGapX);
      const cY = rightY + rowIdx * (cH + cGapY);

      doc.setFillColor(COLOR_LIGHT_GRAY);
      doc.rect(cX, cY, cW, cH, 'F');

      doc.setDrawColor(COLOR_GOLD);
      doc.setLineWidth(0.3);
      doc.line(cX, cY, cX + 3, cY);
      doc.line(cX, cY, cX, cY + 3);

      card.drawIcon(doc, cX + 3, cY + 4.5);

      doc.setTextColor(COLOR_TEXT_MUTED);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(5.5);
      doc.text(card.label.toUpperCase(), cX + 11, cY + 5.5);

      doc.setTextColor(COLOR_DARK_NAVY);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(6.5);
      const wrappedVal = doc.splitTextToSize(card.value, cW - 13);
      doc.text(wrappedVal.slice(0, 2), cX + 11, cY + 10);
    });

    // Technical Parameters Box
    rightY += (3 * (cH + cGapY)) + 4;
    const paramBoxH = 68;
    doc.setFillColor('#FAFBFB');
    doc.rect(colRightX, rightY, colRightW, paramBoxH, 'F');
    doc.setDrawColor(COLOR_BORDER_GRAY);
    doc.setLineWidth(0.2);
    doc.rect(colRightX, rightY, colRightW, paramBoxH, 'S');

    doc.setTextColor(COLOR_DARK_NAVY);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('TECHNICAL COMPLIANCE & PARAMETERS', colRightX + 4, rightY + 6);

    doc.setDrawColor(COLOR_GOLD);
    doc.setLineWidth(0.3);
    doc.line(colRightX + 4, rightY + 8, colRightX + 28, rightY + 8);

    const paramRows = [
      { k: 'Structural Load Standard', v: 'ASTM E330 / BS 6399 Heavy Industrial Grade' },
      { k: 'Thermal Performance', v: 'U-Factor 0.28 BTU/h·ft²·°F (ISO 10077)' },
      { k: 'Surface Hardness', v: 'Shore D 82 Impact Resistant Polyurethane' },
      { k: 'Environmental Standard', v: 'LEED v4.1 Certified / Zero VOC Emissions' },
      { k: 'Quality Compliance', v: 'ISO 9001:2026 Factory Quality Assured' }
    ];

    let rowY = rightY + 14;
    paramRows.forEach((r) => {
      doc.setTextColor(COLOR_TEXT_MUTED);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.text(r.k, colRightX + 4, rowY);

      doc.setTextColor(COLOR_DARK_NAVY);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.text(r.v, colRightX + 52, rowY);

      doc.setDrawColor('#E2E8F0');
      doc.setLineWidth(0.15);
      doc.line(colRightX + 4, rowY + 2, colRightX + colRightW - 4, rowY + 2);

      rowY += 10;
    });

    // Footer
    let footerY = pageH - marginB - 14;
    doc.setDrawColor(COLOR_GOLD);
    doc.setLineWidth(0.4);
    doc.line(marginL, footerY, pageW - marginR, footerY);

    footerY += 2;
    doc.setTextColor(COLOR_TEXT_MUTED);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(6);
    doc.text(langText.footerAddress, marginL, footerY + 3);
    doc.text(langText.footerContact, marginL, footerY + 6);

    doc.setTextColor(COLOR_DARK_NAVY);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(6);
    doc.text(langText.copyright, marginL, footerY + 9);

    const deepLinkUrl = `${window.location.origin}${window.location.pathname}?view=products&id=${product.id}`;
    const qrSize = 12;
    const qrX = pageW - marginR - qrSize;
    try {
      const qrBase64 = await QRCode.toDataURL(deepLinkUrl, { margin: 1, width: 120, color: { dark: COLOR_DARK_NAVY, light: '#FFFFFF' } });
      if (qrBase64) {
        doc.addImage(qrBase64, 'PNG', qrX, footerY, qrSize, qrSize, 'qr_p1_solo', 'FAST');
      }
    } catch (e) { console.warn(e); }

    doc.setTextColor(COLOR_TEXT_MUTED);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(6);
    doc.text('PAGE 1 OF 1', pageW - marginR - (qrSize + 4), footerY + 6, { align: 'right' });
  }

  if (download) {
    const brochureFilename = `SDY_Product_Spec_${product.name.replace(/ /g, '_')}.pdf`;
    doc.save(brochureFilename);
  }

  return doc;
}
