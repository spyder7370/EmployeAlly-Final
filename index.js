let express = require('express');
let mongoose = require('mongoose');
let methodOverride = require('method-override');
let app = express();
let path = require('path');
let session= require('express-session');
let passport = require('passport');
let localStrategy = require('passport-local');

mongoose.connect('mongodb+srv://abhishekrajawat1909:Abhi8851@cluster0.fwmwxc5.mongodb.net/?retryWrites=true&w=majority')
.then(function(){
    console.log('db working');
})
.catch(function(err){
    console.log(err);
});

app.use(session({
    secret: 'SuperSecretPasswordForEmployeAlly',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure:true,
        expires: Date.now()+ 1000*60*60*24,
        maxAge: 1000*60*60*24
    }
}));

let User= require('./models/user-DB');
//passport setup
app.use(passport.initialize());
app.use(passport.session());



passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new localStrategy(User.authenticate()));


app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public'));
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});

let jobRoutes = require('./routes/jobs.js');
let notifRoutes = require('./routes/notifications');
let authRoutes = require('./routes/auth');
app.use(jobRoutes);
app.use(notifRoutes);
app.use(authRoutes);

app.listen(process.env.port, function(){
    console.log('server started on port 3000');
});
