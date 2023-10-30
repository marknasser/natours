const express = require('express');

const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto,
} = require('./../controllers/userControllers');

const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo,
  logout,
} = require('../controllers/authControllers');

const router = express.Router();
//public Routs
router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.patch('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

//protected Routs
router.use(protect);
router.get('/me', getMe, getUser);
router.delete('/deleteMe', deleteMe);
router.patch('/updateMyPassword', updatePassword);
router.patch('/updateMe', uploadUserPhoto, resizeUserPhoto, updateMe);
//the name of the field of the form that wiil update the image

//protected and restricted to 'admin' routs
router.use(restrictTo('admin'));
router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
/*  
we don't upload images directly in dataBase we update them in our file system and we put the link in the database

*/
