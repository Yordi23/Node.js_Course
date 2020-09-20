const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name.'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      minlength: [10, 'A tour name must have more or equal than 10 characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must hace a duration,']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must hace a group size,']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must hace a difficulty,'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium or difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          //'this' only points to current doc on NEW documents, it's not going to work while updating
          return val < this.price;
        },
        message: 'Discount price {{VALUE}}should be below regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDate: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      // GeoJSON to specify GeoSpatial data. In mongo DB to specify this type of object, we
      //need to specify at least to fields: type (which has to be type string and the values Point
      //or any other supported shapes) and coordinates which is an array of numbers.
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    //Emmbeded documents needs to be specified as an array
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  //This will ensure that when we have a virtual propertie (a calculated field that is not stored is
  //the DB) this showup when there is an output
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

//Virtual variables
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

//Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

//Document Middleware: runs before .save() and .create()
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//Query Middleware

/*This middlware works only for the "find" method.
tourSchema.pre('find', function(next)

But if use a regular expression we can make it work for all the methods
that start with the "find" string like "findOne" for example*/
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

// This query middleware will populate all the guides corresponding to the tours
//in each query
tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });

  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});

//Aggregation Middleware
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
