'use client';

import {Button} from '@/components/ui/button';
import {useRouter} from 'next/navigation';

export const Navbar = () => {
  const router = useRouter();

  return (
    <div className="bg-secondary p-4 flex justify-between items-center">
      <span className="font-bold text-lg text-primary cursor-pointer" onClick={() => router.push('/')}>
        Fitness Hub
      </span>
      <div>
        <Button variant="ghost" onClick={() => router.push('/classes')}>
          Classes
        </Button>
        <Button variant="ghost" onClick={() => router.push('/trainers')}>
          Trainers
        </Button>
      </div>
    </div>
  );
};
