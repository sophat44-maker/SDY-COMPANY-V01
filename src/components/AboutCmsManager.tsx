import React, { useState, useEffect } from 'react';
import { useAboutPage, defaultAboutPageData } from './AboutContext';
import { useLanguage } from './LanguageContext';
import { AboutPageData, CoreValueItem, TimelineEventItem, TeamLeaderItem, TrilingualText } from '../types';
import { transformGoogleDriveUrl } from '../utils/googleDrive';
import {
  Building2,
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
  Globe,
  FileText,
  Download,
  Upload,
  CheckCircle2,
  Image as ImageIcon,
  ShieldAlert,
  Award,
  Star,
  Users,
  History,
  Crown,
  Briefcase,
  Factory,
  Check,
  Link as LinkIcon,
  HelpCircle,
  Hammer,
  Network,
  ShieldCheck
} from 'lucide-react';

export type LanguageCode = 'km' | 'en' | 'ko';

const VALUE_ICONS = [
  { name: 'ShieldAlert', label: 'Shield & Safety', icon: ShieldAlert },
  { name: 'Award', label: 'Award & Excellence', icon: Award },
  { name: 'Star', label: 'Star & Turnkey', icon: Star },
  { name: 'Factory', label: 'Factory & Manufacturing', icon: Factory },
  { name: 'Users', label: 'Users & Teamwork', icon: Users },
  { name: 'Building2', label: 'Building & Infrastructure', icon: Building2 },
  { name: 'Crown', label: 'Crown & Governance', icon: Crown },
  { name: 'Hammer', label: 'Hammer & Craftsmanship', icon: Hammer }
];

const RenderValueIcon = ({ name, className }: { name: string; className?: string }) => {
  const match = VALUE_ICONS.find(i => i.name === name);
  if (match) {
    const IconComp = match.icon;
    return <IconComp className={className} />;
  }
  return <Award className={className} />;
};

