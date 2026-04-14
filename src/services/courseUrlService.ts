import { getTable, updateRow } from '@/data/mockDatabase';
import { CourseRun } from '@/types/course';

export const fetchCourseRunByUrl = async (registrationUrl: string): Promise<CourseRun | null> => {
  const runs = getTable('course_runs');
  const courses = getTable('courses');
  const run = runs.find(r => r.registration_url === registrationUrl);
  if (!run) return null;
  return {
    ...run,
    course: courses.find(c => c.id === run.course_id)
  } as any;
};

export const fetchCourseByUrl = async (registrationUrl: string) => {
  const courses = getTable('courses');
  const runs = getTable('course_runs');
  const course = courses.find(c => c.registration_url === registrationUrl);
  if (!course) return null;
  return {
    ...course,
    course_runs: runs.filter(r => r.course_id === course.id)
  };
};

export const generateUniqueUrl = async (courseTitle: string, startDate: string): Promise<string> => {
  return `${courseTitle.replace(/\\s+/g, '-').toLowerCase()}-${startDate}`;
};

export const generateUniqueCourseUrl = async (courseTitle: string): Promise<string> => {
  return courseTitle.replace(/\\s+/g, '-').toLowerCase();
};

export const updateCourseRunUrl = async (courseRunId: string, registrationUrl: string): Promise<void> => {
  updateRow('course_runs', courseRunId, { registration_url: registrationUrl });
};

export const updateCourseUrl = async (courseId: string, registrationUrl: string): Promise<void> => {
  updateRow('courses', courseId, { registration_url: registrationUrl });
};