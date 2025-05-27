
'use client';

import {useEffect, useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { getTrainersForPublicListing, Trainer } from '@/actions/trainer'; // Use getTrainersForPublicListing
import { useToast } from "@/hooks/use-toast"; // Import toast

const TrainersPage = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast(); // Initialize toast

  useEffect(() => {
    const fetchTrainers = async () => {
       setIsLoading(true);
      try {
          const trainerList = await getTrainersForPublicListing(); // Call the updated action
          setTrainers(trainerList); // Action already filters for active trainers with 'trainer' role
      } catch (error) {
          console.error("Failed to fetch trainers:", error);
          toast({ title: "Error", description: "Failed to load trainers.", variant: "destructive" });
      } finally {
          setIsLoading(false);
      }
    };

    fetchTrainers();
  }, [toast]); // Add toast to dependency array if it's used within useEffect directly

  if (isLoading) {
    return <div className="container mx-auto py-10 text-center">Loading trainers...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-primary">Our Trainers</h1>
      <p className="text-muted-foreground mb-8">Meet our team of dedicated and active professionals.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainers.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground">No active trainers found.</p>
        ) : (
            trainers.map((trainer) => (
            <Card key={trainer.id} className="shadow-md">
                <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>{trainer.name}</span>
                    {/* Trainers page should only show 'trainer' role, so badge might be redundant or styled differently */}
                    <Badge variant={'secondary'}>
                        Trainer
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
