import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { HomepageCmsData, defaultHomepageCmsData } from './HomepageCmsManager';
import { getAccessToken } from '../services/googleAuthService';
import { syncHomepageToSheet, fetchHomepageFromSheet } from '../services/googleSheetsDirectService';

interface HomepageContextProps {
  homepageData: HomepageCmsData;
  updateHomepageData: (data: HomepageCmsData) => Promise<{ success: boolean; syncedToRemote: boolean; message: string }>;
  resetHomepageData: () => Promise<{ success: boolean; syncedToRemote: boolean; message: string }>;
  isSyncing: boolean;
  refreshFromRemote: () => Promise<boolean>;
}

export function getGoogleSheetsWebhookUrl(): string {
  try {
    const savedConfig = localStorage.getItem('sdy_admin_config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      if (config.googleSheetsWebhookUrl && typeof config.googleSheetsWebhookUrl === 'string' && config.googleSheetsWebhookUrl.trim().startsWith('http')) {
        return config.googleSheetsWebhookUrl.trim();
      }
    }
  } catch (e) {}

  if (import.meta.env.VITE_GOOGLE_SHEETS_URL && typeof import.meta.env.VITE_GOOGLE_SHEETS_URL === 'string' && import.meta.env.VITE_GOOGLE_SHEETS_URL.trim().startsWith('http')) {
    return import.meta.env.VITE_GOOGLE_SHEETS_URL.trim();
  }
  if (import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL && typeof import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL === 'string' && import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL.trim().startsWith('http')) {
    return import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL.trim();
  }
  if (import.meta.env.VITE_WEBHOOK_URL && typeof import.meta.env.VITE_WEBHOOK_URL === 'string' && import.meta.env.VITE_WEBHOOK_URL.trim().startsWith('http')) {
    return import.meta.env.VITE_WEBHOOK_URL.trim();
  }

  return '';
}

const HomepageContext = createContext<HomepageContextProps | undefined>(undefined);

export function HomepageProvider({ children }: { children: React.ReactNode }) {
  const [homepageData, setHomepageData] = useState<HomepageCmsData>(defaultHomepageCmsData);

  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Fetch live global state from Google Sheets on mount / manual refresh
  const refreshFromRemote = useCallback(async (): Promise<boolean> => {
    setIsSyncing(true);
    try {
      // 1. Try Direct Google Sheets API
      const activeSpreadsheetId = localStorage.getItem('sdy_active_spreadsheet_id');
      const googleToken = await getAccessToken();
      if (activeSpreadsheetId && googleToken) {
        const directData = await fetchHomepageFromSheet(googleToken, activeSpreadsheetId);
        if (directData && Object.keys(directData).length > 0) {
          setHomepageData((prev) => ({ ...prev, ...directData }));
          window.dispatchEvent(new Event('sdy_homepage_content_updated'));
          setIsSyncing(false);
          return true;
        }
      }

      // 2. Try Apps Script Webhook
      const webhookUrl = getGoogleSheetsWebhookUrl();
      if (webhookUrl) {
        const targetUrl = `${webhookUrl}${webhookUrl.includes('?') ? '&' : '?'}action=homepage_cms.get`;
        const res = await fetch(targetUrl, { method: 'GET' });
        if (res.ok) {
          const json = await res.json();
          let payload: any = null;
          if (json && json.data && Array.isArray(json.data) && json.data.length > 0 && json.data[0]) {
            payload = json.data[0];
          } else if (json && json.hero_section) {
            payload = json;
          }

          if (payload && typeof payload === 'object' && payload.hero_section) {
            setHomepageData(payload as HomepageCmsData);
            window.dispatchEvent(new Event('sdy_homepage_content_updated'));
            window.dispatchEvent(new Event('sdy_global_db_updated'));
            setIsSyncing(false);
            return true;
          }
        }
      }
    } catch (err) {
      console.warn('[HomepageContext] Failed to fetch remote Homepage CMS from Google Sheets:', err);
    } finally {
      setIsSyncing(false);
    }
    return false;
  }, []);

  // Sync state on app mount
  useEffect(() => {
    refreshFromRemote();
  }, [refreshFromRemote]);

  const updateHomepageData = async (data: HomepageCmsData): Promise<{ success: boolean; syncedToRemote: boolean; message: string }> => {
    setHomepageData(data);
    window.dispatchEvent(new Event('sdy_homepage_content_updated'));

    setIsSyncing(true);
    let syncedToRemote = false;
    let message = 'Saved locally.';

    // 1. Direct Google Sheet API
    const activeSpreadsheetId = localStorage.getItem('sdy_active_spreadsheet_id');
    const googleToken = await getAccessToken();
    if (activeSpreadsheetId && googleToken) {
      try {
        const directOk = await syncHomepageToSheet(googleToken, activeSpreadsheetId, data);
        if (directOk) {
          syncedToRemote = true;
          message = 'Successfully saved and synchronized Homepage CMS to Google Sheets tab "Homepage_CMS"!';
        }
      } catch (err: any) {
        console.warn('[HomepageContext] Direct Google Sheet sync error:', err);
      }
    }

    // 2. Apps Script Webhook
    const webhookUrl = getGoogleSheetsWebhookUrl();
    if (webhookUrl) {
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'homepage_cms.save',
            sheetName: 'Homepage_CMS',
            data: data
          })
        });

        if (response.ok || response.type === 'opaque' || response.status === 200) {
          syncedToRemote = true;
          message = 'Successfully saved and synchronized Homepage CMS to Google Sheets!';
        }
      } catch (err: any) {
        console.error('Remote Google Sheets sync error:', err);
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

  const resetHomepageData = async () => {
    return updateHomepageData(defaultHomepageCmsData);
  };

  useEffect(() => {
    const handleUpdate = () => {
      refreshFromRemote();
    };

    window.addEventListener('sdy_global_db_updated', handleUpdate);

    return () => {
      window.removeEventListener('sdy_global_db_updated', handleUpdate);
    };
  }, [refreshFromRemote]);

  return (
    <HomepageContext.Provider value={{ homepageData, updateHomepageData, resetHomepageData, isSyncing, refreshFromRemote }}>
      {children}
    </HomepageContext.Provider>
  );
}

export function useHomepage() {
  const context = useContext(HomepageContext);
  if (!context) {
    throw new Error('useHomepage must be used within a HomepageProvider');
  }
  return context;
}

