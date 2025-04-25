
'use client';

import {Button} from '@/components/ui/button';
import {useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';
import prisma from '@/lib/prisma'; // Import Prisma client

interface CarouselImage {
  id: string;
  url: string;
  position: number;
}

export default function Home() {
  const router = useRouter();
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([
    {id: '1', url: 'https://picsum.photos/800/400', position: 1},
    {id: '2', url: 'https://picsum.photos/800/401', position: 2},
    {id: '3', url: 'https://picsum.photos/800/402', position: 3},
  ]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchCarouselImages = async () => {
      try {
        const images = await prisma.carouselImage.findMany({
          orderBy: {
            position: 'asc',
          },
        });
        setCarouselImages(images);
      } catch (error) {
        console.error('Error fetching carousel images:', error);
        // Optionally set a default set of images or show an error message
      }
    };

    fetchCarouselImages();
  }, []);

  useEffect(() => {
    // Auto-advance the carousel every 5 seconds
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
    }, 5000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [carouselImages.length]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-secondary">
      {/* Carousel Section */}
      <div className="w-full max-w-4xl mb-8 rounded-lg overflow-hidden shadow-xl">
        {carouselImages.length > 0 ? (
          <img
            src={carouselImages[currentImageIndex].url}
            alt={`Carousel Image ${currentImageIndex + 1}`}
            className="w-full h-96 object-cover"
          />
        ) : (
          <div className="w-full h-96 flex items-center justify-center bg-muted">
            <p className="text-lg text-muted-foreground">No images available.</p>
          </div>
        )}
      </div>

      <h1 className="text-3xl font-bold mb-4 text-primary sm:text-4xl">Welcome to Fitness Hub</h1>
      <p className="text-lg mb-8 text-muted-foreground text-center">
        Manage your fitness journey, book classes, and interact with trainers.
      </p>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0">
        <Button onClick={() => router.push('/classes')}>View Classes</Button>
        <Button variant="secondary" onClick={() => router.push('/trainers')}>
          Meet Our Trainers
        </Button>
      </div>
    </div>
  );
}
