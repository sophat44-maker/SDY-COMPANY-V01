import { useState } from 'react';
import { Calendar, User, BookOpen, ArrowRight, X, Newspaper, Clock } from 'lucide-react';
import { BlogPost } from '../types';
import { useLanguage } from './LanguageContext';

export default function BlogSection() {
  const { t, language, blogs, isLoading } = useLanguage();
  const [activePost, setActivePost] = useState<BlogPost | null>(null);

  return (
    <section id="blog-page" className="py-24 bg-[#F7F9FC] dark:bg-[#101828]/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#0A4DA3]/5 dark:bg-[#1E88E5]/10 rounded-full">
            <span className="text-xs sm:text-sm font-bold tracking-[0.18em] text-[#0A4DA3] dark:text-[#1E88E5] uppercase">
              {t('blog.journal', 'Corporate Journal')}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#101828] dark:text-white tracking-tight">
            {t('blog.title', 'Engineering Insights & Corporate News')}
          </h2>
          <p className="text-sm sm:text-base text-[#101828]/60 dark:text-white/60 leading-relaxed">
            {t('blog.subtitle', 'Stay informed on building safety directives, double-glazed climate performance, high-end soundproofing, and factory expansions at SDY C&I in Phnom Penh.')}
          </p>
        </div>

        {/* Blogs Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0A4DA3]"></div>
            <p className="mt-4 text-xs font-semibold text-[#101828]/50 dark:text-white/50">{t('validation.loading', 'Loading live blog articles from Google Sheets...')}</p>
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((post) => (
              <div
                key={post.id}
                onClick={() => setActivePost(post)}
                className="group cursor-pointer rounded-2xl bg-white dark:bg-[#101828] border border-black/[0.03] dark:border-white/[0.03] overflow-hidden shadow-md hover:shadow-2xl hover:border-[#0A4DA3]/20 dark:hover:border-[#1E88E5]/20 transition-all duration-500 hover:-translate-y-1"
              >
                
                {/* Blog Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-black/10">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-4 left-4 px-3.5 py-1.5 bg-[#0A4DA3] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg shadow-md">
                    {t('blog.cat.' + post.category.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_'), post.category)}
                  </span>
                </div>

                {/* Blog Content */}
                <div className="p-6.5 space-y-4">
                  
                  {/* Meta details */}
                  <div className="flex items-center gap-4 text-xs sm:text-sm text-[#101828]/60 dark:text-white/60 font-semibold uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-[#1E88E5]" /> {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4 text-[#1E88E5]" /> {t('blog.by', 'By')} {(language === 'km' ? post.Author_KH || post.author : language === 'ko' ? post.Author_KO || post.author : post.Author_EN || post.author).split(',')[0]}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#101828] dark:text-white group-hover:text-[#0A4DA3] dark:group-hover:text-[#1E88E5] transition-colors leading-snug line-clamp-2">
                    {language === 'km' ? post.Title_KH || post.title : language === 'ko' ? post.Title_KO || post.title : post.Title_EN || post.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#101828]/60 dark:text-white/60 leading-relaxed line-clamp-3">
                    {language === 'km' ? post.Excerpt_KH || post.excerpt : language === 'ko' ? post.Excerpt_KO || post.excerpt : post.Excerpt_EN || post.excerpt}
                  </p>

                  {/* Read CTA */}
                  <div className="pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs font-bold text-[#0A4DA3] dark:text-[#1E88E5]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {t('blog.read_time', '3 Min Read')}
                    </span>
                    <span className="flex items-center gap-1.5 group-hover:underline">
                      {t('blog.read_article', 'Read Article')} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>

                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-[#101828] rounded-2xl border border-black/5 dark:border-white/5 max-w-lg mx-auto">
            <p className="text-sm font-semibold text-[#101828]/60 dark:text-white/60">{t('validation.no_results', 'No blog articles found.')}</p>
          </div>
        )}

      </div>

      {/* DETAILED BLOG LIGHTBOX MODAL */}
      {activePost && (
        <div className="fixed inset-0 z-50 bg-[#101828]/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="relative bg-white dark:bg-[#101828] w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl border border-white/5 max-h-[90vh] flex flex-col">
            
            {/* Close Button */}
            <button
              onClick={() => setActivePost(null)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/60 text-white hover:bg-[#0A4DA3] transition-all"
              aria-label="Close Blog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="overflow-y-auto flex-1">
              
              {/* Blog Top cover */}
              <div className="relative h-56 sm:h-72 w-full bg-black">
                <img
                  src={activePost.image}
                  alt={activePost.title}
                  className="w-full h-full object-cover filter brightness-65"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#101828] via-transparent to-black/25" />
                
                {/* Meta block inside cover */}
                <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                  <span className="px-3 py-1 bg-[#1E88E5] text-[9px] font-bold uppercase tracking-wider rounded-lg shadow-md inline-block">
                    {t('blog.cat.' + activePost.category.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_'), activePost.category)}
                  </span>
                  <h3 className="text-xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                    {language === 'km' ? activePost.Title_KH || activePost.title : language === 'ko' ? activePost.Title_KO || activePost.title : activePost.Title_EN || activePost.title}
                  </h3>
                </div>
              </div>

              {/* Article Content */}
              <div className="p-6 sm:p-8 space-y-6">
                
                {/* Header Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-[#101828]/50 dark:text-white/50 uppercase tracking-widest pb-4 border-b border-black/5 dark:border-white/5">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#1E88E5]" /> {activePost.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[#1E88E5]" /> {language === 'km' ? activePost.Author_KH || activePost.author : language === 'ko' ? activePost.Author_KO || activePost.author : activePost.Author_EN || activePost.author}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#1E88E5]" /> {t('blog.tech_journal', 'Technical Journal')}
                  </span>
                </div>

                {/* Article body */}
                <div className="text-sm sm:text-base text-[#101828]/80 dark:text-white/85 leading-relaxed space-y-4">
                  <p className="font-semibold text-lg text-[#0A4DA3] dark:text-[#1E88E5] border-l-4 border-[#0A4DA3] pl-4">
                    {language === 'km' ? activePost.Excerpt_KH || activePost.excerpt : language === 'ko' ? activePost.Excerpt_KO || activePost.excerpt : activePost.Excerpt_EN || activePost.excerpt}
                  </p>
                  <p className="whitespace-pre-line text-sm sm:text-base">
                    {language === 'km' ? activePost.Content_KH || activePost.content : language === 'ko' ? activePost.Content_KO || activePost.content : activePost.Content_EN || activePost.content}
                  </p>
                  <p className="text-sm">
                    {t('blog.disclaimer', 'At SDY Company C&I, we continue to engineer our building structures, doors, and glass panels to exceed modern regulations. Contact our Phnom Penh planning desk today to download comprehensive structural design catalogs or coordinate on-site inspections.')}
                  </p>
                </div>

                {/* Footer close */}
                <div className="pt-6 border-t border-black/5 dark:border-white/5 text-center">
                  <button
                    onClick={() => setActivePost(null)}
                    className="px-6 py-2.5 bg-black/5 dark:bg-white/10 hover:bg-[#0A4DA3] hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
                  >
                    {t('blog.back', 'Back to Articles')}
                  </button>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

    </section>
  );
}
