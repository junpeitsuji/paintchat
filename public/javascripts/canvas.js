$(function() {

  $("#message").focus().keypress( function ( e ) {
    if ( e.which == 13 ) {
      $("#chat #submit").click();
      return false;
    }
  });

  var paint = io.connect('http://'+location.host+'/paint');
  
  var mouseDown = false;
  var penWidth = 10;
  var ctx;

  clear();

  // サーバーの接続が成功したとき
  paint.on('connect', function() {
    paint.emit('msg update');
  });

  // paint サーバーから DB を受け取りすべてを表示
  paint.on('msg open', function(msg){
    // DB が空っぽだったら
    if(msg.length == 0){
        return ;
    } else {
      clear();
      $.each(msg, function(key, value){
        draw(value.x, value.y);
      });   
    }
  });

  // チャットサーバーから DB を受け取りすべてを表示
  paint.on('img open', function(msg){
    // DB が空っぽだったら
    if(msg.length == 0){
        return;
    } else {
      $('#image #list').empty();
      $.each(msg, function(key, value){
        $('#image #list').prepend($("<li class=\"image-box span3\"><a class=\"thumbnail\" href=\""+value.src+"\"><img src=\""+value.src+"\" class=\"image-thumbnail\" /></a></li>").css("display", "none").fadeIn("slow"));
      });   
    }
  });

  // paint サーバーから msg push されたとき
  paint.on('msg push', function (msg) {
    draw(msg.x, msg.y);
  });

  
  function clear(){
    var canvas = document.getElementById('myCanvas');
    if (!ctx) {
      ctx = canvas.getContext('2d');
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.fillStyle = "#eeeeee";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

  }

  function draw(penX, penY){
    if (!ctx) {
      var canvas = document.getElementById('myCanvas');
      ctx = canvas.getContext('2d');
    }

    ctx.beginPath();
    ctx.fillStyle = "#0099ff";
    ctx.globalAlpha = 0.5;
    ctx.arc(penX, penY, penWidth, 0, Math.PI*2, false);
    ctx.fill();
  }  

  $("#myCanvas").bind("mousemove", function(event){
    // マウスボタンを押している場合は描画する
    if (mouseDown){

      var canvas_x = $("#myCanvas").offset().left; //canvasのX座標
      var canvas_y = $("#myCanvas").offset().top;  //canvasのY座標
    
      // マウス座標とCanvasの座標を適当に調整
      var penX = event.pageX - canvas_x;
      var penY = event.pageY - canvas_y;
      //draw(penX, penY);

      var json = {
        x: penX,
        y: penY
      };
      paint.emit('msg send', json);

    }

  });

  
  $("#myCanvas").bind("mousedown", function(event){
      var canvas_x = $("#myCanvas").offset().left; //canvasのX座標
      var canvas_y = $("#myCanvas").offset().top;  //canvasのY座標

      // マウス座標とCanvasの座標を適当に調整
      var penX = event.pageX - canvas_x;
      var penY = event.pageY - canvas_y;
      //draw(penX, penY);

      var json = {
        x: penX,
        y: penY
      };
      paint.emit('msg send', json);

    mouseDown = true;

  });

  $("#myCanvas").bind("mouseup", function(event){
    mouseDown = false;    

  });



  $("#myCanvas").bind("touchmove", function(event){
    event.preventDefault();
    // マウスボタンを押している場合は描画する
    if (mouseDown){
      var canvas_x = $("#myCanvas").offset().left; //canvasのX座標
      var canvas_y = $("#myCanvas").offset().top;  //canvasのY座標

      // マウス座標とCanvasの座標を適当に調整
      var penX = event.originalEvent.touches[0].pageX - canvas_x;
      var penY = event.originalEvent.touches[0].pageY - canvas_y;
      //draw(penX, penY);

      var json = {
        x: penX,
        y: penY
      };
      paint.emit('msg send', json);

    }

  });

  
  $("#myCanvas").bind("touchstart", function(event){
    event.preventDefault();

    var canvas_x = $("#myCanvas").offset().left; //canvasのX座標
    var canvas_y = $("#myCanvas").offset().top;  //canvasのY座標

    // マウス座標とCanvasの座標を適当に調整
    var penX = event.originalEvent.touches[0].pageX - canvas_x;
    var penY = event.originalEvent.touches[0].pageY - canvas_y;
    
    var json = {
      x: penX,
      y: penY
    };
    paint.emit('msg send', json);

    mouseDown = true;
  });

  $("#myCanvas").bind("touchend", function(event){
    mouseDown = false;    

  });

 // save ボタンがクリックされたとき
  $('#canvas #save').click(function(){
    var canvas = document.getElementById('myCanvas');
    try {
      var img_src = canvas.toDataURL();

      paint.emit('img send', img_src);
    } catch(e) {
    }
  });


  // paint サーバーから img push されたとき
  paint.on('img push', function (msg) {
    //document.getElementById("canvasCopy").pre = "<a href=\""+msg+"\">download link</a>";
    var date = new Date();
    $('#image #list').prepend($("<li class=\"image-box span3\"><a class=\"thumbnail\" href=\""+msg+"\"><img src=\""+msg+"\" class=\"image-thumbnail\" /></a></li>").css("display", "none").fadeIn("slow"));
  });

  // delete ボタンがクリックされたとき
  $('#canvas #delete').click(function(){
     myRet = confirm("本当にキャンバスをクリアしてもよいですか？");
     if ( myRet == true ){
       paint.emit('deleteDB');
     }else{
     }
  });

  // DB にあるメッセージを削除したので表示も消す
  paint.on('db drop', function(){
    clear();
  });

});

