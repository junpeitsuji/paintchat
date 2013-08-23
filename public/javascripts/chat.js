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
    msg = msg.replace(/(http:\/\/[\x21-\x7e]+)/gi, "<a href='$1' target=\"_blank\">$1</a>");  
    msg = msg.replace(/(https:\/\/[\x21-\x7e]+)/gi, "<a href='$1' target=\"_blank\">$1</a>");  
    $('#chat #list').prepend($('<dt>' + date + '</dt><dd>' + msg + '</dd>').css("display", "none").fadeIn("slow"));
  });

  // チャットサーバーから DB を受け取りすべてを表示
  chat.on('msg open', function(msg){
    // DB が空っぽだったら
    if(msg.length == 0){
        return;
    } else {
      $('#chat #list').empty();
      $.each(msg, function(key, value){
        value.message = value.message.replace(/(http:\/\/[\x21-\x7e]+)/gi, "<a href='$1' target=\"_blank\">$1</a>");  
        value.message = value.message.replace(/(https:\/\/[\x21-\x7e]+)/gi, "<a href='$1' target=\"_blank\">$1</a>");  

        $('#chat #list').prepend($('<dt>' + value.date + '</dt><dd>' + value.message + '</dd>')).css("display", "none").fadeIn("slow");
      });   
    }
  });

  // DB にあるメッセージを削除したので表示も消す
  chat.on('db drop', function(){
    $('#chat #list').empty();
  });

});

