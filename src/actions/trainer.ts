
'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import type { Trainer as PrismaTrainer, TrainerRole } from '@prisma/client'; // Import TrainerRole
import { revalidatePath } from 'next/cache';

// Re-export type for frontend convenience
export type Trainer = PrismaTrainer;

interface ActionResult<T = null> {
    success: boolean;
    data?: T;
    error?: string;
}

export async function getTrainers(): Promise<Trainer[]> {
  try {
    const trainers = await prisma.trainer.findMany({
        orderBy: {
            role: 'asc', // Admins first, then trainers
            name: 'asc'
        }
    });
    return trainers;
  } catch (error) {
    console.error('Error getting trainers:', error);
    // In a real app, you might want to throw the error or return a more specific error object
    return [];
  }
}

interface CreateTrainerInput {
  name: string;
  email: string;
  password?: string; // Password required for creation
  role: TrainerRole; // Use the enum
  specialization: string;
  experience: number;
  schedule: string;
  phoneNumber?: string;
  bio?: string;
}

export async function createTrainer(data: CreateTrainerInput): Promise<ActionResult<{ trainer: Trainer }>> {
  const { name, email, password, role, specialization, experience, schedule, phoneNumber, bio } = data;

  if (!password) {
    return { success: false, error: 'Password is required to create a trainer/admin.' };
  }
  if (!Object.values(TrainerRole).includes(role)) {
    return { success: false, error: 'Invalid role specified.' };
  }

  try {
    // Check if email is already in use by a User or another Trainer
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, error: 'Email already in use by a client account.' };
    }
    const existingTrainer = await prisma.trainer.findUnique({ where: { email } });
    if (existingTrainer) {
      return { success: false, error: 'Email already in use by another trainer/admin.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newTrainer = await prisma.trainer.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        specialization,
        experience,
        schedule,
        phoneNumber: phoneNumber || null,
        bio: bio || null,
      },
    });
    revalidatePath('/admin'); // Revalidate admin path to show new trainer/admin
    revalidatePath('/trainers'); // Also revalidate public trainers page
    return { success: true, data: { trainer: newTrainer } };
  } catch (error: any) {
    console.error('Error creating trainer/admin:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return { success: false, error: 'This email is already registered.' };
    }
    return { success: false, error: 'Failed to create trainer/admin.' };
  }
}

interface UpdateTrainerInput {
  name?: string;
  email?: string;
  password?: string; // Optional: for password changes
  role?: TrainerRole;
  specialization?: string;
  experience?: number;
  schedule?: string;
  phoneNumber?: string;
  bio?: string;
}

export async function updateTrainer(id: string, data: UpdateTrainerInput): Promise<ActionResult<{ trainer: Trainer }>> {
  try {
    const updateData: Prisma.TrainerUpdateInput = { ...data }; // Use Prisma type for update data

    if (data.password) {
      if (data.password.trim() !== "") { // Only hash if password is not empty
        updateData.password = await bcrypt.hash(data.password, 10);
      } else {
        delete updateData.password; // Don't update password if field was empty
      }
    } else {
        delete updateData.password; // Ensure password isn't set to undefined if not provided
    }

    if (data.email) {
        // Check if new email conflicts with an existing user or another trainer (excluding self)
        const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser) {
          return { success: false, error: 'New email is already in use by a client account.' };
        }
        const existingTrainer = await prisma.trainer.findFirst({ where: { email: data.email, NOT: { id } } });
        if (existingTrainer) {
          return { success: false, error: 'New email is already in use by another trainer/admin.' };
        }
    }
    if (data.role && !Object.values(TrainerRole).includes(data.role)) {
        return { success: false, error: 'Invalid role specified.' };
    }


    const updatedTrainer = await prisma.trainer.update({
      where: { id },
      data: updateData,
    });
    revalidatePath('/admin');
    revalidatePath('/trainers');
    return { success: true, data: { trainer: updatedTrainer } };
  } catch (error: any) {
    console.error('Error updating trainer/admin:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return { success: false, error: 'This email is already registered.' };
    }
    if (error.code === 'P2025') {
       return { success: false, error: 'Trainer/Admin not found.' };
    }
    return { success: false, error: 'Failed to update trainer/admin.' };
  }
}

export async function deleteTrainer(id: string): Promise<ActionResult> {
  try {
    // Optional: Add check to prevent deleting the last admin, or self-deletion if it's critical.
    // For now, basic deletion:
    await prisma.trainer.delete({
      where: { id },
    });
    revalidatePath('/admin');
    revalidatePath('/trainers');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting trainer/admin:', error);
    if (error.code === 'P2025') {
       return { success: false, error: 'Trainer/Admin not found.' };
    }
    return { success: false, error: 'Failed to delete trainer/admin.' };
  }
}

// Need to import Prisma namespace for Prisma.TrainerUpdateInput
import type { Prisma } from '@prisma/client';
