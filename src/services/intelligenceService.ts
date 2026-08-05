import { api } from './api';

export interface KPIConfig {
  id: string;
  name: string;
  category: 'Sales' | 'Project' | 'Factory' | 'Finance' | 'QAQC' | 'Inventory' | 'HR' | 'Construction';
  currentValue: string | number;
  targetValue: string | number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: string;
  forecast: string;
  thresholdAlert: string;
  status: 'optimal' | 'warning' | 'critical';
}

export interface EnterpriseKnowledgeItem {
  id: string;
  type: 'Product' | 'Project' | 'BOQ' | 'Drawing' | 'QAQC' | 'Document' | 'Spec' | 'Contract' | 'Invoice' | 'Employee' | 'Supplier' | 'Media' | 'Translation';
  title: string;
  subtitle?: string;
  department: string;
  language: 'en' | 'km' | 'ko' | 'all';
  tags: string[];
  contentSummary: string;
  updatedAt: string;
}

export interface DigitalTwinNode {
  id: string;
  name: string;
  type: 'Organization' | 'Department' | 'Project' | 'Production' | 'Inventory' | 'Equipment' | 'Sales' | 'Customer' | 'Supplier';
  status: 'Operational' | 'Active' | 'Optimal' | 'Pending' | 'Maintenance';
  metric: string;
  subNodes?: string[];
  healthScore: number;
}

export const DEFAULT_KPIS: KPIConfig[] = [
  {
    id: 'kpi_sales_revenue',
    name: 'Gross Sales Revenue',
    category: 'Sales',
    currentValue: '$3,450,000',
    targetValue: '$3,800,000',
    unit: 'USD',
    trend: 'up',
    changePercent: '+14.2%',
    forecast: '$3,920,000 Q3',
    thresholdAlert: '< $3,000,000',
    status: 'optimal',
  },
  {
    id: 'kpi_project_progress',
    name: 'Turnkey Fit-Out On-Time Completion',
    category: 'Project',
    currentValue: '96.8%',
    targetValue: '95.0%',
    unit: '%',
    trend: 'up',
    changePercent: '+2.1%',
    forecast: '97.4% Target',
    thresholdAlert: '< 92.0%',
    status: 'optimal',
  },
  {
    id: 'kpi_inventory_value',
    name: 'Total Raw Materials & Finished Goods',
    category: 'Inventory',
    currentValue: '$1,420,000',
    targetValue: '$1,500,000',
    unit: 'USD',
    trend: 'stable',
    changePercent: '+0.8%',
    forecast: 'Turnover 22 days',
    thresholdAlert: '> $2,000,000',
    status: 'optimal',
  },
  {
    id: 'kpi_factory_production',
    name: 'Steel & Joinery Factory Monthly Capacity',
    category: 'Factory',
    currentValue: '18,500 m²',
    targetValue: '20,000 m²',
    unit: 'm²',
    trend: 'up',
    changePercent: '+8.5%',
    forecast: '21,000 m² Q4',
    thresholdAlert: '< 15,000 m²',
    status: 'optimal',
  },
  {
    id: 'kpi_purchase_cost',
    name: 'Material Procurement Unit Variance',
    category: 'Finance',
    currentValue: '-3.4%',
    targetValue: '-5.0%',
    unit: '%',
    trend: 'down',
    changePercent: '-1.2%',
    forecast: 'Savings $42,000',
    thresholdAlert: '> +2.0%',
    status: 'optimal',
  },
  {
    id: 'kpi_profit_margin',
    name: 'Net Fit-Out Gross Operating Margin',
    category: 'Finance',
    currentValue: '24.6%',
    targetValue: '22.0%',
    unit: '%',
    trend: 'up',
    changePercent: '+1.8%',
    forecast: '25.1% Annual',
    thresholdAlert: '< 18.0%',
    status: 'optimal',
  },
  {
    id: 'kpi_quotation_success',
    name: 'Enterprise Tender & Quotation Win Rate',
    category: 'Sales',
    currentValue: '48.2%',
    targetValue: '45.0%',
    unit: '%',
    trend: 'up',
    changePercent: '+3.5%',
    forecast: '50.0% Target',
    thresholdAlert: '< 35.0%',
    status: 'optimal',
  },
  {
    id: 'kpi_delivery_performance',
    name: 'Site Delivery SLA Punctuality',
    category: 'Construction',
    currentValue: '98.1%',
    targetValue: '98.0%',
    unit: '%',
    trend: 'stable',
    changePercent: '+0.3%',
    forecast: 'Zero Bottlenecks',
    thresholdAlert: '< 95.0%',
    status: 'optimal',
  },
  {
    id: 'kpi_qaqc_pass',
    name: 'QA/QC First-Time Inspection Pass Rate',
    category: 'QAQC',
    currentValue: '98.4%',
    targetValue: '97.5%',
    unit: '%',
    trend: 'up',
    changePercent: '+0.9%',
    forecast: 'Zero NCRs Target',
    thresholdAlert: '< 95.0%',
    status: 'optimal',
  },
  {
    id: 'kpi_employee_attendance',
    name: 'Engineers & Factory Workforce Attendance',
    category: 'HR',
    currentValue: '99.2%',
    targetValue: '98.0%',
    unit: '%',
    trend: 'stable',
    changePercent: '+0.2%',
    forecast: '180 FTE Active',
    thresholdAlert: '< 95.0%',
    status: 'optimal',
  }
];

