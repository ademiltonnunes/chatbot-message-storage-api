const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {logger} = functions;
const express = require("express");
const cors = require("cors");
const {authenticate} = require("./authenticate");

const user = express();
user.use(cors({origin: true}));

// Endpoint to create a new user
user.post("/", async (req, res) => {
  const {email, password} = req.body;
  logger.log("Received new user info", "email:", email, "password:", password);

  try {
    // Verify if the user already exists
    const existingUser = await admin.auth().getUserByEmail(email);
    logger.log("User:", existingUser);
    return res.status(400).json({message: "User already exists"});
  } catch (error) {
    // User does not exist, proceed to create a new one
    if (error.code === "auth/user-not-found") {
      try {
        // Create a new user
        const userRecord = await admin.auth().createUser({
          email: email,
          password: password,
        });
        logger.log("User created successfully", userRecord);

        // Return the user uid only
        return res.status(201).json({
          message: "User created successfully",
          uid: userRecord.uid});
      // Error creating the user
      } catch (createError) {
        logger.error("Error creating user:", createError);
        return res.status(400).json({error: createError.message});
      }
    } else {
      // Error checking user existence
      logger.error("Error checking user existence:", error);
      return res.status(400).json({error: error.message});
    }
  }
});

// Endpoint to list all users, to access it, user has to authenticate
user.get("/", authenticate, async (req, res) => {
  try {
    // Get all users
    const listUsersResult = await admin.auth().listUsers();
    // Convert the user records to JSON
    const users = listUsersResult.users.map((
        userRecord) => userRecord.toJSON());
    logger.log("Retrieved all users", users);

    return res.status(200).json(users);
  } catch (error) {
    // Error listing users
    logger.error("Error listing users:", error);
    return res.status(500).json({error: error.message});
  }
});

// Endpoint to get user by email
user.get("/email/:email", authenticate, async (req, res) => {
  const {email} = req.params;
  logger.log("Email received: ", email);
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    logger.log("User: ", userRecord);
    return res.status(200).json(userRecord.toJSON());
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      logger.error("Error: ", error);
      return res.status(404).json({error: "User not found"});
    } else {
      return res.status(500).json({error: error.message});
    }
  }
});

// Endpoint to delete a user by uid
user.delete("/:uid", authenticate, async (req, res) => {
  const {uid} = req.params;

  try {
    // If the user deleted is the same as the authenticated user, revoke tokens
    if (uid === req.user.uid) {
      logger.log("User deleted is the same as the authenticated user");
      await admin.auth().revokeRefreshTokens(uid);
      logger.log("Refresh tokens revoked for user", uid);

      await admin.auth().deleteUser(uid);
      logger.log("User deleted successfully", uid);

      return res.status(200).json({message: "User deleted successfully."});
    }

    await admin.auth().deleteUser(uid);
    logger.log("User deleted successfully", uid);

    return res.status(200).json({message: "User deleted successfully"});
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      logger.log("User not found", uid);
      return res.status(404).json({error: "User not found"});
    } else {
      logger.error("Error deleting user:", error);
      return res.status(500).json({error: error.message});
    }
  }
});

// Endpoint to update a user"s email or password
user.put("/", authenticate, async (req, res) => {
  const {uid} = req.user;
  const {email, password} = req.body;
  const updateData = {};

  if (email) updateData.email = email;
  if (password) updateData.password = password;
  if (!email && !password) {
    logger.log("No data to update");
    return res.status(400).json({message: "No data to update"});
  }
  try {
    const userRecord = await admin.auth().updateUser(uid, updateData);
    logger.log("User updated successfully", userRecord);
    return res.status(200).json({
      message: "User updated successfully",
      user: userRecord.toJSON()});
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      logger.log("User not found", uid);
      return res.status(404).json({error: "User not found"});
    } else {
      logger.error("Error updating user:", error);
      return res.status(500).json({error: error.message});
    }
  }
});


// Endpoint to logoff (revoke token)
user.post("/logoff", authenticate, async (req, res) => {
  const {uid} = req.user;

  try {
    // Revoke the user's refresh tokens
    await admin.auth().revokeRefreshTokens(uid);
    logger.log("User tokens revoked successfully for uid:", uid);

    return res.status(200).json({ message: "User logged off successfully" });
  } catch (error) {
    logger.error("Error logging off user:", error);
    return res.status(500).json({ error: error.message });
  }
});

exports.user = functions.https.onRequest(user);
