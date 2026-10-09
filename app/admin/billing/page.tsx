'use client';

import { useState, useEffect, useRef } from 'react';
import Logo from '@/components/Logo';
import {
  connectEzoBluetooth,
  connectEzoSerial,
  getEzoConnectionStatus,
  printBillToEzoPrinter,
  generateTestSlipBytes,
  sendRawBytesToPrinter,
  printVia58mmWindow,
  generateHairMartUpiUrl,
  HAIR_MART_UPI_VPA,
  type BillPrintData,
} from '@/lib/thermalPrinter';
import { generateQrSvg } from '@/lib/qrCode';
import { OWNER_WHATSAPP_PHONE } from '@/lib/whatsapp';

interface ServiceItem {
  id: string;
  name: string;
  price: number;
  duration?: number;
  image?: string;
  category?: { id?: string; name: string; gender?: string };
  categoryName?: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  status?: string;
  lastVisit?: string;
  totalSpent?: number;
  totalVisits?: number;
  notes?: string;
}

interface BillItem {
  serviceId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface ChairOption {
  id: string;
  name: string;
  section: string;
  active: boolean;
  assignedStaff?: { name: string } | null;
}

interface ProductItem {
  id: string;
  name: string;
  brand: string;
  description?: string | null;
  image?: string | null;
  price: number;
  stock?: number | null;
  category?: string | null;
  active: boolean;
}

// ── Curated high-definition distinct salon photography ─────────────
// Every service gets a visually unique image — no repeats
const DISTINCT_SERVICE_IMAGES: Record<string, string> = {
  // ─── MEN'S SERVICES ───
  'normal hair cut': 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500&auto=format&fit=crop&q=80',
  'hair cut (men)': 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500&auto=format&fit=crop&q=80',
  'change of style': 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=500&auto=format&fit=crop&q=80',
  'kids hair cut / kids (up to 10 yrs)': 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=500&auto=format&fit=crop&q=80',
  'kids hair cut': 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=500&auto=format&fit=crop&q=80',
  'head shave': 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&auto=format&fit=crop&q=80',
  'head shave for kids': 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=500&auto=format&fit=crop&q=80',
  'shaving': 'https://images.unsplash.com/photo-1512690459411-b9245aed614b?w=500&auto=format&fit=crop&q=80',
  'shave': 'https://images.unsplash.com/photo-1512690459411-b9245aed614b?w=500&auto=format&fit=crop&q=80',
  'beard setting': 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&auto=format&fit=crop&q=80',
  'beard set': 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&auto=format&fit=crop&q=80',
  'beard design': 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&auto=format&fit=crop&q=80',
  'beard trim': 'https://images.unsplash.com/photo-1517832606589-7629c3397143?w=500&auto=format&fit=crop&q=80',
  'beard colour': 'https://images.unsplash.com/photo-1578070181910-f1e514afdd08?w=500&auto=format&fit=crop&q=80',

  // ─── HAIR SPA & TREATMENT ───
  'express hair spa': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop&q=80',
  'moisturizing hair spa': 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=500&auto=format&fit=crop&q=80',
  'repairing hair spa': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80',
  'fibre clinix treatment': 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=500&auto=format&fit=crop&q=80',
  'anti-dandruff treatment': 'https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=500&auto=format&fit=crop&q=80',
  'anti-hair fall treatment': 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=500&auto=format&fit=crop&q=80',

  // ─── MASSAGE ───
  'head massage': 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=500&auto=format&fit=crop&q=80',
  'head oil massage': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500&auto=format&fit=crop&q=80',
  'head tonic massage': 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=500&auto=format&fit=crop&q=80',

  // ─── HAIR WASH & STYLING ───
  'head wash': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop&q=80',
  'hair wash & setting': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop&q=80',
  'hair styling': 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=500&auto=format&fit=crop&q=80',

  // ─── HAIR COLOR ───
  'straightening / smoothing': 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500&auto=format&fit=crop&q=80',
  'botox': 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=500&auto=format&fit=crop&q=80',
  'biotin': 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=500&auto=format&fit=crop&q=80',
  'grey coverage': 'https://images.unsplash.com/photo-1522337094346-2917730e7845?w=500&auto=format&fit=crop&q=80',
  'ammonia free grey coverage': 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=500&auto=format&fit=crop&q=80',
  'fashion colour': 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=500&auto=format&fit=crop&q=80',
  "l'oréal colour": 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=500&auto=format&fit=crop&q=80',
  'streaks colour': 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&auto=format&fit=crop&q=80',
  'crown colour': 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=500&auto=format&fit=crop&q=80',
  'normal hair black colour': 'https://images.unsplash.com/photo-1522337094346-2917730e7845?w=500&auto=format&fit=crop&q=80',

  // ─── WOMEN'S / UNISEX SERVICES ───
  'hair cut (women)': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop&q=80',
  'facial': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&auto=format&fit=crop&q=80',
  'clean up': 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=500&auto=format&fit=crop&q=80',
  'threading': 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=500&auto=format&fit=crop&q=80',
  'waxing': 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=500&auto=format&fit=crop&q=80',
  'manicure': 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&auto=format&fit=crop&q=80',
  'pedicure': 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=500&auto=format&fit=crop&q=80',
  'bleach': 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=500&auto=format&fit=crop&q=80',
  'bridal makeup': 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=500&auto=format&fit=crop&q=80',
  'party makeup': 'https://images.unsplash.com/photo-1526045478516-99145907023c?w=500&auto=format&fit=crop&q=80',
  'hair spa (women)': 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=500&auto=format&fit=crop&q=80',
  'keratin treatment': 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500&auto=format&fit=crop&q=80',
  'hair colour (women)': 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=500&auto=format&fit=crop&q=80',
  'global colour': 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&auto=format&fit=crop&q=80',
  'highlights': 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=500&auto=format&fit=crop&q=80',
  'hair straightening': 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500&auto=format&fit=crop&q=80',
  'hair smoothing': 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=500&auto=format&fit=crop&q=80',
  'd-tan': 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=500&auto=format&fit=crop&q=80',
};

const DISTINCT_IMAGE_POOL = [
  'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1512690459411-b9245aed614b?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1526045478516-99145907023c?w=500&auto=format&fit=crop&q=80',
];

function getServiceImage(name: string, index: number = 0): string {
  const key = name.toLowerCase().trim();
  if (DISTINCT_SERVICE_IMAGES[key]) {
    return DISTINCT_SERVICE_IMAGES[key];
  }
  // Try partial match
  for (const [k, url] of Object.entries(DISTINCT_SERVICE_IMAGES)) {
    if (key.includes(k) || k.includes(key)) return url;
  }
  // Fallback to deterministic item in image pool
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const idx = Math.abs(hash + index) % DISTINCT_IMAGE_POOL.length;
  return DISTINCT_IMAGE_POOL[idx];
}

const MEN_CATEGORIES = [
  'All',
  'Hair Cut & Shave',
  'Beard Grooming',
  'Facial & D-Tan',
  'Hair Spa & Massage',
  'Hair Color',
];

const WOMEN_CATEGORIES = [
  'All',
  'Hair Cut & Styling',
  'Facial & Clean Up',
  'Threading & Waxing',
  'Hair Spa & Treatment',
  'Bridal & Makeup',
  'Nails & Pedicure',
];

export default function AdminBillingPOSPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [posSection, setPosSection] = useState<'men' | 'women'>('men');

