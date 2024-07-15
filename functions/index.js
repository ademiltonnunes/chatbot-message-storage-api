const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Import the functions from specific file
const {user} = require("./api/user");
const {conversation} = require("./api/conversation");
const {swagger} = require("./api/swagger");

// Export the functions
exports.user = user;
exports.conversation = conversation;
exports.swagger = swagger;
