/**
 * Utility Functions for Instagram Automation
 */

const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');

class Utils {
  /**
   * Generate random delay between min and max
   */
  static randomDelay(min, max) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return delay;
  }

  /**
   * Sleep for specified milliseconds
   */
  static async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate random string
   */
  static randomString(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate random number in range
   */
  static randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Pick random item from array
   */
  static randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * Shuffle array
   */
  static shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Format timestamp
   */
  static formatTimestamp(date = new Date()) {
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
  }

  /**
   * Create directory if not exists
   */
  static ensureDir(dirPath) {
    return fs.ensureDir(dirPath);
  }

  /**
   * Read JSON file
   */
  static readJson(filePath) {
    return fs.readJson(filePath);
  }

  /**
   * Write JSON file
   */
  static writeJson(filePath, data) {
    return fs.writeJson(filePath, data, { spaces: 2 });
  }

  /**
   * Append to file
   */
  static appendFile(filePath, content) {
    return fs.appendFile(filePath, content);
  }

  /**
   * Read file
   */
  static readFile(filePath) {
    return fs.readFile(filePath);
  }

  /**
   * Check if file exists
   */
  static fileExists(filePath) {
    return fs.pathExists(filePath);
  }

  /**
   * Generate unique ID
   */
  static generateId() {
    return uuidv4();
  }

  /**
   * Format file size
   */
  static formatFileSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  /**
   * Validate image/video file
   */
  static validateMedia(filePath, allowedTypes, maxSize) {
    return new Promise(async (resolve) => {
      try {
        if (!(await this.fileExists(filePath))) {
          return resolve({ valid: false, error: 'File not found' });
        }

        const stats = await fs.stat(filePath);
        if (stats.size > maxSize) {
          return resolve({ valid: false, error: 'File too large' });
        }

        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.webp': 'image/webp',
          '.mp4': 'video/mp4',
        };

        const mimeType = mimeTypes[ext];
        if (!mimeType || !allowedTypes.includes(mimeType)) {
          return resolve({ valid: false, error: 'Invalid file type' });
        }

        resolve({ valid: true, mimeType, size: stats.size });
      } catch (error) {
        resolve({ valid: false, error: error.message });
      }
    });
  }

  /**
   * Get files from directory
   */
  static getFiles(dirPath, extensions = []) {
    return new Promise(async (resolve) => {
      try {
        const files = await fs.readdir(dirPath);
        const filtered = extensions.length > 0
          ? files.filter(f => extensions.includes(path.extname(f).toLowerCase()))
          : files;
        resolve(filtered);
      } catch (error) {
        resolve([]);
      }
    });
  }

  /**
   * Parse Instagram URL
   */
  static parseInstagramUrl(url) {
    const patterns = {
      post: /instagram\.com\/p\/([a-zA-Z0-9_-]+)/,
      story: /instagram\.com\/stories\/[\w.]+\/(\d+)/,
      profile: /instagram\.com\/([a-zA-Z0-9_.]+)/,
      reel: /instagram\.com\/reel\/([a-zA-Z0-9_-]+)/,
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      const match = url.match(pattern);
      if (match) {
        return { type, id: match[1], username: match[2] || null };
      }
    }
    return null;
  }

  /**
   * Get timestamp for logging
   */
  static getLogTimestamp() {
    return moment().format('YYYY-MM-DD HH:mm:ss.SSS');
  }

  /**
   * Clamp number between min and max
   */
  static clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
  }

  /**
   * Chunk array into smaller arrays
   */
  static chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Retry function with exponential backoff
   */
  static async retry(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, i);
          await this.sleep(delay + Math.random() * 1000);
        }
      }
    }
    throw lastError;
  }

  /**
   * Calculate progress percentage
   */
  static calculateProgress(current, total) {
    return Math.round((current / total) * 100);
  }

  /**
   * Create progress bar string
   */
  static createProgressBar(current, total, length = 30) {
    const percent = this.calculateProgress(current, total) / 100;
    const filled = Math.round(length * percent);
    const empty = length - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    return `[${bar}] ${this.calculateProgress(current, total)}%`;
  }
}

module.exports = Utils;
