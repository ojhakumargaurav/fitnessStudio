'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/hooks/useAuth'; // Import useAuth hook
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const {login} = useAuth(); // Use the login function from useAuth
  const router = useRouter();

  const handleLogin = async () => {
    const success = await login(username, password);
    if (success) {
      router.push('/'); // Redirect to home page after successful login
    } else {
      alert('Invalid credentials'); // Show an error message if login fails
    }
  };

  return (
    <div className="container mx-auto py-10 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="username">Username</label>
            <Input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="password">Password</label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button onClick={handleLogin}>Login</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
