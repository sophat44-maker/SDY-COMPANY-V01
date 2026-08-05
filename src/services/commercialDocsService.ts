export interface QuotationItem {
  id: string;
  name: string;
  spec?: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Quotation {
  id: string;
  quoteNumber: string;
  issueDate: string;
  expiryDate: string;
  preparedBy?: string;
  clientName: string;
  clientCompany?: string;
  clientPhone: string;
  clientEmail?: string;
  projectSite: string;
  items: QuotationItem[];
  subtotal: number;
  discountTotal: number;
  vatPercent: number;
  vatAmount: number;
  grandTotalUsd: number;
  grandTotalKhr: number;
  termsAndConditions: string;
  status: 'Draft' | 'Issued' | 'Approved' | 'Declined';
  createdAt: string;
  updatedAt: string;
}

export interface BoqItem {
  id: string;
  refCode: string;
  description: string;
  unit: string;
  quantity: number;
  materialRate: number;
  laborRate: number;
  totalAmount: number;
}

export interface BoqCategory {
  id: string;
  categoryName: string;
  items: BoqItem[];
}

export interface BoqDocument {
  id: string;
  boqNumber: string;
  date: string;
  clientName: string;
  projectName: string;
  projectLocation: string;
  categories: BoqCategory[];
  subtotal: number;
  contingencyPercent: number;
  contingencyAmount: number;
  profitPercent: number;
  profitAmount: number;
  vatPercent: number;
  vatAmount: number;
  grandTotalUsd: number;
  grandTotalKhr: number;
  status: 'Draft' | 'Finalized' | 'Approved';
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryNoteItem {
  id: string;
  code: string;
  description: string;
  orderedQty: number;
  deliveredQty: number;
  unit: string;
  remark: string;
}

export interface DeliveryNote {
  id: string;
  deliveryNumber: string;
  poReference: string;
  date: string;
  clientName: string;
  projectSite: string;
  contactPerson: string;
  vehicleNo: string;
  driverName: string;
  items: DeliveryNoteItem[];
  preparedBy: string;
  dispatchedBy: string;
  receivedBy: string;
  notes: string;
  status: 'Pending' | 'Dispatched' | 'Delivered' | 'Signed';
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  name: string;
  spec?: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  quoteReference?: string;
  poReference?: string;
  preparedBy?: string;
  clientName: string;
  clientCompany?: string;
  clientPhone: string;
  clientEmail?: string;
  projectSite: string;
  items: InvoiceItem[];
  subtotal: number;
  discountTotal: number;
  vatPercent: number;
  vatAmount: number;
  grandTotalUsd: number;
  grandTotalKhr: number;
  paymentTerms?: string;
  status: 'Draft' | 'Issued' | 'Paid' | 'Overdue';
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEYS = {
  QUOTATIONS: 'sdy_commercial_quotations_v1',
  BOQS: 'sdy_commercial_boqs_v1',
  DELIVERY_NOTES: 'sdy_commercial_delivery_notes_v1',
  INVOICES: 'sdy_commercial_invoices_v1'
};

export const KHR_EXCHANGE_RATE = 4100;

// Default Pre-populated Sample Data
const DEFAULT_QUOTATIONS: Quotation[] = [
  {
    id: 'q-1001',
    quoteNumber: 'SDY-QT-2026-001',
    issueDate: '2026-07-15',
    expiryDate: '2026-08-15',
    clientName: 'Sokha Hotel & Resort Co., Ltd',
    clientCompany: 'Sokha Group Cambodia',
    clientPhone: '+855 12 345 678',
    clientEmail: 'procurement@sokhahotels.com',
    projectSite: 'Sokha Hotel Executive Suites - Phnom Penh',
    items: [
      {
        id: 'qi-1',
        name: 'Acoustic Solid Wood Door System (38dB)',
        spec: 'Size: 900 x 2200 x 45mm, Natural Walnut Veneer, Drop-down Seal',
        unit: 'Set',
        quantity: 20,
        unitPrice: 480,
        discount: 0,
        total: 9600
      },
      {
        id: 'qi-2',
        name: 'UL-Certified 90-Min Fire Rated Steel Door',
        spec: 'Size: 1000 x 2200 x 50mm, Galvanized Steel 1.5mm, Panic Bar',
        unit: 'Set',
        quantity: 10,
        unitPrice: 650,
        discount: 50,
        total: 6450
      },
      {
        id: 'qi-3',
        name: 'Custom Executive Joinery Wall Panel',
        spec: '3D Fluted Timber Slat Panel with Concealed LED Backlight Housing',
        unit: 'sqm',
        quantity: 45,
        unitPrice: 120,
        discount: 0,
        total: 5400
      }
    ],
    subtotal: 21450,
    discountTotal: 50,
    vatPercent: 10,
    vatAmount: 2140,
    grandTotalUsd: 23590,
    grandTotalKhr: 23590 * KHR_EXCHANGE_RATE,
    termsAndConditions: '1. 30% advance deposit upon agreement, 50% upon delivery to site, 20% upon final handover.\n2. Delivery lead time: 14 working days from manufacturing plant.\n3. 3-Year comprehensive structural & mechanism warranty included.',
    status: 'Approved',
    createdAt: '2026-07-15T08:30:00Z',
    updatedAt: '2026-07-16T10:15:00Z'
  },
  {
    id: 'q-1002',
    quoteNumber: 'SDY-QT-2026-002',
    issueDate: '2026-07-20',
    expiryDate: '2026-08-20',
    clientName: 'ABA Bank Branch Renovation Dept',
    clientCompany: 'Advanced Bank of Asia Ltd',
    clientPhone: '+855 23 225 588',
    clientEmail: 'projects@ababank.com',
    projectSite: 'ABA Bank - Chroy Changvar Branch',
    items: [
      {
        id: 'qi-10',
        name: 'Double-Glazed Heavy Duty Glass Partition',
        spec: '10mm+10mm Toughened Safety Laminated Glass, Matte Black Frame',
        unit: 'sqm',
        quantity: 80,
        unitPrice: 165,
        discount: 0,
        total: 13200
      },
      {
        id: 'qi-11',
        name: 'Heavy Duty Structural Steel Truss',
        spec: 'Grade 50 High-Tensile Column & Rafter Assembly with Sandblast Primer',
        unit: 'Ton',
        quantity: 5,
        unitPrice: 1450,
        discount: 0,
        total: 7250
      }
    ],
    subtotal: 20450,
    discountTotal: 0,
    vatPercent: 10,
    vatAmount: 2045,
    grandTotalUsd: 22495,
    grandTotalKhr: 22495 * KHR_EXCHANGE_RATE,
    termsAndConditions: '1. Quotation valid for 30 calendar days from issue date.\n2. Price includes transport to site and certified site erection supervision.',
    status: 'Issued',
    createdAt: '2026-07-20T09:00:00Z',
    updatedAt: '2026-07-20T09:00:00Z'
  }
];

const DEFAULT_BOQS: BoqDocument[] = [
  {
    id: 'boq-2001',
    boqNumber: 'SDY-BOQ-2026-001',
    date: '2026-07-18',
    clientName: 'Sokha Hotel & Resort Co., Ltd',
    projectName: 'Executive Suites Fit-out & Door Package',
    projectLocation: 'National Road 6A, Phnom Penh',
    categories: [
      {
        id: 'cat-1',
        categoryName: '1. Structural & Architectural Doors',
        items: [
          {
            id: 'bi-1',
            refCode: 'DR-01',
            description: 'Acoustic Solid Wood Door (900x2200x45mm) incl. Lockset & Heavy Duty Hinges',
            unit: 'Set',
            quantity: 20,
            materialRate: 380,
            laborRate: 100,
            totalAmount: 9600
          },
          {
            id: 'bi-2',
            refCode: 'DR-02',
            description: 'UL-Certified 90-Min Fire Rated Steel Door with Panic Bar & Door Closer',
            unit: 'Set',
            quantity: 10,
            materialRate: 530,
            laborRate: 120,
            totalAmount: 6500
          }
        ]
      },
      {
        id: 'cat-2',
        categoryName: '2. Interior Joinery & Wall Cladding',
        items: [
          {
            id: 'bi-3',
            refCode: 'JN-01',
            description: '3D Timber Fluted Slat Wall Paneling with Fire Retardant Coating',
            unit: 'sqm',
            quantity: 45,
            materialRate: 95,
            laborRate: 25,
            totalAmount: 5400
          }
        ]
      }
    ],
    subtotal: 21500,
    contingencyPercent: 3,
    contingencyAmount: 645,
    profitPercent: 5,
    profitAmount: 1075,
    vatPercent: 10,
    vatAmount: 2322,
    grandTotalUsd: 25542,
    grandTotalKhr: 25542 * KHR_EXCHANGE_RATE,
    status: 'Finalized',
    createdAt: '2026-07-18T10:00:00Z',
    updatedAt: '2026-07-18T10:00:00Z'
  }
];

const DEFAULT_DELIVERY_NOTES: DeliveryNote[] = [
  {
    id: 'dn-3001',
    deliveryNumber: 'SDY-DN-2026-001',
    poReference: 'PO-SOKHA-8842',
    date: '2026-07-22',
    clientName: 'Sokha Hotel & Resort Co., Ltd',
    projectSite: 'Sokha Hotel Executive Suites - Site Gate B',
    contactPerson: 'Mr. Seng Visal (Site Engineer - 012 999 888)',
    vehicleNo: 'PP-3D-8899 (5-Ton Flatbed Truck)',
    driverName: 'Khem Chantha',
    items: [
      {
        id: 'dni-1',
        code: 'DR-01',
        description: 'Acoustic Solid Wood Door (900x2200x45mm) in Walnut Finish',
        orderedQty: 20,
        deliveredQty: 20,
        unit: 'Set',
        remark: 'Inspected on site, no scratches, protective film intact.'
      },
      {
        id: 'dni-2',
        code: 'DR-02',
        description: 'UL 90-Min Fire Rated Steel Door Frame & Panel Assembly',
        orderedQty: 10,
        deliveredQty: 10,
        unit: 'Set',
        remark: 'Complete with panic bar hardware and UL seal labels.'
      }
    ],
    preparedBy: 'Chhim Sophal (SDY Logistics Manager)',
    dispatchedBy: 'Khem Chantha (SDY Fleet Driver)',
    receivedBy: 'Seng Visal (Site Representative)',
    notes: 'All items delivered as per PO specifications. Customer verified hardware counts on site.',
    status: 'Delivered',
    createdAt: '2026-07-22T08:00:00Z',
    updatedAt: '2026-07-22T14:30:00Z'
  }
];

// Local Storage Helper Services
export function getQuotations(): Quotation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUOTATIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(DEFAULT_QUOTATIONS));
  return DEFAULT_QUOTATIONS;
}

export function saveQuotation(quote: Quotation): Quotation[] {
  const current = getQuotations();
  const index = current.findIndex(q => q.id === quote.id);
  let updated: Quotation[];
  const now = new Date().toISOString();

  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...quote, updatedAt: now };
  } else {
    updated = [{ ...quote, createdAt: now, updatedAt: now }, ...current];
  }

  localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(updated));
  return updated;
}

