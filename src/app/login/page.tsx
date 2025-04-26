
'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/hooks/useAuth';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {useToast} from '@/hooks/use-toast'; // Import useToast

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {login, isLoading} = useAuth(); // Use the login function and isLoading state from useAuth
  const router = useRouter();
  const {toast} = useToast(); // Initialize useToast

  const handleLogin = async (e: React.FormEvent) => {
     e.preventDefault(); // Prevent default form submission
    const success = await login(email, password);
    if (success) {
      toast({
        title: 'Login Successful!',
        description: 'Welcome back!',
      });
      router.push('/'); // Redirect to home page after successful login
    } else {
      toast({
        title: 'Login Failed',
        description: 'Invalid email or password. Please try again.',
        variant: 'destructive', // Use destructive variant for errors
      });
    }
  };

  return (
    <div className="container mx-auto py-10 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
           <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email" // Use email type for better semantics and validation
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required // Add required attribute
                autoComplete="email" // Help password managers
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required // Add required attribute
                autoComplete="current-password" // Help password managers
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Button variant="link" onClick={() => router.push('/signup')} className="p-0 h-auto">
              Sign Up
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
