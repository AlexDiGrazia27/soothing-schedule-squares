
import React, { createContext, useContext, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Appointment } from '@/types/appointment';
import { fetchAppointments, createAppointment, updateAppointment, deleteAppointment } from '@/services/api';
import { toast } from '@/components/ui/use-toast';

interface AppointmentContextType {
  appointments: Appointment[];
  isLoading: boolean;
  error: Error | null;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<boolean>;
  updateAppointment: (appointmentId: string, updatedAppointment: Omit<Appointment, 'id'>) => Promise<boolean>;
  deleteAppointment: (appointmentId: string) => Promise<void>;
  checkAvailability: (practitioner: string, date: string, startTime: string, endTime: string, excludeId?: string) => boolean;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

export const AppointmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  
  // Fetch appointments
  const { data: appointments = [], isLoading, error } = useQuery({
    queryKey: ['appointments'],
    queryFn: fetchAppointments,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, appointment }: { id: string; appointment: Omit<Appointment, 'id'> }) => 
      updateAppointment(id, appointment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Determine if a time slot is available
  const checkAvailability = (
    practitioner: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeId?: string
  ): boolean => {
    // Filter appointments for the given practitioner and date
    const practitionerAppointments = appointments.filter(
      (a) => a.practitioner === practitioner && a.date === date && (excludeId ? a.id !== excludeId : true)
    );

    // Check for overlaps with existing appointments
    const hasOverlap = practitionerAppointments.some((a) =>
      isOverlapping(startTime, endTime, a.startTime, a.endTime)
    );

    return !hasOverlap;
  };

  // Add a new appointment
  const addAppointment = async (appointment: Omit<Appointment, 'id'>): Promise<boolean> => {
    try {
      await createMutation.mutateAsync(appointment);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Update an existing appointment
  const updateAppointmentHandler = async (
    appointmentId: string,
    updatedAppointment: Omit<Appointment, 'id'>
  ): Promise<boolean> => {
    try {
      await updateMutation.mutateAsync({ 
        id: appointmentId, 
        appointment: updatedAppointment 
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  // Delete an appointment
  const deleteAppointmentHandler = async (appointmentId: string): Promise<void> => {
    await deleteMutation.mutateAsync(appointmentId);
  };

  return (
    <AppointmentContext.Provider
      value={{
        appointments,
        isLoading,
        error: error as Error | null,
        addAppointment,
        updateAppointment: updateAppointmentHandler,
        deleteAppointment: deleteAppointmentHandler,
        checkAvailability,
      }}
    >
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (context === undefined) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
};
