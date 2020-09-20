const Review = require('./../models/reviewModel');
//const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   let filter = {};

//   if (req.body.tourId) filter = { tour: req.params.tourId };

//   const reviews = await Review.find(filter);

//   res.status(200).json({
//     status: 'success',
//     results: reviews.length,
//     data: {
//       reviews
//     }
//   });
// });
exports.getAllReviews = factory.getAll(Review);

// exports.createReview = catchAsync(async (req, res, next) => {
//   //Allow nested routes
//   if (!req.body.tour) req.body.tour = req.params.tourId;
//   if (!req.body.user) req.body.user = req.user.id; //We get req.user from the protect middleware

//   //If there are fields in the req.body that are not in the Review Schema
//   //they will simply be ignored. Thats why we can create documents like this
//   const newReview = await Review.create(req.body);

//   res.status(201).json({
//     status: 'success',
//     data: {
//       review: newReview
//     }
//   });
// });
exports.createReview = factory.createOne(Review);

exports.setTourUserIds = (req, res, next) => {
  //Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id; //We get req.user from the protect middleware
  next();
};

exports.getReview = factory.getOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
