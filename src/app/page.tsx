
'use client';

import {Button} from '@/components/ui/button';
import {useRouter}from 'next/navigation';
import {useEffect, useState} from 'react';
import { getCarouselImages, CarouselImage } from '@/actions/carousel'; // Import server action and type

// Helper function to check if a URL is for a video file
const isVideoUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    const lowerUrl = url.toLowerCase();
    return lowerUrl.endsWith('.mp4') || lowerUrl.endsWith('.webm') || lowerUrl.endsWith('.ogg');
  } catch (e) {
    return false;
  }
};

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
        if (images && images.length > 0) {
          setCarouselImages(images.filter(img => img.isActive).sort((a, b) => a.position - b.position));
        } else {
           setCarouselImages([
              {id: 'default-1', url: 'https://placehold.co/800x400.png', dataAiHint: 'placeholder one', position: 1, isActive: true, createdAt: new Date(), updatedAt: new Date()},
              {id: 'default-2', url: 'https://placehold.co/800x400.png', dataAiHint: 'placeholder two', position: 2, isActive: true, createdAt: new Date(), updatedAt: new Date()},
              {id: 'default-3', url: 'https://placehold.co/800x400.png', dataAiHint: 'placeholder three', position: 3, isActive: true, createdAt: new Date(), updatedAt: new Date()},
           ]);
        }
      } catch (error) {
        console.error('Error fetching carousel images:', error);
         setCarouselImages([
            {id: 'default-1', url: 'https://placehold.co/800x400.png', dataAiHint: 'placeholder one', position: 1, isActive: true, createdAt: new Date(), updatedAt: new Date()},
            {id: 'default-2', url: 'https://placehold.co/800x400.png', dataAiHint: 'placeholder two', position: 2, isActive: true, createdAt: new Date(), updatedAt: new Date()},
            {id: 'default-3', url: 'https://placehold.co/800x400.png', dataAiHint: 'placeholder three', position: 3, isActive: true, createdAt: new Date(), updatedAt: new Date()},
         ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarouselImages();
  }, []);

  useEffect(() => {
     if (carouselImages.length === 0) return;

    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [carouselImages]);

  const currentItem = carouselImages.length > 0 ? carouselImages[currentImageIndex] : null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-secondary">
      <div className="w-full max-w-4xl mb-8 rounded-lg overflow-hidden shadow-xl">
        {isLoading ? (
             <div className="w-full h-96 flex items-center justify-center bg-muted animate-pulse">
                <p className="text-lg text-muted-foreground">Loading content...</p>
             </div>
        ) : currentItem ? (
          currentItem.url && isVideoUrl(currentItem.url) ? (
            <video
              key={currentItem.id || currentItem.url} // Use item id or url as key
              src={currentItem.url}
              className="w-full h-96 object-cover"
              autoPlay
              muted
              loop
              playsInline // Important for iOS autoplay
              preload="metadata"
            />
          ) : (
            <img
              key={currentItem.id || currentItem.url} // Use item id or url as key
              src={currentItem.url || 'https://placehold.co/800x400.png'} // Fallback image
              alt={currentItem.dataAiHint || `Carousel content ${currentImageIndex + 1}`}
              data-ai-hint={currentItem.dataAiHint || ''}
              className="w-full h-96 object-cover"
            />
          )
        ) : (
          <div className="w-full h-96 flex items-center justify-center bg-muted">
            <p className="text-lg text-muted-foreground">No content available for carousel.</p>
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
