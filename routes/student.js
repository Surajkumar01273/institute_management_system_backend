const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/checkAuth');
const Student = require('../model/Student');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secreat: process.env.API_SECRET,
});

//*****      add Student     ************** */

router.post('/add-student', checkAuth, async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const verify = jwt.verify(token, 'ism patna');
    console.log(req.body);
    console.log(req.files.image);

    const img = await cloudinary.uploader.upload(req.files.image.tempFilePath);

    const newStudent = new Student({
      _id: new mongoose.Types.ObjectId(),
      fullName: req.body.fullName,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
      imageUrl: img.secure_url,
      imageId: img.public_id,
      uId: verify.uId,
      courseId: req.body.courseId,
    });
    try {
      const studentAdded = await newStudent.save();
      res.status(200).json({
        newStudent: studentAdded,
      });
    } catch (err) {
      res.status(500).json({
        reeor: err || 'Not Save Student',
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: 'Image not Upload',
    });
  }
});

//   **********    Get all student   *************

router.get('/all-student', checkAuth, async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const verify = jwt.verify(token, 'ism patna');

    const findAllStudent = await Student.find({ uId: verify.uId }).select(
      '_id uId fullName phone address email courseId imageUrl imageId'
    );
    console.log(findAllStudent);

    return res.status(200).json({
      getAllstudent: findAllStudent,
    });
  } catch (err) {
    return res.status(500).json({
      error: err || 'Server Error',
    });
  }
});

// **********         get all student for a particular corse        ****************

router.get('/all-student/:courseId', checkAuth, async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const verify = jwt.verify(token, 'ism patna');

    const allStudent = await Student.find({
      uId: verify.uId,
      courseId: req.params.courseId,
    }).select('_id uId fullName phone address email courseId imageUrl imageId');
    if (allStudent == 0) {
      return res.status(400).json({
        message: 'No Course Available',
      });
    } else {
      return res.status(200).json({
        getAllstudent: allStudent,
      });
    }
  } catch (err) {
    return res.status(400).json({
      message: 'server error student not found',
    });
  }
});

// *******     delete a Student     **************

router.delete('/:id', checkAuth, async (req, res) => {
  const token = rea - headers.authorization.split(' ')[1];
  const verify = jwt.verify(token, 'ism patna');

  try {
    const deleteStudent = await Student.findById(req.params.id);
    console.log('delete Student', deleteStudent);

    if (deleteStudent.uId === verify.uId) {
      const deletedStudent = await Student.finstByIdAndDelete(req.params.id);
      await cloudinary.uploader.destroy(deleteStudent.imageId, (deleteimg) => {
        res.status(200).json({
          deletedStudent: deletedStudent,
        });
      });
    } else {
      res.status(400).json({
        error: 'student not delete',
      });
    }
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
});

// ***********    Update student  ***************

router.put('/:id', checkAuth, async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const verify = jwt.verify(token, 'ism patna');

  try {
    const findUpdateStudent = await Student.findById(req.params.id);
    if (findUpdateStudent.uId != verify.uId) {
      return res.status(500).json({
        msg: 'you are not eligible update Student.',
      });
    }
    if (req.files) {
      await cloudinary.uploader.destroy(
        findUpdateStudent.imageId,
        (deleteimg) => {
          cloudinary.uploader.upload(req.files.image.tempFilePath),
            (err, img) => {
              const newUpdateStudent = {
                fullName: req.body.fullName,
                phone: req.body.phone,
                email: req.body.email,
                address: req.body.address,
                image: img.secure_url,
                imageId: img.public_id,
                useId: verify.uId,
                courseId: req.body.courseId,
              };
              try {
                Student.findByIdAndUpdate(req.params.id, newUpdateStudent, {
                  new: true,
                })
                  .then((updatedStudent) => {
                    res.status(200).json({
                      newStudent: updatedStudent,
                    });
                  })
                  .catch((err) => {
                    res.status(500).json({
                      error: err,
                    });
                  });
              } catch (err) {
                return res.status(400).json({
                  error: 'not update Stusent',
                });
              }
            };
        }
      );
    } else {
      const updateStudent = {
        fullName: req.body.fullName,
        phone: req.body.phone,
        email: req.body.email,
        address: req.body.address,
        imageUrl: findUpdateStudent.imageUrl,
        imageId: findUpdateStudent.imageId,
        uId: verify.uId,
        courseId: req.body.courseId,
      };
      try {
        const updatedStudent = await Student.findByIdAndUpdate(
          req.params.id,
          updateStudent,
          { new: true }
        );
        return res.status(200).json({
          newUpdatedStudent: updatedStudent,
        });
      } catch (err) {
        console.log(err);

        return res.status(500).json({
          error: 'Not update try again',
        });
      }
    }
  } catch (err) {
    return res.status(500).json({
      error: 'not authorize',
    });
  }
});

// ***********     Get latest five student      *****************

router.get('/latest-student', checkAuth, async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const verify = jwt.verify(token, 'ism patna');

  try {
    await Student.find({ uId: verify.uId })
      .sort({ $natural: -1 })
      .limit(5)
      .then((latestStudent) => {
        return res.status(200).json({
          Lateststudent: latestStudent,
        });
      });
  } catch (err) {
    return res.status(500).json({
      error: err,
    });
  }
});

module.exports = router;
