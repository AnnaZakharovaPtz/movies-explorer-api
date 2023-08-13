const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized-error');
const { UNAUTHORIZED_ERROR_MSG } = require('../errors/error-messages');
const { SERVER_SECRET } = require('../config');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    next(new UnauthorizedError(UNAUTHORIZED_ERROR_MSG));
    return;
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(
      token,
      SERVER_SECRET,
    );
  } catch (err) {
    next(new UnauthorizedError(UNAUTHORIZED_ERROR_MSG));
    return;
  }

  req.user = payload;
  next();
};
