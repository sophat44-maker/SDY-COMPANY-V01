import React, { useState, useEffect, useMemo } from 'react';
import { EntitySchema, DynamicRecord, FieldDefinition, formatDriveUrl } from '../types';
import { api } from '../services/api';
import { Search, Plus, Trash2, Edit3, Copy, Download, Filter, RefreshCw, CheckCircle, Clock, AlertCircle, FileText, Upload, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from './LanguageContext';

interface DynamicEntityManagerProps {
  schema: EntitySchema;
  currentUser?: string;
}

export default function DynamicEntityManager({ schema, currentUser = 'Admin' }: DynamicEntityManagerProps) {
  const { t } = useLanguage();
  const [records, setRecords] = useState<DynamicRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DynamicRecord | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchRecords = async () => {
    setIsLoading(true);
    const res = await api.readTable(schema.tableName);
    if (res.success && Array.isArray(res.data)) {
      const formatted = res.data.map((r: any) => ({
        ...r,
        id: String(r[schema.fields[0]?.name] || r.id || r.ID || `rec_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`),
        status: r.status || r.Status || 'Published',
        updatedAt: r.updatedAt || r.Date || new Date().toISOString()
      }));
      setRecords(formatted);
    } else {
      setRecords([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRecords();
    setSelectedIds([]);
  }, [schema.tableName]);

  // Filtered & Searched List
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesStatus = statusFilter === 'All' || (r.status || 'Published') === statusFilter;
      if (!matchesStatus) return false;
      if (!searchTerm.trim()) return true;

      const lowerSearch = searchTerm.toLowerCase();
      return schema.fields.some((f) => {
        const val = r[f.name];
        return val && String(val).toLowerCase().includes(lowerSearch);
      });
    });
  }, [records, searchTerm, statusFilter, schema.fields]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage]);

  const handleOpenModal = (record?: DynamicRecord) => {
    if (record) {
      setEditingRecord(record);
      setFormData({ ...record });
    } else {
      setEditingRecord(null);
      const initial: Record<string, any> = {
        status: 'Published'
      };
      schema.fields.forEach((f) => {
        if (f.defaultValue !== undefined) initial[f.name] = f.defaultValue;
        else if (f.type === 'number' || f.type === 'currency') initial[f.name] = 0;
        else initial[f.name] = '';
      });
      initial.id = `${schema.id}_${Date.now()}`;
      setFormData(initial);
    }
    setIsModalOpen(true);
  };

  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const recordToSave = {
      ...formData,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser,
      status: formData.status || 'Published'
    };

    if (!editingRecord) {
      recordToSave.createdAt = new Date().toISOString();
      recordToSave.createdBy = currentUser;
    }

    const primaryKey = schema.fields[0]?.name || 'id';
    const res = await api.saveRecord(schema.tableName, primaryKey, recordToSave);

    if (res.success) {
      await api.logAudit(
        currentUser,
        editingRecord ? 'Update Record' : 'Create Record',
        schema.name,
        String(recordToSave[primaryKey])
      );

      setMessage({ type: 'success', text: `Record successfully saved to ${schema.tableName}!` });
      setIsModalOpen(false);
      fetchRecords();
    } else {
      setMessage({ type: 'error', text: res.message || 'Failed to save record to Google Sheets.' });
    }
    setIsSaving(false);
    setTimeout(() => setMessage(null), 4000);
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!window.confirm(`Are you sure you want to delete this record (${recordId})?`)) return;

    const primaryKey = schema.fields[0]?.name || 'id';
    const res = await api.deleteRecord(schema.tableName, primaryKey, recordId);
    if (res.success) {
      await api.logAudit(currentUser, 'Delete Record', schema.name, recordId);
      setMessage({ type: 'success', text: 'Record removed from Google Sheets.' });
      fetchRecords();
    } else {
      setMessage({ type: 'error', text: 'Failed to delete record.' });
    }
    setTimeout(() => setMessage(null), 4000);
  };

  const handleDuplicateRecord = async (record: DynamicRecord) => {
    const primaryKey = schema.fields[0]?.name || 'id';
    const duplicated = {
      ...record,
      [primaryKey]: `${record[primaryKey]}_copy_${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      createdBy: currentUser,
      status: 'Draft'
    };

    const res = await api.saveRecord(schema.tableName, primaryKey, duplicated);
    if (res.success) {
      setMessage({ type: 'success', text: 'Record duplicated successfully as Draft.' });
      fetchRecords();
    }
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedRecords.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected records?`)) return;

    const primaryKey = schema.fields[0]?.name || 'id';
    await api.bulkDelete(schema.tableName, primaryKey, selectedIds);
    setMessage({ type: 'success', text: `${selectedIds.length} records deleted.` });
    setSelectedIds([]);
    fetchRecords();
    setTimeout(() => setMessage(null), 4000);
  };

  const renderFieldInput = (f: FieldDefinition) => {
    const val = formData[f.name] !== undefined ? formData[f.name] : '';

    if (f.type === 'textarea') {
      return (
        <textarea
          value={val}
          onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
          rows={3}
          required={f.required}
          className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs text-dark dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
        />
      );
    }

    if (f.type === 'select') {
      return (
        <select
          value={val}
          onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
          required={f.required}
          className="w-full px-3 py-2 bg-white dark:bg-dark border border-black/10 dark:border-white/10 rounded-xl text-xs text-dark dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
        >
          <option value="">Select option...</option>
          {f.options?.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }

    if (f.type === 'number' || f.type === 'currency') {
      return (
        <input
          type="number"
          step="any"
          value={val}
          onChange={(e) => setFormData({ ...formData, [f.name]: parseFloat(e.target.value) || 0 })}
          required={f.required}
          className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs text-dark dark:text-white focus:ring-2 focus:ring-primary focus:outline-none font-mono"
        />
      );
    }

    if (f.type === 'date') {
      return (
        <input
          type="date"
          value={val}
          onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
          required={f.required}
          className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs text-dark dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
        />
      );
    }

    if (f.type === 'image' || f.type === 'file') {
      return (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Paste Google Drive share URL or image link..."
            value={val}
            onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
            className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs text-dark dark:text-white focus:ring-2 focus:ring-primary focus:outline-none font-mono"
          />
          {val && (
            <div className="flex items-center gap-2 text-[10px] text-dark/60 dark:text-white/60">
              <ImageIcon className="w-3.5 h-3.5 text-primary" />
              Preview URL: <span className="font-mono text-primary truncate max-w-xs">{formatDriveUrl(val)}</span>
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        type="text"
        value={val}
        onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
        required={f.required}
        placeholder={f.placeholder || ''}
        className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs text-dark dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
      />
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Action Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white dark:bg-[#101828] rounded-2xl border border-black/5 dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-dark/40 dark:text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`${t('entityManager.search_prefix', 'Search')} ${schema.name}...`}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="All">{t('entityManager.status_all', 'All Status')}</option>
            <option value="Published">{t('entityManager.status_published', 'Published')}</option>
            <option value="Draft">{t('entityManager.status_draft', 'Draft')}</option>
            <option value="Review">{t('entityManager.status_review', 'Review')}</option>
            <option value="Archived">{t('entityManager.status_archived', 'Archived')}</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {t('entityManager.delete_selected', 'Delete Selected')} ({selectedIds.length})
            </button>
          )}

          <button
            onClick={() => api.exportToCsv(schema.tableName, records)}
            className="flex items-center gap-1.5 px-3 py-2 border border-black/10 dark:border-white/10 text-dark dark:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-xs font-semibold cursor-pointer transition-all"
            title={t('entityManager.export_csv', 'Export CSV')}
          >
            <Download className="w-3.5 h-3.5" />
            {t('entityManager.export_csv', 'Export CSV')}
          </button>

          <button
            onClick={fetchRecords}
            disabled={isLoading}
            className="p-2 border border-black/10 dark:border-white/10 text-dark dark:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-xl cursor-pointer transition-all"
            title={t('entityManager.reload_data', 'Reload Data')}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            {t('entityManager.add_btn', 'Add')} {schema.name.slice(0, -1)}
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* Main Records Table */}
      <div className="bg-white dark:bg-[#101828] rounded-2xl border border-black/5 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-black/5 dark:bg-white/5 text-dark/60 dark:text-white/60 uppercase font-mono text-[10px]">
                <th className="py-3 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === paginatedRecords.length}
                    onChange={handleSelectAll}
                    className="rounded accent-primary cursor-pointer"
                  />
                </th>
                {schema.fields.filter(f => f.showInTable !== false).map((f) => (
                  <th key={f.name} className="py-3 px-4">{f.label}</th>
                ))}
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-dark/40 dark:text-white/40 font-mono">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                    Fetching data from Google Sheets...
                  </td>
                </tr>
              ) : paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-dark/40 dark:text-white/40 font-mono">
                    No records found in {schema.tableName}. Click "Add {schema.name.slice(0, -1)}" to create your first record.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record) => {
                  const isSelected = selectedIds.includes(record.id);
                  return (
                    <tr key={record.id} className={`hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(record.id)}
                          className="rounded accent-primary cursor-pointer"
                        />
                      </td>

                      {schema.fields.filter(f => f.showInTable !== false).map((f) => {
                        const val = record[f.name];
                        if (f.type === 'image') {
                          return (
                            <td key={f.name} className="py-3 px-4">
                              {val ? (
                                <img
                                  src={formatDriveUrl(String(val))}
                                  alt="Thumb"
                                  className="w-10 h-10 rounded-lg object-cover border border-black/10 dark:border-white/10"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <span className="text-dark/30 dark:text-white/30 italic">No Image</span>
                              )}
                            </td>
                          );
                        }

                        if (f.type === 'currency') {
                          return (
                            <td key={f.name} className="py-3 px-4 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                              ${parseFloat(val || 0).toLocaleString()}
                            </td>
                          );
                        }

                        return (
                          <td key={f.name} className="py-3 px-4 text-dark dark:text-white max-w-xs truncate">
                            {val !== undefined && val !== null ? String(val) : '-'}
                          </td>
                        );
                      })}

                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          record.status === 'Published' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                          record.status === 'Draft' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                          'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        }`}>
                          {record.status || 'Published'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenModal(record)}
                          className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                          title="Edit Record"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicateRecord(record)}
                          className="p-1.5 text-dark/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                          title="Duplicate Record"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(record.id)}
                          className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-black/5 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-dark/60 dark:text-white/60 gap-3">
          <div>
            Showing {filteredRecords.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length} records
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            <span className="px-3 font-mono font-semibold text-dark dark:text-white">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#101828] border border-black/10 dark:border-white/10 rounded-3xl p-6 max-w-2xl w-full my-8 space-y-6 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-3">
              <h3 className="font-bold text-lg text-dark dark:text-white">
                {editingRecord ? `Edit ${schema.name.slice(0, -1)} Record` : `Create New ${schema.name.slice(0, -1)}`}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-dark/40 dark:text-white/40 hover:text-dark dark:hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {schema.fields.map((f) => (
                  <div key={f.name} className={f.type === 'textarea' || f.type === 'gallery' ? 'sm:col-span-2' : ''}>
                    <label className="block font-semibold mb-1 text-xs text-dark/80 dark:text-white/80">
                      {f.label} {f.required && <span className="text-red-500">*</span>}
                    </label>
                    {renderFieldInput(f)}
                  </div>
                ))}

                <div>
                  <label className="block font-semibold mb-1 text-xs text-dark/80 dark:text-white/80">Status</label>
                  <select
                    value={formData.status || 'Published'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-dark border border-black/10 dark:border-white/10 rounded-xl text-xs text-dark dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Review">In Review</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 text-xs text-dark dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
