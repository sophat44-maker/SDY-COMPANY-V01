import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Quotation, BoqDocument, DeliveryNote, Invoice } from '../services/commercialDocsService';
import sdyLogoImg from '../assets/images/sdy_official_logo_v2_1784772926599.jpg';

// Brand colors
const COLOR_NAVY = '#0A1128';
const COLOR_BLUE = '#0A4DA3';
const COLOR_GOLD = '#C5A880';
const COLOR_LIGHT_BG = '#F8FAFC';
const COLOR_TEXT = '#1E293B';
const COLOR_MUTED = '#64748B';
const COLOR_BORDER = '#E2E8F0';

function sanitize(str: string | undefined | null, fallback = ''): string {
  if (!str) return fallback;
  let cleaned = String(str).trim();
  if (!cleaned) return fallback;
  // Decode standard HTML entities safely without mangling words or phone numbers
  cleaned = cleaned
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  return cleaned;
}

/**
 * Renders Khmer / Unicode text into an image canvas if it contains Khmer script,
 * otherwise uses standard jsPDF text rendering.
 */
function drawTextWithKhmerSupport(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  options?: {
    color?: string;
    fontSize?: number;
    fontWeight?: string;
    align?: 'left' | 'center' | 'right';
  }
) {
  if (!text) return;
  const isKhmer = /[\u1780-\u17FF]/.test(text);
  if (!isKhmer) {
    if (options?.color) doc.setTextColor(options.color);
    if (options?.fontSize) doc.setFontSize(options.fontSize);
    doc.setFont('Helvetica', options?.fontWeight === 'bold' ? 'bold' : 'normal');
    doc.text(text, x, y, options ? { align: options.align } : undefined);
    return;
  }

  try {
    const fontSize = options?.fontSize || 8;
    const color = options?.color || COLOR_NAVY;
    const fontWeight = options?.fontWeight || 'bold';
    const align = options?.align || 'left';

    const scale = 4;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      doc.text(text, x, y, options ? { align: options.align } : undefined);
      return;
    }

    const fontStr = `${fontWeight} ${fontSize * scale * 1.3}px 'Kantumruy Pro', 'Battambang', 'Siemreap', sans-serif`;
    ctx.font = fontStr;
    const metrics = ctx.measureText(text);

    const padding = 10;
    const canvasW = Math.ceil(metrics.width + padding * 2);
    const canvasH = Math.ceil(fontSize * scale * 2);

    canvas.width = canvasW;
    canvas.height = canvasH;

    ctx.font = fontStr;
    ctx.fillStyle = color;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, padding, canvasH / 2);

    const imgData = canvas.toDataURL('image/png');
    const pdfW = (canvasW / scale) * 0.264583;
    const pdfH = (canvasH / scale) * 0.264583;

    let posX = x;
    if (align === 'center') posX = x - pdfW / 2;
    else if (align === 'right') posX = x - pdfW;

    const posY = y - pdfH * 0.58;
    doc.addImage(imgData, 'PNG', posX, posY, pdfW, pdfH);
  } catch (err) {
    console.warn('Khmer text render error:', err);
    doc.text(text, x, y, options ? { align: options.align } : undefined);
  }
}

export interface SdyLogoData {
  base64: string;
  aspect: number;
}

export function generateSdyLogoData(): Promise<SdyLogoData> {
  return new Promise((resolve) => {
    const customLogo = typeof window !== 'undefined' ? localStorage.getItem('sdy_custom_logo') : null;
    const logoSrc = customLogo || sdyLogoImg;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const naturalW = img.naturalWidth || img.width || 400;
      const naturalH = img.naturalHeight || img.height || 300;
      const aspect = naturalW / naturalH;

      // Maintain high resolution without letterboxing or squishing
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
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve({ base64: canvas.toDataURL('image/png'), aspect });
      } else {
        resolve({ base64: '', aspect: 1.25 });
      }
    };
    img.onerror = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0A4DA3';
        ctx.fillRect(0, 0, 400, 300);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 42px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SDY C&I', 200, 165);
        resolve({ base64: canvas.toDataURL('image/png'), aspect: 400 / 300 });
      } else {
        resolve({ base64: '', aspect: 1.25 });
      }
    };
    img.src = logoSrc;
  });
}

export async function generateSdyLogoBase64(): Promise<string> {
  const data = await generateSdyLogoData();
  return data.base64;
}

