import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import {
  Activity, Cpu, Database, Search, Sparkles, TrendingUp, AlertTriangle, CheckCircle2,
  FileText, Download, RefreshCw, Send, Layers, Globe, Shield, BarChart3, PieChart as PieChartIcon,
  Bot, Eye, ArrowUpRight, Filter, Settings, FileCheck, DollarSign, Users, Factory, HardHat,
  Package, Wrench, Building2, ChevronRight, Zap
} from 'lucide-react';
import { useLanguage } from './LanguageContext';
import {
  intelligence, DEFAULT_KPIS, DIGITAL_TWIN_NODES, INITIAL_KNOWLEDGE_HUB,
  KPIConfig, DigitalTwinNode, EnterpriseKnowledgeItem
} from '../services/intelligenceService';
import { jsPDF } from 'jspdf';

// Sample Recharts Datasets for the 10 Dashboards
const MONTHLY_PERFORMANCE = [
  { month: 'Jan', revenue: 280, budget: 260, qaqc: 97.5, capacity: 85 },
  { month: 'Feb', revenue: 310, budget: 290, qaqc: 98.1, capacity: 88 },
  { month: 'Mar', revenue: 340, budget: 310, qaqc: 98.0, capacity: 90 },
  { month: 'Apr', revenue: 380, budget: 330, qaqc: 98.6, capacity: 92 },
  { month: 'May', revenue: 410, budget: 350, qaqc: 98.2, capacity: 94 },
  { month: 'Jun', revenue: 450, budget: 380, qaqc: 98.8, capacity: 96 },
];

const DEPARTMENT_COSTS = [
  { name: 'Manufacturing & Steel', value: 38, color: '#0F52BA' },
  { name: 'Architectural Fit-Out', value: 28, color: '#D4AF37' },
  { name: 'Raw Material Stock', value: 18, color: '#10B981' },
  { name: 'Site Operations & Safety', value: 10, color: '#6366F1' },
  { name: 'Logistics & Equipment', value: 6, color: '#F59E0B' },
];

const RISK_PREDICTIONS = [
  { metric: 'Project Delay Risk', currentRisk: '12%', predictedRisk: '18%', status: 'Low Risk', recommendation: 'Consolidate Korean hardware order by 5 days' },
  { metric: 'Material Shortage (Steel Sheet)', currentRisk: '8%', predictedRisk: '24%', status: 'Warning', recommendation: 'Trigger pre-orders for Phase 2 galvanized sheets' },
  { metric: 'Factory Equipment Maintenance', currentRisk: '15%', predictedRisk: '35%', status: 'Attention Needed', recommendation: 'Schedule CNC Laser #01 lens replacement on Sunday' },
  { metric: 'Cash Flow Buffer Trend', currentRisk: '5%', predictedRisk: '4%', status: 'Optimal', recommendation: 'Maintain $350k working capital reserve' },
];

