const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Import the functions from specific file
const {user} = require("./api/user");
const {startConversation} = require("./api/startConversation");
const {addMessage} = require("./api/addMessage");
const {chats} = require("./api/chats");

// Export the functions
exports.user = user;
exports.startConversation = startConversation;
exports.addMessage = addMessage;
exports.chats = chats;