export function deleteQuotation(id: string): Quotation[] {
  const current = getQuotations();
  const updated = current.filter(q => q.id !== id);
  localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(updated));
  return updated;
}

export function getBoqs(): BoqDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOQS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem(STORAGE_KEYS.BOQS, JSON.stringify(DEFAULT_BOQS));
  return DEFAULT_BOQS;
}

export function saveBoq(boq: BoqDocument): BoqDocument[] {
  const current = getBoqs();
  const index = current.findIndex(b => b.id === boq.id);
  let updated: BoqDocument[];
  const now = new Date().toISOString();

  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...boq, updatedAt: now };
  } else {
    updated = [{ ...boq, createdAt: now, updatedAt: now }, ...current];
  }

  localStorage.setItem(STORAGE_KEYS.BOQS, JSON.stringify(updated));
  return updated;
}

export function deleteBoq(id: string): BoqDocument[] {
  const current = getBoqs();
  const updated = current.filter(b => b.id !== id);
  localStorage.setItem(STORAGE_KEYS.BOQS, JSON.stringify(updated));
  return updated;
}

export function getDeliveryNotes(): DeliveryNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DELIVERY_NOTES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem(STORAGE_KEYS.DELIVERY_NOTES, JSON.stringify(DEFAULT_DELIVERY_NOTES));
  return DEFAULT_DELIVERY_NOTES;
}

