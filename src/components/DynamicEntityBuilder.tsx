import React, { useState } from 'react';
import { EntitySchema, FieldDefinition, FieldType } from '../types';
import { api } from '../services/api';
import { Plus, Trash2, Edit3, Save, Database, Shield, FileSpreadsheet, Check, RefreshCw, Layers } from 'lucide-react';
import { useLanguage } from './LanguageContext';

interface DynamicEntityBuilderProps {
  schemas: EntitySchema[];
  onSchemaChange: (updatedSchemas: EntitySchema[]) => void;
}

const FIELD_TYPES: { type: FieldType; label: string }[] = [
  { type: 'text', label: 'Single Line Text' },
  { type: 'textarea', label: 'Multi-line Text / Description' },
  { type: 'number', label: 'Number / Quantity' },
  { type: 'currency', label: 'Currency / Amount' },
  { type: 'boolean', label: 'Yes/No Switch' },
  { type: 'date', label: 'Date Picker' },
  { type: 'email', label: 'Email Address' },
  { type: 'phone', label: 'Phone Number' },
  { type: 'url', label: 'Website / URL' },
  { type: 'image', label: 'Image URL / Drive File' },
  { type: 'gallery', label: 'Image Gallery' },
  { type: 'file', label: 'PDF / Document File' },
  { type: 'select', label: 'Single Select Dropdown' },
  { type: 'relation', label: 'Database Relationship' },
  { type: 'richtext', label: 'Rich Text Format' },
];

export const PRESET_SCHEMAS: EntitySchema[] = [
  {
    id: 'suppliers',
    name: 'Suppliers & Vendors',
    tableName: 'Suppliers',
    icon: 'Truck',
    description: 'Manage material vendors, steel mills, joinery hardware suppliers & subcontractors.',
    status: 'Published',
    fields: [
      { name: 'supplierName', label: 'Supplier / Company Name', type: 'text', required: true, showInTable: true, searchable: true },
      { name: 'contactPerson', label: 'Contact Person', type: 'text', required: true, showInTable: true, searchable: true },
      { name: 'email', label: 'Email Address', type: 'email', required: true, showInTable: true },
      { name: 'phone', label: 'Phone Number', type: 'phone', required: true, showInTable: true },
      { name: 'country', label: 'Country / Origin', type: 'text', showInTable: true },
      { name: 'category', label: 'Supply Category', type: 'select', options: ['Steel & Metal', 'Timber & Wood', 'Glass & Aluminum', 'Hardware & Accessories', 'Finishes & Paints'], showInTable: true },
      { name: 'rating', label: 'Vendor Rating', type: 'select', options: ['5 Star - Preferred', '4 Star - Approved', '3 Star - Conditional', 'Under Review'] },
      { name: 'notes', label: 'Contract Notes', type: 'textarea' }
    ]
  },
  {
    id: 'purchase_orders',
    name: 'Purchase Orders (PO)',
    tableName: 'PurchaseOrders',
    icon: 'FileText',
    description: 'Track procurement orders, material invoices & approval status.',
    status: 'Published',
    fields: [
      { name: 'poNumber', label: 'PO Number', type: 'text', required: true, showInTable: true, searchable: true },
      { name: 'supplierName', label: 'Supplier Name', type: 'text', required: true, showInTable: true, searchable: true },
      { name: 'projectName', label: 'Target Project', type: 'text', showInTable: true, searchable: true },
      { name: 'totalAmount', label: 'Total Value ($)', type: 'currency', required: true, showInTable: true },
      { name: 'orderDate', label: 'Order Date', type: 'date', required: true, showInTable: true },
      { name: 'expectedDelivery', label: 'Expected Delivery', type: 'date', showInTable: true },
      { name: 'status', label: 'Order Status', type: 'select', options: ['Draft', 'Pending Approval', 'Issued', 'Delivered', 'Cancelled'], showInTable: true },
      { name: 'documentUrl', label: 'PO Spec Document (PDF/Drive)', type: 'file' }
    ]
  },
  {
    id: 'boq_tenders',
    name: 'BOQ & Tender Estimates',
    tableName: 'BOQ_Tenders',
    icon: 'Layers',
    description: 'Manage Bill of Quantities, line items, unit rates & tender costings.',
    status: 'Published',
    fields: [
      { name: 'itemCode', label: 'Item Code / WBS', type: 'text', required: true, showInTable: true, searchable: true },
      { name: 'description', label: 'Work Description', type: 'textarea', required: true, showInTable: true, searchable: true },
      { name: 'unit', label: 'Unit', type: 'select', options: ['sqm', 'm', 'kg', 'set', 'lot', 'pcs', 'lump sum'], showInTable: true },
      { name: 'quantity', label: 'Quantity', type: 'number', required: true, showInTable: true },
      { name: 'unitRate', label: 'Unit Rate ($)', type: 'currency', required: true, showInTable: true },
      { name: 'category', label: 'Trade Category', type: 'select', options: ['Structural Steel', 'Joinery & Millwork', 'M&E Electrical', 'Ceiling & Partition', 'Flooring & Finishes', 'Glass Facade'], showInTable: true }
    ]
  },
  {
    id: 'equipment_inventory',
    name: 'Equipment & Machinery',
    tableName: 'EquipmentInventory',
    icon: 'Wrench',
    description: 'Track heavy machinery, CNC cutters, edgebanders, laser welders & site tools.',
    status: 'Published',
    fields: [
      { name: 'assetCode', label: 'Asset Tag Code', type: 'text', required: true, showInTable: true, searchable: true },
      { name: 'equipmentName', label: 'Equipment Name', type: 'text', required: true, showInTable: true, searchable: true },
      { name: 'modelNumber', label: 'Model / Serial No.', type: 'text', showInTable: true },
      { name: 'location', label: 'Factory / Site Location', type: 'select', options: ['Main Factory - Phnom Penh', 'Steel Fabrication Workshop', 'Site Location A', 'Maintenance Depot'], showInTable: true },
      { name: 'conditionStatus', label: 'Condition', type: 'select', options: ['Operational', 'Under Maintenance', 'In Transit', 'Decommissioned'], showInTable: true },
      { name: 'lastServiceDate', label: 'Last Service Date', type: 'date' },
      { name: 'manualPdf', label: 'User Manual / Specs', type: 'file' }
    ]
  }
];

