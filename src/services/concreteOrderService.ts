import api, { getGoogleSheetsWebhookUrl } from './api';

export interface ProductOrder {
  id: string;
  productName: string;
  category?: string;
  woodType?: string;
  dimensions?: string;
  quantity: number | string;
  customerName: string;
  phone: string;
  deliveryLocation: string;
  deliveryDate?: string;
  notes?: string;
  status?: 'New' | 'Confirmed' | 'In Production' | 'Delivered' | 'Cancelled';
  createdAt: string;
  telegramStatus?: string;
  sheetStatus?: string;
}

// Backwards compatibility alias
export type ConcreteOrder = ProductOrder;

export interface TelegramConfig {
  botToken?: string;
  chatId?: string;
  botUsername?: string; // e.g. sdycompanyci
}

/**
 * Get Telegram Bot config from storage or environment
 */
export function getTelegramConfig(): TelegramConfig {
  try {
    const savedInfo = localStorage.getItem('sdy_company_info');
    if (savedInfo) {
      const info = JSON.parse(savedInfo);
      if (info.TelegramBotToken || info.TelegramChatId || info.Telegram) {
        let extractedChatId = info.TelegramChatId || '';
        let extractedHandle = info.TelegramBotUsername || '';
        if (info.Telegram) {
          const handle = info.Telegram.replace('https://t.me/', '').replace('@', '').trim();
          if (handle) {
            if (!extractedChatId) extractedChatId = `@${handle}`;
            if (!extractedHandle) extractedHandle = handle;
          }
        }
        return {
          botToken: info.TelegramBotToken || '8968337676:AAGSexfjDTle0aIz7K415_ff3E6CnyoCFtc',
          chatId: extractedChatId || '@sdycompanyci',
          botUsername: extractedHandle || 'sdycompanyci',
        };
      }
    }
  } catch (e) {
    console.error('Failed to parse Telegram config from company info:', e);
  }

  // Fallback defaults
  return {
    botToken: '8968337676:AAGSexfjDTle0aIz7K415_ff3E6CnyoCFtc',
    chatId: '@sdycompanyci',
    botUsername: 'sdycompanyci',
  };
}

/**
 * Format message for Telegram Bot Chat (Doors, Joinery & Furniture)
 */
export function formatProductOrderTelegramMessage(order: ProductOrder): string {
  return `🚪 *ការបញ្ជាទិញទ្វារ & គ្រឿងសង្ហារិមថ្មី (Door & Joinery Order)*
----------------------------------------
👤 *ឈ្មោះអតិថិជន:* ${order.customerName}
📞 *លេខទូរស័ព្ទ:* ${order.phone}
🚪 *ផលិតផល:* ${order.productName}
🪵 *ប្រភេទឈើ/សម្ភារៈ:* ${order.woodType || 'តាមគំរូ استاندارد'}
📏 *ទំហំ/ខ្នាត:* ${order.dimensions || 'តាមការប្រឹក្សា'}
📦 *បរិមាណ:* ${order.quantity}
📍 *ទីតាំងដឹកជញ្ជូន/ដំឡើង:* ${order.deliveryLocation}
📅 *កាលបរិច្ឆេទប្រគល់:* ${order.deliveryDate || 'តាមការព្រមព្រៀង'}
📝 *កំណត់ចំណាំ:* ${order.notes || 'គ្មាន'}
⏰ *ម៉ោងបញ្ជាទិញ:* ${order.createdAt}`;
}

export const formatConcreteOrderTelegramMessage = formatProductOrderTelegramMessage;

/**
 * Send Product Order (Doors/Furniture) to Telegram Bot and Google Sheets
 */
