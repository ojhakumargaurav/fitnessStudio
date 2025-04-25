
import prisma from '@/lib/prisma';

/**
 * Represents a trainer.
 */
export interface Trainer {
  /**
   * The unique identifier of the trainer.
   */
  id: string;
  /**
   * The name of the trainer.
   */
  name: string;
  /**
   * The specialization of the trainer (e.g., Yoga, Strength Training).
   */
  specialization: string;
  /**
   * The trainer's experience in years.
   */
  experience: number;
  /**
   * The trainer's schedule
   */
  schedule: string;
    /**
   * The trainer's email
   */
  email: string;
    /**
   * The trainer's phone number
   */
  phoneNumber?: string;
  /**
   * The trainer's role
   */
  role: string;
}

/**
 * Asynchronously retrieves a list of all trainers.
 *
 * @returns A promise that resolves to an array of Trainer objects.
 */
export async function getTrainers(): Promise<Trainer[]> {
  try {
    const trainers = await prisma.trainer.findMany();
    return trainers;
  } catch (error) {
    console.error("Error fetching trainers:", error);
    return [];
  }
}

/**
 * Asynchronously retrieves a single trainer by ID.
 *
 * @param trainerId The ID of the trainer to retrieve.
 * @returns A promise that resolves to a Trainer object.
 */
export async function getTrainer(trainerId: string): Promise<Trainer | undefined> {
  try {
    const trainer = await prisma.trainer.findUnique({
      where: {
        id: trainerId,
      },
    });
    return trainer || undefined;
  } catch (error) {
    console.error("Error fetching trainer:", error);
    return undefined;
  }
}