export default function DynamicEntityBuilder({ schemas, onSchemaChange }: DynamicEntityBuilderProps) {
  const { t } = useLanguage();
  const [activeSchema, setActiveSchema] = useState<EntitySchema | null>(schemas[0] || PRESET_SCHEMAS[0]);
  const [editingField, setEditingField] = useState<FieldDefinition | null>(null);
  const [isNewModuleModalOpen, setIsNewModuleModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // New Module Form State
  const [newModuleName, setNewModuleName] = useState('');
  const [newTableName, setNewTableName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const handleSelectSchema = (s: EntitySchema) => {
    setActiveSchema(s);
    setEditingField(null);
  };

  const handleCreateNewModule = async () => {
    if (!newModuleName.trim() || !newTableName.trim()) return;

    const formattedTable = newTableName.trim().replace(/\s+/g, '_');
    const newSchema: EntitySchema = {
      id: formattedTable.toLowerCase(),
      name: newModuleName.trim(),
      tableName: formattedTable,
      icon: 'Database',
      description: newDescription.trim() || `Dynamic custom module for ${newModuleName}`,
      status: 'Published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fields: [
        { name: 'id', label: 'ID', type: 'text', required: true, showInTable: true, searchable: true },
        { name: 'name', label: 'Title / Name', type: 'text', required: true, showInTable: true, searchable: true },
        { name: 'description', label: 'Description', type: 'textarea', showInTable: true, searchable: true },
        { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Pending', 'Archived'], showInTable: true }
      ]
    };

    const updated = [...schemas, newSchema];
    onSchemaChange(updated);
    setActiveSchema(newSchema);
    setIsNewModuleModalOpen(false);
    setNewModuleName('');
    setNewTableName('');
    setNewDescription('');

    // Save to Google Sheets EntitySchemas table
    setIsSaving(true);
    await api.saveEntitySchema(newSchema);
    setIsSaving(false);
    setFeedback(`New module "${newSchema.name}" auto-created and provisioned in Google Sheets!`);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleAddField = () => {
    if (!activeSchema) return;
    const newField: FieldDefinition = {
      name: `field_${Date.now()}`,
      label: 'New Field Label',
      type: 'text',
      required: false,
      showInTable: true,
      searchable: true
    };
    const updatedSchema = {
      ...activeSchema,
      fields: [...activeSchema.fields, newField]
    };
    setActiveSchema(updatedSchema);
    setEditingField(newField);
    updateSchemaInList(updatedSchema);
  };

  const handleUpdateField = (fieldIndex: number, updated: FieldDefinition) => {
    if (!activeSchema) return;
    const newFields = [...activeSchema.fields];
    newFields[fieldIndex] = updated;
    const updatedSchema = { ...activeSchema, fields: newFields };
    setActiveSchema(updatedSchema);
    updateSchemaInList(updatedSchema);
  };

  const handleDeleteField = (fieldIndex: number) => {
    if (!activeSchema) return;
    const newFields = activeSchema.fields.filter((_, i) => i !== fieldIndex);
    const updatedSchema = { ...activeSchema, fields: newFields };
    setActiveSchema(updatedSchema);
    updateSchemaInList(updatedSchema);
  };

  const updateSchemaInList = (updatedSchema: EntitySchema) => {
    const list = schemas.map(s => s.id === updatedSchema.id ? updatedSchema : s);
    onSchemaChange(list);
  };

  const handleSaveSchemaToSheets = async () => {
    if (!activeSchema) return;
    setIsSaving(true);
    await api.saveEntitySchema(activeSchema);
    await api.logAudit('Admin', 'Update Module Schema', activeSchema.name, activeSchema.id);
    setIsSaving(false);
    setFeedback(`Module schema for "${activeSchema.name}" synchronized to Google Sheets database!`);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white dark:bg-[#101828] rounded-2xl border border-black/5 dark:border-white/10 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary dark:text-accent">
              <Database className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-dark dark:text-white">{t('entityBuilder.title', 'Low-Code Entity Builder Studio')}</h2>
          </div>
          <p className="text-xs text-dark/60 dark:text-white/60 mt-1">
            {t('entityBuilder.subtitle', 'Create completely custom business modules without writing code. Schemas auto-generate Google Sheet database tabs instantly.')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewModuleModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t('entityBuilder.create_custom', 'Create Custom Module')}
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4" />
          {feedback}
        </div>
      )}

      {/* Main Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Module Sidebar Selector */}
        <div className="lg:col-span-1 space-y-3">
          <p className="text-xs font-bold text-dark/50 dark:text-white/50 uppercase tracking-wider px-1">
            {t('entityBuilder.managed_modules', 'Managed Business Modules')} ({schemas.length})
          </p>
          <div className="space-y-2">
            {schemas.map((s) => {
              const isActive = activeSchema?.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => handleSelectSchema(s)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'bg-primary text-white border-primary shadow-md'
                      : 'bg-white dark:bg-[#101828] text-dark dark:text-white border-black/5 dark:border-white/10 hover:border-primary/40'
                  }`}
                >
                  <div>
                    <p className="font-bold text-sm">{s.name}</p>
                    <p className={`text-[10px] mt-0.5 ${isActive ? 'text-white/80' : 'text-dark/50 dark:text-white/50'}`}>
                      {t('entityBuilder.table_label', 'Table:')} <code className="font-mono">{s.tableName}</code> • {s.fields.length} {t('entityBuilder.fields_count', 'Fields')}
                    </p>
                  </div>
                  <Layers className={`w-4 h-4 ${isActive ? 'text-white' : 'text-primary'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Schema Field Configurator */}
        <div className="lg:col-span-3 space-y-6">
          {activeSchema ? (
            <div className="p-6 bg-white dark:bg-[#101828] rounded-2xl border border-black/5 dark:border-white/10 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black/5 dark:border-white/10 pb-4 gap-4">
                <div>
                  <h3 className="text-lg font-bold text-dark dark:text-white flex items-center gap-2">
                    {activeSchema.name}
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-normal">
                      Sheet: {activeSchema.tableName}
                    </span>
                  </h3>
                  <p className="text-xs text-dark/60 dark:text-white/60 mt-1">{activeSchema.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddField}
                    className="flex items-center gap-1.5 px-3 py-2 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-dark dark:text-white rounded-xl text-xs font-semibold cursor-pointer transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {t('entityBuilder.add_field', 'Add Field')}
                  </button>
                  <button
                    onClick={handleSaveSchemaToSheets}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer transition-all disabled:opacity-50"
                  >
                    {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    {t('entityBuilder.save_schema', 'Save Schema')}
                  </button>
                </div>
              </div>

              {/* Fields Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-black/10 dark:border-white/10 text-dark/50 dark:text-white/50 uppercase font-mono text-[10px]">
                      <th className="py-2.5 px-3">{t('entityBuilder.col_field_key', 'Field Key')}</th>
                      <th className="py-2.5 px-3">{t('entityBuilder.col_display_label', 'Display Label')}</th>
                      <th className="py-2.5 px-3">{t('entityBuilder.col_field_type', 'Field Type')}</th>
                      <th className="py-2.5 px-3 text-center">{t('entityBuilder.col_required', 'Required')}</th>
                      <th className="py-2.5 px-3 text-center">{t('entityBuilder.col_in_table', 'In Table')}</th>
                      <th className="py-2.5 px-3 text-center">{t('entityBuilder.col_searchable', 'Searchable')}</th>
                      <th className="py-2.5 px-3 text-right">{t('entityBuilder.col_action', 'Action')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {activeSchema.fields.map((field, idx) => (
                      <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-semibold text-primary dark:text-accent">
                          <input
                            type="text"
                            value={field.name}
                            onChange={(e) => handleUpdateField(idx, { ...field, name: e.target.value })}
                            className="bg-transparent border border-black/10 dark:border-white/10 rounded px-2 py-1 text-xs w-32 focus:ring-1 focus:ring-primary"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => handleUpdateField(idx, { ...field, label: e.target.value })}
                            className="bg-transparent border border-black/10 dark:border-white/10 rounded px-2 py-1 text-xs w-40 focus:ring-1 focus:ring-primary text-dark dark:text-white"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <select
                            value={field.type}
                            onChange={(e) => handleUpdateField(idx, { ...field, type: e.target.value as FieldType })}
                            className="bg-white dark:bg-dark border border-black/10 dark:border-white/10 rounded px-2 py-1 text-xs text-dark dark:text-white focus:ring-1 focus:ring-primary"
                          >
                            {FIELD_TYPES.map((ft) => (
                              <option key={ft.type} value={ft.type}>{ft.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={!!field.required}
                            onChange={(e) => handleUpdateField(idx, { ...field, required: e.target.checked })}
                            className="rounded accent-primary cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={field.showInTable !== false}
                            onChange={(e) => handleUpdateField(idx, { ...field, showInTable: e.target.checked })}
                            className="rounded accent-primary cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={field.searchable !== false}
                            onChange={(e) => handleUpdateField(idx, { ...field, searchable: e.target.checked })}
                            className="rounded accent-primary cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleDeleteField(idx)}
                            className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                            title={t('entityBuilder.remove_field', 'Remove Field')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-dark/40 dark:text-white/40 bg-white dark:bg-[#101828] rounded-2xl border border-dashed border-black/10 dark:border-white/10">
              {t('entityBuilder.no_active_schema', 'Select a module from the left or create a new custom business module.')}
            </div>
          )}
        </div>
      </div>

      {/* Modal for Creating New Dynamic Module */}
      {isNewModuleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#101828] border border-black/10 dark:border-white/10 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-3">
              <h3 className="font-bold text-lg text-dark dark:text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                {t('entityBuilder.modal_title', 'Create New Custom Module')}
              </h3>
              <button
                onClick={() => setIsNewModuleModalOpen(false)}
                className="text-dark/40 dark:text-white/40 hover:text-dark dark:hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-dark/70 dark:text-white/70">{t('entityBuilder.modal_module_name', 'Module Name (e.g. Invoices, Contracts, Warehouse)')}</label>
                <input
                  type="text"
                  placeholder={t('entityBuilder.modal_module_placeholder', 'e.g. Equipment Maintenance')}
                  value={newModuleName}
                  onChange={(e) => {
                    setNewModuleName(e.target.value);
                    if (!newTableName) setNewTableName(e.target.value.replace(/[^a-zA-Z0-9]/g, ''));
                  }}
                  className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-dark/70 dark:text-white/70">{t('entityBuilder.modal_sheet_tab', 'Google Sheet Tab Name')}</label>
                <input
                  type="text"
                  placeholder={t('entityBuilder.modal_sheet_placeholder', 'e.g. EquipmentMaintenance')}
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl font-mono text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-dark/70 dark:text-white/70">{t('entityBuilder.modal_desc', 'Description / Business Purpose')}</label>
                <textarea
                  placeholder={t('entityBuilder.modal_desc_placeholder', 'e.g. Track machinery service records, repairs, and upcoming maintenance schedules.')}
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-black/5 dark:border-white/10">
              <button
                onClick={() => setIsNewModuleModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 text-xs text-dark dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                {t('entityBuilder.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleCreateNewModule}
                className="px-5 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl shadow-md cursor-pointer transition-all"
              >
                {t('entityBuilder.provision', 'Provision Module')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
