
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
        where: { isActive: true }, // Only fetch active trainers
        orderBy: [
            { role: 'asc' }, // Admins first
            { name: 'asc' }
        ]
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
  password?: string; // Password is required by logic, but optional here to match form state
  role: TrainerRoleString;
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
  if (role !== 'admin' && role !== 'trainer') {
    return { success: false, error: 'Invalid role specified. Must be "admin" or "trainer".' };
  }
  if (!name || !email || !specialization || experience < 0 || !schedule) {
    return { success: false, error: 'Missing required fields for trainer/admin.'};
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
        isActive: true, // New trainers are active by default
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
  role?: TrainerRoleString;
  specialization?: string;
  experience?: number;
  schedule?: string;
  phoneNumber?: string;
  bio?: string;
  isActive?: boolean; // Allow explicitly updating isActive status if needed, though usually handled by deleteTrainer
}

export async function updateTrainer(id: string, data: UpdateTrainerInput): Promise<ActionResult<{ trainer: Trainer }>> {
  try {
    const updateData: Partial<Omit<PrismaTrainer, 'id'|'createdAt'|'updatedAt'>> & { password?: string } = { ...data };


    if (data.password && data.password.trim() !== "") {
        updateData.password = await bcrypt.hash(data.password, 10);
    } else {
        delete updateData.password; // Don't update password if empty or not provided
    }


    if (data.email) {
        const trainerToUpdate = await prisma.trainer.findUnique({ where: {id}});
        if (trainerToUpdate && trainerToUpdate.email !== data.email) { // Email is being changed
            const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
            if (existingUser) {
              return { success: false, error: 'New email is already in use by a client account.' };
            }
            const existingTrainer = await prisma.trainer.findFirst({ where: { email: data.email, NOT: { id } } });
            if (existingTrainer) {
              return { success: false, error: 'New email is already in use by another trainer/admin.' };
            }
        }
    }
    if (data.role && data.role !== 'admin' && data.role !== 'trainer') {
        return { success: false, error: 'Invalid role specified. Must be "admin" or "trainer".' };
    }

    // Ensure isActive is not unintentionally set to false during a normal update
    // if it's not explicitly passed. Prisma handles undefined fields by not updating them.
    // If data.isActive is explicitly false or true, it will be updated.

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
    if (error.code === 'P2025') { // Record to update not found.
       return { success: false, error: 'Trainer/Admin not found.' };
    }
    return { success: false, error: 'Failed to update trainer/admin.' };
  }
}

// Soft delete a trainer/admin
export async function deleteTrainer(id: string): Promise<ActionResult> {
  try {
    await prisma.trainer.update({
      where: { id },
      data: { isActive: false }, // Set isActive to false
    });
    revalidatePath('/admin');
    revalidatePath('/trainers');
    return { success: true };
  } catch (error: any) {
    console.error('Error deactivating trainer/admin:', error);
    if (error.code === 'P2025') {
       return { success: false, error: 'Trainer/Admin not found.' };
    }
    return { success: false, error: 'Failed to deactivate trainer/admin.' };
  }
}
