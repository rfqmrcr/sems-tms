import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { jsPDF } from 'https://esm.sh/jspdf@2.5.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export const generateCourseAgenda = async (
  registrationId: string,
  courseId: string,
  courseName: string,
  courseStartDate: string,
  courseEndDate: string
): Promise<{ agendaPdf: string }> => {
  try {
    console.log("Generating course agenda for registration:", registrationId);

    // Fetch course agenda content
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('course_agenda')
      .eq('id', courseId)
      .single();

    if (courseError) {
      console.error('Error fetching course data:', courseError);
      throw courseError;
    }

    if (!courseData?.course_agenda) {
      throw new Error('No course agenda content found for this course');
    }

    // Fetch course run and trainer information
    const { data: courseRunData, error: courseRunError } = await supabase
      .from('course_runs')
      .select(`
        *,
        trainer:trainers(full_name)
      `)
      .eq('course_id', courseId)
      .gte('start_date', courseStartDate)
      .lte('start_date', courseEndDate)
      .single();

    if (courseRunError) {
      console.error('Error fetching course run data:', courseRunError);
    }

    const trainerName = courseRunData?.trainer?.full_name || 'TBA';

    // Generate PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(41, 98, 255); // Primary blue color
    doc.text('COURSE AGENDA', pageWidth / 2, 30, { align: 'center' });

    // Course details
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    let yPosition = 50;

    doc.setFont("helvetica", "bold");
    doc.text('Course Name:', margin, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(courseName, margin + 35, yPosition);
    yPosition += 10;

    doc.setFont("helvetica", "bold");
    doc.text('Start Date:', margin, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(new Date(courseStartDate).toLocaleDateString('en-GB'), margin + 30, yPosition);
    yPosition += 10;

    doc.setFont("helvetica", "bold");
    doc.text('End Date:', margin, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(new Date(courseEndDate).toLocaleDateString('en-GB'), margin + 28, yPosition);
    yPosition += 10;

    doc.setFont("helvetica", "bold");
    doc.text('Trainer:', margin, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(trainerName, margin + 24, yPosition);
    yPosition += 20;

    // Agenda content
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text('Course Content', margin, yPosition);
    yPosition += 15;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    // Process agenda content - split by lines and handle formatting
    const agendaLines = courseData.course_agenda.split('\n');
    
    for (const line of agendaLines) {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        yPosition += 5;
        continue;
      }

      // Check if we need a new page
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 30;
      }

      // Handle different line types
      if (trimmedLine.startsWith('Day ') || trimmedLine.includes(':')) {
        doc.setFont("helvetica", "bold");
        if (trimmedLine.startsWith('Day ')) {
          doc.setFontSize(14);
          yPosition += 5;
        } else {
          doc.setFontSize(12);
        }
      } else if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
      }

      // Split long lines to fit in the page
      const textLines = doc.splitTextToSize(trimmedLine, contentWidth);
      
      for (const textLine of textLines) {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 30;
        }
        doc.text(textLine, margin, yPosition);
        yPosition += 7;
      }
      
      yPosition += 2;
    }

    // Footer
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 30;
    }

    yPosition = Math.max(yPosition + 20, 250);
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(128, 128, 128);
    doc.text('This agenda is subject to change. Please refer to your instructor for any updates.', 
             pageWidth / 2, yPosition, { align: 'center' });

    // Convert PDF to base64 for email attachment
    const pdfBuffer = doc.output('arraybuffer');
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));

    console.log("Course agenda PDF generated successfully");
    return { agendaPdf: pdfBase64 };

  } catch (error) {
    console.error('Error generating course agenda:', error);
    throw error;
  }
};