
'use server';

import prisma from '@/lib/prisma';
import type { Invoice as PrismaInvoice } from '@prisma/client';
import { revalidatePath } from 'next/cache';

// Re-export type for frontend convenience
export type Invoice = PrismaInvoice;

interface ActionResult<T = null> {
    success: boolean;
    data?: T;
    error?: string;
}

// --- Invoice Actions ---

export async function getInvoices(): Promise<Invoice[]> {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { isActive: true }, // Only fetch active invoices
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });
    return invoices;
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return [];
  }
}

interface CreateInvoiceInput {
    userId: string;
    amount: number;
    dueDate: string;
}

export async function createInvoice(input: CreateInvoiceInput): Promise<ActionResult<{ invoice: Invoice }>> {
  try {
    const { userId, amount, dueDate } = input;

    if (amount <= 0) {
        return { success: false, error: 'Invoice amount must be positive.' };
    }
    if (!userId) {
        return { success: false, error: 'User ID is required.' };
    }
     if (!dueDate) {
        return { success: false, error: 'Due date is required.' };
    }

    const newInvoice = await prisma.invoice.create({
      data: {
        userId: userId,
        amount: amount,
        dueDate: new Date(dueDate),
        paid: false,
        isActive: true, // New invoices are active by default
      },
    });
    revalidatePath('/admin');
    return { success: true, data: { invoice: newInvoice } };
  } catch (error) {
    console.error("Error creating invoice:", error);
    return { success: false, error: 'Failed to create invoice.' };
  }
}

export async function markInvoiceAsPaid(invoiceId: string, paymentDateString: string): Promise<ActionResult<{ invoice: Invoice }>> {
  try {
    if (!invoiceId) {
        return { success: false, error: 'Invoice ID is required.' };
    }
    if (!paymentDateString) {
        return { success: false, error: 'Payment date is required.' };
    }

    const paymentDate = new Date(paymentDateString);

    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paid: true,
        paymentDate: paymentDate,
      },
    });
    revalidatePath('/admin');
    return { success: true, data: { invoice: updatedInvoice } };
  } catch (error: any) {
    console.error(`Error marking invoice ${invoiceId} as paid:`, error);
    if (error.code === 'P2025') {
      return { success: false, error: 'Invoice not found.' };
    }
    return { success: false, error: 'Failed to mark invoice as paid.' };
  }
}

export async function deleteInvoice(invoiceId: string): Promise<ActionResult> {
    try {
        await prisma.invoice.update({
            where: { id: invoiceId },
            data: { isActive: false }, // Soft delete
        });
        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        console.error(`Error deactivating invoice ${invoiceId}:`, error);
        if (error.code === 'P2025') {
            return { success: false, error: 'Invoice not found.' };
        }
        return { success: false, error: 'Failed to deactivate invoice.' };
    }
}
