# 🐛 Login Debugging Guide

Console logs have been added throughout the login flow to help identify issues.

## 📍 Where to Look

### Browser Console (F12)

- Open your browser
- Press **F12** to open DevTools
- Go to **Console** tab
- Try logging in

### Terminal/Server Console

- Check your terminal where `npm run dev` is running
- API logs will appear here

---

## ✅ Expected Flow (Success)

When login works correctly, you should see this sequence:

### In Browser Console:

```
🔵 [LOGIN PAGE] Form submitted
📧 Email: test@example.com
🔑 Password length: 8
🚀 [LOGIN PAGE] Calling login function...
🔵 [AUTH CONTEXT] Login function called
📧 Email: test@example.com
🌐 [AUTH CONTEXT] Sending request to /api/auth/login...
📡 [AUTH CONTEXT] Response status: 200
📡 [AUTH CONTEXT] Response ok: true
✅ [AUTH CONTEXT] Login successful, data: {message: 'Login successful', token: '...', user: {...}}
🎫 [AUTH CONTEXT] Token: eyJhbGciOiJIUzI1NiIs...
💾 [AUTH CONTEXT] Token saved to localStorage
👤 [AUTH CONTEXT] User set: {id: '...', name: 'Test User', email: 'test@example.com', role: 'user'}
🔀 [AUTH CONTEXT] Redirecting to /dashboard...
✅ [LOGIN PAGE] Login successful!
🏁 [LOGIN PAGE] Login attempt completed
```

### In Terminal (Server Console):

```
🔵 [API LOGIN] Request received
🔌 [API LOGIN] Connecting to database...
✅ [API LOGIN] Database connected
📧 [API LOGIN] Email: test@example.com
🔑 [API LOGIN] Password provided: true
🔍 [API LOGIN] Looking up user...
✅ [API LOGIN] User found: test@example.com
🔐 [API LOGIN] Verifying password...
✅ [API LOGIN] Password verified
🎫 [API LOGIN] Generating token...
✅ [API LOGIN] Token generated
✅ [API LOGIN] Login successful for: test@example.com
```

---

## 🚨 Common Error Patterns

### 1. MongoDB Connection Error

**Symptoms in Terminal:**

```
🔵 [API LOGIN] Request received
🔌 [API LOGIN] Connecting to database...
💥 [API LOGIN] Server error: MongooseServerSelectionError...
```

**Solution:**

- MongoDB is not running
- Start MongoDB service:
  ```powershell
  Start-Service MongoDB
  ```
- Or verify in MongoDB Compass

---

### 2. User Not Found

**Symptoms in Terminal:**

```
🔍 [API LOGIN] Looking up user...
❌ [API LOGIN] User not found: test@example.com
```

**Symptoms in Browser:**

```
📡 [AUTH CONTEXT] Response status: 401
❌ [AUTH CONTEXT] Login failed: {error: 'Invalid credentials'}
❌ [LOGIN PAGE] Login failed: Error: Invalid credentials
```

**Solution:**

- User doesn't exist in database
- Register the account first at `/register`
- Or check email spelling

---

### 3. Wrong Password

**Symptoms in Terminal:**

```
✅ [API LOGIN] User found: test@example.com
🔐 [API LOGIN] Verifying password...
❌ [API LOGIN] Invalid password
```

**Symptoms in Browser:**

```
📡 [AUTH CONTEXT] Response status: 401
❌ [AUTH CONTEXT] Login failed: {error: 'Invalid credentials'}
```

**Solution:**

- Password is incorrect
- Try password reset or use correct password

---

### 4. Network/API Error

**Symptoms in Browser:**

```
🌐 [AUTH CONTEXT] Sending request to /api/auth/login...
💥 [AUTH CONTEXT] Unexpected error: TypeError: Failed to fetch
```

**Solution:**

- API route not accessible
- Check if dev server is running: `npm run dev`
- Check URL is correct: `http://localhost:3000`

---

### 5. JWT Secret Missing

**Symptoms in Terminal:**

```
🎫 [API LOGIN] Generating token...
💥 [API LOGIN] Server error: Error: JWT_SECRET not defined
```

**Solution:**

- `.env.local` file missing or JWT_SECRET not set
- Create `.env.local` with:
  ```env
  JWT_SECRET=your-generated-secret-here
  ```
- Generate secret:
  ```powershell
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```

---

### 6. Redirect Not Working

**Symptoms in Browser:**

```
✅ [AUTH CONTEXT] Login successful
💾 [AUTH CONTEXT] Token saved to localStorage
👤 [AUTH CONTEXT] User set: {...}
🔀 [AUTH CONTEXT] Redirecting to /dashboard...
(But stays on login page)
```

**Solution:**

- Router issue or `/dashboard` doesn't exist
- Check that dashboard route exists
- Check for JavaScript errors in console

---

## 📊 Icon Legend

| Icon | Meaning                |
| ---- | ---------------------- |
| 🔵   | Process started        |
| 📧   | Email information      |
| 🔑   | Password info          |
| 🚀   | Action initiated       |
| 🌐   | Network request        |
| 📡   | Response received      |
| 🔌   | Connecting to database |
| 🔍   | Looking up data        |
| 🔐   | Verifying password     |
| 🎫   | Token generation       |
| ✅   | Success                |
| ❌   | Error/failure          |
| 💾   | Data saved             |
| 👤   | User data              |
| 🔀   | Navigation/redirect    |
| 💥   | Unexpected error       |
| 🏁   | Process completed      |

---

## 🔍 How to Use This Guide

1. **Before testing**: Clear browser console (right-click → Clear console)
2. **Start fresh**: Make sure terminal is visible
3. **Try login**: Enter credentials and submit
4. **Compare logs**: Match your output with patterns above
5. **Find where it stops**: Last log before error shows the problem
6. **Use solution**: Apply the fix for that specific error pattern

---

## 💡 Pro Tips

### Clear Everything and Start Fresh:

```javascript
// In Browser Console:
localStorage.clear();
location.reload();
```

### Check Current Token:

```javascript
// In Browser Console:
console.log(localStorage.getItem('token'));
```

### Test API Directly:

```powershell
# In PowerShell:
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"test123\"}'
```

---

## 🎯 Quick Checklist

Before debugging, verify:

- [ ] MongoDB is running (`Get-Service MongoDB`)
- [ ] Dev server is running (`npm run dev`)
- [ ] `.env.local` exists with JWT_SECRET
- [ ] User account exists in database
- [ ] Browser console is open (F12)
- [ ] Terminal is visible

---

Happy debugging! 🐛🔨
