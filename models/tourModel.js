const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour mush have a name'], //called validator cause it used to validate our data
      unique: true,
      trim: true,
      maxLength: [40, 'A tour name must have less or equal than 40 characters'],
      minLength: [10, 'A tour name must have more or equal than 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String,

    duration: { type: Number, required: [true, 'A tour mush have a duration'] },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour mush have a max group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour mush have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1'],
      max: [5, 'Rating must be below 5'],
    },
    ratingsQuantity: { type: Number, default: 0 },
    price: { type: Number, required: [true, 'A tour mush have a price'] },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          //this has access to the input value only works with creation (when we create a new document)
          return val < this.priceDiscount;
        },
        messages: 'Discount price ({VALUE}) should be below the regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour mush have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour mush have a cover image'],
    },
    images: [String],
    createdAt: { type: Date, default: Date.now(), select: false },
    startDates: [Date],
    secretTour: { type: Boolean, default: false },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
}); //this property will be created every time we get some data out of the database   ....... this =current doc

tourSchema.pre('save', function (next) {
  //DOCUMENT MIDDLEWARE: runs before only .save() and .create()  >not> .insertMany()
  //will be called before an actual doc is saved to database
  //we have access to the document which is being proceeded and in that middle ware the doc is being saved
  // console.log(this);
  this.sulg = slugify(this.name, { lower: true });
  next();
});

//_____QUERY MIDDLEWARE

// tourSchema.pre('save', function (next) {
//   console.log('pre 2');
//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   //it is called after all the pre middleware func get called
//   console.log('post', doc);
//   next();
// });

// tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function (next) {
  // the only difference is that this key work>> points to >> the current query
  this.find({ secretTour: { $ne: true } }); //filter out

  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  //will be called after the query get executed
  console.log(`query took ${Date.now() - this.start} milliseconds!`);
  // console.log(docs);
  next();
});

tourSchema.pre('aggregate', function (next) {
  //this = aggregation object
  console.log(
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
  );
  next();
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
// mongo can parse a date from time stamp or any other forms if not it will send an error
/*virtual Property
:properties that i define to schema put it will not be saved to database >>for EX>> it holds transformation data from km:meter  hours:minuit
we can't use viruals in a uery like Tour.find({durationWeeks:1}) because they are not a part of the database
*/

/*  mongoose middleware  called [pre and post hooks]
> we use it to make something happens between two events for example each time a new doc is saved we can run a func between the save command and the actual saving  or after the actual saving >>so before or after a certain event
[document middleware]:can act on the currently proceed document 
[query middleware]:runs before or a after a certain query get executed
[aggregate middleware]:runs before or after an aggregation object get executed
[model middleware]:

*/

/*  
validation :is checking if the input values meet the form which is defined at schema
and "sanitization" which is making sure there isn't malicious code injects at the input data 

custom validators: a validator is func which returns either true or false
*/
