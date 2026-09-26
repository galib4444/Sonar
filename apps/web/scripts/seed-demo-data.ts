#!/usr/bin/env tsx

/**
 * Seed Demo Data Script
 * Loads demo user profiles and job descriptions for testing
 */

import fs from 'fs';
import path from 'path';

const DEMO_DIR = path.join(process.cwd(), 'public/demo-data');

interface DemoData {
  users: any[];
  jobs: any[];
}

async function main() {
  console.log('🌱 Seeding demo data...\n');

  const demoData: DemoData = {
    users: [],
    jobs: [],
  };

  // Load user profiles
  const usersDir = path.join(DEMO_DIR, 'users');
  if (fs.existsSync(usersDir)) {
    const userFiles = fs.readdirSync(usersDir).filter((f) => f.endsWith('.json'));
    console.log(`📁 Loading ${userFiles.length} user profiles...`);

    userFiles.forEach((file) => {
      const filePath = path.join(usersDir, file);
      const user = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      demoData.users.push(user);
      console.log(`   ✓ ${user.name} (${file})`);
    });
  }

  // Load job descriptions
  const jobsDir = path.join(DEMO_DIR, 'jobs');
  if (fs.existsSync(jobsDir)) {
    const jobFiles = fs.readdirSync(jobsDir).filter((f) => f.endsWith('.json'));
    console.log(`\n📋 Loading ${jobFiles.length} job descriptions...`);

    jobFiles.forEach((file) => {
      const filePath = path.join(jobsDir, file);
      const job = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      demoData.jobs.push(job);
      console.log(`   ✓ ${job.title} at ${job.company} (${file})`);
    });
  }

  // Save combined demo data
  const outputPath = path.join(DEMO_DIR, 'demo-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(demoData, null, 2));

  console.log('\n✅ Demo data seeded successfully!');
  console.log(`📊 Summary:`);
  console.log(`   - ${demoData.users.length} user profiles`);
  console.log(`   - ${demoData.jobs.length} job descriptions`);
  console.log(`\n📄 Combined data saved to: ${outputPath}`);
}

main().catch((error) => {
  console.error('❌ Error seeding demo data:', error);
  process.exit(1);
});
