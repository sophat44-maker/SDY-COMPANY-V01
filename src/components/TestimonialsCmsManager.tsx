import React, { useState, useEffect, FormEvent } from 'react';
import {
  MessageSquare, Star, Plus, CheckCircle2, XCircle, Trash2, Edit3,
  RefreshCw, Loader2, Search, Filter, ShieldCheck, Check, Sparkles, User, Building2
} from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { TestimonialItem } from '../types';
import { TESTIMONIALS } from '../data';
import { getAccessToken } from '../services/googleAuthService';
import { syncTestimonialsToSheet } from '../services/googleSheetsDirectService';

export default function TestimonialsCmsManager() {
  const { t, testimonials: contextTestimonials, refreshAllData } = useLanguage();

  const [testimonialsList, setTestimonialsList] = useState<TestimonialItem[]>([]);
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'FEATURED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit / Add Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<TestimonialItem | null>(null);

  // Form Fields
  const [author, setAuthor] = useState('');
  const [authorKh, setAuthorKh] = useState('');
  const [authorKo, setAuthorKo] = useState('');
  const [role, setRole] = useState('');
  const [roleKh, setRoleKh] = useState('');
  const [roleKo, setRoleKo] = useState('');
  const [company, setCompany] = useState('');
  const [companyKh, setCompanyKh] = useState('');
  const [companyKo, setCompanyKo] = useState('');
  const [quoteEn, setQuoteEn] = useState('');
  const [quoteKh, setQuoteKh] = useState('');
  const [quoteKo, setQuoteKo] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [avatar, setAvatar] = useState('');
  const [status, setStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('APPROVED');
  const [isFeatured, setIsFeatured] = useState<boolean>(false);

  // Load testimonials
  useEffect(() => {
    let list: TestimonialItem[] = [];
    if (contextTestimonials && contextTestimonials.length > 0) {
      list = [...contextTestimonials];
    } else {
      list = TESTIMONIALS;
    }

    // Merge custom local reviews (e.g. pending reviews submitted by users)
    const readLocal = (key: string): TestimonialItem[] => {
      const raw = localStorage.getItem(key);
      if (raw) {
        try { return JSON.parse(raw); } catch (e) {}
      }
      return [];
    };
    const localCustom = [...readLocal('sdy_testimonials_custom'), ...readLocal('sdy_local_testimonials')];
    if (localCustom.length > 0) {
      const existingIds = new Set(list.map(i => i.id));
      const uniqueLocal = localCustom.filter((item, idx, self) =>
        !existingIds.has(item.id) && self.findIndex(t => t.id === item.id) === idx
      );
      const localMap = new Map(localCustom.map(i => [i.id, i]));
      list = list.map(i => localMap.get(i.id) || i);
      list = [...uniqueLocal, ...list];
    }

    setTestimonialsList(list);
  }, [contextTestimonials]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const persistLocally = async (newList: TestimonialItem[]) => {
    setTestimonialsList(newList);
    try {
      localStorage.setItem('sdy_testimonials_custom', JSON.stringify(newList));
      localStorage.setItem('sdy_local_testimonials', JSON.stringify(newList));
    } catch (e) {}

    window.dispatchEvent(new Event('sdy_global_db_updated'));
    window.dispatchEvent(new Event('sdy_testimonials_updated'));

    // Direct Google Sheets API Sync
    try {
      const activeSpreadsheetId = localStorage.getItem('sdy_active_spreadsheet_id');
      if (activeSpreadsheetId) {
        const token = await getAccessToken().catch(() => null);
        if (token) {
          await syncTestimonialsToSheet(token, activeSpreadsheetId, newList);
        }
      }
    } catch (err) {
      console.warn('Direct Google Sheet sync error in TestimonialsCmsManager:', err);
    }
  };

  // Helper function to execute webhook actions
  const executeSheetsWebhook = async (action: string, payload: any) => {
    let webhookUrl = (import.meta as any).env?.VITE_GOOGLE_SHEETS_URL || '';
    if (!webhookUrl) {
      try {
        const savedConfig = localStorage.getItem('sdy_admin_config');
        if (savedConfig) {
          const cfg = JSON.parse(savedConfig);
          if (cfg.googleSheetsWebhookUrl && cfg.googleSheetsWebhookUrl.trim().startsWith('http')) {
            webhookUrl = cfg.googleSheetsWebhookUrl.trim();
          }
        }
      } catch (e) {}
    }
    if (!webhookUrl || !webhookUrl.startsWith('http')) return false;

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, ...payload })
      });
      return res.ok;
    } catch (err) {
      console.error('Sheets webhook error:', err);
      return false;
    }
  };

  // Status Change Quick Handler
  const handleStatusChange = async (id: string, newStatus: 'PENDING' | 'APPROVED' | 'REJECTED') => {
    setIsSyncing(true);
    const updated = testimonialsList.map(item => {
      if (item.id === id) {
        return { ...item, status: newStatus };
      }
      return item;
    });

    persistLocally(updated);

    const targetItem = updated.find(i => i.id === id);
    if (targetItem) {
      await executeSheetsWebhook('sheet.update', {
        sheetName: 'Testimonials',
        idKey: 'TestimonialID',
        id: id,
        data: {
          "TestimonialID": id,
          "Status": newStatus
        }
      });
    }

    setIsSyncing(false);
    showToast(`Testimonial status updated to ${newStatus}`);
  };

  // Featured Toggle Quick Handler
  const handleToggleFeatured = async (id: string) => {
    setIsSyncing(true);
    const updated = testimonialsList.map(item => {
      if (item.id === id) {
        return { ...item, isFeatured: !item.isFeatured };
      }
      return item;
    });

    persistLocally(updated);

    const targetItem = updated.find(i => i.id === id);
    if (targetItem) {
      await executeSheetsWebhook('sheet.update', {
        sheetName: 'Testimonials',
        idKey: 'TestimonialID',
        id: id,
        data: {
          "TestimonialID": id,
          "IsFeatured": targetItem.isFeatured ? 'YES' : 'NO'
        }
      });
    }

    setIsSyncing(false);
    showToast(`Featured state toggled for ${targetItem?.author}`);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: TestimonialItem) => {
    setEditingItem(item);
    setAuthor(item.author || '');
    setAuthorKh(item.Author_KH || '');
    setAuthorKo(item.Author_KO || '');
    setRole(item.role || '');
    setRoleKh(item.Role_KH || '');
    setRoleKo(item.Role_KO || '');
    setCompany(item.company || '');
    setCompanyKh(item.Company_KH || '');
    setCompanyKo(item.Company_KO || '');
    setQuoteEn(item.Quote_EN || item.quote || '');
    setQuoteKh(item.Quote_KH || '');
    setQuoteKo(item.Quote_KO || '');
    setRating(item.rating || 5);
    setAvatar(item.avatar || '');
    setStatus((item.status?.toUpperCase() as any) || 'APPROVED');
    setIsFeatured(!!item.isFeatured);
    setIsModalOpen(true);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingItem(null);
    setAuthor('');
    setAuthorKh('');
    setAuthorKo('');
    setRole('');
    setRoleKh('');
    setRoleKo('');
    setCompany('');
    setCompanyKh('');
    setCompanyKo('');
    setQuoteEn('');
    setQuoteKh('');
    setQuoteKo('');
    setRating(5);
    setAvatar('');
    setStatus('APPROVED');
    setIsFeatured(true);
    setIsModalOpen(true);
  };

  // Save Item
  const handleSaveModal = async (e: FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !quoteEn.trim()) return;

    setIsSyncing(true);
    const isEdit = !!editingItem;
    const targetId = isEdit ? editingItem.id : 'testi_' + Date.now();

    const newItem: TestimonialItem = {
      id: targetId,
      author: author.trim(),
      Author_KH: authorKh.trim(),
      Author_KO: authorKo.trim(),
      role: role.trim(),
      Role_KH: roleKh.trim(),
      Role_KO: roleKo.trim(),
      company: company.trim(),
      Company_KH: companyKh.trim(),
      Company_KO: companyKo.trim(),
      quote: quoteEn.trim(),
      Quote_EN: quoteEn.trim(),
      Quote_KH: quoteKh.trim(),
      Quote_KO: quoteKo.trim(),
      rating: rating,
      avatar: avatar.trim(),
      status: status,
      isFeatured: isFeatured,
      date: editingItem?.date || new Date().toISOString().split('T')[0]
    };

    let updatedList: TestimonialItem[];
    if (isEdit) {
      updatedList = testimonialsList.map(i => i.id === targetId ? newItem : i);
    } else {
      updatedList = [newItem, ...testimonialsList];
    }

    persistLocally(updatedList);

    // Sync to Google Sheets
    await executeSheetsWebhook(isEdit ? 'sheet.update' : 'sheet.create', {
      sheetName: 'Testimonials',
      idKey: 'TestimonialID',
      id: targetId,
      data: {
        "TestimonialID": newItem.id,
        "Author": newItem.author,
        "Author_KH": newItem.Author_KH,
        "Author_KO": newItem.Author_KO,
        "Role": newItem.role,
        "Role_KH": newItem.Role_KH,
        "Role_KO": newItem.Role_KO,
        "Company": newItem.company,
        "Company_KH": newItem.Company_KH,
        "Company_KO": newItem.Company_KO,
        "Quote EN": newItem.Quote_EN,
        "Quote KH": newItem.Quote_KH,
        "Quote KO": newItem.Quote_KO,
        "Rating": newItem.rating,
        "Avatar": newItem.avatar,
        "Status": newItem.status,
        "IsFeatured": newItem.isFeatured ? 'YES' : 'NO',
        "CreatedAt": newItem.date
      }
    });

    setIsSyncing(false);
    setIsModalOpen(false);
    showToast(isEdit ? 'Review updated successfully!' : 'Review created successfully!');
    if (refreshAllData) refreshAllData();
  };

  // Delete Item
  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this client review?')) return;

    setIsSyncing(true);
    const updatedList = testimonialsList.filter(i => i.id !== id);
    persistLocally(updatedList);

    await executeSheetsWebhook('sheet.delete', {
      sheetName: 'Testimonials',
      idKey: 'TestimonialID',
      id: id
    });

    setIsSyncing(false);
    showToast('Client review deleted successfully!');
    if (refreshAllData) refreshAllData();
  };

  // Sync All to Google Sheets Cloud
  const handleSyncAllToCloud = async () => {
    setIsSyncing(true);
    showToast('Synchronizing all testimonials with Google Sheets...');

    await executeSheetsWebhook('testimonials.save', {
      data: testimonialsList
    });

    for (const item of testimonialsList) {
      await executeSheetsWebhook('sheet.create', {
        sheetName: 'Testimonials',
        idKey: 'TestimonialID',
        data: {
          "TestimonialID": item.id,
          "Author": item.author,
          "Author_KH": item.Author_KH || '',
          "Author_KO": item.Author_KO || '',
          "Role": item.role,
          "Role_KH": item.Role_KH || '',
          "Role_KO": item.Role_KO || '',
          "Company": item.company,
          "Company_KH": item.Company_KH || '',
          "Company_KO": item.Company_KO || '',
          "Quote EN": item.Quote_EN || item.quote,
          "Quote KH": item.Quote_KH || '',
          "Quote KO": item.Quote_KO || '',
          "Rating": item.rating || 5,
          "Avatar": item.avatar || '',
          "Status": item.status || 'APPROVED',
          "IsFeatured": item.isFeatured ? 'YES' : 'NO',
          "CreatedAt": item.date || new Date().toISOString().split('T')[0]
        }
      });
    }

    setIsSyncing(false);
    showToast('All reviews synced to Google Sheets cloud database successfully!');
    if (refreshAllData) refreshAllData();
  };

  // Filtered Items
  const filteredItems = testimonialsList.filter(item => {
    const matchesFilter =
      filterTab === 'ALL' ? true :
      filterTab === 'PENDING' ? (item.status || 'APPROVED').toUpperCase() === 'PENDING' :
      filterTab === 'APPROVED' ? (item.status || 'APPROVED').toUpperCase() === 'APPROVED' :
      filterTab === 'REJECTED' ? (item.status || 'APPROVED').toUpperCase() === 'REJECTED' :
      filterTab === 'FEATURED' ? !!item.isFeatured : true;

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      item.author.toLowerCase().includes(query) ||
      (item.company || '').toLowerCase().includes(query) ||
      (item.role || '').toLowerCase().includes(query) ||
      (item.quote || '').toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-8 z-50 px-5 py-3 rounded-2xl bg-[#0A4DA3] text-white text-xs font-bold uppercase tracking-widest shadow-2xl flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#0A4DA3] to-[#1E88E5] text-white shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Google Sheets Central Sync</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Client Reviews & Testimonials Manager</h2>
          <p className="text-xs text-white/80">Manage, verify, edit, and approve client feedback synchronized with Google Sheets tab: Testimonials.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncAllToCloud}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md transition-colors disabled:opacity-50"
          >
            {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span>Sync to Google Sheets</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#0A4DA3] text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-blue-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Review</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/10 dark:border-white/10 overflow-x-auto w-full md:w-auto">
          {[
            { key: 'ALL', label: `All (${testimonialsList.length})` },
            { key: 'PENDING', label: `Pending (${testimonialsList.filter(i => (i.status || 'APPROVED').toUpperCase() === 'PENDING').length})` },
            { key: 'APPROVED', label: `Approved (${testimonialsList.filter(i => (i.status || 'APPROVED').toUpperCase() === 'APPROVED').length})` },
            { key: 'REJECTED', label: `Rejected (${testimonialsList.filter(i => (i.status || 'APPROVED').toUpperCase() === 'REJECTED').length})` },
            { key: 'FEATURED', label: `Featured (${testimonialsList.filter(i => !!i.isFeatured).length})` }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterTab(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                filterTab === tab.key
                  ? 'bg-[#0A4DA3] text-white shadow-md'
                  : 'text-[#101828]/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 dark:text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reviews or authors..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#101828] border border-black/10 dark:border-white/10 text-xs font-bold text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
          />
        </div>
      </div>

      {/* Reviews Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredItems.map((item) => {
          const itemStatus = (item.status || 'APPROVED').toUpperCase();

          return (
            <div
              key={item.id}
              className="p-6 rounded-3xl bg-white dark:bg-[#101828] border border-black/10 dark:border-white/10 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Status & Featured Badges Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        itemStatus === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : itemStatus === 'PENDING'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {itemStatus}
                    </span>

                    {item.isFeatured && (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Featured
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-mono text-black/40 dark:text-white/40">
                    {item.date || '2026'}
                  </span>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, sIdx) => (
                    <Star
                      key={sIdx}
                      className={`w-4 h-4 ${
                        sIdx < (item.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-zinc-300 dark:text-zinc-700'
                      }`}
                    />
                  ))}
                </div>

                {/* Quote Content */}
                <p className="text-xs sm:text-sm text-[#101828]/80 dark:text-white/80 leading-relaxed italic">
                  "{item.Quote_EN || item.quote}"
                </p>

                {item.Quote_KH && (
                  <p className="text-xs text-[#101828]/60 dark:text-white/60 leading-relaxed font-khmer">
                    {item.Quote_KH}
                  </p>
                )}
              </div>

              {/* Author Footer & Actions */}
              <div className="pt-4 border-t border-black/5 dark:border-white/5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0A4DA3]/10 text-[#0A4DA3] font-bold flex items-center justify-center overflow-hidden shrink-0">
                    {item.avatar ? (
                      <img src={item.avatar} alt={item.author} className="w-full h-full object-cover" />
                    ) : (
                      item.author.charAt(0)
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#101828] dark:text-white">{item.author}</h4>
                    <p className="text-[11px] text-[#101828]/60 dark:text-white/60">
                      {item.role} {item.company ? `• ${item.company}` : ''}
                    </p>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="flex items-center justify-between gap-2 pt-2">
                  <div className="flex items-center gap-1.5">
                    {itemStatus !== 'APPROVED' && (
                      <button
                        onClick={() => handleStatusChange(item.id, 'APPROVED')}
                        className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                        title="Approve Review"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    )}

                    {itemStatus !== 'REJECTED' && (
                      <button
                        onClick={() => handleStatusChange(item.id, 'REJECTED')}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                        title="Reject Review"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleToggleFeatured(item.id)}
                      className={`p-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors ${
                        item.isFeatured
                          ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
                          : 'bg-black/5 dark:bg-white/5 text-[#101828]/60 dark:text-white/60 hover:bg-black/10'
                      }`}
                      title="Toggle Featured"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{item.isFeatured ? 'Featured' : 'Feature'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 rounded-xl bg-black/5 dark:bg-white/5 text-[#101828] dark:text-white hover:bg-black/10 transition-colors"
                      title="Edit Review"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-colors"
                      title="Delete Review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="py-16 text-center space-y-3 bg-white dark:bg-[#101828] rounded-3xl border border-black/10 dark:border-white/10">
          <MessageSquare className="w-10 h-10 text-black/20 dark:text-white/20 mx-auto" />
          <p className="text-sm font-bold text-[#101828]/60 dark:text-white/60">No reviews found matching filter criteria.</p>
        </div>
      )}

      {/* Modal for Creating or Editing Testimonials */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#101828] border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-black/5 dark:bg-white/10 text-black dark:text-white"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <form onSubmit={handleSaveModal} className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-[#101828] dark:text-white">
                  {editingItem ? 'Edit Client Review' : 'Create New Client Review'}
                </h3>
                <p className="text-xs text-[#101828]/60 dark:text-white/60">Changes will synchronize directly with Google Sheets tab: Testimonials.</p>
              </div>

              {/* Author & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#101828]/70 dark:text-white/70">Author (EN) *</label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Lim Chanrath"
                    className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-bold text-[#101828] dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#101828]/70 dark:text-white/70">Author (KH)</label>
                  <input
                    type="text"
                    value={authorKh}
                    onChange={(e) => setAuthorKh(e.target.value)}
                    placeholder="លឹម ច័ន្ទរ័ត្ន"
                    className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-bold text-[#101828] dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#101828]/70 dark:text-white/70">Author (KO)</label>
                  <input
                    type="text"
                    value={authorKo}
                    onChange={(e) => setAuthorKo(e.target.value)}
                    placeholder="임 찬라스"
                    className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-bold text-[#101828] dark:text-white"
                  />
                </div>
              </div>

              {/* Role & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#101828]/70 dark:text-white/70">Role / Title</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Project Director"
                    className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-bold text-[#101828] dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#101828]/70 dark:text-white/70">Company Name</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. ABA Bank"
                    className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-bold text-[#101828] dark:text-white"
                  />
                </div>
              </div>

              {/* Rating, Status & Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#101828]/70 dark:text-white/70">Star Rating</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-bold text-[#101828] dark:text-white"
                  >
                    {[5, 4, 3, 2, 1].map(r => (
                      <option key={r} value={r}>{r} Stars</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#101828]/70 dark:text-white/70">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-bold text-[#101828] dark:text-white"
                  >
                    <option value="APPROVED">APPROVED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>

                <div className="space-y-1 flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded text-[#0A4DA3]"
                    />
                    <span className="text-xs font-bold text-[#101828] dark:text-white">Feature on Homepage</span>
                  </label>
                </div>
              </div>

              {/* Quotes Trilingual */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#101828]/70 dark:text-white/70">Review Quote (EN) *</label>
                  <textarea
                    required
                    rows={2}
                    value={quoteEn}
                    onChange={(e) => setQuoteEn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-medium text-[#101828] dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#101828]/70 dark:text-white/70">Review Quote (KH)</label>
                  <textarea
                    rows={2}
                    value={quoteKh}
                    onChange={(e) => setQuoteKh(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-medium text-[#101828] dark:text-white font-khmer"
                  />
                </div>
              </div>

              {/* Avatar URL */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#101828]/70 dark:text-white/70">Avatar Photo Link</label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-bold text-[#101828] dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-xs font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSyncing}
                  className="px-6 py-2.5 rounded-xl bg-[#0A4DA3] text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-[#1E88E5]"
                >
                  {isSyncing ? 'Saving...' : 'Save Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
