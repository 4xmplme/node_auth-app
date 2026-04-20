const { usersService, emailService } = require('../services');
const { User, SocialAccount } = require('../models');
const { ApiError } = require('../exceptions');
const bcrypt = require('bcrypt');

const getAll = async (req, res) => {
  const users = await usersService.getAllActive();

  res.send(users.map(usersService.normalize));
};

const updateName = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw ApiError.badRequest('Name is required');
  }

  const user = await User.findByPk(req.user.id);

  user.name = name;
  await user.save();

  res.send(usersService.normalize(user));
};

const updatePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmation } = req.body;

  if (!newPassword || newPassword !== confirmation) {
    throw ApiError.badRequest('Passwords do not match');
  }

  if (newPassword.length < 6) {
    throw ApiError.badRequest('Bad Request', {
      password: 'At least 6 characters',
    });
  }

  const user = await User.findByPk(req.user.id);
  const isValid = await bcrypt.compare(oldPassword, user.password);

  if (!isValid) {
    throw ApiError.badRequest('Wrong old password');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.send({ message: 'Password updated successfully' });
};

const updateEmail = async (req, res) => {
  const { password, newEmail } = req.body;
  const user = await User.findByPk(req.user.id);

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw ApiError.badRequest('Wrong password');
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!newEmail || !emailPattern.test(newEmail)) {
    throw ApiError.badRequest('Bad Request', { email: 'Email is not valid' });
  }

  const existing = await usersService.getByEmail(newEmail);

  if (existing) {
    throw ApiError.badRequest('Email is already taken');
  }

  const oldEmail = user.email;

  user.email = newEmail;
  await user.save();

  await emailService.sendEmailChangeNotification(oldEmail);

  res.send({
    message: 'Email updated successfully',
    user: usersService.normalize(user),
  });
};

const getSocialAccounts = async (req, res) => {
  const accounts = await SocialAccount.findAll({
    where: { userId: req.user.id },
    attributes: ['provider', 'providerId'],
  });

  res.json(accounts);
};

const removeSocialAccount = async (req, res) => {
  const { provider } = req.params;
  const removed = await SocialAccount.destroy({
    where: { userId: req.user.id, provider },
  });

  if (!removed) {
    return res.status(404).send({ message: 'Social account not found' });
  }

  res.sendStatus(204);
};

module.exports = {
  getAll,
  updateName,
  updatePassword,
  updateEmail,
  getSocialAccounts,
  removeSocialAccount,
};
