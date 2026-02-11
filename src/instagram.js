/**
 * Advanced Instagram Private API Automation Script
 * 
 * Features:
 * - Authentication with session management
 * - Post creation (photos, albums, stories, reels)
 * - Direct messaging
 * - Auto-like, follow, comment
 * - Account management
 * - Analytics and logging
 */

const {
  IgApiClient,
  IgLoginTwoFactorRequiredError,
  RelationshipAction,
  Period,
} = require('instagram-private-api');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const config = require('./config/config');
const Utils = require('./utils/logger');

class InstagramBot {
  constructor() {
    this.ig = new IgApiClient();
    this.loggedIn = false;
    this.sessionData = null;
    this.stats = {
      likes: 0,
      follows: 0,
      unfollows: 0,
      comments: 0,
      posts: 0,
      stories: 0,
      messages: 0,
      errors: 0,
    };
    this.startTime = null;
  }

  /**
   * Initialize the bot
   */
  async init() {
    console.log(chalk.cyan('\n📸 Initializing Instagram Bot...\n'));

    // Create required directories
    await this.ensureDirectories();

    // Set up logging
    this.setupLogging();

    // Initialize Instagram client
    this.ig.state.generateDevice(config.credentials.username);
    
    // Handle proxy if enabled
    if (config.proxy.enabled) {
      this.setupProxy();
    }

    console.log(chalk.green('✓ Bot initialized successfully\n'));
  }

  /**
   * Create required directories
   */
  async ensureDirectories() {
    const dirs = [
      config.session.sessionPath,
      config.session.devicePath,
      config.logging.logPath,
      config.media.uploadPath,
      'data',
    ];

    for (const dir of dirs) {
      await fs.ensureDir(dir);
      console.log(chalk.gray(`  → Created directory: ${dir}`));
    }
  }

  /**
   * Set up proxy
   */
  setupProxy() {
    if (config.proxy.address && config.proxy.port) {
      const proxyUrl = config.proxy.username && config.proxy.password
        ? `http://${config.proxy.username}:${config.proxy.password}@${config.proxy.address}:${config.proxy.port}`
        : `http://${config.proxy.address}:${config.proxy.port}`;
      
      this.ig.request.setProxy(proxyUrl);
      console.log(chalk.gray(`  → Proxy enabled: ${config.proxy.address}:${config.proxy.port}`));
    }
  }

  /**
   * Set up logging
   */
  setupLogging() {
    if (!fs.existsSync(config.logging.logPath)) {
      fs.ensureDirSync(config.logging.logPath);
    }
  }

