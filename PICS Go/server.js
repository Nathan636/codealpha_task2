const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Data storage files
const USERS_FILE = 'data/users.json';
const POSTS_FILE = 'data/posts.json';
const COMMENTS_FILE = 'data/comments.json';

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Initialize data files if they don't exist
const initializeDataFiles = () => {
    const files = [
        { path: USERS_FILE, default: [] },
        { path: POSTS_FILE, default: getSamplePosts() },
        { path: COMMENTS_FILE, default: [] }
    ];

    files.forEach(file => {
        if (!fs.existsSync(file.path)) {
            fs.writeFileSync(file.path, JSON.stringify(file.default, null, 2));
        }
    });
};

// Generate sample posts for the landing page
const getSamplePosts = () => {
    const sampleUsers = [
        { id: 'sample1', username: 'Photographer_Pro', profilePicture: 'https://picsum.photos/40/40?random=1' },
        { id: 'sample2', username: 'Travel_Lens', profilePicture: 'https://picsum.photos/40/40?random=2' },
        { id: 'sample3', username: 'Art_Collector', profilePicture: 'https://picsum.photos/40/40?random=3' },
        { id: 'sample4', username: 'Nature_Shots', profilePicture: 'https://picsum.photos/40/40?random=4' },
        { id: 'sample5', username: 'Urban_Explorer', profilePicture: 'https://picsum.photos/40/40?random=5' }
    ];

    return [
        {
            id: 'sample1',
            userId: 'sample1',
            image: 'https://picsum.photos/600/400?random=1',
            caption: 'Amazing sunset captured today! Nature never fails to amaze me. 🌅 #photography #sunset #nature',
            tags: ['photography', 'sunset', 'nature'],
            location: 'Beach View',
            likes: [],
            comments: [],
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        },
        {
            id: 'sample2',
            userId: 'sample2',
            image: 'https://picsum.photos/600/400?random=2',
            caption: 'Exploring the hidden gems of the city today. Every corner has a story to tell! 📸 #travel #city #exploration',
            tags: ['travel', 'city', 'exploration'],
            location: 'Downtown',
            likes: [],
            comments: [],
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() // 5 hours ago
        },
        {
            id: 'sample3',
            userId: 'sample3',
            image: 'https://picsum.photos/600/400?random=3',
            caption: 'Street art that speaks volumes. The colors and emotions in this piece are incredible! 🎨 #streetart #urban #culture',
            tags: ['streetart', 'urban', 'culture'],
            location: 'Arts District',
            likes: [],
            comments: [],
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
        },
        {
            id: 'sample4',
            userId: 'sample4',
            image: 'https://picsum.photos/600/400?random=4',
            caption: 'Mountain peaks covered in snow. The silence up here is absolutely magical! 🏔️ #mountains #winter #peace',
            tags: ['mountains', 'winter', 'peace'],
            location: 'Alpine Peak',
            likes: [],
            comments: [],
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
        },
        {
            id: 'sample5',
            userId: 'sample5',
            image: 'https://picsum.photos/600/400?random=5',
            caption: 'City lights at night create such a beautiful symphony of colors! 🌃 #citylights #night #urban',
            tags: ['citylights', 'night', 'urban'],
            location: 'City Center',
            likes: [],
            comments: [],
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
        }
    ];
};

initializeDataFiles();

// Data helper functions
const readData = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const writeData = (filePath, data) => {
    try {
        console.log(`Writing data to ${filePath}:`, JSON.stringify(data, null, 2));
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`Successfully wrote data to ${filePath}`);
    } catch (error) {
        console.error(`Error writing to ${filePath}:`, error);
        throw error;
    }
};

