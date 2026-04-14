import { CourseRun, Registration, Trainee } from '@/types/course';
import { fetchCourses, fetchCourseRunsData, fetchPublicCourseRunsData, fetchAlternativeCourseRuns } from './courseDataService';
import { getRegistrationCounts } from './registrationCountService';
import { enrichCourseRunsWithCapacity } from './courseRunProcessor';
import { createOrFindOrganization } from './organizationService';
import { createTrainees } from './traineeService';
import { insertRow, delay } from '@/data/mockDatabase';

export interface Organization {
  name: string;
  address: string;
  contact_person: string;
  contact_email: string;
  contact_number: string;
  hrdf_grant?: boolean;
  sponsorship_type?: 'corporate' | 'self';
  payment_terms?: string;
  cme_sales_representative?: string;
}

export type { Course, CourseRun, Registration, Trainee } from '@/types/course';
export { fetchCourses, fetchAlternativeCourseRuns };

export const fetchCourseRuns = async (): Promise<CourseRun[]> => {
  const courseRunsData = await fetchPublicCourseRunsData();
  const courseRunIds = courseRunsData.map(run => run.id);
  const registrationCounts = await getRegistrationCounts(courseRunIds);
  const enrichedData = enrichCourseRunsWithCapacity(courseRunsData, registrationCounts);
  
  return enrichedData;
};

export const createRegistration = async (
  registration: Registration,
  organization: Organization,
  trainees: Trainee[]
): Promise<{ success: boolean; error?: string; registrationId?: string }> => {
  try {
    await delay(300);
    const organizationId = await createOrFindOrganization(organization);

    const registrationData = {
      organization_id: organizationId,
      contact_person: registration.contact_person,
      contact_email: registration.contact_email,
      contact_number: registration.contact_number,
      course_id: registration.course_id,
      course_run_id: registration.course_run_id,
      payment_amount: registration.payment_amount || 0,
      hrdf_grant: registration.hrdf_grant || false,
      payment_status: 'unpaid',
      status: 'pending',
    };

    const newRegistration = insertRow('registrations', registrationData);

    await createTrainees(trainees, newRegistration.id);

    return { 
      success: true, 
      registrationId: newRegistration.id 
    };

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};
