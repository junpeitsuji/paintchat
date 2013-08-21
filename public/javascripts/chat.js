// Client
$(function() {

  var chat  = io.connect('http://'+location.host+'/chat');

  // サーバーの接続が成功したとき
  chat.on('connect', function() {
    chat.emit('msg update');
  });

  // btn ボタンがクリックされたとき
  $('#chat #submit').click(function() {
    var message = $('#chat #message').val();
    chat.emit('msg send', message);
    $('#chat #message').val('');
  });

  // delete ボタンがクリックされたとき
  $('#chat #delete').click(function(){
    myRet = confirm("本当にチャット履歴をすべて削除してもよいですか？");
    if ( myRet == true ){
      chat.emit('deleteDB');
    }else{
    }
  });

  // チャットサーバーから msg push されたとき
  chat.on('msg push', function (msg) {
    var date = new Date();
    $('#chat #list').prepend($('<dt>' + date + '</dt><dd>' + msg + '</dd>'));
  });

  // チャットサーバーから DB を受け取りすべてを表示
  chat.on('msg open', function(msg){
    // DB が空っぽだったら
    if(msg.length == 0){
        return;
    } else {
      $('#chat #list').empty();
      $.each(msg, function(key, value){
        $('#chat #list').prepend($('<dt>' + value.date + '</dt><dd>' + value.message + '</dd>'));
      });   
    }
  });

  // DB にあるメッセージを削除したので表示も消す
  chat.on('db drop', function(){
    $('#chat #list').empty();
  });

});

