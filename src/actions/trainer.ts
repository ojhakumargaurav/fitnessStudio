'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getTrainers() {
  try {
    const trainers = await prisma.trainer.findMany();
    return trainers;
  } catch (error) {
    console.error('Error getting trainers:', error);
    throw new Error('Failed to get trainers.');
  }
}

export async function createTrainer(data: {
  name: string;
  specialization: string;
  bio?: string;
}) {
  try {
    const newTrainer = await prisma.trainer.create({
      data: {
        name: data.name,
        specialization: data.specialization,
        bio: data.bio,
      },
    });
    revalidatePath('/trainers'); // Revalidate path to show new trainer
    return newTrainer;
  } catch (error) {
    console.error('Error creating trainer:', error);
    throw new Error('Failed to create trainer.');
  }
}

export async function updateTrainer(
  id: string,
  data: {
    name?: string;
    specialization?: string;
    bio?: string;
  },
) {
  try {
    const updatedTrainer = await prisma.trainer.update({
      where: { id },
      data: data,
    });
    revalidatePath('/trainers'); // Revalidate path to show updated trainer
    return updatedTrainer;
  } catch (error) {
    console.error('Error updating trainer:', error);
    throw new Error('Failed to update trainer.');
  }
}

export async function deleteTrainer(id: string) {
  try {
    const deletedTrainer = await prisma.trainer.delete({
      where: { id },
    });
    revalidatePath('/trainers'); // Revalidate path to reflect deletion
    return deletedTrainer;
  } catch (error) {
    console.error('Error deleting trainer:', error);
    throw new Error('Failed to delete trainer.');
  }
}