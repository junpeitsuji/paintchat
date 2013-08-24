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
	  console.log(socket.id);
	  socket.broadcast.emit('user connected', socket.id);

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


	  	// DB に登録
	  	var item = new Chat();
	  	item.message = msg;
	  	item.date = new Date();
	  	item.save(function(err) {
	  	  if (err) { console.log(err); }

	  	  //item._id = instance._id; 

	  	  socket.emit('msg push', item);
	  	  socket.broadcast.emit('msg push', item);
	  	});
	  });

	  // DB にあるメッセージを削除
	  socket.on('deleteDB', function(){
	  	socket.emit('db drop');
	  	socket.broadcast.emit('db drop');
	  	Chat.find().remove();
	  });

	  	  // DB にある画像を1つ削除
	  socket.on('msg delete', function (msg) {
	  	//socket.emit('db drop');
	  	//socket.broadcast.emit('db drop');
	  	//Paint.find().remove();
	  	console.log(msg);

	  	Chat.remove({ _id: msg._id }, function(err) {

		  // ...
		  Chat.find(function(err, docs){
	  	  	socket.emit('msg open', docs);
	  	  	socket.broadcast.emit('msg open', docs);
		  });
		});
	  });

	  // クライアントから接続が切断されたとき
	  socket.on('disconnect', function() {
	  	socket.broadcast.emit('user disconnected', socket.id);
	  	console.log('disconnected');
	  });

	});

