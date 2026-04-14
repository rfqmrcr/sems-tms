import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CourseRun, Course } from '@/types/course';

export const fetchCourseRunByUrl = async (registrationUrl: string): Promise<CourseRun | null> => {
  const q = query(collection(db, 'course_runs'), where('registration_url', '==', registrationUrl));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  
  const runDoc = snap.docs[0];
  const run = { id: runDoc.id, ...runDoc.data() } as CourseRun;
  
  if (run.course_id) {
    const courseSnap = await getDoc(doc(db, 'courses', run.course_id));
    if (courseSnap.exists()) {
      run.course = { id: courseSnap.id, ...courseSnap.data() } as any;
    }
  }
  return run;
};

export const fetchCourseByUrl = async (registrationUrl: string) => {
  const qCourse = query(collection(db, 'courses'), where('registration_url', '==', registrationUrl));
  const snapCourse = await getDocs(qCourse);
  if (snapCourse.empty) return null;
  
  const courseDoc = snapCourse.docs[0];
  const course = { id: courseDoc.id, ...courseDoc.data() } as Course;
  
  const qRuns = query(collection(db, 'course_runs'), where('course_id', '==', course.id));
  const snapRuns = await getDocs(qRuns);
  const runs = snapRuns.docs.map(d => ({ id: d.id, ...d.data() }));
  
  return {
    ...course,
    course_runs: runs
  };
};

export const generateUniqueUrl = async (courseTitle: string, startDate: string): Promise<string> => {
  return `${courseTitle.replace(/\\s+/g, '-').toLowerCase()}-${startDate}`;
};

export const generateUniqueCourseUrl = async (courseTitle: string): Promise<string> => {
  return courseTitle.replace(/\\s+/g, '-').toLowerCase();
};

export const updateCourseRunUrl = async (courseRunId: string, registrationUrl: string): Promise<void> => {
  await updateDoc(doc(db, 'course_runs', courseRunId), { registration_url: registrationUrl });
};

export const updateCourseUrl = async (courseId: string, registrationUrl: string): Promise<void> => {
  await updateDoc(doc(db, 'courses', courseId), { registration_url: registrationUrl });
};