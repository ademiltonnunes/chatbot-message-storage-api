const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {logger} = functions;
const express = require("express");
const cors = require("cors");
const {authenticate} = require("./authenticate");

const startConversation = express();
startConversation.use(cors({origin: true}));

// Endpoint to start a new conversation
startConversation.post("/", authenticate, async (req, res) => {
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

exports.startConversation = functions.https.onRequest(startConversation);
