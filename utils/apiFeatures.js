class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields']; //some parameters are't implemented yet
    excludedFields.forEach((el) => delete queryObj[el]);

    // 2B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr)); //{difficulty:'easy' , duration:{$gte:5}}
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      //127.0.0.1:8000/api/v1/tours?sort=price,-ratingsAverage
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    // 3) Field Limiting
    if (this.queryString.fields) {
      //127.0.0.1:8000/api/v1/tours?fields=name,duration,price
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  paginate() {
    // 4) Pagination
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 100;
    const skippedAmount = (page - 1) * limit;
    this.query = this.query.skip(skippedAmount).limit(limit);

    return this;
  }
}
module.exports = APIFeatures;

// BUILD QUERY
// 1A) Filtering
/*
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
*/

/*
    // 2) Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      //127.0.0.1:8000/api/v1/tours?sort=price,-ratingsAverage
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
*/
/*
    // 3) Field Limiting
    if (req.query.fields) {
      //127.0.0.1:8000/api/v1/tours?fields=name,duration,price
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }
*/
/*
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
*/
