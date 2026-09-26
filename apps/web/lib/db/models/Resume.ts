/**
 * Resume Model - MongoDB Schema
 * Stores saved resume versions with metadata
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  companyName?: string;
  tags: string[];
  filename: string;

  // Resume content
  sections: {
    id: string;
    name: string;
    content: string;
  }[];

  // Metadata
  pdfUrl?: string;
  matchScore?: number;
  jdInsights?: any; // Store JD insights used

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    jobTitle: {
      type: String,
    },
    companyName: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    filename: {
      type: String,
      required: true,
    },
    sections: [
      {
        id: String,
        name: String,
        content: String,
      },
    ],
    pdfUrl: {
      type: String,
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    jdInsights: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
ResumeSchema.index({ userId: 1, createdAt: -1 });
ResumeSchema.index({ userId: 1, companyName: 1 });
ResumeSchema.index({ userId: 1, tags: 1 });

// Virtual for full name
ResumeSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

export default mongoose.models.Resume || mongoose.model<IResume>('Resume', ResumeSchema);
