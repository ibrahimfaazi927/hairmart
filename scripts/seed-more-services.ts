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

const CATEGORY_DEFS = [
  {
    name: 'Threading',
    gender: 'women',
    description: 'Precision eyebrow shaping and gentle facial hair threading',
    sortOrder: 6,
  },
  {
    name: 'Waxing',
    gender: 'women',
    description: 'Classic strip waxing, Rica liposoluble waxing, and Brazilian peel-off waxing',
    sortOrder: 7,
  },
  {
    name: 'Clean Up',
    gender: 'women',
    description: 'Deep pore cleansing, blackhead extraction, and instant hydration treatments',
    sortOrder: 8,
  },
  {
    name: 'Facial',
    gender: 'women',
    description: 'Luxury salon facials, glow therapy, and herbal skin rejuvenation',
    sortOrder: 9,
  },
  {
    name: 'Dee Tan',
    gender: 'women',
    description: 'Specialized tan removal therapy for face, arms, and full body',
    sortOrder: 10,
  },
  {
    name: 'Packages',
    gender: 'women',
    description: 'Luxury full-service head-to-toe beauty and makeover packages',
    sortOrder: 25,
  },
];

const NEW_SERVICES: ServiceSeedItem[] = [
  // ─── THREADING (Image 1) ───
  {
    name: 'Threading - Eyebrows',
    categoryName: 'Threading',
    price: 50,
    duration: 10,
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=500&auto=format&fit=crop&q=80',
    description: 'Precision eyebrow threading and arch styling',
    sortOrder: 1,
  },
  {
    name: 'Threading - Upper Lip',
    categoryName: 'Threading',
    price: 40,
    duration: 5,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&auto=format&fit=crop&q=80',
    description: 'Gentle upper lip hair threading',
    sortOrder: 2,
  },
  {
    name: 'Threading - Chin & Neck',
    categoryName: 'Threading',
    price: 50,
    duration: 10,
    image: 'https://images.unsplash.com/photo-1512290903672-613d969176bf?w=500&auto=format&fit=crop&q=80',
    description: 'Smooth chin and neck line threading',
    sortOrder: 3,
  },
  {
    name: 'Threading - Forehead',
    categoryName: 'Threading',
    price: 50,
    duration: 10,
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=500&auto=format&fit=crop&q=80',
    description: 'Forehead hairline threading and cleansing',
    sortOrder: 4,
  },
  {
    name: 'Threading - Sides',
    categoryName: 'Threading',
    price: 50,
    duration: 10,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80',
    description: 'Sideburns and cheek boundary threading',
    sortOrder: 5,
  },
  {
    name: 'Threading - Full Face',
    categoryName: 'Threading',
    price: 199,
    duration: 25,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop&q=80',
    description: 'Complete full face threading including eyebrows, upper lip, chin & forehead',
    sortOrder: 6,
  },

  // ─── CLEAN UP (Image 2) ───
  {
    name: 'Fruit Clean Up',
    categoryName: 'Clean Up',
    price: 550,
    duration: 35,
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=500&auto=format&fit=crop&q=80',
    description: 'Refreshing natural fruit extract cleansing and gentle exfoliation',
    sortOrder: 1,
  },
  {
    name: 'Lotus Clean Up',
    categoryName: 'Clean Up',
    price: 999,
    duration: 40,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&auto=format&fit=crop&q=80',
    description: 'Lotus herbals deep pore cleansing and revitalizing therapy',
    sortOrder: 2,
  },
  {
    name: 'Mango Clean Up',
    categoryName: 'Clean Up',
    price: 650,
    duration: 40,
    image: 'https://images.unsplash.com/photo-1512290903672-613d969176bf?w=500&auto=format&fit=crop&q=80',
    description: 'Rich mango butter nourishing clean up for glowing supple skin',
    sortOrder: 3,
  },
  {
    name: 'Gold Clean Up',
    categoryName: 'Clean Up',
    price: 1499,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=500&auto=format&fit=crop&q=80',
    description: 'Gold dust radiance cleansing with brightening finish',
    sortOrder: 4,
  },
  {
    name: 'Diamond Clean Up',
    categoryName: 'Clean Up',
    price: 1299,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80',
    description: 'Diamond micro-crystal pore polish and skin brightening',
    sortOrder: 5,
  },
  {
    name: 'Wine Clean Up',
    categoryName: 'Clean Up',
    price: 1999,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=500&auto=format&fit=crop&q=80',
    description: 'Red wine polyphenol anti-oxidant deep cleansing treatment',
    sortOrder: 6,
  },
  {
    name: 'Raaga Clean Up',
    categoryName: 'Clean Up',
    price: 1450,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop&q=80',
    description: 'Raaga professional detan and deep purifying clean up',
    sortOrder: 7,
  },

  // ─── FACIAL (Image 2) ───
  {
    name: 'Fruit Facial',
    categoryName: 'Facial',
    price: 1550,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&auto=format&fit=crop&q=80',
    description: 'Full multi-step fruit enzyme facial for natural glow and hydration',
    sortOrder: 1,
  },
  {
    name: 'Lotus Facial',
    categoryName: 'Facial',
    price: 1499,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=500&auto=format&fit=crop&q=80',
    description: 'Lotus professional botanical radiance and soothing facial treatment',
    sortOrder: 2,
  },
  {
    name: 'Mango Facial',
    categoryName: 'Facial',
    price: 1299,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1512290903672-613d969176bf?w=500&auto=format&fit=crop&q=80',
    description: 'Nourishing tropical mango vitamin infused facial for velvety soft skin',
    sortOrder: 3,
  },
  {
    name: 'Gold Facial',
    categoryName: 'Facial',
    price: 2999,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=500&auto=format&fit=crop&q=80',
    description: '24K gold foil luxury facial for bridal shimmer and firming skin',
    sortOrder: 4,
  },
  {
    name: 'Diamond Facial',
    categoryName: 'Facial',
    price: 2499,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80',
    description: 'Diamond spark micro-polishing facial for luminous crystal complexion',
    sortOrder: 5,
  },
  {
    name: 'Wine Facial',
    categoryName: 'Facial',
    price: 2499,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=500&auto=format&fit=crop&q=80',
    description: 'French red grape antioxidant facial fighting signs of aging and fatigue',
    sortOrder: 6,
  },
  {
    name: 'Raaga Facial',
    categoryName: 'Facial',
    price: 2999,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop&q=80',
    description: 'Raaga professional salon-grade intensive repair and glow facial',
    sortOrder: 7,
  },

  // ─── D-TAN (Image 2) ───
  {
    name: 'D - Tan - Ozone',
    categoryName: 'Dee Tan',
    price: 450,
    duration: 30,
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=500&auto=format&fit=crop&q=80',
    description: 'Ozone organic active de-tan treatment for instant brightness',
    sortOrder: 15,
  },
  {
    name: 'Oxy glow - D - Tan',
    categoryName: 'Dee Tan',
    price: 750,
    duration: 30,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&auto=format&fit=crop&q=80',
    description: 'Oxyglow oxygen-boosted deep tan removal therapy',
    sortOrder: 16,
  },
  {
    name: 'Raaga - D - Tan',
    categoryName: 'Dee Tan',
    price: 999,
    duration: 35,
    image: 'https://images.unsplash.com/photo-1512290903672-613d969176bf?w=500&auto=format&fit=crop&q=80',
    description: 'Raaga professional tan removal with Kojic acid and Milk extracts',
    sortOrder: 17,
  },
  {
    name: 'O3 Plus - D - Tan',
    categoryName: 'Dee Tan',
    price: 850,
    duration: 35,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80',
    description: 'O3+ Professional Italy D-Tan pack for stubborn sun tan removal',
    sortOrder: 18,
  },
  {
    name: 'Natures - D - Tan',
    categoryName: 'Dee Tan',
    price: 1299,
    duration: 40,
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=500&auto=format&fit=crop&q=80',
    description: "Nature's Essence lacto-bleach enhanced deep herbal tan removal",
    sortOrder: 19,
  },

  // ─── LUXURY PACKAGE (Image 3) ───
  {
    name: 'Luxury Package (First Sitting)',
    categoryName: 'Packages',
    price: 3999,
    duration: 120,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop&q=80',
    description: 'Includes Head Massage + Regular Pedicure + Regular Manicure + Fruit Facial + Full Arm De Tan (Original ₹5000, Save ₹1001)',
    sortOrder: 1,
  },

  // ─── CLASSIC WAXING (Image 4) ───
  {
    name: 'Classic Wax - Full Hand',
    categoryName: 'Waxing',
    price: 350,
    duration: 25,
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=500&auto=format&fit=crop&q=80',
    description: 'Classic warm honey waxing for full hands and fingers',
    sortOrder: 1,
  },
  {
    name: 'Classic Wax - Half Hand',
    categoryName: 'Waxing',
    price: 300,
    duration: 20,
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500&auto=format&fit=crop&q=80',
    description: 'Classic warm waxing for half hands',
    sortOrder: 2,
  },
  {
    name: 'Classic Wax - Full Legs',
    categoryName: 'Waxing',
    price: 500,
    duration: 35,
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=500&auto=format&fit=crop&q=80',
    description: 'Smooth classic waxing for full legs from thigh to ankle',
    sortOrder: 3,
  },
  {
    name: 'Classic Wax - Half Legs',
    categoryName: 'Waxing',
    price: 450,
    duration: 25,
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=500&auto=format&fit=crop&q=80',
    description: 'Classic waxing for lower half legs',
    sortOrder: 4,
  },
  {
    name: 'Classic Wax - Under Arms',
    categoryName: 'Waxing',
    price: 200,
    duration: 15,
    image: 'https://images.unsplash.com/photo-1512290903672-613d969176bf?w=500&auto=format&fit=crop&q=80',
    description: 'Clean and gentle underarm waxing',
    sortOrder: 5,
  },
  {
    name: 'Classic Wax - Full Waxing Combo (FA+FL+UA)',
    categoryName: 'Waxing',
    price: 699,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop&q=80',
    description: 'Value combo: Full Arms + Full Legs + Under Arms classic waxing',
    sortOrder: 6,
  },
  {
    name: 'Classic Wax - Full Front',
    categoryName: 'Waxing',
    price: 450,
    duration: 25,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&auto=format&fit=crop&q=80',
    description: 'Classic waxing for full front chest area',
    sortOrder: 7,
  },
  {
    name: 'Classic Wax - Midriff',
    categoryName: 'Waxing',
    price: 450,
    duration: 20,
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=500&auto=format&fit=crop&q=80',
    description: 'Classic stomach and midriff waxing',
    sortOrder: 8,
  },
  {
    name: 'Classic Wax - Bikini Line',
    categoryName: 'Waxing',
    price: 550,
    duration: 20,
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=500&auto=format&fit=crop&q=80',
    description: 'Hygienic bikini line waxing',
    sortOrder: 9,
  },
  {
    name: 'Classic Wax - Full Bikini',
    categoryName: 'Waxing',
    price: 1200,
    duration: 35,
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500&auto=format&fit=crop&q=80',
    description: 'Complete intimate bikini waxing',
    sortOrder: 10,
  },
  {
    name: 'Classic Wax - Full Body',
    categoryName: 'Waxing',
    price: 1800,
    duration: 90,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop&q=80',
    description: 'Comprehensive full body classic waxing (arms, legs, back, front)',
    sortOrder: 11,
  },
  {
    name: 'Classic Wax - Chin Wax',
    categoryName: 'Waxing',
    price: 80,
    duration: 10,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80',
    description: 'Quick gentle chin waxing',
    sortOrder: 12,
  },
  {
    name: 'Classic Wax - Upper Lip',
    categoryName: 'Waxing',
    price: 50,
    duration: 10,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&auto=format&fit=crop&q=80',
    description: 'Quick upper lip wax',
    sortOrder: 13,
  },
  {
    name: 'Classic Wax - Face',
    categoryName: 'Waxing',
    price: 200,
    duration: 15,
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=500&auto=format&fit=crop&q=80',
    description: 'Gentle facial waxing excluding eyebrows',
    sortOrder: 14,
  },

  // ─── RICA LIPOSOLUBLE WAXING (Image 4) ───
  {
    name: 'Rica Wax - Full Hand',
    categoryName: 'Waxing',
    price: 500,
    duration: 25,
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=500&auto=format&fit=crop&q=80',
    description: 'Italian Rica liposoluble wax for sensitive skin, zero redness',
    sortOrder: 20,
  },
  {
    name: 'Rica Wax - Half Hand',
    categoryName: 'Waxing',
    price: 400,
    duration: 20,
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500&auto=format&fit=crop&q=80',
    description: 'Italian Rica wax for half hands',
    sortOrder: 21,
  },
  {
    name: 'Rica Wax - Full Legs',
    categoryName: 'Waxing',
    price: 750,
    duration: 35,
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=500&auto=format&fit=crop&q=80',
    description: 'Italian Rica liposoluble wax for full legs with smooth glow',
    sortOrder: 22,
  },
  {
    name: 'Rica Wax - Half Legs',
    categoryName: 'Waxing',
    price: 600,
    duration: 25,
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=500&auto=format&fit=crop&q=80',
    description: 'Italian Rica wax for half legs',
    sortOrder: 23,
  },
  {
    name: 'Rica Wax - Under Arms',
    categoryName: 'Waxing',
    price: 220,
    duration: 15,
    image: 'https://images.unsplash.com/photo-1512290903672-613d969176bf?w=500&auto=format&fit=crop&q=80',
    description: 'Gentle Rica wax for sensitive underarm skin with de-tanning effect',
    sortOrder: 24,
  },
  {
    name: 'Rica Wax - Full Waxing Combo (FA+FL+UA)',
    categoryName: 'Waxing',
    price: 1999,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop&q=80',
    description: 'Premium Rica package: Full Arms + Full Legs + Under Arms',
    sortOrder: 25,
  },
  {
    name: 'Rica Wax - Full Front Wax',
    categoryName: 'Waxing',
    price: 600,
    duration: 25,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&auto=format&fit=crop&q=80',
    description: 'Rica gentle waxing for front torso',
    sortOrder: 26,
  },
  {
    name: 'Rica Wax - Midriff',
    categoryName: 'Waxing',
    price: 500,
    duration: 20,
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=500&auto=format&fit=crop&q=80',
    description: 'Rica liposoluble waxing for stomach / midriff',
    sortOrder: 27,
  },
  {
    name: 'Rica Wax - Bikini Line',
    categoryName: 'Waxing',
    price: 550,
    duration: 20,
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=500&auto=format&fit=crop&q=80',
    description: 'Rica soothing wax for bikini line',
    sortOrder: 28,
  },
  {
    name: 'Rica Wax - Full Bikini',
    categoryName: 'Waxing',
    price: 1500,
    duration: 35,
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500&auto=format&fit=crop&q=80',
    description: 'Complete intimate Rica liposoluble waxing',
    sortOrder: 29,
  },
  {
    name: 'Rica Wax - Full Body (other than Face & Bikini)',
    categoryName: 'Waxing',
    price: 2500,
    duration: 90,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop&q=80',
    description: 'Full body Italian Rica wax (Full Arms, Full Legs, Full Back, Full Front)',
    sortOrder: 30,
  },

  // ─── BRAZILIAN PEEL-OFF WAX (Image 4) ───
  {
    name: 'Brazilian Wax - Full Face',
    categoryName: 'Waxing',
    price: 400,
    duration: 25,
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=500&auto=format&fit=crop&q=80',
    description: 'Painless Brazilian peel-off hot wax for full face',
    sortOrder: 35,
  },
  {
    name: 'Brazilian Wax - Upper Lip',
    categoryName: 'Waxing',
    price: 150,
    duration: 10,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&auto=format&fit=crop&q=80',
    description: 'Brazilian peel-off strip-less wax for upper lip',
    sortOrder: 36,
  },
  {
    name: 'Brazilian Wax - Chin',
    categoryName: 'Waxing',
    price: 100,
    duration: 10,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80',
    description: 'Brazilian peel-off wax for chin',
    sortOrder: 37,
  },
  {
    name: 'Brazilian Wax - Under Arms',
    categoryName: 'Waxing',
    price: 250,
    duration: 15,
    image: 'https://images.unsplash.com/photo-1512290903672-613d969176bf?w=500&auto=format&fit=crop&q=80',
    description: 'Painless strip-less Brazilian peel-off wax for underarms',
    sortOrder: 38,
  },
];

