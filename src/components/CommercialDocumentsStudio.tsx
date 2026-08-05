import React, { useState, useEffect, FormEvent } from 'react';
import {
  FileText, Plus, Search, Download, Send, Edit3, Trash2,
  Receipt, Truck, X, Sparkles, Filter, ArrowRight, DollarSign,
  Building, Phone, Mail, Calendar, CheckCircle2, AlertCircle, Clock
} from 'lucide-react';
import {
  Quotation, QuotationItem, Invoice, InvoiceItem, DeliveryNote, DeliveryNoteItem,
  getQuotations, saveQuotation, deleteQuotation,
  getInvoices, saveInvoice, deleteInvoice,
  getDeliveryNotes, saveDeliveryNote, deleteDeliveryNote,
  convertQuotationToInvoice, convertQuotationToDeliveryNote,
  KHR_EXCHANGE_RATE
} from '../services/commercialDocsService';
import { generateQuotationPdf, generateInvoicePdf, generateDeliveryNotePdf } from '../utils/documentPdfGenerator';
import { PRODUCTS } from '../data';
import { useLanguage } from './LanguageContext';

export default function CommercialDocumentsStudio() {
  const { language, companyInfo } = useLanguage();

  // Helper for multi-language display
  const txt = (km: string, en: string, ko?: string) => {
    if (language === 'km') return km;
    if (language === 'ko') return ko || en;
    return en;
  };

  const [activeSubTab, setActiveSubTab] = useState<'quotations' | 'invoices' | 'delivery'>('quotations');

  // Datasets
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals & Editors
  const [editingQuote, setEditingQuote] = useState<Quotation | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const [editingDn, setEditingDn] = useState<DeliveryNote | null>(null);
  const [isDnModalOpen, setIsDnModalOpen] = useState(false);

  // Toast Status Message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    refreshData();
    const handleDocsUpdate = () => refreshData();
    window.addEventListener('sdy_commercial_docs_updated', handleDocsUpdate);
    return () => window.removeEventListener('sdy_commercial_docs_updated', handleDocsUpdate);
  }, []);

  const refreshData = () => {
    setQuotations(getQuotations());
    setInvoices(getInvoices());
    setDeliveryNotes(getDeliveryNotes());
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Sync to Google Sheets backend via Webhook or direct GAS ORM
  const syncDocToSheets = async (action: 'saveRecord' | 'removeRecord', sheetName: string, idKey: string, payload: any) => {
    try {
      const savedConfig = localStorage.getItem('sdy_admin_config');
      if (!savedConfig) return;
      const config = JSON.parse(savedConfig);
      if (config.googleSheetsWebhookUrl && config.isSyncEnabled) {
        const url = config.googleSheetsWebhookUrl.trim();
        if (url.startsWith('http') && !url.includes('docs.google.com/spreadsheets')) {
          await fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
              action,
              sheetName,
              idKey,
              ...payload
            })
          }).catch(() => null);
        }
      }
    } catch (err) {
      console.warn('Commercial doc sheet sync warning:', err);
    }
  };

  // =================================================================================
  // 1. QUOTATION ACTIONS
  // =================================================================================
  const handleOpenNewQuote = () => {
    const today = new Date().toISOString().split('T')[0];
    const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const newQ: Quotation = {
      id: `q-${Date.now()}`,
      quoteNumber: `SDY-QT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      issueDate: today,
      expiryDate: expiry,
      preparedBy: 'SDY Sales Engineering Dept',
      clientName: '',
      clientCompany: '',
      clientPhone: '',
      clientEmail: '',
      projectSite: '',
      items: [
        {
          id: `qi-${Date.now()}-1`,
          name: PRODUCTS[0]?.name || 'Solid Wood Door System',
          spec: 'Standard size 900x2200x45mm with hardware',
          unit: 'Set',
          quantity: 1,
          unitPrice: 450,
          discount: 0,
          total: 450
        }
      ],
      subtotal: 450,
      discountTotal: 0,
      vatPercent: 10,
      vatAmount: 45,
      grandTotalUsd: 495,
      grandTotalKhr: 495 * KHR_EXCHANGE_RATE,
      termsAndConditions: '1. 30% advance deposit upon agreement, 50% upon delivery, 20% handover.\n2. Validity: 30 days.\n3. Warranty: 3 Years structural warranty.',
      status: 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEditingQuote(newQ);
    setIsQuoteModalOpen(true);
  };

  const handleSaveQuote = (e: FormEvent) => {
    e.preventDefault();
    if (!editingQuote) return;
    saveQuotation(editingQuote);
    refreshData();
    setIsQuoteModalOpen(false);
    showToast(txt('រក្សាទុក សម្រង់តម្លៃ ដោយជោគជ័យ!', 'Quotation saved successfully!', '견적서가 저장되었습니다.'));

    syncDocToSheets('saveRecord', 'Quotations', 'QuotationID', {
      record: {
        "QuotationID": editingQuote.id,
        "QuoteNumber": editingQuote.quoteNumber,
        "IssueDate": editingQuote.issueDate,
        "ExpiryDate": editingQuote.expiryDate,
        "PreparedBy": editingQuote.preparedBy || '',
        "ClientName": editingQuote.clientName,
        "ClientCompany": editingQuote.clientCompany || '',
        "ClientPhone": editingQuote.clientPhone || '',
        "ClientEmail": editingQuote.clientEmail || '',
        "ProjectSite": editingQuote.projectSite || '',
        "ItemsJSON": JSON.stringify(editingQuote.items),
        "Subtotal": editingQuote.subtotal,
        "DiscountTotal": editingQuote.discountTotal,
        "VatPercent": editingQuote.vatPercent,
        "VatAmount": editingQuote.vatAmount,
        "GrandTotalUSD": editingQuote.grandTotalUsd,
        "GrandTotalKHR": editingQuote.grandTotalKhr,
        "TermsAndConditions": editingQuote.termsAndConditions,
        "Status": editingQuote.status,
        "CreatedAt": editingQuote.createdAt,
        "UpdatedAt": editingQuote.updatedAt
      }
    });
  };

  const handleDeleteQuote = (id: string) => {
    if (confirm(txt('តើអ្នកពិតជាចង់លុបសម្រង់តម្លៃនេះមែនទេ?', 'Are you sure you want to delete this quotation?', '이 견적서를 삭제하시겠습니까?'))) {
      deleteQuotation(id);
      refreshData();
      showToast(txt('បានលុបសម្រង់តម្លៃរួចរាល់', 'Quotation deleted.', '견적서가 삭제되었습니다.'));
      syncDocToSheets('removeRecord', 'Quotations', 'QuotationID', { idValue: id });
    }
  };

  const handleDownloadQuotePdf = async (q: Quotation) => {
    showToast(txt('កំពុងបង្កើត PDF សម្រង់តម្លៃ...', 'Generating Quotation PDF...', '견적서 PDF 생성 중...'));
    await generateQuotationPdf(q, companyInfo, true);
  };

  const handleSendQuoteTelegram = (q: Quotation) => {
    const text = `📄 *SDY C&I QUOTATION*\n\n` +
      `*Quote No:* ${q.quoteNumber}\n` +
      `*Client:* ${q.clientName} (${q.clientCompany || ''})\n` +
      `*Project Site:* ${q.projectSite}\n` +
      `*Total Amount:* $${q.grandTotalUsd.toLocaleString()} USD (~${Math.round(q.grandTotalKhr).toLocaleString()} KHR)\n` +
      `*Status:* ${q.status}\n\n` +
      `_Items Count:_ ${q.items.length} items.\n` +
      `Please contact SDY C&I Sales Engineering for full specifications.`;

    let handle = companyInfo?.Telegram || 'sdycompanyci';
    if (handle.includes('t.me/')) handle = handle.split('t.me/')[1];
    handle = handle.replace('@', '').trim();

    window.open(`https://t.me/${handle}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleConvertQuoteToInvoice = (q: Quotation) => {
    const newInv = convertQuotationToInvoice(q);
    saveInvoice(newInv);
    refreshData();
    setActiveSubTab('invoices');
    showToast(txt(`បានបំប្លែង សម្រង់តម្លៃ ${q.quoteNumber} -> Invoice ${newInv.invoiceNumber}!`, `Converted Quotation ${q.quoteNumber} -> Invoice ${newInv.invoiceNumber}!`, `견적서를 인보이스로 변환했습니다.`));
  };

  const handleConvertQuoteToDn = (q: Quotation) => {
    const newDn = convertQuotationToDeliveryNote(q);
    saveDeliveryNote(newDn);
    refreshData();
    setActiveSubTab('delivery');
    showToast(txt(`បានបំប្លែង សម្រង់តម្លៃ ${q.quoteNumber} -> DO ${newDn.deliveryNumber}!`, `Converted Quotation ${q.quoteNumber} -> DO ${newDn.deliveryNumber}!`, `견적서를 납품서로 변환했습니다.`));
  };

  // Recalculate quotation item
  const updateQuoteItem = (index: number, updatedFields: Partial<QuotationItem>) => {
    if (!editingQuote) return;
    const items = [...editingQuote.items];
    const cur = { ...items[index], ...updatedFields };
    cur.total = (cur.quantity * cur.unitPrice) - cur.discount;
    items[index] = cur;

    const subtotal = items.reduce((acc, i) => acc + i.total, 0);
    const taxable = Math.max(0, subtotal - (editingQuote.discountTotal || 0));
    const vatAmount = (taxable * editingQuote.vatPercent) / 100;
    const grandTotalUsd = taxable + vatAmount;
    const grandTotalKhr = grandTotalUsd * KHR_EXCHANGE_RATE;

    setEditingQuote({
      ...editingQuote,
      items,
      subtotal,
      vatAmount,
      grandTotalUsd,
      grandTotalKhr
    });
  };

  const addQuoteItem = () => {
    if (!editingQuote) return;
    const newItem: QuotationItem = {
      id: `qi-${Date.now()}`,
      name: 'Custom Architectural Door / Joinery Item',
      spec: 'Custom specification',
      unit: 'Set',
      quantity: 1,
      unitPrice: 150,
      discount: 0,
      total: 150
    };
    const items = [...editingQuote.items, newItem];
    const subtotal = items.reduce((acc, i) => acc + i.total, 0);
    const taxable = Math.max(0, subtotal - (editingQuote.discountTotal || 0));
    const vatAmount = (taxable * editingQuote.vatPercent) / 100;
    const grandTotalUsd = taxable + vatAmount;

    setEditingQuote({
      ...editingQuote,
      items,
      subtotal,
      vatAmount,
      grandTotalUsd,
      grandTotalKhr: grandTotalUsd * KHR_EXCHANGE_RATE
    });
  };

  const removeQuoteItem = (index: number) => {
    if (!editingQuote || editingQuote.items.length <= 1) return;
    const items = editingQuote.items.filter((_, i) => i !== index);
    const subtotal = items.reduce((acc, i) => acc + i.total, 0);
    const taxable = Math.max(0, subtotal - (editingQuote.discountTotal || 0));
    const vatAmount = (taxable * editingQuote.vatPercent) / 100;
    const grandTotalUsd = taxable + vatAmount;

    setEditingQuote({
      ...editingQuote,
      items,
      subtotal,
      vatAmount,
      grandTotalUsd,
      grandTotalKhr: grandTotalUsd * KHR_EXCHANGE_RATE
    });
  };

  // =================================================================================
  // 2. INVOICE ACTIONS
  // =================================================================================
  const handleOpenNewInvoice = () => {
    const today = new Date().toISOString().split('T')[0];
    const due = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const newInv: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `SDY-INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      issueDate: today,
      dueDate: due,
      quoteReference: 'SDY-QT-2026-001',
      poReference: 'PO-SDY-2026-001',
      preparedBy: 'SDY Finance & Billing Dept',
      clientName: '',
      clientCompany: '',
      clientPhone: '',
      clientEmail: '',
      projectSite: '',
      items: [
        {
          id: `invi-${Date.now()}-1`,
          name: 'Acoustic Solid Wood Door System (38dB)',
          spec: 'Size: 900 x 2200 x 45mm, Natural Walnut Veneer',
          unit: 'Set',
          quantity: 10,
          unitPrice: 480,
          discount: 0,
          total: 4800
        }
      ],
      subtotal: 4800,
      discountTotal: 0,
      vatPercent: 10,
      vatAmount: 480,
      grandTotalUsd: 5280,
      grandTotalKhr: 5280 * KHR_EXCHANGE_RATE,
      paymentTerms: 'Deposit 30% advance, 50% upon delivery to site, 20% upon final handover. ABA Account: 000 888 999 (SDY C&I)',
      status: 'Issued',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEditingInvoice(newInv);
    setIsInvoiceModalOpen(true);
  };

  const handleSaveInvoice = (e: FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;
    saveInvoice(editingInvoice);
    refreshData();
    setIsInvoiceModalOpen(false);
    showToast(txt('រក្សាទុក វិក្កយបត្រ (Invoice) ដោយជោគជ័យ!', 'Invoice saved successfully!', '인보이스가 저장되었습니다.'));

    syncDocToSheets('saveRecord', 'Invoices', 'InvoiceID', {
      record: {
        "InvoiceID": editingInvoice.id,
        "InvoiceNumber": editingInvoice.invoiceNumber,
        "IssueDate": editingInvoice.issueDate,
        "DueDate": editingInvoice.dueDate,
        "QuoteReference": editingInvoice.quoteReference || '',
        "POReference": editingInvoice.poReference || '',
        "PreparedBy": editingInvoice.preparedBy || '',
        "ClientName": editingInvoice.clientName,
        "ClientCompany": editingInvoice.clientCompany || '',
        "ClientPhone": editingInvoice.clientPhone || '',
        "ClientEmail": editingInvoice.clientEmail || '',
        "ProjectSite": editingInvoice.projectSite || '',
        "ItemsJSON": JSON.stringify(editingInvoice.items),
        "Subtotal": editingInvoice.subtotal,
        "DiscountTotal": editingInvoice.discountTotal,
        "VatPercent": editingInvoice.vatPercent,
        "VatAmount": editingInvoice.vatAmount,
        "GrandTotalUSD": editingInvoice.grandTotalUsd,
        "GrandTotalKHR": editingInvoice.grandTotalKhr,
        "PaymentTerms": editingInvoice.paymentTerms,
        "Status": editingInvoice.status,
        "CreatedAt": editingInvoice.createdAt,
        "UpdatedAt": editingInvoice.updatedAt
      }
    });
  };

  const handleDeleteInvoice = (id: string) => {
    if (confirm(txt('តើអ្នកពិតជាចង់លុបវិក្កយបត្រនេះមែនទេ?', 'Are you sure you want to delete this invoice?', '이 인보이스를 삭제하시겠습니까?'))) {
      deleteInvoice(id);
      refreshData();
      showToast(txt('បានលុបវិក្កយបត្ររួចរាល់', 'Invoice deleted.', '인보이스가 삭제되었습니다.'));
      syncDocToSheets('removeRecord', 'Invoices', 'InvoiceID', { idValue: id });
    }
  };

  const handleDownloadInvoicePdf = async (inv: Invoice | Quotation) => {
    showToast(txt('កំពុងបង្កើត PDF វិក្កយបត្រ (Invoice)...', 'Generating Tax Invoice PDF...', '인보이스 PDF 생성 중...'));
    await generateInvoicePdf(inv, companyInfo, true);
  };

  const handleSendInvoiceTelegram = (inv: Invoice) => {
    const text = `🧾 *SDY C&I INVOICE*\n\n` +
      `*Invoice No:* ${inv.invoiceNumber}\n` +
      `*Issue Date:* ${inv.issueDate} | *Due Date:* ${inv.dueDate}\n` +
      `*Client:* ${inv.clientName} (${inv.clientCompany || ''})\n` +
      `*Project Site:* ${inv.projectSite}\n` +
      `*Grand Total:* $${inv.grandTotalUsd.toLocaleString()} USD (~${Math.round(inv.grandTotalKhr).toLocaleString()} KHR)\n` +
      `*Status:* ${inv.status}\n\n` +
      `_Payment Terms:_ ${inv.paymentTerms}\n` +
      `Thank you for choosing SDY C&I Construction & Interior!`;

    let handle = companyInfo?.Telegram || 'sdycompanyci';
    if (handle.includes('t.me/')) handle = handle.split('t.me/')[1];
    handle = handle.replace('@', '').trim();

    window.open(`https://t.me/${handle}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Recalculate invoice item
  const updateInvoiceItem = (index: number, updatedFields: Partial<InvoiceItem>) => {
    if (!editingInvoice) return;
    const items = [...editingInvoice.items];
    const cur = { ...items[index], ...updatedFields };
    cur.total = (cur.quantity * cur.unitPrice) - cur.discount;
    items[index] = cur;

    const subtotal = items.reduce((acc, i) => acc + i.total, 0);
    const taxable = Math.max(0, subtotal - (editingInvoice.discountTotal || 0));
    const vatAmount = (taxable * editingInvoice.vatPercent) / 100;
    const grandTotalUsd = taxable + vatAmount;
    const grandTotalKhr = grandTotalUsd * KHR_EXCHANGE_RATE;

    setEditingInvoice({
      ...editingInvoice,
      items,
      subtotal,
      vatAmount,
      grandTotalUsd,
      grandTotalKhr
    });
  };

  const addInvoiceItem = () => {
    if (!editingInvoice) return;
    const newItem: InvoiceItem = {
      id: `invi-${Date.now()}`,
      name: 'Custom Joinery / Steel Fabrication Work',
      spec: 'Custom specification',
      unit: 'Set',
      quantity: 1,
      unitPrice: 200,
      discount: 0,
      total: 200
    };
    const items = [...editingInvoice.items, newItem];
    const subtotal = items.reduce((acc, i) => acc + i.total, 0);
    const taxable = Math.max(0, subtotal - (editingInvoice.discountTotal || 0));
    const vatAmount = (taxable * editingInvoice.vatPercent) / 100;
    const grandTotalUsd = taxable + vatAmount;

    setEditingInvoice({
      ...editingInvoice,
      items,
      subtotal,
      vatAmount,
      grandTotalUsd,
      grandTotalKhr: grandTotalUsd * KHR_EXCHANGE_RATE
    });
  };

  const removeInvoiceItem = (index: number) => {
    if (!editingInvoice || editingInvoice.items.length <= 1) return;
    const items = editingInvoice.items.filter((_, i) => i !== index);
    const subtotal = items.reduce((acc, i) => acc + i.total, 0);
    const taxable = Math.max(0, subtotal - (editingInvoice.discountTotal || 0));
    const vatAmount = (taxable * editingInvoice.vatPercent) / 100;
    const grandTotalUsd = taxable + vatAmount;

    setEditingInvoice({
      ...editingInvoice,
      items,
      subtotal,
      vatAmount,
      grandTotalUsd,
      grandTotalKhr: grandTotalUsd * KHR_EXCHANGE_RATE
    });
  };

  // =================================================================================
  // 3. DELIVERY ORDER (DO) ACTIONS
  // =================================================================================
  const handleOpenNewDn = () => {
    const today = new Date().toISOString().split('T')[0];
    const newDn: DeliveryNote = {
      id: `dn-${Date.now()}`,
      deliveryNumber: `SDY-DO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      poReference: 'PO-2026-001',
      date: today,
      clientName: '',
      projectSite: '',
      contactPerson: '',
      vehicleNo: 'PP-3D-8899',
      driverName: 'SDY Transport Team',
      items: [
        {
          id: `dni-${Date.now()}-1`,
          code: 'DR-01',
          description: 'Acoustic Solid Wood Door System',
          orderedQty: 10,
          deliveredQty: 10,
          unit: 'Set',
          remark: 'Good condition'
        }
      ],
      preparedBy: 'SDY Logistics Dept',
      dispatchedBy: 'SDY Logistics Manager',
      receivedBy: 'Client Site Supervisor',
      notes: 'All items inspected and delivered safely to site.',
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEditingDn(newDn);
    setIsDnModalOpen(true);
  };

  const handleSaveDn = (e: FormEvent) => {
    e.preventDefault();
    if (!editingDn) return;
    saveDeliveryNote(editingDn);
    refreshData();
    setIsDnModalOpen(false);
    showToast(txt('រក្សាទុក ប័ណ្ណប្រគល់ទំនិញ (DO) ដោយជោគជ័យ!', 'Delivery Order saved successfully!', '납품서가 저장되었습니다.'));

    syncDocToSheets('saveRecord', 'DeliveryOrders', 'DeliveryID', {
      record: {
        "DeliveryID": editingDn.id,
        "DeliveryNumber": editingDn.deliveryNumber,
        "POReference": editingDn.poReference,
        "Date": editingDn.date,
        "ClientName": editingDn.clientName,
        "ProjectSite": editingDn.projectSite,
        "ContactPerson": editingDn.contactPerson,
        "VehicleNo": editingDn.vehicleNo,
        "DriverName": editingDn.driverName,
        "ItemsJSON": JSON.stringify(editingDn.items),
        "PreparedBy": editingDn.preparedBy,
        "DispatchedBy": editingDn.dispatchedBy,
        "ReceivedBy": editingDn.receivedBy,
        "Notes": editingDn.notes,
        "Status": editingDn.status,
        "CreatedAt": editingDn.createdAt,
        "UpdatedAt": editingDn.updatedAt
      }
    });
  };

  const handleDeleteDn = (id: string) => {
    if (confirm(txt('តើអ្នកពិតជាចង់លុបប័ណ្ណប្រគល់ទំនិញនេះមែនទេ?', 'Are you sure you want to delete this delivery order?', '이 납품서를 삭제하시겠습니까?'))) {
      deleteDeliveryNote(id);
      refreshData();
      showToast(txt('បានលុបប័ណ្ណប្រគល់ទំនិញរួចរាល់', 'Delivery Order deleted.', '납품서가 삭제되었습니다.'));
      syncDocToSheets('removeRecord', 'DeliveryOrders', 'DeliveryID', { idValue: id });
    }
  };

  const handleDownloadDnPdf = async (dn: DeliveryNote) => {
    showToast(txt('កំពុងបង្កើត PDF ប័ណ្ណប្រគល់ទំនិញ (DO)...', 'Generating Delivery Order PDF...', '납품서 PDF 생성 중...'));
    await generateDeliveryNotePdf(dn, companyInfo, true);
  };

  const handleSendDnTelegram = (dn: DeliveryNote) => {
    const text = `🚚 *SDY C&I DELIVERY ORDER (DO)*\n\n` +
      `*DO No:* ${dn.deliveryNumber}\n` +
      `*PO Ref:* ${dn.poReference}\n` +
      `*Dispatch Date:* ${dn.date}\n` +
      `*Client:* ${dn.clientName}\n` +
      `*Project Site:* ${dn.projectSite}\n` +
      `*Driver / Plate:* ${dn.driverName} (${dn.vehicleNo})\n` +
      `*Items Delivered:* ${dn.items.length} items.\n` +
      `*Status:* ${dn.status}`;

    let handle = companyInfo?.Telegram || 'sdycompanyci';
    if (handle.includes('t.me/')) handle = handle.split('t.me/')[1];
    handle = handle.replace('@', '').trim();

    window.open(`https://t.me/${handle}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const updateDnItem = (index: number, updatedFields: Partial<DeliveryNoteItem>) => {
    if (!editingDn) return;
    const items = [...editingDn.items];
    items[index] = { ...items[index], ...updatedFields };
    setEditingDn({ ...editingDn, items });
  };

  const addDnItem = () => {
    if (!editingDn) return;
    const newItem: DeliveryNoteItem = {
      id: `dni-${Date.now()}`,
      code: `ITM-${editingDn.items.length + 1}`,
      description: 'Architectural Hardware / Component',
      orderedQty: 1,
      deliveredQty: 1,
      unit: 'Set',
      remark: 'Good condition'
    };
    setEditingDn({ ...editingDn, items: [...editingDn.items, newItem] });
  };

  const removeDnItem = (index: number) => {
    if (!editingDn || editingDn.items.length <= 1) return;
    setEditingDn({ ...editingDn, items: editingDn.items.filter((_, i) => i !== index) });
  };

  // Filtered datasets
  const filteredQuotations = quotations.filter(q => {
    const matchSearch = q.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.projectSite.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredInvoices = invoices.filter(inv => {
    const matchSearch = inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.projectSite.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredDeliveryNotes = deliveryNotes.filter(d => {
    const matchSearch = d.deliveryNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.poReference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A4DA3] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in border border-white/20">
          <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider">{toastMessage}</span>
        </div>
      )}

      {/* Header Title & Sub-Tabs */}
      <div className="p-2 sm:p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#0A4DA3] dark:text-blue-400 font-extrabold text-xs uppercase tracking-widest">
              <FileText className="w-4 h-4" />
              <span>{txt('COMMERCIAL DOCUMENTS STUDIO / គ្រប់គ្រងឯកសារពាណិជ្ជកម្ម', 'COMMERCIAL DOCUMENTS STUDIO', '상업 문서 스튜디오')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0A4DA3] dark:text-blue-400 mt-1">
              {txt('ឯកសារពាណិជ្ជកម្ម (Quotation, Invoice & DO)', 'Commercial Documents (Quotation, Invoice & DO)', '상업 문서 (Quotation, Invoice & DO)')}
            </h2>
            <p className="text-xs font-semibold text-[#0A4DA3]/80 dark:text-blue-300/80">
              {txt('បង្កើត និងគ្រប់គ្រងឯកសារពាណិជ្ជកម្មផ្លូវការរបស់ក្រុមហ៊ុន អេស ឌី វ៉ាយ C&I (Quotation, Invoice, Delivery Order)', 'Create and manage official SDY C&I commercial documents (Quotation, Invoice, Delivery Order)', '공식 SDY C&I 상업 문서(견적서, វិក្កយបត្រ/인보이스, 납품서/DO) 작성 및 관리')}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeSubTab === 'quotations' && (
              <button
                onClick={handleOpenNewQuote}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A4DA3] hover:bg-[#0A4DA3]/90 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>{txt('+ បង្កើត Quotation ថ្មី', '+ New Quotation', '+ 새 Quotation 작성')}</span>
              </button>
            )}
            {activeSubTab === 'invoices' && (
              <button
                onClick={handleOpenNewInvoice}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A4DA3] hover:bg-[#0A4DA3]/90 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>{txt('+ បង្កើត Invoice ថ្មី', '+ New Invoice', '+ 새 Invoice 작성')}</span>
              </button>
            )}
            {activeSubTab === 'delivery' && (
              <button
                onClick={handleOpenNewDn}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A4DA3] hover:bg-[#0A4DA3]/90 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>{txt('+ បង្កើត DO ថ្មី', '+ New DO', '+ 새 DO 작성')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Sub-Tabs Switcher */}
        <div className="flex flex-wrap items-center gap-2 border-t border-black/5 dark:border-white/5 pt-4">
          <button
            onClick={() => setActiveSubTab('quotations')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeSubTab === 'quotations'
                ? 'bg-[#0A4DA3] text-white shadow-md'
                : 'bg-black/5 dark:bg-white/5 text-[#101828]/70 dark:text-white/70 hover:bg-black/10'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{txt(`សម្រង់តម្លៃ / QUOTATIONS (${quotations.length})`, `QUOTATIONS (${quotations.length})`, `견적서 / QUOTATIONS (${quotations.length})`)}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('invoices')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeSubTab === 'invoices'
                ? 'bg-[#0A4DA3] text-white shadow-md'
                : 'bg-black/5 dark:bg-white/5 text-[#101828]/70 dark:text-white/70 hover:bg-black/10'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>{txt(`វិក្កយបត្រ / INVOICES (${invoices.length})`, `INVOICES (${invoices.length})`, `인보이스 / INVOICES (${invoices.length})`)}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('delivery')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeSubTab === 'delivery'
                ? 'bg-[#0A4DA3] text-white shadow-md'
                : 'bg-black/5 dark:bg-white/5 text-[#101828]/70 dark:text-white/70 hover:bg-black/10'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>{txt(`ប័ណ្ណប្រគល់ទំនិញ / DO (${deliveryNotes.length})`, `DO (${deliveryNotes.length})`, `납품서 / DO (${deliveryNotes.length})`)}</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#101828]/80 p-4 rounded-2xl border border-black/5 dark:border-white/10">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={txt('ស្វែងរកលេខឯកសារ ឈ្មោះអតិថិជន គម្រោង...', 'Search doc number, client name, project...', '문서 번호, 고객명, 프로젝트 검색...')}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 dark:bg-[#1A2333] border border-gray-200 dark:border-gray-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#1A2333] border border-gray-200 dark:border-gray-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
          >
            <option value="ALL">{txt('គ្រប់ស្ថានភាព (All Statuses)', 'All Statuses', '전체 상태')}</option>
            <option value="Draft">{txt('សេចក្តីព្រាង (Draft)', 'Draft', '초안 (Draft)')}</option>
            <option value="Issued">{txt('បានចេញផ្សាយ (Issued)', 'Issued', '발행됨 (Issued)')}</option>
            <option value="Approved">{txt('បានអនុម័ត (Approved)', 'Approved', '승인됨 (Approved)')}</option>
            <option value="Paid">{txt('បានបង់ប្រាក់ (Paid)', 'Paid', '결제완료 (Paid)')}</option>
            <option value="Delivered">{txt('បានដឹកជញ្ជូន (Delivered)', 'Delivered', '배송완료 (Delivered)')}</option>
          </select>
        </div>
      </div>

      {/* TAB 1: QUOTATIONS LIST */}
      {activeSubTab === 'quotations' && (
        <div className="bg-white dark:bg-[#101828] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  <th className="px-5 py-4">{txt('លេខសម្រង់តម្លៃ', 'Quotation No.', '견적서 번호')}</th>
                  <th className="px-5 py-4">{txt('អតិថិជន & ក្រុមហ៊ុន', 'Client & Company', '고객 및 회사')}</th>
                  <th className="px-5 py-4">{txt('ទីតាំងគម្រោង', 'Project Site', '프로젝트 현장')}</th>
                  <th className="px-5 py-4 text-right">{txt('សរុបរង ($)', 'Subtotal ($)', '소계 ($)')}</th>
                  <th className="px-5 py-4 text-right">{txt('សរុបរួម ($)', 'Grand Total ($)', '총 금액 ($)')}</th>
                  <th className="px-5 py-4 text-center">{txt('ស្ថានភាព', 'Status', '상태')}</th>
                  <th className="px-5 py-4 text-right">{txt('សកម្មភាព', 'Actions', '작업')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 text-sm sm:text-base">
                {filteredQuotations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-slate-400 font-semibold text-sm sm:text-base">
                      {txt('មិនមានទិន្នន័យសម្រង់តម្លៃតាមការស្វែងរកឡើយ', 'No quotations found matching criteria.', '검색 조건에 맞는 견적서가 없습니다.')}
                    </td>
                  </tr>
                ) : (
                  filteredQuotations.map((q) => (
                    <tr key={q.id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4 font-bold text-[#0A4DA3] dark:text-blue-400">
                        {q.quoteNumber}
                        <div className="text-xs text-slate-400 font-normal mt-0.5">{q.issueDate}</div>
                      </td>
                      <td className="px-5 py-4 text-left">
                        <div className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">{q.clientName}</div>
                        <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{q.clientCompany || q.clientPhone}</div>
                      </td>
                      <td className="px-5 py-4 text-left text-slate-700 dark:text-slate-300 text-sm max-w-xs truncate">
                        {q.projectSite}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-slate-700 dark:text-slate-200 text-sm sm:text-base">
                        ${q.subtotal.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-right font-black text-[#0A4DA3] dark:text-blue-400 text-sm sm:text-base">
                        ${q.grandTotalUsd.toLocaleString()}
                        <div className="text-xs text-slate-400 font-normal">~{Math.round(q.grandTotalKhr).toLocaleString()} KHR</div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          q.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' :
                          q.status === 'Issued' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                        }`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleDownloadQuotePdf(q)}
                            title="Download Quotation PDF"
                            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-[#0A4DA3] hover:text-white dark:bg-blue-950/50 dark:text-blue-300 transition-all shadow-sm"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleConvertQuoteToInvoice(q)}
                            title="Convert to Invoice"
                            className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/50 dark:text-indigo-300 transition-all shadow-sm"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleConvertQuoteToDn(q)}
                            title="Convert to Delivery Order (DO)"
                            className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/50 dark:text-emerald-300 transition-all shadow-sm"
                          >
                            <Truck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSendQuoteTelegram(q)}
                            title="Send via Telegram"
                            className="p-2 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white dark:bg-sky-950/50 dark:text-sky-300 transition-all shadow-sm"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingQuote(q);
                              setIsQuoteModalOpen(true);
                            }}
                            title="Edit Quotation"
                            className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white dark:bg-amber-950/50 dark:text-amber-300 transition-all shadow-sm"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuote(q.id)}
                            title="Delete"
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white dark:bg-red-950/50 dark:text-red-300 transition-all shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: INVOICES LIST */}
      {activeSubTab === 'invoices' && (
        <div className="bg-white dark:bg-[#101828] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  <th className="px-5 py-4">{txt('លេខវិក្កយបត្រ', 'Invoice No.', '인보이스 번호')}</th>
                  <th className="px-5 py-4">{txt('លេខ Quote / PO', 'Quote / PO Ref', '견적/발주 참조')}</th>
                  <th className="px-5 py-4">{txt('អតិថិជន & ក្រុមហ៊ុន', 'Client & Company', '고객 및 회사')}</th>
                  <th className="px-5 py-4">{txt('កាលបរិច្ឆេទកំណត់បង់', 'Due Date', '결제 기한')}</th>
                  <th className="px-5 py-4 text-right">{txt('សរុបរួម ($)', 'Grand Total ($)', '총 금액 ($)')}</th>
                  <th className="px-5 py-4 text-center">{txt('ស្ថានភាព', 'Status', '상태')}</th>
                  <th className="px-5 py-4 text-right">{txt('សកម្មភាព', 'Actions', '작업')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 text-sm sm:text-base">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-slate-400 font-semibold text-sm sm:text-base">
                      {txt('មិនទាន់មានវិក្កយបត្រ (Invoice) នៅឡើយទេ', 'No Commercial Invoices found.', '등록된 인보이스가 없습니다.')}
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4 font-bold text-[#0A4DA3] dark:text-blue-400">
                        {inv.invoiceNumber}
                        <div className="text-xs text-slate-400 font-normal mt-0.5">{inv.issueDate}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-700 dark:text-slate-300 font-semibold text-sm">
                        <div>{inv.quoteReference || 'N/A'}</div>
                        <div className="text-xs text-slate-400 font-normal">{inv.poReference}</div>
                      </td>
                      <td className="px-5 py-4 text-left">
                        <div className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">{inv.clientName}</div>
                        <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{inv.clientCompany || inv.clientPhone}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-700 dark:text-slate-300 text-sm">
                        <div className="font-semibold">{inv.dueDate}</div>
                      </td>
                      <td className="px-5 py-4 text-right font-black text-[#0A4DA3] dark:text-blue-400 text-sm sm:text-base">
                        ${inv.grandTotalUsd.toLocaleString()}
                        <div className="text-xs text-slate-400 font-normal">~{Math.round(inv.grandTotalKhr).toLocaleString()} KHR</div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' :
                          inv.status === 'Issued' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                          inv.status === 'Overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleDownloadInvoicePdf(inv)}
                            title="Download Invoice PDF"
                            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-[#0A4DA3] hover:text-white dark:bg-blue-950/50 dark:text-blue-300 transition-all shadow-sm"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSendInvoiceTelegram(inv)}
                            title="Send via Telegram"
                            className="p-2 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white dark:bg-sky-950/50 dark:text-sky-300 transition-all shadow-sm"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingInvoice(inv);
                              setIsInvoiceModalOpen(true);
                            }}
                            title="Edit Invoice"
                            className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white dark:bg-amber-950/50 dark:text-amber-300 transition-all shadow-sm"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(inv.id)}
                            title="Delete"
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white dark:bg-red-950/50 dark:text-red-300 transition-all shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DELIVERY ORDERS LIST */}
      {activeSubTab === 'delivery' && (
        <div className="bg-white dark:bg-[#101828] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  <th className="px-5 py-4">{txt('លេខ DO', 'DO Number', '납품서 번호')}</th>
                  <th className="px-5 py-4">{txt('លេខ PO យោង', 'PO Reference', '발주서 참조')}</th>
                  <th className="px-5 py-4">{txt('អតិថិជន & ទីតាំង', 'Client & Site', '고객 및 현장')}</th>
                  <th className="px-5 py-4">{txt('មធ្យោបាយ & អ្នកបើកបរ', 'Vehicle & Driver', '차량 및 운전기사')}</th>
                  <th className="px-5 py-4 text-center">{txt('ចំនួនមុខទំនិញ', 'Items Count', '품목 수')}</th>
                  <th className="px-5 py-4 text-center">{txt('ស្ថានភាព', 'Status', '상태')}</th>
                  <th className="px-5 py-4 text-right">{txt('សកម្មភាព', 'Actions', '작업')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 text-sm sm:text-base">
                {filteredDeliveryNotes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-slate-400 font-semibold text-sm sm:text-base">
                      {txt('មិនទាន់មានប័ណ្ណប្រគល់ទំនិញនៅឡើយទេ', 'No Delivery Orders found.', '납품서가 없습니다.')}
                    </td>
                  </tr>
                ) : (
                  filteredDeliveryNotes.map((dn) => (
                    <tr key={dn.id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4 font-bold text-[#0A4DA3] dark:text-blue-400">
                        {dn.deliveryNumber}
                        <div className="text-xs text-slate-400 font-normal mt-0.5">{dn.date}</div>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-700 dark:text-slate-200 text-sm sm:text-base">
                        {dn.poReference}
                      </td>
                      <td className="px-5 py-4 text-left">
                        <div className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">{dn.clientName}</div>
                        <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate max-w-xs">{dn.projectSite}</div>
                      </td>
                      <td className="px-5 py-4 text-left text-slate-700 dark:text-slate-300">
                        <div className="font-medium text-slate-800 dark:text-slate-100 text-sm sm:text-base">{dn.vehicleNo}</div>
                        <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{dn.driverName}</div>
                      </td>
                      <td className="px-5 py-4 text-center font-bold text-slate-700 dark:text-slate-200 text-sm sm:text-base">
                        {dn.items.length} {txt('មុខទំនិញ', 'Items', '개 품목')}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          dn.status === 'Delivered' || dn.status === 'Signed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' :
                          dn.status === 'Dispatched' ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                        }`}>
                          {dn.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleDownloadDnPdf(dn)}
                            title="Download Delivery Order PDF"
                            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-[#0A4DA3] hover:text-white dark:bg-blue-950/50 dark:text-blue-300 transition-all shadow-sm"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSendDnTelegram(dn)}
                            title="Send via Telegram"
                            className="p-2 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white dark:bg-sky-950/50 dark:text-sky-300 transition-all shadow-sm"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingDn(dn);
                              setIsDnModalOpen(true);
                            }}
                            title="Edit Delivery Order"
                            className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white dark:bg-amber-950/50 dark:text-amber-300 transition-all shadow-sm"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDn(dn.id)}
                            title="Delete"
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white dark:bg-red-950/50 dark:text-red-300 transition-all shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: QUOTATION EDITOR MODAL */}
      {isQuoteModalOpen && editingQuote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#101828] border border-black/10 dark:border-white/10 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#0A4DA3]/10 text-[#0A4DA3] dark:text-blue-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                    {txt(`កែប្រែសម្រង់តម្លៃ (${editingQuote.quoteNumber})`, `Edit Quotation (${editingQuote.quoteNumber})`, `견적서 수정 (${editingQuote.quoteNumber})`)}
                  </h3>
                  <p className="text-xs text-gray-500">{txt('កំណត់ព័ត៌មានអតិថិជន ទំនិញ/សេវាកម្ម ពន្ធ VAT និងលក្ខខណ្ឌផ្សេងៗ', 'Configure client info, items/services, VAT tax, and terms & conditions.', '고객 정보, 품목/서비스, VAT 세금 및 이용약관 설정.')}</p>
                </div>
              </div>
              <button
                onClick={() => setIsQuoteModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuote} className="space-y-6">
              {/* Header Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">{txt('លេខសម្រង់តម្លៃ', 'Quotation No.', '견적서 번호')}</label>
                  <input
                    type="text"
                    value={editingQuote.quoteNumber}
                    onChange={(e) => setEditingQuote({ ...editingQuote, quoteNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A2333] text-xs font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">{txt('កាលបរិច្ឆេទចេញ', 'Issue Date', '발행일')}</label>
                  <input
                    type="date"
                    value={editingQuote.issueDate}
                    onChange={(e) => setEditingQuote({ ...editingQuote, issueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A2333] text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">{txt('កាលបរិច្ឆេទផុតកំណត់', 'Expiry Date', '유효기간')}</label>
                  <input
                    type="date"
                    value={editingQuote.expiryDate}
                    onChange={(e) => setEditingQuote({ ...editingQuote, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A2333] text-xs"
                    required
                  />
                </div>
              </div>

              {/* Client Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-[#1A2333]/50 border border-gray-200 dark:border-gray-800">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">{txt('ឈ្មោះអតិថិជន', 'Client Name', '고객명')}</label>
                  <input
                    type="text"
                    value={editingQuote.clientName}
                    onChange={(e) => setEditingQuote({ ...editingQuote, clientName: e.target.value })}
                    placeholder={txt('ឧ. លោក សុខា / Sokha Hotel Procurement', 'e.g. Mr. Sokha / Hotel Procurement', '예: Sokha Hotel Procurement')}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#101828] text-xs font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">{txt('ក្រុមហ៊ុន / ស្ថាប័ន', 'Company', '회사 / 기관')}</label>
                  <input
                    type="text"
                    value={editingQuote.clientCompany || ''}
                    onChange={(e) => setEditingQuote({ ...editingQuote, clientCompany: e.target.value })}
                    placeholder={txt('ឧ. ក្រុមហ៊ុន សុខា ហូថេល ខូអិលធីឌី', 'e.g. Sokha Hotel Co., Ltd', '예: Sokha Hotel Co., Ltd')}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#101828] text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">{txt('លេខទូរស័ព្ទ', 'Phone Number', '전화번호')}</label>
                  <input
                    type="text"
                    value={editingQuote.clientPhone}
                    onChange={(e) => setEditingQuote({ ...editingQuote, clientPhone: e.target.value })}
                    placeholder="+855 12 345 678"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#101828] text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">{txt('ទីតាំងគម្រោង', 'Project Site Location', '프로젝트 현장 위치')}</label>
                  <input
                    type="text"
                    value={editingQuote.projectSite}
                    onChange={(e) => setEditingQuote({ ...editingQuote, projectSite: e.target.value })}
                    placeholder={txt('ឧ. គម្រោងខុនដូ ភ្នំពេញ', 'e.g. Phnom Penh Condo Project', '예: 프놈펜 콘도 프로젝트')}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#101828] text-xs font-medium"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    {txt(`បញ្ជីទំនិញ / សេវាកម្ម (${editingQuote.items.length})`, `Items & Services List (${editingQuote.items.length})`, `품목 및 서비스 목록 (${editingQuote.items.length})`)}
                  </h4>
                  <button
                    type="button"
                    onClick={addQuoteItem}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#0A4DA3] dark:text-blue-400 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> + {txt('បន្ថែមជួរ', 'Add Row', '행 추가')}
                  </button>
                </div>

                <div className="space-y-3">
                  {editingQuote.items.map((item, idx) => (
                    <div key={item.id} className="p-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#101828] space-y-2">
                      <div className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-5">
                          <label className="block text-[9px] font-bold uppercase text-gray-400">{txt('ឈ្មោះទំនិញ', 'Item Name', '품목명')}</label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateQuoteItem(idx, { name: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-bold"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[9px] font-bold uppercase text-gray-400">{txt('ចំនួន', 'Qty', '수량')}</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuoteItem(idx, { quantity: Number(e.target.value) || 1 })}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-center"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[9px] font-bold uppercase text-gray-400">{txt('តម្លៃរាយ ($)', 'Unit Price ($)', '단가 ($)')}</label>
                          <input
                            type="number"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => updateQuoteItem(idx, { unitPrice: Number(e.target.value) || 0 })}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-right"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[9px] font-bold uppercase text-gray-400">{txt('សរុប ($)', 'Total ($)', '합계 ($)')}</label>
                          <div className="py-1.5 text-xs font-black text-right text-[#0A4DA3] dark:text-blue-400">
                            ${item.total.toLocaleString()}
                          </div>
                        </div>
                        <div className="col-span-1 text-center">
                          <button
                            type="button"
                            onClick={() => removeQuoteItem(idx)}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <input
                          type="text"
                          value={item.spec || ''}
                          onChange={(e) => updateQuoteItem(idx, { spec: e.target.value })}
                          placeholder={txt('លក្ខណៈបច្ចេកទេស / ទំហំ...', 'Specifications / Size detail...', '사양 / 규격 상세...')}
                          className="w-full px-2.5 py-1 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#1A2333] text-[11px] text-gray-600 dark:text-gray-300"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status, Prepared By, Discount & VAT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">{txt('ស្ថានភាព', 'Status', '상태')}</label>
                  <select
                    value={editingQuote.status}
                    onChange={(e) => setEditingQuote({ ...editingQuote, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A2333] text-xs font-bold"
                  >
                    <option value="Draft">{txt('សេចក្តីព្រាង (Draft)', 'Draft', '초안 (Draft)')}</option>
                    <option value="Issued">{txt('បានចេញ (Issued)', 'Issued', '발행됨 (Issued)')}</option>
                    <option value="Approved">{txt('បានអនុម័ត (Approved)', 'Approved', '승인됨 (Approved)')}</option>
                    <option value="Declined">{txt('បដិសេធ (Declined)', 'Declined', '거절됨 (Declined)')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">{txt('អ្នករៀបចំ', 'Prepared By', '작성자')}</label>
                  <input
                    type="text"
                    value={editingQuote.preparedBy || ''}
                    onChange={(e) => setEditingQuote({ ...editingQuote, preparedBy: e.target.value })}
                    placeholder={txt('ឧ. SDY Sales Dept', 'e.g. SDY Sales Dept', '예: 영업부')}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A2333] text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">{txt('បញ្ចុះតម្លៃ ($)', 'Discount ($)', '할인 ($)')}</label>
                  <input
                    type="number"
                    min="0"
                    value={editingQuote.discountTotal || 0}
                    onChange={(e) => {
                      const discountTotal = Math.max(0, Number(e.target.value) || 0);
                      const subtotal = editingQuote.subtotal;
                      const taxable = Math.max(0, subtotal - discountTotal);
                      const vatAmount = (taxable * editingQuote.vatPercent) / 100;
                      const grandTotalUsd = taxable + vatAmount;
                      setEditingQuote({
                        ...editingQuote,
                        discountTotal,
                        vatAmount,
                        grandTotalUsd,
                        grandTotalKhr: grandTotalUsd * KHR_EXCHANGE_RATE
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A2333] text-xs font-bold text-red-600 dark:text-red-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">{txt('ភាគរយពន្ធ VAT (%)', 'VAT Tax (%)', '부가가치세 (%)')}</label>
                  <input
                    type="number"
                    min="0"
                    value={editingQuote.vatPercent}
                    onChange={(e) => {
                      const vatPercent = Math.max(0, Number(e.target.value) || 0);
                      const subtotal = editingQuote.subtotal;
                      const taxable = Math.max(0, subtotal - (editingQuote.discountTotal || 0));
                      const vatAmount = (taxable * vatPercent) / 100;
                      const grandTotalUsd = taxable + vatAmount;
                      setEditingQuote({
                        ...editingQuote,
                        vatPercent,
                        vatAmount,
                        grandTotalUsd,
                        grandTotalKhr: grandTotalUsd * KHR_EXCHANGE_RATE
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A2333] text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">{txt('លក្ខខណ្ឌផ្សេងៗ', 'Terms & Conditions', '이용약관 및 조건')}</label>
                <textarea
                  rows={3}
                  value={editingQuote.termsAndConditions}
                  onChange={(e) => setEditingQuote({ ...editingQuote, termsAndConditions: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A2333] text-xs"
                />
              </div>

              {/* Grand Total Bar */}
              <div className="p-4 rounded-2xl bg-[#0A4DA3] text-white flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/70">{txt('ទឹកប្រាក់សរុបរួម', 'Grand Total', '총 금액')}</div>
                  <div className="text-xl font-black">${editingQuote.grandTotalUsd.toLocaleString()} USD</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/70">{txt('ស្មើប្រាក់រៀល', 'In KHR Currency', '리엘 환산')}</div>
                  <div className="text-sm font-bold">~{Math.round(editingQuote.grandTotalKhr).toLocaleString()} KHR</div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-black/5 dark:border-white/5 pt-4">
                <button
                  type="button"
                  onClick={() => setIsQuoteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold uppercase"
                >
                  {txt('បោះបង់', 'Cancel', '취소')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#0A4DA3] hover:bg-[#0A4DA3]/90 text-white text-xs font-bold uppercase tracking-wider shadow-lg"
                >
                  {txt('រក្សាទុក', 'Save Quotation', '견적서 저장')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: INVOICE EDITOR MODAL */}
      {isInvoiceModalOpen && editingInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#101828] border border-black/10 dark:border-white/10 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#0A4DA3]/10 text-[#0A4DA3] dark:text-blue-400">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                    {txt(`កែប្រែវិក្កយបត្រ / Edit Invoice (${editingInvoice.invoiceNumber})`, `Edit Commercial Invoice (${editingInvoice.invoiceNumber})`, `인보이스 수정 (${editingInvoice.invoiceNumber})`)}
                  </h3>
                  <p className="text-xs text-gray-500">{txt('កំណត់ព័ត៌មានវិក្កយបត្រ កាលបរិច្ឆេទកំណត់បង់ លក្ខខណ្ឌបង់ប្រាក់ និងបញ្ជីទំនិញ/សេវាកម្ម', 'Configure invoice header, due dates, payment terms, and billing items.', '인보이스 헤더, 결제기한, 결제 조건 및 항목 설정.')}</p>
                </div>
              </div>
              <button
                onClick={() => setIsInvoiceModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInvoice} className="space-y-6">
              {/* Header Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">{txt('លេខវិក្កយបត្រ', 'Invoice No.', '인보이스 번호')}</label>
                  <input
                    type="text"
                    value={editingInvoice.invoiceNumber}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, invoiceNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A2333] text-xs font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">{txt('កាលបរិច្ឆេទចេញ', 'Issue Date', '발행일')}</label>
                  <input
                    type="date"
                    value={editingInvoice.issueDate}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, issueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A2333] text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">{txt('កាលបរិច្ឆេទកំណត់បង់', 'Due Date', '결제 기한')}</label>
                  <input
                    type="date"
                    value={editingInvoice.dueDate}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A2333] text-xs font-bold text-amber-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">{txt('លេខ PO យោង', 'PO Reference', '발주서 참조')}</label>
                  <input
                    type="text"
                    value={editingInvoice.poReference || ''}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, poReference: e.target.value })}
                    placeholder="e.g. PO-2026-88"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A2333] text-xs"
                  />
                </div>
              </div>

              {/* Client Info Block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-[#1A2333]/50 border border-gray-200 dark:border-gray-800">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">{txt('ឈ្មោះអតិថិជន', 'Client Name', '고객명')}</label>
                  <input
                    type="text"
                    value={editingInvoice.clientName}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, clientName: e.target.value })}
                    placeholder={txt('ឧ. ក្រុមហ៊ុន សុខា ហូថេល', 'e.g. Sokha Hotel Procurement', '예: Sokha Hotel Procurement')}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#101828] text-xs font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">{txt('ក្រុមហ៊ុន / ស្ថាប័ន', 'Company Name', '회사명')}</label>
                  <input
                    type="text"
                    value={editingInvoice.clientCompany || ''}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, clientCompany: e.target.value })}
                    placeholder="e.g. Sokha Group Cambodia"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#101828] text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">{txt('លេខទូរស័ព្ទ / អ៊ីមែល', 'Phone / Email', '전화/이메일')}</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingInvoice.clientPhone || ''}
                      onChange={(e) => setEditingInvoice({ ...editingInvoice, clientPhone: e.target.value })}
                      placeholder="+855 12 345 678"
                      className="w-1/2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#101828] text-xs font-medium"
                    />
                    <input
                      type="email"
                      value={editingInvoice.clientEmail || ''}
                      onChange={(e) => setEditingInvoice({ ...editingInvoice, clientEmail: e.target.value })}
                      placeholder="client@company.com"
                      className="w-1/2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#101828] text-xs font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">{txt('ទីតាំងគម្រោង', 'Project Site Location', '프로젝트 현장 위치')}</label>
                  <input
                    type="text"
                    value={editingInvoice.projectSite || ''}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, projectSite: e.target.value })}
                    placeholder={txt('ឧ. គម្រោងខុនដូ ភ្នំពេញ', 'e.g. Phnom Penh Executive Site', '예: 프놈펜 현장')}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#101828] text-xs font-medium"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    {txt(`បញ្ជីមុខទំនិញគិតប្រាក់ (${editingInvoice.items.length})`, `Invoice Line Items (${editingInvoice.items.length})`, `청구 항목 목록 (${editingInvoice.items.length})`)}
                  </h4>
                  <button
                    type="button"
                    onClick={addInvoiceItem}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#0A4DA3] dark:text-blue-400 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> + {txt('បន្ថែមជួរទំនិញ', 'Add Row', '행 추가')}
                  </button>
                </div>

                <div className="space-y-3">
                  {editingInvoice.items.map((item, idx) => (
                    <div key={item.id} className="p-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#101828] space-y-2">
                      <div className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-5">
                          <label className="block text-[9px] font-bold uppercase text-gray-400">{txt('ឈ្មោះទំនិញ / សេវាកម្ម', 'Item Description', '품목/서비스명')}</label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateInvoiceItem(idx, { name: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-bold"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[9px] font-bold uppercase text-gray-400">{txt('ចំនួន', 'Qty', '수량')}</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateInvoiceItem(idx, { quantity: Number(e.target.value) || 1 })}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-center"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[9px] font-bold uppercase text-gray-400">{txt('តម្លៃរាយ ($)', 'Unit Price ($)', '단가 ($)')}</label>
                          <input
                            type="number"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => updateInvoiceItem(idx, { unitPrice: Number(e.target.value) || 0 })}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-right"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[9px] font-bold uppercase text-gray-400">{txt('សរុប ($)', 'Total ($)', '합계 ($)')}</label>
                          <div className="py-1.5 text-xs font-black text-right text-[#0A4DA3] dark:text-blue-400">
                            ${item.total.toLocaleString()}
                          </div>
                        </div>
                        <div className="col-span-1 text-center">
                          <button
                            type="button"
                            onClick={() => removeInvoiceItem(idx)}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <input
                          type="text"
                          value={item.spec || ''}
                          onChange={(e) => updateInvoiceItem(idx, { spec: e.target.value })}
                          placeholder={txt('លក្ខណៈបច្ចេកទេស / ព័ត៌មានលម្អិត...', 'Specifications / Detail notes...', '사양 / 세부 사항...')}
                          className="w-full px-2.5 py-1 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#1A2333] text-[11px] text-gray-600 dark:text-gray-300"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status, Discount, VAT & Terms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">{txt('ស្ថានភាព', 'Status', '상태')}</label>
                  <select
                    value={editingInvoice.status}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A2333] text-xs font-bold"
                  >
                    <option value="Draft">{txt('សេចក្តីព្រាង (Draft)', 'Draft', '초안 (Draft)')}</option>
                    <option value="Issued">{txt('បានចេញ (Issued)', 'Issued', '발행됨 (Issued)')}</option>
                    <option value="Paid">{txt('បានបង់ប្រាក់ (Paid)', 'Paid', '결제완료 (Paid)')}</option>
                    <option value="Overdue">{txt('ហួសកាលបរិច្ឆេទ (Overdue)', 'Overdue', '연체됨 (Overdue)')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">{txt('អ្នករៀបចំ', 'Prepared By', '작성자')}</label>
                  <input
                    type="text"
                    value={editingInvoice.preparedBy || ''}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, preparedBy: e.target.value })}
                    placeholder="SDY Billing Dept"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A2333] text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">{txt('បញ្ចុះតម្លៃ ($)', 'Discount ($)', '할인 ($)')}</label>
                  <input
                    type="number"
                    min="0"
                    value={editingInvoice.discountTotal || 0}
                    onChange={(e) => {
                      const discountTotal = Math.max(0, Number(e.target.value) || 0);
                      const subtotal = editingInvoice.subtotal;
                      const taxable = Math.max(0, subtotal - discountTotal);
                      const vatAmount = (taxable * editingInvoice.vatPercent) / 100;
                      const grandTotalUsd = taxable + vatAmount;
                      setEditingInvoice({
                        ...editingInvoice,
                        discountTotal,
                        vatAmount,
                        grandTotalUsd,
                        grandTotalKhr: grandTotalUsd * KHR_EXCHANGE_RATE
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A2333] text-xs font-bold text-red-600 dark:text-red-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">{txt('ភាគរយពន្ធ VAT (%)', 'VAT Tax (%)', '부가가치세 (%)')}</label>
                  <input
                    type="number"
                    min="0"
                    value={editingInvoice.vatPercent}
                    onChange={(e) => {
                      const vatPercent = Math.max(0, Number(e.target.value) || 0);
                      const subtotal = editingInvoice.subtotal;
                      const taxable = Math.max(0, subtotal - (editingInvoice.discountTotal || 0));
                      const vatAmount = (taxable * vatPercent) / 100;
                      const grandTotalUsd = taxable + vatAmount;
                      setEditingInvoice({
                        ...editingInvoice,
                        vatPercent,
                        vatAmount,
                        grandTotalUsd,
                        grandTotalKhr: grandTotalUsd * KHR_EXCHANGE_RATE
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A2333] text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">{txt('លក្ខខណ្ឌ និងគណនីបង់ប្រាក់', 'Payment Terms & Bank Account', '결제 조건 및 계좌 정보')}</label>
                <textarea
                  rows={3}
                  value={editingInvoice.paymentTerms}
                  onChange={(e) => setEditingInvoice({ ...editingInvoice, paymentTerms: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A2333] text-xs"
                />
              </div>

              {/* Grand Total Bar */}
              <div className="p-4 rounded-2xl bg-[#0A4DA3] text-white flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/70">{txt('ទឹកប្រាក់ត្រូវទូទាត់សរុប', 'Amount Due Grand Total', '청구 총 금액')}</div>
                  <div className="text-xl font-black">${editingInvoice.grandTotalUsd.toLocaleString()} USD</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/70">{txt('ស្មើប្រាក់រៀល', 'In KHR Currency', '리엘 환산')}</div>
                  <div className="text-sm font-bold">~{Math.round(editingInvoice.grandTotalKhr).toLocaleString()} KHR</div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-black/5 dark:border-white/5 pt-4">
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold uppercase"
                >
                  {txt('បោះបង់', 'Cancel', '취소')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#0A4DA3] hover:bg-[#0A4DA3]/90 text-white text-xs font-bold uppercase tracking-wider shadow-lg"
                >
                  {txt('រក្សាទុក វិក្កយបត្រ', 'Save Invoice', '인보이스 저장')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DELIVERY ORDER (DO) EDITOR MODAL */}
      {isDnModalOpen && editingDn && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#101828] border border-black/10 dark:border-white/10 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#0A4DA3]/10 text-[#0A4DA3] dark:text-blue-400">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                    {txt(`កែប្រែប័ណ្ណប្រគល់ទំនិញ / Edit DO (${editingDn.deliveryNumber})`, `Edit Delivery Order (${editingDn.deliveryNumber})`, `납품서 수정 (${editingDn.deliveryNumber})`)}
                  </h3>
                  <p className="text-xs text-gray-500">{txt('ប័ណ្ណប្រគល់ និងពិនិត្យចំនួនទំនិញជាក់ស្តែងនៅការដ្ឋាន', 'Delivery order and site inspection receipt with delivered quantities.', '현장 실물 물품 인수 및 확인증.')}</p>
                </div>
              </div>
              <button
                onClick={() => setIsDnModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDn} className="space-y-6">
              {/* Header Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">{txt('លេខ DO', 'DO Number', '납품서 번호')}</label>
                  <input
                    type="text"
                    value={editingDn.deliveryNumber}
                    onChange={(e) => setEditingDn({ ...editingDn, deliveryNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A2333] text-xs font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">{txt('កាលបរិច្ឆេទដឹក', 'Dispatch Date', '발송일')}</label>
                  <input
                    type="date"
                    value={editingDn.date}
                    onChange={(e) => setEditingDn({ ...editingDn, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A2333] text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">{txt('លេខ PO យោង', 'PO Ref', '발주서 참조')}</label>
                  <input
                    type="text"
                    value={editingDn.poReference}
                    onChange={(e) => setEditingDn({ ...editingDn, poReference: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A2333] text-xs font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">{txt('ស្ថានភាព', 'Status', '상태')}</label>
                  <select
                    value={editingDn.status}
                    onChange={(e) => setEditingDn({ ...editingDn, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A2333] text-xs font-bold"
                  >
                    <option value="Pending">{txt('រង់ចាំ (Pending)', 'Pending', '대기 (Pending)')}</option>
                    <option value="Dispatched">{txt('កំពុងដឹក (Dispatched)', 'Dispatched', '배송중 (Dispatched)')}</option>
                    <option value="Delivered">{txt('បានដឹកដល់ (Delivered)', 'Delivered', '배송완료 (Delivered)')}</option>
                    <option value="Signed">{txt('បានចុះហត្ថលេខា (Signed)', 'Signed', '서명완료 (Signed)')}</option>
                  </select>
                </div>
              </div>

              {/* Client & Transport Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-[#1A2333]/50 border border-gray-200 dark:border-gray-800">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">{txt('ឈ្មោះអតិថិជន / អ្នកទទួល', 'Client / Recipient Name', '고객/인수인명')}</label>
                  <input
                    type="text"
                    value={editingDn.clientName}
                    onChange={(e) => setEditingDn({ ...editingDn, clientName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#101828] text-xs font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">{txt('អ្នកទំនាក់ទំនង / លេខទូរស័ព្ទ', 'Contact Person', '담당자 / 연락처')}</label>
                  <input
                    type="text"
                    value={editingDn.contactPerson || ''}
                    onChange={(e) => setEditingDn({ ...editingDn, contactPerson: e.target.value })}
                    placeholder="Site Manager / Phone"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#101828] text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">{txt('ស្លាកលេខយានយន្ត', 'Vehicle / Plate No.', '차량 / 번호판')}</label>
                  <input
                    type="text"
                    value={editingDn.vehicleNo}
                    onChange={(e) => setEditingDn({ ...editingDn, vehicleNo: e.target.value })}
                    placeholder="PP-3D-8899"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#101828] text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">{txt('ឈ្មោះអ្នកបើកបរ', 'Driver Name', '운전기사명')}</label>
                  <input
                    type="text"
                    value={editingDn.driverName}
                    onChange={(e) => setEditingDn({ ...editingDn, driverName: e.target.value })}
                    placeholder="Driver Name"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#101828] text-xs font-medium"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">{txt('អាសយដ្ឋានការដ្ឋានប្រគល់', 'Project Site Address', '납품 현장 주소')}</label>
                  <input
                    type="text"
                    value={editingDn.projectSite}
                    onChange={(e) => setEditingDn({ ...editingDn, projectSite: e.target.value })}
                    placeholder="Full site location details"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#101828] text-xs font-medium"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    {txt(`បញ្ជីទំនិញដឹកជញ្ជូន (${editingDn.items.length})`, `Delivery Items List (${editingDn.items.length})`, `납품 품목 목록 (${editingDn.items.length})`)}
                  </h4>
                  <button
                    type="button"
                    onClick={addDnItem}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#0A4DA3] dark:text-blue-400 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> + {txt('បន្ថែមជួរទំនិញ', 'Add Row', '행 추가')}
                  </button>
                </div>

                <div className="space-y-3">
                  {editingDn.items.map((item, idx) => (
                    <div key={item.id} className="p-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#101828] space-y-2">
                      <div className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-2">
                          <label className="block text-[9px] font-bold uppercase text-gray-400">{txt('កូដ', 'Code', '코드')}</label>
                          <input
                            type="text"
                            value={item.code}
                            onChange={(e) => updateDnItem(idx, { code: e.target.value })}
                            className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-bold"
                          />
                        </div>
                        <div className="col-span-4">
                          <label className="block text-[9px] font-bold uppercase text-gray-400">{txt('បរិយាយទំនិញ', 'Description', '품목 설명')}</label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateDnItem(idx, { description: e.target.value })}
                            className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-bold"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[9px] font-bold uppercase text-gray-400">{txt('ចំនួនកុម្ម៉ង់', 'Ordered', '발주수량')}</label>
                          <input
                            type="number"
                            min="0"
                            value={item.orderedQty}
                            onChange={(e) => updateDnItem(idx, { orderedQty: Number(e.target.value) || 0 })}
                            className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-center"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[9px] font-bold uppercase text-gray-400">{txt('ចំនួនប្រគល់', 'Delivered', '납품수량')}</label>
                          <input
                            type="number"
                            min="0"
                            value={item.deliveredQty}
                            onChange={(e) => updateDnItem(idx, { deliveredQty: Number(e.target.value) || 0 })}
                            className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-black text-center text-[#0A4DA3] dark:text-blue-400"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[9px] font-bold uppercase text-gray-400">{txt('ខ្នាត', 'Unit', '단위')}</label>
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => updateDnItem(idx, { unit: e.target.value })}
                            className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-center"
                          />
                        </div>
                        <div className="col-span-1 text-center">
                          <button
                            type="button"
                            onClick={() => removeDnItem(idx)}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <input
                          type="text"
                          value={item.remark || ''}
                          onChange={(e) => updateDnItem(idx, { remark: e.target.value })}
                          placeholder={txt('កំណត់ចំណាំ / លក្ខខណ្ឌទំនិញ...', 'Remark / Item condition on delivery...', '비고 / 상태...')}
                          className="w-full px-2.5 py-1 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#1A2333] text-[11px] text-gray-600 dark:text-gray-300"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Remarks / Notes */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">{txt('កំណត់ចំណាំការដឹកជញ្ជូន', 'Delivery Notes & Instructions', '납품 메모')}</label>
                <textarea
                  rows={2}
                  value={editingDn.notes || ''}
                  onChange={(e) => setEditingDn({ ...editingDn, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A2333] text-xs"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-black/5 dark:border-white/5 pt-4">
                <button
                  type="button"
                  onClick={() => setIsDnModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold uppercase"
                >
                  {txt('បោះបង់', 'Cancel', '취소')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#0A4DA3] hover:bg-[#0A4DA3]/90 text-white text-xs font-bold uppercase tracking-wider shadow-lg"
                >
                  {txt('រក្សាទុក DO', 'Save Delivery Order', '납품서 저장')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
