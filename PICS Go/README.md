# PICS Go - Social Media Platform

A modern social media application for sharing pictures with features like user profiles, posts, comments, likes, and follow system.

## Features

### 🔐 Authentication
- User registration and login
- JWT token-based authentication
- Secure password hashing with bcrypt

### 👤 User Profiles
- Customizable user profiles with bio and profile pictures
- Follow/unfollow system
- User search functionality
- Profile statistics (posts, followers, following)

### 📸 Posts & Media
- Image upload with support for JPG, PNG, GIF
- Post captions and tags
- Location tagging
- Post editing and deletion

### ❤️ Social Features
- Like/unlike posts
- Comment system with replies
- Real-time feed of followed users
- User suggestions for discovery

### 🎨 Modern UI/UX
- Responsive design for mobile and desktop
- Instagram-inspired interface
- Smooth animations and transitions
- Loading states and error handling

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Multer** - File upload handling
- **bcryptjs** - Password hashing

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with modern features
- **Vanilla JavaScript** - Interactivity
- **Font Awesome** - Icons

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### 1. Clone the repository
```bash
git clone <repository-url>
cd pics-go-social-media
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment setup
Create a `.env` file in the root directory:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/pics-go
JWT_SECRET=your-super-secret-jwt-key
```

### 4. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
```

### 5. Run the application
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

### 6. Access the application
Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile/:id` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/follow/:id` - Follow a user
- `DELETE /api/users/follow/:id` - Unfollow a user
- `GET /api/users/search` - Search users
- `GET /api/users/suggestions` - Get user suggestions

### Posts
- `GET /api/posts` - Get feed posts
- `POST /api/posts` - Create a new post
- `GET /api/posts/:id` - Get specific post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post
- `GET /api/posts/user/:userId` - Get user posts

### Comments
- `POST /api/comments` - Add comment
- `GET /api/comments/post/:postId` - Get post comments
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment
- `POST /api/comments/:id/like` - Like/unlike comment
- `POST /api/comments/:id/reply` - Add reply to comment

## Database Schema

### User Model
```javascript
{
  username: String (required, unique),
  email: String (required, unique),
  password: String (required, hashed),
  profilePicture: String (default avatar),
  bio: String,
  followers: [User IDs],
  following: [User IDs],
  posts: [Post IDs],
  likedPosts: [Post IDs],
  timestamps
}
```

### Post Model
```javascript
{
  user: User ID (required),
  image: String (required),
  caption: String,
  likes: [User IDs],
  comments: [Comment IDs],
  tags: [String],
  location: String,
  timestamps
}
```

### Comment Model
```javascript
{
  user: User ID (required),
  post: Post ID (required),
  content: String (required),
  likes: [User IDs],
  replies: [Reply objects],
  timestamps
}
```

## Usage Guide

### Getting Started
1. Register a new account or login with existing credentials
2. Upload a profile picture and add a bio
3. Start following other users to see their posts in your feed

### Creating Posts
1. Click on the "Add Photo" button in the create post section
2. Select an image file (JPG, PNG, or GIF)
3. Add a caption describing your post
4. Click "Post" to share

### Interacting with Posts
- **Like**: Click the heart icon to like/unlike a post
- **Comment**: Use the comment form below each post
- **View Profile**: Click on usernames to visit user profiles

### Managing Your Profile
1. Navigate to your profile page
2. Click "Edit Profile" to update your information
3. View your posts in a grid layout
4. See your follower and following counts

### Discovering Users
1. Visit the Explore section to see user suggestions
2. Use the search bar to find specific users
3. Click "Follow" to start following users

## File Structure
```
pics-go-social-media/
├── models/
│   ├── User.js
│   ├── Post.js
│   └── Comment.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── posts.js
│   └── comments.js
├── middleware/
│   └── auth.js
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── uploads/
├── server.js
├── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by Instagram's design and functionality
- Built with modern web technologies
- Responsive design for all devices 