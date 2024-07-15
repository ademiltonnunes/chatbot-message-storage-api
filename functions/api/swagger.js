const functions = require("firebase-functions");
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");

const swaggerDocument = YAML.load(path.join(__dirname, "../docs/swagger.yaml"));
const swaggerApp = express();

// Serve Swagger UI at /swagger endpoint
swaggerApp.use("/", swaggerUi.serve);
swaggerApp.get("/", swaggerUi.setup(swaggerDocument));

exports.swagger = functions.https.onRequest(swaggerApp);
