import React from 'react';

export default function Panel({ children }) {
  return (
    <main className="flex-1 bg-white rounded-[32px] overflow-hidden flex flex-col h-full shadow-sm relative">
      {children}
    </main>
  );
}
