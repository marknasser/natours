const express = require('express');
const {
  createReview,
  getAllReviews,
  deleteReview,
  updateReview,
  setTourUserIds,
  getReview,
} = require('../controllers/reviewController');

const { protect, restrictTo } = require('../controllers/authControllers');

const router = express.Router({ mergeParams: true });
router.use(protect);
router
  .route('/')
  .get(getAllReviews)
  .post(restrictTo('user'), setTourUserIds, createReview);

router
  .route('/:id')
  .delete(restrictTo('user', 'admin'), deleteReview)
  .patch(restrictTo('user', 'admin'), updateReview)
  .get(getReview);

module.exports = router;

//to ennable the review router to get access to params from the previouse rotue
//by defaul each router only have access to the paramter of thier specific routes
//by passing option object with mergeParams property sets to true allows u to acces tourId form othe before router

//we will endup in this router with two ways
///api/v1/tours/:tourId/reviews
///api/v1/reviews
