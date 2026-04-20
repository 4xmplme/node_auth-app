const { jwtService } = require('../services');

const authMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const token = authorization.split(' ')[1];

  if (!authorization || !token) {
    res.sendStatus(401);

    return;
  }

  const userData = jwtService.validateAccessToken(token);

  if (!userData) {
    res.sendStatus(401);

    return;
  }

  req.user = userData;
  next();
};

module.exports = authMiddleware;
