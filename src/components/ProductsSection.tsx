import { useState, useEffect, useMemo } from 'react';
import {
  FileText, Share2, Send, MessageCircle, Mail, X, Search, ChevronLeft,
  ChevronRight, Sparkles, CheckCircle, Smartphone, ShoppingBag, Settings
} from 'lucide-react';
import { Product, formatDriveUrl } from '../types';
import { useLanguage } from './LanguageContext';
import { generateProductPdf } from '../utils/pdfGenerator';
import ConcreteOrderModal from './ConcreteOrderModal';
import ProductDetailModal, { getProductImages } from './ProductDetailModal';

const DEFAULT_PRODUCT_FALLBACK = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80';

const DEFAULT_MASTER_CATEGORIES = [
  'All',
  'Doors & Windows',
  'Wardrobes & Cabinets',
  'Millwork & Cladding',
  'Fitted Kitchens',
  'Executive Desks',
  'Commercial Ceiling',
  'Custom Furnishings'
];

function findMatchingCategory(query: string, categoryList: string[]): string | null {
  if (!query) return null;
  const q = query.trim().toLowerCase();

  const exact = categoryList.find(c => c.toLowerCase() === q);
  if (exact) return exact;

  if (q.includes('door') || q.includes('window')) return 'Doors & Windows';
  if (q.includes('wardrobe') || q.includes('cabinet') || q.includes('tv') || q.includes('vanity') || q.includes('display') || q.includes('bookshelf') || q.includes('shoe')) return 'Wardrobes & Cabinets';
  if (q.includes('millwork') || q.includes('cladding') || q.includes('wall panel') || q.includes('louver') || q.includes('screen')) return 'Millwork & Cladding';
  if (q.includes('kitchen')) return 'Fitted Kitchens';
  if (q.includes('desk') || q.includes('reception') || q.includes('workstation') || q.includes('meeting') || q.includes('conference') || q.includes('office')) return 'Executive Desks';
  if (q.includes('ceiling')) return 'Commercial Ceiling';
  if (q.includes('custom') || q.includes('furnish')) return 'Custom Furnishings';

  const partial = categoryList.find(c => c !== 'All' && (c.toLowerCase().includes(q) || q.includes(c.toLowerCase())));
  if (partial) return partial;

  return null;
}

interface ProductsSectionProps {
  searchQuery: string;
  onSearch?: (query: string) => void;
  onNavigate?: (view: string) => void;
}

