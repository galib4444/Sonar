/**
 * MongoDB Connection Utility
 * Handles connection pooling and ensures single instance
 */

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// Allow development without MongoDB
const isDev = process.env.NODE_ENV !== 'production';
const allowWithoutMongoDB = isDev && !MONGODB_URI;

if (!MONGODB_URI && !allowWithoutMongoDB) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: CachedConnection | undefined;
}

const cached: CachedConnection = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectDB() {
  // Return null if MongoDB is not configured (development mode)
  if (!MONGODB_URI) {
    console.log('⚠️  MongoDB not configured - running in local-only mode');
    return null;
  }

  if (cached.conn) {
    console.log('✅ Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    console.log('🔄 Creating new MongoDB connection...');
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log('✅ MongoDB connected successfully');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ MongoDB connection error:', e);
    throw e;
  }

  return cached.conn;
}

export default connectDB;