  /**
   * Log message
   */
  log(type, message) {
    const timestamp = Utils.getLogTimestamp();
    const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}\n`;
    const color = this.getLogColor(type);

    console.log(chalk[color](`[${timestamp}] [${type.toUpperCase()}] ${message}`));

    if (config.logging.saveLogs) {
      const logFile = path.join(config.logging.logPath, `instagram-${new Date().toISOString().split('T')[0]}.log`);
      fs.appendFileSync(logFile, logEntry);
    }
  }

  /**
   * Get log color based on type
   */
  getLogColor(type) {
    const colors = {
      info: 'blue',
      success: 'green',
      error: 'red',
      warning: 'yellow',
      debug: 'gray',
    };
    return colors[type] || 'white';
  }

  /**
   * Login to Instagram
   */
  async login() {
    const spinner = ora('Logging in to Instagram...').start();

    try {
      // Try to restore session
      const sessionFile = path.join(config.session.sessionPath, `${config.credentials.username}.json`);
      
      if (await fs.pathExists(sessionFile)) {
        spinner.text = 'Restoring session...';
        this.sessionData = await fs.readJson(sessionFile);
        await this.ig.simulate.preLoginFlow();
        
        try {
          await this.ig.account.login(
            this.sessionData.username,
            this.sessionData.password
          );
          this.loggedIn = true;
          spinner.succeed('Session restored successfully!');
          return true;
        } catch (error) {
          this.log('warning', 'Session restore failed, logging in normally...');
        }
      }

      // Perform normal login
      await this.ig.simulate.preLoginFlow();
      const loginResult = await this.ig.account.login(
        config.credentials.username,
        config.credentials.password
      );

      // Handle two-factor authentication
      if (loginResult.two_factor_required) {
        spinner.stop();
        console.log(chalk.yellow('\n⚠️  Two-factor authentication required!'));
        
        const twoFactorMethod = loginResult.two_factor_info.two_factor_identifier
          ? 'SMS'
          : 'Authenticator';

        const code = await this.promptCode(twoFactorMethod);
        
        spinner.start('Verifying 2FA code...');
        try {
          const verified = await this.ig.account.twoFactorLogin({
            twoFactorIdentifier: loginResult.two_factor_info.two_factor_identifier,
            verificationCode: code,
            trustDevice: true,
          });
          spinner.succeed('2FA verification successful!');
          this.sessionData = verified.logged_in_user;
        } catch (error) {
          spinner.fail('2FA verification failed!');
          throw error;
        }
      } else {
        this.sessionData = loginResult;
        spinner.succeed(`Logged in as ${loginResult.username}!`);
      }

      this.loggedIn = true;
      this.startTime = new Date();

      // Save session
      if (config.session.saveSession) {
        await this.saveSession();
      }

      // Post-login actions
      await this.ig.simulate.postLoginFlow();
      
      this.log('success', `Successfully logged in as ${this.sessionData.username}`);
      return true;
    } catch (error) {
      spinner.fail('Login failed!');
      this.log('error', `Login failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Prompt for 2FA code
   */
  async promptCode(method) {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      readline.question(
        chalk.cyan(`\nEnter the 2FA code sent via ${method}: `),
        (code) => {
          readline.close();
          resolve(code);
        }
      );
    });
  }

  /**
   * Save session
   */
  async saveSession() {
    const sessionFile = path.join(
      config.session.sessionPath, 
      `${config.credentials.username}.json`
    );
    await fs.writeJson(sessionFile, {
      username: config.credentials.username,
      passwordHash: Buffer.from(config.credentials.password).toString('base64').slice(0, 10) + '...', // Don't store full password
      sessionId: this.ig.state.sessionId,
      csrfToken: this.ig.state.csrfToken,
      deviceString: this.ig.state.deviceString,
      savedAt: new Date().toISOString(),
    });
    this.log('info', `Session saved: ${sessionFile}`);
  }

  /**
   * Get current user info
   */
  async getCurrentUser() {
    try {
      return await this.ig.user.info(this.ig.user.id);
    } catch (error) {
      this.log('error', `Failed to get user info: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user info by username
   */
  async getUserByUsername(username) {
    try {
      return await this.ig.user.searchExact(username);
    } catch (error) {
      this.log('error', `User not found: ${username}`);
      return null;
    }
  }

  /**
   * Get user feed
   */
  async getUserFeed(username, limit = 10) {
    try {
      const user = await this.getUserByUsername(username);
      if (!user) return [];

      const feed = await this.ig.feed.user(user.pk).items();
      return feed.slice(0, limit);
    } catch (error) {
      this.log('error', `Failed to get user feed: ${error.message}`);
      return [];
    }
  }

  /**
   * Follow a user
   */
  async follow(username) {
    try {
      const user = await this.getUserByUsername(username);
      if (!user) return false;

      await this.ig.friendship.create(user.pk);
      this.stats.follows++;
      
      const delay = Utils.randomDelay(config.rateLimit.minDelay, config.rateLimit.maxDelay);
      await Utils.sleep(delay);

      this.log('success', `Followed ${username}`);
      return true;
    } catch (error) {
      this.log('error', `Failed to follow ${username}: ${error.message}`);
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Unfollow a user
   */
  async unfollow(username) {
    try {
      const user = await this.getUserByUsername(username);
      if (!user) return false;

      await this.ig.friendship.destroy(user.pk);
      this.stats.unfollows++;
      
      const delay = Utils.randomDelay(config.rateLimit.minDelay, config.rateLimit.maxDelay);
      await Utils.sleep(delay);

      this.log('success', `Unfollowed ${username}`);
      return true;
    } catch (error) {
      this.log('error', `Failed to unfollow ${username}: ${error.message}`);
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Get followers list
   */
  async getFollowers(username, limit = 100) {
    try {
      const user = await this.getUserByUsername(username);
      if (!user) return [];

      const followers = await this.ig.user.followers(user.pk, {
        limit,
      });

      return followers.map(f => ({
        pk: f.pk,
        username: f.username,
        fullName: f.full_name,
        isPrivate: f.is_private,
      }));
    } catch (error) {
      this.log('error', `Failed to get followers: ${error.message}`);
      return [];
    }
  }

  /**
   * Get following list
   */
  async getFollowing(username, limit = 100) {
    try {
      const user = await this.getUserByUsername(username);
      if (!user) return [];

      const following = await this.ig.user.following(user.pk, {
        limit,
      });

      return following.map(f => ({
        pk: f.pk,
        username: f.username,
        fullName: f.full_name,
        isPrivate: f.is_private,
      }));
    } catch (error) {
      this.log('error', `Failed to get following: ${error.message}`);
      return [];
    }
  }

  /**
   * Like a post
   */
  async like(mediaId) {
    try {
      await this.ig.media.like(mediaId, RelationshipAction.LIKE);
      this.stats.likes++;
      
      const delay = Utils.randomDelay(config.rateLimit.minDelay, config.rateLimit.maxDelay);
      await Utils.sleep(delay);

      this.log('success', `Liked media ${mediaId}`);
      return true;
    } catch (error) {
      this.log('error', `Failed to like media: ${error.message}`);
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Unlike a post
   */
  async unlike(mediaId) {
    try {
      await this.ig.media.unlike(mediaId);
      this.log('success', `Unliked media ${mediaId}`);
      return true;
    } catch (error) {
      this.log('error', `Failed to unlike media: ${error.message}`);
      return false;
    }
  }

  /**
   * Comment on a post
   */
  async comment(mediaId, text) {
    try {
      await this.ig.media.comment({
        mediaId,
        text,
      });
      this.stats.comments++;
      
      const delay = Utils.randomDelay(config.rateLimit.minDelay, config.rateLimit.maxDelay);
      await Utils.sleep(delay);

      this.log('success', `Commented on media ${mediaId}: "${text}"`);
      return true;
    } catch (error) {
      this.log('error', `Failed to comment: ${error.message}`);
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Upload a photo
   */
  async uploadPhoto(photoPath, caption = '') {
    const spinner = ora('Uploading photo...').start();

    try {
      if (!await fs.pathExists(photoPath)) {
        throw new Error('Photo file not found');
      }

      const photo = await fs.readFile(photoPath);
      
      const result = await this.ig.publish.photo({
        file: photo,
        caption,
      });

      this.stats.posts++;
      spinner.succeed(`Photo uploaded! ${result.media.code}`);
      this.log('success', `Photo posted: ${photoPath}`);
      
      return result.media;
    } catch (error) {
      spinner.fail('Photo upload failed!');
      this.log('error', `Failed to upload photo: ${error.message}`);
      throw error;
    }
  }

  /**
   * Upload a video
   */
  async uploadVideo(videoPath, caption = '') {
    const spinner = ora('Uploading video...').start();

    try {
      if (!await fs.pathExists(videoPath)) {
        throw new Error('Video file not found');
      }

      const video = await fs.readFile(videoPath);
      
      // Video upload requires segmenting
      const result = await this.ig.publish.video({
        video,
        caption,
      });

      this.stats.posts++;
      spinner.succeed(`Video uploaded! ${result.media.code}`);
      this.log('success', `Video posted: ${videoPath}`);
      
      return result.media;
    } catch (error) {
      spinner.fail('Video upload failed!');
      this.log('error', `Failed to upload video: ${error.message}`);
      throw error;
    }
  }

  /**
   * Upload an album
   */
  async uploadAlbum(mediaPaths, caption = '') {
    const spinner = ora('Uploading album...').start();

    try {
      const mediaItems = [];
      
      for (const mediaPath of mediaPaths) {
        const ext = path.extname(mediaPath).toLowerCase();
        const content = await fs.readFile(mediaPath);
        
        if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
          mediaItems.push({
            type: 'photo',
            file: content,
          });
        } else if (['.mp4'].includes(ext)) {
          mediaItems.push({
            type: 'video',
            file: content,
          });
        }
      }

      if (mediaItems.length < 2 || mediaItems.length > 10) {
        throw new Error('Album must contain 2-10 media items');
      }

      const result = await this.ig.publish.album({
        media: mediaItems,
        caption,
      });

      this.stats.posts++;
      spinner.succeed('Album uploaded successfully!');
      this.log('success', `Album posted with ${mediaItems.length} items`);
      
      return result.media;
    } catch (error) {
      spinner.fail('Album upload failed!');
      this.log('error', `Failed to upload album: ${error.message}`);
      throw error;
    }
  }

  /**
   * Upload a story
   */
  async uploadStory(mediaPath, options = {}) {
    const spinner = ora('Uploading story...').start();

    try {
      const ext = path.extname(mediaPath).toLowerCase();
      const content = await fs.readFile(mediaPath);

      let result;
      
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        result = await this.ig.publish.story({
          file: content,
          ...options,
        });
      } else if (['.mp4'].includes(ext)) {
        result = await this.ig.publish.story({
          video: content,
          ...options,
        });
      }

      this.stats.stories++;
      spinner.succeed('Story uploaded successfully!');
      this.log('success', `Story posted: ${mediaPath}`);
      
      return result.media;
    } catch (error) {
      spinner.fail('Story upload failed!');
      this.log('error', `Failed to upload story: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send direct message
   */
  async sendMessage(recipientUsername, text) {
    try {
      const thread = await this.ig.entity.directThread([recipientUsername]);
      await thread.broadcastText(text);
      this.stats.messages++;
      
      const delay = Utils.randomDelay(config.rateLimit.messageDelay, config.rateLimit.messageDelay * 2);
      await Utils.sleep(delay);

      this.log('success', `Sent message to ${recipientUsername}: "${text}"`);
      return true;
    } catch (error) {
      this.log('error', `Failed to send message: ${error.message}`);
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Send media in DM
   */
  async sendMedia(recipientUsername, mediaId) {
    try {
      const thread = await this.ig.entity.directThread([recipientUsername]);
      await thread.broadcastMedia(mediaId);
      this.stats.messages++;

      this.log('success', `Sent media to ${recipientUsername}`);
      return true;
    } catch (error) {
      this.log('error', `Failed to send media: ${error.message}`);
      return false;
    }
  }

  /**
   * Get direct message threads
   */
  async getInbox() {
    try {
      const inbox = await this.ig.feed.directInbox().items();
      return inbox;
    } catch (error) {
      this.log('error', `Failed to get inbox: ${error.message}`);
      return [];
    }
  }

  /**
   * Explore hashtags
   */
  async exploreHashtag(hashtag, limit = 20) {
    try {
      const feed = this.ig.feed.hashtag(hashtag).items();
      return await Utils.chunkArray(await feed, limit)[0] || [];
    } catch (error) {
      this.log('error', `Failed to explore hashtag #${hashtag}: ${error.message}`);
      return [];
    }
  }

  /**
   * Like posts from hashtag
   */
  async likeFromHashtag(hashtag, count = 10) {
    console.log(chalk.cyan(`\n🔍 Exploring hashtag #${hashtag}...\n`));
    
    try {
      const posts = await this.exploreHashtag(hashtag, count);
      let liked = 0;

      for (const post of posts) {
        const success = await this.like(post.id);
        if (success) liked++;
      }

      console.log(chalk.green(`✓ Liked ${liked}/${count} posts from #${hashtag}`));
      return liked;
    } catch (error) {
      this.log('error', `Hashtag like failed: ${error.message}`);
      return 0;
    }
  }

  /**
   * Comment on hashtag posts
   */
  async commentFromHashtag(hashtag, comments, count = 5) {
    console.log(chalk.cyan(`\n💬 Commenting on #${hashtag} posts...\n`));
    
    try {
      const posts = await this.exploreHashtag(hashtag, count);
      let commented = 0;

      for (let i = 0; i < posts.length; i++) {
        const comment = comments[i % comments.length];
        const success = await this.comment(posts[i].id, comment);
        if (success) commented++;
      }

      console.log(chalk.green(`✓ Commented on ${commented}/${count} posts from #${hashtag}`));
      return commented;
    } catch (error) {
      this.log('error', `Hashtag comment failed: ${error.message}`);
      return 0;
    }
  }

  /**
   * Follow users from hashtag
   */
  async followFromHashtag(hashtag, count = 5) {
    console.log(chalk.cyan(`\n👥 Following users from #${hashtag}...\n`));
    
    try {
      const posts = await this.exploreHashtag(hashtag, count * 2);
      const users = [...new Set(posts.map(p => p.user.username))].slice(0, count);
      let followed = 0;

      for (const username of users) {
        const success = await this.follow(username);
        if (success) followed++;
      }

      console.log(chalk.green(`✓ Followed ${followed}/${count} users from #${hashtag}`));
      return followed;
    } catch (error) {
      this.log('error', `Hashtag follow failed: ${error.message}`);
      return 0;
    }
  }

  /**
   * Auto-engage with target user
   */
  async autoEngage(targetUsername, options = {}) {
    const {
      likePosts = true,
      commentPosts = true,
      followUser = true,
      sendDM = true,
      dmMessage = config.dm.welcomeMessage,
    } = options;

    console.log(chalk.cyan(`\n🎯 Starting auto-engagement for @${targetUsername}...\n`));

    try {
      const feed = await this.getUserFeed(targetUsername, 5);
      let likes = 0, comments = 0;

      for (const post of feed) {
        if (likePosts) {
          await this.like(post.id);
          likes++;
        }

        if (commentPosts && options.comments) {
          const comment = Utils.randomItem(options.comments);
          await this.comment(post.id, comment);
          comments++;
        }
      }

      if (followUser) {
        await this.follow(targetUsername);
      }

      if (sendDM) {
        await this.sendMessage(targetUsername, dmMessage);
      }

      console.log(chalk.green(`✓ Engagement complete: ${likes} likes, ${comments} comments`));
      return { likes, comments };
    } catch (error) {
      this.log('error', `Auto-engage failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getStats() {
    const user = await this.getCurrentUser();
    const uptime = this.startTime
      ? Math.floor((new Date() - this.startTime) / 1000)
      : 0;

    return {
      username: user.username,
      followers: user.follower_count,
      following: user.following_count,
      posts: user.media_count,
      bio: user.biography,
      verified: user.is_verified,
      uptime,
      actions: this.stats,
      actionsPerHour: uptime > 0 ? Math.round((Object.values(this.stats).reduce((a, b) => a + b, 0) / uptime) * 3600) : 0,
    };
  }

  /**
   * Print statistics
   */
  async printStats() {
    console.log(chalk.cyan('\n📊 Bot Statistics\n'));
    console.log(chalk.white('━'.repeat(40)));

    const stats = await this.getStats();
    const format = (label, value) => 
      console.log(chalk.white(`${label.padEnd(20)}: ${chalk.cyan(value)}`));

    format('Username', stats.username);
    format('Followers', stats.followers.toLocaleString());
    format('Following', stats.following.toLocaleString());
    format('Posts', stats.posts.toLocaleString());
    format('Verified', stats.verified ? 'Yes' : 'No');
    format('Uptime', `${Math.floor(stats.uptime / 3600)}h ${Math.floor((stats.uptime % 3600) / 60)}m`);

    console.log(chalk.white('━'.repeat(40)));
    console.log(chalk.white('\n📈 Actions Performed:'));
    console.log(chalk.white('━'.repeat(40)));

    format('Likes', stats.actions.likes);
    format('Comments', stats.actions.comments);
    format('Follows', stats.actions.follows);
    format('Unfollows', stats.actions.unfollows);
    format('Posts', stats.actions.posts);
    format('Stories', stats.actions.stories);
    format('Messages', stats.actions.messages);
    format('Errors', stats.actions.errors);

    console.log(chalk.white('━'.repeat(40)));
    format('Actions/Hour', stats.actionsPerHour);
    console.log(chalk.white('━'.repeat(40)));
  }

  /**
   * Non-followers strategy - find users who don't follow back
   */
  async findNonFollowers(username = null) {
    const target = username || config.credentials.username;
    console.log(chalk.cyan(`\n🔍 Finding non-followers for @${target}...\n`));

    const [followers, following] = await Promise.all([
      this.getFollowers(target, 1000),
      this.getFollowing(target, 1000),
    ]);

    const followerUsernames = new Set(followers.map(f => f.username));
    const nonFollowers = following.filter(f => !followerUsernames.has(f.username));

    console.log(chalk.green(`✓ Found ${nonFollowers.length} non-followers`));
    return nonFollowers;
  }

  /**
   * Mass unfollow non-followers
   */
  async massUnfollowNonFollowers(limit = 50) {
    const nonFollowers = await this.findNonFollowers();
    const toUnfollow = nonFollowers.slice(0, limit);

    console.log(chalk.cyan(`\n🚪 Unfollowing ${toUnfollow.length} users...\n`));

    let unfollowed = 0;
    for (const user of toUnfollow) {
      const success = await this.unfollow(user.username);
      if (success) unfollowed++;
      console.log(chalk.gray(`  Progress: ${unfollow}/${toUnfollow.length}`));
    }

    console.log(chalk.green(`✓ Unfollowed ${unfollowed}/${toUnfollow.length} users`));
    return unfollowed;
  }

  /**
   * Search for users by query
   */
  async searchUsers(query, limit = 10) {
    try {
      const results = await this.ig.user.search(query);
      return results.slice(0, limit).map(user => ({
        pk: user.pk,
        username: user.username,
        fullName: user.full_name,
        profilePic: user.profile_pic_url,
        isPrivate: user.is_private,
      }));
    } catch (error) {
      this.log('error', `User search failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Get media insights (basic)
   */
  async getMediaInsights(mediaId) {
    try {
      const media = await this.ig.media.info(mediaId);
      return {
        id: media.id,
        code: media.code,
        caption: media.caption?.text,
        likes: media.like_count,
        comments: media.comment_count,
        views: media.video_view_count || 0,
        timestamp: media.taken_at,
        isVideo: media.media_type === 2,
      };
    } catch (error) {
      this.log('error', `Failed to get media insights: ${error.message}`);
      return null;
    }
  }

  /**
   * Delete a post
   */
  async deletePost(mediaId) {
    try {
      await this.ig.media.delete(mediaId);
      this.log('success', `Deleted post ${mediaId}`);
      return true;
    } catch (error) {
      this.log('error', `Failed to delete post: ${error.message}`);
      return false;
    }
  }

  /**
   * Edit bio
   */
  async editBio(bio) {
    try {
      await this.ig.account.updateBio(bio);
      this.log('success', `Updated bio: "${bio}"`);
      return true;
    } catch (error) {
      this.log('error', `Failed to update bio: ${error.message}`);
      return false;
    }
  }

  /**
   * Set profile picture
   */
  async setProfilePicture(photoPath) {
    try {
      const photo = await fs.readFile(photoPath);
      await this.ig.account.changeProfilePicture({ file: photo });
      this.log('success', 'Profile picture updated');
      return true;
    } catch (error) {
      this.log('error', `Failed to update profile picture: ${error.message}`);
      return false;
    }
  }

  /**
   * Logout
   */
  async logout() {
    try {
      await this.ig.account.logout();
      this.loggedIn = false;
      
      // Clear session file
      const sessionFile = path.join(
        config.session.sessionPath, 
        `${config.credentials.username}.json`
      );
      if (await fs.pathExists(sessionFile)) {
        await fs.remove(sessionFile);
        this.log('info', 'Session file deleted');
      }

      this.log('success', 'Logged out successfully');
      return true;
    } catch (error) {
      this.log('error', `Logout failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Run automated campaign
   */
  async runCampaign(config) {
    const {
      hashtags = [],
      likesPerHashtag = 5,
      commentsPerHashtag = 3,
      followsPerHashtag = 2,
      comments = [],
      duration = 3600,
    } = config;

    console.log(chalk.cyan('\n🚀 Starting campaign...\n'));
    console.log(chalk.white(`Duration: ${duration} seconds`));
    console.log(chalk.white(`Hashtags: ${hashtags.join(', ')}`));
    console.log(chalk.white('━'.repeat(40)));

    const startTime = Date.now();
    let totalLikes = 0, totalComments = 0, totalFollows = 0;

    const interval = setInterval(async () => {
      if (Date.now() - startTime >= duration * 1000) {
        clearInterval(interval);
        console.log(chalk.green('\n✓ Campaign completed!'));
        console.log(chalk.white('━'.repeat(40)));
        console.log(chalk.white(`Total Likes: ${totalLikes}`));
        console.log(chalk.white(`Total Comments: ${totalComments}`));
        console.log(chalk.white(`Total Follows: ${totalFollows}`));
        return;
      }

      const hashtag = Utils.randomItem(hashtags);

      totalLikes += await this.likeFromHashtag(hashtag, likesPerHashtag);
      if (comments.length > 0) {
        totalComments += await this.commentFromHashtag(hashtag, comments, commentsPerHashtag);
      }
      totalFollows += await this.followFromHashtag(hashtag, followsPerHashtag);

      console.log(chalk.gray(`\nProgress: ${Math.round(((Date.now() - startTime) / (duration * 1000)) * 100)}%`));
    }, 30000); // Every 30 seconds
  }
}

module.exports = InstagramBot;
