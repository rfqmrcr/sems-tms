import { Course, CourseRun } from '@/types/course';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const fetchCourses = async (): Promise<Course[]> => {
  const snapshot = await getDocs(collection(db, 'courses'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
};

export const fetchCourseRunsData = async () => {
  const runsSnap = await getDocs(collection(db, 'course_runs'));
  const coursesSnap = await getDocs(collection(db, 'courses'));
  
  const courses = coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
  const runs = runsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CourseRun));
  
  return runs.map(run => {
    return {
      ...run,
      course: courses.find(c => c.id === run.course_id),
      schedules: []
    }
  }).sort((a,b) => a.start_date.localeCompare(b.start_date));
};

export const fetchPublicCourseRunsData = async () => {
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 2);
  const minDateString = minDate.toISOString().split('T')[0];
  
  const runsSnap = await getDocs(collection(db, 'course_runs'));
  const coursesSnap = await getDocs(collection(db, 'courses'));
  
  const courses = coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
  const runs = runsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CourseRun));
  
  const publicRuns = runs.filter(run => run.visibility === 'public' && run.start_date >= minDateString);
  
  return publicRuns.map(run => ({
    ...run,
    course: courses.find(c => c.id === run.course_id),
    schedules: []
  })).sort((a,b) => a.start_date.localeCompare(b.start_date));
};

export const fetchAlternativeCourseRuns = async (courseId: string, excludeId: string): Promise<CourseRun[]> => {
  const runsSnap = await getDocs(collection(db, 'course_runs'));
  const coursesSnap = await getDocs(collection(db, 'courses'));
  
  const courses = coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
  const runs = runsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CourseRun));
  
  const alt = runs.filter(run => run.course_id === courseId && run.id !== excludeId && run.visibility === 'public');
  return alt.map(run => ({
    ...run,
    courses: courses.find(c => c.id === run.course_id),
    schedules: []
  })).sort((a,b) => a.start_date.localeCompare(b.start_date));
};
