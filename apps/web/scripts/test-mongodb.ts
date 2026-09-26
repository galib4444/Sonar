/**
 * MongoDB Connection Test Script
 * Run with: npx tsx scripts/test-mongodb.ts
 */

import { connectDB } from '../lib/db/mongodb';
import User from '../lib/db/models/User';
import UserProfile from '../lib/db/models/UserProfile';
import Application from '../lib/db/models/Application';

async function testMongoDBConnection() {
  try {
    console.log('🔄 Testing MongoDB connection...\n');

    // Test connection
    await connectDB();
    console.log('✅ Successfully connected to MongoDB\n');

    // Test collections exist
    const db = (await connectDB()).connection.db;
    if (db) {
      const collections = await db.listCollections().toArray();
      console.log('📋 Available collections:');
      collections.forEach((col) => {
        console.log(`   - ${col.name}`);
      });
      console.log('');
    }

    // Test models are registered
    console.log('📦 Registered models:');
    console.log(`   - User: ${User.modelName}`);
    console.log(`   - UserProfile: ${UserProfile.modelName}`);
    console.log(`   - Application: ${Application.modelName}`);
    console.log('');

    // Test database stats
    if (db) {
      const stats = await db.stats();
      console.log('📊 Database stats:');
      console.log(`   - Database: ${stats.db}`);
      console.log(`   - Collections: ${stats.collections}`);
      console.log(`   - Data size: ${(stats.dataSize / 1024).toFixed(2)} KB`);
      console.log(`   - Storage size: ${(stats.storageSize / 1024).toFixed(2)} KB`);
      console.log('');
    }

    console.log('✅ All MongoDB tests passed!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error);
    process.exit(1);
  }
}

testMongoDBConnection();
