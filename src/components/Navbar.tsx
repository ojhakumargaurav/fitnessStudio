'use client';

import {Button} from '@/components/ui/button';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/hooks/useAuth'; // Import useAuth hook
import {useEffect, useState} from 'react';
import {Sheet, SheetContent, SheetTrigger} from "@/components/ui/sheet";
import {Menu} from "lucide-react";
import {cn} from "@/lib/utils";

export const Navbar = () => {
  const router = useRouter();
  const {user, logout} = useAuth(); // Use the useAuth hook
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up event listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="bg-secondary p-4 flex justify-between items-center">
      <span className="font-bold text-lg text-primary cursor-pointer" onClick={() => router.push('/')}>
        Fitness Hub
      </span>

      {isMobile ? (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5"/>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-64">
            <div className="grid gap-4 py-4">
              <Button variant="ghost" onClick={() => {
                router.push('/classes');
                // Close the mobile menu after navigation
              }}>
                Classes
              </Button>
              <Button variant="ghost" onClick={() => {
                router.push('/trainers');
                // Close the mobile menu after navigation
              }}>
                Trainers
              </Button>
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Button variant="ghost" onClick={() => {
                      router.push('/admin');
                      // Close the mobile menu after navigation
                    }}>
                      Admin
                    </Button>
                  )}
                  {user.role === 'trainer' && (
                    <Button variant="ghost" onClick={() => {
                      router.push('/trainer');
                      // Close the mobile menu after navigation
                    }}>
                      Trainer
                    </Button>
                  )}
                  <Button variant="outline" onClick={logout}>
                    Logout
                  </Button>
                </>
              ) : (
                <Button onClick={() => {
                  router.push('/login');
                  // Close the mobile menu after navigation
                }}>Login</Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <div className="space-x-2">
          <Button variant="ghost" onClick={() => router.push('/classes')}>
            Classes
          </Button>
          <Button variant="ghost" onClick={() => router.push('/trainers')}>
            Trainers
          </Button>
          {user ? (
            <>
              {user.role === 'admin' && (
                <Button variant="ghost" onClick={() => router.push('/admin')}>
                  Admin
                </Button>
              )}
              {user.role === 'trainer' && (
                <Button variant="ghost" onClick={() => router.push('/trainer')}>
                  Trainer
                </Button>
              )}
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <Button onClick={() => router.push('/login')}>Login</Button>
          )}
        </div>
      )}
    </div>
  );
};