export function saveDeliveryNote(dn: DeliveryNote): DeliveryNote[] {
  const current = getDeliveryNotes();
  const index = current.findIndex(d => d.id === dn.id);
  let updated: DeliveryNote[];
  const now = new Date().toISOString();

  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...dn, updatedAt: now };
  } else {
    updated = [{ ...dn, createdAt: now, updatedAt: now }, ...current];
  }

  localStorage.setItem(STORAGE_KEYS.DELIVERY_NOTES, JSON.stringify(updated));
  return updated;
}

export function deleteDeliveryNote(id: string): DeliveryNote[] {
  const current = getDeliveryNotes();
  const updated = current.filter(d => d.id !== id);
  localStorage.setItem(STORAGE_KEYS.DELIVERY_NOTES, JSON.stringify(updated));
  return updated;
}

const DEFAULT_INVOICES: Invoice[] = [
  {
    id: 'inv-4001',
    invoiceNumber: 'SDY-INV-2026-001',
    issueDate: '2026-07-25',
    dueDate: '2026-08-10',
    quoteReference: 'SDY-QT-2026-001',
    poReference: 'PO-SOKHA-8842',
    preparedBy: 'Chhim Sophal (SDY Finance)',
    clientName: 'Sokha Hotel & Resort Co., Ltd',
    clientCompany: 'Sokha Group Cambodia',
    clientPhone: '+855 12 345 678',
    clientEmail: 'procurement@sokhahotels.com',
    projectSite: 'Sokha Hotel Executive Suites - Phnom Penh',
    items: [
      {
        id: 'inv-item-1',
        name: 'Acoustic Solid Wood Door System (38dB)',
        spec: 'Size: 900 x 2200 x 45mm, Natural Walnut Veneer, Drop-down Seal',
        unit: 'Set',
        quantity: 20,
        unitPrice: 480,
        discount: 0,
        total: 9600
      },
      {
        id: 'inv-item-2',
        name: 'UL-Certified 90-Min Fire Rated Steel Door',
        spec: 'Size: 1000 x 2200 x 50mm, Galvanized Steel 1.5mm, Panic Bar',
        unit: 'Set',
        quantity: 10,
        unitPrice: 650,
        discount: 50,
        total: 6450
      }
    ],
    subtotal: 16050,
    discountTotal: 50,
    vatPercent: 10,
    vatAmount: 1600,
    grandTotalUsd: 17650,
    grandTotalKhr: 17650 * KHR_EXCHANGE_RATE,
    paymentTerms: 'Deposit 30% advance, 50% upon delivery to site, 20% upon final handover.',
    status: 'Issued',
    createdAt: '2026-07-25T09:00:00Z',
    updatedAt: '2026-07-25T09:00:00Z'
  },
  {
    id: 'inv-4002',
    invoiceNumber: 'SDY-INV-2026-002',
    issueDate: '2026-07-28',
    dueDate: '2026-08-12',
    quoteReference: 'SDY-QT-2026-002',
    poReference: 'PO-ABA-7711',
    preparedBy: 'SDY Finance Officer',
    clientName: 'ABA Bank Branch Renovation Dept',
    clientCompany: 'Advanced Bank of Asia Ltd',
    clientPhone: '+855 23 225 588',
    clientEmail: 'projects@ababank.com',
    projectSite: 'ABA Bank - Chroy Changvar Branch',
    items: [
      {
        id: 'inv-item-3',
        name: 'Double-Glazed Heavy Duty Glass Partition',
        spec: '10mm+10mm Toughened Safety Laminated Glass, Matte Black Frame',
        unit: 'sqm',
        quantity: 80,
        unitPrice: 165,
        discount: 0,
        total: 13200
      }
    ],
    subtotal: 13200,
    discountTotal: 0,
    vatPercent: 10,
    vatAmount: 1320,
    grandTotalUsd: 14520,
    grandTotalKhr: 14520 * KHR_EXCHANGE_RATE,
    paymentTerms: '100% payment upon invoice issue. Bank transfer to SDY C&I ABA Account.',
    status: 'Paid',
    createdAt: '2026-07-28T11:00:00Z',
    updatedAt: '2026-07-30T15:20:00Z'
  }
];

