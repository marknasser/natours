const AppError = require('../utils/appError');
//Global handel middleware >> this where any error has occured in our app will arrived and handeled
module.exports = (err, req, res, next) => {
  console.log(process.env.NODE_ENV.trim() === 'production');
  // console.log(err.stack);
  //[1] create an error handling middleware
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV.trim() === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV.trim() === 'production') {
    let error = { ...err, name: err.name };
    // console.log(error);
    if (error.name === 'CastError') {
      error = handleCastErrorBD(error);
      //pass the err that mongoose created and then return new error created with our AppError Class so it will mark as operational error
    }
    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
      //pass the err that mongoose created and then return new error created with our AppError Class so it will mark as operational error
    }
    if (error.name === 'ValidationError') {
      error = handleValidationErrorsDB(error); //pass the err that mongoose created and then return new error created with our AppError Class so it will mark as operational error
    }
    if (error.name === 'JsonWebTokenError') {
      error = handleJsonWebTokenErrorJWT(error); //pass the err that mongoose created and then return new error created with our AppError Class so it will mark as operational error
    }
    if (error.name === 'TokenExpiredError') {
      error = handleTokenExpiredErrorJWT(error); //pass the err that mongoose created and then return new error created with our AppError Class so it will mark as operational error
    }
    sendErrorPro(error, res);
    // console.log(error);
    // res.status(500).json({
    //   status: 'error',
    //   message: error,
    // });
  }
};

function handleCastErrorBD(error) {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
}
function handleDuplicateFieldsDB(error) {
  const message = `Duplicate fiels value : ${error.keyValue.name}`;
  return new AppError(message, 400);
}
function handleValidationErrorsDB(error) {
  const errors = Object.values(error.errors).map((el) => el.message);
  const message = `invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
}

function handleJsonWebTokenErrorJWT(error) {
  const message = ` ${error.message} - invalid token. please log in again!`;
  return new AppError(message, 401);
}
function handleTokenExpiredErrorJWT(error) {
  const message = ` ${error.message} - invalid token. please log in again!`;
  return new AppError(message, 401);
}

function sendErrorDev(err, res) {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
}

function sendErrorPro(err, res) {
  if (err.isOperational) {
    //Operational error, trusted error : send message to client
    //we're cheking out about the error that we created using appError class which have isOpertional property
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    //[1]log error
    console.error('Error', err);
    //[2]send generic message
    //programming error, untrusted error :don't leak to client
    res.status(500).json({
      status: 'error',
      message: 'something went wrong',
    });
  }
}
/*   
there are three kind of errors come from mongoose and we need to mark them as opertional error then we can send a meaningful error to the client in production
[1] invalid ID : mongoose cann't convert to valid id  [CastError]
[2] Duplicate Database field error.code === 11000
[3] mmongoose validatio errors

*/
