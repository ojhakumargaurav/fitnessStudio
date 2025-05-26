
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { addDays, format } from 'date-fns';
import { AdminRoles } from '@/types/roles'; // Import AdminRoles
import { UserStatus } from '@/types/user';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  const itAdminEmail = 'itadmin@fitnesshub.com';
  const itAdminPassword = 'itadminpassword';
  const hashedItAdminPassword = await bcrypt.hash(itAdminPassword, 10);

  const itAdmin = await prisma.trainer.upsert({
    where: { email: itAdminEmail },
    update: { isActive: true, role: AdminRoles.IT_ADMIN },
    create: {
      name: 'IT Super Admin',
      email: itAdminEmail,
      password: hashedItAdminPassword,
      role: AdminRoles.IT_ADMIN,
      specialization: 'System Infrastructure',
      experience: 10,
      schedule: 'On-call',
      phoneNumber: '000-000-0000',
      bio: 'Manages the IT systems for Fitness Hub.',
      isActive: true,
    },
  });
  console.log(`Created/Updated IT Admin with id: ${itAdmin.id}`);


  const adminEmail = 'kumarojhagaurav@gmail.com';
  const adminPassword = 'gymwarriors';
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.trainer.upsert({
    where: { email: adminEmail },
    update: {isActive: true, role: AdminRoles.ADMIN}, // Ensure admin is active if already exists
    create: {
      name: 'Gaurav Ojha',
      email: adminEmail,
      password: hashedAdminPassword,
      role: AdminRoles.ADMIN,
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
    update: {isActive: true, role: AdminRoles.TRAINER},
    create: {
      name: 'Alice Johnson',
      email: trainer1Email,
      password: hashedTrainer1Password,
      role: AdminRoles.TRAINER,
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
    update: {isActive: true, role: AdminRoles.TRAINER},
    create: {
      name: 'Bob Smith',
      email: trainer2Email,
        password: hashedTrainer2Password,
      role: AdminRoles.TRAINER,
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
    update: {isActive: true, role: AdminRoles.TRAINER},
    create: {
      name: 'Charlie Brown',
      email: trainer3Email,
        password: hashedTrainer3Password,
      role: AdminRoles.TRAINER,
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
      update: {isActive: true, status: UserStatus.ACTIVE},
      create: {
          name: 'Active User',
          email: user1Email,
          password: hashedUser1Password,
          role: 'user',
          status: UserStatus.ACTIVE,
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
      update: {isActive: true, status: UserStatus.PENDING},
      create: {
          name: 'Pending User',
          email: user2Email,
          password: hashedUser2Password,
          role: 'user',
          status: UserStatus.PENDING,
          phoneNumber: '444-555-6666',
          isActive: true,
      }
  });
   console.log(`Created/Updated user2 with id: ${user2.id}`);

  const tomorrow = addDays(new Date(), 1);

  console.log(`Seeding classes for: ${format(tomorrow, 'yyyy-MM-dd')}`);

  const class1 = await prisma.class.upsert({
    where: { name_date_startTime: { name: 'Morning Yoga', date: tomorrow, startTime: '09:00' } },
    update: {isActive: true},
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
      isActive: true,
    },
  });
  console.log(`Created class1 with id: ${class1.id}`);

  const class2 = await prisma.class.upsert({
      where: { name_date_startTime: { name: 'Strength Fundamentals', date: tomorrow, startTime: '11:00' } },
      update: {isActive: true},
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
        isActive: true,
      },
    });
    console.log(`Created class2 with id: ${class2.id}`);

  const class3 = await prisma.class.upsert({
      where: { name_date_startTime: { name: 'HIIT Cardio Blast', date: tomorrow, startTime: '17:00' } },
      update: {isActive: true},
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
        isActive: true,
      },
    });
     console.log(`Created class3 with id: ${class3.id}`);

   const class4 = await prisma.class.upsert({
        where: { name_date_startTime: { name: 'Evening Flow Yoga', date: tomorrow, startTime: '18:00' } },
        update: {isActive: true},
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
          isActive: true,
        },
      });
      console.log(`Created class4 with id: ${class4.id}`);

   const class5 = await prisma.class.upsert({
        where: { name_date_startTime: { name: 'Advanced Strength', date: tomorrow, startTime: '14:00' } },
        update: {isActive: true},
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
          isActive: true,
        },
      });
        console.log(`Created class5 with id: ${class5.id}`);

  if (user1.status === UserStatus.ACTIVE && user1.isActive) {
      await prisma.classBooking.upsert({
          where: { classId_userId: { classId: class1.id, userId: user1.id } },
          update: {isActive: true},
          create: {
              classId: class1.id,
              userId: user1.id,
              isActive: true,
          }
      });
      await prisma.class.update({
          where: { id: class1.id },
          data: { availableSlots: { decrement: 1 } }
      });
      console.log(`Booked user1 into class1`);
  }

    const imagesToSeed = [
      { url: 'https://placehold.co/800x400.png', dataAiHint: 'gym workout', position: 1, isActive: true },
      { url: 'https://www.youtube.com/watch?v=ysz5S6PUM-U', dataAiHint: 'fitness motivation', position: 2, isActive: true }, // Example YouTube Video
      { url: 'https://placehold.co/800x400.png', dataAiHint: 'yoga class', position: 3, isActive: true },
      { url: 'https://placehold.co/800x400.png', dataAiHint: 'weightlifting fitness', position: 4, isActive: true },
    ];

    for (const img of imagesToSeed) {
      const createdImage = await prisma.carouselImage.upsert({
        where: { position: img.position }, // Assuming position is unique for upsert logic
        update: { url: img.url, dataAiHint: img.dataAiHint, isActive: img.isActive },
        create: { url: img.url, position: img.position, dataAiHint: img.dataAiHint, isActive: img.isActive },
      });
      console.log(`Created/Updated carousel image at position ${createdImage.position}`);
    }

    // Re-sequence positions to ensure they are contiguous from 1
    const allImages = await prisma.carouselImage.findMany({ where: {isActive: true}, orderBy: { position: 'asc' } });
    await prisma.$transaction(
        allImages.map((img, index) =>
            prisma.carouselImage.update({
                where: { id: img.id },
                data: { position: index + 1 },
            })
        )
    );
    console.log(`Re-sequenced active carousel image positions.`);

  const invoice1 = await prisma.invoice.upsert({
      where: { id: 'seed-invoice-1' }, // Using a predictable ID for easy reference if needed
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

  if (user2.isActive) { // Check if user2 itself is active before creating invoices for them
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
  }

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
