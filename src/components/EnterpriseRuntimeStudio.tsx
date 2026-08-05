import React, { useState } from 'react';
import {
  Cpu, Play, RefreshCw, Zap, Clock, ShieldCheck, Activity, Terminal, Code2, AlertCircle, CheckCircle2, Layers, Server, Search, Database
} from 'lucide-react';
import runtimeEngine, { CompiledRuntimeEntity, ScheduledJob, SystemHealthNode } from '../services/runtimeEngine';
import { useLanguage } from './LanguageContext';

export default function EnterpriseRuntimeStudio() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'compiler' | 'scheduler' | 'health' | 'debugger'>('compiler');
  const [compiledList, setCompiledList] = useState<CompiledRuntimeEntity[]>(runtimeEngine.getCompiledEntities());
  const [schedulerJobs, setSchedulerJobs] = useState<ScheduledJob[]>(runtimeEngine.getSchedulerQueue());
  const [healthNodes, setHealthNodes] = useState<SystemHealthNode[]>(runtimeEngine.getSystemHealth());
  const [testEntityName, setTestEntityName] = useState('');
  const [compileLog, setCompileLog] = useState<string[]>([]);
  const [autoHealingMsg, setAutoHealingMsg] = useState<string | null>(null);

  // Compile Dynamic Metadata Entity Test
  const handleCompileTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEntityName.trim()) return;

    const name = testEntityName.trim();
    setCompileLog(prev => [`[COMPILER] Initializing AST parser for entity: "${name}"...`, ...prev]);
    
    setTimeout(() => {
      setCompileLog(prev => [`[COMPILER] Resolving field types & relationships...`, ...prev]);
    }, 200);

    setTimeout(() => {
      const compiled = runtimeEngine.compileMetadataEntity({
        name,
        tableKey: `tbl_${name.toLowerCase()}`,
        fields: [{ name: 'id' }, { name: 'code' }, { name: 'title' }, { name: 'status' }],
        relationships: [{ target: 'Organizations' }]
      });
      setCompiledList(runtimeEngine.getCompiledEntities());
      setCompileLog(prev => [`[COMPILER] ✅ Successfully compiled "${name}" into runtime memory object!`, ...prev]);
      setTestEntityName('');
    }, 500);
  };

  const handleSelfHealing = async (subsystem: string) => {
    await runtimeEngine.triggerAutoRecovery(subsystem);
    setHealthNodes([...runtimeEngine.getSystemHealth()]);
    setAutoHealingMsg(`Auto-recovery completed for ${subsystem}. System restored to optimal health.`);
    setTimeout(() => setAutoHealingMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-white dark:bg-[#101828] rounded-3xl border border-black/5 dark:border-white/10 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary dark:text-accent">
              <Cpu className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-dark dark:text-white">{t('runtime.title', 'SDY Enterprise Platform Runtime v20.0')}</h2>
          </div>
          <p className="text-xs text-dark/60 dark:text-white/60 mt-1">
            {t('runtime.subtitle', 'Dynamic Metadata Compiler, Autonomous Scheduler, Self-Healing Operations, and Runtime Inspector Console.')}
          </p>
        </div>

        <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          {t('runtime.status_active', 'Runtime Active & Autonomous')}
        </span>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/10 pb-3 overflow-x-auto">
        {[
          { id: 'compiler', label: t('runtime.tab.compiler', 'Metadata Runtime Compiler'), icon: Code2 },
          { id: 'scheduler', label: t('runtime.tab.scheduler', 'Autonomous Scheduler & Queue'), icon: Clock },
          { id: 'health', label: t('runtime.tab.health', 'Self-Healing & System Health'), icon: ShieldCheck },
          { id: 'debugger', label: t('runtime.tab.debugger', 'Runtime Inspector & Debugger'), icon: Terminal },
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

      {/* 1. METADATA COMPILER VIEW */}
      {activeTab === 'compiler' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Form & Actions */}
          <div className="p-6 bg-white dark:bg-[#101828] rounded-3xl border border-black/5 dark:border-white/10 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-dark dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              {t('runtime.compiler.title_on_demand', 'On-Demand Metadata Compilation')}
            </h3>
            <p className="text-xs text-dark/70 dark:text-white/70 leading-relaxed">
              {t('runtime.compiler.desc_on_demand', 'Compile raw JSON entity definitions into executable runtime objects with auto-generated REST endpoints and memory bindings.')}
            </p>

            <form onSubmit={handleCompileTest} className="space-y-3 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-dark/60 dark:text-white/60 uppercase mb-1">
                  {t('runtime.compiler.label_entity_name', 'Entity Name to Compile')}
                </label>
                <input
                  type="text"
                  placeholder="e.g. SubcontractorClaim"
                  value={testEntityName}
                  onChange={(e) => setTestEntityName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                {t('runtime.compiler.btn_compile', 'Compile to Runtime Memory')}
              </button>
            </form>

            {/* Console Log Stream */}
            <div className="mt-4 p-4 bg-black/90 text-emerald-400 font-mono text-[10px] rounded-2xl h-48 overflow-y-auto space-y-1 border border-white/10">
              <div className="text-white/40 pb-1 border-b border-white/10">{t('runtime.compiler.stream_log_header', '-- METADATA COMPILER STREAM LOG --')}</div>
              {compileLog.length === 0 && <p className="text-white/30 italic">{t('runtime.compiler.ready_msg', 'Ready for compilation commands...')}</p>}
              {compileLog.map((log, i) => (
                <p key={i}>{log}</p>
              ))}
            </div>
          </div>

          {/* Compiled Entities Grid */}
          <div className="lg:col-span-2 p-6 bg-white dark:bg-[#101828] rounded-3xl border border-black/5 dark:border-white/10 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-dark dark:text-white uppercase tracking-wider flex items-center justify-between">
              <span>{t('runtime.compiler.active_objects_header', 'Active Compiled Runtime Objects')}</span>
              <span className="text-xs font-normal text-primary">{compiledList.length} {t('runtime.compiler.objects_loaded', 'Objects Loaded')}</span>
            </h3>

            {compiledList.length === 0 ? (
              <div className="p-8 text-center bg-black/5 dark:bg-white/5 rounded-2xl space-y-2">
                <Database className="w-8 h-8 text-dark/30 dark:text-white/30 mx-auto" />
                <p className="text-xs font-bold text-dark/60 dark:text-white/60">{t('runtime.compiler.no_objects', 'No dynamic runtime objects compiled yet.')}</p>
                <p className="text-[10px] text-dark/40 dark:text-white/40">{t('runtime.compiler.no_objects_help', 'Use the compiler panel on the left or create entities in Entity Builder.')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {compiledList.map(item => (
                  <div key={item.entityName} className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-primary dark:text-accent font-mono">{item.entityName}</span>
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] rounded-md">
                        {item.status}
                      </span>
                    </div>

                    <p className="text-[10px] text-dark/60 dark:text-white/60">{t('runtime.compiler.table_label', 'Table:')} <code className="font-mono text-dark dark:text-white">{item.tableKey}</code></p>
                    
                    <div className="text-[10px] space-y-1 pt-1 border-t border-black/5 dark:border-white/5">
                      <p className="font-bold text-dark/50 dark:text-white/50 uppercase">{t('runtime.compiler.generated_endpoints', 'Generated API Endpoints:')}</p>
                      {item.generatedAPIRoutes.map((r, i) => (
                        <p key={i} className="font-mono text-[9px] text-emerald-600 dark:text-emerald-400">{r}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. AUTONOMOUS SCHEDULER VIEW */}
      {activeTab === 'scheduler' && (
        <div className="p-6 bg-white dark:bg-[#101828] rounded-3xl border border-black/5 dark:border-white/10 shadow-sm space-y-4 animate-fadeIn">
          <h3 className="text-sm font-bold text-dark dark:text-white uppercase tracking-wider flex items-center justify-between">
            <span>{t('runtime.scheduler.title', 'Autonomous Background Job Scheduler & Queue')}</span>
            <span className="text-xs font-normal text-emerald-500">{t('runtime.scheduler.daemon_active', 'Cron Daemon Active')}</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-dark dark:text-white">
              <thead className="bg-black/5 dark:bg-white/5 font-bold uppercase text-[10px] text-dark/60 dark:text-white/60">
                <tr>
                  <th className="p-3 rounded-l-xl">{t('runtime.scheduler.col_job_name', 'Job Name')}</th>
                  <th className="p-3">{t('runtime.scheduler.col_cron', 'Cron')}</th>
                  <th className="p-3">{t('runtime.scheduler.col_target_module', 'Target Module')}</th>
                  <th className="p-3">{t('runtime.scheduler.col_priority', 'Priority')}</th>
                  <th className="p-3">{t('runtime.scheduler.col_status', 'Status')}</th>
                  <th className="p-3 rounded-r-xl">{t('runtime.scheduler.col_next_exec', 'Next Execution')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5 font-mono">
                {schedulerJobs.map(job => (
                  <tr key={job.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="p-3 font-bold font-sans">{job.name}</td>
                    <td className="p-3 text-primary dark:text-accent font-bold">{job.cronExpression}</td>
                    <td className="p-3 font-sans">{job.targetModule}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        job.priority === 'High' ? 'bg-amber-500/10 text-amber-600' : 'bg-black/5 text-dark/60 dark:text-white/60'
                      }`}>
                        {job.priority}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] rounded-md">
                        {job.status}
                      </span>
                    </td>
                    <td className="p-3 text-dark/50 dark:text-white/50">{new Date(job.nextExecution).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. SELF-HEALING & HEALTH VIEW */}
      {activeTab === 'health' && (
        <div className="space-y-4 animate-fadeIn">
          {autoHealingMsg && (
            <div className="p-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-2xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {autoHealingMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthNodes.map(node => (
              <div key={node.subsystem} className="p-5 bg-white dark:bg-[#101828] rounded-3xl border border-black/5 dark:border-white/10 shadow-sm space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-dark dark:text-white">{node.subsystem}</h4>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] rounded-md">
                      {node.status}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div className="p-2 bg-black/5 dark:bg-white/5 rounded-xl">
                      <span className="text-dark/40 dark:text-white/40 block">{t('runtime.health.latency', 'Latency')}</span>
                      <span className="font-bold text-dark dark:text-white">{node.latencyMs} ms</span>
                    </div>
                    <div className="p-2 bg-black/5 dark:bg-white/5 rounded-xl">
                      <span className="text-dark/40 dark:text-white/40 block">{t('runtime.health.error_rate', 'Error Rate')}</span>
                      <span className="font-bold text-emerald-500">{node.errorRate}</span>
                    </div>
                  </div>

                  {node.autoRecoveryAction && (
                    <p className="mt-2 text-[10px] text-dark/60 dark:text-white/60 italic">
                      {t('runtime.health.action', 'Action:')} {node.autoRecoveryAction}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleSelfHealing(node.subsystem)}
                  className="w-full mt-3 py-1.5 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-dark dark:text-white rounded-xl text-[10px] font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3 text-primary" />
                  {t('runtime.health.btn_trigger', 'Trigger Auto-Recovery Test')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. RUNTIME DEBUGGER VIEW */}
      {activeTab === 'debugger' && (
        <div className="p-6 bg-white dark:bg-[#101828] rounded-3xl border border-black/5 dark:border-white/10 shadow-sm space-y-4 animate-fadeIn">
          <h3 className="text-sm font-bold text-dark dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            {t('runtime.debugger.title', 'Developer Runtime Inspector & State Monitor')}
          </h3>

          <div className="p-4 bg-black/95 text-emerald-400 font-mono text-xs rounded-2xl border border-white/10 space-y-3">
            <p className="text-white/50">// EDOS Runtime State Inspector v20.0</p>
            <p className="text-amber-400">{'{\n  "environment": "production-cloud-run",\n  "nodeVersion": "v22.x",\n  "activeModulePackages": 7,\n  "compiledEntitiesInRAM": ' + compiledList.length + ',\n  "scheduledJobsRunning": ' + schedulerJobs.length + ',\n  "selfHealingStatus": "ACTIVE_MONITORING"\n}'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
