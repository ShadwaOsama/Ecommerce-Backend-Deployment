const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY} = process.env;

function signToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET_KEY, {
    expiresIn: '1d'
  });
}

module.exports = signToken;