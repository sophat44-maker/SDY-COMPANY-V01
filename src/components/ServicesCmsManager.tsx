import React, { useState, useEffect } from 'react';
import { useServicesPage, defaultServicesPageData } from './ServicesContext';
import { useLanguage } from './LanguageContext';
import { ServicesPageData, ServiceCardItem, TrilingualText } from '../types';
import {
  Wrench,
  Save,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Eye,
  RotateCcw,
  Sparkles,
  Layers,
  LayoutGrid,
  Hammer,
  Sofa,
  Compass,
  DoorClosed,
  Shield,
  Flame,
  Grid,
  Building2,
  ShoppingBag,
  Utensils,
  Landmark,
  Bed,
  Home,
  Building,
  ChevronRight,
  Cpu,
  CheckCircle2,
  Globe,
  Tag,
  FileText,
  Download,
  Upload
} from 'lucide-react';

export type LanguageCode = 'km' | 'en' | 'ko';

const AVAILABLE_ICONS = [
  { name: 'LayoutGrid', label: 'Layout Grid', icon: LayoutGrid },
  { name: 'Hammer', label: 'Hammer & Renovation', icon: Hammer },
  { name: 'Sofa', label: 'Sofa & Furniture', icon: Sofa },
  { name: 'Compass', label: 'Compass & Architectural', icon: Compass },
  { name: 'DoorClosed', label: 'Door & Millwork', icon: DoorClosed },
  { name: 'Shield', label: 'Shield & Security', icon: Shield },
  { name: 'Flame', label: 'Flame & Fire Rated', icon: Flame },
  { name: 'Grid', label: 'Grid Partition', icon: Grid },
  { name: 'Wrench', label: 'Wrench & Technical', icon: Wrench },
  { name: 'Layers', label: 'Layers & Facade', icon: Layers },
  { name: 'Building2', label: 'Building & Sector', icon: Building2 },
  { name: 'ShoppingBag', label: 'Shopping & Retail', icon: ShoppingBag },
  { name: 'Utensils', label: 'Utensils & Restaurant', icon: Utensils },
  { name: 'Landmark', label: 'Landmark & Institutional', icon: Landmark },
  { name: 'Bed', label: 'Bed & Hotel Hospitality', icon: Bed },
  { name: 'Home', label: 'Home & Residential', icon: Home },
  { name: 'Building', label: 'Building Structure', icon: Building },
  { name: 'Cpu', label: 'Cpu & Hi-Tech Systems', icon: Cpu }
];

const RenderIcon = ({ name, className }: { name: string; className?: string }) => {
  const match = AVAILABLE_ICONS.find(i => i.name === name);
  if (match) {
    const IconComp = match.icon;
    return <IconComp className={className} />;
  }
  return <Cpu className={className} />;
};

