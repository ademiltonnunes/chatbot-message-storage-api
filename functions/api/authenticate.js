const {logger} = require("firebase-functions");
const admin = require("firebase-admin");

// Middleware to authenticate user
exports.authenticate = async (req, res, next) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer ")) {
    logger.error("Unauthorized, ID token is missing");
    return res.status(403).json({
      message: "Unauthorized, ID token is missing",
    });
  }

  const idToken = req.headers.authorization.split("Bearer ")[1];
  if (!idToken) {
    logger.error("Unauthorized, ID token is missing");
    return res.status(403).json({
      message: "Unauthorized, ID token is missing",
    });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    logger.log("User authenticated");
    next();
  } catch (error) {
    logger.error("Unauthorized, ID token is invalid");
    return res.status(403).json({
      message: "Unauthorized, ID token is invalid",
    });
  }
};
