
// Generate time slots from 9am to 9pm in 15-minute increments
export const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let hour = 9; hour <= 21; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (hour === 21 && minute > 0) break; // Stop at 9pm
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    }
  }
  return slots;
};

// Format time for display (convert 24h to 12h format)
export const formatTime = (time: string): string => {
  const [hour, minute] = time.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
};

// Calculate duration between two times in minutes
export const calculateDuration = (startTime: string, endTime: string): number => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  return endMinutes - startMinutes;
};

// Check if two time ranges overlap
export const isOverlapping = (
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean => {
  const [start1Hour, start1Minute] = start1.split(':').map(Number);
  const [end1Hour, end1Minute] = end1.split(':').map(Number);
  const [start2Hour, start2Minute] = start2.split(':').map(Number);
  const [end2Hour, end2Minute] = end2.split(':').map(Number);
  
  const start1Minutes = start1Hour * 60 + start1Minute;
  const end1Minutes = end1Hour * 60 + end1Minute;
  const start2Minutes = start2Hour * 60 + start2Minute;
  const end2Minutes = end2Hour * 60 + end2Minute;
  
  return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
};
