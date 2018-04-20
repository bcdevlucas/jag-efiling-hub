'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  _ = require('lodash'),
  User = mongoose.model('User'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  userController = require(path.resolve('./modules/users/server/controllers/users.server.controller.js')),
  Notifications = require(path.resolve('./modules/notifications/server/controllers/notifications.server.controller'));


/**
 * Show the current user
 */
exports.read = function (req, res) {
  res.json(req.model);
};

/**
 * Update a User
 */
exports.update = function (req, res) {
  var user = req.model;
  var prevState = _.cloneDeep(req.model);
  // CC:USERFIELDS
  // For security purposes only merge these parameters
  user.orgsAdmin                = req.user.orgsAdmin;
  user.orgsMember                = req.user.orgsMember;
  user.orgsPending                = req.user.orgsPending;
  user.phone                = req.user.phone;
  user.address              = req.user.address;
  user.businessContactName  = req.user.businessContactName;
  user.businessContactEmail = req.user.businessContactEmail;
  user.businessContactPhone = req.user.businessContactPhone;
  user.firstName            = req.body.firstName;
  user.lastName             = req.body.lastName;
  user.displayName          = user.firstName + ' ' + user.lastName;
  user.roles                = req.body.roles;
  user.government           = req.body.government;
  user.userTitle            = req.body.userTitle;
  user.notifyOpportunities  = req.body.notifyOpportunities;
  user.notifyEvents         = req.body.notifyEvents;
  user.notifyBlogs          = req.body.notifyBlogs;
  user.isDisplayEmail       = req.body.isDisplayEmail;
  user.isDeveloper          = req.body.isDeveloper;
  user.paymentMethod        = req.body.paymentMethod;
  user.businessName         = req.body.businessName;
  user.businessAddress      = req.body.businessAddress;
  user.businessAddress2     = req.body.businessAddress2;
  user.businessCity         = req.body.businessCity;
  user.businessProvince     = req.body.businessProvince;
  user.businessCode         = req.body.businessCode;
  user.location       = req.body.location;
  user.description    = req.body.description;
  user.website        = req.body.website;
  user.skills         = req.body.skills;
  user.skillsData     = req.body.skillsData;
  user.badges         = req.body.badges;
  user.capabilities   = req.body.capabilities;
  user.endorsements   = req.body.endorsements;
  user.github         = req.body.github;
  user.stackOverflow  = req.body.stackOverflow;
  user.stackExchange  = req.body.stackExchange;
  user.linkedIn       = req.body.linkedIn;
  user.isPublicProfile = req.user.isPublicProfile;
  user.isAutoAdd = req.user.isAutoAdd;
      user.capabilityDetails = req.body.capabilityDetails;
      user.capabilitySkills = req.body.capabilitySkills;





  userController.subscriptionHandler(user,prevState)
  .then(function() {
    user.save(function (err) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      }

      res.json(user);
    });
  });
};

/**
 * Delete a user
 */
exports.delete = function (req, res) {
  var user = req.model;

  user.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

      Notifications.unsubscribeUserNotification ('not-add-opportunity', user)
      .then(function() {
        res.json();
      });
  });
};

/**
 * List of Users
 */
exports.list = function (req, res) {
  User.find({}, '-salt -password -providerData').sort('-created').populate('user', 'displayName').exec(function (err, users) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(users);
  });
};

/**
 * User middleware
 */
exports.userByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'User is invalid'
    });
  }

  User.findById(id, '-salt -password -providerData')
  .populate ('capabilities', 'code name')
  .populate ('capabilitySkills', 'code name')
  .exec(function (err, user) {
    if (err) {
      return next(err);
    } else if (!user) {
      return next(new Error('Failed to load user ' + id));
    }
    req.model = user;
    next();
  });
};
/**
 * approve Gov. Request
 */
exports.approve = function (req, res, next) {
  User.findOne({
    _id: req.body.user._id
  })
  .populate ('capabilities', 'code name')
  .populate ('capabilitySkills', 'code name')
  .exec(function (err, user) {
    if (err) {
      return next(err);
    } else if (!user) {
      return next(new Error('Failed to load User ' + req.body.user._id));
    }
    if (req.body.flag === 1)
        user.roles=['gov','user'];
    else
      {
        user.roles=['user'];
      }

      user.save(function (err) {
                  if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            res.send({
              message: 'done'
            });
          }
        });

    next();
  });
};
// -------------------------------------------------------------------------
//
// lists of emails and names for notifications
//
// -------------------------------------------------------------------------
exports.notifyOpportunities = function (req, res) {
    User.find ({notifyOpportunities:true}).select ('firstName lastName email')
    .exec (function (err, users) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      else return res.json (users);
    });
};
exports.notifyMeetings = function (req, res) {
    User.find ({notifyEvents:true}).select ('firstName lastName email')
    .exec (function (err, users) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      else return res.json (users);
    });
};