export function getInvoices(): Invoice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVOICES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(DEFAULT_INVOICES));
  return DEFAULT_INVOICES;
}

export function saveInvoice(invoice: Invoice): Invoice[] {
  const current = getInvoices();
  const index = current.findIndex(i => i.id === invoice.id);
  let updated: Invoice[];
  const now = new Date().toISOString();

  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...invoice, updatedAt: now };
  } else {
    updated = [{ ...invoice, createdAt: now, updatedAt: now }, ...current];
  }

  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(updated));
  return updated;
}

export function deleteInvoice(id: string): Invoice[] {
  const current = getInvoices();
  const updated = current.filter(i => i.id !== id);
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(updated));
  return updated;
}

// Convert Quotation -> Invoice
export function convertQuotationToInvoice(q: Quotation): Invoice {
  const nowStr = new Date().toISOString().split('T')[0];
  const dueStr = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return {
    id: `inv-gen-${Date.now()}`,
    invoiceNumber: `SDY-INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    issueDate: nowStr,
    dueDate: dueStr,
    quoteReference: q.quoteNumber,
    poReference: `PO-${q.quoteNumber}`,
    preparedBy: q.preparedBy || 'SDY Commercial Dept',
    clientName: q.clientName,
    clientCompany: q.clientCompany,
    clientPhone: q.clientPhone,
    clientEmail: q.clientEmail,
    projectSite: q.projectSite,
    items: q.items.map(item => ({ ...item })),
    subtotal: q.subtotal,
    discountTotal: q.discountTotal,
    vatPercent: q.vatPercent,
    vatAmount: q.vatAmount,
    grandTotalUsd: q.grandTotalUsd,
    grandTotalKhr: q.grandTotalKhr,
    paymentTerms: 'Payment due within 15 days of invoice date. Bank transfer to SDY C&I ABA Account.',
    status: 'Issued',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// Convert Quotation -> BOQ
export function convertQuotationToBoq(q: Quotation): BoqDocument {
  const boqItems: BoqItem[] = q.items.map((item, idx) => {
    const matRate = Math.round(item.unitPrice * 0.8);
    const labRate = Math.round(item.unitPrice * 0.2);
    return {
      id: `bi-c-${idx + 1}`,
      refCode: `ITEM-${idx + 1}`,
      description: `${item.name} (${item.spec || ''})`,
      unit: item.unit,
      quantity: item.quantity,
      materialRate: matRate,
      laborRate: labRate,
      totalAmount: item.total
    };
  });

  const nowStr = new Date().toISOString().split('T')[0];

  return {
    id: `boq-gen-${Date.now()}`,
    boqNumber: `SDY-BOQ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    date: nowStr,
    clientName: q.clientName,
    projectName: `Fit-out & Joinery Contract for ${q.clientName}`,
    projectLocation: q.projectSite,
    categories: [
      {
        id: 'cat-conv-1',
        categoryName: '1. Material Supply & Joinery Installation',
        items: boqItems
      }
    ],
    subtotal: q.subtotal,
    contingencyPercent: 0,
    contingencyAmount: 0,
    profitPercent: 0,
    profitAmount: 0,
    vatPercent: q.vatPercent,
    vatAmount: q.vatAmount,
    grandTotalUsd: q.grandTotalUsd,
    grandTotalKhr: q.grandTotalKhr,
    status: 'Draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// Convert Quotation -> Delivery Note
export function convertQuotationToDeliveryNote(q: Quotation): DeliveryNote {
  const dnItems: DeliveryNoteItem[] = q.items.map((item, idx) => ({
    id: `dni-c-${idx + 1}`,
    code: `ITEM-0${idx + 1}`,
    description: `${item.name} - ${item.spec || ''}`,
    orderedQty: item.quantity,
    deliveredQty: item.quantity,
    unit: item.unit,
    remark: 'Inspected and verified on delivery.'
  }));

  const nowStr = new Date().toISOString().split('T')[0];

  return {
    id: `dn-gen-${Date.now()}`,
    deliveryNumber: `SDY-DN-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    poReference: `PO-REF-${q.quoteNumber}`,
    date: nowStr,
    clientName: q.clientName,
    projectSite: q.projectSite,
    contactPerson: `${q.clientName} (${q.clientPhone})`,
    vehicleNo: 'PP-3D-8899 (5-Ton Truck)',
    driverName: 'SDY Logistics Driver',
    items: dnItems,
    preparedBy: 'SDY Logistics Officer',
    dispatchedBy: 'SDY Logistics Driver',
    receivedBy: `${q.clientName} Representative`,
    notes: `Delivered per Quotation ${q.quoteNumber}`,
    status: 'Pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
