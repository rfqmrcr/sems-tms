
import { CourseRun } from '@/types/course';

export const enrichCourseRunsWithCapacity = (
  courseRuns: any[], 
  registrationCounts: Record<string, number>
): CourseRun[] => {
  return courseRuns.map(courseRun => {
    console.log('Processing course run:', courseRun.id, 'Course data:', courseRun.course);
    
    const totalCapacity = courseRun.capacity || 0;
    const registeredCount = registrationCounts[courseRun.id] || 0;
    const remainingCapacity = Math.max(0, totalCapacity - registeredCount);
    
    console.log(`Course run ${courseRun.id}: ${registeredCount}/${totalCapacity} registered, ${remainingCapacity} remaining`);
    
    return {
      ...courseRun,
      remainingCapacity,
      priceDisplay: courseRun.price ? `AED ${courseRun.price.toFixed(2)}` : 'Contact for pricing'
    };
  });
};
