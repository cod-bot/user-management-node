const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const crypto = require('crypto');
const promisify = require('es6-promisify');
var nodemailer = require('nodemailer');
const jwt = require('jwt-simple');

// exports.login = passport.authenticate('local'),
// function(req, res) {
//   // If this function gets called, authentication was successful.
//   // `req.user` contains the authenticated user.
//   // Then you can send your json as response.
//   res.json({message:"Success", username: req.user});
// };


function tokenForUser(user){
    const timestamp = new Date().getTime()
    return jwt.encode({ sub: user.id, iat: timestamp }, process.env.SECRET);    
}

exports.signin = function(req,res,next){
    res.send({token:tokenForUser(req.user), email: req.user.email})
}

exports.logout = (req, res) => {
    req.logout();
    req.flash('success you are logged out');
    res.json({message: 'success'});
}

exports.setResponse = (req, res) => {
    res.json('success')
}

exports.isLoggedIn = (req, res, next) => {
    // first check if the user is authenticated
    if (req.isAuthenticated()) {
      next();
      return;
    }
    req.flash('error', 'Oops you must be logged in to do that!');
    return  res.status(400).send({message: 'login error'});
  };

 exports.forgot = async (req, res) => {
    // check user, set token, set expiry , send token to user, redirect to login
        const user =  await User.findOne({email: req.body.email});
        if(!user) {
            req.flash('error','no account found');
            return res.status(400).send({message: 'no account found'});
        }
        user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
        await user.save();
        const resetUrl = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;

        // send mail
        let transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'vspillai681@gmail.com',
                pass: 'vishnu@123' // 
            }
        });

        // configure mail options
        var mailOptions = {
            from: 'vspillai681@gmail.com', // sender address
            to: req.body.email, // list of receivers
            subject: 'Password Reset', // Subject line
            text: resetUrl //, // plaintext body
        };

        //  sending phase
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                req.status(400).send({message: 'something went wrong'});
            }else{
                console.log('Message sent: ' + info.response);
                req.flash('success', `You have been emailed a password reset link`);
                res.status(200).send({message:'success'});
            };
        });
       
    };

    exports.reset = async (req, res) => {
        const user =  await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if(!user) {
            req.flash('error', 'password reset has expired')
            return res.status(401).send({message: 'password reset has expired'});
        }
        res.render('reset', { title: 'Reset Your password'})
    };

    exports.confirmPassword = (req, res, next) => {
        if (req.body.password === req.body['password-confirm']) {
            next(); // keepit going!
            return;
          }
          req.flash('error', 'Passwords do not match!');
          res.redirect('back');
    };

    exports.update = async(req, res) => {
        const user =  await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if(!user) {
            req.flash('error', 'password reset has expired')
            return res.redirect('/login');
        }
        const setPassword = promisify(user.setPassword, user);
        await setPassword(req.body.password);
        user.resetPasswordToken =  undefined;
        user.resetPasswordExpires = undefined;
        const updatedUser = await user.save();
        await req.login(updatedUser);
        req.flash('success', 'password changed successfully')
        res.redirect('/');

    }