# MongoDB Setup Guide

## Option 1: MongoDB Atlas (Recommended - Cloud Database)

### Step 1: Create MongoDB Atlas Account
1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" and create an account
3. Choose "Free" tier (M0)

### Step 2: Create a Cluster
1. Click "Build a Database"
2. Choose "FREE" tier
3. Select a cloud provider (AWS, Google Cloud, or Azure)
4. Choose a region close to you
5. Click "Create"

### Step 3: Set Up Database Access
1. In the left sidebar, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and password (save these!)
5. Select "Read and write to any database"
6. Click "Add User"

### Step 4: Set Up Network Access
1. In the left sidebar, click "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

### Step 5: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with `pics-go`

### Step 6: Update Your .env File
Update your `.env` file with the connection string:
```env
PORT=3000
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster.mongodb.net/pics-go
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## Option 2: Local MongoDB Installation

### Step 1: Download MongoDB
1. Go to [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Download MongoDB Community Server for Windows
3. Run the installer

### Step 2: Start MongoDB Service
Open Command Prompt as Administrator and run:
```bash
net start MongoDB
```

### Step 3: Verify Installation
```bash
mongod --version
```

## Testing the Connection

After setting up either option:

1. Stop the current server (Ctrl+C)
2. Run the setup script:
   ```bash
   node setup.js
   ```
3. Start the server:
   ```bash
   npm run dev
   ```

You should see: `✅ Connected to MongoDB successfully!`

## Troubleshooting

### Common Issues:
1. **Connection refused**: MongoDB service not running
2. **Authentication failed**: Wrong username/password
3. **Network access denied**: IP not whitelisted in Atlas

### For MongoDB Atlas:
- Make sure your IP is whitelisted
- Check username and password are correct
- Ensure the cluster is running

### For Local MongoDB:
- Check if MongoDB service is running: `net start MongoDB`
- Verify installation: `mongod --version`
- Check if port 27017 is available 