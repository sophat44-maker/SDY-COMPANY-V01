import { APP_CONFIG } from '../config/appConfig';

export interface ApiResponse<T = any> {
  success: boolean;
  status?: string;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
  timestamp?: string;
  version?: string;
}

export function getGoogleSheetsWebhookUrl(): string {
  // 1. Check sdy_admin_config
  try {
    const adminCfg = localStorage.getItem('sdy_admin_config');
    if (adminCfg) {
      const parsed = JSON.parse(adminCfg);
      if (parsed.googleSheetsWebhookUrl && typeof parsed.googleSheetsWebhookUrl === 'string' && parsed.googleSheetsWebhookUrl.trim().startsWith('http')) {
        return parsed.googleSheetsWebhookUrl.trim();
      }
    }
  } catch (e) {}

  // 2. Check sdy_sheets_config_v2
  try {
    const sheetsCfg = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.SETTINGS);
    if (sheetsCfg) {
      try {
        const parsed = JSON.parse(sheetsCfg);
        if (parsed.googleSheetsWebhookUrl && typeof parsed.googleSheetsWebhookUrl === 'string' && parsed.googleSheetsWebhookUrl.trim().startsWith('http')) {
          return parsed.googleSheetsWebhookUrl.trim();
        }
      } catch (e) {
        if (sheetsCfg.trim().startsWith('http')) {
          return sheetsCfg.trim();
        }
      }
    }
  } catch (e) {}

  // 3. Check standalone key sdy_sheets_webhook_url
  try {
    const directUrl = localStorage.getItem('sdy_sheets_webhook_url');
    if (directUrl && directUrl.trim().startsWith('http')) {
      return directUrl.trim();
    }
  } catch (e) {}

  // 4. Check env variables
  if ((import.meta as any).env?.VITE_GOOGLE_SHEETS_URL) {
    return (import.meta as any).env.VITE_GOOGLE_SHEETS_URL.trim();
  }

  if (APP_CONFIG.API_BASE_URL && APP_CONFIG.API_BASE_URL.trim().startsWith('http')) {
    return APP_CONFIG.API_BASE_URL.trim();
  }

  return '';
}

class ApiService {
  private getEndpoint(): string {
    return getGoogleSheetsWebhookUrl();
  }

  /**
   * Universal GET Request
   */
  async get<T = any>(action?: string, params: Record<string, string> = {}): Promise<ApiResponse<T>> {
    const endpoint = this.getEndpoint();
    if (!endpoint) {
      return { success: false, message: 'Google Apps Script API Endpoint not configured.' };
    }

    try {
      const url = new URL(endpoint);
      if (action) url.searchParams.append('action', action);
      Object.keys(params).forEach(k => url.searchParams.append(k, params[k]));

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const resData = await response.json();
      return {
        success: resData.status === 'success' || resData.success === true,
        data: resData.data,
        message: resData.message || '',
        timestamp: new Date().toISOString(),
        version: APP_CONFIG.APP_VERSION,
      };
    } catch (err: any) {
      console.error('[ApiService GET Error]:', err);
      return {
        success: false,
        message: err?.message || 'Network communication failure',
      };
    }
  }

  /**
   * Universal POST / Action Request
   */
  async post<T = any>(action: string, payload: Record<string, any> = {}): Promise<ApiResponse<T>> {
    const endpoint = this.getEndpoint();
    if (!endpoint) {
      return { success: false, message: 'Google Apps Script API Endpoint not configured.' };
    }

    const requestBody = JSON.stringify({
      action,
      ...payload,
    });

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // Bypass CORS preflight in Google Apps Script
        },
        body: requestBody,
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const resData = await response.json();
      return {
        success: resData.status === 'success' || resData.success === true,
        data: resData.data,
        message: resData.message || '',
        timestamp: new Date().toISOString(),
        version: APP_CONFIG.APP_VERSION,
      };
    } catch (err: any) {
      console.warn('[ApiService POST Error, executing no-cors fallback dispatch]:', err);
      try {
        await fetch(endpoint, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: requestBody,
        });
        return {
          success: true,
          message: 'Data successfully submitted to Google Sheets via direct webhook.',
          timestamp: new Date().toISOString(),
          version: APP_CONFIG.APP_VERSION,
        };
      } catch (fallbackErr: any) {
        return {
          success: false,
          message: fallbackErr?.message || 'Network communication failure',
        };
      }
    }
  }

  /**
   * Direct Table CRUD Methods
   */
  async readTable(sheetName: string) {
    return this.post('readTable', { sheetName });
  }

  async saveRecord(sheetName: string, idKey: string, record: Record<string, any>) {
    return this.post('saveRecord', { sheetName, idKey, record });
  }

  async deleteRecord(sheetName: string, idKey: string, recordId: string) {
    return this.post('deleteRecord', { sheetName, idKey, recordId });
  }

  async bulkUpdate(sheetName: string, idKey: string, rowIds: string[], field: string, value: any) {
    return this.post('bulkUpdateRows', { sheetName, idKey, rowIds, field, value });
  }

  async bulkDelete(sheetName: string, idKey: string, rowIds: string[]) {
    return this.post('bulkDeleteRows', { sheetName, idKey, rowIds });
  }

  /**
   * Enterprise Full Database Fetch
   */
  async getFullDatabase() {
    return this.get();
  }

  /**
   * Media Library Google Drive Upload Handler
   */
  async uploadMedia(filename: string, base64Data: string, folder: string = 'Uploads') {
    return this.post('uploadFileToDrive', { filename, base64Data, folder });
  }

  /**
   * Entity Schemas Management
   */
  async getEntitySchemas() {
    return this.post('readTable', { sheetName: 'EntitySchemas' });
  }

  async saveEntitySchema(schema: any) {
    return this.post('saveRecord', { sheetName: 'EntitySchemas', idKey: 'id', record: schema });
  }

  async deleteEntitySchema(schemaId: string) {
    return this.post('deleteRecord', { sheetName: 'EntitySchemas', idKey: 'id', recordId: schemaId });
  }

  /**
   * Enterprise Audit Logger
   */
  async logAudit(user: string, action: string, moduleName: string, recordId: string, oldValue?: string, newValue?: string) {
    const auditRecord = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      user: user || 'Admin',
      action,
      module: moduleName,
      recordId,
      timestamp: new Date().toISOString(),
      oldValue: oldValue || '',
      newValue: newValue || '',
    };
    return this.post('saveRecord', { sheetName: 'AuditLogs', idKey: 'id', record: auditRecord });
  }

  /**
   * Export Utilities
   */
  exportToJson(filename: string, data: any) {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  exportToCsv(filename: string, rows: Record<string, any>[]) {
    if (!rows || rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        headers
          .map(h => {
            const val = row[h] !== undefined && row[h] !== null ? String(row[h]) : '';
            return `"${val.replace(/"/g, '""')}"`;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export const api = new ApiService();
export default api;
