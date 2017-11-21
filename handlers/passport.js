const passport = require('passport');
const moongoose = require('mongoose');
const User = moongoose.model('User');
const JwtStrategy = require('passport-jwt').Strategy;;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// passport.use(new LocalStrategy(
//   function(email, password, done) {
//     User.findOne({ email: email }, function (err, user) {
//         console.log(email);
//       if (err) { return done(err); }
//       if (!user) {
//         return done(null, false, { message: 'Incorrect username.' });
//       }
//       if (!user.validPassword(password)) {
//         return done(null, false, { message: 'Incorrect password.' });
//       }
//       return done(null, user);
//     });
//   }
// ));

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: process.env.SECRET
}

const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done){
    //see if user exists in db and pass to done callback
    User.findById(payload.sub, function(err, user){
        if(err) {return done(err, false)}
        
        if(user){
            done(null, user)
        } else {
            done(null,false)
        }
    })
})

passport.use(jwtLogin);