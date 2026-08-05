import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AboutPageData } from '../types';
import { clearApiCache } from '../services/ApiService';
import { getAccessToken } from '../services/googleAuthService';
import { syncAboutToSheet, fetchAboutFromSheet } from '../services/googleSheetsDirectService';

export const defaultAboutPageData: AboutPageData = {
  overview: {
    tag: {
      en: "Corporate Profile",
      km: "ប្រវត្តិក្រុមហ៊ុន",
      ko: "기업 프로필"
    },
    title: {
      en: "About SDY Company C&I",
      km: "អំពីក្រុមហ៊ុន SDY C&I",
      ko: "SDY C&I 소개"
    },
    story_paragraphs: [
      {
        en: "Established in 2016, SDY Company is a leading manufacturer of wooden products in Cambodia, dedicated to introducing new innovations and advanced technologies to the market.",
        km: "បានបង្កើតឡើងក្នុងឆ្នាំ ២០១៦ ក្រុមហ៊ុន SDY គឺជាក្រុមហ៊ុនផលិតផលិតផលឈើនាំមុខគេនៅកម្ពុជា ដែលទិសដៅនាំយកការច្នៃប្រឌិត និងបច្ចេកវិទ្យាទំនើបៗមកកាន់ទីផ្សារ។",
        ko: "2016년에 설립된 SDY Company는 캄보디아의 목재 제품 선도 제조업체로서 새로운 혁신과 첨단 기술을 시장에 선보이기 위해 최선을 다하고 있습니다."
      },
      {
        en: "Equipped with comprehensive manufacturing facilities and state-of-the-art machinery from Korea, we produce the highest quality wooden products. We are committed to delivering outstanding performance and managing efficient lead times that align perfectly with our clients' construction schedules.",
        km: "បំពាក់ដោយរោងចក្រផលិតកម្មពេញលេញ និងគ្រឿងចក្រទំនើបៗមកពីប្រទេសកូរ៉េ យើងផលិតផលិតផលឈើដែលមានគុណភាពខ្ពស់បំផុត។ យើងប្តេជ្ញាផ្តល់នូវប្រសិទ្ធភាពការងារដ៏ល្អឥតខ្ចោះ និងគ្រប់គ្រងពេលវេលាប្រកបដោយប្រសិទ្ធភាពដែលស្របតាមកាលវិភាគសំណង់របស់អតិថិជន។",
        ko: "종합 제조 시설과 한국산 첨단 기계를 갖추고 최고 품질의 목재 제품을 생산합니다. 고객의 시공 일정에 완벽하게 부합하는 효율적인 납기 관리와 우수한 품질을 약속드립니다."
      },
      {
        en: "SDY has successfully completed numerous construction projects for major clients across the country. As Cambodia's construction sector continues to experience robust growth, we have evolved into a comprehensive interior and exterior company with our own in-house manufacturing system.",
        km: "SDY បានបញ្ចប់ដោយជោគជ័យនូវគម្រោងសំណង់ជាច្រើនសម្រាប់អតិថិជនធំៗទូទាំងប្រទេស។ នៅពេលដែលវិស័យសំណង់នៅកម្ពុជាបន្តរីកចម្រើនយ៉ាងខ្លាំង យើងបានអភិវឌ្ឍទៅជាក្រុមហ៊ុនផ្ទៃខាងក្នុង និងខាងក្រៅដ៏ទូលំទូលាយជាមួយនឹងប្រព័ន្ធផលិតកម្មផ្ទាល់ខ្លួន។",
        ko: "SDY는 전국의 주요 고객을 위해 수많은 건설 프로젝트를 성공적으로 수행했습니다. 캄보디아 건설 분야의 지속적인 성장에 발맞추어, 자체 제조 시스템을 갖춘 종합 인테리어 및 익스테리어 기업으로 발전했습니다."
      },
      {
        en: "By actively contributing to Cambodia's business landscape, our vision is to be the country's most reliable company, the ideal partner, and the most sought-after service provider in the industry.",
        km: "តាមរយៈការចូលរួមចំណែកយ៉ាងសកម្មក្នុងវិស័យអាជីវកម្មនៅកម្ពុជា ចក្ខុវិស័យរបស់យើងគឺក្លាយជាក្រុមហ៊ុនដែលគួរឱ្យទុកចិត្តបំផុត ជាដៃគូដ៏ល្អ និងជាអ្នកផ្តល់សេវាកម្មដែលស្វែងរកច្រើនបំផុតក្នុងឧស្សាហកម្មនេះ។",
        ko: "캄보디아의 비즈니스 발전에 적극적으로 기여함으로써, 업계에서 가장 신뢰받는 기업, 최적의 파트너, 그리고 최고의 서비스 제공업체가 되는 것이 우리의 비전입니다."
      }
    ],
    factory_image_url: "",
    badge_text: {
      en: "Headquarters & Factory",
      km: "ការិយាល័យកណ្តាល និងរោងចក្រ",
      ko: "본사 및 제조 공장"
    },
    badge_subtext: {
      en: "Over 150 certified operators executing fine joinery, custom millwork, and construction fit-outs.",
      km: "បុគ្គលិកជំនាញជាង ១៥០ នាក់អនុវត្តការងារឈើប្រណីត និងការរៀបចំតុបតែងសំណង់។",
      ko: "150명 이상의 전문 기술자가 정밀 목공, 맞춤 가구 및 인테리어 시공을 수행합니다."
    }
  },
  core_values: {
    section_title: {
      en: "Our Operational Values",
      km: "តម្លៃស្នូលប្រតិបត្តិការរបស់យើង",
      ko: "SDY 핵심 운영 가치"
    },
    section_subtitle: {
      en: "The pillars that define every action we execute inside our office, factories, and construction zones.",
      km: "សសរទ្រទ្រង់ដែលកំណត់រាល់សកម្មភាពដែលយើងអនុវត្តនៅក្នុងការិយាល័យ រោងចក្រ និងការដ្ឋានសំណង់។",
      ko: "사무실, 제조 공장 및 현장에서 실행하는 모든 작업의 기준이 되는 핵심 가치입니다."
    },
    values_list: [
      {
        id: "val_1",
        icon: "ShieldAlert",
        title: {
          en: "Absolute Quality Safety",
          km: "សុវត្ថិភាពគុណភាពដាច់ខាត",
          ko: "철저한 품질 및 안전 관리"
        },
        description: {
          en: "Our construction and fit-out works comply with international safety metrics, and fire doors are UL-certified to protect life.",
          km: "ការងារសំណង់ និងការតុបតែងរបស់យើងអនុវត្តតាមស្តង់ដារសុវត្ថិភាពអន្តរជាតិ ហើយទ្វារពន្លត់អគ្គីភ័យទទួលបានវិញ្ញាបនបត្រ UL ដើម្បីការពារជីវិត។",
          ko: "시공 및 인테리어 작업은 국제 안전 기준을 준수하며, 방화 도어는 인명 보호를 위해 UL 인증을 받았습니다."
        }
      },
      {
        id: "val_2",
        icon: "Award",
        title: {
          en: "Engineering Craftsmanship",
          km: "ការងារវិស្វកម្មប្រកបដោយស្នាដៃ",
          ko: "독일제 정밀 엔지니어링"
        },
        description: {
          en: "We utilize Germany-imported CNC machinery to achieve precise 0.1mm alignment in joinery and custom decor.",
          km: "យើងប្រើប្រាស់ម៉ាស៊ីន CNC នាំចូលពីប្រទេសអាល្លឺម៉ង់ ដើម្បីសម្រេចបាននូវតម្រឹម 0.1mm ដ៏ប្រណីតក្នុងការងារឈើ និងការតុបតែង។",
          ko: "독일산 CNC 첨단 기계를 사용하여 목공 및 맞춤 데코에서 0.1mm 오차 범위 내의 정밀함을 구현합니다."
        }
      },
      {
        id: "val_3",
        icon: "Star",
        title: {
          en: "Customer-Centric Turnkey",
          km: "សេវាកម្ម Turnkey ផ្តោតលើអតិថិជន",
          ko: "고객 중심 턴키 프로세스"
        },
        description: {
          en: "Providing full design-to-handover accountability so development clients experience effortless handovers.",
          km: "ផ្តល់នូវការទទួលខុសត្រូវពេញលេញចាប់ពីការរចនារហូតដល់ការប្រគល់ ដើម្បីឲ្យអតិថិជនទទួលបានបទពិសោធន៍ដ៏រលូន។",
          ko: "디자인부터 최종 인도까지 완벽한 책임 시공을 제공하여 개발사 및 고객에게 원스톱 편의를 제공합니다."
        }
      }
    ]
  },
  timeline: {
    section_title: {
      en: "Our Corporate Journey",
      km: "ដំណើរការរីកចម្រើនរបស់ក្រុមហ៊ុន",
      ko: "SDY 연혁 및 성장 과정"
    },
    section_subtitle: {
      en: "Chronology of SDY C&I growth as a trusted engineering brand.",
      km: "កាលប្បវត្តិፈላጊនៃការរីកចម្រើនរបស់ SDY C&I ជាម៉ាកសញ្ញាវិស្វកម្មដែលគួរឱ្យទុកចិត្ត។",
      ko: "신뢰할 수 있는 엔지니어링 브랜드로서의 SDY 성장 연혁입니다."
    },
    events: [
      {
        id: "time_2016",
        year: "2016",
        title: {
          en: "SDY Established",
          km: "ការបង្កើតក្រុមហ៊ុន SDY",
          ko: "SDY 법인 설립"
        },
        description: {
          en: "Inception in Phnom Penh, specializing in custom residential joinery, wood doors, and interior consultations.",
          km: "ចាប់ផ្តើមនៅរាជធានីភ្នំពេញ ដោយឯកទេសខាងការងារឈើលំនៅដ្ឋាន ទ្វារឈើ និងការប្រឹក្សាយោបល់ផ្ទៃខាងក្នុង។",
          ko: "프놈펜에서 설립되어 주거용 맞춤 목공, 원목 도어 및 인테리어 컨설팅 전문 기업으로 출발."
        }
      },
      {
        id: "time_2020",
        year: "2020",
        title: {
          en: "National Road 3 Plant",
          km: "រោងចក្រផ្លូវជាតិលេខ ៣",
          ko: "국도 3호선 대형 공장 준공"
        },
        description: {
          en: "Opened a state-of-the-art 4,500 sqm manufacturing plant to mass-produce solid wood architectural doors.",
          km: "បើកដំណើរការរោងចក្រផលិតកម្មទំហំ ៤,៥០០ ម៉ែត្រការ៉េ ដើម្បីផលិតទ្វារឈើស្ថាបត្យកម្មតាមស្តង់ដារ។",
          ko: "4,500m² 규모의 최첨단 제조 공장을 가동하여 원목 건축용 도어 양산 체제 구축."
        }
      },
      {
        id: "time_2022",
        year: "2022",
        title: {
          en: "Interior Decor & Fit-Out Expansion",
          km: "ការពង្រីកការតុបតែងផ្ទៃខាងក្នុង",
          ko: "인테리어 데코 & Fit-Out 사업 확장"
        },
        description: {
          en: "Expanded our turnkey interior fit-out division, delivering premium corporate offices, hotels, and decor projects.",
          km: "ពង្រីកផ្នែកតុបតែងផ្ទៃខាងក្នុង turnkey ដោយផ្តល់ជូនការិយាល័យសាជីវកម្ម សណ្ឋាគារ និងគម្រោងតុបតែងកម្រិតខ្ពស់។",
          ko: "턴키 인테리어 Fit-Out 부서를 확장하여 최고급 기업 사무실, 호텔 및 상업 공간 시공 전개."
        }
      },
      {
        id: "time_2024",
        year: "2024",
        title: {
          en: "UL Safety Certification",
          km: "វិញ្ញាបនបត្រសុវត្ថិភាព UL",
          ko: "UL 방화 안전 인증 취득"
        },
        description: {
          en: "Acquired prestigious Underwriters Laboratories (UL) fire-rated certifications for our structural safety doors.",
          km: "ទទួលបានវិញ្ញាបនបត្រធន់នឹងភ្លើង UL ដ៏មានអានុភាពសម្រាប់ទ្វារសុវត្ថិភាពរចនាសម្ព័ន្ធរបស់យើង។",
          ko: "구조용 안전 도어에 대해 세계적인 Underwriters Laboratories (UL) 내화 인증 획득."
        }
      },
      {
        id: "time_2025",
        year: "2025",
        title: {
          en: "Landmark Master Contractor",
          km: "អ្នកម៉ៅការបន្តគម្រោងធំៗ",
          ko: "대형 랜드마크 마스터 시공사"
        },
        description: {
          en: "Completed our 450th premium corporate fit-out including multiple major bank head office contracts in Phnom Penh.",
          km: "បានបញ្ចប់គម្រោងតុបតែងការិយាល័យទី ៤៥០ រួមទាំងកិច្ចសន្យាទីស្នាក់ការកណ្តាលធនាគារធំៗនៅភ្នំពេញ។",
          ko: "프놈펜 주요 은행 본사를 포함한 450번째 프리미엄 기업 인테리어 시공 계약 성료."
        }
      }
    ]
  },
  team_governance: {
    section_title: {
      en: "Board of Directors & Governance",
      km: "ក្រុមប្រឹក្សាភិបាល និងការគ្រប់គ្រង",
      ko: "이사회 및 임원진"
    },
    section_subtitle: {
      en: "A unified corporate team driving quality design, local fabrication, and site-erection compliance.",
      km: "ក្រុមការងារសាជីវកម្មបង្រួបបង្រួមដែលជំរុញការរចនាប្រកបដោយគុណភាព ការផលិតក្នុងស្រុក និងការអនុវត្តតាមការដ្ឋាន។",
      ko: "우수한 디자인, 자체 제조 및 현장 시공 컴플라이언스를 이끄는 통합 경영진입니다."
    },
    leaders: [
      {
        id: "lead_1",
        name: "Na Yun Jung",
        role: {
          en: "Chairman & Board Representative",
          km: "ប្រធានក្រុមប្រឹក្សាភិបាល",
          ko: "회장 및 이사회 대표"
        },
        image_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400",
        photo_or_initials: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400",
        sub_skills: ["Corporate Strategy", "Investor Relations", "Global Trade"],
        department: {
          en: "Executive Board",
          km: "ក្រុមប្រឹក្សាភិបាលប្រតិបត្តិ",
          ko: "이사회"
        },
        category: "directors"
      },
      {
        id: "lead_2",
        name: "Jung Veasna",
        role: {
          en: "Managing Director & Founder",
          km: "នាយកប្រតិបត្តិ និងស្ថាបនិក",
          ko: "대표이사 & 설립자"
        },
        image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
        photo_or_initials: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
        sub_skills: ["Factory Engineering", "Strategic Growth", "Turnkey Contracts"],
        department: {
          en: "Executive Board",
          km: "ក្រុមប្រឹក្សាភិបាលប្រតិបត្តិ",
          ko: "이사회"
        },
        category: "directors"
      },
      {
        id: "lead_3",
        name: "Mr. Kim",
        role: {
          en: "Director of Construction",
          km: "នាយកផ្នែកសំណង់",
          ko: "건설 총괄 디렉터"
        },
        image_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400",
        photo_or_initials: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400",
        sub_skills: ["Structural Safety", "On-Site Execution", "QA/QC Compliance"],
        department: {
          en: "Construction Division",
          km: "ផ្នែកសំណង់",
          ko: "건설 본부"
        },
        category: "management"
      },
      {
        id: "lead_4",
        name: "Prum Vireak",
        role: {
          en: "General Manager",
          km: "អ្នកគ្រប់គ្រងទូទៅ",
          ko: "총괄 지배인 (GM)"
        },
        image_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
        photo_or_initials: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
        sub_skills: ["Operations", "Supply Chain", "Client Relations"],
        department: {
          en: "Corporate Operations",
          km: "ប្រតិបត្តិការសាជីវកម្ម",
          ko: "경영 지원"
        },
        category: "management"
      },
      {
        id: "lead_5",
        name: "Aang Theara",
        role: {
          en: "Product Manager",
          km: "អ្នកគ្រប់គ្រងផលិតផល",
          ko: "프로덕트 매니저"
        },
        image_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400",
        photo_or_initials: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400",
        sub_skills: ["Joinery Specs", "UL Certification", "Material Sourcing"],
        department: {
          en: "Manufacturing Division",
          km: "ផ្នែកផលិតកម្ម",
          ko: "제조 본부"
        },
        category: "management"
      }
    ]
  }
};

