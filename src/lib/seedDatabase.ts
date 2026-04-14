// src/lib/seedDatabase.ts
// Run this once to populate your Firestore with initial data.

import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from './firebase';

const initialCourses = [
  {
    title: 'Advanced React Development',
    description: 'Master React 18, Server Components, and Suspense in this comprehensive course.',
    category: 'Frontend',
    price: 1999.0,
    hrdc_program_code: 'REACT101',
    created_at: new Date().toISOString()
  },
  {
    title: 'Node.js & Express Fundamentals',
    description: 'Learn to build complete backends and RESTful APIs with Node.js and Express.',
    category: 'Backend',
    price: 999.0,
    hrdc_program_code: 'NODE101',
    created_at: new Date().toISOString()
  }
];

const getInitialCourseRuns = (courseIds: string[]) => [
  {
    course_id: courseIds[0],
    title: 'Advanced React - May Intake',
    start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '17:00',
    capacity: 30,
    price: 1999.0,
    location: 'Virtual Zoom',
    visibility: 'public',
    created_at: new Date().toISOString()
  },
  {
    course_id: courseIds[1],
    title: 'Node.js Masterclass - June Intake',
    start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '18:00',
    capacity: 20,
    price: 999.0,
    location: 'Kuala Lumpur HQ',
    visibility: 'public',
    created_at: new Date().toISOString()
  }
];

export const seedDatabase = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Check if data already exists
    const coursesSnap = await getDocs(collection(db, 'courses'));
    if (!coursesSnap.empty) {
      return { success: false, message: `Database already has ${coursesSnap.size} course(s). Skipping seed.` };
    }

    // Insert courses
    const courseIds: string[] = [];
    for (const course of initialCourses) {
      const ref = await addDoc(collection(db, 'courses'), course);
      courseIds.push(ref.id);
    }

    // Insert course runs
    const courseRuns = getInitialCourseRuns(courseIds);
    for (const run of courseRuns) {
      await addDoc(collection(db, 'course_runs'), run);
    }

    return {
      success: true,
      message: `✅ Successfully seeded ${initialCourses.length} courses and ${courseRuns.length} course runs into Firestore!`
    };
  } catch (error) {
    console.error('Seed error:', error);
    return {
      success: false,
      message: `❌ Error seeding database: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};
