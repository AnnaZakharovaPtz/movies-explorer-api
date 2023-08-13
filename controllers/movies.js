const mongoose = require('mongoose');
const Movie = require('../models/movie');
const NotFoundError = require('../errors/not-found-err');
const ForbiddenError = require('../errors/forbidden-error');
const BadRequestError = require('../errors/bad-request-error');
const { FORBIDDEN_ERROR_MSG, NOT_FOUND_MOVIE_MSG } = require('../errors/error-messages');

const DOCUMENT_CREATED = 201;

const getMovies = (req, res, next) => {
  Movie.find({})
    .then((movies) => {
      res.send(movies);
    })
    .catch(next);
};

const createMovie = (req, res, next) => {
  const params = req.body;
  params.owner = req.user._id;
  Movie.create(params)
    .then((movie) => {
      res.status(DOCUMENT_CREATED).send(movie);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        next(new BadRequestError(err.message));
        return;
      }
      next(err);
    });
};

const removeMovieById = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .then((movie) => {
      if (movie) {
        if (req.user._id === movie.owner.toString()) {
          movie.deleteOne()
            .then((deletedMovie) => {
              res.send(deletedMovie);
            })
            .catch(next);
        } else {
          throw new ForbiddenError(FORBIDDEN_ERROR_MSG);
        }
      } else {
        throw new NotFoundError(NOT_FOUND_MOVIE_MSG);
      }
    })
    .catch(next);
};

module.exports = {
  getMovies,
  createMovie,
  removeMovieById,
};
