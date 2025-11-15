import React from 'react';
import ModuleBackButton from '../../components/ModuleBackButton';

export default function TicketsPage() {
  return (
    <div className="p-4 lg:p-6 w-full max-w-6xl mx-auto space-y-3">
      <ModuleBackButton />
      <h1 className="text-xl font-semibold">Tickets</h1>
      <p className="text-sm text-slate-600">Basic tickets page stub. Integrate with your ticket workflow here.</p>
    </div>
  );
}
