const express = require('express');
const passport = require('passport');
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const requireAuth = passport.authenticate('jwt', {session:false})
const requireSignin = passport.authenticate('local', {session:false})
// Do work here
router.get('/', storeController.homePage);
router.get('/add', storeController.addStore);
router.post('/add', storeController.createStore);
router.get('/login', userController.loginForm);
router.post('/login',requireSignin, authController.signin);
router.get('/register', userController.registerForm);
router.post('/register',userController.register,requireSignin, authController.signin);
router.get('/logout', authController.logout);
router.get('/account', authController.isLoggedIn, userController.accounts);
router.post('/account', userController.updateUser);
router.get('/account/forgot', userController.passwordReset);
router.post('/account/forgot', authController.forgot);
router.get('/account/reset/:token', authController.reset);
router.post('/account/reset/:token', authController.confirmPassword, authController.update);

module.exports = router;
