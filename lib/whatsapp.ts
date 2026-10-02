import prisma from './prisma';

export interface SendWhatsAppParams {
  phone: string;
  type: 'payment_confirmation' | 'bill' | 'followup_reminder' | 'booking_confirmation' | 'general';
  content: string;
}

export async function getWhatsAppSettings() {
  const settings = await prisma.salonSetting.findMany({
    where: { group: 'whatsapp' },
  });

  const settingsMap: Record<string, string> = {};
  settings.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  return {
    enabled: settingsMap['whatsapp_enabled'] === 'true',
    provider: settingsMap['whatsapp_api_provider'] || 'meta_cloud',
    phoneId: settingsMap['whatsapp_api_phone_id'] || '',
    token: settingsMap['whatsapp_api_token'] || '',
    autoBill: settingsMap['whatsapp_auto_bill'] !== 'false',
    autoReminder: settingsMap['whatsapp_auto_reminder'] !== 'false',
    followupDays: parseInt(settingsMap['whatsapp_followup_days'] || '18', 10),
  };
}

export function generateWhatsAppWebUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  return `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function createPaymentReceiptMessage({
  customerName,
  invoiceNumber,
  amount,
  method,
  servicesList,
  invoiceUrl,
}: {
  customerName: string;
  invoiceNumber: string;
  amount: number;
  method: string;
  servicesList: string[];
  invoiceUrl: string;
}): string {
  const servicesText = servicesList.length > 0
    ? `\n📋 *Services Rendered:*\n${servicesList.map(s => `• ${s}`).join('\n')}`
    : '';

  return (
`✨ *HAIR MART STUDIO & UNISEX SALON* ✨
_Surathkal (Near Vishal Mart)_

Dear *${customerName}*, thank you for visiting Hair Mart today!

🧾 *Payment Confirmation:*
• *Invoice No:* #${invoiceNumber}
• *Amount Paid:* ₹${amount.toFixed(2)}
• *Payment Mode:* ${method.toUpperCase()}
• *Status:* Confirmed ✅
${servicesText}

📄 *View / Download Digital Bill:*
${invoiceUrl}

🌟 *Next Visit Care:*
Keep your hair and skin refreshed. We look forward to seeing you again soon!

📞 *Salon Reception:* 0824-4060938
💬 *WhatsApp:* 8660549348`
  );
}

export function createRecurringReminderMessage({
  customerName,
  daysSinceLastVisit,
  lastServices,
}: {
  customerName: string;
  daysSinceLastVisit: number;
  lastServices?: string[];
}): string {
  const serviceContext = lastServices && lastServices.length > 0
    ? `for your *${lastServices[0]}*`
    : 'for your grooming session';

  return (
`💈 *HAIR MART UNISEX SALON* — Reminder 💈
_Surathkal (Near Vishal Mart, MRPL Road)_

Hi *${customerName}*! 👋

It has been *${daysSinceLastVisit} days* since your last visit to Hair Mart ${serviceContext}.

💇‍♂️💇‍♀️ *Time for a Refresh?*
Maintain your fresh look with a quick haircut, beard trim, relaxing hair spa, or O3+ facial treatment.

⏰ *Salon Hours:*
• Mon–Sat: 9:30 AM – 9:00 PM
• Sun: 10:00 AM – 8:30 PM

🚗 *Walk-ins Warmly Welcome!*
Reply directly to this message or call us to let us know when you plan to drop by.

📞 *Call:* 0824-4060938
💬 *WhatsApp:* 8660549348`
  );
}

export async function sendWhatsAppMessage({ phone, type, content }: SendWhatsAppParams) {
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const settings = await getWhatsAppSettings();

  let messageStatus = 'queued';
  let isCloudApiSent = false;

  if (settings.enabled && settings.phoneId && settings.token) {
    try {
      // Meta WhatsApp Cloud API Dispatch
      const response = await fetch(`https://graph.facebook.com/v19.0/${settings.phoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: `91${cleanPhone}`,
          type: 'text',
          text: { body: content },
        }),
      });

      if (response.ok) {
        messageStatus = 'sent';
        isCloudApiSent = true;
      } else {
        const errJson = await response.json().catch(() => null);
        console.error('WhatsApp API returned error:', errJson);
        messageStatus = 'failed';
      }
    } catch (err) {
      console.error('WhatsApp API dispatch error:', err);
      messageStatus = 'failed';
    }
  }

  // Log message in DB
  const loggedMsg = await prisma.whatsappMessage.create({
    data: {
      phone: `+91${cleanPhone}`,
      type,
      content,
      status: messageStatus,
      sentAt: isCloudApiSent ? new Date() : null,
    },
  });

  return {
    success: isCloudApiSent,
    isCloudApiSent,
    requiresManualSend: !isCloudApiSent,
    messageId: loggedMsg.id,
    whatsappWebUrl: generateWhatsAppWebUrl(cleanPhone, content),
  };
}
