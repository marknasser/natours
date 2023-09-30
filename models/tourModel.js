const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel');

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
      // enum: ['easy', 'medium', 'difficult'],
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
      set: (val) => Math.round(val * 10) / 10, //4.666, 46.666, 4777 /4.7
    },
    ratingsQuantity: { type: Number, default: 0 },
    price: { type: Number, required: [true, 'A tour mush have a price'] },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          //that callback func has access to the input value
          // "this" only works with creation (when we create a new document) not for update
          return val < this.priceDiscount;
        },
        messages: 'Discount price ({VALUE}) should be below the regular price',
      },
    },
    summary: {
      type: String,
      trim: true, //ONLY FOR STRINGS
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
    startLocation: {
      //mongoDb:supports Geospecial data out of the box >> is data that decrupes places on earth using[longtite and latitude]
      //GeoJSON : is speciale data format mongoDB uses indorder to declare Geospecial data
      //we need type, coordinates proprtiese to regonize this object to be GeoJSON
      type: {
        //scema type option nested here
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    //inorder to create doc and embed it into another doc we have to declare an array
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // guides: Array,
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    //schema option object
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
/* improving reading docs from our collection by set indexes for specific fields to make the scan process by monoogDB engin takes less time  by scaning only doc that needed in the collection not all*/
// but we have to study the accsses patterns and know which of our fields are quered the most and set indexx for them >> because index have to update each time the collection is updated
// so if we have a high read/write ratio colllection we should never set an index for any of its fields
// 1 for sorting the indexes of the field in ascending order
// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 }); //compound index
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

/*virtual Property
:properties that i define to schema put it will not be saved to database for save space>>for EX>> it holds transformation data from km:meter  hours:minuit
we can't use viruals in a uery like Tour.find({durationWeeks:1}) because they are not a part of the database
*/
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
}); //this property will be created every time we get some data out of the database   ....... this = current doc ...thats why we'r not using arrow

// virtual populate : it's amongoose featre >> we can actualy populate the tour with reviews >> so we can get access to all reviews for a certain tour without having this endless array of reviews Id >> it;s abit like virtual field but with populate

tourSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'tour',
});
//_________DOCUMENT MIDDLEWARE
tourSchema.pre('save', function (next) {
  // console.log('pre 1');
  //DOCUMENT MIDDLEWARE: runs before only .save() and .create()  >not> .insertMany() or update
  //will be called before an actual doc is being saved to database and we we have access to this document
  // console.log(this);
  this.sulg = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   // guidesPromises is array of promises now so we have to run them
//   this.guides = await Promise.all(guidesPromises);
//   next();
//   //we are not gonna implement embbedi here beacuse user alwasys updates so we have to do alote of work update it into User itself then check if embedded and if so update embedded doc into Tour also and that is not good at allll
// });

// tourSchema.post('save', function (doc, next) {
//   //it is called after all the pre middleware funcs get called
//   console.log('post', doc);
//   next();
// });

//_____QUERY MIDDLEWARE

// tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function (next) {
  // the only difference is that this key work>> points to >> the current query object
  this.find({ secretTour: { $ne: true } }); //filter out

  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  //will be called after the query got executed that's why we can access the doc >> the query has finished
  console.log(`query took ${Date.now() - this.start} milliseconds!`);
  // console.log(docs);
  next();
});

//___________aggregate MIDDLEWARE

tourSchema.pre('aggregate', function (next) {
  //this = current aggregation object
  //this.pipeline() = current pipeline object(the array) of the current aggregation object
  // console.log(
  //   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
  // );
  //avoid using the secret tour at the aggregation pippeline
  next();
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
// mongo can parse a date from time stamp or any other forms if not it will send an error

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

/* Model: like a blueprint to create our document  and alsto to (crud on them)
schema :to create a Model we need to create a schema , so create model out of mongoose schema 
we use it to to describe our data ,set default value  , validate the data
*/
// schema: is where we model our data >> then take that schema and create model out of it
//Model:is a wraper around schema which allows us to interface  with data base in order to (create /delete..  )

/* Geospatial Queries

  */
