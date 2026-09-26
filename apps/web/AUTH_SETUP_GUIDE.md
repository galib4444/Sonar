# HustlerAI Authentication Setup Guide

## 🎉 Implementation Complete!

Your authentication system has been fully integrated into HustlerAI_V2. Here's what was added:

### ✅ What Was Implemented

1. **Backend Infrastructure**
   - MongoDB connection utility (`lib/auth/mongodb.ts`)
   - User model with Mongoose (`lib/models/User.ts`)
   - JWT authentication utilities (`lib/auth/auth-utils.ts`)
   - Three API endpoints:
     - `/api/auth/register` - User registration
     - `/api/auth/login` - User login
     - `/api/auth/verify` - Token verification

2. **Frontend Components**
   - Auth Context for client-side state management (`lib/auth/AuthContext.tsx`)
   - Login page (`/login`)
   - Register page (`/register`)
   - New public landing page (`/`)
   - Protected dashboard (moved from `/` to `/dashboard`)

3. **Route Protection**
   - Protected routes layout for `/dashboard`, `/tailor`, `/tracker`, `/analytics`, `/result`
   - Updated middleware to enforce authentication
   - Navigation bar with logout functionality

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies

Run this command in the `Hustler_AI_V2` directory:

```bash
npm install mongoose bcryptjs jsonwebtoken @types/bcryptjs @types/jsonwebtoken
```

### Step 2: MongoDB Setup

You have two options:

#### **Option A: Local MongoDB (Recommended for Development)**

1. **Install MongoDB Community Edition:**

   **Windows:**

   ```bash
   # Download from: https://www.mongodb.com/try/download/community
   # Or use Chocolatey:
   choco install mongodb
   ```

   **macOS:**

   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   ```

   **Linux (Ubuntu/Debian):**

   ```bash
   wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```

2. **Start MongoDB:**

   **Windows:**

   ```bash
   # MongoDB should auto-start as a service
   # Or manually:
   "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="C:\data\db"
   ```

   **macOS:**

   ```bash
   brew services start mongodb-community
   ```

   **Linux:**

   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod  # Enable on startup
   ```

3. **Verify MongoDB is Running:**

   ```bash
   # Open MongoDB shell
   mongosh

   # You should see something like:
   # Current Mongosh Log ID: ...
   # Connecting to: mongodb://127.0.0.1:27017
   # MongoDB shell version: ...
   ```

#### **Option B: MongoDB Atlas (Cloud - Recommended for Production)**

1. **Create Account:**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for a free account

2. **Create a Cluster:**
   - Click "Build a Database"
   - Choose "Free" tier (M0)
   - Select your preferred cloud provider and region
   - Click "Create Cluster"

3. **Get Connection String:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like):
     ```
     mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/
     ```
   - Replace `<password>` with your actual database password
   - Add database name: `hustler_ai`

4. **Whitelist IP:**
   - In Atlas, go to "Network Access"
   - Click "Add IP Address"
   - For development, click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production, whitelist your server's IP

### Step 3: Environment Variables

Create a `.env.local` file in the `Hustler_AI_V2` root directory:

```bash
# Create the file
touch .env.local
```

Add these variables:

```env
# MongoDB Configuration
# For Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/hustler_ai

# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/hustler_ai

# JWT Secret - CHANGE THIS to a random string!
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-long-and-random

# Existing Gemini API Key
GEMINI_API_KEY=your-gemini-api-key-here
```

**🔐 Generate a Strong JWT Secret:**

```bash
# Use this command to generate a random secret:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 4: Start the Application

```bash
cd Hustler_AI_V2
npm run dev
```

Visit: http://localhost:3000

---

## 🧪 Testing the Auth System

### 1. Test Registration

1. Go to http://localhost:3000
2. Click "Get Started" or "Sign Up"
3. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
4. Submit → Should redirect to `/dashboard`

### 2. Test Login

1. Logout from the dashboard
2. Go to http://localhost:3000/login
3. Login with:
   - Email: test@example.com
   - Password: password123
4. Should redirect to `/dashboard`

### 3. Test Protected Routes

1. Logout
2. Try to access: http://localhost:3000/dashboard
3. Should redirect to `/login`

### 4. Test API Endpoints

**Register User:**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "secure123"
  }'
```

