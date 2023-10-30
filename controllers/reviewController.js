const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewModel');
const Tour = require('../models/tourModel');
const factory = require('./handlerFactory');

const setTourUserIds = async (req, res, next) => {
  //middleware to set the tour and the user to the req if not provided
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  // //if the tour.reviews don't have a review from a user with that id
  // const tour = await Tour.findById(req.params.tourId);
  // const isExist = tour.reviews.findIndex((rev) => (rev.user = req.user.id));

  next();
};
const createReview = factory.createOne(Review);
const getAllReviews = factory.getAll(Review);
const deleteReview = factory.deleteOne(Review);
const updateReview = factory.updateOne(Review);
const getReview = factory.getOne(Review);

module.exports = {
  createReview,
  getAllReviews,
  deleteReview,
  updateReview,
  setTourUserIds,
  getReview,
};

// const getAllReviews = catchAsync(async (req, res, nex) => {
//   let filter = {};
//   if (req.params.tourId) filter = { tour: req.params.tourId };
//   const reviews = await Review.find(filter);

//   res.status(200).json({
//     status: 'success',
//     results: reviews.length,
//     data: {
//       reviews,
//     },
//   });
// });
