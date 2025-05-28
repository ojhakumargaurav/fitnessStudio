
'use client';

import {useAuth}from '@/hooks/useAuth';
import {useRouter}from 'next/navigation';
import {useEffect, useState, useMemo, useCallback}from 'react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {Button}from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {Input}from "@/components/ui/input";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter} from "@/components/ui/dialog";
import {Label}from "@/components/ui/label";
import {Textarea}from "@/components/ui/textarea";
import type {Trainer}from "@/actions/trainer";
import { AdminRoleString, AdminRoles } from '@/types/roles';
import type {User}from "@/actions/user";
import { UserStatus, type UserStatusString } from "@/types/user";
import {Plus, Edit, Trash2, FileText, History, UserPlus, ImagePlus, CheckSquare, TrendingUp, EyeOff, ShieldAlert } from "lucide-react";
import {cn}from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue}from "@/components/ui/select";
import {getUsers, createUser, updateUserStatus, deleteUser as softDeleteUserAction}from '@/actions/user';
import { getManageableAccounts, createTrainer, updateTrainer, deleteTrainer as softDeleteTrainerAction, getTrainersForPublicListing } from '@/actions/trainer';
import { getInvoices, createInvoice, markInvoiceAsPaid, deleteInvoice as softDeleteInvoiceAction, Invoice } from '@/actions/invoice';
import { getCarouselImages, addCarouselImage, deleteCarouselImage, updateCarouselImageOrder, CarouselImage } from '@/actions/carousel';
import { useToast } from '@/hooks/use-toast';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";


