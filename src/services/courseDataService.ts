import { Course, CourseRun } from '@/types/course';
import { getTable, delay } from '@/data/mockDatabase';

export const fetchCourses = async (): Promise<Course[]> => {
  await delay(300);
  return getTable('courses') as Course[];
};

export const fetchCourseRunsData = async () => {
  await delay(300);
  const runs = getTable('course_runs');
  const courses = getTable('courses');
  return runs.map(run => {
    return {
      ...run,
      course: courses.find(c => c.id === run.course_id),
      schedules: []
    }
  }).sort((a,b) => a.start_date.localeCompare(b.start_date));
};

export const fetchPublicCourseRunsData = async () => {
  await delay(300);
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 2);
  const minDateString = minDate.toISOString().split('T')[0];
  
  const runs = getTable('course_runs');
  const courses = getTable('courses');
  
  const publicRuns = runs.filter(run => run.visibility === 'public' && run.start_date >= minDateString);
  
  return publicRuns.map(run => ({
    ...run,
    course: courses.find(c => c.id === run.course_id),
    schedules: []
  })).sort((a,b) => a.start_date.localeCompare(b.start_date));
};

export const fetchAlternativeCourseRuns = async (courseId: string, excludeId: string): Promise<CourseRun[]> => {
  await delay(300);
  const runs = getTable('course_runs');
  const courses = getTable('courses');
  const alt = runs.filter(run => run.course_id === courseId && run.id !== excludeId && run.visibility === 'public');
  return alt.map(run => ({
    ...run,
    courses: courses.find(c => c.id === run.course_id),
    schedules: []
  })).sort((a,b) => a.start_date.localeCompare(b.start_date));
};
