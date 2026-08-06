import React, { useState, useEffect } from 'react';
import {
  X, ChevronLeft, ChevronRight, Sparkles, FileText, Share2,
  Send, MessageCircle, Smartphone, Mail, ShoppingBag, CheckCircle, Award, ShieldCheck
} from 'lucide-react';
import { Product, formatDriveUrl } from '../types';
import { useLanguage } from './LanguageContext';
import { transformGoogleDriveUrl, extractGoogleDriveFileId, getGoogleDriveViewUrl, getGoogleDriveDownloadUrl } from '../utils/googleDrive';
import { generateProductPdf } from '../utils/pdfGenerator';

const DEFAULT_PRODUCT_FALLBACK = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80';

export function getProductImages(product: Product | null | undefined): string[] {
  if (!product) return [DEFAULT_PRODUCT_FALLBACK];

  const candidateList: (string | undefined)[] = [];

  if (Array.isArray(product.gallery) && product.gallery.length > 0) {
    candidateList.push(...product.gallery);
  } else if (typeof (product as any).gallery === 'string' && (product as any).gallery.trim()) {
    candidateList.push(...(product as any).gallery.split(',').map((s: string) => s.trim()));
  }

  candidateList.push(
    product.image,
    (product as any).imageUrl,
    (product as any).Image,
    (product as any).photo,
    (product as any).Photo,
    (product as any).coverImage
  );

  candidateList.push(
    product.galleryImage1,
    product.galleryImage2,
    product.galleryImage3,
    product.galleryImage4,
    product.technicalDrawing,
    product.dimensionDrawing
  );

  const valid = candidateList
    .map((item) => {
      if (!item || typeof item !== 'string') return '';
      const transformed = transformGoogleDriveUrl(item) || formatDriveUrl(item);
      return transformed ? transformed.trim() : '';
    })
    .filter((url): url is string => url.length > 0 && url !== '#');

  const unique = Array.from(new Set(valid));
  return unique.length > 0 ? unique : [DEFAULT_PRODUCT_FALLBACK];
}

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onOrderClick?: (productTitle: string) => void;
}

