/**
 * Advanced Instagram Bot Usage Examples
 * 
 * This file demonstrates various features of the Instagram automation bot.
 * Run with: node examples/advanced.js
 */

const InstagramBot = require('../src/instagram');
const chalk = require('chalk');

class BotExamples {
  constructor() {
    this.bot = new InstagramBot();
  }

  /**
   * Example 1: Basic Login and User Info
   */
  async exampleLogin() {
    console.log(chalk.cyan('\n📌 Example 1: Login and Get User Info\n'));

    try {
      await this.bot.init();
      await this.bot.login();

      const user = await this.bot.getCurrentUser();
      console.log(chalk.green(`\n✓ Logged in as: ${user.username}`));
      console.log(chalk.white(`  Followers: ${user.follower_count}`));
      console.log(chalk.white(`  Following: ${user.following_count}`));
      console.log(chalk.white(`  Posts: ${user.media_count}`));

      await this.bot.logout();
    } catch (error) {
      console.log(chalk.red(`Error: ${error.message}`));
    }
  }

  /**
   * Example 2: Post Operations
   */
  async examplePostOperations() {
    console.log(chalk.cyan('\n📌 Example 2: Post Operations\n'));

    try {
      await this.bot.init();
      await this.bot.login();

      // Upload a photo
      console.log(chalk.yellow('→ Uploading a photo...'));
      const photoResult = await this.bot.uploadPhoto('./uploads/sample.jpg', 'My awesome post! #automation');
      console.log(chalk.green(`✓ Photo uploaded: ${photoResult.code}`));

      // Upload a story
      console.log(chalk.yellow('→ Uploading a story...'));
      await this.bot.uploadStory('./uploads/story.jpg', { viewMode: 'replayable' });
      console.log(chalk.green('✓ Story uploaded'));

      // Upload an album
      console.log(chalk.yellow('→ Uploading an album...'));
      const albumResult = await this.bot.uploadAlbum([
        './uploads/album1.jpg',
        './uploads/album2.jpg',
      ], 'My photo album 📸');
      console.log(chalk.green('✓ Album uploaded'));

      await this.bot.logout();
    } catch (error) {
      console.log(chalk.red(`Error: ${error.message}`));
    }
  }

  /**
   * Example 3: Engagement Operations
   */
  async exampleEngagement() {
    console.log(chalk.cyan('\n📌 Example 3: Engagement Operations\n'));

    try {
      await this.bot.init();
      await this.bot.login();

      const targetUsername = 'example_user';

      // Follow a user
      console.log(chalk.yellow(`→ Following @${targetUsername}...`));
      await this.bot.follow(targetUsername);
      console.log(chalk.green(`✓ Followed @${targetUsername}`));

      // Like posts from hashtag
      console.log(chalk.yellow('→ Liking posts from #technology...'));
      const liked = await this.bot.likeFromHashtag('technology', 5);
      console.log(chalk.green(`✓ Liked ${liked} posts`));

      // Comment on hashtag posts
      const comments = ['Great post! 👍', 'Love this! ❤️', 'Amazing content! 🔥'];
      console.log(chalk.yellow('→ Commenting on posts...'));
      const commented = await this.bot.commentFromHashtag('photography', comments, 3);
      console.log(chalk.green(`✓ Commented on ${commented} posts`));

      // Unfollow
      console.log(chalk.yellow(`→ Unfollowing @${targetUsername}...`));
      await this.bot.unfollow(targetUsername);
      console.log(chalk.green(`✓ Unfollowed @${targetUsername}`));

      await this.bot.logout();
    } catch (error) {
      console.log(chalk.red(`Error: ${error.message}`));
    }
  }

