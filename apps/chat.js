// ./apps/socketio.js

var app      = module.parent.exports
  , io       = app.get('io')
  , models   = app.get('models')
  , sanitize = require('validator').sanitize;


var Chat = models.Chat;


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

