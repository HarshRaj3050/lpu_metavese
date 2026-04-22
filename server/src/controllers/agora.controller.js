const { RtcTokenBuilder, RtcRole } = require("agora-token");

/**
 * GET /api/agora/token?channel=<name>&uid=<number>
 *
 * Generates a temporary RTC token so the client can join a voice channel.
 * Token expires after 1 hour (3600 s).
 */
const generateAgoraToken = (req, res) => {
  const { channel, uid } = req.query;

  if (!channel) {
    return res.status(400).json({ error: "channel query param is required" });
  }

  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  if (!appId || !appCertificate) {
    console.error("❌ AGORA_APP_ID or AGORA_APP_CERTIFICATE not set in .env");
    return res.status(500).json({ error: "Agora credentials not configured on server" });
  }

  // uid 0 = wildcard (any user can use this token)
  const uidNum = parseInt(uid, 10) || 0;
  const role = RtcRole.PUBLISHER;

  // agora-token package uses DURATION in seconds (not absolute timestamps)
  const tokenExpireInSeconds = 3600;     // token valid for 1 hour
  const privilegeExpireInSeconds = 3600; // privileges valid for 1 hour

  try {
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channel,
      uidNum,
      role,
      tokenExpireInSeconds,
      privilegeExpireInSeconds
    );

    console.log(`✓ Agora token generated for channel="${channel}" uid=${uidNum}`);

    return res.json({ token });
  } catch (err) {
    console.error("❌ Token generation failed:", err);
    return res.status(500).json({ error: "Failed to generate token" });
  }
};

module.exports = { generateAgoraToken };
