const express = require('express');
const {
  createReview,
  getAllReviews,
} = require('../controllers/reviewController');

const { protect, restrictTo } = require('../controllers/authControllers');

const router = express.Router({ mergeParams: true });
//to ennable the review router to get access to params from the previouse rotue
//by defaul each router only have access to the paramter of thier specific routes
//by passing option object with mergeParams property sets to true allows u to acces tourId form othe before router

//we will endup in this router with two ways
///api/v1/tours/:tourId/reviews
///api/v1/reviews
router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'), createReview);

module.exports = router;
