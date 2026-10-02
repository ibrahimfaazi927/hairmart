import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SERVICE_IMAGES: Record<string, string> = {
  'normal hair cut': 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500&auto=format&fit=crop&q=80',
  'change of style': 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=500&auto=format&fit=crop&q=80',
  'kids hair cut / kids (up to 10 yrs)': 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=500&auto=format&fit=crop&q=80',
  'head shave': 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&auto=format&fit=crop&q=80',
  'head shave for kids': 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=500&auto=format&fit=crop&q=80',
  'shaving': 'https://images.unsplash.com/photo-1512690459411-b9245aed614b?w=500&auto=format&fit=crop&q=80',
  'beard setting': 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&auto=format&fit=crop&q=80',
  'beard design': 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&auto=format&fit=crop&q=80',
  'beard trim': 'https://images.unsplash.com/photo-1517832606589-7629c3397143?w=500&auto=format&fit=crop&q=80',
  'express hair spa': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop&q=80',
  'moisturizing hair spa': 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=500&auto=format&fit=crop&q=80',
  'repairing hair spa': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80',
  'fibre clinix treatment': 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=500&auto=format&fit=crop&q=80',
  'head massage': 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=500&auto=format&fit=crop&q=80',
  'head oil massage': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&auto=format&fit=crop&q=80',
  'head tonic massage': 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=500&auto=format&fit=crop&q=80',
  'head wash': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop&q=80',
  'hair wash & setting': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop&q=80',
  'anti-dandruff treatment': 'https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=500&auto=format&fit=crop&q=80',
  'anti-hair fall treatment': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80',
  'straightening / smoothing': 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500&auto=format&fit=crop&q=80',
  'botox': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop&q=80',
  'biotin': 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=500&auto=format&fit=crop&q=80',
  'grey coverage': 'https://images.unsplash.com/photo-1522337094346-2917730e7845?w=500&auto=format&fit=crop&q=80',
  'ammonia free grey coverage': 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=500&auto=format&fit=crop&q=80',
  'fashion colour': 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=500&auto=format&fit=crop&q=80',
  "l'oréal colour": 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=500&auto=format&fit=crop&q=80',
  'beard colour': 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&auto=format&fit=crop&q=80',
  'streaks colour': 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&auto=format&fit=crop&q=80',
  'crown colour': 'https://images.unsplash.com/photo-1522337094346-2917730e7845?w=500&auto=format&fit=crop&q=80',
  'normal hair black colour': 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=500&auto=format&fit=crop&q=80',
};

async function main() {
  const allServices = await prisma.service.findMany();
  for (const s of allServices) {
    const key = s.name.toLowerCase().trim();
    const img = SERVICE_IMAGES[key];
    if (img) {
      await prisma.service.update({
        where: { id: s.id },
        data: { image: img },
      });
    }
  }
  console.log('Services updated with distinct imagery!');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
