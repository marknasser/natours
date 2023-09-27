//___________express
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorControllers.js');

const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouter');

const app = express(); // is a Function when calling will add a punch of methods to the "app" var

//Global MIDDLEWARES
//[1]set Security https headers
app.use(helmet());
//[2]Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // a third party middleware func for show the request data on the console
}

//[3]]limit request from same IP
//implemnting Rate Limiting: as a global middleware function to prevent the same IP from making to manny reqs to our API >>>> that helps us to preventing attacks like [DOS and Broute Force]
const Limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too may requsts from this IP , please try again in an hour',
});
app.use('/api', Limiter); //apply this limiter onlt for this route which applys it on all the routs start with /api

//[4] body parser: reading data from body into req.body
app.use(
  express.json({
    limit: '10kb',
  })
); // a builtin middleware methods that allows us to access to the body of the request

//Data sanitization:means to clean all the data that comes to app from melious code
//[5] Data sanitization againes nosql query injection
app.use(mongoSanitize());
//[6] Data sanitization againes xss
app.use(xss());

//[7]prvent parameter pollution:when user duplicate fields or any thing this uses only the last one
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);
app.use((req, res, next) => {
  // Set CORS headers to allow requests from any origin
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});
//[8]servring static files
app.use(express.static(`${__dirname}/public`)); // so when we open a URL that it can't find in any of routs it will then look in that public folder that we defined and set that folder to the root
//[9] test middleware
app.use((req, res, next) => {
  // at the end of any middleware  fun should call if we not the app will stuck at this point
  // a middleware func that used to manipulate the req object
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// implement the mounting process for ROUTS structure
app.use('/api/v1/tours', tourRouter); // [2]use them as a middleware func that will be executed at specific route
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server`,
  // });

  /*
  const err = new Error(`Can't find ${req.originalUrl} on this server`);
  err.status = 'fail';
  err.statusCode = 404;
  next(err);
  */
  //by passing any argument to the next() express automatically recognaizes that is an error so>> it will skip all the middlware at the stack and jump to the error handling middleware
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;

/* the request-response cycle:
[1] when express app receives a request when someone hits a server , will then create a req&res object that data will then be used and processed in order to generate a meaningful response and in order to processed that data in express we use middleware which can manipulate the request and res objects or execute any other code 
[2] it's called called middleware because it's a func that is executed between , in the middle of receiving req and sending res ,  we could say that in express all thing is middleware even(routers) so routs is midlleware function that only apllys for a certain url
[3] all the middleware that we use in the app together called "middleware stack" and the order of middlewares in the middleware stack is defines as the order in the code , and at the end off each middleware func a 'next' func is called  
a middleware is basically a function that can modify the incoming request data, so it's stands between the request and the response , it's just the step that the request goes through while it's being processed
 - the "use" method is a used to add a middleware function to the middleware stack
 -  we have to send back something in order to finish request/response cycle
*/
/* static file:the files that are sitting in our file system that we cannot access using all routs ,instead we need to use built-in express middleware called "static" and it works for files not folders*/
