
'use client';

import {useEffect, useState} from 'react';
import { getTrainers, Trainer } from '@/actions/trainer'; // Import from actions
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'; // Added CardDescription
import { Badge } from "@/components/ui/badge"; // Import Badge

const TrainersPage = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchTrainers = async () => {
       setIsLoading(true);
      try {
          const trainerList = await getTrainers();
          setTrainers(trainerList);
      } catch (error) {
          console.error("Failed to fetch trainers:", error);
          // Handle error appropriately, maybe show a message
      } finally {
          setIsLoading(false);
      }
    };

    fetchTrainers();
  }, []);

  if (isLoading) {
    return <div className="container mx-auto py-10 text-center">Loading trainers...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-primary">Our Trainers & Admins</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainers.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground">No trainers or admins found.</p>
        ) : (
            trainers.map((trainer) => (
            <Card key={trainer.id} className="shadow-md">
                <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>{trainer.name}</span>
                     {/* Show role badge */}
                    <Badge variant={trainer.role === 'admin' ? 'destructive' : 'secondary'}>
                        {trainer.role.charAt(0).toUpperCase() + trainer.role.slice(1)}
                    </Badge>
                </CardTitle>
                 <CardDescription>
                    Specialization: {trainer.specialization}
                 </CardDescription>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-muted-foreground">
                    <p>Experience: {trainer.experience} years</p>
                    <p>Schedule: {trainer.schedule}</p>
                    <p>Email: {trainer.email}</p>
                    {trainer.phoneNumber && <p>Phone: {trainer.phoneNumber}</p>}
                </CardContent>
            </Card>
            ))
        )}
      </div>
    </div>
  );
};

export default TrainersPage;
