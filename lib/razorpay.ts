import Razorpay from 'razorpay';
import prisma from './prisma';
import crypto from 'crypto';

export async function getRazorpayCredentials() {
  const settings = await prisma.salonSetting.findMany({
    where: { group: 'payment' },
  });

  const settingsMap: Record<string, string> = {};
  settings.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  const keyId = settingsMap['razorpay_key_id'] || process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key';
  const keySecret = settingsMap['razorpay_key_secret'] || process.env.RAZORPAY_KEY_SECRET || 'rzp_test_placeholder_secret';
  const webhookSecret = settingsMap['razorpay_webhook_secret'] || process.env.RAZORPAY_WEBHOOK_SECRET || '';
  const isTestMode = settingsMap['razorpay_test_mode'] !== 'false';

  return { keyId, keySecret, webhookSecret, isTestMode };
}

export async function getRazorpayClient() {
  const { keyId, keySecret } = await getRazorpayCredentials();
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export async function createRazorpayOrder({
  amount,
  receipt,
  notes,
}: {
  amount: number; // in INR (Rupees)
  receipt: string;
  notes?: Record<string, string>;
}) {
  const razorpay = await getRazorpayClient();
  const { keyId } = await getRazorpayCredentials();

  // Convert amount to paise (1 INR = 100 paise)
  const amountInPaise = Math.round(amount * 100);

  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt,
    notes: notes || {},
  });

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId,
  };
}

export async function createRazorpayPaymentLink({
  amount,
  customerName,
  customerPhone,
  customerEmail,
  description,
  referenceId,
}: {
  amount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  description: string;
  referenceId: string;
}) {
  const razorpay = await getRazorpayClient();
  const amountInPaise = Math.round(amount * 100);

  // Format phone to 10 digits
  const cleanPhone = customerPhone.replace(/\D/g, '').slice(-10);

  const paymentLink = await razorpay.paymentLink.create({
    amount: amountInPaise,
    currency: 'INR',
    accept_partial: false,
    reference_id: referenceId,
    description,
    customer: {
      name: customerName,
      contact: `+91${cleanPhone}`,
      email: customerEmail || undefined,
    },
    notify: {
      sms: true,
      email: !!customerEmail,
    },
    reminder_enable: true,
    notes: {
      salon: 'Hair Mart Unisex Salon Surathkal',
      referenceId,
    },
  });

  return {
    linkId: paymentLink.id,
    shortUrl: paymentLink.short_url,
    status: paymentLink.status,
  };
}

export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
  secret,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
  secret: string;
}): boolean {
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body.toString())
    .digest('hex');

  return expectedSignature === signature;
}
