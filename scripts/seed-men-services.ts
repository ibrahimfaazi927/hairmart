import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MenServiceItem {
  name: string;
  categoryName: string;
  price: number;
  duration?: number;
  image: string;
  description?: string;
  sortOrder: number;
}

const MEN_CATEGORIES_DEF = [
  {
    name: 'Hair Cut & Shave',
    gender: 'men',
    description: 'Precision haircuts, head shaves, beard trims & classic grooming for men',
    sortOrder: 1,
  },
  {
    name: 'Hair Colouring',
    gender: 'men',
    description: 'Professional grey coverage, fashion streaks, beard colour & Loreal shades',
    sortOrder: 2,
  },
  {
    name: 'Hair Spa & Massage',
    gender: 'men',
    description: 'Relaxing head oil massages, anti-dandruff care, and restorative hair spas',
    sortOrder: 3,
  },
  {
    name: 'Hair Forms',
    gender: 'men',
    description: 'Advanced smoothing, straightening, hair botox and biotin treatments',
    sortOrder: 4,
  },
  {
    name: 'Packages & Combos',
    gender: 'men',
    description: 'Value grooming combos and luxury groom makeover packages',
    sortOrder: 5,
  },
];

const MEN_SERVICES_DATA: MenServiceItem[] = [
  // ─── HAIR CUT & BEARD (Image 3) ───
  {
    name: 'Normal Hair Cut',
    categoryName: 'Hair Cut & Shave',
    price: 150,
    duration: 30,
    image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500&auto=format&fit=crop&q=80',
    description: 'Classic professional scissor & clipper haircut tailored to your face shape',
    sortOrder: 1,
  },
  {
    name: 'Shaving',
    categoryName: 'Hair Cut & Shave',
    price: 100,
    duration: 20,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&auto=format&fit=crop&q=80',
    description: 'Clean traditional razor shave with warm lather and soothing aftershave',
    sortOrder: 2,
  },
  {
    name: 'Change of Style',
    categoryName: 'Hair Cut & Shave',
    price: 200,
    duration: 40,
    image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=500&auto=format&fit=crop&q=80',
    description: 'Complete makeover haircut and modern restyling consultation',
    sortOrder: 3,
  },
  {
    name: 'Beard Setting',
    categoryName: 'Hair Cut & Shave',
    price: 100,
    duration: 20,
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&auto=format&fit=crop&q=80',
    description: 'Sharp razor edging, cheek line shaping, and precision beard grooming',
    sortOrder: 4,
  },
  {
    name: 'Head Shave',
    categoryName: 'Hair Cut & Shave',
    price: 150,
    duration: 30,
    image: 'https://images.unsplash.com/photo-1517832606589-7157be567160?w=500&auto=format&fit=crop&q=80',
    description: 'Smooth close head shave with hot towel prep and moisturizing finish',
    sortOrder: 5,
  },
  {
    name: 'Kids (upto 10 yrs)',
    categoryName: 'Hair Cut & Shave',
    price: 150,
    duration: 25,
    image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=500&auto=format&fit=crop&q=80',
    description: 'Gentle, patient haircut for boys under 10 years',
    sortOrder: 6,
  },
  {
    name: 'Head Shave for kids',
    categoryName: 'Hair Cut & Shave',
    price: 150,
    duration: 25,
    image: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=500&auto=format&fit=crop&q=80',
    description: 'Gentle ceremonial or regular close head shave for kids',
    sortOrder: 7,
  },
  {
    name: 'Beard design',
    categoryName: 'Hair Cut & Shave',
    price: 150,
    duration: 25,
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80',
    description: 'Custom sculpted beard outline, fades and artistic detailing',
    sortOrder: 8,
  },
  {
    name: 'Beard Trim',
    categoryName: 'Hair Cut & Shave',
    price: 100,
    duration: 15,
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80',
    description: 'Quick clipper length reduction, neat taper and mustache trim',
    sortOrder: 9,
  },
  {
    name: 'Hair wash & Setting',
    categoryName: 'Hair Cut & Shave',
    price: 100,
    duration: 20,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop&q=80',
    description: 'Deep scalp cleansing shampoo, conditioner and blow dry styling',
    sortOrder: 10,
  },
  {
    name: 'Head Oil Massage',
    categoryName: 'Hair Cut & Shave',
    price: 200,
    duration: 25,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop&q=80',
    description: 'Invigorating warm herbal oil acupressure scalp massage for relaxation',
    sortOrder: 11,
  },
  {
    name: 'Head Tonic Massage',
    categoryName: 'Hair Cut & Shave',
    price: 150,
    duration: 20,
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=500&auto=format&fit=crop&q=80',
    description: 'Cooling revitalizing hair tonic application with soothing scalp massage',
    sortOrder: 12,
  },
  {
    name: 'Head Wash',
    categoryName: 'Hair Cut & Shave',
    price: 100,
    duration: 15,
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&auto=format&fit=crop&q=80',
    description: 'Refreshing salon shampoo rinse and blast dry',
    sortOrder: 13,
  },

  // ─── HAIR COLOURING (Image 3) ───
  {
    name: 'Grey Coverage',
    categoryName: 'Hair Colouring',
    price: 550,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1522337094346-2917730e7845?w=500&auto=format&fit=crop&q=80',
    description: '100% natural grey hair concealment with lasting color richness',
    sortOrder: 14,
  },
  {
    name: 'Ammonia free Grey Coverage',
    categoryName: 'Hair Colouring',
    price: 750,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=500&auto=format&fit=crop&q=80',
    description: 'Gentle, odorless organic hair color with no scalp irritation',
    sortOrder: 15,
  },
  {
    name: 'Fashion Colour (onward)',
    categoryName: 'Hair Colouring',
    price: 1299,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=500&auto=format&fit=crop&q=80',
    description: 'Trendy fashion tones, ash blondes, burgundies and bespoke styling',
    sortOrder: 16,
  },
  {
    name: 'Loreal Colour',
    categoryName: 'Hair Colouring',
    price: 850,
    duration: 50,
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=500&auto=format&fit=crop&q=80',
    description: "Premium L'Oréal Professional salon coloring with deep gloss finish",
    sortOrder: 17,
  },
  {
    name: 'Beard Colour',
    categoryName: 'Hair Colouring',
    price: 200,
    duration: 25,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    description: 'Natural beard touch-up to blend greys and darken beard lines',
    sortOrder: 18,
  },
  {
    name: 'Streaks Colour',
    categoryName: 'Hair Colouring',
    price: 550,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80',
    description: 'Highlighted strands for dimensional depth and modern edge',
    sortOrder: 19,
  },
  {
    name: 'Crow Colour (onwards)',
    categoryName: 'Hair Colouring',
    price: 890,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=500&auto=format&fit=crop&q=80',
    description: 'Crown section specialized coloring and highlighting',
    sortOrder: 20,
  },
  {
    name: 'Normal Hair Black Colour',
    categoryName: 'Hair Colouring',
    price: 350,
    duration: 35,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
    description: 'Deep jet black traditional hair dyeing with long-lasting hold',
    sortOrder: 21,
  },

  // ─── HAIR SPA (Image 2) ───
  {
    name: 'Express Hair Spa',
    categoryName: 'Hair Spa & Massage',
    price: 500,
    duration: 30,
    image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=500&auto=format&fit=crop&q=80',
    description: 'Quick rejuvenating hair mask, steam and scalp stimulation',
    sortOrder: 22,
  },
  {
    name: 'Moisturizing Hair Spa',
    categoryName: 'Hair Spa & Massage',
    price: 550,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1512290903672-613d969176bf?w=500&auto=format&fit=crop&q=80',
    description: 'Intense moisture infusion to repair dry, brittle hair and restore shine',
    sortOrder: 23,
  },
  {
    name: 'Reparing Hair Spa',
    categoryName: 'Hair Spa & Massage',
    price: 650,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80',
    description: 'Deep keratin protein treatment to restore damaged hair fibers',
    sortOrder: 24,
  },
  {
    name: 'Fibre Clinix treatment',
    categoryName: 'Hair Spa & Massage',
    price: 950,
    duration: 50,
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500&auto=format&fit=crop&q=80',
    description: 'Schwarzkopf Fibre Clinix hyper-customized bond repairing salon treatment',
    sortOrder: 25,
  },
  {
    name: 'Head Massage',
    categoryName: 'Hair Spa & Massage',
    price: 150,
    duration: 20,
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500&auto=format&fit=crop&q=80',
    description: 'Relieves stress and promotes blood circulation to hair follicles',
    sortOrder: 26,
  },
  {
    name: 'Anti-dandruff treatment',
    categoryName: 'Hair Spa & Massage',
    price: 750,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1512690459411-b9245aed614b?w=500&auto=format&fit=crop&q=80',
    description: 'Medicinal exfoliating scalp treatment to clear flakes and soothe irritation',
    sortOrder: 27,
  },
  {
    name: 'Anti-Hair fall treatment',
    categoryName: 'Hair Spa & Massage',
    price: 800,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=500&auto=format&fit=crop&q=80',
    description: 'Root strengthening serum treatment with infrared scalp stimulation',
    sortOrder: 28,
  },

  // ─── HAIR FORMS (Image 2) ───
  {
    name: 'Straightening/Smoothing (onward)',
    categoryName: 'Hair Forms',
    price: 2550,
    duration: 90,
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500&auto=format&fit=crop&q=80',
    description: 'Permanent smoothing and frizz-free sleek hair transformation',
    sortOrder: 29,
  },
  {
    name: 'Botox (onward)',
    categoryName: 'Hair Forms',
    price: 3350,
    duration: 90,
    image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=500&auto=format&fit=crop&q=80',
    description: 'Deep conditioning Botox filler that restores youthful fullness and silkiness',
    sortOrder: 30,
  },
  {
    name: 'Biotin (onward)',
    categoryName: 'Hair Forms',
    price: 3999,
    duration: 90,
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=500&auto=format&fit=crop&q=80',
    description: 'High-potency biotin infusion therapy for ultra-strong hair texture',
    sortOrder: 31,
  },

  // ─── VALUE COMBOS (Image 2) ───
  {
    name: 'Cutting + Shaving / Beard Setting + Head Oil Massage + Head Wash',
    categoryName: 'Packages & Combos',
    price: 450,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&auto=format&fit=crop&q=80',
    description: 'Executive Men Combo: Cutting, Shaving or Beard Setting, Head Oil Massage & Head Wash (Worth ₹700)',
    sortOrder: 32,
  },
  {
    name: 'Cutting + Shaving / Beard Setting + Head Oil Massage + Head Wash + Face Massage',
    categoryName: 'Packages & Combos',
    price: 999,
    duration: 80,
    image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500&auto=format&fit=crop&q=80',
    description: 'Deluxe Men Combo: Cutting, Shaving/Beard Setting, Head Oil Massage, Head Wash & Soothing Face Massage (Worth ₹1100)',
    sortOrder: 33,
  },

  // ─── PACKAGES (Image 1) ───
  {
    name: 'Groom Package',
    categoryName: 'Packages & Combos',
    price: 4999,
    duration: 150,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    description: 'Complete Groom Makeover: Hair Cut + Beard Design + Citrus Manicure + Citrus Pedicure + Gold Facial + Moisturizing Hair Spa (Worth ₹5300)',
    sortOrder: 34,
  },
  {
    name: 'Premium Package',
    categoryName: 'Packages & Combos',
    price: 6999,
    duration: 180,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
    description: 'Royal Luxury Package: Hair Cut + Beard Design + Crystal Spa Manicure + Crystal Spa Pedicure + Bridal Glow Facial + Fibre Clinix + De Tan Face & Neck + Back Massage (Worth ₹8050)',
    sortOrder: 35,
  },
];

