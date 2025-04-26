
'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import type { User as PrismaUser } from '@prisma/client';

// Export the User type for frontend use
export type User = PrismaUser;

// Define enum for user status
export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
}

export async function getUsers(): Promise<User[]> {
  try {
    const users = await prisma.user.findMany({
        orderBy: { // Optional: order by status then name
           status: 'asc', // Pending users first
           name: 'asc',
        }
    });
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    // In a real app, you might want to throw the error or return a more specific error object
    return [];
  }
}

interface CreateUserInput extends Omit<User, 'id' | 'role' | 'status' | 'invoices' | 'bookings'> {
  password?: string; // Password required for creation
  status?: UserStatus; // Allow setting status on creation (e.g., admin creates active user)
}

interface CreateUserResult {
  success: boolean;
  user?: User;
  error?: string;
}

// Action to create a user (typically by admin or signup)
export async function createUser(data: CreateUserInput): Promise<CreateUserResult> {
  const { name, email, password, phoneNumber, status = UserStatus.PENDING } = data;

  if (!password) {
    return { success: false, error: 'Password is required to create a user.' };
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, error: 'User with this email already exists.' };
    }
     const existingTrainer = await prisma.trainer.findUnique({ where: { email } });
     if (existingTrainer) {
        return { success: false, error: 'An account with this email already exists (Trainer/Admin).' };
     }


    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phoneNumber: phoneNumber || null,
        status: status, // Set status (defaulting to pending if not provided)
        role: 'user', // Users created via this action are always 'user' role
      },
    });
    return { success: true, user: newUser };
  } catch (error: any) {
    console.error("Error creating user:", error);
     if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return { success: false, error: 'User with this email already exists.' };
    }
    return { success: false, error: 'Failed to create user.' };
  }
}


interface UpdateUserStatusResult {
  success: boolean;
  user?: User;
  error?: string;
}

// Action to update user status (e.g., admin verifies user)
export async function updateUserStatus(userId: string, newStatus: UserStatus): Promise<UpdateUserStatusResult> {
  try {
     // Validate status
     if (!Object.values(UserStatus).includes(newStatus)) {
        return { success: false, error: 'Invalid user status provided.' };
     }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: newStatus },
    });
    return { success: true, user: updatedUser };
  } catch (error: any) {
    console.error(`Error updating user status for ${userId}:`, error);
     if (error.code === 'P2025') { // Record not found
       return { success: false, error: 'User not found.' };
     }
    return { success: false, error: 'Failed to update user status.' };
  }
}
