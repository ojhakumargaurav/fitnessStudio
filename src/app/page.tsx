
'use client';

import {Button} from '@/components/ui/button';
import {useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';
import { getCarouselImages, CarouselImage } from '@/actions/carousel'; // Import server action and type

export default function Home() {
  const router = useRouter();
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCarouselImages = async () => {
        setIsLoading(true);
      try {
        const images = await getCarouselImages(); // Use server action
        // Use default images only if fetched images are empty
        if (images && images.length > 0) {
          setCarouselImages(images);
        } else {
           // Set default images if fetch returns empty or fails gracefully
           setCarouselImages([
              {id: 'default-1', url: 'https://picsum.photos/800/400', position: 1},
              {id: 'default-2', url: 'https://picsum.photos/800/401', position: 2},
              {id: 'default-3', url: 'https://picsum.photos/800/402', position: 3},
           ]);
        }
      } catch (error) {
        console.error('Error fetching carousel images:', error);
        // Set default images on error
         setCarouselImages([
            {id: 'default-1', url: 'https://picsum.photos/800/400', position: 1},
            {id: 'default-2', url: 'https://picsum.photos/800/401', position: 2},
            {id: 'default-3', url: 'https://picsum.photos/800/402', position: 3},
         ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarouselImages();
  }, []);

  useEffect(() => {
     // Ensure carouselImages has length before setting interval
     if (carouselImages.length === 0) return;

    // Auto-advance the carousel every 5 seconds
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
    }, 5000);

    // Clean up the interval when the component unmounts or images change
    return () => clearInterval(intervalId);
  }, [carouselImages]); // Depend on carouselImages array

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-secondary">
      {/* Carousel Section */}
      <div className="w-full max-w-4xl mb-8 rounded-lg overflow-hidden shadow-xl">
        {isLoading ? (
             <div className="w-full h-96 flex items-center justify-center bg-muted animate-pulse">
                <p className="text-lg text-muted-foreground">Loading images...</p>
             </div>
        ) : carouselImages.length > 0 ? (
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
