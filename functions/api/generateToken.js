const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {logger} = functions;

exports.generateToken = functions.https.onRequest(async (req, res) => {
  try {
    logger.log("Received login request data", req.body);

    // Verify if uid is provided
    const {uid} = req.body;
    if (!uid) {
      return res.status(400).json({
        status: "error",
        message: "Required field uid is missing",
      });
    }

    // Check if the user exists
    const userRecord = await admin.auth().getUser(uid);
    if (!userRecord) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }
    logger.log("User record found for uid", uid);

    // Generate a custom token using the user's UID
    const token = await admin.auth().createCustomToken(uid);
    logger.log("Custom token generated for user", uid);

    // Return the custom token
    return res.status(200).json({token});
  } catch (error) {
    logger.error("Error generating custom token: ", error);
    return res.status(500).json({
      message: "Error generating custom token",
      error: error.message,
    });
  }
});
