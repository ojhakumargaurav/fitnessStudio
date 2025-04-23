'use client';

import {useEffect, useState} from 'react';
import {Trainer, getTrainers} from '@/services/trainer';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';

const TrainersPage = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);

  useEffect(() => {
    const fetchTrainers = async () => {
      const trainerList = await getTrainers();
      setTrainers(trainerList);
    };

    fetchTrainers();
  }, []);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5 text-primary">Our Trainers</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainers.map((trainer) => (
          <Card key={trainer.id}>
            <CardHeader>
              <CardTitle>{trainer.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Specialization: {trainer.specialization}</p>
              <p>Experience: {trainer.experience} years</p>
              <p>Schedule: {trainer.schedule}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TrainersPage;
