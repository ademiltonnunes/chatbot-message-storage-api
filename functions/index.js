const admin = require("firebase-admin");
admin.initializeApp();

// Import the functions from specific file
const {addMessage} = require("./api/addMessage");

// Export the functions
exports.addMessage = addMessage;
