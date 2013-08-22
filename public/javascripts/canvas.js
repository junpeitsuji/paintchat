$(function() {

  var paint = io.connect('http://'+location.host+'/paint');

  var canvas_x = $("#myCanvas").offset().left; //canvasのX座標
  var canvas_y = $("#myCanvas").offset().top;  //canvasのY座標
  
  var mouseDown = false;
  var penWidth = 10;
  var ctx;


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
      document.getElementById("canvasCopy").innerHTML = "<a href=\""+img_src+"\">download link</a>";
      //document.getElementById("image_png").src = img_png_src;
      //document.getElementById("data_url_png").firstChild.nodeValue = img_png_src;
    } catch(e) {
      //document.getElementById("image_png").alt = "未対応";
    }
  });

  // delete ボタンがクリックされたとき
  $('#canvas #delete').click(function(){
     myRet = confirm("本当にキャンバスを削除してもよいですか？");
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

