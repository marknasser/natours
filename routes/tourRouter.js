const express = require('express');

const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getTourWithin,
  getDistances,
  uploadTourImages,
  resizeTourImages,
} = require('../controllers/tourControllers');
const reviewController = require('../controllers/reviewController');
const reviewRouter = require('./reviewRouter');

const { protect, restrictTo } = require('../controllers/authControllers');
const router = express.Router(); // [1]create route to use as a sub app

// router
//   .route('/:tourId/reviews')
//   .post(protect, restrictTo('user'), reviewController.createReview);

// nested Route
// post /tour/:ToureId/reviews
// get /tour/:ToureId/reviews
// get /tour/:ToureId/reviews/:reviewID
//express feature merge param

router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours); // a middle where for manipulate the req.query in order to create an Alias route for a common request
router.route('/tour-stats').get(getTourStats);
router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(
    protect,
    restrictTo('admin', 'lead-guide'),
    uploadTourImages,
    resizeTourImages,
    updateTour
  )
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

router.route('/distance/:coordinats/unit/:unit').get(getDistances);

router
  .route('/tours-within/:distance/center/:coordinats/unit/:unit')
  .get(getTourWithin);
// /tours-within?distance=233&center=-40,40&unit=ml
// /tours-within/distance/233/center/-40,40/unit/ml

module.exports = router;
// ___________ Routs Routing : determine how an application responds to a certain URL request

/*
app.get('/api/v1/tours', getAllTours);
app.post('/api/v1/tours', createTour);
app.get('/api/v1/tours/:id/:optional?', getTour);
app.patch(`/api/v1/tours/:id/`, updateTour);
app.delete('/api/v1/tours/:id', deleteTour);

app.route('/api/v1/tours).get().post()
*/
// app.use((req, res, next) => {
//   // this method will not get executed while calling the URL of get all tours because in the route we sending back the request which means that the req/res cycle has been finished
//   console.log('custom middleware func 2 ');
//   next();
// });

/* param middleware: is middleware that only runs for certain parameters, so when have a certain parameter in our URL or on our request  */
