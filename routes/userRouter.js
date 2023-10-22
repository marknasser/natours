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
router.patch('/updateMyPassword', updatePassword);
router.patch('/updateMe', updateMe);
router.delete('/deleteMe', deleteMe);

//protected and restricted to 'admin' routs
router.use(restrictTo('admin'));
router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