  /**
   * Example 4: Direct Messaging
   */
  async exampleDirectMessaging() {
    console.log(chalk.cyan('\n📌 Example 4: Direct Messaging\n'));

    try {
      await this.bot.init();
      await this.bot.login();

      // Send a DM
      console.log(chalk.yellow('→ Sending direct message...'));
      await this.bot.sendMessage('friend_username', 'Hey! Just wanted to say hi! 👋');
      console.log(chalk.green('✓ Message sent'));

      // Get inbox
      console.log(chalk.yellow('→ Checking inbox...'));
      const inbox = await this.bot.getInbox();
      console.log(chalk.green(`✓ Found ${inbox.length} conversation(s)`));

      await this.bot.logout();
    } catch (error) {
      console.log(chalk.red(`Error: ${error.message}`));
    }
  }

  /**
   * Example 5: User Search and Analysis
   */
  async exampleUserAnalysis() {
    console.log(chalk.cyan('\n📌 Example 5: User Search and Analysis\n'));

    try {
      await this.bot.init();
      await this.bot.login();

      // Search for users
      console.log(chalk.yellow('→ Searching for users...'));
      const results = await this.bot.searchUsers('photographer', 5);
      console.log(chalk.green(`✓ Found ${results.length} users:`));
      results.forEach(user => {
        console.log(chalk.white(`  - @${user.username} (${user.fullName})`));
      });

      // Get followers and following
      console.log(chalk.yellow('→ Analyzing followers...'));
      const followers = await this.bot.getFollowers('target_user', 10);
      console.log(chalk.green(`✓ Fetched ${followers.length} followers`));

      // Find non-followers
      console.log(chalk.yellow('→ Finding non-followers...'));
      const nonFollowers = await this.bot.findNonFollowers('target_user');
      console.log(chalk.green(`✓ Found ${nonFollowers.length} non-followers`));

      await this.bot.logout();
    } catch (error) {
      console.log(chalk.red(`Error: ${error.message}`));
    }
  }

  /**
   * Example 6: Auto-Engagement Campaign
   */
  async exampleAutoEngagement() {
    console.log(chalk.cyan('\n📌 Example 6: Auto-Engagement Campaign\n'));

    try {
      await this.bot.init();
      await this.bot.login();

      const campaignConfig = {
        likesPerHashtag: 5,
        commentsPerHashtag: 3,
        followsPerHashtag: 2,
        comments: [
          '🔥 Awesome content!',
          '❤️ Love this!',
          '📸 Great shot!',
          '👍 Keep it up!',
          '😍 Amazing!',
        ],
      };

      // Run campaign on multiple hashtags
      await this.bot.runCampaign({
        ...campaignConfig,
        hashtags: ['photography', 'travel', 'nature', 'art'],
        duration: 60, // Run for 60 seconds for demo
      });

      await this.bot.logout();
    } catch (error) {
      console.log(chalk.red(`Error: ${error.message}`));
    }
  }

  /**
   * Example 7: Account Management
   */
  async exampleAccountManagement() {
    console.log(chalk.cyan('\n📌 Example 7: Account Management\n'));

    try {
      await this.bot.init();
      await this.bot.login();

      // Get current stats
      console.log(chalk.yellow('→ Getting account statistics...'));
      await this.bot.printStats();

      // Edit bio
      console.log(chalk.yellow('→ Updating bio...'));
      await this.bot.editBio('🚀 Digital creator | 📸 Photography | 🤖 Automated');
      console.log(chalk.green('✓ Bio updated'));

      // Set profile picture
      console.log(chalk.yellow('→ Updating profile picture...'));
      await this.bot.setProfilePicture('./uploads/profile.jpg');
      console.log(chalk.green('✓ Profile picture updated'));

      await this.bot.logout();
    } catch (error) {
      console.log(chalk.red(`Error: ${error.message}`));
    }
  }

