# FOCUSYNC - MongoDB Setup Guide

## Prerequisites
Before activating login and signup functionality, you need to set up MongoDB. Choose one of the options below:

---

## Option 1: MongoDB Local Installation (Recommended for Development)

### For Windows:

1. **Download MongoDB Community Edition**
   - Visit: https://www.mongodb.com/try/download/community
   - Select Windows
   - Download MSI installer

2. **Install MongoDB**
   - Run the MSI installer
   - Choose "Complete" installation
   - Select "Install MongoDB as a Service"
   - Click Install

3. **Verify Installation**
   - Open PowerShell and run:
   ```powershell
   mongod --version
   ```

4. **Start MongoDB Service**
   - MongoDB should start automatically as a Windows service
   - To manually start it, run:
   ```powershell
   mongod
   ```

5. **Test Connection**
   - Open another terminal and run:
   ```
   mongosh
   ```
   - You should see a MongoDB shell prompt

---

## Option 2: MongoDB Atlas (Cloud - No Installation Required)

### Steps:

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Click "Try Free" or sign up

2. **Create a Cluster**
   - Sign up and follow the guided setup
   - Create a free M0 cluster (0.5GB storage)

3. **Get Connection String**
   - In Atlas Dashboard, click "Connect"
   - Select "Connect with Drivers"
   - Copy the connection string

4. **Update .env File**
   - Open `backend/.env`
   - Replace:
   ```
   MONGO_URI=mongodb://localhost:27017/focusync
   ```
   - With your Atlas connection string:
   ```
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/focusync?retryWrites=true&w=majority
   ```

5. **Restart Backend Server**
   ```
   cd backend
   node server.js
   ```

---

## Testing Login & Signup

Once MongoDB is running:

1. **Frontend Dev Server** (should already be running):
   - http://localhost:3000

2. **Backend Server**:
   ```
   cd backend
   node server.js
   ```

3. **Test Signup**:
   - Go to http://localhost:3000/signup
   - Create an account with:
     - Username (at least 3 characters)
     - Email (valid email format)
     - Password (at least 6 characters)
   - Click "Sign up"
   - Should redirect to onboarding page

4. **Test Login**:
   - Go to http://localhost:3000/login
   - Enter your email and password
   - Click "Login"
   - Should redirect to dashboard

---

## Troubleshooting

**Error: "MongooseServerSelectionError: connect ECONNREFUSED"**
- Solution: MongoDB is not running. Start it using `mongod` command.

**Error: "Email or username already exists"**
- Solution: This email/username is already registered. Use a different one for signup.

**Error: "Invalid credentials"**
- Solution: Check your email and password during login.

**Port 5000 already in use**
- Solution: Change PORT in `backend/.env` or kill the process using port 5000:
  ```powershell
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  ```

---

## Features Activated

✅ User Signup with validation (username, email, password)
✅ User Login with JWT authentication
✅ Automatic redirect to Onboarding after signup
✅ Token stored in localStorage
✅ Theme selection in Onboarding
✅ Dashboard access after login
✅ Current Affairs based on user's goal
✅ Focus Timer functionality
✅ Task and Analytics pages (placeholder)

---

## Next Steps

After completing login/signup setup:

1. **Implement Task Management**
   - Create, read, update, delete tasks
   - Priority levels and tags
   - Due dates

2. **Add Analytics Dashboard**
   - Focus hours per day
   - Tasks completed
   - Streak tracking

3. **Implement Focus Session Persistence**
   - Save session data to backend
   - Track session history

4. **Add Settings Page**
   - Allow users to change goals/themes
   - Profile management
