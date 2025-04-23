'use client';

import {useState, useEffect} from 'react';
import {Class} from '@/services/class';
import {getClasses, bookClass, cancelClass} from '@/services/class';
import {Calendar} from '@/components/ui/calendar';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {useToast} from '@/hooks/use-toast';
import {cn} from '@/lib/utils';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';

const ClassesPage = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const {toast} = useToast();

  useEffect(() => {
    const fetchClasses = async () => {
      const allClasses = await getClasses();
      setClasses(allClasses);
    };

    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const dailyClasses = classes.filter((cls) => cls.date === formattedDate);

      if (categoryFilter === 'All') {
        setFilteredClasses(dailyClasses);
      } else {
        setFilteredClasses(dailyClasses.filter((cls) => cls.category === categoryFilter));
      }
    }
  }, [classes, selectedDate, categoryFilter]);

  const handleBookClass = async (classId: string) => {
    const success = await bookClass(classId);
    if (success) {
      setClasses((prevClasses) =>
        prevClasses.map((cls) =>
          cls.id === classId ? {...cls, availableSlots: Math.max(0, cls.availableSlots - 1)} : cls
        )
      );
      toast({
        title: 'Success!',
        description: 'You have successfully booked the class.',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to book the class. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCancelClass = async (classId: string) => {
    const success = await cancelClass(classId);
    if (success) {
      setClasses((prevClasses) =>
        prevClasses.map((cls) =>
          cls.id === classId ? {...cls, availableSlots: cls.availableSlots + 1} : cls
        )
      );
      toast({
        title: 'Success!',
        description: 'You have successfully cancelled the class.',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to cancel the class. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5 text-primary">Available Classes</h1>

      <div className="flex flex-col gap-4">
        {/* Calendar */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} />
          </CardContent>
        </Card>

        {/* Class List */}
        <div className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-foreground mb-2 sm:mb-0">
              {selectedDate
                ? `Classes for ${selectedDate.toLocaleDateString()}`
                : 'Select a date to view classes'}
            </h2>
            <Select onValueChange={(value) => setCategoryFilter(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                <SelectItem value="Yoga">Yoga</SelectItem>
                <SelectItem value="Strength Training">Strength Training</SelectItem>
                <SelectItem value="Cardio">Cardio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {filteredClasses.length > 0 ? (
              filteredClasses.map((cls) => (
                <Card key={cls.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      {cls.name}
                      <span
                        className={cn(
                          'ml-2 rounded-md px-2 py-1 text-xs font-medium',
                          cls.availableSlots === 0 ? 'bg-destructive text-destructive-foreground' : 'bg-secondary text-secondary-foreground'
                        )}
                      >
                        {cls.availableSlots === 0 ? 'Full' : `${cls.availableSlots} slots`}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Category: {cls.category}</p>
                    <p>Time: {cls.startTime} - {cls.endTime}</p>
                    <div className="flex justify-end mt-4">
                      {cls.availableSlots > 0 ? (
                        <Button onClick={() => handleBookClass(cls.id)}>Book Class</Button>
                      ) : (
                        <Button variant="destructive" disabled>
                          Class Full
                        </Button>
                      )}
                      <Button variant="outline" onClick={() => handleCancelClass(cls.id)} className="ml-2">
                        Cancel Booking
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p>No classes available for the selected date and category.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassesPage;
