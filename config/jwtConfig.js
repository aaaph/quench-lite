const genJti = () => {
  let jti = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 16; i++) {
    jti += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return jti;
};
module.exports = {
  secret: process.env.JWT_TOKEN_SECRET,
  refresh_token_life: 300 * 2,
  token_life: 300,
  issuer: process.env.JWT_ISSUER,
  sub: process.env.JWT_SUB,
  jti: genJti()
};
