import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ServiceSeedItem {
  name: string;
  categoryName: string;
  price: number;
  duration?: number;
  image: string;
  description?: string;
  sortOrder: number;
}

const WOMEN_SERVICES_SEED: ServiceSeedItem[] = [
  // ─── BLEACH (Image 1) ───
  {
    name: 'Bleach - Upper Lip',
    categoryName: 'Bleach',
    price: 50,
    duration: 15,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&auto=format&fit=crop&q=80',
    sortOrder: 1,
  },
  {
    name: 'Bleach - Under Arms',
    categoryName: 'Bleach',
    price: 100,
    duration: 20,
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=500&auto=format&fit=crop&q=80',
    sortOrder: 2,
  },
  {
    name: 'Bleach - Feet',
    categoryName: 'Bleach',
    price: 200,
    duration: 25,
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=500&auto=format&fit=crop&q=80',
    sortOrder: 3,
  },
  {
    name: 'Bleach - Half Arms',
    categoryName: 'Bleach',
    price: 400,
    duration: 30,
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500&auto=format&fit=crop&q=80',
    sortOrder: 4,
  },
  {
    name: 'Bleach - Full Arms',
    categoryName: 'Bleach',
    price: 600,
    duration: 40,
    image: 'https://images.unsplash.com/photo-1512290903672-613d969176bf?w=500&auto=format&fit=crop&q=80',
    sortOrder: 5,
  },
  {
    name: 'Bleach - Face & Neck',
    categoryName: 'Bleach',
    price: 500,
    duration: 30,
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=500&auto=format&fit=crop&q=80',
    sortOrder: 6,
  },
  {
    name: 'Bleach - Face Neck & Blouse Line',
    categoryName: 'Bleach',
    price: 600,
    duration: 40,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80',
    sortOrder: 7,
  },
  {
    name: 'Bleach - Half Legs',
    categoryName: 'Bleach',
    price: 550,
    duration: 35,
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=500&auto=format&fit=crop&q=80',
    sortOrder: 8,
  },
  {
    name: 'Bleach - Full Legs',
    categoryName: 'Bleach',
    price: 700,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500&auto=format&fit=crop&q=80',
    sortOrder: 9,
  },
  {
    name: 'Bleach - Medriff',
    categoryName: 'Bleach',
    price: 450,
    duration: 30,
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=500&auto=format&fit=crop&q=80',
    sortOrder: 10,
  },
  {
    name: 'Bleach - Half Back/Front',
    categoryName: 'Bleach',
    price: 500,
    duration: 30,
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500&auto=format&fit=crop&q=80',
    sortOrder: 11,
  },
  {
    name: 'Bleach - Full back /Front',
    categoryName: 'Bleach',
    price: 600,
    duration: 40,
    image: 'https://images.unsplash.com/photo-1512290903672-613d969176bf?w=500&auto=format&fit=crop&q=80',
    sortOrder: 12,
  },
  {
    name: 'Bleach - Full Body',
    categoryName: 'Bleach',
    price: 2500,
    duration: 90,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop&q=80',
    sortOrder: 13,
  },

  // ─── DEE TAN (Image 1) ───
  {
    name: 'Dee Tan - Upper Lip',
    categoryName: 'Dee Tan',
    price: 90,
    duration: 15,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&auto=format&fit=crop&q=80',
    sortOrder: 14,
  },
  {
    name: 'Dee Tan - Under Arms',
    categoryName: 'Dee Tan',
    price: 150,
    duration: 20,
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=500&auto=format&fit=crop&q=80',
    sortOrder: 15,
  },
  {
    name: 'Dee Tan - Feet',
    categoryName: 'Dee Tan',
    price: 250,
    duration: 25,
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=500&auto=format&fit=crop&q=80',
    sortOrder: 16,
  },
  {
    name: 'Dee Tan - Face & Neck',
    categoryName: 'Dee Tan',
    price: 550,
    duration: 35,
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=500&auto=format&fit=crop&q=80',
    sortOrder: 17,
  },
  {
    name: 'Dee Tan - Face Neck & Blouse Line',
    categoryName: 'Dee Tan',
    price: 650,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80',
    sortOrder: 18,
  },
  {
    name: 'Dee Tan - Half Arms',
    categoryName: 'Dee Tan',
    price: 450,
    duration: 30,
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500&auto=format&fit=crop&q=80',
    sortOrder: 19,
  },
  {
    name: 'Dee Tan - Full Arms',
    categoryName: 'Dee Tan',
    price: 650,
    duration: 40,
    image: 'https://images.unsplash.com/photo-1512290903672-613d969176bf?w=500&auto=format&fit=crop&q=80',
    sortOrder: 20,
  },
  {
    name: 'Dee Tan - Half Legs',
    categoryName: 'Dee Tan',
    price: 560,
    duration: 35,
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=500&auto=format&fit=crop&q=80',
    sortOrder: 21,
  },
  {
    name: 'Dee Tan - Full Legs',
    categoryName: 'Dee Tan',
    price: 800,
    duration: 50,
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500&auto=format&fit=crop&q=80',
    sortOrder: 22,
  },
  {
    name: 'Dee Tan - Medriff',
    categoryName: 'Dee Tan',
    price: 750,
    duration: 35,
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=500&auto=format&fit=crop&q=80',
    sortOrder: 23,
  },
  {
    name: 'Dee Tan - Half Back/Front',
    categoryName: 'Dee Tan',
    price: 500,
    duration: 30,
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500&auto=format&fit=crop&q=80',
    sortOrder: 24,
  },
  {
    name: 'Dee Tan - Full Back/Front',
    categoryName: 'Dee Tan',
    price: 700,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1512290903672-613d969176bf?w=500&auto=format&fit=crop&q=80',
    sortOrder: 25,
  },
  {
    name: 'Dee Tan - Full Body',
    categoryName: 'Dee Tan',
    price: 3000,
    duration: 90,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop&q=80',
    sortOrder: 26,
  },

  // ─── HAIR SPA (Image 2) ───
  {
    name: 'Express Hair Spa (S)',
    categoryName: 'Hair Spa',
    price: 600,
    duration: 30,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop&q=80',
    sortOrder: 27,
  },
  {
    name: 'Express Hair Spa (M)',
    categoryName: 'Hair Spa',
    price: 700,
    duration: 35,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop&q=80',
    sortOrder: 28,
  },
  {
    name: 'Express Hair Spa (L)',
    categoryName: 'Hair Spa',
    price: 800,
    duration: 40,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop&q=80',
    sortOrder: 29,
  },
  {
    name: 'Moisturizing Hair Spa (S)',
    categoryName: 'Hair Spa',
    price: 900,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=500&auto=format&fit=crop&q=80',
    sortOrder: 30,
  },
  {
    name: 'Moisturizing Hair Spa (M)',
    categoryName: 'Hair Spa',
    price: 1000,
    duration: 50,
    image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=500&auto=format&fit=crop&q=80',
    sortOrder: 31,
  },
  {
    name: 'Moisturizing Hair Spa (L)',
    categoryName: 'Hair Spa',
    price: 1100,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=500&auto=format&fit=crop&q=80',
    sortOrder: 32,
  },
  {
    name: 'Repairing Hair Spa (S)',
    categoryName: 'Hair Spa',
    price: 1000,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80',
    sortOrder: 33,
  },
  {
    name: 'Repairing Hair Spa (M)',
    categoryName: 'Hair Spa',
    price: 1100,
    duration: 50,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80',
    sortOrder: 34,
  },
  {
    name: 'Repairing Hair Spa (L)',
    categoryName: 'Hair Spa',
    price: 1200,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80',
    sortOrder: 35,
  },
  {
    name: 'Fibre Clinix treatment (S)',
    categoryName: 'Hair Spa',
    price: 1500,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=500&auto=format&fit=crop&q=80',
    sortOrder: 36,
  },
  {
    name: 'Fibre Clinix treatment (M)',
    categoryName: 'Hair Spa',
    price: 1800,
    duration: 70,
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=500&auto=format&fit=crop&q=80',
    sortOrder: 37,
  },
  {
    name: 'Fibre Clinix treatment (L)',
    categoryName: 'Hair Spa',
    price: 2100,
    duration: 80,
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=500&auto=format&fit=crop&q=80',
    sortOrder: 38,
  },
  {
    name: 'Anti-dandruff treatment',
    categoryName: 'Hair Spa',
    price: 1600,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=500&auto=format&fit=crop&q=80',
    sortOrder: 39,
  },
  {
    name: 'Anti-Hair fall treatment',
    categoryName: 'Hair Spa',
    price: 1600,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=500&auto=format&fit=crop&q=80',
    sortOrder: 40,
  },
  {
    name: 'Clear dose',
    categoryName: 'Hair Spa',
    price: 500,
    duration: 30,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop&q=80',
    sortOrder: 41,
  },
  {
    name: 'Head Massage (with wash & blast dry)',
    categoryName: 'Hair Spa',
    price: 500,
    duration: 30,
    image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=500&auto=format&fit=crop&q=80',
    sortOrder: 42,
  },

  // ─── HAIR FORMS (Image 2) ───
  {
    name: 'Smoothening (S)',
    categoryName: 'Hair Forms',
    price: 5000,
    duration: 120,
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500&auto=format&fit=crop&q=80',
    sortOrder: 43,
  },
  {
    name: 'Smoothening (M)',
    categoryName: 'Hair Forms',
    price: 6000,
    duration: 150,
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500&auto=format&fit=crop&q=80',
    sortOrder: 44,
  },
  {
    name: 'Smoothening (L)',
    categoryName: 'Hair Forms',
    price: 7000,
    duration: 180,
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500&auto=format&fit=crop&q=80',
    sortOrder: 45,
  },
  {
    name: 'Rebonding (S)',
    categoryName: 'Hair Forms',
    price: 6000,
    duration: 150,
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=500&auto=format&fit=crop&q=80',
    sortOrder: 46,
  },
  {
    name: 'Rebonding (M)',
    categoryName: 'Hair Forms',
    price: 7000,
    duration: 180,
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=500&auto=format&fit=crop&q=80',
    sortOrder: 47,
  },
  {
    name: 'Rebonding (L)',
    categoryName: 'Hair Forms',
    price: 8000,
    duration: 210,
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=500&auto=format&fit=crop&q=80',
    sortOrder: 48,
  },
  {
    name: 'Keratine (botox) (S)',
    categoryName: 'Hair Forms',
    price: 6500,
    duration: 120,
    image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=500&auto=format&fit=crop&q=80',
    sortOrder: 49,
  },
  {
    name: 'Keratine (botox) (M)',
    categoryName: 'Hair Forms',
    price: 7500,
    duration: 150,
    image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=500&auto=format&fit=crop&q=80',
    sortOrder: 50,
  },
  {
    name: 'Keratine (botox) (L)',
    categoryName: 'Hair Forms',
    price: 8500,
    duration: 180,
    image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=500&auto=format&fit=crop&q=80',
    sortOrder: 51,
  },
  {
    name: 'Biotin (S)',
    categoryName: 'Hair Forms',
    price: 7500,
    duration: 120,
    image: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=500&auto=format&fit=crop&q=80',
    sortOrder: 52,
  },
  {
    name: 'Biotin (M)',
    categoryName: 'Hair Forms',
    price: 8500,
    duration: 150,
    image: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=500&auto=format&fit=crop&q=80',
    sortOrder: 53,
  },
  {
    name: 'Biotin (L)',
    categoryName: 'Hair Forms',
    price: 9500,
    duration: 180,
    image: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=500&auto=format&fit=crop&q=80',
    sortOrder: 54,
  },

  // ─── PEDICURE & MANICURE (Image 3) ───
  {
    name: 'Regular Manicure',
    categoryName: 'Pedicure & Manicure',
    price: 500,
    duration: 35,
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&auto=format&fit=crop&q=80',
    sortOrder: 55,
  },
  {
    name: 'Regular Pedicure',
    categoryName: 'Pedicure & Manicure',
    price: 600,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=500&auto=format&fit=crop&q=80',
    sortOrder: 56,
  },
  {
    name: 'Citrus Manicure',
    categoryName: 'Pedicure & Manicure',
    price: 700,
    duration: 40,
    image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500&auto=format&fit=crop&q=80',
    sortOrder: 57,
  },
  {
    name: 'Citrus Pedicure',
    categoryName: 'Pedicure & Manicure',
    price: 800,
    duration: 50,
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=500&auto=format&fit=crop&q=80',
    sortOrder: 58,
  },
  {
    name: 'Cystal Spa Manicure',
    categoryName: 'Pedicure & Manicure',
    price: 900,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&auto=format&fit=crop&q=80',
    sortOrder: 59,
  },
  {
    name: 'Cystal Spa Pedicure',
    categoryName: 'Pedicure & Manicure',
    price: 1500,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=500&auto=format&fit=crop&q=80',
    sortOrder: 60,
  },
  {
    name: 'Heel Peel Treatment',
    categoryName: 'Pedicure & Manicure',
    price: 1600,
    duration: 50,
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=500&auto=format&fit=crop&q=80',
    sortOrder: 61,
  },
  {
    name: 'Change of nail polish',
    categoryName: 'Pedicure & Manicure',
    price: 90,
    duration: 15,
    image: 'https://images.unsplash.com/photo-1522337094346-2917730e7845?w=500&auto=format&fit=crop&q=80',
    sortOrder: 62,
  },
  {
    name: 'Cut file & polish',
    categoryName: 'Pedicure & Manicure',
    price: 200,
    duration: 25,
    image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500&auto=format&fit=crop&q=80',
    sortOrder: 63,
  },
  {
    name: 'Cut & file',
    categoryName: 'Pedicure & Manicure',
    price: 100,
    duration: 15,
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&auto=format&fit=crop&q=80',
    sortOrder: 64,
  },

  // ─── FACIAL (Image 4) ───
  {
    name: 'Clean Up',
    categoryName: 'Facial',
    price: 550,
    duration: 35,
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=500&auto=format&fit=crop&q=80',
    sortOrder: 65,
  },
  {
    name: 'Face Massage',
    categoryName: 'Facial',
    price: 499,
    duration: 30,
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500&auto=format&fit=crop&q=80',
    sortOrder: 66,
  },
  {
    name: 'Fruit Facial',
    categoryName: 'Facial',
    price: 1000,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&auto=format&fit=crop&q=80',
    sortOrder: 67,
  },
  {
    name: 'Hydra Moist',
    categoryName: 'Facial',
    price: 1299,
    duration: 50,
    image: 'https://images.unsplash.com/photo-1512290903672-613d969176bf?w=500&auto=format&fit=crop&q=80',
    sortOrder: 68,
  },
  {
    name: 'Pigmentone',
    categoryName: 'Facial',
    price: 1399,
    duration: 55,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80',
    sortOrder: 69,
  },
  {
    name: 'Face Clear Tan',
    categoryName: 'Facial',
    price: 1500,
    duration: 50,
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=500&auto=format&fit=crop&q=80',
    sortOrder: 70,
  },
  {
    name: 'Marmalade Facial',
    categoryName: 'Facial',
    price: 2299,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&auto=format&fit=crop&q=80',
    sortOrder: 71,
  },
  {
    name: 'Gold Facial',
    categoryName: 'Facial',
    price: 2999,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1512290903672-613d969176bf?w=500&auto=format&fit=crop&q=80',
    sortOrder: 72,
  },
  {
    name: 'Five Layer Facial',
    categoryName: 'Facial',
    price: 3500,
    duration: 75,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80',
    sortOrder: 73,
  },
  {
    name: 'Bridal Glow',
    categoryName: 'Facial',
    price: 3999,
    duration: 90,
    image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=500&auto=format&fit=crop&q=80',
    sortOrder: 74,
  },

  // ─── ADD ON MASQUE (Image 4) ───
  {
    name: 'Revitalizing Masque',
    categoryName: 'Add On Masque',
    price: 350,
    duration: 20,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&auto=format&fit=crop&q=80',
    sortOrder: 75,
  },
  {
    name: 'Charcoal Masque',
    categoryName: 'Add On Masque',
    price: 390,
    duration: 25,
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=500&auto=format&fit=crop&q=80',
    sortOrder: 76,
  },

  // ─── HAIR CUT (Image 5) ───
  {
    name: 'Regular Hair Cut (U-cut Straight cut, Bangs)',
    categoryName: 'Hair Cut',
    price: 400,
    duration: 35,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop&q=80',
    sortOrder: 77,
  },
  {
    name: 'Layer Hair Cut (with wash)',
    categoryName: 'Hair Cut',
    price: 650,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=500&auto=format&fit=crop&q=80',
    sortOrder: 78,
  },
  {
    name: 'Change of Style',
    categoryName: 'Hair Cut',
    price: 800,
    duration: 50,
    image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=500&auto=format&fit=crop&q=80',
    sortOrder: 79,
  },
  {
    name: 'Kids Hair cut (Upto 10 yrs)',
    categoryName: 'Hair Cut',
    price: 250,
    duration: 25,
    image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=500&auto=format&fit=crop&q=80',
    sortOrder: 80,
  },
  {
    name: 'Feather',
    categoryName: 'Hair Cut',
    price: 400,
    duration: 35,
    image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=500&auto=format&fit=crop&q=80',
    sortOrder: 81,
  },
  {
    name: 'Bob cut',
    categoryName: 'Hair Cut',
    price: 200,
    duration: 30,
    image: 'https://images.unsplash.com/photo-1620331311520-246422fd82f9?w=500&auto=format&fit=crop&q=80',
    sortOrder: 82,
  },

  // ─── CROWN HIGHLIGHTS & COLOURING (Image 5) ───
  {
    name: 'Root Touch up',
    categoryName: 'Crown Highlights & Colouring',
    price: 1000,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=500&auto=format&fit=crop&q=80',
    sortOrder: 83,
  },
  {
    name: 'Root Touch up ammonia free',
    categoryName: 'Crown Highlights & Colouring',
    price: 1100,
    duration: 50,
    image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=500&auto=format&fit=crop&q=80',
    sortOrder: 84,
  },
  {
    name: 'Global Colour (S)',
    categoryName: 'Crown Highlights & Colouring',
    price: 1800,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=500&auto=format&fit=crop&q=80',
    sortOrder: 85,
  },
  {
    name: 'Global Colour (M)',
    categoryName: 'Crown Highlights & Colouring',
    price: 2300,
    duration: 75,
    image: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=500&auto=format&fit=crop&q=80',
    sortOrder: 86,
  },
  {
    name: 'Global Colour (L)',
    categoryName: 'Crown Highlights & Colouring',
    price: 2800,
    duration: 90,
    image: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=500&auto=format&fit=crop&q=80',
    sortOrder: 87,
  },
  {
    name: 'Global Ammonia free colour (S)',
    categoryName: 'Crown Highlights & Colouring',
    price: 2500,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1522337094346-2917730e7845?w=500&auto=format&fit=crop&q=80',
    sortOrder: 88,
  },
  {
    name: 'Global Ammonia free colour (M)',
    categoryName: 'Crown Highlights & Colouring',
    price: 3000,
    duration: 75,
    image: 'https://images.unsplash.com/photo-1522337094346-2917730e7845?w=500&auto=format&fit=crop&q=80',
    sortOrder: 89,
  },
  {
    name: 'Global Ammonia free colour (L)',
    categoryName: 'Crown Highlights & Colouring',
    price: 3500,
    duration: 90,
    image: 'https://images.unsplash.com/photo-1522337094346-2917730e7845?w=500&auto=format&fit=crop&q=80',
    sortOrder: 90,
  },
  {
    name: 'Global fashion colour (S)',
    categoryName: 'Crown Highlights & Colouring',
    price: 2000,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&auto=format&fit=crop&q=80',
    sortOrder: 91,
  },
  {
    name: 'Global fashion colour (M)',
    categoryName: 'Crown Highlights & Colouring',
    price: 2500,
    duration: 75,
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&auto=format&fit=crop&q=80',
    sortOrder: 92,
  },
  {
    name: 'Global fashion colour (L)',
    categoryName: 'Crown Highlights & Colouring',
    price: 3000,
    duration: 90,
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&auto=format&fit=crop&q=80',
    sortOrder: 93,
  },
  {
    name: 'Global colour + highlights (S)',
    categoryName: 'Crown Highlights & Colouring',
    price: 3500,
    duration: 90,
    image: 'https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=500&auto=format&fit=crop&q=80',
    sortOrder: 94,
  },
  {
    name: 'Global colour + highlights (M)',
    categoryName: 'Crown Highlights & Colouring',
    price: 4000,
    duration: 105,
    image: 'https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=500&auto=format&fit=crop&q=80',
    sortOrder: 95,
  },
  {
    name: 'Global colour + highlights (L)',
    categoryName: 'Crown Highlights & Colouring',
    price: 4500,
    duration: 120,
    image: 'https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=500&auto=format&fit=crop&q=80',
    sortOrder: 96,
  },
  {
    name: 'Full streaking (S)',
    categoryName: 'Crown Highlights & Colouring',
    price: 3000,
    duration: 90,
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&auto=format&fit=crop&q=80',
    sortOrder: 97,
  },
  {
    name: 'Full streaking (M)',
    categoryName: 'Crown Highlights & Colouring',
    price: 3500,
    duration: 105,
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&auto=format&fit=crop&q=80',
    sortOrder: 98,
  },
  {
    name: 'Full streaking (L)',
    categoryName: 'Crown Highlights & Colouring',
    price: 4000,
    duration: 120,
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&auto=format&fit=crop&q=80',
    sortOrder: 99,
  },
  {
    name: 'Hair streaking (per streak S/M/L) (S)',
    categoryName: 'Crown Highlights & Colouring',
    price: 250,
    duration: 20,
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&auto=format&fit=crop&q=80',
    sortOrder: 100,
  },
  {
    name: 'Hair streaking (per streak S/M/L) (M)',
    categoryName: 'Crown Highlights & Colouring',
    price: 300,
    duration: 25,
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&auto=format&fit=crop&q=80',
    sortOrder: 101,
  },
  {
    name: 'Hair streaking (per streak S/M/L) (L)',
    categoryName: 'Crown Highlights & Colouring',
    price: 350,
    duration: 30,
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&auto=format&fit=crop&q=80',
    sortOrder: 102,
  },

  // ─── HAIR WASH, BLAST DRY & BLOW DRY (Image 5) ───
  {
    name: 'Shampoo Conditioning & Blast dry (With wash & Normal dry)',
    categoryName: 'Hair Wash, Blast Dry & Blow Dry',
    price: 350,
    duration: 25,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop&q=80',
    sortOrder: 103,
  },
  {
    name: 'Straight finish blow dry (S)',
    categoryName: 'Hair Wash, Blast Dry & Blow Dry',
    price: 400,
    duration: 30,
    image: 'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?w=500&auto=format&fit=crop&q=80',
    sortOrder: 104,
  },
  {
    name: 'Straight finish blow dry (M)',
    categoryName: 'Hair Wash, Blast Dry & Blow Dry',
    price: 500,
    duration: 40,
    image: 'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?w=500&auto=format&fit=crop&q=80',
    sortOrder: 105,
  },
  {
    name: 'Straight finish blow dry (L)',
    categoryName: 'Hair Wash, Blast Dry & Blow Dry',
    price: 600,
    duration: 50,
    image: 'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?w=500&auto=format&fit=crop&q=80',
    sortOrder: 106,
  },
  {
    name: 'Blow dry curls (S)',
    categoryName: 'Hair Wash, Blast Dry & Blow Dry',
    price: 550,
    duration: 35,
    image: 'https://images.unsplash.com/photo-1526045478516-99145907023c?w=500&auto=format&fit=crop&q=80',
    sortOrder: 107,
  },
  {
    name: 'Blow dry curls (M)',
    categoryName: 'Hair Wash, Blast Dry & Blow Dry',
    price: 650,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1526045478516-99145907023c?w=500&auto=format&fit=crop&q=80',
    sortOrder: 108,
  },
  {
    name: 'Blow dry curls (L)',
    categoryName: 'Hair Wash, Blast Dry & Blow Dry',
    price: 750,
    duration: 55,
    image: 'https://images.unsplash.com/photo-1526045478516-99145907023c?w=500&auto=format&fit=crop&q=80',
    sortOrder: 109,
  },
  {
    name: 'Ironing (M)',
    categoryName: 'Hair Wash, Blast Dry & Blow Dry',
    price: 800,
    duration: 40,
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500&auto=format&fit=crop&q=80',
    sortOrder: 110,
  },
  {
    name: 'Ironing (L)',
    categoryName: 'Hair Wash, Blast Dry & Blow Dry',
    price: 1000,
    duration: 50,
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500&auto=format&fit=crop&q=80',
    sortOrder: 111,
  },
  {
    name: 'Curls (M)',
    categoryName: 'Hair Wash, Blast Dry & Blow Dry',
    price: 1000,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80',
    sortOrder: 112,
  },
  {
    name: 'Curls (L)',
    categoryName: 'Hair Wash, Blast Dry & Blow Dry',
    price: 1200,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80',
    sortOrder: 113,
  },
];