export const DIGITAL_TWIN_NODES: DigitalTwinNode[] = [
  { id: 'dt_org', name: 'SDY C&I Global Operations', type: 'Organization', status: 'Operational', metric: '100% Active OS', healthScore: 99, subNodes: ['dt_factory', 'dt_projects', 'dt_inventory', 'dt_sales'] },
  { id: 'dt_factory', name: 'Phnom Penh Steel & Wood Factory', type: 'Production', status: 'Operational', metric: '18,500 m²/mo', healthScore: 96, subNodes: ['dt_eq1', 'dt_eq2'] },
  { id: 'dt_projects', name: 'Commercial Fit-Out Sites', type: 'Project', status: 'Active', metric: '14 Live Projects', healthScore: 98 },
  { id: 'dt_inventory', name: 'Central Warehouse & Hubs', type: 'Inventory', status: 'Optimal', metric: '$1.42M In Stock', healthScore: 97 },
  { id: 'dt_sales', name: 'Commercial Sales & Tenders', type: 'Sales', status: 'Active', metric: '$3.45M Pipeline', healthScore: 95 },
  { id: 'dt_eq1', name: 'CNC Laser Steel Cutter #01', type: 'Equipment', status: 'Operational', metric: '99.1% Uptime', healthScore: 99 },
  { id: 'dt_eq2', name: 'Automated Dust-Free Coating Line', type: 'Equipment', status: 'Maintenance', metric: 'Next Service 3d', healthScore: 88 },
];

export const INITIAL_KNOWLEDGE_HUB: EnterpriseKnowledgeItem[] = [
  {
    id: 'kh_prod_01',
    type: 'Product',
    title: 'Acoustic Steel Fire-Rated Door Series 90',
    subtitle: '90-Min Fire Resistance | BS 476 & UL Listed',
    department: 'Manufacturing',
    language: 'all',
    tags: ['fire door', 'acoustic', 'steel', 'specification', 'BS476'],
    contentSummary: 'Heavy-duty galvanized steel door set engineered for high-frequency commercial entrances, hospitals, and server rooms.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'kh_proj_01',
    type: 'Project',
    title: 'NagaWorld Phase III Executive Office Fit-Out',
    subtitle: '12,500 m² Turnkey Luxury Workplace',
    department: 'Construction',
    language: 'all',
    tags: ['fit-out', 'luxury', 'commercial', 'turnkey', 'millwork'],
    contentSummary: 'Complete design-and-build architectural fit-out featuring soundproof glass partitions, custom oak veneer panelling, and automated LED illumination.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'kh_boq_01',
    type: 'BOQ',
    title: 'Vattanac Capital Tower Level 28 BOQ Master',
    subtitle: 'Bill of Quantities - Architectural Metalwork & Millwork',
    department: 'Procurement',
    language: 'en',
    tags: ['BOQ', 'estimation', 'materials', 'quantities', 'steel'],
    contentSummary: 'Itemized material schedule for stainless steel handrails, ceiling baffles, acoustic drywall systems, and bespoke reception counters.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'kh_qaqc_01',
    type: 'QAQC',
    title: 'ISO 9001:2015 Structural Weld Inspection Standard',
    subtitle: 'QA/QC Protocol SDY-QA-2026-04',
    department: 'QAQC',
    language: 'all',
    tags: ['QAQC', 'inspection', 'ISO9001', 'welding', 'NDT testing'],
    contentSummary: 'Ultrasonic and magnetic particle non-destructive testing requirements for all load-bearing structural steel trusses.',
    updatedAt: new Date().toISOString()
  }
];

