const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const app = express();

//GLOBAL MIDDLEWARES

//Set security HTTP headers
app.use(helmet());

//Development logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

//Limit request from same Ip (Rate Limiting)
const limiter = rateLimit({
  max: 3, // 100 request
  windowMs: 60 * 60 * 1000, // In 1 hour per ip
  message: 'Too many requests from this IP, please try again in an hour.'
});

app.use('/api', limiter);

//Body parser, reading data from body into req.body. Limit data size.
app.use(express.json({ limit: '10kb' }));

//Serving static files
app.use(express.static(`${__dirname}/public`));

//Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//ROUTES

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//ERROR HANDLING

//If the request is not catched in any of the previous handlers, we handle
//the error by sending the following response. This works for any http methods.
app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server.`);
  // err.status = 'fail';
  // err.statusCode = 404;

  //Express will asumme that anything we pass as parameter into next() function
  //is an error
  next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