  /**
   * Example 8: Complete Automation Workflow
   */
  async exampleCompleteWorkflow() {
    console.log(chalk.cyan('\n📌 Example 8: Complete Automation Workflow\n'));

    try {
      await this.bot.init();
      await this.bot.login();

      console.log(chalk.white('━'.repeat(40)));
      console.log(chalk.white('Step 1: Engagement with target users'));
      console.log(chalk.white('━'.repeat(40)));

      // Auto-engage with specific user
      await this.bot.autoEngage('influencer_username', {
        likePosts: true,
        commentPosts: true,
        comments: ['Great content! 👍', 'Love your work! ❤️'],
        followUser: true,
        sendDM: true,
        dmMessage: 'Thanks for the inspiration! 🙌',
      });

      console.log(chalk.white('━'.repeat(40)));
      console.log(chalk.white('Step 2: Hashtag exploration and interaction'));
      console.log(chalk.white('━'.repeat(40)));

      // Explore hashtags
      const hashtags = ['art', 'design', 'creative'];
      for (const tag of hashtags) {
        await this.bot.likeFromHashtag(tag, 3);
        await Utils.sleep(5000);
      }

      console.log(chalk.white('━'.repeat(40)));
      console.log(chalk.white('Step 3: Cleanup - Unfollow non-followers'));
      console.log(chalk.white('━'.repeat(40)));

      // Mass unfollow non-followers (limit to 5 for demo)
      await this.bot.massUnfollowNonFollowers(5);

      console.log(chalk.white('━'.repeat(40)));
      console.log(chalk.white('Step 4: Final statistics'));
      console.log(chalk.white('━'.repeat(40)));

      await this.bot.printStats();

      await this.bot.logout();
      console.log(chalk.green('\n✓ Complete workflow finished!'));
    } catch (error) {
      console.log(chalk.red(`Error: ${error.message}`));
    }
  }

  /**
   * Run all examples
   */
  async runAll() {
    console.log(chalk.cyan('╔════════════════════════════════════════╗'));
    console.log(chalk.cyan('║   Instagram Private API Bot v1.0      ║'));
    console.log(chalk.cyan('║   Advanced Usage Examples              ║'));
    console.log(chalk.cyan('╚════════════════════════════════════════╝\n'));

    const examples = [
      { name: 'Login & User Info', method: 'exampleLogin' },
      { name: 'Post Operations', method: 'examplePostOperations' },
      { name: 'Engagement', method: 'exampleEngagement' },
      { name: 'Direct Messaging', method: 'exampleDirectMessaging' },
      { name: 'User Analysis', method: 'exampleUserAnalysis' },
      { name: 'Auto-Engagement Campaign', method: 'exampleAutoEngagement' },
      { name: 'Account Management', method: 'exampleAccountManagement' },
      { name: 'Complete Workflow', method: 'exampleCompleteWorkflow' },
    ];

    for (let i = 0; i < examples.length; i++) {
      const example = examples[i];
      console.log(chalk.white(`[${i + 1}] ${example.name}`));
    }

    console.log(chalk.white(`\n[0] Run all examples`));

    // For demo, run just the login example
    console.log(chalk.cyan('\n▶ Running example: Login & User Info\n'));
    await this.exampleLogin();
  }
}

// Main execution
const examples = new BotExamples();

// Run specific example based on command line argument
const exampleNumber = process.argv[2];

(async () => {
  try {
    if (exampleNumber === '0') {
      await examples.runAll();
    } else if (exampleNumber === '1') {
      await examples.exampleLogin();
    } else if (exampleNumber === '2') {
      await examples.examplePostOperations();
    } else if (exampleNumber === '3') {
      await examples.exampleEngagement();
    } else if (exampleNumber === '4') {
      await examples.exampleDirectMessaging();
    } else if (exampleNumber === '5') {
      await examples.exampleUserAnalysis();
    } else if (exampleNumber === '6') {
      await examples.exampleAutoEngagement();
    } else if (exampleNumber === '7') {
      await examples.exampleAccountManagement();
    } else if (exampleNumber === '8') {
      await examples.exampleCompleteWorkflow();
    } else {
      // Default: show menu
      await examples.runAll();
    }
  } catch (error) {
    console.error(chalk.red(`Fatal error: ${error.message}`));
    process.exit(1);
  }
})();
