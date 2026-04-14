
import { CourseType } from './types.ts';

export function inferCourseType(courseName: string): CourseType {
  if (!courseName) return 'general';
  const lowerName = courseName.toLowerCase();
  
  if (lowerName.includes('programming') || 
      lowerName.includes('coding') || 
      lowerName.includes('development') || 
      lowerName.includes('technical') || 
      lowerName.includes('software') ||
      lowerName.includes('engineering') ||
      lowerName.includes('data') ||
      lowerName.includes('ai') ||
      lowerName.includes('machine learning')) {
    return 'technical';
  }
  
  if (lowerName.includes('leadership') || 
      lowerName.includes('communication') || 
      lowerName.includes('soft skills') ||
      lowerName.includes('management') ||
      lowerName.includes('team building') ||
      lowerName.includes('customer service') ||
      lowerName.includes('sales') ||
      lowerName.includes('presentation')) {
    return 'soft-skills';
  }
  
  if (lowerName.includes('compliance') || 
      lowerName.includes('regulation') || 
      lowerName.includes('legal') ||
      lowerName.includes('safety') ||
      lowerName.includes('certification') ||
      lowerName.includes('audit') ||
      lowerName.includes('risk') ||
      lowerName.includes('quality')) {
    return 'compliance';
  }
  
  return 'general';
}

export function getCourseRequirements(courseName: string, courseType: string): string {
  if (!courseName) courseName = '';
  const lowerName = courseName.toLowerCase();
  
  switch(courseType) {
    case 'technical':
      let techRequirements = "Please bring a laptop with the following specifications:\n";
      techRequirements += "• Operating System: Windows 10/11 or macOS 10.15+\n";
      techRequirements += "• RAM: Minimum 8GB (16GB recommended)\n";
      techRequirements += "• Storage: At least 5GB free space\n";
      
      if (lowerName.includes('programming') || lowerName.includes('development')) {
        techRequirements += "• Admin privileges to install software\n";
        techRequirements += "• Stable internet connection for downloads\n";
      }
      
      if (lowerName.includes('data') || lowerName.includes('analytics')) {
        techRequirements += "• Excel or equivalent spreadsheet software\n";
        techRequirements += "• Data analysis tools will be provided\n";
      }
      
      return techRequirements;
      
    case 'soft-skills':
      return "Course Materials:\n• Notebook and pen for taking notes\n• Open mind and willingness to participate in interactive activities\n• No technical equipment required\n• All course materials will be provided";
      
    case 'compliance':
      return "Required Items:\n• Valid identification (MyKad/Passport)\n• Notebook for important notes\n• Attendance is mandatory for certification\n• All compliance materials will be provided\n• Certificate will be issued upon completion";
      
    default:
      return "Course Materials:\n• Notebook and pen\n• All necessary materials will be provided\n• Please arrive 15 minutes before the session starts";
  }
}

export function getPreCourseInstructions(courseName: string, courseType: string): string {
  if (!courseName) courseName = '';
  const lowerName = courseName.toLowerCase();
  
  switch(courseType) {
    case 'technical':
      let instructions = "Pre-Course Preparation:\n";
      instructions += "1. Ensure your laptop meets the technical requirements\n";
      instructions += "2. Test your internet connection\n";
      instructions += "3. Update your operating system and browsers\n";
      
      if (lowerName.includes('programming')) {
        instructions += "4. Familiarize yourself with basic computer operations\n";
        instructions += "5. Review any programming basics if you're new to coding\n";
      }
      
      return instructions;
      
    case 'soft-skills':
      return "Pre-Course Preparation:\n1. Reflect on your current communication style\n2. Think about situations where you'd like to improve\n3. Come prepared to share experiences (optional)\n4. Bring specific challenges you'd like to address";
      
    case 'compliance':
      return "Pre-Course Preparation:\n1. Review your current workplace policies\n2. Bring any compliance questions you may have\n3. Ensure you have valid identification\n4. Review the course agenda if provided";
      
    default:
      return "Pre-Course Preparation:\n1. Review the course outline\n2. Prepare any questions you may have\n3. Ensure you have transportation arrangements\n4. Confirm your attendance 24 hours before the course";
  }
}