// Generate unique IDs
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token is not valid' });
        }
        req.user = user;
        next();
    });
};

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Routes

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
    try {
        console.log('Registration request received:', { 
            username: req.body.username, 
            email: req.body.email,
            hasPassword: !!req.body.password 
        });

        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            console.log('Missing required fields');
            return res.status(400).json({ message: 'All fields are required' });
        }

        const users = readData(USERS_FILE);

        // Check if user already exists
        const existingUser = users.find(user => 
            user.email === email || user.username === username
        );

        if (existingUser) {
            console.log('User already exists:', { email, username });
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = {
            id: generateId(),
            username,
            email,
            password: hashedPassword,
            profilePicture: '/uploads/default-avatar.svg',
            bio: '',
            followers: [],
            following: [],
            posts: [],
            likedPosts: [],
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        writeData(USERS_FILE, users);

        console.log('User created successfully:', { id: newUser.id, username, email });

        // Create JWT token
        const token = jwt.sign(
            { userId: newUser.id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        // Return user data without password
        const { password: _, ...userData } = newUser;
        
        const responseData = { token, user: userData };
        console.log('Sending registration response:', JSON.stringify(responseData, null, 2));
        
        // Set proper headers
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(responseData);
        
        console.log('Registration response sent successfully');
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const users = readData(USERS_FILE);
        const user = users.find(u => u.email === email);

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        // Return user data without password
        const { password: _, ...userData } = user;
        res.json({ token, user: userData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
    try {
        const users = readData(USERS_FILE);
        const user = users.find(u => u.id === req.user.userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { password: _, ...userData } = user;
        res.json(userData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// User routes
app.get('/api/users/profile/:id', (req, res) => {
    try {
        const users = readData(USERS_FILE);
        const posts = readData(POSTS_FILE);
        
        const user = users.find(u => u.id === req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userPosts = posts.filter(post => post.userId === req.params.id);
        const { password: _, ...userData } = user;

        res.json({
            user: userData,
            posts: userPosts
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/users/profile', authenticateToken, (req, res) => {
    try {
        const { username, bio, profilePicture } = req.body;
        const users = readData(USERS_FILE);
        
        const userIndex = users.findIndex(u => u.id === req.user.userId);
        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (username) users[userIndex].username = username;
        if (bio !== undefined) users[userIndex].bio = bio;
        if (profilePicture) users[userIndex].profilePicture = profilePicture;

        writeData(USERS_FILE, users);
        
        const { password: _, ...userData } = users[userIndex];
        res.json(userData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/users/follow/:id', authenticateToken, (req, res) => {
    try {
        const users = readData(USERS_FILE);
        
        if (req.params.id === req.user.userId) {
            return res.status(400).json({ message: 'You cannot follow yourself' });
        }

        const currentUserIndex = users.findIndex(u => u.id === req.user.userId);
        const userToFollowIndex = users.findIndex(u => u.id === req.params.id);

        if (currentUserIndex === -1 || userToFollowIndex === -1) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if already following
        if (users[currentUserIndex].following.includes(req.params.id)) {
            return res.status(400).json({ message: 'Already following this user' });
        }

        // Add to following
        users[currentUserIndex].following.push(req.params.id);
        users[userToFollowIndex].followers.push(req.user.userId);

        writeData(USERS_FILE, users);
        res.json({ message: 'User followed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/users/suggestions', authenticateToken, (req, res) => {
    try {
        const users = readData(USERS_FILE);
        const currentUser = users.find(u => u.id === req.user.userId);
        
        const suggestions = users.filter(user => 
            user.id !== req.user.userId && 
            !currentUser.following.includes(user.id)
        ).slice(0, 5);

        const suggestionsData = suggestions.map(user => ({
            _id: user.id,
            username: user.username,
            profilePicture: user.profilePicture,
            bio: user.bio
        }));

        res.json(suggestionsData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Post routes
app.get('/api/posts/public', (req, res) => {
    try {
        const users = readData(USERS_FILE);
        const posts = readData(POSTS_FILE);
        
        const publicPosts = posts
            .map(post => {
                const user = users.find(u => u.id === post.userId);
                return {
                    ...post,
                    _id: post.id,
                    user: user ? {
                        _id: user.id,
                        username: user.username,
                        profilePicture: user.profilePicture
                    } : null
                };
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10); // Show only latest 10 posts

        res.json(publicPosts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/posts', authenticateToken, (req, res) => {
    try {
        const users = readData(USERS_FILE);
        const posts = readData(POSTS_FILE);
        const comments = readData(COMMENTS_FILE);
        
        const currentUser = users.find(u => u.id === req.user.userId);
        const followingIds = [...currentUser.following, req.user.userId];

        const feedPosts = posts
            .filter(post => followingIds.includes(post.userId))
            .map(post => {
                const user = users.find(u => u.id === post.userId);
                const postComments = comments.filter(c => c.postId === post.id);
                
                return {
                    ...post,
                    _id: post.id,
                    user: {
                        _id: user.id,
                        username: user.username,
                        profilePicture: user.profilePicture
                    },
                    comments: postComments.map(comment => ({
                        ...comment,
                        _id: comment.id,
                        user: {
                            _id: comment.userId,
                            username: users.find(u => u.id === comment.userId)?.username,
                            profilePicture: users.find(u => u.id === comment.userId)?.profilePicture
                        }
                    }))
                };
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json(feedPosts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/posts', authenticateToken, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Image is required' });
        }

        const { caption, tags, location } = req.body;
        const posts = readData(POSTS_FILE);
        const users = readData(USERS_FILE);

        const newPost = {
            id: generateId(),
            userId: req.user.userId,
            image: `/uploads/${req.file.filename}`,
            caption: caption || '',
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            location: location || '',
            likes: [],
            comments: [],
            createdAt: new Date().toISOString()
        };

        posts.push(newPost);
        writeData(POSTS_FILE, posts);

        // Add post to user's posts array
        const userIndex = users.findIndex(u => u.id === req.user.userId);
        if (userIndex !== -1) {
            users[userIndex].posts.push(newPost.id);
            writeData(USERS_FILE, users);
        }

        // Return post with user info
        const user = users.find(u => u.id === req.user.userId);
        const postWithUser = {
            ...newPost,
            _id: newPost.id,
            user: {
                _id: user.id,
                username: user.username,
                profilePicture: user.profilePicture
            }
        };

        res.json(postWithUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/posts/:id/like', authenticateToken, (req, res) => {
    try {
        const posts = readData(POSTS_FILE);
        const postIndex = posts.findIndex(p => p.id === req.params.id);

        if (postIndex === -1) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const likeIndex = posts[postIndex].likes.indexOf(req.user.userId);

        if (likeIndex > -1) {
            // Unlike
            posts[postIndex].likes.splice(likeIndex, 1);
        } else {
            // Like
            posts[postIndex].likes.push(req.user.userId);
        }

        writeData(POSTS_FILE, posts);
        res.json({ likes: posts[postIndex].likes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Comment routes
app.post('/api/comments', authenticateToken, (req, res) => {
    try {
        const { content, postId } = req.body;
        const comments = readData(COMMENTS_FILE);
        const posts = readData(POSTS_FILE);
        const users = readData(USERS_FILE);

        if (!content || !postId) {
            return res.status(400).json({ message: 'Content and postId are required' });
        }

        const post = posts.find(p => p.id === postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const newComment = {
            id: generateId(),
            userId: req.user.userId,
            postId,
            content,
            likes: [],
            replies: [],
            createdAt: new Date().toISOString()
        };

        comments.push(newComment);
        writeData(COMMENTS_FILE, comments);

        // Add comment to post
        const postIndex = posts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
            posts[postIndex].comments.push(newComment.id);
            writeData(POSTS_FILE, posts);
        }

        // Return comment with user info
        const user = users.find(u => u.id === req.user.userId);
        const commentWithUser = {
            ...newComment,
            _id: newComment.id,
            user: {
                _id: user.id,
                username: user.username,
                profilePicture: user.profilePicture
            }
        };

        res.json(commentWithUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-registration.html'));
});

app.get('/debug', (req, res) => {
    res.sendFile(path.join(__dirname, 'debug-registration.html'));
});

app.get('/simple', (req, res) => {
    res.sendFile(path.join(__dirname, 'simple-test.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Open http://localhost:${PORT} in your browser`);
    console.log(`💾 Using file-based storage (no MongoDB required!)`);
}); 