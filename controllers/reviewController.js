const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewModel');
const Tour = require('../models/tourModel');

const createReview = catchAsync(async (req, res, nex) => {
  console.log(req.params);
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  const newReview = await Review.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});

const getAllReviews = catchAsync(async (req, res, nex) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };
  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

module.exports = { createReview, getAllReviews };
