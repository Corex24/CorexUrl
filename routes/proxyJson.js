/**
 * JSON Proxy Route
 * Handles POST /corex/proxy-json endpoint
 */

const express = require("express");
const router = express.Router();
const proxyJsonController = require("../controllers/proxyJsonController");

/**
 * POST /corex/proxy-json
 * Mask all URLs in a JSON object
 */
router.post("/", proxyJsonController.wrapJsonApi);

module.exports = router;