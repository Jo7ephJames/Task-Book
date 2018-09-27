var express = require('express')
var router = express.Router();
var User = require('../models/user');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

router.get('/register', function(req, res) {
	res.render('register');
})

router.get('/login', function(req, res) {
	res.render('login');
})

router.get('/taskbook', ensureAuthenticated, function(req, res) {
	res.render('taskbook');
})

router.post('/taskbook', function(req, res, next) {
	var reqVal = req.body
	var stringEncoded
	for(prop in req.body) {
		stringEncoded = prop;
		console.log(stringEncoded);
	}
	

	if(stringEncoded === 'newTaskSheet') {
		console.log("PASSED!")
		res.send(req.user.taskpad)
	} else {
		//console.log(req.user)
		 User.saveEncodedTaskPad(req.user._id, {taskpad: stringEncoded}, function(err, user) {
		 	if(err) {
		 		throw err
		 	}
		 })
		 res.send('Task Pad Updated')
		 res.end();
	}
})

function ensureAuthenticated(req, res, next) {
	if(req.isAuthenticated()) {
		return next();
	} else {
		req.flash('error_msg', 'You are not logged in');
		res.redirect('/users/login');
	}
}

router.post('/register', function(req, res) {
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;
	
	//validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors) {
		res.render('register', {
			errors:errors
		})
	} else {
		console.log('PASSED')
		//create user in db
		var newUser = new User({
			username: username,
			password: password,
			email: email,
			name: name,
			taskpad: []
		})
		User.createUser(newUser, function(err, user) {
			if(err) {
				throw err;
				console.log(user);
			}
		});

		req.flash('success_msg', 'You are registered and can now log in');
		res.redirect('/users/login');

	}
});



passport.use(new LocalStrategy(
	function (username, password, done) {
		User.getUserByUsername(username, function (err, user) {
			if (err) {
				console.log(err)
				throw err;
			}
			if (!user) {
				return done(null, false, { message: 'Unknown User' });
			}
			User.comparePassword(password, user.password, function (err, isMatch) {
				if (err) throw err;
				if (isMatch) {
					return done(null, user);
				} else {
					return done(null, false, { message: 'Invalid password' });
				}
			});
		});
	}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
	passport.authenticate('local', { successRedirect: '/users/taskbook', failureRedirect: '/users/login', failureFlash: true }),
	function (req, res) {
		console.log(res.locals.user);
	});

router.get('/logout', function(req, res) {
	req.logout();
	req.flash('success_msg', 'You are logged out');
	res.redirect('/users/login');
})



module.exports = router;