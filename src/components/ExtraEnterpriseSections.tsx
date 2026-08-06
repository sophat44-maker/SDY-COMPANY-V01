import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import { transformGoogleDriveUrl } from '../utils/googleDrive';
import { formatDriveUrl } from '../types';
import { 
  Download, FileText, CheckCircle2, Award, 
  MapPin, ShieldCheck, Factory, Settings, Layers, 
  Sliders, ArrowRight, User, Mail, Phone, UploadCloud,
  ChevronDown, Search, HelpCircle, FileCheck, Landmark, Flame
} from 'lucide-react';
import { useLanguage } from './LanguageContext';

/* ==========================================================================
   1. DOWNLOAD CENTER SECTION
   ========================================================================== */
export function DownloadCenterSection() {
  const { t, language, downloads: dynamicDownloads } = useLanguage();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadedList, setDownloadedList] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const staticDownloads = [
    {
      id: 'dl1',
      title: 'SDY Corporate Portfolio & Manufacturing Specs',
      type: 'PDF Catalog',
      size: '14.2 MB',
      category: 'Brochure'
    },
    {
      id: 'dl2',
      title: 'UL-10C Fire Rated Door Technical Datasheet',
      type: 'Engineering Spec',
      size: '4.8 MB',
      category: 'Technical'
    },
    {
      id: 'dl3',
      title: 'Structural Steel Trusses - Load Calculation Tables',
      type: 'CAD/Structural',
      size: '22.1 MB',
      category: 'Technical'
    },
    {
      id: 'dl4',
      title: 'ISO 9001:2015 Quality Assurance System Certificate',
      type: 'Compliance Cert',
      size: '2.1 MB',
      category: 'Compliance'
    },
    {
      id: 'dl5',
      title: 'Acoustic Solid Timber Door Sound Transmission Test (STC 38)',
      type: 'Acoustic Report',
      size: '3.6 MB',
      category: 'Compliance'
    },
    {
      id: 'dl6',
      title: 'Double Glazed Curtain Wall Facade Wind Load Profile',
      type: 'Architectural Spec',
      size: '11.4 MB',
      category: 'Technical'
    }
  ];

  const downloads = dynamicDownloads && dynamicDownloads.length > 0
    ? dynamicDownloads.map((item: any) => {
        const title = language === 'km' && (item["Title KH"] || item.Title_KH || item.title_kh)
          ? (item["Title KH"] || item.Title_KH || item.title_kh)
          : language === 'ko' && (item["Title KO"] || item.Title_KO || item.title_ko)
          ? (item["Title KO"] || item.Title_KO || item.title_ko)
          : (item["Title EN"] || item.Title_EN || item.title_en || item.title || "");
        return {
          id: String(item.DownloadID || item.id || ""),
          title,
          type: String(item.Type || item.type || "PDF"),
          size: String(item.Size || item.size || "Unknown"),
          category: String(item.Category || item.category || "Brochure"),
          fileUrl: item.FileURL || item.fileUrl || item.file_url || item.url || ''
        };
      })
    : staticDownloads;

  const handleDownload = (id: string, name: string, fileUrl?: string) => {
    if (downloadingId) return;
    setDownloadingId(id);
    setDownloadProgress(0);

    // Trigger file download
    if (fileUrl && fileUrl !== '#') {
      const formatted = transformGoogleDriveUrl(fileUrl) || formatDriveUrl(fileUrl) || fileUrl;
      const link = document.createElement('a');
      link.href = formatted;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.download = `${name.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Fallback: Generate real PDF with jsPDF
      try {
        const doc = new jsPDF();
        doc.setFillColor(10, 77, 163);
        doc.rect(0, 0, 210, 35, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.text("SDY COMPANY C&I - RESOURCE CENTER", 15, 22);

        doc.setTextColor(30, 41, 59);
        doc.setFontSize(14);
        doc.text(name, 15, 55);

        doc.setFontSize(10);
        doc.text(`Document Reference: ${id.toUpperCase()}`, 15, 70);
        doc.text(`Issued Date: ${new Date().toLocaleDateString()}`, 15, 78);
        doc.text("Status: VERIFIED ARCHITECTURAL SPECIFICATION", 15, 86);

        doc.text("This official specification sheet was generated from the SDY C&I Technical Archives.", 15, 105);
        doc.text("For engineering support, contact info@sdy-ci.com | Web: www.sdy-ci.com", 15, 115);

        doc.save(`SDY_${name.replace(/\s+/g, '_')}.pdf`);
      } catch (err) {
        console.error("Failed to generate PDF:", err);
      }
    }

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setDownloadingId(null);
            setDownloadedList((prevSet) => {
              const next = new Set(prevSet);
              next.add(id);
              return next;
            });
          }, 400);
          return 100;
        }
        return prev + 25;
      });
    }, 100);
  };

  const filteredDownloads = downloads.filter(dl => 
    dl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dl.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-dark dark:text-white">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 dark:bg-accent/5 border border-primary/10 dark:border-accent/10">
          <Download className="w-3.5 h-3.5 text-primary dark:text-accent" />
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary dark:text-accent">{t('downloads.badge', 'Resource Center')}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{t('downloads.title', 'Corporate Download Center')}</h2>
        <p className="text-sm text-dark/60 dark:text-white/60 leading-relaxed">
          {t('downloads.subtitle', 'Access our verified industrial specifications, structural calculations, fire-test certificates, and design blueprint parameters.')}
        </p>

        {/* Local Search bar */}
        <div className="relative max-w-md mx-auto pt-4">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-dark/45 dark:text-white/45" />
          <input
            type="text"
            placeholder={t('downloads.search_placeholder', 'Search resource archives...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-black/10 dark:border-white/10 bg-white/5 backdrop-blur-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDownloads.map((dl) => (
          <div
            key={dl.id}
            className="p-6 rounded-2xl bg-white dark:bg-[#101828] border border-black/5 dark:border-white/5 shadow-lg flex flex-col justify-between hover:scale-[1.01] transition-transform duration-300"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <span className="px-2.5 py-1 rounded-md bg-primary/5 dark:bg-accent/5 text-[10px] font-bold text-primary dark:text-accent uppercase tracking-wider">
                  {dl.category}
                </span>
                <span className="text-[10px] font-semibold text-dark/40 dark:text-white/40">{dl.size}</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-3 rounded-xl bg-red-500/10 text-red-500 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-snug">{dl.title}</h3>
                  <p className="text-[10px] text-dark/50 dark:text-white/50 font-semibold mt-1">{dl.type}</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-black/5 dark:border-white/5 mt-6">
              {downloadingId === dl.id ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span>{t('downloads.status_saving', 'Downloading...')}</span>
                    <span>{downloadProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-150"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                </div>
              ) : downloadedList.has(dl.id) ? (
                <button
                  disabled
                  className="w-full py-2.5 rounded-xl bg-green-500/15 text-green-500 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {t('downloads.status_completed', 'Downloaded')}
                </button>
              ) : (
                <button
                  onClick={() => handleDownload(dl.id, dl.title, (dl as any).fileUrl)}
                  className="w-full py-2.5 rounded-xl bg-primary hover:bg-accent text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  {t('downloads.btn_download', 'Download File')}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   2. CAREERS SECTION
   ========================================================================== */
export function CareersSection() {
  const { t, language, careers: dynamicCareers } = useLanguage();
  const [activeJob, setActiveJob] = useState<string | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  
  // Application Form States
  const [appName, setAppName] = useState('');
  const [appEmail, setAppEmail] = useState('');
  const [appPhone, setAppPhone] = useState('');
  const [appMessage, setAppMessage] = useState('');
  const [appFile, setAppFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appSuccess, setAppSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const staticJobs = [
    {
      id: 'job1',
      title: 'Senior BIM Modeler (Structural Steel)',
      department: 'Engineering Division',
      location: 'Phnom Penh HQ / NR3 Factory',
      salary: '$1,200 - $1,800 / Month',
      desc: 'Responsible for full-scale steel structure modeling, material takeoff calculations, structural framing collision checking, and generating manufacturing shop drawings.',
      reqs: [
        'Bachelor\'s Degree in Civil/Structural Engineering or equivalent.',
        'Min 4 years active experience modeling heavy structural steel trusses using Tekla Structures or Revit BIM.',
        'Fluency in technical English. Khmer language proficiency is preferred.'
      ]
    },
    {
      id: 'job2',
      title: 'Senior Joinery Estimator',
      department: 'Interior Contracting Division',
      location: 'Phnom Penh Headquarters',
      salary: '$1,000 - $1,500 / Month',
      desc: 'Leads full bill of quantities (BOQ) estimates, analyzing architectural joinery drawings, timber door specs, and sourcing custom veneer prices to formulate competitive bids.',
      reqs: [
        'Degree in Quantity Surveying, Architecture, or Interior Construction.',
        'Min 3 years working with commercial fit-outs, millwork, and timber fabrication estimates.',
        'Rigorous attention to detail and ability to perform under tight tender timelines.'
      ]
    },
    {
      id: 'job3',
      title: 'CNC Carpentry Production Supervisor',
      department: 'Manufacturing Plant',
      location: 'National Road 3 Heavy Factory',
      salary: '$800 - $1,300 / Month',
      desc: 'Oversees our heavy cabinetry and automatic timber door lines. Sets up digital milling routes, monitors high-pressure laminate presses, and ensures absolute millimeter tolerances.',
      reqs: [
        'Strong background in industrial wood manufacturing, CNC router configurations, and quality checklists.',
        'Capable of reading AutoCAD shop blueprints and organizing shift schedules.',
        'Focus on safety compliance (protective wear, chemical disposal limits).'
      ]
    }
  ];

  const jobs = dynamicCareers && dynamicCareers.length > 0
    ? dynamicCareers.map((item: any) => {
        const title = language === 'km' && (item["Title KH"] || item.Title_KH || item.title_kh)
          ? (item["Title KH"] || item.Title_KH || item.title_kh)
          : language === 'ko' && (item["Title KO"] || item.Title_KO || item.title_ko)
          ? (item["Title KO"] || item.Title_KO || item.title_ko)
          : (item["Title EN"] || item.Title_EN || item.title_en || item.title || "");
        
        const desc = language === 'km' && (item["Description KH"] || item.Description_KH || item.description_kh)
          ? (item["Description KH"] || item.Description_KH || item.description_kh)
          : language === 'ko' && (item["Description KO"] || item.Description_KO || item.description_ko)
          ? (item["Description KO"] || item.Description_KO || item.description_ko)
          : (item["Description EN"] || item.Description_EN || item.description_en || item.description || "");

        const reqsStr = language === 'km' && (item["Requirements KH"] || item.Requirements_KH || item.requirements_kh)
          ? (item["Requirements KH"] || item.Requirements_KH || item.requirements_kh)
          : language === 'ko' && (item["Requirements KO"] || item.Requirements_KO || item.requirements_ko)
          ? (item["Requirements KO"] || item.Requirements_KO || item.requirements_ko)
          : (item["Requirements EN"] || item.Requirements_EN || item.requirements_en || "");

        const reqs = reqsStr ? String(reqsStr).split("\n").map((r: string) => r.trim()).filter(Boolean) : [];

        return {
          id: String(item.JobID || item.id || ""),
          title,
          department: String(item.Department || item.department || ""),
          location: String(item.Location || item.location || ""),
          salary: String(item.Salary || item.salary || "Negotiable"),
          desc,
          reqs: reqs.length > 0 ? reqs : ["Contact HR for requirements."]
        };
      })
    : staticJobs;

  const handleApplyClick = (jobTitle: string) => {
    setSelectedJobTitle(jobTitle);
    setIsApplyModalOpen(true);
    setAppSuccess(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAppFile(e.target.files[0]);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName || !appEmail || !appPhone) {
      alert(t('validation.fields_missing', 'Please fill all required fields and upload your CV.'));
      return;
    }

    setIsSubmitting(true);
    
    // Attempt real synchronization with Google Sheets if configured
    try {
      const savedConfig = localStorage.getItem('sdy_admin_config');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        if (config.googleSheetsWebhookUrl && config.isSyncEnabled) {
          const payload = {
            name: appName,
            email: appEmail,
            phone: appPhone,
            company: 'Careers Application',
            subject: `Job Application: ${selectedJobTitle}`,
            message: `Brief Statement:\n${appMessage}\n\nAttached File: ${appFile ? appFile.name : 'None'}`,
            status: 'Pending',
            date: new Date().toLocaleString("en-US", { timeZone: "Asia/Phnom_Penh" })
          };
          
          await fetch(config.googleSheetsWebhookUrl.trim(), {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(payload)
          });
        }
      }
    } catch (err) {
      console.warn('Google Sheets careers sync failed, logging locally:', err);
    }

    // Save to local contact messages log as well so they show up on local dashboard
    const newInquiry = {
      id: `app_${Date.now()}`,
      name: appName,
      email: appEmail,
      phone: appPhone,
      company: 'Careers Application',
      subject: `Job Application: ${selectedJobTitle}`,
      message: `Brief Statement:\n${appMessage}\n\nAttached File: ${appFile ? appFile.name : 'None'}`,
      date: new Date().toLocaleString("en-US", { timeZone: "Asia/Phnom_Penh" }),
      status: 'Pending'
    };

    try {
      const savedMsgs = localStorage.getItem('sdy_contact_messages');
      let currentArray = savedMsgs ? JSON.parse(savedMsgs) : [];
      currentArray.unshift(newInquiry);
      localStorage.setItem('sdy_contact_messages', JSON.stringify(currentArray));
    } catch (err) {}

    setIsSubmitting(false);
    setAppSuccess(true);
    setAppName('');
    setAppEmail('');
    setAppPhone('');
    setAppMessage('');
    setAppFile(null);
  };

  return (
    <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-dark dark:text-white">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 dark:bg-accent/5 border border-primary/10 dark:border-accent/10">
          <Award className="w-3.5 h-3.5 text-primary dark:text-accent" />
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary dark:text-accent">{t('careers.badge', 'Join Our Crew')}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{t('careers.title', 'Build Your Career With SDY')}</h2>
        <p className="text-sm text-dark/60 dark:text-white/60 leading-relaxed">
          {t('careers.subtitle', 'We are looking for dedicated structural modelers, timber crafts experts, and estimator quantity surveyors to run Cambodia\'s premium manufacturing plant.')}
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="p-5 rounded-2xl bg-white dark:bg-[#101828] border border-black/5 dark:border-white/5 shadow-md overflow-hidden transition-all duration-300"
          >
            <button
              onClick={() => setActiveJob(activeJob === job.id ? null : job.id)}
              className="w-full flex items-center justify-between text-left"
            >
              <div>
                <h3 className="text-sm sm:text-base font-bold text-dark dark:text-white">{job.title}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[10px] sm:text-xs text-dark/45 dark:text-white/45 font-medium">
                  <span className="flex items-center gap-1"><Landmark className="w-3.5 h-3.5 shrink-0" /> {job.department}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 shrink-0" /> {job.location}</span>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 shrink-0 ${activeJob === job.id ? 'rotate-180 text-primary' : ''}`} />
            </button>

            <AnimatePresence>
              {activeJob === job.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-black/5 dark:border-white/5 pt-4 space-y-4 text-xs sm:text-sm"
                >
                  <p className="text-dark/70 dark:text-white/70 leading-relaxed text-xs">{job.desc}</p>
                  
                  <div className="space-y-1.5">
                    <p className="font-bold text-primary dark:text-accent text-xs uppercase tracking-wider">{t('careers.requirements', 'Candidate Requirements')}:</p>
                    <ul className="list-disc pl-5 space-y-1 text-dark/60 dark:text-white/60 text-xs">
                      {job.reqs.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-black/5 dark:border-white/5">
                    <div className="text-xs">
                      <span className="text-dark/45 dark:text-white/45 font-medium">{t('careers.remuneration', 'Remuneration Guide')}:</span>
                      <p className="font-bold text-[#25D366] mt-0.5">{job.salary}</p>
                    </div>
                    <button
                      onClick={() => handleApplyClick(job.title)}
                      className="px-5 py-2.5 rounded-xl bg-primary hover:bg-accent text-white text-xs font-bold transition-colors"
                    >
                      {t('careers.btn_apply', 'Apply For Role')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Slide-in Apply Application Form Modal */}
      <AnimatePresence>
        {isApplyModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/60 backdrop-blur-md"
            onClick={() => setIsApplyModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="w-full max-w-xl bg-white dark:bg-[#101828] rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl p-6 relative overflow-y-auto max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>

              <h3 className="text-base sm:text-lg font-bold text-dark dark:text-white mb-1">{t('careers.apply_title', 'Submit Professional Application')}</h3>
              <p className="text-xs text-dark/50 dark:text-white/50 mb-6 font-medium">
                {t('careers.apply_role', 'Position')}: <span className="text-primary dark:text-accent font-bold">{selectedJobTitle}</span>
              </p>

              {appSuccess ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-green-500">{t('careers.app_success_title', 'Application Received successfully!')}</h4>
                  <p className="text-xs text-dark/60 dark:text-white/60 leading-relaxed max-w-sm mx-auto">
                    {t('careers.app_success_desc', 'Thank you for submitting your CV. Our engineering and human resource directors will review your technical profiles and reach out via email shortly.')}
                  </p>
                  <button
                    onClick={() => setIsApplyModalOpen(false)}
                    className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold"
                  >
                    {t('projects.close', 'Close Window')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-dark/70 dark:text-white/70 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-primary" /> {t('contact.name', 'Full Name')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] text-dark dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-dark/70 dark:text-white/70 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-primary" /> {t('contact.email', 'Email Address')} *
                      </label>
                      <input
                        type="email"
                        required
                        value={appEmail}
                        onChange={(e) => setAppEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] text-dark dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-dark/70 dark:text-white/70 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-primary" /> {t('contact.phone', 'Phone Number')} *
                      </label>
                      <input
                        type="tel"
                        required
                        value={appPhone}
                        onChange={(e) => setAppPhone(e.target.value)}
                        placeholder="+855 23 888 999"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] text-dark dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-dark/70 dark:text-white/70">
                      {t('careers.cover_letter', 'Brief Cover Summary / Statement')}
                    </label>
                    <textarea
                      value={appMessage}
                      onChange={(e) => setAppMessage(e.target.value)}
                      rows={3}
                      placeholder={t('careers.cover_placeholder', 'Outline your years of technical drawing experience or woodworking mastery...')}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] text-dark dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Drag and Drop CV Upload Container */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-dark/70 dark:text-white/70">
                      {t('careers.upload_cv', 'Upload Resume & Portfolio (PDF/DOC)')} *
                    </label>
                    
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-black/10 dark:border-white/10 rounded-2xl p-6 text-center hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors cursor-pointer flex flex-col items-center justify-center gap-2"
                    >
                      <UploadCloud className="w-8 h-8 text-primary dark:text-accent animate-pulse" />
                      {appFile ? (
                        <div>
                          <p className="text-xs font-bold text-green-500">{appFile.name}</p>
                          <p className="text-[10px] text-dark/40 dark:text-white/40">{(appFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-semibold">{t('careers.drag_drop', 'Drag and drop CV here or click to select')}</p>
                          <p className="text-[10px] text-dark/40 dark:text-white/40 mt-1">Accepts PDF, DOC up to 10MB</p>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-[#0A4DA3] hover:bg-[#1E88E5] disabled:bg-slate-400 text-white text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 mt-4"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        {t('careers.submitting', 'Submitting Profiles...')}
                      </>
                    ) : (
                      <>
                        <FileCheck className="w-4 h-4" />
                        {t('careers.btn_submit', 'Submit Official Application')}
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ==========================================================================
   3. FACTORY & BEFORE & AFTER SLIDER SECTION
   ========================================================================== */
export function FactorySection() {
  const { t } = useLanguage();
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const stats = [
    { label: t('factory.area_label', 'Total Factory Floor'), value: '4,500 sqm', desc: t('factory.area_desc', 'Heavy engineering & joinery facilities on NR3.') },
    { label: t('factory.steel_label', 'Steel Capacity'), value: '12,000 Tons/Yr', desc: t('factory.steel_desc', 'Precision sandblasted architectural columns.') },
    { label: t('factory.door_label', 'Acoustic/Fire Doors'), value: '80,000 Units/Yr', desc: t('factory.door_desc', 'High-speed automated UV woodworking lines.') },
    { label: t('factory.workers_label', 'Licensed Engineers'), value: '45+ On-Site', desc: t('factory.workers_desc', 'Dedicated CAD drafting & compliance managers.') }
  ];

  const machinery = [
    { name: 'Bystronic Swiss Fiber Laser', desc: 'Precision structural metal cutting up to 25mm carbon steel beams.' },
    { name: 'Automated Veneer Hot Press', desc: 'Applies premium wood veneer under extreme heat with zero warping.' },
    { name: 'Soundproof Decibel Test Lab', desc: 'Simulates heavy ambient noise testing to certify STC-38 rating.' },
    { name: 'Heavy CNC Joinery Millers', desc: 'Millimeter-accurate computer routing for complex wall paneled boards.' }
  ];

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  return (
    <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-dark dark:text-white space-y-24">
      {/* Intro and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 dark:bg-accent/5 border border-primary/10 dark:border-accent/10">
            <Factory className="w-3.5 h-3.5 text-primary dark:text-accent" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary dark:text-accent">{t('factory.badge', 'Local Fabrication')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            {t('factory.title', 'National Road 3 Manufacturing Hub')}
          </h2>
          <p className="text-sm text-dark/70 dark:text-white/70 leading-relaxed">
            {t('factory.desc', 'By manufacturing timber frames, acoustic acoustic wood cores, fire-stop steel gaskets, and structural truss elements entirely inside our Cambodian facility, we bypass intermediate import markups. This ensures material traceability, compliance audit trails, and strict cost controls.')}
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            {machinery.map((mach, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                <p className="font-bold text-xs">{mach.name}</p>
                <p className="text-[10px] text-dark/50 dark:text-white/50 leading-relaxed mt-0.5">{mach.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Big Stats Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white dark:bg-[#101828] border border-black/5 dark:border-white/5 shadow-xl flex flex-col justify-between hover:scale-102 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/5 dark:bg-accent/5 flex items-center justify-center text-primary dark:text-accent">
                <Sliders className="w-5 h-5" />
              </div>
              <div className="mt-6">
                <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{stat.value}</span>
                <p className="text-sm font-bold text-dark dark:text-white mt-1.5">{stat.label}</p>
                <p className="text-xs text-dark/50 dark:text-white/50 leading-relaxed mt-1">{stat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Before & After Dual Layer Comparison Slider */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h3 className="text-xl sm:text-2xl font-extrabold">{t('factory.slider_title', 'Before & After Workspace Transformation')}</h3>
          <p className="text-xs text-dark/50 dark:text-white/50">
            {t('factory.slider_desc', 'Slide to compare the original raw concrete structural shell against the fully customized SDY glassmorphic luxury executive headquarters.')}
          </p>
        </div>

        <div 
          ref={containerRef}
          className="relative h-[300px] sm:h-[450px] w-full rounded-2xl overflow-hidden shadow-2xl border border-black/10 dark:border-white/10 cursor-ew-resize select-none"
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
        >
          {/* Before Layer (Underneath / Right side) */}
          <div className="absolute inset-0 w-full h-full bg-[#101828]">
            <img 
              src="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=1200" 
              alt="Before - Raw Structural Frame"
              className="w-full h-full object-cover brightness-50"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-black/70 border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider">
              Before: Raw Construction Shell
            </div>
          </div>

          {/* After Layer (On top / Left side) */}
          <div 
            className="absolute inset-0 w-full h-full overflow-hidden"
            style={{ width: `${sliderPosition}%` }}
          >
            <img 
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200" 
              alt="After - Premium Corporate Fit-Out"
              className="absolute inset-0 w-full h-full object-cover max-w-none brightness-60"
              style={{ width: containerRef.current?.getBoundingClientRect().width }}
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-[#0A4DA3]/80 border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider whitespace-nowrap">
              After: Finished Executive Fit-Out
            </div>
          </div>

          {/* Vertical Slider Handle */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-white hover:bg-accent cursor-ew-resize z-20 flex items-center justify-center shadow-lg"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="w-8 h-8 rounded-full bg-white dark:bg-[#101828] border border-black/10 dark:border-white/10 text-dark dark:text-white flex items-center justify-center shadow-xl text-xs font-bold font-mono">
              ↔
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   4. INTERACTIVE QUOTATION SYSTEM
   ========================================================================== */
export function InteractiveQuoteSection() {
  const { t } = useLanguage();
  
  // Calculator States
  const [category, setCategory] = useState<'interior' | 'steel' | 'facade' | 'door'>('interior');
  const [area, setArea] = useState(250);
  const [floors, setFloors] = useState(1);
  const [specs, setSpecs] = useState('standard');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Dynamic Estimation Math Logic
  let pricePerSqm = 120;
  let materialsBreakdown = '';
  let laborEstimate = 0;

  if (category === 'interior') {
    pricePerSqm = specs === 'standard' ? 140 : specs === 'premium' ? 220 : 350;
    materialsBreakdown = 'Natural timber veneer, drywall grids, premium tempered safety glass paneling, and acoustic paint finishes.';
  } else if (category === 'steel') {
    pricePerSqm = specs === 'standard' ? 180 : specs === 'premium' ? 280 : 420;
    materialsBreakdown = 'Sandblasted Q355B low-alloy structural steel, epoxy anti-corrosive primer coating, and high-tensile connection bolts.';
  } else if (category === 'facade') {
    pricePerSqm = specs === 'standard' ? 160 : specs === 'premium' ? 260 : 390;
    materialsBreakdown = 'T6063-T5 structural aluminum extrusions, double-glazed Low-E tempered panels, EPDM weather sealant, and silicon spacer pads.';
  } else if (category === 'door') {
    pricePerSqm = specs === 'standard' ? 220 : specs === 'premium' ? 380 : 550;
    materialsBreakdown = 'Solid kiln-dried American walnut timber core, UL-certified rockwool fire stops, hydraulic pivot bearings, and steel frame gaskets.';
  }

  const basePrice = area * pricePerSqm * floors;
  const priceRangeMin = Math.round(basePrice * 0.9);
  const priceRangeMax = Math.round(basePrice * 1.15);
  const estSteelTons = Math.round(area * 0.08 * floors);
  const estWoodCubic = Math.round(area * 0.035 * floors);

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail || !clientPhone) {
      alert(t('validation.fields_missing', 'Please fill all required fields.'));
      return;
    }

    setIsSubmitting(true);

    const notesStr = `Dynamic Quote Breakdown:\nCategory: ${category}\nArea: ${area} sqm\nFloors: ${floors}\nSpecs: ${specs}\nCalculated Price Range: $${priceRangeMin.toLocaleString()} - $${priceRangeMax.toLocaleString()}\nKey Materials Needed: ${materialsBreakdown}`;

    // 1. Send quotation to real Google Sheet endpoint
    try {
      const savedConfig = localStorage.getItem('sdy_admin_config');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        if (config.googleSheetsWebhookUrl && config.isSyncEnabled) {
          await fetch(config.googleSheetsWebhookUrl.trim(), {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify({
              action: 'submitVisitorQuotation',
              quotationForm: {
                name: clientName,
                email: clientEmail,
                phone: clientPhone,
                company: 'Interactive Estimate Calculator',
                selectedProducts: `${category.toUpperCase()} Specification Plan`,
                notes: notesStr
              }
            })
          });
        }
      }
    } catch (err) {
      console.warn('Failed to post interactive quotation to Google Sheets:', err);
    }

    // 2. Local logs fallback
    const newInquiry = {
      id: `inq_${Date.now()}`,
      name: clientName,
      email: clientEmail,
      phone: clientPhone,
      company: 'Interactive Estimate Calculator',
      subject: `Automated Quotation: ${category.toUpperCase()} Fit-Out`,
      message: notesStr,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'New'
    };

    try {
      const currentRaw = localStorage.getItem('sdy_contact_messages');
      let currentArray = currentRaw ? JSON.parse(currentRaw) : [];
      currentArray.unshift(newInquiry);
      localStorage.setItem('sdy_contact_messages', JSON.stringify(currentArray));
    } catch (err) {}

    setIsSubmitting(false);
    setIsFinished(true);
    setClientName('');
    setClientEmail('');
    setClientPhone('');
  };

  return (
    <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-dark dark:text-white">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 dark:bg-accent/5 border border-primary/10 dark:border-accent/10">
          <Sliders className="w-3.5 h-3.5 text-primary dark:text-accent" />
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary dark:text-accent">{t('quote.badge', 'Instant Pricing')}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{t('quote.title', 'Interactive Structural Quote Calculator')}</h2>
        <p className="text-sm text-dark/60 dark:text-white/60 leading-relaxed">
          {t('quote.subtitle', 'Configure your project parameters below to calculate material quantities and professional cost ranges inside Cambodia.')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto items-start">
        {/* Input Configuration Panel */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-[#101828] border border-black/5 dark:border-white/5 shadow-xl space-y-6">
          <h3 className="text-base font-bold flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-3">
            <Settings className="w-4 h-4 text-primary" /> 1. Project Specifications
          </h3>

          <div className="space-y-4 text-xs">
            {/* Category selection */}
            <div className="space-y-1.5">
              <label className="font-bold text-dark/70 dark:text-white/70">Project Division / Specialty *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'interior', label: 'Interior Fit-Out' },
                  { id: 'steel', label: 'Steel Trusses' },
                  { id: 'facade', label: 'Glass Facade' },
                  { id: 'door', label: 'Acoustic Door' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id as any)}
                    className={`py-2 px-3 rounded-xl border text-center transition-all ${
                      category === cat.id
                        ? 'bg-[#0A4DA3] text-white border-[#0A4DA3] font-bold shadow-md'
                        : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/10 dark:border-white/10 hover:bg-black/5'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Area slide selector */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center font-bold">
                <label className="text-dark/70 dark:text-white/70">Estimated Built Surface Area</label>
                <span className="text-primary dark:text-accent font-extrabold text-sm">{area} sqm</span>
              </div>
              <input
                type="range"
                min={20}
                max={5000}
                step={10}
                value={area}
                onChange={(e) => setArea(Number(e.target.value))}
                className="w-full accent-primary bg-black/5 dark:bg-white/5 h-2 rounded-full cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-dark/40 dark:text-white/40 font-semibold">
                <span>20 sqm</span>
                <span>2,500 sqm</span>
                <span>5,000 sqm</span>
              </div>
            </div>

            {/* Floors selection */}
            <div className="space-y-1.5">
              <label className="font-bold text-dark/70 dark:text-white/70">Number of Stories / Multi-levels</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((fl) => (
                  <button
                    key={fl}
                    type="button"
                    onClick={() => setFloors(fl)}
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all font-bold ${
                      floors === fl
                        ? 'bg-[#0A4DA3] text-white border-[#0A4DA3] shadow-md'
                        : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/10 dark:border-white/10'
                    }`}
                  >
                    {fl}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality specs selection */}
            <div className="space-y-1.5">
              <label className="font-bold text-dark/70 dark:text-white/70">Materials Finish Level</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'standard', label: 'Standard Industrial', desc: 'Compliant & cost-efficient.' },
                  { id: 'premium', label: 'Premium Luxury', desc: 'Polished walnut, double glazing.' },
                  { id: 'elite', label: 'High-Sec / Extreme', desc: 'Certified bulletproof, 120min UL.' }
                ].map((sp) => (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => setSpecs(sp.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      specs === sp.id
                        ? 'bg-[#0A4DA3] text-white border-[#0A4DA3] font-bold shadow-md'
                        : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/10 dark:border-white/10 hover:bg-black/5'
                    }`}
                  >
                    <p className="font-bold leading-tight">{sp.label}</p>
                    <p className={`text-[9px] mt-0.5 leading-relaxed ${specs === sp.id ? 'text-white/80' : 'text-dark/40 dark:text-white/40'}`}>{sp.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cost Estimation Breakdown Display Panel */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#101828] text-white border border-white/5 shadow-xl space-y-6">
          <h3 className="text-base font-bold flex items-center gap-2 border-b border-white/5 pb-3 text-[#1E88E5]">
            <Award className="w-4 h-4" /> 2. Estimation Breakdown
          </h3>

          {isFinished ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-green-400">Quote Request Submitted</h4>
              <p className="text-[10px] text-white/60 leading-relaxed max-w-xs mx-auto">
                Your parameters have been transmitted safely to our active admin pipeline. An SDY project manager will formulate a formal engineering proposal and call you within 24 hours.
              </p>
              <button
                onClick={() => setIsFinished(false)}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-bold"
              >
                Recalculate Estimate
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Massive Cost Display */}
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#1E88E5] font-extrabold">Estimated Investment Range</span>
                <p className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#1E88E5] to-green-400 mt-1">
                  ${priceRangeMin.toLocaleString()} - ${priceRangeMax.toLocaleString()}
                </p>
                <p className="text-[9px] text-white/40 leading-relaxed mt-0.5">*Includes raw fabrication, professional assembly labor, and compliance testing.</p>
              </div>

              {/* Quantities Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs border-t border-b border-white/5 py-4">
                <div>
                  <span className="text-white/45">Estimated Steel Framing:</span>
                  <p className="font-bold text-sm mt-0.5">{estSteelTons} Tons</p>
                </div>
                <div>
                  <span className="text-white/45">Bespoke Timber:</span>
                  <p className="font-bold text-sm mt-0.5">{estWoodCubic} cubic meters</p>
                </div>
              </div>

              {/* Materials Details */}
              <div className="text-xs space-y-1">
                <span className="text-white/45 font-bold block uppercase tracking-wider text-[10px] text-[#1E88E5]">Suggested Composition:</span>
                <p className="text-white/75 leading-relaxed text-[11px]">{materialsBreakdown}</p>
              </div>

              {/* Secure Booking Form */}
              <form onSubmit={handleQuoteSubmit} className="space-y-3.5 pt-2">
                <div className="space-y-1">
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Contact Name *"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-white/10 bg-white/5 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="Email Address *"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-white/10 bg-white/5 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Phone Coordinates *"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-white/10 bg-white/5 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-lg bg-[#0A4DA3] hover:bg-[#1E88E5] disabled:bg-zinc-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Transmitting Specs...' : 'Request Formal Proposal'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   5. SEARCHABLE ACCORDION FAQ SECTION
   ========================================================================== */
export function FAQSection() {
  const { t, language, faq: dynamicFaqs } = useLanguage();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const staticFaqs = [
    {
      q: t('faq.q1', 'Are your fire doors and materials fully certified in Cambodia?'),
      a: t('faq.a1', 'Yes. All SDY Guardian doors are tested by independent safety engineers and UL-certified to compartmentalize heat and flames for 60, 90, or 120 minutes. We provide compliance certificate paperwork ready for national building audits.')
    },
    {
      q: t('faq.q2', 'How does local manufacturing on National Road 3 lower project cost?'),
      a: t('faq.a2', 'By processing steel beams, tempering safety glass panels, and executing luxury wood veneer work within our 4,500 sqm heavy plant, we bypass intermediate import broker tariffs. This saves 15-25% in budget metrics and prevents transport logistics delays.')
    },
    {
      q: t('faq.q3', 'What is the standard production timeline for custom joinery or structural steel trusses?'),
      a: t('faq.a3', 'Standard acoustic door assembly takes 15-20 days. Heavy structural steel fabrication and sandblasting averages 30-45 days depending on the structural scope. Turnkey corporate interior fit-out completions range from 4 to 8 weeks.')
    },
    {
      q: t('faq.q4', 'Can I visit the SDY manufacturing factory for material inspection?'),
      a: t('faq.a4', 'Absolutely. We actively encourage developers and structural engineering consultants to visit our NR3 heavy facility to verify timber moisture checks, acoustic decibel test suites, and observe our fiber laser mills in operation.')
    }
  ];

  const faqs = dynamicFaqs && dynamicFaqs.length > 0
    ? dynamicFaqs.map((item: any) => {
        const q = language === 'km' && (item["Question KH"] || item.Question_KH || item.question_kh)
          ? (item["Question KH"] || item.Question_KH || item.question_kh)
          : language === 'ko' && (item["Question KO"] || item.Question_KO || item.question_ko)
          ? (item["Question KO"] || item.Question_KO || item.question_ko)
          : (item["Question EN"] || item.Question_EN || item.question_en || item.q || "");
        
        const a = language === 'km' && (item["Answer KH"] || item.Answer_KH || item.answer_kh)
          ? (item["Answer KH"] || item.Answer_KH || item.answer_kh)
          : language === 'ko' && (item["Answer KO"] || item.Answer_KO || item.answer_ko)
          ? (item["Answer KO"] || item.Answer_KO || item.answer_ko)
          : (item["Answer EN"] || item.Answer_EN || item.answer_en || item.a || "");

        return { q, a };
      })
    : staticFaqs;

  const filteredFaqs = faqs.filter(
    faq => faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
           faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-dark dark:text-white">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 dark:bg-accent/5 border border-primary/10 dark:border-accent/10">
          <HelpCircle className="w-3.5 h-3.5 text-primary dark:text-accent" />
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary dark:text-accent">{t('faq.badge', 'Support Center')}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{t('faq.title', 'Compliance & Industrial FAQ')}</h2>
        <p className="text-sm text-dark/60 dark:text-white/60 leading-relaxed">
          {t('faq.subtitle', 'Review instant professional answers on acoustic sound ratings, UL fire codes, lead times, and on-site material inspections.')}
        </p>

        {/* Search Input */}
        <div className="relative max-w-md mx-auto pt-4">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-dark/45 dark:text-white/45" />
          <input
            type="text"
            placeholder={t('faq.search_placeholder', 'Search answers...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-black/10 dark:border-white/10 bg-white/5 backdrop-blur-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {filteredFaqs.map((faq, index) => (
          <div
            key={index}
            className="p-5 rounded-2xl bg-white dark:bg-[#101828] border border-black/5 dark:border-white/5 shadow-md overflow-hidden transition-all duration-300"
          >
            <button
              onClick={() => setActiveFaq(activeFaq === index ? null : index)}
              className="w-full flex items-center justify-between text-left gap-4"
            >
              <h3 className="text-xs sm:text-sm font-bold text-dark dark:text-white leading-relaxed">{faq.q}</h3>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 shrink-0 ${activeFaq === index ? 'rotate-180 text-primary' : ''}`} />
            </button>

            <AnimatePresence>
              {activeFaq === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  transition={{ duration: 0.25 }}
                  className="border-t border-black/5 dark:border-white/5 pt-3 overflow-hidden"
                >
                  <p className="text-[11px] sm:text-xs text-dark/75 dark:text-white/75 leading-relaxed font-medium">
                    {faq.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
