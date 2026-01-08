// LINE Bot Webhook Route
const express = require('express');
const line = require('@line/bot-sdk');
const lineBotService = require('../services/lineBotService');
const logger = require('../utils/logger');
const { asyncHandler } = require('../utils/errorHandler');

const router = express.Router();

// LINE Bot configuration
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
};

// Create LINE client
const client = new line.Client(config);

// LINE middleware for webhook verification
const middleware = line.middleware(config);

/**
 * LINE Webhook endpoint
 * POST /api/line/webhook
 */
router.post('/webhook', middleware, asyncHandler(async (req, res) => {
  const events = req.body.events;
  
  // Process each event
  const promises = events.map(async (event) => {
    try {
      if (event.type === 'message') {
        if (event.message.type === 'image') {
          // Handle image message (bill scanning)
          const reply = await lineBotService.handleImageMessage(
            event.message.id,
            event.source.userId
          );
          
          if (reply) {
            return client.replyMessage(event.replyToken, reply);
          }
        } else if (event.message.type === 'text') {
          // Handle text message (commands)
          const reply = await lineBotService.handleTextMessage(
            event.message.text,
            event.source.userId
          );
          
          if (reply) {
            return client.replyMessage(event.replyToken, reply);
          }
        }
      } else if (event.type === 'postback') {
        // Handle postback (button clicks)
        const reply = await lineBotService.handlePostback(
          event.postback.data,
          event.source.userId
        );
        
        if (reply) {
          return client.replyMessage(event.replyToken, reply);
        }
      }
    } catch (error) {
      logger.error('Error processing LINE event:', {
        error: error.message,
        eventType: event.type,
        userId: event.source?.userId
      });
      
      // Send error message to user
      try {
        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: '❌ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
        });
      } catch (replyError) {
        logger.error('Error sending error reply:', replyError);
      }
    }
  });

  await Promise.all(promises);
  
  res.json({ success: true });
}));

module.exports = router;

