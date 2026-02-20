/**
 * Database Seed Script - DEVELOPMENT ONLY
 *
 * WARNING: This file contains default passwords for development/testing.
 * DO NOT use these credentials in production.
 * DO NOT run this script in production environments.
 *
 * Default credentials (DEVELOPMENT ONLY):
 * - Admin: admin@dentalclinic.com / admin123
 * - User: dentist@dentalclinic.com / user123
 */

import { PrismaClient } from '../node_modules/.prisma/client/index.js';
import config from '../prisma.config.js';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

const connectionString = config.datasource?.url || process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 12;

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (in development only)
  if (process.env.NODE_ENV !== 'production') {
    console.log('🧹 Clearing existing data...');
    await prisma.chatMessage.deleteMany();
    await prisma.patient.deleteMany();
    await prisma.user.deleteMany();
  }

  // Create admin user
  console.log('👤 Creating admin user...');
  const adminPasswordHash = await bcrypt.hash('admin123', SALT_ROUNDS);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dentalclinic.com' },
    update: {},
    create: {
      email: 'admin@dentalclinic.com',
      passwordHash: adminPasswordHash,
      fullName: 'Admin User',
      role: 'admin',
      isActive: true,
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // Create regular user
  console.log('👤 Creating regular user...');
  const userPasswordHash = await bcrypt.hash('user123', SALT_ROUNDS);
  const user = await prisma.user.upsert({
    where: { email: 'dentist@dentalclinic.com' },
    update: {},
    create: {
      email: 'dentist@dentalclinic.com',
      passwordHash: userPasswordHash,
      fullName: 'Dr. Sarah Johnson',
      role: 'user',
      isActive: true,
    },
  });
  console.log(`✅ Regular user created: ${user.email}`);

  // Create sample patients
  console.log('🦷 Creating sample patients...');

  const patient1 = await prisma.patient.create({
    data: {
      userId: user.id,
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+1 (555) 123-4567',
      dateOfBirth: new Date('1985-06-15'),
      medicalNotes: 'No known allergies. Last checkup: 3 months ago. Regular cleanings every 6 months.',
    },
  });
  console.log(`✅ Patient created: ${patient1.name}`);

  const patient2 = await prisma.patient.create({
    data: {
      userId: user.id,
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      phone: '+1 (555) 234-5678',
      dateOfBirth: new Date('1992-03-22'),
      medicalNotes: 'Allergic to penicillin. Requires pre-medication for cleanings. Sensitive to cold.',
    },
  });
  console.log(`✅ Patient created: ${patient2.name}`);

  const patient3 = await prisma.patient.create({
    data: {
      userId: user.id,
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      phone: '+1 (555) 345-6789',
      dateOfBirth: new Date('1978-11-08'),
      medicalNotes: 'History of gum disease. Requires deep cleaning every 4 months. Currently on blood thinners.',
    },
  });
  console.log(`✅ Patient created: ${patient3.name}`);

  // Create sample chat messages
  console.log('💬 Creating sample chat messages...');

  await prisma.chatMessage.create({
    data: {
      patientId: patient1.id,
      userId: user.id,
      role: 'user',
      content: 'What should I do if I experience sensitivity after my cleaning?',
    },
  });

  await prisma.chatMessage.create({
    data: {
      patientId: patient1.id,
      userId: user.id,
      role: 'assistant',
      content: "It's normal to experience some sensitivity after a dental cleaning. Here are some tips:\n\n1. Use a soft-bristled toothbrush and brush gently\n2. Try a toothpaste designed for sensitive teeth\n3. Avoid very hot or cold foods/drinks for a few days\n4. The sensitivity should subside within a week\n\nIf it persists beyond a week or becomes severe, please contact the clinic immediately.",
      metadata: {
        tokenUsage: 150,
        model: 'gemini-1.5-flash',
        emergencyDetected: false,
      },
    },
  });

  await prisma.chatMessage.create({
    data: {
      patientId: patient2.id,
      userId: user.id,
      role: 'user',
      content: 'How often should I floss?',
    },
  });

  await prisma.chatMessage.create({
    data: {
      patientId: patient2.id,
      userId: user.id,
      role: 'assistant',
      content: "Flossing is crucial for maintaining good oral health! Here's what we recommend:\n\n• Floss at least once per day, preferably before bedtime\n• It removes plaque and food particles between teeth where brushing can't reach\n• Proper flossing helps prevent gum disease and cavities\n\nTip: If traditional flossing is difficult, consider using floss picks or a water flosser as alternatives!",
      metadata: {
        tokenUsage: 120,
        model: 'gemini-1.5-flash',
        emergencyDetected: false,
      },
    },
  });

  console.log('✅ Sample chat messages created');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: ${await prisma.user.count()}`);
  console.log(`   - Patients: ${await prisma.patient.count()}`);
  console.log(`   - Chat Messages: ${await prisma.chatMessage.count()}`);
  console.log('\n🔐 Test credentials:');
  console.log('   Admin: admin@dentalclinic.com / admin123');
  console.log('   User: dentist@dentalclinic.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
