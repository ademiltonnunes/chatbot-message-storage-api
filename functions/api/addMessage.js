const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {logger} = functions;
const express = require("express");
const cors = require("cors");
const {authenticate} = require("./authenticate");

const addMessage = express();
addMessage.use(cors({origin: true}));

addMessage.post("/", authenticate, async (req, res) => {
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
exports.addMessage = functions.https.onRequest(addMessage);