  // Service Management Modal state
  const [showServiceManager, setShowServiceManager] = useState(false);
  const [serviceCategories, setServiceCategories] = useState<Array<{id: string; name: string; gender?: string}>>([]);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [serviceFormMode, setServiceFormMode] = useState<'list' | 'add' | 'edit'>('list');
  const [serviceForm, setServiceForm] = useState({ name: '', price: '', duration: '', categoryId: '', description: '' });
  const [savingService, setSavingService] = useState(false);
  const [serviceManagerFilter, setServiceManagerFilter] = useState<'all' | 'men' | 'women'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchCustomer, setSearchCustomer] = useState('');
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);

  // Selected customer & anonymous walk-in flag
  const [isWalkInAnonymous, setIsWalkInAnonymous] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>({
    id: 'walkin-anonymous',
    name: 'Walk-in Guest',
    phone: 'Not Provided',
    status: 'walk-in',
    lastVisit: 'Today',
    totalSpent: 0,
  });

  // Current Cart / Bill - start clean for POS operations
  const [billItems, setBillItems] = useState<BillItem[]>([]);

  const [discount, setDiscount] = useState<number>(0);
  const [gstRate, setGstRate] = useState<number>(0); // 0 = No GST, 5, 12, 18, 28, or custom
  const [customGstInput, setCustomGstInput] = useState<string>('');
  const [isCustomGst, setIsCustomGst] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card' | 'other'>('cash');

  // Chair selection state
  const [chairs, setChairs] = useState<ChairOption[]>([]);
  const [selectedChairId, setSelectedChairId] = useState<string | null>(null);

  // Generate Bill Modal state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [sendWhatsApp, setSendWhatsApp] = useState(false);
  const [printPhysical, setPrintPhysical] = useState(true);
  const [billNotes, setBillNotes] = useState('');
  const [generatedBillNo, setGeneratedBillNo] = useState('HM-2025-06-0012');
  const [generatedDate, setGeneratedDate] = useState('');
  const [generatedTime, setGeneratedTime] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // ── Previous Bills & Reprint State ──
  const [showReprintModal, setShowReprintModal] = useState(false);
  const [reprintList, setReprintList] = useState<any[]>([]);
  const [reprintLoading, setReprintLoading] = useState(false);
  const [reprintSearch, setReprintSearch] = useState('');
  const [reprintFilter, setReprintFilter] = useState<'all' | 'today' | 'cash' | 'upi'>('all');
  const [reprintNotice, setReprintNotice] = useState<string | null>(null);
  const [lastCompletedBill, setLastCompletedBill] = useState<BillPrintData | null>(null);
  const [previewBill, setPreviewBill] = useState<BillPrintData | null>(null);

  // ── End of Day (EOD) Owner WhatsApp State ──
  const [showEodModal, setShowEodModal] = useState(false);
  const [eodLoading, setEodLoading] = useState(false);
  const [eodData, setEodData] = useState<any>(null);
  const [eodClosingNotes, setEodClosingNotes] = useState('');
  const [eodCopyNotice, setEodCopyNotice] = useState<string | null>(null);

  // New Client Modal (Phone only required)
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [newClientForm, setNewClientForm] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    status: 'new',
    notes: '',
  });

  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadInitialData();
    const now = new Date();
    setGeneratedDate(now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }));
    setGeneratedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const loadInitialData = async () => {
    try {
      const [srvRes, custRes, chairRes] = await Promise.all([
        fetch('/api/services'),
        fetch('/api/customers'),
        fetch('/api/chairs'),
      ]);

      if (srvRes.ok) {
        const srvData = await srvRes.json();
        const loadedServices: ServiceItem[] = srvData.services || [];
        setServices(loadedServices);
        if (srvData.categories) setServiceCategories(srvData.categories);
      }

      if (custRes.ok) {
        const custData = await custRes.json();
        setCustomers(custData || []);
        if (custData && custData.length > 0) {
          setSelectedCustomer(custData[0]);
        }
      }

      if (chairRes.ok) {
        const chairData = await chairRes.json();
        setChairs(chairData.filter((c: ChairOption) => c.active));
      }

      // Pre-load latest invoice for instant 1-click reprint
      try {
        const invRes = await fetch('/api/invoices?limit=1');
        if (invRes.ok) {
          const invData = await invRes.json();
          if (Array.isArray(invData) && invData.length > 0) {
            setLastCompletedBill(convertInvoiceToPrintData(invData[0]));
          }
        }
      } catch (e) {}
    } catch (err) {
      console.error('Failed to load POS data:', err);
    }
  };

  // ── Service Management CRUD ──
  const handleOpenServiceManager = () => {
    setServiceFormMode('list');
    setEditingService(null);
    setServiceForm({ name: '', price: '', duration: '', categoryId: '', description: '' });
    setShowServiceManager(true);
  };

  const handleStartAddService = () => {
    setEditingService(null);
    setServiceForm({ name: '', price: '', duration: '', categoryId: serviceCategories[0]?.id || '', description: '' });
    setServiceFormMode('add');
  };

  const handleStartEditService = (s: ServiceItem) => {
    setEditingService(s);
    setServiceForm({
      name: s.name,
      price: String(s.price || 0),
      duration: String(s.duration || ''),
      categoryId: s.category?.id || (s as any).categoryId || '',
      description: (s as any).description || '',
    });
    setServiceFormMode('edit');
  };

  const handleSaveService = async () => {
    if (!serviceForm.name.trim() || !serviceForm.categoryId) {
      alert('Service name and category are required.');
      return;
    }
    setSavingService(true);
    try {
      const payload = {
        name: serviceForm.name.trim(),
        price: serviceForm.price,
        duration: serviceForm.duration || null,
        categoryId: serviceForm.categoryId,
        description: serviceForm.description || null,
      };

      if (serviceFormMode === 'edit' && editingService) {
        await fetch(`/api/services/${editingService.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      // Refresh services
      const res = await fetch('/api/services');
      if (res.ok) {
        const data = await res.json();
        setServices(data.services || []);
        if (data.categories) setServiceCategories(data.categories);
      }
      setServiceFormMode('list');
      setEditingService(null);
      setServiceForm({ name: '', price: '', duration: '', categoryId: '', description: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to save service.');
    } finally {
      setSavingService(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service? This cannot be undone.')) return;
    try {
      await fetch(`/api/services/${serviceId}`, { method: 'DELETE' });
      const res = await fetch('/api/services');
      if (res.ok) {
        const data = await res.json();
        setServices(data.services || []);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete service.');
    }
  };

  // Add Service to Bill with distinct image
  const handleAddService = (service: ServiceItem, index: number) => {
    const img = service.image || getServiceImage(service.name, index);

    setBillItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.serviceId === service.id);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx].quantity += 1;
        return copy;
      }
      return [
        ...prev,
        {
          serviceId: service.id,
          name: service.name,
          price: service.price,
          quantity: 1,
          image: img,
        },
      ];
    });
  };

  // Update item quantity
  const handleUpdateQty = (index: number, delta: number) => {
    setBillItems((prev) => {
      const copy = [...prev];
      const newQty = copy[index].quantity + delta;
      if (newQty <= 0) {
        return copy.filter((_, i) => i !== index);
      }
      copy[index].quantity = newQty;
      return copy;
    });
  };

  // Remove item
  const handleRemoveItem = (index: number) => {
    setBillItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear bill
  const handleClearBill = () => {
    setBillItems([]);
    setDiscount(0);
    setGstRate(0);
    setCustomGstInput('');
    setIsCustomGst(false);
    setSelectedChairId(null);
  };

  // Calculations with precise numbers
  const subtotal = billItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const taxableAmount = Math.max(0, subtotal - discount);
  const taxAmount = gstRate > 0 ? Math.round((taxableAmount * gstRate) / 100) : 0;
  const totalAmount = Math.max(0, taxableAmount + taxAmount);

  // Men & Women service partition helpers
  const isMenService = (s: ServiceItem) => {
    const g = s.category?.gender?.toLowerCase();
    if (g === 'men') return true;
    if (g === 'women') return false;
    const name = s.name.toLowerCase();
    if (name.includes('(men)') || name.includes('beard') || name.includes('shave')) return true;
    if (
      name.includes('(women)') ||
      name.includes('threading') ||
      name.includes('waxing') ||
      name.includes('clean up') ||
      name.includes('bridal') ||
      name.includes('makeup') ||
      name.includes('pedicure') ||
      name.includes('manicure') ||
      name.includes('keratin') ||
      name.includes('smoothing') ||
      name.includes('bleach')
    )
      return false;
    return true; // Unisex services like Hair Spa, Facial, Head Massage appear in both
  };

  const isWomenService = (s: ServiceItem) => {
    const g = s.category?.gender?.toLowerCase();
    if (g === 'women') return true;
    if (g === 'men') return false;
    const name = s.name.toLowerCase();
    if (
      name.includes('(women)') ||
      name.includes('threading') ||
      name.includes('waxing') ||
      name.includes('clean up') ||
      name.includes('bridal') ||
      name.includes('makeup') ||
      name.includes('pedicure') ||
      name.includes('manicure') ||
      name.includes('keratin') ||
      name.includes('smoothing') ||
      name.includes('bleach')
    )
      return true;
    if (name.includes('(men)') || name.includes('beard') || name.includes('shave')) return false;
    return true; // Unisex services appear in both
  };

  const menServices = services.filter(isMenService);
  const womenServices = services.filter(isWomenService);
  const activeSectionServices = posSection === 'men' ? menServices : womenServices;

  const currentCategories = posSection === 'men' ? MEN_CATEGORIES : WOMEN_CATEGORIES;

  // Filtered services
  const filteredServices = activeSectionServices.filter((s) => {
    if (selectedCategory === 'All') return true;
    const name = s.name.toLowerCase();
    const cat = (s.category?.name || s.categoryName || '').toLowerCase();

    if (posSection === 'men') {
      if (selectedCategory === 'Hair Cut & Shave')
        return name.includes('cut') || name.includes('shav') || name.includes('hair') || cat.includes('cut');
      if (selectedCategory === 'Beard Grooming')
        return name.includes('beard') || name.includes('trim') || name.includes('shav');
      if (selectedCategory === 'Facial & D-Tan')
        return name.includes('facial') || name.includes('tan') || name.includes('skin') || name.includes('clean');
      if (selectedCategory === 'Hair Spa & Massage')
        return name.includes('spa') || name.includes('massag') || name.includes('dandruff') || name.includes('fall');
      if (selectedCategory === 'Hair Color')
        return name.includes('color') || name.includes('colour') || name.includes('streak') || name.includes('highlight');
    } else if (posSection === 'women') {
      if (selectedCategory === 'Hair Cut & Styling')
        return name.includes('cut') || name.includes('style') || name.includes('wash') || name.includes('blow') || name.includes('hair');
      if (selectedCategory === 'Facial & Clean Up')
        return name.includes('facial') || name.includes('clean') || name.includes('skin') || name.includes('glow') || name.includes('bleach');
      if (selectedCategory === 'Threading & Waxing')
        return name.includes('thread') || name.includes('wax');
      if (selectedCategory === 'Hair Spa & Treatment')
        return name.includes('spa') || name.includes('keratin') || name.includes('botox') || name.includes('smoothing') || name.includes('treatment') || name.includes('fibre');
      if (selectedCategory === 'Bridal & Makeup')
        return name.includes('bridal') || name.includes('makeup') || name.includes('party');
      if (selectedCategory === 'Nails & Pedicure')
        return name.includes('pedicure') || name.includes('manicure') || name.includes('nail');
    }
    return cat.includes(selectedCategory.toLowerCase()) || name.includes(selectedCategory.toLowerCase());
  });

  // Services filtered for service manager modal
  const managerFilteredServices = serviceManagerFilter === 'all'
    ? services
    : serviceManagerFilter === 'men'
    ? menServices
    : womenServices;

  // Customer search suggestions (search by phone or name)
  const filteredCustomers = searchCustomer.trim()
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
          c.phone.includes(searchCustomer)
      )
    : [];

  const handleSelectCustomer = (c: Customer) => {
    setSelectedCustomer(c);
    setIsWalkInAnonymous(false);
    setSearchCustomer('');
    setIsSearchingCustomer(false);
  };

  // Option to proceed without customer details (Walk-in / Anonymous)
  const handleSetAnonymousWalkIn = () => {
    setIsWalkInAnonymous(true);
    setSelectedCustomer({
      id: 'walkin-anonymous',
      name: 'Walk-in Guest',
      phone: 'Not Provided',
      status: 'walk-in',
      lastVisit: 'Today',
      totalSpent: 0,
    });
    setSearchCustomer('');
    setIsSearchingCustomer(false);
  };

  // Create New Client - only contact number is required!
  const handleCreateNewClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientForm.phone || !newClientForm.phone.trim()) {
      alert('Please enter client contact number.');
      return;
    }

    try {
      const cleanPhone = newClientForm.phone.trim();
      const digits = cleanPhone.replace(/\D/g, '');
      const derivedName =
        newClientForm.name && newClientForm.name.trim()
          ? newClientForm.name.trim()
          : digits.length >= 4
          ? `Client ${digits.slice(-4)}`
          : `Client ${cleanPhone}`;

      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: derivedName,
          phone: cleanPhone,
          whatsapp: newClientForm.whatsapp || cleanPhone,
          status: newClientForm.status || 'new',
          notes: newClientForm.notes,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setSelectedCustomer({
          id: created.id,
          name: created.name,
          phone: created.phone,
          status: created.status || 'new',
          lastVisit: 'Today',
          totalSpent: 0,
        });
        setIsWalkInAnonymous(false);
        setCustomers((prev) => [created, ...prev.filter((c) => c.id !== created.id)]);
        setShowNewClientModal(false);
        setNewClientForm({ name: '', phone: '', whatsapp: '', status: 'new', notes: '' });
        setSuccessNotice(`Client ${created.phone} attached to bill!`);
        setTimeout(() => setSuccessNotice(null), 3000);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save customer');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating client. Please try again.');
    }
  };

  // Open Generate Bill Modal
  const handleOpenGenerateBill = () => {
    if (billItems.length === 0) return;
    if (!selectedChairId) {
      alert('Please select a chair before generating the bill.');
      return;
    }
    const now = new Date();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setGeneratedBillNo(`HM-2025-06-${randomNum}`);
    setGeneratedDate(now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }));
    setGeneratedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setShowGenerateModal(true);
  };

  // Derived chair info
  const selectedChair = chairs.find(c => c.id === selectedChairId);
  const menChairs = chairs.filter(c => c.section === 'men');
  const womenChairs = chairs.filter(c => c.section === 'women');

  // EZO 58mm Printer Hardware State
  const [printerStatus, setPrinterStatus] = useState<'ready' | 'bluetooth' | 'serial'>('ready');
  const [printerDeviceName, setPrinterDeviceName] = useState<string>('EZO 58mm Portable');
  const [connectingPrinter, setConnectingPrinter] = useState(false);
  const [printerNotice, setPrinterNotice] = useState<string | null>(null);
  const [isAndroidNative, setIsAndroidNative] = useState(false);

  // Auto-detect native Android and saved printer on billing page mount
  useEffect(() => {
    async function checkNative() {
      try {
        const bt = await import('@/lib/bluetoothPrinter');
        if (bt.isNativeBluetoothAvailable()) {
          setIsAndroidNative(true);
          const saved = bt.getSavedPrinterAddress();
          if (saved) {
            const status = await bt.getPrinterStatus();
            if (status.status === 'connected') {
              setPrinterStatus('bluetooth');
              setPrinterDeviceName(status.deviceName || saved.name);
            } else {
              // Try connecting to saved printer automatically
              const conn = await bt.connectBluetoothPrinter(saved.address);
              if (conn.success) {
                setPrinterStatus('bluetooth');
                setPrinterDeviceName(conn.deviceName || saved.name);
              }
            }
          }
        }
      } catch {}
    }
    checkNative();
  }, []);

  // Connect EZO via Bluetooth (Android Native or Web Bluetooth)
  const handleConnectBluetooth = async () => {
    setConnectingPrinter(true);
    setPrinterNotice(null);

    if (isAndroidNative) {
      try {
        const bt = await import('@/lib/bluetoothPrinter');
        const avail = await bt.checkBluetoothAvailability();
        if (!avail.available || !avail.enabled) {
          setPrinterNotice('Please turn on Bluetooth in tablet settings.');
          setConnectingPrinter(false);
          return;
        }
        if (!avail.hasPermission) {
          const perm = await bt.requestBluetoothPermissions();
          if (!perm.granted) {
            setPrinterNotice('Bluetooth permission denied.');
            setConnectingPrinter(false);
            return;
          }
        }
        const list = await bt.listBluetoothPrinters();
        if (list.success && list.devices.length > 0) {
          const target = list.devices.find((d) => d.isPrinter) || list.devices[0];
          const conn = await bt.connectBluetoothPrinter(target.address);
          if (conn.success) {
            setPrinterStatus('bluetooth');
            setPrinterDeviceName(conn.deviceName || target.name);
            bt.savePrinterAddress(target.address, target.name);
            setPrinterNotice(`Connected to ${conn.deviceName || target.name}!`);
          } else {
            setPrinterNotice(conn.error || 'Connection failed.');
          }
        } else {
          setPrinterNotice('No paired printer found. Please pair in Android Settings.');
        }
      } catch (e: any) {
        setPrinterNotice(e.message || 'Bluetooth connection failed');
      }
      setConnectingPrinter(false);
      return;
    }

    try {
      const res = await connectEzoBluetooth();
      if (res.success) {
        setPrinterStatus('bluetooth');
        setPrinterDeviceName(res.deviceName || 'EZO 58mm (Bluetooth)');
        setPrinterNotice(`Connected to ${res.deviceName || 'EZO Bluetooth'}!`);
      } else {
        setPrinterNotice(res.error || 'Bluetooth pairing cancelled');
      }
    } catch (e: any) {
      setPrinterNotice(e.message || 'Bluetooth connection failed');
    } finally {
      setConnectingPrinter(false);
    }
  };

  // Connect EZO via USB Serial
  const handleConnectUSB = async () => {
    setConnectingPrinter(true);
    setPrinterNotice(null);
    try {
      const res = await connectEzoSerial();
      if (res.success) {
        setPrinterStatus('serial');
        setPrinterDeviceName('EZO 58mm (USB Serial)');
        setPrinterNotice('Connected via USB Serial Cable!');
      } else {
        setPrinterNotice(res.error || 'USB Serial connection failed');
      }
    } catch (e: any) {
      setPrinterNotice(e.message || 'Serial connection failed');
    } finally {
      setConnectingPrinter(false);
    }
  };

  // Test Print to EZO Printer
  const handleTestPrint = async () => {
    try {
      const testBytes = generateTestSlipBytes();
      const sent = await sendRawBytesToPrinter(testBytes);
      if (sent) {
        setPrinterNotice('Test slip printed via hardware connection!');
      } else {
        printVia58mmWindow({
          billNo: 'HM-TEST-58MM',
          date: generatedDate,
          time: generatedTime,
          customerName: 'Diagnostic Slip',
          items: [{ name: 'EZO 58mm Test Receipt', quantity: 1, price: 0 }],
          subtotal: 0,
          discount: 0,
          total: 0,
          paymentMethod: 'TEST OK',
        });
        setPrinterNotice('Test receipt sent to 58mm print driver!');
      }
    } catch (e: any) {
      alert('Test print error: ' + e.message);
    }
  };

  // Thermal Print trigger (Sends directly to EZO 58mm printer)
  const triggerThermalPrint = async () => {
    try {
      await printBillToEzoPrinter({
        billNo: generatedBillNo,
        date: generatedDate,
        time: generatedTime,
        customerName: isWalkInAnonymous ? 'Walk-in Guest' : selectedCustomer.name,
        customerPhone: isWalkInAnonymous ? 'Not Provided' : selectedCustomer.phone,
        items: billItems.map((b) => ({
          name: b.name,
          quantity: b.quantity,
          price: b.price,
        })),
        subtotal,
        discount,
        tax: taxAmount > 0 ? taxAmount : undefined,
        taxRate: gstRate > 0 ? gstRate : undefined,
        total: totalAmount,
        paymentMethod,
        notes: billNotes,
      });
    } catch (err) {
      console.error(err);
      window.print();
    }
  };

  // Trigger WhatsApp Bill
  const triggerWhatsAppBill = () => {
    if (isWalkInAnonymous || selectedCustomer.phone === 'Not Provided') {
      alert('Cannot send WhatsApp bill: Customer chose not to share contact number.');
      return;
    }
    const phone = selectedCustomer.phone.replace(/[^0-9]/g, '');
    if (!phone) {
      alert('Valid phone number not found for WhatsApp.');
      return;
    }
    const itemList = billItems
      .map((item) => `• ${item.name} x${item.quantity} = ₹${item.price * item.quantity}`)
      .join('\n');

    const message =
      `*HAIR MART STUDIO — SURATHKAL*\n` +
      `Bill No: ${generatedBillNo}\n` +
      `Date: ${generatedDate} ${generatedTime}\n` +
      `Customer: ${selectedCustomer.name}\n` +
      `Phone: ${selectedCustomer.phone}\n\n` +
      `*Services:*\n${itemList}\n\n` +
      `Subtotal: ₹${subtotal}\n` +
      (discount > 0 ? `Discount: ₹${discount}\n` : '') +
      (taxAmount > 0 ? `GST (${gstRate}%): +₹${taxAmount}\n` : '') +
      `*Total Amount: ₹${totalAmount}* (${paymentMethod.toUpperCase()})\n\n` +
      `Thank you for visiting HairMart! Keep looking good, always. ✨`;

    const url = `https://wa.me/${phone.startsWith('91') ? phone : '91' + phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Complete & Store Bill in Database
  const handleCompleteBill = async () => {
    setIsProcessing(true);
    try {
      const apptRes = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: isWalkInAnonymous ? 'Walk-in Guest' : selectedCustomer.name,
          customerPhone: isWalkInAnonymous ? 'Not Provided' : selectedCustomer.phone,
          customerWhatsapp: isWalkInAnonymous ? null : selectedCustomer.phone,
          customerNote: billNotes,
          chairId: selectedChairId,
          date: new Date().toISOString(),
          time: generatedTime,
          status: 'completed',
          isWalkIn: isWalkInAnonymous,
          items: billItems.map((item) => ({
            serviceId: item.serviceId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });

      if (apptRes.ok) {
        const apptData = await apptRes.json();

        await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appointmentId: apptData.id,
            amount: totalAmount,
            subtotal,
            discount,
            tax: taxAmount,
            method: paymentMethod,
            status: 'completed',
            printReceipt: printPhysical,
            whatsappStatus: sendWhatsApp && !isWalkInAnonymous ? 'sent' : 'not_requested',
            notes: billNotes,
            itemsJson: JSON.stringify(billItems),
          }),
        });

        if (printPhysical) {
          triggerThermalPrint();
        }

        if (sendWhatsApp && !isWalkInAnonymous) {
          triggerWhatsAppBill();
        }

        const billSnapshot: BillPrintData = {
          billNo: generatedBillNo,
          date: generatedDate,
          time: generatedTime,
          customerName: isWalkInAnonymous ? 'Walk-in Guest' : selectedCustomer.name,
          customerPhone: isWalkInAnonymous ? undefined : selectedCustomer.phone,
          items: billItems.map((b) => ({
            name: b.name,
            quantity: b.quantity,
            price: b.price,
          })),
          subtotal,
          discount,
          tax: taxAmount > 0 ? taxAmount : undefined,
          taxRate: gstRate > 0 ? gstRate : undefined,
          total: totalAmount,
          paymentMethod: paymentMethod.toUpperCase(),
          notes: billNotes,
        };
        setLastCompletedBill(billSnapshot);

        setSuccessNotice(`Bill #${generatedBillNo} generated successfully!`);
        setShowGenerateModal(false);
        handleClearBill();
        setTimeout(() => setSuccessNotice(null), 4000);
      } else {
        const err = await apptRes.json();
        alert(err.error || 'Failed to create bill. Please check inputs.');
      }
    } catch (err) {
      console.error(err);
      alert('Error generating bill. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Convert Stored Invoice to Universal Thermal Print Data ──
  const convertInvoiceToPrintData = (inv: any): BillPrintData => {
    let items: Array<{ name: string; quantity: number; price: number }> = [];
    if (inv.itemsJson) {
      try {
        const parsed = JSON.parse(inv.itemsJson);
        if (Array.isArray(parsed)) {
          items = parsed.map((it: any) => ({
            name: it.name || 'Salon Service',
            quantity: Number(it.quantity) || 1,
            price: Number(it.price) || 0,
          }));
        }
      } catch (e) {}
    }
    if (items.length === 0 && inv.appointment?.services) {
      items = inv.appointment.services.map((s: any) => ({
        name: s.service?.name || s.name || 'Salon Service',
        quantity: Number(s.quantity) || 1,
        price: Number(s.price) || 0,
      }));
    }
    if (items.length === 0) {
      items = [{ name: 'Salon Service', quantity: 1, price: Number(inv.total) || 0 }];
    }

    const d = new Date(inv.createdAt);
    const formattedDate = d.toLocaleDateString('en-GB', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const formattedTime = inv.appointment?.time || d.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const custName = inv.customer?.name || inv.appointment?.customerName || 'Walk-in Guest';
    const custPhone = inv.customer?.phone || inv.appointment?.customerPhone || undefined;

    return {
      billNo: inv.invoiceNumber || 'HM-BILL',
      date: formattedDate,
      time: formattedTime,
      customerName: custName,
      customerPhone: custPhone === 'Not Provided' ? undefined : custPhone,
      items,
      subtotal: Number(inv.subtotal) || Number(inv.total) || 0,
      discount: Number(inv.discount) || 0,
      tax: inv.tax !== undefined && inv.tax !== null && Number(inv.tax) > 0 ? Number(inv.tax) : undefined,
      total: Number(inv.total) || 0,
      paymentMethod: (inv.paymentMethod || 'cash').toUpperCase(),
      notes: inv.notes || undefined,
    };
  };

  // ── Open Previous Bills Modal ──
  const openReprintModal = async (searchQuery = '') => {
    setShowReprintModal(true);
    setReprintLoading(true);
    setReprintNotice(null);
    try {
      const q = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
      const res = await fetch(`/api/invoices?limit=50${q}`);
      if (res.ok) {
        const data = await res.json();
        setReprintList(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to load previous bills:', e);
    } finally {
      setReprintLoading(false);
    }
  };

  // ── Thermal Reprint Handler (Universal EZO 58mm) ──
  const handleReprintInvoice = async (invOrPrintData: any) => {
    try {
      const printData: BillPrintData = invOrPrintData.items
        ? (invOrPrintData as BillPrintData)
        : convertInvoiceToPrintData(invOrPrintData);

      setReprintNotice(`Printing Bill #${printData.billNo}...`);
      await printBillToEzoPrinter(printData);
      setReprintNotice(`✅ Bill #${printData.billNo} sent to 58mm printer!`);
      setTimeout(() => setReprintNotice(null), 3500);
    } catch (err: any) {
      console.error('Reprint failed:', err);
      alert('Reprint failed: ' + (err.message || 'Unknown error'));
    }
  };

  // ── Quick Reprint Last Generated Bill ──
  const handleQuickReprintLastBill = async () => {
    if (lastCompletedBill) {
      await handleReprintInvoice(lastCompletedBill);
    } else {
      openReprintModal();
    }
  };

  // ── WhatsApp Previous Bill ──
  const handleWhatsAppPreviousBill = (inv: any) => {
    const printData = convertInvoiceToPrintData(inv);
    if (!printData.customerPhone || printData.customerPhone === 'Not Provided') {
      alert('Cannot send WhatsApp: Customer contact number was not provided for this bill.');
      return;
    }
    const phone = printData.customerPhone.replace(/[^0-9]/g, '');
    if (!phone) {
      alert('Valid phone number not found.');
      return;
    }
    const itemList = printData.items
      .map((item) => `• ${item.name} x${item.quantity} = ₹${item.price * item.quantity}`)
      .join('\n');

    const message =
      `*HAIR MART STUDIO — SURATHKAL*\n` +
      `*(DUPLICATE / REPRINT BILL)*\n` +
      `Bill No: ${printData.billNo}\n` +
      `Date: ${printData.date} ${printData.time}\n` +
      `Customer: ${printData.customerName}\n\n` +
      `*Services:*\n${itemList}\n\n` +
      `Subtotal: ₹${printData.subtotal}\n` +
      (printData.discount > 0 ? `Discount: ₹${printData.discount}\n` : '') +
      (printData.tax && printData.tax > 0 ? `GST${printData.taxRate ? ` (${printData.taxRate}%)` : ''}: +₹${printData.tax}\n` : '') +
      `*Total Amount: ₹${printData.total}* (${printData.paymentMethod})\n\n` +
      `Thank you for visiting HairMart! Keep looking good, always. ✨`;

    const url = `https://wa.me/${phone.startsWith('91') ? phone : '91' + phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // ── End of Day (EOD) Report Handlers ──
  const openEodModal = async () => {
    setShowEodModal(true);
    setEodLoading(true);
    setEodCopyNotice(null);
    try {
      const res = await fetch('/api/reports/end-of-day');
      if (res.ok) {
        const json = await res.json();
        setEodData(json);
      }
    } catch (e) {
      console.error('Failed to load EOD data:', e);
    } finally {
      setEodLoading(false);
    }
  };

  const handleSendEodToOwner = async () => {
    if (!eodData) return;
    try {
      if (eodClosingNotes.trim()) {
        const res = await fetch('/api/reports/end-of-day', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ closingNotes: eodClosingNotes }),
        });
        if (res.ok) {
          const updated = await res.json();
          window.open(updated.whatsappUrl, '_blank');
          setShowEodModal(false);
          return;
        }
      }
      window.open(eodData.whatsappUrl, '_blank');
      setShowEodModal(false);
    } catch (e: any) {
      alert('Could not open WhatsApp for owner: ' + e.message);
    }
  };

  const handleCopyEodReport = () => {
    if (!eodData?.reportMessage) return;
    navigator.clipboard.writeText(eodData.reportMessage);
    setEodCopyNotice('✅ EOD Report copied to clipboard! Paste directly into WhatsApp.');
    setTimeout(() => setEodCopyNotice(null), 4000);
  };

  return (
    <div>
      {/* Notice Banner */}
      {successNotice && (
        <div
          style={{
            background: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid #22C55E',
            color: '#4ADE80',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>✅</span>
          <span style={{ fontWeight: 600 }}>{successNotice}</span>
        </div>
      )}

      {/* POS Top Utility Bar: Quick Reprint & Previous Bills & Hardware Status */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(20, 24, 33, 0.95), rgba(13, 17, 26, 0.95))',
          border: '1px solid rgba(212, 175, 55, 0.22)',
          borderRadius: '12px',
          padding: '12px 18px',
          marginBottom: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Send End of Day Bills to Owner WhatsApp Button */}
          <button
            type="button"
            onClick={openEodModal}
            style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.22), rgba(34, 197, 94, 0.08))',
              border: '1px solid rgba(34, 197, 94, 0.5)',
              color: '#4ADE80',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
            title="Compile all today's bills, revenue, and staff attendance to send to owner WhatsApp (9035959286)"
          >
            <span>📲</span>
            <span>Send EOD to Owner (WhatsApp)</span>
          </button>

          {/* Manage Services Button */}
          <button
            type="button"
            onClick={() => setShowServiceManager(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#CBD5E1',
              padding: '8px 14px',
              borderRadius: '8px',
              fontWeight: 500,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>📋</span>
            <span>Manage Services</span>
          </button>
        </div>


      </div>

      {/* POS Layout: Services Grid (Left) + Current Bill with Customer Search (Right) */}
      <div className="pos-layout-grid">
        {/* Left Column: Select Services */}
        <div>
          {/* Two-Section Switcher: Men & Women */}
          <div className="pos-gender-switch-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <button
              type="button"
              className={`pos-gender-switch-btn ${posSection === 'men' ? 'active' : ''}`}
              onClick={() => {
                setPosSection('men');
                setSelectedCategory('All');
              }}
            >
              <div className="pos-gender-switch-icon">🧔</div>
              <div className="pos-gender-switch-text">
                <span className="pos-gender-switch-title">MEN'S SALON</span>
                <span className="pos-gender-switch-sub">Haircuts, Grooming &amp; Spa</span>
              </div>
              <span className="pos-gender-count-badge">{menServices.length} Services</span>
            </button>

            <button
              type="button"
              className={`pos-gender-switch-btn ${posSection === 'women' ? 'active' : ''}`}
              onClick={() => {
                setPosSection('women');
                setSelectedCategory('All');
              }}
            >
              <div className="pos-gender-switch-icon">👩</div>
              <div className="pos-gender-switch-text">
                <span className="pos-gender-switch-title">WOMEN'S SALON</span>
                <span className="pos-gender-switch-sub">Styling, Facial &amp; Care</span>
              </div>
              <span className="pos-gender-count-badge">{womenServices.length} Services</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
              {posSection === 'men' ? "Men's Services Catalogue" : "Women's Services Catalogue"}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {filteredServices.length} services
              </span>
              <button
                type="button"
                onClick={handleOpenServiceManager}
                style={{
                  background: 'rgba(212, 175, 55, 0.15)',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  color: 'var(--gold-400)',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.2s',
                }}
              >
                ✏️ Edit Services
              </button>
            </div>
          </div>

          {/* Subcategory Tabs */}
          <div className="pos-category-tabs">
            {currentCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`pos-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Service Image Cards Grid */}
          <div className="pos-services-grid">
            {filteredServices.map((service, idx) => {
              const serviceImg = service.image || getServiceImage(service.name, idx);
              return (
                <div
                  key={service.id}
                  className="pos-service-card"
                  onClick={() => handleAddService(service, idx)}
                >
                  <div className="pos-service-img-wrapper">
                    <img
                      src={serviceImg}
                      alt={service.name}
                      className="pos-service-img"
                      loading="lazy"
                    />
                    <div className="pos-service-overlay"></div>
                  </div>
                  <div className="pos-service-info">
                    <div className="pos-service-text">
                      <div className="pos-service-name" title={service.name}>
                        {service.name}
                      </div>
                      <div className="pos-service-price">₹{service.price}</div>
                    </div>
                    <button
                      type="button"
                      className="pos-service-add-btn"
                      title={`Add ${service.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddService(service, idx);
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Current Bill with Customer Lookup at the TOP */}
        <div>
          {/* ── Chair Selection (Required) ── */}
          <div className="pos-chair-selection-card">
            <div className="pos-chair-header">
              <span className="pos-chair-title">🪑 Select Chair</span>
              {selectedChair && (
                <span className="pos-chair-active-badge">
                  {selectedChair.section === 'men' ? '🧔' : '👩'} {selectedChair.name}
                </span>
              )}
            </div>

            {menChairs.length > 0 && (
              <div className="pos-chair-section">
                <div className="pos-chair-section-label">Men's Section</div>
                <div className="pos-chair-buttons">
                  {menChairs.map((chair) => (
                    <button
                      key={chair.id}
                      type="button"
                      className={`pos-chair-btn ${selectedChairId === chair.id ? 'active' : ''}`}
                      onClick={() => setSelectedChairId(chair.id)}
                    >
                      <span className="pos-chair-btn-name">{chair.name}</span>
                      {chair.assignedStaff && (
                        <span className="pos-chair-btn-staff">{chair.assignedStaff.name}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {womenChairs.length > 0 && (
              <div className="pos-chair-section">
                <div className="pos-chair-section-label">Women's Section</div>
                <div className="pos-chair-buttons">
                  {womenChairs.map((chair) => (
                    <button
                      key={chair.id}
                      type="button"
                      className={`pos-chair-btn women ${selectedChairId === chair.id ? 'active' : ''}`}
                      onClick={() => setSelectedChairId(chair.id)}
                    >
                      <span className="pos-chair-btn-name">{chair.name}</span>
                      {chair.assignedStaff && (
                        <span className="pos-chair-btn-staff">{chair.assignedStaff.name}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chairs.length === 0 && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>
                No chairs configured. <a href="/admin/chairs" style={{ color: 'var(--gold-400)' }}>Set up chairs</a>
              </div>
            )}
          </div>

          <div className="pos-current-bill-card">
            {/* ── TOP OF CURRENT BILL: Customer Search Bar & Client Selection ── */}
            <div className="pos-bill-client-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="pos-bill-title">Current Bill</span>
                  {lastCompletedBill && (
                    <button
                      type="button"
                      onClick={handleQuickReprintLastBill}
                      style={{
                        background: 'rgba(212, 175, 55, 0.12)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        color: 'var(--gold-400)',
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                      title="Quickly reprint the last generated bill"
                    >
                      ↺ Last #{lastCompletedBill.billNo.slice(-6)}
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => openReprintModal()}
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#E2E8F0',
                      fontSize: '11px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    title="Find and reprint any previous bill"
                  >
                    🧾 Previous Bills
                  </button>
                  <button
                    type="button"
                    className="pos-bill-clear-btn"
                    onClick={handleClearBill}
                    title="Clear items in cart"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Customer Search Bar directly in Current Bill */}
              <div style={{ position: 'relative', marginBottom: '8px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#090B10',
                    border: '1px solid rgba(212, 175, 55, 0.25)',
                    borderRadius: '6px',
                    padding: '0 10px',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)', marginRight: '6px', fontSize: '13px' }}>🔍</span>
                  <input
                    type="text"
                    placeholder="Search client by contact or name..."
                    value={searchCustomer}
                    onChange={(e) => {
                      setSearchCustomer(e.target.value);
                      setIsSearchingCustomer(true);
                    }}
                    onFocus={() => setIsSearchingCustomer(true)}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      color: '#FFF',
                      padding: '8px 0',
                      fontSize: '12.5px',
                      outline: 'none',
                    }}
                  />
                  {searchCustomer && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchCustomer('');
                        setIsSearchingCustomer(false);
                      }}
                      style={{ color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer', padding: '2px' }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Autocomplete Dropdown */}
                {isSearchingCustomer && searchCustomer.trim() && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: '#121723',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      borderRadius: '6px',
                      marginTop: '4px',
                      zIndex: 60,
                      maxHeight: '200px',
                      overflowY: 'auto',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.85)',
                    }}
                  >
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => handleSelectCustomer(c)}
                          style={{
                            padding: '8px 12px',
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, color: '#FFF', fontSize: '12.5px' }}>{c.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--gold-400)', fontVariantNumeric: 'tabular-nums' }}>
                              📞 {c.phone}
                            </div>
                          </div>
                          <span className={`pos-client-badge ${c.status || 'regular'}`}>
                            {c.status || 'Select'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '12px', fontSize: '11.5px', color: 'var(--text-muted)', textAlign: 'center' }}>
                        No client found. Click <b>+ New Client</b> to add by phone.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons: New Client (contact only) & Anonymous Walk-in */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setShowNewClientModal(true)}
                  style={{
                    fontSize: '11.5px',
                    padding: '5px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    fontWeight: 600,
                  }}
                >
                  <span>➕</span>
                  <span>New Client</span>
                </button>
                <button
                  type="button"
                  className={`btn btn-outline btn-sm ${isWalkInAnonymous ? 'btn-active-gold' : ''}`}
                  onClick={handleSetAnonymousWalkIn}
                  title="Proceed without asking for customer details"
                  style={{
                    fontSize: '11.5px',
                    padding: '5px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    fontWeight: 600,
                  }}
                >
                  <span>🚶</span>
                  <span>Walk-in / Skip Details</span>
                </button>
              </div>

              {/* Active Client Pill */}
              <div
                style={{
                  background: isWalkInAnonymous ? 'rgba(255, 255, 255, 0.04)' : 'rgba(212, 175, 55, 0.08)',
                  border: isWalkInAnonymous
                    ? '1px solid rgba(255, 255, 255, 0.1)'
                    : '1px solid rgba(212, 175, 55, 0.25)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: isWalkInAnonymous ? '#222734' : 'var(--gold-500)',
                      color: isWalkInAnonymous ? '#AAA' : '#0A0D14',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {isWalkInAnonymous ? '🚶' : selectedCustomer.name?.charAt(0).toUpperCase() || '👤'}
                  </div>
                  <div style={{ minWidth: 0, overflow: 'hidden' }}>
                    <div
                      style={{
                        fontSize: '12.5px',
                        fontWeight: 600,
                        color: '#FFF',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {isWalkInAnonymous ? 'Walk-in Guest (No Details)' : selectedCustomer.name}
                    </div>
                    {!isWalkInAnonymous && (
                      <div
                        style={{
                          fontSize: '11px',
                          color: 'var(--gold-400)',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {selectedCustomer.phone}
                      </div>
                    )}
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    background: isWalkInAnonymous ? 'rgba(255,255,255,0.08)' : 'rgba(212, 175, 55, 0.2)',
                    color: isWalkInAnonymous ? '#BBB' : 'var(--gold-400)',
                  }}
                >
                  {isWalkInAnonymous ? 'ANONYMOUS' : selectedCustomer.status || 'CLIENT'}
                </span>
              </div>
            </div>

            {/* ── Bill Line Items (Clean, without cluttered staff dropdowns) ── */}
            <div className="pos-bill-items-list">
              {billItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No services added.<br />Click on any service card on the left to add.
                </div>
              ) : (
                billItems.map((item, idx) => (
                  <div key={`${item.serviceId}-${idx}`} className="pos-bill-item-row-classic">
                    {/* Item Thumbnail */}
                    <img
                      src={item.image || DISTINCT_IMAGE_POOL[idx % DISTINCT_IMAGE_POOL.length]}
                      alt={item.name}
                      className="pos-item-thumb-classic"
                    />

                    {/* Item Info (Clean, classic luxury layout) */}
                    <div className="pos-item-info-classic">
                      <div className="pos-item-name-classic" title={item.name}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--gold-400)', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
                        ₹{item.price} each
                      </div>
                    </div>

                    {/* Quantity Stepper (Fixed-width centered alignment) */}
                    <div className="pos-item-qty-classic">
                      <button
                        type="button"
                        className="pos-qty-btn-classic"
                        onClick={() => handleUpdateQty(idx, -1)}
                        title="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="pos-qty-num-classic">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="pos-qty-btn-classic"
                        onClick={() => handleUpdateQty(idx, 1)}
                        title="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* Price & Remove (Fixed-width right aligned numbers) */}
                    <div className="pos-item-price-col-classic">
                      <span className="pos-item-amount-classic">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                      <button
                        type="button"
                        className="pos-item-del-btn-classic"
                        onClick={() => handleRemoveItem(idx)}
                        title="Remove service from bill"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ── Numeric Summary Section (Perfect Tabular Alignment) ── */}
            <div className="pos-bill-summary-box-classic">
              <div className="pos-summary-line-classic">
                <span>Subtotal</span>
                <span className="pos-num-aligned">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="pos-summary-line-classic">
                <span>Discount</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>₹</span>
                  <input
                    type="number"
                    min="0"
                    max={subtotal}
                    value={discount || ''}
                    placeholder="0"
                    onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                    className="pos-discount-input"
                  />
                </div>
              </div>

              {/* GST (Tax) Control */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '4px' }}>
                <div className="pos-summary-line-classic">
                  <span>GST (Tax)</span>
                  <span className="pos-num-aligned">
                    {gstRate > 0 ? `+₹${taxAmount.toLocaleString('en-IN')}` : '₹0 (0%)'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {[
                    { label: 'None (0%)', rate: 0 },
                    { label: '5%', rate: 5 },
                    { label: '12%', rate: 12 },
                    { label: '18%', rate: 18 },
                    { label: '28%', rate: 28 },
                  ].map((preset) => {
                    const isSelected = !isCustomGst && gstRate === preset.rate;
                    return (
                      <button
                        key={preset.rate}
                        type="button"
                        onClick={() => {
                          setIsCustomGst(false);
                          setGstRate(preset.rate);
                          setCustomGstInput('');
                        }}
                        style={{
                          padding: '3px 8px',
                          fontSize: '11px',
                          borderRadius: '4px',
                          border: '1px solid',
                          borderColor: isSelected ? 'var(--gold-400)' : 'rgba(255,255,255,0.12)',
                          background: isSelected ? 'rgba(212,175,55,0.22)' : 'rgba(255,255,255,0.03)',
                          color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontWeight: isSelected ? 700 : 500,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setIsCustomGst(true)}
                    style={{
                      padding: '3px 8px',
                      fontSize: '11px',
                      borderRadius: '4px',
                      border: '1px solid',
                      borderColor: isCustomGst ? 'var(--gold-400)' : 'rgba(255,255,255,0.12)',
                      background: isCustomGst ? 'rgba(212,175,55,0.22)' : 'rgba(255,255,255,0.03)',
                      color: isCustomGst ? '#FFFFFF' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontWeight: isCustomGst ? 700 : 500,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    Custom %
                  </button>
                </div>
                {isCustomGst && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '2px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Custom Rate:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      placeholder="e.g. 18"
                      value={customGstInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomGstInput(val);
                        setGstRate(Number(val) || 0);
                      }}
                      className="pos-discount-input"
                      style={{ width: '60px' }}
                    />
                    <span style={{ fontSize: '12px', color: '#FFF' }}>%</span>
                  </div>
                )}
              </div>

              <div className="pos-summary-total-classic">
                <span>Total</span>
                <span className="pos-total-aligned">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="pos-payment-selector">
              <div className="pos-payment-title">Payment Method</div>
              <div className="pos-payment-radios">
                {(['cash', 'upi', 'card', 'other'] as const).map((method) => (
                  <label
                    key={method}
                    className={`pos-payment-radio-label ${paymentMethod === method ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod(method)}
                  >
                    <input
                      type="radio"
                      name="posPaymentMethod"
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                      style={{ accentColor: 'var(--gold-400)' }}
                    />
                    <span style={{ textTransform: 'capitalize' }}>{method === 'upi' ? 'UPI' : method}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Generate Bill Button */}
            {!selectedChairId && billItems.length > 0 && (
              <div style={{ fontSize: '11.5px', color: '#F59E0B', textAlign: 'center', marginBottom: '8px', padding: '6px', background: 'rgba(245,158,11,0.08)', borderRadius: '6px', border: '1px solid rgba(245,158,11,0.2)' }}>
                ⚠️ Please select a chair above to generate the bill
              </div>
            )}
            <button
              type="button"
              className="pos-btn-generate"
              disabled={billItems.length === 0 || !selectedChairId}
              onClick={handleOpenGenerateBill}
            >
              Generate Bill {selectedChair ? `— ${selectedChair.section === 'men' ? '🧔' : '👩'} ${selectedChair.name}` : ''}
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          GENERATE BILL MODAL
         ═══════════════════════════════════════════════════════════════ */}
      {showGenerateModal && (
        <div className="thermal-modal-backdrop">
          <div className="thermal-modal-card">
            <div className="thermal-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  style={{ fontSize: '18px', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  ←
                </button>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                    Generate Bill
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Review bill details and choose how to share/print.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowGenerateModal(false)}
                style={{ color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div className="thermal-modal-body">
              {/* Left Column: 58mm Thermal Receipt Preview */}
              <div>
                <div ref={receiptRef} className="thermal-receipt-paper printable-receipt">
                  <div className="thermal-receipt-header">
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
                      <Logo size="sm" showText={false} />
                    </div>
                    <div className="thermal-receipt-logo-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '13px', fontWeight: 900, letterSpacing: '0.04em' }}>
                      HAIR MART STUDIO
                    </div>
                    <div className="thermal-receipt-subtitle" style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.12em', color: '#333' }}>
                      UNISEX FAMILY SALON
                    </div>
                    <div style={{ fontSize: '9px', color: '#555', marginTop: '2px' }}>Surathkal, Mangalore • Ph: 0824-4060938</div>
                  </div>

                  <div className="thermal-receipt-meta">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Bill No: <b>{generatedBillNo}</b></span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Date: {generatedDate}</span>
                      <span>Time: {generatedTime}</span>
                    </div>
                    {selectedChair && (
                      <div style={{ marginTop: '4px' }}>
                        Chair: <b>{selectedChair.section === 'men' ? 'Men' : 'Women'} — {selectedChair.name}</b>
                      </div>
                    )}
                    <div style={{ marginTop: '4px' }}>
                      Customer: <b>{isWalkInAnonymous ? 'Walk-in Guest' : selectedCustomer.name}</b>
                    </div>
                    {!isWalkInAnonymous && selectedCustomer.phone !== 'Not Provided' && (
                      <div>Phone: {selectedCustomer.phone}</div>
                    )}
                  </div>

                  <table className="thermal-receipt-table">
                    <thead>
                      <tr>
                        <th style={{ width: '55%' }}>Service</th>
                        <th style={{ width: '15%', textAlign: 'center' }}>Qty</th>
                        <th style={{ width: '30%', textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billItems.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600 }}>{item.name}</td>
                          <td style={{ textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{item.quantity}</td>
                          <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="thermal-receipt-totals">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Subtotal:</span>
                      <span style={{ fontVariantNumeric: 'tabular-nums' }}>₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    {discount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Discount:</span>
                        <span style={{ fontVariantNumeric: 'tabular-nums' }}>-₹{discount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {taxAmount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>GST ({gstRate}%):</span>
                        <span style={{ fontVariantNumeric: 'tabular-nums' }}>+₹{taxAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="thermal-receipt-grand-total">
                      <span>Total Amount</span>
                      <span style={{ fontVariantNumeric: 'tabular-nums' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#555', marginTop: '2px' }}>
                      Payment: {paymentMethod.toUpperCase()} (Recorded)
                    </div>
                  </div>

                  {/* Dynamic UPI Payment QR Code */}
                  <div style={{ textAlign: 'center', borderTop: '1px dashed #999', paddingTop: '10px', marginTop: '8px' }}>
                    <div style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#333' }}>Scan & Pay via UPI</div>
                    <div
                      style={{ display: 'flex', justifyContent: 'center', margin: '6px 0 4px' }}
                      dangerouslySetInnerHTML={{
                        __html: generateQrSvg(
                          generateHairMartUpiUrl(totalAmount, generatedBillNo),
                          120
                        ),
                      }}
                    />
                    <div style={{ fontWeight: 900, fontSize: '10.5px', letterSpacing: '0.3px', color: '#000' }}>
                      Scan To Pay ₹{totalAmount.toLocaleString('en-IN')} /-
                    </div>
                    <div style={{ fontSize: '8px', color: '#666', marginTop: '2px' }}>
                      UPI: {HAIR_MART_UPI_VPA}
                    </div>
                  </div>

                  <div className="thermal-receipt-footer">
                    <div>Thank you for visiting HairMart!</div>
                    <div style={{ fontWeight: 400, marginTop: '2px' }}>Keep looking good, always.</div>
                  </div>
                </div>

                {/* Quick actions directly below receipt */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '14px', maxWidth: '320px', margin: '14px auto 0' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1, fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    onClick={triggerThermalPrint}
                  >
                    <span>🖨️</span>
                    <span>Print Bill</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1, fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    onClick={triggerWhatsAppBill}
                    disabled={isWalkInAnonymous}
                  >
                    <span>💬</span>
                    <span>Send WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Independent Bill Options & Printer Hardware */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gold-400)', marginBottom: '12px' }}>
                  Bill Options
                </h4>

                {/* Toggle 1: WhatsApp Bill */}
                <div className="toggle-switch-card">
                  <div>
                    <div className="toggle-switch-title">Send WhatsApp Bill</div>
                    <div className="toggle-switch-desc">
                      {isWalkInAnonymous
                        ? 'Disabled: Walk-in guest without contact details'
                        : sendWhatsApp
                        ? `Customer will receive bill on WhatsApp (${selectedCustomer.phone})`
                        : 'WhatsApp sending disabled (Consent required)'}
                    </div>
                  </div>
                  <div
                    className={`switch-pill ${sendWhatsApp && !isWalkInAnonymous ? 'active' : ''}`}
                    onClick={() => {
                      if (!isWalkInAnonymous) setSendWhatsApp(!sendWhatsApp);
                    }}
                    style={{ opacity: isWalkInAnonymous ? 0.4 : 1, cursor: isWalkInAnonymous ? 'not-allowed' : 'pointer' }}
                  >
                    <div className="switch-handle"></div>
                  </div>
                </div>

                {/* Toggle 2: Physical Thermal Print */}
                <div className="toggle-switch-card">
                  <div>
                    <div className="toggle-switch-title">Print Physical Bill</div>
                    <div className="toggle-switch-desc">
                      Print using portable billing machine (EZO 58mm)
                    </div>
                  </div>
                  <div
                    className={`switch-pill ${printPhysical ? 'active' : ''}`}
                    onClick={() => setPrintPhysical(!printPhysical)}
                  >
                    <div className="switch-handle"></div>
                  </div>
                </div>

                {/* EZO 58mm Thermal Printer Hardware Card */}
                <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gold-400)', marginTop: '20px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>EZO 58mm Printer Machine</span>
                  <span style={{ fontSize: '10px', textTransform: 'none', color: 'var(--text-muted)' }}>58mm Roll / ESC-POS</span>
                </h4>

                <div
                  style={{
                    background: '#0D111A',
                    border: '1px solid rgba(246, 201, 38, 0.25)',
                    borderRadius: '10px',
                    padding: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          background: 'rgba(246, 201, 38, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                        }}
                      >
                        🖨️
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFF' }}>
                          {printerDeviceName}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: printerStatus !== 'ready' ? '#4ADE80' : 'var(--gold-400)', marginTop: '2px' }}>
                          <span
                            style={{
                              width: '7px',
                              height: '7px',
                              borderRadius: '50%',
                              background: printerStatus !== 'ready' ? '#22C55E' : 'var(--gold-400)',
                              display: 'inline-block',
                            }}
                          />
                          <span>
                            {printerStatus === 'bluetooth'
                              ? 'Wireless Bluetooth Connected'
                              : printerStatus === 'serial'
                              ? 'USB Serial Port Connected'
                              : 'Ready (Direct 58mm Roll Driver)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '11px', padding: '5px 10px', color: 'var(--gold-400)', borderColor: 'rgba(246, 201, 38, 0.4)' }}
                      onClick={handleTestPrint}
                    >
                      ⚡ Test Print
                    </button>
                  </div>

                  {/* Connect Buttons */}
                  <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <button
                      type="button"
                      disabled={connectingPrinter}
                      onClick={handleConnectBluetooth}
                      className="btn btn-outline btn-sm"
                      style={{
                        flex: 1,
                        fontSize: '11px',
                        padding: '6px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        background: printerStatus === 'bluetooth' ? 'rgba(34,197,94,0.1)' : 'transparent',
                        borderColor: printerStatus === 'bluetooth' ? '#22C55E' : 'rgba(255,255,255,0.15)',
                      }}
                    >
                      <span>📶</span>
                      <span>{connectingPrinter ? 'Pairing...' : 'Pair Bluetooth'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={connectingPrinter}
                      onClick={handleConnectUSB}
                      className="btn btn-outline btn-sm"
                      style={{
                        flex: 1,
                        fontSize: '11px',
                        padding: '6px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        background: printerStatus === 'serial' ? 'rgba(34,197,94,0.1)' : 'transparent',
                        borderColor: printerStatus === 'serial' ? '#22C55E' : 'rgba(255,255,255,0.15)',
                      }}
                    >
                      <span>🔌</span>
                      <span>USB Cable</span>
                    </button>
                  </div>

                  {printerNotice && (
                    <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--gold-300)', textAlign: 'center' }}>
                      ℹ️ {printerNotice}
                    </div>
                  )}
                </div>

                {/* Notes (Optional) */}
                <div style={{ marginTop: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Add any notes..."
                    value={billNotes}
                    onChange={(e) => setBillNotes(e.target.value)}
                    style={{ width: '100%', background: '#111520', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#FFF', padding: '10px', fontSize: '13px', resize: 'none' }}
                  />
                </div>

                {/* Primary Action Button */}
                <div style={{ marginTop: '24px' }}>
                  <button
                    type="button"
                    className="pos-btn-generate"
                    disabled={isProcessing}
                    onClick={handleCompleteBill}
                    style={{ padding: '14px', fontSize: '15px' }}
                  >
                    {isProcessing ? 'Processing...' : 'Complete & Close'}
                  </button>

                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px' }}>
                    {printPhysical && sendWhatsApp && !isWalkInAnonymous
                      ? 'Print receipt AND send WhatsApp bill'
                      : printPhysical
                      ? 'Print receipt only (No WhatsApp)'
                      : sendWhatsApp && !isWalkInAnonymous
                      ? 'Send WhatsApp only (No physical print)'
                      : 'Store digital bill in system'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          NEW CLIENT MODAL (Contact number is enough; name optional)
         ═══════════════════════════════════════════════════════════════ */}
      {showNewClientModal && (
        <div className="thermal-modal-backdrop">
          <div style={{ background: '#0E121B', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '12px', width: '100%', maxWidth: '420px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFF', margin: 0 }}>
                  + New Client for Billing
                </h3>
                <div style={{ fontSize: '11.5px', color: 'var(--gold-400)', marginTop: '2px' }}>
                  Contact number is enough to proceed
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewClientModal(false)}
                style={{ color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewClient}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#FFF', fontWeight: 600, marginBottom: '4px' }}>
                  Contact Number * <span style={{ fontSize: '11px', color: 'var(--gold-400)' }}>(Required)</span>
                </label>
                <input
                  type="tel"
                  required
                  autoFocus
                  placeholder="e.g. 9876543210"
                  value={newClientForm.phone}
                  onChange={(e) => setNewClientForm({ ...newClientForm, phone: e.target.value, whatsapp: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#121723',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    borderRadius: '6px',
                    color: '#FFF',
                    padding: '11px 12px',
                    fontSize: '14px',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Customer Name <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Optional (e.g. Rahul)"
                  value={newClientForm.name}
                  onChange={(e) => setNewClientForm({ ...newClientForm, name: e.target.value })}
                  style={{ width: '100%', background: '#121723', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#FFF', padding: '10px 12px', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Client Notes <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Preferences, skin sensitivity, etc."
                  value={newClientForm.notes}
                  onChange={(e) => setNewClientForm({ ...newClientForm, notes: e.target.value })}
                  style={{ width: '100%', background: '#121723', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#FFF', padding: '10px 12px', fontSize: '13px', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowNewClientModal(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, fontWeight: 700 }}
                >
                  Save &amp; Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ═══ SERVICE MANAGEMENT MODAL ═══ */}
      {showServiceManager && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setShowServiceManager(false)}
        >
          <div
            style={{
              background: '#0E131E',
              border: '1px solid rgba(212,175,55,0.3)',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '720px',
              maxHeight: '85vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 22px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#FFF', margin: 0 }}>
                  ✏️ Manage Services
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Add, edit or remove salon services. Changes reflect instantly in POS.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowServiceManager(false)}
                style={{ color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer', background: 'none', border: 'none' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '18px 22px', overflowY: 'auto', flex: 1 }}>
              {serviceFormMode === 'list' ? (
                <>
                  {/* Filter + Add Button Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '10px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {(['all', 'men', 'women'] as const).map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setServiceManagerFilter(f)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            border: serviceManagerFilter === f ? '1px solid var(--gold-400)' : '1px solid rgba(255,255,255,0.1)',
                            background: serviceManagerFilter === f ? 'rgba(212,175,55,0.15)' : 'transparent',
                            color: serviceManagerFilter === f ? 'var(--gold-400)' : 'var(--text-secondary)',
                            transition: 'all 0.2s',
                          }}
                        >
                          {f === 'all' ? 'All Services' : f === 'men' ? "🧔 Men's" : "👩 Women's"}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleStartAddService}
                      style={{
                        background: 'var(--gold-400)',
                        color: '#0A0D14',
                        padding: '8px 18px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      + Add Service
                    </button>
                  </div>

                  {/* Services Table */}
                  <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden' }}>
                    {/* Table Header */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 100px 80px 120px',
                        gap: '8px',
                        padding: '10px 14px',
                        background: 'rgba(255,255,255,0.03)',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      <span>Service Name</span>
                      <span>Price</span>
                      <span>Category</span>
                      <span style={{ textAlign: 'right' }}>Actions</span>
                    </div>

                    {/* Service Rows */}
                    <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                      {managerFilteredServices.length === 0 ? (
                        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                          No services found. Click "+ Add Service" to create one.
                        </div>
                      ) : (
                        managerFilteredServices.map((s) => (
                          <div
                            key={s.id}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 100px 80px 120px',
                              gap: '8px',
                              padding: '10px 14px',
                              alignItems: 'center',
                              borderBottom: '1px solid rgba(255,255,255,0.04)',
                              transition: 'background 0.15s',
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFF' }}>{s.name}</div>
                              {s.duration && (
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{s.duration} mins</div>
                              )}
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gold-400)' }}>₹{s.price}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                              {s.category?.gender === 'men' ? '🧔' : s.category?.gender === 'women' ? '👩' : '🔄'}{' '}
                              {s.category?.gender || 'Unisex'}
                            </div>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                onClick={() => handleStartEditService(s)}
                                style={{
                                  background: 'rgba(59,130,246,0.15)',
                                  border: '1px solid rgba(59,130,246,0.3)',
                                  color: '#60A5FA',
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteService(s.id)}
                                style={{
                                  background: 'rgba(239,68,68,0.12)',
                                  border: '1px solid rgba(239,68,68,0.3)',
                                  color: '#F87171',
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              ) : (
                /* Add / Edit Service Form */
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                    <button
                      type="button"
                      onClick={() => setServiceFormMode('list')}
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'var(--text-secondary)',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      ← Back
                    </button>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#FFF', margin: 0 }}>
                      {serviceFormMode === 'add' ? '+ Add New Service' : `Edit: ${editingService?.name}`}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Service Name */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#FFF', fontWeight: 600, marginBottom: '4px' }}>
                        Service Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Normal Hair Cut"
                        value={serviceForm.name}
                        onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                        style={{
                          width: '100%',
                          background: '#121723',
                          border: '1px solid rgba(212,175,55,0.4)',
                          borderRadius: '8px',
                          color: '#FFF',
                          padding: '11px 14px',
                          fontSize: '14px',
                          fontWeight: 600,
                        }}
                      />
                    </div>

                    {/* Price & Duration Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px' }}>
                          Price (₹) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="10"
                          placeholder="e.g. 150"
                          value={serviceForm.price}
                          onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                          style={{
                            width: '100%',
                            background: '#121723',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#FFF',
                            padding: '11px 14px',
                            fontSize: '14px',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px' }}>
                          Duration (mins)
                        </label>
                        <input
                          type="number"
                          min="0"
                          placeholder="e.g. 30"
                          value={serviceForm.duration}
                          onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                          style={{
                            width: '100%',
                            background: '#121723',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#FFF',
                            padding: '11px 14px',
                            fontSize: '14px',
                          }}
                        />
                      </div>
                    </div>

                    {/* Category Selector */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px' }}>
                        Category *
                      </label>
                      <select
                        value={serviceForm.categoryId}
                        onChange={(e) => setServiceForm({ ...serviceForm, categoryId: e.target.value })}
                        style={{
                          width: '100%',
                          background: '#121723',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#FFF',
                          padding: '11px 14px',
                          fontSize: '13px',
                        }}
                      >
                        <option value="">Select Category</option>
                        {serviceCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.gender === 'men' ? '🧔 ' : cat.gender === 'women' ? '👩 ' : '🔄 '}
                            {cat.name} ({cat.gender || 'unisex'})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Description */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px' }}>
                        Description (optional)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Brief description of the service"
                        value={serviceForm.description}
                        onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                        style={{
                          width: '100%',
                          background: '#121723',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#FFF',
                          padding: '11px 14px',
                          fontSize: '13px',
                          resize: 'none',
                        }}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setServiceFormMode('list')}
                        style={{
                          flex: 1,
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: 'var(--text-secondary)',
                          padding: '12px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveService}
                        disabled={savingService}
                        style={{
                          flex: 1,
                          background: savingService ? 'rgba(212,175,55,0.3)' : 'var(--gold-400)',
                          border: 'none',
                          color: '#0A0D14',
                          padding: '12px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: savingService ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {savingService ? 'Saving...' : serviceFormMode === 'add' ? '+ Add Service' : '💾 Update Service'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ═══════════════════════════════════════════════════════════════
          REPRINT PREVIOUS BILLS MODAL
         ═══════════════════════════════════════════════════════════════ */}
      {showReprintModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowReprintModal(false);
          }}
        >
          <div
            style={{
              background: '#0B0F17',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              borderRadius: '16px',
              maxWidth: '880px',
              width: '100%',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#0E131E',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>🧾</span>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#FFF' }}>
                    Reprint Previous Bills &amp; Invoices
                  </h2>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Lookup past salon bills to reprint 58mm thermal receipts or send digital WhatsApp bills
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowReprintModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#CBD5E1',
                  borderRadius: '8px',
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
              >
                ✕
              </button>
            </div>

            {/* Notice Banner */}
            {reprintNotice && (
              <div
                style={{
                  background: 'rgba(34, 197, 94, 0.15)',
                  borderBottom: '1px solid #22C55E',
                  color: '#4ADE80',
                  padding: '10px 24px',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>ℹ️</span>
                <span>{reprintNotice}</span>
              </div>
            )}

            {/* Search & Filter Bar */}
            <div
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                background: '#090D14',
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search by Bill #, Customer Name, or Phone..."
                  value={reprintSearch}
                  onChange={(e) => {
                    const val = e.target.value;
                    setReprintSearch(val);
                    openReprintModal(val);
                  }}
                  style={{
                    width: '100%',
                    background: '#121723',
                    border: '1px solid rgba(212, 175, 55, 0.25)',
                    borderRadius: '8px',
                    padding: '10px 14px 10px 36px',
                    color: '#FFF',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Filter Tabs */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {(['all', 'today', 'cash', 'upi'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setReprintFilter(tab)}
                    style={{
                      background: reprintFilter === tab ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${reprintFilter === tab ? 'var(--gold-400)' : 'rgba(255, 255, 255, 0.1)'}`,
                      color: reprintFilter === tab ? 'var(--gold-400)' : '#CBD5E1',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: reprintFilter === tab ? 700 : 500,
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    {tab === 'all' ? 'All Bills' : tab === 'today' ? "Today's Bills" : tab.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Invoices List */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {reprintLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '14px' }}>
                  ⏳ Loading salon bills...
                </div>
              ) : reprintList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🧾</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#E2E8F0' }}>No bills found</div>
                  <div style={{ fontSize: '13px', marginTop: '4px' }}>
                    {reprintSearch ? `No invoices match "${reprintSearch}".` : 'No bills have been completed yet.'}
                  </div>
                </div>
              ) : (
                reprintList
                  .filter((inv) => {
                    if (reprintFilter === 'today') {
                      const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
                      return inv.createdAt?.startsWith(todayStr);
                    }
                    if (reprintFilter === 'cash') return (inv.paymentMethod || '').toLowerCase() === 'cash';
                    if (reprintFilter === 'upi') return (inv.paymentMethod || '').toLowerCase() === 'upi';
                    return true;
                  })
                  .map((inv) => {
                    const printData = convertInvoiceToPrintData(inv);
                    const itemsSummary = printData.items.map((it) => `${it.name} (x${it.quantity})`).join(', ');

                    return (
                      <div
                        key={inv.id}
                        style={{
                          background: '#121723',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '10px',
                          padding: '16px 18px',
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '16px',
                          transition: 'border-color 0.15s ease',
                        }}
                      >
                        {/* Bill Info */}
                        <div style={{ flex: 1, minWidth: '260px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <span
                              style={{
                                fontFamily: 'monospace',
                                fontWeight: 800,
                                fontSize: '13px',
                                color: 'var(--gold-400)',
                                background: 'rgba(212, 175, 55, 0.12)',
                                padding: '2px 8px',
                                borderRadius: '4px',
                              }}
                            >
                              {printData.billNo}
                            </span>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              📅 {printData.date} • {printData.time}
                            </span>
                            {inv.chairName && (
                              <span
                                style={{
                                  fontSize: '11px',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  background: 'rgba(255, 255, 255, 0.06)',
                                  color: '#CBD5E1',
                                }}
                              >
                                🪑 {inv.chairName} ({inv.section || 'General'})
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 700, color: '#FFF', fontSize: '14px' }}>
                              👤 {printData.customerName}
                            </span>
                            {printData.customerPhone && (
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                📞 {printData.customerPhone}
                              </span>
                            )}
                          </div>

                          <div
                            style={{
                              fontSize: '12px',
                              color: 'var(--text-secondary)',
                              maxWidth: '450px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={itemsSummary}
                          >
                            ✂️ {itemsSummary}
                          </div>
                        </div>

                        {/* Amount & Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '17px', fontWeight: 800, color: '#FFF' }}>
                              ₹{printData.total.toLocaleString('en-IN')}
                            </div>
                            <span
                              style={{
                                fontSize: '10px',
                                textTransform: 'uppercase',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 700,
                                background:
                                  printData.paymentMethod === 'UPI'
                                    ? 'rgba(34, 197, 94, 0.15)'
                                    : printData.paymentMethod === 'CASH'
                                    ? 'rgba(212, 175, 55, 0.15)'
                                    : 'rgba(59, 130, 246, 0.15)',
                                color:
                                  printData.paymentMethod === 'UPI'
                                    ? '#4ADE80'
                                    : printData.paymentMethod === 'CASH'
                                    ? 'var(--gold-400)'
                                    : '#60A5FA',
                              }}
                            >
                              {printData.paymentMethod}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            {/* Primary 1-Click Thermal Reprint Button */}
                            <button
                              type="button"
                              onClick={() => handleReprintInvoice(inv)}
                              style={{
                                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.25), rgba(212, 175, 55, 0.1))',
                                border: '1px solid rgba(212, 175, 55, 0.5)',
                                color: 'var(--gold-400)',
                                padding: '8px 14px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                whiteSpace: 'nowrap',
                              }}
                              title="Print directly to paired 58mm thermal billing printer"
                            >
                              <span>🖨️</span>
                              <span>Reprint Bill</span>
                            </button>

                            {/* Preview & Print */}
                            <button
                              type="button"
                              onClick={() => setPreviewBill(printData)}
                              style={{
                                background: 'rgba(255, 255, 255, 0.06)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                color: '#CBD5E1',
                                padding: '8px 10px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                cursor: 'pointer',
                              }}
                              title="Preview formatted receipt"
                            >
                              👁️
                            </button>

                            {/* WhatsApp Button */}
                            {printData.customerPhone && (
                              <button
                                type="button"
                                onClick={() => handleWhatsAppPreviousBill(inv)}
                                style={{
                                  background: 'rgba(34, 197, 94, 0.15)',
                                  border: '1px solid rgba(34, 197, 94, 0.35)',
                                  color: '#4ADE80',
                                  padding: '8px 10px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                }}
                                title="Send digital duplicate bill via WhatsApp"
                              >
                                💬
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '14px 24px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                background: '#0E131E',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                💡 Tip: Reprinting sends ESC/POS command directly to EZO 58mm printer with no duplicate charges.
              </div>
              <button
                type="button"
                onClick={() => setShowReprintModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#FFF',
                  padding: '8px 18px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          RECEIPT PREVIEW & DIRECT PRINT MODAL
         ═══════════════════════════════════════════════════════════════ */}
      {previewBill && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewBill(null);
          }}
        >
          <div
            style={{
              background: '#FFF',
              color: '#000',
              borderRadius: '8px',
              maxWidth: '380px',
              width: '100%',
              padding: '24px 20px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: '12px',
              lineHeight: 1.4,
            }}
          >
            {/* 58mm Thermal Receipt Layout Preview */}
            <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '12px', marginBottom: '12px' }}>
              <div style={{ fontWeight: 900, fontSize: '16px', letterSpacing: '1px' }}>HAIR MART</div>
              <div style={{ fontSize: '11px', fontWeight: 700 }}>UNISEX FAMILY SALON</div>
              <div style={{ fontSize: '10px' }}>Near Vishal Mart, Surathkal</div>
              <div style={{ fontSize: '10px' }}>Tel: 0824-4060938 | Mob: 8660549348</div>
              <div style={{ fontSize: '10px', marginTop: '4px', fontWeight: 800 }}>*** DUPLICATE / REPRINT ***</div>
            </div>

            <div style={{ fontSize: '11px', marginBottom: '10px' }}>
              <div><b>Bill No:</b> {previewBill.billNo}</div>
              <div><b>Date:</b> {previewBill.date} {previewBill.time}</div>
              <div><b>Customer:</b> {previewBill.customerName}</div>
              {previewBill.customerPhone && <div><b>Phone:</b> {previewBill.customerPhone}</div>}
            </div>

            <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '8px 0', marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, marginBottom: '4px' }}>
                <span>Item</span>
                <span>Qty x Rate = Amt</span>
              </div>
              {previewBill.items.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                  <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.name}</span>
                  <span>{it.quantity} x {it.price} = ₹{it.quantity * it.price}</span>
                </div>
              ))}
            </div>

            <div style={{ fontSize: '11px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal:</span>
                <span>₹{previewBill.subtotal}</span>
              </div>
              {previewBill.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Discount:</span>
                  <span>-₹{previewBill.discount}</span>
                </div>
              )}
              {previewBill.tax && previewBill.tax > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>GST{previewBill.taxRate ? ` (${previewBill.taxRate}%)` : ''}:</span>
                  <span>+₹{previewBill.tax}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '14px', borderTop: '1px dashed #000', paddingTop: '6px', marginTop: '6px' }}>
                <span>TOTAL AMOUNT:</span>
                <span>₹{previewBill.total}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span>Payment Mode:</span>
                <span style={{ fontWeight: 700 }}>{previewBill.paymentMethod}</span>
              </div>
            </div>

            {/* Dynamic UPI Payment QR Code (Accurately extracted from Hair Mart EZO receipt) */}
            <div style={{ textAlign: 'center', borderTop: '1px dashed #000', paddingTop: '10px', marginTop: '10px' }}>
              <div style={{ fontSize: '10px', fontWeight: 800 }}>Thank You! Visit Again!</div>
              <div style={{ fontSize: '9px', color: '#666' }}>Powered by Ezo</div>
              <div
                style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 4px' }}
                dangerouslySetInnerHTML={{
                  __html: generateQrSvg(
                    generateHairMartUpiUrl(previewBill.total, previewBill.billNo),
                    130
                  ),
                }}
              />
              <div style={{ fontWeight: 900, fontSize: '12px', letterSpacing: '0.3px' }}>
                Scan To Pay Rs. {previewBill.total} /-
              </div>
              <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>
                UPI: {HAIR_MART_UPI_VPA} (Hair Mart Unisex Salon)
              </div>
            </div>

            <div style={{ textAlign: 'center', borderTop: '1px dashed #000', paddingTop: '10px', marginTop: '10px', fontSize: '10px' }}>
              <div>Thank You for Visiting Hair Mart!</div>
              <div>Look Stylish. Feel Confident. ✨</div>
              <div>Follow us on Instagram: @hairmart</div>
            </div>

            {/* Print & Close Actions */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => {
                  handleReprintInvoice(previewBill);
                  setPreviewBill(null);
                }}
                style={{
                  flex: 1,
                  background: '#000',
                  color: '#FFF',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                🖨️ Print Now (58mm)
              </button>
              <button
                type="button"
                onClick={() => setPreviewBill(null)}
                style={{
                  background: '#E2E8F0',
                  color: '#000',
                  border: 'none',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          END OF DAY (EOD) OWNER WHATSAPP REPORT MODAL (9035959286)
         ═══════════════════════════════════════════════════════════════ */}
      {showEodModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowEodModal(false);
          }}
        >
          <div
            style={{
              background: '#121723',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              borderRadius: '14px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(18, 23, 35, 0.95))',
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '17px',
                    fontWeight: 800,
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span>📲</span>
                  <span>End of Day Bills Report</span>
                  <span
                    style={{
                      background: 'rgba(34, 197, 94, 0.2)',
                      color: '#4ADE80',
                      border: '1px solid rgba(34, 197, 94, 0.4)',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    Owner: 9035959286
                  </span>
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Audit summary of all today&apos;s bills, cash/UPI/card split, and staff attendance.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEodModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: '22px',
                  cursor: 'pointer',
                  padding: '4px',
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
              {eodCopyNotice && (
                <div
                  style={{
                    background: 'rgba(34, 197, 94, 0.15)',
                    border: '1px solid #22C55E',
                    color: '#4ADE80',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  {eodCopyNotice}
                </div>
              )}

              {eodLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
                  <div>Compiling today&apos;s bills register and collections...</div>
                </div>
              ) : eodData ? (
                <>
                  {/* KPI Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: '12px',
                      marginBottom: '18px',
                    }}
                  >
                    <div
                      style={{
                        background: 'rgba(212, 175, 55, 0.08)',
                        border: '1px solid rgba(212, 175, 55, 0.25)',
                        borderRadius: '10px',
                        padding: '12px',
                      }}
                    >
                      <div style={{ fontSize: '11px', color: 'var(--gold-400)', fontWeight: 600 }}>Total Revenue</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFF', marginTop: '2px' }}>
                        ₹{Number(eodData.totalRevenue || 0).toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{eodData.totalBills} bills</div>
                    </div>

                    <div
                      style={{
                        background: 'rgba(34, 197, 94, 0.08)',
                        border: '1px solid rgba(34, 197, 94, 0.25)',
                        borderRadius: '10px',
                        padding: '12px',
                      }}
                    >
                      <div style={{ fontSize: '11px', color: '#4ADE80', fontWeight: 600 }}>💵 Cash</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFF', marginTop: '2px' }}>
                        ₹{Number(eodData.cashTotal || 0).toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{eodData.cashCount} bills</div>
                    </div>

                    <div
                      style={{
                        background: 'rgba(59, 130, 246, 0.08)',
                        border: '1px solid rgba(59, 130, 246, 0.25)',
                        borderRadius: '10px',
                        padding: '12px',
                      }}
                    >
                      <div style={{ fontSize: '11px', color: '#60A5FA', fontWeight: 600 }}>📱 UPI / QR</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFF', marginTop: '2px' }}>
                        ₹{Number(eodData.upiTotal || 0).toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{eodData.upiCount} bills</div>
                    </div>

                    <div
                      style={{
                        background: 'rgba(168, 85, 247, 0.08)',
                        border: '1px solid rgba(168, 85, 247, 0.25)',
                        borderRadius: '10px',
                        padding: '12px',
                      }}
                    >
                      <div style={{ fontSize: '11px', color: '#C084FC', fontWeight: 600 }}>💳 Card</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFF', marginTop: '2px' }}>
                        ₹{Number(eodData.cardTotal || 0).toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{eodData.cardCount} bills</div>
                    </div>
                  </div>

                  {/* Sections Split */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      marginBottom: '16px',
                      display: 'flex',
                      justifyContent: 'space-around',
                      fontSize: '12px',
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Men&apos;s Section: </span>
                      <b style={{ color: '#FFF' }}>₹{Number(eodData.menTotal || 0).toLocaleString('en-IN')}</b>
                      <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}> ({eodData.menCount} bills)</span>
                    </div>
                    <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '14px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Women&apos;s Section: </span>
                      <b style={{ color: '#FFF' }}>₹{Number(eodData.womenTotal || 0).toLocaleString('en-IN')}</b>
                      <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}> ({eodData.womenCount} bills)</span>
                    </div>
                  </div>

                  {/* Itemized Bills Accordion / Preview */}
                  <div style={{ marginBottom: '16px' }}>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: 'var(--gold-400)',
                        marginBottom: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>📋 Bills Register ({eodData.billsList?.length || 0})</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Sorted by bill time</span>
                    </div>
                    <div
                      style={{
                        maxHeight: '160px',
                        overflowY: 'auto',
                        background: '#0B0F18',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '8px',
                        padding: '8px',
                      }}
                    >
                      {eodData.billsList && eodData.billsList.length > 0 ? (
                        eodData.billsList.map((b: any, idx: number) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '6px 8px',
                              borderBottom: idx < eodData.billsList.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                              fontSize: '11px',
                            }}
                          >
                            <div>
                              <b style={{ color: '#FFF' }}>#{b.billNo}</b>
                              <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>({b.time})</span>
                              <span style={{ color: '#CBD5E1', marginLeft: '6px' }}>{b.customerName}</span>
                              <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{b.services}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <b style={{ color: 'var(--gold-400)' }}>₹{b.amount}</b>
                              <div style={{ color: '#94A3B8', fontSize: '10px', textTransform: 'uppercase' }}>
                                {b.paymentMethod}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '11px' }}>
                          No bills generated yet today.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Closing remarks input */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#CBD5E1', marginBottom: '6px' }}>
                      Optional Closing Notes / Safe Handover:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Safe cash handed over ₹8,000 to manager, all workstations cleaned."
                      value={eodClosingNotes}
                      onChange={(e) => setEodClosingNotes(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#0B0F18',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#FFF',
                        borderRadius: '6px',
                        padding: '9px 12px',
                        fontSize: '12px',
                      }}
                    />
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Footer Actions */}
            <div
              style={{
                padding: '14px 24px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                background: '#0E131E',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <button
                type="button"
                onClick={handleCopyEodReport}
                disabled={!eodData}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#CBD5E1',
                  padding: '9px 16px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>📋</span>
                <span>Copy Report</span>
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowEodModal(false)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#94A3B8',
                    padding: '9px 16px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSendEodToOwner}
                  disabled={!eodData}
                  style={{
                    background: 'linear-gradient(135deg, #22C55E, #16A34A)',
                    border: 'none',
                    color: '#FFF',
                    padding: '9px 20px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.35)',
                  }}
                >
                  <span>📲</span>
                  <span>Send to WhatsApp (9035959286)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
