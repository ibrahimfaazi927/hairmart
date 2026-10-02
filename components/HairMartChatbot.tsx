'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  options?: string[];
  actionLink?: { label: string; url: string; type: 'whatsapp' | 'call' | 'maps' };
}

const FAQ_DATABASE: Record<string, { reply: string; actionLink?: { label: string; url: string; type: 'whatsapp' | 'call' | 'maps' } }> = {
  timings: {
    reply: "Hair Mart Unisex Salon in Surathkal is open 7 days a week:\n\n• Monday – Saturday: 9:30 AM – 9:00 PM\n• Sunday: 10:00 AM – 8:30 PM\n\nWalk-ins are warmly accommodated!",
    actionLink: { label: "Call Salon (0824-4060938)", url: "tel:08244060938", type: "call" }
  },
  location: {
    reply: "We are located at Keshav Chowta Nagar, Krishnapura, Near Vishal Mart, MRPL Road, Surathkal, Mangalore - 575014. Ample parking is available in front of the studio.",
    actionLink: { label: "Open in Google Maps", url: "https://www.google.com/maps/search/?api=1&query=Hair+Mart+Unisex+Saloon+Near+Vishal+Mart+Krishnapura+Surathkal+Mangalore", type: "maps" }
  },
  mens_services: {
    reply: "For men, we offer:\n• Precision Haircuts & Trend Fades\n• Custom Beard Sculpting & Edge Shaping\n• Classic Hot Towel Shaves\n• Ammonia-Free Grey Coverage & L'Oréal Colouring\n• Herbal Oil & Scalp Tonic Massages\n• De-Tan & Gold Facials\n• Kids Haircuts & Head Shaving",
    actionLink: { label: "Enquire on WhatsApp", url: "https://wa.me/918660549348?text=Hi%20Hair%20Mart%2C%20I%27d%20like%20to%20enquire%20about%20Men%27s%20services.", type: "whatsapp" }
  },
  womens_services: {
    reply: "For women, our specialized rituals include:\n• Moisturizing, Repairing & Fibre Clinix Hair Spas\n• Permanent Hair Straightening & Silk Smoothing\n• Hair Botox & Biotin Infusion Therapy\n• O3+ Professional Shine & Glow Facials\n• Nature's Essence Glowing Gold Therapy\n• Lotus Professional Bridal Glow Treatment\n• Scalp & Hair Fall Care",
    actionLink: { label: "Enquire on WhatsApp", url: "https://wa.me/918660549348?text=Hi%20Hair%20Mart%2C%20I%27d%20like%20to%20enquire%20about%20Women%27s%20services.", type: "whatsapp" }
  },
  facials: {
    reply: "We use strictly certified single-use kits:\n1. O3+ Professional Shine & Glow (Italy Formulation)\n2. Nature's Essence 5-Stage 24K Glowing Gold Facial\n3. Lotus Professional Bridal Glow Skin Whitening\n4. Intensive De-Tan Face & Neck Therapy\n\nAll facials include ozone steaming and deep pore purification.",
    actionLink: { label: "Consult Skincare on WhatsApp", url: "https://wa.me/918660549348?text=Hi%20Hair%20Mart%2C%20I%27d%20like%20to%20know%20more%20about%20Facial%20treatments.", type: "whatsapp" }
  },
  contact: {
    reply: "You can reach Hair Mart Surathkal directly:\n\n• Landline: 0824-4060938\n• Mobile / WhatsApp: +91 8660549348\n\nOur team is available every day to assist you!",
    actionLink: { label: "WhatsApp Directly", url: "https://wa.me/918660549348", type: "whatsapp" }
  }
};

