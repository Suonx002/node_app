const express = require('express');
// has access to tourId
const router = express.Router({ mergeParams: true });

const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

// POST /tours/tourId/reviews
// GET /tours/tourId/reviews
//POST /reviews

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.authorize('user'),
    reviewController.createReview
  );

module.exports = router;
