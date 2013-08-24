// Client
$(function() {

  var chat  = io.connect('http://'+location.host+'/chat');

  // サーバーの接続が成功したとき
  chat.on('connect', function() {
    chat.emit('msg update');
  });

  chat.on('user connected', function (msg) {
    var obj = $('#chat-alert').html('<small>'+msg+' さんが入室しました。</small>').css('display', 'none').fadeIn('slow');
    setTimeout(function () {
      obj.fadeOut('slow');
    } ,3000);
  });

  chat.on('user disconnected', function (msg) {
    var obj = $('#chat-alert').html('<small>'+msg+' さんが退室しました。</small>').css('display', 'none').fadeIn('slow');
    setTimeout(function () {
      obj.fadeOut('slow');
    } ,3000);
  });

  // btn ボタンがクリックされたとき
  $('#chat #submit').click(function() {
    var message = $('#chat #message').val();
    chat.emit('msg send', message);
    $('#chat #message').val('');
  });

/*
  // delete ボタンがクリックされたとき
  $('#chat #delete').click(function(){
    myRet = confirm("本当にチャット履歴をすべて削除してもよいですか？");
    if ( myRet == true ){
      chat.emit('deleteDB');
    }else{
    }
  });
*/

  // チャットサーバーから msg push されたとき
  chat.on('msg push', function (msg) {
    var date = msg.date;
    var message = msg.message;
    message = message.replace(/(http:\/\/[\x21-\x7e]+)/gi, "<a href='$1' target=\"_blank\">$1</a>");  
    message = message.replace(/(https:\/\/[\x21-\x7e]+)/gi, "<a href='$1' target=\"_blank\">$1</a>");  

    var _id = msg._id;
    //$('#chat #list').prepend($('<dt>' + date + '</dt><dd>' + msg + '</dd>').css("display", "none").fadeIn("slow"));

    var html = '<li class="span3 chat-list-border">'
            + '<div class=" chat-list-box">'
            + '<div class=" chat-list-text">' + message + '</div>'
            + '<div class=" chat-list-date"><small>'+ date +'</small></div>'
            + '<div id="'+_id+'" class=" chat-list-icon"><i class="icon-trash"></i></div>'
            + '</div>'
            + '</li>';

    $('#chat #list').prepend($(html).css("display", "none").fadeIn("slow"));
    $('.chat-list-icon').click(function(){
      var _id = $(this).attr("id");
      var json = {
        _id: _id
      };
      chat.emit('msg delete', json);
    });

  });

  // チャットサーバーから DB を受け取りすべてを表示
  chat.on('msg open', function(msg){
    // DB が空っぽだったら
    if(msg.length == 0){
        return;
    } else {
      $('#chat #list').empty();
      $.each(msg, function(key, value){

        var date = value.date;
        var message = value.message;
        message = message.replace(/(http:\/\/[\x21-\x7e]+)/gi, "<a href='$1' target=\"_blank\">$1</a>");  
        message = message.replace(/(https:\/\/[\x21-\x7e]+)/gi, "<a href='$1' target=\"_blank\">$1</a>");  

        var _id = value._id;
        //$('#chat #list').prepend($('<dt>' + date + '</dt><dd>' + msg + '</dd>').css("display", "none").fadeIn("slow"));

        var html = '<li class="span3 chat-list-border">'
            + '<div class=" chat-list-box">'
            + '<div class=" chat-list-text">' + message + '</div>'
            + '<div class=" chat-list-date"><small>'+ date +'</small></div>'
            + '<div id="'+_id+'" class=" chat-list-icon"><i class="icon-trash"></i></div>'
            + '</div>'
            + '</li>';

        //$('#chat #list').prepend($('<dt>' + value.date + '</dt><dd>' + value.message + '</dd>')).css("display", "none").fadeIn("slow");
        $('#chat #list').prepend($(html)).css("display", "none").fadeIn("slow");
      });   
    
      $('.chat-list-icon').click(function(){
        var _id = $(this).attr("id");
        var json = {
          _id: _id
        };
        chat.emit('msg delete', json);
      });
    }
  });

  // DB にあるメッセージを削除したので表示も消す
  chat.on('db drop', function(){
    $('#chat #list').empty();
  });

});