export async function submitProductOrder(orderData: Omit<ProductOrder, 'id' | 'createdAt' | 'status'>): Promise<{
  success: boolean;
  message: string;
  telegramSent: boolean;
  sheetsSynced: boolean;
  order: ProductOrder;
}> {
  const order: ProductOrder = {
    ...orderData,
    id: `ord_sdy_${Date.now()}`,
    status: 'New',
    createdAt: new Date().toLocaleString('km-KH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  let telegramSent = false;
  let sheetsSynced = false;

  // 1. Save to local storage immediately for ADMIN panel
  try {
    const existingOrdersStr = localStorage.getItem('sdy_concrete_orders');
    const existingOrders: ProductOrder[] = existingOrdersStr ? JSON.parse(existingOrdersStr) : [];
    const updatedOrders = [order, ...existingOrders];
    localStorage.setItem('sdy_concrete_orders', JSON.stringify(updatedOrders));
  } catch (err) {
    console.error('Failed to save order to localStorage:', err);
  }

  window.dispatchEvent(new Event('sdy_concrete_order_submitted'));

  // 2. Submit to Google Sheets via Google Apps Script Webhook
  try {
    const webhookUrl = getGoogleSheetsWebhookUrl();
    if (webhookUrl) {
      const payload = JSON.stringify({
        action: 'saveRecord',
        sheetName: 'DoorAndFurnitureOrders',
        idKey: 'id',
        record: order,
      });

      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: payload,
        });
        if (response.ok || response.status === 200) {
          sheetsSynced = true;
          console.log('Order posted to Google Sheets webhook successfully');
        }
      } catch (fetchErr) {
        // Fallback no-cors dispatch
        console.warn('Standard fetch failed, sending order via no-cors webhook fallback:', fetchErr);
        await fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: payload,
        });
        sheetsSynced = true;
      }
    } else {
      // Fallback using universal API service
      const apiRes = await api.saveRecord('DoorAndFurnitureOrders', 'id', order);
      if (apiRes.success) {
        sheetsSynced = true;
      }
    }
  } catch (err) {
    console.warn('Google Sheets sync warning:', err);
  }

  // 3. Send to Telegram Bot Chat API if Bot Token and Chat ID are configured
  const tgConfig = getTelegramConfig();
  if (tgConfig.botToken && tgConfig.chatId) {
    try {
      const textMessage = formatProductOrderTelegramMessage(order);
      const tgUrl = `https://api.telegram.org/bot${tgConfig.botToken}/sendMessage`;
      const tgRes = await fetch(tgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: tgConfig.chatId,
          text: textMessage,
          parse_mode: 'Markdown',
        }),
      });

      if (tgRes.ok) {
        telegramSent = true;
      }
    } catch (err) {
      console.warn('Telegram Bot API dispatch error:', err);
    }
  }

  // Update order with telegram & sheet statuses
  order.telegramStatus = telegramSent ? 'OK' : 'Failed';
  order.sheetStatus = sheetsSynced ? 'Synced' : 'Pending';

  try {
    const existingOrdersStr = localStorage.getItem('sdy_concrete_orders');
    if (existingOrdersStr) {
      const existingOrders: ProductOrder[] = JSON.parse(existingOrdersStr);
      const updatedOrders = existingOrders.map((o) =>
        o.id === order.id ? order : o
      );
      localStorage.setItem('sdy_concrete_orders', JSON.stringify(updatedOrders));
      window.dispatchEvent(new Event('sdy_concrete_order_submitted'));
    }
  } catch (e) {}

  return {
    success: true,
    message: 'ការបញ្ជាទិញទ្វារ & គ្រឿងសង្ហារិម ត្រូវបានផ្ញើដោយជោគជ័យ!',
    telegramSent,
    sheetsSynced,
    order,
  };
}

export const submitConcreteOrder = submitProductOrder;

/**
 * Open direct Telegram chat link with pre-filled message text
 */
export function openTelegramOrderChat(order: ProductOrder) {
  const tgConfig = getTelegramConfig();
  const formattedText = formatProductOrderTelegramMessage(order);
  
  let targetUsername = tgConfig.botUsername || 'sdycompanyci';
  if (targetUsername.includes('t.me/')) {
    targetUsername = targetUsername.split('t.me/')[1];
  }
  if (targetUsername.startsWith('@')) {
    targetUsername = targetUsername.substring(1);
  }
  targetUsername = targetUsername.split('?')[0].split('/')[0].trim();

  if (!targetUsername) {
    targetUsername = 'sdycompanyci';
  }

  const directTgUrl = `https://t.me/${targetUsername}?text=${encodeURIComponent(formattedText)}`;
  window.open(directTgUrl, '_blank', 'noopener,noreferrer');
}

