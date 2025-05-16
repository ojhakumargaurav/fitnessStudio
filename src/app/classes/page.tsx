
'use client';

import {useState, useEffect} from 'react';
import {Class, ClassBooking} from '@/actions/class'; // Import types from actions
import {getClasses, bookClass, cancelClass, getUserBookings} from '@/actions/class'; // Use server actions
import {Calendar} from '@/components/ui/calendar';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card'; // Added CardDescription
import {useToast} from '@/hooks/use-toast';
import {cn} from '@/lib/utils';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {useAuth} from '@/hooks/useAuth'; // Import useAuth hook
import { UserStatus } from '@/actions/user'; // Import UserStatus object
import { Badge } from "@/components/ui/badge"; // Import Badge
import { useRouter } from 'next/navigation'; // Import useRouter


const ClassesPage = () => {
  const [allClasses, setAllClasses] = useState<Class[]>([]);
  const [userBookings, setUserBookings] = useState<ClassBooking[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const {toast} = useToast();
  const {user, isLoading: isAuthLoading} = useAuth(); // Use the useAuth hook and its loading state
  const router = useRouter(); // Initialize router

  // Fetch classes and user bookings
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [fetchedClasses, fetchedBookings] = await Promise.all([
          getClasses(),
          user?.id ? getUserBookings(user.id) : Promise.resolve([]) // Fetch bookings only if user is logged in
        ]);
        setAllClasses(fetchedClasses);
        setUserBookings(fetchedBookings);
      } catch (error) {
        console.error("Error fetching class data:", error);
        toast({ title: "Error", description: "Failed to load class information.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    if (!isAuthLoading) { // Only fetch data once auth state is known
       fetchData();
    }
  }, [user, isAuthLoading, toast]); // Rerun if user changes

  // Filter classes based on date and category
  useEffect(() => {
    if (selectedDate) {
      // Format selectedDate to 'YYYY-MM-DD' string for comparison
      const formattedDate = selectedDate.toISOString().split('T')[0];

      let dailyClasses = allClasses.filter((cls) => {
         // Assuming cls.date is stored as 'YYYY-MM-DDTHH:mm:ss.sssZ' or similar ISO string
         // We need to compare only the date part
         const classDatePart = cls.date.toISOString().split('T')[0];
         return classDatePart === formattedDate;
       });


      if (categoryFilter !== 'All') {
        dailyClasses = dailyClasses.filter((cls) => cls.category === categoryFilter);
      }
      setFilteredClasses(dailyClasses);
    } else {
      setFilteredClasses([]); // Clear if no date selected
    }
  }, [allClasses, selectedDate, categoryFilter]);

  const handleBookClass = async (classId: string) => {
    if (!user || user.role !== 'user') { // Ensure user is logged in and is a 'user'
       toast({ title: "Login Required", description: "Please login as a user to book classes.", variant: "destructive" });
       return;
    }

    if (user.status !== UserStatus.ACTIVE) {
        toast({
            title: 'Booking Restricted',
            description: 'Your account is pending approval. Please contact admin to book classes.',
            variant: 'destructive'
        });
        return;
    }

    // Check if already booked
    if (userBookings.some(booking => booking.classId === classId)) {
        toast({ title: "Already Booked", description: "You have already booked this class.", variant: "default" });
        return;
    }

     // Check for available slots before attempting to book
    const targetClass = allClasses.find(cls => cls.id === classId);
    if (!targetClass || targetClass.availableSlots <= 0) {
        toast({ title: "Class Full", description: "Sorry, this class is already full.", variant: "destructive" });
        // Optionally re-fetch classes to ensure UI is up-to-date
         const updatedClasses = await getClasses(); setAllClasses(updatedClasses);
        return;
    }


    try {
        const result = await bookClass(classId, user.id);
        if (result.success && result.booking) {
            // Optimistically update UI
            setAllClasses((prevClasses) =>
                prevClasses.map((cls) =>
                    cls.id === classId ? {...cls, availableSlots: Math.max(0, cls.availableSlots - 1)} : cls
                )
            );
            setUserBookings([...userBookings, result.booking]); // Add to user's bookings
            toast({
                title: 'Success!',
                description: 'You have successfully booked the class.',
            });
        } else {
             // If booking failed, update the UI to reflect actual availability
             const currentClasses = await getClasses();
             setAllClasses(currentClasses);
             toast({
                title: 'Error',
                description: result.error || 'Failed to book the class. It might be full.',
                variant: 'destructive',
            });
        }
    } catch (error: any) {
        // Handle potential network errors or unexpected issues
        console.error("Booking error:", error);
        toast({
            title: 'Error',
            description: 'An unexpected error occurred while booking.',
            variant: 'destructive',
        });
         // Refresh class list on error as well
        const currentClasses = await getClasses();
        setAllClasses(currentClasses);
    }
  };

  const handleCancelClass = async (classId: string) => {
     if (!user || user.role !== 'user') return; // Ensure user is logged in and is a 'user'

    const bookingToCancel = userBookings.find(booking => booking.classId === classId);
     if (!bookingToCancel) {
        toast({ title: "Not Booked", description: "You haven't booked this class.", variant: "default" });
        return; // Not booked
     }


    try {
        const result = await cancelClass(bookingToCancel.id, user.id); // Pass booking ID and user ID
        if (result.success) {
            // Optimistically update UI
            setAllClasses((prevClasses) =>
                prevClasses.map((cls) =>
                    cls.id === classId ? {...cls, availableSlots: cls.availableSlots + 1} : cls
                )
            );
             setUserBookings(userBookings.filter(booking => booking.id !== bookingToCancel.id)); // Remove from user's bookings
            toast({
                title: 'Success!',
                description: 'Your booking has been cancelled.',
            });
        } else {
             // Refetch data on failure to ensure consistency
             const [fetchedClasses, fetchedBookings] = await Promise.all([getClasses(), getUserBookings(user.id)]);
             setAllClasses(fetchedClasses);
             setUserBookings(fetchedBookings);
             toast({
                title: 'Error',
                description: result.error || 'Failed to cancel the booking.',
                variant: 'destructive',
            });
        }
    } catch (error: any) {
        console.error("Cancellation error:", error);
        toast({
            title: 'Error',
            description: 'An unexpected error occurred during cancellation.',
            variant: 'destructive',
        });
        // Refetch data on error
        const [fetchedClasses, fetchedBookings] = await Promise.all([getClasses(), getUserBookings(user.id)]);
        setAllClasses(fetchedClasses);
        setUserBookings(fetchedBookings);
    }
  };


  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const isUserBooked = (classId: string): boolean => {
      return userBookings.some(booking => booking.classId === classId);
  }

   // Combined loading state
   if (isAuthLoading || isLoading) {
     return <div className="container mx-auto py-10 text-center">Loading classes...</div>;
   }


   // Handle case where user is not logged in
   if (!user && !isAuthLoading) {
     return (
         <div className="container mx-auto py-10 flex flex-col items-center">
            <h1 className="text-2xl font-semibold mb-4 text-primary">View Classes</h1>
            <p className="text-lg mb-4 text-muted-foreground">Please log in to view details and book classes.</p>
             <Button onClick={() => router.push('/login')}>Login</Button>
             {/* Optionally still show the calendar and read-only class list */}
             {/* ... Calendar and Class List for logged-out users ... */}
         </div>
     );
   }

  // Specific message for pending users
   if (user && user.role === 'user' && user.status === UserStatus.PENDING) {
       return (
          <div className="container mx-auto py-10 text-center">
             <h1 className="text-2xl font-semibold mb-4 text-primary">Account Pending Approval</h1>
             <p className="text-muted-foreground mb-6">
               Your account is currently awaiting administrator approval.
               You can browse classes, but booking will be enabled once your account is activated.
             </p>
              <p className="text-muted-foreground">Please check back later or contact support if you have questions.</p>
              {/* Keep calendar and class list visible for browsing */}
                <div className="flex flex-col md:flex-row gap-8 mt-8">
                    {/* Calendar */}
                    <Card className="w-full md:w-auto shadow-md">
                    <CardHeader>
                        <CardTitle>Select Date</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} />
                    </CardContent>
                    </Card>

                    {/* Class List */}
                    <div className="w-full">
                        {/* Filtering UI */}
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-foreground mb-2 sm:mb-0">
                            {selectedDate ? `Available Classes for ${selectedDate.toLocaleDateString()}` : 'Select a date'}
                            </h2>
                            <Select onValueChange={(value) => setCategoryFilter(value)} defaultValue="All">
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Filter by category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Categories</SelectItem>
                                <SelectItem value="Yoga">Yoga</SelectItem>
                                <SelectItem value="Strength Training">Strength Training</SelectItem>
                                <SelectItem value="Cardio">Cardio</SelectItem>
                                {/* Add other categories dynamically? */}
                            </SelectContent>
                            </Select>
                        </div>
                        {/* Class Cards */}
                        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                        {filteredClasses.length > 0 ? (
                        filteredClasses.map((cls) => (
                            <Card key={cls.id} className="shadow-md">
                            <CardHeader>
                                <CardTitle className="flex justify-between items-start">
                                <span>{cls.name}</span>
                                <Badge
                                    variant={cls.availableSlots === 0 ? 'destructive' : 'secondary'}
                                    className="text-xs whitespace-nowrap"
                                >
                                    {cls.availableSlots === 0 ? 'Full' : `${cls.availableSlots} slots left`}
                                </Badge>
                                </CardTitle>
                                <CardDescription>Category: {cls.category}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">Time: {cls.startTime} - {cls.endTime}</p>
                                <p className="text-sm text-muted-foreground">Trainer: {cls.trainer?.name || 'N/A'}</p> {/* Display trainer name */}
                                <div className="flex justify-end mt-4">
                                <Button disabled title="Account pending approval">Booking Disabled</Button>
                                </div>
                            </CardContent>
                            </Card>
                        ))
                        ) : (
                        <p className="text-muted-foreground lg:col-span-2 text-center py-4">
                            {selectedDate ? 'No classes available for the selected date and category.' : 'Please select a date to see classes.'}
                        </p>
                        )}
                        </div>
                    </div>
                </div>
          </div>
       );
   }


  // Main view for active users and admins/trainers
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-primary">Available Classes</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Calendar */}
        <Card className="w-full md:w-auto shadow-md">
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} />
          </CardContent>
        </Card>

        {/* Class List */}
        <div className="w-full">
          {/* Filtering UI */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-foreground mb-2 sm:mb-0">
              {selectedDate ? `Classes for ${selectedDate.toLocaleDateString()}` : 'Select a date'}
            </h2>
             <Select onValueChange={(value) => setCategoryFilter(value)} defaultValue="All">
               <SelectTrigger className="w-full sm:w-[200px]">
                 <SelectValue placeholder="Filter by category" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="All">All Categories</SelectItem>
                 <SelectItem value="Yoga">Yoga</SelectItem>
                 <SelectItem value="Strength Training">Strength Training</SelectItem>
                 <SelectItem value="Cardio">Cardio</SelectItem>
                  {/* Add other categories dynamically? */}
               </SelectContent>
             </Select>
          </div>
          {/* Class Cards */}
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
             {/* No need for separate loading check here as it's handled above */}
             {filteredClasses.length === 0 && (
                 <p className="text-muted-foreground lg:col-span-2 text-center py-4">
                     {selectedDate ? 'No classes available for the selected date and category.' : 'Please select a date to see classes.'}
                 </p>
             )}
            {filteredClasses.length > 0 &&
              filteredClasses.map((cls) => {
                  const booked = user ? isUserBooked(cls.id) : false; // Check only if user exists
                  const canBook = user?.role === 'user' && user?.status === UserStatus.ACTIVE && cls.availableSlots > 0 && !booked;
                  const isFull = cls.availableSlots <= 0;

                  return (
                    <Card key={cls.id} className="shadow-md">
                        <CardHeader>
                            <CardTitle className="flex justify-between items-start">
                            <span>{cls.name}</span>
                            <Badge
                                variant={isFull ? 'destructive' : 'secondary'}
                                className="text-xs whitespace-nowrap"
                            >
                                {isFull ? 'Full' : `${cls.availableSlots} slots left`}
                            </Badge>
                            </CardTitle>
                             <CardDescription>Category: {cls.category}</CardDescription>
                        </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">Time: {cls.startTime} - {cls.endTime}</p>
                        <p className="text-sm text-muted-foreground">Trainer: {cls.trainer?.name || 'N/A'}</p> {/* Display trainer name */}
                         {/* Only show booking buttons for 'user' role */}
                        {user?.role === 'user' && (
                             <div className="flex justify-end mt-4 space-x-2">
                               {booked && (
                                 <Button variant="outline" onClick={() => handleCancelClass(cls.id)}>
                                   Cancel Booking
                                 </Button>
                               )}
                               {canBook && (
                                   <Button onClick={() => handleBookClass(cls.id)}>Book Class</Button>
                               )}
                                {isFull && !booked && (
                                    <Button variant="destructive" disabled>
                                        Class Full
                                    </Button>
                                )}
                                {/* Add button for pending users - already handled above */}
                             </div>
                         )}
                         {/* Optional: Display message for trainers/admins */}
                         {(user?.role === 'admin' || user?.role === 'trainer') && (
                            <div className="text-right mt-4 text-sm text-muted-foreground italic">
                                Booking available for active users.
                            </div>
                         )}
                      </CardContent>
                    </Card>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassesPage;
