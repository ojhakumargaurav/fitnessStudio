
'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth hook
import React, { useEffect, useState } from 'react'; // Import React
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"; // Import SheetClose
import { Menu, LogIn, UserPlus, LogOut, UserCircle, ShieldCheck, Briefcase, LayoutDashboard } from "lucide-react"; // Added icons
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth(); // Use the useAuth hook, include isLoading
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false); // State to track client-side mount

  useEffect(() => {
    setIsClient(true); // Component has mounted on the client

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Use md breakpoint or adjust as needed
    };

    // Set initial value after mount
    handleResize();
    window.addEventListener('resize', handleResize);

    // Clean up event listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent rendering on server or during hydration mismatch potential
  if (!isClient) {
    return null; // Or return a placeholder/skeleton navbar
  }

  const NavLinks = ({ isMobileMenu = false }: { isMobileMenu?: boolean }) => {
    const commonButtonClass = isMobileMenu ? "justify-start w-full" : "";
    const Wrapper = isMobileMenu ? SheetClose : React.Fragment; // Close sheet on mobile click

    return (
      <>
        <Wrapper>
          <Button variant="ghost" onClick={() => router.push('/classes')} className={commonButtonClass}>
            <LayoutDashboard className="mr-2 h-4 w-4" /> Classes
          </Button>
        </Wrapper>
        <Wrapper>
          <Button variant="ghost" onClick={() => router.push('/trainers')} className={commonButtonClass}>
            <Briefcase className="mr-2 h-4 w-4" /> Trainers
          </Button>
        </Wrapper>

        {isLoading ? (
            // Optional: Show a loading indicator instead of auth buttons
             <Button variant="ghost" disabled className={commonButtonClass}>Loading...</Button>
        ) : user ? (
          <>
            {user.role === 'admin' && (
              <Wrapper>
                <Button variant="ghost" onClick={() => router.push('/admin')} className={commonButtonClass}>
                  <ShieldCheck className="mr-2 h-4 w-4" /> Admin
                </Button>
              </Wrapper>
            )}
            {user.role === 'trainer' && (
              <Wrapper>
                <Button variant="ghost" onClick={() => router.push('/trainer')} className={commonButtonClass}>
                  <UserCircle className="mr-2 h-4 w-4" /> Trainer
                </Button>
              </Wrapper>
            )}
             <Wrapper>
                <Button variant="outline" onClick={logout} className={cn(commonButtonClass, "text-destructive border-destructive hover:bg-destructive/10")}>
                 <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
            </Wrapper>
          </>
        ) : (
          <>
            <Wrapper>
                <Button variant="ghost" onClick={() => router.push('/login')} className={commonButtonClass}>
                 <LogIn className="mr-2 h-4 w-4" /> Login
                </Button>
            </Wrapper>
             <Wrapper>
                <Button onClick={() => router.push('/signup')} className={commonButtonClass}>
                 <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                </Button>
            </Wrapper>
          </>
        )}
      </>
    );
  };


  return (
    <nav className="bg-secondary border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <span className="font-bold text-lg text-primary cursor-pointer" onClick={() => router.push('/')}>
          Fitness Hub
        </span>

        {/* Mobile Menu */}
        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="ml-auto">
                <Menu className="h-5 w-5"/>
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs sm:max-w-sm p-4">
              <div className="flex flex-col space-y-3 pt-6">
                <NavLinks isMobileMenu={true} />
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          // Desktop Menu
          <div className="hidden md:flex items-center space-x-2">
            <NavLinks />
          </div>
        )}
      </div>
    </nav>
  );
};
