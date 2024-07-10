const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Import the functions from specific file
const {addMessage} = require("./api/addMessage");
const {user} = require("./api/user");
const {generateToken} = require("./api/generateToken");

// Export the functions
exports.addMessage = addMessage;
exports.user = user;
exports.generateToken = generateToken;
