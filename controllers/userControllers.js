const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const filterObj = (obj, ...allwedFields) => {
  const newObject = {};
  Object.keys(obj).forEach((el) => {
    if (allwedFields.includes(el)) {
      newObject[el] = obj[el];
    }
  });
  return newObject;
};

const updateMe = catchAsync(async (req, res, next) => {
  // [1] create error if he trys to update the password
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route not for password update , please use /updateMypassword',
        400
      )
    );
  }

  // [2]update user document .. with only the field that are allowed to be updated
  // const currentUser = await User.findById(req.user.id);
  // currentUser.name = 'mark';
  // await currentUser.save(); //i have a bug this should giives me an error because i don't send all the requirments fields -- but it doesnt

  const filteredBody = filterObj(req.body, 'name', 'email');

  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  //
  res.status(200).json({
    status: 'success',
    data: {
      user: updateUser,
    },
  });
});

const deleteMe = catchAsync(async (req, res, next) => {
  console.log('you have reated here');
  await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: users.length,
    data: { users },
  });
});

const createUser = (req, res) => {
  res
    .status(500) // means internal server error
    .json({ status: 'error', message: 'this route is not yet defined' });
};

const getUser = (req, res) => {
  res
    .status(500) // means internal server error
    .json({ status: 'error', message: 'this route is not yet defined' });
};

const updateUser = (req, res) => {
  res
    .status(500) // means internal server error
    .json({ status: 'error', message: 'this route is not yet defined' });
};

const deleteUser = (req, res) => {
  res
    .status(500) // means internal server error
    .json({ status: 'error', message: 'this route is not yet defined' });
};

module.exports = {
  updateMe,
  deleteMe,
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
};
