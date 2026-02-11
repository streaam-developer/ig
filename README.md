# Instagram Private API Automation Bot

An advanced Instagram automation script using the private API with comprehensive features for engagement, posting, and account management.

## ⚠️ Disclaimer

**Use at your own risk!** This bot uses Instagram's private API which is not officially supported. 
- Violating Instagram's Terms of Service may result in account suspension or termination
- Use responsibly and don't exceed reasonable limits
- The developers are not responsible for any consequences

## ✨ Features

### Authentication & Session Management
- Secure login with 2FA support
- Session persistence and restoration
- Device simulation
- Proxy support

### Content Creation
- Photo uploads with captions
- Video uploads
- Album creation (2-10 media items)
- Story posting (photos and videos)
- Profile picture updates

### Engagement Tools
- Auto-like posts from hashtags
- Auto-comment on posts
- Follow/unfollow users
- Direct messaging
- User search

### Account Management
- Followers/following analysis
- Non-follower detection
- Mass unfollow
- Bio editing
- Statistics and analytics

### Automation
- Campaign mode for hashtag engagement
- Rate limiting and delays
- Randomized actions to avoid detection
- Progress tracking

## 📁 Project Structure

```
instagram-automation/
├── package.json
├── .env.example
├── README.md
├── src/
│   ├── instagram.js          # Main bot class
│   ├── config/
│   │   └── config.js         # Configuration
│   └── utils/
│       └── logger.js         # Utility functions
├── examples/
│   └── advanced.js           # Usage examples
├── data/
├── sessions/
├── logs/
└── uploads/
```

## 🚀 Getting Started

### 1. Installation

```bash
# Clone or create the project
cd instagram-automation

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### 2. Configuration

Edit `.env` file with your credentials:

```env
IG_USERNAME=your_username
IG_PASSWORD=your_password

# Optional settings
MIN_DELAY=5000
MAX_DELAY=15000
HASHTAGS=photography,travel,nature
```

### 3. Basic Usage

```javascript
const InstagramBot = require('./src/instagram');

(async () => {
  const bot = new InstagramBot();
  
  // Initialize
  await bot.init();
  
  // Login
  await bot.login();
  
  // Get user info
  const user = await bot.getCurrentUser();
  console.log(`Followers: ${user.follower_count}`);
  
  // Post a photo
  await bot.uploadPhoto('./photo.jpg', 'My caption #tag');
  
  // Follow a user
  await bot.follow('target_user');
  
  // Logout
  await bot.logout();
})();
```

### 4. Running Examples

```bash
# Run all examples
node examples/advanced.js 0

# Run specific example
node examples/advanced.js 1  # Login example
node examples/advanced.js 2  # Post operations
node examples/advanced.js 3  # Engagement
```

## 📖 API Reference

### Authentication

```javascript
await bot.init();              // Initialize bot
await bot.login();             // Login to Instagram
await bot.logout();            // Logout
await bot.saveSession();       // Save session manually
```

### User Operations

```javascript
// Get current user
const user = await bot.getCurrentUser();

// Get user by username
const user = await bot.getUserByUsername('username');

// Search users
const results = await bot.searchUsers('query', 10);

// Get user feed
const posts = await bot.getUserFeed('username', 10);
```

### Social Actions

```javascript
// Follow/Unfollow
await bot.follow('username');
await bot.unfollow('username');

// Get followers/following
const followers = await bot.getFollowers('username', 100);
const following = await bot.getFollowing('username', 100);

// Find non-followers
const nonFollowers = await bot.findNonFollowers('username');
```

### Content Posting

```javascript
// Upload photo
await bot.uploadPhoto('./photo.jpg', 'Caption here');

// Upload video
await bot.uploadVideo('./video.mp4', 'Video caption');

// Upload album
await bot.uploadAlbum(['./photo1.jpg', './photo2.jpg'], 'Album caption');

// Upload story
await bot.uploadStory('./story.jpg');
```

### Engagement

```javascript
// Like posts from hashtag
await bot.likeFromHashtag('photography', 10);

// Comment on hashtag posts
const comments = ['Great!', 'Love it!'];
await bot.commentFromHashtag('photography', comments, 5);

// Follow from hashtag
await bot.followFromHashtag('photography', 5);

// Auto-engage with user
await bot.autoEngage('target_user', {
  likePosts: true,
  commentPosts: true,
  followUser: true,
  sendDM: true,
  comments: ['Great content!', 'Love this!'],
  dmMessage: 'Welcome! Thanks for following!',
});
```

### Direct Messaging

```javascript
// Send message
await bot.sendMessage('username', 'Hello!');

// Get inbox
const inbox = await bot.getInbox();
```

### Account Management

```javascript
// Print statistics
await bot.printStats();

// Edit bio
await bot.editBio('My new bio');

// Set profile picture
await bot.setProfilePicture('./profile.jpg');

// Delete post
await bot.deletePost('media_id');
```

### Automation

```javascript
// Run campaign
await bot.runCampaign({
  hashtags: ['photography', 'art', 'design'],
  likesPerHashtag: 5,
  commentsPerHashtag: 3,
  followsPerHashtag: 2,
  comments: ['Great!', 'Love this!'],
  duration: 3600, // 1 hour
});

// Mass unfollow non-followers
await bot.massUnfollowNonFollowers(50);
```

## ⚙️ Configuration Options

### Rate Limiting

| Variable | Description | Default |
|----------|-------------|---------|
| `MIN_DELAY` | Minimum delay between actions (ms) | 5000 |
| `MAX_DELAY` | Maximum delay between actions (ms) | 15000 |
| `STORY_DELAY` | Delay between story uploads (ms) | 2000 |
| `MESSAGE_DELAY` | Delay between DMs (ms) | 3000 |
| `FOLLOW_DELAY` | Delay between follows (ms) | 8000 |
| `LIKE_DELAY` | Delay between likes (ms) | 2000 |
| `COMMENT_DELAY` | Delay between comments (ms) | 5000 |

### Features

| Variable | Description | Default |
|----------|-------------|---------|
| `AUTO_LIKE` | Enable auto-liking | false |
| `AUTO_FOLLOW` | Enable auto-following | false |
| `AUTO_STORY` | Enable auto-story posting | false |
| `AUTO_DM` | Enable auto direct messages | false |
| `ANTI_BLOCK` | Enable anti-detection measures | true |

## 🛡️ Safety Tips

1. **Start slow**: Begin with low limits and gradually increase
2. **Use delays**: Don't exceed Instagram's rate limits
3. **Vary actions**: Randomize delays and activity patterns
4. **Monitor account**: Watch for suspicious activity warnings
5. **Use fresh accounts**: Don't risk your main account
6. **Respect limits**: Don't follow/unfollow too quickly

## 📝 License

MIT License - Use responsibly!

## 🤝 Contributing

Pull requests welcome! Please read our contributing guidelines first.

## 📧 Support

For questions or issues, please open a GitHub issue.
