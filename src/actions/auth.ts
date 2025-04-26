
'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import type { User as PrismaUser, Trainer as PrismaTrainer } from '@prisma/client';

interface AuthResult {
  success: boolean;
  user?: { id: string; role: string; status?: string }; // Include status for users
  error?: string;
}

interface SignupInput {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export async function login(username: string, password: string): Promise<AuthResult> {
  try {
    // Check if it's a user
    const foundUser = await prisma.user.findUnique({
      where: { email: username },
    });

    if (foundUser) {
      const isPasswordValid = await bcrypt.compare(password, foundUser.password);
      if (isPasswordValid) {
        return {
          success: true,
          user: { id: foundUser.id, role: foundUser.role, status: foundUser.status }, // Return status
        };
      }
    }

    // Check if it's a trainer (or admin)
    const foundTrainer = await prisma.trainer.findUnique({
      where: { email: username },
    });

    if (foundTrainer) {
      const isPasswordValid = await bcrypt.compare(password, foundTrainer.password);
      if (isPasswordValid) {
        // Admins/Trainers don't have a 'status' field like users
        return { success: true, user: { id: foundTrainer.id, role: foundTrainer.role } };
      }
    }

    return { success: false, error: 'Invalid credentials' };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'An unexpected error occurred during login.' };
  } finally {
    // Prisma automatically handles connection pooling, explicit disconnect might not be needed here
    // unless in specific scenarios like serverless functions.
    // await prisma.$disconnect();
  }
}


export async function signup(input: SignupInput): Promise<AuthResult> {
  try {
    const { name, email, password, phoneNumber } = input;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, error: 'User with this email already exists.' };
    }
     const existingTrainer = await prisma.trainer.findUnique({ where: { email } });
     if (existingTrainer) {
        return { success: false, error: 'User with this email already exists.' };
     }


    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds = 10

    // Create the new user with 'pending' status
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phoneNumber: phoneNumber || null, // Handle optional phone number
        status: 'pending', // Default status
        role: 'user', // Always role 'user'
      },
    });

    return { success: true, user: { id: newUser.id, role: newUser.role, status: newUser.status } };
  } catch (error) {
    console.error('Signup error:', error);
     if (error instanceof Error && 'code' in error && error.code === 'P2002' && 'meta' in error && error.meta && typeof error.meta === 'object' && 'target' in error.meta && Array.isArray(error.meta.target) && error.meta.target.includes('email')) {
       return { success: false, error: 'User with this email already exists.' };
     }
    return { success: false, error: 'An unexpected error occurred during signup.' };
  }
}
