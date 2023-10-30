//review / rating / createdAt / refrenve to the tour /ref to user
const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: { type: String, require: [true, 'A review mush have a content'] },
    rating: { type: Number, min: 1, max: 5 },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      require: [true, 'a Review must belong to a tour'],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      require: [true, 'a Review must belong to a user'],
    },
  },
  {
    //schema option object
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
reviewSchema.index({ tour: 1, user: 1 }, { unique: true }); //by this simple index we have creade a copound index so the user,tour can only neet once

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({ path: 'user', select: 'name photo' });
  this.populate({ path: 'user', select: 'name photo' });
  next();
});
//static method on our schema:
reviewSchema.statics.calcAverageRatings = async function (tourID) {
  //this > points to the current Model
  //that's why we need static method to call aggregate on model
  //[1]we call it after a new review has been created to calc avg and rating for each of tour
  const stats = await this.aggregate([
    {
      $match: { tour: tourID },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgrating: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stats);
  //[2] updtate the specif tour that related to this review
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourID, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgrating,
    });
  } else {
    //means all review are gone for this specic tour
    await Tour.findByIdAndUpdate(tourID, {
      ratingsQuantity: 0,
      ratingsAverage: 4.8,
    });
  }
};

reviewSchema.post('save', function () {
  //this => points to current review doc
  //constructor=> the model who created the doc
  // Review.calcAverageRatings(this.tour);
  this.constructor.calcAverageRatings(this.tour);
});

// reviewSchema.pre(/^findOneAnd/, async function (next) {
//   //findOneAndUpdate
//   //findOneandDelete
//   const currentReview = await this.findOne(); //we actuale execute the query object inorder to get the document
//   //   currentReview.constructor.calcAverageRatings(currentReview.tour._id);
//   this.r = currentReview;
//   next();
// });

reviewSchema.post(/^findOneAnd/, async function (docs) {
  // console.log('docs', docs);
  // await this.r.constructor.calcAverageRatings(this.r.tour)
  console.log(docs);
  await docs.constructor.calcAverageRatings(docs.tour);
});

const Review = new mongoose.model('Review', reviewSchema);
module.exports = Review;
