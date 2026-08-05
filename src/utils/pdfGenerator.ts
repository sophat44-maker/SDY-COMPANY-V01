import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Product } from '../types';
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

  // Initialize jsPDF doc: A4 Portrait, dimensions in mm (210 x 297)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageW = 210;
  const pageH = 297;
  const marginL = 15; // 15mm margin
  const marginR = 15;
  const marginT = 15;
  const marginB = 15;
  const contentW = pageW - marginL - marginR; // 180mm width

  // Clean English name and description for standard jsPDF Helvetica rendering
  const rawProductName = product.ProductName_EN || product.name || 'SDY Architectural Product';
  const rawProductDesc = product.Description_EN || product.description || 'Bespoke design engineered with timeless aesthetic values and state-of-the-art durability.';

  const productName = sanitizePdfText(rawProductName, 'SDY ARCHITECTURAL SYSTEM');
  const productDesc = sanitizePdfText(rawProductDesc, 'Bespoke architectural engineering system crafted for superior structural performance and aesthetic excellence.');

  // Dynamic subtitle category matching
  let collectionSubtitle = 'PREMIUM ARCHITECTURAL OPENINGS & JOINERY';
  if (product.category === 'Doors') collectionSubtitle = 'PREMIUM ARCHITECTURAL OPENINGS & DOOR SYSTEMS';
  else if (product.category === 'Furniture') collectionSubtitle = 'BESPOKE ARTISAN EXECUTIVE FURNITURE';
  else if (product.category === 'Steel') collectionSubtitle = 'ENGINEERED ARCHITECTURAL STEEL SYSTEM';
  else if (product.category === 'Glass') collectionSubtitle = 'HIGH-PERFORMANCE ACOUSTIC GLASS PARTITION';

  // ========================== SINGLE PAGE SPECIFICATION SHEET ===========================
  let curY = marginT;

  // 1. HEADER ZONE
  let logoH = 20;
  let logoW = 22;
  let textX = marginL + 25;

  try {
    const logoData = await generateSdyLogoData();
    if (logoData && logoData.base64) {
      logoH = 20;
      logoW = Math.min(Math.max(logoH * logoData.aspect, 16), 40);
      textX = marginL + logoW + 4;
      doc.addImage(logoData.base64, 'PNG', marginL, curY, logoW, logoH, 'logo_p1', 'MEDIUM');
    }
  } catch (err) {
    console.warn('Failed to load primary logo asset:', err);
  }

  // Top Center Header Brand Title
  doc.setTextColor(COLOR_DARK_NAVY);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('SDY COMPANY C&I', textX, curY + 4.2);

  doc.setTextColor(COLOR_TEXT_MUTED);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(langText.brandSubtitle, textX, curY + 8.8);

  // Top Right metadata block
  doc.setTextColor(COLOR_DARK_NAVY);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(`CODE: SDY-${product.id.toUpperCase()}`, pageW - marginR, curY + 4.2, { align: 'right' });

  doc.setTextColor(COLOR_GOLD);
  doc.text(`COLLECTION: ${product.category.toUpperCase()}`, pageW - marginR, curY + 8, { align: 'right' });

  doc.setTextColor(COLOR_TEXT_MUTED);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(6);
  doc.text(`SPEC SHEET / ISO 9001:2026`, pageW - marginR, curY + 12, { align: 'right' });

  curY += 20;
  doc.setDrawColor(COLOR_GOLD);
  doc.setLineWidth(0.4);
  doc.line(marginL, curY, pageW - marginR, curY);

  // 2. PRODUCT TITLE & COLLECTION SUBTITLE
  curY += 7;
  doc.setTextColor(COLOR_DARK_NAVY);
  doc.setFont('Helvetica', 'bold');

  const titleFontSize = productName.length > 30 ? 14 : 17;
  doc.setFontSize(titleFontSize);

  const formattedTitle = productName.toUpperCase();
  const splitTitle = doc.splitTextToSize(formattedTitle, contentW);
  doc.text(splitTitle, marginL, curY);

  curY += (splitTitle.length * 5.5);

  doc.setTextColor(COLOR_GOLD);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(collectionSubtitle.toUpperCase(), marginL, curY);

  // 3. HERO AREA (Left: Hero Image 92mm x 62mm, Right: 6 Spec Cards 82mm x 62mm)
  curY += 6;
  const heroImageW = 92;
  const heroImageH = 62;
  const rightPanelX = marginL + heroImageW + 6; // 15 + 92 + 6 = 113mm
  const rightPanelW = contentW - heroImageW - 6; // 82mm

  let imageLoadedSuccess = false;
  try {
    const roundedHeroBase64 = await generateRoundedProductImage(product.image, 500, 360);
    if (roundedHeroBase64) {
      doc.addImage(roundedHeroBase64, 'JPEG', marginL, curY, heroImageW, heroImageH, 'hero_img', 'MEDIUM');
      imageLoadedSuccess = true;
    }
  } catch (err) {
    console.warn('CORS or connection failure when loading Hero image:', err);
  }

  if (!imageLoadedSuccess) {
    drawBespokeArchitecturalDrawing(doc, marginL, curY, heroImageW, heroImageH, product.category, langText);
  }

  // Right Side Specs Grid (2 cols x 3 rows = 6 items)
  let specPerformance = 'Class-A Architectural Grade';
  if (product.id === 'pr1') specPerformance = '38dB Sound Isolation (ASTM E90)';
  else if (product.id === 'pr2') specPerformance = 'UL 10C Fire Rated (60/90/120 Min)';
  else if (product.id === 'pr3') specPerformance = 'Hydraulic Pivot Bearing System';
  else if (product.id === 'pr4') specPerformance = 'Integrated Wire Cable Management';
  else if (product.id === 'pr5') specPerformance = 'Grade 50 Low-Alloy Structural Steel';
  else if (product.id === 'pr6') specPerformance = 'Solar Performance SHGC 0.22, EPDM Seals';

  const finishVal = product.finishes && product.finishes.length > 0 
    ? product.finishes.join(', ') 
    : 'Bespoke Polyurethane Coat';

  const specsGrid = [
    { label: langText.material, value: sanitizePdfText(product.material, 'Premium Solid Walnut / Timber'), drawIcon: drawMaterialIcon },
    { label: langText.construction, value: sanitizePdfText(product.specification, 'Architectural Core Joinery'), drawIcon: drawConstructionIcon },
    { label: langText.acoustic, value: specPerformance, drawIcon: drawAcousticIcon },
    { label: langText.fireRating, value: product.id === 'pr2' ? '60 / 90 / 120 Minutes' : 'Standard Architectural Grade', drawIcon: drawFireIcon },
    { label: langText.dimensions, value: sanitizePdfText(product.dimensions || product.size, '900 x 2200 x 45 mm'), drawIcon: drawDimensionsIcon },
    { label: langText.finish, value: sanitizePdfText(finishVal, 'Bespoke Polyurethane Coat'), drawIcon: drawFinishIcon }
  ];

  const cardW = (rightPanelW - 4) / 2; // 39mm
  const cardH = 19;
  const gapX = 4;
  const gapY = 2.5;

  specsGrid.forEach((card, index) => {
    const colIdx = index % 2;
    const rowIdx = Math.floor(index / 2);
    const cardX = rightPanelX + colIdx * (cardW + gapX);
    const cardY = curY + rowIdx * (cardH + gapY);

    doc.setFillColor(COLOR_LIGHT_GRAY);
    doc.rect(cardX, cardY, cardW, cardH, 'F');

    doc.setDrawColor(COLOR_GOLD);
    doc.setLineWidth(0.3);
    doc.line(cardX, cardY, cardX + 3, cardY);
    doc.line(cardX, cardY, cardX, cardY + 3);

    card.drawIcon(doc, cardX + 3, cardY + 5);

    doc.setTextColor(COLOR_TEXT_MUTED);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.text(card.label.toUpperCase(), cardX + 11, cardY + 6);

    doc.setTextColor(COLOR_DARK_NAVY);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(6.5);
    const wrappedValue = doc.splitTextToSize(card.value, cardW - 13);
    doc.text(wrappedValue.slice(0, 2), cardX + 11, cardY + 10.5);
  });

  // 4. DESCRIPTION & DESIGN PHILOSOPHY
  curY += heroImageH + 10;
  doc.setTextColor(COLOR_DARK_NAVY);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(langText.designDialogue, marginL, curY);

  doc.setDrawColor(COLOR_GOLD);
  doc.setLineWidth(0.4);
  doc.line(marginL, curY + 1.8, marginL + 12, curY + 1.8);

  curY += 7;
  doc.setTextColor(COLOR_TEXT_CHARCOAL);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);

  const splitDesc = doc.splitTextToSize(productDesc, contentW);
  splitDesc.slice(0, 5).forEach((line: string) => {
    doc.text(line, marginL, curY);
    curY += 4.5;
  });

  // 5. ARCHITECTURAL SCHEMATIC ILLUSTRATION DRAWING CARD
  curY += 6;
  const drawingH = 62;
  drawBespokeArchitecturalDrawing(doc, marginL, curY, contentW, drawingH, product.category, langText);

  // 6. FOOTER BRANDING & DEEP LINK QR CODE
  let footerY = pageH - marginB - 18; // 297 - 15 - 18 = 264mm

  doc.setDrawColor(COLOR_GOLD);
  doc.setLineWidth(0.4);
  doc.line(marginL, footerY, pageW - marginR, footerY);

  footerY += 3;

  try {
    const footerLogoBase64 = await generateSdyLogo();
    if (footerLogoBase64) {
      doc.addImage(footerLogoBase64, 'PNG', marginL, footerY, 14, 12, 'logo_f_p1', 'FAST');
    }
  } catch (err) {
    console.warn(err);
  }

  const footerContactX = marginL + 17;
  doc.setTextColor(COLOR_TEXT_MUTED);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(6);
  doc.text(langText.footerAddress, footerContactX, footerY + 3);
  doc.text(langText.footerContact, footerContactX, footerY + 6.5);

  doc.setTextColor(COLOR_DARK_NAVY);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(6);
  doc.text(langText.copyright, footerContactX, footerY + 10);

  const deepLinkUrl = `${window.location.origin}${window.location.pathname}?view=products&id=${product.id}`;
  const qrCodeSize = 14;
  const qrCodeX = pageW - marginR - qrCodeSize;
  const qrCodeY = footerY;

  try {
    const qrBase64 = await QRCode.toDataURL(deepLinkUrl, {
      margin: 1,
      width: 140,
      color: {
        dark: COLOR_DARK_NAVY,
        light: '#FFFFFF'
      }
    });

    if (qrBase64) {
      doc.addImage(qrBase64, 'PNG', qrCodeX, qrCodeY, qrCodeSize, qrCodeSize, 'qr_p1', 'FAST');

      doc.setTextColor(COLOR_GOLD);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(4.5);
      doc.text(langText.scanToExplore, qrCodeX + 7, qrCodeY + 16, { align: 'center' });
    }
  } catch (err) {
    console.warn('Failed to load deep-link QR Code in browser:', err);
  }

  doc.setTextColor(COLOR_TEXT_MUTED);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(6);
  doc.text('PAGE 1 OF 1', pageW - marginR, pageH - 6, { align: 'right' });

  if (download) {
    const brochureFilename = `SDY_Product_Spec_${product.name.replace(/ /g, '_')}.pdf`;
    doc.save(brochureFilename);
  }
  return doc;
}
