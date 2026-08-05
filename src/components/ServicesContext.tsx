import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ServicesPageData, ServiceCardItem } from '../types';
import { clearApiCache } from '../services/ApiService';
import { getAccessToken } from '../services/googleAuthService';
import { syncServicesToSheet, fetchServicesFromSheet } from '../services/googleSheetsDirectService';

export const defaultServicesPageData: ServicesPageData = {
  header: {
    title: {
      en: "Our Core Industrial Capabilities",
      km: "សមត្ថភាពឧស្សាហកម្មស្នូលរបស់យើង",
      ko: "SDY 핵심 산업 및 제조 역량"
    },
    subtitle: {
      en: "We operate multiple modern manufacturing lines across Cambodia, ensuring premium materials, rigid steel trusses, high-performance acoustic doors, and luxury joinery.",
      km: "យើងប្រតិបត្តិការខ្សែសង្វាក់ផលិតកម្មទំនើបៗជាច្រើននៅកម្ពុជា ដោយធានានូវសម្ភារៈគុណភាពខ្ពស់ គ្រោងដែកមាំ ទ្វារកាត់បន្ថយសំឡេង និងគ្រឿងសង្ហារឹមឈើប្រណីត។",
      ko: "캄보디아 전역에서 현대적인 제조 라인을 운영하여 프리미엄 자재, 고강도 철골, 고성능 방음 도어 및 럭셔리 목공예를 제공합니다."
    }
  },
  categories: [
    "All",
    "Design & Fit-Out",
    "Doors & Manufacturing",
    "Decor & Construction",
    "Glass & Facade",
    "Sectors"
  ],
  services_list: [
    {
      id: "srv_fitout",
      category_tag: "Design & Fit-Out",
      icon_type: "LayoutGrid",
      title: {
        en: "Interior Fit-Out & Turnkey Contracting",
        km: "ការរចនា និងរៀបចំផ្ទៃខាងក្នុង turnkey",
        ko: "인테리어 턴키 시공"
      },
      description: {
        en: "Comprehensive corporate, hospitality, and retail interior fit-out with custom joinery and ceiling integration.",
        km: "សេវាកម្មរៀបចំផ្ទៃខាងក្នុងការិយាល័យ សណ្ឋាគារ និងហាងលក់ទំនិញ ជាមួយគ្រឿងឈើ និងពិដានតាមតម្រូវការ។",
        ko: "맞춤형 가구 및 천장 통합을 포함한 기업, 호스피탈리티, 리테일 공간 턴키 인테리어 시공."
      },
      action_text: {
        en: "Inquire Division >",
        km: "សាកសួរព័ត៌មានផ្នែក >",
        ko: "부서 문의하기 >"
      }
    },
    {
      id: "srv_wood_doors",
      category_tag: "Doors & Manufacturing",
      icon_type: "DoorClosed",
      title: {
        en: "Bespoke Timber & Acoustic Doors",
        km: "ផលិតកម្មទ្វារឈើប្រណីត និងទ្វារកាត់បន្ថយសំឡេង",
        ko: "맞춤형 원목 및 방음 도어"
      },
      description: {
        en: "Kiln-dried teak, solid core acoustic engineered doors manufactured in our Phnom Penh mill.",
        km: "ទ្វារឈើប្រណីត និងទ្វារការពារសំឡេង ផលិតចេញពីរោងចក្រផ្ទាល់ខ្លួននៅរាជធានីភ្នំពេញ។",
        ko: "프놈펜 자체 공장에서 생산되는 특수 건조 원목 및 고성능 방음 엔지니어링 도어."
      },
      action_text: {
        en: "Inquire Division >",
        km: "សាកសួរព័ត៌មានផ្នែក >",
        ko: "부서 문의하기 >"
      }
    },
    {
      id: "srv_steel_doors",
      category_tag: "Doors & Manufacturing",
      icon_type: "Shield",
      title: {
        en: "UL Fire-Rated Steel Doors & Exit Frames",
        km: "ទ្វារដែកពន្លត់អគ្គីភ័យស្តង់ដារ UL",
        ko: "UL 방화 등급 스틸 도어 및 프레임"
      },
      description: {
        en: "Certified 60-180 minute fire resistant steel doors for high-rise emergency exits and industrial facilities.",
        km: "ទ្វារដែកធន់នឹងភ្លើង ៦០ ទៅ ១៨០ នាទី សម្រាប់អគារខ្ពស់ៗ និងរោងចក្រឧស្សាហកម្ម។",
        ko: "고층 빌딩 및 산업 시설용 60-180분 내화 인증 방화 도어 및 비상구 시스템."
      },
      action_text: {
        en: "Inquire Division >",
        km: "សាកសួរព័ត៌មានផ្នែក >",
        ko: "부서 문의하기 >"
      }
    },
    {
      id: "srv_decor_construction",
      category_tag: "Decor & Construction",
      icon_type: "Hammer",
      title: {
        en: "Commercial Decor & Renovation",
        km: "ការតុបតែង និងកែលម្អអគារពាណិជ្ជកម្ម",
        ko: "상업 공간 데코 및 리노베이션"
      },
      description: {
        en: "Structural modifications, wall paneling, acoustic drywall systems, and high-end surface finishes.",
        km: "ការកែប្រែទម្រង់អគារ ជញ្ជាំងឈើប្រណីត ប្រព័ន្ធជញ្ជាំងកាត់បន្ថយសំឡេង និងការលាបថ្នាំទំនើប។",
        ko: "구조 변경, 벽면 패널링, 건식 방음 벽체 및 하이엔드 표面 마감 시공."
      },
      action_text: {
        en: "Inquire Division >",
        km: "សាកសួរព័ត៌មានផ្នែក >",
        ko: "부서 문의하기 >"
      }
    },
    {
      id: "srv_glass_facade",
      category_tag: "Glass & Facade",
      icon_type: "Layers",
      title: {
        en: "Architectural Glass & Aluminum Facades",
        km: "ការងារកញ្ចក់ស្ថាបត្យកម្ម និងផ្នែកខាងក្រៅអាលុយមីញ៉ូម",
        ko: "건축용 글라스 및 알루미늄 커튼월"
      },
      description: {
        en: "Double-glazed curtain walls, structural glass partitions, thermal break aluminum windows and louvers.",
        km: "ជញ្ជាំងកញ្ចក់ការពារកម្តៅ ការរៀបចំជញ្ជាំងកញ្ចក់ការិយាល័យ និងបង្អួចអាលុយមីញ៉ូមស្តង់ដារខ្ពស់។",
        ko: "복층 유리가 적용된 커튼월, 구조용 유리 파티션, 단열 알루미늄 창호 시스템."
      },
      action_text: {
        en: "Inquire Division >",
        km: "សាកសួរព័ត៌មានផ្នែក >",
        ko: "부서 문의하기 >"
      }
    },
    {
      id: "srv_sectors",
      category_tag: "Sectors",
      icon_type: "Building2",
      title: {
        en: "Specialized Sector Engineering",
        km: "វិស្វកម្មឯកទេសតាមវិស័យ",
        ko: "전문 산업 분야 엔지니어링"
      },
      description: {
        en: "Acoustic insulation for auditoriums, sterile cleanroom fit-outs for medical labs, and banking vaults.",
        km: "ការងារសំឡេងសាលប្រជុំ ការរៀបចំបន្ទប់ស្អាតសម្រាប់មន្ទីរពេទ្យ និងសុវត្ថិភាពទូដែកធនាគារ។",
        ko: "강당/공연장 음향 방음, 의료/제약 클린룸 인테리어 및 금융 기관용 특수 보안 도어."
      },
      action_text: {
        en: "Inquire Division >",
        km: "សាកសួរព័ត៌មានផ្នែក >",
        ko: "부서 문의하기 >"
      }
    }
  ]
};

