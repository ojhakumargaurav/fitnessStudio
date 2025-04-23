'use client';

import {useAuth} from '@/hooks/useAuth';
import {useRouter} from 'next/navigation';
import {useEffect} from 'react';

const AdminPage = () => {
  const {user} = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login'); // Redirect to login if not admin
    }
  }, [user, router]);

  if (!user) {
    return <div>Redirecting to login...</div>;
  }

  if (user.role !== 'admin') {
    return <div>Unauthorized</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5 text-primary">Admin Dashboard</h1>
      <p>Manage users and trainers here.</p>
      {/* Add user management components here */}
    </div>
  );
};

export default AdminPage;
