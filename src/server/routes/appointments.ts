
import express from 'express';
import prisma from '../../lib/prisma';
import { isOverlapping } from '../../utils/timeUtils';

const router = express.Router();

// Get all appointments
router.get('/', async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany();
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching appointments' });
  }
});

// Get appointments by date
router.get('/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const appointments = await prisma.appointment.findMany({
      where: { date },
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching appointments by date' });
  }
});

// Create a new appointment
router.post('/', async (req, res) => {
  try {
    const { practitioner, client, startTime, endTime, date } = req.body;
    
    // Validate required fields
    if (!practitioner || !client || !startTime || !endTime || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check for overlapping appointments
    const practitionerAppointments = await prisma.appointment.findMany({
      where: { 
        practitioner,
        date
      }
    });
    
    const hasOverlap = practitionerAppointments.some(a => 
      isOverlapping(startTime, endTime, a.startTime, a.endTime)
    );
    
    if (hasOverlap) {
      return res.status(409).json({ error: 'Time slot conflicts with an existing appointment' });
    }
    
    const newAppointment = await prisma.appointment.create({
      data: {
        practitioner,
        client,
        startTime,
        endTime,
        date
      }
    });
    
    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(500).json({ error: 'Error creating appointment' });
  }
});

// Update an appointment
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { practitioner, client, startTime, endTime, date } = req.body;
    
    // Validate required fields
    if (!practitioner || !client || !startTime || !endTime || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check for overlapping appointments (excluding the current one)
    const practitionerAppointments = await prisma.appointment.findMany({
      where: { 
        practitioner,
        date,
        id: { not: id }
      }
    });
    
    const hasOverlap = practitionerAppointments.some(a => 
      isOverlapping(startTime, endTime, a.startTime, a.endTime)
    );
    
    if (hasOverlap) {
      return res.status(409).json({ error: 'Time slot conflicts with an existing appointment' });
    }
    
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        practitioner,
        client,
        startTime,
        endTime,
        date
      }
    });
    
    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ error: 'Error updating appointment' });
  }
});

// Delete an appointment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.appointment.delete({
      where: { id }
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting appointment' });
  }
});

export { router as appointmentsRouter };
