
'use server';

import prisma from '@/lib/prisma';
import type { Class as PrismaClass, ClassBooking as PrismaClassBooking } from '@prisma/client';
import { UserStatus } from './user'; // Import UserStatus object

// Re-export types for frontend convenience
export type Class = PrismaClass;
export type ClassBooking = PrismaClassBooking;

// --- Class Actions ---

export async function getClasses(): Promise<Class[]> {
  try {
    const classes = await prisma.class.findMany({
      orderBy: {
        date: 'asc',
        startTime: 'asc',
      },
      include: {
        trainer: { // Include basic trainer info if needed on the class list
            select: { name: true }
        }
      }
    });
    return classes;
  } catch (error) {
    console.error("Error fetching classes:", error);
    return []; // Return empty array on error
  }
}

export async function getClass(classId: string): Promise<Class | null> {
  try {
    const cls = await prisma.class.findUnique({
      where: { id: classId },
       include: {
        trainer: true // Include full trainer details if needed
      }
    });
    return cls;
  } catch (error) {
    console.error("Error fetching class:", error);
    return null;
  }
}

// Add actions for creating, updating, deleting classes (likely used by trainers/admins)
// Example:
// export async function createClass(data: Omit<Class, 'id' | 'availableSlots' | 'bookings' | 'trainer'> & { trainerId: string }) { ... }
// export async function updateClass(classId: string, data: Partial<Omit<Class, 'id' | 'bookings' | 'trainer'>>) { ... }
// export async function deleteClass(classId: string) { ... }


// --- Booking Actions ---

interface BookingResult {
    success: boolean;
    booking?: ClassBooking;
    error?: string;
}

export async function getUserBookings(userId: string): Promise<ClassBooking[]> {
    try {
        const bookings = await prisma.classBooking.findMany({
            where: { userId: userId },
             include: { // Include class details with the booking
                class: true
            },
            orderBy: {
                bookingDate: 'desc' // Or order by class date/time
            }
        });
        return bookings;
    } catch (error) {
        console.error(`Error fetching bookings for user ${userId}:`, error);
        return [];
    }
}


export async function bookClass(classId: string, userId: string): Promise<BookingResult> {
  try {
    // 1. Check User Status
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { status: true } });
    if (!user) {
      return { success: false, error: "User not found." };
    }
    if (user.status !== UserStatus.ACTIVE) { // Use UserStatus.ACTIVE from the imported object
      return { success: false, error: "Your account is not active. Please contact admin." };
    }

    // 2. Use a transaction to ensure atomicity (check slots and book)
    const result = await prisma.$transaction(async (tx) => {
      // Find the class and lock it for update (to prevent race conditions)
      const classToBook = await tx.class.findUnique({
        where: { id: classId },
        // select: { availableSlots: true, capacity: true }, // Only select needed fields
      });

      if (!classToBook) {
        throw new Error("Class not found.");
      }

      if (classToBook.availableSlots <= 0) {
        throw new Error("Class is already full.");
      }

       // Check if user already booked this class
       const existingBooking = await tx.classBooking.findUnique({
           where: { classId_userId: { classId, userId } }
       });
       if (existingBooking) {
           throw new Error("You have already booked this class.");
       }


      // Decrement available slots
      await tx.class.update({
        where: { id: classId },
        data: { availableSlots: { decrement: 1 } },
      });

      // Create the booking record
      const newBooking = await tx.classBooking.create({
        data: {
          classId: classId,
          userId: userId,
          // bookingDate is defaulted by schema
        },
      });

      return newBooking;
    });

    return { success: true, booking: result };

  } catch (error: any) {
    console.error(`Error booking class ${classId} for user ${userId}:`, error);
    // Check for specific Prisma errors or custom errors thrown in transaction
     if (error.message === "Class not found." || error.message === "Class is already full." || error.message === "You have already booked this class.") {
         return { success: false, error: error.message };
     }
     if (error.code === 'P2002') { // Unique constraint violation (likely race condition on booking)
         return { success: false, error: "You have already booked this class or a booking conflict occurred." };
     }
    return { success: false, error: error.message || "Failed to book class due to an unexpected error." };
  }
}


interface CancelResult {
    success: boolean;
    error?: string;
}

export async function cancelClass(bookingId: string, userId: string): Promise<CancelResult> {
  try {
    // Use transaction to ensure atomicity (delete booking and increment slots)
    await prisma.$transaction(async (tx) => {
      // Find the booking to ensure it exists and belongs to the user
      const bookingToDelete = await tx.classBooking.findUnique({
        where: { id: bookingId },
        select: { userId: true, classId: true }, // Select necessary fields
      });

      if (!bookingToDelete) {
        throw new Error("Booking not found.");
      }

      if (bookingToDelete.userId !== userId) {
        throw new Error("You are not authorized to cancel this booking."); // Security check
      }

      // Delete the booking
      await tx.classBooking.delete({
        where: { id: bookingId },
      });

      // Increment available slots for the corresponding class
      await tx.class.update({
        where: { id: bookingToDelete.classId },
        data: { availableSlots: { increment: 1 } },
      });
    });

    return { success: true };

  } catch (error: any) {
    console.error(`Error cancelling booking ${bookingId} for user ${userId}:`, error);
    if (error.message === "Booking not found." || error.message === "You are not authorized to cancel this booking.") {
        return { success: false, error: error.message };
    }
     if (error.code === 'P2025') { // Record to delete not found
       // Could happen if booking was already cancelled or class was deleted
       return { success: false, error: 'Booking or associated class not found.' };
     }
    return { success: false, error: error.message || "Failed to cancel booking due to an unexpected error." };
  }
}
