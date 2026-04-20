const { jwtService } = require('../services');
const { ApiError } = require('../exceptions');

const authMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization || '';

  if (!authorization.toLowerCase().startsWith('bearer ')) {
    return next(ApiError.unauthorized());
  }

  const token = authorization.slice(7);

  if (!token) {
    return next(ApiError.unauthorized());
  }

  const userData = jwtService.validateAccessToken(token);

  if (!userData) {
    return next(ApiError.unauthorized());
  }

  req.user = userData;
  next();
};

module.exports = authMiddleware;