const STORAGE_KEY_SERVICES = 'sdy_services_page_data';

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

interface ServicesContextProps {
  servicesPageData: ServicesPageData;
  updateServicesPageData: (data: ServicesPageData) => Promise<{ success: boolean; syncedToRemote: boolean; message: string }>;
  resetServicesPageData: () => Promise<void>;
  refreshFromRemote: () => Promise<void>;
  isSyncing: boolean;
}

const ServicesContext = createContext<ServicesContextProps | undefined>(undefined);

export function ServicesProvider({ children }: { children: React.ReactNode }) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [servicesPageData, setServicesPageData] = useState<ServicesPageData>(defaultServicesPageData);

  const refreshFromRemote = useCallback(async () => {
    setIsSyncing(true);
    try {
      // 1. Try Direct Google Sheet API
      const activeSpreadsheetId = localStorage.getItem('sdy_active_spreadsheet_id');
      const googleToken = await getAccessToken();
      if (activeSpreadsheetId && googleToken) {
        const directData = await fetchServicesFromSheet(googleToken, activeSpreadsheetId);
        if (directData && Object.keys(directData).length > 0) {
          setServicesPageData((prev) => ({ ...prev, ...directData }));
          window.dispatchEvent(new Event('sdy_global_db_updated'));
          setIsSyncing(false);
          return;
        }
      }

      // 2. Try Apps Script Webhook
      const webhookUrl = getSheetsWebhookUrl();
      if (webhookUrl && webhookUrl.startsWith('http')) {
        const separator = webhookUrl.includes('?') ? '&' : '?';
        const res = await fetch(`${webhookUrl}${separator}action=services_page.get`, { method: 'GET' });
        if (res.ok) {
          const json = await res.json();
          const payload = Array.isArray(json) ? json[0] : (json?.data?.[0] || json?.data || json);
          if (payload && payload.header && Array.isArray(payload.services_list)) {
            setServicesPageData(payload);
            window.dispatchEvent(new Event('sdy_global_db_updated'));
          }
        }
      }
    } catch (err) {
      console.warn('[ServicesContext] Remote fetch skipped or failed:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    refreshFromRemote();
  }, [refreshFromRemote]);

  const updateServicesPageData = async (data: ServicesPageData) => {
    setServicesPageData(data);
    window.dispatchEvent(new Event('sdy_services_page_data_updated'));

    setIsSyncing(true);
    let syncedToRemote = false;
    let message = 'Saved locally.';

    // 1. Direct Google Sheet API
    const activeSpreadsheetId = localStorage.getItem('sdy_active_spreadsheet_id');
    const googleToken = await getAccessToken();
    if (activeSpreadsheetId && googleToken) {
      try {
        const directOk = await syncServicesToSheet(googleToken, activeSpreadsheetId, data);
        if (directOk) {
          syncedToRemote = true;
          message = 'Services page saved and synced directly to Google Sheets tab "Services_CMS"!';
        }
      } catch (err) {
        console.warn('[ServicesContext] Direct Google Sheet sync error:', err);
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
            action: 'services_page.save',
            sheetName: 'Services_CMS',
            data
          })
        });

        if (response.ok || response.type === 'opaque' || response.status === 200) {
          syncedToRemote = true;
          message = 'Services page saved and synced to Google Sheets Cloud successfully!';
        }
      } catch (err) {
        console.error('[ServicesContext] Remote sync failed:', err);
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

  const resetServicesPageData = async () => {
    await updateServicesPageData(defaultServicesPageData);
  };

  useEffect(() => {
    const handleUpdate = () => {
      refreshFromRemote();
    };

    window.addEventListener('sdy_services_page_data_updated', handleUpdate);
    window.addEventListener('sdy_global_db_updated', handleUpdate);

    return () => {
      window.removeEventListener('sdy_services_page_data_updated', handleUpdate);
      window.removeEventListener('sdy_global_db_updated', handleUpdate);
    };
  }, [refreshFromRemote]);

  return (
    <ServicesContext.Provider value={{ servicesPageData, updateServicesPageData, resetServicesPageData, refreshFromRemote, isSyncing }}>
      {children}
    </ServicesContext.Provider>
  );
}

export function useServicesPage() {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error('useServicesPage must be used within a ServicesProvider');
  }
  return context;
}
