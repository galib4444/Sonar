/**
 * Application Model
 * MongoDB schema for job applications tracking
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IApplication extends Document {
  userId: mongoose.Types.ObjectId;
  jobTitle: string;
  company: string;
  jobDescription: string;
  matchScore: number;
  status: 'saved' | 'applied' | 'interviewing' | 'offered' | 'rejected';
  appliedDate?: Date;
  resumeUrl?: string;
  coverLetterUrl?: string;
  notes?: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  jdInsights?: {
    skills?: string[];
    mustHaves?: string[];
    seniority?: string;
    keywords?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company is required'],
      trim: true,
    },
    jobDescription: {
      type: String,
      required: [true, 'Job description is required'],
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    status: {
      type: String,
      enum: ['saved', 'applied', 'interviewing', 'offered', 'rejected'],
      default: 'saved',
    },
    appliedDate: {
      type: Date,
    },
    resumeUrl: {
      type: String,
    },
    coverLetterUrl: {
      type: String,
    },
    notes: {
      type: String,
    },
    salary: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'USD',
      },
    },
    jdInsights: {
      skills: [String],
      mustHaves: [String],
      seniority: String,
      keywords: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
ApplicationSchema.index({ userId: 1, createdAt: -1 });
ApplicationSchema.index({ userId: 1, status: 1 });
ApplicationSchema.index({ userId: 1, matchScore: -1 });

// Prevent model recompilation in development
const Application: Model<IApplication> =
  mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);

export default Application;