export default function EnterpriseIntelligencePlatform() {
  const { t, language } = useLanguage();

  // Active Main Sub-Tab
  const [activeTab, setActiveTab] = useState<
    'digital_twin' | 'bi_engine' | 'kpis' | 'predictive' | 'knowledge_hub' | 'reports' | 'copilot'
  >('digital_twin');

  // BI Engine Active Dashboard Category
  const [biCategory, setBiCategory] = useState<
    'Executive' | 'Department' | 'Project' | 'Sales' | 'Factory' | 'QAQC' | 'Inventory' | 'Finance' | 'Construction' | 'HR'
  >('Executive');

  // KPI Engine State
  const [kpiList, setKpiList] = useState<KPIConfig[]>(DEFAULT_KPIS);
  const [editingKpi, setEditingKpi] = useState<KPIConfig | null>(null);

  // Digital Twin Nodes
  const [selectedNode, setSelectedNode] = useState<DigitalTwinNode>(DIGITAL_TWIN_NODES[0]);

  // Knowledge Hub Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilterType, setSearchFilterType] = useState('All');
  const [searchResults, setSearchResults] = useState<EnterpriseKnowledgeItem[]>(INITIAL_KNOWLEDGE_HUB);
  const [searchAiSynthesis, setSearchAiSynthesis] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Predictive Analytics Selection
  const [predictModule, setPredictModule] = useState('Project Delay Risk');
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  // Reports Studio State
  const [reportType, setReportType] = useState('Executive Overview');
  const [reportTimeframe, setReportTimeframe] = useState('Monthly (Q2 2026)');
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // AI Copilot Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; timestamp: string }>>([
    {
      sender: 'ai',
      text: language === 'km'
        ? 'សួស្តី! ខ្ញុំជា AI Copilot សម្រាប់ប្រព័ន្ធប្រតិបត្តិការ enterprise SDY C&I។ ខ្ញុំអាចជួយលោកអ្នកក្នុងការវិភាគ KPI, ធ្វើរបាយការណ៍ BOQ, ពិនិត្យហានិភ័យ និងឆ្លើយសំណួរភាសាខ្មែរ ភាសាអង់គ្លេស និងភាសាកូរ៉េ។'
        : language === 'ko'
        ? '안녕하세요! SDY C&I 엔터프라이즈 AI 코파일럿입니다. KPI 분석, BOQ 요약, 위험 예측, 업무 보고서 작성 등을 한국어, 영어, 크메르어로 도와드립니다.'
        : 'Welcome to the SDY Enterprise Intelligence Platform AI Copilot. I can assist you with real-time KPI analysis, BOQ estimation summaries, predictive risk assessment, and multilingual enterprise insights in English, Khmer, and Korean.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isCopilotTyping, setIsCopilotTyping] = useState(false);

  // Handle Search Execution
  const handleExecuteSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(INITIAL_KNOWLEDGE_HUB);
      setSearchAiSynthesis(null);
      return;
    }

    setIsSearching(true);
    const filtered = INITIAL_KNOWLEDGE_HUB.filter(item => {
      const matchQuery = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.contentSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchType = searchFilterType === 'All' || item.type === searchFilterType;
      return matchQuery && matchType;
    });

    setSearchResults(filtered);

    // Get AI Synthesis via Intelligence Service
    const aiRes = await intelligence.searchKnowledge(searchQuery, language as any);
    if (aiRes && aiRes.summary) {
      setSearchAiSynthesis(aiRes.summary);
    }
    setIsSearching(false);
  };

  // Handle Predictive Assessment
  const handleRunPredictive = async () => {
    setIsPredicting(true);
    const res = await intelligence.predict(predictModule, { timestamp: new Date().toISOString() }, language as any);
    setPredictionResult(res);
    setIsPredicting(false);
  };

  // Handle Report Generation
  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    const res = await intelligence.generateReport(reportType, reportTimeframe, language as any);
    setGeneratedReport(res);
    setIsGeneratingReport(false);
  };

  // Export Report to PDF
  const handleExportReportPdf = () => {
    if (!generatedReport) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(generatedReport.reportTitle || 'SDY Enterprise Intelligence Report', 14, 22);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()} | Language: ${language.toUpperCase()}`, 14, 30);
    doc.line(14, 34, 196, 34);

    doc.setFontSize(12);
    doc.text('Executive Summary:', 14, 44);
    const splitSummary = doc.splitTextToSize(generatedReport.summary || '', 180);
    doc.text(splitSummary, 14, 52);

    let y = 52 + (splitSummary.length * 6) + 10;
    doc.text('Key Performance Highlights:', 14, y);
    y += 8;

    if (generatedReport.keyMetrics) {
      generatedReport.keyMetrics.forEach((m: any) => {
        doc.text(`- ${m.name}: ${m.value} (${m.change})`, 20, y);
        y += 7;
      });
    }

    doc.save(`SDY_Enterprise_Report_${Date.now()}.pdf`);
  };

  // Handle AI Copilot Message
  const handleSendCopilotMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    const userMsg = {
      sender: 'user' as const,
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsCopilotTyping(true);

    const reply = await intelligence.askCopilot(userText, undefined, language as any);

    const aiMsg = {
      sender: 'ai' as const,
      text: reply || 'I am ready to assist with your enterprise operations.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, aiMsg]);
    setIsCopilotTyping(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Enterprise Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-[#0F52BA] via-[#0A3D8F] to-[#082B66] text-white rounded-3xl shadow-xl border border-white/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-accent/20 text-accent border border-accent/30 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {t('eip.badge', 'Enterprise Intelligence Platform (EIP)')}
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-bold">
                🇰🇭 KM / 🇺🇸 EN / 🇰🇷 KO Enabled
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {t('eip.title', 'SDY C&I Digital Operating System Intelligence Hub')}
            </h1>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              {t('eip.subtitle', 'Real-time Business Intelligence, 10 Operational Dashboards, Digital Twin Telemetry, Predictive Risk Engine, and Multilingual AI Copilot.')}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('copilot')}
              className="px-5 py-3 bg-accent hover:bg-accent/90 text-dark font-bold text-xs rounded-2xl shadow-lg cursor-pointer transition-all flex items-center gap-2"
            >
              <Bot className="w-4 h-4" />
              {t('eip.summon_copilot', 'Summon AI Copilot')}
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 mt-8 overflow-x-auto pb-1 border-t border-white/10 pt-4 scrollbar-none">
          {[
            { id: 'digital_twin', label: t('eip.tab.digital_twin', 'Digital Twin Topology'), icon: Activity },
            { id: 'bi_engine', label: t('eip.tab.bi_engine', 'BI & 10 Dashboards'), icon: BarChart3 },
            { id: 'kpis', label: t('eip.tab.kpis', 'Real-Time KPI Engine'), icon: TrendingUp },
            { id: 'predictive', label: t('eip.tab.predictive', 'Predictive & Risk AI'), icon: AlertTriangle },
            { id: 'knowledge_hub', label: t('eip.tab.knowledge_hub', 'Knowledge Hub & Search'), icon: Database },
            { id: 'reports', label: t('eip.tab.reports', 'Report Studio'), icon: FileText },
            { id: 'copilot', label: t('eip.tab.copilot', 'Multilingual AI Copilot'), icon: Bot },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-white text-dark shadow-md scale-102'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. DIGITAL TWIN TOPOLOGY VIEW */}
      {/* ========================================================= */}
      {activeTab === 'digital_twin' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 bg-white dark:bg-[#101828] rounded-3xl border border-black/5 dark:border-white/10 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-dark dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                SDY C&I Digital Twin Enterprise Topology
              </h2>
              <p className="text-xs text-dark/60 dark:text-white/60 mt-1">
                A live digital representation of company organizational units, production lines, inventory hubs, active fit-out projects, and equipment telemetry.
              </p>
            </div>
            <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              100% System Synchronization Active
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Interactive Node Network Diagram */}
            <div className="lg:col-span-2 p-6 bg-white dark:bg-[#101828] rounded-3xl border border-black/5 dark:border-white/10 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-dark dark:text-white uppercase tracking-wider flex items-center justify-between">
                <span>Enterprise Node Structure</span>
                <span className="text-xs text-dark/40 dark:text-white/40 font-normal">Click node to inspect telemetry</span>
              </h3>

              <div className="p-8 bg-[#0B1221] rounded-2xl border border-white/10 min-h-[380px] flex flex-col justify-between relative overflow-hidden">
                {/* Central Parent Node */}
                <div className="flex justify-center">
                  <button
                    onClick={() => setSelectedNode(DIGITAL_TWIN_NODES[0])}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer text-center max-w-xs w-full shadow-lg ${
                      selectedNode.id === DIGITAL_TWIN_NODES[0].id
                        ? 'bg-primary text-white border-accent ring-4 ring-accent/30'
                        : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                    }`}
                  >
                    <Building2 className="w-6 h-6 mx-auto mb-1 text-accent" />
                    <p className="font-extrabold text-sm">{DIGITAL_TWIN_NODES[0].name}</p>
                    <p className="text-[10px] text-white/70">{DIGITAL_TWIN_NODES[0].metric}</p>
                  </button>
                </div>

                <div className="w-0.5 h-8 bg-gradient-to-b from-accent to-primary/50 mx-auto" />

                {/* Sub-Level Nodes */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {DIGITAL_TWIN_NODES.slice(1, 5).map(node => (
                    <button
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedNode.id === node.id
                          ? 'bg-primary/90 text-white border-accent ring-2 ring-accent'
                          : 'bg-white/5 text-white/90 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] px-2 py-0.5 bg-white/10 rounded-md font-mono text-accent">{node.type}</span>
                        <span className={`w-2 h-2 rounded-full ${node.healthScore > 90 ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      </div>
                      <p className="font-bold text-xs truncate">{node.name}</p>
                      <p className="text-[10px] text-white/60 font-mono mt-1">{node.metric}</p>
                    </button>
                  ))}
                </div>

                {/* Equipment Level */}
                <div className="pt-4 border-t border-white/10 flex justify-center gap-4">
                  {DIGITAL_TWIN_NODES.slice(5).map(eq => (
                    <button
                      key={eq.id}
                      onClick={() => setSelectedNode(eq)}
                      className={`px-3 py-2 rounded-xl text-xs font-mono border cursor-pointer transition-all ${
                        selectedNode.id === eq.id
                          ? 'bg-accent text-dark font-bold border-white'
                          : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      ⚙️ {eq.name} ({eq.status})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Node Telemetry Inspector */}
            <div className="p-6 bg-white dark:bg-[#101828] rounded-3xl border border-black/5 dark:border-white/10 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
                  <span className="text-xs font-bold text-primary dark:text-accent uppercase tracking-wider">Node Telemetry</span>
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-bold">
                    Health Score: {selectedNode.healthScore}%
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-dark dark:text-white">{selectedNode.name}</h3>
                  <p className="text-xs text-dark/60 dark:text-white/60">Type: <span className="font-semibold text-dark dark:text-white">{selectedNode.type}</span></p>
                </div>

                <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-dark/60 dark:text-white/60">Status:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedNode.status}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-dark/60 dark:text-white/60">Key Operational Metric:</span>
                    <span className="font-bold text-dark dark:text-white">{selectedNode.metric}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-dark/60 dark:text-white/60">AI Telemetry Confidence:</span>
                    <span className="font-bold text-primary dark:text-accent">99.4%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-dark dark:text-white">Live Health Diagnostics:</p>
                  <div className="w-full bg-black/10 dark:bg-white/10 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary to-emerald-500 h-full transition-all duration-500"
                      style={{ width: `${selectedNode.healthScore}%` }}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('copilot')}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-2xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <Bot className="w-4 h-4" />
                Query Node with AI Copilot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. BUSINESS INTELLIGENCE & 10 ROLE DASHBOARDS */}
      {/* ========================================================= */}
      {activeTab === 'bi_engine' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Dashboard Selector Tabs */}
          <div className="p-4 bg-white dark:bg-[#101828] rounded-3xl border border-black/5 dark:border-white/10 shadow-sm flex items-center gap-2 overflow-x-auto scrollbar-none">
            {[
              { id: 'Executive', label: 'Executive' },
              { id: 'Department', label: 'Departments' },
              { id: 'Project', label: 'Projects' },
              { id: 'Sales', label: 'Sales & Tenders' },
              { id: 'Factory', label: 'Factory & Millwork' },
              { id: 'QAQC', label: 'QA / QC Quality' },
              { id: 'Inventory', label: 'Inventory' },
              { id: 'Finance', label: 'Finance & Costs' },
              { id: 'Construction', label: 'Construction' },
              { id: 'HR', label: 'HR & Workforce' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setBiCategory(cat.id as any)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                  biCategory === cat.id
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-black/5 dark:bg-white/5 text-dark/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/10'
                }`}
              >
                {cat.label} Dashboard
              </button>
            ))}
          </div>

          {/* Role Dashboard Main Cards & Recharts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue & Operational Trend Chart */}
            <div className="lg:col-span-2 p-6 bg-white dark:bg-[#101828] rounded-3xl border border-black/5 dark:border-white/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-dark dark:text-white">{biCategory} Intelligence Analytics</h3>
                  <p className="text-xs text-dark/60 dark:text-white/60">Revenue growth, budget tracking, and capacity metrics ($k USD)</p>
                </div>
                <span className="px-3 py-1 bg-primary/10 text-primary dark:text-accent font-mono text-xs font-bold rounded-xl">
                  Recharts Visual Engine
                </span>
              </div>

              <div className="h-[300px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MONTHLY_PERFORMANCE}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0F52BA" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#0F52BA" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorBud" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="month" stroke="#888888" fontSize={12} />
                    <YAxis stroke="#888888" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#101828', borderRadius: '12px', borderColor: '#333', color: '#fff' }} />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" stroke="#0F52BA" fillOpacity={1} fill="url(#colorRev)" name="Actual Revenue ($k)" />
                    <Area type="monotone" dataKey="budget" stroke="#D4AF37" fillOpacity={1} fill="url(#colorBud)" name="Target Budget ($k)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Department Cost Distribution Breakdown */}
            <div className="p-6 bg-white dark:bg-[#101828] rounded-3xl border border-black/5 dark:border-white/10 shadow-sm space-y-4">
              <div>
                <h3 className="text-lg font-bold text-dark dark:text-white">Capital & Resource Allocation</h3>
                <p className="text-xs text-dark/60 dark:text-white/60">Share across key operating departments</p>
              </div>

              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={DEPARTMENT_COSTS} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5}>
                      {DEPARTMENT_COSTS.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#101828', borderRadius: '12px', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5">
                {DEPARTMENT_COSTS.map(item => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-dark/80 dark:text-white/80">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                    <span className="font-bold text-dark dark:text-white">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. REAL-TIME KPI ENGINE */}
      {/* ========================================================= */}
      {activeTab === 'kpis' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 bg-white dark:bg-[#101828] rounded-3xl border border-black/5 dark:border-white/10 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-dark dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Real-Time Enterprise KPI Management Engine
              </h2>
              <p className="text-xs text-dark/60 dark:text-white/60 mt-1">
                Visually configured Key Performance Indicators with automated trend forecasts, target threshold alerts, and status badges.
              </p>
            </div>

            <button
              onClick={() => alert('New KPI form generated in Metadata Engine.')}
              className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-2xl text-xs font-bold shadow-md cursor-pointer transition-all"
            >
              + Define Custom KPI
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {kpiList.map(kpi => (
              <div
                key={kpi.id}
                className="p-5 bg-white dark:bg-[#101828] rounded-3xl border border-black/5 dark:border-white/10 shadow-sm space-y-4 hover:border-primary/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-black/5 dark:bg-white/5 text-dark/60 dark:text-white/60 font-mono text-[10px] font-bold rounded-lg uppercase">
                    {kpi.category}
                  </span>
                  <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {kpi.status.toUpperCase()}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-semibold text-dark/60 dark:text-white/60">{kpi.name}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-2xl font-black text-dark dark:text-white">{kpi.currentValue}</p>
                    <span className="text-xs font-bold text-emerald-500 flex items-center">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      {kpi.changePercent}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-black/5 dark:bg-white/5 rounded-2xl space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-dark/50 dark:text-white/50">Target Goal:</span>
                    <span className="font-bold text-dark dark:text-white">{kpi.targetValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark/50 dark:text-white/50">AI Forecast:</span>
                    <span className="font-bold text-primary dark:text-accent">{kpi.forecast}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark/50 dark:text-white/50">Alert Threshold:</span>
                    <span className="font-mono text-[10px] text-amber-500">{kpi.thresholdAlert}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. PREDICTIVE ANALYTICS & DECISION SUPPORT SYSTEM */}
      {/* ========================================================= */}
      {activeTab === 'predictive' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 bg-white dark:bg-[#101828] rounded-3xl border border-black/5 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-dark dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  AI Predictive Analytics & Executive Decision Support
                </h2>
                <p className="text-xs text-dark/60 dark:text-white/60 mt-1">
                  Predict project delay risks, material shortages, inventory reorders, sales forecasts, budget overruns, and cash flow trends.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={predictModule}
                  onChange={(e) => setPredictModule(e.target.value)}
                  className="px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs font-bold text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Project Delay Risk">Project Delay Risk</option>
                  <option value="Material Shortage & Lead Times">Material Shortages</option>
                  <option value="Inventory Reorder Points">Inventory Reorders</option>
                  <option value="Budget Overrun & Cost Variance">Budget Overruns</option>
                  <option value="Equipment Maintenance Schedule">Equipment Maintenance</option>
                  <option value="Cash Flow Trend">Cash Flow Trend</option>
                </select>

                <button
                  onClick={handleRunPredictive}
                  disabled={isPredicting}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-2xl shadow-md cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isPredicting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-accent" />}
                  Run Predictive AI Audit
                </button>
              </div>
            </div>

            {/* Prediction Output Card */}
            {predictionResult && (
              <div className="p-6 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                  <span className="font-extrabold text-sm text-primary dark:text-accent">
                    AI Prediction: {predictModule}
                  </span>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded-full">
                    Confidence: {predictionResult.completionConfidence || '98.5%'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-white dark:bg-[#101828] rounded-xl border border-black/5 dark:border-white/10">
                    <span className="text-dark/50 dark:text-white/50">Calculated Risk Score:</span>
                    <p className="text-base font-bold text-amber-500 mt-0.5">{predictionResult.riskScore}</p>
                  </div>
                  <div className="p-3 bg-white dark:bg-[#101828] rounded-xl border border-black/5 dark:border-white/10">
                    <span className="text-dark/50 dark:text-white/50">Primary Risk Factor:</span>
                    <p className="font-semibold text-dark dark:text-white mt-0.5">{predictionResult.primaryRiskFactor}</p>
                  </div>
                  <div className="p-3 bg-white dark:bg-[#101828] rounded-xl border border-black/5 dark:border-white/10">
                    <span className="text-dark/50 dark:text-white/50">Cash Flow Impact:</span>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{predictionResult.cashFlowImpact}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-dark dark:text-white">AI Recommended Action Strategy:</p>
                  <ul className="space-y-1.5 text-xs text-dark/80 dark:text-white/80">
                    {predictionResult.recommendedActions?.map((act: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Active Risk Radar Table */}
          <div className="p-6 bg-white dark:bg-[#101828] rounded-3xl border border-black/5 dark:border-white/10 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-dark dark:text-white uppercase tracking-wider">
              Active Enterprise Risk Radar & Recommendations
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-dark dark:text-white">
                <thead className="bg-black/5 dark:bg-white/5 font-bold uppercase text-[10px] text-dark/60 dark:text-white/60">
                  <tr>
                    <th className="p-3 rounded-l-xl">Operational Metric</th>
                    <th className="p-3">Current Risk</th>
                    <th className="p-3">Predicted Risk</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 rounded-r-xl">AI Decision Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5 font-medium">
                  {RISK_PREDICTIONS.map((row, idx) => (
                    <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="p-3 font-bold">{row.metric}</td>
                      <td className="p-3 font-mono">{row.currentRisk}</td>
                      <td className="p-3 font-mono text-amber-500 font-bold">{row.predictedRisk}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-md font-bold text-[10px]">
                          {row.status}
                        </span>
                      </td>
                      <td className="p-3 text-dark/80 dark:text-white/80">{row.recommendation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. ENTERPRISE KNOWLEDGE HUB & ADVANCED SEARCH */}
      {/* ========================================================= */}
      {activeTab === 'knowledge_hub' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Search Header */}
          <div className="p-6 bg-white dark:bg-[#101828] rounded-3xl border border-black/5 dark:border-white/10 shadow-sm space-y-4">
            <div>
              <h2 className="text-xl font-bold text-dark dark:text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Enterprise Knowledge Hub & Multilingual Natural Language Search
              </h2>
              <p className="text-xs text-dark/60 dark:text-white/60 mt-1">
                Index all Products, Projects, BOQs, Drawings, QA/QC Reports, Contracts, Invoices, and Specifications. Search seamlessly in English, Khmer, or Korean.
              </p>
            </div>

            <form onSubmit={handleExecuteSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-dark/40 dark:text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ask or search enterprise knowledge (e.g. 'fire rated door BS 476 specification', 'Vattanac BOQ')..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl text-xs text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <select
                value={searchFilterType}
                onChange={(e) => setSearchFilterType(e.target.value)}
                className="px-4 py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl text-xs font-bold text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="All">All Types</option>
                <option value="Product">Products</option>
                <option value="Project">Projects</option>
                <option value="BOQ">BOQs</option>
                <option value="QAQC">QAQC Standards</option>
              </select>

              <button
                type="submit"
                disabled={isSearching}
                className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-2xl text-xs font-bold shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Search
              </button>
            </form>

            {searchAiSynthesis && (
              <div className="p-4 bg-accent/10 border border-accent/30 rounded-2xl text-xs space-y-1">
                <span className="font-bold text-accent uppercase tracking-wider">AI Knowledge Synthesis:</span>
                <p className="text-dark/90 dark:text-white/90 leading-relaxed">{searchAiSynthesis}</p>
              </div>
            )}
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.map(item => (
              <div
                key={item.id}
                className="p-5 bg-white dark:bg-[#101828] rounded-3xl border border-black/5 dark:border-white/10 shadow-sm space-y-3 hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 bg-primary/10 text-primary dark:text-accent font-mono text-[10px] font-bold rounded-md">
                      {item.type}
                    </span>
                    <span className="text-[10px] text-dark/40 dark:text-white/40">{item.department}</span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-dark dark:text-white">{item.title}</h3>
                    {item.subtitle && <p className="text-xs text-primary dark:text-accent font-medium mt-0.5">{item.subtitle}</p>}
                  </div>

                  <p className="text-xs text-dark/70 dark:text-white/70 leading-relaxed line-clamp-3">
                    {item.contentSummary}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-1 flex-wrap">
                    {item.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-black/5 dark:bg-white/5 text-dark/50 dark:text-white/50 text-[9px] rounded-md font-mono">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('copilot');
                      setChatInput(`Tell me more about knowledge item: ${item.title}`);
                    }}
                    className="text-[10px] font-bold text-primary dark:text-accent hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Ask AI <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. ENTERPRISE REPORT STUDIO */}
      {/* ========================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 bg-white dark:bg-[#101828] rounded-3xl border border-black/5 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-dark dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Automated Enterprise Report Studio
                </h2>
                <p className="text-xs text-dark/60 dark:text-white/60 mt-1">
                  Generate executive summaries, weekly operational logs, financial audits, and QA/QC compliance reports with instant PDF/CSV export in English, Khmer, or Korean.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs font-bold text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Executive Overview">Executive Overview</option>
                  <option value="Financial & Cost Variance">Financial Audit</option>
                  <option value="Fit-Out Projects & BOQ">Projects & BOQ Report</option>
                  <option value="QA/QC & Safety Inspection">QA/QC & Safety Compliance</option>
                  <option value="Inventory & Procurement">Inventory & Supply Chain</option>
                </select>

                <button
                  onClick={handleGenerateReport}
                  disabled={isGeneratingReport}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-2xl shadow-md cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isGeneratingReport ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
                  Compile Report
                </button>
              </div>
            </div>

            {/* Generated Report Card View */}
            {generatedReport && (
              <div className="p-6 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/10 dark:border-white/10 space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
                  <div>
                    <h3 className="text-lg font-black text-dark dark:text-white">{generatedReport.reportTitle}</h3>
                    <p className="text-xs text-dark/60 dark:text-white/60">Language: <span className="font-bold text-primary">{language.toUpperCase()}</span></p>
                  </div>

                  <button
                    onClick={handleExportReportPdf}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export PDF
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-dark dark:text-white uppercase tracking-wider">Executive Summary:</p>
                  <p className="text-xs text-dark/80 dark:text-white/80 leading-relaxed bg-white dark:bg-[#101828] p-4 rounded-xl border border-black/5 dark:border-white/10">
                    {generatedReport.summary || generatedReport.content}
                  </p>
                </div>

                {generatedReport.keyMetrics && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {generatedReport.keyMetrics.map((m: any, idx: number) => (
                      <div key={idx} className="p-3 bg-white dark:bg-[#101828] rounded-xl border border-black/5 dark:border-white/10 text-center">
                        <p className="text-[10px] text-dark/50 dark:text-white/50 font-semibold">{m.name}</p>
                        <p className="text-lg font-black text-dark dark:text-white mt-0.5">{m.value}</p>
                        <span className="text-[10px] font-bold text-emerald-500">{m.change}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. MULTILINGUAL AI COPILOT INTERACTIVE ASSISTANT */}
      {/* ========================================================= */}
      {activeTab === 'copilot' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 bg-white dark:bg-[#101828] rounded-3xl border border-black/5 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
              <div className="flex items-center gap-3">
                <span className="p-3 rounded-2xl bg-primary/10 text-primary dark:text-accent">
                  <Bot className="w-6 h-6" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-dark dark:text-white">SDY Enterprise Multilingual AI Copilot</h2>
                  <p className="text-xs text-dark/60 dark:text-white/60">
                    Supports 🇰🇭 Khmer, 🇺🇸 English, and 🇰🇷 Korean. Ask questions, draft quotations, generate BOQ summaries, or summarize technical specs.
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full">
                Gemini 3.6 Flash Active
              </span>
            </div>

            {/* Chat Conversation History */}
            <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl min-h-[380px] max-h-[500px] overflow-y-auto space-y-4">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed space-y-1 shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-white dark:bg-[#101828] text-dark dark:text-white border border-black/5 dark:border-white/10 rounded-bl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] opacity-70 mb-1">
                      <span className="font-bold">{msg.sender === 'user' ? 'You' : 'SDY AI Copilot'}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}

              {isCopilotTyping && (
                <div className="flex justify-start">
                  <div className="p-4 bg-white dark:bg-[#101828] rounded-2xl text-xs text-dark/60 dark:text-white/60 flex items-center gap-2 border border-black/5 dark:border-white/10">
                    <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                    SDY Copilot is analyzing enterprise data...
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[10px] font-bold text-dark/40 dark:text-white/40 uppercase">Prompts:</span>
              {[
                'Summarize fire door BOQ specifications',
                'Explain current QA/QC pass rate KPI',
                'Draft a quotation response for Vattanac Tower',
                'ភាសាខ្មែរ: សូមសង្ខេបគម្រោង NagaWorld',
                '한국어: 현장 품질 검사 보고서 작성'
              ].map((promptText, idx) => (
                <button
                  key={idx}
                  onClick={() => setChatInput(promptText)}
                  className="px-3 py-1 bg-black/5 dark:bg-white/5 hover:bg-primary/10 text-dark/70 dark:text-white/70 hover:text-primary rounded-xl text-[11px] font-medium whitespace-nowrap cursor-pointer transition-all border border-black/5 dark:border-white/5 shrink-0"
                >
                  {promptText}
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendCopilotMessage} className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Ask AI Copilot in English, Khmer (ភាសាខ្មែរ), or Korean (한국어)..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-4 py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl text-xs text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <button
                type="submit"
                disabled={isCopilotTyping || !chatInput.trim()}
                className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-2xl shadow-md cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
