# 🚀 Quick Start - Authentication Setup

## ⚡ 3-Minute Setup

### 1️⃣ Install Dependencies (30 seconds)

```bash
cd Hustler_AI_V2
npm install mongoose bcryptjs jsonwebtoken @types/bcryptjs @types/jsonwebtoken
```

### 2️⃣ Setup MongoDB (2 minutes)

**Option A: Local (Development)**

```bash
# macOS:
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Windows: Download & install from
# https://www.mongodb.com/try/download/community

# Linux:
sudo apt-get install mongodb-org
sudo systemctl start mongod
```

**Option B: Cloud (Production)**

- Go to https://www.mongodb.com/cloud/atlas
- Create free account + cluster (M0 free tier)
- Get connection string

### 3️⃣ Create .env.local (30 seconds)

```bash
# Create file:
touch .env.local

# Add these lines:
MONGODB_URI=mongodb://localhost:27017/hustler_ai
JWT_SECRET=run-this-command-in-terminal-to-generate
GEMINI_API_KEY=your-existing-key
```

**Generate JWT Secret:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copy output and paste as JWT_SECRET value
```

### 4️⃣ Start & Test (30 seconds)

```bash
npm run dev
```

Visit: http://localhost:3000

---

## ✅ Test Checklist

- [ ] Landing page loads at `/`
- [ ] Click "Get Started" → Register page
- [ ] Create account (any email/password)
- [ ] Auto-redirect to `/dashboard` ✨
- [ ] See navigation bar with your name
- [ ] Click "Logout" → Back to landing page
- [ ] Try accessing `/dashboard` → Redirects to login

---

## 📋 MongoDB Setup Commands (Copy & Paste)

### macOS

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
mongosh  # Test connection
```

### Windows (PowerShell as Admin)

```powershell
# Download installer from: https://www.mongodb.com/try/download/community
# Or with Chocolatey:
choco install mongodb

# Start service:
net start MongoDB
```

### Linux (Ubuntu/Debian)

```bash
# Import MongoDB GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add MongoDB repo
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start
sudo systemctl start mongod
sudo systemctl enable mongod

# Test
mongosh
```

---

## 🆘 Troubleshooting

### MongoDB won't connect?

```bash
# Check if MongoDB is running:
mongosh

# If it fails, start MongoDB:
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
# Windows: net start MongoDB
```

### "Module not found" errors?

```bash
# Reinstall dependencies:
npm install mongoose bcryptjs jsonwebtoken @types/bcryptjs @types/jsonwebtoken
```

### "JWT_SECRET is not defined"?

```bash
# Generate secret:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Add to .env.local:
JWT_SECRET=paste-generated-secret-here
```

### Can't access dashboard after login?

```bash
# Clear localStorage:
# Open browser console (F12) and run:
localStorage.clear()
# Then register again
```

---

## 📖 Full Documentation

- **Detailed Setup**: `AUTH_SETUP_GUIDE.md`
- **Implementation Summary**: `AUTH_IMPLEMENTATION_SUMMARY.md`
- **This Quick Start**: `QUICK_START.md`

---

## 🎯 What You Get

✅ Complete JWT authentication
✅ User registration & login
✅ Protected routes & API endpoints
✅ Public landing page
✅ Dashboard with navigation
✅ MongoDB user database
✅ Rate limiting
✅ Password hashing
✅ Token verification

---

## 📞 Need Help?

1. Check `AUTH_SETUP_GUIDE.md` for detailed instructions
2. Verify `.env.local` exists and has all variables
3. Check MongoDB is running: `mongosh`
4. Check browser console (F12) for errors
5. Check terminal for server errors

---

**Total Setup Time: ~3 minutes** ⚡

Ready? Run the commands above! 🚀
