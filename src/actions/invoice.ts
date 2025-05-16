
'use server';

import prisma from '@/lib/prisma';
import type { Invoice as PrismaInvoice } from '@prisma/client';

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
      orderBy: {
        createdAt: 'desc', // Show newest invoices first
      },
      include: { // Optional: include user details if needed directly on invoice list
        user: {
          select: { name: true, email: true }
        }
      }
    });
    return invoices;
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return []; // Return empty array on error
  }
}

interface CreateInvoiceInput {
    userId: string;
    amount: number;
    dueDate: string; // Expecting ISO date string from client
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
        dueDate: new Date(dueDate), // Convert string to Date object
        paid: false,
        // paymentDate will be null initially
      },
    });
    return { success: true, data: { invoice: newInvoice } };
  } catch (error) {
    console.error("Error creating invoice:", error);
    // Add more specific error handling if needed (e.g., user not found P2025)
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
    return { success: true, data: { invoice: updatedInvoice } };
  } catch (error: any) {
    console.error(`Error marking invoice ${invoiceId} as paid:`, error);
    if (error.code === 'P2025') { // Record to update not found
      return { success: false, error: 'Invoice not found.' };
    }
    return { success: false, error: 'Failed to mark invoice as paid.' };
  }
}

// Optional: Action to delete an invoice (if needed by admin)
export async function deleteInvoice(invoiceId: string): Promise<ActionResult> {
    try {
        await prisma.invoice.delete({
            where: { id: invoiceId },
        });
        return { success: true };
    } catch (error: any) {
        console.error(`Error deleting invoice ${invoiceId}:`, error);
        if (error.code === 'P2025') {
            return { success: false, error: 'Invoice not found.' };
        }
        return { success: false, error: 'Failed to delete invoice.' };
    }
}
