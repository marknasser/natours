const Tour = require('../models/tourModel');
exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res
      .status(400) // bad request
      .json({ status: 'fail', message: "requirements doesn't match" });
  }
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find();
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
  console.log(req.body);
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
    //restfull api commonly to not send any data back to the client
    await Tour.findByIdAndDelete(req.params.id);
    res.status(200).json({ status: 'success', data: null });
  } catch (error) {
    res.status(404).json({ status: 'fail', message: error.message });
  }
};

/* NOTEs
  __dealing with url parameters
  .we can expect as many vars/parameters as you can and also u can make it optional by adding "?" at the end
  
  __middleware
  .express does not put that body data on the request in order to have that data we have to use "middleware", and the step the request go through, in this example is simply that the data from the body is added to it to the request object
  req.body  =>> body prop gonna be available on req because of middleware
  */

/*
 const tours = JSON.parse(
   fs.readFileSync('${__dirname}/../dev-data/data/tours-simple.json', 'utf-8')
   );
   
   const newId = tours[tours.length - 1].id + 1;
   // const newTour = Object.assign({ id: newId }, req.body);
   const newTour = { ...req.body, id: newId };
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
// const x = tours.findIndex((el) => el.id === id);
// tours[x] = { ...tours[x], ...req.body };
// fs.writeFile(
//   `${__dirname}/dev-data/data/tours-simple.json`,
//   JSON.stringify(tours),
//   (err) => {} //const x = req.params.id * 1; //JS converted any string able to number to number if multiplying with number
// );
// console.log(selectedTour);

// const selectedTour = tours.find((el) => el.id === x); // const selectedTour = tours[req.params.x];
//res.status(200).json({ status: 'success', tour: selectedTour });