const chartConfig = {
  total: {
    label: "Earnings ($)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;


const AdminPage = () => {
  const {user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [trainersAndAdmins, setTrainersAndAdmins] = useState<Trainer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);

  const [openTrainerDialog, setOpenTrainerDialog] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [trainerName, setTrainerName] = useState('');
  const [trainerSpecialization, setTrainerSpecialization] = useState('');
  const [trainerExperience, setTrainerExperience] = useState('');
  const [trainerSchedule, setTrainerSchedule] = useState('');
  const [trainerEmail, setTrainerEmail] = useState('');
  const [trainerPassword, setTrainerPassword] = useState('');
  const [trainerPhoneNumber, setTrainerPhoneNumber] = useState('');
  const [trainerRole, setTrainerRole] = useState<AdminRoleString>(AdminRoles.TRAINER);
  const [trainerBio, setTrainerBio] = useState('');
  const [trainerImageUrl, setTrainerImageUrl] = useState('');

  const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);
  const [selectedUserForInvoice, setSelectedUserForInvoice] = useState<User | null>(null);
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceDueDate, setInvoiceDueDate] = useState('');
  const [openPaymentHistoryDialog, setOpenPaymentHistoryDialog] = useState(false);
  const [selectedUserPaymentHistory, setSelectedUserPaymentHistory] = useState<User | null>(null);
  const [paymentDate, setPaymentDate] = useState('');
  const [openMarkPaidDialog, setOpenMarkPaidDialog] = useState(false);
  const [invoiceToMarkPaid, setInvoiceToMarkPaid] = useState<Invoice | null>(null);

  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userPhoneNumber, setUserPhoneNumber] = useState('');

  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const loggedInUserRole = user?.role as AdminRoleString | undefined;

  const fetchAdminData = useCallback(async () => {
    if (!loggedInUserRole || (loggedInUserRole !== AdminRoles.ADMIN && loggedInUserRole !== AdminRoles.IT_ADMIN)) {
        setIsLoadingData(false);
        return;
    }
    setIsLoadingData(true);
    try {
        const [userList, manageableAccountsList, invoiceList, imageList] = await Promise.all([
            getUsers(),
            getManageableAccounts(loggedInUserRole),
            getInvoices(),
            getCarouselImages()
        ]);
        setUsers(userList.filter(u => u.isActive));
        setTrainersAndAdmins(manageableAccountsList.filter(t => t.isActive));
        setInvoices(invoiceList.filter(i => i.isActive));
        setCarouselImages(imageList.filter(img => img.isActive).sort((a, b) => a.position - b.position));
    } catch (error) {
        console.error("Error fetching admin data:", error);
        toast({ title: "Error", description: "Failed to load dashboard data.", variant: "destructive" });
    } finally {
        setIsLoadingData(false);
    }
  }, [loggedInUserRole, toast]);


  useEffect(() => {
    if (user?.role === AdminRoles.ADMIN || user?.role === AdminRoles.IT_ADMIN) {
        fetchAdminData();
    }
  }, [user, fetchAdminData]);

  const handleOnDragEnd = useCallback(async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(carouselImages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const newOrder = items.map((item, index) => ({
        id: item.id,
        position: index + 1
    }));

    const originalImages = [...carouselImages];
    setCarouselImages(items.map((item, index)=> ({...item, position: index + 1}))); // Optimistic update

    try {
        const updateResult = await updateCarouselImageOrder(newOrder);
        if (!updateResult.success) {
            setCarouselImages(originalImages); // Revert on failure
            throw new Error(updateResult.error || "Failed to update image order.");
        }
         toast({ title: "Success", description: "Image order updated." });
         // Re-fetch to ensure server state is perfectly aligned
         const updatedImageList = await getCarouselImages();
         setCarouselImages(updatedImageList.filter(img => img.isActive).sort((a,b) => a.position - b.position));

    } catch (error: any) {
        console.error("Error updating carousel order:", error);
        toast({ title: "Error", description: error.message || "Could not update image order.", variant: "destructive" });
        setCarouselImages(originalImages); // Revert on error
         // Consider re-fetching here as well if the optimistic update was complex
         const currentImageList = await getCarouselImages();
         setCarouselImages(currentImageList.filter(img => img.isActive).sort((a,b) => a.position - b.position));
    }
  }, [carouselImages, toast]);


  useEffect(() => {
    if (!isAuthLoading && (!user || (user.role !== AdminRoles.ADMIN && user.role !== AdminRoles.IT_ADMIN))) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);


   const monthlyEarningsData = useMemo(() => {
    const paidInvoices = invoices.filter((inv) => inv.paid && inv.paymentDate && inv.isActive);
    const monthlyTotals: { [key: string]: number } = {};

    paidInvoices.forEach((invoice) => {
      if (invoice.paymentDate) {
        const paymentMonth = format(new Date(invoice.paymentDate), 'yyyy-MM');
        monthlyTotals[paymentMonth] = (monthlyTotals[paymentMonth] || 0) + invoice.amount;
      }
    });

    const sortedEarnings = Object.entries(monthlyTotals)
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return sortedEarnings.map(item => ({
      month: format(new Date(item.month + '-01T00:00:00'), 'MMM yyyy'),
      total: item.total,
    }));
  }, [invoices]);


  if (isAuthLoading || isLoadingData || !user) {
    return <div className="container mx-auto py-10 text-center">Loading Admin Dashboard...</div>;
  }

  if (user.role !== AdminRoles.ADMIN && user.role !== AdminRoles.IT_ADMIN) {
    // This check should ideally happen after hooks if possible, or hooks should be moved up.
    // For simplicity with current structure, this is okay, but be mindful of Rules of Hooks.
    router.push('/login'); // Redirect if not authorized
    return <div className="container mx-auto py-10 text-center">Redirecting...</div>;
  }


  const handleOpenTrainerDialog = (trainerToEdit: Trainer | null = null) => {
    setEditingTrainer(trainerToEdit);
    setTrainerName(trainerToEdit?.name || '');
    setTrainerSpecialization(trainerToEdit?.specialization || '');
    setTrainerExperience(trainerToEdit?.experience.toString() || '');
    setTrainerSchedule(trainerToEdit?.schedule || '');
    setTrainerEmail(trainerToEdit?.email || '');
    setTrainerPassword('');
    setTrainerPhoneNumber(trainerToEdit?.phoneNumber || '');
    setTrainerRole(trainerToEdit?.role as AdminRoleString || AdminRoles.TRAINER);
    setTrainerBio(trainerToEdit?.bio || '');
    setTrainerImageUrl(trainerToEdit?.imageUrl || '');
    setOpenTrainerDialog(true);
  };


  const handleSaveTrainer = async () => {
    if (!loggedInUserRole) {
        toast({ title: "Error", description: "User role not identified.", variant: "destructive" });
        return;
    }
    const experienceNum = parseInt(trainerExperience);
    if (isNaN(experienceNum) || experienceNum < 0) {
        toast({ title: "Error", description: "Experience must be a non-negative number.", variant: "destructive" });
        return;
    }

    if (!trainerName || !trainerSpecialization || !trainerEmail || (!editingTrainer && !trainerPassword) || !trainerRole || !trainerSchedule) {
         toast({ title: "Error", description: "Please fill in all required trainer/admin fields.", variant: "destructive" });
        return;
    }

    const trainerData = {
      name: trainerName,
      specialization: trainerSpecialization,
      experience: experienceNum,
      schedule: trainerSchedule,
      email: trainerEmail,
      phoneNumber: trainerPhoneNumber || undefined,
      role: trainerRole,
      bio: trainerBio || undefined,
      imageUrl: trainerImageUrl || undefined,
    };

    try {
        let result;
        if (editingTrainer) {
             result = await updateTrainer(editingTrainer.id, {
                 ...trainerData,
                 password: trainerPassword.trim() ? trainerPassword.trim() : undefined
             }, loggedInUserRole);
             if (result.success && result.data?.trainer) {
                setTrainersAndAdmins(prev => prev.map(t => t.id === result.data!.trainer!.id ? result.data!.trainer! : t).filter(t => t.isActive));
                toast({ title: "Success", description: "Account updated successfully." });
            } else {
                throw new Error(result.error || "Failed to update account");
            }
        } else {
            if (!trainerPassword.trim()) {
                toast({ title: "Error", description: "Password is required for new accounts.", variant: "destructive" });
                return;
            }
             result = await createTrainer({ ...trainerData, password: trainerPassword.trim() }, loggedInUserRole);
             if (result.success && result.data?.trainer) {
                setTrainersAndAdmins(prev => [...prev, result.data!.trainer!].filter(t => t.isActive));
                toast({ title: "Success", description: "Account added successfully." });
             } else {
                 throw new Error(result.error || "Failed to add account");
             }
        }
        setOpenTrainerDialog(false);
    } catch (error: any) {
        console.error("Error saving account:", error);
        toast({ title: "Error", description: error.message || "Could not save account.", variant: "destructive" });
    }
  };

  const handleSoftDeleteTrainer = async (trainerId: string) => {
    if (!loggedInUserRole) {
        toast({ title: "Error", description: "User role not identified.", variant: "destructive" });
        return;
    }
    if (!confirm("Are you sure you want to deactivate this account? It will be hidden from active lists.")) {
        return;
    }
    try {
        const result = await softDeleteTrainerAction(trainerId, loggedInUserRole);
        if (result.success) {
            setTrainersAndAdmins(prev => prev.filter(t => t.id !== trainerId));
            toast({ title: "Success", description: "Account deactivated successfully." });
        } else {
             throw new Error(result.error || "Failed to deactivate account");
        }
    } catch (error: any) {
        console.error("Error deactivating account:", error);
        toast({ title: "Error", description: error.message || "Could not deactivate account.", variant: "destructive" });
    }
  };

  const handleOpenInvoiceDialog = (user: User) => {
    setSelectedUserForInvoice(user);
    setInvoiceAmount('');
    setInvoiceDueDate('');
    setOpenInvoiceDialog(true);
  };

  const handleGenerateInvoice = async () => {
    if (!selectedUserForInvoice || !invoiceAmount || !invoiceDueDate) {
         toast({ title: "Error", description: "Please provide user, amount, and due date.", variant: "destructive" });
         return;
    }
    const amount = parseFloat(invoiceAmount);
     if (isNaN(amount) || amount <= 0) {
        toast({ title: "Error", description: "Invalid invoice amount.", variant: "destructive" });
        return;
     }

    try {
        const result = await createInvoice({
            userId: selectedUserForInvoice.id,
            amount: amount,
            dueDate: invoiceDueDate,
        });
        if (result.success && result.data?.invoice) {
            setInvoices(prevInvoices => [...prevInvoices, result.data!.invoice!].filter(i => i.isActive));
            toast({ title: "Success", description: "Invoice generated successfully." });
            setOpenInvoiceDialog(false);
        } else {
            throw new Error(result.error || "Failed to generate invoice");
        }
    } catch (error: any) {
        console.error("Error generating invoice:", error);
        toast({ title: "Error", description: error.message || "Could not generate invoice.", variant: "destructive" });
    }
  };

  const handleOpenMarkPaidDialog = (invoice: Invoice) => {
    setInvoiceToMarkPaid(invoice);
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setOpenMarkPaidDialog(true);
  };

 const handleMarkAsPaid = async () => {
    if (!invoiceToMarkPaid || !paymentDate) {
      toast({ title: "Error", description: "Invoice or payment date is missing.", variant: "destructive" });
      return;
    }

    try {
      const result = await markInvoiceAsPaid(invoiceToMarkPaid.id, paymentDate);
      if (result.success && result.data?.invoice) {
        setInvoices(prevInvoices => prevInvoices.map(inv => inv.id === result.data!.invoice!.id ? result.data!.invoice! : inv).filter(i => i.isActive));
        toast({ title: "Success", description: "Invoice marked as paid." });
        setOpenMarkPaidDialog(false);
        setInvoiceToMarkPaid(null);
      } else {
        throw new Error(result.error || "Failed to mark invoice as paid");
      }
    } catch (error: any) {
      console.error("Error marking invoice as paid:", error);
      toast({ title: "Error", description: error.message || "Could not mark invoice as paid.", variant: "destructive" });
    }
  };

  const handleOpenPaymentHistory = (user: User) => {
    setSelectedUserPaymentHistory(user);
    setOpenPaymentHistoryDialog(true);
  };

  const getUnpaidInvoice = (userId: string): Invoice | undefined => {
    return invoices.find(invoice => invoice.userId === userId && !invoice.paid && invoice.isActive);
  };

  const handleOpenUserDialog = () => {
    setUserName('');
    setUserEmail('');
    setUserPassword('');
    setUserPhoneNumber('');
    setOpenUserDialog(true);
  };

  const handleSaveUser = async () => {
     if (!userName || !userEmail || !userPassword) {
        toast({ title: "Error", description: "Please fill in name, email, and password for the client.", variant: "destructive" });
        return;
     }

    try {
      const result = await createUser({
        name: userName,
        email: userEmail,
        password: userPassword,
        phoneNumber: userPhoneNumber || null,
        status: UserStatus.ACTIVE as UserStatusString // New users created by admin are active
      });

      if (result.success && result.user) {
        setUsers(prevUsers => [...prevUsers, result.user!].filter(u => u.isActive));
        toast({ title: "Success", description: "Client added successfully." });
        setOpenUserDialog(false);
      } else {
        throw new Error(result.error || "Failed to add client");
      }
    } catch (error: any) {
      console.error("Error adding client:", error);
      toast({ title: "Error", description: error.message || "Could not add client.", variant: "destructive" });
    }
  };

   const handleVerifyUser = async (userId: string) => {
    if (!confirm("Are you sure you want to verify this user and mark them as active?")) {
        return;
    }
    try {
        const result = await updateUserStatus(userId, UserStatus.ACTIVE as UserStatusString);
        if (result.success && result.user) {
            setUsers(prevUsers => prevUsers.map(u => u.id === userId ? result.user! : u).filter(u => u.isActive));
            toast({ title: "Success", description: "User verified and activated." });
        } else {
            throw new Error(result.error || "Failed to verify user.");
        }
    } catch (error: any) {
        console.error("Error verifying user:", error);
        toast({ title: "Error", description: error.message || "Could not verify user.", variant: "destructive" });
    }
  };

  const handleSoftDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to deactivate this user? They will be hidden from active lists.")) {
        return;
    }
    try {
        const result = await softDeleteUserAction(userId);
        if (result.success) {
            setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
            toast({ title: "Success", description: "User deactivated successfully." });
        } else {
             throw new Error(result.error || "Failed to deactivate user.");
        }
    } catch (error: any) {
        console.error("Error deactivating user:", error);
        toast({ title: "Error", description: error.message || "Could not deactivate user.", variant: "destructive" });
    }
  };

  const handleSoftDeleteInvoice = async (invoiceId: string) => {
    if (!confirm("Are you sure you want to deactivate this invoice? It will be hidden from active lists.")) {
        return;
    }
    try {
        const result = await softDeleteInvoiceAction(invoiceId);
        if (result.success) {
            setInvoices(prevInvoices => prevInvoices.filter(i => i.id !== invoiceId));
            toast({ title: "Success", description: "Invoice deactivated successfully." });
        } else {
             throw new Error(result.error || "Failed to deactivate invoice.");
        }
    } catch (error: any) {
        console.error("Error deactivating invoice:", error);
        toast({ title: "Error", description: error.message || "Could not deactivate invoice.", variant: "destructive" });
    }
  };

  const handleOpenImageDialog = () => {
    setNewImageUrl('');
    setOpenImageDialog(true);
  };

  const handleAddImage = async () => {
    if (!newImageUrl || !newImageUrl.startsWith('http')) {
       toast({ title: "Error", description: "Please enter a valid image URL.", variant: "destructive" });
       return;
    }
    try {
        const nextPosition = carouselImages.length > 0 ? Math.max(...carouselImages.map(img => img.position)) + 1 : 1;
        const result = await addCarouselImage(newImageUrl, nextPosition);
        if (result.success && result.data?.image) {
             const updatedImages = [...carouselImages, result.data.image].sort((a, b) => a.position - b.position);
             setCarouselImages(updatedImages.filter(img => img.isActive));
             toast({ title: "Success", description: "Image added successfully." });
             setOpenImageDialog(false);
        } else {
             throw new Error(result.error || "Failed to add image.");
        }
    } catch (error: any) {
         console.error("Error adding carousel image:", error);
         toast({ title: "Error", description: error.message || "Could not add image.", variant: "destructive" });
    }
};

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) {
      return;
    }
     try {
        const result = await deleteCarouselImage(imageId);
        if (result.success) {
             setCarouselImages(prevImages => prevImages.filter(img => img.id !== imageId).sort((a,b)=> a.position - b.position));
             toast({ title: "Success", description: "Image deleted successfully." });
        } else {
             throw new Error(result.error || "Failed to delete image.");
        }
     } catch (error: any) {
          console.error("Error deleting carousel image:", error);
          toast({ title: "Error", description: error.message || "Could not delete image.", variant: "destructive" });
     }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5 text-primary">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-8">Manage users, trainers, invoices, and site content. Inactive items are hidden by default.</p>

      <Card className="mb-8 shadow-md">
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <TrendingUp className="h-5 w-5 text-primary" />
             Monthly Earnings
           </CardTitle>
           <CardDescription>Total earnings from paid invoices each month (active invoices only).</CardDescription>
         </CardHeader>
         <CardContent>
          {monthlyEarningsData.length > 0 ? (
             <ChartContainer config={chartConfig} className="h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={monthlyEarningsData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                   <CartesianGrid vertical={false} strokeDasharray="3 3" />
                   <XAxis
                     dataKey="month"
                     tickLine={false}
                     axisLine={false}
                     tickMargin={8}
                   />
                   <YAxis
                     tickLine={false}
                     axisLine={false}
                     tickMargin={8}
                     tickFormatter={(value) => `$${value}`}
                   />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                   <Bar dataKey="total" fill="var(--color-total)" radius={4} />
                 </BarChart>
               </ResponsiveContainer>
             </ChartContainer>
           ) : (
             <p className="text-center text-muted-foreground py-4">No earnings data available yet.</p>
           )}
         </CardContent>
      </Card>

      <Card className="mb-8 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
           <div>
             <CardTitle>Users (Gym Clients)</CardTitle>
             <CardDescription>View and manage active registered clients. Pending users are highlighted.</CardDescription>
           </div>
           <Button onClick={handleOpenUserDialog}>
             <UserPlus className="mr-2 h-4 w-4"/>
             Add Client
           </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">No active users found.</TableCell>
                </TableRow>
              )}
              {users.map((u) => {
                const unpaidInvoice = getUnpaidInvoice(u.id);
                 const isPending = u.status === UserStatus.PENDING;
                 const hasUnpaidInvoice = !!unpaidInvoice;
                const rowClassName = isPending ? "bg-yellow-100 dark:bg-yellow-900/30" : (hasUnpaidInvoice ? "bg-red-100 dark:bg-red-900/30" : "");

                return (
                  <TableRow key={u.id} className={cn(rowClassName)}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.phoneNumber || 'N/A'}</TableCell>
                    <TableCell>
                       <Badge variant={u.status === UserStatus.ACTIVE ? 'default' : 'secondary'}>
                           {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                       {isPending && (
                           <Button variant="outline" size="sm" onClick={() => handleVerifyUser(u.id)}>
                               <CheckSquare className="mr-1 h-4 w-4" />
                               Verify & Activate
                           </Button>
                       )}
                      <Button variant="outline" size="sm" onClick={() => handleOpenInvoiceDialog(u)} disabled={isPending}>
                        <FileText className="mr-1 h-4 w-4"/>
                        Generate Invoice
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleOpenPaymentHistory(u)}>
                        <History className="mr-1 h-4 w-4"/>
                        Payment History
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleSoftDeleteUser(u.id)}>
                        <EyeOff className="mr-1 h-4 w-4"/>
                        Deactivate
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mb-8 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
           <div>
             <CardTitle>Trainers & Admins</CardTitle>
             <CardDescription>Manage active trainer and admin accounts.</CardDescription>
           </div>
          <Button onClick={()=> handleOpenTrainerDialog()}>
              <Plus className="mr-2 h-4 w-4"/>
              Add Account
            </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone Number</TableHead>
                 <TableHead>Bio</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
             {trainersAndAdmins.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">No active trainer or admin accounts found.</TableCell>
                </TableRow>
              )}
              {trainersAndAdmins.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>{account.specialization}</TableCell>
                  <TableCell>{account.experience} years</TableCell>
                  <TableCell>{account.schedule}</TableCell>
                  <TableCell>{account.email}</TableCell>
                  <TableCell>{account.phoneNumber || 'N/A'}</TableCell>
                  <TableCell className="max-w-xs truncate" title={account.bio || ''}>{account.bio || 'N/A'}</TableCell>
                   <TableCell>
                       <Badge variant={account.role === AdminRoles.ADMIN ? 'destructive' : (account.role === AdminRoles.IT_ADMIN ? 'outline' : 'default')}
                              className={cn(account.role === AdminRoles.IT_ADMIN && "border-purple-500 text-purple-500")}>
                           {account.role === AdminRoles.IT_ADMIN ? 'IT Admin' : account.role.charAt(0).toUpperCase() + account.role.slice(1)}
                       </Badge>
                   </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="secondary" size="sm" onClick={() => handleOpenTrainerDialog(account)}
                       disabled={account.role === AdminRoles.IT_ADMIN && loggedInUserRole !== AdminRoles.IT_ADMIN}
                       title={account.role === AdminRoles.IT_ADMIN && loggedInUserRole !== AdminRoles.IT_ADMIN ? "Only IT Admins can edit IT Admin accounts" : "Edit Account"}>
                      <Edit className="mr-1 h-4 w-4"/>
                      Edit
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleSoftDeleteTrainer(account.id)}
                        disabled={(user?.id === account.id && (account.role === AdminRoles.ADMIN || account.role === AdminRoles.IT_ADMIN)) || (account.role === AdminRoles.IT_ADMIN && loggedInUserRole !== AdminRoles.IT_ADMIN) }
                        title={user?.id === account.id ? "Cannot deactivate your own account" : (account.role === AdminRoles.IT_ADMIN && loggedInUserRole !== AdminRoles.IT_ADMIN ? "Only IT Admins can deactivate IT Admin accounts" : "Deactivate Account")}
                        >
                      <EyeOff className="mr-1 h-4 w-4"/>
                      Deactivate
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

       <Card className="mb-8 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
           <div>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>Overview of all active generated invoices.</CardDescription>
           </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                 <TableHead>User Name</TableHead>
                 <TableHead>User Email</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
             {invoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">No active invoices found.</TableCell>
                </TableRow>
              )}
              {invoices.map((invoice) => {
                  const userInvoice = users.find(u => u.id === invoice.userId);
                  const userNameDisplay = userInvoice?.name || 'User N/A';
                  const userEmailDisplay = userInvoice?.email || 'N/A';
                   const isUnpaid = !invoice.paid;
                   const isOverdue = isUnpaid && new Date(invoice.dueDate) < new Date() && !invoice.paid;

                  return (
                    <TableRow key={invoice.id} className={cn(isUnpaid && "text-destructive dark:text-red-400", isOverdue && "font-semibold")}>
                     <TableCell>{userNameDisplay} (ID: ...{invoice.userId.substring(invoice.userId.length - 6)})</TableCell>
                     <TableCell>{userEmailDisplay}</TableCell>
                      <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                      <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {invoice.paid ? (
                          <Badge variant="default">Paid</Badge>
                        ) : (
                          <Badge variant={isOverdue ? "destructive" : "secondary"}>
                            {isOverdue ? "Overdue" : "Unpaid"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{invoice.paymentDate ? new Date(invoice.paymentDate).toLocaleDateString() : "N/A"}</TableCell>
                      <TableCell className="text-right space-x-2">
                        {!invoice.paid && (
                           <Button variant="outline" size="sm" onClick={() => handleOpenMarkPaidDialog(invoice)}>
                                Mark as Paid
                           </Button>
                        )}
                        <Button variant="destructive" size="sm" onClick={() => handleSoftDeleteInvoice(invoice.id)}>
                            <EyeOff className="mr-1 h-4 w-4"/>
                            Deactivate
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mb-5 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Homepage Carousel</CardTitle>
            <CardDescription>Manage images for the homepage slider. Drag to reorder.</CardDescription>
          </div>
          <Button onClick={handleOpenImageDialog}>
              <ImagePlus className="mr-2 h-4 w-4"/>
              Add Image
            </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {isClient && (
            <DragDropContext onDragEnd={handleOnDragEnd}>
              <Droppable droppableId="carouselImages" isDropDisabled={false}>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {carouselImages.length === 0 && (
                          <p className="text-center text-muted-foreground py-4">No carousel images added yet.</p>
                      )}
                      {carouselImages.map((image, index) => (
                        <Draggable key={image.id} draggableId={image.id} index={index}>
                          {(provided) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="flex items-center p-3 justify-between bg-muted dark:bg-muted/50"
                            >
                              <div className="flex items-center space-x-3">
                                <span className="font-mono text-sm text-muted-foreground w-6 text-center">{image.position}.</span>
                                <img src={image.url} alt={`Carousel ${image.position}`} className="w-16 h-8 object-cover rounded" data-ai-hint={image.dataAiHint || ''}/>
                                <span className="text-sm truncate max-w-xs">{image.url}</span>
                              </div>

                              <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteImage(image.id);}}>
                                  <Trash2 className="mr-1 h-4 w-4"/>
                                  Delete
                              </Button>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
          {!isClient && <p className="text-center text-muted-foreground py-4">Loading carousel editor...</p>}
        </CardContent>
      </Card>

      {/* DIALOGS */}
      <Dialog open={openTrainerDialog} onOpenChange={setOpenTrainerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTrainer ? "Edit Account" : "Add Account"}</DialogTitle>
            <DialogDescription>
              {editingTrainer ? "Update the account details below." : "Create a new trainer or admin account."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="trainerName" className="text-right">Name</Label>
              <Input id="trainerName" value={trainerName} onChange={(e) => setTrainerName(e.target.value)} className="col-span-3" required/>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="trainerEmail" className="text-right">Email</Label>
              <Input id="trainerEmail" type="email" value={trainerEmail} onChange={(e) => setTrainerEmail(e.target.value)} className="col-span-3" required />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="trainerPassword" className="text-right">Password</Label>
               <Input id="trainerPassword" type="password" value={trainerPassword} onChange={(e) => setTrainerPassword(e.target.value)} className="col-span-3" placeholder={editingTrainer ? "Leave blank to keep current" : "Required"} required={!editingTrainer}/>
             </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="specialization" className="text-right">Specialization</Label>
              <Input id="specialization" value={trainerSpecialization} onChange={(e) => setTrainerSpecialization(e.target.value)} className="col-span-3" required placeholder="e.g., Yoga, Strength"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="experience" className="text-right">Experience (Yrs)</Label>
              <Input id="experience" type="number" min="0" value={trainerExperience} onChange={(e) => setTrainerExperience(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="schedule" className="text-right">Schedule</Label>
              <Input id="schedule" value={trainerSchedule} onChange={(e) => setTrainerSchedule(e.target.value)} className="col-span-3" placeholder="e.g., Mon-Fri 9am-5pm" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="trainerPhoneNumber" className="text-right">Phone (Optional)</Label>
              <Input id="trainerPhoneNumber" type="tel" value={trainerPhoneNumber} onChange={(e) => setTrainerPhoneNumber(e.target.value)} className="col-span-3"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="trainerBio" className="text-right">Bio (Optional)</Label>
              <Textarea id="trainerBio" value={trainerBio} onChange={(e) => setTrainerBio(e.target.value)} className="col-span-3" placeholder="Tell us a bit about this account..."/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="trainerImageUrl" className="text-right">Image URL (Optional)</Label>
              <Input id="trainerImageUrl" type="url" value={trainerImageUrl} onChange={(e) => setTrainerImageUrl(e.target.value)} className="col-span-3" placeholder="https://example.com/image.png"/>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">Role</Label>
                <Select value={trainerRole} onValueChange={(value) => setTrainerRole(value as AdminRoleString)} required>
                    <SelectTrigger className="col-span-3"> <SelectValue placeholder="Select role" /> </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={AdminRoles.TRAINER}>Trainer</SelectItem>
                        <SelectItem value={AdminRoles.ADMIN}>Admin</SelectItem>
                        {loggedInUserRole === AdminRoles.IT_ADMIN && (
                             <SelectItem value={AdminRoles.IT_ADMIN}>IT Admin</SelectItem>
                        )}
                    </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSaveTrainer}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openInvoiceDialog} onOpenChange={setOpenInvoiceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Invoice</DialogTitle>
            <DialogDescription>Create a new invoice for {selectedUserForInvoice?.name}.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Amount ($)</Label>
              <Input id="amount" type="number" min="0.01" step="0.01" value={invoiceAmount} onChange={(e) => setInvoiceAmount(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">Due Date</Label>
              <Input id="dueDate" type="date" value={invoiceDueDate} onChange={(e) => setInvoiceDueDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="col-span-3" required />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleGenerateInvoice}>Generate Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openMarkPaidDialog} onOpenChange={setOpenMarkPaidDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Invoice as Paid</DialogTitle>
             <DialogDescription>Confirm payment for invoice #{invoiceToMarkPaid?.id.substring(0, 8)}... for ${invoiceToMarkPaid?.amount.toFixed(2)}.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentDate" className="text-right">Payment Date</Label>
              <Input id="paymentDate" type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} max={new Date().toISOString().split("T")[0]} className="col-span-3" required/>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleMarkAsPaid}>Mark as Paid</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openPaymentHistoryDialog} onOpenChange={setOpenPaymentHistoryDialog}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Payment History</DialogTitle>
            <DialogDescription>Showing paid invoices for {selectedUserPaymentHistory?.name}.</DialogDescription>
          </DialogHeader>
          <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                 <TableHead>Invoice ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Payment Date</TableHead>
                   <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices
                  .filter((invoice) => invoice.userId === selectedUserPaymentHistory?.id && invoice.paid && invoice.isActive)
                  .sort((a, b) => new Date(b.paymentDate || 0).getTime() - new Date(a.paymentDate || 0).getTime())
                  .map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-xs">{invoice.id.substring(0,8)}...</TableCell>
                      <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                      <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>{invoice.paymentDate ? new Date(invoice.paymentDate).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell><Badge variant="default">Paid</Badge></TableCell>
                    </TableRow>
                  ))}
                 {invoices.filter((invoice) => invoice.userId === selectedUserPaymentHistory?.id && invoice.paid && invoice.isActive).length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">No paid invoices found for this user.</TableCell>
                    </TableRow>
                 )}
              </TableBody>
            </Table>
          </CardContent>
           <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Close</Button></DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openUserDialog} onOpenChange={setOpenUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>Create a new client account. They will be active by default.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="userName" className="text-right">Name</Label>
              <Input id="userName" value={userName} onChange={(e) => setUserName(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="userEmail" className="text-right">Email</Label>
              <Input id="userEmail" type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} className="col-span-3" required/>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="userPassword" className="text-right">Password</Label>
               <Input id="userPassword" type="password" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} className="col-span-3" required/>
             </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="userPhoneNumber" className="text-right">Phone (Optional)</Label>
              <Input id="userPhoneNumber" type="tel" value={userPhoneNumber} onChange={(e) => setUserPhoneNumber(e.target.value)} className="col-span-3"/>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSaveUser}>Add Client</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openImageDialog} onOpenChange={setOpenImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Image to Carousel</DialogTitle>
            <DialogDescription>Enter the publicly accessible URL of the image.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imageUrl" className="text-right">Image URL</Label>
              <Input id="imageUrl" type="url" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" className="col-span-3" required />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleAddImage}>Add Image</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
