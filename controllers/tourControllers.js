const Tour = require('../models/tourModel');

exports.getAllTours = async (req, res) => {
  try {
    // BUILD QUERY
    // 1A) Filtering

    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields']; //some parameters are't implemented yet
    excludedFields.forEach((el) => delete queryObj[el]);

    // 2B) Advanced filtering
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    let query = Tour.find(JSON.parse(queryString)); //{difficulty:'easy' , duration:{$gte:5}}

    // 2) Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      //127.0.0.1:8000/api/v1/tours?sort=price,-ratingsAverage
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // 3) Field Limiting
    if (req.query.fields) {
      //127.0.0.1:8000/api/v1/tours?fields=name,duration,price
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // 4) Pagination
    const page = +req.query.page || 1;
    const limit = +req.query.limit || 100;
    const skippedAmount = (page - 1) * limit;
    query = query.skip(skippedAmount).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      const maxPages = numTours / limit;
      // if (page > maxPages) {
      // }
      if (skippedAmount >= numTours)
        throw new Error('This Page Does Not exist !');
    }

    // EXECUTE QUERY
    const tours = await Tour.find(query);
    // const tours = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');

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
    res.status(400).json({ status: 'fail', message: 'sadasd' });
  }
};

exports.getTour = async (req, res) => {
  try {
    const specificTour = await Tour.findById(req.params.id);
    // Tour.findOne({ _id: req.params.id})

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

/* NOTEs
  __dealing with url parameters
  .we can expect as many vars/parameters as you can and also u can make it optional by adding "?" at the end
  
  __middleware
  .express does not put that body data on the request in order to have that data we have to use "middleware", and the step the request go through, in this example is simply that the data from the body is added to it to the request object
  req.body  =>> body prop gonna be available on req because of middleware

  __Model
  calling model functions (find , findOne) returns a promise of a query object which has a lot of methods at its prototype that u can chain then to create a complex query object ..... then you can await the promise of that entire query

  __parameters 
  "/api/v1/tours/?duration=5&difficulty=easy"
req.query = {duration: '5', difficulty:'easy'}

"/api/v1/tours/?duration[gte]=5&difficulty=easy"
req.query = { difficulty: 'easy', duration: { gte: '5' } }
{ difficulty: 'easy', duration: { '$gte': '5' } } after replace the operators
  */

/*
 const tours = JSON.parse(
   fs.readFileSync('${__dirname}/../dev-data/data/tours-simple.json', 'utf-8')
   );
   
   const newId = tours[tours.length - 1].id + 1;
   const newTour = Object.assign({ id: newId }, req.body);
   tours.push(newTour);
      fs.writeFile(
        `${__dirname}/../dev-data/data/tours-simple.json`,
        JSON.stringify(tours),
        (err, data) => {
          res.status(201).json({ status: 'success', data: { tour: newTour } }); //201 stands for created
        }
      );
    */

/*
   exports.checkID = (req, res, next, val) => {
     // if (val > tours.length) {
       //   return res.status(404).json({ status: 'fail', message: 'invalid id' });
       // }
       next();
      };
      */
