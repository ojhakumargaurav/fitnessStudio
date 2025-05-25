
'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import type { User as PrismaUser } from '@prisma/client';
import { UserStatus, type UserStatusString } from '@/types/user';
import { revalidatePath } from 'next/cache';

// Export the User type for frontend use
export type User = PrismaUser;

export async function getUsers(): Promise<User[]> {
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true }, // Only fetch active users
      orderBy: [
        { status: 'asc' }, // Pending users first
        { name: 'asc' },
      ],
    });
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

// Omitting 'id', 'role', 'status', 'invoices', 'bookings', 'createdAt', 'updatedAt', 'password', 'isActive', 'phoneNumber'
// from the base PrismaUser type to redefine them as needed for creation.
interface CreateUserInput extends Omit<PrismaUser, 'id' | 'role' | 'status' | 'invoices' | 'bookings' | 'createdAt' | 'updatedAt' | 'password' | 'isActive' | 'phoneNumber'> {
  password?: string;
  status?: UserStatusString;
  phoneNumber?: string | null; // Explicitly allow null or undefined in input
  name: string;
  email: string;
}

interface UserActionResult {
  success: boolean;
  user?: User;
  error?: string;
}

// Action to create a user (typically by admin or signup)
export async function createUser(data: CreateUserInput): Promise<UserActionResult> {
  const { name, email, password, phoneNumber, status = UserStatus.PENDING } = data;

  if (!password) {
    return { success: false, error: 'Password is required to create a user.' };
  }
  if (!name || !email) {
    return { success: false, error: 'Name and email are required.' };
  }


  try {
    const existingUserByEmail = await prisma.user.findUnique({ where: { email } });
    if (existingUserByEmail) {
      return { success: false, error: 'A client account with this email already exists.' };
    }
    const existingTrainerByEmail = await prisma.trainer.findUnique({ where: { email } });
    if (existingTrainerByEmail) {
      return { success: false, error: 'A trainer/admin account with this email already exists.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phoneNumber: phoneNumber || null,
        status: status,
        role: 'user', // Always 'user'
        isActive: true, // New users are active by default
      },
    });
    revalidatePath('/admin');
    return { success: true, user: newUser };
  } catch (error: any) {
    console.error("Error creating user in action:", error); // Detailed server-side log
    let clientErrorMessage = 'Failed to create user due to a server error. Please check server logs for details.';
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      clientErrorMessage = 'This email address is already registered.';
    } else if (error instanceof Error) {
      // Provide a snippet of the error message, avoiding overly long or sensitive info on client
      const prismaErrorSnippet = error.message.substring(0, 120);
      clientErrorMessage = `Failed to create user. Server error: ${prismaErrorSnippet}${error.message.length > 120 ? '...' : ''}`;
    }
    return { success: false, error: clientErrorMessage };
  }
}

export async function updateUserStatus(userId: string, newStatus: UserStatusString): Promise<UserActionResult> {
  try {
    if (newStatus !== UserStatus.ACTIVE && newStatus !== UserStatus.PENDING) {
      return { success: false, error: 'Invalid user status provided.' };
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId, isActive: true }, // Ensure we only update active users' status
      data: { status: newStatus },
    });
    revalidatePath('/admin');
    return { success: true, user: updatedUser };
  } catch (error: any) {
    console.error(`Error updating user status for ${userId}:`, error);
    if (error.code === 'P2025') {
      // P2025 means "Record to update not found." which could be due to ID or isActive: false
      return { success: false, error: 'Active user not found or invalid ID.' };
    }
    return { success: false, error: 'Failed to update user status.' };
  }
}

// Soft delete a user
export async function deleteUser(userId: string): Promise<Omit<UserActionResult, 'user'>> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false }, // Set isActive to false
    });
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error(`Error deactivating user ${userId}:`, error);
    if (error.code === 'P2025') {
      return { success: false, error: 'User not found.' };
    }
    return { success: false, error: 'Failed to deactivate user.' };
  }
}
