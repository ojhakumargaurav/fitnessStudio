
'use client';

import {useEffect, useState}from 'react';
import Image from 'next/image'; // Import next/image
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { getTrainersForPublicListing, Trainer } from '@/actions/trainer';
import { useToast } from "@/hooks/use-toast";
import { AdminRoles } from '@/types/roles';

const TrainersPage = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTrainers = async () => {
       setIsLoading(true);
      try {
          const trainerList = await getTrainersForPublicListing();
          setTrainers(trainerList);
      } catch (error) {
          console.error("Failed to fetch trainers:", error);
          toast({ title: "Error", description: "Failed to load trainers.", variant: "destructive" });
      } finally {
          setIsLoading(false);
      }
    };

    fetchTrainers();
  }, [toast]);

  if (isLoading) {
    return <div className="container mx-auto py-10 text-center">Loading trainers...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-primary">Our Team</h1>
      <p className="text-muted-foreground mb-8">Meet our team of dedicated and active professionals.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainers.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground">No active team members found.</p>
        ) : (
            trainers.map((trainer) => (
            <Card key={trainer.id} className="shadow-md flex flex-col">
                <CardHeader>
                    {trainer.imageUrl ? (
                        <div className="relative w-full h-48 mb-4 rounded-t-md overflow-hidden">
                            <Image
                                src={trainer.imageUrl}
                                alt={trainer.name}
                                layout="fill"
                                objectFit="cover"
                                className="bg-muted"
                                data-ai-hint="person trainer"
                            />
                        </div>
                    ) : (
                        <div className="relative w-full h-48 mb-4 rounded-t-md overflow-hidden bg-muted flex items-center justify-center">
                             <Image
                                src="https://placehold.co/400x400.png" // Default placeholder
                                alt="Placeholder"
                                layout="fill"
                                objectFit="cover"
                                data-ai-hint="placeholder person"
                            />
                        </div>
                    )}
                    <CardTitle className="flex justify-between items-center">
                        <span>{trainer.name}</span>
                        <Badge variant={trainer.role === AdminRoles.ADMIN ? 'destructive' : 'secondary'}>
                            {trainer.role.charAt(0).toUpperCase() + trainer.role.slice(1)}
                        </Badge>
                    </CardTitle>
                    <CardDescription>
                        Specialization: {trainer.specialization}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-muted-foreground flex-grow">
                    <p>Experience: {trainer.experience} years</p>
                    <p>Schedule: {trainer.schedule}</p>
                    <p>Email: {trainer.email}</p>
                    {trainer.phoneNumber && <p>Phone: {trainer.phoneNumber}</p>}
                    {trainer.bio && <p className="mt-2 pt-2 border-t border-border italic text-xs">Bio: {trainer.bio}</p>}
                </CardContent>
            </Card>
            ))
        )}
      </div>
    </div>
  );
};

export default TrainersPage;
