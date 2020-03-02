const express = require('express');

const router = express.Router();

const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Need to be authenticated to access the below routes
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);

router.get(
  '/me',

  userController.getMe,
  userController.getUser
);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
