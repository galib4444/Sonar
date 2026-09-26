# MongoDB Setup Guide

This document explains the MongoDB integration in HustlerAI.

## Overview

HustlerAI uses MongoDB Atlas as its database to store:
- User accounts and authentication data
- User profiles and resumes
- Job applications and tracking data

## Database Structure

### Models

All models are located in `lib/db/models/`:

#### 1. User Model (`lib/db/models/User.ts`)
Handles user authentication and account management.

**Fields:**
- `name`: User's full name
- `email`: Unique email address (used for login)
- `password`: Hashed password (using bcrypt)
- `role`: User role ('admin' | 'user')
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp

**Methods:**
- `comparePassword(candidatePassword)`: Verifies password against stored hash

**Features:**
- Automatic password hashing on save (pre-save hook)
- Password field excluded from queries by default (select: false)
- Email validation and uniqueness enforcement

#### 2. UserProfile Model (`lib/db/models/UserProfile.ts`)
Stores resume and profile data for resume generation.

**Fields:**
- `userId`: Reference to User model (one-to-one relationship)
- `name`, `email`, `phone`, `location`: Contact information
- `summary`: Professional summary
- `skills`: Array of skills
- `experience[]`: Work experience entries
  - `title`, `company`, `location`
  - `startDate`, `endDate`, `current`
  - `bullets[]`: Achievement bullet points
- `education[]`: Educational background
  - `degree`, `institution`, `location`, `graduationDate`, `gpa`
- `projects[]`: Personal/side projects
- `certifications[]`: Professional certifications

#### 3. Application Model (`lib/db/models/Application.ts`)
Tracks job applications and their status.

**Fields:**
- `userId`: Reference to User model
- `jobTitle`, `company`: Job details
- `jobDescription`: Full JD text
- `matchScore`: Calculated fit score (0-100)
- `status`: Application status ('saved' | 'applied' | 'interviewing' | 'offered' | 'rejected')
- `appliedDate`: When application was submitted
- `resumeUrl`, `coverLetterUrl`: Links to generated documents
- `notes`: User notes about application
- `salary`: Salary information (min, max, currency)
- `jdInsights`: Cached JD analysis results
  - `skills[]`, `mustHaves[]`, `seniority`, `keywords[]`

**Indexes:**
- Compound index on `(userId, createdAt)` for efficient user queries
- Compound index on `(userId, status)` for filtering by status
- Compound index on `(userId, matchScore)` for sorting by fit

## Connection Management

### Connection Utility (`lib/db/mongodb.ts`)

The connection utility implements connection pooling with caching:

```typescript
import { connectDB } from '@/lib/db';

// In API routes or server components
await connectDB();
```

**Features:**
- Singleton pattern with global caching (prevents connection spam)
- Automatic reconnection on failure
- Configurable connection options:
  - `maxPoolSize: 10` - Connection pool size
  - `serverSelectionTimeoutMS: 10000` - 10s timeout for server selection
  - `socketTimeoutMS: 45000` - 45s socket timeout
  - `bufferCommands: false` - Fail fast if not connected

**Console Output:**
- ✅ Using cached MongoDB connection (when reusing existing connection)
- 🔄 Creating new MongoDB connection... (when establishing new connection)
- ✅ MongoDB connected successfully (on successful connection)
- ❌ MongoDB connection error (on failure)

## Environment Configuration

### Required Variables

Add to `.env.local`:

```bash
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# JWT secret for authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### Getting MongoDB URI

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Click "Connect" → "Connect your application"
4. Copy connection string
5. Replace `<password>` with your database user password
6. Replace `<database>` with your database name (e.g., "hustlerai")

## Usage Examples

### Creating a New User

```typescript
import { connectDB, User } from '@/lib/db';

await connectDB();

const user = await User.create({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'securepassword', // Will be automatically hashed
  role: 'user'
});
```

### Verifying User Password

```typescript
import { connectDB, User } from '@/lib/db';

await connectDB();

const user = await User.findOne({ email: 'john@example.com' })
  .select('+password'); // Include password field

const isValid = await user.comparePassword('candidatepassword');
```

### Creating User Profile

```typescript
import { connectDB, UserProfile } from '@/lib/db';

await connectDB();

