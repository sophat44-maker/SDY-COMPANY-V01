import React, { useState } from 'react';
import {
  History, ShieldCheck, GitPullRequest, Sliders, Activity, Database, CheckCircle2, AlertTriangle, Play, RefreshCw, Layers, Lock, Power, Check, Zap, Server, Shield
} from 'lucide-react';
import lifecycle, { ManagedAssetLifecycle, ChangeManagementRequest, EnterpriseFeatureFlag, SLAMetricSummary } from '../services/lifecycleService';
import { useLanguage } from './LanguageContext';

export default function PlatformLifecycleStudio() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'lifecycle' | 'changes' | 'feature_flags' | 'sla_dr' | 'analytics'>('lifecycle');
  const [assets, setAssets] = useState<ManagedAssetLifecycle[]>(lifecycle.getAssets());
  const [changeRequests, setChangeRequests] = useState<ChangeManagementRequest[]>(lifecycle.getChangeRequests());
  const [featureFlags, setFeatureFlags] = useState<EnterpriseFeatureFlag[]>(lifecycle.getFeatureFlags());
  const [slaMetrics, setSlaMetrics] = useState<SLAMetricSummary[]>(lifecycle.getSLAMetrics());
  const [drFeedback, setDrFeedback] = useState<string | null>(null);

  const handlePromote = async (id: string, newState: any) => {
    await lifecycle.promoteAssetLifecycle(id, newState, 'CTO Platform Board');
    setAssets([...lifecycle.getAssets()]);
  };

  const handleFlagToggle = async (id: string, emergency = false) => {
    await lifecycle.toggleFeatureFlag(id, emergency);
    setFeatureFlags([...lifecycle.getFeatureFlags()]);
  };

  const handleCreateDRSnapshot = async () => {
    const res = await lifecycle.createDisasterRecoverySnapshot();
    setDrFeedback(`Snapshot "${res.snapshotId}" generated & verified successfully in ${res.rtoEstimateSeconds}s!`);
    setTimeout(() => setDrFeedback(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-white dark:bg-[#101828] rounded-3xl border border-black/5 dark:border-white/10 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary dark:text-accent">
              <History className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-dark dark:text-white">{t('lifecycle.title', 'SDY Enterprise Platform Operations v21.0')}</h2>
          </div>
          <p className="text-xs text-dark/60 dark:text-white/60 mt-1">
            {t('lifecycle.subtitle', 'Asset Lifecycle Governance, Change Management (RFC), Feature Flags, Emergency Kill Switches & Disaster Recovery.')}
          </p>
        </div>

        <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          {t('lifecycle.status_governed', 'Continuous Operations Governed')}
        </span>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/10 pb-3 overflow-x-auto">
        {[
          { id: 'lifecycle', label: t('lifecycle.tab.governance', 'Asset Lifecycle Governance'), icon: Layers },
          { id: 'changes', label: t('lifecycle.tab.changes', 'Change Management & RFCs'), icon: GitPullRequest },
          { id: 'feature_flags', label: t('lifecycle.tab.feature_flags', 'Feature Flags & Kill Switches'), icon: Sliders },
          { id: 'sla_dr', label: t('lifecycle.tab.sla_dr', 'SLA & Disaster Recovery'), icon: ShieldCheck },
          { id: 'analytics', label: t('lifecycle.tab.analytics', 'Platform Operations Analytics'), icon: Activity },
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

      {/* 1. ASSET LIFECYCLE GOVERNANCE */}
      {activeTab === 'lifecycle' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-6 bg-white dark:bg-[#101828] rounded-3xl border border-black/5 dark:border-white/10 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-dark dark:text-white uppercase tracking-wider flex items-center justify-between">
              <span>{t('lifecycle.asset_header', 'Managed Enterprise Platform Assets')}</span>
              <span className="text-xs font-normal text-primary">{assets.length} {t('lifecycle.assets_registered', 'Assets Registered')}</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-dark dark:text-white">
                <thead className="bg-black/5 dark:bg-white/5 font-bold uppercase text-[10px] text-dark/60 dark:text-white/60">
                  <tr>
                    <th className="p-3 rounded-l-xl">{t('lifecycle.col_asset_name', 'Asset Name')}</th>
                    <th className="p-3">{t('lifecycle.col_type', 'Type')}</th>
                    <th className="p-3">{t('lifecycle.col_version', 'Version')}</th>
                    <th className="p-3">{t('lifecycle.col_owner', 'Owner')}</th>
                    <th className="p-3">{t('lifecycle.col_state', 'Lifecycle State')}</th>
                    <th className="p-3 rounded-r-xl text-right">{t('lifecycle.col_promote', 'Promote Lifecycle')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {assets.map(asset => (
                    <tr key={asset.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="p-3 font-bold">{asset.assetName}</td>
                      <td className="p-3 font-mono text-[10px]">
                        <span className="px-2 py-0.5 bg-black/5 dark:bg-white/5 rounded-md">
                          {asset.assetType}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-primary dark:text-accent">{asset.version}</td>
                      <td className="p-3 text-dark/70 dark:text-white/70">{asset.owner}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          asset.state === 'Released' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                          asset.state === 'Approved' ? 'bg-primary/10 text-primary border border-primary/20' :
                          asset.state === 'Review' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                          'bg-black/5 text-dark/60 dark:text-white/60'
                        }`}>
                          {asset.state}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <select
                          value={asset.state}
                          onChange={(e) => handlePromote(asset.id, e.target.value)}
                          className="px-2.5 py-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-[10px] font-bold text-dark dark:text-white focus:outline-none cursor-pointer"
                        >
                          <option value="Draft">Draft</option>
                          <option value="Review">Review</option>
                          <option value="Approved">Approved</option>
                          <option value="Released">Released</option>
                          <option value="Deprecated">Deprecated</option>
                          <option value="Archived">Archived</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. CHANGE MANAGEMENT & RFCS */}
      {activeTab === 'changes' && (
        <div className="space-y-4 animate-fadeIn">
          {changeRequests.map(cr => (
            <div key={cr.id} className="p-6 bg-white dark:bg-[#101828] rounded-3xl border border-black/5 dark:border-white/10 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-primary/10 text-primary dark:text-accent font-mono text-xs font-bold rounded-lg">
                    {cr.id}
                  </span>
                  <h3 className="font-bold text-sm text-dark dark:text-white">{cr.title}</h3>
                </div>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full">
                  {cr.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-2">
                <div className="p-3 bg-black/5 dark:bg-white/5 rounded-2xl">
                  <span className="font-bold text-dark/50 dark:text-white/50">{t('lifecycle.impact_analysis', 'Impact Analysis:')}</span>
                  <p className="mt-1 text-dark/80 dark:text-white/80">{cr.impactAnalysis}</p>
                </div>
                <div className="p-3 bg-black/5 dark:bg-white/5 rounded-2xl">
                  <span className="font-bold text-dark/50 dark:text-white/50">{t('lifecycle.migration_plan', 'Migration Plan:')}</span>
                  <p className="mt-1 text-dark/80 dark:text-white/80">{cr.migrationPlan}</p>
                </div>
                <div className="p-3 bg-black/5 dark:bg-white/5 rounded-2xl">
                  <span className="font-bold text-dark/50 dark:text-white/50">{t('lifecycle.rollback_strategy', 'Rollback Strategy:')}</span>
                  <p className="mt-1 text-emerald-600 dark:text-emerald-400 font-medium">{cr.rollbackPlan}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. FEATURE FLAGS & EMERGENCY KILL SWITCHES */}
      {activeTab === 'feature_flags' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-6 bg-white dark:bg-[#101828] rounded-3xl border border-black/5 dark:border-white/10 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-dark dark:text-white uppercase tracking-wider flex items-center justify-between">
              <span>{t('lifecycle.ff_title', 'Enterprise Feature Flags & Circuit Breakers')}</span>
              <span className="text-xs font-normal text-amber-500 font-bold">{t('lifecycle.ff_active', 'Emergency Controls Active')}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featureFlags.map(flag => (
                <div key={flag.id} className="p-5 bg-black/5 dark:bg-white/5 rounded-3xl space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-primary dark:text-accent">{flag.flagKey}</span>
                      <span className="px-2 py-0.5 bg-black/5 dark:bg-white/5 rounded-md text-[10px] font-bold">
                        {flag.scope} {t('lifecycle.scope', 'Scope')}
                      </span>
                    </div>

                    <p className="text-xs text-dark/70 dark:text-white/70 mt-2 leading-relaxed">{flag.description}</p>

                    <div className="mt-3 flex items-center justify-between text-xs font-mono">
                      <span>{t('lifecycle.rollout', 'Rollout:')} {flag.rolloutPercentage}%</span>
                      <span>{t('lifecycle.status_label', 'Status:')} {flag.isEnabled ? t('lifecycle.enabled', 'ENABLED') : t('lifecycle.disabled', 'DISABLED')}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleFlagToggle(flag.id, false)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                        flag.isEnabled ? 'bg-emerald-500 text-white' : 'bg-black/10 dark:bg-white/10 text-dark dark:text-white'
                      }`}
                    >
                      {flag.isEnabled ? t('lifecycle.active', 'Active') : t('lifecycle.enable_flag', 'Enable Flag')}
                    </button>

                    <button
                      onClick={() => handleFlagToggle(flag.id, true)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1 ${
                        flag.emergencyKillSwitchActive
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      {flag.emergencyKillSwitchActive ? t('lifecycle.kill_switch_active', 'Kill Switch Active') : t('lifecycle.emergency_kill', 'Emergency Kill')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. SLA & DISASTER RECOVERY */}
      {activeTab === 'sla_dr' && (
        <div className="space-y-6 animate-fadeIn">
          {/* SLA Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {slaMetrics.map((sla, i) => (
              <div key={i} className="p-5 bg-white dark:bg-[#101828] rounded-3xl border border-black/5 dark:border-white/10 shadow-sm space-y-2">
                <span className="text-[10px] font-bold text-dark/40 dark:text-white/40 uppercase">{sla.metric}</span>
                <div className="flex items-baseline justify-between">
                  <p className="text-xl font-black text-emerald-500">{sla.currentValue}</p>
                  <span className="text-[10px] font-mono text-dark/50 dark:text-white/50">{t('lifecycle.target', 'Target:')} {sla.targetSLA}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Disaster Recovery Trigger */}
          <div className="p-6 bg-white dark:bg-[#101828] rounded-3xl border border-black/5 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-dark dark:text-white uppercase tracking-wider">
                  {t('lifecycle.dr_title', 'Automated Disaster Recovery & Snapshot Generator')}
                </h3>
                <p className="text-xs text-dark/60 dark:text-white/60 mt-0.5">
                  {t('lifecycle.dr_subtitle', 'Point-in-Time metadata & Google Sheets state snapshot verification.')}
                </p>
              </div>

              <button
                onClick={handleCreateDRSnapshot}
                className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-2"
              >
                <Zap className="w-4 h-4 text-accent" />
                {t('lifecycle.btn_generate_dr', 'Generate DR Snapshot Now')}
              </button>
            </div>

            {drFeedback && (
              <div className="p-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-2xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {drFeedback}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. OPERATIONS ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="p-6 bg-white dark:bg-[#101828] rounded-3xl border border-black/5 dark:border-white/10 shadow-sm space-y-4 animate-fadeIn">
          <h3 className="text-sm font-bold text-dark dark:text-white uppercase tracking-wider">
            {t('lifecycle.analytics_title', 'Enterprise Digital Operating System Metrics')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl space-y-1">
              <span className="text-dark/50 dark:text-white/50 block text-[10px] uppercase font-bold">{t('lifecycle.tenants_label', 'Active Multi-Tenants')}</span>
              <span className="text-2xl font-black text-primary dark:text-accent">3 {t('lifecycle.orgs_count', 'Organizations')}</span>
            </div>
            <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl space-y-1">
              <span className="text-dark/50 dark:text-white/50 block text-[10px] uppercase font-bold">{t('lifecycle.schema_growth', 'Metadata Schema Growth')}</span>
              <span className="text-2xl font-black text-emerald-500">+18% MoM</span>
            </div>
            <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl space-y-1">
              <span className="text-dark/50 dark:text-white/50 block text-[10px] uppercase font-bold">{t('lifecycle.deployments', 'Zero-Downtime Deployments')}</span>
              <span className="text-2xl font-black text-dark dark:text-white">100% {t('lifecycle.success_rate', 'Success Rate')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
