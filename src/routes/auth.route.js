const { Router } = require('express');
const { authController } = require('../controllers');
const { catchError } = require('../utils');

const authRouter = Router();

authRouter.post('/registration', catchError(authController.register));

authRouter.get(
  '/activation/:activationToken',
  catchError(authController.activate),
);
authRouter.post('/login', catchError(authController.login));
authRouter.post('/logout', catchError(authController.logout));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.post('/reset-password', catchError(authController.resetPassword));

authRouter.post(
  '/reset-password/:token',
  catchError(authController.resetPasswordConfirmation),
);

module.exports = authRouter;