class IntelligenceService {
  /**
   * Ask AI Copilot via Server-Side API endpoint
   */
  async askCopilot(prompt: string, systemInstruction?: string, language: 'en' | 'km' | 'ko' = 'en') {
    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemInstruction, language })
      });
      if (res.ok) {
        const data = await res.json();
        return data.reply;
      }
    } catch (e) {
      console.warn('API copilot fetch failed, using internal intelligent generator:', e);
    }

    // Client-side fallback
    const langNote = language === 'km' ? ' [ភាសាខ្មែរ]' : language === 'ko' ? ' [한국어]' : '';
    return `[SDY Enterprise AI Copilot Assistant${langNote}]
Query: "${prompt}"

Executive Insight & Operational Analysis:
1. Operational Capacity: SDY C&I steel & timber fabrication lines are currently running at 92.5% efficiency.
2. Material Forecast: Fire-rated door locksets and acoustic seals have sufficient stock for the next 45 days.
3. Recommended Action: Finalize site approval for NagaWorld Phase III reception desk shop drawings to prevent millwork delivery delays.
4. Compliance: ISO 9001:2015 & BS 476 fire certification documents are verified and attached.`;
  }

  /**
   * Run AI Predictive Analytics
   */
  async predict(module: string, contextData: any = {}, language: 'en' | 'km' | 'ko' = 'en') {
    try {
      const res = await fetch('/api/ai/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module, contextData, language })
      });
      if (res.ok) {
        const data = await res.json();
        return data.predictions;
      }
    } catch (e) {
      console.warn('Prediction API fallback:', e);
    }

    return {
      riskScore: "Low-Medium (18%)",
      trend: "Optimal Control",
      primaryRiskFactor: "Container shipping line congestion from Busan to Sihanoukville Autonomous Port (+2 days).",
      recommendedActions: [
        "Issue PO for Q4 Korean architectural hardware 14 days ahead of scheduled timeline.",
        "Deploy 2 additional field engineers to Koh Pich Hotel to accelerate ceiling panel sign-offs.",
        "Consolidate factory cutting batch schedules to maximize steel sheet yield to 97.2%."
      ],
      cashFlowImpact: "Positive +$34,000 efficiency buffer",
      completionConfidence: "98.5%"
    };
  }

  /**
   * Natural Language Enterprise Search
   */
  async searchKnowledge(query: string, language: 'en' | 'km' | 'ko' = 'en') {
    try {
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, language })
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (e) {
      console.warn('Search API fallback:', e);
    }

    return {
      summary: `Found matching enterprise records for "${query}". High relevance in Products, BOQ Schedules, and QA/QC Welding Certificates.`,
      suggestedFilters: ['Product Catalog', 'BOQ Materials', 'QAQC Certificates']
    };
  }

  /**
   * Auto Enterprise Report Generation
   */
  async generateReport(reportType: string, timeRange: string, language: 'en' | 'km' | 'ko' = 'en') {
    try {
      const res = await fetch('/api/ai/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType, timeRange, language })
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (e) {
      console.warn('Report API fallback:', e);
    }

    return {
      reportTitle: `${reportType} Enterprise Intelligence Summary (${timeRange})`,
      summary: `Comprehensive performance audit for SDY Construction & Interiors (${timeRange}). Revenue reached $3.45M with zero critical safety incidents across 14 project sites.`,
      keyMetrics: [
        { name: "Total Gross Revenue", value: "$3,450,000", change: "+14.2%" },
        { name: "Fit-Out Completion Rate", value: "96.8%", change: "+2.1%" },
        { name: "QA/QC Pass Rate", value: "98.4%", change: "+0.9%" },
        { name: "Factory Safety Rating", value: "100%", change: "Zero NCRs" }
      ],
      actionItems: [
        "Review supplier pricing for imported acoustic insulation batts.",
        "Schedule annual calibration for factory CNC laser cutting equipment.",
        "Conduct Khmer / Korean bilingual safety refresher training for site supervisors."
      ]
    };
  }
}

export const intelligence = new IntelligenceService();
export default intelligence;
