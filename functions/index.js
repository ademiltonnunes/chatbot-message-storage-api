const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Import the functions from specific file
const {user} = require("./api/user");
const {startCoversation} = require("./api/startConversation");
const {addMessage} = require("./api/addMessage");

// Export the functions
exports.user = user;
exports.startCoversation = startCoversation;
exports.addMessage = addMessage;
