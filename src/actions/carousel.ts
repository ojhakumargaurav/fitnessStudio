
'use server';

import prisma from '@/lib/prisma';
import type { CarouselImage as PrismaCarouselImage } from '@prisma/client';

// Re-export type for frontend convenience
export type CarouselImage = PrismaCarouselImage;

interface ActionResult<T = null> {
    success: boolean;
    data?: T;
    error?: string;
}

interface ImageOrder {
    id: string;
    position: number;
}

// --- Carousel Image Actions ---

export async function getCarouselImages(): Promise<CarouselImage[]> {
  try {
    const images = await prisma.carouselImage.findMany({
      orderBy: {
        position: 'asc',
      },
    });
    return images;
  } catch (error) {
    console.error("Error fetching carousel images:", error);
    // Return empty array or throw? For frontend robustness, maybe return empty.
    return [];
  }
}

export async function addCarouselImage(url: string, position: number): Promise<ActionResult<{ image: CarouselImage }>> {
  try {
     // Basic URL validation might be helpful here
     if (!url || !url.startsWith('http')) {
         return { success: false, error: 'Invalid URL provided.' };
     }

    const newImage = await prisma.carouselImage.create({
      data: {
        url: url,
        position: position,
      },
    });
    return { success: true, data: { image: newImage } };
  } catch (error) {
    console.error("Error adding carousel image:", error);
    return { success: false, error: 'Failed to add image.' };
  }
}

export async function deleteCarouselImage(imageId: string): Promise<ActionResult> {
  try {
    await prisma.carouselImage.delete({
      where: { id: imageId },
    });
    return { success: true };
  } catch (error: any) {
    console.error(`Error deleting carousel image ${imageId}:`, error);
     if (error.code === 'P2025') { // Record to delete not found
       return { success: false, error: 'Image not found.' };
     }
    return { success: false, error: 'Failed to delete image.' };
  }
}

export async function updateCarouselImageOrder(order: ImageOrder[]): Promise<ActionResult> {
  try {
    // Use a transaction to update all positions atomically
    await prisma.$transaction(
      order.map((item) =>
        prisma.carouselImage.update({
          where: { id: item.id },
          data: { position: item.position },
        })
      )
    );
    return { success: true };
  } catch (error) {
    console.error("Error updating carousel image order:", error);
    return { success: false, error: 'Failed to update image order.' };
  }
}