async function seedMenServices() {
  console.log('🧔 Starting Men Services Seeding...');

  // 1. Ensure Categories Exist
  const categoryMap = new Map<string, string>();

  for (const cat of MEN_CATEGORIES_DEF) {
    const existing = await prisma.serviceCategory.findFirst({
      where: { name: cat.name },
    });

    if (existing) {
      const updated = await prisma.serviceCategory.update({
        where: { id: existing.id },
        data: {
          gender: 'men',
          description: cat.description,
          sortOrder: cat.sortOrder,
          active: true,
        },
      });
      categoryMap.set(cat.name, updated.id);
      console.log(`~ Category ready: ${cat.name}`);
    } else {
      const created = await prisma.serviceCategory.create({
        data: {
          name: cat.name,
          gender: 'men',
          description: cat.description,
          sortOrder: cat.sortOrder,
          active: true,
        },
      });
      categoryMap.set(cat.name, created.id);
      console.log(`+ Category created: ${cat.name}`);
    }
  }

  // 2. Insert or update services
  console.log(`📦 Upserting ${MEN_SERVICES_DATA.length} Men Services...`);

  let added = 0;
  let updated = 0;

  for (const item of MEN_SERVICES_DATA) {
    const catId = categoryMap.get(item.categoryName);
    if (!catId) {
      console.error(`Category not found for: ${item.categoryName}`);
      continue;
    }

    // Check if service already exists by name (case-insensitive)
    const existing = await prisma.service.findFirst({
      where: {
        name: {
          equals: item.name,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      await prisma.service.update({
        where: { id: existing.id },
        data: {
          name: item.name,
          price: item.price,
          duration: item.duration || 30,
          description: item.description,
          image: item.image,
          categoryId: catId,
          sortOrder: item.sortOrder,
          active: true,
        },
      });
      updated++;
    } else {
      await prisma.service.create({
        data: {
          name: item.name,
          price: item.price,
          duration: item.duration || 30,
          description: item.description,
          image: item.image,
          categoryId: catId,
          sortOrder: item.sortOrder,
          active: true,
        },
      });
      added++;
    }
  }

  console.log(`✅ Completed! Added: ${added}, Updated: ${updated}`);
  const totalMen = await prisma.service.count({
    where: { category: { gender: 'men' } },
  });
  console.log(`🎉 Total active Men Services in catalogue: ${totalMen}`);
}

seedMenServices()
  .catch((e) => {
    console.error('❌ Error seeding men services:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
