import { Trainee } from '@/types/course';
import { insertRow, delay } from '@/data/mockDatabase';

export const createTrainees = async (trainees: Trainee[], registrationId: string): Promise<void> => {
  await delay(200);
  if (!trainees || trainees.length === 0) return;

  const traineesToInsert = trainees.map(trainee => {
    let formattedDob = '1990-01-01'; 
    if (trainee.dob) {
      if (typeof trainee.dob === 'number') {
        const excelDate = new Date((trainee.dob - 25569) * 86400 * 1000);
        formattedDob = excelDate.toISOString().split('T')[0];
      } else if (typeof trainee.dob === 'string') {
        const parsedDate = new Date(trainee.dob);
        if (!isNaN(parsedDate.getTime())) {
          formattedDob = parsedDate.toISOString().split('T')[0];
        }
      }
    }

    return {
      registration_id: registrationId,
      full_name: trainee.full_name || '',
      nric: trainee.nric || '',
      dob: formattedDob,
      gender: trainee.gender || 'male',
      contact_number: trainee.contact_number || '',
      email: trainee.email || ''
    };
  });

  traineesToInsert.forEach(t => insertRow('trainees', t));
};
