import React, { useState } from 'react';
import {
  Code2, Terminal, Layers, ShieldCheck, CheckCircle2, Copy, Download, Sparkles, Building2, ExternalLink, Zap, Key, FileCode, Check, Cpu
} from 'lucide-react';
import developerService, { DeveloperSDKSnippet, PartnerPublisherProfile, PackageValidationReport } from '../services/developerService';
import { OFFICIAL_PACKAGES } from '../services/ecosystemService';
import { useLanguage } from './LanguageContext';

export default function DeveloperEcosystemStudio() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'sdk' | 'scaffold' | 'validator' | 'publishers' | 'marketplace'>('sdk');
  const [snippets, setSnippets] = useState<DeveloperSDKSnippet[]>(developerService.getSDKSnippets());
  const [publishers, setPublishers] = useState<PartnerPublisherProfile[]>(developerService.getPublishers());
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Scaffolding generator state
  const [scaffoldName, setScaffoldName] = useState('');
  const [scaffoldCategory, setScaffoldCategory] = useState<'Operations' | 'Finance' | 'Manufacturing' | 'Portals'>('Operations');
  const [generatedCode, setGeneratedCode] = useState<{ packageJson: string; manifestTs: string } | null>(null);

  // CLI Validator state
  const [validatePkgName, setValidatePkgName] = useState('turnkey-fitout-os');
  const [validationReport, setValidationReport] = useState<PackageValidationReport | null>(null);
  const [validating, setValidating] = useState(false);

  const handleCopy = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 3000);
  };

  const handleGenerateScaffold = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scaffoldName.trim()) return;
    const res = developerService.generateScaffoldingTemplate(scaffoldName.trim(), scaffoldCategory);
    setGeneratedCode(res);
  };

  const handleRunValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePkgName.trim()) return;
    setValidating(true);
    setValidationReport(null);
    setTimeout(async () => {
      const rep = await developerService.validatePackage(validatePkgName.trim());
      setValidationReport(rep);
      setValidating(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-white dark:bg-[#101828] rounded-3xl border border-black/5 dark:border-white/10 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary dark:text-accent">
              <Code2 className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-dark dark:text-white">{t('developer.title', 'SDY Enterprise Developer Platform & Marketplace v22.0')}</h2>
          </div>
          <p className="text-xs text-dark/60 dark:text-white/60 mt-1">
            {t('developer.subtitle', 'Build, publish, validate, and install enterprise packages without modifying the EDOS Platform Kernel.')}
          </p>
        </div>

        <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          {t('developer.status_active', 'Developer Ecosystem Active')}
        </span>
      </div>

      {/* Sub Navigation */}
      <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/10 pb-3 overflow-x-auto">
        {[
          { id: 'sdk', label: t('developer.tab.sdk', 'TypeScript & REST SDK'), icon: Code2 },
          { id: 'scaffold', label: t('developer.tab.scaffold', 'Package Scaffolding Generator'), icon: FileCode },
          { id: 'validator', label: t('developer.tab.validator', 'CLI Security & Package Validator'), icon: Terminal },
          { id: 'publishers', label: t('developer.tab.publishers', 'Certified Publisher Directory'), icon: Building2 },
          { id: 'marketplace', label: t('developer.tab.marketplace', 'Enterprise Marketplace Registry'), icon: Layers },
        ].map(tTab => {
          const Icon = tTab.icon;
          const isActive = activeTab === tTab.id;
          return (
            <button
              key={tTab.id}
              onClick={() => setActiveTab(tTab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-black/5 dark:bg-white/5 text-dark/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tTab.label}
            </button>
          );
        })}
      </div>

      {/* 1. TYPESCRIPT & REST SDK VIEW */}
      {activeTab === 'sdk' && (
        <div className="space-y-6 animate-fadeIn">
          {snippets.map((snip, idx) => (
            <div key={idx} className="p-6 bg-white dark:bg-[#101828] rounded-3xl border border-black/5 dark:border-white/10 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="px-2.5 py-0.5 bg-primary/10 text-primary dark:text-accent font-mono text-[10px] font-bold rounded-md">
                    {snip.category}
                  </span>
                  <h3 className="font-bold text-sm text-dark dark:text-white mt-1">{snip.title}</h3>
                  <p className="text-xs text-dark/60 dark:text-white/60">{snip.description}</p>
                </div>

                <button
                  onClick={() => handleCopy(snip.code, idx)}
                  className="px-3 py-1.5 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-dark dark:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      {t('developer.copied', 'Copied!')}
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      {t('developer.copy_code', 'Copy Code')}
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 bg-black/90 text-emerald-400 font-mono text-xs rounded-2xl border border-white/10 overflow-x-auto">
                <pre>{snip.code}</pre>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. PACKAGE SCAFFOLDING GENERATOR */}
      {activeTab === 'scaffold' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Form */}
          <div className="p-6 bg-white dark:bg-[#101828] rounded-3xl border border-black/5 dark:border-white/10 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-dark dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              {t('developer.scaffold.title', 'Scaffold Custom Package')}
            </h3>

            <form onSubmit={handleGenerateScaffold} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-dark/60 dark:text-white/60 uppercase mb-1">
                  {t('developer.scaffold.package_title', 'Package Title')}
                </label>
                <input
                  type="text"
                  placeholder={t('developer.scaffold.placeholder', 'e.g. Concrete Pumping Yield OS')}
                  value={scaffoldName}
                  onChange={(e) => setScaffoldName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-dark/60 dark:text-white/60 uppercase mb-1">
                  {t('developer.scaffold.category', 'Business Domain Category')}
                </label>
                <select
                  value={scaffoldCategory}
                  onChange={(e) => setScaffoldCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs font-bold text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Operations">{t('developer.cat.operations', 'Operations & Construction')}</option>
                  <option value="Manufacturing">{t('developer.cat.manufacturing', 'Manufacturing & Factory')}</option>
                  <option value="Finance">{t('developer.cat.finance', 'Finance & Claims')}</option>
                  <option value="Portals">{t('developer.cat.portals', 'Portals & Extensions')}</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <FileCode className="w-4 h-4" />
                {t('developer.scaffold.btn_generate', 'Generate Package Boilerplate')}
              </button>
            </form>
          </div>

          {/* Generated Code Preview */}
          <div className="lg:col-span-2 p-6 bg-white dark:bg-[#101828] rounded-3xl border border-black/5 dark:border-white/10 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-dark dark:text-white uppercase tracking-wider">
              {t('developer.scaffold.output_title', 'Scaffolded Files Output')}
            </h3>

            {!generatedCode ? (
              <div className="p-8 text-center bg-black/5 dark:bg-white/5 rounded-2xl space-y-2">
                <FileCode className="w-8 h-8 text-dark/30 dark:text-white/30 mx-auto" />
                <p className="text-xs font-bold text-dark/60 dark:text-white/60">{t('developer.scaffold.fill_form', 'Fill form to generate package files.')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-primary font-mono mb-1">package.json</p>
                  <div className="p-3 bg-black/90 text-emerald-400 font-mono text-xs rounded-2xl border border-white/10">
                    <pre>{generatedCode.packageJson}</pre>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-primary font-mono mb-1">manifest.ts</p>
                  <div className="p-3 bg-black/90 text-emerald-400 font-mono text-xs rounded-2xl border border-white/10">
                    <pre>{generatedCode.manifestTs}</pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. CLI SECURITY & PACKAGE VALIDATOR */}
      {activeTab === 'validator' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 bg-white dark:bg-[#101828] rounded-3xl border border-black/5 dark:border-white/10 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-dark dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary" />
              {t('developer.validator.title', 'CLI Security Scan & Kernel v22.0 Compatibility Validator')}
            </h3>

            <form onSubmit={handleRunValidation} className="flex gap-3">
              <input
                type="text"
                placeholder={t('developer.validator.placeholder', 'Package Name to scan (e.g. turnkey-fitout-os)...')}
                value={validatePkgName}
                onChange={(e) => setValidatePkgName(e.target.value)}
                required
                className="flex-1 px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <button
                type="submit"
                disabled={validating}
                className="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-2"
              >
                {validating ? t('developer.validator.scanning', 'Scanning...') : t('developer.validator.btn_run', 'Run Security & Signature Scan')}
              </button>
            </form>

            {validationReport && (
              <div className="p-5 bg-black/5 dark:bg-white/5 rounded-2xl space-y-3 pt-4 border border-black/5 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-dark dark:text-white font-mono">
                    {t('developer.validator.report_for', 'Audit Report for:')} {validationReport.packageName} ({validationReport.version})
                  </h4>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t('developer.validator.passed', 'Passed Certified Scan')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 bg-white dark:bg-[#101828] rounded-xl">
                    <span className="text-dark/40 dark:text-white/40 block text-[10px]">{t('developer.validator.vulns', 'Security Vulnerabilities')}</span>
                    <span className="font-bold text-emerald-500">{validationReport.securityScan}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-[#101828] rounded-xl">
                    <span className="text-dark/40 dark:text-white/40 block text-[10px]">{t('developer.validator.rsa_signature', 'RSA-4096 Signature')}</span>
                    <span className="font-bold text-primary dark:text-accent">{t('developer.validator.verified', 'Verified Authentic')}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-[#101828] rounded-xl">
                    <span className="text-dark/40 dark:text-white/40 block text-[10px]">{t('developer.validator.kernel_compat', 'Kernel Compatibility')}</span>
                    <span className="font-bold text-dark dark:text-white">{validationReport.kernelCompatibility}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. CERTIFIED PUBLISHERS DIRECTORY */}
      {activeTab === 'publishers' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
          {publishers.map(pub => (
            <div key={pub.id} className="p-5 bg-white dark:bg-[#101828] rounded-3xl border border-black/5 dark:border-white/10 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-primary/10 text-primary dark:text-accent font-bold text-[10px] rounded-md">
                    {pub.tier}
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 font-bold text-[10px] rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {t('developer.publishers.verified', 'Verified Publisher')}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-dark dark:text-white mt-2">{pub.name}</h3>
                <p className="text-xs text-dark/60 dark:text-white/60 mt-1">{pub.contactEmail}</p>

                <div className="mt-3 flex items-center justify-between text-xs font-mono">
                  <span>{t('developer.publishers.pkgs_count', 'Packages:')} {pub.publishedPackagesCount}</span>
                  <span className="font-bold text-amber-500">{t('developer.publishers.rating', 'Rating:')} ★ {pub.rating.toFixed(1)}</span>
                </div>
              </div>

              <a
                href={pub.website}
                target="_blank"
                rel="noreferrer"
                className="w-full mt-3 py-1.5 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-dark dark:text-white rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                {t('developer.publishers.website', 'Publisher Website')}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      )}

      {/* 5. ENTERPRISE MARKETPLACE REGISTRY */}
      {activeTab === 'marketplace' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
          {OFFICIAL_PACKAGES.map(pkg => (
            <div key={pkg.id} className="p-5 bg-white dark:bg-[#101828] rounded-3xl border border-black/5 dark:border-white/10 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-black/5 dark:bg-white/5 text-dark/60 dark:text-white/60 font-mono text-[10px] font-bold rounded-md">
                    {pkg.category} | {pkg.version}
                  </span>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {pkg.status}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-dark dark:text-white mt-2">{pkg.name}</h3>
                <p className="text-xs text-dark/70 dark:text-white/70 leading-relaxed mt-1">{pkg.description}</p>
              </div>

              <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[10px] font-mono">
                <span className="text-dark/50 dark:text-white/50">{pkg.publisher}</span>
                <span className="text-emerald-500 font-bold">EDOS v22.0 Certified</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
