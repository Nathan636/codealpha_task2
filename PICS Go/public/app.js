// Global variables
let currentUser = null;
let authToken = localStorage.getItem('token');

// API base URL
const API_BASE = '/api';

// DOM elements
const authContainer = document.getElementById('authContainer');
const mainContent = document.getElementById('mainContent');
const publicFeedSection = document.getElementById('publicFeedSection');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const logoutBtn = document.getElementById('logoutBtn');
const loginBtn = document.getElementById('loginBtn');
const homeLink = document.getElementById('homeLink');
const exploreLink = document.getElementById('exploreLink');
const profileLink = document.getElementById('profileLink');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const getStartedBtn = document.getElementById('getStartedBtn');
const exploreBtn = document.getElementById('exploreBtn');

// Sections
const feedSection = document.getElementById('feedSection');
const profileSection = document.getElementById('profileSection');
const exploreSection = document.getElementById('exploreSection');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
});

// Initialize the application
function initializeApp() {
    if (authToken) {
        checkAuthStatus();
    } else {
        showLandingPage();
        loadPublicFeed();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Auth tabs
    loginTab.addEventListener('click', () => switchAuthTab('login'));
    registerTab.addEventListener('click', () => switchAuthTab('register'));

    // Auth forms
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);

    // Navigation
    logoutBtn.addEventListener('click', handleLogout);
    loginBtn.addEventListener('click', showAuth);
    homeLink.addEventListener('click', () => showSection('feed'));
    exploreLink.addEventListener('click', () => showSection('explore'));
    profileLink.addEventListener('click', () => showSection('profile'));

    // Hero buttons
    getStartedBtn.addEventListener('click', showAuth);
    exploreBtn.addEventListener('click', () => {
        document.getElementById('publicFeedSection').scrollIntoView({ behavior: 'smooth' });
    });

    // Mobile menu
    navToggle.addEventListener('click', toggleMobileMenu);

    // Search
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    // Create post
    document.getElementById('createPostBtn').addEventListener('click', createPost);
    document.getElementById('postImage').addEventListener('change', handleImagePreview);

    // Edit profile
    document.getElementById('editProfileBtn').addEventListener('click', showEditProfileModal);
    document.getElementById('editProfileForm').addEventListener('submit', handleEditProfile);
}

// Auth functions
function switchAuthTab(tab) {
    if (tab === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    } else {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    showLoading();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('token', authToken);
            localStorage.setItem('user', JSON.stringify(currentUser));
            showMainApp();
            loadFeed();
        } else {
            showError(data.message);
        }
    } catch (error) {
        showError('Login failed. Please try again.');
    } finally {
        hideLoading();
    }
}

async function handleRegister(e) {
    e.preventDefault();
    showLoading();

    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;

    // Basic validation
    if (!username || !email || !password) {
        showError('All fields are required');
        hideLoading();
        return;
    }

    if (password.length < 6) {
        showError('Password must be at least 6 characters long');
        hideLoading();
        return;
    }

    if (!email.includes('@')) {
        showError('Please enter a valid email address');
        hideLoading();
        return;
    }

    console.log('Registration attempt:', { username, email, password: '***' });

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('Registration response status:', response.status);
        
        let data;
        try {
            const responseText = await response.text();
            console.log('Raw response text:', responseText);
            
            if (!responseText) {
                throw new Error('Empty response from server');
            }
            
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Failed to parse response:', parseError);
            console.error('Response status:', response.status);
            console.error('Response headers:', response.headers);
            showError('Server returned invalid response. Please try again.');
            hideLoading();
            return;
        }
        
        console.log('Registration response data:', data);

        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('token', authToken);
            localStorage.setItem('user', JSON.stringify(currentUser));
            console.log('Registration successful, showing main app');
            showMainApp();
            loadFeed();
        } else {
            console.error('Registration failed:', data.message);
            showError(data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showError('Network error. Please check your connection.');
        } else {
            showError('Registration failed. Please try again.');
        }
    } finally {
        hideLoading();
    }
}

async function checkAuthStatus() {
    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            currentUser = await response.json();
            localStorage.setItem('user', JSON.stringify(currentUser));
            showMainApp();
            loadFeed();
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            showAuth();
        }
    } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        showAuth();
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    authToken = null;
    currentUser = null;
    showAuth();
}

