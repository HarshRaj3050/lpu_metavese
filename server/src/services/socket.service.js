const sessionModel = require('../models/session.model');
const messageModel = require('../models/message.model');

class SocketService {
  /**
   * Create a new user session in database
   */
  static async createSession(socketId, username, colors, position) {
    try {
      const session = await sessionModel.create({
        socketId,
        username,
        position,
        hairColor: colors.hairColor,
        topColor: colors.topColor,
        bottomColor: colors.bottomColor,
        isOnline: true,
        lastActive: new Date(),
      });
      return session;
    } catch (err) {
      console.error('Error creating session:', err);
      throw err;
    }
  }

  /**
   * Save a message to database
   */
  static async saveMessage(senderName, senderId, text, roomId = 'global') {
    try {
      const message = await messageModel.create({
        senderName,
        senderId,
        text,
        timestamp: new Date(),
        roomId,
      });
      return message;
    } catch (err) {
      console.error('Error saving message:', err);
      throw err;
    }
  }

  /**
   * Update user position in database
   */
  static async updatePosition(sessionId, position) {
    try {
      const session = await sessionModel.findByIdAndUpdate(
        sessionId,
        { position, lastActive: new Date() },
        { new: true }
      );
      return session;
    } catch (err) {
      console.error('Error updating position:', err);
      throw err;
    }
  }

  /**
   * Mark session as offline
   */
  static async markOffline(sessionId) {
    try {
      const session = await sessionModel.findByIdAndUpdate(
        sessionId,
        { isOnline: false, lastActive: new Date() },
        { new: true }
      );
      return session;
    } catch (err) {
      console.error('Error marking session offline:', err);
      throw err;
    }
  }

  /**
   * Load all active sessions
   */
  static async loadActiveSessions() {
    try {
      const sessions = await sessionModel.find({ isOnline: true });
      return sessions;
    } catch (err) {
      console.error('Error loading active sessions:', err);
      throw err;
    }
  }

  /**
   * Get message history
   */
  static async getMessageHistory(roomId = 'global', limit = 50) {
    try {
      const messages = await messageModel
        .find({ roomId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .populate('senderId', 'username email');
      return messages.reverse();
    } catch (err) {
      console.error('Error getting message history:', err);
      throw err;
    }
  }

  /**
   * Delete expired offline sessions (older than 24 hours)
   */
  static async cleanupExpiredSessions(hoursOld = 24) {
    try {
      const cutoffTime = new Date(Date.now() - hoursOld * 60 * 60 * 1000);
      const result = await sessionModel.deleteMany({
        isOnline: false,
        lastActive: { $lt: cutoffTime },
      });
      return result;
    } catch (err) {
      console.error('Error cleaning up sessions:', err);
      throw err;
    }
  }
}

module.exports = SocketService;
