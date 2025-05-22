
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { addDays, format } from 'date-fns';

const prisma = new PrismaClient();

const USER_STATUS_ACTIVE = 'active';
const USER_STATUS_PENDING = 'pending';

async function main() {
  console.log(`Start seeding ...`);

  const adminEmail = 'kumarojhagaurav@gmail.com';
  const adminPassword = 'gymwarriors';
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.trainer.upsert({
    where: { email: adminEmail },
    update: {isActive: true},
    create: {
      name: 'Gaurav Ojha',
      email: adminEmail,
      password: hashedAdminPassword,
      role: 'admin',
      specialization: 'Site Administration',
      experience: 5,
      schedule: 'Always available',
      phoneNumber: '123-456-7890',
      bio: 'Oversees site operations and user management.',
      isActive: true,
    },
  });
  console.log(`Created/Updated admin with id: ${admin.id}`);

  const trainer1Email = 'trainer1@fitnesshub.com';
  const trainer1Password = 'trainerpass1';
  const hashedTrainer1Password = await bcrypt.hash(trainer1Password, 10);
  const trainer1 = await prisma.trainer.upsert({
    where: { email: trainer1Email },
    update: {isActive: true},
    create: {
      name: 'Alice Johnson',
      email: trainer1Email,
      password: hashedTrainer1Password,
      role: 'trainer',
      specialization: 'Yoga & Flexibility',
      experience: 5,
      schedule: 'Mon, Wed, Fri 8am-12pm',
      phoneNumber: '555-111-2222',
      bio: 'Alice is a certified Yoga instructor with a passion for helping others find balance and peace through mindful movement.',
      isActive: true,
    },
  });
  console.log(`Created/Updated trainer1 with id: ${trainer1.id}`);

  const trainer2Email = 'trainer2@fitnesshub.com';
    const trainer2Password = 'trainerpass2';
    const hashedTrainer2Password = await bcrypt.hash(trainer2Password, 10);
  const trainer2 = await prisma.trainer.upsert({
    where: { email: trainer2Email },
    update: {isActive: true},
    create: {
      name: 'Bob Smith',
      email: trainer2Email,
        password: hashedTrainer2Password,
      role: 'trainer',
      specialization: 'Strength Training',
      experience: 8,
      schedule: 'Tue, Thu 1pm-5pm, Sat 9am-1pm',
      phoneNumber: '555-333-4444',
      bio: 'Bob is an experienced strength coach focused on helping clients achieve their powerlifting and bodybuilding goals.',
      isActive: true,
    },
  });
   console.log(`Created/Updated trainer2 with id: ${trainer2.id}`);


  const trainer3Email = 'trainer3@fitnesshub.com';
    const trainer3Password = 'trainerpass3';
    const hashedTrainer3Password = await bcrypt.hash(trainer3Password, 10);
  const trainer3 = await prisma.trainer.upsert({
    where: { email: trainer3Email },
    update: {isActive: true},
    create: {
      name: 'Charlie Brown',
      email: trainer3Email,
        password: hashedTrainer3Password,
      role: 'trainer',
      specialization: 'Cardio & Endurance',
      experience: 3,
      schedule: 'Mon-Fri 5pm-9pm',
      phoneNumber: '555-555-6666',
      bio: 'Charlie specializes in high-intensity interval training (HIIT) and endurance running programs.',
      isActive: true,
    },
  });
   console.log(`Created/Updated trainer3 with id: ${trainer3.id}`);

  const user1Email = 'user1@example.com';
    const user1Password = 'userpass1';
    const hashedUser1Password = await bcrypt.hash(user1Password, 10);
  const user1 = await prisma.user.upsert({
      where: { email: user1Email },
      update: {isActive: true},
      create: {
          name: 'Active User',
          email: user1Email,
          password: hashedUser1Password,
          role: 'user',
          status: USER_STATUS_ACTIVE,
          phoneNumber: '111-222-3333',
          isActive: true,
      }
  });
  console.log(`Created/Updated user1 with id: ${user1.id}`);

  const user2Email = 'user2@example.com';
    const user2Password = 'userpass2';
    const hashedUser2Password = await bcrypt.hash(user2Password, 10);
  const user2 = await prisma.user.upsert({
      where: { email: user2Email },
      update: {isActive: true},
      create: {
          name: 'Pending User',
          email: user2Email,
          password: hashedUser2Password,
          role: 'user',
          status: USER_STATUS_PENDING,
          phoneNumber: '444-555-6666',
          isActive: true,
      }
  });
   console.log(`Created/Updated user2 with id: ${user2.id}`);

  const tomorrow = addDays(new Date(), 1);

  console.log(`Seeding classes for: ${format(tomorrow, 'yyyy-MM-dd')}`);

  const class1 = await prisma.class.upsert({
    where: { name_date_startTime: { name: 'Morning Yoga', date: tomorrow, startTime: '09:00' } },
    update: {}, // No isActive for Class model yet, can add if needed
    create: {
      name: 'Morning Yoga',
      description: 'Start your day with energizing yoga flow.',
      category: 'Yoga',
      date: tomorrow,
      startTime: '09:00',
      endTime: '10:00',
      capacity: 15,
      availableSlots: 15,
      trainerId: trainer1.id,
    },
  });
  console.log(`Created class1 with id: ${class1.id}`);

  // ... (similar updates for other classes if they were to have isActive)

  const class2 = await prisma.class.upsert({
      where: { name_date_startTime: { name: 'Strength Fundamentals', date: tomorrow, startTime: '11:00' } },
      update: {},
      create: {
        name: 'Strength Fundamentals',
        description: 'Learn the basics of weightlifting.',
        category: 'Strength Training',
        date: tomorrow,
        startTime: '11:00',
        endTime: '12:00',
        capacity: 10,
        availableSlots: 10,
        trainerId: trainer2.id,
      },
    });
    console.log(`Created class2 with id: ${class2.id}`);

  const class3 = await prisma.class.upsert({
      where: { name_date_startTime: { name: 'HIIT Cardio Blast', date: tomorrow, startTime: '17:00' } },
      update: {},
      create: {
        name: 'HIIT Cardio Blast',
        description: 'High-Intensity Interval Training for maximum calorie burn.',
        category: 'Cardio',
        date: tomorrow,
        startTime: '17:00',
        endTime: '17:45',
        capacity: 20,
        availableSlots: 20,
        trainerId: trainer3.id,
      },
    });
     console.log(`Created class3 with id: ${class3.id}`);

   const class4 = await prisma.class.upsert({
        where: { name_date_startTime: { name: 'Evening Flow Yoga', date: tomorrow, startTime: '18:00' } },
        update: {},
        create: {
          name: 'Evening Flow Yoga',
          description: 'Wind down with a gentle yoga flow.',
          category: 'Yoga',
          date: tomorrow,
          startTime: '18:00',
          endTime: '19:00',
          capacity: 15,
          availableSlots: 15,
          trainerId: trainer1.id,
        },
      });
      console.log(`Created class4 with id: ${class4.id}`);

   const class5 = await prisma.class.upsert({
        where: { name_date_startTime: { name: 'Advanced Strength', date: tomorrow, startTime: '14:00' } },
        update: {},
        create: {
          name: 'Advanced Strength',
          description: 'For experienced lifters.',
          category: 'Strength Training',
          date: tomorrow,
          startTime: '14:00',
          endTime: '15:30',
          capacity: 8,
          availableSlots: 8,
          trainerId: trainer2.id,
        },
      });
        console.log(`Created class5 with id: ${class5.id}`);

  // Ensure user1 is active before booking. isActive check is now part of User model
  if (user1.status === USER_STATUS_ACTIVE && user1.isActive) {
      await prisma.classBooking.upsert({
          where: { classId_userId: { classId: class1.id, userId: user1.id } },
          update: {},
          create: {
              classId: class1.id,
              userId: user1.id,
          }
      });
      await prisma.class.update({
          where: { id: class1.id },
          data: { availableSlots: { decrement: 1 } }
      });
      console.log(`Booked user1 into class1`);
  }

    const imagesToSeed = [
      { url: 'https://placehold.co/800x400.png', dataAiHint: 'gym workout', position: 1 },
      { url: 'https://placehold.co/800x400.png', dataAiHint: 'yoga class', position: 2 },
      { url: 'https://placehold.co/800x400.png', dataAiHint: 'weightlifting fitness', position: 3 },
    ];

    for (const img of imagesToSeed) {
      const createdImage = await prisma.carouselImage.upsert({
        where: { position: img.position },
        update: { url: img.url, dataAiHint: img.dataAiHint },
        create: { url: img.url, position: img.position, dataAiHint: img.dataAiHint },
      });
      console.log(`Created/Updated carousel image at position ${createdImage.position}`);
    }

    const allImages = await prisma.carouselImage.findMany({ orderBy: { position: 'asc' } });
    await prisma.$transaction(
        allImages.map((img, index) =>
            prisma.carouselImage.update({
                where: { id: img.id },
                data: { position: index + 1 },
            })
        )
    );
    console.log(`Re-sequenced carousel image positions.`);

  // Create some invoices, some paid, some unpaid
  const invoice1 = await prisma.invoice.upsert({
      where: { id: 'seed-invoice-1' }, // Use a predictable ID for upsert
      update: {isActive: true},
      create: {
          id: 'seed-invoice-1',
          userId: user1.id,
          amount: 50.00,
          dueDate: addDays(new Date(), 30),
          paid: false,
          isActive: true,
      }
  });
  console.log(`Created/Updated invoice1 for user1`);

  if (user2.isActive) { // Ensure user2 is active for invoicing
    const invoice2 = await prisma.invoice.upsert({
        where: { id: 'seed-invoice-2' },
        update: {isActive: true},
        create: {
            id: 'seed-invoice-2',
            userId: user2.id,
            amount: 75.00,
            dueDate: addDays(new Date(), -5), // Overdue
            paid: false,
            isActive: true,
        }
    });
    console.log(`Created/Updated invoice2 for user2 (overdue)`);

    const invoice3 = await prisma.invoice.upsert({
        where: { id: 'seed-invoice-3' },
        update: {isActive: true},
        create: {
            id: 'seed-invoice-3',
            userId: user1.id, // Another for user1
            amount: 100.00,
            dueDate: addDays(new Date(), 10),
            paid: true,
            paymentDate: new Date(),
            isActive: true,
        }
    });
    console.log(`Created/Updated invoice3 for user1 (paid)`);
  }


  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
