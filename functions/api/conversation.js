const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {logger} = functions;
const express = require("express");
const cors = require("cors");
const {authenticate} = require("./authenticate");

const conversation = express();
conversation.use(cors({origin: true}));

// Endpoint to start a new conversation
conversation.post("/", authenticate, async (req, res) => {
  try {
    // Make token and uid verification
    const {uid} = req.user;

    // Create conversation
    const conversationRef = await admin
        .firestore()
        .collection("conversations")
        .doc(uid)
        .collection("userConversations")
        .add({
          uid: uid,
          startTime: new Date(),
        });
    logger.log("Conversation created successfully", conversationRef.id);
    // Return the coversation ID
    return res.status(200).json({
      message: "Conversation created successfully",
      coversationId: conversationRef.id});
  } catch (error) {
    logger.error("Error starting coversation:", error);
    return res.status(500).json({
      error: "Error starting coversation: "+ error});
  }
});

// Add message to the conversation
conversation.post("/addMessage", authenticate, async (req, res) => {
  try {
    // Get the user id from the token
    const {uid} = req.user;

    // Get info from the request body
    const {message, role, conversationId} = req.body;

    // Validate body fields
    if (!message || !role || !conversationId) {
      logger
          .log("Required fields (message, role or conversationId) are missing");
      return res.status(400).json({
        status: "error",
        message: "Required fields are missing"});
    }

    // Verify if role is user or system
    if (role !== "user" && role !== "system") {
      logger.log("Invalid role");
      return res.status(400).json({
        status: "error",
        message: "Invalid role"});
    }
    // Verify if the conversation exists for the user
    const conversationRef = await admin.firestore()
        .collection("conversations")
        .doc(uid)
        .collection("userConversations")
        .doc(conversationId)
        .get();

    if (!conversationRef.exists) {
      logger.log("Conversation not found or does not belong to the user");
      return res.status(404).json({
        status: "error",
        message: "Conversation not found or does not belong to the user",
      });
    }

    const messageData = {
      message: message,
      uid: uid,
      role: role,
      timestamp: new Date(),
    };

    // Add a new message to the database subcollection in firestore
    const messageRef = await admin
        .firestore()
        .collection("chats")
        .doc(conversationId)
        .collection("messages")
        .add(messageData);

    logger.log("Message added to the database, messageId:", messageRef.id);
    return res.status(200).json({
      status: "message added successfully",
      message: messageData,
    });
  } catch (error) {
    logger.error("Error adding message: ", error);
    return res.status(500).json({
      status: "error",
      error: "Error adding message: " + error});
  }
});

// Endpoint to see all conversations
conversation.get("/", authenticate, async (req, res) => {
  const {uid} = req.user;

  try {
    // Reference to the user's conversations
    const conversationsRef = admin.firestore()
        .collection("conversations")
        .doc(uid)
        .collection("userConversations");

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

conversation.get("/date/:date", authenticate, async (req, res) => {
  const {uid} = req.user;
  const {date} = req.params;

  try {
    if (!date) {
      logger.error("Date is required");
      return res.status(400).json({error: "Date is required"});
    }

    // Convert the date string to a Date object
    const dateObj = new Date(date);

    // Verify if the date is valid
    if (isNaN(dateObj.getTime())) {
      logger.error("Invalid date format");
      return res.status(400).json({error: "Invalid date format"});
    }

    // Reference to the user's conversations filtered by date
    const conversationsRef = admin.firestore()
        .collection("conversations")
        .doc(uid)
        .collection("userConversations")
        .where("startTime", "==", dateObj);

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

// Endpoint to get a conversation by conversationId
conversation.get("/:conversationId", authenticate, async (req, res) => {
  const {uid} = req.user;
  const {conversationId} = req.params;

  try {
    // Reference to the user's conversation
    const conversationRef = await admin.firestore()
        .collection("conversations")
        .doc(uid)
        .collection("userConversations")
        .doc(conversationId)
        .get();

    if (!conversationRef.exists) {
      logger.log("Conversation not found or does not belong to the user");
      return res.status(404).json({
        status: "error",
        message: "Conversation not found or does not belong to the user",
      });
    }

    const conversationData = conversationRef.data();
    const messagesSnapshot = await admin.firestore()
        .collection("chats")
        .doc(conversationId)
        .collection("messages")
        .get();

    const messages = messagesSnapshot
        .docs
        .map((messageDoc) => messageDoc.data());

    return res.status(200).json({
      conversationId: conversationId,
      conversationData: conversationData,
      messages: messages,
    });
  } catch (error) {
    logger.error("Error retrieving conversation:", error);
    return res.status(500).json({error: error.message});
  }
});

// Export the conversation
exports.conversation = functions.https.onRequest(conversation);
