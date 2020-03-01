const catchAsync = require('./../utils/catchAsync');

const Tour = require('./../models/tourModel');

exports.getOverview = catchAsync(async (req, res, next) => {
  // get tour data from collection
  const tours = await Tour.find();

  //  build template

  // render that template using tour data from the collection

  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });
  // build template

  //render template using data from 1)
  res.status(200).render('tour', {
    title: 'The Forest Hiker',
    tour
  });
});