const CATEGORY_DEFINITIONS = [
  { name: 'Bleach', gender: 'women', description: 'Face and body bleaching treatments', sortOrder: 10 },
  { name: 'Dee Tan', gender: 'women', description: 'Sun tan removal and skin restoration therapy', sortOrder: 11 },
  { name: 'Hair Spa', gender: 'women', description: 'Revitalizing and restorative treatments for hair and scalp health', sortOrder: 12 },
  { name: 'Hair Forms', gender: 'women', description: 'Advanced smoothening, rebonding, keratin botox and biotin', sortOrder: 13 },
  { name: 'Pedicure & Manicure', gender: 'women', description: 'Luxury manicure, pedicure, crystal spa and nail grooming', sortOrder: 14 },
  { name: 'Facial', gender: 'women', description: 'Professional clean-up, facials and bridal glow treatments', sortOrder: 15 },
  { name: 'Add On Masque', gender: 'women', description: 'Revitalizing and charcoal masques add-ons', sortOrder: 16 },
  { name: 'Hair Cut', gender: 'women', description: 'Precision styling, layer cuts, feather, bob and kids haircut', sortOrder: 17 },
  { name: 'Crown Highlights & Colouring', gender: 'women', description: 'Root touch up, global colour, streaks and highlights', sortOrder: 18 },
  { name: 'Hair Wash, Blast Dry & Blow Dry', gender: 'women', description: 'Wash, blast dry, blow dry curls, ironing and styling', sortOrder: 19 },
];

