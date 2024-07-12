const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {logger} = functions;
const express = require("express");
const { authenticate } = require("./authenticate");

const addMessage = express();
// addMessage.use(authenticate);

addMessage.post("/", async (req, res) => {
  try {
    const idToken = req.headers.authorization.split("Bearer ")[1];

    const decodedToken = await admin.auth().verifyIdToken(idToken, true);
    const uid = decodedToken.uid;
    
    if (!uid) {
      logger.error("Unauthorized, ID token is missing");
      return res.status(403).json({
        message: "Unauthorized, ID token is missing",
      });
    }

    logger.log("Token verified successfully for user:", uid);

    // Make token and uid verification
    // const { userId, userName } = req.body; // Assuming you receive user info
    const userId = "TestUser123";
    const {message, role, sessionId} = req.body;
        
    
    if (!message || !role || !sessionId) {
      logger.log("Required fields (message, role or sessionId) are missing");
      return res.status(400).json({
        status: "error",
        message: "Required fields (message, role or sessionId) are missing"
        });
    }

    // Verify if roles is user or system
    if (role !== "user" && role !== "system") {
      logger.log("Invalid role");
      return res.status(400).json({
        status: "error",
        message: "Invalid role"
      });
    }

    // Validate if the session exists and the user is part of it
    //const sessionRef = await admin.firestore().collection("sessions").doc(sessionId).get();

    const messageData = {
      message,
      userId,
      role,
      timestamp: new Date(),
    };

    // Add a new message to the database subcollection in firestore
    const messageRef = await admin
        .firestore()
        .collection("chats")
        .doc(sessionId)
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
        error: "Error adding message: " + error });
  }
});

exports.addMessage = functions.https.onRequest(addMessage);
