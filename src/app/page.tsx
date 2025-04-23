'use client';

import {Button} from '@/components/ui/button';
import {useRouter} from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-secondary">
      <h1 className="text-4xl font-bold mb-4 text-primary">Welcome to Fitness Hub</h1>
      <p className="text-lg mb-8 text-muted-foreground">
        Manage your fitness journey, book classes, and interact with trainers.
      </p>
      <div className="flex space-x-4">
        <Button onClick={() => router.push('/classes')}>View Classes</Button>
        <Button variant="secondary" onClick={() => router.push('/trainers')}>
          Meet Our Trainers
        </Button>
      </div>
    </div>
  );
}
