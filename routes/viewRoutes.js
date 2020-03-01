const express = require('express');

const router = express.Router();

const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authController');

// router.get('/', (req, res) => {
//   res.status(200).render('base', {
//     tour: 'The Forest Hiker',
//     user: 'Vuthy'
//   });
// });

router.get('/', authController.isLoggedIn, viewController.getOverview);

router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);

router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/me', authController.protect, viewController.getAccount);

module.exports = router;
