// Client
$(function() {

  var chat  = io.connect('http://'+location.host+'/chat');

  // サーバーの接続が成功したとき
  chat.on('connect', function() {
    chat.emit('msg update');
  });

  chat.on('user connected', function (msg) {
    var obj;
    if(typeof msg.id === "undefined"){
      obj = $('#chat-alert').html('あなた が入室しました。</small>').css('display', 'none').fadeIn('slow');
    }
    else{
      obj = $('#chat-alert').html('<small>'+msg.id+' さんが入室しました。</small>').css('display', 'none').fadeIn('slow');
    }
    $('#chat-user-count').html('<small>現在の人数: '+msg.count+' 人</small>');

    setTimeout(function () {
      obj.fadeOut('slow');
    } ,3000);
  });

  chat.on('user disconnected', function (msg) {
    var obj = $('#chat-alert').html('<small>'+msg.id+' さんが退室しました。</small>').css('display', 'none').fadeIn('slow');
    $('#chat-user-count').html('<small>現在の人数: '+msg.count+' 人</small>');
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
    var date = new Date(msg.date).toLocaleString();
    var message = msg.message;
    message = message.replace(/(http:\/\/[\x21-\x7e]+)/gi, "<a href='$1'>$1</a>");  
    message = message.replace(/(https:\/\/[\x21-\x7e]+)/gi, "<a href='$1'>$1</a>");  

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
      var object = $('#chat #list');
      object.empty();

      var frag = document.createDocumentFragment();
      $.each(msg, function(key, value){

        var date = new Date(value.date).toLocaleString();
        var message = value.message;
        message = message.replace(/(http:\/\/[\x21-\x7e]+)/gi, "<a href='$1'>$1</a>");  
        message = message.replace(/(https:\/\/[\x21-\x7e]+)/gi, "<a href='$1'>$1</a>");  

        var _id = value._id;
        //$('#chat #list').prepend($('<dt>' + date + '</dt><dd>' + msg + '</dd>').css("display", "none").fadeIn("slow"));

        var newLi = '<li class="span3 chat-list-border">'
            + '<div class=" chat-list-box">'
            + '<div class=" chat-list-text">' + message + '</div>'
            + '<div class=" chat-list-date"><small>'+ date +'</small></div>'
            + '<div id="'+_id+'" class=" chat-list-icon"><i class="icon-trash"></i></div>'
            + '</div>'
            + '</li>';

        frag.appendChild($(newLi)[0]);
  
      });   
      object[0].appendChild(frag);
      object.css("display", "none").fadeIn("slow");
    
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

