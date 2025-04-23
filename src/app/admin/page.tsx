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
import {Input} from "@/components/ui/input";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Trainer, getTrainers} from "@/services/trainer"; // Import Trainer type and getTrainers function
import {User} from "@/services/user"; // Import User type and getUsers function
import {getUsers} from "@/services/user";
import {Plus, Edit, Trash2, FileText} from "lucide-react";
import {cn} from "@/lib/utils";
import { Badge } from "@/components/ui/badge";


interface Invoice {
  id: string;
  userId: string;
  amount: number;
  dueDate: string;
  paid: boolean;
}

const AdminPage = () => {
  const {user} = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([
    {id: '1', userId: '1', amount: 100, dueDate: '2024-07-10', paid: true},
    {id: '2', userId: '2', amount: 150, dueDate: '2024-07-15', paid: false},
  ]);

  // Trainer Management State
  const [openTrainerDialog, setOpenTrainerDialog] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [trainerName, setTrainerName] = useState('');
  const [trainerSpecialization, setTrainerSpecialization] = useState('');
  const [trainerExperience, setTrainerExperience] = useState('');
  const [trainerSchedule, setTrainerSchedule] = useState('');

  // Invoice Management State
  const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);
  const [selectedUserForInvoice, setSelectedUserForInvoice] = useState<User | null>(null);
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceDueDate, setInvoiceDueDate] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login'); // Redirect to login if not admin
    }
  }, [user, router]);

  useEffect(() => {
    const fetchUsers = async () => {
      const userList = await getUsers();
      setUsers(userList);
    };

    const fetchTrainers = async () => {
      const trainerList = await getTrainers();
      setTrainers(trainerList);
    };

    fetchUsers();
    fetchTrainers();
  }, []);


  if (!user) {
    return <div>Redirecting to login...</div>;
  }

  if (user.role !== 'admin') {
    return <div>Unauthorized</div>;
  }

  // Trainer Management Handlers
  const handleOpenTrainerDialog = () => {
    setEditingTrainer(null);
    setTrainerName('');
    setTrainerSpecialization('');
    setTrainerExperience('');
    setTrainerSchedule('');
    setOpenTrainerDialog(true);
  };

  const handleEditTrainer = (trainer: Trainer) => {
    setEditingTrainer(trainer);
    setTrainerName(trainer.name);
    setTrainerSpecialization(trainer.specialization);
    setTrainerExperience(trainer.experience.toString());
    setTrainerSchedule(trainer.schedule);
    setOpenTrainerDialog(true);
  };

  const handleSaveTrainer = () => {
    // TODO: Implement saving logic, including API calls
    if (editingTrainer) {
      // Update existing trainer
      const updatedTrainers = trainers.map(t =>
        t.id === editingTrainer.id ? {
          ...t,
          name: trainerName,
          specialization: trainerSpecialization,
          experience: parseInt(trainerExperience),
          schedule: trainerSchedule
        } : t
      );
      setTrainers(updatedTrainers);
    } else {
      // Add new trainer
      const newTrainer = {
        id: Math.random().toString(), // Generate a random ID
        name: trainerName,
        specialization: trainerSpecialization,
        experience: parseInt(trainerExperience),
        schedule: trainerSchedule
      };
      setTrainers([...trainers, newTrainer]);
    }
    setOpenTrainerDialog(false);
  };

  const handleDeleteTrainer = (trainerId: string) => {
    // TODO: Implement delete logic, including API calls
    const updatedTrainers = trainers.filter(t => t.id !== trainerId);
    setTrainers(updatedTrainers);
  };

  // Invoice Management Handlers
  const handleOpenInvoiceDialog = (user: User) => {
    setSelectedUserForInvoice(user);
    setInvoiceAmount('');
    setInvoiceDueDate('');
    setOpenInvoiceDialog(true);
  };

  const handleGenerateInvoice = () => {
    if (!selectedUserForInvoice) return;

    const newInvoice = {
      id: Math.random().toString(), // Generate a random ID
      userId: selectedUserForInvoice.id,
      amount: parseFloat(invoiceAmount),
      dueDate: invoiceDueDate,
      paid: false
    };
    setInvoices([...invoices, newInvoice]);
    setOpenInvoiceDialog(false);
  };

  const handleMarkAsPaid = (invoiceId: string) => {
    const updatedInvoices = invoices.map(inv =>
      inv.id === invoiceId ? {...inv, paid: true} : inv
    );
    setInvoices(updatedInvoices);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5 text-primary">Admin Dashboard</h1>
      <p>Manage users, trainers, and invoices here.</p>

      {/* User Management */}
      <Card className="mb-5">
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleOpenInvoiceDialog(user)}>
                      <FileText className="mr-2 h-4 w-4"/>
                      Generate Invoice
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Trainer Management */}
      <Card className="mb-5">
        <CardHeader>
          <CardTitle>Trainers</CardTitle>
          <CardDescription>Manage trainers in the system.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={handleOpenTrainerDialog}>
              <Plus className="mr-2 h-4 w-4"/>
              Add Trainer
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainers.map((trainer) => (
                <TableRow key={trainer.id}>
                  <TableCell>{trainer.name}</TableCell>
                  <TableCell>{trainer.specialization}</TableCell>
                  <TableCell>{trainer.experience} years</TableCell>
                  <TableCell>{trainer.schedule}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="secondary" size="sm" onClick={() => handleEditTrainer(trainer)}>
                      <Edit className="mr-2 h-4 w-4"/>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteTrainer(trainer.id)}>
                      <Trash2 className="mr-2 h-4 w-4"/>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invoice Management */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Manage user invoices and payment status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.userId}</TableCell>
                  <TableCell>${invoice.amount}</TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
                  <TableCell>
                    {invoice.paid ? (
                      <Badge variant="default">Paid</Badge>
                    ) : (
                      <Badge variant="secondary">Unpaid</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {!invoice.paid && (
                      <Button variant="outline" size="sm" onClick={() => handleMarkAsPaid(invoice.id)}>
                        Mark as Paid
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Trainer Dialog */}
      <Dialog open={openTrainerDialog} onOpenChange={setOpenTrainerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTrainer ? "Edit Trainer" : "Add Trainer"}</DialogTitle>
            <DialogDescription>
              {editingTrainer ? "Edit trainer details." : "Create a new trainer."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value={trainerName} onChange={(e) => setTrainerName(e.target.value)} className="col-span-3"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="specialization" className="text-right">
                Specialization
              </Label>
              <Input
                id="specialization"
                value={trainerSpecialization}
                onChange={(e) => setTrainerSpecialization(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="experience" className="text-right">
                Experience
              </Label>
              <Input
                id="experience"
                type="number"
                value={trainerExperience}
                onChange={(e) => setTrainerExperience(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="schedule" className="text-right">
                Schedule
              </Label>
              <Input
                id="schedule"
                value={trainerSchedule}
                onChange={(e) => setTrainerSchedule(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <CardFooter>
            <Button onClick={handleSaveTrainer}>Save Trainer</Button>
          </CardFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Dialog */}
      <Dialog open={openInvoiceDialog} onOpenChange={setOpenInvoiceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Invoice</DialogTitle>
            <DialogDescription>
              Enter the invoice details for {selectedUserForInvoice?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                value={invoiceAmount}
                onChange={(e) => setInvoiceAmount(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">
                Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={invoiceDueDate}
                onChange={(e) => setInvoiceDueDate(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <CardFooter>
            <Button onClick={handleGenerateInvoice}>Generate Invoice</Button>
          </CardFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
