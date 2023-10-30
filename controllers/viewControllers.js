const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

getOverview = catchAsync(async (req, res, next) => {
  //[1] Get tour data from collection
  const tours = await Tour.find();
  //[2] Build template
  //[3] Render that template using tour data from 1

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Tour Account',
  });
};
module.exports = { getOverview, getTour, getLoginForm, getAccount };
