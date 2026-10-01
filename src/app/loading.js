import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center bg-[#EAE8E3] z-[9999]">
      <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          Routh Agent
        </h1>
        <h3 className='text-2xl font-bold text-gray-600 tracking-tight'>
          For Business
        </h3>
        <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
      </div>
    </div>
  );
}
