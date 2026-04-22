const express = require("express");
const { generateAgoraToken } = require("../controllers/agora.controller");

const router = express.Router();

// GET /api/agora/token?channel=metaverse-voice&uid=12345
router.get("/token", generateAgoraToken);

module.exports = router;
