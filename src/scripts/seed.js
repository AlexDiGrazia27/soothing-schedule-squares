
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Import practitioners from the TypeScript file
// Since this is a JS file, we need to handle the import differently
const practitioners = [
  "Dr. Smith",
  "Dr. Johnson",
  "Dr. Williams"
];

async function main() {
  // Delete existing data
  await prisma.appointment.deleteMany({});
  
  // Create sample appointments
  const today = new Date().toISOString().split('T')[0];
  
  // Sample data
  const sampleAppointments = [
    {
      practitioner: practitioners[0],
      client: 'John Doe',
      startTime: '09:00',
      endTime: '10:00',
      date: today,
    },
    {
      practitioner: practitioners[1],
      client: 'Jane Smith',
      startTime: '11:00',
      endTime: '12:00',
      date: today,
    },
    {
      practitioner: practitioners[2],
      client: 'Mike Johnson',
      startTime: '14:00',
      endTime: '15:30',
      date: today,
    }
  ];
  
  for (const appointment of sampleAppointments) {
    await prisma.appointment.create({
      data: appointment,
    });
  }
  
  console.log('Database has been seeded with sample data');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
