const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const { errors } = require('celebrate');
const limiter = require('./middlewares/api-limiter');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const errorHandler = require('./middlewares/error-handler');
const mainRouter = require('./routes/index');
const { SERVER_PORT, DB } = require('./config');

const app = express();

mongoose.connect(DB);

app.use(helmet());
app.use(limiter);
app.use(express.json());
app.use(requestLogger);

app.use('/api/', mainRouter);

app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

app.listen(SERVER_PORT);
