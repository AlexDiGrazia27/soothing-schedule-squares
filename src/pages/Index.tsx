
import React, { useState } from 'react';
import { AppointmentProvider } from '@/context/AppointmentContext';
import SchedulerGrid from '@/components/SchedulerGrid';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-gray-100 py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">Massage Scheduling System</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 max-w-xs">
          <Label htmlFor="date-picker">Select Date</Label>
          <Input
            id="date-picker"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="mt-1"
          />
        </div>
        
        <AppointmentProvider>
          <SchedulerGrid selectedDate={selectedDate} />
        </AppointmentProvider>
      </main>
    </div>
  );
};

export default Index;
