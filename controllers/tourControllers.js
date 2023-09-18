const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllTours = async (req, res) => {
  try {
    // EXECUTE QUERY
    /* [1]using filter object like mongosh
    const tours = await Tour.find(req.query);
    */

    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    /* [2]using mongoose methods
   const tours = await Tour.find()
   .where('duration')
   .lte(5)
   .where('difficulty')
   .equals('easy');
   */

    const tours = await features.query;
    // SEND RES
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: tours.length,
      data: { tours },
    });
  } catch (error) {
    res.status(404).json({ status: 'fail', message: error });
  }
};

exports.createTour = async (req, res) => {
  try {
    // const newTour = new Tour({});
    // newTour.save(); // here we call the method on the instance (document)

    const newTour = await Tour.create(req.body); // here we call the method directly on the model
    res.status(201).json({ status: 'success', data: { tour: newTour } }); //201 stands for created
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

exports.getTour = async (req, res) => {
  try {
    const specificTour = await Tour.findById(req.params.id);
    // Tour.findOne({ _id: req.params.id}) //mongo itself

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: { tour: specificTour },
    });
  } catch (error) {
    res.status(404).json({ status: 'fail', message: error });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const specificTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: { tour: specificTour },
    });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    //restfully api commonly to not send any data back to the client
    await Tour.findByIdAndDelete(req.params.id);
    res.status(200).json({ status: 'success', data: null });
  } catch (error) {
    res.status(404).json({ status: 'fail', message: error.message });
  }
};

exports.aliasTopTours = (req, res, next) => {
  req.query.sort = 'price,-ratingsAverage';
  req.query.limit = '5';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';

  next();
};

exports.getTourStats = async (req, res) => {
  try {
    // we manipulate data in steps ... we pass in an array of so-called stages
    // group allows as to group documents together using accumulator
    // model.find() returns query   .....   model.aggregate() returns aggregation object

    const stats = await Tour.aggregate([
      { $match: { ratingsAverage: { $gte: 4.5 } } },
      {
        //allows us to group docs together using an acculmlator>> using _id prop
        $group: {
          // _id: null, //what we want group by and null because we want every thing in one group
          _id: { $toUpper: '$difficulty' },
          // _id: '$ratingsAverage',
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      //het we just have these fields {numRatings,..} the core fields are gone you can only use the fields and valus of prev stage
      { $sort: { avgRating: 1 } }, //1for assending
      // { $match: { _id: { $ne: 'EASY' } } },
      // { $match: { numRatings: { $ne: 41 } } },
    ]);

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: { stats },
    });
  } catch (error) {
    res.status(404).json({ status: 'fail', message: error });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year;

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${+year + 1}-01-01`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      { $addFields: { month: '$_id' } },
      { $project: { _id: 0 } },
      { $sort: { numTourStarts: -1 } },
      // { $limit: 12 },
    ]);

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: { plan },
    });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};
/* NOTEs
  __dealing with url parameters
  .we can expect as many vars/parameters as you can and also u can make it optional by adding "?" at the end
  
  __middleware
  .express does not put that body data on the request in order to have that data we have to use "middleware", and the step the request go through, in this example is simply that the data from the body is added to it to the request object
  req.body  =>> body prop gonna be available on req because of middleware

  __Model
  calling model functions (find , findOne) returns a promise of a query object which has a lot of methods at its prototype
   that u can chain them to create a complex query object to handel all the features ..... then you can await the promise of that entire query

  __parameters 
  "/api/v1/tours/?duration=5&difficulty=easy"
req.query = {duration: '5', difficulty:'easy'}

"/api/v1/tours/?duration[gte]=5&difficulty=easy"
req.query = { difficulty: 'easy', duration: { gte: '5' } }
{ difficulty: 'easy', duration: { '$gte': '5' } } after replace the operators

____mongodb aggregation pipeline : define a pipeline that all documents from a certain collection go through where they are processed step by step in order to transform them into aggregated results (avreages ,minimum , maxmimum)
  */
