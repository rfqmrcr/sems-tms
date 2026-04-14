import { getTable } from '@/data/mockDatabase';

export const getRegistrationCounts = async (courseRunIds: string[]): Promise<Record<string, number>> => {
  let registrationCounts: Record<string, number> = {};
  if (courseRunIds.length === 0) return registrationCounts;

  const registrations = getTable('registrations');
  const trainees = getTable('trainees');

  const filteredRegs = registrations.filter(r => courseRunIds.includes(r.course_run_id));
  const registrationIds = filteredRegs.map(r => r.id);

  if (registrationIds.length === 0) return registrationCounts;

  const filteredTrainees = trainees.filter(t => registrationIds.includes(t.registration_id));

  filteredTrainees.forEach(trainee => {
    const registration = filteredRegs.find(reg => reg.id === trainee.registration_id);
    if (registration) {
      const courseRunId = registration.course_run_id;
      registrationCounts[courseRunId] = (registrationCounts[courseRunId] || 0) + 1;
    }
  });

  return registrationCounts;
};
