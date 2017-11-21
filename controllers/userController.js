const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
const crypto =require('crypto');
mongoose.Promise = global.Promise;

exports.loginForm = (req, res) => {
    res.render('loginForm', {name: 'Log in'});
}

exports.registerForm = (req, res) => {
    res.render('registerForm');
}

exports.validateRegister = (req, res, next) => {
    req.sanitizeBody('name');
    req.checkBody('name', 'you must supply a name').notEmpty();
    req.checkBody('email', 'you must specify a valid email').isEmail();
    req.checkBody('password', 'you must enter a password').notEmpty();
    req.checkBody('password-confirm', 'you must enter a password').notEmpty();
    req.checkBody('password-confirm', 'you must enter a password').equals(req.body.password);

    const errors = req.validationErrors();
    if(errors) {
        req.flash('error', errors.map(err => err.msg));
        res.render('registerForm', {title: 'Register', body: req.body, flashes:req.flash()});
        return;
    }
    next();
};

exports.register = async (req, res, next) => {
    console.log(req.body);
    const find = await User.find({ email:req.body.email });
    console.log(find);
    if(find.length != 0) {
        return res.status(400).send({message: 'email id alrady exists'})
    }
    const user = new User({email: req.body.email, name: req.body.username}); 
    const register = promisify(User.register,User);
    await register(user, req.body.password);
    next();
};

exports.accounts = (req, res) => {
    console.log(req);
    res.render('accounts',{name: 'Edit User'});
}

exports.updateUser = async (req, res) => {
    const update = {
        name: req.body.name,
        email: req.body.email
    };
    const user = await User.findOneAndUpdate(
        {_id: req.user._id},
        { $set: update },
        { new: true, runValidators: true, context: 'query'}
    );
    req.flash('success', 'successfully updated the profile');
    res.redirect('back');
};

exports.passwordReset = (req, res) => {
    res.render('forgot');
};