function formatUsd(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatKhr(amount: number): string {
  return `${Math.round(amount).toLocaleString('en-US')} KHR`;
}

// =================================================================================
// 1. GENERATE QUOTATION PDF
// =================================================================================
export async function generateQuotationPdf(quotation: Quotation, companyInfo?: any, download = true): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginL = 15;
  const marginR = 15;
  const marginT = 15;
  const contentW = pageW - marginL - marginR;

  let curY = marginT;

  // Header Logo & Company Info
  let logoH = 22; // Height in mm to ensure logo looks tall, bold, and un-squished
  let logoW = 24;
  let textX = marginL + 28;

  try {
    const logoData = await generateSdyLogoData();
    if (logoData && logoData.base64) {
      logoH = 22;
      logoW = Math.min(Math.max(logoH * logoData.aspect, 18), 45); // Proportionately scaled width
      textX = marginL + logoW + 4; // Clean gap between logo and company info
      doc.addImage(logoData.base64, 'PNG', marginL, curY, logoW, logoH);
    }
  } catch (e) {
    console.warn(e);
  }

  // Company Name - Perfectly aligned with the top of the logo (curY + 4.2 cap height)
  doc.setTextColor(COLOR_NAVY);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.text(companyInfo?.CompanyName || 'SDY COMPANY C&I', textX, curY + 4.2);

  doc.setTextColor(COLOR_BLUE);
  doc.setFontSize(7);
  doc.setFont('Helvetica', 'bold');
  doc.text('CONSTRUCTION • INTERIOR DESIGN • FURNITURE', textX, curY + 8.8);

  doc.setTextColor(COLOR_MUTED);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(`${companyInfo?.Address || 'Phnom Penh, Cambodia'} | Tel: ${companyInfo?.PhoneNumber || '+855 23 888 999'}`, textX, curY + 13);
  doc.text(`Email: ${companyInfo?.Email || 'info@sdy-ci.com'} | Web: www.sdy-ci.com`, textX, curY + 17);

  // Document Title Header Top Right - Perfectly top-aligned at curY + 4.2
  doc.setTextColor(COLOR_BLUE);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13.5);
  doc.text('OFFICIAL QUOTATION', pageW - marginR, curY + 4.2, { align: 'right' });

  doc.setTextColor(COLOR_NAVY);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(quotation.quoteNumber, pageW - marginR, curY + 10, { align: 'right' });

  doc.setTextColor(COLOR_MUTED);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`Date: ${quotation.issueDate || new Date().toISOString().split('T')[0]}`, pageW - marginR, curY + 14.5, { align: 'right' });

  curY += Math.max(logoH, 22) + 4;
  doc.setDrawColor(COLOR_GOLD);
  doc.setLineWidth(0.5);
  doc.line(marginL, curY, pageW - marginR, curY);

  // Metadata Grid (Client Info vs Document Meta)
  curY += 6;

  // Left Column - Client Box
  const boxH = 32;
  doc.setFillColor(COLOR_LIGHT_BG);
  doc.rect(marginL, curY, contentW / 2 - 2, boxH, 'F');
  doc.setDrawColor(COLOR_BORDER);
  doc.rect(marginL, curY, contentW / 2 - 2, boxH, 'S');

  doc.setTextColor(COLOR_BLUE);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('PREPARED FOR / CLIENT DETAILS', marginL + 4, curY + 5);

  drawTextWithKhmerSupport(doc, sanitize(quotation.clientName, 'Client Name'), marginL + 4, curY + 10, { color: COLOR_NAVY, fontSize: 8.5, fontWeight: 'bold' });

  let clientY = curY + 14.5;
  if (quotation.clientCompany && quotation.clientCompany.trim()) {
    drawTextWithKhmerSupport(doc, sanitize(quotation.clientCompany), marginL + 4, clientY, { color: COLOR_MUTED, fontSize: 7, fontWeight: 'normal' });
    clientY += 4.2;
  }

  const phoneVal = sanitize(quotation.clientPhone, 'N/A');
  drawTextWithKhmerSupport(doc, `Tel / Phone: ${phoneVal}`, marginL + 4, clientY, { color: COLOR_NAVY, fontSize: 7.5, fontWeight: 'bold' });
  clientY += 4.5;

  if (quotation.projectSite && quotation.projectSite.trim()) {
    drawTextWithKhmerSupport(doc, `Project: ${sanitize(quotation.projectSite)}`, marginL + 4, clientY, { color: COLOR_MUTED, fontSize: 7, fontWeight: 'normal' });
  }

  // Right Column - Quotation Meta Box
  const rightX = marginL + contentW / 2 + 2;
  const rightW = contentW / 2 - 2;

  doc.setFillColor(COLOR_LIGHT_BG);
  doc.rect(rightX, curY, rightW, boxH, 'F');
  doc.rect(rightX, curY, rightW, boxH, 'S');

  doc.setTextColor(COLOR_BLUE);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('QUOTATION DETAILS', rightX + 4, curY + 5);

  doc.setTextColor(COLOR_MUTED);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Quote Date:`, rightX + 4, curY + 11);
  doc.text(`Valid Until:`, rightX + 4, curY + 16);
  doc.text(`Prepared By:`, rightX + 4, curY + 21);

  doc.setTextColor(COLOR_NAVY);
  doc.setFont('Helvetica', 'bold');
  doc.text(quotation.issueDate, rightX + 32, curY + 11);
  doc.text(quotation.expiryDate, rightX + 32, curY + 16);
  doc.text(sanitize(quotation.preparedBy, 'SDY Sales Engineering Dept'), rightX + 32, curY + 21);

  curY += boxH + 6;

  // Items Table Header - DARK BLUE (#0A4DA3)
  doc.setFillColor(COLOR_BLUE);
  doc.rect(marginL, curY, contentW, 8, 'F');

  doc.setTextColor('#FFFFFF');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);

  doc.text('#', marginL + 3, curY + 5.5);
  doc.text('ITEM DESCRIPTION & SPECIFICATION', marginL + 12, curY + 5.5);
  doc.text('QTY', marginL + 112, curY + 5.5, { align: 'center' });
  doc.text('UNIT', marginL + 128, curY + 5.5, { align: 'center' });
  doc.text('UNIT PRICE', marginL + 152, curY + 5.5, { align: 'right' });
  doc.text('TOTAL ($)', pageW - marginR - 3, curY + 5.5, { align: 'right' });

  curY += 8;

  // Items Rows
  quotation.items.forEach((item, index) => {
    const rowH = item.spec ? 12 : 8;

    if (index % 2 === 1) {
      doc.setFillColor('#F1F5F9');
      doc.rect(marginL, curY, contentW, rowH, 'F');
    }

    doc.setDrawColor(COLOR_BORDER);
    doc.line(marginL, curY + rowH, pageW - marginR, curY + rowH);

    doc.setTextColor(COLOR_NAVY);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`${index + 1}`, marginL + 3, curY + 5);

    doc.text(sanitize(item.name, 'Item Name'), marginL + 12, curY + 5);

    if (item.spec) {
      doc.setTextColor(COLOR_MUTED);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.text(sanitize(item.spec), marginL + 12, curY + 9.5);
    }

    doc.setTextColor(COLOR_NAVY);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`${item.quantity}`, marginL + 112, curY + 5, { align: 'center' });
    doc.text(sanitize(item.unit, 'Set'), marginL + 128, curY + 5, { align: 'center' });
    doc.text(formatUsd(item.unitPrice), marginL + 152, curY + 5, { align: 'right' });

    doc.setFont('Helvetica', 'bold');
    doc.text(formatUsd(item.total), pageW - marginR - 3, curY + 5, { align: 'right' });

    curY += rowH;
  });

  // Summary Totals
  curY += 4;
  const summaryBoxW = 75;
  const summaryBoxX = pageW - marginR - summaryBoxW;

  doc.setFillColor(COLOR_LIGHT_BG);
  doc.rect(summaryBoxX, curY, summaryBoxW, 28, 'F');
  doc.setDrawColor(COLOR_BORDER);
  doc.rect(summaryBoxX, curY, summaryBoxW, 28, 'S');

  doc.setFontSize(7.5);
  
  // Subtotal
  doc.setTextColor(COLOR_MUTED);
  doc.setFont('Helvetica', 'normal');
  doc.text('Subtotal:', summaryBoxX + 4, curY + 5.5);
  doc.setTextColor(COLOR_NAVY);
  doc.setFont('Helvetica', 'bold');
  doc.text(formatUsd(quotation.subtotal), summaryBoxX + summaryBoxW - 4, curY + 5.5, { align: 'right' });

  // Discount
  doc.setTextColor(COLOR_MUTED);
  doc.setFont('Helvetica', 'normal');
  doc.text('Discount:', summaryBoxX + 4, curY + 10.5);
  if (quotation.discountTotal && quotation.discountTotal > 0) {
    doc.setTextColor('#DC2626');
    doc.setFont('Helvetica', 'bold');
    doc.text(`-${formatUsd(quotation.discountTotal)}`, summaryBoxX + summaryBoxW - 4, curY + 10.5, { align: 'right' });
  } else {
    doc.setTextColor(COLOR_NAVY);
    doc.setFont('Helvetica', 'normal');
    doc.text('$0.00', summaryBoxX + summaryBoxW - 4, curY + 10.5, { align: 'right' });
  }

  // VAT
  doc.setTextColor(COLOR_MUTED);
  doc.setFont('Helvetica', 'normal');
  doc.text(`VAT (${quotation.vatPercent}%):`, summaryBoxX + 4, curY + 15.5);
  doc.setTextColor(COLOR_NAVY);
  doc.setFont('Helvetica', 'bold');
  doc.text(formatUsd(quotation.vatAmount), summaryBoxX + summaryBoxW - 4, curY + 15.5, { align: 'right' });

  doc.setDrawColor(COLOR_GOLD);
  doc.line(summaryBoxX + 4, curY + 18, summaryBoxX + summaryBoxW - 4, curY + 18);

  // Grand Total USD
  doc.setTextColor(COLOR_BLUE);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('GRAND TOTAL (USD):', summaryBoxX + 4, curY + 23.5);
  doc.text(formatUsd(quotation.grandTotalUsd), summaryBoxX + summaryBoxW - 4, curY + 23.5, { align: 'right' });

  // Terms & Conditions Left Box
  const termsW = contentW - summaryBoxW - 4;
  doc.setFillColor(COLOR_LIGHT_BG);
  doc.rect(marginL, curY, termsW, 28, 'F');
  doc.setDrawColor(COLOR_BORDER);
  doc.rect(marginL, curY, termsW, 28, 'S');

  doc.setTextColor(COLOR_BLUE);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('TERMS & CONDITIONS', marginL + 4, curY + 5);

  doc.setTextColor(COLOR_MUTED);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(6.5);
  const termsLines = doc.splitTextToSize(quotation.termsAndConditions || 'Payment: 30% advance deposit, 50% delivery, 20% handover.', termsW - 8);
  doc.text(termsLines.slice(0, 5), marginL + 4, curY + 9.5);

  curY += 34;

  // Equivalency Bar (KHR) - DARK BLUE (#0A4DA3)
  doc.setFillColor(COLOR_BLUE);
  doc.rect(marginL, curY, contentW, 7, 'F');
  doc.setTextColor('#FFFFFF');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(`EQUIVALENT IN KHMER RIEL (KHR): ${formatKhr(quotation.grandTotalKhr)} (Exchange Rate: 1 USD = 4,100 KHR)`, marginL + 4, curY + 4.8);

  curY += 16;

  // Signature Block
  const sigW = contentW / 2 - 10;
  
  // Left Signature
  doc.setDrawColor(COLOR_MUTED);
  doc.line(marginL + 5, curY + 15, marginL + 5 + sigW, curY + 15);
  doc.setTextColor(COLOR_NAVY);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('AUTHORIZED SIGNATURE & STAMP', marginL + 5, curY + 19);
  doc.setTextColor(COLOR_MUTED);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('SDY Company C&I Representative', marginL + 5, curY + 23);

  // Right Signature
  const sigRightX = pageW - marginR - sigW - 5;
  doc.line(sigRightX, curY + 15, sigRightX + sigW, curY + 15);
  doc.setTextColor(COLOR_NAVY);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('CLIENT ACCEPTANCE SIGNATURE', sigRightX, curY + 19);
  doc.setTextColor(COLOR_MUTED);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('Client Name & Seal Approval', sigRightX, curY + 23);

  // Footer Branding
  const footerY = pageH - 12;
  doc.setDrawColor(COLOR_GOLD);
  doc.setLineWidth(0.3);
  doc.line(marginL, footerY - 2, pageW - marginR, footerY - 2);

  doc.setTextColor(COLOR_MUTED);
  doc.setFontSize(6);
  doc.text('SDY C&I Corporate Tower, Phnom Penh, Kingdom of Cambodia | ISO 9001:2026 Certified Facility', marginL, footerY + 1);
  doc.text('Page 1 of 1 • Official Business Document', pageW - marginR, footerY + 1, { align: 'right' });

  if (download) {
    doc.save(`${quotation.quoteNumber}_SDY_Quotation.pdf`);
  }
  return doc;
}

// =================================================================================
// 2. GENERATE BOQ (BILL OF QUANTITIES) PDF
// =================================================================================
export async function generateBoqPdf(boq: BoqDocument, companyInfo?: any, download = true): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginL = 12;
  const marginR = 12;
  const marginT = 12;
  const contentW = pageW - marginL - marginR;

  let curY = marginT;

  // Header Logo & Company Info
  let logoH = 20;
  let logoW = 22;
  let textX = marginL + 25;

  try {
    const logoData = await generateSdyLogoData();
    if (logoData && logoData.base64) {
      logoH = 20;
      logoW = Math.min(Math.max(logoH * logoData.aspect, 16), 40);
      textX = marginL + logoW + 4;
      doc.addImage(logoData.base64, 'PNG', marginL, curY, logoW, logoH);
    }
  } catch (e) {
    console.warn(e);
  }

  doc.setTextColor(COLOR_NAVY);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(companyInfo?.CompanyName || 'SDY COMPANY C&I', textX, curY + 4.2);

  doc.setTextColor(COLOR_BLUE);
  doc.setFontSize(6.5);
  doc.setFont('Helvetica', 'bold');
  doc.text('BILL OF QUANTITIES & ENGINEERING SPECIFICATION COST SHEET', textX, curY + 8.8);

  doc.setTextColor(COLOR_MUTED);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(6);
  doc.text(`Phnom Penh Plant | Tel: ${companyInfo?.PhoneNumber || '+855 23 888 999'} | Email: ${companyInfo?.Email || 'info@sdy-ci.com'}`, textX, curY + 13);

  // Document Title Header Top Right
  doc.setTextColor(COLOR_BLUE);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('BILL OF QUANTITIES (BOQ)', pageW - marginR, curY + 4.2, { align: 'right' });

  doc.setTextColor(COLOR_NAVY);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(boq.boqNumber, pageW - marginR, curY + 10, { align: 'right' });

  curY += Math.max(logoH, 18) + 4;
  doc.setDrawColor(COLOR_GOLD);
  doc.setLineWidth(0.4);
  doc.line(marginL, curY, pageW - marginR, curY);

  // Project Info Bar
  curY += 4;
  doc.setFillColor(COLOR_LIGHT_BG);
  doc.rect(marginL, curY, contentW, 16, 'F');
  doc.setDrawColor(COLOR_BORDER);
  doc.rect(marginL, curY, contentW, 16, 'S');

  doc.setTextColor(COLOR_BLUE);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7);

  doc.text('PROJECT:', marginL + 4, curY + 5);
  doc.text('LOCATION:', marginL + 4, curY + 11);

  doc.text('CLIENT:', marginL + 105, curY + 5);
  doc.text('DATE:', marginL + 105, curY + 11);

  doc.setTextColor(COLOR_NAVY);
  doc.setFont('Helvetica', 'bold');
  doc.text(sanitize(boq.projectName, 'Project Name'), marginL + 22, curY + 5);
  doc.text(sanitize(boq.projectLocation, 'Phnom Penh Site'), marginL + 22, curY + 11);

  doc.text(sanitize(boq.clientName, 'Client Name'), marginL + 118, curY + 5);
  doc.text(boq.date, marginL + 118, curY + 11);

  curY += 21;

  // Categories Loop
  boq.categories.forEach((cat) => {
    // Category Header Line
    doc.setFillColor(COLOR_NAVY);
    doc.rect(marginL, curY, contentW, 6.5, 'F');
    doc.setTextColor('#FFFFFF');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(cat.categoryName.toUpperCase(), marginL + 4, curY + 4.5);

    curY += 6.5;

    // Table Header - DARK BLUE (#0A4DA3)
    doc.setFillColor(COLOR_BLUE);
    doc.rect(marginL, curY, contentW, 6.5, 'F');
    doc.setTextColor('#FFFFFF');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('REF', marginL + 3, curY + 4.5);
    doc.text('DESCRIPTION & SPECIFICATION', marginL + 16, curY + 4.5);
    doc.text('UNIT', marginL + 102, curY + 4.5, { align: 'center' });
    doc.text('QTY', marginL + 118, curY + 4.5, { align: 'center' });
    doc.text('MAT. RATE', marginL + 140, curY + 4.5, { align: 'right' });
    doc.text('LAB. RATE', marginL + 162, curY + 4.5, { align: 'right' });
    doc.text('AMOUNT ($)', pageW - marginR - 3, curY + 4.5, { align: 'right' });

    curY += 6.5;

    // Rows
    cat.items.forEach((item, rIdx) => {
      const descWidth = 82;
      const descLines = doc.splitTextToSize(sanitize(item.description), descWidth);
      const rowH = Math.max(7, descLines.length * 3.8 + 3);

      if (rIdx % 2 === 1) {
        doc.setFillColor('#F8FAFC');
        doc.rect(marginL, curY, contentW, rowH, 'F');
      }

      doc.setDrawColor(COLOR_BORDER);
      doc.line(marginL, curY + rowH, pageW - marginR, curY + rowH);

      doc.setTextColor(COLOR_NAVY);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(7);
      doc.text(sanitize(item.refCode, `0${rIdx + 1}`), marginL + 3, curY + 4.5);

      doc.setFont('Helvetica', 'normal');
      descLines.forEach((line: string, lineIdx: number) => {
        doc.text(line, marginL + 16, curY + 4.5 + lineIdx * 3.8);
      });

      doc.text(sanitize(item.unit, 'Set'), marginL + 102, curY + 4.5, { align: 'center' });
      doc.text(`${item.quantity}`, marginL + 118, curY + 4.5, { align: 'center' });
      doc.text(formatUsd(item.materialRate), marginL + 140, curY + 4.5, { align: 'right' });
      doc.text(formatUsd(item.laborRate), marginL + 162, curY + 4.5, { align: 'right' });

      doc.setFont('Helvetica', 'bold');
      doc.text(formatUsd(item.totalAmount), pageW - marginR - 3, curY + 4.5, { align: 'right' });

      curY += rowH;
    });

    curY += 4;
  });

  // Summary Table
  const sumW = 80;
  const sumX = pageW - marginR - sumW;

  doc.setFillColor(COLOR_LIGHT_BG);
  doc.rect(sumX, curY, sumW, 26, 'F');
  doc.setDrawColor(COLOR_BORDER);
  doc.rect(sumX, curY, sumW, 26, 'S');

  doc.setFontSize(7);
  doc.setTextColor(COLOR_MUTED);
  doc.setFont('Helvetica', 'normal');
  doc.text('Subtotal Material & Labor:', sumX + 3, curY + 5);
  doc.setTextColor(COLOR_NAVY);
  doc.setFont('Helvetica', 'bold');
  doc.text(formatUsd(boq.subtotal), sumX + sumW - 3, curY + 5, { align: 'right' });

  doc.setTextColor(COLOR_MUTED);
  doc.setFont('Helvetica', 'normal');
  doc.text(`VAT (${boq.vatPercent}%):`, sumX + 3, curY + 10);
  doc.setTextColor(COLOR_NAVY);
  doc.setFont('Helvetica', 'bold');
  doc.text(formatUsd(boq.vatAmount), sumX + sumW - 3, curY + 10, { align: 'right' });

  doc.setDrawColor(COLOR_GOLD);
  doc.line(sumX + 3, curY + 13, sumX + sumW - 3, curY + 13);

  doc.setTextColor(COLOR_BLUE);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('GRAND TOTAL (USD):', sumX + 3, curY + 18);
  doc.text(formatUsd(boq.grandTotalUsd), sumX + sumW - 3, curY + 18, { align: 'right' });

  doc.setFontSize(7);
  doc.setTextColor(COLOR_MUTED);
  doc.text(`(KHR: ${formatKhr(boq.grandTotalKhr)})`, sumX + sumW - 3, curY + 23, { align: 'right' });

  curY += 30;

  // Signatures
  const sigW = contentW / 3 - 6;

  ['Prepared By (SDY Estimator)', 'Reviewed By (Lead Engineer)', 'Approved By (Client Rep)'].forEach((label, idx) => {
    const x = marginL + idx * (sigW + 9);
    doc.setDrawColor(COLOR_MUTED);
    doc.line(x, curY + 12, x + sigW, curY + 12);
    doc.setTextColor(COLOR_NAVY);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text(label, x + sigW / 2, curY + 16, { align: 'center' });
  });

  if (download) {
    doc.save(`${boq.boqNumber}_SDY_BOQ.pdf`);
  }
  return doc;
}

// =================================================================================
// 3. GENERATE DELIVERY NOTE PDF
// =================================================================================
export async function generateDeliveryNotePdf(dn: DeliveryNote, companyInfo?: any, download = true): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginL = 15;
  const marginR = 15;
  const marginT = 15;
  const contentW = pageW - marginL - marginR;

  let curY = marginT;

  // Header Logo & Company Info
  let logoH = 22;
  let logoW = 24;
  let textX = marginL + 28;

  try {
    const logoData = await generateSdyLogoData();
    if (logoData && logoData.base64) {
      logoH = 22;
      logoW = Math.min(Math.max(logoH * logoData.aspect, 18), 45);
      textX = marginL + logoW + 4;
      doc.addImage(logoData.base64, 'PNG', marginL, curY, logoW, logoH);
    }
  } catch (e) {
    console.warn(e);
  }

  doc.setTextColor(COLOR_NAVY);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.text(companyInfo?.CompanyName || 'SDY COMPANY C&I', textX, curY + 4.2);

  doc.setTextColor(COLOR_BLUE);
  doc.setFontSize(7);
  doc.setFont('Helvetica', 'bold');
  doc.text('CONSTRUCTION • INTERIOR DESIGN • FURNITURE', textX, curY + 8.8);

  doc.setTextColor(COLOR_MUTED);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(`${companyInfo?.Address || 'Phnom Penh, Cambodia'} | Tel: ${companyInfo?.PhoneNumber || '+855 23 888 999'}`, textX, curY + 13);
  doc.text(`Email: ${companyInfo?.Email || 'info@sdy-ci.com'} | Web: www.sdy-ci.com`, textX, curY + 17);

  // Title Header Top Right
  doc.setTextColor(COLOR_BLUE);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13.5);
  doc.text('OFFICIAL DELIVERY NOTE (DO)', pageW - marginR, curY + 4.2, { align: 'right' });

  doc.setTextColor(COLOR_NAVY);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(dn.deliveryNumber, pageW - marginR, curY + 10, { align: 'right' });

  doc.setTextColor(COLOR_MUTED);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`Date: ${dn.date || new Date().toISOString().split('T')[0]}`, pageW - marginR, curY + 14.5, { align: 'right' });

  curY += Math.max(logoH, 22) + 4;
  doc.setDrawColor(COLOR_GOLD);
  doc.setLineWidth(0.5);
  doc.line(marginL, curY, pageW - marginR, curY);

  // Info Cards
  curY += 6;
  const boxH = 32;
  const cardW = contentW / 2 - 2;

  // Left Card - Recipient
  doc.setFillColor(COLOR_LIGHT_BG);
  doc.rect(marginL, curY, cardW, boxH, 'F');
  doc.setDrawColor(COLOR_BORDER);
  doc.rect(marginL, curY, cardW, boxH, 'S');

  doc.setTextColor(COLOR_BLUE);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('RECIPIENT & DELIVERY SITE', marginL + 4, curY + 5);

  drawTextWithKhmerSupport(doc, sanitize(dn.clientName, 'Client Name'), marginL + 4, curY + 10, { color: COLOR_NAVY, fontSize: 8.5, fontWeight: 'bold' });

  let clientY = curY + 14.5;
  if (dn.projectSite && dn.projectSite.trim()) {
    drawTextWithKhmerSupport(doc, `Site: ${sanitize(dn.projectSite)}`, marginL + 4, clientY, { color: COLOR_MUTED, fontSize: 7, fontWeight: 'normal' });
    clientY += 4.2;
  }

  const contactVal = sanitize(dn.contactPerson, 'N/A');
  drawTextWithKhmerSupport(doc, `Contact: ${contactVal}`, marginL + 4, clientY, { color: COLOR_NAVY, fontSize: 7.5, fontWeight: 'bold' });

  // Right Card - Dispatch
  const rightX = marginL + cardW + 4;
  doc.setFillColor(COLOR_LIGHT_BG);
  doc.rect(rightX, curY, cardW, boxH, 'F');
  doc.rect(rightX, curY, cardW, boxH, 'S');

  doc.setTextColor(COLOR_BLUE);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('DISPATCH DETAILS', rightX + 4, curY + 5);

  doc.setTextColor(COLOR_MUTED);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`PO Reference:`, rightX + 4, curY + 11);
  doc.text(`Dispatch Date:`, rightX + 4, curY + 16);
  doc.text(`Vehicle / Plate:`, rightX + 4, curY + 21);
  doc.text(`Driver Name:`, rightX + 4, curY + 26);

  doc.setTextColor(COLOR_NAVY);
  doc.setFont('Helvetica', 'bold');
  doc.text(sanitize(dn.poReference, 'N/A'), rightX + 32, curY + 11);
  doc.text(dn.date, rightX + 32, curY + 16);
  doc.text(sanitize(dn.vehicleNo, 'N/A'), rightX + 32, curY + 21);
  doc.text(sanitize(dn.driverName, 'N/A'), rightX + 32, curY + 26);

  curY += boxH + 6;

  // Table Header - DARK BLUE (#0A4DA3)
  doc.setFillColor(COLOR_BLUE);
  doc.rect(marginL, curY, contentW, 8, 'F');

  doc.setTextColor('#FFFFFF');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('#', marginL + 3, curY + 5.5);
  doc.text('CODE', marginL + 11, curY + 5.5);
  doc.text('ITEM DESCRIPTION', marginL + 34, curY + 5.5);
  doc.text('ORDERED', marginL + 104, curY + 5.5, { align: 'center' });
  doc.text('DELIVERED', marginL + 122, curY + 5.5, { align: 'center' });
  doc.text('UNIT', marginL + 138, curY + 5.5, { align: 'center' });
  doc.text('REMARK / CONDITION', pageW - marginR - 3, curY + 5.5, { align: 'right' });

  curY += 8;

  // Table Rows
  dn.items.forEach((item, idx) => {
    const descWidth = 66;
    const descLines = doc.splitTextToSize(sanitize(item.description), descWidth);

    const remarkWidth = 38;
    const remarkText = sanitize(item.remark, 'Good condition');
    const remarkLines = doc.splitTextToSize(remarkText, remarkWidth);

    const maxLines = Math.max(descLines.length, remarkLines.length);
    const rowH = Math.max(8, maxLines * 4 + 3);

    if (idx % 2 === 1) {
      doc.setFillColor('#F1F5F9');
      doc.rect(marginL, curY, contentW, rowH, 'F');
    }

    doc.setDrawColor(COLOR_BORDER);
    doc.line(marginL, curY + rowH, pageW - marginR, curY + rowH);

    doc.setTextColor(COLOR_NAVY);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(`${idx + 1}`, marginL + 3, curY + 5);
    doc.text(sanitize(item.code, `ITM-${idx + 1}`), marginL + 11, curY + 5);

    descLines.forEach((line: string, lineIdx: number) => {
      drawTextWithKhmerSupport(doc, line, marginL + 34, curY + 5 + lineIdx * 4, { color: COLOR_NAVY, fontSize: 7.5, fontWeight: 'normal' });
    });

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`${item.orderedQty}`, marginL + 104, curY + 5, { align: 'center' });
    doc.setFont('Helvetica', 'bold');
    doc.text(`${item.deliveredQty}`, marginL + 122, curY + 5, { align: 'center' });

    doc.setFont('Helvetica', 'normal');
    doc.text(sanitize(item.unit, 'Set'), marginL + 138, curY + 5, { align: 'center' });

    remarkLines.forEach((rLine: string, rLineIdx: number) => {
      drawTextWithKhmerSupport(doc, rLine, pageW - marginR - 3, curY + 5 + rLineIdx * 3.8, { color: COLOR_MUTED, fontSize: 6.5, fontWeight: 'normal', align: 'right' });
    });

    curY += rowH;
  });

  // Notes Box
  curY += 6;
  doc.setFillColor(COLOR_LIGHT_BG);
  doc.rect(marginL, curY, contentW, 20, 'F');
  doc.setDrawColor(COLOR_BORDER);
  doc.rect(marginL, curY, contentW, 20, 'S');

  doc.setTextColor(COLOR_BLUE);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('DELIVERY REMARKS & DISPATCH ACKNOWLEDGMENT', marginL + 4, curY + 5);

  const notesStr = sanitize(dn.notes, 'Goods received in good condition, complete quantity, and strictly matching specifications.');
  drawTextWithKhmerSupport(doc, notesStr, marginL + 4, curY + 11, { color: COLOR_MUTED, fontSize: 7, fontWeight: 'normal' });

  curY += 28;

  // 3-Signature Block
  const sigW = contentW / 3 - 6;

  // Prepared By
  let sigX = marginL;
  doc.setDrawColor(COLOR_MUTED);
  doc.line(sigX, curY + 15, sigX + sigW, curY + 15);
  doc.setTextColor(COLOR_NAVY);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('PREPARED BY (LOGISTICS)', sigX + sigW / 2, curY + 19, { align: 'center' });
  drawTextWithKhmerSupport(doc, sanitize(dn.preparedBy), sigX + sigW / 2, curY + 23, { color: COLOR_MUTED, fontSize: 6.5, fontWeight: 'normal', align: 'center' });

  // Dispatched By
  sigX = marginL + sigW + 9;
  doc.line(sigX, curY + 15, sigX + sigW, curY + 15);
  doc.setTextColor(COLOR_NAVY);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('DISPATCHED BY (DRIVER)', sigX + sigW / 2, curY + 19, { align: 'center' });
  drawTextWithKhmerSupport(doc, sanitize(dn.dispatchedBy), sigX + sigW / 2, curY + 23, { color: COLOR_MUTED, fontSize: 6.5, fontWeight: 'normal', align: 'center' });

  // Received By
  sigX = marginL + (sigW + 9) * 2;
  doc.line(sigX, curY + 15, sigX + sigW, curY + 15);
  doc.setTextColor(COLOR_NAVY);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('RECEIVED & ACCEPTED BY', sigX + sigW / 2, curY + 19, { align: 'center' });
  drawTextWithKhmerSupport(doc, sanitize(dn.receivedBy), sigX + sigW / 2, curY + 23, { color: COLOR_MUTED, fontSize: 6.5, fontWeight: 'normal', align: 'center' });

  // Footer
  const footerY = pageH - 12;
  doc.setDrawColor(COLOR_GOLD);
  doc.setLineWidth(0.3);
  doc.line(marginL, footerY - 2, pageW - marginR, footerY - 2);

  doc.setTextColor(COLOR_MUTED);
  doc.setFontSize(6);
  doc.text('SDY C&I Logistics & Dispatch Division | Phnom Penh, Kingdom of Cambodia', marginL, footerY + 1);
  doc.text('Page 1 of 1 • Delivery Acknowledgement', pageW - marginR, footerY + 1, { align: 'right' });

  if (download) {
    doc.save(`${dn.deliveryNumber}_SDY_DeliveryNote.pdf`);
  }
  return doc;
}

// =================================================================================
// 4. GENERATE INVOICE PDF
// =================================================================================
export async function generateInvoicePdf(invoice: Invoice | Quotation | any, companyInfo?: any, download = true): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginL = 15;
  const marginR = 15;
  const marginT = 15;
  const contentW = pageW - marginL - marginR;

  let curY = marginT;

  // Derive normalized invoice data
  const invNumber = invoice.invoiceNumber || invoice.quoteNumber?.replace('QT', 'INV') || `SDY-INV-2026-${Math.floor(100 + Math.random() * 900)}`;
  const issueDate = invoice.issueDate || invoice.date || new Date().toISOString().split('T')[0];
  const dueDate = invoice.dueDate || invoice.expiryDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const clientName = invoice.clientName || '';
  const clientCompany = invoice.clientCompany || '';
  const clientPhone = invoice.clientPhone || '';
  const clientEmail = invoice.clientEmail || '';
  const projectSite = invoice.projectSite || invoice.projectLocation || '';
  const items = invoice.items || [];
  const subtotal = invoice.subtotal || 0;
  const discountTotal = invoice.discountTotal || 0;
  const vatPercent = invoice.vatPercent ?? 10;
  const vatAmount = invoice.vatAmount ?? ((subtotal - discountTotal) * vatPercent) / 100;
  const grandTotalUsd = invoice.grandTotalUsd ?? (subtotal - discountTotal + vatAmount);
  const grandTotalKhr = invoice.grandTotalKhr ?? grandTotalUsd * 4100;

  // Header Logo & Company Info
  let logoH = 22;
  let logoW = 24;
  let textX = marginL + 28;

  try {
    const logoData = await generateSdyLogoData();
    if (logoData && logoData.base64) {
      logoH = 22;
      logoW = Math.min(Math.max(logoH * logoData.aspect, 18), 45);
      textX = marginL + logoW + 4;
      doc.addImage(logoData.base64, 'PNG', marginL, curY, logoW, logoH);
    }
  } catch (e) {
    console.warn(e);
  }

  // Company Header Text
  doc.setTextColor(COLOR_NAVY);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.text(companyInfo?.CompanyName || 'SDY COMPANY C&I', textX, curY + 4.2);

  doc.setTextColor(COLOR_BLUE);
  doc.setFontSize(7);
  doc.setFont('Helvetica', 'bold');
  doc.text('CONSTRUCTION • INTERIOR DESIGN • FURNITURE', textX, curY + 8.8);

  doc.setTextColor(COLOR_MUTED);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(`${companyInfo?.Address || 'Phnom Penh, Cambodia'} | Tel: ${companyInfo?.PhoneNumber || '+855 23 888 999'}`, textX, curY + 13);
  doc.text(`Email: ${companyInfo?.Email || 'info@sdy-ci.com'} | Web: www.sdy-ci.com`, textX, curY + 17);

  // Document Title Header Top Right
  doc.setTextColor(COLOR_BLUE);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13.5);
  doc.text('INVOICE', pageW - marginR, curY + 4.2, { align: 'right' });

  doc.setTextColor(COLOR_NAVY);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(invNumber, pageW - marginR, curY + 10, { align: 'right' });

  doc.setTextColor(COLOR_MUTED);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`Invoice Date: ${issueDate}`, pageW - marginR, curY + 14.5, { align: 'right' });

  curY += Math.max(logoH, 22) + 4;
  doc.setDrawColor(COLOR_GOLD);
  doc.setLineWidth(0.5);
  doc.line(marginL, curY, pageW - marginR, curY);

  // Metadata Grid
  curY += 6;
  const boxH = 32;

  // Left Column - Bill To / Client Details Card
  doc.setFillColor(COLOR_LIGHT_BG);
  doc.rect(marginL, curY, contentW / 2 - 2, boxH, 'F');
  doc.setDrawColor(COLOR_BORDER);
  doc.rect(marginL, curY, contentW / 2 - 2, boxH, 'S');

  doc.setTextColor(COLOR_BLUE);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('BILL TO / CLIENT DETAILS', marginL + 4, curY + 5);

  drawTextWithKhmerSupport(doc, sanitize(clientName, 'Client Name'), marginL + 4, curY + 10, { color: COLOR_NAVY, fontSize: 8.5, fontWeight: 'bold' });

  let clientY = curY + 14.5;
  if (clientCompany && clientCompany.trim()) {
    drawTextWithKhmerSupport(doc, sanitize(clientCompany), marginL + 4, clientY, { color: COLOR_MUTED, fontSize: 7, fontWeight: 'normal' });
    clientY += 4.2;
  }

  const phoneVal = sanitize(clientPhone, 'N/A');
  drawTextWithKhmerSupport(doc, `Tel / Phone: ${phoneVal}`, marginL + 4, clientY, { color: COLOR_NAVY, fontSize: 7.5, fontWeight: 'bold' });
  clientY += 4.5;

  if (projectSite && projectSite.trim()) {
    drawTextWithKhmerSupport(doc, `Project: ${sanitize(projectSite)}`, marginL + 4, clientY, { color: COLOR_MUTED, fontSize: 7, fontWeight: 'normal' });
  }

  // Right Column - Invoice Details Card
  const rightX = marginL + contentW / 2 + 2;
  const rightW = contentW / 2 - 2;

  doc.setFillColor(COLOR_LIGHT_BG);
  doc.rect(rightX, curY, rightW, boxH, 'F');
  doc.rect(rightX, curY, rightW, boxH, 'S');

  doc.setTextColor(COLOR_BLUE);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('INVOICE & PAYMENT DETAILS', rightX + 4, curY + 5);

  doc.setTextColor(COLOR_MUTED);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Invoice Date:`, rightX + 4, curY + 11);
  doc.text(`Payment Due:`, rightX + 4, curY + 16);
  doc.text(`PO Reference:`, rightX + 4, curY + 21);
  doc.text(`Prepared By:`, rightX + 4, curY + 26);

  doc.setTextColor(COLOR_NAVY);
  doc.setFont('Helvetica', 'bold');
  doc.text(issueDate, rightX + 32, curY + 11);
  doc.text(dueDate, rightX + 32, curY + 16);
  doc.text(sanitize(invoice.poReference || invoice.quoteReference, 'PO-2026-001'), rightX + 32, curY + 21);
  doc.text(sanitize(invoice.preparedBy, 'SDY Finance Dept'), rightX + 32, curY + 26);

  curY += boxH + 6;

  // Table Header - DARK BLUE (#0A4DA3)
  doc.setFillColor(COLOR_BLUE);
  doc.rect(marginL, curY, contentW, 8, 'F');

  doc.setTextColor('#FFFFFF');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);

  doc.text('#', marginL + 3, curY + 5.5);
  doc.text('ITEM DESCRIPTION & SPECIFICATION', marginL + 12, curY + 5.5);
  doc.text('QTY', marginL + 112, curY + 5.5, { align: 'center' });
  doc.text('UNIT', marginL + 128, curY + 5.5, { align: 'center' });
  doc.text('UNIT PRICE', marginL + 152, curY + 5.5, { align: 'right' });
  doc.text('AMOUNT ($)', pageW - marginR - 3, curY + 5.5, { align: 'right' });

  curY += 8;

  // Table Rows
  items.forEach((item: any, index: number) => {
    const rowH = item.spec ? 12 : 8;

    if (index % 2 === 1) {
      doc.setFillColor('#F1F5F9');
      doc.rect(marginL, curY, contentW, rowH, 'F');
    }

    doc.setDrawColor(COLOR_BORDER);
    doc.line(marginL, curY + rowH, pageW - marginR, curY + rowH);

    doc.setTextColor(COLOR_NAVY);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`${index + 1}`, marginL + 3, curY + 5);

    drawTextWithKhmerSupport(doc, sanitize(item.name || item.description, 'Item Name'), marginL + 12, curY + 5, { color: COLOR_NAVY, fontSize: 8, fontWeight: 'bold' });

    if (item.spec) {
      drawTextWithKhmerSupport(doc, sanitize(item.spec), marginL + 12, curY + 9.5, { color: COLOR_MUTED, fontSize: 6.5, fontWeight: 'normal' });
    }

    doc.setTextColor(COLOR_NAVY);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`${item.quantity}`, marginL + 112, curY + 5, { align: 'center' });
    doc.text(sanitize(item.unit, 'Set'), marginL + 128, curY + 5, { align: 'center' });
    doc.text(formatUsd(item.unitPrice || 0), marginL + 152, curY + 5, { align: 'right' });

    doc.setFont('Helvetica', 'bold');
    doc.text(formatUsd(item.total || (item.quantity * item.unitPrice)), pageW - marginR - 3, curY + 5, { align: 'right' });

    curY += rowH;
  });

  // Summary & Bank Transfer Details
  curY += 4;
  const summaryBoxW = 75;
  const summaryBoxX = pageW - marginR - summaryBoxW;

  // Right Box - Totals Summary
  doc.setFillColor(COLOR_LIGHT_BG);
  doc.rect(summaryBoxX, curY, summaryBoxW, 30, 'F');
  doc.setDrawColor(COLOR_BORDER);
  doc.rect(summaryBoxX, curY, summaryBoxW, 30, 'S');

  doc.setFontSize(7.5);

  doc.setTextColor(COLOR_MUTED);
  doc.setFont('Helvetica', 'normal');
  doc.text('Subtotal:', summaryBoxX + 4, curY + 5.5);
  doc.setTextColor(COLOR_NAVY);
  doc.setFont('Helvetica', 'bold');
  doc.text(formatUsd(subtotal), summaryBoxX + summaryBoxW - 4, curY + 5.5, { align: 'right' });

  doc.setTextColor(COLOR_MUTED);
  doc.setFont('Helvetica', 'normal');
  doc.text('Discount:', summaryBoxX + 4, curY + 10.5);
  if (discountTotal > 0) {
    doc.setTextColor('#DC2626');
    doc.setFont('Helvetica', 'bold');
    doc.text(`-${formatUsd(discountTotal)}`, summaryBoxX + summaryBoxW - 4, curY + 10.5, { align: 'right' });
  } else {
    doc.setTextColor(COLOR_NAVY);
    doc.setFont('Helvetica', 'normal');
    doc.text('$0.00', summaryBoxX + summaryBoxW - 4, curY + 10.5, { align: 'right' });
  }

  doc.setTextColor(COLOR_MUTED);
  doc.setFont('Helvetica', 'normal');
  doc.text(`VAT (${vatPercent}%):`, summaryBoxX + 4, curY + 15.5);
  doc.setTextColor(COLOR_NAVY);
  doc.setFont('Helvetica', 'bold');
  doc.text(formatUsd(vatAmount), summaryBoxX + summaryBoxW - 4, curY + 15.5, { align: 'right' });

  doc.setDrawColor(COLOR_GOLD);
  doc.line(summaryBoxX + 4, curY + 19, summaryBoxX + summaryBoxW - 4, curY + 19);

  doc.setTextColor(COLOR_BLUE);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('TOTAL AMOUNT DUE (USD):', summaryBoxX + 4, curY + 25);
  doc.text(formatUsd(grandTotalUsd), summaryBoxX + summaryBoxW - 4, curY + 25, { align: 'right' });

  // Left Box - Bank Transfer Info
  const termsW = contentW - summaryBoxW - 4;
  doc.setFillColor(COLOR_LIGHT_BG);
  doc.rect(marginL, curY, termsW, 30, 'F');
  doc.setDrawColor(COLOR_BORDER);
  doc.rect(marginL, curY, termsW, 30, 'S');

  doc.setTextColor(COLOR_BLUE);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('BANK TRANSFER & WIRE PAYMENT INSTRUCTIONS', marginL + 4, curY + 5);

  doc.setTextColor(COLOR_NAVY);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('Bank Name:', marginL + 4, curY + 10);
  doc.text('Account Name:', marginL + 4, curY + 14.5);
  doc.text('USD Account:', marginL + 4, curY + 19);
  doc.text('SWIFT Code:', marginL + 4, curY + 23.5);

  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(COLOR_MUTED);
  doc.text('ABA BANK (Advanced Bank of Asia)', marginL + 28, curY + 10);
  doc.text('SDY COMPANY C&I CO., LTD.', marginL + 28, curY + 14.5);
  doc.text('000 888 999 (USD) / 000 888 998 (KHR)', marginL + 28, curY + 19);
  doc.text('ABAC33PP (Phnom Penh Main Branch)', marginL + 28, curY + 23.5);

  doc.setFontSize(6);
  doc.text('Please quote Invoice No. in payment remark.', marginL + 4, curY + 27.5);

  curY += 36;

  // Equivalency Bar (KHR) - DARK BLUE (#0A4DA3)
  doc.setFillColor(COLOR_BLUE);
  doc.rect(marginL, curY, contentW, 7, 'F');
  doc.setTextColor('#FFFFFF');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(`EQUIVALENT IN KHMER RIEL (KHR): ${formatKhr(grandTotalKhr)} (Exchange Rate: 1 USD = 4,100 KHR)`, marginL + 4, curY + 4.8);

  curY += 16;

  // Signature Block
  const sigW = contentW / 2 - 10;

  // Left Signature
  doc.setDrawColor(COLOR_MUTED);
  doc.line(marginL + 5, curY + 15, marginL + 5 + sigW, curY + 15);
  doc.setTextColor(COLOR_NAVY);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('AUTHORIZED SIGNATURE & STAMP', marginL + 5, curY + 19);
  doc.setTextColor(COLOR_MUTED);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('SDY Company C&I Finance Dept', marginL + 5, curY + 23);

  // Right Signature
  const sigRightX = pageW - marginR - sigW - 5;
  doc.line(sigRightX, curY + 15, sigRightX + sigW, curY + 15);
  doc.setTextColor(COLOR_NAVY);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('CLIENT / PAYER ACKNOWLEDGMENT', sigRightX, curY + 19);
  doc.setTextColor(COLOR_MUTED);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('Received & Approved by Client Rep', sigRightX, curY + 23);

  // Footer Branding
  const footerY = pageH - 12;
  doc.setDrawColor(COLOR_GOLD);
  doc.setLineWidth(0.3);
  doc.line(marginL, footerY - 2, pageW - marginR, footerY - 2);

  doc.setTextColor(COLOR_MUTED);
  doc.setFontSize(6);
  doc.text('SDY C&I Corporate Tower, Phnom Penh, Kingdom of Cambodia | Official Tax Document', marginL, footerY + 1);
  doc.text('Page 1 of 1 • Commercial Tax Invoice', pageW - marginR, footerY + 1, { align: 'right' });

  if (download) {
    doc.save(`${invNumber}_SDY_Invoice.pdf`);
  }
  return doc;
}
