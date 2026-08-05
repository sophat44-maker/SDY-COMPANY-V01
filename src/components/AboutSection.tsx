import { useState, useEffect } from 'react';
import {
  ShieldAlert, Award, Star, History, Users, Hammer, Factory,
  Building2, Briefcase, CheckCircle2, Sparkles, Crown, Network, ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { useAboutPage } from './AboutContext';
import sdyFactoryImg from '../assets/images/sdy_factory_warehouse_1784873526443.jpg';

/**
 * Auto converts Google Drive share URLs into direct view image URLs.
 */
export function convertGoogleDriveUrl(url: string | undefined): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.includes('drive.google.com')) {
    const matchD = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (matchD && matchD[1]) {
      return `https://lh3.googleusercontent.com/d/${matchD[1]}`;
    }
    const matchId = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (matchId && matchId[1]) {
      return `https://lh3.googleusercontent.com/d/${matchId[1]}`;
    }
  }
  return trimmed;
}

const isImageUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  const processed = convertGoogleDriveUrl(url);
  return (
    processed.startsWith('http://') ||
    processed.startsWith('https://') ||
    processed.startsWith('/') ||
    processed.startsWith('data:image')
  );
};

const getInitials = (name: string): string => {
  if (!name) return 'SD';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

function LeaderAvatar({
  imageUrl,
  name,
  isBoard = false,
}: {
  imageUrl?: string;
  name: string;
  isBoard?: boolean;
}) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [imageUrl]);

  const photoUrl = convertGoogleDriveUrl(imageUrl);
  const isValid = photoUrl && isImageUrl(photoUrl) && !imgError;

  if (isBoard) {
    return (
      <div className="relative p-1 rounded-full bg-gradient-to-tr from-amber-400 via-[#0A4DA3] to-amber-300 shadow-xl shrink-0 ring-2 ring-amber-400/30">
        {isValid ? (
          <img
            src={photoUrl}
            alt={name}
            onError={() => setImgError(true)}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#0B1A30] via-[#0A4DA3] to-[#101828] text-amber-300 font-black text-2xl sm:text-3xl flex items-center justify-center font-serif shadow-inner border border-amber-400/30">
            {getInitials(name)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-16 h-16 rounded-2xl overflow-hidden relative shrink-0 p-1 bg-slate-100 dark:bg-slate-800/80 border-2 border-[#0A4DA3]/30 shadow-md group-hover:border-[#1E88E5] transition-colors">
      {isValid ? (
        <img
          src={photoUrl}
          alt={name}
          onError={() => setImgError(true)}
          className="w-full h-full rounded-xl object-cover group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#0B1A30] via-[#0A4DA3] to-[#101828] text-amber-300 font-black text-lg flex items-center justify-center font-serif shadow-inner border border-amber-400/20">
          {getInitials(name)}
        </div>
      )}
    </div>
  );
}

const RenderValueIcon = ({ name, className }: { name: string; className?: string }) => {
  switch (name) {
    case 'ShieldAlert': return <ShieldAlert className={className} />;
    case 'Award': return <Award className={className} />;
    case 'Star': return <Star className={className} />;
    case 'Factory': return <Factory className={className} />;
    case 'Users': return <Users className={className} />;
    case 'Building2': return <Building2 className={className} />;
    case 'Crown': return <Crown className={className} />;
    case 'Hammer': return <Hammer className={className} />;
    default: return <Award className={className} />;
  }
};

export default function AboutSection() {
  const { t, language } = useLanguage();
  const { aboutPageData } = useAboutPage();
  const currentLang = (language as 'km' | 'en' | 'ko') || 'en';

  const overview = aboutPageData?.overview;
  const coreValues = aboutPageData?.core_values;
  const timeline = aboutPageData?.timeline;
  const teamGov = aboutPageData?.team_governance;

  const tagText = overview?.tag?.[currentLang] || overview?.tag?.en || t('intro.tag', 'Corporate Profile');
  const titleText = overview?.title?.[currentLang] || overview?.title?.en || t('about.title', "About SDY Company C&I");
  const factoryImg = overview?.factory_image_url || sdyFactoryImg;
  const badgeText = overview?.badge_text?.[currentLang] || overview?.badge_text?.en || t('contact.office', 'Headquarters & Factory');
  const badgeSubtext = overview?.badge_subtext?.[currentLang] || overview?.badge_subtext?.en || t('about.factory_operators_desc', 'Over 150 certified operators executing fine joinery, custom millwork, and construction fit-outs.');

  // Separate team leaders into Executive Board (Top Tier) vs Department Leadership
  const allLeaders = teamGov?.leaders || [];
  let topLeaders = allLeaders.filter(l => l.category === 'directors');
  let deptLeaders = allLeaders.filter(l => l.category !== 'directors');

  // Fallback: If no leader is explicitly marked as directors, take first 2 as directors
  if (topLeaders.length === 0 && allLeaders.length > 0) {
    topLeaders = allLeaders.slice(0, 2);
    deptLeaders = allLeaders.slice(2);
  }

  return (
    <section id="about-page" className="py-24 bg-white dark:bg-[#101828] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        
        {/* Company Pitch Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0A4DA3]/5 dark:bg-[#1E88E5]/10 rounded-full">
              <span className="text-xs sm:text-sm font-bold tracking-[0.2em] text-[#0A4DA3] dark:text-[#1E88E5] uppercase">
                {tagText}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#101828] dark:text-white tracking-tight leading-tight">
              {titleText}
            </h2>
            <div className="space-y-4 text-base text-[#101828]/70 dark:text-white/70 leading-relaxed">
              {overview?.story_paragraphs && overview.story_paragraphs.length > 0 ? (
                overview.story_paragraphs.map((p, idx) => (
                  <p key={idx}>{p[currentLang] || p.en}</p>
                ))
              ) : (
                <>
                  <p>{t('about.p1', "Established in 2016, SDY Company is a leading manufacturer of wooden products in Cambodia, dedicated to introducing new innovations and advanced technologies to the market.")}</p>
                  <p>{t('about.p2', "Equipped with comprehensive manufacturing facilities and state-of-the-art machinery from Korea, we produce the highest quality wooden products.")}</p>
                </>
              )}
            </div>
          </div>
          
          {/* Cover Graphic Block */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl group aspect-[4/3] bg-[#101828]">
            <img
              src={factoryImg}
              alt={badgeText}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-750"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#101828] via-[#101828]/45 to-transparent" />
            
            {/* Info badge */}
            <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-white/10 dark:bg-[#101828]/60 backdrop-blur-md border border-white/15 flex items-center gap-3.5">
              <Factory className="w-10 h-10 text-[#1E88E5] shrink-0" />
              <div>
                <span className="text-xs font-bold text-[#1E88E5] uppercase tracking-widest block">{badgeText}</span>
                <p className="text-sm text-white/90 font-bold leading-normal mt-0.5">
                  {badgeSubtext}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Core values block */}
        <div className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#101828] dark:text-white tracking-tight">
              {coreValues?.section_title?.[currentLang] || coreValues?.section_title?.en || t('about.values', 'Our Operational Values')}
            </h3>
            <p className="text-sm sm:text-base text-[#101828]/70 dark:text-white/70">
              {coreValues?.section_subtitle?.[currentLang] || coreValues?.section_subtitle?.en || t('about.values_desc', 'The pillars that define every action we execute inside our office, factories, and construction zones.')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(coreValues?.values_list || []).map((val, index) => {
              const valTitle = val.title?.[currentLang] || val.title?.en || '';
              const valDesc = val.description?.[currentLang] || val.description?.en || '';
              return (
                <div
                  key={val.id || index}
                  className="p-8 rounded-2xl bg-white dark:bg-dark border border-black/[0.03] dark:border-white/[0.03] space-y-4 sleek-card shadow-sm"
                >
                  <div className="w-11 h-11 rounded-lg bg-primary/5 dark:bg-accent/15 flex items-center justify-center text-primary dark:text-accent">
                    <RenderValueIcon name={val.icon} className="w-5.5 h-5.5" />
                  </div>
                  <h4 className="font-bold text-dark dark:text-white text-lg">{valTitle}</h4>
                  <p className="text-xs sm:text-sm text-dark/70 dark:text-white/70 leading-relaxed">{valDesc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Company timeline milestones */}
        <div className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#101828] dark:text-white tracking-tight">
              {timeline?.section_title?.[currentLang] || timeline?.section_title?.en || t('about.history', 'Our Corporate Journey')}
            </h3>
            <p className="text-sm sm:text-base text-[#101828]/70 dark:text-white/70">
              {timeline?.section_subtitle?.[currentLang] || timeline?.section_subtitle?.en || t('about.history_desc', 'Chronology of SDY C&I growth as a trusted engineering brand.')}
            </p>
          </div>
          
          <div className="relative border-l-2 border-[#0A4DA3]/15 dark:border-white/10 pl-6 sm:pl-10 space-y-12 max-w-4xl mx-auto">
            {(timeline?.events || []).map((stone, index) => {
              const eventTitle = stone.title?.[currentLang] || stone.title?.en || '';
              const eventDesc = stone.description?.[currentLang] || stone.description?.en || '';
              return (
                <div key={stone.id || index} className="relative group">
                  <div className="absolute -left-[31px] sm:-left-[47px] top-1.5 w-4 h-4 rounded-full bg-white dark:bg-[#101828] border-2 border-[#0A4DA3] group-hover:bg-[#1E88E5] transition-colors duration-300 shadow-sm" />
                  
                  <div className="space-y-2">
                    <span className="text-xl font-extrabold text-[#0A4DA3] dark:text-[#1E88E5] tracking-wide block">
                      {stone.year}
                    </span>
                    <h4 className="font-bold text-lg text-[#101828] dark:text-white">
                      {eventTitle}
                    </h4>
                    <p className="text-sm sm:text-base text-[#101828]/70 dark:text-white/70 leading-relaxed max-w-2xl">
                      {eventDesc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Leadership Section */}
        <div className="space-y-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto space-y-2"
          >
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#0A4DA3]/5 dark:bg-[#1E88E5]/10 rounded-full mb-2 border border-[#0A4DA3]/10 dark:border-[#1E88E5]/20">
              <Sparkles className="w-3.5 h-3.5 text-[#0A4DA3] dark:text-[#1E88E5]" />
              <span className="text-xs font-bold tracking-widest text-[#0A4DA3] dark:text-[#1E88E5] uppercase">
                {t('about.leadership_tag', 'Corporate Governance')}
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#101828] dark:text-white tracking-tight">
              {teamGov?.section_title?.[currentLang] || teamGov?.section_title?.en || t('about.directors', 'Board of Directors & Governance')}
            </h3>
            <p className="text-sm sm:text-base text-[#101828]/70 dark:text-white/70">
              {teamGov?.section_subtitle?.[currentLang] || teamGov?.section_subtitle?.en || t('about.team_desc', 'A unified corporate team driving quality design, local fabrication, and site-erection compliance.')}
            </p>
          </motion.div>
          
          <div className="p-6 sm:p-12 rounded-3xl bg-gradient-to-b from-[#F7F9FC] via-[#F0F4FA] to-[#EEF2F8] dark:from-[#101828]/90 dark:via-[#0D1525] dark:to-[#0B111D] border border-black/5 dark:border-white/10 shadow-2xl space-y-10 max-w-6xl mx-auto backdrop-blur-md relative overflow-hidden">
            
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#0A4DA3]/10 dark:bg-[#1E88E5]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-amber-500/10 dark:bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-10">
              
              {/* TOP LEVEL HIERARCHY: BOARD OF DIRECTORS */}
              {topLeaders.length > 0 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/15 dark:bg-amber-400/10 border border-amber-400/40 text-amber-700 dark:text-amber-300 text-xs font-black uppercase tracking-widest shadow-sm">
                      <Crown className="w-4 h-4 text-amber-500" />
                      <span>{t('about.board_of_directors', 'Executive Board of Directors')}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {topLeaders.map((member, i) => {
                      const memberRole = member.role?.[currentLang] || member.role?.en || '';
                      const memberDept = member.department?.[currentLang] || member.department?.en || '';
                      const photoRaw = member.image_url || member.photo_or_initials;

                      return (
                        <motion.div
                          key={member.id || i}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: i * 0.1 }}
                          whileHover={{ y: -6, scale: 1.01 }}
                          className="p-8 sm:p-9 rounded-3xl bg-gradient-to-br from-white via-slate-50 to-amber-500/5 dark:from-[#111C2E] dark:via-[#0F172A] dark:to-[#1E293B] border-2 border-amber-400/40 dark:border-amber-400/30 shadow-2xl relative overflow-hidden group hover:shadow-amber-500/10 transition-all duration-500 flex flex-col justify-between"
                        >
                          {/* Premium Top Bar Accent */}
                          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-[#0A4DA3] to-amber-500" />
                          
                          {/* Floating Role Tag */}
                          <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-600 dark:text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase tracking-wider">
                            <ShieldCheck className="w-3 h-3 text-amber-500" />
                            <span>Executive</span>
                          </div>

                          <div className="space-y-6 pt-2">
                            {/* Avatar Header */}
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                              <LeaderAvatar imageUrl={photoRaw} name={member.name} isBoard={true} />

                              <div className="space-y-1.5 min-w-0">
                                <h4 className="text-xl sm:text-2xl font-black text-[#101828] dark:text-white group-hover:text-[#0A4DA3] dark:group-hover:text-[#1E88E5] transition-colors tracking-tight">
                                  {member.name}
                                </h4>
                                <p className="text-xs sm:text-sm font-extrabold text-[#0A4DA3] dark:text-[#1E88E5] uppercase tracking-wider">
                                  {memberRole}
                                </p>
                                {memberDept && (
                                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#0A4DA3]/10 dark:bg-white/10 text-[#0A4DA3] dark:text-white/90 text-xs font-bold border border-[#0A4DA3]/20">
                                    <Building2 className="w-3 h-3 text-[#0A4DA3] dark:text-[#1E88E5]" />
                                    {memberDept}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Key Expertise Badges (Limit max 2) */}
                            {member.sub_skills && member.sub_skills.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
                                {member.sub_skills.slice(0, 2).map((skill, sIdx) => (
                                  <span
                                    key={sIdx}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700/80 shadow-xs"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ORGANIZATIONAL FLOW CONNECTOR LINES */}
              {deptLeaders.length > 0 && (
                <div className="flex flex-col items-center justify-center py-2 relative z-10">
                  <div className="w-0.5 h-10 bg-gradient-to-b from-amber-400 via-[#0A4DA3] to-[#1E88E5] shadow-sm" />
                  <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white dark:bg-[#0F172A] border border-[#0A4DA3]/30 dark:border-[#1E88E5]/40 shadow-xl text-xs font-black text-[#0A4DA3] dark:text-[#1E88E5] uppercase tracking-widest my-1 backdrop-blur-md">
                    <Network className="w-4 h-4 text-[#1E88E5] animate-pulse" />
                    <span>{t('about.dept_leadership', 'Departmental Directors & Operational Managers')}</span>
                  </div>
                  <div className="w-0.5 h-8 bg-gradient-to-b from-[#1E88E5] to-slate-300 dark:to-slate-700" />
                </div>
              )}

              {/* SECOND LEVEL HIERARCHY: DEPARTMENT DIRECTORS & MANAGERS */}
              {deptLeaders.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
                  {deptLeaders.map((member, i) => {
                    const memberRole = member.role?.[currentLang] || member.role?.en || '';
                    const memberDept = member.department?.[currentLang] || member.department?.en || '';
                    const photoRaw = member.image_url || member.photo_or_initials;

                    return (
                      <motion.div
                        key={member.id || i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: i * 0.08 }}
                        whileHover={{ y: -6, scale: 1.01 }}
                        className="p-6 rounded-2xl bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800/80 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group flex flex-col justify-between"
                      >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0A4DA3] via-[#1E88E5] to-[#0A4DA3]" />
                        
                        <div className="space-y-4">
                          <div className="flex items-start gap-4">
                            {/* Avatar Container */}
                            <LeaderAvatar imageUrl={photoRaw} name={member.name} isBoard={false} />

                            <div className="space-y-1 min-w-0 overflow-hidden">
                              <p className="font-extrabold text-base text-[#101828] dark:text-white group-hover:text-[#0A4DA3] dark:group-hover:text-[#1E88E5] transition-colors truncate">
                                {member.name}
                              </p>
                              <p className="text-xs font-bold text-[#0A4DA3] dark:text-[#1E88E5] uppercase tracking-wide truncate">
                                {memberRole}
                              </p>
                              {memberDept && (
                                <span className="inline-block text-[11px] font-bold bg-[#0A4DA3]/10 dark:bg-white/10 text-[#0A4DA3] dark:text-white/80 px-2.5 py-0.5 rounded-md truncate">
                                  {memberDept}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Key Expertise Badges (Limit max 2) */}
                          {member.sub_skills && member.sub_skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                              {member.sub_skills.slice(0, 2).map((skill, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md border border-slate-200/80 dark:border-slate-700/80"
                                >
                                  <Sparkles className="w-3 h-3 text-[#1E88E5] shrink-0" />
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

