import React, { useState } from 'react';
import { ArrowRight, Sparkles, Layers, ChevronRight, FileText } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { transformGoogleDriveUrl } from '../utils/googleDrive';
import { Product } from '../types';
import ProductDetailModal, { getProductImages } from './ProductDetailModal';
import ConcreteOrderModal from './ConcreteOrderModal';

interface FeaturedProductsShowcaseProps {
  onNavigate: (view: string) => void;
}

export default function FeaturedProductsShowcase({ onNavigate }: FeaturedProductsShowcaseProps) {
  const { products, language, t, companyInfo } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);
  const [isConcreteOrderModalOpen, setIsConcreteOrderModalOpen] = useState<boolean>(false);
  const [concreteOrderProductTitle, setConcreteOrderProductTitle] = useState<string>('');

  const currentLang = (language as 'km' | 'en' | 'ko') || 'en';

  // Get localized text for product name and description
  const getProductName = (prod: Product) => {
    if (currentLang === 'km' && prod.ProductName_KH) return prod.ProductName_KH;
    if (currentLang === 'ko' && prod.ProductName_KO) return prod.ProductName_KO;
    return prod.ProductName_EN || prod.name;
  };

  const getProductDesc = (prod: Product) => {
    if (currentLang === 'km' && prod.Description_KH) return prod.Description_KH;
    if (currentLang === 'ko' && prod.Description_KO) return prod.Description_KO;
    return prod.Description_EN || prod.description;
  };

  // Derive categories from available products or standard list
  const categoriesList = [
    { id: 'all', label: { en: 'All Categories', km: 'ប្រភេទទាំងអស់', ko: '전체 카테고리' } },
    { id: 'Doors', label: { en: 'Doors & Windows', km: 'ទ្វារ និង បង្អួច', ko: '도어 및 창문' } },
    { id: 'Furniture', label: { en: 'Fitted Furniture', km: 'គ្រឿងសង្ហារឹម', ko: '가구 솔루션' } },
    { id: 'Fit-Outs', label: { en: 'Interior Millwork', km: 'ការតុបតែងលម្អ', ko: '인테리어 밀워크' } },
  ];

  // Filter products by selected category
  const filteredProducts = products.filter(prod => {
    if (selectedCategory === 'all') return true;
    const cat = (prod.category || '').toLowerCase();
    const sel = selectedCategory.toLowerCase();
    if (sel === 'doors' && (cat.includes('door') || cat.includes('window'))) return true;
    if (sel === 'furniture' && (cat.includes('furniture') || cat.includes('cabinet') || cat.includes('desk') || cat.includes('table'))) return true;
    if (sel === 'fit-outs' && (cat.includes('fit') || cat.includes('millwork') || cat.includes('cladding') || cat.includes('panel'))) return true;
    return cat.includes(sel);
  });

  // Limit featured showcase to top 6 products on homepage
  const showcaseProducts = filteredProducts.slice(0, 6);

  const getTelegramUrl = () => {
    if (!companyInfo?.Telegram) return 'https://t.me/sdycompanyci';
    if (companyInfo.Telegram.startsWith('http')) return companyInfo.Telegram;
    return `https://t.me/${companyInfo.Telegram.replace('@', '')}`;
  };

  const handleOrderProduct = (title: string) => {
    setConcreteOrderProductTitle(title);
    setIsConcreteOrderModalOpen(true);
  };

  return (
    <section id="featured-products-showcase" className="bg-[#F8FAFC] dark:bg-[#101828]/50 py-24 border-t border-b border-black/[0.04] dark:border-white/5 relative overflow-hidden">
      {/* Decorative ambient gradients */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-[#0A4DA3]/5 dark:bg-[#1E88E5]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[#1E88E5]/5 dark:bg-[#0A4DA3]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0A4DA3]/10 dark:bg-[#1E88E5]/20 rounded-full border border-[#0A4DA3]/20 dark:border-[#1E88E5]/30">
              <Sparkles className="w-3.5 h-3.5 text-[#0A4DA3] dark:text-[#1E88E5]" />
              <span className="text-xs font-bold tracking-[0.2em] text-[#0A4DA3] dark:text-[#1E88E5] uppercase">
                {t('featured_products.tag', 'Architectural Collection')}
              </span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#101828] dark:text-white tracking-tight leading-tight">
              {t('featured_products.title', 'Featured Architectural Products')}
            </h2>
            
            <p className="text-sm sm:text-base text-[#101828]/70 dark:text-white/70 leading-relaxed font-normal">
              {t('featured_products.subtitle', 'Precision-manufactured acoustic solid wood doors, luxury executive furniture, and architectural joinery engineered at our Phnom Penh manufacturing plant.')}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('products')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#0A4DA3] hover:bg-[#1E88E5] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#0A4DA3]/20 hover:scale-[1.02] transition-all"
            >
              <span>{t('featured_products.view_all', 'View All Products')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-black/5 dark:border-white/5">
          {categoriesList.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0A4DA3] text-white shadow-md shadow-[#0A4DA3]/20'
                    : 'bg-white dark:bg-[#101828] text-[#101828]/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5 border border-black/5 dark:border-white/5'
                }`}
              >
                {cat.label[currentLang] || cat.label.en}
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        {showcaseProducts.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#101828] rounded-2xl border border-black/5 dark:border-white/5">
            <Layers className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-sm text-slate-500 font-medium">No products available in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {showcaseProducts.map((prod) => {
              const productName = getProductName(prod);
              const productDesc = getProductDesc(prod);
              const productImages = getProductImages(prod);
              const imageUrl = productImages[0];

              return (
                <div
                  key={prod.id}
                  className="group rounded-2xl bg-white dark:bg-[#101828] border border-black/5 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between sleek-card"
                >
                  <div>
                    {/* Product Image Frame - Fully Clickable */}
                    <div
                      onClick={() => setActiveModalProduct(prod)}
                      className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-900 cursor-pointer"
                    >
                      <img
                        src={imageUrl}
                        alt={productName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80';
                        }}
                      />
                      
                      {/* Category Badge Tag */}
                      <span className="absolute top-3.5 left-3.5 px-3 py-1 bg-[#0A4DA3]/90 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg shadow-md">
                        {prod.category || 'Architectural Product'}
                      </span>

                      {/* Promotional Badge Tag */}
                      {(prod.promotionTag || prod.isPromotional) && (
                        <span className="absolute top-3.5 right-3.5 z-10 px-2.5 py-1 bg-gradient-to-r from-red-600 to-amber-600 text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-md">
                          {prod.promotionTag || 'PROMO'}
                        </span>
                      )}

                      {/* Material Tag if present */}
                      {prod.material && (
                        <span className="absolute bottom-3.5 left-3.5 right-3.5 px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium truncate rounded-md">
                          {prod.material}
                        </span>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="p-6 space-y-3">
                      <h3
                        onClick={() => setActiveModalProduct(prod)}
                        className="font-extrabold text-lg sm:text-xl text-[#101828] dark:text-white group-hover:text-[#0A4DA3] dark:group-hover:text-[#1E88E5] transition-colors line-clamp-2 leading-snug cursor-pointer"
                      >
                        {productName}
                      </h3>

                      {prod.price && (
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-black text-[#0A4DA3] dark:text-[#1E88E5]">
                            {prod.price}
                          </span>
                          {prod.originalPrice && (
                            <span className="text-xs font-semibold text-slate-400 line-through">
                              {prod.originalPrice}
                            </span>
                          )}
                        </div>
                      )}

                      <p className="text-xs sm:text-sm text-[#101828]/70 dark:text-white/70 line-clamp-2 leading-relaxed">
                        {productDesc}
                      </p>

                      {/* Specification & Dimensions */}
                      {prod.size && (
                        <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-[#0A4DA3] dark:text-[#1E88E5] bg-[#0A4DA3]/5 dark:bg-[#1E88E5]/10 px-2.5 py-1.5 rounded-md">
                          <span className="font-bold uppercase tracking-wider text-[9px] text-[#101828]/50 dark:text-white/50">Size:</span>
                          <span className="truncate">{prod.size}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-6 pt-0 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-3 mt-4">
                    <button
                      onClick={() => setActiveModalProduct(prod)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A4DA3] dark:text-[#1E88E5] hover:underline"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{t('featured_products.specs', 'View Specs')}</span>
                    </button>

                    <a
                      href={getTelegramUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg bg-[#0A4DA3]/10 hover:bg-[#0A4DA3] text-[#0A4DA3] hover:text-white dark:bg-[#1E88E5]/10 dark:hover:bg-[#1E88E5] dark:text-[#1E88E5] dark:hover:text-white text-xs font-bold transition-colors"
                    >
                      <span>{t('featured_products.inquire', 'Inquire / Order')}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Callout Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#0A4DA3] to-[#1E88E5] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-xl font-bold tracking-tight">
              {t('featured_products.custom_title', 'Need Custom Architectural Specifications or Bulk Orders?')}
            </h4>
            <p className="text-xs sm:text-sm text-white/80">
              {t('featured_products.custom_desc', 'Our Phnom Penh joinery plant manufactures doors, cladding, and furniture tailored to your CAD/BIM specifications.')}
            </p>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="shrink-0 px-6 py-3 bg-white text-[#0A4DA3] hover:bg-slate-100 text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg transition-transform hover:scale-102 flex items-center gap-2"
          >
            <span>{t('featured_products.browse_full', 'Browse Full Catalog')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Unified Product Detail Modal */}
      <ProductDetailModal
        product={activeModalProduct}
        onClose={() => setActiveModalProduct(null)}
        onOrderClick={handleOrderProduct}
      />

      {/* Ready-Mix / Custom Order Modal */}
      <ConcreteOrderModal
        isOpen={isConcreteOrderModalOpen}
        onClose={() => setIsConcreteOrderModalOpen(false)}
        defaultProductTitle={concreteOrderProductTitle}
      />
    </section>
  );
}