async function seed() {
  console.log('🌟 Synchronizing categories & new salon services from price cards...');

  // 1. Ensure categories exist
  const categoryMap = new Map<string, string>();

  for (const def of CATEGORY_DEFS) {
    let cat = await prisma.serviceCategory.findFirst({
      where: { name: def.name },
    });

    if (!cat) {
      cat = await prisma.serviceCategory.create({
        data: {
          name: def.name,
          gender: def.gender,
          description: def.description,
          sortOrder: def.sortOrder,
          active: true,
        },
      });
      console.log(`+ Created category: ${def.name}`);
    } else {
      cat = await prisma.serviceCategory.update({
        where: { id: cat.id },
        data: {
          gender: def.gender,
          description: def.description || cat.description,
          active: true,
        },
      });
      console.log(`~ Updated category: ${def.name}`);
    }
    categoryMap.set(def.name, cat.id);
  }

  // Also map any other existing categories
  const allCats = await prisma.serviceCategory.findMany();
  for (const c of allCats) {
    if (!categoryMap.has(c.name)) {
      categoryMap.set(c.name, c.id);
    }
  }

  // 2. Upsert services
  let added = 0;
  let updated = 0;

  for (const item of NEW_SERVICES) {
    const catId = categoryMap.get(item.categoryName);
    if (!catId) {
      console.error(`Missing category for: ${item.name} (${item.categoryName})`);
      continue;
    }

    const existing = await prisma.service.findFirst({
      where: {
        name: { equals: item.name },
      },
    });

    if (existing) {
      await prisma.service.update({
        where: { id: existing.id },
        data: {
          price: item.price,
          duration: item.duration,
          image: item.image,
          description: item.description,
          categoryId: catId,
          active: true,
          sortOrder: item.sortOrder,
        },
      });
      updated++;
    } else {
      await prisma.service.create({
        data: {
          name: item.name,
          price: item.price,
          duration: item.duration,
          image: item.image,
          description: item.description,
          categoryId: catId,
          active: true,
          sortOrder: item.sortOrder,
        },
      });
      added++;
    }
  }

  console.log(`✅ Completed: ${added} new services added, ${updated} existing updated.`);
  const total = await prisma.service.count({ where: { active: true } });
  console.log(`🎉 Total active services in catalogue: ${total}`);
}

seed()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
