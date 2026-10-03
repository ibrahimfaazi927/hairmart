import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Hair Mart salon database with authentic service catalogue & products...');

  // 1. Clear existing seed data if any
  await prisma.serviceProduct.deleteMany({});
  await prisma.packageService.deleteMany({});
  await prisma.appointmentService.deleteMany({});
  await prisma.appointmentProduct.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.serviceCategory.deleteMany({});
  await prisma.package.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.salonSetting.deleteMany({});

  // 2. Create Default Admin
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

if (!adminPassword) {
  throw new Error('SEED_ADMIN_PASSWORD is required');
}

const hashedPassword = await bcrypt.hash(adminPassword, 10);
  await prisma.user.create({
    data: {
      name: 'Sameer',
      email: 'Sameer',
      password: hashedPassword,
      role: 'admin',
      active: true,
    },
  });
  console.log('Admin user created (ID: Sameer)');

  // 3. Create Service Categories
  const catWomenHairSpa = await prisma.serviceCategory.create({
    data: {
      name: 'Hair Spa',
      gender: 'women',
      description: 'Revitalizing and restorative treatments for hair and scalp health',
      sortOrder: 1,
    },
  });

  const catWomenHairForms = await prisma.serviceCategory.create({
    data: {
      name: 'Hair Forms',
      gender: 'women',
      description: 'Advanced straightening, botox, and smoothing transformations',
      sortOrder: 2,
    },
  });

  const catMenHairCut = await prisma.serviceCategory.create({
    data: {
      name: 'Hair Cut & Shave',
      gender: 'men',
      description: 'Precision haircuts, head shaves, and custom beard grooming',
      sortOrder: 3,
    },
  });

  const catMenHairColouring = await prisma.serviceCategory.create({
    data: {
      name: 'Hair Colouring',
      gender: 'men',
      description: 'Professional grey coverage, fashion streaks, and premium colour treatments',
      sortOrder: 4,
    },
  });

  const catFacialCare = await prisma.serviceCategory.create({
    data: {
      name: 'Facial & Skin Care',
      gender: 'unisex',
      description: 'Professional facial treatments with genuine salon-grade kits',
      sortOrder: 5,
    },
  });

  // 4. Create Professional Products
  const prodO3Plus = await prisma.product.create({
    data: {
      name: 'Shine & Glow Kit (Single Use)',
      brand: 'O3+ Professional',
      description: 'Single-use professional facial kit designed & developed in Italy for radiant skin glow.',
      professional: true,
      sortOrder: 1,
    },
  });

  const prodNaturesEssence = await prisma.product.create({
    data: {
      name: 'Advanced Glowing Gold Facial Kit',
      brand: "Nature's Essence",
      description: 'Professional gold kit containing Cleanser, Scrub, Massage Cream, Gel, and Pack.',
      professional: true,
      sortOrder: 2,
    },
  });

  const prodLotus = await prisma.product.create({
    data: {
      name: 'Bridal Glow Skin Whitening Facial Kit',
      brand: 'Lotus Professional',
      description: 'Professional bridal glow treatment kit for bridal and radiant occasion prep.',
      professional: true,
      sortOrder: 3,
    },
  });

  // 5. Create Women's Services
  const womenServicesData = [
    { name: 'Express Hair Spa', duration: 30, price: 650, catId: catWomenHairSpa.id, sortOrder: 1 },
    { name: 'Moisturizing Hair Spa', duration: 45, price: 950, catId: catWomenHairSpa.id, sortOrder: 2 },
    { name: 'Repairing Hair Spa', duration: 60, price: 1200, catId: catWomenHairSpa.id, sortOrder: 3 },
    { name: 'Fibre Clinix Treatment', duration: 60, price: 1600, catId: catWomenHairSpa.id, sortOrder: 4 },
    { name: 'Head Massage', duration: 20, price: 400, catId: catWomenHairSpa.id, sortOrder: 5 },
    { name: 'Anti-Dandruff Treatment', duration: 45, price: 1100, catId: catWomenHairSpa.id, sortOrder: 6 },
    { name: 'Anti-Hair Fall Treatment', duration: 45, price: 1300, catId: catWomenHairSpa.id, sortOrder: 7 },
    { name: 'Straightening / Smoothing', duration: 120, price: 3500, catId: catWomenHairForms.id, sortOrder: 8 },
    { name: 'Botox', duration: 90, price: 3000, catId: catWomenHairForms.id, sortOrder: 9 },
    { name: 'Biotin', duration: 90, price: 2800, catId: catWomenHairForms.id, sortOrder: 10 },
  ];

  const createdServices: Record<string, any> = {};

  for (const s of womenServicesData) {
    const service = await prisma.service.create({
      data: {
        name: s.name,
        duration: s.duration,
        price: s.price, // Internal price for billing only; hidden on public pages
        priceVisible: false,
        categoryId: s.catId,
        sortOrder: s.sortOrder,
      },
    });
    createdServices[s.name] = service;
  }

  // 6. Create Men's Services
  const menServicesData = [
    { name: 'Normal Hair Cut', duration: 30, price: 250, catId: catMenHairCut.id, sortOrder: 1 },
    { name: 'Shaving', duration: 20, price: 150, catId: catMenHairCut.id, sortOrder: 2 },
    { name: 'Change of Style', duration: 45, price: 400, catId: catMenHairCut.id, sortOrder: 3 },
    { name: 'Beard Setting', duration: 20, price: 200, catId: catMenHairCut.id, sortOrder: 4 },
    { name: 'Head Shave', duration: 25, price: 250, catId: catMenHairCut.id, sortOrder: 5 },
    { name: 'Kids Hair Cut / Kids (up to 10 yrs)', duration: 20, price: 200, catId: catMenHairCut.id, sortOrder: 6 },
    { name: 'Head Shave for Kids', duration: 20, price: 200, catId: catMenHairCut.id, sortOrder: 7 },
    { name: 'Beard Design', duration: 25, price: 250, catId: catMenHairCut.id, sortOrder: 8 },
    { name: 'Beard Trim', duration: 15, price: 150, catId: catMenHairCut.id, sortOrder: 9 },
    { name: 'Hair Wash & Setting', duration: 20, price: 200, catId: catMenHairCut.id, sortOrder: 10 },
    { name: 'Head Oil Massage', duration: 20, price: 300, catId: catMenHairCut.id, sortOrder: 11 },
    { name: 'Head Tonic Massage', duration: 20, price: 350, catId: catMenHairCut.id, sortOrder: 12 },
    { name: 'Head Wash', duration: 15, price: 150, catId: catMenHairCut.id, sortOrder: 13 },

    { name: 'Grey Coverage', duration: 45, price: 500, catId: catMenHairColouring.id, sortOrder: 14 },
    { name: 'Ammonia Free Grey Coverage', duration: 45, price: 700, catId: catMenHairColouring.id, sortOrder: 15 },
    { name: 'Fashion Colour', duration: 60, price: 1200, catId: catMenHairColouring.id, sortOrder: 16 },
    { name: 'L\'Oréal Colour', duration: 60, price: 1000, catId: catMenHairColouring.id, sortOrder: 17 },
    { name: 'Beard Colour', duration: 30, price: 400, catId: catMenHairColouring.id, sortOrder: 18 },
    { name: 'Streaks Colour', duration: 60, price: 1400, catId: catMenHairColouring.id, sortOrder: 19 },
    { name: 'Crown Colour', duration: 40, price: 800, catId: catMenHairColouring.id, sortOrder: 20 },
    { name: 'Normal Hair Black Colour', duration: 40, price: 450, catId: catMenHairColouring.id, sortOrder: 21 },
  ];

  for (const s of menServicesData) {
    const service = await prisma.service.create({
      data: {
        name: s.name,
        duration: s.duration,
        price: s.price,
        priceVisible: false,
        categoryId: s.catId,
        sortOrder: s.sortOrder,
      },
    });
    createdServices[s.name] = service;
  }

  // 7. Create Facial Services with Product Relationship
  const goldFacial = await prisma.service.create({
    data: {
      name: 'Gold Facial',
      description: 'Luxury gold rejuvenation facial with Nature\'s Essence Glowing Gold professional kit',
      duration: 60,
      price: 1500,
      priceVisible: false,
      categoryId: catFacialCare.id,
      sortOrder: 1,
    },
  });
  createdServices['Gold Facial'] = goldFacial;

  // Link Gold Facial -> Nature's Essence Product
  await prisma.serviceProduct.create({
    data: {
      serviceId: goldFacial.id,
      productId: prodNaturesEssence.id,
    },
  });

  const bridalGlowFacial = await prisma.service.create({
    data: {
      name: 'Bridal Glow Facial',
      description: 'Illuminating bridal skin preparation with Lotus Professional kit',
      duration: 75,
      price: 2200,
      priceVisible: false,
      categoryId: catFacialCare.id,
      sortOrder: 2,
    },
  });
  createdServices['Bridal Glow Facial'] = bridalGlowFacial;

  // Link Bridal Glow Facial -> Lotus Product
  await prisma.serviceProduct.create({
    data: {
      serviceId: bridalGlowFacial.id,
      productId: prodLotus.id,
    },
  });

  // Additional services for packages
  const citrusManicure = await prisma.service.create({
    data: { name: 'Citrus Manicure', duration: 30, price: 400, priceVisible: false, categoryId: catFacialCare.id, sortOrder: 3 },
  });
  const citrusPedicure = await prisma.service.create({
    data: { name: 'Citrus Pedicure', duration: 40, price: 500, priceVisible: false, categoryId: catFacialCare.id, sortOrder: 4 },
  });
  const crystalSpaManicure = await prisma.service.create({
    data: { name: 'Crystal Spa Manicure', duration: 40, price: 600, priceVisible: false, categoryId: catFacialCare.id, sortOrder: 5 },
  });
  const crystalSpaPedicure = await prisma.service.create({
    data: { name: 'Crystal Spa Pedicure', duration: 50, price: 750, priceVisible: false, categoryId: catFacialCare.id, sortOrder: 6 },
  });
  const deTanFaceNeck = await prisma.service.create({
    data: { name: 'De Tan Face & Neck', duration: 30, price: 500, priceVisible: false, categoryId: catFacialCare.id, sortOrder: 7 },
  });
  const backMassage = await prisma.service.create({
    data: { name: 'Back Massage', duration: 30, price: 600, priceVisible: false, categoryId: catFacialCare.id, sortOrder: 8 },
  });

  // 8. Create Packages
  const groomPkg = await prisma.package.create({
    data: {
      name: 'Groom Package',
      description: 'Comprehensive grooming combining haircut, beard design, manicure, pedicure, gold facial, and moisturizing hair spa.',
      price: 3200,
      priceVisible: false,
      sortOrder: 1,
    },
  });

  const groomServicesList = [
    createdServices['Normal Hair Cut'],
    createdServices['Beard Design'],
    citrusManicure,
    citrusPedicure,
    goldFacial,
    createdServices['Moisturizing Hair Spa'],
  ];

  for (const s of groomServicesList) {
    if (s) {
      await prisma.packageService.create({
        data: { packageId: groomPkg.id, serviceId: s.id },
      });
    }
  }

  const premiumPkg = await prisma.package.create({
    data: {
      name: 'Premium Package',
      description: 'Ultimate salon care package with crystal spa manicure & pedicure, bridal glow facial, fibre clinix, and back massage.',
      price: 5500,
      priceVisible: false,
      sortOrder: 2,
    },
  });

  const premiumServicesList = [
    createdServices['Normal Hair Cut'],
    createdServices['Beard Design'],
    crystalSpaManicure,
    crystalSpaPedicure,
    bridalGlowFacial,
    createdServices['Fibre Clinix Treatment'],
    deTanFaceNeck,
    backMassage,
  ];

  for (const s of premiumServicesList) {
    if (s) {
      await prisma.packageService.create({
        data: { packageId: premiumPkg.id, serviceId: s.id },
      });
    }
  }

  // 9. Default Salon Settings (Configurable by admin)
  const defaultSettings = [
    { key: 'salon_name', value: 'Hair Mart Unisex Salon', group: 'general' },
    { key: 'salon_phone', value: '+91 [Phone Number]', group: 'contact' },
    { key: 'salon_whatsapp', value: '+91 [WhatsApp Number]', group: 'contact' },
    { key: 'salon_email', value: 'contact@hairmart.com', group: 'contact' },
    { key: 'salon_address', value: '[Salon Address Line, City, State]', group: 'contact' },
    { key: 'salon_hours', value: 'Mon-Sat: 9:30 AM - 9:00 PM | Sun: 10:00 AM - 8:30 PM', group: 'contact' },
    { key: 'whatsapp_auto_booking', value: 'true', group: 'whatsapp' },
    { key: 'whatsapp_auto_reminder', value: 'true', group: 'whatsapp' },
    { key: 'payment_gateway_enabled', value: 'false', group: 'payment' },
  ];

  for (const set of defaultSettings) {
    await prisma.salonSetting.create({ data: set });
  }

  console.log('Database successfully seeded with authentic Hair Mart services & products.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
