
'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import type { Trainer as PrismaTrainer } from '@prisma/client';
import { revalidatePath } from 'next/cache';

// Re-export type for frontend convenience
export type Trainer = PrismaTrainer;

// Define a string literal type for roles
export type TrainerRoleString = 'admin' | 'trainer';

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
    return [];
  }
}

interface CreateTrainerInput {
  name: string;
  email: string;
  password?: string;
  role: TrainerRoleString; // Use the string literal type
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
  if (role !== 'admin' && role !== 'trainer') { // Validate against string literals
    return { success: false, error: 'Invalid role specified. Must be "admin" or "trainer".' };
  }

  try {
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
    revalidatePath('/admin');
    revalidatePath('/trainers');
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
  password?: string;
  role?: TrainerRoleString; // Use the string literal type
  specialization?: string;
  experience?: number;
  schedule?: string;
  phoneNumber?: string;
  bio?: string;
}

export async function updateTrainer(id: string, data: UpdateTrainerInput): Promise<ActionResult<{ trainer: Trainer }>> {
  try {
    const updateData: Partial<PrismaTrainer> & { password?: string } = { ...data };


    if (data.password) {
      if (data.password.trim() !== "") {
        updateData.password = await bcrypt.hash(data.password, 10);
      } else {
        delete updateData.password;
      }
    } else {
        delete updateData.password;
    }

    if (data.email) {
        const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser) {
          return { success: false, error: 'New email is already in use by a client account.' };
        }
        const existingTrainer = await prisma.trainer.findFirst({ where: { email: data.email, NOT: { id } } });
        if (existingTrainer) {
          return { success: false, error: 'New email is already in use by another trainer/admin.' };
        }
    }
    if (data.role && data.role !== 'admin' && data.role !== 'trainer') { // Validate against string literals
        return { success: false, error: 'Invalid role specified. Must be "admin" or "trainer".' };
    }


    const updatedTrainer = await prisma.trainer.update({
      where: { id },
      data: updateData as any, // Cast to any to satisfy Prisma's stricter update type for now
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
