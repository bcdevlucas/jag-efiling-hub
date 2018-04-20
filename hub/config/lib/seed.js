'use strict';

var _ = require('lodash'),
	config = require('../config'),
	mongoose = require('mongoose'),
	path = require('path'),
	chalk = require('chalk'),
	crypto = require('crypto');

// global seed options object
var seedOptions = {};

var isProduction  = process.env.NODE_ENV === 'production';
var isDevelopment = !isProduction;

function removeUser (user) {
	return new Promise(function (resolve, reject) {
		var User = mongoose.model('User');
		User.find({ username: user.username }).remove(function (err) {
			if (err) {
				reject(new Error('Failed to remove local ' + user.username));
			}
			resolve();
		});
	});
}

function saveUser (user) {
	return function() {
		return new Promise(function (resolve, reject) {
			// Then save the user
			user.save(function (err, theuser) {
				if (err) {
					console.log (err);
					reject(new Error('Failed to add local ' + user.username));
				} else {
					resolve(theuser);
				}
			});
		});
	};
}

function checkUserNotExists (user) {
	return new Promise(function (resolve, reject) {
		var User = mongoose.model('User');
		User.find({ username: user.username }, function (err, users) {
			if (err) {
				reject(new Error('Failed to find local account ' + user.username));
			}

			if (users.length === 0) {
				resolve();
			} else {
				// console.log('Database Seeding:\t\t\t' + 'local account already exists: ' + user.username);
				// resolve ();
				reject(new Error('Failed due to local account already exists: ' + user.username));
			}
		});
	});
}

function reportSuccess (password) {
	return function (user) {
		return new Promise(function (resolve, reject) {
			if (seedOptions.logResults) {
				console.log(chalk.bold.red('Database Seeding:\t\t\tLocal ' + user.username + ' added with password set to ' + password));
			}
			resolve();
		});
	};
}

// save the specified user with the password provided from the resolved promise
function seedTheUser (user) {
	return function (password) {
		return new Promise(function (resolve, reject) {

			var User = mongoose.model('User');
			// set the new password
			user.password = password;

			if (user.username === seedOptions.seedAdmin.username && process.env.NODE_ENV === 'production') {
				checkUserNotExists(user)
					.then(saveUser(user))
					.then(reportSuccess(password))
					.then(function () {
						resolve();
					})
					.catch(function (err) {
						reject(err);
					});
			} else {
				// removeUser(user)
				checkUserNotExists(user)
					.then(saveUser(user))
					.then(reportSuccess(password))
					.then(function () {
						resolve();
					})
					// .catch(function (err) {
					//   // resolve();
					//   reject(err);
					// });
					;
			}
		});
	};
}


// report the error
function reportError (reject) {
	return function (err) {
		if (seedOptions.logResults) {
			console.log();
			console.log('Database Seeding:\t\t\t' + err);
			console.log();
		}
		reject(err);
	};
}

module.exports.start = function start(options) {
	// Initialize the default seed options
	seedOptions = _.clone(config.seedDB.options, true);

	// Check for provided options

	if (_.has(options, 'logResults')) {
		seedOptions.logResults = options.logResults;
	}

	if (_.has(options, 'seedUser')) {
		seedOptions.seedUser = options.seedUser;
	}

	if (_.has(options, 'seedAdmin')) {
		seedOptions.seedAdmin = options.seedAdmin;
	}

	var User = mongoose.model('User');
	return new Promise(function (resolve, reject) {

		var adminAccount = new User(seedOptions.seedAdmin);
		var userAccount = new User(seedOptions.seedUser);
		Promise.resolve ()
		.then (function () {
			// If production only seed admin if it does not exist
			if (isProduction) {
				User.generateRandomPassphrase()
					.then(function (random) {
						var passed = process.env.ADMINPW;
						return passed || 'adminadmin';
					})
					.then(seedTheUser(adminAccount))
					.then(function () {
						resolve();
					})
					.catch(reportError(reject));
			} else {
				// Add both Admin and User account
				Promise.resolve ()
				//
				// admin account
				//
				.then (User.generateRandomPassphrase())
				.then(function (random) {
					var passed = process.env.ADMINPW;
					console.log (passed);
					return passed || 'adminadmin';
				})
				.then(seedTheUser(adminAccount))
				//
				// general user account
				//
				.then(function () { return 'useruser'; })
				.then(seedTheUser(userAccount))
				//
				// done
				//
				.then(function () {
					resolve();
				})
				.catch(reportError(reject));
			}

		})
		.catch (reportError(reject));
	});
};
