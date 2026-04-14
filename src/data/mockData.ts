
// This file contains mock data that would typically come from a database
// In a production environment, this would be replaced with API calls

export interface CourseRun {
  id: string;
  courseName: string;
  startDate: Date;
  endDate: Date;
  capacity: number;
  remainingCapacity: number;
  location: string;
}

export const courseRuns: CourseRun[] = [
  {
    id: '1',
    courseName: 'Basic CPR & AED Training',
    startDate: new Date('2025-05-15T09:00:00'),
    endDate: new Date('2025-05-15T17:00:00'),
    capacity: 20,
    remainingCapacity: 20,
    location: 'Training Center A, Level 2, 123 Medical Ave'
  },
  {
    id: '2',
    courseName: 'Advanced First Aid',
    startDate: new Date('2025-05-20T09:00:00'),
    endDate: new Date('2025-05-21T17:00:00'),
    capacity: 15,
    remainingCapacity: 15,
    location: 'Emergency Response Center, 456 Health Street'
  },
  {
    id: '3',
    courseName: 'CPR for Healthcare Providers',
    startDate: new Date('2025-06-05T09:00:00'),
    endDate: new Date('2025-06-06T17:00:00'),
    capacity: 25,
    remainingCapacity: 25,
    location: 'Medical University, Room 301, 789 Education Blvd'
  },
  {
    id: '4',
    courseName: 'Pediatric First Aid',
    startDate: new Date('2025-06-12T09:00:00'),
    endDate: new Date('2025-06-12T17:00:00'),
    capacity: 18,
    remainingCapacity: 18,
    location: 'Children\'s Medical Center, 321 Pediatric Way'
  },
  {
    id: '5',
    courseName: 'Workplace First Aid and CPR',
    startDate: new Date('2025-06-25T09:00:00'),
    endDate: new Date('2025-06-26T17:00:00'),
    capacity: 30,
    remainingCapacity: 30,
    location: 'Corporate Training Facility, 555 Business Park'
  }
];

export const industries = [
  'Healthcare',
  'Education',
  'Manufacturing',
  'Technology',
  'Finance',
  'Retail',
  'Construction',
  'Hospitality',
  'Transportation',
  'Energy',
  'Other'
];
