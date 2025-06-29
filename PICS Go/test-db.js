const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
    console.log('🔍 Testing MongoDB connection...\n');
    
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pics-go';
    console.log('📡 Connection string:', mongoURI.replace(/\/\/.*@/, '//***:***@'));
    
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('✅ MongoDB connection successful!');
        console.log('🎉 Your database is ready to use.');
        
        // Test creating a simple document
        const TestModel = mongoose.model('Test', new mongoose.Schema({ name: String }));
        await TestModel.create({ name: 'test' });
        await TestModel.deleteOne({ name: 'test' });
        console.log('✅ Database write/delete operations working!');
        
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        console.log('\n🔧 Troubleshooting steps:');
        
        if (error.message.includes('ECONNREFUSED')) {
            console.log('1. MongoDB is not running');
            console.log('   - Install MongoDB: https://www.mongodb.com/try/download/community');
            console.log('   - Or use MongoDB Atlas: https://www.mongodb.com/atlas');
        } else if (error.message.includes('Authentication failed')) {
            console.log('1. Check your username and password in the connection string');
            console.log('2. Make sure the database user has proper permissions');
        } else if (error.message.includes('ENOTFOUND')) {
            console.log('1. Check your connection string format');
            console.log('2. Verify the cluster name and hostname');
        }
        
        console.log('\n📖 See MONGODB_SETUP.md for detailed instructions');
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

testConnection(); 