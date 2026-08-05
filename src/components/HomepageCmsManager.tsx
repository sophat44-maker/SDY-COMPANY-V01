import React, { useState, useEffect, useRef } from 'react';
import { useHomepage } from './HomepageContext';
import { useLanguage } from './LanguageContext';
import { transformGoogleDriveUrl } from '../utils/googleDrive';
import {
  Globe,
  Save,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  Layers,
  Building2,
  Cpu,
  DoorClosed,
  ShieldCheck,
  FileText,
  Plus,
  Trash2,
  Eye,
  Settings,
  Phone,
  Mail,
  Share2,
  Wrench,
  ChevronRight
} from 'lucide-react';

export type LanguageCode = 'km' | 'en' | 'ko';

export interface TrilingualText {
  km: string;
  en: string;
  ko: string;
}

export interface CapabilityItem {
  id: string;
  title: TrilingualText;
  description: TrilingualText;
  icon_type: string;
}

export interface FeaturedProjectItem {
  id: string;
  project_name: TrilingualText;
  category_tag: string;
  description: TrilingualText;
  cover_image_url: string;
}

export interface WhyChooseReason {
  id: string;
  step_number: string;
  title: TrilingualText;
  description: TrilingualText;
}

export interface BlogArticleItem {
  id: string;
  title: TrilingualText;
  category: string;
  summary: TrilingualText;
  cover_image_url: string;
}

export interface WorkflowStepItem {
  id?: string;
  step_number: string;
  title: TrilingualText;
  description: TrilingualText;
}

export interface HomepageCmsData {
  hero_section: {
    hero_title: TrilingualText;
    hero_subtitle: TrilingualText;
    hero_cta_primary: {
      label: TrilingualText;
      link: string;
    };
    hero_cta_secondary: {
      label: TrilingualText;
      link: string;
    };
    bg_image_url: string;
  };
  company_stats: {
    factory_area: string;
    completed_projects: string;
    experienced_craftsmen: string;
    years_excellence: string;
    assurance_text: TrilingualText;
  };
  capabilities: {
    capabilities_title: TrilingualText;
    items: CapabilityItem[];
  };
  featured_projects: {
    projects_title: TrilingualText;
    items: FeaturedProjectItem[];
  };
  manufacturing_machinery: {
    section_title: TrilingualText;
    description: TrilingualText;
    features: TrilingualText[];
    gallery_images: string[];
  };
  why_choose_sdy: {
    reasons: WhyChooseReason[];
  };
  operational_workflow: {
    section_tag: TrilingualText;
    section_title: TrilingualText;
    section_subtitle: TrilingualText;
    steps: WorkflowStepItem[];
  };
  blog_insights: {
    section_title: TrilingualText;
    articles: BlogArticleItem[];
  };
  cta_banner_and_footer: {
    cta_banner_text: TrilingualText;
    company_tagline: TrilingualText;
    address: TrilingualText;
    phone: string;
    email: string;
    social_links: {
      facebook: string;
      telegram: string;
      youtube: string;
      linkedin: string;
    };
  };
}

