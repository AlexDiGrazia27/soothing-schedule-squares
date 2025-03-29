
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appointment } from '@/types/appointment';
import { isOverlapping } from '@/utils/timeUtils';

interface AppointmentContextType {
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id'>) => boolean;
  updateAppointment: (appointmentId: string, updatedAppointment: Omit<Appointment, 'id'>) => boolean;
  deleteAppointment: (appointmentId: string) => void;
  checkAvailability: (practitioner: string, date: string, startTime: string, endTime: string, excludeId?: string) => boolean;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

export const AppointmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Load appointments from localStorage on mount
  useEffect(() => {
    const savedAppointments = localStorage.getItem('appointments');
    if (savedAppointments) {
      setAppointments(JSON.parse(savedAppointments));
    }
  }, []);

  // Save appointments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }, [appointments]);

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
    return !practitionerAppointments.some((a) =>
      isOverlapping(startTime, endTime, a.startTime, a.endTime)
    );
  };

  const addAppointment = (appointment: Omit<Appointment, 'id'>): boolean => {
    // Check if the time slot is available
    if (!checkAvailability(
      appointment.practitioner,
      appointment.date,
      appointment.startTime,
      appointment.endTime
    )) {
      return false; // Time slot is not available
    }

    // Add the appointment with a unique ID
    const newAppointment: Appointment = {
      ...appointment,
      id: Date.now().toString(),
    };

    setAppointments((prev) => [...prev, newAppointment]);
    return true;
  };

  const updateAppointment = (
    appointmentId: string,
    updatedAppointment: Omit<Appointment, 'id'>
  ): boolean => {
    // Check if the time slot is available (excluding the current appointment)
    if (!checkAvailability(
      updatedAppointment.practitioner,
      updatedAppointment.date,
      updatedAppointment.startTime,
      updatedAppointment.endTime,
      appointmentId
    )) {
      return false; // Time slot is not available
    }

    setAppointments((prev) =>
      prev.map((a) =>
        a.id === appointmentId ? { ...updatedAppointment, id: appointmentId } : a
      )
    );
    return true;
  };

  const deleteAppointment = (appointmentId: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== appointmentId));
  };

  return (
    <AppointmentContext.Provider
      value={{
        appointments,
        addAppointment,
        updateAppointment,
        deleteAppointment,
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
