'use client';

import {useAuth} from '@/hooks/useAuth';
import {useRouter} from 'next/navigation';
import {useEffect} from 'react';

const TrainerPage = () => {
  const {user} = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== 'trainer') {
      router.push('/login'); // Redirect to login if not trainer
    }
  }, [user, router]);

  if (!user) {
    return <div>Redirecting to login...</div>;
  }

  if (user.role !== 'trainer') {
    return <div>Unauthorized</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5 text-primary">Trainer Dashboard</h1>
      <p>Schedule class</p>
      {/* Add schedule components here */}
    </div>
  );
};

export default TrainerPage;
