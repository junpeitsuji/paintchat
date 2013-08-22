// ./apps/socketio.js

var app      = module.parent.exports
  , io       = app.get('io')
  , models   = app.get('models')
  , fs       = require('fs')
  , sanitize = require('validator').sanitize;

var Paint = models.Paint;
var Image = models.Image;


var paint = io
  .of('/paint')
  .on('connection', function (socket) {

	  // クライアントから msg update が届いたとき、DB内のメッセージを取得して送信
	  socket.on('msg update', function(){
	  	//接続したらDBのメッセージを表示
	  	Paint.find(function(err, docs){
	  	  socket.emit('msg open', docs);
	  	});
	  	Image.find(function(err, docs){
	  	  socket.emit('img open', docs);
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

	  // クライアントから送信された画像を保存
	  socket.on('img send', function (msg) {
	  	msg = new Buffer(msg.replace("data:image/png;base64,", ""), 'base64');

	  	// 今日の日付で Date オブジェクトを作成
        var now = new Date();

        // 「年」「月」「日」「曜日」を Date オブジェクトから取り出してそれぞれに代入
        var Y = now.getFullYear();
        var M = now.getMonth() + 1 + Y * 100;
        var D = now.getDate() + M * 100;
        var h = now.getHours() + D * 100;
        var m = now.getMinutes() + h * 100;
        var s = now.getSeconds() + m * 100;

        var filename = 'images/'+ String(s) + '.png';

        fs.writeFile('./public/'+filename, msg, function (err) {
          if (err) throw err;
          //console.log('It\'s saved!');


	  	  // DB に登録
	  	  var item = new Image();
	  	  item.src = filename;
	  	  item.date = new Date();
	  	  item.save(function(err) {
	  	    if (err) { console.log(err); }
   	  	  });

     	  socket.emit('img push', filename);
     	  socket.broadcast.emit('img push', filename);
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