const profile = await UserProfile.create({
  userId: user._id,
  name: 'John Doe',
  email: 'john@example.com',
  skills: ['JavaScript', 'React', 'Node.js'],
  experience: [{
    title: 'Software Engineer',
    company: 'Tech Corp',
    startDate: '2020-01',
    current: true,
    bullets: [
      'Built scalable web applications',
      'Improved performance by 40%'
    ]
  }],
  education: [{
    degree: 'BS Computer Science',
    institution: 'University Name',
    graduationDate: '2020'
  }]
});
```

### Tracking Job Application

```typescript
import { connectDB, Application } from '@/lib/db';

await connectDB();

const application = await Application.create({
  userId: user._id,
  jobTitle: 'Senior Software Engineer',
  company: 'FAANG Inc',
  jobDescription: '...',
  matchScore: 85,
  status: 'applied',
  appliedDate: new Date(),
  jdInsights: {
    skills: ['React', 'TypeScript', 'AWS'],
    mustHaves: ['5+ years experience'],
    seniority: 'Senior',
    keywords: ['microservices', 'cloud', 'agile']
  }
});
```

### Querying Applications

```typescript
// Get all applications for a user, sorted by date
const applications = await Application
  .find({ userId: user._id })
  .sort({ createdAt: -1 });

// Get applications by status
const activeApplications = await Application
  .find({
    userId: user._id,
    status: { $in: ['applied', 'interviewing'] }
  })
  .sort({ matchScore: -1 }); // Sort by best fit

// Get high-match applications
const topMatches = await Application
  .find({
    userId: user._id,
    matchScore: { $gte: 80 }
  })
  .sort({ matchScore: -1 })
  .limit(10);
```

## API Integration

### Example API Route with MongoDB

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Application } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Always connect first
    await connectDB();

    // Query database
    const applications = await Application
      .find({ userId: 'user-id' })
      .sort({ createdAt: -1 });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Existing API Routes Using MongoDB

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/tracker/save` - Save job application
- `GET /api/tracker/list` - List user's applications
- `PUT /api/tracker/update` - Update application status

## Testing

### Test MongoDB Connection

Run the test script to verify your MongoDB connection:

```bash
npx tsx scripts/test-mongodb.ts
```

**Expected Output:**
```
🔄 Testing MongoDB connection...
✅ MongoDB connected successfully

📋 Available collections:
   - users
   - userprofiles
   - applications

📦 Registered models:
   - User: User
   - UserProfile: UserProfile
   - Application: Application

📊 Database stats:
   - Database: hustlerai
   - Collections: 3
   - Data size: X.XX KB
   - Storage size: X.XX KB

✅ All MongoDB tests passed!
```

## Migration from Old Structure

The codebase previously had duplicate MongoDB files:
- `lib/auth/mongodb.ts` → Now re-exports from `lib/db/mongodb.ts`
- `lib/models/User.ts` → Now re-exports from `lib/db/models/User.ts`

Old imports still work for backward compatibility but show deprecation warnings. Update to new imports:

```typescript
// Old (deprecated)
import connectDB from '@/lib/auth/mongodb';
import User from '@/lib/models/User';

// New (recommended)
import { connectDB, User } from '@/lib/db';
```

## Best Practices

1. **Always connect before queries**: Call `await connectDB()` at the start of API routes
2. **Use indexes**: Compound indexes are already set up for common queries
3. **Select password carefully**: Password is excluded by default, use `.select('+password')` when needed
4. **Handle errors**: Wrap database operations in try-catch blocks
5. **Use references**: Link related data with ObjectId references (userId fields)
6. **Validate input**: Leverage Mongoose validation rules in schemas
7. **Don't expose passwords**: Never return password field in API responses

## Security Notes

- Database credentials are stored in `.env.local` (gitignored)
- Passwords are hashed using bcrypt with salt rounds = 10
- JWT tokens expire after 7 days
- Password field is excluded from queries by default
- Email validation enforced at schema level
- Connection strings should never be committed to git

## Troubleshooting

### Connection Timeout
- Check MongoDB Atlas Network Access (whitelist your IP or allow all: 0.0.0.0/0)
- Verify connection string format is correct
- Ensure database user has correct permissions

### Authentication Failed
- Verify password is correct in connection string
- Check database user exists in MongoDB Atlas
- Ensure user has read/write permissions

### Model Not Found
- Import models from `@/lib/db` or `@/lib/db/models`
- Ensure `connectDB()` is called before using models
- Check model names match schema definitions

### Slow Queries
- Review indexes (use `.explain()` to analyze queries)
- Add compound indexes for common query patterns
- Limit result sets with `.limit()`
- Use projection to select only needed fields

## Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
