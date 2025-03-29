
import React, { useState } from 'react';
import { useAppointments } from '@/context/AppointmentContext';
import { practitioners, Practitioner } from '@/types/appointment';
import { generateTimeSlots, formatTime, calculateDuration } from '@/utils/timeUtils';
import AppointmentForm from './AppointmentForm';

const SchedulerGrid: React.FC<{ selectedDate: string }> = ({ selectedDate }) => {
  const { appointments } = useAppointments();
  const timeSlots = generateTimeSlots();
  
  const [formOpen, setFormOpen] = useState(false);
  const [formInitialValues, setFormInitialValues] = useState<{
    practitioner: Practitioner;
    startTime: string;
    date: string;
    id?: string;
  } | undefined>();
  
  // Filter appointments for the selected date
  const filteredAppointments = appointments.filter(
    (appointment) => appointment.date === selectedDate
  );
  
  const handleCellClick = (practitioner: Practitioner, timeSlot: string) => {
    setFormInitialValues({
      practitioner,
      startTime: timeSlot,
      date: selectedDate,
    });
    setFormOpen(true);
  };
  
  const handleAppointmentClick = (appointmentId: string) => {
    const appointment = appointments.find((a) => a.id === appointmentId);
    if (appointment) {
      setFormInitialValues({
        practitioner: appointment.practitioner as Practitioner,
        startTime: appointment.startTime,
        date: appointment.date,
        id: appointment.id,
      });
      setFormOpen(true);
    }
  };
  
  const closeForm = () => {
    setFormOpen(false);
    setFormInitialValues(undefined);
  };
  
  // Helper function to determine if a cell should show an appointment
  const getAppointmentForCell = (practitioner: string, timeSlot: string) => {
    return filteredAppointments.find((a) => {
      if (a.practitioner !== practitioner) return false;
      
      const [slotHour, slotMinute] = timeSlot.split(':').map(Number);
      const [startHour, startMinute] = a.startTime.split(':').map(Number);
      const [endHour, endMinute] = a.endTime.split(':').map(Number);
      
      const slotTime = slotHour * 60 + slotMinute;
      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;
      
      return slotTime >= startTime && slotTime < endTime;
    });
  };
  
  // Helper function to calculate the row span for an appointment
  const getRowSpanForAppointment = (startTime: string, endTime: string) => {
    const durationMinutes = calculateDuration(startTime, endTime);
    return Math.ceil(durationMinutes / 15);
  };
  
  // Helper to check if this is the first cell of an appointment
  const isFirstCellOfAppointment = (practitioner: string, timeSlot: string) => {
    const appointment = getAppointmentForCell(practitioner, timeSlot);
    return appointment && appointment.startTime === timeSlot;
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="overflow-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 bg-gray-100 w-24">Time</th>
              {practitioners.map((practitioner) => (
                <th key={practitioner} className="border p-2 bg-gray-100">
                  {practitioner}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((timeSlot, index) => {
              if (index === timeSlots.length - 1) return null; // Skip the last time slot (9pm)
              
              return (
                <tr key={timeSlot} className="hover:bg-gray-50">
                  <td className="border p-2 text-sm text-center">
                    {formatTime(timeSlot)}
                  </td>
                  
                  {practitioners.map((practitioner) => {
                    const appointment = getAppointmentForCell(practitioner, timeSlot);
                    
                    // If this cell is part of an appointment but not the first cell, don't render anything
                    if (appointment && appointment.startTime !== timeSlot) {
                      return null;
                    }
                    
                    // Calculate row span for appointments
                    const rowSpan = appointment 
                      ? getRowSpanForAppointment(appointment.startTime, appointment.endTime)
                      : 1;
                    
                    return (
                      <td 
                        key={`${practitioner}-${timeSlot}`}
                        className={`border p-0 relative ${appointment ? 'overflow-visible' : 'cursor-pointer hover:bg-gray-100'}`}
                        onClick={!appointment ? () => handleCellClick(practitioner as Practitioner, timeSlot) : undefined}
                        {...(appointment && { rowSpan })}
                      >
                        {appointment ? (
                          <div 
                            className="absolute inset-0.5 rounded-md overflow-hidden bg-blue-200 p-2 flex flex-col cursor-pointer"
                            onClick={() => handleAppointmentClick(appointment.id)}
                          >
                            <div className="font-bold text-sm truncate">{appointment.client}</div>
                            <div className="text-xs">
                              {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                            </div>
                            <div className="text-xs">
                              {calculateDuration(appointment.startTime, appointment.endTime)} min
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full p-2">&nbsp;</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <AppointmentForm 
        open={formOpen} 
        onClose={closeForm} 
        initialValues={formInitialValues} 
      />
    </div>
  );
};

export default SchedulerGrid;
