const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up PICS Go Social Media Platform...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file...');
    
    const envContent = `PORT=3000
MONGODB_URI=mongodb://localhost:27017/pics-go
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully!');
} else {
    console.log('✅ .env file already exists');
}

// Check if uploads directory exists
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
    console.log('📁 Creating uploads directory...');
    fs.mkdirSync(uploadsPath);
    console.log('✅ uploads directory created successfully!');
} else {
    console.log('✅ uploads directory already exists');
}

console.log('\n🎉 Setup completed!');
console.log('\n📋 Next steps:');
console.log('1. Make sure MongoDB is running on your system');
console.log('2. Run "npm run dev" to start the development server');
console.log('3. Open http://localhost:3000 in your browser');
console.log('\n💡 For production, remember to:');
console.log('- Change the JWT_SECRET in .env file');
console.log('- Use a proper MongoDB connection string');
console.log('- Set up proper environment variables'); 