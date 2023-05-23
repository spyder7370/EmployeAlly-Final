let express = require('express');
let router = express.Router();
let User = require('../models/user-DB');
const passport = require('passport');


router.get('/register', function(req, res){
    //register form
    res.render('register');
});

router.post('/register', async function(req, res){
    let user = new User({
        username: req.body.username
    });
    //hashing and salting and saving
    let registeredUser= await User.register(user, req.body.password);
    console.log(registeredUser);
    //saved user is now loged in
    req.login(registeredUser, (err)=>{
        if(err){
            console.log('error While registering user');
        }
        res.redirect('/jobs');
    });
});

router.get('/login', function(req, res){
    res.render('login');
});

router.post('/login', passport.authenticate('local',{
    failureRedirect: '/login'
}), 
function(req, res){
    res.redirect('/jobs');
});

router.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/jobs');
  });
});

module.exports=router;