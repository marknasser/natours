const fs = require('fs');

//reading local file from file system
const tours = JSON.parse(
  fs.readFileSync('${__dirname}/../dev-data/data/tours-simple.json', 'utf-8')
);

exports.checkID = (req, res, next, val) => {
  if (val > tours.length) {
    return res.status(404).json({ status: 'fail', message: 'invalid id' });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res
      .status(400) // bad request
      .json({ status: 'fail', message: "requirements doesn't match" });
  }
  next();
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: { tours },
  });
};

exports.createTour = (req, res) => {
  // checkBody(req, res, next);
  const newId = tours[tours.length - 1].id + 1;
  // const newTour = Object.assign({ id: newId }, req.body);
  const newTour = { ...req.body, id: newId };
  tours.push(newTour);
  //we are in callback funck runs in event loop and we shoyld never block the event loop
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err, data) => {
      res.status(201).json({ status: 'success', data: { tour: newTour } }); //201 stands for created
    }
  );
};

exports.getTour = (req, res) => {
  const x = req.params.id * 1; //JS converted any string able to number to number if multiplying with number
  const selectedTour = tours.find((el) => el.id === x); // const selectedTour = tours[req.params.x];
  res.status(200).json({ status: 'success', tour: selectedTour });
};

exports.updateTour = (req, res) => {
  const id = +req.params.id;

  const x = tours.findIndex((el) => el.id === id);
  // tours[x] = { ...tours[x], ...req.body };
  // fs.writeFile(z
  //   `${__dirname}/dev-data/data/tours-simple.json`,
  //   JSON.stringify(tours),
  //   (err) => {}
  // );
  // console.log(selectedTour);
};

exports.deleteTour = (req, res) => {
  const id = req.params.id * 1;

  res
    .status(204) // no content
    .json({ status: 'success', data: null });
};

/* NOTEs
__dealing with url parameters
    .we can expect as many vars/parameters as you can and also u can make it optional by adding "?" at the end

__middleware
    .express does not put that body data on the request in order to have that data we have to use "middleware", and the step the request go through, in this example is simply that the data from the body is added to it to the request object
     req.body  =>> body prop gonna be available on req because of middleware
 */
