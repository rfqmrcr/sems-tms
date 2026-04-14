// scripts/seed.mjs
// Run with: /usr/local/bin/node scripts/seed.mjs
//
// Populates all Firestore collections for the SEMS TMS application.

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';

// ─── Firebase Config ──────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyAAxqrLr8Zw33yT9MfanVX9_WIBGB1Q8A8",
  authDomain: "semstms.firebaseapp.com",
  projectId: "semstms",
  storageBucket: "semstms.firebasestorage.app",
  messagingSenderId: "54049192697",
  appId: "1:54049192697:web:5825d39ac6851be1d50028",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const now = new Date().toISOString();
const futureDateStr = (daysFromNow) =>
  new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const pastDateStr = (daysAgo) =>
  new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

// ─── Seed Data ────────────────────────────────────────────────────────────────

const courses = [
  {
    title: 'Advanced React Development',
    description: 'Master React 18, Server Components, Hooks and Suspense.',
    category: 'Frontend', price: 1999.0,
    hrdc_program_code: 'REACT101', registration_url: 'advanced-react-development', created_at: now,
  },
  {
    title: 'Node.js & Express Fundamentals',
    description: 'Build scalable backend services and RESTful APIs.',
    category: 'Backend', price: 1299.0,
    hrdc_program_code: 'NODE101', registration_url: 'nodejs-express-fundamentals', created_at: now,
  },
  {
    title: 'Cloud Architecture on GCP',
    description: 'Design and deploy production-grade cloud solutions on Google Cloud.',
    category: 'Cloud', price: 2499.0,
    hrdc_program_code: 'GCP201', registration_url: 'cloud-architecture-gcp', created_at: now,
  },
  {
    title: 'Cybersecurity Essentials',
    description: 'Threat analysis, network security, and secure coding practices.',
    category: 'Security', price: 1799.0,
    hrdc_program_code: 'SEC101', registration_url: 'cybersecurity-essentials', created_at: now,
  },
];

const getCourseRuns = (courseIds) => [
  {
    course_id: courseIds[0], title: 'Advanced React — May Intake',
    start_date: futureDateStr(14), end_date: futureDateStr(16),
    start_time: '09:00', end_time: '17:00', capacity: 30, price: 1999.0,
    location: 'Virtual Zoom', visibility: 'public',
    registration_url: `advanced-react-development-${futureDateStr(14)}`, created_at: now,
  },
  {
    course_id: courseIds[0], title: 'Advanced React — June Intake',
    start_date: futureDateStr(45), end_date: futureDateStr(47),
    start_time: '09:00', end_time: '17:00', capacity: 25, price: 1999.0,
    location: 'Kuala Lumpur HQ', visibility: 'public',
    registration_url: `advanced-react-development-${futureDateStr(45)}`, created_at: now,
  },
  {
    course_id: courseIds[1], title: 'Node.js Masterclass — June Intake',
    start_date: futureDateStr(30), end_date: futureDateStr(32),
    start_time: '09:00', end_time: '18:00', capacity: 20, price: 1299.0,
    location: 'Kuala Lumpur HQ', visibility: 'public',
    registration_url: `nodejs-express-fundamentals-${futureDateStr(30)}`, created_at: now,
  },
  {
    course_id: courseIds[2], title: 'GCP Cloud Architecture — July Intake',
    start_date: futureDateStr(60), end_date: futureDateStr(63),
    start_time: '08:30', end_time: '17:30', capacity: 15, price: 2499.0,
    location: 'Virtual Zoom', visibility: 'public',
    registration_url: `cloud-architecture-gcp-${futureDateStr(60)}`, created_at: now,
  },
  {
    course_id: courseIds[3], title: 'Cybersecurity Essentials — May Intake',
    start_date: futureDateStr(21), end_date: futureDateStr(23),
    start_time: '09:00', end_time: '17:00', capacity: 20, price: 1799.0,
    location: 'Petaling Jaya Office', visibility: 'public',
    registration_url: `cybersecurity-essentials-${futureDateStr(21)}`, created_at: now,
  },
];

const organizations = [
  {
    name: 'Tech Innovations Sdn Bhd',
    contact_person: 'Ahmad Razif', contact_email: 'ahmad@techinnovations.my',
    contact_number: '012-3456789', address: '123 Jalan Teknologi, Cyberjaya, Selangor', created_at: now,
  },
  {
    name: 'Digital Solutions Malaysia',
    contact_person: 'Priya Nair', contact_email: 'priya@digitalsolutions.my',
    contact_number: '011-9876543', address: '88 Jalan Digital, KLCC, Kuala Lumpur', created_at: now,
  },
];