export default function AboutCmsManager() {
  const { aboutPageData, updateAboutPageData, resetAboutPageData, isSyncing } = useAboutPage();
  const { language, setLanguage, t } = useLanguage();
  const [formData, setFormData] = useState<AboutPageData>(aboutPageData);
  const [activeLang, setActiveLang] = useState<LanguageCode>('en');
  const [activeSection, setActiveSection] = useState<'overview' | 'values' | 'timeline' | 'team' | 'preview'>('overview');
  const [saveToast, setSaveToast] = useState(false);
  const [syncMessage, setSyncMessage] = useState('Synced to Google Sheets Cloud Successfully');
  const [previewLang, setPreviewLang] = useState<LanguageCode>('en');

  useEffect(() => {
    if (language === 'km' || language === 'en' || language === 'ko') {
      setActiveLang(language as LanguageCode);
    }
  }, [language]);

  useEffect(() => {
    setFormData(aboutPageData);
  }, [aboutPageData]);

  const handleSave = async () => {
    const res = await updateAboutPageData(formData);
    setSyncMessage(res.message || 'Synced to Google Sheets Cloud Successfully');
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 4500);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all About Us page content to default values? Any unsaved edits will be lost.')) {
      resetAboutPageData();
      setFormData(defaultAboutPageData);
    }
  };

  // 1. OVERVIEW HANDLERS
  const updateOverviewTag = (val: string) => {
    setFormData(prev => ({
      ...prev,
      overview: {
        ...prev.overview,
        tag: { ...prev.overview.tag, [activeLang]: val }
      }
    }));
  };

  const updateOverviewTitle = (val: string) => {
    setFormData(prev => ({
      ...prev,
      overview: {
        ...prev.overview,
        title: { ...prev.overview.title, [activeLang]: val }
      }
    }));
  };

  const updateOverviewBadgeText = (val: string) => {
    setFormData(prev => ({
      ...prev,
      overview: {
        ...prev.overview,
        badge_text: { ...prev.overview.badge_text, [activeLang]: val }
      }
    }));
  };

  const updateOverviewBadgeSubtext = (val: string) => {
    setFormData(prev => ({
      ...prev,
      overview: {
        ...prev.overview,
        badge_subtext: { ...prev.overview.badge_subtext, [activeLang]: val }
      }
    }));
  };

  const updateFactoryImageUrl = (val: string) => {
    const transformed = transformGoogleDriveUrl(val);
    setFormData(prev => ({
      ...prev,
      overview: {
        ...prev.overview,
        factory_image_url: transformed
      }
    }));
  };

  // Story Paragraphs
  const handleAddParagraph = () => {
    const newPara: TrilingualText = {
      en: "New paragraph describing company milestone or facility.",
      km: "កថាខណ្ឌថ្មីរៀបរាប់អំពីសមិទ្ធផលក្រុមហ៊ុន ឬបរិក្ខារ។",
      ko: "회사 연혁 또는 시설을 설명하는 새로운 단락."
    };
    setFormData(prev => ({
      ...prev,
      overview: {
        ...prev.overview,
        story_paragraphs: [...prev.overview.story_paragraphs, newPara]
      }
    }));
  };

  const updateParagraphText = (index: number, val: string) => {
    setFormData(prev => {
      const copy = [...prev.overview.story_paragraphs];
      copy[index] = { ...copy[index], [activeLang]: val };
      return {
        ...prev,
        overview: { ...prev.overview, story_paragraphs: copy }
      };
    });
  };

  const handleDeleteParagraph = (index: number) => {
    if (formData.overview.story_paragraphs.length <= 1) {
      alert('You must keep at least one paragraph for the story overview.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      overview: {
        ...prev.overview,
        story_paragraphs: prev.overview.story_paragraphs.filter((_, i) => i !== index)
      }
    }));
  };

  const handleMoveParagraph = (index: number, direction: 'up' | 'down') => {
    const nextList = [...formData.overview.story_paragraphs];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= nextList.length) return;
    const temp = nextList[index];
    nextList[index] = nextList[targetIndex];
    nextList[targetIndex] = temp;
    setFormData(prev => ({
      ...prev,
      overview: { ...prev.overview, story_paragraphs: nextList }
    }));
  };

  // 2. CORE VALUES HANDLERS
  const updateCoreValueHeaderTitle = (val: string) => {
    setFormData(prev => ({
      ...prev,
      core_values: {
        ...prev.core_values,
        section_title: { ...prev.core_values.section_title, [activeLang]: val }
      }
    }));
  };

  const updateCoreValueHeaderSubtitle = (val: string) => {
    setFormData(prev => ({
      ...prev,
      core_values: {
        ...prev.core_values,
        section_subtitle: { ...prev.core_values.section_subtitle, [activeLang]: val }
      }
    }));
  };

  const handleAddCoreValue = () => {
    const newVal: CoreValueItem = {
      id: "val_" + Math.random().toString(36).substring(2, 8),
      icon: "ShieldAlert",
      title: {
        en: "New Operational Value",
        km: "តម្លៃប្រតិបត្តិការថ្មី",
        ko: "새로운 운영 가치"
      },
      description: {
        en: "Details on how this value governs daily operations and quality assurance.",
        km: "ព័ត៌មានលម្អិតអំពីរបៀបដែលតម្លៃនេះគ្រប់គ្រងប្រតិបត្តិការប្រចាំថ្ងៃ។",
        ko: "이 가치가 일상 운영 및 품질 보증을 규정하는 세부 사항."
      }
    };
    setFormData(prev => ({
      ...prev,
      core_values: {
        ...prev.core_values,
        values_list: [...prev.core_values.values_list, newVal]
      }
    }));
  };

  const updateCoreValueIcon = (index: number, iconName: string) => {
    setFormData(prev => {
      const copy = [...prev.core_values.values_list];
      copy[index] = { ...copy[index], icon: iconName };
      return {
        ...prev,
        core_values: { ...prev.core_values, values_list: copy }
      };
    });
  };

  const updateCoreValueTrilingual = (index: number, field: 'title' | 'description', val: string) => {
    setFormData(prev => {
      const copy = [...prev.core_values.values_list];
      copy[index] = {
        ...copy[index],
        [field]: { ...copy[index][field], [activeLang]: val }
      };
      return {
        ...prev,
        core_values: { ...prev.core_values, values_list: copy }
      };
    });
  };

  const handleDeleteCoreValue = (id: string) => {
    setFormData(prev => ({
      ...prev,
      core_values: {
        ...prev.core_values,
        values_list: prev.core_values.values_list.filter(v => v.id !== id)
      }
    }));
  };

  const handleMoveCoreValue = (index: number, direction: 'up' | 'down') => {
    const nextList = [...formData.core_values.values_list];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= nextList.length) return;
    const temp = nextList[index];
    nextList[index] = nextList[targetIndex];
    nextList[targetIndex] = temp;
    setFormData(prev => ({
      ...prev,
      core_values: { ...prev.core_values, values_list: nextList }
    }));
  };

  // 3. TIMELINE EVENT HANDLERS
  const updateTimelineHeaderTitle = (val: string) => {
    setFormData(prev => ({
      ...prev,
      timeline: {
        ...prev.timeline,
        section_title: { ...prev.timeline.section_title, [activeLang]: val }
      }
    }));
  };

  const updateTimelineHeaderSubtitle = (val: string) => {
    setFormData(prev => ({
      ...prev,
      timeline: {
        ...prev.timeline,
        section_subtitle: { ...prev.timeline.section_subtitle, [activeLang]: val }
      }
    }));
  };

  const handleAddTimelineEvent = () => {
    const newEvt: TimelineEventItem = {
      id: "time_" + Math.random().toString(36).substring(2, 8),
      year: new Date().getFullYear().toString(),
      title: {
        en: "Strategic Milestone",
        km: "សមិទ្ធផលយុទ្ធសាស្ត្រ",
        ko: "전략적 마일스톤"
      },
      description: {
        en: "Description of plant expansion, contract award, or certification.",
        km: "ការពិពណ៌នាអំពីការពង្រីករោងចក្រ ការទទួលបានកិច្ចសន្យា ឬវិញ្ញាបនបត្រ។",
        ko: "공장 확장, 계약 수주 또는 인증 취득에 대한 설명."
      }
    };
    setFormData(prev => ({
      ...prev,
      timeline: {
        ...prev.timeline,
        events: [...prev.timeline.events, newEvt]
      }
    }));
  };

  const updateTimelineEventYear = (index: number, year: string) => {
    setFormData(prev => {
      const copy = [...prev.timeline.events];
      copy[index] = { ...copy[index], year };
      return {
        ...prev,
        timeline: { ...prev.timeline, events: copy }
      };
    });
  };

  const updateTimelineEventTrilingual = (index: number, field: 'title' | 'description', val: string) => {
    setFormData(prev => {
      const copy = [...prev.timeline.events];
      copy[index] = {
        ...copy[index],
        [field]: { ...copy[index][field], [activeLang]: val }
      };
      return {
        ...prev,
        timeline: { ...prev.timeline, events: copy }
      };
    });
  };

  const handleDeleteTimelineEvent = (id: string) => {
    setFormData(prev => ({
      ...prev,
      timeline: {
        ...prev.timeline,
        events: prev.timeline.events.filter(e => e.id !== id)
      }
    }));
  };

  const handleMoveTimelineEvent = (index: number, direction: 'up' | 'down') => {
    const nextList = [...formData.timeline.events];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= nextList.length) return;
    const temp = nextList[index];
    nextList[index] = nextList[targetIndex];
    nextList[targetIndex] = temp;
    setFormData(prev => ({
      ...prev,
      timeline: { ...prev.timeline, events: nextList }
    }));
  };

  // 4. TEAM GOVERNANCE HANDLERS
  const updateTeamHeaderTitle = (val: string) => {
    setFormData(prev => ({
      ...prev,
      team_governance: {
        ...prev.team_governance,
        section_title: { ...prev.team_governance.section_title, [activeLang]: val }
      }
    }));
  };

  const updateTeamHeaderSubtitle = (val: string) => {
    setFormData(prev => ({
      ...prev,
      team_governance: {
        ...prev.team_governance,
        section_subtitle: { ...prev.team_governance.section_subtitle, [activeLang]: val }
      }
    }));
  };

  const handleAddTeamLeader = () => {
    const newLeader: TeamLeaderItem = {
      id: "lead_" + Math.random().toString(36).substring(2, 8),
      name: "New Executive Leader",
      role: {
        en: "Division Director",
        km: "នាយកផ្នែក",
        ko: "본부장 / 디렉터"
      },
      photo_or_initials: "",
      sub_skills: ["Project Leadership", "Quality Assurance"],
      department: {
        en: "Engineering Division",
        km: "ផ្នែកវិស្វកម្ម",
        ko: "엔지니어링 본부"
      },
      category: "management"
    };
    setFormData(prev => ({
      ...prev,
      team_governance: {
        ...prev.team_governance,
        leaders: [...prev.team_governance.leaders, newLeader]
      }
    }));
  };

  const updateTeamLeaderField = (index: number, field: 'name' | 'photo_or_initials' | 'image_url' | 'category', val: any) => {
    let finalVal = val;
    if (field === 'photo_or_initials' || field === 'image_url') {
      finalVal = transformGoogleDriveUrl(val);
    }
    setFormData(prev => {
      const copy = [...prev.team_governance.leaders];
      if (field === 'photo_or_initials' || field === 'image_url') {
        copy[index] = { ...copy[index], photo_or_initials: finalVal, image_url: finalVal };
      } else {
        copy[index] = { ...copy[index], [field]: finalVal };
      }
      return {
        ...prev,
        team_governance: { ...prev.team_governance, leaders: copy }
      };
    });
  };

  const updateTeamLeaderTrilingual = (index: number, field: 'role' | 'department', val: string) => {
    setFormData(prev => {
      const copy = [...prev.team_governance.leaders];
      const existingObj = copy[index][field] || { km: '', en: '', ko: '' };
      copy[index] = {
        ...copy[index],
        [field]: { ...existingObj, [activeLang]: val }
      };
      return {
        ...prev,
        team_governance: { ...prev.team_governance, leaders: copy }
      };
    });
  };

  const updateTeamLeaderSkills = (index: number, skillsStr: string) => {
    const arr = skillsStr.split(',').map(s => s.trim()).filter(Boolean);
    setFormData(prev => {
      const copy = [...prev.team_governance.leaders];
      copy[index] = { ...copy[index], sub_skills: arr };
      return {
        ...prev,
        team_governance: { ...prev.team_governance, leaders: copy }
      };
    });
  };

  const handleDeleteTeamLeader = (id: string) => {
    setFormData(prev => ({
      ...prev,
      team_governance: {
        ...prev.team_governance,
        leaders: prev.team_governance.leaders.filter(l => l.id !== id)
      }
    }));
  };

  const handleMoveTeamLeader = (index: number, direction: 'up' | 'down') => {
    const nextList = [...formData.team_governance.leaders];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= nextList.length) return;
    const temp = nextList[index];
    nextList[index] = nextList[targetIndex];
    nextList[targetIndex] = temp;
    setFormData(prev => ({
      ...prev,
      team_governance: { ...prev.team_governance, leaders: nextList }
    }));
  };

  // JSON Export / Import
  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(formData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SDY_AboutPage_CMS_${new Date().toISOString().slice(0, 10)}.json`;
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
        if (parsed && parsed.overview && parsed.core_values && parsed.timeline && parsed.team_governance) {
          setFormData(parsed);
          alert('About Us Page CMS configuration successfully imported!');
        } else {
          alert('Invalid JSON structure for About Us Page CMS.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100">
      
      {/* Top Banner Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#003366] to-[#004b93] text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
            <Building2 className="w-6 h-6 text-amber-300 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-wide flex items-center gap-2">
              About Us CMS Manager
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-400 text-black font-extrabold uppercase">
                Trilingual (3L)
              </span>
            </h2>
            <p className="text-xs text-blue-100">
              Manage Company Story, Core Values, History Timeline, and Governance Team across KM, EN, and KO.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportJson}
            title="Export JSON backup"
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
            <Save className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} /> {isSyncing ? 'SYNCING...' : 'Save Changes'}
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

      {/* Primary Section Navigation Tabs & Language Selector */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm">
        
        {/* Navigation Section Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveSection('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeSection === 'overview'
                ? 'bg-[#004b93] text-white shadow-md'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            <Factory className="w-4 h-4" /> Company Story & Factory
          </button>

          <button
            onClick={() => setActiveSection('values')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeSection === 'values'
                ? 'bg-[#004b93] text-white shadow-md'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            <Award className="w-4 h-4" /> Core Values ({formData.core_values.values_list.length})
          </button>

          <button
            onClick={() => setActiveSection('timeline')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeSection === 'timeline'
                ? 'bg-[#004b93] text-white shadow-md'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            <History className="w-4 h-4" /> History Timeline ({formData.timeline.events.length})
          </button>

          <button
            onClick={() => setActiveSection('team')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeSection === 'team'
                ? 'bg-[#004b93] text-white shadow-md'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            <Users className="w-4 h-4" /> Team & Governance ({formData.team_governance.leaders.length})
          </button>

          <button
            onClick={() => setActiveSection('preview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeSection === 'preview'
                ? 'bg-amber-500 text-black shadow-md'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            <Eye className="w-4 h-4" /> {t('admin.live_preview', 'Live Interactive Preview')}
          </button>
        </div>

        {/* Global Trilingual Language Switcher */}
        {activeSection !== 'preview' && (
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
              <span>🇰🇭</span> KM
            </button>
            <button
              onClick={() => { setActiveLang('en'); setLanguage('en'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                activeLang === 'en' ? 'bg-[#004b93] text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              <span>🇬🇧</span> EN
            </button>
            <button
              onClick={() => { setActiveLang('ko'); setLanguage('ko'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                activeLang === 'ko' ? 'bg-[#004b93] text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              <span>🇰🇷</span> KO
            </button>
          </div>
        )}
      </div>

      {/* SECTION 1: OVERVIEW & STORY */}
      {activeSection === 'overview' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
            <div>
              <h3 className="text-base font-extrabold flex items-center gap-2">
                Section 1: Company Profile & Story
                <span className="text-xs font-bold text-amber-500 uppercase">[{activeLang.toUpperCase()}]</span>
              </h3>
              <p className="text-xs text-gray-500">Edit company tag, title, multi-paragraph corporate narrative, factory image, and overlay badges.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column: Text Inputs */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300 block">
                  Category Tag ({activeLang.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={formData.overview.tag[activeLang] || ''}
                  onChange={e => updateOverviewTag(e.target.value)}
                  placeholder="e.g. Corporate Profile"
                  className="w-full p-2.5 text-xs font-bold rounded-xl bg-gray-50 dark:bg-slate-800 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#004b93]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300 block">
                  Main Headline Title ({activeLang.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={formData.overview.title[activeLang] || ''}
                  onChange={e => updateOverviewTitle(e.target.value)}
                  placeholder="e.g. About SDY Company C&I"
                  className="w-full p-3 text-sm font-extrabold rounded-xl bg-gray-50 dark:bg-slate-800 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#004b93]"
                />
              </div>

              {/* Story Paragraphs */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold uppercase text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#004b93]" />
                    Company Story Paragraphs ({formData.overview.story_paragraphs.length})
                  </label>
                  <button
                    onClick={handleAddParagraph}
                    className="px-3 py-1.5 bg-[#004b93] hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Paragraph
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.overview.story_paragraphs.map((para, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-black/5 dark:border-white/5 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                          Paragraph #{idx + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            disabled={idx === 0}
                            onClick={() => handleMoveParagraph(idx, 'up')}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded text-gray-500 disabled:opacity-20"
                            title="Move Up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            disabled={idx === formData.overview.story_paragraphs.length - 1}
                            onClick={() => handleMoveParagraph(idx, 'down')}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded text-gray-500 disabled:opacity-20"
                            title="Move Down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteParagraph(idx)}
                            className="p-1 hover:bg-red-500/20 rounded text-red-500"
                            title="Delete Paragraph"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <textarea
                        rows={3}
                        value={para[activeLang] || ''}
                        onChange={e => updateParagraphText(idx, e.target.value)}
                        placeholder={`Paragraph text in ${activeLang.toUpperCase()}...`}
                        className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#004b93]"
                      />
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Factory Image & Badge Settings */}
            <div className="space-y-4">
              
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-black/10 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-500" />
                    Factory Cover Image (Direct URL or Google Drive)
                  </label>
                </div>

                <input
                  type="text"
                  value={formData.overview.factory_image_url || ''}
                  onChange={e => updateFactoryImageUrl(e.target.value)}
                  placeholder="Paste direct image URL or Google Drive share link..."
                  className="w-full p-2.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#004b93]"
                />

                <p className="text-[11px] text-gray-500 flex items-center gap-1">
                  <LinkIcon className="w-3 h-3 text-blue-500 shrink-0" />
                  Supports Google Drive view/share links (auto-converted to direct LH3 links). Leave empty to use standard factory photo asset.
                </p>

                {/* Preview Thumbnail */}
                <div className="aspect-[16/9] rounded-xl overflow-hidden bg-gray-200 dark:bg-slate-700 relative border border-black/10 dark:border-white/10">
                  {formData.overview.factory_image_url ? (
                    <img
                      src={formData.overview.factory_image_url}
                      alt="Factory preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                      <Factory className="w-10 h-10 mb-1 opacity-50" />
                      <span className="text-xs font-bold">Default Factory Asset In Use</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Overlay Badge Inputs */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-black/10 dark:border-white/10 space-y-3">
                <h4 className="text-xs font-extrabold uppercase text-gray-700 dark:text-gray-300">
                  Image Overlay Badge ({activeLang.toUpperCase()})
                </h4>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={formData.overview.badge_text[activeLang] || ''}
                    onChange={e => updateOverviewBadgeText(e.target.value)}
                    placeholder="e.g. Headquarters & Factory"
                    className="w-full p-2.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#004b93]"
                  />

                  <textarea
                    rows={2}
                    value={formData.overview.badge_subtext[activeLang] || ''}
                    onChange={e => updateOverviewBadgeSubtext(e.target.value)}
                    placeholder="e.g. Over 150 certified operators executing fine joinery..."
                    className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#004b93]"
                  />
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* SECTION 2: CORE VALUES */}
      {activeSection === 'values' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
            <div>
              <h3 className="text-base font-extrabold flex items-center gap-2">
                Section 2: Operational Core Values
                <span className="text-xs font-bold text-amber-500 uppercase">[{activeLang.toUpperCase()}]</span>
              </h3>
              <p className="text-xs text-gray-500">Edit values section header and list of pillar cards.</p>
            </div>

            <button
              onClick={handleAddCoreValue}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase rounded-xl flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" /> Add Core Value Card
            </button>
          </div>

          {/* Section Headers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-500 block">
                Section Title ({activeLang.toUpperCase()})
              </label>
              <input
                type="text"
                value={formData.core_values.section_title[activeLang] || ''}
                onChange={e => updateCoreValueHeaderTitle(e.target.value)}
                placeholder="e.g. Our Operational Values"
                className="w-full p-2.5 text-xs font-extrabold rounded-xl bg-gray-50 dark:bg-slate-800 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#004b93]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-500 block">
                Section Subtitle ({activeLang.toUpperCase()})
              </label>
              <input
                type="text"
                value={formData.core_values.section_subtitle[activeLang] || ''}
                onChange={e => updateCoreValueHeaderSubtitle(e.target.value)}
                placeholder="e.g. The pillars that define every action..."
                className="w-full p-2.5 text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#004b93]"
              />
            </div>
          </div>

          {/* Values Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {formData.core_values.values_list.map((val, idx) => (
              <div
                key={val.id}
                className="p-5 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-black/10 dark:border-white/10 space-y-4 relative"
              >
                {/* Header Action */}
                <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-300 font-black text-xs flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={idx === 0}
                      onClick={() => handleMoveCoreValue(idx, 'up')}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded text-gray-500 disabled:opacity-20"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={idx === formData.core_values.values_list.length - 1}
                      onClick={() => handleMoveCoreValue(idx, 'down')}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded text-gray-500 disabled:opacity-20"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCoreValue(val.id)}
                      className="p-1 hover:bg-red-500/20 rounded text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Icon Selector */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-gray-500 block">
                    Card Icon
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={val.icon}
                      onChange={e => updateCoreValueIcon(idx, e.target.value)}
                      className="w-full p-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10"
                    >
                      {VALUE_ICONS.map(i => (
                        <option key={i.name} value={i.name}>{i.label}</option>
                      ))}
                    </select>
                    <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-300 rounded-xl shrink-0">
                      <RenderValueIcon name={val.icon} className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-gray-500 block">
                    Title ({activeLang.toUpperCase()})
                  </label>
                  <input
                    type="text"
                    value={val.title[activeLang] || ''}
                    onChange={e => updateCoreValueTrilingual(idx, 'title', e.target.value)}
                    className="w-full p-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-gray-500 block">
                    Description ({activeLang.toUpperCase()})
                  </label>
                  <textarea
                    rows={3}
                    value={val.description[activeLang] || ''}
                    onChange={e => updateCoreValueTrilingual(idx, 'description', e.target.value)}
                    className="w-full p-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10"
                  />
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: HISTORY TIMELINE */}
      {activeSection === 'timeline' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
            <div>
              <h3 className="text-base font-extrabold flex items-center gap-2">
                Section 3: Corporate Journey Timeline
                <span className="text-xs font-bold text-amber-500 uppercase">[{activeLang.toUpperCase()}]</span>
              </h3>
              <p className="text-xs text-gray-500">Edit history timeline milestones, years, titles, and descriptions.</p>
            </div>

            <button
              onClick={handleAddTimelineEvent}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase rounded-xl flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" /> Add Timeline Event
            </button>
          </div>

          {/* Section Headers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-500 block">
                Section Title ({activeLang.toUpperCase()})
              </label>
              <input
                type="text"
                value={formData.timeline.section_title[activeLang] || ''}
                onChange={e => updateTimelineHeaderTitle(e.target.value)}
                placeholder="e.g. Our Corporate Journey"
                className="w-full p-2.5 text-xs font-extrabold rounded-xl bg-gray-50 dark:bg-slate-800 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#004b93]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-500 block">
                Section Subtitle ({activeLang.toUpperCase()})
              </label>
              <input
                type="text"
                value={formData.timeline.section_subtitle[activeLang] || ''}
                onChange={e => updateTimelineHeaderSubtitle(e.target.value)}
                placeholder="e.g. Chronology of SDY C&I growth..."
                className="w-full p-2.5 text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#004b93]"
              />
            </div>
          </div>

          {/* Timeline Events List */}
          <div className="space-y-4 pt-4 max-w-4xl">
            {formData.timeline.events.map((evt, idx) => (
              <div
                key={evt.id}
                className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-black/10 dark:border-white/10 space-y-3 relative"
              >
                <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-600 dark:text-amber-300 font-black text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-bold text-gray-400">ID: {evt.id}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      disabled={idx === 0}
                      onClick={() => handleMoveTimelineEvent(idx, 'up')}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded text-gray-500 disabled:opacity-20"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={idx === formData.timeline.events.length - 1}
                      onClick={() => handleMoveTimelineEvent(idx, 'down')}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded text-gray-500 disabled:opacity-20"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTimelineEvent(evt.id)}
                      className="p-1 hover:bg-red-500/20 rounded text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  
                  {/* Year */}
                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-[11px] font-bold uppercase text-gray-500 block">
                      Year / Date
                    </label>
                    <input
                      type="text"
                      value={evt.year}
                      onChange={e => updateTimelineEventYear(idx, e.target.value)}
                      placeholder="e.g. 2024"
                      className="w-full p-2 text-xs font-extrabold rounded-xl bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10"
                    />
                  </div>

                  {/* Title */}
                  <div className="space-y-1 sm:col-span-3">
                    <label className="text-[11px] font-bold uppercase text-gray-500 block">
                      Event Title ({activeLang.toUpperCase()})
                    </label>
                    <input
                      type="text"
                      value={evt.title[activeLang] || ''}
                      onChange={e => updateTimelineEventTrilingual(idx, 'title', e.target.value)}
                      placeholder="e.g. UL Safety Certification"
                      className="w-full p-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10"
                    />
                  </div>

                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-gray-500 block">
                    Event Description ({activeLang.toUpperCase()})
                  </label>
                  <textarea
                    rows={2}
                    value={evt.description[activeLang] || ''}
                    onChange={e => updateTimelineEventTrilingual(idx, 'description', e.target.value)}
                    placeholder="Details about this corporate milestone..."
                    className="w-full p-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10"
                  />
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: TEAM & GOVERNANCE */}
      {activeSection === 'team' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
            <div>
              <h3 className="text-base font-extrabold flex items-center gap-2">
                Section 4: Team & Governance Leadership
                <span className="text-xs font-bold text-amber-500 uppercase">[{activeLang.toUpperCase()}]</span>
              </h3>
              <p className="text-xs text-gray-500">Edit board of directors, management leaders, photo URLs (Google Drive auto-converted), and sub-skills.</p>
            </div>

            <button
              onClick={handleAddTeamLeader}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase rounded-xl flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" /> Add Team Member
            </button>
          </div>

          {/* Section Headers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-500 block">
                Section Title ({activeLang.toUpperCase()})
              </label>
              <input
                type="text"
                value={formData.team_governance.section_title[activeLang] || ''}
                onChange={e => updateTeamHeaderTitle(e.target.value)}
                placeholder="e.g. Board of Directors & Governance"
                className="w-full p-2.5 text-xs font-extrabold rounded-xl bg-gray-50 dark:bg-slate-800 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#004b93]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-500 block">
                Section Subtitle ({activeLang.toUpperCase()})
              </label>
              <input
                type="text"
                value={formData.team_governance.section_subtitle[activeLang] || ''}
                onChange={e => updateTeamHeaderSubtitle(e.target.value)}
                placeholder="e.g. A unified corporate team driving quality design..."
                className="w-full p-2.5 text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#004b93]"
              />
            </div>
          </div>

          {/* Team Leaders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {formData.team_governance.leaders.map((leader, idx) => (
              <div
                key={leader.id}
                className="p-5 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-black/10 dark:border-white/10 space-y-4 relative"
              >
                {/* Header Action */}
                <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-300 font-black text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-bold text-gray-400">{leader.name || 'Unnamed Member'}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      disabled={idx === 0}
                      onClick={() => handleMoveTeamLeader(idx, 'up')}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded text-gray-500 disabled:opacity-20"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={idx === formData.team_governance.leaders.length - 1}
                      onClick={() => handleMoveTeamLeader(idx, 'down')}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded text-gray-500 disabled:opacity-20"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTeamLeader(leader.id)}
                      className="p-1 hover:bg-red-500/20 rounded text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-gray-500 block">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={leader.name}
                      onChange={e => updateTeamLeaderField(idx, 'name', e.target.value)}
                      placeholder="e.g. Na Yun Jung"
                      className="w-full p-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10"
                    />
                  </div>

                  {/* Tier Category */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-gray-500 block">
                      Org Tier Category
                    </label>
                    <select
                      value={leader.category || 'management'}
                      onChange={e => updateTeamLeaderField(idx, 'category', e.target.value)}
                      className="w-full p-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10"
                    >
                      <option value="directors">Board of Directors</option>
                      <option value="management">Management Leadership</option>
                      <option value="leaders">Department Leader</option>
                    </select>
                  </div>

                </div>

                {/* Role / Position */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-gray-500 block">
                    Role / Title ({activeLang.toUpperCase()})
                  </label>
                  <input
                    type="text"
                    value={leader.role?.[activeLang] || ''}
                    onChange={e => updateTeamLeaderTrilingual(idx, 'role', e.target.value)}
                    placeholder={`Role in ${activeLang.toUpperCase()}`}
                    className="w-full p-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10"
                  />
                </div>

                {/* Department Tag */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-gray-500 block">
                    Department / Division ({activeLang.toUpperCase()})
                  </label>
                  <input
                    type="text"
                    value={leader.department?.[activeLang] || ''}
                    onChange={e => updateTeamLeaderTrilingual(idx, 'department', e.target.value)}
                    placeholder={`Department in ${activeLang.toUpperCase()}`}
                    className="w-full p-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10"
                  />
                </div>

                {/* Photo / Image URL Field */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-gray-500 block flex items-center justify-between">
                    <span>Photo URL / Image URL (Google Drive auto-converted)</span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">HD Avatar Ready</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={leader.image_url || leader.photo_or_initials || ''}
                      onChange={e => updateTeamLeaderField(idx, 'image_url', e.target.value)}
                      placeholder="Paste image URL or Google Drive share link..."
                      className="w-full p-2.5 text-xs font-mono rounded-xl bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 focus:ring-2 focus:ring-[#004b93]"
                    />
                    <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-amber-400 via-[#004b93] to-amber-300 shadow shrink-0">
                      {(leader.image_url || leader.photo_or_initials) ? (
                        <img
                          src={transformGoogleDriveUrl(leader.image_url || leader.photo_or_initials)}
                          alt={leader.name}
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                            const parent = (e.target as HTMLElement).parentElement;
                            if (parent && !parent.querySelector('.fallback-initials')) {
                              const fallback = document.createElement('div');
                              fallback.className = 'fallback-initials w-9 h-9 rounded-full bg-gradient-to-br from-[#0B1A30] to-[#0A4DA3] text-amber-300 font-black text-xs flex items-center justify-center font-serif';
                              fallback.innerText = leader.name ? leader.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'SD';
                              parent.appendChild(fallback);
                            }
                          }}
                          className="w-9 h-9 rounded-full object-cover shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0B1A30] to-[#0A4DA3] text-amber-300 font-black text-xs flex items-center justify-center font-serif">
                          {leader.name ? leader.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'SD'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sub Skills */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-gray-500 block">
                    Key Specialties / Sub-Skills (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={(leader.sub_skills || []).join(', ')}
                    onChange={e => updateTeamLeaderSkills(idx, e.target.value)}
                    placeholder="e.g. Factory Specs, Contract Handover, QA/QC"
                    className="w-full p-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10"
                  />
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: LIVE INTERACTIVE PREVIEW */}
      {activeSection === 'preview' && (
        <div className="bg-[#F7F9FC] dark:bg-[#101828]/80 p-8 rounded-3xl border border-black/10 dark:border-white/10 shadow-2xl space-y-12">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-black/10 dark:border-white/10 shadow">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-black uppercase tracking-wider">
                Live Public About Us Section Preview
              </span>
            </div>

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

          {/* Rendered Mockup Preview */}
          <div className="space-y-16">
            
            {/* 1. Profile Pitch */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0A4DA3]/5 dark:bg-[#1E88E5]/10 rounded-full">
                  <span className="text-xs font-bold tracking-[0.2em] text-[#0A4DA3] dark:text-[#1E88E5] uppercase">
                    {formData.overview.tag[previewLang] || formData.overview.tag.en}
                  </span>
                </div>
                <h2 className="text-3xl font-extrabold text-[#101828] dark:text-white tracking-tight">
                  {formData.overview.title[previewLang] || formData.overview.title.en}
                </h2>
                <div className="space-y-4 text-sm text-[#101828]/70 dark:text-white/70 leading-relaxed">
                  {formData.overview.story_paragraphs.map((p, i) => (
                    <p key={i}>{p[previewLang] || p.en}</p>
                  ))}
                </div>
              </div>

              {/* Cover Image Block */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] bg-slate-800">
                {formData.overview.factory_image_url ? (
                  <img
                    src={formData.overview.factory_image_url}
                    alt="Factory"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white/50 p-6 text-center">
                    <Factory className="w-16 h-16 mb-2 text-[#1E88E5]" />
                    <span className="text-sm font-bold">SDY Corporate Factory & Millwork Facility</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#101828] via-[#101828]/40 to-transparent" />
                
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/10 dark:bg-[#101828]/60 backdrop-blur-md border border-white/15 flex items-center gap-3.5 text-white">
                  <Factory className="w-8 h-8 text-[#1E88E5] shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-[#1E88E5] uppercase tracking-widest block">
                      {formData.overview.badge_text[previewLang] || formData.overview.badge_text.en}
                    </span>
                    <p className="text-xs text-white/90 font-bold leading-normal mt-0.5">
                      {formData.overview.badge_subtext[previewLang] || formData.overview.badge_subtext.en}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Core Values */}
            <div className="space-y-8">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <h3 className="text-2xl font-extrabold text-[#101828] dark:text-white">
                  {formData.core_values.section_title[previewLang] || formData.core_values.section_title.en}
                </h3>
                <p className="text-xs text-[#101828]/70 dark:text-white/70">
                  {formData.core_values.section_subtitle[previewLang] || formData.core_values.section_subtitle.en}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {formData.core_values.values_list.map((val) => (
                  <div
                    key={val.id}
                    className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 shadow-sm space-y-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-[#004b93] dark:text-blue-400 flex items-center justify-center">
                      <RenderValueIcon name={val.icon} className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-base text-gray-900 dark:text-white">
                      {val.title[previewLang] || val.title.en}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {val.description[previewLang] || val.description.en}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Timeline Events */}
            <div className="space-y-8">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <h3 className="text-2xl font-extrabold text-[#101828] dark:text-white">
                  {formData.timeline.section_title[previewLang] || formData.timeline.section_title.en}
                </h3>
                <p className="text-xs text-[#101828]/70 dark:text-white/70">
                  {formData.timeline.section_subtitle[previewLang] || formData.timeline.section_subtitle.en}
                </p>
              </div>

              <div className="relative border-l-2 border-[#004b93]/20 pl-6 space-y-8 max-w-3xl mx-auto">
                {formData.timeline.events.map((evt) => (
                  <div key={evt.id} className="relative">
                    <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-[#004b93]" />
                    <span className="text-lg font-black text-[#004b93] dark:text-blue-400 block">
                      {evt.year}
                    </span>
                    <h4 className="font-bold text-base text-gray-900 dark:text-white">
                      {evt.title[previewLang] || evt.title.en}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                      {evt.description[previewLang] || evt.description.en}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Team Leaders */}
            <div className="space-y-8">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0A4DA3]/5 dark:bg-[#1E88E5]/10 rounded-full mb-1 border border-[#0A4DA3]/10">
                  <Sparkles className="w-3.5 h-3.5 text-[#0A4DA3] dark:text-[#1E88E5]" />
                  <span className="text-xs font-bold tracking-widest text-[#0A4DA3] dark:text-[#1E88E5] uppercase">
                    Corporate Governance
                  </span>
                </div>
                <h3 className="text-2xl font-extrabold text-[#101828] dark:text-white">
                  {formData.team_governance.section_title[previewLang] || formData.team_governance.section_title.en}
                </h3>
                <p className="text-xs text-[#101828]/70 dark:text-white/70">
                  {formData.team_governance.section_subtitle[previewLang] || formData.team_governance.section_subtitle.en}
                </p>
              </div>

              {/* Hierarchy Grouping */}
              {(() => {
                const leaders = formData.team_governance.leaders || [];
                let topL = leaders.filter(l => l.category === 'directors');
                let deptL = leaders.filter(l => l.category !== 'directors');
                if (topL.length === 0 && leaders.length > 0) {
                  topL = leaders.slice(0, 2);
                  deptL = leaders.slice(2);
                }

                return (
                  <div className="space-y-8">
                    {/* Top Level Board */}
                    {topL.length > 0 && (
                      <div className="space-y-4">
                        <div className="text-center">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase tracking-widest">
                            <Crown className="w-3.5 h-3.5 text-amber-500" /> Executive Board
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                          {topL.map((leader) => {
                            const rawImg = leader.image_url || leader.photo_or_initials;
                            const photoUrl = transformGoogleDriveUrl(rawImg);
                            const hasImage = photoUrl && (
                              photoUrl.startsWith('http') ||
                              photoUrl.startsWith('/') ||
                              photoUrl.startsWith('data:')
                            );

                            return (
                              <div
                                key={leader.id}
                                className="p-6 rounded-3xl bg-gradient-to-br from-white via-slate-50 to-amber-500/5 dark:from-[#111C2E] dark:via-[#0F172A] dark:to-[#1E293B] border-2 border-amber-400/40 dark:border-amber-400/30 shadow-xl relative overflow-hidden space-y-4"
                              >
                                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-[#0A4DA3] to-amber-500" />
                                <div className="flex items-center gap-4">
                                  <div className="relative p-1 rounded-full bg-gradient-to-tr from-amber-400 via-[#0A4DA3] to-amber-300 shadow-lg shrink-0">
                                    {hasImage ? (
                                      <img
                                        src={photoUrl}
                                        alt={leader.name}
                                        onError={(e) => {
                                          (e.target as HTMLElement).style.display = 'none';
                                          const parent = (e.target as HTMLElement).parentElement;
                                          if (parent && !parent.querySelector('.fallback-avatar')) {
                                            const fb = document.createElement('div');
                                            fb.className = 'fallback-avatar w-16 h-16 rounded-full bg-gradient-to-br from-[#0B1A30] via-[#0A4DA3] to-[#101828] text-amber-300 font-black text-xl flex items-center justify-center font-serif shadow-inner border border-amber-400/30';
                                            fb.innerText = leader.name ? leader.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'SD';
                                            parent.appendChild(fb);
                                          }
                                        }}
                                        className="w-16 h-16 rounded-full object-cover w-full h-full"
                                        referrerPolicy="no-referrer"
                                      />
                                    ) : (
                                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0B1A30] via-[#0A4DA3] to-[#101828] text-amber-300 font-black text-xl flex items-center justify-center font-serif shadow-inner border border-amber-400/30">
                                        {leader.name ? leader.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'SD'}
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="font-extrabold text-base text-gray-900 dark:text-white truncate">
                                      {leader.name}
                                    </h4>
                                    <p className="text-xs font-extrabold text-[#004b93] dark:text-blue-400 uppercase truncate">
                                      {leader.role[previewLang] || leader.role.en}
                                    </p>
                                    {leader.department && (
                                      <span className="inline-block text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-300 font-bold px-2 py-0.5 rounded mt-1 truncate">
                                        {leader.department[previewLang] || leader.department.en}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {leader.sub_skills && leader.sub_skills.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                                    {leader.sub_skills.slice(0, 2).map((s, idx) => (
                                      <span key={idx} className="inline-flex items-center gap-1 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-semibold border border-slate-200 dark:border-slate-700">
                                        <CheckCircle2 className="w-3 h-3 text-amber-500" /> {s}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Org Connector */}
                    {deptL.length > 0 && (
                      <div className="flex flex-col items-center py-1">
                        <div className="w-0.5 h-6 bg-gradient-to-b from-amber-400 to-[#0A4DA3]" />
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-[#0A4DA3]/30 text-[10px] font-black uppercase text-[#0A4DA3] dark:text-blue-300 shadow">
                          <Network className="w-3.5 h-3.5" /> Department Leadership
                        </span>
                        <div className="w-0.5 h-4 bg-gradient-to-b from-[#0A4DA3] to-slate-300 dark:to-slate-700" />
                      </div>
                    )}

                    {/* Department Heads Grid */}
                    {deptL.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {deptL.map((leader) => {
                          const rawImg = leader.image_url || leader.photo_or_initials;
                          const photoUrl = transformGoogleDriveUrl(rawImg);
                          const hasImage = photoUrl && (
                            photoUrl.startsWith('http') ||
                            photoUrl.startsWith('/') ||
                            photoUrl.startsWith('data:')
                          );

                          return (
                            <div
                              key={leader.id}
                              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 relative overflow-hidden"
                            >
                              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#003366] to-[#004b93]" />
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl overflow-hidden relative shrink-0 p-0.5 bg-slate-100 dark:bg-slate-800 border border-blue-500/30">
                                  {hasImage ? (
                                    <img
                                      src={photoUrl}
                                      alt={leader.name}
                                      onError={(e) => {
                                        (e.target as HTMLElement).style.display = 'none';
                                        const parent = (e.target as HTMLElement).parentElement;
                                        if (parent && !parent.querySelector('.fallback-dept')) {
                                          const fb = document.createElement('div');
                                          fb.className = 'fallback-dept w-full h-full rounded-lg bg-gradient-to-br from-[#003366] to-[#004b93] text-amber-300 font-black text-sm flex items-center justify-center font-serif';
                                          fb.innerText = leader.name ? leader.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'SD';
                                          parent.appendChild(fb);
                                        }
                                      }}
                                      className="w-full h-full rounded-lg object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div className="w-full h-full rounded-lg bg-gradient-to-br from-[#003366] to-[#004b93] text-amber-300 font-black text-sm flex items-center justify-center font-serif">
                                      {leader.name ? leader.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'SD'}
                                    </div>
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                                    {leader.name}
                                  </h4>
                                  <p className="text-[11px] font-extrabold text-[#004b93] dark:text-blue-400 uppercase truncate">
                                    {leader.role[previewLang] || leader.role.en}
                                  </p>
                                  {leader.department && (
                                    <span className="inline-block text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-300 font-bold px-2 py-0.5 rounded mt-0.5 truncate">
                                      {leader.department[previewLang] || leader.department.en}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {leader.sub_skills && leader.sub_skills.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                                  {leader.sub_skills.slice(0, 2).map((s, idx) => (
                                    <span key={idx} className="text-[10px] bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded font-semibold border border-slate-200 dark:border-slate-700">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
