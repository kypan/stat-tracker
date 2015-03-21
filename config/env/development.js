'use strict';

'use strict';

var path = require('path');
var rootPath = path.normalize(__dirname + '/../..');

module.exports = {
	root: rootPath,
	port: process.env.PORT || 3333,
    db: 'mongodb://localhost/stat-tracker',
    appURL: 'http://localhost:3333/',
    app: {
        name: 'Stat Tracker'
    }
};
