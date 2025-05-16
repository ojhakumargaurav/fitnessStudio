
import { PrismaClient } from '@prisma/client'; // Removed UserStatus import
import bcrypt from 'bcryptjs';
import { addDays, format } from 'date-fns';

const prisma = new PrismaClient();

// Use string literals directly as UserStatus enum is removed from Prisma schema
const USER_STATUS_ACTIVE = 'active';
const USER_STATUS_PENDING = 'pending';

async function main() {
  console.log(`Start seeding ...`);

  // --- Seed Admin ---
  const adminEmail = 'kumarojhagaurav@gmail.com';
  const adminPassword = 'gymwarriors'; // Use a strong password in production
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.trainer.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Gaurav Ojha',
      email: adminEmail,
      password: hashedAdminPassword,
      role: 'admin', // Role is a string
      specialization: 'Site Administration',
      experience: 5, // Example experience
      schedule: 'Always available', // Example schedule
      phoneNumber: '123-456-7890', // Example phone
    },
  });
  console.log(`Created admin with id: ${admin.id}`);


  // --- Seed Trainers ---
  const trainer1Email = 'trainer1@fitnesshub.com';
  const trainer1Password = 'trainerpass1';
  const hashedTrainer1Password = await bcrypt.hash(trainer1Password, 10);
  const trainer1 = await prisma.trainer.upsert({
    where: { email: trainer1Email },
    update: {},
    create: {
      name: 'Alice Johnson',
      email: trainer1Email,
      password: hashedTrainer1Password,
      role: 'trainer', // Role is a string
      specialization: 'Yoga & Flexibility',
      experience: 5,
      schedule: 'Mon, Wed, Fri 8am-12pm',
      phoneNumber: '555-111-2222',
    },
  });
  console.log(`Created trainer1 with id: ${trainer1.id}`);

  const trainer2Email = 'trainer2@fitnesshub.com';
    const trainer2Password = 'trainerpass2';
    const hashedTrainer2Password = await bcrypt.hash(trainer2Password, 10);
  const trainer2 = await prisma.trainer.upsert({
    where: { email: trainer2Email },
    update: {},
    create: {
      name: 'Bob Smith',
      email: trainer2Email,
        password: hashedTrainer2Password,
      role: 'trainer', // Role is a string
      specialization: 'Strength Training',
      experience: 8,
      schedule: 'Tue, Thu 1pm-5pm, Sat 9am-1pm',
      phoneNumber: '555-333-4444',
    },
  });
   console.log(`Created trainer2 with id: ${trainer2.id}`);


  const trainer3Email = 'trainer3@fitnesshub.com';
    const trainer3Password = 'trainerpass3';
    const hashedTrainer3Password = await bcrypt.hash(trainer3Password, 10);
  const trainer3 = await prisma.trainer.upsert({
    where: { email: trainer3Email },
    update: {},
    create: {
      name: 'Charlie Brown',
      email: trainer3Email,
        password: hashedTrainer3Password,
      role: 'trainer', // Role is a string
      specialization: 'Cardio & Endurance',
      experience: 3,
      schedule: 'Mon-Fri 5pm-9pm',
      phoneNumber: '555-555-6666',
    },
  });
   console.log(`Created trainer3 with id: ${trainer3.id}`);


  // --- Seed Users ---
  const user1Email = 'user1@example.com';
    const user1Password = 'userpass1';
    const hashedUser1Password = await bcrypt.hash(user1Password, 10);
  const user1 = await prisma.user.upsert({
      where: { email: user1Email },
      update: {},
      create: {
          name: 'Active User',
          email: user1Email,
          password: hashedUser1Password,
          role: 'user',
          status: USER_STATUS_ACTIVE, // Active user - string
          phoneNumber: '111-222-3333',
      }
  });
  console.log(`Created user1 with id: ${user1.id}`);

  const user2Email = 'user2@example.com';
    const user2Password = 'userpass2';
    const hashedUser2Password = await bcrypt.hash(user2Password, 10);
  const user2 = await prisma.user.upsert({
      where: { email: user2Email },
      update: {},
      create: {
          name: 'Pending User',
          email: user2Email,
          password: hashedUser2Password,
          role: 'user',
          status: USER_STATUS_PENDING, // Pending user - string
          phoneNumber: '444-555-6666',
      }
  });
   console.log(`Created user2 with id: ${user2.id}`);


  // --- Seed Classes for Tomorrow ---
  const tomorrow = addDays(new Date(), 1);
  const formattedTomorrow = format(tomorrow, 'yyyy-MM-dd'); // Format for comparison if needed, but Date object is better

  console.log(`Seeding classes for: ${formattedTomorrow}`);

  const class1 = await prisma.class.upsert({
    where: { name_date_startTime: { name: 'Morning Yoga', date: tomorrow, startTime: '09:00' } },
    update: {},
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

  // --- Seed Bookings (Optional) ---
  // Example: Book user1 into class1
  if (user1.status === USER_STATUS_ACTIVE) {
      await prisma.classBooking.upsert({
          where: { classId_userId: { classId: class1.id, userId: user1.id } },
          update: {},
          create: {
              classId: class1.id,
              userId: user1.id,
          }
      });
      // Decrement available slots for class1
      await prisma.class.update({
          where: { id: class1.id },
          data: { availableSlots: { decrement: 1 } }
      });
      console.log(`Booked user1 into class1`);
  }


  // --- Seed Carousel Images ---
    const imagesToSeed = [
      { url: 'https://picsum.photos/800/400?random=1', position: 1 },
      { url: 'https://picsum.photos/800/400?random=2', position: 2 },
      { url: 'https://picsum.photos/800/400?random=3', position: 3 },
    ];

    for (const img of imagesToSeed) {
      const createdImage = await prisma.carouselImage.upsert({
        where: { position: img.position }, // Use position as a unique identifier for seeding if urls might change
        update: { url: img.url }, // Update URL if position exists
        create: { url: img.url, position: img.position },
      });
      console.log(`Created/Updated carousel image at position ${createdImage.position}`);
    }

    // Ensure positions are sequential if needed after upserting
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
