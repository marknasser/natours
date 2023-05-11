const express = require('express');

const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
} = require('../controllers/tourControllers');

const router = express.Router(); // [1]create route to use as a sub app

router.route('/top-5-cheap').get(aliasTopTours, getAllTours); // a middle where for manipulate the req.query in order to create an Alias route for a common request
router.route('/').get(getAllTours).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

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
