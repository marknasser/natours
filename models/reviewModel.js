//review / rating / createdAt / refrenve to the tour /ref to user
const mongoose = require('mongoose');

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

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({ path: 'user', select: 'name photo' });
  this.populate({ path: 'user', select: 'name photo' });
  next();
});

const Review = new mongoose.model('Review', reviewSchema);
module.exports = Review;