// UI functions
function showLandingPage() {
    authContainer.classList.add('hidden');
    mainContent.classList.add('hidden');
    publicFeedSection.classList.remove('hidden');
    
    // Update navigation
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    homeLink.style.display = 'none';
    exploreLink.style.display = 'none';
    profileLink.style.display = 'none';
}

function showAuth() {
    authContainer.classList.remove('hidden');
    mainContent.classList.add('hidden');
    publicFeedSection.classList.add('hidden');
}

function showMainApp() {
    authContainer.classList.add('hidden');
    mainContent.classList.remove('hidden');
    publicFeedSection.classList.add('hidden');
    showSection('feed');
    
    // Update navigation
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    homeLink.style.display = 'inline-block';
    exploreLink.style.display = 'inline-block';
    profileLink.style.display = 'inline-block';
}

function showSection(section) {
    // Hide all sections
    feedSection.classList.add('hidden');
    profileSection.classList.add('hidden');
    exploreSection.classList.add('hidden');

    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

    // Show selected section
    switch (section) {
        case 'feed':
            feedSection.classList.remove('hidden');
            homeLink.classList.add('active');
            break;
        case 'profile':
            profileSection.classList.remove('hidden');
            profileLink.classList.add('active');
            loadProfile();
            break;
        case 'explore':
            exploreSection.classList.remove('hidden');
            exploreLink.classList.add('active');
            loadUserSuggestions();
            break;
    }
}

function toggleMobileMenu() {
    navMenu.classList.toggle('active');
}

// API functions
async function makeRequest(url, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        }
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Request failed');
    }

    return data;
}

// Post functions
async function loadFeed() {
    try {
        const posts = await makeRequest(`${API_BASE}/posts`);
        displayPosts(posts);
    } catch (error) {
        showError('Failed to load posts');
    }
}

async function createPost() {
    const caption = document.getElementById('postCaption').value;
    const imageFile = document.getElementById('postImage').files[0];

    if (!imageFile) {
        showError('Please select an image');
        return;
    }

    showLoading();

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('caption', caption);

    try {
        const response = await fetch(`${API_BASE}/posts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });

        if (response.ok) {
            document.getElementById('postCaption').value = '';
            document.getElementById('postImage').value = '';
            loadFeed();
        } else {
            const data = await response.json();
            showError(data.message);
        }
    } catch (error) {
        showError('Failed to create post');
    } finally {
        hideLoading();
    }
}

function displayPosts(posts) {
    const postsFeed = document.getElementById('postsFeed');
    postsFeed.innerHTML = '';

    posts.forEach(post => {
        const postElement = createPostElement(post);
        postsFeed.appendChild(postElement);
    });
}

function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    postDiv.innerHTML = `
        <div class="post-header">
            <img src="${post.user.profilePicture}" alt="${post.user.username}" class="post-user-avatar">
            <div class="post-user-info">
                <h3>${post.user.username}</h3>
                <small>${formatDate(post.createdAt)}</small>
            </div>
        </div>
        <img src="${post.image}" alt="Post image" class="post-image">
        <div class="post-content">
            <p class="post-caption">${post.caption}</p>
        </div>
        <div class="post-actions-bar">
            <button class="post-action ${post.likes.includes(currentUser.id) ? 'liked' : ''}" onclick="toggleLike('${post._id}')">
                <i class="fas fa-heart"></i>
            </button>
            <button class="post-action" onclick="showComments('${post._id}')">
                <i class="fas fa-comment"></i>
            </button>
        </div>
        <div class="post-stats">
            <span>${post.likes.length} likes</span>
            <span>${post.comments.length} comments</span>
        </div>
        <div class="post-comments" id="comments-${post._id}">
            ${post.comments.slice(0, 3).map(comment => `
                <div class="comment">
                    <img src="${comment.user.profilePicture}" alt="${comment.user.username}" class="comment-avatar">
                    <div class="comment-content">
                        <span class="comment-username">${comment.user.username}</span>
                        <span class="comment-text">${comment.content}</span>
                    </div>
                </div>
            `).join('')}
        </div>
        <form class="comment-form" onsubmit="addComment(event, '${post._id}')">
            <input type="text" class="comment-input" placeholder="Add a comment..." required>
            <button type="submit" class="comment-submit">Post</button>
        </form>
    `;
    return postDiv;
}

async function toggleLike(postId) {
    try {
        const response = await makeRequest(`${API_BASE}/posts/${postId}/like`, {
            method: 'POST'
        });
        loadFeed(); // Refresh feed to update likes
    } catch (error) {
        showError('Failed to like post');
    }
}

async function addComment(event, postId) {
    event.preventDefault();
    const input = event.target.querySelector('.comment-input');
    const content = input.value;

    try {
        await makeRequest(`${API_BASE}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content, postId })
        });
        input.value = '';
        loadFeed(); // Refresh feed to show new comment
    } catch (error) {
        showError('Failed to add comment');
    }
}

