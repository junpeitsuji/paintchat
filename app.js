/**
 * app.js
 */

var express = require('express');
var path    = require('path');
var routes  = require('./routes');
var models  = require('./models');
var page_limit = 24;

var app = module.exports = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);


// all environments
app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));

  app.set('models', models);
  app.set('io', io);
  app.set('page_limit', page_limit);
});

// development only
app.configure('development', function() {
  app.use(express.errorHandler());
});

// routing
app.get('/', routes.index);
//app.get('/users', user.list);

// listening port
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// loading socket.io application modules
require('./apps/chat');
require('./apps/paint');
