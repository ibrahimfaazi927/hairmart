import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding chairs (Men: 4, Women: 2)...');

  const defaultChairs = [
    { name: 'Chair 1', section: 'men', sortOrder: 1, active: true },
    { name: 'Chair 2', section: 'men', sortOrder: 2, active: true },
    { name: 'Chair 3', section: 'men', sortOrder: 3, active: true },
    { name: 'Chair 4', section: 'men', sortOrder: 4, active: true },
    { name: 'Chair 1', section: 'women', sortOrder: 1, active: true },
    { name: 'Chair 2', section: 'women', sortOrder: 2, active: true },
  ];

  for (const c of defaultChairs) {
    const existing = await prisma.chair.findFirst({
      where: {
        name: c.name,
        section: c.section,
      },
    });

    if (!existing) {
      const created = await prisma.chair.create({
        data: c,
      });
      console.log(`Created chair: ${created.section.toUpperCase()} - ${created.name}`);
    } else {
      console.log(`Chair already exists: ${existing.section.toUpperCase()} - ${existing.name}`);
    }
  }

  // Also check if any active staff can be assigned to chairs
  const chairsWithStaff = await prisma.chair.findMany({
    include: { assignedStaff: true },
    orderBy: { sortOrder: 'asc' },
  });

  const unassignedStaff = await prisma.staff.findMany({
    where: { status: 'active', chairId: null },
  });

  console.log(`Found ${unassignedStaff.length} unassigned active staff.`);

  for (const staff of unassignedStaff) {
    const targetSection = staff.section === 'women' ? 'women' : 'men';
    const availableChair = chairsWithStaff.find(
      (ch) => ch.section.toLowerCase() === targetSection && !ch.assignedStaff
    );

    if (availableChair) {
      await prisma.staff.update({
        where: { id: staff.id },
        data: { chairId: availableChair.id },
      });
      // Mark as assigned locally so we don't reassign
      (availableChair as any).assignedStaff = staff;
      console.log(`Assigned staff ${staff.name} to ${availableChair.section.toUpperCase()} ${availableChair.name}`);
    }
  }

  console.log('Chair seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
