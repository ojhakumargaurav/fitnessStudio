
'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {signup} from '@/actions/auth'; // Import signup server action
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {useToast} from '@/hooks/use-toast';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const {toast} = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    setIsLoading(true);
    try {
      const result = await signup({name, email, password, phoneNumber});
      if (result.success) {
        toast({
          title: 'Signup Successful!',
          description: 'Your account has been created. Please wait for admin approval.',
        });
        router.push('/login'); // Redirect to login page after successful signup
      } else {
        toast({
          title: 'Signup Failed',
          description: result.error || 'An unexpected error occurred.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Signup Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Create your Fitness Hub account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Signing Up...' : 'Sign Up'}
            </Button>
          </form>
           <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Button variant="link" onClick={() => router.push('/login')} className="p-0 h-auto">
              Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupPage;
