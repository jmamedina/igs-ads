'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Blocks } from 'react-loader-spinner';


const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth(); // Get user and loading state from context
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log("User in AuthenticatedLayout:", user);
  
    if (!loading && !user && pathname && pathname !== '/login') {
      router.push('/login');
    }
  
    if (!loading && user && pathname === '/login') {
      router.push('/admin');
    }
  }, [user, loading, pathname, router]);
  
  // Show a loading message while the authentication state is being resolved
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Blocks height="80" width="80" color="#3498db" ariaLabel="loading" />
        </div>
    );
  }
  

  return <>{children}</>; // Render children when authenticated or show the loading screen
};

export default AuthenticatedLayout;
