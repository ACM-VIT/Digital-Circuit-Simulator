"use client";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import toast from 'react-hot-toast';
import Loader from '@/components/Loader';

// Import the main circuit page component
import CircuitPage from '../page';

export default function CircuitWithId() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [circuitExists, setCircuitExists] = useState(false);
  const circuitId = params.id as string;

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      toast.error('Please sign in to view this circuit');
      router.push('/circuit');
      return;
    }

    // Verify circuit exists
    const verifyCircuit = async () => {
      try {
        const response = await fetch(`/api/circuits/${circuitId}`);
        
        if (response.ok) {
          setCircuitExists(true);
          // Update URL to use query param for the main component
          window.history.replaceState({}, '', `/circuit?load=${circuitId}`);
        } else if (response.status === 404) {
          toast.error('Circuit not found');
          router.push('/circuit');
        } else if (response.status === 401) {
          toast.error('You do not have access to this circuit');
          router.push('/circuit');
        } else {
          toast.error('Error loading circuit');
          router.push('/circuit');
        }
      } catch (error) {
        toast.error('Network error loading circuit');
        router.push('/circuit');
      } finally {
        setLoading(false);
      }
    };

    verifyCircuit();
  }, [circuitId, user, isLoaded, router]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#111111] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!circuitExists) {
    return null;
  }

  return <CircuitPage />;
}
