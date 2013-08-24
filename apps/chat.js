// ./apps/socketio.js

var app      = module.parent.exports
  , io       = app.get('io')
  , models   = app.get('models')
  , sanitize = require('validator').sanitize
  , page_limit = app.get('page_limit');


var Chat = models.Chat;

var user_count = 0;

// socket
var chat = io
	.of('/chat')
	.on('connection', function (socket) {
	  
	  console.log(socket.id);
	  user_count++;

	  var msg = 
	  socket.emit('user connected', {
	  	count: user_count
	  });
	  socket.broadcast.emit('user connected', {
	  	id: socket.id, 
	  	count: user_count
	  });

	  // クライアントから msg update が届いたとき、DB内のメッセージを取得して送信
	  socket.on('msg update', function(){
	  	//接続したらDBのメッセージを表示
	  	var query = Chat.find();
	  	query.sort( { date : -1 } );
	  	query.limit(page_limit);
	  	query.exec(function(err, docs){
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

	  	  var query = Chat.find();
	  	  query.sort( { date : -1 } );
	  	  query.limit(page_limit);
		  // ...
		  query.exec(function(err, docs){
	  	  	socket.emit('msg open', docs);
	  	  	socket.broadcast.emit('msg open', docs);
		  });
		});
	  });

	  // クライアントから接続が切断されたとき
	  socket.on('disconnect', function() {
	  	user_count--;

	    socket.broadcast.emit('user disconnected', {
	  	  id: socket.id, 
	  	  count: user_count
	    });

	  	console.log('disconnected');
	  });

	});

