import React, { useState, useEffect } from 'react';
import { formatDriveUrl } from '../types';
import { api } from '../services/api';
import { Image as ImageIcon, FileText, Upload, Copy, Check, Search, Trash2, ExternalLink, RefreshCw, Folder } from 'lucide-react';
import { useLanguage } from './LanguageContext';

export interface MediaItem {
  id: string;
  name: string;
  driveUrl: string;
  cdnUrl: string;
  folder: string;
  fileType: 'image' | 'pdf' | 'doc' | 'dwg' | 'other';
  size?: string;
  createdAt?: string;
}

export default function DynamicMediaLibrary() {
  const { t } = useLanguage();
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [folderFilter, setFolderFilter] = useState('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Media Input State
  const [inputUrl, setInputUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [folder, setFolder] = useState('Products');
  const [isSaving, setIsSaving] = useState(false);

  const fetchMedia = async () => {
    setIsLoading(true);
    const res = await api.readTable('MediaLibrary');
    if (res.success && Array.isArray(res.data)) {
      const items: MediaItem[] = res.data.map((r: any) => ({
        id: r.id || `media_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        name: r.name || 'Drive Asset',
        driveUrl: r.driveUrl || r.URL || '',
        cdnUrl: formatDriveUrl(r.driveUrl || r.URL || ''),
        folder: r.folder || 'General',
        fileType: r.fileType || (String(r.driveUrl).includes('pdf') ? 'pdf' : 'image'),
        size: r.size || '1.2 MB',
        createdAt: r.createdAt || new Date().toISOString()
      }));
      setMediaList(items);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleAddDriveAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    setIsSaving(true);
    const cdn = formatDriveUrl(inputUrl);
    const newItem: MediaItem = {
      id: `media_${Date.now()}`,
      name: fileName.trim() || 'Google Drive Asset',
      driveUrl: inputUrl.trim(),
      cdnUrl: cdn,
      folder: folder || 'Products',
      fileType: inputUrl.includes('.pdf') || inputUrl.includes('pdf') ? 'pdf' : 'image',
      createdAt: new Date().toISOString()
    };

    const res = await api.saveRecord('MediaLibrary', 'id', newItem);
    if (res.success) {
      setMediaList([newItem, ...mediaList]);
      setInputUrl('');
      setFileName('');
    }
    setIsSaving(false);
  };

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove asset from Media Library?')) return;
    await api.deleteRecord('MediaLibrary', 'id', id);
    setMediaList(prev => prev.filter(m => m.id !== id));
  };

  const filteredMedia = mediaList.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.driveUrl.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFolder = folderFilter === 'All' || m.folder === folderFilter;
    return matchesSearch && matchesFolder;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Import Form */}
      <div className="p-6 bg-white dark:bg-[#101828] rounded-2xl border border-black/5 dark:border-white/10 shadow-sm space-y-4">
        <div>
          <h2 className="text-xl font-bold text-dark dark:text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            Google Drive Media CDN & Asset Manager
          </h2>
          <p className="text-xs text-dark/60 dark:text-white/60 mt-1">
            Store high-resolution images, CAD drawings, technical datasheets, and PDFs directly in Google Drive. All links automatically convert to instant high-speed CDN URLs.
          </p>
        </div>

        <form onSubmit={handleAddDriveAsset} className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
          <input
            type="text"
            placeholder="Asset Title / Name..."
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <input
            type="text"
            placeholder="Paste Google Drive file share link (drive.google.com/...)..."
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            required
            className="md:col-span-2 px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs text-dark dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Register Drive Asset
          </button>
        </form>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-dark/40 dark:text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assets by title or Drive link..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#101828] border border-black/10 dark:border-white/10 rounded-xl text-xs text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <select
            value={folderFilter}
            onChange={(e) => setFolderFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-[#101828] border border-black/10 dark:border-white/10 rounded-xl text-xs text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="All">All Folders</option>
            <option value="Products">Products</option>
            <option value="Projects">Projects</option>
            <option value="Banners">Banners</option>
            <option value="Downloads">Downloads</option>
            <option value="Certificates">Certificates</option>
          </select>
        </div>

        <button
          onClick={fetchMedia}
          className="p-2 border border-black/10 dark:border-white/10 bg-white dark:bg-[#101828] text-dark dark:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-xl cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredMedia.length === 0 ? (
          <div className="col-span-full p-12 text-center text-dark/40 dark:text-white/40 bg-white dark:bg-[#101828] rounded-2xl border border-dashed border-black/10 dark:border-white/10">
            No media assets found. Paste a Google Drive file link above to register your first asset.
          </div>
        ) : (
          filteredMedia.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-white dark:bg-[#101828] rounded-2xl border border-black/5 dark:border-white/10 shadow-sm space-y-3 hover:border-primary/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="aspect-video w-full rounded-xl bg-black/5 dark:bg-white/5 overflow-hidden relative group flex items-center justify-center">
                  {item.fileType === 'pdf' ? (
                    <div className="flex flex-col items-center gap-1 text-red-500">
                      <FileText className="w-8 h-8" />
                      <span className="text-[10px] font-bold">PDF Document</span>
                    </div>
                  ) : (
                    <img
                      src={item.cdnUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>

                <div>
                  <p className="font-bold text-xs text-dark dark:text-white truncate">{item.name}</p>
                  <p className="text-[10px] text-primary dark:text-accent font-mono truncate">{item.folder}</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-2">
                <button
                  onClick={() => handleCopy(item.cdnUrl, item.id)}
                  className="flex items-center gap-1 text-[10px] font-semibold text-primary dark:text-accent hover:underline cursor-pointer"
                >
                  {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  {copiedId === item.id ? 'Copied!' : 'Copy CDN URL'}
                </button>

                <div className="flex items-center gap-1">
                  <a
                    href={item.driveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-dark/40 dark:text-white/40 hover:text-dark dark:hover:text-white"
                    title="Open in Drive"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 text-red-500/60 hover:text-red-500 cursor-pointer"
                    title="Delete Asset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
