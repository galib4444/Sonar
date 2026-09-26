/**
 * UserProfile Model
 * MongoDB schema for user resume/profile data
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserProfile extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    bullets: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    location?: string;
    graduationDate?: string;
    gpa?: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies?: string[];
    url?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date?: string;
    url?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema = new Schema<IUserProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: String,
    location: String,
    summary: String,
    skills: {
      type: [String],
      default: [],
    },
    experience: [
      {
        title: { type: String, required: true },
        company: { type: String, required: true },
        location: String,
        startDate: { type: String, required: true },
        endDate: String,
        current: { type: Boolean, default: false },
        bullets: [String],
      },
    ],
    education: [
      {
        degree: { type: String, required: true },
        institution: { type: String, required: true },
        location: String,
        graduationDate: String,
        gpa: String,
      },
    ],
    projects: [
      {
        name: String,
        description: String,
        technologies: [String],
        url: String,
      },
    ],
    certifications: [
      {
        name: String,
        issuer: String,
        date: String,
        url: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in development
const UserProfile: Model<IUserProfile> =
  mongoose.models.UserProfile || mongoose.model<IUserProfile>('UserProfile', UserProfileSchema);

export default UserProfile;
