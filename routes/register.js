/**
 * URL Registration Route
 * Handles POST /corex/register endpoint
 */

const express = require("express");
const router = express.Router();
const registerController = require("../controllers/registerController");
const validateUrl = require("../middlewares/validateUrl");

/**
 * POST /corex/register
 * Register and mask a single URL
 */
router.post("/", validateUrl, registerController.registerUrl);

module.exports = router;