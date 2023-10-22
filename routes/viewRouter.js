const express = require('express');
const { isLoggedIn, protect } = require('../controllers/authControllers');

const {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
} = require('../controllers/viewControllers');
const router = express.Router();

router.get('/', isLoggedIn, getOverview);
router.get('/login', isLoggedIn, getLoginForm);
router.get('/tour/:slug', isLoggedIn, getTour);
router.get('/me', protect, getAccount);

module.exports = router;
