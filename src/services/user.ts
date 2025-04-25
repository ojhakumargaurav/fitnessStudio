
import prisma from '@/lib/prisma';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phoneNumber?: string;
}

export async function getUsers(): Promise<User[]> {
  try {
    const users = await prisma.user.findMany();
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}
