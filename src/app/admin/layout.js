'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn, isAdmin } from '@/lib/auth';

export default function AdminLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn() || !isAdmin()) {
      router.push('/');
    }
  }, []);

  return <>{children}</>;
}