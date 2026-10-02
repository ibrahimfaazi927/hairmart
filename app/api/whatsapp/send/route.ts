import { NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, content, type = 'general' } = body;

    if (!phone || !content) {
      return NextResponse.json({ error: 'Missing phone or content' }, { status: 400 });
    }

    const result = await sendWhatsAppMessage({
      phone,
      type,
      content,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('WhatsApp send API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send WhatsApp message' }, { status: 500 });
  }
}
