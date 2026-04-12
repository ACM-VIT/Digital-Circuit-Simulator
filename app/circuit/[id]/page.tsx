"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Loader from '@/components/Loader';
import CircuitPage from '../page';

export default function CircuitWithId() {
  const params = useParams();
  const { isLoaded, user } = useUser();
  const circuitId = params.id as string;

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#111111] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // If user is not logged in, they'll be handled inside CircuitPage or they can view public circuits if implemented
  // For now, we just pass the ID down
  return <CircuitPage initialCircuitId={circuitId} />;
}
