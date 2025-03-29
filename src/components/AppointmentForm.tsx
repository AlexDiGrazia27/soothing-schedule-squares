
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Appointment, Practitioner, practitioners } from '@/types/appointment';
import { generateTimeSlots, formatTime } from '@/utils/timeUtils';
import { useAppointments } from '@/context/AppointmentContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface AppointmentFormProps {
  open: boolean;
  onClose: () => void;
  initialValues?: {
    practitioner: Practitioner;
    startTime: string;
    date: string;
    id?: string;
  };
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ open, onClose, initialValues }) => {
  const { toast } = useToast();
  const { addAppointment, updateAppointment, deleteAppointment } = useAppointments();
  const timeSlots = generateTimeSlots();
  
  const isEditing = !!initialValues?.id;
  
  const [formData, setFormData] = useState<{
    practitioner: Practitioner;
    client: string;
    startTime: string;
    endTime: string;
    date: string;
  }>({
    practitioner: initialValues?.practitioner || "Alex",
    client: "",
    startTime: initialValues?.startTime || "09:00",
    endTime: timeSlots[1], // Default to 15 minutes after start time
    date: initialValues?.date || new Date().toISOString().split('T')[0],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.client.trim()) {
      toast({
        title: "Error",
        description: "Client name is required",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.startTime >= formData.endTime) {
      toast({
        title: "Error",
        description: "End time must be after start time",
        variant: "destructive",
      });
      return;
    }
    
    const success = isEditing
      ? updateAppointment(initialValues!.id!, formData)
      : addAppointment(formData);
    
    if (success) {
      toast({
        title: isEditing ? "Appointment Updated" : "Appointment Created",
        description: `${formData.client}'s appointment has been ${isEditing ? 'updated' : 'scheduled'}.`,
      });
      onClose();
    } else {
      toast({
        title: "Error",
        description: "This time slot conflicts with an existing appointment.",
        variant: "destructive",
      });
    }
  };
  
  const handleDelete = () => {
    if (isEditing && initialValues?.id) {
      deleteAppointment(initialValues.id);
      toast({
        title: "Appointment Deleted",
        description: "The appointment has been removed from the schedule.",
      });
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Appointment' : 'Schedule New Appointment'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="practitioner">Practitioner</Label>
            <Select 
              value={formData.practitioner} 
              onValueChange={(value) => handleSelectChange('practitioner', value)}
              disabled={isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select practitioner" />
              </SelectTrigger>
              <SelectContent>
                {practitioners.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="client">Client Name</Label>
            <Input
              id="client"
              name="client"
              value={formData.client}
              onChange={handleInputChange}
              placeholder="Enter client name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Select 
                value={formData.startTime} 
                onValueChange={(value) => handleSelectChange('startTime', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select start time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.slice(0, -1).map((time) => (
                    <SelectItem key={time} value={time}>
                      {formatTime(time)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Select 
                value={formData.endTime} 
                onValueChange={(value) => handleSelectChange('endTime', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select end time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.slice(1).map((time) => (
                    <SelectItem key={time} value={time}>
                      {formatTime(time)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            {isEditing && (
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDelete}
              >
                Delete
              </Button>
            )}
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Update' : 'Schedule'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentForm;