export default function ProductsSection({ searchQuery: headerSearchQuery, onSearch, onNavigate }: ProductsSectionProps) {
  const { t, language, products, isLoading, companyInfo, categories: dynamicCategories } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [localSearchQuery, setLocalSearchQuery] = useState<string>(headerSearchQuery || '');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isDownloadSuccessful, setIsDownloadSuccessful] = useState<boolean>(false);
  const [isConcreteOrderModalOpen, setIsConcreteOrderModalOpen] = useState<boolean>(false);
  const [concreteOrderProductTitle, setConcreteOrderProductTitle] = useState<string>('');

  // Dynamically compute product categories from Master list + Admin Categories context + Product Items
  const availableCategories = useMemo(() => {
    const list = [...DEFAULT_MASTER_CATEGORIES];

    if (Array.isArray(dynamicCategories)) {
      dynamicCategories.forEach((cat: any) => {
        const name = typeof cat === 'string' ? cat : (cat.name || cat.Name || cat.categoryName);
        const type = typeof cat === 'object' ? (cat.type || cat.Type || 'product') : 'product';
        if (type === 'product' && name && !list.includes(name)) {
          list.push(name);
        }
      });
    }

    if (Array.isArray(products)) {
      products.forEach((p) => {
        if (p.category && typeof p.category === 'string') {
          const catName = p.category.trim();
          if (catName && !list.includes(catName)) {
            list.push(catName);
          }
        }
      });
    }

    return list;
  }, [dynamicCategories, products]);

  // Sync incoming header search query with local search query and category selector
  useEffect(() => {
    if (headerSearchQuery) {
      const matchedCat = findMatchingCategory(headerSearchQuery, availableCategories);
      if (matchedCat) {
        setSelectedCategory(matchedCat);
      }
      setLocalSearchQuery(headerSearchQuery);
    } else {
      setLocalSearchQuery('');
    }
  }, [headerSearchQuery, availableCategories]);

  // Deep linking: Automatically open product modal and scroll to the products section on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('product') || params.get('id');
    if (productId && products && products.length > 0) {
      const prod = products.find((p) => p.id === productId);
      if (prod) {
        setSelectedProduct(prod);
        setActiveImageIndex(0);
        
        // Smooth scroll to the products page section
        setTimeout(() => {
          const productsEl = document.getElementById('products-page');
          if (productsEl) {
            productsEl.scrollIntoView({ behavior: 'smooth' });
          }
        }, 600);
      }
    }
  }, [products]);

  const getCategoryLabel = (catName: string) => {
    if (catName === 'All') return t('nav.all', 'All');
    if (catName === 'Doors & Windows') return t('products.cat_doors_windows', 'Doors & Windows');
    if (catName === 'Wardrobes & Cabinets') return t('products.cat_wardrobes_cabinets', 'Wardrobes & Cabinets');
    if (catName === 'Millwork & Cladding') return t('products.cat_millwork_cladding', 'Millwork & Cladding');
    if (catName === 'Fitted Kitchens') return t('products.cat_fitted_kitchens', 'Fitted Kitchens');
    if (catName === 'Executive Desks') return t('products.cat_executive_desks', 'Executive Desks');
    if (catName === 'Commercial Ceiling') return t('products.cat_commercial_ceiling', 'Commercial Ceiling');
    if (catName === 'Custom Furnishings') return t('products.cat_custom_furnishings', 'Custom Furnishings');
    return t('products.cat_' + catName.toLowerCase().replace(/[^a-z0-9]/g, '_'), catName);
  };

  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
    setActiveImageIndex(0);
    setIsDownloadSuccessful(false);
  };

  const handleNextImage = () => {
    if (selectedProduct) {
      const imgs = getProductImages(selectedProduct);
      setActiveImageIndex((prev) => (prev + 1) % imgs.length);
    }
  };

  const handlePrevImage = () => {
    if (selectedProduct) {
      const imgs = getProductImages(selectedProduct);
      setActiveImageIndex((prev) => (prev - 1 + imgs.length) % imgs.length);
    }
  };

  const handleDownloadCatalog = async (productName: string) => {
    if (!selectedProduct) return;
    setIsDownloadSuccessful(true);
    
    try {
      await generateProductPdf(selectedProduct, language);
    } catch (err) {
      console.error('Failed to generate product specification PDF:', err);
    } finally {
      setTimeout(() => {
        setIsDownloadSuccessful(false);
      }, 5000);
    }
  };

  const handleSearchInputChange = (val: string) => {
    setLocalSearchQuery(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    if (category === 'All') {
      setLocalSearchQuery('');
      if (onSearch) {
        onSearch('');
      }
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setLocalSearchQuery('');
    if (onSearch) {
      onSearch('');
    }
  };

  // Clean, trim active search string
  const activeSearchQuery = localSearchQuery.trim().toLowerCase();

  const filteredProducts = products.filter((product) => {
    let matchesCategory = false;
    if (selectedCategory === 'All') {
      matchesCategory = true;
    } else {
      const pCat = (product.category || '').trim().toLowerCase();
      const sCat = selectedCategory.trim().toLowerCase();

      if (pCat === sCat) {
        matchesCategory = true;
      } else if (sCat === 'doors & windows' || sCat === 'doors') {
        matchesCategory = pCat.includes('door') || pCat.includes('window');
      } else if (sCat === 'wardrobes & cabinets' || sCat === 'furniture') {
        matchesCategory = pCat.includes('wardrobe') || pCat.includes('cabinet') || pCat.includes('furniture') || pCat.includes('tv') || pCat.includes('vanity') || pCat.includes('display') || pCat.includes('bookshelf') || pCat.includes('shoe');
      } else if (sCat === 'millwork & cladding') {
        matchesCategory = pCat.includes('millwork') || pCat.includes('cladding') || pCat.includes('panel') || pCat.includes('louver') || pCat.includes('screen');
      } else if (sCat === 'fitted kitchens') {
        matchesCategory = pCat.includes('kitchen');
      } else if (sCat === 'executive desks') {
        matchesCategory = pCat.includes('desk') || pCat.includes('reception') || pCat.includes('workstation') || pCat.includes('table') || pCat.includes('office');
      } else if (sCat === 'commercial ceiling') {
        matchesCategory = pCat.includes('ceiling');
      } else if (sCat === 'custom furnishings') {
        matchesCategory = pCat.includes('custom') || pCat.includes('furnish');
      } else {
        matchesCategory = pCat.includes(sCat) || sCat.includes(pCat);
      }
    }

    if (!matchesCategory) return false;

    if (!activeSearchQuery) return true;

    const khName = (product.ProductName_KH || '').toLowerCase();
    const enName = (product.ProductName_EN || product.name || '').toLowerCase();
    const koName = (product.ProductName_KO || '').toLowerCase();
    const khDesc = (product.Description_KH || '').toLowerCase();
    const enDesc = (product.Description_EN || product.description || '').toLowerCase();
    const koDesc = (product.Description_KO || '').toLowerCase();
    const mat = (product.material || '').toLowerCase();
    const spec = (product.specification || '').toLowerCase();
    const cat = (product.category || '').toLowerCase();

    const fullCorpus = `${khName} ${enName} ${koName} ${khDesc} ${enDesc} ${koDesc} ${mat} ${spec} ${cat}`;
    const terms = activeSearchQuery.split(/\s+/).filter(Boolean);
    
    // Return true if all or any term matches
    return terms.some((term) => fullCorpus.includes(term));
  });

  const getSharingUrl = (platform: 'telegram' | 'whatsapp' | 'messenger' | 'email', product: Product) => {
    const productName = language === 'km' && product.ProductName_KH ? product.ProductName_KH : product.name;
    const text = `សូមពិនិត្យមើលព័ត៌មានលម្អិតអំពី ${productName} របស់ក្រុមហ៊ុន SDY Company C&I Cambodia:`;
    const shareUrl = window.location.href;

    switch (platform) {
      case 'telegram': {
        let handle = companyInfo?.Telegram || 'sdycompanyci';
        if (handle.includes('t.me/')) {
          handle = handle.split('t.me/')[1];
        }
        handle = handle.replace('@', '').trim();
        return `https://t.me/${handle || 'sdycompanyci'}?text=${encodeURIComponent(text + '\n' + shareUrl)}`;
      }
      case 'whatsapp': {
        const num = (companyInfo?.WhatsApp || companyInfo?.PhoneNumber || '85523888999').replace(/[^0-9]/g, '');
        return `https://wa.me/${num}?text=${encodeURIComponent(text + ' ' + shareUrl)}`;
      }
      case 'messenger': {
        if (companyInfo?.Facebook) {
          const fbPath = companyInfo.Facebook.replace(/https?:\/\/(www\.)?facebook\.com\//, '').replace(/\/$/, '');
          if (fbPath) {
            return `https://m.me/${fbPath}?text=${encodeURIComponent(text + ' ' + shareUrl)}`;
          }
        }
        return `fb-messenger://share/?link=${encodeURIComponent(shareUrl)}`;
      }
      case 'email': {
        const emailAddr = companyInfo?.Email || 'info@sdy-ci.com';
        return `mailto:${emailAddr}?subject=${encodeURIComponent('SDY C&I Product Inquiry: ' + product.name)}&body=${encodeURIComponent(text + '\n' + shareUrl)}`;
      }
      default:
        return '#';
    }
  };

  return (
    <section id="products-page" className="py-24 bg-[#F7F9FC] dark:bg-[#101828]/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0A4DA3]/5 dark:bg-[#1E88E5]/10 rounded-full">
            <span className="text-xs sm:text-sm font-bold tracking-[0.2em] text-[#0A4DA3] dark:text-[#1E88E5] uppercase">
              {t('products.system', 'Product System')}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#101828] dark:text-white tracking-tight">
            {t('products.catalog', 'High-Performance Materials Catalog')}
          </h2>
          <p className="text-sm sm:text-base text-[#101828]/60 dark:text-white/60 leading-relaxed">
            {t('products.desc', 'Search our local manufacturing catalogs including soundproof acoustic wood doors, heavy structural trusses, double-glazed facades, and luxury executive worktables.')}
          </p>
          {onNavigate && (
            <div className="pt-2">
              <button
                onClick={() => onNavigate('admin-products')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold transition-all shadow-sm"
              >
                <Settings className="w-3.5 h-3.5" />
                {t('products.manage_in_admin', 'គ្រប់គ្រងផលិតផលក្នុង Admin')}
              </button>
            </div>
          )}
        </div>

        {/* Filters and Local Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-2">
            {availableCategories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-white dark:bg-dark text-dark/70 dark:text-white/70 hover:text-primary dark:hover:text-accent border border-black/5 dark:border-white/5'
                }`}
              >
                {getCategoryLabel(category)}
              </button>
            ))}
          </div>

          {/* Local Search input */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder={t('products.search_placeholder', 'Search specifications, materials...')}
              value={localSearchQuery}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              className="w-full px-4.5 py-3 pr-10 text-xs rounded-xl bg-white dark:bg-dark text-dark dark:text-white border border-black/5 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
            {localSearchQuery ? (
              <button
                onClick={() => handleSearchInputChange('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-dark/50 dark:text-white/50 transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/40 dark:text-white/45" />
            )}
          </div>
        </div>

        {/* Active Filter Bar (when searching or category selected) */}
        {(activeSearchQuery || selectedCategory !== 'All') && (
          <div className="mb-8 p-3 px-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
              <Sparkles className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <span>
                {t('products.filter_active', 'កំពុងបង្ហាញផលិតផលតាមការចម្រោះ:')}{' '}
                {selectedCategory !== 'All' && <strong className="font-bold bg-white/70 dark:bg-black/30 px-2 py-0.5 rounded mr-1"> Category: {selectedCategory}</strong>}
                {activeSearchQuery && <strong className="font-bold bg-white/70 dark:bg-black/30 px-2 py-0.5 rounded"> Search: "{activeSearchQuery}"</strong>}
                {' '}({filteredProducts.length} {t('products.items_found', 'ផលិតផល')})
              </span>
            </div>
            <button
              onClick={handleResetFilters}
              className="px-3 py-1 rounded-lg bg-white dark:bg-blue-900 text-blue-700 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-800 font-bold border border-blue-200 dark:border-blue-700 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <X className="w-3.5 h-3.5" />
              {t('products.show_all_products', 'បង្ហាញផលិតផលទាំងអស់ (Show All)')}
            </button>
          </div>
        )}

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0A4DA3]"></div>
            <p className="mt-4 text-xs font-semibold text-[#101828]/50 dark:text-white/50">{t('validation.loading', 'Loading live products from Google Sheets...')}</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => handleOpenProduct(product)}
                className="group cursor-pointer rounded-2xl bg-white dark:bg-dark border border-black/[0.03] dark:border-white/[0.03] overflow-hidden shadow-sm sleek-card"
              >
                {/* Product Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={getProductImages(product)[0]}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src !== DEFAULT_PRODUCT_FALLBACK) {
                        target.src = DEFAULT_PRODUCT_FALLBACK;
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Category overlay */}
                  <span className="absolute top-4 left-4 px-3 py-1 bg-[#101828]/80 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-lg border border-white/10">
                    {getCategoryLabel(product.category)}
                  </span>

                  {/* Promotional Tag overlay */}
                  {(product.promotionTag || product.isPromotional) && (
                    <span className="absolute top-4 right-4 px-2.5 py-1 bg-gradient-to-r from-red-600 to-amber-600 text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-md z-10">
                      {product.promotionTag || 'PROMO'}
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-6 space-y-3">
                  <h3 className="text-base font-bold text-[#101828] dark:text-white group-hover:text-[#0A4DA3] dark:group-hover:text-[#1E88E5] transition-colors line-clamp-1">
                    {language === 'km' && product.ProductName_KH ? product.ProductName_KH : language === 'ko' && product.ProductName_KO ? product.ProductName_KO : product.ProductName_EN || product.name}
                  </h3>

                  {product.price && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-black text-[#0A4DA3] dark:text-[#1E88E5]">
                        {product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs font-semibold text-slate-400 line-through">
                          {product.originalPrice}
                        </span>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-[#101828]/60 dark:text-white/60 line-clamp-2 leading-relaxed">
                    {language === 'km' && product.Description_KH ? product.Description_KH : language === 'ko' && product.Description_KO ? product.Description_KO : product.Description_EN || product.description}
                  </p>
                  
                  {/* Footer metadata */}
                  <div className="pt-3.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                    <span className="text-[#101828]/60 dark:text-white/65">{t('products.sizes_custom', 'Standard / Custom')}</span>
                    <span className="text-[#0A4DA3] dark:text-[#1E88E5] flex items-center gap-0.5 text-[11px]">
                      {t('products.view_specs', 'View Specs')} &rarr;
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-[#101828] rounded-2xl border border-black/5 dark:border-white/5 max-w-lg mx-auto space-y-3">
            <ShoppingBag className="w-10 h-10 mx-auto text-dark/30 dark:text-white/30 stroke-1" />
            <p className="text-sm font-semibold text-[#101828]/60 dark:text-white/60">{t('validation.no_results', 'No items found matching your filters.')}</p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-all inline-flex items-center gap-1.5"
            >
              <X className="w-4 h-4" />
              {t('products.reset_filters', 'បង្ហាញផលិតផលទាំងអស់ (Reset & Show All)')}
            </button>
          </div>
        )}

      </div>

      {/* PRODUCT POPUP DETAILS LIGHTBOX */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onOrderClick={(title) => {
          setConcreteOrderProductTitle(title);
          setIsConcreteOrderModalOpen(true);
        }}
      />

      {/* READY-MIX CONCRETE ORDER MODAL (បញ្ជាទិញបេតុងទិញ - Telegram & Google Sheet Sync) */}
      <ConcreteOrderModal
        isOpen={isConcreteOrderModalOpen}
        onClose={() => setIsConcreteOrderModalOpen(false)}
        defaultProductTitle={concreteOrderProductTitle}
      />

    </section>
  );
}
