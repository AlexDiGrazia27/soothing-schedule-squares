
export interface Appointment {
  id: string;
  practitioner: string;
  client: string;
  startTime: string; // Format: HH:MM (24-hour)
  endTime: string; // Format: HH:MM (24-hour)
  date: string; // Format: YYYY-MM-DD
}

export type Practitioner = "Alex" | "Andrea" | "Kristin";

export const practitioners: Practitioner[] = ["Alex", "Andrea", "Kristin"];
