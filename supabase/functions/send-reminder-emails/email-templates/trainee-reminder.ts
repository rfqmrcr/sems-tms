export const generateTraineeReminderEmailHTML = (courseData: {
  courseName: string;
  venue: string;
  venueLink?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  traineeFullName: string;
  isACLSOrPALS?: boolean;
}) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const startDateFormatted = formatDate(courseData.startDate);
  const endDateFormatted = formatDate(courseData.endDate);
  const startTimeFormatted = formatTime(courseData.startTime);
  const endTimeFormatted = formatTime(courseData.endTime);

  const dateRange = courseData.startDate === courseData.endDate 
    ? startDateFormatted 
    : `${startDateFormatted} - ${endDateFormatted}`;

  const timeRange = courseData.startTime === courseData.endTime 
    ? startTimeFormatted 
    : `${startTimeFormatted} - ${endTimeFormatted}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Course Reminder - ${courseData.courseName}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .email-container {
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #0066cc;
            padding-bottom: 20px;
        }
        .company-name {
            color: #0066cc;
            font-size: 24px;
            font-weight: bold;
            margin: 0;
        }
        .greeting {
            margin-bottom: 20px;
            font-size: 16px;
        }
        .course-details {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 4px solid #0066cc;
        }
        .detail-item {
            margin: 10px 0;
            display: flex;
            align-items: flex-start;
            font-size: 15px;
        }
        .detail-icon {
            margin-right: 8px;
            font-size: 16px;
            min-width: 20px;
        }
        .detail-content {
            flex: 1;
        }
        .venue-link {
            color: #0066cc;
            text-decoration: none;
            word-break: break-all;
        }
        .venue-link:hover {
            text-decoration: underline;
        }
        .instructions {
            background-color: #e8f4fd;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .warning-section {
            background-color: #fff3cd;
            border: 2px solid #ffc107;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
            text-align: center;
        }
        .warning-title {
            color: #856404;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .warning-text {
            color: #856404;
            font-weight: bold;
            line-height: 1.5;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 16px;
            font-weight: bold;
        }
        .reminder-badge {
            background-color: #28a745;
            color: white;
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            display: inline-block;
            margin: 10px 0;
        }
        .cold-room-warning {
            background-color: #d1ecf1;
            border: 1px solid #bee5eb;
            padding: 15px;
            border-radius: 6px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1 class="company-name">SEMS</h1>
        </div>

        <div class="greeting">
            <p>Dear ${courseData.traineeFullName},</p>
            <p>Greetings from <strong>SEMS</strong></p>
            <p>Kindly be reminded that you have a course to be attended with SEMS. Below are the details:</p>
        </div>

        <div class="course-details">
            <div class="detail-item">
                <span class="detail-icon">📚</span>
                <span class="detail-content"><strong>Course:</strong> ${courseData.courseName}</span>
            </div>
            
            <div class="detail-item">
                <span class="detail-icon">📍</span>
                <span class="detail-content"><strong>Venue:</strong> ${courseData.venue}</span>
            </div>
            
            ${courseData.venueLink ? `
            <div class="detail-item">
                <span class="detail-icon">📍</span>
                <span class="detail-content">
                    <strong>Venue Link:</strong> 
                    <a href="${courseData.venueLink}" class="venue-link" target="_blank">${courseData.venueLink}</a>
                </span>
            </div>
            ` : ''}
            
            <div class="detail-item">
                <span class="detail-icon">📆</span>
                <span class="detail-content"><strong>Date:</strong> ${dateRange}</span>
            </div>
            
            <div class="detail-item">
                <span class="detail-icon">🕗</span>
                <span class="detail-content"><strong>Time:</strong> ${timeRange} ${courseData.startDate !== courseData.endDate ? '(Day 1 & 2)' : ''}</span>
            </div>
            
            <div class="detail-item">
                <span class="detail-icon">🅿</span>
                <span class="detail-content"><strong>Parking:</strong> If you are driving, you can park at the designated parking areas in Dubai Healthcare City. Parking fees apply as per the building regulations.</span>
            </div>
            
            <div class="detail-item">
                <span class="detail-icon">🚇</span>
                <span class="detail-content"><strong>Public Transport:</strong> You can take the Dubai Metro and get off at the nearest station to Dubai Healthcare City. Taxis and ride-sharing services are also readily available.</span>
            </div>
        </div>

        <div class="instructions">
            <p><strong>Important Transportation Note:</strong></p>
            <p>If you are using ride-sharing services (Uber/Careem), please search for <strong>"Dubai Healthcare City"</strong> or use the exact address provided above.</p>
            
            <p><strong>Arrival Instructions:</strong></p>
            <p>Upon arrival at Dubai Healthcare City, please follow the signage to the SEMS training facility. Check in at our reception desk where you will receive your classroom assignment and course materials.</p>
        </div>

        <div class="cold-room-warning">
            <div class="detail-item">
                <span class="detail-icon">✅</span>
                <span class="detail-content">Kindly be reminded to arrive at least <strong>15 minutes earlier</strong> before the course started.</span>
            </div>
            
            <div class="detail-item">
                <span class="detail-icon">🧥</span>
                <span class="detail-content">Our training rooms are very cold, we advise you to bring along your jacket. You may also bring your own water bottle which our training centre has a water dispenser to refill.</span>
            </div>
        </div>

        ${courseData.isACLSOrPALS ? `
        <div class="warning-section">
            <div class="warning-title">⚠️⚠️⚠️</div>
            <div class="warning-text">
                For ACLS & PALS courses, you have to complete the "Pretest Course Assessment" before entering the class. If you did not completed the Pretest Course Assessment, you are not allow enter the class
            </div>
        </div>
        ` : ''}

        <div class="footer">
            <p>Thank you.</p>
        </div>
    </div>
</body>
</html>`;
};