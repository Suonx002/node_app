const express = require('express');

const router = express.Router();

const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

// POST /tours/134e/reviews
// GET /tours/134e/reviews
// GET /tours/134e/reviews/14sw

// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.authorize('user'),
//     reviewController.createReview
//   );

// mounting a router
router.use('/:tourId/reviews', reviewRouter);

// alias route top 5 cheap
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

// stats
router.route('/tour-stats').get(tourController.getTourStats);
// monthly plan
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.authorize('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
