'use strict';


var path = require('path');
module.exports = {
	app: {
		title: 'HUB',
		description: 'Connect',
		keywords: 'developer, government, codewithus, agile, digitial service',
		domain: process.env.DOMAIN || 'http://localhost:3030'
	},
	feature_hide: process.env.FEATURE_HIDE || false,
	features: process.env.FEATURES || 'none',
	port: process.env.PORT || 3000,
	host: process.env.HOST || '0.0.0.0',
	// DOMAIN config should be set to the fully qualified application accessible
	// URL. For example: https://www.myapp.com (including port if required).
	// Session Cookie settings
	sessionCookie: {
		// session expiration is set by default to 24 hours
		maxAge: 24 * (60 * 60 * 1000),
		// httpOnly flag makes sure the cookie is only accessed
		// through the HTTP protocol and not JS/browser
		httpOnly: true,
		// secure cookie should be turned to true to provide additional
		// layer of security so that the cookie is set only when working
		// in HTTPS mode.
		secure: false
	},
	home: process.env.PWD || '/opt/mean.js',
	// sessionSecret should be changed for security measures and concerns
	sessionSecret: process.env.SESSION_SECRET || 'MEAN',
	// sessionKey is the cookie session name
	sessionKey: 'sessionId',
	sessionCollection: 'sessions',
	// Lusca config
	csrf: {
		csrf: false,
		csp: false,
		xframe: 'SAMEORIGIN',
		p3p: 'ABCDEF',
		xssProtection: true
	},
	logo: 'modules/core/client/img/brand/logo.png',
	favicon: 'modules/core/client/img/brand/favicon.ico',
	uploads: {
		diskStorage: {
			destination: function (req, file, cb) {
				cb (null, path.resolve('public/uploads/'))
			},
			filename: function (req, file, cb) {
				var datetimestamp = Date.now();
				// console.log ('file.originalname', file.originalname);
				cb (null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
			}
		},
		profileUpload: {
			dest: 'public/uploads/', // Profile upload destination path
			display: 'uploads/',
			// dest: 'modules/users/client/img/profile/uploads/', // Profile upload destination path
			limits: {
				fileSize: 1 * 1024 * 1024 // Max file size in bytes (1 MB)
			}
		},
		fileUpload: {
			dest: path.resolve('public/uploads/'), // File upload destination path
			display: 'uploads/',
			limits: {
				fileSize: 3 * 1024 * 1024 // Max file size in bytes (3 MB)
			}
		}
	},
	shared: {
		owasp: {
			allowPassphrases: true,
			maxLength: 128,
			minLength: 10,
			minPhraseLength: 20,
			minOptionalTestsToPass: 4
		}
	}

};
