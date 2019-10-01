const request = require("request");

module.exports = {
  getUser: async accessToken => {
    const options = {
      method: "GET",
      uri: `https://graph.facebook.com/v4.0/me`,
      qs: {
        access_token: accessToken,
        fields: "id,name,picture.type(large),email"
      }
    };
    return new Promise((resolve, reject) => {
      request(options, (err, res, body) => {
        if (err) {
          reject(err);
        }

        const data = JSON.parse(body);
        resolve(data);
      });
    });
  },

  generateLongLiveUserAccessToken: async accessToken => {
    const options = {
      method: "GET",
      uri: `https://graph.facebook.com/v4.0/oauth/access_token`,
      qs: {
        grant_type: "fb_exchange_token",
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        fb_exchange_token: accessToken
      }
    };
    return new Promise((resolve, reject) => {
      request(options, (err, res, body) => {
        if (err) {
          reject(err);
        }

        const data = JSON.parse(body);
        resolve(data);
      });
    });
  }
};
