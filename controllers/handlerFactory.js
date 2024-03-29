const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
//Global Handler Functions For CRUD operations

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    //restfully api commonly to not send any data back to the client
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No Document has found with that ID', 404));
    }
    res.status(200).json({ status: 'success', data: null });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('No doc has found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: doc,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body); // here we call the method directly on the model
    res.status(201).json({ status: 'success', data: { doc: newDoc } }); //201 stands for created
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No doc has found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: doc,
    });
  });
exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // to allow for neste get revievew on tour(hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // const docs = await features.query.explain();
    const docs = await features.query;
    // SEND RES
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: docs.length,
      data: { docs },
    });
  });
