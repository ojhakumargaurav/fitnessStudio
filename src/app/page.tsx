'use client';

import {Button} from '@/components/ui/button';
import {useRouter} from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-secondary">
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
