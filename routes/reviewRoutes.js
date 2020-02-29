const express = require('express');
// has access to tourId
const router = express.Router({ mergeParams: true });

const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

router.use(authController.protect);

// POST /tours/tourId/reviews
// GET /tours/tourId/reviews
//POST /reviews

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.authorize('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.authorize('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.authorize('user', 'admin'),
    reviewController.deleteReview
  );

module.exports = router;