// Profile functions
async function loadProfile() {
    try {
        const user = await makeRequest(`${API_BASE}/users/profile/${currentUser.id}`);
        displayProfile(user);
    } catch (error) {
        showError('Failed to load profile');
    }
}

function displayProfile(data) {
    const { user, posts } = data;
    
    document.getElementById('profilePicture').src = user.profilePicture;
    document.getElementById('profileUsername').textContent = user.username;
    document.getElementById('profileBio').textContent = user.bio || 'No bio yet';
    document.getElementById('postCount').textContent = user.posts.length;
    document.getElementById('followerCount').textContent = user.followers.length;
    document.getElementById('followingCount').textContent = user.following.length;

    displayUserPosts(posts);
}

function displayUserPosts(posts) {
    const userPosts = document.getElementById('userPosts');
    userPosts.innerHTML = '';

    posts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.innerHTML = `
            <img src="${post.image}" alt="Post" class="user-post-thumbnail" onclick="showPostModal('${post._id}')">
        `;
        userPosts.appendChild(postDiv);
    });
}

// Explore functions
async function loadUserSuggestions() {
    try {
        const suggestions = await makeRequest(`${API_BASE}/users/suggestions`);
        displayUserSuggestions(suggestions);
    } catch (error) {
        showError('Failed to load suggestions');
    }
}

function displayUserSuggestions(suggestions) {
    const container = document.getElementById('userSuggestions');
    container.innerHTML = '';

    suggestions.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.className = 'user-suggestion';
        userDiv.innerHTML = `
            <img src="${user.profilePicture}" alt="${user.username}">
            <div class="user-suggestion-info">
                <h3>${user.username}</h3>
                <p>${user.bio || 'No bio'}</p>
                <button class="btn btn-primary" onclick="followUser('${user._id}')">Follow</button>
            </div>
        `;
        container.appendChild(userDiv);
    });
}

async function followUser(userId) {
    try {
        await makeRequest(`${API_BASE}/users/follow/${userId}`, {
            method: 'POST'
        });
        loadUserSuggestions(); // Refresh suggestions
    } catch (error) {
        showError('Failed to follow user');
    }
}

// Search functions
async function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    try {
        const users = await makeRequest(`${API_BASE}/users/search?q=${encodeURIComponent(query)}`);
        displaySearchResults(users);
    } catch (error) {
        showError('Search failed');
    }
}

function displaySearchResults(users) {
    // Create a modal or overlay to show search results
    // For now, we'll just log them
    console.log('Search results:', users);
}

// Edit profile functions
function showEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    const usernameInput = document.getElementById('editUsername');
    const bioInput = document.getElementById('editBio');

    usernameInput.value = currentUser.username;
    bioInput.value = currentUser.bio || '';

    modal.classList.remove('hidden');
}

