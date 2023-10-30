//handling operational erroes
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; //to condition if the error has this property we will handel it otherwise means that it's a programing error

    Error.captureStackTrace(this, this.constructor); //to capture the err.stack : which shows us where the error has happend
  }
}

//stackTrace
module.exports = AppError;
