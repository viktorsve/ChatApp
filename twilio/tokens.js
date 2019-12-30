const twilio = require('twilio');

const { AccessToken } = twilio.jwt;
const { VideoGrant } = AccessToken;

const generateToken = config => new AccessToken(
  config.twilio.accountSid,
  config.twilio.apiKey,
  config.twilio.apiSecret
);

const videoToken = (identity, room, config) => {
  const videoGrant = typeof room !== 'undefined' ? new VideoGrant({ room }) : new VideoGrant();
  const token = generateToken(config);
  token.addGrant(videoGrant);
  token.identity = identity;
  return token;
};

module.exports = { videoToken };