async function handleEditProfile(e) {
    e.preventDefault();
    showLoading();

    const username = document.getElementById('editUsername').value;
    const bio = document.getElementById('editBio').value;
    const profilePicture = document.getElementById('editProfilePicture').files[0];

    const formData = new FormData();
    formData.append('username', username);
    formData.append('bio', bio);
    if (profilePicture) {
        formData.append('profilePicture', profilePicture);
    }

    try {
        const response = await fetch(`${API_BASE}/users/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });

        if (response.ok) {
            currentUser = await response.json();
            localStorage.setItem('user', JSON.stringify(currentUser));
            document.getElementById('editProfileModal').classList.add('hidden');
            loadProfile();
        } else {
            const data = await response.json();
            showError(data.message);
        }
    } catch (error) {
        showError('Failed to update profile');
    } finally {
        hideLoading();
    }
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
}

function showLoading() {
    document.getElementById('loadingSpinner').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingSpinner').classList.add('hidden');
}

function showError(message) {
    // Create a simple error notification
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e74c3c;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 4000;
        max-width: 300px;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

function handleImagePreview(event) {
    const file = event.target.files[0];
    if (file) {
        // You could add image preview functionality here
        console.log('Image selected:', file.name);
    }
}

// Close modals when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.add('hidden');
    }
});

// Close modals when clicking close button
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        closeBtn.closest('.modal').classList.add('hidden');
    });
});

// Public feed functions
async function loadPublicFeed() {
    try {
        const response = await fetch(`${API_BASE}/posts/public`);
        if (response.ok) {
            const posts = await response.json();
            displayPublicPosts(posts);
        } else {
            // If public endpoint doesn't exist, show sample posts
            displaySamplePosts();
        }
    } catch (error) {
        console.log('Loading sample posts...');
        displaySamplePosts();
    }
}

function displayPublicPosts(posts) {
    const publicPostsFeed = document.getElementById('publicPostsFeed');
    publicPostsFeed.innerHTML = '';

    posts.forEach(post => {
        const postElement = createPublicPostElement(post);
        publicPostsFeed.appendChild(postElement);
    });
}

function displaySamplePosts() {
    const publicPostsFeed = document.getElementById('publicPostsFeed');
    publicPostsFeed.innerHTML = `
        <div class="post">
            <div class="post-header">
                <img src="https://picsum.photos/40/40?random=1" alt="User" class="post-user-avatar">
                <div class="post-user-info">
                    <h3>Photographer_Pro</h3>
                    <small>2 hours ago</small>
                </div>
            </div>
            <img src="https://picsum.photos/600/400?random=1" alt="Post" class="post-image">
            <div class="post-content">
                <p class="post-caption">Amazing sunset captured today! Nature never fails to amaze me. 🌅 #photography #sunset #nature</p>
            </div>
        </div>
        
        <div class="post">
            <div class="post-header">
                <img src="https://picsum.photos/40/40?random=2" alt="User" class="post-user-avatar">
                <div class="post-user-info">
                    <h3>Travel_Lens</h3>
                    <small>5 hours ago</small>
                </div>
            </div>
            <img src="https://picsum.photos/600/400?random=2" alt="Post" class="post-image">
            <div class="post-content">
                <p class="post-caption">Exploring the hidden gems of the city today. Every corner has a story to tell! 📸 #travel #city #exploration</p>
            </div>
        </div>
        
        <div class="post">
            <div class="post-header">
                <img src="https://picsum.photos/40/40?random=3" alt="User" class="post-user-avatar">
                <div class="post-user-info">
                    <h3>Art_Collector</h3>
                    <small>1 day ago</small>
                </div>
            </div>
            <img src="https://picsum.photos/600/400?random=3" alt="Post" class="post-image">
            <div class="post-content">
                <p class="post-caption">Street art that speaks volumes. The colors and emotions in this piece are incredible! 🎨 #streetart #urban #culture</p>
            </div>
        </div>
    `;
}

function createPublicPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    postDiv.innerHTML = `
        <div class="post-header">
            <img src="${post.user?.profilePicture || 'https://picsum.photos/40/40?random=' + Math.random()}" alt="${post.user?.username || 'User'}" class="post-user-avatar">
            <div class="post-user-info">
                <h3>${post.user?.username || 'Anonymous'}</h3>
                <small>${formatDate(post.createdAt)}</small>
            </div>
        </div>
        <img src="${post.image}" alt="Post" class="post-image">
        <div class="post-content">
            <p class="post-caption">${post.caption || 'Beautiful moment captured!'}</p>
        </div>
    `;
    return postDiv;
} 