**Login:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "secure123"
  }'
```

**Verify Token:**

```bash
# Replace YOUR_TOKEN with the token from login response
curl http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📁 File Structure Created

```
Hustler_AI_V2/
├── lib/
│   ├── auth/
│   │   ├── mongodb.ts              # MongoDB connection
│   │   ├── auth-utils.ts           # JWT & password utilities
│   │   └── AuthContext.tsx         # React auth context
│   └── models/
│       └── User.ts                 # User model
├── app/
│   ├── api/auth/
│   │   ├── register/route.ts       # Register endpoint
│   │   ├── login/route.ts          # Login endpoint
│   │   └── verify/route.ts         # Verify endpoint
│   ├── login/page.tsx              # Login page
│   ├── register/page.tsx           # Register page
│   ├── page.tsx                    # NEW: Public landing page
│   ├── dashboard/
│   │   ├── page.tsx                # MOVED: Old home page (protected)
│   │   └── layout.tsx              # Protected layout
│   └── (routes)/
│       └── layout.tsx              # Protected routes layout
├── middleware.ts                   # UPDATED: Auth middleware
└── .env.local.example             # Environment template
```

---

## 🔒 Security Features

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT tokens with 7-day expiration
- ✅ Protected API routes and pages
- ✅ Rate limiting on AI endpoints
- ✅ Authorization header support
- ✅ CORS configuration for Chrome extension

---

## 🎨 User Flow

1. **First Visit:** → Public landing page at `/`
2. **Sign Up:** → Create account at `/register` → Redirects to `/dashboard`
3. **Login:** → Login at `/login` → Redirects to `/dashboard`
4. **Protected Pages:** → `/dashboard`, `/tailor`, `/tracker`, `/analytics`, `/result`
5. **Logout:** → Click logout button → Redirects to `/`

---

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Error: "MongooseServerSelectionError: connect ECONNREFUSED"**

- MongoDB is not running
- Start MongoDB: `brew services start mongodb-community` (macOS) or `sudo systemctl start mongod` (Linux)
- For Windows, check if MongoDB service is running in Services app

**Error: "MONGODB_URI is not defined"**

- Missing `.env.local` file
- Create it in the root directory with the connection string

### JWT Issues

**Error: "Invalid token"**

- Token expired (7 days)
- JWT_SECRET changed
- Login again to get a new token

**Error: "Unauthorized"**

- Not logged in
- Token not sent correctly
- Check that token is in localStorage or Authorization header

### Build/Compile Issues

**Error: "Cannot find module 'mongoose'"**

- Dependencies not installed
- Run: `npm install mongoose bcryptjs jsonwebtoken`

**Error: "Module not found: Can't resolve '@/lib/auth/AuthContext'"**

- TypeScript paths not configured
- Restart dev server: `npm run dev`

---

## 📝 Next Steps

1. **Install dependencies** (Step 1)
2. **Set up MongoDB** (Step 2)
3. **Create .env.local** (Step 3)
4. **Test the system** (Step 4)
5. **Start building!** 🚀

---

## 🔧 Optional Enhancements

Consider adding these features later:

- [ ] Email verification
- [ ] Password reset flow
- [ ] OAuth integration (Google, GitHub)
- [ ] Role-based access control (admin vs user)
- [ ] Session management with refresh tokens
- [ ] Two-factor authentication
- [ ] User profile management
- [ ] Activity logging

---

## 📞 Support

If you run into issues:

1. Check the troubleshooting section above
2. Verify all environment variables are set
3. Check MongoDB is running: `mongosh`
4. Check browser console for errors
5. Check server logs in terminal

Happy coding! 🎉
