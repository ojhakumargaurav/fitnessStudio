'use client';

import {useAuth} from '@/hooks/useAuth';
import {useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Trainer {
  id: string;
  name: string;
  specialization: string;
  experience: number;
}

const AdminPage = () => {
  const {user} = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([
    {id: '1', name: 'John Doe', email: 'john@example.com', role: 'user'},
    {id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'trainer'},
    {id: '3', name: 'Admin User', email: 'admin@example.com', role: 'admin'},
  ]);
  const [trainers, setTrainers] = useState<Trainer[]>([
    {id: '1', name: 'Trainer 1', specialization: 'Yoga', experience: 5},
    {id: '2', name: 'Trainer 2', specialization: 'Strength Training', experience: 8},
  ]);

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

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>List of all users in the system.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trainers</CardTitle>
          <CardDescription>List of all trainers in the system.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Experience</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainers.map((trainer) => (
                <TableRow key={trainer.id}>
                  <TableCell>{trainer.name}</TableCell>
                  <TableCell>{trainer.specialization}</TableCell>
                  <TableCell>{trainer.experience} years</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPage;
