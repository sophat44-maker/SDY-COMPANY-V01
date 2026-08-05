import React, { useState } from 'react';
import { PageSectionConfig } from '../types';
import { api } from '../services/api';
import { Layout, Eye, EyeOff, ArrowUp, ArrowDown, Save, RefreshCw, Check, Code, Palette, Settings2 } from 'lucide-react';
import { useLanguage } from './LanguageContext';

interface DynamicSectionBuilderProps {
  sections: PageSectionConfig[];
  onSectionsChange: (updated: PageSectionConfig[]) => void;
}

export const DEFAULT_HOMEPAGE_SECTIONS: PageSectionConfig[] = [
  { id: 'sec_hero', type: 'hero', title: 'Hero Banner Slider', visible: true, sortOrder: 1, padding: 'py-0' },
  { id: 'sec_services', type: 'services', title: 'Core Services & Fabrication Capabilities', subtitle: 'Turnkey interior fit-out, structural steel & manufacturing', visible: true, sortOrder: 2, padding: 'py-20' },
  { id: 'sec_products', type: 'products', title: 'Architectural & Interior Fit-Out Catalog', subtitle: 'Acoustic panels, fire doors, luxury partitions & millwork', visible: true, sortOrder: 3, padding: 'py-24' },
  { id: 'sec_projects', type: 'projects', title: 'Featured Enterprise Portfolio', subtitle: 'Commercial offices, luxury hotels & architectural projects', visible: true, sortOrder: 4, padding: 'py-24' },
  { id: 'sec_about', type: 'about', title: 'About SDY C&I', subtitle: 'Over 15 years of manufacturing excellence & turnkey fit-outs', visible: true, sortOrder: 5, padding: 'py-20' },
  { id: 'sec_team', type: 'team', title: 'Executive Leadership & Project Engineers', visible: true, sortOrder: 6, padding: 'py-20' },
  { id: 'sec_faq', type: 'faq', title: 'Frequently Asked Questions', visible: true, sortOrder: 7, padding: 'py-16' },
  { id: 'sec_downloads', type: 'downloads', title: 'Architectural Specification Downloads', visible: true, sortOrder: 8, padding: 'py-16' },
  { id: 'sec_testimonials', type: 'testimonials', title: 'Client Reviews & Endorsements', visible: true, sortOrder: 9, padding: 'py-16' },
  { id: 'sec_partners', type: 'partners', title: 'Enterprise Global Partners', visible: true, sortOrder: 10, padding: 'py-12' },
];

export default function DynamicSectionBuilder({ sections, onSectionsChange }: DynamicSectionBuilderProps) {
  const { t } = useLanguage();
  const [sectionList, setSectionList] = useState<PageSectionConfig[]>(sections.length > 0 ? sections : DEFAULT_HOMEPAGE_SECTIONS);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleToggleVisibility = (id: string) => {
    const updated = sectionList.map(s => s.id === id ? { ...s, visible: !s.visible } : s);
    setSectionList(updated);
    onSectionsChange(updated);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === sectionList.length - 1)) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...sectionList];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Recalculate sortOrder
    const reordered = updated.map((item, idx) => ({ ...item, sortOrder: idx + 1 }));
    setSectionList(reordered);
    onSectionsChange(reordered);
  };

  const handleUpdateTitle = (id: string, title: string, subtitle?: string) => {
    const updated = sectionList.map(s => s.id === id ? { ...s, title, subtitle } : s);
    setSectionList(updated);
    onSectionsChange(updated);
  };

  const handleSaveToSheets = async () => {
    setIsSaving(true);
    for (const sec of sectionList) {
      await api.saveRecord('WebsiteSections', 'id', sec);
    }
    await api.logAudit('Admin', 'Update Page Layout', 'WebsiteSections', 'homepage');
    setIsSaving(false);
    setFeedback('Website layout and section configuration saved to Google Sheets!');
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-[#101828] rounded-2xl border border-black/5 dark:border-white/10 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary dark:text-accent">
              <Layout className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-dark dark:text-white">Website Section & Layout Manager</h2>
          </div>
          <p className="text-xs text-dark/60 dark:text-white/60 mt-1">
            Reorder homepage sections, edit section headings, or toggle visibility on the fly without changing source code.
          </p>
        </div>

        <button
          onClick={handleSaveToSheets}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl shadow-md cursor-pointer transition-all disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Layout to Google Sheets
        </button>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4" />
          {feedback}
        </div>
      )}

      {/* Sections List */}
      <div className="space-y-3">
        {sectionList.map((sec, idx) => (
          <div
            key={sec.id}
            className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              sec.visible
                ? 'bg-white dark:bg-[#101828] border-black/10 dark:border-white/10 shadow-sm'
                : 'bg-black/5 dark:bg-white/5 border-dashed border-black/10 dark:border-white/10 opacity-60'
            }`}
          >
            <div className="flex items-start gap-3 flex-1">
              <span className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/10 text-dark dark:text-white font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {sec.sortOrder || idx + 1}
              </span>

              <div className="space-y-1 flex-1">
                <input
                  type="text"
                  value={sec.title}
                  onChange={(e) => handleUpdateTitle(sec.id, e.target.value, sec.subtitle)}
                  className="font-bold text-sm text-dark dark:text-white bg-transparent border-b border-transparent hover:border-black/10 dark:hover:border-white/10 focus:border-primary focus:outline-none w-full"
                />
                <input
                  type="text"
                  placeholder="Optional section subtitle..."
                  value={sec.subtitle || ''}
                  onChange={(e) => handleUpdateTitle(sec.id, sec.title, e.target.value)}
                  className="text-xs text-dark/60 dark:text-white/60 bg-transparent border-b border-transparent hover:border-black/10 dark:hover:border-white/10 focus:border-primary focus:outline-none w-full"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => handleMove(idx, 'up')}
                disabled={idx === 0}
                className="p-2 border border-black/10 dark:border-white/10 text-dark dark:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-xl disabled:opacity-30 cursor-pointer"
                title="Move Up"
              >
                <ArrowUp className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleMove(idx, 'down')}
                disabled={idx === sectionList.length - 1}
                className="p-2 border border-black/10 dark:border-white/10 text-dark dark:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-xl disabled:opacity-30 cursor-pointer"
                title="Move Down"
              >
                <ArrowDown className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleToggleVisibility(sec.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  sec.visible
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-black/10 dark:bg-white/10 text-dark/50 dark:text-white/50'
                }`}
              >
                {sec.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {sec.visible ? 'Visible' : 'Hidden'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
