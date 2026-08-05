import { api } from './api';

export interface EnterprisePackage {
  id: string;
  name: string;
  category: 'Core' | 'Operations' | 'Finance' | 'Manufacturing' | 'Portals' | 'Extensions';
  version: string;
  publisher: 'Official SDY Core' | 'Third-Party Partner' | 'Organization Private';
  status: 'Installed' | 'Available' | 'Update Available';
  description: string;
  entities: string[];
  permissions: string[];
  workflows: string[];
  icon: string;
}

export interface EnterpriseEvent {
  id: string;
  eventType: string; // e.g. 'project.approved', 'boq.updated', 'inventory.threshold', 'user.login'
  sourceModule: string;
  organizationId: string;
  payload: Record<string, any>;
  timestamp: string;
  triggeredAutomations: number;
}

export interface OrganizationTenant {
  id: string;
  name: string;
  code: string;
  domain: string;
  branding: {
    primaryColor: string;
    logoUrl?: string;
    theme: 'Dark' | 'Light' | 'System';
  };
  activePackagesCount: number;
  dataStorageMb: number;
  userCount: number;
  status: 'Active' | 'Suspended' | 'Provisioning';
}

export interface APIKeyCredential {
  id: string;
  keyName: string;
  keyMasked: string;
  organizationId: string;
  role: 'Admin' | 'Read-Only' | 'Integration Service';
  rateLimitPerMin: number;
  lastUsedAt: string;
  createdAt: string;
}

export const OFFICIAL_PACKAGES: EnterprisePackage[] = [
  {
    id: 'pkg_construction',
    name: 'Turnkey Construction & Fit-Out OS',
    category: 'Operations',
    version: 'v3.4.0',
    publisher: 'Official SDY Core',
    status: 'Installed',
    description: 'Complete BOQ scheduling, shop drawing revisions, site supervisor logs, and architectural submittals.',
    entities: ['Projects', 'BOQ', 'Drawings', 'Submittals'],
    permissions: ['project.read', 'project.write', 'boq.approve'],
    workflows: ['Draft -> Engineering Review -> Client Signoff -> Executed'],
    icon: 'HardHat'
  },
  {
    id: 'pkg_qaqc',
    name: 'ISO 9001 QA/QC & Inspection Engine',
    category: 'Operations',
    version: 'v2.1.0',
    publisher: 'Official SDY Core',
    status: 'Installed',
    description: 'Non-Conformance Reports (NCR), ultrasonic weld testing, coating gauge logs, and site safety audits.',
    entities: ['QAQCReports', 'NCRLogs', 'SafetyAudits'],
    permissions: ['qaqc.inspect', 'qaqc.approve_ncr'],
    workflows: ['Inspection -> Defect Found -> NCR Issued -> Rectification -> Re-Inspection'],
    icon: 'ShieldCheck'
  },
  {
    id: 'pkg_factory',
    name: 'Steel & Joinery Factory ERP',
    category: 'Manufacturing',
    version: 'v4.0.1',
    publisher: 'Official SDY Core',
    status: 'Installed',
    description: 'CNC laser cutting yield optimizer, dust-free paint booth queuing, and millwork assembly tracking.',
    entities: ['ProductionBatches', 'EquipmentTelemetry', 'MaterialYield'],
    permissions: ['factory.schedule', 'equipment.maintain'],
    workflows: ['Order Received -> Nesting Optimization -> CNC Cut -> Coating -> Assembly'],
    icon: 'Factory'
  },
  {
    id: 'pkg_inventory',
    name: 'Multi-Warehouse & Materials Hub',
    category: 'Operations',
    version: 'v3.0.2',
    publisher: 'Official SDY Core',
    status: 'Installed',
    description: 'Automated reorder point predictions, QR barcode scanning, and raw steel sheet stock valuation.',
    entities: ['InventoryItems', 'StockTransfers', 'Warehouses'],
    permissions: ['inventory.read', 'inventory.transfer', 'inventory.adjust'],
    workflows: ['Stock Request -> Approval -> Warehouse Picking -> Transfer -> Received'],
    icon: 'Package'
  },
  {
    id: 'pkg_crm',
    name: 'Enterprise CRM & Commercial Tenders',
    category: 'Core',
    version: 'v2.8.0',
    publisher: 'Official SDY Core',
    status: 'Installed',
    description: 'Lead pipeline management, commercial tender submissions, contractor pre-qualifications, and RFPs.',
    entities: ['Leads', 'Tenders', 'Clients', 'Quotations'],
    permissions: ['crm.lead_edit', 'tender.submit'],
    workflows: ['RFP Received -> Estimation -> Proposal Draft -> Board Review -> Submitted'],
    icon: 'Building2'
  },
  {
    id: 'pkg_customer_portal',
    name: 'Client & Developer Self-Service Portal',
    category: 'Portals',
    version: 'v1.5.0',
    publisher: 'Official SDY Core',
    status: 'Available',
    description: 'External portal for project owners to inspect daily progress photo logs, approve BOQ variations, and download invoices.',
    entities: ['ClientPortals', 'VariationOrders', 'ProgressPhotos'],
    permissions: ['client.view_progress', 'client.sign_variation'],
    workflows: ['Variation Proposed -> Client Notification -> Digital Signature -> Approved'],
    icon: 'Users'
  },
  {
    id: 'pkg_finance',
    name: 'Multi-Currency Construction Finance & Payroll',
    category: 'Finance',
    version: 'v2.2.0',
    publisher: 'Official SDY Core',
    status: 'Available',
    description: 'Progress claim billing, sub-contractor retention payments, tax withholdings, and site worker payroll.',
    entities: ['Invoices', 'ProgressClaims', 'RetentionLedger', 'Payroll'],
    permissions: ['finance.claim_approve', 'payroll.process'],
    workflows: ['Claim Submitted -> QS Verification -> PM Approval -> Payment Released'],
    icon: 'DollarSign'
  }
];