export default function HairMartChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: "Hello! Welcome to Hair Mart Unisex Salon, Surathkal. How can I help you today?",
      options: [
        "Salon Timings",
        "Where are you located?",
        "Men's Services",
        "Women's Services",
        "Facials & Skincare",
        "Contact Numbers"
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      const lower = query.toLowerCase();
      let matchedData = FAQ_DATABASE.contact;

      if (lower.includes('time') || lower.includes('hour') || lower.includes('open') || lower.includes('close') || lower.includes('sunday')) {
        matchedData = FAQ_DATABASE.timings;
      } else if (lower.includes('locate') || lower.includes('where') || lower.includes('address') || lower.includes('map') || lower.includes('vishal')) {
        matchedData = FAQ_DATABASE.location;
      } else if (lower.includes('men') || lower.includes('beard') || lower.includes('fade') || lower.includes('shave') || lower.includes('boy')) {
        matchedData = FAQ_DATABASE.mens_services;
      } else if (lower.includes('women') || lower.includes('spa') || lower.includes('botox') || lower.includes('smooth') || lower.includes('straight') || lower.includes('girl')) {
        matchedData = FAQ_DATABASE.womens_services;
      } else if (lower.includes('facial') || lower.includes('skin') || lower.includes('o3') || lower.includes('gold') || lower.includes('glow') || lower.includes('tan') || lower.includes('bridal')) {
        matchedData = FAQ_DATABASE.facials;
      } else {
        matchedData = {
          reply: `Thank you for asking about "${query}". Hair Mart is a premium unisex salon in Surathkal offering expert hair styling, beard design, restorative spas, and certified facials. For personal consultations, connect directly on WhatsApp!`,
          actionLink: {
            label: "Chat with Stylist on WhatsApp",
            url: `https://wa.me/918660549348?text=Hi%20Hair%20Mart%2C%20I%20have%20an%20enquiry%20about%20${encodeURIComponent(query)}`,
            type: "whatsapp"
          }
        };
      }

      const botReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: matchedData.reply,
        actionLink: matchedData.actionLink,
        options: [
          "Where are you located?",
          "Facials & Skincare",
          "Salon Timings",
          "Contact Numbers"
        ]
      };

      setMessages((prev) => [...prev, botReply]);
    }, 400);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open Salon Assistant"
        className="chatbot-launcher-btn"
      >
        {isOpen ? (
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>✕</span>
        ) : (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
            </svg>
            <span style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              width: '7px',
              height: '7px',
              background: '#25D366',
              borderRadius: '50%',
              border: '1.5px solid #0C0E12',
            }} />
          </div>
        )}
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div
            style={{
              padding: '12px 14px',
              background: '#181C24',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'var(--gold-400)',
                  color: '#0C0E12',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '12px',
                }}
              >
                HM
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#FFFFFF' }}>
                  Hair Mart Assistant
                </div>
                <div style={{ fontSize: '10px', color: '#25D366', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#25D366' }} />
                  Surathkal Studio • Online
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{ color: '#8892A6', fontSize: '16px', padding: '4px', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>

          {/* Message List */}
          <div
            style={{
              flex: 1,
              padding: '12px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '88%',
                }}
              >
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: m.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    background: m.sender === 'user'
                      ? 'var(--gold-400)'
                      : '#1A1F2C',
                    color: m.sender === 'user' ? '#0C0E12' : '#F3F4F6',
                    fontSize: '12px',
                    lineHeight: '1.45',
                    whiteSpace: 'pre-line',
                    border: m.sender === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                    fontWeight: m.sender === 'user' ? 600 : 400,
                  }}
                >
                  {m.text}
                </div>

                {m.actionLink && (
                  <div style={{ marginTop: '5px' }}>
                    <a
                      href={m.actionLink.url}
                      target={m.actionLink.type === 'maps' || m.actionLink.type === 'whatsapp' ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '5px 10px',
                        borderRadius: '6px',
                        background: m.actionLink.type === 'whatsapp' ? '#25D366' : 'rgba(212, 175, 55, 0.15)',
                        color: m.actionLink.type === 'whatsapp' ? '#FFFFFF' : '#D4AF37',
                        border: m.actionLink.type === 'whatsapp' ? 'none' : '1px solid rgba(212, 175, 55, 0.3)',
                        fontSize: '11px',
                        fontWeight: 600,
                        textDecoration: 'none',
                      }}
                    >
                      {m.actionLink.type === 'whatsapp' && '💬'}
                      {m.actionLink.type === 'call' && '📞'}
                      {m.actionLink.type === 'maps' && '📍'}
                      {m.actionLink.label}
                    </a>
                  </div>
                )}

                {m.options && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                    {m.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleSend(opt)}
                        style={{
                          fontSize: '10.5px',
                          padding: '4px 8px',
                          borderRadius: '10px',
                          background: 'rgba(212, 175, 55, 0.08)',
                          border: '1px solid rgba(212, 175, 55, 0.2)',
                          color: '#D4AF37',
                          cursor: 'pointer',
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: '8px 12px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              background: '#0E1117',
              display: 'flex',
              gap: '6px',
            }}
          >
            <input
              type="text"
              placeholder="Ask about haircuts, facials, location..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: '6px',
                background: '#181C24',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
                fontSize: '12px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                background: 'var(--gold-400)',
                color: '#0C0E12',
                fontWeight: 700,
                fontSize: '12px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
