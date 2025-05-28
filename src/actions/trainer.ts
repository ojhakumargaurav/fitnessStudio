
'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import type { Trainer as PrismaTrainer } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { type AdminRoleString, AdminRoles } from '@/types/roles';

// Re-export type for frontend convenience
export type Trainer = PrismaTrainer;

interface ActionResult<T = null> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Fetches trainers and admins for public listing.
 * IT Admins are excluded from this list.
 * Admins are included.
 */
export async function getTrainersForPublicListing(): Promise<Trainer[]> {
  try {
    const trainers = await prisma.trainer.findMany({
        where: {
            isActive: true,
            role: {
                in: [AdminRoles.TRAINER, AdminRoles.ADMIN] // Show Trainers and Admins
            }
        },
        orderBy: [{ name: 'asc' }]
    });
    return trainers;
  } catch (error) {
    console.error('Error getting trainers for public listing:', error);
    return [];
  }
}

/**
 * Fetches trainers and admins for the admin dashboard, respecting visibility rules.
 * IT Admins see everyone. Regular Admins see other Admins and Trainers.
 */
export async function getManageableAccounts(loggedInUserRole: AdminRoleString): Promise<Trainer[]> {
  try {
    let whereClause: any = { isActive: true };

    if (loggedInUserRole === AdminRoles.ADMIN) {
      whereClause.role = {
        in: [AdminRoles.ADMIN, AdminRoles.TRAINER],
      };
    } else if (loggedInUserRole !== AdminRoles.IT_ADMIN) {
      console.warn(`getManageableAccounts called with unexpected role: ${loggedInUserRole}. Defaulting to trainers only.`);
      whereClause.role = AdminRoles.TRAINER;
    }
    // If loggedInUserRole is IT_ADMIN, no additional role filter is applied to whereClause, so they see all active accounts.

    const accounts = await prisma.trainer.findMany({
        where: whereClause,
        orderBy: [
            { role: 'asc' }, // it_admin, then admin, then trainer
            { name: 'asc' }
        ]
    });
    return accounts;
  } catch (error) {
    console.error('Error getting manageable accounts:', error);
    return [];
  }
}


interface CreateTrainerInput {
  name: string;
  email: string;
  password?: string;
  role: AdminRoleString;
  specialization: string;
  experience: number;
  schedule: string;
  phoneNumber?: string;
  bio?: string;
  imageUrl?: string;
}

export async function createTrainer(data: CreateTrainerInput, loggedInUserRole: AdminRoleString): Promise<ActionResult<{ trainer: Trainer }>> {
  const { name, email, password, role, specialization, experience, schedule, phoneNumber, bio, imageUrl } = data;

  if (role === AdminRoles.IT_ADMIN && loggedInUserRole !== AdminRoles.IT_ADMIN) {
    return { success: false, error: 'Only IT Admins can create other IT Admins.' };
  }

  if (!password) {
    return { success: false, error: 'Password is required to create an account.' };
  }
  if (!Object.values(AdminRoles).includes(role)) {
    return { success: false, error: 'Invalid role specified.' };
  }
  if (!name || !email || !specialization || experience < 0 || !schedule) {
    return { success: false, error: 'Missing required fields.'};
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
        imageUrl: imageUrl || null,
        isActive: true,
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
  role?: AdminRoleString;
  specialization?: string;
  experience?: number;
  schedule?: string;
  phoneNumber?: string;
  bio?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export async function updateTrainer(id: string, data: UpdateTrainerInput, loggedInUserRole: AdminRoleString): Promise<ActionResult<{ trainer: Trainer }>> {
  try {
    const trainerToUpdate = await prisma.trainer.findUnique({ where: { id }});
    if (!trainerToUpdate) {
        return { success: false, error: 'Trainer/Admin not found.'};
    }

    if (trainerToUpdate.role === AdminRoles.IT_ADMIN && loggedInUserRole !== AdminRoles.IT_ADMIN) {
        return { success: false, error: 'Regular admins cannot modify IT Admin accounts.'};
    }
    if (data.role === AdminRoles.IT_ADMIN && loggedInUserRole !== AdminRoles.IT_ADMIN) {
        return { success: false, error: 'Only IT Admins can assign the IT Admin role.'};
    }

    const updateData: Partial<Omit<PrismaTrainer, 'id'|'createdAt'|'updatedAt'>> & { password?: string } = { ...data };

    if (data.password && data.password.trim() !== "") {
        updateData.password = await bcrypt.hash(data.password, 10);
    } else {
        delete updateData.password; // Ensure password is not updated if empty
    }

    if (data.imageUrl === '') { // Handle empty string for imageUrl to set it to null
      updateData.imageUrl = null;
    }


    if (data.email && trainerToUpdate.email !== data.email) {
        const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser) {
          return { success: false, error: 'New email is already in use by a client account.' };
        }
        const existingTrainer = await prisma.trainer.findFirst({ where: { email: data.email, NOT: { id } } });
        if (existingTrainer) {
          return { success: false, error: 'New email is already in use by another trainer/admin.' };
        }
    }
    if (data.role && !Object.values(AdminRoles).includes(data.role)) {
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

export async function deleteTrainer(id: string, loggedInUserRole: AdminRoleString): Promise<ActionResult> {
  try {
    const trainerToDelete = await prisma.trainer.findUnique({ where: { id } });
    if (!trainerToDelete) {
      return { success: false, error: 'Trainer/Admin not found.' };
    }
    if (trainerToDelete.role === AdminRoles.IT_ADMIN && loggedInUserRole !== AdminRoles.IT_ADMIN) {
      return { success: false, error: 'Regular admins cannot deactivate IT Admin accounts.' };
    }

    await prisma.trainer.update({
      where: { id },
      data: { isActive: false },
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
