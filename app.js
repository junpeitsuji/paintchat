/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var path = require('path');

var app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server)
  , sanitize = require('validator').sanitize;


var mongoose = require('mongoose');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
//app.get('/users', user.list);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// mongoose
{
  var Schema = mongoose.Schema;
  var ChatSchema = new Schema({
    message: String,
    date: Date
  });
  mongoose.model('Chat', ChatSchema);
}

{
  var Schema = mongoose.Schema;
  var PaintSchema = new Schema({
  	x: Number,
  	y: Number,
    date: Date
  });
  mongoose.model('Paint', PaintSchema);
}

mongoose.connect('mongodb://localhost/chat_app');

var Chat = mongoose.model('Chat');
var Paint = mongoose.model('Paint');



// socket
var chat = io
	.of('/chat')
	.on('connection', function (socket) {

	  // クライアントから msg update が届いたとき、DB内のメッセージを取得して送信
	  socket.on('msg update', function(){
	  	//接続したらDBのメッセージを表示
	  	Chat.find(function(err, docs){
	  	  socket.emit('msg open', docs);
	  	});
	  });

	  console.log('connected');

	  // クライアントからメッセージがあったとき、メッセージを追加して msg push を送信
	  socket.on('msg send', function (msg) {
        msg = sanitize(msg).entityEncode();

	  	socket.emit('msg push', msg);
	  	socket.broadcast.emit('msg push', msg);

	  	// DB に登録
	  	var item = new Chat();
	  	item.message = msg;
	  	item.date = new Date();
	  	item.save(function(err) {
	  	  if (err) { console.log(err); }
	  	});
	  });

	  // DB にあるメッセージを削除
	  socket.on('deleteDB', function(){
	  	socket.emit('db drop');
	  	socket.broadcast.emit('db drop');
	  	Chat.find().remove();
	  });

	  // クライアントから接続が切断されたとき
	  socket.on('disconnect', function() {
	  	console.log('disconnected');
	  });

	});

var paint = io
  .of('/paint')
  .on('connection', function (socket) {

	  // クライアントから msg update が届いたとき、DB内のメッセージを取得して送信
	  socket.on('msg update', function(){
	  	//接続したらDBのメッセージを表示
	  	Paint.find(function(err, docs){
	  	  socket.emit('msg open', docs);
	  	});
	  });

	  console.log('connected');

	  // クライアントからメッセージがあったとき、メッセージを追加して msg push を送信
	  socket.on('msg send', function (msg) {
	  	socket.emit('msg push', msg);
	  	socket.broadcast.emit('msg push', msg);

	  	// DB に登録
	  	var item = new Paint();
	  	item.x = parseInt(msg.x);
	  	item.y = parseInt(msg.y);
	  	item.date = new Date();


	  	item.save(function(err) {
	  	  if (err) { console.log(err); }
	  	});
	  });

	  // DB にあるメッセージを削除
	  socket.on('deleteDB', function(){
	  	socket.emit('db drop');
	  	socket.broadcast.emit('db drop');
	  	Paint.find().remove();
	  });

	  // クライアントから接続が切断されたとき
	  socket.on('disconnect', function() {
	  	console.log('disconnected');
	  });

  });

