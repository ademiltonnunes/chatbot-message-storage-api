const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {logger} = functions;
const express = require("express");
const cors = require("cors");
const {authenticate} = require("./authenticate");

const chats = express();
chats.use(cors({origin: true}));

// Endpoint to see chats
chats.get("/", authenticate, async (req, res) => {
  const {uid} = req.user;
  const {date} = req.query; // Optional date parameter

  try {
    // Reference to the user's conversations
    let conversationsRef = admin.firestore()
        .collection("conversations")
        .doc(uid)
        .collection("userConversations");

    // If a date is provided, filter conversations by date
    if (date) {
      // Convert the date string to a Date object
      const dateObj = new Date(date);

      // Verify if the date is valid
      if (isNaN(dateObj.getTime())) {
        logger.error("Invalid date format");
        return res.status(400).json({error: "Invalid date format"});
      }

      // Query conversations that started on or after the specified date
      conversationsRef = conversationsRef.where("startTime", "==", dateObj);
    }

    // Get all conversations
    const conversationsSnapshot = await conversationsRef.get();

    // Verify if were found any conversations
    if (conversationsSnapshot.empty) {
      return res.status(404).json({message: "No conversations found"});
    }

    // Get all messages for each conversation
    const chats = [];
    for (const doc of conversationsSnapshot.docs) {
      const conversationId = doc.id;
      const conversationData = doc.data();
      const messagesSnapshot = await admin.firestore()
          .collection("chats")
          .doc(conversationId)
          .collection("messages")
          .get();

      const messages = messagesSnapshot
          .docs
          .map((messageDoc) => messageDoc.data());

      chats.push({
        conversationId: conversationId,
        conversationData: conversationData,
        messages: messages,
      });
    }

    return res.status(200).json(chats);
  } catch (error) {
    logger.error("Error retrieving conversations:", error);
    return res.status(500).json({error: error.message});
  }
});

exports.chats = functions.https.onRequest(chats);