export default function ProductDetailModal({ product, onClose, onOrderClick }: ProductDetailModalProps) {
  const { language, t } = useLanguage();
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isDownloadSuccessful, setIsDownloadSuccessful] = useState<boolean>(false);

  // Keyboard escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Reset active image index when product changes
  useEffect(() => {
    setActiveImageIndex(0);
    setIsDownloadSuccessful(false);
  }, [product?.id]);

  if (!product) return null;

  const currentLang = (language as 'km' | 'en' | 'ko') || 'en';

  const getProductName = () => {
    if (currentLang === 'km' && product.ProductName_KH) return product.ProductName_KH;
    if (currentLang === 'ko' && product.ProductName_KO) return product.ProductName_KO;
    return product.ProductName_EN || product.name;
  };

  const getProductDesc = () => {
    if (currentLang === 'km' && product.Description_KH) return product.Description_KH;
    if (currentLang === 'ko' && product.Description_KO) return product.Description_KO;
    return product.Description_EN || product.description;
  };

  const modalGallery = getProductImages(product);
  const safeIndex = activeImageIndex % modalGallery.length;
  const currentModalImage = modalGallery[safeIndex] || modalGallery[0] || DEFAULT_PRODUCT_FALLBACK;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === 0 ? modalGallery.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === modalGallery.length - 1 ? 0 : prev + 1));
  };

  const handleDownloadPdf = async () => {
    const directPdf = product.pdf_spec_url || product.pdfUrl;
    if (directPdf && directPdf !== '#' && directPdf.trim()) {
      const rawUrl = directPdf.trim();

      // Case 1: Data URL or Blob URL
      if (rawUrl.startsWith('data:') || rawUrl.startsWith('blob:')) {
        const link = document.createElement('a');
        link.href = rawUrl;
        link.download = `SDY_${(product.name || 'Product').replace(/\s+/g, '_')}_Specification.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsDownloadSuccessful(true);
        setTimeout(() => setIsDownloadSuccessful(false), 4000);
        return;
      }

      // Case 2: Direct PDF URL ending in .pdf
      const isDirectPdfFile = rawUrl.toLowerCase().endsWith('.pdf') && !rawUrl.includes('drive.google.com') && !rawUrl.includes('googleusercontent.com');
      if (isDirectPdfFile) {
        try {
          const res = await fetch(rawUrl);
          if (res.ok) {
            const contentType = res.headers.get('content-type') || '';
            if (contentType.includes('application/pdf')) {
              const blob = await res.blob();
              const blobUrl = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = blobUrl;
              link.download = `SDY_${(product.name || 'Product').replace(/\s+/g, '_')}_Specification.pdf`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
              setIsDownloadSuccessful(true);
              setTimeout(() => setIsDownloadSuccessful(false), 4000);
              return;
            }
          }
        } catch (e) {
          console.warn('Direct PDF fetch failed:', e);
        }
      }

      // Case 3: Google Drive link or web link -> Open Google Drive PDF viewer directly
      const viewUrl = getGoogleDriveViewUrl(rawUrl) || transformGoogleDriveUrl(rawUrl) || rawUrl;
      window.open(viewUrl, '_blank', 'noopener,noreferrer');
      setIsDownloadSuccessful(true);
      setTimeout(() => setIsDownloadSuccessful(false), 4000);
      return;
    }

    // Default: generate high-resolution architectural PDF specification if no uploaded PDF exists
    try {
      await generateProductPdf(product, language, true);
      setIsDownloadSuccessful(true);
      setTimeout(() => setIsDownloadSuccessful(false), 4000);
    } catch (err) {
      console.error('PDF Generation failed', err);
      alert('Could not generate PDF document. Please try again.');
    }
  };

  const getSharingUrl = (platform: 'telegram' | 'whatsapp' | 'messenger' | 'email') => {
    const pName = getProductName();
    const currentUrl = window.location.href.split('?')[0] + `?product=${product.id}`;
    const text = encodeURIComponent(`Check out ${pName} by SDY Company C&I:\n${currentUrl}`);

    switch (platform) {
      case 'telegram':
        return `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(`SDY Product: ${pName}`)}`;
      case 'whatsapp':
        return `https://api.whatsapp.com/send?text=${text}`;
      case 'messenger':
        return `fb-messenger://share/?link=${encodeURIComponent(currentUrl)}`;
      case 'email':
        return `mailto:?subject=${encodeURIComponent(`SDY Product Inquiry: ${pName}`)}&body=${text}`;
    }
  };

  const productName = getProductName();
  const productDesc = getProductDesc();

  return (
    <div
      className="fixed inset-0 z-[9999] bg-[#101828]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-[#101828] w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-black/10 dark:border-white/10 max-h-[92vh] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 text-white hover:bg-[#0A4DA3] transition-all shadow-lg"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Column: Product Image Gallery */}
          <div className="bg-slate-100 dark:bg-slate-900/90 flex flex-col justify-between p-4 relative min-h-[340px] sm:min-h-[440px]">
            {(product.promotionTag || product.isPromotional) && (
              <span className="absolute top-6 left-6 z-10 px-3.5 py-1 bg-gradient-to-r from-red-600 to-amber-600 text-white text-[11px] font-black uppercase tracking-widest rounded-full shadow-lg">
                {product.promotionTag || 'PROMO'}
              </span>
            )}
            <div className="relative flex-1 flex items-center justify-center rounded-2xl overflow-hidden">
              <img
                src={currentModalImage || DEFAULT_PRODUCT_FALLBACK}
                alt={`${productName} View ${safeIndex + 1}`}
                className="w-full h-full object-contain max-h-[420px] rounded-xl transition-all duration-300"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== DEFAULT_PRODUCT_FALLBACK) {
                    target.src = DEFAULT_PRODUCT_FALLBACK;
                  }
                }}
              />

              {modalGallery.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 p-2.5 rounded-full bg-black/60 text-white hover:bg-[#0A4DA3] transition-all shadow-md backdrop-blur-xs"
                    aria-label="Previous Image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 p-2.5 rounded-full bg-black/60 text-white hover:bg-[#0A4DA3] transition-all shadow-md backdrop-blur-xs"
                    aria-label="Next Image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] font-bold text-white tracking-widest shadow-sm">
                    {safeIndex + 1} / {modalGallery.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Strip if multiple images */}
            {modalGallery.length > 1 && (
              <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none justify-center">
                {modalGallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      idx === safeIndex
                        ? 'border-[#0A4DA3] ring-2 ring-[#0A4DA3]/30 scale-105'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img || DEFAULT_PRODUCT_FALLBACK} alt="Thumb" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details & Technical Specifications */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0A4DA3]/10 dark:bg-[#1E88E5]/20 text-[#0A4DA3] dark:text-[#1E88E5] text-[11px] font-bold uppercase tracking-wider rounded-lg">
                  <Sparkles className="w-3.5 h-3.5" />
                  {product.category || 'Architectural Product'}
                </span>
                {product.collection && (
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">
                    {product.collection}
                  </span>
                )}
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-[#101828] dark:text-white leading-tight">
                {productName}
              </h3>

              {product.price && (
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl font-black text-[#0A4DA3] dark:text-[#1E88E5]">
                    {product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm font-semibold text-slate-400 line-through">
                      {product.originalPrice}
                    </span>
                  )}
                </div>
              )}

              <p className="text-xs sm:text-sm text-[#101828]/70 dark:text-white/70 leading-relaxed font-normal">
                {productDesc}
              </p>
            </div>

            {/* Spec Indicators */}
            <div className="space-y-3 py-4 border-t border-b border-black/5 dark:border-white/5 text-xs">
              {product.specification && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-bold text-[#101828]/60 dark:text-white/60 uppercase text-[11px] tracking-wider">
                    {t('products.specifications', 'Technical Specs')}
                  </span>
                  <span className="col-span-2 font-semibold text-[#101828] dark:text-white leading-relaxed">
                    {product.specification}
                  </span>
                </div>
              )}

              {product.material && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-bold text-[#101828]/60 dark:text-white/60 uppercase text-[11px] tracking-wider">
                    {t('products.material', 'Material')}
                  </span>
                  <span className="col-span-2 font-semibold text-[#101828]/90 dark:text-white/90 leading-relaxed">
                    {product.material}
                  </span>
                </div>
              )}

              {(product.size || product.dimensions) && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-bold text-[#101828]/60 dark:text-white/60 uppercase text-[11px] tracking-wider">
                    {t('products.sizes_custom', 'Dimensions')}
                  </span>
                  <span className="col-span-2 font-semibold text-[#101828]/90 dark:text-white/90 leading-relaxed">
                    {product.size || product.dimensions}
                  </span>
                </div>
              )}

              {product.fireRating && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-bold text-[#101828]/60 dark:text-white/60 uppercase text-[11px] tracking-wider">
                    Fire Rating
                  </span>
                  <span className="col-span-2 font-semibold text-amber-600 dark:text-amber-400">
                    {product.fireRating}
                  </span>
                </div>
              )}
            </div>

            {/* Actions: Social Share & Order/Download Buttons */}
            <div className="space-y-5">
              {/* Share buttons */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#101828]/50 dark:text-white/50 uppercase tracking-wider flex items-center gap-1">
                  <Share2 className="w-3.5 h-3.5" /> {t('products.share_sheets', 'Direct Share Sheets')}
                </span>
                <div className="flex gap-2">
                  <a
                    href={getSharingUrl('telegram')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-[#26A5E4] hover:scale-105 transition-transform"
                    title="Share on Telegram"
                  >
                    <Send className="w-4 h-4" />
                  </a>
                  <a
                    href={getSharingUrl('whatsapp')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-green-50 dark:bg-green-950/20 text-[#25D366] hover:scale-105 transition-transform"
                    title="Share on WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                  <a
                    href={getSharingUrl('messenger')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-[#006AFF] hover:scale-105 transition-transform"
                    title="Share on Messenger"
                  >
                    <Smartphone className="w-4 h-4" />
                  </a>
                  <a
                    href={getSharingUrl('email')}
                    className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-500 hover:scale-105 transition-transform"
                    title="Share via Email"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Primary CTA: Order & PDF Download */}
              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    if (onOrderClick) {
                      onOrderClick(productName);
                    } else {
                      window.open('https://t.me/sdycompanyci', '_blank');
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-gradient-to-r from-[#0A4DA3] via-[#113586] to-[#1E88E5] hover:from-[#083c80] hover:to-[#1976D2] text-white text-xs sm:text-sm font-extrabold uppercase tracking-widest rounded-2xl shadow-xl hover:shadow-2xl transition-all transform active:scale-[0.99]"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-300" />
                  {t('products.order_door_furniture', 'ទិញ/កុម្ម៉ង់ទ្វារ & គ្រឿងសង្ហារិម (Order Product)')}
                </button>

                {isDownloadSuccessful ? (
                  <div className="flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider animate-bounce">
                    <CheckCircle className="w-4 h-4" /> {t('products.download_success', 'Technical Sheet Downloaded!')}
                  </div>
                ) : (
                  <button
                    onClick={handleDownloadPdf}
                    className="w-full flex items-center justify-center gap-2.5 py-3 bg-[#004b93] hover:bg-[#003870] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.99]"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Download PDF Specification Sheet</span>
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
