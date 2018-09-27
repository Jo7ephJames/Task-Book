
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy
var mongoose = require('mongoose');

//Connect to database
mongoose.connect('mongodb://taskbook:tasktree1@ds117423.mlab.com:17423/heroku_qd4ng69t', { useNewUrlParser: true });


mongoose.connection.once('open', function() {
	console.log('Access to TaskBook Database Established');
}).on('error', function(error) {
	console.log(error);
})

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

//View Engine
app.set('views', path.join(__dirname, 'views/layouts'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');

//configure middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ type: 'application/*+json' }))
app.use(cookieParser());

//set static public folder
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
	secret: 'Astaroth',
	saveUninitialized: true,
	resave: true
}));

//initial passport
app.use(passport.initialize());
app.use(passport.session());

//configure validation
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));


app.use(flash());
app.use(function (req,res, next) {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error =  req.flash('error');
  res.locals.user = req.user || null;
	next();
})

app.use('/', routes);
app.use('/users', users);

//start sever
app.set('port', 7444);
app.listen(app.get('port'), function() {
	console.log('Server started on port ' +app.get('port'));
})
