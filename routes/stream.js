/**
 * Media Streaming Route
 * Handles GET /corex/:id endpoint
 */

const express = require("express");
const router = express.Router();
const streamController = require("../controllers/streamController");

/**
 * GET /corex/:id
 * Stream original media for a masked Corex URL
 */
router.get("/:id", streamController.streamMedia);

module.exports = router;