async function seedWomenServices() {
  console.log('🔄 Starting Women Services update...');

  // 1. Remove existing services in women-only categories
  const existingWomenCategories = await prisma.serviceCategory.findMany({
    where: { gender: 'women' },
  });

  const existingWomenCatIds = existingWomenCategories.map((c) => c.id);

  if (existingWomenCatIds.length > 0) {
    const existingServices = await prisma.service.findMany({
      where: { categoryId: { in: existingWomenCatIds } },
      select: { id: true },
    });
    const sIds = existingServices.map((s) => s.id);
    if (sIds.length > 0) {
      await prisma.appointmentService.deleteMany({
        where: { serviceId: { in: sIds } },
      });
      await prisma.packageService.deleteMany({
        where: { serviceId: { in: sIds } },
      });
      await prisma.serviceProduct.deleteMany({
        where: { serviceId: { in: sIds } },
      });
      const deletedServices = await prisma.service.deleteMany({
        where: { id: { in: sIds } },
      });
      console.log(`🗑️ Removed ${deletedServices.count} existing women services.`);
    }
  }

  // 2. Ensure all 10 categories exist
  const categoryMap = new Map<string, string>();

  for (const catDef of CATEGORY_DEFINITIONS) {
    const existing = await prisma.serviceCategory.findFirst({
      where: { name: catDef.name, gender: 'women' },
    });

    if (existing) {
      await prisma.serviceCategory.update({
        where: { id: existing.id },
        data: {
          description: catDef.description,
          sortOrder: catDef.sortOrder,
          active: true,
        },
      });
      categoryMap.set(catDef.name, existing.id);
    } else {
      const created = await prisma.serviceCategory.create({
        data: {
          name: catDef.name,
          gender: catDef.gender,
          description: catDef.description,
          sortOrder: catDef.sortOrder,
          active: true,
        },
      });
      categoryMap.set(catDef.name, created.id);
    }
  }

  // 3. Insert all new services with faithful titles, exact prices, and appropriate photos
  console.log(`📦 Inserting ${WOMEN_SERVICES_SEED.length} new women services...`);

  for (const item of WOMEN_SERVICES_SEED) {
    const catId = categoryMap.get(item.categoryName);
    if (!catId) {
      console.warn(`Category not found: ${item.categoryName}`);
      continue;
    }

    await prisma.service.create({
      data: {
        name: item.name,
        duration: item.duration || 30,
        price: item.price,
        priceVisible: false,
        image: item.image,
        categoryId: catId,
        sortOrder: item.sortOrder,
        active: true,
      },
    });
  }

  console.log('✅ Successfully seeded all Women Services from the menu cards!');
}

seedWomenServices()
  .catch((e) => {
    console.error('❌ Error seeding women services:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
