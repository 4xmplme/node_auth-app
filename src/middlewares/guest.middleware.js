const { jwtService } = require('../services');
const { ApiError } = require('../exceptions');

const guestMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization || '';
  let userData = null;

  if (authorization.toLowerCase().startsWith('bearer ')) {
    const token = authorization.slice(7);

    userData = token ? jwtService.validateAccessToken(token) : null;
  }

  if (!userData) {
    const { refreshToken } = req.cookies;

    userData = refreshToken
      ? jwtService.validateRefreshToken(refreshToken)
      : null;
  }

  if (userData) {
    return next(ApiError.badRequest('Already authenticated'));
  }

  next();
};

module.exports = guestMiddleware;
