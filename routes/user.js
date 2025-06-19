const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

//signup

router.post('/signup', (req, res) => {
  User.find({ email: req.body.email }).then((users) => {
    {
      if (users.length > 0) {
        return res.status(500).json({
          error: 'email already registered',
        });
      }

      cloudinary.uploader.upload(
        req.files.image.tempFilePath,
        (err, result) => {
          if (!err) {
            console.log('File details', result);

            bcrypt.hash(req.body.password, 10, (err, hash) => {
              if (err) {
                return res.status.apply(500).json({
                  error: err,
                });
              }
              const newUser = new User({
                _id: new mongoose.Types.ObjectId(),
                instituteName: req.body.instituteName,
                phone: req.body.phone,
                email: req.body.email,
                password: hash,
                imageUrl: result.secure_url,
                imageId: result.public_id,
              });
              newUser
                .save()
                .then((result) => {
                  res.status(200).json({
                    NewUser: result,
                  });
                })
                .catch((err) => {
                  console.log(err);
                  res.status(500).json({
                    error: err,
                  });
                });
            });
          } else {
            return res.status(400).json({ error: 'Image upload failed' });
          }
        }
      );
    }
  });
});

//**************     LOGIN Router  *********** */

router.post('/login', (req, res) => {
  User.find({ email: req.body.email}) // user.find return a array of email
    .then((user) => {
      if (user == 0) {
        return res.status(400).json({
          msg: 'email not registred..',
        });
      }
      
      

      bcrypt.compare(req.body.password, user[0].password, (err, password) => {
        if (err) {
          
          return res.status(500).json({
            error: 'Server Error comparing password',
          });
        }
        if (!password) {
          return res.status(400).json({
            error: 'invalid password',
          });
        }

        const token = jwt.sign(
          {
            email: user[0].email,
            instituteName: user[0].instituteName,
            phone: user[0].phone,
            uId: user[0]._id,
          },
          'ism patna',
          {
            expiresIn: '10d',
          }
        );
        return res.status(200).json({
          _id: user[0]._id,
          instituteName: user[0].instituteName,
          phone: user[0].phone,
          email: user[0].email,
          imageUrl: user[0].imageUrl,
          imageId: user[0].imageId,
          token: token,
        });
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: 'Server error.' });
    });
});

module.exports = router;