const getRegistrations = (orgIds, courseIds, courseRunIds) => [
  {
    organization_id: orgIds[0], contact_person: 'Ahmad Razif',
    contact_email: 'ahmad@techinnovations.my', contact_number: '012-3456789',
    course_id: courseIds[0], course_run_id: courseRunIds[0],
    payment_amount: 5997.0, hrdf_grant: true,
    payment_status: 'paid', status: 'confirmed',
    sponsorship_type: 'corporate', created_at: now,
  },
  {
    organization_id: orgIds[1], contact_person: 'Priya Nair',
    contact_email: 'priya@digitalsolutions.my', contact_number: '011-9876543',
    course_id: courseIds[1], course_run_id: courseRunIds[2],
    payment_amount: 2598.0, hrdf_grant: false,
    payment_status: 'unpaid', status: 'pending',
    sponsorship_type: 'corporate', created_at: now,
  },
];

const getTrainees = (registrationIds) => [
  // For registration 1
  {
    registration_id: registrationIds[0], full_name: 'Nurul Ain binti Hassan',
    nric: '900101-14-1234', dob: '1990-01-01', gender: 'female',
    contact_number: '012-1111111', email: 'nurul@techinnovations.my', created_at: now,
  },
  {
    registration_id: registrationIds[0], full_name: 'Mohd Faiz bin Razak',
    nric: '920515-10-5678', dob: '1992-05-15', gender: 'male',
    contact_number: '012-2222222', email: 'faiz@techinnovations.my', created_at: now,
  },
  {
    registration_id: registrationIds[0], full_name: 'Lee Wei Ling',
    nric: '880820-08-9012', dob: '1988-08-20', gender: 'female',
    contact_number: '012-3333333', email: 'weiling@techinnovations.my', created_at: now,
  },
  // For registration 2
  {
    registration_id: registrationIds[1], full_name: 'Rajan Kumar',
    nric: '950310-10-3456', dob: '1995-03-10', gender: 'male',
    contact_number: '011-4444444', email: 'rajan@digitalsolutions.my', created_at: now,
  },
  {
    registration_id: registrationIds[1], full_name: 'Siti Rahimah binti Ali',
    nric: '960720-14-7890', dob: '1996-07-20', gender: 'female',
    contact_number: '011-5555555', email: 'siti@digitalsolutions.my', created_at: now,
  },
];

const getInvoices = (registrationIds) => [
  {
    registration_id: registrationIds[0],
    invoice_number: `INV-${new Date().getFullYear()}0414-0001`,
    issue_date: pastDateStr(7), due_date: futureDateStr(7),
    subtotal: 5997.0, tax_rate: 6, tax_amount: 359.82, total_amount: 6356.82,
    status: 'paid', description: 'Invoice for Advanced React Development course registration',
    created_at: now,
  },
];

const getQuotations = (registrationIds) => [
  {
    registration_id: registrationIds[1],
    quotation_number: `QUO-${new Date().getFullYear()}04-001`,
    issue_date: pastDateStr(3), valid_until: futureDateStr(27),
    subtotal: 2598.0, tax_rate: 6, tax_amount: 155.88, total_amount: 2753.88,
    status: 'pending', notes: 'Quotation for Node.js Masterclass — June Intake',
    created_at: now, updated_at: now,
  },
];

const promoCodes = [
  {
    code: 'LAUNCH20', discount_percentage: 20, description: 'Launch promotion — 20% off',
    valid_from: pastDateStr(30), valid_until: futureDateStr(30),
    max_uses: 50, used_count: 3, is_active: true, created_at: now,
  },
  {
    code: 'HRDC10', discount_percentage: 10, description: 'HRDC claimable discount',
    valid_from: pastDateStr(60), valid_until: futureDateStr(60),
    max_uses: 100, used_count: 12, is_active: true, created_at: now,
  },
];

const partners = [
  {
    name: 'Malaysia Digital Economy Corporation (MDEC)',
    contact_email: 'partner@mdec.my', contact_person: 'Hafizuddin Zainal',
    discount_percentage: 15, is_active: true, created_at: now,
  },
  {
    name: 'TalentCorp Malaysia',
    contact_email: 'partner@talentcorp.com.my', contact_person: 'Lim Hui Ying',
    discount_percentage: 10, is_active: true, created_at: now,
  },
];

