
import prisma from '@/lib/prisma';

/**
 * Represents a class.
 */
export interface Class {
  /**
   * The unique identifier of the class.
   */
  id: string;
  /**
   * The name of the class.
   */
  name: string;
  /**
   * The category of the class (e.g., Yoga, Strength Training, Cardio).
   */
  category: string;
  /**
   * The date of the class.
   */
  date: string;
  /**
   * The start time of the class.
   */
  startTime: string;
  /**
   * The end time of the class.
   */
  endTime: string;
  /**
   * The capacity of the class.
   */
  capacity: number;
  /**
   * The number of available slots in the class.
   */
  availableSlots: number;
  /**
   * The trainer ID of the class.
   */
  trainerId: string;
}

/**
 * Asynchronously retrieves a list of all classes for the next day.
 *
 * @returns A promise that resolves to an array of Class objects.
 */
export async function getClasses(): Promise<Class[]> {
  try {
    const classes = await prisma.class.findMany();
    return classes;
  } catch (error) {
    console.error("Error fetching classes:", error);
    return [];
  }
}

/**
 * Asynchronously retrieves a single class by ID.
 *
 * @param classId The ID of the class to retrieve.
 * @returns A promise that resolves to a Class object.
 */
export async function getClass(classId: string): Promise<Class | undefined> {
  try {
    const cls = await prisma.class.findUnique({
      where: {
        id: classId,
      },
    });
    return cls || undefined;
  } catch (error) {
    console.error("Error fetching class:", error);
    return undefined;
  }
}

/**
 * Asynchronously books a class for a user.
 *
 * @param classId The ID of the class to book.
 * @returns A promise that resolves to a boolean indicating whether the class was successfully booked.
 */
export async function bookClass(classId: string): Promise<boolean> {
  // TODO: Implement this by calling an API.

  return true;
}

/**
 * Asynchronously cancels a booked class for a user.
 *
 * @param classId The ID of the class to cancel.
 * @returns A promise that resolves to a boolean indicating whether the class was successfully cancelled.
 */
export async function cancelClass(classId: string): Promise<boolean> {
  // TODO: Implement this by calling an API.

  return true;
}
