const {logger} = require("firebase-functions");
const admin = require("firebase-admin");
const rateLimit = require("express-rate-limit");

// Rate limiter to prevent abuse
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
});

// Middleware to authenticate user
exports.authenticate = [authLimiter, async (req, res, next) => {
  // Check if the ID token is passed in the Authorization header
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer ")) {
    logger.error("Unauthorized, ID token is missing");
    return res.status(403).json({
      message: "Unauthorized: ID token is missing",
    });
  }

  // Get the ID token from the Authorization header
  const idToken = req.headers.authorization.split("Bearer ")[1];

  // Verify if ID token is passed
  if (!idToken) {
    logger.error("Unauthorized, ID token is missing");
    return res.status(403).json({
      message: "Unauthorized, ID token is missing",
    });
  }

  try {
    // Verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Add the user to the request object
    req.user = decodedToken;

    logger.log("User authenticated", {uid: decodedToken.uid});
    next();
  } catch (error) {
    // Verify if the ID token has expired
    if (error.code === "auth/id-token-expired") {
      logger.error("Unauthorized: ID token has expired");
      return res.status(403).json({
        message: "Unauthorized: ID token has expired",
      });
      // Verify if the ID token is invalid
    } else {
      logger.error("Unauthorized: ID token is invalid",
          {error: error.message});
      return res.status(403).json({
        message: "Unauthorized: ID token is invalid",
      });
    }
  }
}];