const STORAGE_KEY_ABOUT = 'sdy_about_page_data';

function getSheetsWebhookUrl(): string {
  try {
    const savedConfig = localStorage.getItem('sdy_admin_config');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      if (parsed?.googleSheetsWebhookUrl) {
        return parsed.googleSheetsWebhookUrl.trim();
      }
    }
  } catch (e) {}
  return (import.meta as any).env?.VITE_GOOGLE_SHEETS_URL || '';
}

interface AboutContextProps {
  aboutPageData: AboutPageData;
  updateAboutPageData: (data: AboutPageData) => Promise<{ success: boolean; syncedToRemote: boolean; message: string }>;
  resetAboutPageData: () => Promise<void>;
  refreshFromRemote: () => Promise<void>;
  isSyncing: boolean;
}

const AboutContext = createContext<AboutContextProps | undefined>(undefined);

export function AboutProvider({ children }: { children: React.ReactNode }) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [aboutPageData, setAboutPageData] = useState<AboutPageData>(defaultAboutPageData);

  const refreshFromRemote = useCallback(async () => {
    setIsSyncing(true);
    try {
      // 1. Try Direct Google Sheet API
      const activeSpreadsheetId = localStorage.getItem('sdy_active_spreadsheet_id');
      const googleToken = await getAccessToken();
      if (activeSpreadsheetId && googleToken) {
        const directData = await fetchAboutFromSheet(googleToken, activeSpreadsheetId);
        if (directData && Object.keys(directData).length > 0) {
          setAboutPageData((prev) => ({ ...prev, ...directData }));
          window.dispatchEvent(new Event('sdy_global_db_updated'));
          setIsSyncing(false);
          return;
        }
      }

      // 2. Try Apps Script Webhook
      const webhookUrl = getSheetsWebhookUrl();
      if (webhookUrl && webhookUrl.startsWith('http')) {
        const separator = webhookUrl.includes('?') ? '&' : '?';
        const res = await fetch(`${webhookUrl}${separator}action=about_us.get`, { method: 'GET' });
        if (res.ok) {
          const json = await res.json();
          const payload = Array.isArray(json) ? json[0] : (json?.data?.[0] || json?.data || json);
          if (payload && payload.overview && payload.core_values && payload.timeline && payload.team_governance) {
            setAboutPageData(payload);
          }
        }
      }
    } catch (err) {
      console.warn('[AboutContext] Remote fetch skipped or failed:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    refreshFromRemote();
  }, [refreshFromRemote]);

  const updateAboutPageData = async (data: AboutPageData) => {
    setAboutPageData(data);
    window.dispatchEvent(new Event('sdy_about_page_data_updated'));

    setIsSyncing(true);
    let syncedToRemote = false;
    let message = 'Saved locally.';

    // 1. Direct Google Sheet API
    const activeSpreadsheetId = localStorage.getItem('sdy_active_spreadsheet_id');
    const googleToken = await getAccessToken();
    if (activeSpreadsheetId && googleToken) {
      try {
        const directOk = await syncAboutToSheet(googleToken, activeSpreadsheetId, data);
        if (directOk) {
          syncedToRemote = true;
          message = 'About Us page saved and synced directly to Google Sheets tab "About_CMS"!';
        }
      } catch (err) {
        console.warn('[AboutContext] Direct Google Sheet sync error:', err);
      }
    }

    // 2. Apps Script Webhook
    const webhookUrl = getSheetsWebhookUrl();
    if (webhookUrl && webhookUrl.startsWith('http')) {
      try {
        clearApiCache();
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'about_us.save',
            sheetName: 'About_CMS',
            data
          })
        });

        if (response.ok || response.type === 'opaque' || response.status === 200) {
          syncedToRemote = true;
          message = 'About Us page saved and synced to Google Sheets Cloud successfully!';
        }
      } catch (err) {
        console.error('[AboutContext] Remote sync failed:', err);
      }
    }

    setIsSyncing(false);
    window.dispatchEvent(new Event('sdy_global_db_updated'));

    return {
      success: true,
      syncedToRemote,
      message: syncedToRemote ? message : 'Saved locally. Connect Google Sheet or Webhook to enable remote sync.'
    };
  };

  const resetAboutPageData = async () => {
    await updateAboutPageData(defaultAboutPageData);
  };

  useEffect(() => {
    const handleUpdate = () => {
      refreshFromRemote();
    };

    window.addEventListener('sdy_about_page_data_updated', handleUpdate);
    window.addEventListener('sdy_global_db_updated', handleUpdate);

    return () => {
      window.removeEventListener('sdy_about_page_data_updated', handleUpdate);
      window.removeEventListener('sdy_global_db_updated', handleUpdate);
    };
  }, [refreshFromRemote]);

  return (
    <AboutContext.Provider value={{ aboutPageData, updateAboutPageData, resetAboutPageData, refreshFromRemote, isSyncing }}>
      {children}
    </AboutContext.Provider>
  );
}

export function useAboutPage() {
  const context = useContext(AboutContext);
  if (!context) {
    throw new Error('useAboutPage must be used within an AboutProvider');
  }
  return context;
}
