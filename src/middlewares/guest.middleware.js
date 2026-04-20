const { jwtService } = require('../services');
const { ApiError } = require('../exceptions');

const guestMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization || '';

  if (!authorization.toLowerCase().startsWith('bearer ')) {
    return next();
  }

  const token = authorization.slice(7);
  const userData = token ? jwtService.validateAccessToken(token) : null;

  if (userData) {
    return next(ApiError.badRequest('Already authenticated'));
  }

  next();
};

module.exports = guestMiddleware;