export const defaultHomepageCmsData: HomepageCmsData = {
  hero_section: {
    hero_title: {
      km: "វិស្វកម្មរួមបញ្ចូល និងការម៉ៅការផ្នែកខាងក្នុងតាមតម្រូវការ",
      en: "Integrated Engineering & Bespoke Interior Fit-Out Contracting",
      ko: "통합 엔지니어링 및 맞춤형 인테리어 시공 전문 기업"
    },
    hero_subtitle: {
      km: "ស្វែងយល់ពីប្រវត្តិក្រុមហ៊ុន ស្នាដៃជាងឈើ និងទ្វារកម្រិតខ្ពស់សម្រាប់គម្រោងពាណិជ្ជកម្ម និងលំនៅឋាន",
      en: "Discover company history, fine woodworking craftsmanship, and premium architectural doors for commercial & residential projects.",
      ko: "상업 및 주거 프로젝트를 위한 회사 연혁, 고급 목공 장인 정신 및 프리미엄 건축용 도어를 만나보세요."
    },
    hero_cta_primary: {
      label: {
        km: "ស្វែងយល់ពីប្រវត្តិក្រុមហ៊ុន",
        en: "Company Profile",
        ko: "회사 소개"
      },
      link: "/about"
    },
    hero_cta_secondary: {
      label: {
        km: "ទំនាក់ទំនងយើងខ្ញុំ",
        en: "Contact Us",
        ko: "문의하기"
      },
      link: "/contact"
    },
    bg_image_url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=2000"
  },
  company_stats: {
    factory_area: "4,500 sqm",
    completed_projects: "450+",
    experienced_craftsmen: "180+",
    years_excellence: "8+",
    assurance_text: {
      km: "នៃបេសកកម្មសាងសង់ ចុះបញ្ជីការ និងផលិតកម្មគ្រឿងសង្ហារិមស្តង់ដារអន្តរជាតិ",
      en: "of excellence in construction, registered engineering, and international-standard furniture manufacturing.",
      ko: "건축, 등록 엔지니어링 및 국제 표준 가구 제조 분야의 우수성."
    }
  },
  capabilities: {
    capabilities_title: {
      km: "សមត្ថភាពស្នូលផ្នែកឧស្សាហកម្មរបស់យើង",
      en: "Our Core Industrial Capabilities",
      ko: "주요 산업 역량"
    },
    items: [
      {
        id: "cap_1",
        title: {
          km: "ប្រើប្រាស់ដោយម៉ាស៊ីន CNC ទំនើបៗ",
          en: "German CNC Precision Machinery",
          ko: "독일제 CNC 정밀 기계"
        },
        description: {
          km: "ការកាត់ និងកែច្នៃឈើដោយស្វ័យប្រវត្តិកម្រិតមីក្រូម៉ែត្រ ធានាភាពជឿជាក់ខ្ពស់",
          en: "Automated micrometer-level wood cutting and joining for unmatched project consistency.",
          ko: "마이크로미터 수준의 자동화된 목재 절단 및 접합으로 타의 추종을 불허하는 품질 제공."
        },
        icon_type: "Cpu"
      },
      {
        id: "cap_2",
        title: {
          km: "ទ្វារទំនើបទាន់សម័យ គុណភាពខ្ពស់",
          en: "High-Performance Architectural Doors",
          ko: "고성능 건축용 도어"
        },
        description: {
          km: "ទ្វារឈើប្រណិត និងទ្វារការពារអគ្គិភ័យ តាមស្តង់ដារសុវត្ថិភាពអន្តរជាតិ ISO",
          en: "Premium solid doors and certified fire-rated doors engineered for institutional standards.",
          ko: "기관 표준에 맞춘 프리미엄 원목 도어 및 인증된 방화 도어."
        },
        icon_type: "DoorClosed"
      },
      {
        id: "cap_3",
        title: {
          km: "ការម៉ៅការតម្លើងផ្នែកខាងក្នុង (Fit-Out)",
          en: "Full-Scope Interior Fit-Out Contracting",
          ko: "풀스코프 인테리어 시공"
        },
        description: {
          km: "សេវាកម្មរចនា និងតម្លើងគ្រឿងសង្ហារិមជាប់ជញ្ជាំង សម្រាប់អគារពាណិជ្ជកម្ម និងសណ្ឋាគារ",
          en: "End-to-end joinery and fixed furniture installation for commercial and hotel projects.",
          ko: "상업 및 호텔 프로젝트를 위한 맞춤 목공 및 고정 가구 설치."
        },
        icon_type: "Layers"
      }
    ]
  },
  featured_projects: {
    projects_title: {
      km: "សមិទ្ធផលគម្រោងធំៗដែលទើបបញ្ចប់ថ្មីៗ",
      en: "Recently Completed Major Projects",
      ko: "최근 완료된 주요 프로젝트"
    },
    items: [
      {
        id: "proj_1",
        project_name: {
          km: "អគារការិយាល័យ Vattanac Capital Corporate Office",
          en: "Vattanac Capital Tower Corporate Office",
          ko: "바타낙 캐피탈 타워 기업 오피스"
        },
        category_tag: "COMMERCIAL FIT-OUT",
        description: {
          km: "ការតម្លើងផ្នែកខាងក្នុងពាណិជ្ជកម្ម និងទ្វារឈើប្រណិតតាមស្តង់ដារអន្តរជាតិ",
          en: "Luxury interior fit-out, acoustic wall paneling, and engineered executive doors.",
          ko: "럭셔리 인테리어 시공, 음향 벽 패널 및 맞춤형 임원용 도어."
        },
        cover_image_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: "proj_2",
        project_name: {
          km: "សណ្ឋាគារ និងរីសត Rosewood Luxury Suites",
          en: "Rosewood Hospitality Luxury Suites",
          ko: "로즈우드 호스피탈리티 럭셔리 스위트"
        },
        category_tag: "HOSPITALITY JOINERY",
        description: {
          km: "ការផលិតគ្រឿងសង្ហារិមឈើប្រណិត និងទ្វារការពារសម្លេងសម្រាប់បន្ទប់ VIP",
          en: "Bespoke American Walnut joinery, vanity units, and soundproof entrance doors.",
          ko: "맞춤형 아메리칸 월넛 목공, 화장대 및 방음 현관문."
        },
        cover_image_url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1200"
      }
    ]
  },
  manufacturing_machinery: {
    section_title: {
      km: "ឧត្តមភាពផ្នែកគ្រឿងចក្រ គ្រឿងសង្ហារិម និងផលិតផលឈើប្រណិត",
      en: "Excellence in Machinery, Furniture & Fine Woodworking",
      ko: "기계, 가구 및 고급 목공 분야의 우수성"
    },
    description: {
      km: "រោងចក្រផ្ទាល់ខ្លួនទំហំ ៤,៥០០ ម៉ែត្រការ៉េ បំពាក់ដោយម៉ាស៊ីនសម្ងួតឈើ និងម៉ាស៊ីន CNC អាល្លឺម៉ង់",
      en: "Our 4,500 sqm dedicated facility is equipped with automated kiln-dry chambers and German precision CNC machinery.",
      ko: "4,500m² 규모의 자체 공장은 자동 가마 건조실과 독일산 정밀 CNC 기계를 갖추고 있습니다."
    },
    features: [
      {
        km: "ខ្សែសង្វាក់ផលិតកម្មតាមស្តង់ដារ American Walnut & Teak Wood",
        en: "American Walnut & Premium Teak timber production lines",
        ko: "아메리칸 월넛 및 프리미엄 티크 목재 생산 라인"
      },
      {
        km: "ការរចនាតាមតម្រូវការពិសេស ISO 9001:2015",
        en: "ISO 9001:2015 Certified Quality Control Standards",
        ko: "ISO 9001:2015 인증 품질 관리 표준"
      },
      {
        km: "បច្ចេកវិទ្យាសម្ងួតឈើកម្រិតសំណើម 8-12%",
        en: "Computerized Kiln Drying down to 8-12% moisture content",
        ko: "8-12% 수분 함량의 컴퓨터 가마 건조 기술"
      }
    ],
    gallery_images: [
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800"
    ]
  },
  why_choose_sdy: {
    reasons: [
      {
        id: "reason_1",
        step_number: "01",
        title: {
          km: "ភាពច្បាស់លាស់នៃម៉ាស៊ីន CNC អាល្លឺម៉ង់",
          en: "German CNC Mill Precision",
          ko: "독일제 CNC 밀링 정밀도"
        },
        description: {
          km: "ធានាបាននូវទំហំ និងគុណភាពសមស្របតាមប្លង់ស្ថាបត្យកម្ម ១០០%",
          en: "Guarantees 100% exact dimensions matching architectural blueprints.",
          ko: "건축 도면과 100% 일치하는 정확한 치수 보장."
        }
      },
      {
        id: "reason_2",
        step_number: "02",
        title: {
          km: "ការសម្ងួតឈើកម្រិតម៉ាស៊ីន Kiln-Dried",
          en: "Scientific Kiln-Dried Moisture Control",
          ko: "과학적인 가마 건조 수분 제어"
        },
        description: {
          km: "ការពារឈើពីការវៀច ឬប្រេះស្រាំក្រោមអាកាសធាតុគ្រប់រដូវ",
          en: "Prevents warping, shrinking, and cracking under tropical climate conditions.",
          ko: "열대 기후 조건에서 뒤틀림, 수축 및 균열을 방지합니다."
        }
      },
      {
        id: "reason_3",
        step_number: "03",
        title: {
          km: "ក្រុមវិស្វករ និងជាងជំនាញមានវិញ្ញាបនបត្រ",
          en: "Licensed Engineers & Master Craftsmen",
          ko: "공인 엔지니어 및 마스터 장인"
        },
        description: {
          km: "គ្រប់គ្រង និងត្រួតពិនិត្យដោយប្រព័ន្ធ ISO រាល់ដំណាក់កាលផលិត",
          en: "Supervised by certified structural & interior engineers throughout fabrication.",
          ko: "제작 전 과정에서 인증된 구조 및 인테리어 엔지니어가 감독합니다."
        }
      }
    ]
  },
  operational_workflow: {
    section_tag: {
      km: "ដំណើរកាអនុវត្ត",
      en: "EXECUTION",
      ko: "실행 프로세스"
    },
    section_title: {
      km: "លំហូរការងារប្រតិបត្តិការ ៤ ជំហានរបស់យើង",
      en: "Our Four-Step Operational Workflow",
      ko: "당사의 4단계 운영 워크플로"
    },
    section_subtitle: {
      km: "ការផ្តល់នូវរចនាសម្ព័ន្ធរឹងមាំ និងការរចនាខាងក្នុងយ៉ាងប្រណិតតាមប្រព័ន្ធបច្ចេកទេស។",
      en: "Delivering structural integrity and exquisite aesthetic finishes systematically.",
      ko: "체계적으로 구조적 안정성과 뛰어난 미적 마감을 제공합니다."
    },
    steps: [
      {
        id: "step_1",
        step_number: "01",
        title: {
          km: "ការពិគ្រោះយោបល់ និងវិស្វកម្ម",
          en: "Consultation & Engineering",
          ko: "상담 및 엔지니어링"
        },
        description: {
          km: "ការសិក្សាប្លង់ស្ថាបត្យកម្ម និងការពិនិត្យលម្អិតផ្នែកវិស្វកម្មរចនាសម្ព័ន្ធ",
          en: "Architectural blueprint analysis and detailed structural engineering review.",
          ko: "건축 도면 분석 및 상세 구조 엔지니어링 검토."
        }
      },
      {
        id: "step_2",
        step_number: "02",
        title: {
          km: "ការផលិតនៅក្នុងរោងចក្រ",
          en: "Factory Fabrication",
          ko: "공장 제작"
        },
        description: {
          km: "ការកាត់ និងកែច្នៃឈើដោយម៉ាស៊ីន CNC អាល្លឺម៉ង់ក្នុងរោងចក្រទំហំ ៤,៥០០m²",
          en: "Automated German CNC milling and kiln-dried lumber preparation in our 4,500 sqm plant.",
          ko: "4,500m² 공장에서 자동화된 독일제 CNC 밀링 및 가마 건조 목재 준비."
        }
      },
      {
        id: "step_3",
        step_number: "03",
        title: {
          km: "ការដំឡើងនៅការដ្ឋានសាងសង់",
          en: "On-Site Installation",
          ko: "현장 설치"
        },
        description: {
          km: "ការដំឡើងគ្រឿងសង្ហារិម និងទ្វារដោយក្រុមជាងដែលមានវិញ្ញាបនបត្រ",
          en: "Precision assembly and acoustic sealing by certified site installation teams.",
          ko: "인증된 현장 설치 팀의 정밀 조립 및 음향 밀폐."
        }
      },
      {
        id: "step_4",
        step_number: "04",
        title: {
          km: "ការបញ្ជាក់ទទួលស្គាល់ និងការប្រគល់គម្រោង",
          en: "Certification & Handover",
          ko: "인증 및 인도"
        },
        description: {
          km: "ការត្រួតពិនិត្យគុណភាព ISO និងការប្រគល់ជូនអតិថិជនយ៉ាងរលូន",
          en: "Rigorous quality inspection, fire-rating validation, and seamless client handover.",
          ko: "엄격한 품질 검사, 방화 등급 검증 및 원활한 고객 인도."
        }
      }
    ]
  },
  blog_insights: {
    section_title: {
      km: "ព្រឹត្តិបត្រព័ត៌មាន និងចំណេះដឹងផ្នែកស្ថាបត្យកម្ម",
      en: "Architectural News & Engineering Insights",
      ko: "건축 뉴스 및 엔지니어링 인사이트"
    },
    articles: [
      {
        id: "art_1",
        title: {
          km: "ស្តង់ដារនៃការជ្រើសរើសទ្វារការពារអគ្គិភ័យ សម្រាប់អគារខ្ពស់ៗ",
          en: "Fire-Rated Door Selection Standards for High-Rise Developments",
          ko: "고층 개발을 위한 방화 도어 선정 표준"
        },
        category: "TECHNICAL SPECIFICATIONS",
        summary: {
          km: "ការណែនាំអំពីគុណសម្បត្តិនៃទ្វារការពារភ្លើង UL/BS សម្រាប់សុវត្ថិភាពអគារ",
          en: "A comprehensive analysis of UL/BS certified fire-resistant doors in commercial towers.",
          ko: "상업용 타워의 UL/BS 인증 방화 도어에 대한 종합 분석."
        },
        cover_image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800"
      }
    ]
  },
  cta_banner_and_footer: {
    cta_banner_text: {
      km: "ត្រូវការសំនើបច្ចេកទេស ឬសម្រង់តម្លៃដែលមានវិញ្ញាបនបត្រត្រឹមត្រូវ?",
      en: "Require Certified Technical Proposal or Commercial Quotation?",
      ko: "인증된 기술 제안서 또는 상업 견적서가 필요하신가요?"
    },
    company_tagline: {
      km: "CONSTRUCTION • INTERIOR DESIGN • FURNITURE",
      en: "CONSTRUCTION • INTERIOR DESIGN • FURNITURE",
      ko: "CONSTRUCTION • INTERIOR DESIGN • FURNITURE"
    },
    address: {
      km: "អគារ SDY Tower, ផ្លូវជាតិលេខ ៦A, រាជធានីភ្នំពេញ, ព្រះរាជាណាចក្រកម្ពុជា",
      en: "SDY Tower, National Road 6A, Phnom Penh, Kingdom of Cambodia",
      ko: "SDY 타워, 국도 6A, 프놈펜, 캄보디아 왕국"
    },
    phone: "+855 23 888 999 / +855 12 345 678",
    email: "info@sdycompany.com",
    social_links: {
      facebook: "https://facebook.com/sdycompany",
      telegram: "https://t.me/sdycompany",
      youtube: "https://youtube.com/sdycompany",
      linkedin: "https://linkedin.com/company/sdycompany"
    }
  }
};

