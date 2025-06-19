const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors')

const userRoute = require('./routes/user');
const courseRoute = require('./routes/course');
const studentRoute = require('./routes/student');
const feeRoute = require('./routes/fee');

//   *************    Data Base connect     *************

mongoose
  .connect(process.env.MONGOOSE_URL)
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch((error) => {
    console.log('Database connection failed', error);
  });

app.use(bodyParser.json());
app.use(cors())

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
  })
);

app.use('/user', userRoute);
app.use('/course', courseRoute);
app.use('/student', studentRoute);
app.use('/fee', feeRoute);

app.use('*', (req, res) => {
  res.status(404).json({
    msg: 'bad router request',
  });
});

module.exports = app;
