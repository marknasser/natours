const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     // user-userID-timestamp.jpeg
//     //req.file  has all the info >> i have a question from does where the file come?
//     const extintion = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${extintion}`);
//   },
// });

const multerStorage = multer.memoryStorage(); // image will be saved as a buffer
//so we keep the image in memmory to keep it then we resize it when it stills a buffer
const multerFilter = (req, file, cb) => {
  //filter the uploded file is an image

  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image Please upload onlt images.', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
const uploadUserPhoto = upload.single('photo');

const resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`; // we need to define the filename because we relay on it at onther middleware

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

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
  // console.log('fileeeeee', req.file);
  // console.log('bodyyyyyy', req.body);
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
  if (req.file) filteredBody.photo = req.file.filename;

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
  //user can only deactive himself _ admin can delete from DB
  await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! please use /signup',
  });
};
const getUser = factory.getOne(User);
const getAllUsers = factory.getAll(User);
const updateUser = factory.updateOne(User);
const deleteUser = factory.deleteOne(User);

module.exports = {
  updateMe,
  deleteMe,
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto,
};
