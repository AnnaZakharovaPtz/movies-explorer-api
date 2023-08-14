const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { default: mongoose } = require('mongoose');
const User = require('../models/user');
const BadRequestError = require('../errors/bad-request-error');
const UnauthorizedError = require('../errors/unauthorized-error');
const NotFoundError = require('../errors/not-found-err');
const ConflictError = require('../errors/conflict-error');
const { AUTH_DATA_ERROR_MSG, CONFLICT_ERROR_MSG, NOT_FOUND_USER_MSG } = require('../errors/error-messages');
const { SERVER_SECRET, SALT_ROUNDS } = require('../config');

const DOCUMENT_CREATED = 201;

const login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError(AUTH_DATA_ERROR_MSG);
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new UnauthorizedError(AUTH_DATA_ERROR_MSG);
          }
          const token = jwt.sign(
            { _id: user._id },
            SERVER_SECRET,
            { expiresIn: '7d' },
          );
          res.send({ token });
        })
        .catch(next);
    })
    .catch(next);
};

const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (user) {
        res.send(user);
      }
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  const {
    email, password, name,
  } = req.body;

  bcrypt.hash(password, SALT_ROUNDS)
    .then((hash) => User.create({
      email, password: hash, name,
    }))
    .then((user) => {
      res.status(DOCUMENT_CREATED).send(user.toObject({ useProjection: true }));
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        next(new BadRequestError(err.message));
        return;
      }
      if (err.name === 'MongoServerError' && err.code === 11000) {
        next(new ConflictError(CONFLICT_ERROR_MSG));
        return;
      }
      next(err);
    });
};

const updateUserProfile = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    { new: true },
  )
    .then((user) => {
      if (user) {
        res.send(user);
      } else {
        throw new NotFoundError(NOT_FOUND_USER_MSG);
      }
    })
    .catch((err) => {
      if (err.name === 'MongoServerError' && err.code === 11000) {
        next(new ConflictError(CONFLICT_ERROR_MSG));
        return;
      }
      if (err instanceof mongoose.Error.ValidationError) {
        next(new BadRequestError(err.message));
        return;
      }
      next(err);
    });
};

module.exports = {
  login,
  getCurrentUser,
  createUser,
  updateUserProfile,
};
