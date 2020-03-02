const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Uncaught exception error
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION!!!! Shutting down....');
  console.log(err.name, err.message);
  // 1 uncaught, 0 success
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection successful!'));

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`);
});

// UnhandledRejection error
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLER REJECTION!!!! Shutting down....');
  server.close(() => {
    // 1 uncaught, 0 success
    process.exit(1);
  });
});

// dyno heroku sig term signal
process.on('SIGTERM', () => {
  console.log('DIGTERM RECEIVED. Shutting down gracefully');

  server.close(() => {
    console.log('Process terminated');
  });
});
