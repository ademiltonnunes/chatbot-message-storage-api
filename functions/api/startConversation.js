const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {logger} = functions;
const {authenticate} = require("./authenticate");

// Endpoint to start a new conversation
exports.startCoversation = functions.https
    .onRequest(authenticate, async (req, res) => {
      try {
        // Make token and uid verification
        const userId = req.user.uid;
        // const { userId, userName } = req.body;

        // Create conversation
        const coversationRef = await admin
            .firestore()
            .collection("coversations")
            .doc(userId)
            .collection("userCoversations")
            .add({
              userId: userId,
              startTime: new Date(),
            });
        logger.log("Conversation created successfully", coversationRef.id);
        // Return the coversation ID
        return res.status(200).json({
          message: "Conversation created successfully",
          coversationId: coversationRef.id});
      } catch (error) {
        logger.error("Error starting coversation:", error);
        return res.status(500).json({
          error: "Error starting coversation: "+ error});
      }
    });
