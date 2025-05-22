
'use client';

import {useEffect, useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { getTrainers as fetchTrainersAction, Trainer } from '@/actions/trainer'; // Import server action and type

const TrainersPage = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]); // Use Trainer type
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrainers = async () => {
       setIsLoading(true);
      try {
          // Use the imported server action
          const trainerList = await fetchTrainersAction();
          // The action now filters for isActive: true, so no need to filter here
          setTrainers(trainerList);
      } catch (error) {
          console.error("Failed to fetch trainers:", error);
          toast({ title: "Error", description: "Failed to load trainers.", variant: "destructive" });
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
      <p className="text-muted-foreground mb-8">Meet our team of dedicated and active professionals.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainers.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground">No active trainers or admins found.</p>
        ) : (
            trainers.map((trainer) => ( // trainer is already filtered to be active
            <Card key={trainer.id} className="shadow-md">
                <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>{trainer.name}</span>
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
                    {trainer.bio && <p className="mt-2 pt-2 border-t border-border italic">Bio: {trainer.bio}</p>}
                </CardContent>
            </Card>
            ))
        )}
      </div>
    </div>
  );
};

export default TrainersPage;

// Toast import for error handling (if not already present globally)
import { toast } from "@/hooks/use-toast";