// ─── Main Seeder ──────────────────────────────────────────────────────────────
async function seed() {
  console.log('\n🔥 Connecting to Firebase project: semstms');
  console.log('📦 Starting full database seed...\n');

  try {
    // Check if already seeded
    const existingCourses = await getDocs(collection(db, 'courses'));
    if (!existingCourses.empty) {
      console.log(`⚠️  Courses collection already has ${existingCourses.size} document(s).`);
      console.log('   Skipping courses & course_runs. Continuing with remaining collections...\n');
    }

    let courseIds = existingCourses.docs.map(d => d.id);
    let courseRunIds = [];
    let orgIds = [];

    // ── Courses ──
    if (existingCourses.empty) {
      console.log('📚 Seeding courses...');
      for (const course of courses) {
        const ref = await addDoc(collection(db, 'courses'), course);
        courseIds.push(ref.id);
        console.log(`   ✅ ${course.title}`);
      }

      console.log('\n📅 Seeding course runs...');
      const runs = getCourseRuns(courseIds);
      for (const run of runs) {
        const ref = await addDoc(collection(db, 'course_runs'), run);
        courseRunIds.push(ref.id);
        console.log(`   ✅ ${run.title}`);
      }
    } else {
      const runsSnap = await getDocs(collection(db, 'course_runs'));
      courseRunIds = runsSnap.docs.map(d => d.id);
    }

    // ── Organizations ──
    const existingOrgs = await getDocs(collection(db, 'organizations'));
    if (existingOrgs.empty) {
      console.log('\n🏢 Seeding organizations...');
      for (const org of organizations) {
        const ref = await addDoc(collection(db, 'organizations'), org);
        orgIds.push(ref.id);
        console.log(`   ✅ ${org.name}`);
      }
    } else {
      orgIds = existingOrgs.docs.map(d => d.id);
      console.log(`\n🏢 Organizations already seeded (${existingOrgs.size} found). Skipping.`);
    }

    // ── Registrations ──
    let registrationIds = [];
    const existingRegs = await getDocs(collection(db, 'registrations'));
    if (existingRegs.empty) {
      console.log('\n📋 Seeding registrations...');
      const regs = getRegistrations(orgIds, courseIds, courseRunIds);
      for (const reg of regs) {
        const ref = await addDoc(collection(db, 'registrations'), reg);
        registrationIds.push(ref.id);
        console.log(`   ✅ Registration for ${reg.contact_person}`);
      }
    } else {
      registrationIds = existingRegs.docs.map(d => d.id);
      console.log(`\n📋 Registrations already seeded (${existingRegs.size} found). Skipping.`);
    }

    // ── Trainees ──
    const existingTrainees = await getDocs(collection(db, 'trainees'));
    if (existingTrainees.empty) {
      console.log('\n👤 Seeding trainees...');
      const trainees = getTrainees(registrationIds);
      for (const trainee of trainees) {
        await addDoc(collection(db, 'trainees'), trainee);
        console.log(`   ✅ ${trainee.full_name}`);
      }
    } else {
      console.log(`\n👤 Trainees already seeded (${existingTrainees.size} found). Skipping.`);
    }

    // ── Invoices ──
    const existingInvoices = await getDocs(collection(db, 'invoices'));
    if (existingInvoices.empty) {
      console.log('\n🧾 Seeding invoices...');
      const invoices = getInvoices(registrationIds);
      for (const invoice of invoices) {
        const ref = await addDoc(collection(db, 'invoices'), invoice);
        console.log(`   ✅ ${invoice.invoice_number}`);
      }
    } else {
      console.log(`\n🧾 Invoices already seeded (${existingInvoices.size} found). Skipping.`);
    }

    // ── Quotations ──
    const existingQuotations = await getDocs(collection(db, 'quotations'));
    if (existingQuotations.empty) {
      console.log('\n📄 Seeding quotations...');
      const quotations = getQuotations(registrationIds);
      for (const quotation of quotations) {
        await addDoc(collection(db, 'quotations'), quotation);
        console.log(`   ✅ ${quotation.quotation_number}`);
      }
    } else {
      console.log(`\n📄 Quotations already seeded (${existingQuotations.size} found). Skipping.`);
    }

    // ── Promo Codes ──
    const existingPromos = await getDocs(collection(db, 'promo_codes'));
    if (existingPromos.empty) {
      console.log('\n🏷️  Seeding promo codes...');
      for (const promo of promoCodes) {
        await addDoc(collection(db, 'promo_codes'), promo);
        console.log(`   ✅ ${promo.code} (${promo.discount_percentage}% off)`);
      }
    } else {
      console.log(`\n🏷️  Promo codes already seeded (${existingPromos.size} found). Skipping.`);
    }

    // ── Partners ──
    const existingPartners = await getDocs(collection(db, 'partners'));
    if (existingPartners.empty) {
      console.log('\n🤝 Seeding partners...');
      for (const partner of partners) {
        await addDoc(collection(db, 'partners'), partner);
        console.log(`   ✅ ${partner.name}`);
      }
    } else {
      console.log(`\n🤝 Partners already seeded (${existingPartners.size} found). Skipping.`);
    }

    console.log('\n' + '─'.repeat(50));
    console.log('🎉 Full database seed complete!');
    console.log('\n📋 Collections in Firestore:');
    console.log('   ✅ courses');
    console.log('   ✅ course_runs');
    console.log('   ✅ organizations');
    console.log('   ✅ registrations');
    console.log('   ✅ trainees');
    console.log('   ✅ invoices');
    console.log('   ✅ quotations');
    console.log('   ✅ promo_codes');
    console.log('   ✅ partners');
    console.log('\n✅ Your app is ready to use!\n');

  } catch (error) {
    console.error('\n❌ Seed failed:', error.message);
    if (error.code === 'permission-denied') {
      console.error('\n   ⚠️  Permission denied. Set Firestore rules to allow read, write: if true; temporarily.');
    }
    process.exit(1);
  }

  process.exit(0);
}

seed();
