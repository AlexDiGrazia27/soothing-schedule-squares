
import { Appointment } from '@/types/appointment';

const API_BASE_URL = 'http://localhost:3001/api';

// Fetch all appointments
export const fetchAppointments = async (): Promise<Appointment[]> => {
  const response = await fetch(`${API_BASE_URL}/appointments`);
  if (!response.ok) {
    throw new Error('Failed to fetch appointments');
  }
  return response.json();
};

// Fetch appointments by date
export const fetchAppointmentsByDate = async (date: string): Promise<Appointment[]> => {
  const response = await fetch(`${API_BASE_URL}/appointments/date/${date}`);
  if (!response.ok) {
    throw new Error('Failed to fetch appointments by date');
  }
  return response.json();
};

// Create a new appointment
export const createAppointment = async (appointment: Omit<Appointment, 'id'>): Promise<Appointment> => {
  const response = await fetch(`${API_BASE_URL}/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(appointment),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create appointment');
  }
  
  return response.json();
};

// Update an existing appointment
export const updateAppointment = async (id: string, appointment: Omit<Appointment, 'id'>): Promise<Appointment> => {
  const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(appointment),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update appointment');
  }
  
  return response.json();
};

// Delete an appointment
export const deleteAppointment = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete appointment');
  }
};
