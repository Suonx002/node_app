const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');

const User = require('../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');

const signToken = id => {
  // id refer to mongodb user _id
  const payload = { id };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  return token;
};

const createSendToken = (user, statusCode, req, res) => {
  // create token
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
  };

  // use https in productions
  // if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
  //   cookieOptions.secure = true;
  // }

  res.cookie('jwt', token, cookieOptions);

  // hide password from response
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;
  const url = `${req.protocol}://${req.get('host')}/me`;
  console.log(url);

  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm
  });

  //send email to new user
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password'), 400);
  }

  // check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // if everything okay, send token to client
  createSendToken(user, 200, req, res);
});

// forgot password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with email address', 404));
  }

  // generate random token
  // Plain reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}\n If you didn't forget your password, please ignore this email!`;

  try {
    // send it  to user's email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/resetPassword/${resetToken}`;

    // await sendEmail({
    //   email: user.email,
    //   subject: 'Your password reset token (Valid for 10 min)',
    //   message
    // });

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token send to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    return next(
      new AppError(
        'There was an error sending the email, please try again later! ',
        500
      )
    );
  }
});

// reset password
exports.resetPassword = catchAsync(async (req, res, next) => {
  // get user based on the token

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // if token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired.', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // update changedPasswordAt property for the user

  // log the user in, send JWT to client
  createSendToken(user, 200, req, res);
});

// update password

exports.updatePassword = catchAsync(async (req, res, next) => {
  // get user from collection
  // console.log(req.user);
  const user = await User.findById(req.user.id).select('+password');

  // check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }
  // if so , update password
  // user.findByIdAndUpdate will NOT work as intended
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // log user in and send JWT
  createSendToken(user, 200, req, res);
});

// protected middleware
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // getting the token and check if it's there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access', 401)
    );
  }

  // verification token\
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token is not longer exist.', 401)
    );
  }

  // check if user changed password after the token was issued.
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // Grant access to the protected route
  req.user = currentUser;
  //for template
  res.locals.user = currentUser;

  next();
});

// only for rendered pages, no errors middleware
exports.isLoggedIn = async (req, res, next) => {
  // getting the token and check if it's there
  if (req.cookies.jwt) {
    try {
      // verification token\
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // check if user changed password after the token was issued.
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // There is a logged in user
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }

  next();
};

// authorize for certain roles only
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // roles is an array with spread operator: ['admin', 'lead-guide']
    console.log(req.user);
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }

    next();
  };
};

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    status: 'success'
  });
};
