const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const { promisify } = require('util'); //built in promisify function from built in 'util' module
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (currentUser, status, res) => {
  //cookie : is small piece of text that the server can send to client ... and when client recives a cokiie the brwoswer will automatically stored it and then it will send back along with all the future requests to the same server

  const token = signToken(currentUser._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 100
    ),
    // secure: true, //we're using https >> cooki will onlt be sent over an encrypted connection
    httpOnly: true, //cookie canot be accessed  or modified by any why by the browser
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  currentUser.password = undefined; // that should remove the pass only from the output
  res.status(status).json({
    status: 'success',
    token,
    data: { user: currentUser },
  });
};

const signup = catchAsync(async (req, res, next) => {
  //we do that to avoid assuming the user is admin
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role || 'user',
  });
  createSendToken(newUser, 201, res);
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //[1] check if email and password exist
  if (!email || !password) {
    //we do return to make sure this function finishs
    return next(new AppError('email and password are required', 400));
  }
  //[2] chck if the user exist & pass is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('incorrect email or password', 401));
  }

  //[3] if everything is okay, send token to client
  createSendToken(user, 200, res);
});

const protect = catchAsync(async (req, res, next) => {
  //[1] get token & check if it is exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    //authanticate user via token sent by header
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    //authanticate user via token sent by cookies
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('You are not logged in.', 401));
  }

  //a commen practice is to send a token using an http header with the request
  //[2] validate the token [test segneture] //if some one mantnipulared the data or the tokent is expired

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //[3] if the user still exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belongns to this token does no longer exist.', 401)
    );
  }
  //[4] if user change password after jwt was issued
  const isPassChangedAfterJWTIssued = currentUser.changedPasswordAfter(
    decoded.iat
  );
  if (isPassChangedAfterJWTIssued) {
    return next(
      new AppError('User recently changed password! please log in again.', 401)
    );
  }
  //Grant access to proteted route
  req.user = currentUser; //put the user in the body
  res.locals.user = currentUser;
  next();
});

const restrictTo = function (...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      //rew.user comes from protect function
      return next(
        new AppError(
          "You don't have permission to perform this application",
          403
        )
      );
    }
    next();
  };
};

const forgotPassword = async (req, res, next) => {
  //[1] get user based on email
  const currestUser = await User.findOne({ email: req.body.email });
  if (!currestUser) {
    return next(new AppError('There is no user with that email', 404));
  }

  //[2] gerneragte a random token
  const resetToken = currestUser.createPasswordResetToken();
  await currestUser.save({ validateBeforeSave: false });
  //this property in the special optian >> deactivate all the validator we specify in our schema in order to save just the two properties on that doc

  //[3] send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you did't forget your password, please ignore this email!`;
  try {
    await sendEmail({
      email: currestUser.email,
      subject: `your password reset token (valid for 10 min)`,
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to your email!',
    });
  } catch (error) {
    currestUser.createPasswordResetToken = undefined;
    currestUser.passwordResetExpires = undefined;
    await currestUser.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. try again later!',
        500
      )
    );
  }
};
const resetPassword = catchAsync(async (req, res, next) => {
  //[1] get user based on the token >> and conver it to be hashed >> then compare with saved at database

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const currentUser = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gte: Date.now() },
  });
  //[2] if token is not expired , and there is user,
  // currentUser.passwordResetExpires < Date.now() + 10 * 60 * 1000
  if (!currentUser) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  //[3]  set the new password + update chanedPasswordAt property

  currentUser.password = req.body.password;
  currentUser.passwordConfirm = req.body.passwordConfirm;
  currentUser.passwordResetExpires = undefined;
  currentUser.passwordResetToken = undefined;
  // currentUser.passwordChangedAt = new Date();
  await currentUser.save(); //and here we wants the validator that's why we're using .save not update
  //[4] log the user in
  createSendToken(currentUser, 200, res);
});

const updatePassword = catchAsync(async (req, res, next) => {
  //this only for login user
  //[1]get curret user
  // const currentUser = await User.findOne({ email: req.user.email });
  const currentUser = await User.findById(req.user.id).select('+password'); //explicilty asking for password field

  //[2]check if input pass is correct && if there is user with that email
  if (
    !currentUser ||
    !(await currentUser.correctPassword(
      req.body.currentPassword,
      currentUser.password
    ))
  ) {
    return next(new AppError('invalid cerditials!', 400));
  }
  //[3]if so, update password
  currentUser.password = req.body.password;
  currentUser.passwordConfirm = req.body.passwordConfirm;
  await currentUser.save();

  //User.findByIdAndUpdate >> wont work >> because allthe pre and validation only works for create and save
  //[4]log the user in
  createSendToken(currentUser, 200, res);
});

//only for render pages will be no error
const isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify the token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      // 2) if the user still exist
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }
      // 3) if user recently change his pass
      const isPassChangedAfterJWTIssued = currentUser.changedPasswordAfter(
        decoded.iat
      );
      if (isPassChangedAfterJWTIssued) {
        return next();
      }
      //there is an loged in user
      res.locals.user = currentUser;
      return next();
    } catch (error) {
      return next();
    }
  }
  next();
};

const logout = (req, res) => {
  res.cookie('jwt', 'dummy token', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};
module.exports = {
  signToken,
  signup,
  login,
  restrictTo,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword,
  isLoggedIn,
  logout,
};