export default function ServicesCmsManager() {
  const { servicesPageData, updateServicesPageData, resetServicesPageData, isSyncing } = useServicesPage();
  const { language, setLanguage, t } = useLanguage();
  const [formData, setFormData] = useState<ServicesPageData>(servicesPageData);
  const [activeLang, setActiveLang] = useState<LanguageCode>('en');
  const [activeTab, setActiveTab] = useState<'header' | 'categories' | 'services' | 'preview'>('services');
  const [saveToast, setSaveToast] = useState(false);
  const [syncMessage, setSyncMessage] = useState('Synced to Google Sheets Cloud Successfully');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [previewLang, setPreviewLang] = useState<LanguageCode>('en');
  const [previewCategory, setPreviewCategory] = useState<string>('All');
  const [newCatInput, setNewCatInput] = useState<string>('');

  useEffect(() => {
    if (language === 'km' || language === 'en' || language === 'ko') {
      setActiveLang(language as LanguageCode);
    }
  }, [language]);

  useEffect(() => {
    setFormData(servicesPageData);
  }, [servicesPageData]);

  const handleSave = async () => {
    const res = await updateServicesPageData(formData);
    setSyncMessage(res.message || 'Synced to Google Sheets Cloud Successfully');
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 4500);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all Services page content to default values? Any unsaved edits will be lost.')) {
      resetServicesPageData();
      setFormData(defaultServicesPageData);
    }
  };

  // Trilingual Header handlers
  const updateHeaderTitle = (val: string) => {
    setFormData(prev => ({
      ...prev,
      header: {
        ...prev.header,
        title: {
          ...prev.header.title,
          [activeLang]: val
        }
      }
    }));
  };

  const updateHeaderSubtitle = (val: string) => {
    setFormData(prev => ({
      ...prev,
      header: {
        ...prev.header,
        subtitle: {
          ...prev.header.subtitle,
          [activeLang]: val
        }
      }
    }));
  };

  // Category Tag handlers
  const handleAddCategory = () => {
    const trimmed = newCatInput.trim();
    if (!trimmed) return;
    if (formData.categories.includes(trimmed)) {
      alert('Category already exists.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      categories: [...prev.categories, trimmed]
    }));
    setNewCatInput('');
  };

  const handleDeleteCategory = (catToDelete: string) => {
    if (catToDelete === 'All') {
      alert('The "All" category filter cannot be removed.');
      return;
    }
    if (window.confirm(`Delete category "${catToDelete}"? Services assigned to this tag will keep their tag until reassigned.`)) {
      setFormData(prev => ({
        ...prev,
        categories: prev.categories.filter(c => c !== catToDelete)
      }));
    }
  };

  const handleMoveCategory = (index: number, direction: 'up' | 'down') => {
    const nextCategories = [...formData.categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= nextCategories.length) return;
    const temp = nextCategories[index];
    nextCategories[index] = nextCategories[targetIndex];
    nextCategories[targetIndex] = temp;
    setFormData(prev => ({ ...prev, categories: nextCategories }));
  };

  // Service Item Card handlers
  const handleAddService = () => {
    const newService: ServiceCardItem = {
      id: 'srv_' + Math.random().toString(36).substring(2, 8),
      category_tag: formData.categories[1] || 'Design & Fit-Out',
      icon_type: 'Wrench',
      title: {
        en: 'New Custom Engineering Service',
        km: 'សេវាកម្មវិស្វកម្មថ្មី',
        ko: '새로운 맞춤형 엔지니어링 서비스'
      },
      description: {
        en: 'High quality manufacturing and installation tailored to project requirements.',
        km: 'ការផលិត និងដំឡើងប្រកបដោយគុណភាពខ្ពស់ឆ្លើយតបតាមតម្រូវការគម្រោង។',
        ko: '프로젝트 요구 사항에 맞춘 고품질 제조 및 시공.'
      },
      action_text: {
        en: 'Inquire Division >',
        km: 'សាកសួរព័ត៌មានផ្នែក >',
        ko: '부서 문의하기 >'
      }
    };
    setFormData(prev => ({
      ...prev,
      services_list: [newService, ...prev.services_list]
    }));
  };

  const handleDuplicateService = (index: number) => {
    const original = formData.services_list[index];
    const dup: ServiceCardItem = {
      ...JSON.parse(JSON.stringify(original)),
      id: 'srv_' + Math.random().toString(36).substring(2, 8),
      title: {
        en: `${original.title.en} (Copy)`,
        km: `${original.title.km} (ចម្លង)`,
        ko: `${original.title.ko} (사본)`
      }
    };
    setFormData(prev => {
      const copy = [...prev.services_list];
      copy.splice(index + 1, 0, dup);
      return { ...prev, services_list: copy };
    });
  };

  const handleDeleteService = (id: string) => {
    if (window.confirm('Are you sure you want to delete this service item card?')) {
      setFormData(prev => ({
        ...prev,
        services_list: prev.services_list.filter(s => s.id !== id)
      }));
    }
  };

  const handleMoveService = (index: number, direction: 'up' | 'down') => {
    const nextList = [...formData.services_list];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= nextList.length) return;
    const temp = nextList[index];
    nextList[index] = nextList[targetIndex];
    nextList[targetIndex] = temp;
    setFormData(prev => ({ ...prev, services_list: nextList }));
  };

  const updateServiceCardField = (
    index: number,
    field: 'category_tag' | 'icon_type',
    value: string
  ) => {
    setFormData(prev => {
      const copy = [...prev.services_list];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, services_list: copy };
    });
  };

  const updateServiceCardTrilingualField = (
    index: number,
    field: 'title' | 'description' | 'action_text',
    value: string
  ) => {
    setFormData(prev => {
      const copy = [...prev.services_list];
      copy[index] = {
        ...copy[index],
        [field]: {
          ...copy[index][field],
          [activeLang]: value
        }
      };
      return { ...prev, services_list: copy };
    });
  };

  // Import / Export JSON
  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(formData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SDY_ServicesPage_CMS_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.header && Array.isArray(parsed.services_list)) {
          setFormData(parsed);
          alert('Services Page CMS configuration successfully imported!');
        } else {
          alert('Invalid JSON structure for Services Page CMS.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const filteredServicesList = formData.services_list.filter(item => {
    if (filterCategory === 'All') return true;
    return item.category_tag === filterCategory;
  });

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100">
      
      {/* Top Header Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#003366] to-[#004b93] text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
            <Wrench className="w-6 h-6 text-amber-300 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-wide flex items-center gap-2">
              Services Page CMS Manager
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-400 text-black font-extrabold uppercase">
                Trilingual (3L)
              </span>
            </h2>
            <p className="text-xs text-blue-100">
              Manage page headers, category filter tags, and service card items across KM, EN, and KO.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportJson}
            title="Backup JSON"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold transition-all"
          >
            <Download className="w-3.5 h-3.5 text-blue-200" /> Export JSON
          </button>
          
          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold transition-all cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-blue-200" /> Import JSON
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-xs font-bold text-red-100 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Default
          </button>

          <button
            onClick={handleSave}
            disabled={isSyncing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:bg-amber-200 text-black text-xs font-black uppercase tracking-wider transition-all shadow-lg hover:scale-105 active:scale-95"
          >
            <Save className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} /> {isSyncing ? 'SYNCING...' : t('admin.save_changes', 'SAVE CHANGES')}
          </button>
        </div>
      </div>

      {/* Floating Save Toast */}
      {saveToast && (
        <div className="fixed bottom-10 right-10 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center gap-3 animate-bounce border border-emerald-400">
          <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider">Synced to Google Sheets Cloud Successfully</p>
            <p className="text-[11px] text-emerald-100">{syncMessage}</p>
          </div>
        </div>
      )}

      {/* Primary Section Switcher & Language Toggles */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm">
        
        {/* Navigation Section Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveTab('services')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'services'
                ? 'bg-[#004b93] text-white shadow-md'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            <Wrench className="w-4 h-4" /> Service Cards ({formData.services_list.length})
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'categories'
                ? 'bg-[#004b93] text-white shadow-md'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            <Tag className="w-4 h-4" /> Filter Categories ({formData.categories.length})
          </button>

          <button
            onClick={() => setActiveTab('header')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'header'
                ? 'bg-[#004b93] text-white shadow-md'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            <FileText className="w-4 h-4" /> Header Content
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'preview'
                ? 'bg-amber-500 text-black shadow-md'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            <Eye className="w-4 h-4" /> {t('admin.live_preview', 'Live Interactive Preview')}
          </button>
        </div>

        {/* Global Trilingual Language Switcher for Form Fields */}
        {activeTab !== 'categories' && activeTab !== 'preview' && (
          <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-slate-800 p-1.5 rounded-xl border border-black/10 dark:border-white/10 shrink-0">
            <span className="text-[10px] font-black uppercase text-gray-500 px-2 flex items-center gap-1">
              <Globe className="w-3 h-3" /> {t('admin.active_editing_lang', 'Edit Lang:')}
            </span>
            <button
              onClick={() => { setActiveLang('km'); setLanguage('km'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                activeLang === 'km' ? 'bg-[#004b93] text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              <span>🇰🇭</span> Khmer (KM)
            </button>
            <button
              onClick={() => { setActiveLang('en'); setLanguage('en'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                activeLang === 'en' ? 'bg-[#004b93] text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              <span>🇬🇧</span> English (EN)
            </button>
            <button
              onClick={() => { setActiveLang('ko'); setLanguage('ko'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                activeLang === 'ko' ? 'bg-[#004b93] text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              <span>🇰🇷</span> Korean (KO)
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: HEADER CONTENT */}
      {activeTab === 'header' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
            <div>
              <h3 className="text-base font-extrabold flex items-center gap-2">
                Services Page Hero / Main Header
                <span className="text-xs font-bold text-amber-500 uppercase">[{activeLang.toUpperCase()}]</span>
              </h3>
              <p className="text-xs text-gray-500">Edit page title and banner description shown at the top of the Services section.</p>
            </div>
          </div>

          <div className="space-y-4 max-w-4xl">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase block text-gray-700 dark:text-gray-300">
                Main Title ({activeLang.toUpperCase()})
              </label>
              <input
                type="text"
                value={formData.header.title[activeLang] || ''}
                onChange={e => updateHeaderTitle(e.target.value)}
                placeholder="e.g. Our Core Industrial Capabilities"
                className="w-full p-3 text-sm rounded-xl bg-gray-50 dark:bg-slate-800 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#004b93] font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase block text-gray-700 dark:text-gray-300">
                Main Subtitle / Description ({activeLang.toUpperCase()})
              </label>
              <textarea
                rows={3}
                value={formData.header.subtitle[activeLang] || ''}
                onChange={e => updateHeaderSubtitle(e.target.value)}
                placeholder="e.g. We operate multiple modern manufacturing lines across Cambodia..."
                className="w-full p-3 text-sm rounded-xl bg-gray-50 dark:bg-slate-800 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#004b93]"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORY TAGS */}
      {activeTab === 'categories' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
            <div>
              <h3 className="text-base font-extrabold flex items-center gap-2">
                Dynamic Category Tags
              </h3>
              <p className="text-xs text-gray-500">Categories used to filter service cards on the public Services page.</p>
            </div>
          </div>

          {/* Add New Category Control */}
          <div className="flex items-center gap-2 max-w-md">
            <input
              type="text"
              placeholder="e.g., Decorative Glass"
              value={newCatInput}
              onChange={e => setNewCatInput(e.target.value)}
              className="flex-1 p-2.5 text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#004b93]"
            />
            <button
              onClick={handleAddCategory}
              className="px-4 py-2.5 bg-[#004b93] hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Tag
            </button>
          </div>

          {/* Category List Table */}
          <div className="space-y-2 max-w-2xl">
            {formData.categories.map((cat, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-black/5 dark:border-white/5"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-300 text-xs font-black flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-bold">{cat}</span>
                  {cat === 'All' && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 font-extrabold">
                      Default All
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMoveCategory(idx, 'up')}
                    className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 disabled:opacity-30"
                    title="Move Up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    disabled={idx === formData.categories.length - 1}
                    onClick={() => handleMoveCategory(idx, 'down')}
                    className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 disabled:opacity-30"
                    title="Move Down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {cat !== 'All' && (
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-500"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SERVICE CARDS MANAGER */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          
          {/* Controls & Category Filter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm">
            
            <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
              <span className="text-xs font-bold text-gray-500 uppercase shrink-0">Filter:</span>
              {formData.categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilterCategory(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                    filterCategory === c
                      ? 'bg-[#004b93] text-white shadow'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <button
              onClick={handleAddService}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase rounded-xl flex items-center gap-1.5 shadow shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Service Card
            </button>
          </div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredServicesList.map((service, idx) => {
              const actualIndex = formData.services_list.findIndex(s => s.id === service.id);
              return (
                <div
                  key={service.id}
                  className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-black/10 dark:border-white/10 shadow-md space-y-4 relative group"
                >
                  {/* Card Action Header */}
                  <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-600 dark:text-amber-300 font-black text-xs flex items-center justify-center">
                        #{actualIndex + 1}
                      </span>
                      <span className="text-xs font-bold uppercase text-gray-400">
                        ID: {service.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveService(actualIndex, 'up')}
                        disabled={actualIndex === 0}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 disabled:opacity-20"
                        title="Move Up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveService(actualIndex, 'down')}
                        disabled={actualIndex === formData.services_list.length - 1}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 disabled:opacity-20"
                        title="Move Down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicateService(actualIndex)}
                        className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        title="Duplicate Card"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500"
                        title="Delete Card"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Card Configuration Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Category Tag Picker */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-gray-500 block">
                        Category Tag
                      </label>
                      <select
                        value={service.category_tag}
                        onChange={e => updateServiceCardField(actualIndex, 'category_tag', e.target.value)}
                        className="w-full p-2.5 text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border border-black/10 dark:border-white/10 font-bold focus:outline-none focus:ring-2 focus:ring-[#004b93]"
                      >
                        {formData.categories.filter(c => c !== 'All').map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* Icon Picker */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-gray-500 block">
                        Icon Identifier
                      </label>
                      <div className="flex items-center gap-2">
                        <select
                          value={service.icon_type}
                          onChange={e => updateServiceCardField(actualIndex, 'icon_type', e.target.value)}
                          className="w-full p-2.5 text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border border-black/10 dark:border-white/10 font-bold focus:outline-none focus:ring-2 focus:ring-[#004b93]"
                        >
                          {AVAILABLE_ICONS.map(i => (
                            <option key={i.name} value={i.name}>{i.label} ({i.name})</option>
                          ))}
                        </select>
                        <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-300 rounded-xl shrink-0">
                          <RenderIcon name={service.icon_type} className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Title Input */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold uppercase text-gray-500">
                        Service Title
                      </label>
                      <span className="text-[10px] font-extrabold text-amber-500 uppercase">
                        [{activeLang.toUpperCase()}]
                      </span>
                    </div>
                    <input
                      type="text"
                      value={service.title[activeLang] || ''}
                      onChange={e => updateServiceCardTrilingualField(actualIndex, 'title', e.target.value)}
                      placeholder={`Service title in ${activeLang.toUpperCase()}`}
                      className="w-full p-2.5 text-xs font-bold rounded-xl bg-gray-50 dark:bg-slate-800 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#004b93]"
                    />
                  </div>

                  {/* Description Input */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold uppercase text-gray-500">
                        Card Description
                      </label>
                      <span className="text-[10px] font-extrabold text-amber-500 uppercase">
                        [{activeLang.toUpperCase()}]
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={service.description[activeLang] || ''}
                      onChange={e => updateServiceCardTrilingualField(actualIndex, 'description', e.target.value)}
                      placeholder={`Card description in ${activeLang.toUpperCase()}`}
                      className="w-full p-2.5 text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#004b93]"
                    />
                  </div>

                  {/* Action Text Input */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold uppercase text-gray-500">
                        Action CTA Text
                      </label>
                      <span className="text-[10px] font-extrabold text-amber-500 uppercase">
                        [{activeLang.toUpperCase()}]
                      </span>
                    </div>
                    <input
                      type="text"
                      value={service.action_text[activeLang] || ''}
                      onChange={e => updateServiceCardTrilingualField(actualIndex, 'action_text', e.target.value)}
                      placeholder="e.g. Inquire Division >"
                      className="w-full p-2.5 text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#004b93]"
                    />
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: LIVE INTERACTIVE PREVIEW */}
      {activeTab === 'preview' && (
        <div className="bg-[#F7F9FC] dark:bg-[#101828]/80 p-8 rounded-3xl border border-black/10 dark:border-white/10 shadow-2xl space-y-8">
          
          {/* Preview Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-black/10 dark:border-white/10 shadow">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-black uppercase tracking-wider">
                Live Public Services Section Preview
              </span>
            </div>

            {/* Language preview switcher */}
            <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-slate-800 p-1.5 rounded-xl border border-black/10 dark:border-white/10">
              <button
                onClick={() => setPreviewLang('km')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  previewLang === 'km' ? 'bg-[#004b93] text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                🇰🇭 KM
              </button>
              <button
                onClick={() => setPreviewLang('en')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  previewLang === 'en' ? 'bg-[#004b93] text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                🇬🇧 EN
              </button>
              <button
                onClick={() => setPreviewLang('ko')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  previewLang === 'ko' ? 'bg-[#004b93] text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                🇰🇷 KO
              </button>
            </div>
          </div>

          {/* Rendered Preview Mockup */}
          <div className="space-y-12">
            
            {/* Header Title & Subtitle */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0A4DA3]/10 rounded-full">
                <span className="text-xs font-bold tracking-[0.2em] text-[#0A4DA3] dark:text-blue-400 uppercase">
                  EXPLORE SPECS
                </span>
              </div>
              <h2 className="text-3xl font-extrabold text-[#101828] dark:text-white tracking-tight">
                {formData.header.title[previewLang] || formData.header.title.en}
              </h2>
              <p className="text-sm text-[#101828]/60 dark:text-white/60 leading-relaxed">
                {formData.header.subtitle[previewLang] || formData.header.subtitle.en}
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {formData.categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setPreviewCategory(category)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                    previewCategory === category
                      ? 'bg-[#004b93] text-white shadow-lg shadow-blue-900/20'
                      : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 border border-black/5 dark:border-white/5 hover:text-[#004b93]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Services Showcase Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {formData.services_list
                .filter(s => previewCategory === 'All' || s.category_tag === previewCategory)
                .map((service) => (
                  <div
                    key={service.id}
                    className="group relative rounded-2xl bg-white dark:bg-slate-900 p-8 border border-black/5 dark:border-white/5 shadow-sm flex flex-col justify-between overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <div>
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-[#004b93] dark:text-blue-400 mb-6 group-hover:bg-[#004b93] group-hover:text-white transition-all duration-300">
                        <RenderIcon name={service.icon_type} className="w-6 h-6" />
                      </div>

                      <span className="text-xs tracking-widest font-extrabold uppercase text-[#004b93] dark:text-blue-400 block mb-2">
                        {service.category_tag}
                      </span>

                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:text-[#004b93] transition-colors">
                        {service.title[previewLang] || service.title.en}
                      </h3>

                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                        {service.description[previewLang] || service.description.en}
                      </p>
                    </div>

                    <button className="mt-auto inline-flex items-center gap-1.5 text-xs font-bold text-[#004b93] dark:text-blue-400 group-hover:underline">
                      {service.action_text[previewLang] || service.action_text.en || 'Inquire Division >'}
                    </button>
                  </div>
                ))}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
