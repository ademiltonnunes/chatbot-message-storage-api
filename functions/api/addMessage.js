const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {logger} = functions;

exports.addMessage = functions.https.onCall(async (data, context) => {
  try {
    logger.log("Received message request data", data);
    // Validate requires fields
    if (!data.text || !data.userId) {
      logger.log("Required fields (text or userId) are missing");
      throw new functions.https.HttpsError("invalid-argument",
          "Required fields (text or userId) are missing");
    }
    const {text, userId} = data;
    const messageData = {
      text,
      userId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Add a new message to the database subcollection in firestore
    const messageRef = await admin
        .firestore()
        .collection("chats")
        .doc(userId)
        .collection("messages")
        .add(messageData);
    logger.log("Message added to the database, messageId:", messageRef.id);
    return {
      status: "success",
      messageId: messageRef.id,
    };
  } catch (error) {
    logger.error("Error adding message: ", error);
    throw new functions.https.HttpsError(
        "internal",
        "Error adding message to the database",
        error.message,
    );
  }
});
