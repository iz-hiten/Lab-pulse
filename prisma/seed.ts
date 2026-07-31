import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedDatabase() {
  console.log('Seeding Lab Pulse initial data...');

  // 1. Create Schools
  const oakridge = await prisma.school.upsert({
    where: { id: 'school-oakridge' },
    update: {},
    create: {
      id: 'school-oakridge',
      name: 'Oakridge Community High School',
      commuteTime: 45,
      activeLabDays: JSON.stringify(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']),
      hasDedicatedStaff: true,
    },
  });

  const sunrise = await prisma.school.upsert({
    where: { id: 'school-sunrise' },
    update: {},
    create: {
      id: 'school-sunrise',
      name: 'Sunrise Valley Academy',
      commuteTime: 90,
      activeLabDays: JSON.stringify(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']),
      hasDedicatedStaff: false,
    },
  });

  const horizon = await prisma.school.upsert({
    where: { id: 'school-horizon' },
    update: {},
    create: {
      id: 'school-horizon',
      name: 'Horizon STEM Technical Academy',
      commuteTime: 25,
      activeLabDays: JSON.stringify(['Mon', 'Tue', 'Wed', 'Thu']),
      hasDedicatedStaff: true,
    },
  });

  const passwordHash = await bcrypt.hash('password123', 10);

  // 2. Create Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@labpulse.org' },
    update: {},
    create: {
      id: 'user-admin',
      name: 'Priya Sharma (Program Mgr)',
      email: 'admin@labpulse.org',
      passwordHash,
      role: 'admin',
      schoolId: null,
    },
  });

  const teacherOakridge = await prisma.user.upsert({
    where: { email: 'oakridge.lab@school.edu' },
    update: {},
    create: {
      id: 'user-oakridge',
      name: 'Marcus Vance',
      email: 'oakridge.lab@school.edu',
      passwordHash,
      role: 'entry',
      schoolId: oakridge.id,
    },
  });

  const teacherSunrise = await prisma.user.upsert({
    where: { email: 'sunrise.lab@school.edu' },
    update: {},
    create: {
      id: 'user-sunrise',
      name: 'Amina Nkosi',
      email: 'sunrise.lab@school.edu',
      passwordHash,
      role: 'entry',
      schoolId: sunrise.id,
    },
  });

  const teacherHorizon = await prisma.user.upsert({
    where: { email: 'horizon.lab@school.edu' },
    update: {},
    create: {
      id: 'user-horizon',
      name: 'David Chen',
      email: 'horizon.lab@school.edu',
      passwordHash,
      role: 'entry',
      schoolId: horizon.id,
    },
  });

  // 3. Create Experiment Windows
  const expOakridge = await prisma.experimentWindow.upsert({
    where: { id: 'exp-oakridge-gamified' },
    update: {},
    create: {
      id: 'exp-oakridge-gamified',
      schoolId: oakridge.id,
      title: 'Gamified Science Modules (v2.1)',
      startDate: getDateOffset(-7),
      endDate: getDateOffset(-1),
      notes: 'Testing interactive badge rewards for completion speed.',
    },
  });

  // 4. Generate 14 days of realistic entries for each school
  const schoolsConfig = [
    {
      school: oakridge,
      user: teacherOakridge,
      baseAttendance: 28,
      baseEngagement: 4.5,
      sessionRanRate: 1.0,
      techIssueProb: 0.1,
      techMsg: 'Chromebook Wi-Fi reconnected slowly.',
    },
    {
      school: sunrise,
      user: teacherSunrise,
      baseAttendance: 14, // Attendance drop & missed sessions
      baseEngagement: 2.8,
      sessionRanRate: 0.6, // Missed 3 sessions recently
      techIssueProb: 0.7, // Recurring tech issue
      techMsg: 'Solar power inverter tripping every afternoon at 2 PM.',
    },
    {
      school: horizon,
      user: teacherHorizon,
      baseAttendance: 24,
      baseEngagement: 4.2,
      sessionRanRate: 0.9,
      techIssueProb: 0.2,
      techMsg: 'Projector bulb flickered.',
    },
  ];

  for (let offset = 13; offset >= 0; offset--) {
    const dateStr = getDateOffset(-offset);
    const dayOfWeek = new Date(dateStr).getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

    for (const config of schoolsConfig) {
      // Check if entry already exists
      const existing = await prisma.dailyEntry.findFirst({
        where: {
          schoolId: config.school.id,
          date: dateStr,
        },
      });

      if (!existing) {
        // Determine if session ran
        const ran = Math.random() < config.sessionRanRate;
        const isExp = offset >= 1 && offset <= 7 && config.school.id === oakridge.id;
        
        // Add attendance variation
        const noiseAtt = Math.floor((Math.random() - 0.5) * 4);
        const students = ran ? Math.max(8, config.baseAttendance + noiseAtt) : 0;
        
        // Engagement
        const eng = ran
          ? Math.min(5, Math.max(1, Math.round((config.baseEngagement + (isExp ? 0.6 : 0) + (Math.random() * 0.4 - 0.2)) * 10) / 10))
          : 1;

        const hasTechIssue = ran && Math.random() < config.techIssueProb;

        await prisma.dailyEntry.create({
          data: {
            schoolId: config.school.id,
            date: dateStr,
            studentsPresent: students,
            sessionRan: ran,
            sessionDurationMins: ran ? 45 : null,
            engagementLevel: Math.round(eng),
            contentCompleted: ran ? `Module ${14 - offset}: Digital Circuits & Logic Gates` : null,
            technicalIssues: !ran ? 'Lab locked / Generator failure' : (hasTechIssue ? config.techMsg : null),
            notes: ran ? 'Students completed hands-on simulation in pairs.' : 'Session cancelled due to power outage.',
            isExperimentDay: isExp,
            submittedById: config.user.id,
          },
        });
      }
    }
  }

  console.log('Database seeding complete!');
}

function getDateOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

if (process.argv[1]?.includes('seed')) {
  seedDatabase()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