export const TENANTS: OrganizationTenant[] = [
  {
    id: 'org_sdy_main',
    name: 'SDY Construction & Interiors HQ',
    code: 'SDY-HQ',
    domain: 'sdy.com.kh',
    branding: { primaryColor: '#0F52BA', theme: 'Dark' },
    activePackagesCount: 5,
    dataStorageMb: 412,
    userCount: 84,
    status: 'Active'
  },
  {
    id: 'org_sdy_steel',
    name: 'SDY Heavy Structural Steel Fabrication Ltd.',
    code: 'SDY-STEEL',
    domain: 'steel.sdy.com.kh',
    branding: { primaryColor: '#D4AF37', theme: 'Dark' },
    activePackagesCount: 4,
    dataStorageMb: 218,
    userCount: 42,
    status: 'Active'
  },
  {
    id: 'org_sdy_korea',
    name: 'SDY International Korea Office',
    code: 'SDY-KO',
    domain: 'kr.sdy.com.kh',
    branding: { primaryColor: '#10B981', theme: 'Light' },
    activePackagesCount: 3,
    dataStorageMb: 125,
    userCount: 18,
    status: 'Active'
  }
];

class EcosystemService {
  private eventLog: EnterpriseEvent[] = [
    {
      id: 'evt_01',
      eventType: 'project.approved',
      sourceModule: 'Projects Studio',
      organizationId: 'org_sdy_main',
      payload: { projectId: 'proj_naga3', name: 'NagaWorld Phase III Fit-Out', budget: 1250000 },
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      triggeredAutomations: 3
    },
    {
      id: 'evt_02',
      eventType: 'boq.updated',
      sourceModule: 'BOQ Engine',
      organizationId: 'org_sdy_main',
      payload: { boqId: 'boq_vat28', updatedItemsCount: 14, TotalCost: 345000 },
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      triggeredAutomations: 2
    },
    {
      id: 'evt_03',
      eventType: 'inventory.threshold_alert',
      sourceModule: 'Warehouse Hub',
      organizationId: 'org_sdy_steel',
      payload: { item: 'Galvanized Steel Sheet 2.0mm', currentStock: '42 sheets', reorderPoint: '100 sheets' },
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      triggeredAutomations: 4
    }
  ];

  private apiKeys: APIKeyCredential[] = [
    {
      id: 'key_prod_01',
      keyName: 'Main ERP Google Apps Script Webhook Key',
      keyMasked: 'sdy_live_sec_...9f8a',
      organizationId: 'org_sdy_main',
      role: 'Admin',
      rateLimitPerMin: 1200,
      lastUsedAt: new Date().toISOString(),
      createdAt: '2026-01-15'
    },
    {
      id: 'key_partner_02',
      keyName: 'Korean Architectural Hardware Integration',
      keyMasked: 'sdy_live_partner_...3b21',
      organizationId: 'org_sdy_main',
      role: 'Integration Service',
      rateLimitPerMin: 300,
      lastUsedAt: new Date(Date.now() - 1800000).toISOString(),
      createdAt: '2026-03-10'
    }
  ];

  /**
   * Publish an event onto the Enterprise Event Bus
   */
  async publishEvent(eventType: string, sourceModule: string, payload: Record<string, any>, organizationId = 'org_sdy_main') {
    const newEvt: EnterpriseEvent = {
      id: `evt_${Date.now()}`,
      eventType,
      sourceModule,
      organizationId,
      payload,
      timestamp: new Date().toISOString(),
      triggeredAutomations: Math.floor(Math.random() * 4) + 1
    };

    this.eventLog = [newEvt, ...this.eventLog];
    await api.logAudit('EventBus', `Publish Event: ${eventType}`, sourceModule, JSON.stringify(payload));
    return newEvt;
  }

  getEventLog() {
    return this.eventLog;
  }

  getAPIKeys() {
    return this.apiKeys;
  }

  async generateNewAPIKey(keyName: string, role: 'Admin' | 'Read-Only' | 'Integration Service' = 'Integration Service') {
    const newKey: APIKeyCredential = {
      id: `key_${Date.now()}`,
      keyName,
      keyMasked: `sdy_live_${role.toLowerCase().replace(' ', '_')}_${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 6)}`,
      organizationId: 'org_sdy_main',
      role,
      rateLimitPerMin: role === 'Admin' ? 1200 : 300,
      lastUsedAt: 'Never',
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.apiKeys = [newKey, ...this.apiKeys];
    return newKey;
  }
}

export const ecosystem = new EcosystemService();
export default ecosystem;