export const HomepageCmsManager: React.FC = () => {
  const { homepageData, updateHomepageData, isSyncing, refreshFromRemote } = useHomepage();
  const { language, setLanguage, t } = useLanguage();
  const [activeLang, setActiveLang] = useState<LanguageCode>('en');
  const [activeTab, setActiveTab] = useState<'hero' | 'stats' | 'capabilities' | 'projects' | 'machinery' | 'reasons' | 'workflow' | 'blogs' | 'cta_footer'>('hero');
  const [previewLang, setPreviewLang] = useState<LanguageCode>('en');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync active editing language with global header language state
  useEffect(() => {
    if (language === 'km' || language === 'en' || language === 'ko') {
      setActiveLang(language as LanguageCode);
    }
  }, [language]);

  const previewContainerRef = useRef<HTMLDivElement>(null);

  const [cmsData, setCmsData] = useState<HomepageCmsData>(homepageData);

  useEffect(() => {
    setCmsData(homepageData);
  }, [homepageData]);

  // Keep preview language in sync with form editing language
  useEffect(() => {
    setPreviewLang(activeLang);
  }, [activeLang]);

  // Smoothly scroll the Live Preview Canvas to the selected section on tab click
  useEffect(() => {
    if (activeTab && previewContainerRef.current) {
      const targetSection = previewContainerRef.current.querySelector(`#preview-${activeTab}`);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [activeTab]);

  const handleSave = async () => {
    setIsSaving(true);
    setSyncStatusMsg('Saving and synchronizing with Google Sheets Centralized Database...');
    try {
      const res = await updateHomepageData(cmsData);
      setSyncStatusMsg(res.message);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        setSyncStatusMsg(null);
      }, 4000);
    } catch (e: any) {
      setSyncStatusMsg(`Failed to save settings: ${e?.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper setter for trilingual fields
  const updateTrilingualText = (
    pathSelector: (draft: HomepageCmsData) => TrilingualText,
    lang: LanguageCode,
    val: string
  ) => {
    setCmsData(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as HomepageCmsData;
      const target = pathSelector(next);
      if (target) {
        target[lang] = val;
      }
      return next;
    });
  };

  return (
    <div className="space-y-8 text-[#101828] dark:text-white">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#004b93] via-[#0A4DA3] to-[#1E88E5] text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full text-xs font-extrabold uppercase tracking-widest border border-amber-400/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Dynamic CMS Editor
            </span>
            <span className="text-xs text-white/70 font-semibold uppercase tracking-wider">Trilingual Ready (KM / EN / KO)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{t('admin.homepage_cms', 'Homepage Content Manager')}</h2>
          <p className="text-xs sm:text-sm text-white/80 max-w-2xl">
            Edit all 7 sections of the public homepage live across Khmer, English, and Korean. Changes persist directly into client runtime.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refreshFromRemote()}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/20 disabled:opacity-50"
            title="Fetch latest Homepage CMS state from Google Sheets"
          >
            <Globe className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Fetch Remote'}</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving || isSyncing}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-extrabold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all scale-100 hover:scale-[1.02] active:scale-95 shrink-0 border border-amber-300/40"
          >
            <Save className={`w-4 h-4 ${isSaving || isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'SYNCING TO GOOGLE SHEETS...' : t('admin.save_changes', 'SAVE CHANGES')}</span>
          </button>
        </div>
      </div>

      {syncStatusMsg && (
        <div className={`p-4 rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-3 shadow-lg ${
          syncStatusMsg.includes('Successfully') || syncStatusMsg.includes('success')
            ? 'bg-emerald-600 text-white'
            : syncStatusMsg.includes('locally')
            ? 'bg-amber-600 text-white'
            : 'bg-blue-600 text-white'
        }`}>
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{syncStatusMsg}</span>
        </div>
      )}

      {/* Language Switcher Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#101828] border border-black/10 dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#004b93] dark:text-[#1E88E5]" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#101828]/70 dark:text-white/70">
            {t('admin.active_editing_lang', 'Active Editing Language:')}
          </span>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-gray-100 dark:bg-slate-900 rounded-xl border border-black/5 dark:border-white/5">
          <button
            onClick={() => { setActiveLang('km'); setLanguage('km'); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold tracking-wide transition-all ${
              activeLang === 'km'
                ? 'bg-[#004b93] text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <span>🇰🇭</span>
            <span>Khmer (ភាសាខ្មែរ)</span>
          </button>

          <button
            onClick={() => { setActiveLang('en'); setLanguage('en'); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold tracking-wide transition-all ${
              activeLang === 'en'
                ? 'bg-[#004b93] text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <span>🇬🇧</span>
            <span>English</span>
          </button>

          <button
            onClick={() => { setActiveLang('ko'); setLanguage('ko'); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold tracking-wide transition-all ${
              activeLang === 'ko'
                ? 'bg-[#004b93] text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <span>🇰🇷</span>
            <span>Korean (한국어)</span>
          </button>
        </div>
      </div>

      {/* Section Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-black/10 dark:border-white/10 pb-3">
        {[
          { id: 'hero', label: '1. Hero Section', icon: Building2 },
          { id: 'stats', label: '2. Company Stats', icon: Layers },
          { id: 'capabilities', label: '3. Core Capabilities', icon: Cpu },
          { id: 'projects', label: '4. Featured Projects', icon: DoorClosed },
          { id: 'machinery', label: '5. Machinery & Factory', icon: Wrench },
          { id: 'reasons', label: '6. Why Choose SDY', icon: ShieldCheck },
          { id: 'blogs', label: '7. News & Insights', icon: FileText },
          { id: 'workflow', label: '8. OPERATIONAL WORKFLOW (EXECUTION)', icon: CheckCircle2 },
          { id: 'cta_footer', label: '9. CTA & Footer', icon: Settings },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all border ${
                activeTab === tab.id
                  ? 'bg-[#004b93] text-white border-[#004b93] shadow-md'
                  : 'bg-white dark:bg-[#101828]/60 text-gray-700 dark:text-gray-300 border-black/10 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Form Inputs (Left) + Live Preview Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Controls Column */}
        <div className="lg:col-span-7 space-y-6 bg-white dark:bg-[#101828] p-6 sm:p-8 rounded-3xl border border-black/10 dark:border-white/10 shadow-lg">
          {/* TAB 1: HERO SECTION */}
          {activeTab === 'hero' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
                <h3 className="text-base font-extrabold uppercase tracking-wide text-[#004b93] dark:text-[#1E88E5]">
                  Hero Section Form [{activeLang.toUpperCase()}]
                </h3>
                <span className="text-xs text-gray-500 font-semibold">Banner Background & CTAs</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase block text-gray-600 dark:text-gray-300">
                  Hero Title ({activeLang.toUpperCase()})
                </label>
                <textarea
                  rows={2}
                  value={cmsData.hero_section.hero_title[activeLang]}
                  onChange={e =>
                    updateTrilingualText(
                      d => d.hero_section.hero_title,
                      activeLang,
                      e.target.value
                    )
                  }
                  className="w-full p-3 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-slate-900 border border-black/10 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b93]"
                  placeholder="Enter main headline..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase block text-gray-600 dark:text-gray-300">
                  Hero Subtitle ({activeLang.toUpperCase()})
                </label>
                <textarea
                  rows={3}
                  value={cmsData.hero_section.hero_subtitle[activeLang]}
                  onChange={e =>
                    updateTrilingualText(
                      d => d.hero_section.hero_subtitle,
                      activeLang,
                      e.target.value
                    )
                  }
                  className="w-full p-3 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-slate-900 border border-black/10 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b93]"
                  placeholder="Enter description..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase block text-gray-600 dark:text-gray-300">
                    Primary CTA Label ({activeLang.toUpperCase()})
                  </label>
                  <input
                    type="text"
                    value={cmsData.hero_section.hero_cta_primary.label[activeLang]}
                    onChange={e =>
                      updateTrilingualText(
                        d => d.hero_section.hero_cta_primary.label,
                        activeLang,
                        e.target.value
                      )
                    }
                    className="w-full p-2.5 text-xs rounded-xl bg-gray-50 dark:bg-slate-900 border border-black/10 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b93]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase block text-gray-600 dark:text-gray-300">
                    Secondary CTA Label ({activeLang.toUpperCase()})
                  </label>
                  <input
                    type="text"
                    value={cmsData.hero_section.hero_cta_secondary.label[activeLang]}
                    onChange={e =>
                      updateTrilingualText(
                        d => d.hero_section.hero_cta_secondary.label,
                        activeLang,
                        e.target.value
                      )
                    }
                    className="w-full p-2.5 text-xs rounded-xl bg-gray-50 dark:bg-slate-900 border border-black/10 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b93]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase block text-gray-600 dark:text-gray-300">
                  Background Image URL (Direct link or Google Drive link)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://... or Google Drive sharing link"
                    value={cmsData.hero_section.bg_image_url}
                    onChange={e => {
                      const val = transformGoogleDriveUrl(e.target.value);
                      setCmsData(prev => ({
                        ...prev,
                        hero_section: { ...prev.hero_section, bg_image_url: val }
                      }));
                    }}
                    className="w-full p-2.5 text-xs rounded-xl bg-gray-50 dark:bg-slate-900 border border-black/10 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b93]"
                  />
                  <ImageIcon className="w-5 h-5 text-gray-400 my-auto shrink-0" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPANY STATS */}
          {activeTab === 'stats' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
                <h3 className="text-base font-extrabold uppercase tracking-wide text-[#004b93] dark:text-[#1E88E5]">
                  Company Stats Form
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase block text-gray-600 dark:text-gray-300">Factory Area</label>
                  <input
                    type="text"
                    value={cmsData.company_stats.factory_area}
                    onChange={e => setCmsData(prev => ({ ...prev, company_stats: { ...prev.company_stats, factory_area: e.target.value } }))}
                    className="w-full p-2.5 text-xs rounded-xl bg-gray-50 dark:bg-slate-900 border border-black/10 dark:border-white/10"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase block text-gray-600 dark:text-gray-300">Completed Projects</label>
                  <input
                    type="text"
                    value={cmsData.company_stats.completed_projects}
                    onChange={e => setCmsData(prev => ({ ...prev, company_stats: { ...prev.company_stats, completed_projects: e.target.value } }))}
                    className="w-full p-2.5 text-xs rounded-xl bg-gray-50 dark:bg-slate-900 border border-black/10 dark:border-white/10"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase block text-gray-600 dark:text-gray-300">Craftsmen</label>
                  <input
                    type="text"
                    value={cmsData.company_stats.experienced_craftsmen}
                    onChange={e => setCmsData(prev => ({ ...prev, company_stats: { ...prev.company_stats, experienced_craftsmen: e.target.value } }))}
                    className="w-full p-2.5 text-xs rounded-xl bg-gray-50 dark:bg-slate-900 border border-black/10 dark:border-white/10"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase block text-gray-600 dark:text-gray-300">Years Excellence</label>
                  <input
                    type="text"
                    value={cmsData.company_stats.years_excellence}
                    onChange={e => setCmsData(prev => ({ ...prev, company_stats: { ...prev.company_stats, years_excellence: e.target.value } }))}
                    className="w-full p-2.5 text-xs rounded-xl bg-gray-50 dark:bg-slate-900 border border-black/10 dark:border-white/10"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase block text-gray-600 dark:text-gray-300">
                  Assurance Footnote ({activeLang.toUpperCase()})
                </label>
                <textarea
                  rows={2}
                  value={cmsData.company_stats.assurance_text[activeLang]}
                  onChange={e =>
                    updateTrilingualText(
                      d => d.company_stats.assurance_text,
                      activeLang,
                      e.target.value
                    )
                  }
                  className="w-full p-3 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-slate-900 border border-black/10 dark:border-white/10"
                />
              </div>
            </div>
          )}

          {/* TAB 3: CORE CAPABILITIES */}
          {activeTab === 'capabilities' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
                <h3 className="text-base font-extrabold uppercase tracking-wide text-[#004b93] dark:text-[#1E88E5]">
                  Core Capabilities Form [{activeLang.toUpperCase()}]
                </h3>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase block text-gray-600 dark:text-gray-300">
                  Section Title ({activeLang.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={cmsData.capabilities.capabilities_title[activeLang]}
                  onChange={e =>
                    updateTrilingualText(
                      d => d.capabilities.capabilities_title,
                      activeLang,
                      e.target.value
                    )
                  }
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-slate-900 border border-black/10 dark:border-white/10"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-gray-500">Capability Items List</span>
                  <button
                    onClick={() => {
                      const newItem: CapabilityItem = {
                        id: `cap_${Date.now()}`,
                        title: { km: 'សមត្ថភាពថ្មី', en: 'New Capability', ko: '새로운 역량' },
                        description: { km: 'ការពិពណ៌នា...', en: 'Description...', ko: '설명...' },
                        icon_type: 'Cpu'
                      };
                      setCmsData(prev => ({
                        ...prev,
                        capabilities: {
                          ...prev.capabilities,
                          items: [...prev.capabilities.items, newItem]
                        }
                      }));
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-[#004b93] dark:text-[#1E88E5] hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Capability
                  </button>
                </div>

                {cmsData.capabilities.items.map((item, index) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-black/10 dark:border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-[#004b93] dark:text-[#1E88E5]">Item #{index + 1}</span>
                      <button
                        onClick={() => {
                          setCmsData(prev => ({
                            ...prev,
                            capabilities: {
                              ...prev.capabilities,
                              items: prev.capabilities.items.filter(i => i.id !== item.id)
                            }
                          }));
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase block text-gray-500">Title ({activeLang.toUpperCase()})</label>
                        <input
                          type="text"
                          value={item.title[activeLang]}
                          onChange={e => {
                            const val = e.target.value;
                            setCmsData(prev => {
                              const copy = JSON.parse(JSON.stringify(prev));
                              copy.capabilities.items[index].title[activeLang] = val;
                              return copy;
                            });
                          }}
                          className="w-full p-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase block text-gray-500">Icon Type</label>
                        <select
                          value={item.icon_type}
                          onChange={e => {
                            const val = e.target.value;
                            setCmsData(prev => {
                              const copy = JSON.parse(JSON.stringify(prev));
                              copy.capabilities.items[index].icon_type = val;
                              return copy;
                            });
                          }}
                          className="w-full p-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10"
                        >
                          <option value="Cpu">Cpu (Precision Machinery)</option>
                          <option value="DoorClosed">DoorClosed (Architectural Doors)</option>
                          <option value="Layers">Layers (Interior Fit-Out)</option>
                          <option value="ShieldCheck">ShieldCheck (Quality Control)</option>
                          <option value="Wrench">Wrench (Engineering)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase block text-gray-500">Description ({activeLang.toUpperCase()})</label>
                      <textarea
                        rows={2}
                        value={item.description[activeLang]}
                        onChange={e => {
                          const val = e.target.value;
                          setCmsData(prev => {
                            const copy = JSON.parse(JSON.stringify(prev));
                            copy.capabilities.items[index].description[activeLang] = val;
                            return copy;
                          });
                        }}
                        className="w-full p-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: FEATURED PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
                <h3 className="text-base font-extrabold uppercase tracking-wide text-[#004b93] dark:text-[#1E88E5]">
                  Featured Projects Form [{activeLang.toUpperCase()}]
                </h3>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase block text-gray-600 dark:text-gray-300">
                  Section Title ({activeLang.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={cmsData.featured_projects.projects_title[activeLang]}
                  onChange={e =>
                    updateTrilingualText(
                      d => d.featured_projects.projects_title,
                      activeLang,
                      e.target.value
                    )
                  }
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-slate-900 border border-black/10 dark:border-white/10"
                />
              </div>

              <div className="space-y-4">
                {cmsData.featured_projects.items.map((proj, index) => (
                  <div key={proj.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-black/10 dark:border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-[#004b93] dark:text-[#1E88E5]">Project #{index + 1}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded-full">{proj.category_tag}</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase block text-gray-500">Project Name ({activeLang.toUpperCase()})</label>
                      <input
                        type="text"
                        value={proj.project_name[activeLang]}
                        onChange={e => {
                          const val = e.target.value;
                          setCmsData(prev => {
                            const copy = JSON.parse(JSON.stringify(prev));
                            copy.featured_projects.items[index].project_name[activeLang] = val;
                            return copy;
                          });
                        }}
                        className="w-full p-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase block text-gray-500">Description ({activeLang.toUpperCase()})</label>
                      <textarea
                        rows={2}
                        value={proj.description[activeLang]}
                        onChange={e => {
                          const val = e.target.value;
                          setCmsData(prev => {
                            const copy = JSON.parse(JSON.stringify(prev));
                            copy.featured_projects.items[index].description[activeLang] = val;
                            return copy;
                          });
                        }}
                        className="w-full p-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase block text-gray-500">Cover Image URL (Direct link or Google Drive link)</label>
                      <input
                        type="text"
                        placeholder="https://... or Google Drive sharing link"
                        value={proj.cover_image_url}
                        onChange={e => {
                          const val = transformGoogleDriveUrl(e.target.value);
                          setCmsData(prev => {
                            const copy = JSON.parse(JSON.stringify(prev));
                            copy.featured_projects.items[index].cover_image_url = val;
                            return copy;
                          });
                        }}
                        className="w-full p-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: MACHINERY & FACTORY */}
          {activeTab === 'machinery' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
                <h3 className="text-base font-extrabold uppercase tracking-wide text-[#004b93] dark:text-[#1E88E5]">
                  Manufacturing & Machinery Form [{activeLang.toUpperCase()}]
                </h3>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase block text-gray-600 dark:text-gray-300">
                  Section Title ({activeLang.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={cmsData.manufacturing_machinery.section_title[activeLang]}
                  onChange={e =>
                    updateTrilingualText(
                      d => d.manufacturing_machinery.section_title,
                      activeLang,
                      e.target.value
                    )
                  }
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-slate-900 border border-black/10 dark:border-white/10"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase block text-gray-600 dark:text-gray-300">
                  Description ({activeLang.toUpperCase()})
                </label>
                <textarea
                  rows={3}
                  value={cmsData.manufacturing_machinery.description[activeLang]}
                  onChange={e =>
                    updateTrilingualText(
                      d => d.manufacturing_machinery.description,
                      activeLang,
                      e.target.value
                    )
                  }
                  className="w-full p-3 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-slate-900 border border-black/10 dark:border-white/10"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase block text-gray-600 dark:text-gray-300">
                  Features List ({activeLang.toUpperCase()})
                </label>
                {cmsData.manufacturing_machinery.features.map((feat, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={feat[activeLang]}
                    onChange={e => {
                      const val = e.target.value;
                      setCmsData(prev => {
                        const copy = JSON.parse(JSON.stringify(prev));
                        copy.manufacturing_machinery.features[idx][activeLang] = val;
                        return copy;
                      });
                    }}
                    className="w-full p-2.5 text-xs rounded-xl bg-gray-50 dark:bg-slate-900 border border-black/10 dark:border-white/10"
                  />
                ))}
              </div>

              {/* GALLERY & MACHINERY IMAGES SECTION */}
              <div className="space-y-4 pt-4 border-t border-black/10 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold uppercase flex items-center gap-2 text-[#004b93] dark:text-[#1E88E5]">
                    <ImageIcon className="w-4 h-4" />
                    Gallery & Machinery Images (3 Showcase Photos)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setCmsData(prev => {
                        const copy = JSON.parse(JSON.stringify(prev));
                        copy.manufacturing_machinery.gallery_images = [
                          "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800",
                          "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800",
                          "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800"
                        ];
                        return copy;
                      });
                    }}
                    className="text-[10px] font-bold text-[#004b93] dark:text-[#1E88E5] hover:underline"
                  >
                    Reset Defaults
                  </button>
                </div>

                {[0, 1, 2].map((imgIdx) => {
                  const labels = [
                    'Image 1: CNC Milling & Laser Machine Plant',
                    'Image 2: Computerized Timber Kiln Dryers',
                    'Image 3: Assembly & Heavy Load Testing Area'
                  ];
                  const currentUrl = cmsData.manufacturing_machinery?.gallery_images?.[imgIdx] || '';
                  return (
                    <div key={imgIdx} className="p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-black/10 dark:border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-700 dark:text-gray-200 uppercase">
                          {labels[imgIdx]}
                        </span>
                        <span className="text-[9px] font-mono text-gray-400">
                          IMAGE #{imgIdx + 1}
                        </span>
                      </div>
                      
                      <div className="flex gap-3 items-center">
                        <div className="w-20 h-16 rounded-xl overflow-hidden bg-slate-950 border border-black/10 dark:border-white/10 shrink-0 relative flex items-center justify-center">
                          {currentUrl ? (
                            <img
                              src={currentUrl}
                              alt={`Machinery ${imgIdx + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800";
                              }}
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-gray-500" />
                          )}
                        </div>

                        <div className="flex-1 space-y-1">
                          <input
                            type="text"
                            placeholder="https://... or Google Drive sharing link"
                            value={currentUrl}
                            onChange={e => {
                              const val = transformGoogleDriveUrl(e.target.value);
                              setCmsData(prev => {
                                const copy = JSON.parse(JSON.stringify(prev));
                                if (!copy.manufacturing_machinery.gallery_images) {
                                  copy.manufacturing_machinery.gallery_images = [];
                                }
                                copy.manufacturing_machinery.gallery_images[imgIdx] = val;
                                return copy;
                              });
                            }}
                            className="w-full p-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10 font-mono text-gray-800 dark:text-gray-200"
                          />
                          <p className="text-[9px] text-gray-400">Paste direct image link, Unsplash, or Google Drive view link</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: WHY CHOOSE SDY */}
          {activeTab === 'reasons' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
                <h3 className="text-base font-extrabold uppercase tracking-wide text-[#004b93] dark:text-[#1E88E5]">
                  Why Choose SDY Form [{activeLang.toUpperCase()}]
                </h3>
              </div>

              <div className="space-y-4">
                {cmsData.why_choose_sdy.reasons.map((reason, idx) => (
                  <div key={reason.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-black/10 dark:border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase text-amber-600">Step {reason.step_number}</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase block text-gray-500">Reason Title ({activeLang.toUpperCase()})</label>
                      <input
                        type="text"
                        value={reason.title[activeLang]}
                        onChange={e => {
                          const val = e.target.value;
                          setCmsData(prev => {
                            const copy = JSON.parse(JSON.stringify(prev));
                            copy.why_choose_sdy.reasons[idx].title[activeLang] = val;
                            return copy;
                          });
                        }}
                        className="w-full p-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase block text-gray-500">Description ({activeLang.toUpperCase()})</label>
                      <textarea
                        rows={2}
                        value={reason.description[activeLang]}
                        onChange={e => {
                          const val = e.target.value;
                          setCmsData(prev => {
                            const copy = JSON.parse(JSON.stringify(prev));
                            copy.why_choose_sdy.reasons[idx].description[activeLang] = val;
                            return copy;
                          });
                        }}
                        className="w-full p-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: BLOG INSIGHTS */}
          {activeTab === 'blogs' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
                <h3 className="text-base font-extrabold uppercase tracking-wide text-[#004b93] dark:text-[#1E88E5]">
                  Architectural Blog & Insights [{activeLang.toUpperCase()}]
                </h3>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase block text-gray-600 dark:text-gray-300">
                  Section Title ({activeLang.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={cmsData.blog_insights.section_title[activeLang]}
                  onChange={e =>
                    updateTrilingualText(
                      d => d.blog_insights.section_title,
                      activeLang,
                      e.target.value
                    )
                  }
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-slate-900 border border-black/10 dark:border-white/10"
                />
              </div>

              <div className="space-y-4">
                {cmsData.blog_insights.articles.map((art, idx) => (
                  <div key={art.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-black/10 dark:border-white/10 space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase block text-gray-500">Article Title ({activeLang.toUpperCase()})</label>
                      <input
                        type="text"
                        value={art.title[activeLang]}
                        onChange={e => {
                          const val = e.target.value;
                          setCmsData(prev => {
                            const copy = JSON.parse(JSON.stringify(prev));
                            copy.blog_insights.articles[idx].title[activeLang] = val;
                            return copy;
                          });
                        }}
                        className="w-full p-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase block text-gray-500">Summary ({activeLang.toUpperCase()})</label>
                      <textarea
                        rows={2}
                        value={art.summary[activeLang]}
                        onChange={e => {
                          const val = e.target.value;
                          setCmsData(prev => {
                            const copy = JSON.parse(JSON.stringify(prev));
                            copy.blog_insights.articles[idx].summary[activeLang] = val;
                            return copy;
                          });
                        }}
                        className="w-full p-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: OPERATIONAL WORKFLOW */}
          {activeTab === 'workflow' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
                <h3 className="text-base font-extrabold uppercase tracking-wide text-[#004b93] dark:text-[#1E88E5]">
                  Operational Workflow Form [{activeLang.toUpperCase()}]
                </h3>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase block text-gray-600 dark:text-gray-300">
                  Section Tag ({activeLang.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={cmsData.operational_workflow?.section_tag?.[activeLang] || ''}
                  onChange={e =>
                    updateTrilingualText(
                      d => d.operational_workflow.section_tag,
                      activeLang,
                      e.target.value
                    )
                  }
                  className="w-full p-2.5 text-xs rounded-xl bg-gray-50 dark:bg-slate-900 border border-black/10 dark:border-white/10"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase block text-gray-600 dark:text-gray-300">
                  Section Title ({activeLang.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={cmsData.operational_workflow?.section_title?.[activeLang] || ''}
                  onChange={e =>
                    updateTrilingualText(
                      d => d.operational_workflow.section_title,
                      activeLang,
                      e.target.value
                    )
                  }
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-slate-900 border border-black/10 dark:border-white/10 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase block text-gray-600 dark:text-gray-300">
                  Section Subtitle ({activeLang.toUpperCase()})
                </label>
                <textarea
                  rows={2}
                  value={cmsData.operational_workflow?.section_subtitle?.[activeLang] || ''}
                  onChange={e =>
                    updateTrilingualText(
                      d => d.operational_workflow.section_subtitle,
                      activeLang,
                      e.target.value
                    )
                  }
                  className="w-full p-2.5 text-xs rounded-xl bg-gray-50 dark:bg-slate-900 border border-black/10 dark:border-white/10"
                />
              </div>

              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-black uppercase text-gray-500 tracking-wider">
                  Workflow Steps (4 Steps)
                </h4>
                {(cmsData.operational_workflow?.steps || defaultHomepageCmsData.operational_workflow.steps).map((step, idx) => (
                  <div key={step.id || idx} className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-black/10 dark:border-white/10 space-y-3">
                    <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2">
                      <span className="text-xs font-extrabold uppercase text-[#004b93] dark:text-[#1E88E5]">
                        Step {step.step_number || `0${idx + 1}`}
                      </span>
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Step #</label>
                        <input
                          type="text"
                          value={step.step_number}
                          onChange={e => {
                            const val = e.target.value;
                            setCmsData(prev => {
                              const copy = JSON.parse(JSON.stringify(prev));
                              if (!copy.operational_workflow) copy.operational_workflow = defaultHomepageCmsData.operational_workflow;
                              copy.operational_workflow.steps[idx].step_number = val;
                              return copy;
                            });
                          }}
                          className="w-16 p-1 text-center text-xs font-black rounded-md bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase block text-gray-500">
                        Step Title ({activeLang.toUpperCase()})
                      </label>
                      <input
                        type="text"
                        value={step.title?.[activeLang] || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setCmsData(prev => {
                            const copy = JSON.parse(JSON.stringify(prev));
                            if (!copy.operational_workflow) copy.operational_workflow = defaultHomepageCmsData.operational_workflow;
                            if (!copy.operational_workflow.steps[idx].title) copy.operational_workflow.steps[idx].title = { km: '', en: '', ko: '' };
                            copy.operational_workflow.steps[idx].title[activeLang] = val;
                            return copy;
                          });
                        }}
                        className="w-full p-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10 font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase block text-gray-500">
                        Step Description ({activeLang.toUpperCase()})
                      </label>
                      <textarea
                        rows={2}
                        value={step.description?.[activeLang] || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setCmsData(prev => {
                            const copy = JSON.parse(JSON.stringify(prev));
                            if (!copy.operational_workflow) copy.operational_workflow = defaultHomepageCmsData.operational_workflow;
                            if (!copy.operational_workflow.steps[idx].description) copy.operational_workflow.steps[idx].description = { km: '', en: '', ko: '' };
                            copy.operational_workflow.steps[idx].description[activeLang] = val;
                            return copy;
                          });
                        }}
                        className="w-full p-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: CTA & FOOTER */}
          {activeTab === 'cta_footer' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
                <h3 className="text-base font-extrabold uppercase tracking-wide text-[#004b93] dark:text-[#1E88E5]">
                  CTA Banner & Footer Form [{activeLang.toUpperCase()}]
                </h3>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase block text-gray-600 dark:text-gray-300">
                  CTA Banner Text ({activeLang.toUpperCase()})
                </label>
                <textarea
                  rows={2}
                  value={cmsData.cta_banner_and_footer.cta_banner_text[activeLang]}
                  onChange={e =>
                    updateTrilingualText(
                      d => d.cta_banner_and_footer.cta_banner_text,
                      activeLang,
                      e.target.value
                    )
                  }
                  className="w-full p-3 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-slate-900 border border-black/10 dark:border-white/10"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase block text-gray-600 dark:text-gray-300">
                  Company Tagline ({activeLang.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={cmsData.cta_banner_and_footer.company_tagline[activeLang]}
                  onChange={e =>
                    updateTrilingualText(
                      d => d.cta_banner_and_footer.company_tagline,
                      activeLang,
                      e.target.value
                    )
                  }
                  className="w-full p-2.5 text-xs rounded-xl bg-gray-50 dark:bg-slate-900 border border-black/10 dark:border-white/10 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase block text-gray-600 dark:text-gray-300">
                  Address ({activeLang.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={cmsData.cta_banner_and_footer.address[activeLang]}
                  onChange={e =>
                    updateTrilingualText(
                      d => d.cta_banner_and_footer.address,
                      activeLang,
                      e.target.value
                    )
                  }
                  className="w-full p-2.5 text-xs rounded-xl bg-gray-50 dark:bg-slate-900 border border-black/10 dark:border-white/10"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase block text-gray-600 dark:text-gray-300">Phone</label>
                  <input
                    type="text"
                    value={cmsData.cta_banner_and_footer.phone}
                    onChange={e => setCmsData(prev => ({ ...prev, cta_banner_and_footer: { ...prev.cta_banner_and_footer, phone: e.target.value } }))}
                    className="w-full p-2.5 text-xs rounded-xl bg-gray-50 dark:bg-slate-900 border border-black/10 dark:border-white/10"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase block text-gray-600 dark:text-gray-300">Email</label>
                  <input
                    type="text"
                    value={cmsData.cta_banner_and_footer.email}
                    onChange={e => setCmsData(prev => ({ ...prev, cta_banner_and_footer: { ...prev.cta_banner_and_footer, email: e.target.value } }))}
                    className="w-full p-2.5 text-xs rounded-xl bg-gray-50 dark:bg-slate-900 border border-black/10 dark:border-white/10"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Preview Column (Right Side) */}
        <div className="lg:col-span-5 space-y-4 sticky top-6">
          {/* Header Bar with Live Preview Controls */}
          <div className="p-4 rounded-2xl bg-[#004b93] text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-300 animate-pulse" />
              <span className="text-xs font-extrabold uppercase tracking-wider">Live Preview Canvas</span>
            </div>

            {/* Language preview switcher */}
            <div className="flex gap-1 bg-white/10 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setPreviewLang('km')}
                className={`px-2 py-0.5 text-[10px] font-extrabold rounded transition-all ${previewLang === 'km' ? 'bg-amber-400 text-slate-950 shadow' : 'text-white/80 hover:text-white'}`}
              >
                🇰🇭 KM
              </button>
              <button
                type="button"
                onClick={() => setPreviewLang('en')}
                className={`px-2 py-0.5 text-[10px] font-extrabold rounded transition-all ${previewLang === 'en' ? 'bg-amber-400 text-slate-950 shadow' : 'text-white/80 hover:text-white'}`}
              >
                🇬🇧 EN
              </button>
              <button
                type="button"
                onClick={() => setPreviewLang('ko')}
                className={`px-2 py-0.5 text-[10px] font-extrabold rounded transition-all ${previewLang === 'ko' ? 'bg-amber-400 text-slate-950 shadow' : 'text-white/80 hover:text-white'}`}
              >
                🇰🇷 KO
              </button>
            </div>
          </div>

          {/* Mini Browser Frame Shell */}
          <div className="rounded-3xl bg-slate-950 text-white shadow-2xl border border-white/10 overflow-hidden">
            {/* Mini Browser URL Bar */}
            <div className="px-4 py-2.5 bg-slate-900/90 border-b border-white/10 flex items-center gap-3">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
              </div>
              <div className="flex-1 bg-slate-950/80 border border-white/10 rounded-lg px-3 py-1 text-[10px] text-slate-400 flex items-center justify-between font-mono">
                <span className="truncate">https://sdy-ci.com/homepage-preview</span>
                <span className="text-[9px] text-amber-400 font-bold uppercase">{previewLang.toUpperCase()}</span>
              </div>
            </div>

            {/* FIXED HEIGHT & FULLY SCROLLABLE LIVE PREVIEW CONTAINER */}
            <div
              ref={previewContainerRef}
              className="p-5 space-y-6 overflow-y-auto overflow-x-hidden scroll-smooth h-[750px] preview-scrollbar"
            >
              {/* SECTION 1: HERO PREVIEW */}
              <div
                id="preview-hero"
                className={`relative rounded-2xl overflow-hidden p-6 bg-cover bg-center min-h-[250px] flex flex-col justify-end border transition-all duration-300 ${
                  activeTab === 'hero' ? 'ring-2 ring-amber-400 border-amber-400 shadow-xl' : 'border-white/10'
                }`}
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(15,23,42,0.95) 10%, rgba(15,23,42,0.4) 100%), url(${transformGoogleDriveUrl(cmsData.hero_section.bg_image_url) || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=2000'})`
                }}
              >
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="text-[9px] font-extrabold uppercase px-2.5 py-0.5 bg-amber-400 text-slate-950 rounded-md shadow">
                    1. HERO SECTION
                  </span>
                </div>
                <div className="space-y-2 mt-8">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-300 block">
                    SDY COMPANY C&I • HOMEPAGE HERO
                  </span>
                  <h4 className="text-lg font-extrabold text-white leading-tight">
                    {cmsData.hero_section.hero_title[previewLang] || 'Integrated Engineering & Bespoke Interior Fit-Out Contracting'}
                  </h4>
                  <p className="text-xs text-gray-200 leading-relaxed line-clamp-3">
                    {cmsData.hero_section.hero_subtitle[previewLang] || "Phnom Penh's leading full-scale manufacturing mill & premium contractor."}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="px-3 py-1.5 bg-[#004b93] text-white text-[10px] font-extrabold rounded-lg uppercase shadow">
                      {cmsData.hero_section.hero_cta_primary.label[previewLang] || 'Explore Profile'}
                    </span>
                    <span className="px-3 py-1.5 bg-white/20 text-white text-[10px] font-extrabold rounded-lg uppercase border border-white/20">
                      {cmsData.hero_section.hero_cta_secondary.label[previewLang] || 'Contact Us'}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: STATS PREVIEW */}
              <div
                id="preview-stats"
                className={`p-4 rounded-2xl bg-slate-900/90 border transition-all duration-300 space-y-3 ${
                  activeTab === 'stats' ? 'ring-2 ring-amber-400 border-amber-400 shadow-xl' : 'border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-extrabold uppercase text-amber-400 tracking-wider">2. COMPANY STATS</span>
                  <span className="text-[9px] text-slate-400 font-bold">4 KEY METRICS</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center py-1">
                  <div className="p-2 bg-slate-800/80 rounded-xl border border-white/5">
                    <span className="text-sm font-black text-white block">{cmsData.company_stats.factory_area}</span>
                    <span className="text-[8px] text-slate-400 block uppercase font-bold">Factory Area</span>
                  </div>
                  <div className="p-2 bg-slate-800/80 rounded-xl border border-white/5">
                    <span className="text-sm font-black text-white block">{cmsData.company_stats.completed_projects}</span>
                    <span className="text-[8px] text-slate-400 block uppercase font-bold">Projects</span>
                  </div>
                  <div className="p-2 bg-slate-800/80 rounded-xl border border-white/5">
                    <span className="text-sm font-black text-white block">{cmsData.company_stats.experienced_craftsmen}</span>
                    <span className="text-[8px] text-slate-400 block uppercase font-bold">Staff</span>
                  </div>
                  <div className="p-2 bg-slate-800/80 rounded-xl border border-white/5">
                    <span className="text-sm font-black text-white block">{cmsData.company_stats.years_excellence}</span>
                    <span className="text-[8px] text-slate-400 block uppercase font-bold">Years</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-300 italic border-t border-white/10 pt-2 leading-relaxed">
                  "{cmsData.company_stats.assurance_text[previewLang]}"
                </p>
              </div>

              {/* SECTION 3: CAPABILITIES PREVIEW */}
              <div
                id="preview-capabilities"
                className={`p-4 rounded-2xl bg-slate-900/90 border transition-all duration-300 space-y-3 ${
                  activeTab === 'capabilities' ? 'ring-2 ring-amber-400 border-amber-400 shadow-xl' : 'border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-extrabold uppercase text-amber-400 tracking-wider">3. CORE INDUSTRIAL CAPABILITIES</span>
                  <span className="text-[9px] text-slate-400 font-bold">{cmsData.capabilities.items?.length || 0} ITEMS</span>
                </div>
                <h5 className="text-xs font-black text-white">{cmsData.capabilities.capabilities_title[previewLang]}</h5>
                <div className="space-y-2 pt-1">
                  {cmsData.capabilities.items?.map((item, idx) => (
                    <div key={item.id || idx} className="p-3 bg-slate-800/90 rounded-xl border border-white/5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-[#1E88E5]" />
                          {item.title[previewLang]}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <p className="text-[10px] text-slate-300 line-clamp-2 leading-relaxed">
                        {item.description[previewLang]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 4: FEATURED PROJECTS PREVIEW */}
              <div
                id="preview-projects"
                className={`p-4 rounded-2xl bg-slate-900/90 border transition-all duration-300 space-y-3 ${
                  activeTab === 'projects' ? 'ring-2 ring-amber-400 border-amber-400 shadow-xl' : 'border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-extrabold uppercase text-amber-400 tracking-wider">4. FEATURED PROJECTS</span>
                  <span className="text-[9px] text-slate-400 font-bold">{cmsData.featured_projects.items?.length || 0} SHOWCASED</span>
                </div>
                <h5 className="text-xs font-black text-white">{cmsData.featured_projects.projects_title[previewLang]}</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {cmsData.featured_projects.items?.map((proj, idx) => (
                    <div key={proj.id || idx} className="rounded-xl overflow-hidden bg-slate-800 border border-white/10 space-y-2">
                      <div className="h-24 bg-cover bg-center relative" style={{ backgroundImage: `url(${transformGoogleDriveUrl(proj.cover_image_url)})` }}>
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-sm text-[8px] font-black text-amber-300 rounded uppercase">
                          {proj.category_tag}
                        </span>
                      </div>
                      <div className="p-2.5 space-y-1">
                        <h6 className="font-extrabold text-xs text-white line-clamp-1">{proj.project_name[previewLang]}</h6>
                        <p className="text-[10px] text-slate-300 line-clamp-2">{proj.description[previewLang]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 5: MACHINERY & FACTORY PREVIEW */}
              <div
                id="preview-machinery"
                className={`p-4 rounded-2xl bg-slate-900/90 border transition-all duration-300 space-y-3 ${
                  activeTab === 'machinery' ? 'ring-2 ring-amber-400 border-amber-400 shadow-xl' : 'border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-extrabold uppercase text-amber-400 tracking-wider">5. FACTORY & MACHINERY</span>
                  <span className="text-[9px] text-slate-400 font-bold">4,500 SQM MILL</span>
                </div>
                <h5 className="text-xs font-black text-white">{cmsData.manufacturing_machinery.section_title[previewLang]}</h5>
                <p className="text-[10px] text-slate-300 leading-relaxed">{cmsData.manufacturing_machinery.description[previewLang]}</p>
                <div className="space-y-1.5 pt-1">
                  {cmsData.manufacturing_machinery.features?.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[10px] text-slate-200 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1E88E5] shrink-0" />
                      <span>{feat[previewLang]}</span>
                    </div>
                  ))}
                </div>
                {cmsData.manufacturing_machinery.gallery_images?.length > 0 && (
                  <div className="grid grid-cols-3 gap-1.5 pt-2">
                    {cmsData.manufacturing_machinery.gallery_images.slice(0, 3).map((img, idx) => (
                      <img key={idx} src={transformGoogleDriveUrl(img)} alt="Gallery" className="w-full h-14 object-cover rounded-lg border border-white/10" />
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 6: WHY CHOOSE SDY PREVIEW */}
              <div
                id="preview-reasons"
                className={`p-4 rounded-2xl bg-slate-900/90 border transition-all duration-300 space-y-3 ${
                  activeTab === 'reasons' ? 'ring-2 ring-amber-400 border-amber-400 shadow-xl' : 'border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-extrabold uppercase text-amber-400 tracking-wider">6. WHY CHOOSE SDY</span>
                  <span className="text-[9px] text-slate-400 font-bold">ADVANTAGES</span>
                </div>
                <div className="space-y-2 pt-1">
                  {cmsData.why_choose_sdy.reasons?.map((reason, idx) => (
                    <div key={reason.id || idx} className="p-3 bg-slate-800/80 rounded-xl border border-white/5 flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-[#004b93] text-amber-300 text-[10px] font-black flex items-center justify-center shrink-0 shadow">
                        {reason.step_number || `0${idx + 1}`}
                      </span>
                      <div className="space-y-0.5">
                        <h6 className="text-xs font-extrabold text-white">{reason.title[previewLang]}</h6>
                        <p className="text-[10px] text-slate-300 leading-relaxed">{reason.description[previewLang]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 7: NEWS & INSIGHTS PREVIEW */}
              <div
                id="preview-blogs"
                className={`p-4 rounded-2xl bg-slate-900/90 border transition-all duration-300 space-y-3 ${
                  activeTab === 'blogs' ? 'ring-2 ring-amber-400 border-amber-400 shadow-xl' : 'border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-extrabold uppercase text-amber-400 tracking-wider">7. NEWS & INSIGHTS</span>
                  <span className="text-[9px] text-slate-400 font-bold">ARTICLES</span>
                </div>
                <h5 className="text-xs font-black text-white">{cmsData.blog_insights.section_title[previewLang]}</h5>
                <div className="space-y-2 pt-1">
                  {cmsData.blog_insights.articles?.map((art, idx) => (
                    <div key={art.id || idx} className="p-3 bg-slate-800/80 rounded-xl border border-white/5 flex gap-3 items-center">
                      {art.cover_image_url && (
                        <img src={art.cover_image_url} alt="Blog" className="w-14 h-14 object-cover rounded-lg shrink-0 border border-white/10" />
                      )}
                      <div className="space-y-1 overflow-hidden">
                        <span className="text-[8px] font-extrabold uppercase text-amber-400 px-1.5 py-0.5 bg-amber-400/10 rounded">
                          {art.category}
                        </span>
                        <h6 className="text-xs font-bold text-white truncate">{art.title[previewLang]}</h6>
                        <p className="text-[10px] text-slate-300 line-clamp-1">{art.summary[previewLang]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 8: OPERATIONAL WORKFLOW PREVIEW */}
              <div
                id="preview-workflow"
                className={`p-4 rounded-2xl bg-slate-900/90 border transition-all duration-300 space-y-3 ${
                  activeTab === 'workflow' ? 'ring-2 ring-amber-400 border-amber-400 shadow-xl' : 'border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-extrabold uppercase text-amber-400 tracking-wider">
                    8. OPERATIONAL WORKFLOW (EXECUTION)
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold">4-STEP PROCESS</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[8px] font-extrabold uppercase text-amber-300 tracking-widest block">
                    {cmsData.operational_workflow?.section_tag?.[previewLang] || 'EXECUTION'}
                  </span>
                  <h5 className="text-xs font-black text-white">
                    {cmsData.operational_workflow?.section_title?.[previewLang] || 'Our Four-Step Operational Workflow'}
                  </h5>
                  <p className="text-[10px] text-slate-300 leading-relaxed">
                    {cmsData.operational_workflow?.section_subtitle?.[previewLang] || 'Delivering structural integrity and exquisite aesthetic finishes systematically.'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {(cmsData.operational_workflow?.steps || defaultHomepageCmsData.operational_workflow.steps).map((step, idx) => (
                    <div key={step.id || idx} className="p-2.5 bg-slate-800/90 rounded-xl border border-white/5 space-y-1">
                      <span className="text-xs font-black text-amber-400 block font-mono">
                        {step.step_number || `0${idx + 1}`}
                      </span>
                      <h6 className="text-[11px] font-extrabold text-white leading-tight">
                        {step.title?.[previewLang]}
                      </h6>
                      <p className="text-[9px] text-slate-300 leading-normal line-clamp-2">
                        {step.description?.[previewLang]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 8: CTA & FOOTER PREVIEW */}
              <div
                id="preview-cta_footer"
                className={`p-4 rounded-2xl bg-[#004b93]/30 border transition-all duration-300 space-y-4 ${
                  activeTab === 'cta_footer' ? 'ring-2 ring-amber-400 border-amber-400 shadow-xl' : 'border-[#004b93]/50'
                }`}
              >
                <div className="p-4 rounded-xl bg-gradient-to-r from-[#004b93] to-[#1E88E5] text-white space-y-2 text-center shadow-lg">
                  <span className="text-[9px] font-black uppercase text-amber-300 tracking-widest block">CTA BANNER</span>
                  <p className="text-xs font-extrabold leading-snug">{cmsData.cta_banner_and_footer.cta_banner_text[previewLang]}</p>
                  <button className="px-3 py-1 bg-amber-400 text-slate-950 font-black text-[9px] uppercase rounded-lg shadow hover:bg-amber-300">
                    Contact Us Now
                  </button>
                </div>

                <div className="p-3.5 bg-slate-900 rounded-xl border border-white/10 space-y-2 text-center">
                  <p className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">
                    {cmsData.cta_banner_and_footer.company_tagline[previewLang]}
                  </p>
                  <p className="text-[9px] text-slate-300 leading-normal">{cmsData.cta_banner_and_footer.address[previewLang]}</p>
                  <div className="flex flex-wrap items-center justify-center gap-3 text-[9px] text-slate-400 pt-1 border-t border-white/10">
                    <span>📞 {cmsData.cta_banner_and_footer.phone}</span>
                    <span>✉️ {cmsData.cta_banner_and_footer.email}</span>
                  </div>
                  <p className="text-[8px] text-slate-500 pt-1">© 2026 SDY Company C&I. All Rights Reserved.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default HomepageCmsManager;
